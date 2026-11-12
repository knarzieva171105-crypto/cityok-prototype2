import { ModelInputs, Scenario, InfrastructureFacility } from '../types/model';

export const MODEL_METADATA = {
  name: 'СитиОК',
  subtitle: 'Сценарное планирование городской инфраструктуры',
  version: 'excel-2026-11-08',
  sourceWorkbook: 'prostaia_model_kommentarii_ot_08112026-2.xlsx',
  sourceSheet: 'Лист1',
  testTerritory: 'Приволжский район, г. Казань',
  constantNotice:
    'Предварительная сценарная оценка. Не является градостроительным заключением или статистическим прогнозом.',
  syntheticDataNotice:
    'Любые отображаемые точки инфраструктуры — синтетические демонстрационные данные, а не официальный реестр объектов капитального строительства.',
  ageGroupMethodNotice:
    'Возрастные доли 7% (0–7 лет) и 12% (7–18 лет) перенесены из исходной Excel-модели. Для официальных расчётов границы контингентов должны быть уточнены по демографической статистике и РНГП.',
  areaDenominatorNotice:
    'В модели общая площадь участка (C2) используется как знаменатель при расчёте плотностей. Применимость региональных нормативов градостроительного проектирования (РНГП) к конкретной территории требует отдельного правового анализа границ расчётного элемента.',
};

export const DEFAULT_EXCEL_INPUTS: ModelInputs = {
  siteAreaHa: 10,
  floors: 3,
  buildingRatio: 0.4,
  avgApartmentArea: 55,
  householdSize: 2.5,
  greeningNorm: 6,
  housingProvision: 30,
  existingKindergarten: {
    value: 0,
    qualityStatus: 'estimate',
    provenance: 'assumption',
    sourceNotes: 'Сценарно принято отсутствие доступного резерва',
  },
  existingSchool: {
    value: 0,
    qualityStatus: 'estimate',
    provenance: 'assumption',
    sourceNotes: 'Сценарно принято отсутствие доступного резерва',
  },
  existingParkingPermanent: {
    value: 0,
    qualityStatus: 'estimate',
    provenance: 'assumption',
    sourceNotes: 'Сценарно принято отсутствие доступного резерва',
  },
  shareKids0to7: 0.07,
  shareKids7to18: 0.12,
  calculationMode: 'excel',
};

export const PRESET_SCENARIOS: Scenario[] = [
  {
    id: 'scenario_a',
    name: 'А. Базовый Excel',
    description: 'Исходные параметры книги prostaia_model_kommentarii_ot_08112026-2.xlsx (10 га, 3 эт., Кз 0.4). Резерв сценарно принят равным нулю.',
    isBaseline: true,
    createdAt: '2026-11-08T00:00:00.000Z',
    updatedAt: '2026-11-08T00:00:00.000Z',
    inputs: { ...DEFAULT_EXCEL_INPUTS },
  },
  {
    id: 'scenario_b',
    name: 'B. Повышенная этажность',
    description: 'Все параметры как в базовом сценарии А, но этажность увеличена с 3 до 5 этажей. Демонстрирует рост нагрузки на инфраструктуру.',
    isBaseline: false,
    createdAt: '2026-11-08T00:00:00.000Z',
    updatedAt: '2026-11-08T00:00:00.000Z',
    inputs: {
      ...DEFAULT_EXCEL_INPUTS,
      floors: 5,
    },
  },
  {
    id: 'scenario_c',
    name: 'C. С инфраструктурой',
    description: 'Параметры как в сценарии А, но учтён сценарный резерв: 150 мест в детсаду, 300 в школе, 500 постоянных парковок. Демонстрирует снижение баланса дефицита.',
    isBaseline: false,
    createdAt: '2026-11-08T00:00:00.000Z',
    updatedAt: '2026-11-08T00:00:00.000Z',
    inputs: {
      ...DEFAULT_EXCEL_INPUTS,
      existingKindergarten: {
        value: 150,
        qualityStatus: 'estimate',
        provenance: 'assumption',
        sourceNotes: 'Сценарное допущение о наличии резерва в радиусе доступности',
      },
      existingSchool: {
        value: 300,
        qualityStatus: 'estimate',
        provenance: 'assumption',
        sourceNotes: 'Сценарное допущение о наличии свободных мест во 2-ю смену',
      },
      existingParkingPermanent: {
        value: 500,
        qualityStatus: 'estimate',
        provenance: 'assumption',
        sourceNotes: 'Сценарное допущение о строительстве примыкающего паркинга',
      },
    },
  },
];

