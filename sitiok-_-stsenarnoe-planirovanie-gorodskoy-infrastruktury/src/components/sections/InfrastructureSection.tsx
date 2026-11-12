import React, { useState } from 'react';
import { ModelInputs, ModelOutputs, QualityStatus, QualityProvenance, InfrastructureFacility } from '../../types/model';
import { SYNTHETIC_DEMO_FACILITIES, MODEL_METADATA } from '../../constants/modelConfig';
import { StatusBadge } from '../shared/StatusBadge';
import {
  School,
  Baby,
  Car,
  AlertCircle,
  HelpCircle,
  ShieldCheck,
  CheckCircle2,
  Info,
  Layers,
} from 'lucide-react';

interface InfrastructureSectionProps {
  inputs: ModelInputs;
  outputs: ModelOutputs;
  onUpdateInput: <K extends keyof ModelInputs>(key: K, value: ModelInputs[K]) => void;
}

export const InfrastructureSection: React.FC<InfrastructureSectionProps> = ({
  inputs,
  outputs,
  onUpdateInput,
}) => {
  const [facilities, setFacilities] = useState<InfrastructureFacility[]>(SYNTHETIC_DEMO_FACILITIES);

  // Toggle facility inclusion in scenario
  const handleToggleFacility = (id: string) => {
    setFacilities((prev) =>
      prev.map((f) => (f.id === id ? { ...f, isIncludedInScenario: !f.isIncludedInScenario } : f))
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      
      {/* Header Banner */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
        <div className="flex items-center gap-2">
          <School className="w-5 h-5 text-amber-400" />
          <h2 className="text-base font-bold text-white">
            Инфраструктурный баланс и качество исходных данных
          </h2>
        </div>
        <p className="text-xs text-slate-400">
          Раздельный учёт происхождения данных (факт / норматив / допущение) и статуса подтверждения (факт / оценка / нет данных).
        </p>
      </div>

      {/* 3 Main Social Facilities Detailed Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Card 1: ШКОЛЫ */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold">
                  СОШ
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">Школьное образование</h3>
                  <span className="text-[10px] text-slate-400">95% охват детей 7–18 лет</span>
                </div>
              </div>
              <StatusBadge status={inputs.existingSchool.qualityStatus} />
            </div>

            {/* Demand vs Reserve vs Balance */}
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400 font-sans">Спрос ЖК (C23):</span>
                <strong className="text-white text-sm">{outputs.requiredSchoolPlaces} мест</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-sans">Учтённый резерв (C10):</span>
                <span className="text-amber-400">
                  {inputs.existingSchool.value !== null ? `${inputs.existingSchool.value} мест` : 'нет данных (null)'}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-800 flex justify-between items-baseline">
                <span className="text-slate-300 font-sans font-semibold">Баланс ячейки C29:</span>
                <span className="text-sm font-bold text-white">
                  {outputs.rawBalanceSchool !== null ? `${outputs.rawBalanceSchool} мест` : 'Не определён'}
                </span>
              </div>
            </div>

            {/* Unmet vs Reserve note */}
            {inputs.existingSchool.qualityStatus === 'no_data' ? (
              <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-700/60 text-xs text-slate-300 space-y-1">
                <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                  <AlertCircle className="w-4 h-4" />
                  <span>Дефицит не определён: нет данных о резерве</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Спрос рассчитан детерминированно, но статус дефицита всей сети не может быть подтверждён без фактической загрузки.
                </p>
              </div>
            ) : outputs.unmetSchool && outputs.unmetSchool > 0 ? (
              <div className="p-3 bg-rose-950/20 rounded-xl border border-rose-500/30 text-xs text-rose-300 space-y-1">
                <div className="flex items-center gap-1.5 text-rose-400 font-bold">
                  <AlertCircle className="w-4 h-4" />
                  <span>Неудовлетворённая потребность: {outputs.unmetSchool} мест</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Ориентир вместимости отдельной новой СОШ — не менее 500 мест.
                </p>
              </div>
            ) : (
              <div className="p-3 bg-emerald-950/20 rounded-xl border border-emerald-500/30 text-xs text-emerald-300 space-y-1">
                <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Остаток учтённого резерва: {outputs.remainingReserveSchool} мест</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  По заданным сценарным условиям. Безусловный вывод о достаточности требует проверки сетевой доступности.
                </p>
              </div>
            )}
          </div>

          <div className="text-[10px] text-slate-500 pt-2 border-t border-slate-800">
            Происхождение: <strong className="text-slate-400 font-mono">{inputs.existingSchool.provenance}</strong>
          </div>
        </div>

        {/* Card 2: ДЕТСКИЕ САДЫ */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-pink-500/10 border border-pink-500/30 flex items-center justify-center text-pink-400 font-bold">
                  ДОО
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">Дошкольные учреждения</h3>
                  <span className="text-[10px] text-slate-400">85% охват детей 0–7 лет</span>
                </div>
              </div>
              <StatusBadge status={inputs.existingKindergarten.qualityStatus} />
            </div>

            {/* Demand vs Reserve vs Balance */}
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400 font-sans">Спрос ЖК (C22):</span>
                <strong className="text-white text-sm">{outputs.requiredKindergartenPlaces} мест</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-sans">Учтённый резерв (C9):</span>
                <span className="text-amber-400">
                  {inputs.existingKindergarten.value !== null ? `${inputs.existingKindergarten.value} мест` : 'нет данных (null)'}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-800 flex justify-between items-baseline">
                <span className="text-slate-300 font-sans font-semibold">Баланс ячейки C28:</span>
                <span className="text-sm font-bold text-white">
                  {outputs.rawBalanceKindergarten !== null ? `${outputs.rawBalanceKindergarten} мест` : 'Не определён'}
                </span>
              </div>
            </div>

            {inputs.existingKindergarten.qualityStatus === 'no_data' ? (
              <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-700/60 text-xs text-slate-300 space-y-1">
                <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                  <AlertCircle className="w-4 h-4" />
                  <span>Дефицит не определён: нет данных о резерве</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Запросите мощность, загрузку и санитарные условия ДОО.
                </p>
              </div>
            ) : outputs.unmetKindergarten && outputs.unmetKindergarten > 0 ? (
              <div className="p-3 bg-rose-950/20 rounded-xl border border-rose-500/30 text-xs text-rose-300 space-y-1">
                <div className="flex items-center gap-1.5 text-rose-400 font-bold">
                  <AlertCircle className="w-4 h-4" />
                  <span>Неудовлетворённая потребность: {outputs.unmetKindergarten} мест</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Предельная вместимость одного отдельного ДОО — до 350 мест.
                </p>
              </div>
            ) : (
              <div className="p-3 bg-emerald-950/20 rounded-xl border border-emerald-500/30 text-xs text-emerald-300 space-y-1">
                <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Остаток учтённого резерва: {outputs.remainingReserveKindergarten} мест</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Остаток учтённого резерва по заданным условиям.
                </p>
              </div>
            )}
          </div>

          <div className="text-[10px] text-slate-500 pt-2 border-t border-slate-800">
            Происхождение: <strong className="text-slate-400 font-mono">{inputs.existingKindergarten.provenance}</strong>
          </div>
        </div>

        {/* Card 3: ПАРКОВКИ */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold">
                  ПАРК
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">Постоянные парковки</h3>
                  <span className="text-[10px] text-slate-400">1 место на 80 м² жилья</span>
                </div>
              </div>
              <StatusBadge status={inputs.existingParkingPermanent.qualityStatus} />
            </div>

            {/* Demand vs Reserve vs Balance */}
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400 font-sans">Спрос ЖК (C24):</span>
                <strong className="text-white text-sm">{outputs.requiredParkingPermanent} м/м</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-sans">Учтённый резерв (C11):</span>
                <span className="text-amber-400">
                  {inputs.existingParkingPermanent.value !== null ? `${inputs.existingParkingPermanent.value} м/м` : 'нет данных (null)'}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-800 flex justify-between items-baseline">
                <span className="text-slate-300 font-sans font-semibold">Баланс ячейки C30:</span>
                <span className="text-sm font-bold text-white">
                  {outputs.rawBalanceParkingPermanent !== null ? `${outputs.rawBalanceParkingPermanent} м/м` : 'Не определён'}
                </span>
              </div>
            </div>

            {inputs.existingParkingPermanent.qualityStatus === 'no_data' ? (
              <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-700/60 text-xs text-slate-300 space-y-1">
                <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                  <AlertCircle className="w-4 h-4" />
                  <span>Дефицит не определён: нет данных о резерве</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Требуется инвентаризация постоянных гаражей и стоянок в радиусе 800м.
                </p>
              </div>
            ) : outputs.unmetParkingPermanent && outputs.unmetParkingPermanent > 0 ? (
              <div className="p-3 bg-rose-950/20 rounded-xl border border-rose-500/30 text-xs text-rose-300 space-y-1">
                <div className="flex items-center gap-1.5 text-rose-400 font-bold">
                  <AlertCircle className="w-4 h-4" />
                  <span>Неудовлетворённая потребность: {outputs.unmetParkingPermanent} м/м</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Временные (гостевые) парковки C25: {outputs.requiredParkingTemporary} м/м рассчитываются отдельно.
                </p>
              </div>
            ) : (
              <div className="p-3 bg-emerald-950/20 rounded-xl border border-emerald-500/30 text-xs text-emerald-300 space-y-1">
                <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Остаток учтённого резерва: {outputs.remainingReserveParkingPermanent} м/м</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Постоянные машиноместа обеспечены учтённым резервом.
                </p>
              </div>
            )}
          </div>

          <div className="text-[10px] text-slate-500 pt-2 border-t border-slate-800">
            Происхождение: <strong className="text-slate-400 font-mono">{inputs.existingParkingPermanent.provenance}</strong>
          </div>
        </div>

      </div>

      {/* Synthetic Demonstration Facilities Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800">
          <div>
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-400" />
              <span>Реестр демонстрационных объектов инфраструктуры (Приволжский р-н)</span>
            </h3>
            <p className="text-xs text-slate-400">
              {MODEL_METADATA.syntheticDataNotice}
            </p>
          </div>
          <span className="text-[10px] font-mono text-amber-400/90 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
            Синтетический набор
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-950 text-slate-400 font-mono uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-2.5">Название объекта</th>
                <th className="p-2.5">Тип</th>
                <th className="p-2.5">Проектная мощность</th>
                <th className="p-2.5">Текущая загрузка</th>
                <th className="p-2.5">Доступный резерв</th>
                <th className="p-2.5">Качество</th>
                <th className="p-2.5">Статус данных</th>
                <th className="p-2.5 text-right">Учесть в сценарии</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {facilities.map((fac) => (
                <tr key={fac.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="p-2.5 font-semibold text-slate-200">
                    {fac.name}
                  </td>
                  <td className="p-2.5 text-slate-400">
                    {fac.type === 'school' ? 'Школа' : fac.type === 'kindergarten' ? 'Детсад' : 'Паркинг'}
                  </td>
                  <td className="p-2.5 font-mono text-white">
                    {fac.totalCapacity}
                  </td>
                  <td className="p-2.5 font-mono text-slate-300">
                    {fac.currentLoad !== null ? fac.currentLoad : <span className="text-slate-500">неизвестно</span>}
                  </td>
                  <td className="p-2.5 font-mono font-bold">
                    {fac.availableReserve !== null ? (
                      <span className={fac.availableReserve > 0 ? 'text-emerald-400' : 'text-rose-400'}>
                        {fac.availableReserve} мест
                      </span>
                    ) : (
                      <span className="text-slate-500 italic">не определён</span>
                    )}
                  </td>
                  <td className="p-2.5">
                    <StatusBadge provenance={fac.provenance} />
                  </td>
                  <td className="p-2.5">
                    <StatusBadge status={fac.qualityStatus} />
                  </td>
                  <td className="p-2.5 text-right">
                    <button
                      onClick={() => handleToggleFacility(fac.id)}
                      className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-colors ${
                        fac.isIncludedInScenario
                          ? 'bg-amber-500 text-slate-950 font-bold'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                      }`}
                    >
                      {fac.isIncludedInScenario ? 'Включён' : 'Выключен'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-500 flex items-center justify-between">
          <span>Резерв = max(capacity - load, 0) вычисляется строго при наличии обоих параметров.</span>
          <span>Один объект не может быть учтён дважды в одном расчёте.</span>
        </div>
      </div>

    </div>
  );
};
