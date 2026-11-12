import { ModelInputs, ModelOutputs, Scenario } from '../types/model';
import { roundExcel } from '../calculationEngine/engine';

export interface ExplanationAnswer {
  questionId: string;
  question: string;
  shortSummary: string;
  details: string[];
  formulaBlock?: {
    formula: string;
    calculation: string;
    result: string;
  };
  notes?: string;
}

export function getPresetExplanations(
  inputs: ModelInputs,
  outputs: ModelOutputs,
  compareScenario?: Scenario | null
): ExplanationAnswer[] {
  return [
    // 1. Откуда взялось население?
    {
      questionId: 'q_population_origin',
      question: 'Откуда взялось население?',
      shortSummary:
        inputs.calculationMode === 'excel'
          ? `Население (${outputs.population.toLocaleString('ru-RU')} чел.) рассчитано по формуле Excel C17 = C14 / C8 (Общая площадь жилья / Жилищная обеспеченность).`
          : `Население (${outputs.population.toLocaleString('ru-RU')} чел.) рассчитано по формуле расширения: Количество квартир (C16) × Семейственность (C6).`,
      details: [
        `Общая площадь жилья C14: ${outputs.totalHousingAreaM2.toLocaleString('ru-RU')} м² (получена как площадь застройки C13: ${outputs.buildingFootprintHa} га × этажность C3: ${inputs.floors} эт. × 10 000).`,
        inputs.calculationMode === 'excel'
          ? `Нормативная жилищная обеспеченность C8: ${inputs.housingProvision} м²/чел.`
          : `Количество квартир C16: ${outputs.apartmentsCount.toLocaleString('ru-RU')} шт., коэффициент семейственности C6: ${inputs.householdSize} чел./кв.`,
        inputs.calculationMode === 'excel'
          ? `Обратите внимание: в основном режиме Excel коэффициент семейственности (${inputs.householdSize} чел./кв.) НЕ используется в расчете населения C17. Он отражается лишь как альтернативный ориентир E6 = ${outputs.alternativeHousingProvision} м²/чел.`
          : `Внимание: режим семейственности является расширением модели СитиОК и отличается от базового алгоритма Excel Лист1.`,
      ],
      formulaBlock: {
        formula:
          inputs.calculationMode === 'excel'
            ? 'C17 = C14 / C8'
            : 'C17 = ROUND(C16 * C6, 0)',
        calculation:
          inputs.calculationMode === 'excel'
            ? `${outputs.totalHousingAreaM2.toLocaleString('ru-RU')} м² / ${inputs.housingProvision} м²/чел.`
            : `${outputs.apartmentsCount.toLocaleString('ru-RU')} кв. * ${inputs.householdSize} чел./кв.`,
        result: `${outputs.population.toLocaleString('ru-RU')} чел.`,
      },
      notes: 'Округление до целого числа жителей производится только при отображении в режиме Excel.',
    },

    // 2. Почему изменился спрос на детсад?
    {
      questionId: 'q_kindergarten_demand',
      question: 'Почему сформировался спрос на детсад?',
      shortSummary: `Потребность в ДОО (${outputs.requiredKindergartenPlaces} мест) прямо пропорциональна расчетному населению (${outputs.population.toLocaleString('ru-RU')} чел.) и доле детей 0–7 лет.`,
      details: [
        `Численность населения C17: ${outputs.population.toLocaleString('ru-RU')} чел.`,
        `Доля детей от 0 до 7 лет E2: ${(inputs.shareKids0to7 * 100).toFixed(1)}% (внутри модели хранится как ${inputs.shareKids0to7}).`,
        `Норматив охвата дошкольным образованием по модели: 85% (0.85).`,
        `Формула ячейки C22: ROUND(C17 × E2 × 0.85, 0).`,
      ],
      formulaBlock: {
        formula: 'C22 = ROUND(C17 * E2 * 0.85, 0)',
        calculation: `ROUND(${outputs.population.toLocaleString('ru-RU')} * ${inputs.shareKids0to7} * 0.85, 0)`,
        result: `${outputs.requiredKindergartenPlaces} мест`,
      },
      notes: 'Любое изменение этажности, площади участка или нормы жил. обеспеченности пропорционально меняет нагрузку на садики.',
    },

    // 3. Почему семейственность не влияет в режиме Excel?
    {
      questionId: 'q_household_independence',
      question: 'Почему семейственность не влияет в режиме Excel?',
      shortSummary:
        'В оригинальной книге prostaia_model_kommentarii_ot_08112026-2.xlsx формула населения C17 строго равна C14 / C8 (жилье / 30 м²).',
      details: [
        'Ячейка C6 (коэффициент семейственности, по умолчанию 2.5) заложена автором модели, но в ячейке C17 не фигурирует.',
        'Единственное место, где используется C6 — дополнительная формула ячейки E6 = C5 / C6 (средняя площадь квартиры / семейственность = 55 / 2.5 = 22 м²/чел.).',
        'Показатель E6 представляет собой расчетную жилищную обеспеченность домохозяйства, но автор модели для прогноза жителей применил норматив C8 = 30 м²/чел.',
        'Чтобы проверить влияние семейственности на население, переключите переключатель модели в режим «По семейственности — расширение модели».',
      ],
      formulaBlock: {
        formula: 'C17 = C14 / C8 (в формуле нет C6)',
        calculation: `${outputs.totalHousingAreaM2.toLocaleString('ru-RU')} / ${inputs.housingProvision}`,
        result: `${outputs.population.toLocaleString('ru-RU')} чел.`,
      },
    },

    // 4. Почему нельзя определить дефицит?
    {
      questionId: 'q_no_data_reason',
      question: 'Почему нельзя определить дефицит, если статус данных «no_data»?',
      shortSummary:
        'Дефицит — это разница между подтверждённым доступным резервом и потребностью. Если резерв неизвестен, дефицит математически не определён (null).',
      details: [
        'Потребность нового ЖК рассчитывается детерминированно из параметров застройки (например, школа = 456 мест).',
        'Однако существующий доступный резерв в близлежащих школах или детсадах не может быть автоматически принят за ноль как установленный факт.',
        'Если известна только номинальная мощность школы (например, 800 мест), но нет данных о реальной загрузке по сменам, то свободный резерв равен null.',
        'В модели СитиОК при статусе no_data выводится: «Дефицит не определён: нет данных о доступном резерве», чтобы не вводить проектировщиков в заблуждение.',
      ],
      notes: 'Для устранения неопределённости необходимо провести опрос районного отдела образования.',
    },

    // 5. Чем отличаются потребность и вместимость объекта?
    {
      questionId: 'q_capacity_vs_demand',
      question: 'Чем отличаются совокупная потребность ЖК и вместимость отдельного объекта?',
      shortSummary:
        'Потребность ЖК (например, 456 школьных мест) — это суммарный спрос будущих жителей. Нормативная вместимость здания школы (от 500 мест) — это строительный модуль.',
      details: [
        'Потребность 456 мест означает, что детям из нового ЖК суммарно требуется 456 парт.',
        'Ориентир модели для нового отдельно стоящего здания школы гласит: «Вместимость отдельного объекта не менее 500 мест».',
        'Следовательно, 456 мест НЕ означает автоматически строительство школы меньшей мощности вопреки нормативам.',
        'Градостроитель должен рассмотреть варианты: а) пристройка к соседней школе на 456 мест, б) строительство полноценной школы на 550 или 800 мест с учетом перспективного развития прилегающих кварталов, в) межквартальное соглашение КРТ.',
        'Аналогично для детсадов: спрос 238 мест укладывается в предельный норматив отдельного ДОО (не более 350 мест) либо делится на два ДОО по 120 мест.',
      ],
    },

    // 6. Сравнение сценариев
    {
      questionId: 'q_scenario_diff',
      question: 'Какие параметры изменились между сценариями?',
      shortSummary: compareScenario
        ? `Сравнение текущего расчета со сценарием «${compareScenario.name}».`
        : 'Выберите сценарий для детального пошагового сопоставления параметров.',
      details: compareScenario
        ? [
            `Этажность: ${inputs.floors} эт. против ${compareScenario.inputs.floors} эт. (дельта: ${inputs.floors - compareScenario.inputs.floors} эт.)`,
            `Площадь участка: ${inputs.siteAreaHa} га против ${compareScenario.inputs.siteAreaHa} га`,
            `Общая площадь жилья: ${outputs.totalHousingAreaM2.toLocaleString('ru-RU')} м² против ${(compareScenario.inputs.siteAreaHa * compareScenario.inputs.buildingRatio * compareScenario.inputs.floors * 10000).toLocaleString('ru-RU')} м²`,
            `Резерв детсада: ${inputs.existingKindergarten.value ?? 'нет данных'} против ${compareScenario.inputs.existingKindergarten.value ?? 'нет данных'}`,
            `Резерв школы: ${inputs.existingSchool.value ?? 'нет данных'} против ${compareScenario.inputs.existingSchool.value ?? 'нет данных'}`,
          ]
        : ['В разделе «Сравнение сценариев» доступно одновременное сопоставление до 3-х сценариев застройки с абсолютными и относительными изменениями.'],
    },
  ];
}
