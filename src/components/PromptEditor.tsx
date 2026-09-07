import { useState } from 'react';
import {
  Sparkles,
  RefreshCw,
  Sliders,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ChevronDown,
  GraduationCap,
  MapPin,
  Sword,
  Atom,
  ShieldAlert,
  FileText,
  Copy,
  Check,
} from 'lucide-react';
import { Scenario } from '../types';
import { SCENARIOS, PROMPT_FORMULA_TIPS } from '../data/scenarios';
import { evaluatePrompt } from '../services/aiService';

interface PromptEditorProps {
  selectedScenario: Scenario;
  onSelectScenario: (scenario: Scenario) => void;
  systemPrompt: string;
  onChangePrompt: (prompt: string) => void;
  onApplyAndResetChat: () => void;
  customBotName: string;
  onChangeCustomBotName: (name: string) => void;
}

export function PromptEditor({
  selectedScenario,
  onSelectScenario,
  systemPrompt,
  onChangePrompt,
  onApplyAndResetChat,
  customBotName,
  onChangeCustomBotName,
}: PromptEditorProps) {
  const [copied, setCopied] = useState(false);
  const [appliedNotification, setAppliedNotification] = useState(false);

  const evaluation = evaluatePrompt(systemPrompt);

  const wordCount = systemPrompt.trim() ? systemPrompt.trim().split(/\s+/).length : 0;
  const charCount = systemPrompt.length;

  const handleApply = () => {
    onApplyAndResetChat();
    setAppliedNotification(true);
    setTimeout(() => setAppliedNotification(false), 2000);
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(systemPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleInsertSnippet = (text: string) => {
    const updated = systemPrompt ? `${systemPrompt.trim()}\n\n${text}` : text;
    onChangePrompt(updated);
  };

  const renderScenarioIcon = (iconName: string) => {
    switch (iconName) {
      case 'GraduationCap':
        return <GraduationCap className="w-4 h-4 text-indigo-600" />;
      case 'MapPin':
        return <MapPin className="w-4 h-4 text-emerald-600" />;
      case 'Sword':
        return <Sword className="w-4 h-4 text-amber-600" />;
      case 'Atom':
        return <Atom className="w-4 h-4 text-blue-600" />;
      case 'ShieldAlert':
        return <ShieldAlert className="w-4 h-4 text-rose-600" />;
      default:
        return <Sparkles className="w-4 h-4 text-purple-600" />;
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Header of Left Column */}
      <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/70">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-100 text-indigo-700">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Панель Промпт-Инженера
              </h2>
              <p className="text-xs text-slate-500">
                Формулирование системных правил и роли ИИ
              </p>
            </div>
          </div>
          <button
            onClick={handleCopyPrompt}
            title="Скопировать системный промпт"
            className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 px-2 py-1 rounded-md hover:bg-slate-200/60 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Скопировано' : 'Копировать'}</span>
          </button>
        </div>

        {/* Scenario Dropdown */}
        <div className="space-y-1.5">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Готовый сценарий-шаблон:
          </label>
          <div className="relative">
            <select
              id="select-scenario"
              value={selectedScenario.id}
              onChange={(e) => {
                const found = SCENARIOS.find((s) => s.id === e.target.value);
                if (found) {
                  onSelectScenario(found);
                }
              }}
              className="w-full appearance-none bg-white border border-slate-300 hover:border-slate-400 rounded-xl px-3.5 py-2.5 pr-10 text-xs font-semibold text-slate-800 shadow-2xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
            >
              {SCENARIOS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.id === 'custom-scenario' && customBotName.trim()
                    ? `✨ ${customBotName.trim()} (Свой персонаж)`
                    : `${s.title} (${s.category})`}
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-3 pointer-events-none text-slate-400">
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Custom Bot Name Input when custom scenario is selected */}
        {selectedScenario.id === 'custom-scenario' && (
          <div className="mt-3 p-3.5 bg-gradient-to-br from-purple-50 to-indigo-50/60 border border-purple-200 rounded-xl shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <label
                htmlFor="input-custom-bot-name"
                className="text-xs font-bold text-purple-950 flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                <span>Название вашего бота (имя персонажа):</span>
              </label>
              {customBotName.trim() && (
                <span className="text-[10px] font-semibold text-purple-700 bg-purple-100/90 px-2 py-0.5 rounded-full">
                  Задано
                </span>
              )}
            </div>
            <input
              id="input-custom-bot-name"
              type="text"
              value={customBotName}
              onChange={(e) => onChangeCustomBotName(e.target.value)}
              placeholder="Например: Шеф-повар Марио, Космический пилот..."
              className="w-full px-3 py-2 text-xs font-semibold bg-white border border-purple-300 rounded-lg text-slate-900 placeholder:text-slate-400 placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 shadow-2xs"
            />
            <p className="text-[11px] text-purple-700 leading-snug">
              💡 Это название будет отображаться в заголовке диалога (<span className="font-semibold text-purple-900">«Роль: {customBotName.trim() || 'Свой уникальный персонаж'}»</span>), в сообщениях бота и в итоговом отчёте.
            </p>
          </div>
        )}

        {/* Task Objective Banner */}
        <div className="mt-3 p-3 bg-white border border-slate-200 rounded-xl text-xs space-y-1 shadow-2xs">
          <div className="flex items-center gap-1.5 font-bold text-slate-900">
            {renderScenarioIcon(selectedScenario.icon)}
            <span>
              {selectedScenario.id === 'custom-scenario' && customBotName.trim()
                ? `Цель роли «${customBotName.trim()}»:`
                : 'Цель профпробы:'}
            </span>
          </div>
          <p className="text-slate-600 leading-relaxed text-[11px]">
            {selectedScenario.taskGoal}
          </p>
        </div>
      </div>

      {/* Editor Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col space-y-3 overflow-y-auto">
        {/* Quick Insert Snippets (Prompt Formula) */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
              <span>Конструктор формулы промпта</span>
              <span className="text-slate-400 font-normal lowercase">(кликните для вставки):</span>
            </label>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {PROMPT_FORMULA_TIPS.map((tip, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleInsertSnippet(tip.text)}
                className="px-2 py-1 text-[10px] font-medium bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 text-slate-700 rounded-lg border border-slate-200 transition-colors"
              >
                + {tip.label}
              </button>
            ))}
          </div>
        </div>

        {/* System Prompt Textarea */}
        <div className="flex-1 flex flex-col min-h-[220px]">
          <div className="flex items-center justify-between mb-1">
            <label
              htmlFor="textarea-system-prompt"
              className="text-xs font-bold text-slate-700 flex items-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5 text-indigo-600" />
              <span>Системный промпт (Инструкции для ИИ)</span>
            </label>
            <span className="text-[11px] text-slate-400 font-mono">
              {wordCount} слов · {charCount} симв.
            </span>
          </div>
          <textarea
            id="textarea-system-prompt"
            value={systemPrompt}
            onChange={(e) => onChangePrompt(e.target.value)}
            placeholder="Введите системный промпт для нейросети (роль, контекст, ограничения, формат ответа)..."
            rows={12}
            className="w-full flex-1 p-3.5 text-xs text-slate-800 bg-slate-50/50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono leading-relaxed resize-none shadow-inner"
          />
        </div>

        {/* Evaluation Checklist */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800">
              Чек-лист качества промпта:
            </span>
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                evaluation.score >= 80
                  ? 'bg-emerald-100 text-emerald-800'
                  : evaluation.score >= 40
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-slate-200 text-slate-700'
              }`}
            >
              {evaluation.score} / 100 баллов
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-[11px]">
            <div className={`flex items-center gap-1 ${evaluation.hasRole ? 'text-emerald-700 font-semibold' : 'text-slate-400'}`}>
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span>Роль задана</span>
            </div>
            <div className={`flex items-center gap-1 ${evaluation.hasContext ? 'text-emerald-700 font-semibold' : 'text-slate-400'}`}>
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span>Контекст</span>
            </div>
            <div className={`flex items-center gap-1 ${evaluation.hasTask ? 'text-emerald-700 font-semibold' : 'text-slate-400'}`}>
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span>Цель/Задача</span>
            </div>
            <div className={`flex items-center gap-1 ${evaluation.hasRestrictions ? 'text-emerald-700 font-semibold' : 'text-slate-400'}`}>
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span>Ограничения</span>
            </div>
            <div className={`flex items-center gap-1 ${evaluation.hasFormat ? 'text-emerald-700 font-semibold' : 'text-slate-400'}`}>
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span>Стиль и формат</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="p-4 border-t border-slate-200 bg-slate-50">
        <button
          id="btn-apply-settings"
          type="button"
          onClick={handleApply}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl shadow-xs transition-all"
        >
          <RefreshCw className={`w-4 h-4 ${appliedNotification ? 'animate-spin' : ''}`} />
          <span>Применить настройки и очистить чат</span>
        </button>
        {appliedNotification && (
          <p className="text-center text-[11px] text-emerald-600 font-semibold mt-1.5 animate-in fade-in">
            Промпт применён! Чат очищен для нового тестирования.
          </p>
        )}
      </div>
    </div>
  );
}
