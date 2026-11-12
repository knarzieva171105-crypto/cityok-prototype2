import { describe, it, expect } from 'vitest';
import { calculateModel, roundExcel } from './engine';
import { DEFAULT_EXCEL_INPUTS, PRESET_SCENARIOS, SYNTHETIC_DEMO_FACILITIES } from '../constants/modelConfig';
import { ModelInputs } from '../types/model';

describe('CityOK Calculation Engine — Verification against Excel book prostaia_model_kommentarii_ot_08112026-2.xlsx', () => {
  // Test 1: Контрольный расчёт базового сценария
  it('1. Базовый сценарий точно совпадает с контрольными значениями Excel Лист1', () => {
    const res = calculateModel(DEFAULT_EXCEL_INPUTS);

    expect(res.buildingFootprintHa).toBe(4);
    expect(res.totalHousingAreaM2).toBe(120000);
    expect(res.buildingDensityThousandM2PerHa).toBe(12);
    expect(res.apartmentsCount).toBe(2182);
    expect(res.population).toBe(4000);
    expect(res.populationDensityPerHa).toBe(400);
    expect(res.greeningAreaM2).toBe(25000);
    expect(res.greeningProvisionM2PerPerson).toBe(6.25);
    expect(res.requiredKindergartenPlaces).toBe(238);
    expect(res.requiredSchoolPlaces).toBe(456);
    expect(res.requiredParkingPermanent).toBe(1500);
    expect(res.requiredParkingTemporary).toBe(214);
    expect(res.requiredClinicVisitsPerShift).toBe(72);

    // Балансы при C9=0, C10=0, C11=0
    expect(res.rawBalanceKindergarten).toBe(238);
    expect(res.rawBalanceSchool).toBe(456);
    expect(res.rawBalanceParkingPermanent).toBe(1500);

    // UI-показатели
    expect(res.unmetKindergarten).toBe(238);
    expect(res.remainingReserveKindergarten).toBe(0);

    // E6
    expect(res.alternativeHousingProvision).toBe(22);
  });

  // Test 2: Рост этажности
  it('2. Рост этажности с 3 до 5 увеличивает площадь жилья и население', () => {
    const base = calculateModel(DEFAULT_EXCEL_INPUTS);
    const higherFloors = calculateModel({
      ...DEFAULT_EXCEL_INPUTS,
      floors: 5,
    });

    expect(higherFloors.totalHousingAreaM2).toBe(200000);
    expect(higherFloors.totalHousingAreaM2).toBeGreaterThan(base.totalHousingAreaM2);
    expect(higherFloors.population).toBeGreaterThan(base.population);
    expect(higherFloors.requiredKindergartenPlaces).toBeGreaterThan(base.requiredKindergartenPlaces);
    expect(higherFloors.requiredSchoolPlaces).toBeGreaterThan(base.requiredSchoolPlaces);
  });

  // Test 3: Изменение семейственности в режиме Excel
  it('3. Изменение семейственности НЕ меняет население в режиме Excel (C17 = C14 / C8)', () => {
    const base = calculateModel(DEFAULT_EXCEL_INPUTS);
    const changedHousehold = calculateModel({
      ...DEFAULT_EXCEL_INPUTS,
      householdSize: 3.5, // было 2.5
      calculationMode: 'excel',
    });

    // Население по формуле C14 / C8 = 120000 / 30 = 4000
    expect(changedHousehold.population).toBe(base.population);
    expect(changedHousehold.population).toBe(4000);
    // Но E6 меняется!
    expect(changedHousehold.alternativeHousingProvision).toBe(roundExcel(55 / 3.5, 2));
  });

  // Test 4: В режиме семейственности этот параметр влияет на население
  it('4. В режиме семейственности (расширение модели) этот параметр влияет на население', () => {
    const householdMode2_5 = calculateModel({
      ...DEFAULT_EXCEL_INPUTS,
      householdSize: 2.5,
      calculationMode: 'household',
    });
    // ROUND(2182 * 2.5, 0) = ROUND(5455, 0) = 5455
    expect(householdMode2_5.population).toBe(5455);

    const householdMode3_0 = calculateModel({
      ...DEFAULT_EXCEL_INPUTS,
      householdSize: 3.0,
      calculationMode: 'household',
    });
    // ROUND(2182 * 3.0, 0) = 6546
    expect(householdMode3_0.population).toBe(6546);
    expect(householdMode3_0.population).toBeGreaterThan(householdMode2_5.population);
  });

  // Test 5: Изменение средней квартиры
  it('5. Изменение средней площади квартиры меняет количество квартир, но не население в режиме жил. обеспеченности', () => {
    const base = calculateModel(DEFAULT_EXCEL_INPUTS);
    const largerApartments = calculateModel({
      ...DEFAULT_EXCEL_INPUTS,
      avgApartmentArea: 75, // было 55
      calculationMode: 'excel',
    });

    // Квартиры уменьшились: 120000 / 75 = 1600
    expect(largerApartments.apartmentsCount).toBe(1600);
    expect(largerApartments.apartmentsCount).toBeLessThan(base.apartmentsCount);
    // Население осталось прежним: 120000 / 30 = 4000
    expect(largerApartments.population).toBe(4000);
  });

  // Test 6: Увеличение резерва снижает баланс потребности (Сценарий C)
  it('6. Увеличение резерва снижает баланс потребности (контрольные значения сценария C)', () => {
    const scenarioCInputs = PRESET_SCENARIOS.find((s) => s.id === 'scenario_c')!.inputs;
    const resC = calculateModel(scenarioCInputs);

    // В сценарии C: C9=150, C10=300, C11=500
    // Баланс детсада = 238 - 150 = 88
    expect(resC.rawBalanceKindergarten).toBe(88);
    expect(resC.unmetKindergarten).toBe(88);

    // Баланс школы = 456 - 300 = 156
    expect(resC.rawBalanceSchool).toBe(156);
    expect(resC.unmetSchool).toBe(156);

    // Баланс парковок = 1500 - 500 = 1000
    expect(resC.rawBalanceParkingPermanent).toBe(1000);
    expect(resC.unmetParkingPermanent).toBe(1000);
  });

  // Test 7: Резерв выше спроса даёт отрицательный исходный баланс
  it('7. Резерв выше спроса даёт отрицательный исходный баланс, нулевую неудовлетворённую потребность и положительный остаток резерва', () => {
    const surplusInputs: ModelInputs = {
      ...DEFAULT_EXCEL_INPUTS,
      existingKindergarten: {
        value: 300, // Спрос 238
        qualityStatus: 'estimate',
        provenance: 'assumption',
      },
    };
    const res = calculateModel(surplusInputs);

    // Отрицательный исходный баланс не обрезается: 238 - 300 = -62
    expect(res.rawBalanceKindergarten).toBe(-62);
    // Неудовлетворенная потребность = 0
    expect(res.unmetKindergarten).toBe(0);
    // Остаток учтенного резерва = 62
    expect(res.remainingReserveKindergarten).toBe(62);
  });

  // Test 8: При no_data итоговый дефицит равен null, а не 0
  it('8. При no_data итоговый дефицит равен null, не нулю', () => {
    const noDataInputs: ModelInputs = {
      ...DEFAULT_EXCEL_INPUTS,
      existingSchool: {
        value: null,
        qualityStatus: 'no_data',
        provenance: 'assumption',
      },
    };
    const res = calculateModel(noDataInputs);

    // Спрос все равно рассчитан
    expect(res.requiredSchoolPlaces).toBe(456);
    // Но баланс и дефицит строго null!
    expect(res.rawBalanceSchool).toBeNull();
    expect(res.unmetSchool).toBeNull();
    expect(res.remainingReserveSchool).toBeNull();
  });

  // Test 9: Мощность без загрузки не считается свободным резервом
  it('9. Мощность без загрузки не считается свободным резервом (availableReserve = null)', () => {
    const facilityWithUnknownLoad = SYNTHETIC_DEMO_FACILITIES.find(
      (f) => f.id === 'syn_sch_unknown'
    )!;

    expect(facilityWithUnknownLoad.totalCapacity).toBe(600);
    expect(facilityWithUnknownLoad.currentLoad).toBeNull();
    expect(facilityWithUnknownLoad.availableReserve).toBeNull();
    expect(facilityWithUnknownLoad.qualityStatus).toBe('no_data');
  });

  // Test 10: Нулевые знаменатели блокируются без NaN / Infinity
  it('10. Нулевые знаменатели блокируются (без NaN и Infinity)', () => {
    const zeroDivisorInputs: ModelInputs = {
      ...DEFAULT_EXCEL_INPUTS,
      siteAreaHa: 0,
      avgApartmentArea: 0,
      householdSize: 0,
      housingProvision: 0,
    };
    const res = calculateModel(zeroDivisorInputs);

    expect(isNaN(res.buildingDensityThousandM2PerHa)).toBe(false);
    expect(isFinite(res.buildingDensityThousandM2PerHa)).toBe(true);
    expect(isNaN(res.apartmentsCount)).toBe(false);
    expect(isFinite(res.apartmentsCount)).toBe(true);
    expect(isNaN(res.population)).toBe(false);
    expect(isFinite(res.population)).toBe(true);
  });

  // Test 11: Сохранение и восстановление сценария не меняют результат
  it('11. Сохранение и восстановление сценария через JSON не меняют результат', () => {
    const original = calculateModel(DEFAULT_EXCEL_INPUTS);
    const serialized = JSON.stringify(DEFAULT_EXCEL_INPUTS);
    const restoredInputs: ModelInputs = JSON.parse(serialized);
    const restored = calculateModel(restoredInputs);

    expect(restored.totalHousingAreaM2).toBe(original.totalHousingAreaM2);
    expect(restored.population).toBe(original.population);
    expect(restored.requiredSchoolPlaces).toBe(original.requiredSchoolPlaces);
    expect(restored.rawBalanceKindergarten).toBe(original.rawBalanceKindergarten);
  });

  // Test 12: Синтетические данные не получают статус fact
  it('12. Синтетические демонстрационные объекты не имеют статус fact', () => {
    SYNTHETIC_DEMO_FACILITIES.forEach((facility) => {
      expect(facility.qualityStatus).not.toBe('fact');
      expect(facility.provenance).toBe('assumption');
    });
  });

  // Test 13: Промежуточное экранное округление не меняет вычисления
  it('13. Промежуточное экранное форматирование не меняет внутреннюю точность', () => {
    const inputsWithFraction: ModelInputs = {
      ...DEFAULT_EXCEL_INPUTS,
      siteAreaHa: 10.333333,
      buildingRatio: 0.385,
    };
    const res = calculateModel(inputsWithFraction);

    // Площадь застройки = 10.333333 * 0.385 = 3.978333205
    expect(res.buildingFootprintHa).toBeCloseTo(3.9783, 3);
    // Объяснение хранит точное значение
    expect(res.explanations.C13.value).toBeCloseTo(3.9783, 3);
  });
});
