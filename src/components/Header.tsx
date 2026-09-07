import { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Key,
  Download,
  Terminal,
  Clock,
} from 'lucide-react';
import { ApiSettings } from '../types';

interface HeaderProps {
  apiSettings: ApiSettings;
  onOpenApiConfig: () => void;
  onDownloadStandalone: () => void;
}

export function Header({
  apiSettings,
  onOpenApiConfig,
  onDownloadStandalone,
}: HeaderProps) {
  // 45-minute lesson timer (2700 seconds)
  const TOTAL_TIME = 45 * 60;
  const [timeLeft, setTimeLeft] = useState<number>(() => {
    const saved = localStorage.getItem('prompt_trainer_timer');
    return saved ? parseInt(saved, 10) : TOTAL_TIME;
  });
  const [isRunning, setIsRunning] = useState<boolean>(false);

  useEffect(() => {
    localStorage.setItem('prompt_trainer_timer', timeLeft.toString());
  }, [timeLeft]);

  useEffect(() => {
    let interval: any = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => Math.max(0, prev - 1));
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const toggleTimer = () => setIsRunning(!isRunning);
  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(TOTAL_TIME);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const progressPercent = ((TOTAL_TIME - timeLeft) / TOTAL_TIME) * 100;

  // Lesson stage
  let stageLabel = '1. Выбор роли и знакомство (0-10 мин)';
  if (timeLeft < 35 * 60 && timeLeft >= 20 * 60) {
    stageLabel = '2. Составление и тюнинг промпта (10-25 мин)';
  } else if (timeLeft < 20 * 60 && timeLeft >= 5 * 60) {
    stageLabel = '3. Стресс-тестирование в чате (25-40 мин)';
  } else if (timeLeft < 5 * 60) {
    stageLabel = '4. Фиксация и выгрузка отчёта (40-45 мин)';
  }

  const isConfigured = Boolean(apiSettings.apiKey && apiSettings.apiKey.trim());

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between py-3 gap-3">
          
          {/* Logo & Main Title */}
          <div className="flex items-center gap-3 self-start md:self-auto">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-xs">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-slate-900 leading-tight">
                  Тренажёр «Промпт-инженер»
                </h1>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Профпроба 8–9 класс
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Практикум разработки системных промптов и тестирования поведения нейросетей
              </p>
            </div>
          </div>

          {/* 45-Minute Lesson Timer */}
          <div className="flex items-center gap-3 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-sm">
            <div className="flex items-center gap-1.5 text-slate-700 font-medium">
              <Clock className="w-4 h-4 text-indigo-600" />
              <span className={`font-mono text-base font-bold ${timeLeft <= 300 ? 'text-amber-600 animate-pulse' : 'text-slate-900'}`}>
                {formattedTime}
              </span>
            </div>

            <div className="hidden lg:flex flex-col text-[11px] text-slate-500 leading-tight">
              <span className="font-semibold text-slate-700">Этап занятия:</span>
              <span className="truncate max-w-[190px]">{stageLabel}</span>
            </div>

            <div className="flex items-center gap-1 pl-1 border-l border-slate-200">
              <button
                id="btn-timer-toggle"
                onClick={toggleTimer}
                title={isRunning ? 'Приостановить таймер' : 'Запустить таймер занятия'}
                className="p-1 rounded-md text-slate-600 hover:text-indigo-600 hover:bg-white transition-colors"
              >
                {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>
              <button
                id="btn-timer-reset"
                onClick={resetTimer}
                title="Сбросить на 45 минут"
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-white transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap self-end md:self-auto">
            {/* API Config Button */}
            <button
              id="btn-open-api-config"
              onClick={onOpenApiConfig}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                isConfigured
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                  : 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
              }`}
            >
              <Key className="w-3.5 h-3.5" />
              <span>
                {isConfigured
                  ? `${apiSettings.provider === 'gigachat' ? 'GigaChat' : 'API'} (Подключен)`
                  : 'Ключ API'}
              </span>
              <span className={`w-2 h-2 rounded-full ${isConfigured ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            </button>

            {/* Download Standalone HTML Button */}
            <button
              id="btn-download-standalone"
              onClick={onDownloadStandalone}
              title="Скачать автономный файл index.html"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Скачать index.html</span>
            </button>
          </div>

        </div>
      </div>

      {/* Thin Timer Progress Line */}
      <div className="w-full bg-slate-100 h-0.5">
        <div
          className="bg-indigo-600 h-0.5 transition-all duration-1000"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </header>
  );
}
