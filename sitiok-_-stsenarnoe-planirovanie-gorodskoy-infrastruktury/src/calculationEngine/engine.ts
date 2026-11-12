import {
  ModelInputs,
  ModelOutputs,
  BenchmarkCheck,
  CellValueExplanation,
} from '../types/model';
import { BENCHMARK_DEFINITIONS } from '../constants/modelConfig';

/**
 * Excel-compatible ROUND function
 * Math.round implements standard round half away from zero for positive numbers
 */
export function roundExcel(val: number, decimals: number = 0): number {
  if (!isFinite(val) || isNaN(val)) return 0;
  const factor = Math.pow(10, decimals);
  return Math.round(val * factor) / factor;
}

/**
 * Pure calculation engine for CityOK
 * Exactly mirrors formulas from prostaia_model_kommentarii_ot_08112026-2.xlsx
 */
export function calculateModel(inputs: ModelInputs): ModelOutputs {
  const {
    siteAreaHa,
    floors,
    buildingRatio,
    avgApartmentArea,
    householdSize,
    housingProvision,
    existingKindergarten,
    existingSchool,
    existingParkingPermanent,
    shareKids0to7,
    shareKids7to18,
    calculationMode,
  } = inputs;

  // Zero and negative divisor protections
  const safeSiteArea = siteAreaHa > 0 ? siteAreaHa : 0.0001;
  const safeAvgAptArea = avgApartmentArea > 0 ? avgApartmentArea : 1;
  const safeHouseholdSize = householdSize > 0 ? householdSize : 1;
  const safeHousingProvision = housingProvision > 0 ? housingProvision : 1;

  // E6: Альтернативная жил. обеспеченность = C5 / C6
  const alternativeHousingProvision = roundExcel(safeAvgAptArea / safeHouseholdSize, 2);

  // C13: Площадь застройки, га = C2 * C4
  const buildingFootprintHa = siteAreaHa * buildingRatio;

  // C14: Общая площадь жилья, м² = C13 * C3 * 10000
  const totalHousingAreaM2 = buildingFootprintHa * floors * 10000;

  // C15: Плотность застройки, тыс. м²/га = C14 / C2 / 1000
  const buildingDensityThousandM2PerHa =
    siteAreaHa > 0 ? totalHousingAreaM2 / safeSiteArea / 1000 : 0;

  // C16: Количество квартир = ROUND(C14 / C5, 0)
  const apartmentsCount = roundExcel(totalHousingAreaM2 / safeAvgAptArea, 0);

  // C17: Численность населения
  let populationRaw: number;
  let population: number;

  if (calculationMode === 'household') {
    // Режим "По семейственности - расширение модели":
    // population = ROUND(apartmentCount * householdSize, 0)
    populationRaw = apartmentsCount * safeHouseholdSize;
    population = roundExcel(populationRaw, 0);
  } else {
    // Режим "По жилищной обеспеченности - как в Excel":
    // population = C14 / C8
    populationRaw = totalHousingAreaM2 / safeHousingProvision;
    population = populationRaw; // В Excel не оборачивается в ROUND на уровне C17
  }

  // C18: Плотность населения, чел./га = C17 / C2
  const populationDensityPerHa =
    siteAreaHa > 0 ? population / safeSiteArea : 0;

  // C19: Площадь озеленения, м² = C2 * 10000 * 0.25
  const greeningAreaM2 = siteAreaHa * 10000 * 0.25;

  // C20: Обеспеченность озеленением, м²/чел. = C19 / C17
  const greeningProvisionM2PerPerson =
    population > 0 ? greeningAreaM2 / population : 0;

  // C22: Требуемые места в детсаду = ROUND(C17 * E2 * 0.85, 0)
  const requiredKindergartenPlaces = roundExcel(population * shareKids0to7 * 0.85, 0);

  // C23: Требуемые места в школе = ROUND(C17 * E3 * 0.95, 0)
  const requiredSchoolPlaces = roundExcel(population * shareKids7to18 * 0.95, 0);

  // C24: Требуемые постоянные машиноместа = ROUND(C14 / 80, 0)
  const requiredParkingPermanent = roundExcel(totalHousingAreaM2 / 80, 0);

  // C25: Требуемые временные машиноместа = ROUND(C14 / 560, 0)
  const requiredParkingTemporary = roundExcel(totalHousingAreaM2 / 560, 0);

  // C26: Требуемая мощность поликлинического обслуживания = ROUND(C14 / 10000 * 6, 0)
  const requiredClinicVisitsPerShift = roundExcel((totalHousingAreaM2 / 10000) * 6, 0);

  // C28: Баланс детсада = C22 - C9
  let rawBalanceKindergarten: number | null = null;
  let unmetKindergarten: number | null = null;
  let remainingReserveKindergarten: number | null = null;

  if (existingKindergarten.qualityStatus !== 'no_data' && existingKindergarten.value !== null) {
    rawBalanceKindergarten = requiredKindergartenPlaces - existingKindergarten.value;
    unmetKindergarten = Math.max(0, rawBalanceKindergarten);
    remainingReserveKindergarten = Math.max(0, -rawBalanceKindergarten);
  }

  // C29: Баланс школы = C23 - C10
  let rawBalanceSchool: number | null = null;
  let unmetSchool: number | null = null;
  let remainingReserveSchool: number | null = null;

  if (existingSchool.qualityStatus !== 'no_data' && existingSchool.value !== null) {
    rawBalanceSchool = requiredSchoolPlaces - existingSchool.value;
    unmetSchool = Math.max(0, rawBalanceSchool);
    remainingReserveSchool = Math.max(0, -rawBalanceSchool);
  }

  // C30: Баланс постоянных парковок = C24 - C11
  let rawBalanceParkingPermanent: number | null = null;
  let unmetParkingPermanent: number | null = null;
  let remainingReserveParkingPermanent: number | null = null;

  if (existingParkingPermanent.qualityStatus !== 'no_data' && existingParkingPermanent.value !== null) {
    rawBalanceParkingPermanent = requiredParkingPermanent - existingParkingPermanent.value;
    unmetParkingPermanent = Math.max(0, rawBalanceParkingPermanent);
    remainingReserveParkingPermanent = Math.max(0, -rawBalanceParkingPermanent);
  }

  // Проверки ориентиров модели
  const densityBenchDef = BENCHMARK_DEFINITIONS.buildingDensity;
  const buildingDensityBenchmark: BenchmarkCheck = {
    ...densityBenchDef,
    status:
      buildingDensityThousandM2PerHa <= densityBenchDef.targetValue
        ? 'compliant'
        : 'exceeded',
    statusLabel:
      buildingDensityThousandM2PerHa <= densityBenchDef.targetValue
        ? 'Соответствует ориентиру модели'
        : 'Превышает ориентир модели',
  };

  const popDensityBenchDef = BENCHMARK_DEFINITIONS.populationDensity;
  const populationDensityBenchmark: BenchmarkCheck = {
    ...popDensityBenchDef,
    status:
      populationDensityPerHa <= popDensityBenchDef.targetValue
        ? 'compliant'
        : 'exceeded',
    statusLabel:
      populationDensityPerHa <= popDensityBenchDef.targetValue
        ? 'Соответствует ориентиру модели'
        : 'Превышает ориентир модели',
  };

  const greeningBenchDef = BENCHMARK_DEFINITIONS.greeningProvision;
  const greeningProvisionBenchmark: BenchmarkCheck = {
    ...greeningBenchDef,
    status:
      greeningProvisionM2PerPerson >= greeningBenchDef.targetValue
        ? 'compliant'
        : 'below',
    statusLabel:
      greeningProvisionM2PerPerson >= greeningBenchDef.targetValue
        ? 'Соответствует ориентиру модели'
        : 'Ниже ориентира модели',
  };

  // Пояснения к каждой расчетной ячейке
  const explanations: Record<string, CellValueExplanation> = {
    C13: {
      cell: 'C13',
      name: 'Площадь застройки',
      value: buildingFootprintHa,
      formattedValue: `${roundExcel(buildingFootprintHa, 2).toLocaleString('ru-RU')} га`,
      unit: 'га',
      formula: 'C2 * C4',
      formulaWithValues: `${siteAreaHa} га * ${buildingRatio}`,
      assumptions: ['Произведение площади участка и коэффициента застройки'],
    },
    C14: {
      cell: 'C14',
      name: 'Общая площадь жилья',
      value: totalHousingAreaM2,
      formattedValue: `${roundExcel(totalHousingAreaM2, 0).toLocaleString('ru-RU')} м²`,
      unit: 'м²',
      formula: 'C13 * C3 * 10000',
      formulaWithValues: `${buildingFootprintHa} га * ${floors} эт. * 10000`,
      assumptions: [
        'Множитель 10 000 переводит гектары в квадратные метры',
        'Предполагается равномерная этажность по всей площади застройки',
      ],
    },
    C15: {
      cell: 'C15',
      name: 'Плотность застройки',
      value: buildingDensityThousandM2PerHa,
      formattedValue: `${roundExcel(buildingDensityThousandM2PerHa, 2).toLocaleString('ru-RU')} тыс. м²/га`,
      unit: 'тыс. м²/га',
      formula: 'C14 / C2 / 1000',
      formulaWithValues: `${totalHousingAreaM2} м² / ${siteAreaHa} га / 1000`,
      assumptions: [
        'Делитель 1000 переводит м² в тысячи м²',
        'Знаменателем выступает вся территория участка C2',
      ],
      benchmark: buildingDensityBenchmark,
    },
    C16: {
      cell: 'C16',
      name: 'Количество квартир',
      value: apartmentsCount,
      formattedValue: `${apartmentsCount.toLocaleString('ru-RU')}`,
      unit: 'кв.',
      formula: 'ROUND(C14 / C5, 0)',
      formulaWithValues: `ROUND(${totalHousingAreaM2} м² / ${avgApartmentArea} м², 0)`,
      assumptions: ['Округление по стандартному правилу Excel до целого числа квартир'],
    },
    C17: {
      cell: 'C17',
      name: 'Численность населения',
      value: population,
      formattedValue: `${roundExcel(population, 0).toLocaleString('ru-RU')} чел.`,
      unit: 'чел.',
      formula:
        calculationMode === 'household'
          ? 'ROUND(C16 * C6, 0) [Расширение: по семейственности]'
          : 'C14 / C8 [Excel: по жилищной обеспеченности]',
      formulaWithValues:
        calculationMode === 'household'
          ? `ROUND(${apartmentsCount} кв. * ${householdSize} чел./кв., 0)`
          : `${totalHousingAreaM2} м² / ${housingProvision} м²/чел.`,
      assumptions:
        calculationMode === 'household'
          ? [
              'Расширение модели: численность определена через среднюю семейственность (C6)',
              'Исходная формула Excel C14/C8 временно отключена',
            ]
          : [
              'Основной режим Excel: численность определена строго через нормативную жил. обеспеченность C8 = 30 м²/чел.',
              'Коэффициент семейственности C6 НЕ участвует в расчете населения данного режима',
            ],
    },
    C18: {
      cell: 'C18',
      name: 'Плотность населения',
      value: populationDensityPerHa,
      formattedValue: `${roundExcel(populationDensityPerHa, 1).toLocaleString('ru-RU')} чел./га`,
      unit: 'чел./га',
      formula: 'C17 / C2',
      formulaWithValues: `${roundExcel(population, 0)} чел. / ${siteAreaHa} га`,
      assumptions: ['Отношение расчетного населения ко всей территории земельного участка'],
      benchmark: populationDensityBenchmark,
    },
    C19: {
      cell: 'C19',
      name: 'Площадь озеленения',
      value: greeningAreaM2,
      formattedValue: `${roundExcel(greeningAreaM2, 0).toLocaleString('ru-RU')} м²`,
      unit: 'м²',
      formula: 'C2 * 10000 * 0.25',
      formulaWithValues: `${siteAreaHa} га * 10000 * 0.25`,
      assumptions: ['В формуле Excel принято нормативное выделение 25% территории участка под озеленение'],
    },
    C20: {
      cell: 'C20',
      name: 'Обеспеченность озеленением',
      value: greeningProvisionM2PerPerson,
      formattedValue: `${roundExcel(greeningProvisionM2PerPerson, 2).toLocaleString('ru-RU')} м²/чел.`,
      unit: 'м²/чел.',
      formula: 'C19 / C17',
      formulaWithValues: `${greeningAreaM2} м² / ${roundExcel(population, 0)} чел.`,
      assumptions: ['Отношение нормативной площади озеленения к расчетному числу жителей'],
      benchmark: greeningProvisionBenchmark,
    },
    C22: {
      cell: 'C22',
      name: 'Требуемые места в детсаду',
      value: requiredKindergartenPlaces,
      formattedValue: `${requiredKindergartenPlaces.toLocaleString('ru-RU')} мест`,
      unit: 'мест',
      formula: 'ROUND(C17 * E2 * 0.85, 0)',
      formulaWithValues: `ROUND(${roundExcel(population, 0)} * ${shareKids0to7} * 0.85, 0)`,
      assumptions: [
        'Охват детей дошкольного возраста (0–7 лет) принят 85%',
        'Результат округляется до целых мест',
      ],
    },
    C23: {
      cell: 'C23',
      name: 'Требуемые места в школе',
      value: requiredSchoolPlaces,
      formattedValue: `${requiredSchoolPlaces.toLocaleString('ru-RU')} мест`,
      unit: 'мест',
      formula: 'ROUND(C17 * E3 * 0.95, 0)',
      formulaWithValues: `ROUND(${roundExcel(population, 0)} * ${shareKids7to18} * 0.95, 0)`,
      assumptions: [
        'Норматив охвата принят 95% (95 мест на 100 детей 7–18 лет)',
        'Округляется до целых мест',
      ],
    },
    C24: {
      cell: 'C24',
      name: 'Требуемые постоянные машиноместа',
      value: requiredParkingPermanent,
      formattedValue: `${requiredParkingPermanent.toLocaleString('ru-RU')} м/м`,
      unit: 'м/м',
      formula: 'ROUND(C14 / 80, 0)',
      formulaWithValues: `ROUND(${totalHousingAreaM2} м² / 80, 0)`,
      assumptions: ['Норматив: 1 постоянное машиноместо на 80 м² общей площади жилья'],
    },
    C25: {
      cell: 'C25',
      name: 'Требуемые временные машиноместа',
      value: requiredParkingTemporary,
      formattedValue: `${requiredParkingTemporary.toLocaleString('ru-RU')} м/м`,
      unit: 'м/м',
      formula: 'ROUND(C14 / 560, 0)',
      formulaWithValues: `ROUND(${totalHousingAreaM2} м² / 560, 0)`,
      assumptions: ['Норматив: 1 гостевое (временное) машиноместо на 560 м² общей площади жилья'],
    },
    C26: {
      cell: 'C26',
      name: 'Поликлиническое обслуживание (мощность)',
      value: requiredClinicVisitsPerShift,
      formattedValue: `${requiredClinicVisitsPerShift.toLocaleString('ru-RU')} пос./смену`,
      unit: 'посещений в смену',
      formula: 'ROUND(C14 / 10000 * 6, 0)',
      formulaWithValues: `ROUND(${totalHousingAreaM2} / 10000 * 6, 0)`,
      assumptions: [
        'Внимание: 72 посещения в смену — это показатель мощности обслуживания, а не 72 учреждения поликлиники!',
        'Норматив: 6 посещений в смену на каждые 10 000 м² жилья',
      ],
    },
    C28: {
      cell: 'C28',
      name: 'Баланс мест в детсаду',
      value: rawBalanceKindergarten,
      formattedValue:
        rawBalanceKindergarten !== null
          ? `${rawBalanceKindergarten > 0 ? `Дефицит ${rawBalanceKindergarten}` : `Резерв ${Math.abs(rawBalanceKindergarten)}`} мест`
          : 'Данных нет',
      unit: 'мест',
      formula: 'C22 - C9',
      formulaWithValues:
        rawBalanceKindergarten !== null
          ? `${requiredKindergartenPlaces} - ${existingKindergarten.value ?? 0}`
          : 'Спрос C22 рассчитан, но данные C9 отсутствуют (no_data)',
      assumptions: [
        'В исходном Excel отрицательный баланс не обрезается до нуля',
        existingKindergarten.qualityStatus === 'no_data'
          ? 'Данных о резерве нет (no_data): баланс не определён'
          : 'Используется сценарный или подтвержденный резерв',
      ],
    },
    C29: {
      cell: 'C29',
      name: 'Баланс мест в школе',
      value: rawBalanceSchool,
      formattedValue:
        rawBalanceSchool !== null
          ? `${rawBalanceSchool > 0 ? `Дефицит ${rawBalanceSchool}` : `Резерв ${Math.abs(rawBalanceSchool)}`} мест`
          : 'Данных нет',
      unit: 'мест',
      formula: 'C23 - C10',
      formulaWithValues:
        rawBalanceSchool !== null
          ? `${requiredSchoolPlaces} - ${existingSchool.value ?? 0}`
          : 'Спрос C23 рассчитан, но данные C10 отсутствуют (no_data)',
      assumptions: [
        'В исходном Excel отрицательный баланс не обрезается до нуля',
        existingSchool.qualityStatus === 'no_data'
          ? 'Данных о резерве нет (no_data): баланс не определён'
          : 'Используется сценарный или подтвержденный резерв',
      ],
    },
    C30: {
      cell: 'C30',
      name: 'Баланс постоянных парковок',
      value: rawBalanceParkingPermanent,
      formattedValue:
        rawBalanceParkingPermanent !== null
          ? `${rawBalanceParkingPermanent > 0 ? `Дефицит ${rawBalanceParkingPermanent}` : `Резерв ${Math.abs(rawBalanceParkingPermanent)}`} м/м`
          : 'Данных нет',
      unit: 'м/м',
      formula: 'C24 - C11',
      formulaWithValues:
        rawBalanceParkingPermanent !== null
          ? `${requiredParkingPermanent} - ${existingParkingPermanent.value ?? 0}`
          : 'Спрос C24 рассчитан, но данные C11 отсутствуют (no_data)',
      assumptions: [
        'В исходном Excel отрицательный баланс не обрезается до нуля',
        existingParkingPermanent.qualityStatus === 'no_data'
          ? 'Данных о резерве нет (no_data): баланс не определён'
          : 'Используется сценарный или подтвержденный резерв',
      ],
    },
    E6: {
      cell: 'E6',
      name: 'Альтернативная жил. обеспеченность',
      value: alternativeHousingProvision,
      formattedValue: `${alternativeHousingProvision.toLocaleString('ru-RU')} м²/чел.`,
      unit: 'м²/чел.',
      formula: 'C5 / C6',
      formulaWithValues: `${avgApartmentArea} м² / ${householdSize} чел./кв.`,
      assumptions: [
        'E6 — дополнительный аналитический показатель, следующий из средней квартиры и семейственности (55 / 2.5 = 22 м²/чел.)',
        'В основном режиме Excel формула населения C17 = C14 / C8 использует нормативную обеспеченность C8 = 30 м²/чел., а не показатель E6',
      ],
    },
  };

  return {
    alternativeHousingProvision,
    buildingFootprintHa: roundExcel(buildingFootprintHa, 4),
    totalHousingAreaM2: roundExcel(totalHousingAreaM2, 2),
    buildingDensityThousandM2PerHa: roundExcel(buildingDensityThousandM2PerHa, 4),
    apartmentsCount,
    population: roundExcel(population, 2),
    populationRaw,
    populationDensityPerHa: roundExcel(populationDensityPerHa, 2),
    greeningAreaM2: roundExcel(greeningAreaM2, 2),
    greeningProvisionM2PerPerson: roundExcel(greeningProvisionM2PerPerson, 4),
    requiredKindergartenPlaces,
    requiredSchoolPlaces,
    requiredParkingPermanent,
    requiredParkingTemporary,
    requiredClinicVisitsPerShift,
    rawBalanceKindergarten,
    rawBalanceSchool,
    rawBalanceParkingPermanent,
    unmetKindergarten,
    unmetSchool,
    unmetParkingPermanent,
    remainingReserveKindergarten,
    remainingReserveSchool,
    remainingReserveParkingPermanent,
    benchmarks: {
      buildingDensity: buildingDensityBenchmark,
      populationDensity: populationDensityBenchmark,
      greeningProvision: greeningProvisionBenchmark,
    },
    explanations,
  };
}
