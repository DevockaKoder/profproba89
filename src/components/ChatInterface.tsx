import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Download,
  Bot,
  User,
  Trash2,
  Sparkles,
  HelpCircle,
  Copy,
  Check,
  FileCheck,
  FlaskConical,
  Lightbulb,
  PenLine,
  Target,
  X,
} from 'lucide-react';
import { ChatMessage, Scenario, TestQuestion } from '../types';
import { normalizeTestQuestion } from '../data/scenarios';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  isLoading: boolean;
  onSendMessage: (text: string) => void;
  onClearChat: () => void;
  selectedScenario: Scenario;
  systemPrompt: string;
  customBotName?: string;
}

export function ChatInterface({
  messages,
  isLoading,
  onSendMessage,
  onClearChat,
  selectedScenario,
  systemPrompt,
  customBotName,
}: ChatInterfaceProps) {
  const [inputText, setInputText] = useState('');
  const [studentName, setStudentName] = useState(() => {
    return localStorage.getItem('prompt_trainer_student_name') || '';
  });
  const [activeTest, setActiveTest] = useState<TestQuestion | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const effectiveRoleName =
    selectedScenario.id === 'custom-scenario' && customBotName?.trim()
      ? customBotName.trim()
      : selectedScenario.title;

  useEffect(() => {
    setActiveTest(null);
  }, [selectedScenario.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = () => {
    if (!inputText.trim() || isLoading) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleDownloadDialog = () => {
    const defaultName = studentName.trim() || 'Ученик';
    const now = new Date();
    const dateStr = now.toLocaleDateString('ru-RU');
    const timeStr = now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });

    let report = `=======================================================\n`;
    report += `ОТЧЁТ ПО ПРОФПРОБЕ «ПРОМПТ-ИНЖЕНЕР» (8–9 КЛАСС)\n`;
    report += `=======================================================\n\n`;
    report += `Ученик: ${defaultName}\n`;
    report += `Дата и время проведения: ${dateStr} ${timeStr}\n`;
    report += `Выбранный сценарий: ${effectiveRoleName} (${selectedScenario.category})\n`;
    report += `Цель роли: ${selectedScenario.taskGoal}\n\n`;
    report += `-------------------------------------------------------\n`;
    report += `СИСТЕМНЫЙ ПРОМПТ (ИНСТРУКЦИЯ ДЛЯ НЕЙРОСЕТИ):\n`;
    report += `-------------------------------------------------------\n`;
    report += `${systemPrompt}\n\n`;
    report += `-------------------------------------------------------\n`;
    report += `СТЕНОГРАММА ДИАЛОГА ТЕСТИРОВАНИЯ (${messages.length} реплик):\n`;
    report += `-------------------------------------------------------\n\n`;

    if (messages.length === 0) {
      report += `[Тестирование не проводилось / сообщения отсутствуют]\n`;
    } else {
      messages.forEach((m, idx) => {
        const sender = m.role === 'user' ? `[${defaultName}]` : `[ИИ: ${effectiveRoleName}]`;
        report += `${idx + 1}. ${sender} (${m.timestamp}):\n${m.content}\n\n`;
      });
    }

    report += `=======================================================\n`;
    report += `Подпись наставника / Оценка: ___________________________\n`;
    report += `=======================================================\n`;

    const blob = new Blob([report], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const safeName = defaultName.replace(/[^a-zA-Zа-яА-Я0-9_-]/g, '_');
    link.href = url;
    link.download = `Профпроба_ПромптИнженер_${safeName}_${now.toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const formatMessageText = (content: string) => {
    // Simple markdown-like formatter for bullet points and bold text
    const lines = content.split('\n');
    return lines.map((line, lineIndex) => {
      // Bold text replacement
      const parts = line.split(/(\*\*.*?\*\*)/g);
      const formattedParts = parts.map((part, pIdx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <strong key={pIdx} className="font-bold">
              {part.slice(2, -2)}
            </strong>
          );
        }
        return part;
      });

      return (
        <p key={lineIndex} className={line === '' ? 'h-2' : 'leading-relaxed'}>
          {formattedParts}
        </p>
      );
    });
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Right Column Header */}
      <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/70 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900">
                Интерактивный диалог
              </h2>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                {messages.length} сообщ.
              </span>
            </div>
            <p className="text-xs text-slate-500 truncate max-w-[240px]">
              Роль: <span className="text-indigo-600 font-medium">{effectiveRoleName}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="btn-clear-chat"
            onClick={onClearChat}
            disabled={messages.length === 0}
            className="flex items-center gap-1 text-xs text-slate-500 hover:text-rose-600 disabled:opacity-40 disabled:hover:text-slate-500 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:border-rose-200 bg-white transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Очистить</span>
          </button>

          <button
            id="btn-download-dialog"
            onClick={handleDownloadDialog}
            className="flex items-center gap-1 text-xs font-bold text-slate-800 hover:text-indigo-600 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-indigo-300 bg-white transition-colors shadow-2xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Скачать диалог</span>
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4 bg-slate-50/30">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4 text-slate-500">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Sparkles className="w-7 h-7" />
            </div>
            <div className="max-w-md space-y-1.5">
              <h3 className="text-sm font-bold text-slate-800">
                Тестирование поведения нейросети
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Нажмите на один из готовых вопросов ниже или напишите своё сообщение, чтобы
                проверить, как ИИ справляется с ролью «{effectiveRoleName}».
              </p>
            </div>

            {/* Quick Starter Suggestions */}
            <div className="w-full max-w-lg pt-2 space-y-2 text-left">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Стартовые реплики для проверки:
              </span>
              <div className="space-y-1.5">
                {selectedScenario.suggestedPrompts.map((promptText, idx) => (
                  <button
                    key={idx}
                    onClick={() => onSendMessage(promptText)}
                    className="w-full text-left p-2.5 rounded-xl bg-white border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 text-xs text-slate-700 transition-all flex items-center justify-between group shadow-2xs"
                  >
                    <span>«{promptText}»</span>
                    <Send className="w-3 h-3 text-slate-400 group-hover:text-indigo-600 shrink-0 ml-2" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          messages.map((m) => {
            const isUser = m.role === 'user';
            return (
              <div
                key={m.id}
                className={`flex items-start gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5 text-xs shadow-2xs">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`relative max-w-[85%] rounded-2xl p-3.5 text-xs shadow-2xs ${
                    isUser
                      ? 'bg-indigo-600 text-white rounded-tr-xs'
                      : 'bg-white text-slate-800 border border-slate-200 rounded-tl-xs'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3 mb-1 text-[10px] opacity-75">
                    <span className="font-semibold">
                      {isUser ? studentName.trim() || 'Пользователь' : effectiveRoleName}
                    </span>
                    <span className="font-mono">{m.timestamp}</span>
                  </div>

                  <div className="space-y-1 text-xs">
                    {formatMessageText(m.content)}
                  </div>

                  {!isUser && (
                    <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-end">
                      <button
                        onClick={() => handleCopyMessage(m.id, m.content)}
                        className="text-[10px] text-slate-400 hover:text-slate-700 flex items-center gap-1 transition-colors"
                      >
                        {copiedId === m.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span className="text-emerald-600">Скопировано</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Копировать</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="w-7 h-7 rounded-lg bg-slate-800 text-white flex items-center justify-center shrink-0 mt-0.5 text-xs shadow-2xs">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* Typing Status Indicator */}
        {isLoading && (
          <div className="flex items-center gap-2.5 justify-start animate-in fade-in">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 text-xs shadow-2xs">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-xs px-4 py-2.5 text-xs text-slate-600 shadow-2xs flex items-center gap-2">
              <span className="font-medium">ИИ печатает...</span>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Test Tasks Bar */}
      {selectedScenario.testQuestions.length > 0 && (
        <div className="px-3 sm:px-4 py-2 bg-slate-100/80 border-t border-slate-200 overflow-x-auto flex items-center gap-2 text-[11px]">
          <span className="text-slate-600 shrink-0 font-semibold flex items-center gap-1.5">
            <FlaskConical className="w-3.5 h-3.5 text-indigo-600" />
            Задания для проверки бота:
          </span>
          {selectedScenario.testQuestions.map((rawQ, idx) => {
            const q = normalizeTestQuestion(rawQ);
            const isActive = activeTest?.task === q.task;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveTest(isActive ? null : q)}
                className={`px-2.5 py-1 rounded-lg whitespace-nowrap transition-all flex items-center gap-1.5 border text-xs cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs font-medium'
                    : 'bg-white hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 border-slate-200'
                }`}
              >
                <span>{q.task}</span>
                <HelpCircle className={`w-3 h-3 ${isActive ? 'text-indigo-200' : 'text-slate-400'}`} />
              </button>
            );
          })}
        </div>
      )}

      {/* Interactive Prompt Coaching Banner */}
      {activeTest && (
        <div className="px-3 sm:px-4 pt-2.5 pb-2 bg-indigo-50/70 border-t border-indigo-200/80 text-xs space-y-2 animate-in fade-in slide-in-from-bottom-1">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-1.5 font-semibold text-indigo-950">
              <Target className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>Цель проверки бота:</span>
              <span className="text-indigo-700 font-medium">«{activeTest.task}»</span>
            </div>
            <button
              type="button"
              onClick={() => setActiveTest(null)}
              className="text-slate-400 hover:text-slate-600 p-0.5 rounded transition-colors cursor-pointer"
              title="Закрыть подсказку"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-start gap-2 text-slate-700 bg-white/90 p-2.5 rounded-lg border border-indigo-100 leading-relaxed shadow-2xs">
            <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <div className="space-y-1 w-full">
              <div>
                <strong className="text-slate-900">Подсказка ученику (как сформулировать запрос): </strong>
                <span>{activeTest.hint}</span>
              </div>
              <div className="text-[11px] text-slate-500 pt-0.5 border-t border-slate-100 mt-1">
                <span className="font-semibold text-slate-700">Пример нормального запроса к боту: </span>
                <span className="italic text-indigo-900 font-medium">«{activeTest.sampleQuery}»</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-0.5">
            <button
              type="button"
              onClick={() => {
                setInputText(activeTest.sampleQuery);
                if (inputRef.current) {
                  inputRef.current.focus();
                  inputRef.current.setSelectionRange(activeTest.sampleQuery.length, activeTest.sampleQuery.length);
                }
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-medium transition-colors shadow-2xs cursor-pointer"
            >
              <PenLine className="w-3.5 h-3.5" />
              <span>Вставить пример в поле ввода</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onSendMessage(activeTest.sampleQuery);
                setActiveTest(null);
              }}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-xs font-medium transition-colors shadow-2xs cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Отправить сразу</span>
            </button>
          </div>
        </div>
      )}

      {/* Input Bar */}
      <div className="p-3 sm:p-4 border-t border-slate-200 bg-white">
        {/* Optional Student Name Tag */}
        <div className="flex items-center gap-2 mb-2">
          <label className="text-[11px] text-slate-400 font-medium shrink-0">
            Имя ученика для отчёта:
          </label>
          <input
            id="input-student-name"
            type="text"
            value={studentName}
            onChange={(e) => {
              setStudentName(e.target.value);
              localStorage.setItem('prompt_trainer_student_name', e.target.value);
            }}
            placeholder="Например: Артём Смирнов (9Б)"
            className="text-xs px-2 py-0.5 rounded-md border border-slate-200 text-slate-700 focus:outline-none focus:border-indigo-500 max-w-[200px]"
          />
        </div>

        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            id="input-chat-message"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Напишите реплику для ИИ (Enter — отправить, Shift+Enter — перенос строки)..."
            rows={2}
            className="flex-1 p-3 text-xs text-slate-800 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none leading-relaxed"
          />

          <button
            id="btn-send-message"
            onClick={handleSend}
            disabled={!inputText.trim() || isLoading}
            className="px-4 py-3 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl font-semibold text-xs flex items-center gap-1.5 shadow-xs transition-colors shrink-0"
          >
            <span>Отправить</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
