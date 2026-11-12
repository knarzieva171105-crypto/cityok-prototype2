import React, { useState } from 'react';
import { ModelInputs, ModelOutputs, CellValueExplanation } from '../../types/model';
import {
  TableProperties,
  HelpCircle,
  CheckCircle2,
  AlertTriangle,
  Info,
  Eye,
  FileCode,
} from 'lucide-react';

interface TepTableSectionProps {
  inputs: ModelInputs;
  outputs: ModelOutputs;
  onOpenWhyModal: (cellKey: string) => void;
}

export const TepTableSection: React.FC<TepTableSectionProps> = ({
  inputs,
  outputs,
  onOpenWhyModal,
}) => {
  const [viewMode, setViewMode] = useState<'compact' | 'formulas'>('formulas');

  const exp = outputs.explanations;

  interface TepRow {
    section: string;
    cellKey: string;
    label: string;
    unit: string;
    value: string;
    rawNumericValue: number | null;
    benchmarkTarget?: string;
    benchmarkStatus?: 'compliant' | 'exceeded' | 'below' | 'neutral';
    benchmarkLabel?: string;
    formula: string;
    source: string;
  }

  const rows: TepRow[] = [
    // 1. Участок и застройка
    {
      section: '1. Участок и застройка',
      cellKey: 'C13',
      label: 'Площадь застройки',
      unit: 'га',
      value: `${outputs.buildingFootprintHa} га`,
      rawNumericValue: outputs.buildingFootprintHa,
      formula: 'C2 * C4',
      source: 'Excel Лист1',
    },
    {
      section: '1. Участок и застройка',
      cellKey: 'C14',
      label: 'Общая площадь жилья',
      unit: 'м²',
      value: `${outputs.totalHousingAreaM2.toLocaleString('ru-RU')} м²`,
      rawNumericValue: outputs.totalHousingAreaM2,
      formula: 'C13 * C3 * 10000',
      source: 'Excel Лист1',
    },
    {
      section: '1. Участок и застройка',
      cellKey: 'C15',
      label: 'Плотность застройки',
      unit: 'тыс. м²/га',
      value: `${outputs.buildingDensityThousandM2PerHa.toFixed(2)}`,
      rawNumericValue: outputs.buildingDensityThousandM2PerHa,
      benchmarkTarget: '≤ 12.0 тыс. м²/га',
      benchmarkStatus: outputs.benchmarks.buildingDensity.status,
      benchmarkLabel: outputs.benchmarks.buildingDensity.statusLabel,
      formula: 'C14 / C2 / 1000',
      source: 'Комментарий Excel (Казань)',
    },

    // 2. Жильё и население
    {
      section: '2. Жильё и население',
      cellKey: 'C16',
      label: 'Количество квартир',
      unit: 'кв.',
      value: `${outputs.apartmentsCount.toLocaleString('ru-RU')}`,
      rawNumericValue: outputs.apartmentsCount,
      formula: 'ROUND(C14 / C5, 0)',
      source: 'Excel Лист1',
    },
    {
      section: '2. Жильё и население',
      cellKey: 'C17',
      label: 'Численность населения',
      unit: 'чел.',
      value: `${Math.round(outputs.population).toLocaleString('ru-RU')}`,
      rawNumericValue: outputs.population,
      formula: inputs.calculationMode === 'excel' ? 'C14 / C8' : 'ROUND(C16 * C6, 0)',
      source: inputs.calculationMode === 'excel' ? 'Excel Лист1 (по жил. обеспеченности C8)' : 'Расширение СитиОК (по семейственности C6)',
    },
    {
      section: '2. Жильё и население',
      cellKey: 'C18',
      label: 'Плотность населения',
      unit: 'чел./га',
      value: `${outputs.populationDensityPerHa.toFixed(1)}`,
      rawNumericValue: outputs.populationDensityPerHa,
      benchmarkTarget: '≤ 210.0 чел./га',
      benchmarkStatus: outputs.benchmarks.populationDensity.status,
      benchmarkLabel: outputs.benchmarks.populationDensity.statusLabel,
      formula: 'C17 / C2',
      source: 'Комментарий Excel (РНГП)',
    },
    {
      section: '2. Жильё и население',
      cellKey: 'E6',
      label: 'Альтернативная жил. обеспеченность',
      unit: 'м²/чел.',
      value: `${outputs.alternativeHousingProvision.toFixed(1)}`,
      rawNumericValue: outputs.alternativeHousingProvision,
      benchmarkTarget: 'ориентир C8 = 30',
      benchmarkStatus: 'neutral',
      benchmarkLabel: 'Аналитический показатель (не участвует в C17)',
      formula: 'C5 / C6',
      source: 'Excel ячейка E6',
    },

    // 3. Озеленение
    {
      section: '3. Озеленение территории',
      cellKey: 'C19',
      label: 'Площадь озеленения',
      unit: 'м²',
      value: `${outputs.greeningAreaM2.toLocaleString('ru-RU')} м²`,
      rawNumericValue: outputs.greeningAreaM2,
      formula: 'C2 * 10000 * 0.25',
      source: 'Excel Лист1 (25% участка)',
    },
    {
      section: '3. Озеленение территории',
      cellKey: 'C20',
      label: 'Обеспеченность озеленением',
      unit: 'м²/чел.',
      value: `${outputs.greeningProvisionM2PerPerson.toFixed(2)}`,
      rawNumericValue: outputs.greeningProvisionM2PerPerson,
      benchmarkTarget: '≥ 6.0 м²/чел.',
      benchmarkStatus: outputs.benchmarks.greeningProvision.status,
      benchmarkLabel: outputs.benchmarks.greeningProvision.statusLabel,
      formula: 'C19 / C17',
      source: 'Комментарий Excel C7',
    },

    // 4. Социальная инфраструктура
    {
      section: '4. Социальная инфраструктура',
      cellKey: 'C22',
      label: 'Требуемые места в детсаду',
      unit: 'мест',
      value: `${outputs.requiredKindergartenPlaces.toLocaleString('ru-RU')}`,
      rawNumericValue: outputs.requiredKindergartenPlaces,
      benchmarkTarget: 'до 350 на 1 объект',
      benchmarkStatus: 'neutral',
      benchmarkLabel: '85% охват детей 0–7 лет',
      formula: 'ROUND(C17 * E2 * 0.85, 0)',
      source: 'Excel Лист1',
    },
    {
      section: '4. Социальная инфраструктура',
      cellKey: 'C23',
      label: 'Требуемые места в школе',
      unit: 'мест',
      value: `${outputs.requiredSchoolPlaces.toLocaleString('ru-RU')}`,
      rawNumericValue: outputs.requiredSchoolPlaces,
      benchmarkTarget: 'от 500 на 1 объект',
      benchmarkStatus: 'neutral',
      benchmarkLabel: '95% охват детей 7–18 лет',
      formula: 'ROUND(C17 * E3 * 0.95, 0)',
      source: 'Excel Лист1',
    },
    {
      section: '4. Социальная инфраструктура',
      cellKey: 'C26',
      label: 'Поликлиническое обслуживание',
      unit: 'пос./смену',
      value: `${outputs.requiredClinicVisitsPerShift}`,
      rawNumericValue: outputs.requiredClinicVisitsPerShift,
      benchmarkTarget: '6 пос./смену на 10 тыс. м²',
      benchmarkStatus: 'neutral',
      benchmarkLabel: 'Показатель мощности обслуживания',
      formula: 'ROUND(C14 / 10000 * 6, 0)',
      source: 'Excel Лист1 (не количество учреждений!)',
    },

    // 5. Парковки
    {
      section: '5. Парковочное пространство',
      cellKey: 'C24',
      label: 'Постоянные машиноместа',
      unit: 'м/м',
      value: `${outputs.requiredParkingPermanent.toLocaleString('ru-RU')}`,
      rawNumericValue: outputs.requiredParkingPermanent,
      benchmarkTarget: '1 на 80 м² жилья',
      benchmarkStatus: 'neutral',
      benchmarkLabel: 'Норматив постоянного хранения',
      formula: 'ROUND(C14 / 80, 0)',
      source: 'Excel Лист1',
    },
    {
      section: '5. Парковочное пространство',
      cellKey: 'C25',
      label: 'Временные машиноместа',
      unit: 'м/м',
      value: `${outputs.requiredParkingTemporary.toLocaleString('ru-RU')}`,
      rawNumericValue: outputs.requiredParkingTemporary,
      benchmarkTarget: '1 на 560 м² жилья',
      benchmarkStatus: 'neutral',
      benchmarkLabel: 'Гостевая стоянка',
      formula: 'ROUND(C14 / 560, 0)',
      source: 'Excel Лист1',
    },

    // 6. Балансы и ограничения
    {
      section: '6. Балансы дефицита / профицита',
      cellKey: 'C28',
      label: 'Баланс мест в детсаду',
      unit: 'мест',
      value: outputs.rawBalanceKindergarten !== null ? `${outputs.rawBalanceKindergarten}` : 'Данных нет',
      rawNumericValue: outputs.rawBalanceKindergarten,
      benchmarkTarget: '—',
      benchmarkStatus: outputs.unmetKindergarten && outputs.unmetKindergarten > 0 ? 'exceeded' : 'compliant',
      benchmarkLabel: outputs.unmetKindergarten && outputs.unmetKindergarten > 0 ? `Дефицит: -${outputs.unmetKindergarten}` : `Резерв: +${outputs.remainingReserveKindergarten ?? 0}`,
      formula: 'C22 - C9',
      source: 'Excel Лист1 (отрицательный баланс не обрезается)',
    },
    {
      section: '6. Балансы дефицита / профицита',
      cellKey: 'C29',
      label: 'Баланс мест в школе',
      unit: 'мест',
      value: outputs.rawBalanceSchool !== null ? `${outputs.rawBalanceSchool}` : 'Данных нет',
      rawNumericValue: outputs.rawBalanceSchool,
      benchmarkTarget: '—',
      benchmarkStatus: outputs.unmetSchool && outputs.unmetSchool > 0 ? 'exceeded' : 'compliant',
      benchmarkLabel: outputs.unmetSchool && outputs.unmetSchool > 0 ? `Дефицит: -${outputs.unmetSchool}` : `Резерв: +${outputs.remainingReserveSchool ?? 0}`,
      formula: 'C23 - C10',
      source: 'Excel Лист1 (отрицательный баланс не обрезается)',
    },
    {
      section: '6. Балансы дефицита / профицита',
      cellKey: 'C30',
      label: 'Баланс постоянных парковок',
      unit: 'м/м',
      value: outputs.rawBalanceParkingPermanent !== null ? `${outputs.rawBalanceParkingPermanent}` : 'Данных нет',
      rawNumericValue: outputs.rawBalanceParkingPermanent,
      benchmarkTarget: '—',
      benchmarkStatus: outputs.unmetParkingPermanent && outputs.unmetParkingPermanent > 0 ? 'exceeded' : 'compliant',
      benchmarkLabel: outputs.unmetParkingPermanent && outputs.unmetParkingPermanent > 0 ? `Дефицит: -${outputs.unmetParkingPermanent}` : `Резерв: +${outputs.remainingReserveParkingPermanent ?? 0}`,
      formula: 'C24 - C11',
      source: 'Excel Лист1 (отрицательный баланс не обрезается)',
    },
  ];

  // Group rows by section
  const sections = Array.from(new Set(rows.map((r) => r.section)));

  return (
    <div className="space-y-6 animate-in fade-in">
      
      {/* Header with compact/formulas toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900 border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <TableProperties className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-bold text-white">
              Технико-экономические показатели (ТЭП) и расчётные формулы
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Точное математическое воспроизведение книги Excel Лист1 с контролем региональных ориентиров
          </p>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setViewMode('compact')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              viewMode === 'compact'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Кратко
          </button>
          <button
            onClick={() => setViewMode('formulas')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              viewMode === 'formulas'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            С формулами Excel
          </button>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            
            <thead className="bg-slate-950/80 text-slate-400 font-mono uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Ячейка</th>
                <th className="py-3 px-4">Показатель</th>
                <th className="py-3 px-4">Значение</th>
                <th className="py-3 px-4">Ед.</th>
                {viewMode === 'formulas' && <th className="py-3 px-4">Формула Excel</th>}
                <th className="py-3 px-4">Ориентир модели</th>
                <th className="py-3 px-4">Статус проверки</th>
                <th className="py-3 px-4 text-right">Обоснование</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800/80">
              {sections.map((secName) => {
                const secRows = rows.filter((r) => r.section === secName);
                return (
                  <React.Fragment key={secName}>
                    {/* Section Header Row */}
                    <tr className="bg-slate-850/60 border-t border-b border-slate-800">
                      <td
                        colSpan={viewMode === 'formulas' ? 8 : 7}
                        className="py-2 px-4 font-bold text-amber-400 uppercase text-[11px] tracking-wider font-mono"
                      >
                        {secName}
                      </td>
                    </tr>

                    {/* Section Data Rows */}
                    {secRows.map((row) => (
                      <tr key={row.cellKey} className="hover:bg-slate-800/40 transition-colors">
                        
                        {/* Cell code */}
                        <td className="py-3 px-4 font-mono font-bold text-amber-400 text-xs">
                          {row.cellKey}
                        </td>

                        {/* Label */}
                        <td className="py-3 px-4 text-slate-200 font-semibold">
                          {row.label}
                        </td>

                        {/* Value with tabular numerals */}
                        <td className="py-3 px-4 font-mono font-extrabold text-white text-sm tabular-nums">
                          {row.value}
                        </td>

                        {/* Unit */}
                        <td className="py-3 px-4 text-slate-400 text-xs">
                          {row.unit}
                        </td>

                        {/* Formula if formula mode */}
                        {viewMode === 'formulas' && (
                          <td className="py-3 px-4 font-mono text-amber-300/90 text-xs bg-slate-950/30">
                            ={row.formula}
                          </td>
                        )}

                        {/* Benchmark target */}
                        <td className="py-3 px-4 font-mono text-slate-400 text-xs">
                          {row.benchmarkTarget || '—'}
                        </td>

                        {/* Benchmark status */}
                        <td className="py-3 px-4">
                          {row.benchmarkStatus === 'compliant' ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              {row.benchmarkLabel || 'В норме'}
                            </span>
                          ) : row.benchmarkStatus === 'exceeded' ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-400">
                              <AlertTriangle className="w-3.5 h-3.5" />
                              {row.benchmarkLabel || 'Превышает'}
                            </span>
                          ) : row.benchmarkStatus === 'below' ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-400">
                              <AlertTriangle className="w-3.5 h-3.5" />
                              {row.benchmarkLabel || 'Ниже нормы'}
                            </span>
                          ) : (
                            <span className="text-slate-500 text-[11px]">
                              {row.benchmarkLabel || '—'}
                            </span>
                          )}
                        </td>

                        {/* "Почему такое значение?" button */}
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => onOpenWhyModal(row.cellKey)}
                            title="Посмотреть исходную формулу, допущения и подставленные параметры"
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-slate-300 hover:text-amber-300 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors"
                          >
                            <HelpCircle className="w-3 h-3 text-amber-400" />
                            <span>Почему?</span>
                          </button>
                        </td>

                      </tr>
                    ))}
                  </React.Fragment>
                );
              })}
            </tbody>

          </table>
        </div>

        {/* Footer Notes */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-500">
          <div>
            * В исходном Excel отрицательный баланс не обрезается до нуля.
          </div>
          <div className="font-mono">
            Ориентиры модели носят аналитический характер и требуют нормативной верификации.
          </div>
        </div>

      </div>

    </div>
  );
};
