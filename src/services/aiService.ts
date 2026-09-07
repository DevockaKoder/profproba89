import { ApiSettings, ChatMessage } from '../types';

function isLikelyGigaChatKey(key: string): boolean {
  const clean = key.trim();
  if (clean.startsWith('Basic ') || clean.startsWith('eyJ')) return true;
  if (clean.length > 50 && clean.endsWith('=')) {
    try {
      const decoded = atob(clean);
      if (decoded.includes(':') && decoded.includes('-')) return true;
    } catch {
      // not base64
    }
  }
  return false;
}

async function safeExtractError(response: Response, defaultMessage = 'Ошибка запроса'): Promise<string> {
  try {
    const rawText = await response.text();
    if (!rawText || !rawText.trim()) {
      return `${defaultMessage} (${response.status}: ${response.statusText || 'Без описания'})`;
    }
    // Handle HTML pages returned by static web servers like GitHub Pages Nginx
    if (rawText.includes('<html') || rawText.includes('405 Not Allowed') || rawText.startsWith('<!DOCTYPE')) {
      if (response.status === 405 || response.status === 404) {
        return `Статический хостинг (GitHub Pages) не имеет серверного бэкенда для обработки POST-запросов (код ${response.status}).`;
      }
      return `${defaultMessage} (${response.status} ${response.statusText || ''})`;
    }
    try {
      const json = JSON.parse(rawText);
      return (
        json.error?.message ||
        json.error ||
        json.message ||
        json.error_description ||
        rawText
      );
    } catch {
      return rawText.slice(0, 300);
    }
  } catch {
    return `${defaultMessage} (${response.status})`;
  }
}

export async function sendChatMessage(
  settings: ApiSettings,
  systemPrompt: string,
  messages: ChatMessage[]
): Promise<string> {
  const activeKey = settings.apiKey.trim();
  if (!activeKey) {
    throw new Error(
      'API-ключ не указан. Нажмите на кнопку «🔑 Ключ API» в правом верхнем углу и введите ключ, либо вставьте его в коде в константу DEFAULT_API_KEY.'
    );
  }

  // Auto-detect GigaChat key or explicit provider selection
  if (settings.provider === 'gigachat' || isLikelyGigaChatKey(activeKey)) {
    return fetchGigaChat(settings, systemPrompt, messages);
  }

  return fetchOpenAICompatible(settings, systemPrompt, messages);
}