export const BENCHMARK_DEFINITIONS = {
  buildingDensity: {
    code: 'C15_BENCHMARK',
    name: 'Предельная плотность застройки',
    targetValue: 12.0,
    operator: '<=' as const,
    unit: 'тыс. м²/га',
    source: 'Комментарий Excel-модели (ориентир г. Казань)',
    legalStatus: 'Требует нормативной верификации' as const,
    notes: 'Предельное значение коэффициента плотности застройки территории жилой зоны по комментариям к Excel.',
  },
  populationDensity: {
    code: 'C18_BENCHMARK',
    name: 'Предельная плотность населения',
    targetValue: 210.0,
    operator: '<=' as const,
    unit: 'чел./га',
    source: 'Комментарий Excel-модели (ориентир РНГП)',
    legalStatus: 'Требует нормативной верификации' as const,
    notes: 'Плотность населения жилого района. Превышение ориентира указывает на повышенную демографическую нагрузку.',
  },
  greeningProvision: {
    code: 'C20_BENCHMARK',
    name: 'Минимальная обеспеченность озеленением',
    targetValue: 6.0,
    operator: '>=' as const,
    unit: 'м²/чел.',
    source: 'Комментарий Excel-модели (ориентир C7)',
    legalStatus: 'Требует нормативной верификации' as const,
    notes: 'Площадь озелененных территорий общего пользования микрорайона на одного жителя.',
  },
};

/**
 * Synthetic demonstration facilities in Privolzhsky District, Kazan
 * Coordinate center: ~55.748 N, 49.195 E
 */
export const SYNTHETIC_DEMO_FACILITIES: InfrastructureFacility[] = [
  {
    id: 'syn_sch_1',
    name: 'СОШ №138 (демо-объект)',
    type: 'school',
    coordinates: [55.7505, 49.1995],
    totalCapacity: 800,
    currentLoad: 720,
    availableReserve: 80, // 800 - 720
    qualityStatus: 'estimate',
    provenance: 'assumption',
    source: 'Синтетические данные СитиОК (демонстрация)',
    sourceDate: '2026-11-08',
    isIncludedInScenario: false,
    notes: 'Демонстрационная точка. Текущая загрузка 720 из 800, доступный резерв 80 мест.',
  },
  {
    id: 'syn_sch_2',
    name: 'Гимназия №19 (демо-объект)',
    type: 'school',
    coordinates: [55.7435, 49.1865],
    totalCapacity: 1100,
    currentLoad: 1150,
    availableReserve: 0, // Перегружена
    qualityStatus: 'estimate',
    provenance: 'assumption',
    source: 'Синтетические данные СитиОК (демонстрация)',
    sourceDate: '2026-11-08',
    isIncludedInScenario: false,
    notes: 'Объект работает с перегрузкой (1150 при мощности 1100). Резерв равен 0.',
  },
  {
    id: 'syn_sch_unknown',
    name: 'Лицей Приволжский (неизвестная загрузка)',
    type: 'school',
    coordinates: [55.7540, 49.1920],
    totalCapacity: 600,
    currentLoad: null, // Неизвестно!
    availableReserve: null, // Должен быть null!
    qualityStatus: 'no_data',
    provenance: 'assumption',
    source: 'Синтетические данные СитиОК (демонстрация)',
    sourceDate: '2026-11-08',
    isIncludedInScenario: false,
    notes: 'Вместимость известна (600), но загрузка не зафиксирована. Резерв не определён (null).',
  },
  {
    id: 'syn_kinder_1',
    name: 'Детский сад №383 «Рябинушка» (демо-объект)',
    type: 'kindergarten',
    coordinates: [55.7472, 49.1910],
    totalCapacity: 220,
    currentLoad: 170,
    availableReserve: 50,
    qualityStatus: 'estimate',
    provenance: 'assumption',
    source: 'Синтетические данные СитиОК (демонстрация)',
    sourceDate: '2026-11-08',
    isIncludedInScenario: false,
    notes: 'Свободный резерв 50 мест по данным синтетической оценки.',
  },
  {
    id: 'syn_kinder_2',
    name: 'Детский сад №150 (демо-объект)',
    type: 'kindergarten',
    coordinates: [55.7512, 49.2040],
    totalCapacity: 180,
    currentLoad: 180,
    availableReserve: 0,
    qualityStatus: 'estimate',
    provenance: 'assumption',
    source: 'Синтетические данные СитиОК (демонстрация)',
    sourceDate: '2026-11-08',
    isIncludedInScenario: false,
    notes: 'Загружен на 100%. Свободных мест нет.',
  },
  {
    id: 'syn_park_1',
    name: 'Многоуровневый паркинг Дубравная (демо-объект)',
    type: 'parking',
    coordinates: [55.7460, 49.1980],
    totalCapacity: 600,
    currentLoad: 250,
    availableReserve: 350,
    qualityStatus: 'estimate',
    provenance: 'assumption',
    source: 'Синтетические данные СитиОК (демонстрация)',
    sourceDate: '2026-11-08',
    isIncludedInScenario: false,
    notes: 'Резерв коммерческих постоянных машиномест: 350 м/м.',
  },
];
