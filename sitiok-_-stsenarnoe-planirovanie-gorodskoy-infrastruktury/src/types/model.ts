/**
 * Data contracts and type definitions for CityOK Urban Planning Calculator
 * Based on Excel model: prostaia_model_kommentarii_ot_08112026-2.xlsx (Лист1)
 */

export type CalculationMode = 'excel' | 'household';

export type QualityProvenance = 'fact' | 'norm' | 'assumption';
export type QualityStatus = 'fact' | 'estimate' | 'no_data';

export interface ReserveInput {
  value: number | null; // null if no_data
  qualityStatus: QualityStatus; // fact, estimate, no_data
  provenance: QualityProvenance; // fact, norm, assumption
  sourceNotes?: string;
}

export interface ModelInputs {
  // C2 - Площадь участка, га
  siteAreaHa: number;
  // C3 - Этажность
  floors: number;
  // C4 - Коэффициент застройки (0 < Kз <= 1)
  buildingRatio: number;
  // C5 - Средняя площадь квартиры, м²
  avgApartmentArea: number;
  // C6 - Коэффициент семейственности, чел./квартиру
  householdSize: number;
  // C7 - Ориентир озеленения, м²/чел.
  greeningNorm: number;
  // C8 - Жилищная обеспеченность, м²/чел.
  housingProvision: number;
  // C9 - Существующие места в детсаду
  existingKindergarten: ReserveInput;
  // C10 - Существующие места в школе
  existingSchool: ReserveInput;
  // C11 - Существующие постоянные машиноместа
  existingParkingPermanent: ReserveInput;
  // E2 - Доля детей 0–7 лет (доля, e.g. 0.07)
  shareKids0to7: number;
  // E3 - Доля детей 7–18 лет (доля, e.g. 0.12)
  shareKids7to18: number;
  // Calculation mode: 'excel' (C17 = C14/C8) or 'household' (C17 = ROUND(C16*C6, 0))
  calculationMode: CalculationMode;
}

export interface CellValueExplanation {
  cell: string;
  name: string;
  value: number | null;
  formattedValue: string;
  unit: string;
  formula: string;
  formulaWithValues: string;
  assumptions: string[];
  benchmark?: BenchmarkCheck;
}

export interface BenchmarkCheck {
  code: string;
  name: string;
  targetValue: number;
  operator: '<=' | '>=' | '==';
  unit: string;
  status: 'compliant' | 'exceeded' | 'below' | 'neutral';
  statusLabel: 'Соответствует ориентиру модели' | 'Превышает ориентир модели' | 'Ниже ориентира модели';
  source: string;
  legalStatus: 'Требует нормативной верификации';
  notes: string;
}

export interface ModelOutputs {
  // E6 - Альтернативная жил. обеспеченность = C5 / C6 (м²/чел.)
  alternativeHousingProvision: number;

  // C13 - Площадь застройки, га: C2 * C4
  buildingFootprintHa: number;
  // C14 - Общая площадь жилья, м²: C13 * C3 * 10000
  totalHousingAreaM2: number;
  // C15 - Плотность застройки, тыс. м²/га: C14 / C2 / 1000
  buildingDensityThousandM2PerHa: number;
  // C16 - Количество квартир: ROUND(C14 / C5, 0)
  apartmentsCount: number;
  // C17 - Численность населения:
  // in 'excel' mode: C14 / C8
  // in 'household' mode: ROUND(C16 * C6, 0)
  population: number;
  populationRaw: number;
  // C18 - Плотность населения, чел./га: C17 / C2
  populationDensityPerHa: number;
  // C19 - Площадь озеленения, м²: C2 * 10000 * 0.25
  greeningAreaM2: number;
  // C20 - Обеспеченность озеленением, м²/чел.: C19 / C17
  greeningProvisionM2PerPerson: number;

  // C22 - Требуемые места в детсаду: ROUND(C17 * E2 * 0.85, 0)
  requiredKindergartenPlaces: number;
  // C23 - Требуемые места в школе: ROUND(C17 * E3 * 0.95, 0)
  requiredSchoolPlaces: number;
  // C24 - Требуемые постоянные машиноместа: ROUND(C14 / 80, 0)
  requiredParkingPermanent: number;
  // C25 - Требуемые временные машиноместа: ROUND(C14 / 560, 0)
  requiredParkingTemporary: number;
  // C26 - Требуемая мощность поликлинического обслуживания, посещений в смену: ROUND(C14 / 10000 * 6, 0)
  requiredClinicVisitsPerShift: number;

  // C28 - Баланс детсада: C22 - C9 (может быть отрицательным, в Excel не обрезается)
  rawBalanceKindergarten: number | null;
  // C29 - Баланс школы: C23 - C10
  rawBalanceSchool: number | null;
  // C30 - Баланс постоянных парковок: C24 - C11
  rawBalanceParkingPermanent: number | null;

  // UI-показатели (не подменяют Excel формулы):
  // Неудовлетворенная потребность = max(balance, 0)
  unmetKindergarten: number | null;
  unmetSchool: number | null;
  unmetParkingPermanent: number | null;

  // Остаток учтенного резерва = max(-balance, 0)
  remainingReserveKindergarten: number | null;
  remainingReserveSchool: number | null;
  remainingReserveParkingPermanent: number | null;

  // Проверки ориентиров
  benchmarks: {
    buildingDensity: BenchmarkCheck;
    populationDensity: BenchmarkCheck;
    greeningProvision: BenchmarkCheck;
  };

  // Метаданные и объяснения
  explanations: Record<string, CellValueExplanation>;
}

export interface Scenario {
  id: string;
  name: string;
  description: string;
  isBaseline?: boolean;
  createdAt: string;
  updatedAt: string;
  inputs: ModelInputs;
  polygonGeoJson?: any;
  polygonAreaHa?: number | null;
}

export interface InfrastructureFacility {
  id: string;
  name: string;
  type: 'school' | 'kindergarten' | 'parking' | 'clinic';
  coordinates: [number, number]; // [lat, lng]
  totalCapacity: number; // Общая вместимость
  currentLoad: number | null; // Текущая загрузка (null если неизвестна)
  availableReserve: number | null; // max(capacity - load, 0) только если оба известны!
  qualityStatus: QualityStatus;
  provenance: QualityProvenance;
  source: string;
  sourceDate: string;
  isIncludedInScenario: boolean;
  notes?: string;
}

export interface ValidationIssue {
  field: keyof ModelInputs | string;
  message: string;
  severity: 'error' | 'warning';
}

export interface RecommendationItem {
  id: string;
  problem: string;
  action: string;
  priority: 'high' | 'medium' | 'low';
  recommendedStage: string;
  rationale: string;
  source: string;
  limitation: string;
}

export interface ApiCalculateResponseEnvelope {
  data: {
    inputs: ModelInputs;
    outputs: ModelOutputs;
    recommendations: RecommendationItem[];
  };
  meta: {
    modelVersion: string;
    calculationMode: CalculationMode;
    executionMode: 'local_adapter';
    timestamp: string;
    durationMs: number;
  };
  status: 'ok' | 'validation_error';
  sources: Array<{ name: string; type: string; version: string }>;
  confidence: {
    type: 'deterministic';
    note: 'Точность вычисления не означает подтверждённость исходных данных';
  };
  validationErrors?: ValidationIssue[];
}
