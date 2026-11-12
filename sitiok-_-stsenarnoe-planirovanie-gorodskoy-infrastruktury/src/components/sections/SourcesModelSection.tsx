import React, { useState } from 'react';
import { BENCHMARK_DEFINITIONS, MODEL_METADATA } from '../../constants/modelConfig';
import { RecommendationItem } from '../../types/model';
import {
  BookOpen,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Info,
  ShieldAlert,
  FileSpreadsheet,
  CheckCircle2,
} from 'lucide-react';

interface SourcesModelSectionProps {
  recommendations: RecommendationItem[];
}

export const SourcesModelSection: React.FC<SourcesModelSectionProps> = ({ recommendations }) => {
  const [showExtensions, setShowExtensions] = useState(false);

  return (
    <div className="space-y-6 animate-in fade-in max-w-5xl">
      
      {/* Title */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-amber-400" />
          <h2 className="text-base font-bold text-white">
            Методологическая база, ориентиры и ограничения модели
          </h2>
        </div>
        <p className="text-xs text-slate-400">
          Справочные данные и допущения из книги prostaia_model_kommentarii_ot_08112026-2.xlsx (Лист1)
        </p>
      </div>

      {/* Model Benchmarks Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <h3 className="font-bold text-sm text-white">
            Градостроительные ориентиры и проверки модели
          </h3>
          <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
            Требует нормативной верификации
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-950 text-slate-400 font-mono uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-2.5">Параметр</th>
                <th className="p-2.5">Ориентир</th>
                <th className="p-2.5">Единица</th>
                <th className="p-2.5">Источник</th>
                <th className="p-2.5">Статус верификации</th>
                <th className="p-2.5">Методическое примечание</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 font-sans">
              <tr className="hover:bg-slate-800/20">
                <td className="p-2.5 font-bold text-white">Плотность застройки</td>
                <td className="p-2.5 font-mono font-bold text-amber-400">≤ 12.0</td>
                <td className="p-2.5 text-slate-400">тыс. м²/га</td>
                <td className="p-2.5 text-slate-300">Комментарий Excel (Казань)</td>
                <td className="p-2.5 text-amber-400 text-[11px]">Требует нормативной верификации</td>
                <td className="p-2.5 text-slate-400 text-[11px]">Коэффициент плотности застройки территории жилой зоны по комментариям</td>
              </tr>
              <tr className="hover:bg-slate-800/20">
                <td className="p-2.5 font-bold text-white">Плотность населения</td>
                <td className="p-2.5 font-mono font-bold text-amber-400">≤ 210.0</td>
                <td className="p-2.5 text-slate-400">чел./га</td>
                <td className="p-2.5 text-slate-300">Комментарий Excel (РНГП)</td>
                <td className="p-2.5 text-amber-400 text-[11px]">Требует нормативной верификации</td>
                <td className="p-2.5 text-slate-400 text-[11px]">Ориентир плотности населения жилого района</td>
              </tr>
              <tr className="hover:bg-slate-800/20">
                <td className="p-2.5 font-bold text-white">Озеленение на человека</td>
                <td className="p-2.5 font-mono font-bold text-emerald-400">≥ 6.0</td>
                <td className="p-2.5 text-slate-400">м²/чел.</td>
                <td className="p-2.5 text-slate-300">Ячейка C7 книги Excel</td>
                <td className="p-2.5 text-amber-400 text-[11px]">Требует нормативной верификации</td>
                <td className="p-2.5 text-slate-400 text-[11px]">Минимальная обеспеченность озелененными территориями общего пользования</td>
              </tr>
              <tr className="hover:bg-slate-800/20">
                <td className="p-2.5 font-bold text-white">Охват детскими садами</td>
                <td className="p-2.5 font-mono font-bold text-white">85%</td>
                <td className="p-2.5 text-slate-400">от детей 0–7 лет</td>
                <td className="p-2.5 text-slate-300">Формула C22</td>
                <td className="p-2.5 text-slate-400 text-[11px]">Допущение модели</td>
                <td className="p-2.5 text-slate-400 text-[11px]">Предельная вместимость одного отдельного ДОО — не более 350 мест</td>
              </tr>
              <tr className="hover:bg-slate-800/20">
                <td className="p-2.5 font-bold text-white">Охват школами</td>
                <td className="p-2.5 font-mono font-bold text-white">95%</td>
                <td className="p-2.5 text-slate-400">от детей 7–18 лет</td>
                <td className="p-2.5 text-slate-300">Формула C23</td>
                <td className="p-2.5 text-slate-400 text-[11px]">Допущение модели</td>
                <td className="p-2.5 text-slate-400 text-[11px]">Вместимость отдельного нового здания СОШ — не менее 500 мест</td>
              </tr>
              <tr className="hover:bg-slate-800/20">
                <td className="p-2.5 font-bold text-white">Постоянные машиноместа</td>
                <td className="p-2.5 font-mono font-bold text-white">1 место на 80 м²</td>
                <td className="p-2.5 text-slate-400">жилья</td>
                <td className="p-2.5 text-slate-300">Формула C24</td>
                <td className="p-2.5 text-slate-400 text-[11px]">Допущение модели</td>
                <td className="p-2.5 text-slate-400 text-[11px]">Норматив постоянного хранения автотранспорта</td>
              </tr>
              <tr className="hover:bg-slate-800/20">
                <td className="p-2.5 font-bold text-white">Временные машиноместа</td>
                <td className="p-2.5 font-mono font-bold text-white">1 место на 560 м²</td>
                <td className="p-2.5 text-slate-400">жилья</td>
                <td className="p-2.5 text-slate-300">Формула C25</td>
                <td className="p-2.5 text-slate-400 text-[11px]">Допущение модели</td>
                <td className="p-2.5 text-slate-400 text-[11px]">Гостевые стоянки открытого типа</td>
              </tr>
              <tr className="hover:bg-slate-800/20">
                <td className="p-2.5 font-bold text-white">Поликлиническое обслуживание</td>
                <td className="p-2.5 font-mono font-bold text-white">6 пос./смену</td>
                <td className="p-2.5 text-slate-400">на 10 000 м² жилья</td>
                <td className="p-2.5 text-slate-300">Формула C26</td>
                <td className="p-2.5 text-slate-400 text-[11px]">Допущение модели</td>
                <td className="p-2.5 text-amber-300 font-bold text-[11px]">Показатель мощности обслуживания, а не 72 учреждения!</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Critical Methodological Limitations */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
        <h3 className="font-bold text-sm text-white flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-400" />
          <span>Ключевые методические ограничения исходной модели</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
            <span className="font-bold text-slate-200">1. Ограничение знаменателя (площадь участка):</span>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              {MODEL_METADATA.areaDenominatorNotice}
            </p>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
            <span className="font-bold text-slate-200">2. Возрастные когорты населения:</span>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              {MODEL_METADATA.ageGroupMethodNotice}
            </p>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
            <span className="font-bold text-slate-200">3. Вместимость объекта vs Потребность ЖК:</span>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Спрос 456 школьных мест — это суммарная потребность жителей. Нормативная мощность отдельной новой школы — от 500 мест. Потребность может закрываться пристройкой к существующей СОШ либо объектом на 550 мест.
            </p>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
            <span className="font-bold text-slate-200">4. Статус нулей в существующих мощностях:</span>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              По умолчанию нули в ячейках C9, C10, C11 означают: «Сценарно принято отсутствие свободного резерва». Это сценарное допущение, а не установленный факт.
            </p>
          </div>
        </div>
      </div>

      {/* Collapsed Extensions Block (Transport, Retail, Engineering) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
        <button
          onClick={() => setShowExtensions(!showExtensions)}
          className="w-full flex items-center justify-between text-left"
        >
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-slate-400" />
            <div>
              <h3 className="font-bold text-sm text-white">
                Расширения модели (транспорт, торговля, сети)
              </h3>
              <p className="text-[11px] text-slate-500">
                Методики, отсутствующие в книге prostaia_model_kommentarii_ot_08112026-2.xlsx
              </p>
            </div>
          </div>
          {showExtensions ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </button>

        {showExtensions && (
          <div className="pt-3 border-t border-slate-800 space-y-3 text-xs animate-in fade-in">
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 space-y-2">
              <div className="text-amber-300 font-bold">
                В исходной Excel-книге НЕТ формул для следующих разделов:
              </div>
              <ul className="list-disc list-inside space-y-1 text-slate-400 text-[11px]">
                <li><strong className="text-slate-200">Транспортный спрос:</strong> генерация корреспонденций (автопоездок и поездок на ОТ) — методика не подключена.</li>
                <li><strong className="text-slate-200">Загрузка УДС и перекрёстков:</strong> требуются интенсивности движения и транспортная макромодель.</li>
                <li><strong className="text-slate-200">Торговля и бытовое обслуживание:</strong> требуются отраслевые удельные коэффициенты площади.</li>
                <li><strong className="text-slate-200">Инженерные сети (вода, тепло, электричество, газ):</strong> требуются удельные нагрузки на 1 м² жилья и техусловия ресурсоснабжающих организаций.</li>
              </ul>
            </div>

            <div className="p-3 bg-rose-950/20 border border-rose-500/30 rounded-xl text-[11px] text-rose-300">
              <strong>Предостережение:</strong> Числа из других кейсов (1800 квартир, 4650 жителей, 410 мест ДС, 620 мест школ, 780 автопоездок, 1050 поездок на ОТ) <u>не относятся</u> к текущей модели и не выводятся в результатах расчета СитиОК.
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
