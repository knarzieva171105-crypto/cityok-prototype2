import { ModelInputs, ValidationIssue } from '../types/model';

export function validateModelInputs(inputs: ModelInputs): {
  isValid: boolean;
  errors: Record<string, string>;
  warnings: Record<string, string>;
  issues: ValidationIssue[];
} {
  const errors: Record<string, string> = {};
  const warnings: Record<string, string> = {};
  const issues: ValidationIssue[] = [];

  // C2: Площадь участка, га > 0
  if (inputs.siteAreaHa <= 0 || isNaN(inputs.siteAreaHa)) {
    const msg = 'Площадь участка должна быть строго больше нуля (> 0 га)';
    errors.siteAreaHa = msg;
    issues.push({ field: 'siteAreaHa', message: msg, severity: 'error' });
  } else if (inputs.siteAreaHa > 500) {
    const msg = 'Очень большая площадь участка (> 500 га). Убедитесь, что это отдельный планировочный элемент.';
    warnings.siteAreaHa = msg;
    issues.push({ field: 'siteAreaHa', message: msg, severity: 'warning' });
  }

  // C3: Этажность — целое положительное число
  if (!Number.isInteger(inputs.floors) || inputs.floors < 1) {
    const msg = 'Этажность должна быть целым положительным числом (≥ 1)';
    errors.floors = msg;
    issues.push({ field: 'floors', message: msg, severity: 'error' });
  } else if (inputs.floors > 50) {
    const msg = 'Этажность превышает 50 этажей. Проверьте градостроительный регламент зоны.';
    warnings.floors = msg;
    issues.push({ field: 'floors', message: msg, severity: 'warning' });
  }

  // C4: 0 < Коэффициент застройки <= 1
  if (inputs.buildingRatio <= 0 || inputs.buildingRatio > 1 || isNaN(inputs.buildingRatio)) {
    const msg = 'Коэффициент застройки должен быть в интервале (0, 1]';
    errors.buildingRatio = msg;
    issues.push({ field: 'buildingRatio', message: msg, severity: 'error' });
  } else if (inputs.buildingRatio > 0.6) {
    const msg = 'Коэффициент застройки > 0.6 может затруднить соблюдение нормативов благоустройства и пожарных проездов.';
    warnings.buildingRatio = msg;
    issues.push({ field: 'buildingRatio', message: msg, severity: 'warning' });
  }

  // C5: Средняя площадь квартиры > 0
  if (inputs.avgApartmentArea <= 0 || isNaN(inputs.avgApartmentArea)) {
    const msg = 'Средняя площадь квартиры должна быть больше нуля (> 0 м²)';
    errors.avgApartmentArea = msg;
    issues.push({ field: 'avgApartmentArea', message: msg, severity: 'error' });
  } else if (inputs.avgApartmentArea < 20) {
    const msg = 'Площадь квартиры менее 20 м² нетипична для капитального жилья.';
    warnings.avgApartmentArea = msg;
    issues.push({ field: 'avgApartmentArea', message: msg, severity: 'warning' });
  }

  // C6: Семейственность > 0
  if (inputs.householdSize <= 0 || isNaN(inputs.householdSize)) {
    const msg = 'Коэффициент семейственности должен быть больше нуля (> 0 чел./кв.)';
    errors.householdSize = msg;
    issues.push({ field: 'householdSize', message: msg, severity: 'error' });
  }

  // C7: Ориентир озеленения > 0
  if (inputs.greeningNorm <= 0 || isNaN(inputs.greeningNorm)) {
    const msg = 'Ориентир озеленения должен быть больше нуля';
    errors.greeningNorm = msg;
    issues.push({ field: 'greeningNorm', message: msg, severity: 'error' });
  }

  // C8: Жилищная обеспеченность > 0
  if (inputs.housingProvision <= 0 || isNaN(inputs.housingProvision)) {
    const msg = 'Жилищная обеспеченность должна быть больше нуля (> 0 м²/чел.)';
    errors.housingProvision = msg;
    issues.push({ field: 'housingProvision', message: msg, severity: 'error' });
  }

  // Существующие мощности: места и парковки >= 0
  if (inputs.existingKindergarten.value !== null && inputs.existingKindergarten.value < 0) {
    const msg = 'Количество мест в детсаду не может быть отрицательным';
    errors.existingKindergarten = msg;
    issues.push({ field: 'existingKindergarten', message: msg, severity: 'error' });
  }
  if (inputs.existingSchool.value !== null && inputs.existingSchool.value < 0) {
    const msg = 'Количество мест в школе не может быть отрицательным';
    errors.existingSchool = msg;
    issues.push({ field: 'existingSchool', message: msg, severity: 'error' });
  }
  if (inputs.existingParkingPermanent.value !== null && inputs.existingParkingPermanent.value < 0) {
    const msg = 'Количество машиномест не может быть отрицательным';
    errors.existingParkingPermanent = msg;
    issues.push({ field: 'existingParkingPermanent', message: msg, severity: 'error' });
  }

  // Доли возрастов: от 0 до 1
  if (inputs.shareKids0to7 < 0 || inputs.shareKids0to7 > 1) {
    const msg = 'Доля детей 0–7 лет должна быть в диапазоне от 0 до 1 (0%..100%)';
    errors.shareKids0to7 = msg;
    issues.push({ field: 'shareKids0to7', message: msg, severity: 'error' });
  }
  if (inputs.shareKids7to18 < 0 || inputs.shareKids7to18 > 1) {
    const msg = 'Доля детей 7–18 лет должна быть в диапазоне от 0 до 1 (0%..100%)';
    errors.shareKids7to18 = msg;
    issues.push({ field: 'shareKids7to18', message: msg, severity: 'error' });
  }

  // Сумма детских возрастных долей <= 1
  if (inputs.shareKids0to7 + inputs.shareKids7to18 > 1) {
    const msg = `Сумма детских долей (${((inputs.shareKids0to7 + inputs.shareKids7to18) * 100).toFixed(1)}%) не может превышать 100% населения`;
    errors.shareKidsTotal = msg;
    issues.push({ field: 'shareKidsTotal', message: msg, severity: 'error' });
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    warnings,
    issues,
  };
}