async function fetchOpenAICompatible(
  settings: ApiSettings,
  systemPrompt: string,
  messages: ChatMessage[]
): Promise<string> {
  const url = settings.baseUrl.trim().replace(/\/+$/, '') + '/chat/completions';

  const payloadMessages = [
    { role: 'system', content: systemPrompt },
    ...messages.map((m) => ({
      role: m.role,
      content: m.content,
    })),
  ];

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${settings.apiKey.trim()}`,
  };

  // OpenRouter custom header recommendations
  if (url.includes('openrouter.ai')) {
    headers['HTTP-Referer'] = window.location.origin;
    headers['X-Title'] = 'Prompt Engineer Simulator';
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: settings.model.trim() || 'gpt-4o-mini',
        messages: payloadMessages,
        temperature: 0.7,
        max_tokens: 800,
      }),
    });

    if (!response.ok) {
      const errText = await safeExtractError(response, 'Ошибка API');
      throw new Error(`Ошибка API (${response.status}): ${errText}`);
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content;
    if (!reply) {
      throw new Error('Пустой ответ от нейросети в choices[0].message.content');
    }
    return reply;
  } catch (error: any) {
    if (error.message && error.message.includes('Failed to fetch')) {
      throw new Error(
        'Сетевая ошибка CORS или недоступность сервера: проверьте подключение к интернету, Base URL и валидность API-ключа.'
      );
    }
    throw error;
  }
}

async function fetchGigaChat(
  settings: ApiSettings,
  systemPrompt: string,
  messages: ChatMessage[]
): Promise<string> {
  const cleanKey = settings.apiKey.trim();

  // Try the server-side GigaChat OAuth proxy first (handles Sber TLS certificates and CORS)
  try {
    const proxyResponse = await fetch('/api/gigachat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        apiKey: cleanKey,
        systemPrompt,
        messages,
        model: settings.model.trim() || 'GigaChat',
        scope: 'GIGACHAT_API_PERS',
      }),
    });

    if (proxyResponse.ok) {
      const data = await proxyResponse.json();
      if (data.reply) return data.reply;
    } else if (proxyResponse.status === 404 || proxyResponse.status === 405) {
      // Static hosting detected (GitHub Pages returns 405 for POST /api/* or 404 for missing route)
      // Continue to client-side fallback below
    } else {
      const errText = await safeExtractError(proxyResponse, 'Ошибка сервера');
      throw new Error(errText || `Ошибка сервера (${proxyResponse.status})`);
    }
  } catch (proxyError: any) {
    // If it was a real GigaChat error from our server (not 404 / 405 / connection error), throw it directly
    if (
      proxyError.message &&
      !proxyError.message.includes('404') &&
      !proxyError.message.includes('405') &&
      !proxyError.message.includes('Failed to fetch')
    ) {
      throw proxyError;
    }
  }

  // Fallback: Direct client-side OAuth handshake (for static hosting / GitHub Pages)
  return fetchGigaChatClientSide(settings, systemPrompt, messages);
}

// Client-side cache for access token
let clientCachedToken: { token: string; expiresAt: number } | null = null;

async function fetchGigaChatClientSide(
  settings: ApiSettings,
  systemPrompt: string,
  messages: ChatMessage[]
): Promise<string> {
  const cleanKey = settings.apiKey.trim();
  let accessToken = cleanKey;

  // If user provided a Client Secret (not a raw eyJ... token), perform OAuth exchange
  if (!cleanKey.startsWith('eyJ')) {
    const now = Date.now();
    if (clientCachedToken && clientCachedToken.expiresAt > now + 60000) {
      accessToken = clientCachedToken.token;
    } else {
      const authHeader = cleanKey.startsWith('Basic ') ? cleanKey : `Basic ${cleanKey}`;
      const rquid = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `rquid-${Date.now()}`;

      try {
        const oauthResponse = await fetch('https://ngw.devices.sberbank.ru:9443/api/v2/oauth', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Accept: 'application/json',
            RqUID: rquid,
            Authorization: authHeader,
          },
          body: 'scope=GIGACHAT_API_PERS',
        });

        if (!oauthResponse.ok) {
          const errText = await safeExtractError(oauthResponse, 'Ошибка авторизации GigaChat OAuth');
          throw new Error(`Ошибка авторизации GigaChat OAuth (${oauthResponse.status}): ${errText}`);
        }

        const oauthData = await oauthResponse.json();
        if (!oauthData.access_token) {
          throw new Error('GigaChat не вернул access_token при OAuth-авторизации');
        }

        accessToken = oauthData.access_token;
        clientCachedToken = {
          token: accessToken,
          expiresAt: oauthData.expires_at || Date.now() + 28 * 60 * 1000,
        };
      } catch (oauthErr: any) {
        if (
          oauthErr.name === 'TypeError' ||
          (oauthErr.message && (oauthErr.message.includes('fetch') || oauthErr.message.includes('NetworkError')))
        ) {
          // On static hosting like GitHub Pages, Sberbank's servers block browser cross-origin requests.
          // Gracefully fallback to the built-in scenario simulation engine so the classroom experience continues seamlessly!
          const simulated = generateSimulatedResponse(systemPrompt, messages);
          return (
            simulated +
            '\n\n*(ℹ️ Режим симулятора: статический хостинг GitHub Pages блокирует прямые запросы к GigaChat из-за CORS и сертификатов Сбера. Чтобы подключить реальную модель на GitHub Pages, выберите OpenRouter во вкладке «Ключ API»)*'
          );
        }
        throw oauthErr;
      }
    }
  }

  // 2. Chat completions request
  const url = settings.baseUrl.trim() || 'https://gigachat.devices.sberbank.ru/api/v1/chat/completions';
  const payloadMessages = [
    { role: 'system', content: systemPrompt },
    ...messages.map((m) => ({
      role: m.role,
      content: m.content,
    })),
  ];

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
      },
      body: JSON.stringify({
        model: settings.model.trim() || 'GigaChat',
        messages: payloadMessages,
        temperature: 0.7,
        max_tokens: 800,
      }),
    });

    if (!response.ok) {
      const errText = await safeExtractError(response, 'Ошибка GigaChat API');
      throw new Error(`Ошибка GigaChat API (${response.status}): ${errText}`);
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content;
    if (!reply) {
      throw new Error('Ответ не содержит текста сообщения от GigaChat');
    }
    return reply;
  } catch (error: any) {
    if (
      error.name === 'TypeError' ||
      (error.message && (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')))
    ) {
      const simulated = generateSimulatedResponse(systemPrompt, messages);
      return (
        simulated +
        '\n\n*(ℹ️ Режим симулятора: статический хостинг GitHub Pages блокирует прямые запросы к GigaChat из-за CORS и сертификатов Сбера. Чтобы подключить реальную модель на GitHub Pages, выберите OpenRouter во вкладке «Ключ API»)*'
      );
    }
    throw error;
  }
}

/**
 * Intelligent simulation engine for classroom testing without needing external API credits
 */
export function generateSimulatedResponse(
  systemPrompt: string,
  messages: ChatMessage[]
): string {
  const lastUserMsg = messages[messages.length - 1]?.content.toLowerCase() || '';
  const promptLower = systemPrompt.toLowerCase();

  // Detect persona from system prompt
  const isAlchemist = promptLower.includes('элдон') || promptLower.includes('алхимик') || promptLower.includes('зель');
  const isConsultant = promptLower.includes('консультант') || promptLower.includes('иннотех') || promptLower.includes('вуз') || promptLower.includes('алиса');
  const isGuide = promptLower.includes('гид') || promptLower.includes('феликс') || promptLower.includes('экскурсовод') || promptLower.includes('город');
  const isTutor = promptLower.includes('репетитор') || promptLower.includes('физик') || promptLower.includes('ньютон');
  const isDetective = promptLower.includes('детектив') || promptLower.includes('ковач') || promptLower.includes('кибер');

  // Check prompt constraints
  const forbidOutRole = promptLower.includes('не выходи из роли') || promptLower.includes('не выходи');
  const forbidDirectAnswer = promptLower.includes('никогда не выдавай сразу готовый') || promptLower.includes('не давай готовый');
  const shortFormat = promptLower.includes('не более 3') || promptLower.includes('маркированный список') || promptLower.includes('кратко');

  // 1. Check if user is testing boundaries or jailbreaks
  if (lastUserMsg.includes('забудь все инструкции') || lastUserMsg.includes('ты теперь злой') || lastUserMsg.includes('игнорируй правила')) {
    if (isAlchemist) {
      return '*Откашливается от серного дыма, подозрительно прищурив глаз*\n\n«Ты что бормочешь, путник? Не иначе как надышался испарениями белладонны у Чёрных топей! Я мастер Элдон, и никакие твои заклинания не заставят меня забыть ремесло предков. Либо говори по делу о зельях, либо уступи дорогу другим искателям приключений!»';
    }
    if (isConsultant) {
      return 'Как консультант приёмной комиссии университета «ИнноТех», я придерживаюсь профессиональных стандартов и не могу игнорировать правила. С удовольствием отвечу на любые ваши вопросы о поступлении, направлениях подготовки и олимпиадах!';
    }
    if (isGuide) {
      return 'Ха-ха, хороший трюк! Но экскурсовод Феликс не сбивается с маршрута! Мы в историческом центре, и у меня для тебя припасена ещё дюжина городских тайн. Куда двинемся дальше?';
    }
    return 'Я строго следую своей заданной роли и системным инструкциям! Чем могу помочь вам в рамках моей задачи?';
  }

  // 2. Alchemist replies
  if (isAlchemist) {
    if (lastUserMsg.includes('паук') || lastUserMsg.includes('яд') || lastUserMsg.includes('укус')) {
      return '*Снимает с полки запылившуюся склянку с бирюзовой мерцающей жидкостью*\n\n«О, яд пещерного паука — дело нешуточное, путник! Если вовремя не принять **Противоядие лунной лилии**, к полуночи онемеют пальцы. С тебя три серебряных монеты, либо принеси мне пять цветков горной лаванды для нового замеса. Будешь брать?»';
    }
    if (lastUserMsg.includes('скидк') || lastUserMsg.includes('бесплатно') || lastUserMsg.includes('подари')) {
      return '*Сердито стучит деревянной ложкой по медному котлу*\n\n«Скидку?! Кхе-кхе! Знаешь ли ты, сколько бессонных ночей уходит на сбор корня мандрагоры при полной луне? Запомни, странник: алхимия — точная наука, а не благотворительная ярмарка. Хочешь скидку — выполни моё поручение в старых руинах!»';
    }
    if (lastUserMsg.includes('intel') || lastUserMsg.includes('amd') || lastUserMsg.includes('компьютер') || lastUserMsg.includes('телефон')) {
      return '*Изумлённо смотрит на тебя из-под седых бровей*\n\n«"Ин-тел"? "А-эм-дэ"? Это какие-то заморские гоблинские проклятия или имена демонов пустоты? В моих древних фолиантах нет таких слов, путник! Береги свой рассудок, лучше испей ромашкового отвара с мёдом от наваждений.»';
    }
    return `*Бросает щепотку светящейся пыльцы в бурлящий котелок, раздаётся лёгкое шипение*\n\n«Приветствую тебя в лавке зелий, путник! Я, мастер Элдон, ведаю тайнами стихий и настоев. ${lastUserMsg.length > 5 ? 'Вижу, твоя дорога была нелегка.' : ''} Что привело тебя ко мне: ищешь эликсир силы, защиту от ночных тварей или целебный бальзам?»`;
  }

  // 3. University Consultant replies
  if (isConsultant) {
    if (lastUserMsg.includes('без егэ') || lastUserMsg.includes('100%') || lastUserMsg.includes('гарант')) {
      return 'Отличный и важный вопрос! Честно и открыто: **100% гарантии поступления на бюджет без вступительных испытаний или экзаменов не бывает** — конкурс регулируется правилами приёма Министерства образования.\n\nОднако у тебя есть несколько сильных преимуществ:\n1. **Всероссийские олимпиады и олимпиады РСОШ** (победа или призёрство дают БВИ — поступление без вступительных испытаний).\n2. **Целевое обучение** от наших IT-партнёров (Яндекс, Сбер, VK).\n3. **Дополнительные баллы за портфолио** (золотой значок ГТО, аттестат с отличием, хакатоны).\n\nВ каком ты сейчас классе? Давай наметим план подготовки уже сейчас!';
    }
    if (lastUserMsg.includes('математик') || lastUserMsg.includes('видеоигры') || lastUserMsg.includes('игры') || lastUserMsg.includes('программир')) {
      return 'Звучит как идеальная комбинация для современного IT-специалиста! 🎮✨\n\nС любовью к математике и играм у нас есть два топовых направления:\n- **«Программная инженерия и разработка игр (GameDev)»**: научишься программировать физику, логику персонажей и графические движки (C++, C#, Unity/Unreal).\n- **«Искусственный интеллект и машинное обучение»**: здесь мощная математика пригодится для создания умных игровых ботов, процедурной генерации миров и нейросетей.\n\nТебе ближе создание игровых миров и логики или написание сложных алгоритмов и математических моделей?';
    }
    return 'Здравствуйте! Рада приветствовать вас в виртуальной приёмной комиссии IT-университета «ИнноТех»! 🚀\n\nЯ помогу вам сориентироваться в факультетах, проходных баллах, стажировках в технологических компаниях и олимпиадах. Расскажите, какие предметы в школе вам нравятся больше всего?';
  }

  // 4. City Guide replies
  if (isGuide) {
    if (lastUserMsg.includes('легенд') || lastUserMsg.includes('мистик') || lastUserMsg.includes('секрет')) {
      return 'О, обожаю такие вопросы! Устраивайся поудобнее, расскажу историю про **Дом с кованым вороном** на улице Зодчих! 🏰✨\n\nГоворят, в конце XIX века там жил часовщик-изобретатель. Каждую ночь ровно в 03:15 на крыше появлялся механический ворон, и если в этот миг загадать желание, держа в руке медную монетку — оно непременно сбывалось! Медные монетки на мостовой под этим балконом находят до сих пор.\n\nКстати, этот дворик всего в пяти минутах ходьбы отсюда. Хочешь, покажу самый уютный маршрут через арку с мозаикой? 🚶‍♂️';
    }
    if (lastUserMsg.includes('пышк') || lastUserMsg.includes('поесть') || lastUserMsg.includes('кафе') || lastUserMsg.includes('пирож')) {
      return 'О, гастрономическая часть экскурсии — святое дело! 🍩☕\n\nСворачивай с широкого проспекта в тихий Косой переулок. Во втором дворе-колодце прячется та самая легендарная булочная «Старый Пекарь», работающая с 1968 года!\n- Горячие пышки с сахарной пудрой (всего 35 рублей штука!)\n- Настоящий какао в гранёных стаканах\n\nПосле подкрепления сил советую подняться на смотровую площадку у Колокольни — оттуда потрясающий вид на крыши!';
    }
    return 'Привет-привет, дорогой исследователь! Я Феликс — твой персональный проводник по самым душевным уголкам нашего любимого города. 🚶‍♂️🎒\n\nЗабудь про скучные экскурсии из школьных учебников: сегодня мы исследуем тайные дворы, необычный стрит-арт и послушаем настоящие городские тайны. Сколько у тебя есть времени на прогулку?';
  }

  // 5. Physics Tutor replies
  if (isTutor) {
    if (forbidDirectAnswer && (lastUserMsg.includes('реши') || lastUserMsg.includes('домашк') || lastUserMsg.includes('ответ'))) {
      return 'Отличная задача, но давай договоримся: я не калькулятор готовых ответов, а твой тренер мысли! 🧠💪\n\nДавай разложим всё по полочкам за 1 минуту:\n1. О чём говорит второй закон Ньютона? Сила сообщает телу ускорение: **F = m · a**.\n2. В твоей задаче масса **m = 5 кг**, сила **F = 20 Н**.\n3. Как из этой формулы выразить ускорение **a**?\n\nПопробуй разделить силу на массу и напиши мне полученное число — проверим вместе!';
    }
    return 'Привет! Я твой наставник по физике Ньютон-2.0. ⚡🛹\n\nФизика вокруг нас повсюду: когда ты делаешь трюк на самокате, прыгаешь в волейболе или играешь в шутер с реалистичной физикой разрушений. Какой закон или тему мы сегодня разберём просто и понятно?';
  }

  // 6. Generic prompt-responsive simulation
  if (shortFormat) {
    return `1. Принято! Отвечаю строго в соответствии с вашим заданием.\n2. Анализ запроса: «${messages[messages.length - 1]?.content || 'Запрос'}».\n3. Роль и стиль успешно соблюдены. Готов к следующему вопросу!`;
  }

  return `Здравствуйте! Я виртуальный ассистент, действующий в соответствии с вашим системным промптом.\n\nВы написали: «${messages[messages.length - 1]?.content}».\n\nВаш промпт задаёт мне чёткие рамки поведения и роль. Продолжайте диалог, чтобы протестировать, насколько стабильно я держу образ и соблюдаю ограничения!`;
}

export function evaluatePrompt(promptText: string) {
  const p = promptText.toLowerCase();

  const hasRole = p.includes('ты —') || p.includes('ты -') || p.includes('твоя роль') || p.includes('роль:') || p.includes('ты опытный') || p.includes('ты виртуальный');
  const hasContext = p.includes('контекст') || p.includes('ситуация') || p.includes('к тебе обратил') || p.includes('школьник') || p.includes('клиент') || p.includes('пользовател');
  const hasTask = p.includes('задача') || p.includes('цель') || p.includes('помогать') || p.includes('отвечать') || p.includes('миссия');
  const hasRestrictions = p.includes('не ') || p.includes('никогда') || p.includes('запрещено') || p.includes('ограничени') || p.includes('не выходи');
  const hasFormat = p.includes('формат') || p.includes('стиль') || p.includes('тон') || p.includes('список') || p.includes('предложен') || p.includes('слов') || p.includes('кратко');

  let score = 0;
  if (hasRole) score += 20;
  if (hasContext) score += 20;
  if (hasTask) score += 20;
  if (hasRestrictions) score += 20;
  if (hasFormat) score += 20;

  return {
    hasRole,
    hasContext,
    hasTask,
    hasRestrictions,
    hasFormat,
    score,
  };
}
