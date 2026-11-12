import React from 'react';
import { ModelInputs, QualityStatus, QualityProvenance, Scenario } from '../../types/model';
import { validateModelInputs } from '../../validation/validator';
import {
  Sliders,
  Building,
  Users,
  Trees,
  Car,
  School,
  AlertCircle,
  HelpCircle,
  Info,
  Check,
  RotateCcw,
} from 'lucide-react';

interface SiteParamsSectionProps {
  inputs: ModelInputs;
  baselineInputs: ModelInputs;
  onUpdateInput: <K extends keyof ModelInputs>(key: K, value: ModelInputs[K]) => void;
  onResetToBaseline: () => void;
}

export const SiteParamsSection: React.FC<SiteParamsSectionProps> = ({
  inputs,
  baselineInputs,
  onUpdateInput,
  onResetToBaseline,
}) => {
  const validation = validateModelInputs(inputs);
  const errors = validation.errors;
  const warnings = validation.warnings;

  // Alternative housing provision indicator E6 = C5 / C6
  const altHousingProvisionE6 =
    inputs.householdSize > 0 ? (inputs.avgApartmentArea / inputs.householdSize).toFixed(1) : '—';

  const renderDelta = (current: number, baseline: number, unit: string) => {
    const diff = current - baseline;
    if (Math.abs(diff) < 0.0001) return null;
    return (
      <span className="text-[10px] font-mono text-amber-400/90 ml-1.5">
        ({diff > 0 ? `+${diff}` : `${diff}`} {unit})
      </span>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in max-w-5xl">
      
      {/* Title & Mode Switch Banner */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-bold text-white">
              Входные параметры градостроительной модели
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Точное сопоставление с ячейками C2–C11 и E2–E3 книги Excel prostaia_model_kommentarii_ot_08112026-2.xlsx
          </p>
        </div>

        {/* Population method switcher */}
        <div className="bg-slate-950 p-1.5 rounded-xl border border-slate-800 flex items-center gap-1 text-xs">
          <span className="text-slate-400 text-[11px] px-2 font-medium">Метод населения C17:</span>
          <button
            onClick={() => onUpdateInput('calculationMode', 'excel')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              inputs.calculationMode === 'excel'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            По жил. обеспеченности (Excel)
          </button>
          <button
            onClick={() => onUpdateInput('calculationMode', 'household')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              inputs.calculationMode === 'household'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            По семейственности (Расширение)
          </button>
        </div>
      </div>

      {/* Grid of Parameters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Block 1: Участок и застройка (C2, C3, C4) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Building className="w-4 h-4 text-amber-400" />
              <h3 className="font-bold text-sm text-white">1. Земельный участок и застройка</h3>
            </div>
            <span className="text-[10px] font-mono text-slate-500">Ячейки C2–C4</span>
          </div>

          {/* C2: Площадь участка */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label className="font-semibold text-slate-300 flex items-center gap-1">
                <span>Площадь участка (C2), га</span>
                {renderDelta(inputs.siteAreaHa, baselineInputs.siteAreaHa, 'га')}
              </label>
              <span className="text-[11px] font-mono text-slate-400">по умолчанию: 10</span>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0.5"
                max="40"
                step="0.5"
                value={inputs.siteAreaHa}
                onChange={(e) => onUpdateInput('siteAreaHa', parseFloat(e.target.value) || 0.1)}
                className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
              <input
                type="number"
                min="0.1"
                step="0.1"
                value={inputs.siteAreaHa}
                onChange={(e) => onUpdateInput('siteAreaHa', parseFloat(e.target.value))}
                className="w-24 px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-right font-mono text-white text-xs focus:border-amber-500"
              />
            </div>
            {errors.siteAreaHa && <p className="text-[11px] text-rose-400">{errors.siteAreaHa}</p>}
            {warnings.siteAreaHa && <p className="text-[11px] text-amber-400">{warnings.siteAreaHa}</p>}
          </div>

          {/* C3: Этажность */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label className="font-semibold text-slate-300 flex items-center gap-1">
                <span>Этажность (C3)</span>
                {renderDelta(inputs.floors, baselineInputs.floors, 'эт.')}
              </label>
              <span className="text-[11px] font-mono text-slate-400">по умолчанию: 3</span>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="1"
                max="32"
                step="1"
                value={inputs.floors}
                onChange={(e) => onUpdateInput('floors', parseInt(e.target.value, 10) || 1)}
                className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
              <input
                type="number"
                min="1"
                max="50"
                step="1"
                value={inputs.floors}
                onChange={(e) => onUpdateInput('floors', parseInt(e.target.value, 10))}
                className="w-24 px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-right font-mono text-white text-xs focus:border-amber-500"
              />
            </div>
            {errors.floors && <p className="text-[11px] text-rose-400">{errors.floors}</p>}
          </div>

          {/* C4: Коэффициент застройки */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label className="font-semibold text-slate-300 flex items-center gap-1">
                <span>Коэффициент застройки (C4)</span>
                {renderDelta(inputs.buildingRatio, baselineInputs.buildingRatio, '')}
              </label>
              <span className="text-[11px] font-mono text-slate-400">по умолчанию: 0.40</span>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0.05"
                max="0.8"
                step="0.01"
                value={inputs.buildingRatio}
                onChange={(e) => onUpdateInput('buildingRatio', parseFloat(e.target.value) || 0.1)}
                className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
              <input
                type="number"
                min="0.01"
                max="1"
                step="0.01"
                value={inputs.buildingRatio}
                onChange={(e) => onUpdateInput('buildingRatio', parseFloat(e.target.value))}
                className="w-24 px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-right font-mono text-white text-xs focus:border-amber-500"
              />
            </div>
            {errors.buildingRatio && <p className="text-[11px] text-rose-400">{errors.buildingRatio}</p>}
            {warnings.buildingRatio && <p className="text-[11px] text-amber-400">{warnings.buildingRatio}</p>}
          </div>

        </div>

        {/* Block 2: Квартиры, демография и жил. обеспеченность (C5, C6, C7, C8, E6) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-amber-400" />
              <h3 className="font-bold text-sm text-white">2. Жилой фонд и население</h3>
            </div>
            <span className="text-[10px] font-mono text-slate-500">Ячейки C5–C8, E6</span>
          </div>

          {/* C5: Средняя площадь квартиры */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <label className="font-semibold text-slate-300">
                Средняя площадь квартиры (C5), м²
              </label>
              <span className="text-[11px] font-mono text-slate-400">по умолчанию: 55</span>
            </div>
            <input
              type="number"
              min="15"
              step="1"
              value={inputs.avgApartmentArea}
              onChange={(e) => onUpdateInput('avgApartmentArea', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg font-mono text-white text-xs focus:border-amber-500"
            />
            {errors.avgApartmentArea && <p className="text-[11px] text-rose-400">{errors.avgApartmentArea}</p>}
          </div>

          {/* C8: Жилищная обеспеченность */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <label className="font-semibold text-slate-300">
                Жилищная обеспеченность (C8), м²/чел.
              </label>
              <span className="text-[11px] font-mono text-amber-400 font-bold">Участвует в C17 Excel</span>
            </div>
            <input
              type="number"
              min="10"
              step="1"
              value={inputs.housingProvision}
              onChange={(e) => onUpdateInput('housingProvision', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg font-mono text-white text-xs focus:border-amber-500"
            />
            <p className="text-[10px] text-slate-400">
              В основном режиме формула населения C17 = C14 / C8 (120 000 / 30 = 4000 чел.).
            </p>
          </div>

          {/* C6: Семейственность */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <label className="font-semibold text-slate-300">
                Коэффициент семейственности (C6), чел./кв.
              </label>
              <span className="text-[11px] font-mono text-slate-400">по умолчанию: 2.5</span>
            </div>
            <input
              type="number"
              min="1"
              max="6"
              step="0.1"
              value={inputs.householdSize}
              onChange={(e) => onUpdateInput('householdSize', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg font-mono text-white text-xs focus:border-amber-500"
            />
            {inputs.calculationMode === 'excel' ? (
              <p className="text-[10px] text-amber-400/90 italic">
                Не участвует в основном расчёте населения выбранного режима Excel (C17 = C14 / C8).
              </p>
            ) : (
              <p className="text-[10px] text-emerald-400 font-semibold">
                Участвует в формуле расширения: C17 = ROUND(Квартиры × Семейственность, 0).
              </p>
            )}
          </div>

          {/* E6: Альтернативная жил. обеспеченность */}
          <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between text-xs">
            <div>
              <span className="font-semibold text-slate-300">Альтернативная жил. обеспеченность (E6 = C5 / C6):</span>
              <p className="text-[10px] text-slate-400 mt-0.5">
                55 м² / 2.5 чел. = {altHousingProvisionE6} м²/чел. Не используется в ячейке C17 Excel.
              </p>
            </div>
            <span className="text-sm font-bold font-mono text-amber-400 bg-amber-500/10 px-2 py-1 rounded">
              {altHousingProvisionE6} м²/чел.
            </span>
          </div>

        </div>

      </div>

      {/* Grid 2: Демографические доли и Озеленение (E2, E3, C7) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Доли детей */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="font-bold text-sm text-white">3. Возрастные доли контингентов</h3>
            <span className="text-[10px] font-mono text-slate-500">Ячейки E2, E3</span>
          </div>

          <div className="space-y-3 text-xs">
            {/* E2: Доля детей 0-7 */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-slate-300 font-medium">Доля детей 0–7 лет (E2):</label>
                <span className="font-mono text-amber-400 font-bold">
                  {(inputs.shareKids0to7 * 100).toFixed(1)}% (доля: {inputs.shareKids0to7})
                </span>
              </div>
              <input
                type="range"
                min="0.01"
                max="0.25"
                step="0.005"
                value={inputs.shareKids0to7}
                onChange={(e) => onUpdateInput('shareKids0to7', parseFloat(e.target.value))}
                className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            {/* E3: Доля детей 7-18 */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-slate-300 font-medium">Доля детей 7–18 лет (E3):</label>
                <span className="font-mono text-amber-400 font-bold">
                  {(inputs.shareKids7to18 * 100).toFixed(1)}% (доля: {inputs.shareKids7to18})
                </span>
              </div>
              <input
                type="range"
                min="0.01"
                max="0.30"
                step="0.005"
                value={inputs.shareKids7to18}
                onChange={(e) => onUpdateInput('shareKids7to18', parseFloat(e.target.value))}
                className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            {errors.shareKidsTotal && (
              <p className="text-[11px] text-rose-400">{errors.shareKidsTotal}</p>
            )}

            <p className="text-[10px] text-slate-500 pt-1 border-t border-slate-800 italic">
              Методическая заметка: возрастные категории перенесены как в Excel. Точные границы контингентов должны быть уточнены до официального использования.
            </p>
          </div>
        </div>

        {/* Озеленение (C7) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Trees className="w-4 h-4 text-emerald-400" />
              <h3 className="font-bold text-sm text-white">4. Норматив озеленения</h3>
            </div>
            <span className="text-[10px] font-mono text-slate-500">Ячейка C7</span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <label className="text-slate-300 font-medium">Ориентир озеленения (C7), м²/чел.:</label>
              <span className="font-mono text-slate-400">по умолчанию: 6.0</span>
            </div>
            <input
              type="number"
              min="1"
              step="0.5"
              value={inputs.greeningNorm}
              onChange={(e) => onUpdateInput('greeningNorm', parseFloat(e.target.value) || 1)}
              className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg font-mono text-white text-xs focus:border-amber-500"
            />
            <p className="text-[11px] text-slate-400 pt-1">
              В исходной книге Excel площадь озеленения C19 задана формулой: <code className="text-amber-300">C2 * 10000 * 0.25</code> (25% территории участка), а C7 используется как контрольный ориентир при расчете C20.
            </p>
          </div>
        </div>

      </div>

      {/* Grid 3: Существующая инфраструктура (C9, C10, C11) с подтверждением качества данных */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Car className="w-4 h-4 text-amber-400" />
            <h3 className="font-bold text-sm text-white">
              5. Существующая инфраструктура и учтённый доступный резерв
            </h3>
          </div>
          <span className="text-[10px] font-mono text-slate-500">Ячейки C9, C10, C11</span>
        </div>

        <p className="text-xs text-slate-400">
          Укажите статус доступного резерва для сопоставления со спросом ЖК. По умолчанию нули из Excel трактуются как: <strong className="text-slate-300">«Сценарно принято отсутствие доступного резерва»</strong>, а не как доказанный факт.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          
          {/* C9: Детсад */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5">
            <div className="flex justify-between items-center">
              <span className="font-bold text-white flex items-center gap-1">
                <School className="w-3.5 h-3.5 text-pink-400" />
                Детсад (C9)
              </span>
              <span className="text-[10px] font-mono text-slate-500">мест</span>
            </div>

            {/* Quality Status Selector */}
            <select
              value={inputs.existingKindergarten.qualityStatus}
              onChange={(e) => {
                const status = e.target.value as QualityStatus;
                onUpdateInput('existingKindergarten', {
                  ...inputs.existingKindergarten,
                  qualityStatus: status,
                  value: status === 'no_data' ? null : (inputs.existingKindergarten.value ?? 0),
                  provenance: status === 'fact' ? 'fact' : 'assumption',
                });
              }}
              className="w-full bg-slate-900 border border-slate-700 text-xs rounded-lg px-2 py-1 text-slate-200"
            >
              <option value="estimate">Сценарное предположение о резерве</option>
              <option value="fact">Подтверждённый доступный резерв</option>
              <option value="no_data">Данных о резерве нет (no_data)</option>
            </select>

            {inputs.existingKindergarten.qualityStatus !== 'no_data' ? (
              <input
                type="number"
                min="0"
                step="10"
                value={inputs.existingKindergarten.value ?? 0}
                onChange={(e) =>
                  onUpdateInput('existingKindergarten', {
                    ...inputs.existingKindergarten,
                    value: Math.max(0, parseInt(e.target.value, 10) || 0),
                  })
                }
                className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-right font-mono text-white text-xs"
              />
            ) : (
              <div className="p-2 bg-slate-900 rounded-lg text-[10px] text-slate-400 italic text-center">
                Дефицит не определён: нет данных о резерве
              </div>
            )}
          </div>

          {/* C10: Школа */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5">
            <div className="flex justify-between items-center">
              <span className="font-bold text-white flex items-center gap-1">
                <School className="w-3.5 h-3.5 text-blue-400" />
                Школа (C10)
              </span>
              <span className="text-[10px] font-mono text-slate-500">мест</span>
            </div>

            <select
              value={inputs.existingSchool.qualityStatus}
              onChange={(e) => {
                const status = e.target.value as QualityStatus;
                onUpdateInput('existingSchool', {
                  ...inputs.existingSchool,
                  qualityStatus: status,
                  value: status === 'no_data' ? null : (inputs.existingSchool.value ?? 0),
                  provenance: status === 'fact' ? 'fact' : 'assumption',
                });
              }}
              className="w-full bg-slate-900 border border-slate-700 text-xs rounded-lg px-2 py-1 text-slate-200"
            >
              <option value="estimate">Сценарное предположение о резерве</option>
              <option value="fact">Подтверждённый доступный резерв</option>
              <option value="no_data">Данных о резерве нет (no_data)</option>
            </select>

            {inputs.existingSchool.qualityStatus !== 'no_data' ? (
              <input
                type="number"
                min="0"
                step="10"
                value={inputs.existingSchool.value ?? 0}
                onChange={(e) =>
                  onUpdateInput('existingSchool', {
                    ...inputs.existingSchool,
                    value: Math.max(0, parseInt(e.target.value, 10) || 0),
                  })
                }
                className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-right font-mono text-white text-xs"
              />
            ) : (
              <div className="p-2 bg-slate-900 rounded-lg text-[10px] text-slate-400 italic text-center">
                Дефицит не определён: нет данных о резерве
              </div>
            )}
          </div>

          {/* C11: Парковки */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5">
            <div className="flex justify-between items-center">
              <span className="font-bold text-white flex items-center gap-1">
                <Car className="w-3.5 h-3.5 text-emerald-400" />
                Постоянные парковки (C11)
              </span>
              <span className="text-[10px] font-mono text-slate-500">м/м</span>
            </div>

            <select
              value={inputs.existingParkingPermanent.qualityStatus}
              onChange={(e) => {
                const status = e.target.value as QualityStatus;
                onUpdateInput('existingParkingPermanent', {
                  ...inputs.existingParkingPermanent,
                  qualityStatus: status,
                  value: status === 'no_data' ? null : (inputs.existingParkingPermanent.value ?? 0),
                  provenance: status === 'fact' ? 'fact' : 'assumption',
                });
              }}
              className="w-full bg-slate-900 border border-slate-700 text-xs rounded-lg px-2 py-1 text-slate-200"
            >
              <option value="estimate">Сценарное предположение о резерве</option>
              <option value="fact">Подтверждённый доступный резерв</option>
              <option value="no_data">Данных о резерве нет (no_data)</option>
            </select>

            {inputs.existingParkingPermanent.qualityStatus !== 'no_data' ? (
              <input
                type="number"
                min="0"
                step="50"
                value={inputs.existingParkingPermanent.value ?? 0}
                onChange={(e) =>
                  onUpdateInput('existingParkingPermanent', {
                    ...inputs.existingParkingPermanent,
                    value: Math.max(0, parseInt(e.target.value, 10) || 0),
                  })
                }
                className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-right font-mono text-white text-xs"
              />
            ) : (
              <div className="p-2 bg-slate-900 rounded-lg text-[10px] text-slate-400 italic text-center">
                Дефицит не определён: нет данных о резерве
              </div>
            )}
          </div>

        </div>
      </div>

    </div>
  );
};
