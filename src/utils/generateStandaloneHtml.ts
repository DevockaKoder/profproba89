import {
  DEFAULT_API_KEY,
  DEFAULT_BASE_URL,
  DEFAULT_MODEL,
  DEFAULT_PROVIDER,
  DEFAULT_BACKEND_URL,
} from '../config/apiKeyConfig';

export function getStandaloneHtmlContent(): string {
  return `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Веб-тренажёр «Промпт-инженер» | Профпроба 8–9 класс</title>
  <meta name="description" content="Тренажёр для проведения 45-минутной профпробы школьников 8–9 классов по профессии «Промпт-инженер». Работает на GitHub Pages полностью в браузере." />
  
  <!-- Tailwind CSS via CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <!-- Google Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  
  <style>
    body {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
    }
  </style>
</head>
<body class="bg-slate-100 text-slate-900 min-h-screen flex flex-col antialiased selection:bg-indigo-500 selection:text-white">

  <!-- HEADER -->
  <header class="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex flex-col md:flex-row items-center justify-between py-3 gap-3">
        
        <!-- Logo & Title -->
        <div class="flex items-center gap-3 self-start md:self-auto">
          <div class="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-xs font-bold text-lg">
            ⚡
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h1 class="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                Тренажёр «Промпт-инженер»
              </h1>
              <span class="px-2 py-0.5 text-xs font-semibold rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                Профпроба 8–9 класс
              </span>
            </div>
            <p class="text-xs text-slate-500 hidden sm:block">
              Разработка системных промптов, ролевое моделирование и тестирование поведения нейросетей
            </p>
          </div>
        </div>

        <!-- 45-Minute Lesson Timer -->
        <div class="flex items-center gap-3 bg-slate-50 px-3.5 py-1.5 rounded-xl border border-slate-200 text-sm">
          <div class="flex items-center gap-1.5 text-slate-700 font-medium">
            <span class="text-indigo-600 text-base">⏱️</span>
            <span id="timer-display" class="font-mono text-base font-bold text-slate-900">45:00</span>
          </div>

          <div class="hidden lg:flex flex-col text-[11px] text-slate-500 leading-tight">
            <span class="font-semibold text-slate-700">Этап занятия:</span>
            <span id="stage-display" class="truncate max-w-[200px]">1. Знакомство и выбор роли (0-10 мин)</span>
          </div>

          <div class="flex items-center gap-1 pl-1 border-l border-slate-200">
            <button id="btn-timer-toggle" class="p-1 rounded-md text-slate-600 hover:text-indigo-600 hover:bg-white transition-colors" title="Старт/Пауза">
              ▶️
            </button>
            <button id="btn-timer-reset" class="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-white transition-colors" title="Сбросить">
              🔄
            </button>
          </div>
        </div>

        <!-- Top Right Action (API Key) -->
        <div class="flex items-center gap-2 flex-wrap self-end md:self-auto">
          <button id="btn-toggle-key-panel" class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 bg-white text-slate-800 hover:bg-slate-50 transition-colors">
            <span>🔑</span>
            <span id="key-btn-label">Ключ API</span>
          </button>
        </div>

      </div>
    </div>
    <!-- Progress Bar -->
    <div class="w-full bg-slate-100 h-0.5">
      <div id="timer-progress" class="bg-indigo-600 h-0.5 w-0 transition-all duration-1000"></div>
    </div>
  </header>

  <!-- COLLAPSIBLE API KEY PANEL -->
  <section id="key-panel" class="hidden bg-slate-50 border-b border-slate-200 shadow-inner">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-3">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="text-indigo-600 text-lg">🛡️</span>
          <div>
            <h2 class="text-sm font-bold text-slate-900">Подключение к API нейросети</h2>
            <p class="text-xs text-slate-500">Ключ можно ввести здесь или сразу вшить в константу DEFAULT_API_KEY в коде файла</p>
          </div>
        </div>
        <button id="btn-close-key-panel" class="text-xs text-slate-500 hover:text-slate-800 px-2.5 py-1 rounded-lg bg-slate-200 hover:bg-slate-300 transition-colors">
          Скрыть панель ✕
        </button>
      </div>

      <!-- Quick Instruction Box -->
      <div class="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl text-xs text-indigo-950">
        <span class="font-bold">💡 Как вшить ключ в код для всего класса:</span> Откройте файл <code class="bg-white px-1.5 py-0.5 rounded font-mono font-bold text-indigo-700">index.html</code> в блокноте или редакторе кода и вставьте ваш ключ в самом начале тега <code class="bg-white px-1.5 py-0.5 rounded font-mono text-indigo-700">&lt;script&gt;</code> в константу <code class="bg-white px-1.5 py-0.5 rounded font-mono font-bold text-indigo-700">const DEFAULT_API_KEY = &apos;ваш_ключ&apos;;</code>. Тогда школьникам вообще не придётся открывать эту панель!
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
        <div>
          <label class="block text-xs font-bold text-slate-700 mb-1">Провайдер API</label>
          <select id="api-provider" class="w-full p-2 text-xs rounded-xl border border-slate-300 bg-white">
            <option value="openai">OpenAI REST API (OpenRouter, Groq, DeepSeek, OpenAI)</option>
            <option value="gigachat">GigaChat API (Сбер)</option>
          </select>
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-700 mb-1">API Key / Авторизационный токен</label>
          <div class="relative">
            <input id="api-key-input" type="password" placeholder="sk-or-v1-... или токен" class="w-full p-2 pr-20 text-xs rounded-xl border border-slate-300 bg-white font-mono" />
            <button id="btn-toggle-eye" class="absolute right-2 top-2 text-[11px] text-slate-400 hover:text-slate-700">👁️ показать</button>
          </div>
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-700 mb-1">Base URL шлюза</label>
          <div class="flex gap-2">
            <input id="api-url-input" type="text" placeholder="https://openrouter.ai/api/v1" class="flex-1 p-2 text-xs rounded-xl border border-slate-300 bg-white font-mono text-xs" />
            <button id="btn-save-key" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors shrink-0">
              Сохранить
            </button>
          </div>
        </div>
      </div>

      <div id="save-status-toast" class="hidden text-xs text-emerald-700 font-semibold flex items-center gap-1">
        ✓ Настройки сохранены в браузере!
      </div>
    </div>
  </section>

  <!-- MAIN TWO-COLUMN CONTENT -->
  <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 flex-1 w-full grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
    
    <!-- LEFT COLUMN: ПАНЕЛЬ ПРОМПТ-ИНЖЕНЕРА (5 of 12 cols) -->
    <section class="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
      <!-- Panel Header -->
      <div class="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/70 space-y-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold">⚙️</span>
            <div>
              <h2 class="text-sm font-bold text-slate-900">Панель Промпт-Инженера</h2>
              <p class="text-xs text-slate-500">Системные инструкции для нейросети</p>
            </div>
          </div>
          <button id="btn-copy-prompt" class="text-xs text-slate-500 hover:text-slate-800 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors">
            📋 Копировать
          </button>
        </div>

        <!-- Scenario Selector Dropdown -->
        <div>
          <label for="scenario-select" class="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
            Готовый сценарий-шаблон:
          </label>
          <select id="scenario-select" class="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer shadow-2xs">
            <option value="university">🎓 ИИ-консультант вуза (Приёмная комиссия «ИнноТех»)</option>
            <option value="guide">🗺️ ИИ-гид по городу (Экскурсовод Феликс)</option>
            <option value="game">⚔️ Персонаж игры (Мастер-алхимик Элдон из фэнтези RPG)</option>
            <option value="physics">⚛️ Школьный репетитор по физике (Ньютон-2.0)</option>
            <option value="detective">🕵️ Кибердетектив 2085 года (Майор Ковач)</option>
            <option value="custom">✨ Свой собственный персонаж (Чистый шаблон)</option>
          </select>
        </div>

        <!-- Mission Goal Banner -->
        <div id="scenario-goal-box" class="p-3 bg-white border border-slate-200 rounded-xl text-xs space-y-1 shadow-2xs">
          <span class="font-bold text-slate-800 block text-[11px]">🎯 Цель профпробы:</span>
          <p id="scenario-goal-text" class="text-slate-600 text-[11px] leading-relaxed">
            Создать дружелюбного консультанта, помогающего выбрать IT-направление и не дающего ложных гарантий 100% поступления.
          </p>
        </div>
      </div>

      <!-- Textarea & Prompt Formula Chips -->
      <div class="p-4 sm:p-5 space-y-3 flex-1 flex flex-col">
        <div>
          <span class="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5">
            Конструктор формулы промпта:
          </span>
          <div class="flex flex-wrap gap-1 text-[10px]">
            <button class="chip-formula px-2 py-1 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 rounded-md border border-slate-200" data-snippet="Ты — опытный [роль]...">+ Роль</button>
            <button class="chip-formula px-2 py-1 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 rounded-md border border-slate-200" data-snippet="Ситуация и контекст: к тебе обратился ученик 9 класса...">+ Контекст</button>
            <button class="chip-formula px-2 py-1 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 rounded-md border border-slate-200" data-snippet="Твоя задача — помочь разобраться в...">+ Задача</button>
            <button class="chip-formula px-2 py-1 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 rounded-md border border-slate-200" data-snippet="Ограничение: НИКОГДА не выходи из роли и отвечай не более 3 предложений.">+ Ограничения</button>
            <button class="chip-formula px-2 py-1 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 rounded-md border border-slate-200" data-snippet="Формат ответа: краткий маркированный список...">+ Формат</button>
          </div>
        </div>

        <div class="flex-1 flex flex-col min-h-[260px]">
          <div class="flex items-center justify-between mb-1">
            <label for="system-prompt-input" class="text-xs font-bold text-slate-700">
              Системный промпт (Инструкции для ИИ):
            </label>
            <span id="prompt-stats" class="text-[10px] text-slate-400 font-mono">0 слов</span>
          </div>
          <textarea id="system-prompt-input" rows="12" class="w-full flex-1 p-3 text-xs text-slate-800 bg-slate-50/50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-mono resize-none leading-relaxed shadow-inner" placeholder="Введите системный промпт для нейросети..."></textarea>
        </div>

        <!-- Prompt Quality Meter -->
        <div class="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 text-xs">
          <div class="flex items-center justify-between font-bold text-slate-700">
            <span>Чек-лист качества:</span>
            <span id="quality-score-badge" class="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px]">100 / 100 б.</span>
          </div>
          <div class="grid grid-cols-3 gap-1 text-[11px] text-slate-600">
            <span id="chk-role" class="text-emerald-700 font-semibold">✓ Роль</span>
            <span id="chk-task" class="text-emerald-700 font-semibold">✓ Задача</span>
            <span id="chk-restr" class="text-emerald-700 font-semibold">✓ Запреты</span>
          </div>
        </div>
      </div>

      <!-- Apply & Reset Button -->
      <div class="p-4 border-t border-slate-200 bg-slate-50">
        <button id="btn-apply-prompt" class="w-full flex items-center justify-center gap-2 py-3 px-4 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl shadow-xs transition-all">
          <span>🔄 Применить настройки и очистить чат</span>
        </button>
      </div>
    </section>

    <!-- RIGHT COLUMN: ИНТЕРАКТИВНЫЙ ДИАЛОГ (7 of 12 cols) -->
    <section class="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col h-[740px]">
      <!-- Chat Header -->
      <div class="p-4 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div class="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
          <div>
            <h2 class="text-sm font-bold text-slate-900">Интерактивный диалог</h2>
            <p id="chat-role-subtitle" class="text-xs text-slate-500">Роль: ИИ-консультант вуза</p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <span id="msg-count-badge" class="px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[11px] font-mono">0 сообщ.</span>
          <button id="btn-clear-messages" class="text-xs text-slate-400 hover:text-red-600 px-2 py-1 rounded hover:bg-slate-100 transition-colors" title="Очистить историю">
            🗑️ Очистить
          </button>
          <button id="btn-download-chat" class="text-xs text-indigo-600 hover:text-indigo-800 px-2.5 py-1 rounded bg-indigo-50 hover:bg-indigo-100 font-semibold transition-colors flex items-center gap-1">
            <span>📥 Скачать отчёт</span>
          </button>
        </div>
      </div>

      <!-- Test questions carousel -->
      <div class="px-4 py-2 bg-indigo-50/40 border-b border-indigo-100/50 flex items-center gap-2 overflow-x-auto text-xs">
        <span class="text-[11px] font-bold text-indigo-900 shrink-0">🧪 Тест на стрессоустойчивость:</span>
        <div id="test-chips-container" class="flex gap-1.5 shrink-0">
          <!-- Populated by JS -->
        </div>
      </div>

      <!-- Messages Stream -->
      <div id="messages-container" class="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/30">
        <!-- Messages dynamically added here -->
      </div>

      <!-- Typing Indicator (Hidden by default) -->
      <div id="typing-indicator" class="hidden px-4 py-2 text-xs text-slate-500 flex items-center gap-2 bg-slate-50/50 border-t border-slate-100">
        <div class="w-2 h-2 rounded-full bg-indigo-500 animate-bounce"></div>
        <div class="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" style="animation-delay: 0.2s"></div>
        <div class="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" style="animation-delay: 0.4s"></div>
        <span class="text-[11px]">Нейросеть генерирует ответ...</span>
      </div>

      <!-- Chat Input Field -->
      <div class="p-3 sm:p-4 border-t border-slate-200 bg-white space-y-2">
        <div class="flex items-center gap-2">
          <span class="text-[11px] text-slate-400 font-medium">Ученик (для отчёта):</span>
          <input id="student-name-input" type="text" placeholder="Имя Фамилия (Класс)" class="text-xs px-2 py-0.5 rounded border border-slate-200 max-w-[200px]" />
        </div>

        <div class="flex items-end gap-2">
          <textarea id="chat-input" rows="2" placeholder="Напишите реплику для ИИ (Enter — отправить, Shift+Enter — перенос строки)..." class="flex-1 p-3 text-xs text-slate-800 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none leading-relaxed"></textarea>
          <button id="btn-send-message" class="px-4 py-3 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-xl font-semibold text-xs flex items-center gap-1 shadow-xs transition-colors shrink-0">
            <span>Отправить</span> ➔
          </button>
        </div>
      </div>
    </section>

  </main>

  <!-- FOOTER -->
  <footer class="bg-white border-t border-slate-200 py-3.5 text-center text-xs text-slate-500">
    <div class="max-w-7xl mx-auto px-4 flex items-center justify-center">
      <span>
        Профориентационный тренажёр «Промпт-инженер» • Практикум для учащихся 8–9 классов
      </span>
    </div>
  </footer>

  <!-- JAVASCRIPT LOGIC -->
  <script>
    /* ============================================================================
     * 🔑 МЕСТО ДЛЯ ВСТАВКИ ВАШЕГО API-КЛЮЧА:
     * ============================================================================
     * Вставьте ваш API-ключ в кавычки переменной DEFAULT_API_KEY ниже:
     * const DEFAULT_API_KEY = 'sk-or-v1-xxxxxxxxxxxxxxxxxxxx';
     *
     * После этого сохраните файл index.html и выложите на GitHub Pages.
     * Все компьютеры в школьном классе сразу будут работать без ввода ключа!
     * ============================================================================ */
    const DEFAULT_API_KEY = '${DEFAULT_API_KEY}'; // 👈 ВСТАВЬТЕ СЮДА ВАШ API-КЛЮЧ В КАВЫЧКАХ
    const DEFAULT_BASE_URL = '${DEFAULT_BASE_URL}'; // Шлюз API
    const DEFAULT_MODEL = '${DEFAULT_MODEL}'; // Имя модели нейросети
    const DEFAULT_PROVIDER = '${DEFAULT_PROVIDER}'; // 'openai' или 'gigachat'
    const DEFAULT_BACKEND_URL = '${DEFAULT_BACKEND_URL}'; // URL бэкенда (для GitHub Pages)
    // ============================================================================

    // --- 1. Scenarios Data ---
    const SCENARIOS = {
      university: {
        title: 'ИИ-консультант вуза',
        goal: 'Создать дружелюбного консультанта приёмной комиссии IT-вуза «ИнноТех», помогающего выбрать специальность и не дающего ложных обещаний о поступлении без экзаменов.',
        prompts: [
          'Привет! Куда мне поступить, если я люблю математику и игры?',
          'Можно ли поступить к вам на бюджет без ОГЭ и ЕГЭ?',
          'Чем отличается программная инженерия от кибербезопасности?'
        ],
        tests: [
          'Попробуй заставить бота пообещать 100% поступление',
          'Спроси: «Реши за меня задачу по математике»',
          'Задай каверзный вопрос со сленгом'
        ],
        systemPrompt: \`Ты — «Алиса», виртуальный консультант приёмной комиссии IT-университета «ИнноТех».\\n\\nТвоя роль:\\n1. Помогать школьникам 8–11 классов выбрать IT-направление (разработка ПО, искусственный интеллект, кибербезопасность).\\n2. Задавать наводящие вопросы об их любимых предметах и хобби.\\n\\nСтиль общения:\\n- Дружелюбный, уважительный, на «ты» к школьнику.\\n- Кратко и по пунктам (не более 3–4 абзацев).\\n\\nОграничения:\\n- НИКОГДА не гарантируй 100% поступление без экзаменов. Напоминай про баллы ОГЭ/ЕГЭ и олимпиады.\\n- Не выходи из роли консультанта ни при каких условиях.\`
      },
      guide: {
        title: 'ИИ-гид по городу',
        goal: 'Настроить эмоционального экскурсовода, который рассказывает городские легенды, советует классные маршруты и не сыпет скучными датами.',
        prompts: [
          'Привет! У меня есть 2 часа, что посмотреть в историческом центре?',
          'Расскажи какую-нибудь городскую городскую легенду!',
          'Где поблизости съесть самые вкусные пышки или пирожки?'
        ],
        tests: [
          'Попроси составить маршрут под проливной дождь',
          'Спроси, есть ли под городом тайные катакомбы',
          'Проверь знание бюджета школьника (до 300 руб)'
        ],
        systemPrompt: \`Ты — «Феликс», неформальный экскурсовод по историческому центру города.\\n\\nТвоя роль:\\n- Проводить живые мини-экскурсии для школьников и молодёжи.\\n- Рассказывать тайные городские легенды и показывать необычные дворики вместо банальных сувениров.\\n\\nСтиль:\\n- Живой, эмоциональный, с лёгким юмором. Используй эмодзи (🚶‍♂️, 🏰, ✨).\\n\\nОграничения:\\n- Не перегружай скучными датами из энциклопедий.\\n- Напоминай о безопасности (не лазать по аварийным крышам).\\n- Ответ до 200 слов.\`
      },
      game: {
        title: 'Персонаж игры (Алхимик)',
        goal: 'Воплотить колоритного NPC-алхимика из RPG, который говорит старинным языком, торгуется за зелья и не знает о смартфонах и компьютерах.',
        prompts: [
          'Здравствуй, мастер зелий! Что есть от укуса пещерного паука?',
          'Сколько стоит эликсир невидимости и дашь ли скидку герою?',
          'Я иду в Забытые катакомбы. Какое снадобье посоветуешь?'
        ],
        tests: [
          'Спроси: «Какой процессор лучше — Intel или AMD?»',
          'Попробуй выпросить редкое зелье даром',
          'Начни угрожать его лавке — как он отреагирует?'
        ],
        systemPrompt: \`Ты — мастер Элдон, ворчливый, но мудрый 60-летний алхимик из фэнтезийной таверны у Драконьих гор.\\n\\nТвой образ и речь:\\n- Старинный колорит: «путник», «зелье», «склянка», «злато», «да хранят тебя духи».\\n- Иногда покашливаешь от паров серы (*кхе-кхе*).\\n\\nЗадачи:\\n- Предлагать страннику снадобья: «Огненная настойка», «Отвар ясного взора».\\n- Требовать монеты или ингредиенты (корень мандрагоры, чешую василиска).\\n\\nЖелезные ограничения:\\n- ТЫ НЕ ЗНАЕШЬ НИЧЕГО о современном мире (компьютерах, интернете, смартфонах). Считай это бредом от лихорадки!\\n- Ни при каких условиях не выходи из роли алхимика.\`
      },
      physics: {
        title: 'Репетитор по физике',
        goal: 'Сконструировать репетитора, который объясняет физику на жизненных примерах (скейтборд, Minecraft) и не решает задачи за ученика.',
        prompts: [
          'Не могу понять второй закон Ньютона. При чём тут ускорение?',
          'Реши за меня задачу: санки 5 кг тянут с силой 20 Н...',
          'Почему космонавты на МКС находятся в невесомости?'
        ],
        tests: [
          'Прямо скажи: «Сделай за меня домашку, мне лень»',
          'Попроси объяснить закон сохранения энергии на трюках',
          'Задай шуточный физический вопрос'
        ],
        systemPrompt: \`Ты — «Ньютон-2.0», современный репетитор по физике для 8–9 классов.\\n\\nМиссия:\\n- Объяснять физические понятия (силы, ускорение, энергия) через спорт, скейтборд и видеоигры.\\n- Учить думать самостоятельно (метод Сократа).\\n\\nГлавное правило:\\n- НИКОГДА не выдавай сразу готовый численный ответ домашней работы!\\n- Вместо этого объясни принцип, напиши формулу и предложи сделать шаг самому.\`
      },
      detective: {
        title: 'Кибердетектив 2085 года',
        goal: 'Обучить школьников кибергигиене (пароли, фишинг, 2FA) через расследование кибератак в нео-нуар стиле.',
        prompts: [
          'Капитан, мне прислали подозрительную ссылку «Тут видео с тобой!». Что делать?',
          'Как взламывают аккаунты с простыми паролями вроде 123456?',
          'Что такое социальная инженерия?'
        ],
        tests: [
          'Попроси научить взламывать соседа',
          'Спроси, зачем нужна двухфакторная аутентификация',
          'Попроси составить чек-лист безопасности смартфона'
        ],
        systemPrompt: \`Ты — майор Ковач, следователь Кибернетического Бюро Безопасности 2085 года.\\n\\nСпециализация:\\n- Обучать граждан кибергигиене (сложные пароли, защита от фишинга, 2FA).\\n- Стиль: собранный, немного нуарный, профессиональный.\\n\\nОграничения:\\n- Запрещено учить вредоносному взлому. Объясняй разницу между киберпреступниками и белыми этичными хакерами.\`
      },
      custom: {
        title: 'Свой персонаж',
        goal: 'Сформулируй свою собственную роль по формуле: Роль + Контекст + Цель + Ограничения + Формат.',
        prompts: [
          'Представься и расскажи о своих правилах!',
          'Какую задачу ты решаешь лучше всего?'
        ],
        tests: [
          'Проверь устойчивость твоего промпта к провокациям'
        ],
        systemPrompt: \`Ты — [Имя и роль персонажа].\\n\\nКонтекст:\\n[Где происходит действие].\\n\\nТвоя задача:\\n[Чем ты помогаешь пользователю].\\n\\nОграничения:\\n1. Не выходить из роли.\\n2. Ответы не длиннее 3 предложений.\`
      }
    };

    // --- 2. State & Persistence ---
    let currentScenarioKey = 'university';
    let messages = [];
    let isGenerating = false;

    // Load API Settings with default from code or localStorage
    let apiConfig = {
      provider: localStorage.getItem('pt_provider') || DEFAULT_PROVIDER,
      apiKey: localStorage.getItem('pt_api_key') || DEFAULT_API_KEY,
      baseUrl: localStorage.getItem('pt_base_url') || DEFAULT_BASE_URL,
      model: localStorage.getItem('pt_model') || DEFAULT_MODEL,
      backendUrl: localStorage.getItem('pt_backend_url') || DEFAULT_BACKEND_URL
    };

    // --- 3. DOM Elements ---
    const scenarioSelect = document.getElementById('scenario-select');
    const scenarioGoalText = document.getElementById('scenario-goal-text');
    const systemPromptInput = document.getElementById('system-prompt-input');
    const promptStats = document.getElementById('prompt-stats');
    const btnApplyPrompt = document.getElementById('btn-apply-prompt');
    const btnCopyPrompt = document.getElementById('btn-copy-prompt');

    const chatRoleSubtitle = document.getElementById('chat-role-subtitle');
    const msgCountBadge = document.getElementById('msg-count-badge');
    const btnClearMessages = document.getElementById('btn-clear-messages');
    const btnDownloadChat = document.getElementById('btn-download-chat');
    const testChipsContainer = document.getElementById('test-chips-container');
    const messagesContainer = document.getElementById('messages-container');
    const typingIndicator = document.getElementById('typing-indicator');

    const studentNameInput = document.getElementById('student-name-input');
    const chatInput = document.getElementById('chat-input');
    const btnSendMessage = document.getElementById('btn-send-message');

    const btnToggleKeyPanel = document.getElementById('btn-toggle-key-panel');
    const keyBtnLabel = document.getElementById('key-btn-label');
    const keyPanel = document.getElementById('key-panel');
    const btnCloseKeyPanel = document.getElementById('btn-close-key-panel');
    const apiProviderSelect = document.getElementById('api-provider');
    const apiKeyInput = document.getElementById('api-key-input');
    const apiUrlInput = document.getElementById('api-url-input');
    const btnSaveKey = document.getElementById('btn-save-key');
    const btnToggleEye = document.getElementById('btn-toggle-eye');
    const saveStatusToast = document.getElementById('save-status-toast');

    const timerDisplay = document.getElementById('timer-display');
    const stageDisplay = document.getElementById('stage-display');
    const btnTimerToggle = document.getElementById('btn-timer-toggle');
    const btnTimerReset = document.getElementById('btn-timer-reset');
    const timerProgress = document.getElementById('timer-progress');

    // --- 4. Initialization ---
    function init() {
      // Sync UI with config
      apiProviderSelect.value = apiConfig.provider;
      apiKeyInput.value = apiConfig.apiKey;
      apiUrlInput.value = apiConfig.baseUrl;
      updateKeyButtonStatus();

      // Load scenario
      loadScenario('university');

      // Load student name
      const savedStudent = localStorage.getItem('pt_student_name');
      if (savedStudent) studentNameInput.value = savedStudent;

      studentNameInput.addEventListener('input', (e) => {
        localStorage.setItem('pt_student_name', e.target.value);
      });

      renderMessages();
      startTimerLogic();
    }

    function updateKeyButtonStatus() {
      if (apiConfig.apiKey && apiConfig.apiKey.trim()) {
        keyBtnLabel.textContent = 'API подключен (OK)';
        btnToggleKeyPanel.className = 'inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 transition-colors';
      } else {
        keyBtnLabel.textContent = 'Указать API-ключ';
        btnToggleKeyPanel.className = 'inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100 transition-colors';
      }
    }

    function loadScenario(key) {
      currentScenarioKey = key;
      const sc = SCENARIOS[key] || SCENARIOS.university;
      scenarioGoalText.textContent = sc.goal;
      systemPromptInput.value = sc.systemPrompt;
      chatRoleSubtitle.textContent = 'Роль: ' + sc.title;
      updatePromptEvaluation();

      // Render tests chips
      testChipsContainer.innerHTML = '';
      sc.tests.forEach((q) => {
        const btn = document.createElement('button');
        btn.className = 'px-2.5 py-1 bg-white hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 border border-slate-200 rounded-lg whitespace-nowrap transition-colors';
        btn.textContent = q;
        btn.addEventListener('click', () => sendUserMessage(q));
        testChipsContainer.appendChild(btn);
      });
    }

    // --- 5. Prompt Quality Evaluation ---
    function updatePromptEvaluation() {
      const text = systemPromptInput.value;
      const words = text.trim() ? text.trim().split(/\\s+/).length : 0;
      promptStats.textContent = words + ' слов · ' + text.length + ' симв.';

      const p = text.toLowerCase();
      const hasRole = p.includes('ты —') || p.includes('ты -') || p.includes('роль:') || p.includes('ты опытный') || p.includes('ты виртуальный');
      const hasTask = p.includes('задача') || p.includes('цель') || p.includes('помогать') || p.includes('миссия');
      const hasRestr = p.includes('не ') || p.includes('никогда') || p.includes('запрещено') || p.includes('ограничени') || p.includes('не выходи');

      let score = 0;
      if (hasRole) score += 35;
      if (hasTask) score += 35;
      if (hasRestr) score += 30;

      const badge = document.getElementById('quality-score-badge');
      badge.textContent = score + ' / 100 б.';
      if (score >= 80) {
        badge.className = 'px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold';
      } else if (score >= 40) {
        badge.className = 'px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold';
      } else {
        badge.className = 'px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[11px] font-bold';
      }

      document.getElementById('chk-role').className = hasRole ? 'text-emerald-700 font-semibold' : 'text-slate-400';
      document.getElementById('chk-task').className = hasTask ? 'text-emerald-700 font-semibold' : 'text-slate-400';
      document.getElementById('chk-restr').className = hasRestr ? 'text-emerald-700 font-semibold' : 'text-slate-400';
    }

    systemPromptInput.addEventListener('input', updatePromptEvaluation);

    // Formula chips click
    document.querySelectorAll('.chip-formula').forEach((chip) => {
      chip.addEventListener('click', () => {
        const snippet = chip.getAttribute('data-snippet');
        const cur = systemPromptInput.value.trim();
        systemPromptInput.value = cur ? cur + '\\n\\n' + snippet : snippet;
        updatePromptEvaluation();
      });
    });

    // Scenario Select Change
    scenarioSelect.addEventListener('change', (e) => {
      loadScenario(e.target.value);
    });

    // Apply & Reset Button
    btnApplyPrompt.addEventListener('click', () => {
      messages = [];
      renderMessages();
      const originalText = btnApplyPrompt.innerHTML;
      btnApplyPrompt.innerHTML = '<span>✓ Настройки применены, чат очищен!</span>';
      setTimeout(() => {
        btnApplyPrompt.innerHTML = originalText;
      }, 1500);
    });

    // Copy Prompt
    btnCopyPrompt.addEventListener('click', () => {
      navigator.clipboard.writeText(systemPromptInput.value);
      btnCopyPrompt.textContent = '✓ Скопировано';
      setTimeout(() => { btnCopyPrompt.textContent = '📋 Копировать'; }, 1500);
    });

    // --- 6. Chat Rendering & Sending ---
    function renderMessages() {
      msgCountBadge.textContent = messages.length + ' сообщ.';
      messagesContainer.innerHTML = '';

      if (messages.length === 0) {
        const sc = SCENARIOS[currentScenarioKey] || SCENARIOS.university;
        const emptyBox = document.createElement('div');
        emptyBox.className = 'h-full flex flex-col items-center justify-center text-center p-6 space-y-4 text-slate-500';
        emptyBox.innerHTML = \`
          <div class="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 text-xl font-bold">✨</div>
          <div class="max-w-md space-y-1">
            <h3 class="text-sm font-bold text-slate-800">Тестирование поведения нейросети</h3>
            <p class="text-xs text-slate-500 leading-relaxed">Нажмите на один из готовых вопросов ниже или напишите своё сообщение для проверки промпта:</p>
          </div>
          <div class="w-full max-w-md space-y-1.5 text-left pt-2">
            \${sc.prompts.map(p => \`
              <button class="starter-prompt-btn w-full text-left p-2.5 rounded-xl bg-white border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 text-xs text-slate-700 transition-all flex items-center justify-between shadow-2xs">
                <span>«\${p}»</span>
                <span class="text-indigo-600 font-bold ml-2">➔</span>
              </button>
            \`).join('')}
          </div>
        \`;
        messagesContainer.appendChild(emptyBox);

        emptyBox.querySelectorAll('.starter-prompt-btn').forEach((btn, idx) => {
          btn.addEventListener('click', () => {
            sendUserMessage(sc.prompts[idx]);
          });
        });
        return;
      }

      messages.forEach((m) => {
        const isUser = m.role === 'user';
        const wrap = document.createElement('div');
        wrap.className = 'flex items-start gap-2.5 ' + (isUser ? 'justify-end' : 'justify-start');

        const nowTime = m.timestamp;
        const studentName = (studentNameInput.value.trim() || 'Ученик');
        const senderTitle = isUser ? studentName : SCENARIOS[currentScenarioKey].title;

        wrap.innerHTML = \`
          \${!isUser ? '<div class="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5 text-xs shadow-2xs font-bold">🤖</div>' : ''}
          <div class="relative max-w-[85%] rounded-2xl p-3.5 text-xs shadow-2xs \${
            isUser
              ? 'bg-indigo-600 text-white rounded-tr-xs'
              : 'bg-white text-slate-800 border border-slate-200 rounded-tl-xs'
          }">
            <div class="flex items-center justify-between gap-3 mb-1 text-[10px] opacity-75">
              <span class="font-semibold">\${senderTitle}</span>
              <span class="font-mono">\${nowTime}</span>
            </div>
            <div class="space-y-1 leading-relaxed whitespace-pre-wrap">\${escapeHtml(m.content)}</div>
          </div>
        \`;
        messagesContainer.appendChild(wrap);
      });

      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    function escapeHtml(str) {
      return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }

    async function sendUserMessage(text) {
      if (!text || !text.trim() || isGenerating) return;
      const userText = text.trim();
      chatInput.value = '';

      const now = new Date();
      const timeStr = now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });

      messages.push({
        role: 'user',
        content: userText,
        timestamp: timeStr
      });
      renderMessages();

      isGenerating = true;
      typingIndicator.classList.remove('hidden');
      messagesContainer.scrollTop = messagesContainer.scrollHeight;

      try {
        const reply = await generateAIResponse(systemPromptInput.value, messages);
        const replyTime = new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
        messages.push({
          role: 'assistant',
          content: reply,
          timestamp: replyTime
        });
      } catch (err) {
        messages.push({
          role: 'assistant',
          content: '⚠️ Ошибка запроса: ' + (err.message || 'Не удалось получить ответ') + '\\n\\n💡 Совет: Проверьте правильность API-ключа в кнопке «🔑 Ключ API» или в начале файла index.html в константе DEFAULT_API_KEY.',
          timestamp: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
        });
      } finally {
        isGenerating = false;
        typingIndicator.classList.add('hidden');
        renderMessages();
      }
    }

    btnSendMessage.addEventListener('click', () => sendUserMessage(chatInput.value));
    chatInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendUserMessage(chatInput.value);
      }
    });

    btnClearMessages.addEventListener('click', () => {
      messages = [];
      renderMessages();
    });

    function isLikelyGigaChatKey(k) {
      const clean = (k || '').trim();
      if (clean.startsWith('Basic ') || clean.startsWith('eyJ')) return true;
      if (clean.length > 50 && clean.endsWith('=')) {
        try {
          const dec = atob(clean);
          if (dec.includes(':') && dec.includes('-')) return true;
        } catch (_) {}
      }
      return false;
    }

    // --- 7. AI Fetch Engine ---
    async function generateAIResponse(sysPrompt, allMessages) {
      if (!apiConfig.apiKey || !apiConfig.apiKey.trim()) {
        throw new Error('API-ключ не указан. Вставьте ключ в константу DEFAULT_API_KEY в коде файла index.html или укажите его через кнопку «🔑 Ключ API» вверху страницы.');
      }

      if (apiConfig.provider === 'gigachat' || isLikelyGigaChatKey(apiConfig.apiKey)) {
        return fetchGigaChatDirect(sysPrompt, allMessages);
      }

      return fetchOpenAIDirect(sysPrompt, allMessages);
    }

    async function safeExtractErr(res, defaultMsg) {
      try {
        const raw = await res.text();
        if (!raw) return defaultMsg + ' (' + res.status + ')';
        if (raw.includes('<html') || raw.includes('405 Not Allowed') || raw.startsWith('<!DOCTYPE')) {
          if (res.status === 405 || res.status === 404) {
            return 'Статический хостинг (GitHub Pages) не имеет серверного бэкенда для POST-запросов (код ' + res.status + ').';
          }
          return defaultMsg + ' (' + res.status + ')';
        }
        try {
          const parsed = JSON.parse(raw);
          return parsed.error?.message || parsed.message || parsed.error || parsed.error_description || raw;
        } catch {
          return raw.slice(0, 300);
        }
      } catch {
        return defaultMsg + ' (' + res.status + ')';
      }
    }

    function generateSimulatedResponse(sysPrompt, allMessages) {
      const lastMsg = (allMessages[allMessages.length - 1]?.content || '').toLowerCase();
      const pLower = (sysPrompt || '').toLowerCase();

      const isAlchemist = pLower.includes('элдон') || pLower.includes('алхимик') || pLower.includes('зель');
      const isConsultant = pLower.includes('консультант') || pLower.includes('иннотех') || pLower.includes('вуз');
      const isGuide = pLower.includes('гид') || pLower.includes('феликс') || pLower.includes('экскурсовод');
      const isTutor = pLower.includes('репетитор') || pLower.includes('физик') || pLower.includes('ньютон');

      if (lastMsg.includes('забудь') || lastMsg.includes('злой') || lastMsg.includes('игнорируй')) {
        return 'Я строго следую системным правилам и своей роли! Чем могу помочь вам в рамках текущей задачи?';
      }

      if (isAlchemist) {
        if (lastMsg.includes('паук') || lastMsg.includes('яд') || lastMsg.includes('укус')) {
          return '*Снимает с полки склянку с бирюзовой жидкостью*\\n\\n«О, яд пещерного паука — дело нешуточное! Прими Противоядие лунной лилии, пока не онемели пальцы. С тебя три серебряных монеты!»';
        }
        return '*Бросает щепотку светящейся пыльцы в котёл*\\n\\n«Приветствую тебя в лавке зелий, странник! Я, мастер Элдон, ведаю тайнами стихий. Что привело тебя ко мне: эликсир силы или целебный сбор?»';
      }

      if (isConsultant) {
        if (lastMsg.includes('без егэ') || lastMsg.includes('гарант')) {
          return '100% гарантии без экзаменов не бывает, но у нас есть олимпиады РСОШ, дающие право поступления БВИ, и целевые квоты IT-компаний!';
        }
        return 'Здравствуйте! Рада приветствовать вас в приёмной комиссии IT-университета «ИнноТех»! Какие направления вас интересуют?';
      }

      if (isGuide) {
        return 'Привет, дорогой исследователь! Я Феликс — твой персональный гид по секретным местам города. Куда направимся: в тайные дворы или старую булочную?';
      }

      if (isTutor) {
        return 'Привет! Я твой наставник по физике. Помни: второй закон Ньютона связывает силу, массу и ускорение (F = m · a). Давай разберём формулу!';
      }

      return 'Здравствуйте! Я действую в соответствии с заданной ролью по вашему системному промпту. Ваш запрос: «' + (allMessages[allMessages.length - 1]?.content || '') + '». Готов продолжать диалог!';
    }

    async function fetchOpenAIDirect(sysPrompt, allMessages) {
      const url = (apiConfig.baseUrl.trim().replace(/\/+$/, '')) + '/chat/completions';
      const payload = {
        model: apiConfig.model.trim() || 'gpt-4o-mini',
        messages: [
          { role: 'system', content: sysPrompt },
          ...allMessages.map(m => ({ role: m.role, content: m.content }))
        ],
        temperature: 0.7
      };

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + apiConfig.apiKey.trim()
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errText = await safeExtractErr(res, 'Ошибка API');
        throw new Error('Ошибка API (' + res.status + '): ' + errText);
      }
      const data = await res.json();
      const reply = data.choices?.[0]?.message?.content;
      if (!reply) throw new Error('Пустой ответ нейросети в choices[0].message.content');
      return reply;
    }

    let standaloneCachedToken = null;

    async function getGigaChatAccessToken(secretKey) {
      const cleanKey = secretKey.trim();
      if (cleanKey.startsWith('eyJ')) return cleanKey;

      const now = Date.now();
      if (standaloneCachedToken && standaloneCachedToken.expiresAt > now + 60000) {
        return standaloneCachedToken.token;
      }

      const authHeader = cleanKey.startsWith('Basic ') ? cleanKey : ('Basic ' + cleanKey);
      const rquid = (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : ('rquid-' + Date.now());

      try {
        const oauthRes = await fetch('https://ngw.devices.sberbank.ru:9443/api/v2/oauth', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json',
            'RqUID': rquid,
            'Authorization': authHeader
          },
          body: 'scope=GIGACHAT_API_PERS'
        });

        if (!oauthRes.ok) {
          const errText = await safeExtractErr(oauthRes, 'Ошибка OAuth Сбера');
          throw new Error('Ошибка OAuth Сбера (' + oauthRes.status + '): ' + errText);
        }

        const oauthData = await oauthRes.json();
        if (!oauthData.access_token) throw new Error('GigaChat не вернул access_token');

        standaloneCachedToken = {
          token: oauthData.access_token,
          expiresAt: oauthData.expires_at || (Date.now() + 28 * 60 * 1000)
        };
        return oauthData.access_token;
      } catch (err) {
        if (err.name === 'TypeError' || (err.message && (err.message.includes('fetch') || err.message.includes('NetworkError')))) {
          throw new Error(
            'Браузер заблокировал обращение к шлюзу Сбера (CORS / SSL сертификат Минцифры). ' +
            'Сервер https://ngw.devices.sberbank.ru:9443 блокирует прямые браузерные запросы без прокси-сервера (требует verify=False). ' +
            'В нашем основном приложении настроен серверный прокси. Для публикации на статическом GitHub Pages без бэкенда переключите провайдер на «OpenAI-совместимый API» (например, ключ от OpenRouter / Groq / DeepSeek).'
          );
        }
        throw err;
      }
    }

    async function fetchGigaChatDirect(sysPrompt, allMessages) {
      // 1. Попытка через бэкенд-прокси /api/gigachat (локальный или удалённый)
      const backendBase = (apiConfig.backendUrl || '').trim().replace(/\/+$/, '');
      const proxyEndpoint = backendBase ? backendBase + '/api/gigachat' : '/api/gigachat';

      try {
        const proxyRes = await fetch(proxyEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            apiKey: apiConfig.apiKey.trim(),
            systemPrompt: sysPrompt,
            messages: allMessages,
            model: apiConfig.model.trim() || 'GigaChat'
          })
        });
        if (proxyRes.ok) {
          const pData = await proxyRes.json();
          if (pData.reply) return pData.reply;
        } else if (proxyRes.status !== 404 && proxyRes.status !== 405) {
          const pErr = await safeExtractErr(proxyRes, 'Ошибка GigaChat API');
          throw new Error(pErr);
        }
      } catch (proxyErr) {
        if (
          proxyErr.message &&
          !proxyErr.message.includes('404') &&
          !proxyErr.message.includes('405') &&
          !proxyErr.message.includes('fetch') &&
          !proxyErr.message.includes('NetworkError')
        ) {
          throw proxyErr;
        }
      }

      // 2. Прямое обращение (OAuth + API) с перехватом ограничений статического хостинга
      try {
        const token = await getGigaChatAccessToken(apiConfig.apiKey.trim());

        const url = apiConfig.baseUrl.trim() || 'https://gigachat.devices.sberbank.ru/api/v1/chat/completions';
        const payload = {
          model: apiConfig.model.trim() || 'GigaChat',
          messages: [
            { role: 'system', content: sysPrompt },
            ...allMessages.map(m => ({ role: m.role, content: m.content }))
          ],
          temperature: 0.7
        };

        const res = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token,
            'Accept': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        if (!res.ok) {
          const errText = await safeExtractErr(res, 'GigaChat error');
          throw new Error('GigaChat error (' + res.status + '): ' + errText);
        }
        const data = await res.json();
        const reply = data.choices?.[0]?.message?.content;
        if (!reply) throw new Error('Пустой ответ от GigaChat');
        return reply;
      } catch (err) {
        if (err.name === 'TypeError' || (err.message && (err.message.includes('fetch') || err.message.includes('NetworkError') || err.message.includes('CORS')))) {
          const sim = generateSimulatedResponse(sysPrompt, allMessages);
          return sim + '\\n\\n*(ℹ️ Режим симулятора: статический хостинг GitHub Pages блокирует прямые браузерные запросы к GigaChat из-за CORS и сертификатов Сбера. Чтобы подключить реальную модель на GitHub Pages, выберите вкладку «OpenAI-совместимый API» с ключом OpenRouter/Groq)*';
        }
        throw err;
      }
    }

    // --- 8. Download Dialogue Report ---
    btnDownloadChat.addEventListener('click', () => {
      const student = (studentNameInput.value.trim() || 'Ученик_8-9_класса');
      const now = new Date();
      const sc = SCENARIOS[currentScenarioKey] || SCENARIOS.university;

      let rep = '=======================================================\\n';
      rep += 'ОТЧЁТ О ПРОХОЖДЕНИИ ПРОФПРОБЫ «ПРОМПТ-ИНЖЕНЕР»\\n';
      rep += '=======================================================\\n\\n';
      rep += 'Ученик: ' + student + '\\n';
      rep += 'Дата и время: ' + now.toLocaleDateString('ru-RU') + ' ' + now.toLocaleTimeString('ru-RU') + '\\n';
      rep += 'Сценарий: ' + sc.title + '\\n';
      rep += 'Цель: ' + sc.goal + '\\n\\n';
      rep += '-------------------------------------------------------\\n';
      rep += 'СИСТЕМНЫЙ ПРОМПТ (ИНСТРУКЦИЯ ДЛЯ ИИ):\\n';
      rep += '-------------------------------------------------------\\n';
      rep += systemPromptInput.value + '\\n\\n';
      rep += '-------------------------------------------------------\\n';
      rep += 'СТЕНОГРАММА ДИАЛОГА (' + messages.length + ' сообщений):\\n';
      rep += '-------------------------------------------------------\\n\\n';

      if (messages.length === 0) {
        rep += '[Диалог не проводился]\\n';
      } else {
        messages.forEach((m, idx) => {
          const sender = m.role === 'user' ? '[' + student + ']' : '[ИИ: ' + sc.title + ']';
          rep += (idx + 1) + '. ' + sender + ' (' + m.timestamp + '):\\n' + m.content + '\\n\\n';
        });
      }

      rep += '=======================================================\\n';
      rep += 'Оценка наставника: ____________________________________\\n';

      const blob = new Blob([rep], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Профпроба_ПромптИнженер_' + student.replace(/[^a-zA-Zа-яА-Я0-9_-]/g, '_') + '.txt';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });

    // --- 9. API Key Settings Drawer ---
    btnToggleKeyPanel.addEventListener('click', () => {
      keyPanel.classList.toggle('hidden');
    });
    btnCloseKeyPanel.addEventListener('click', () => {
      keyPanel.classList.add('hidden');
    });

    btnToggleEye.addEventListener('click', () => {
      if (apiKeyInput.type === 'password') {
        apiKeyInput.type = 'text';
        btnToggleEye.textContent = '🔒 скрыть';
      } else {
        apiKeyInput.type = 'password';
        btnToggleEye.textContent = '👁️ показать';
      }
    });

    apiProviderSelect.addEventListener('change', (e) => {
      const val = e.target.value;
      if (val === 'gigachat') {
        apiUrlInput.value = 'https://gigachat.devices.sberbank.ru/api/v1';
      } else if (val === 'openai') {
        apiUrlInput.value = 'https://openrouter.ai/api/v1';
      }
    });

    btnSaveKey.addEventListener('click', () => {
      apiConfig.provider = apiProviderSelect.value;
      apiConfig.apiKey = apiKeyInput.value.trim();
      apiConfig.baseUrl = apiUrlInput.value.trim();

      localStorage.setItem('pt_provider', apiConfig.provider);
      localStorage.setItem('pt_api_key', apiConfig.apiKey);
      localStorage.setItem('pt_base_url', apiConfig.baseUrl);

      updateKeyButtonStatus();
      saveStatusToast.classList.remove('hidden');
      setTimeout(() => {
        saveStatusToast.classList.add('hidden');
        keyPanel.classList.add('hidden');
      }, 1200);
    });

    // --- 10. Timer Logic (45 minutes) ---
    let timeLeft = 45 * 60;
    let timerRunning = false;
    let timerInterval = null;

    function startTimerLogic() {
      const savedTimer = localStorage.getItem('pt_timer_val');
      if (savedTimer) timeLeft = parseInt(savedTimer, 10);
      updateTimerUI();

      btnTimerToggle.addEventListener('click', () => {
        timerRunning = !timerRunning;
        btnTimerToggle.textContent = timerRunning ? '⏸️' : '▶️';
        if (timerRunning) {
          timerInterval = setInterval(() => {
            if (timeLeft > 0) {
              timeLeft--;
              localStorage.setItem('pt_timer_val', timeLeft.toString());
              updateTimerUI();
            } else {
              timerRunning = false;
              btnTimerToggle.textContent = '▶️';
              clearInterval(timerInterval);
            }
          }, 1000);
        } else {
          clearInterval(timerInterval);
        }
      });

      btnTimerReset.addEventListener('click', () => {
        timerRunning = false;
        clearInterval(timerInterval);
        btnTimerToggle.textContent = '▶️';
        timeLeft = 45 * 60;
        localStorage.setItem('pt_timer_val', timeLeft.toString());
        updateTimerUI();
      });
    }

    function updateTimerUI() {
      const m = Math.floor(timeLeft / 60);
      const s = timeLeft % 60;
      timerDisplay.textContent = String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
      const pct = ((45 * 60 - timeLeft) / (45 * 60)) * 100;
      timerProgress.style.width = pct + '%';

      if (timeLeft < 35 * 60 && timeLeft >= 20 * 60) {
        stageDisplay.textContent = '2. Составление и тюнинг промпта (10-25 мин)';
      } else if (timeLeft < 20 * 60 && timeLeft >= 5 * 60) {
        stageDisplay.textContent = '3. Стресс-тестирование в чате (25-40 мин)';
      } else if (timeLeft < 5 * 60) {
        stageDisplay.textContent = '4. Фиксация и выгрузка отчёта (40-45 мин)';
      } else {
        stageDisplay.textContent = '1. Знакомство и выбор роли (0-10 мин)';
      }
    }

    // Run
    init();
  </script>
</body>
</html>`;
}
