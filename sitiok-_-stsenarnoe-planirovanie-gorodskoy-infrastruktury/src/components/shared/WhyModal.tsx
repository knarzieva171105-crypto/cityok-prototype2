import React from 'react';
import { CellValueExplanation } from '../../types/model';
import { X, HelpCircle, CheckCircle2, AlertTriangle, FileCode } from 'lucide-react';

interface WhyModalProps {
  explanation: CellValueExplanation | null;
  onClose: () => void;
}

export const WhyModal: React.FC<WhyModalProps> = ({ explanation, onClose }) => {
  if (!explanation) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-6 text-slate-100">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                  {explanation.cell}
                </span>
                <h3 className="font-bold text-sm text-white">{explanation.name}</h3>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Обоснование расчёта и происхождение формулы Excel
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="mt-4 space-y-4 text-xs">
          
          {/* Result Block */}
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
            <span className="text-slate-400 font-medium">Текущее значение:</span>
            <div className="flex items-baseline gap-1.5 font-mono">
              <span className="text-xl font-extrabold text-white">
                {explanation.formattedValue}
              </span>
            </div>
          </div>

          {/* Formula */}
          <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-800 space-y-2 font-mono">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1 font-sans">
                <FileCode className="w-3.5 h-3.5 text-amber-400" />
                Формула ячейки в книге Excel:
              </span>
              <span className="text-slate-500 font-sans">Лист1</span>
            </div>
            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-amber-300 font-bold text-sm">
              ={explanation.formula}
            </div>
            <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800">
              Подставленные параметры: <strong className="text-slate-200">{explanation.formulaWithValues}</strong>
            </div>
          </div>

          {/* Benchmark check if exists */}
          {explanation.benchmark && (
            <div
              className={`p-3 rounded-xl border flex items-start gap-2.5 ${
                explanation.benchmark.status === 'compliant'
                  ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200'
                  : 'bg-rose-950/20 border-rose-500/30 text-rose-200'
              }`}
            >
              {explanation.benchmark.status === 'compliant' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              )}
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold">{explanation.benchmark.statusLabel}</span>
                  <span className="text-[10px] opacity-75 font-mono">
                    (Ориентир: {explanation.benchmark.operator} {explanation.benchmark.targetValue} {explanation.benchmark.unit})
                  </span>
                </div>
                <p className="text-[11px] opacity-90">{explanation.benchmark.notes}</p>
                <p className="text-[10px] text-slate-400 italic">
                  Статус: {explanation.benchmark.legalStatus} · {explanation.benchmark.source}
                </p>
              </div>
            </div>
          )}

          {/* Assumptions */}
          {explanation.assumptions.length > 0 && (
            <div className="space-y-1.5">
              <span className="font-bold text-slate-300 uppercase tracking-wider text-[10px] block">
                Допущения и методические комментарии:
              </span>
              <ul className="list-disc list-inside space-y-1 text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                {explanation.assumptions.map((ass, i) => (
                  <li key={i} className="leading-relaxed">
                    {ass}
                  </li>
                ))}
              </ul>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="mt-5 pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
          >
            Закрыть
          </button>
        </div>

      </div>
    </div>
  );
};
