import * as XLSX from 'xlsx';
import { ModelInputs, ModelOutputs, Scenario } from '../types/model';
import { MODEL_METADATA } from '../constants/modelConfig';

export function exportScenarioToExcel(
  scenario: Scenario,
  outputs: ModelOutputs
): void {
  const wb = XLSX.utils.book_new();
  const inputs = scenario.inputs;

  // 1. Входные данные
  const inputsData = [
    ['Параметр', 'Ячейка Excel', 'Значение', 'Единица', 'Качество данных', 'Происхождение', 'Примечание'],
    ['Площадь участка', 'C2', inputs.siteAreaHa, 'га', 'факт/проект', 'допущение', ''],
    ['Этажность', 'C3', inputs.floors, 'эт.', 'проект', 'допущение', ''],
    ['Коэффициент застройки', 'C4', inputs.buildingRatio, 'доля', 'проект', 'допущение', '0 < Kз <= 1'],
    ['Средняя площадь квартиры', 'C5', inputs.avgApartmentArea, 'м²', 'проект', 'допущение', ''],
    ['Коэффициент семейственности', 'C6', inputs.householdSize, 'чел./кв.', 'демография', 'допущение', inputs.calculationMode === 'excel' ? 'Не участвует в формуле C17' : 'Участвует в формуле C17'],
    ['Ориентир озеленения', 'C7', inputs.greeningNorm, 'м²/чел.', 'норматив', 'ориентир', ''],
    ['Жилищная обеспеченность', 'C8', inputs.housingProvision, 'м²/чел.', 'норматив', 'ориентир', 'Используется в формуле C17'],
    ['Существующие места в детсаду', 'C9', inputs.existingKindergarten.value ?? 'нет данных', 'мест', inputs.existingKindergarten.qualityStatus, inputs.existingKindergarten.provenance, inputs.existingKindergarten.sourceNotes ?? ''],
    ['Существующие места в школе', 'C10', inputs.existingSchool.value ?? 'нет данных', 'мест', inputs.existingSchool.qualityStatus, inputs.existingSchool.provenance, inputs.existingSchool.sourceNotes ?? ''],
    ['Существующие постоянные машиноместа', 'C11', inputs.existingParkingPermanent.value ?? 'нет данных', 'м/м', inputs.existingParkingPermanent.qualityStatus, inputs.existingParkingPermanent.provenance, inputs.existingParkingPermanent.sourceNotes ?? ''],
    ['Доля детей 0–7 лет', 'E2', inputs.shareKids0to7, 'доля', 'демография', 'допущение', `${(inputs.shareKids0to7 * 100).toFixed(1)}%`],
    ['Доля детей 7–18 лет', 'E3', inputs.shareKids7to18, 'доля', 'демография', 'допущение', `${(inputs.shareKids7to18 * 100).toFixed(1)}%`],
    ['Режим расчета населения', '—', inputs.calculationMode === 'excel' ? 'По жил. обеспеченности (Excel C14/C8)' : 'По семейственности (C16*C6)', '—', 'методика', 'настройка', ''],
  ];
  const wsInputs = XLSX.utils.aoa_to_sheet(inputsData);
  XLSX.utils.book_append_sheet(wb, wsInputs, 'Входные_данные');

  // 2. Результаты ТЭП
  const tepData = [
    ['Показатель', 'Ячейка', 'Значение', 'Единица', 'Ориентир', 'Статус ориентира', 'Формула Excel'],
    ['Площадь застройки', 'C13', outputs.buildingFootprintHa, 'га', '—', '—', 'C2 * C4'],
    ['Общая площадь жилья', 'C14', outputs.totalHousingAreaM2, 'м²', '—', '—', 'C13 * C3 * 10000'],
    ['Плотность застройки', 'C15', outputs.buildingDensityThousandM2PerHa, 'тыс. м²/га', '<= 12.0', outputs.benchmarks.buildingDensity.statusLabel, 'C14 / C2 / 1000'],
    ['Количество квартир', 'C16', outputs.apartmentsCount, 'кв.', '—', '—', 'ROUND(C14 / C5, 0)'],
    ['Численность населения', 'C17', outputs.population, 'чел.', '—', '—', inputs.calculationMode === 'excel' ? 'C14 / C8' : 'ROUND(C16 * C6, 0)'],
    ['Плотность населения', 'C18', outputs.populationDensityPerHa, 'чел./га', '<= 210.0', outputs.benchmarks.populationDensity.statusLabel, 'C17 / C2'],
    ['Площадь озеленения', 'C19', outputs.greeningAreaM2, 'м²', '—', '—', 'C2 * 10000 * 0.25'],
    ['Обеспеченность озеленением', 'C20', outputs.greeningProvisionM2PerPerson, 'м²/чел.', '>= 6.0', outputs.benchmarks.greeningProvision.statusLabel, 'C19 / C17'],
    ['Требуемые места в детсаду (85% охват)', 'C22', outputs.requiredKindergartenPlaces, 'мест', 'до 350 на объект', '—', 'ROUND(C17 * E2 * 0.85, 0)'],
    ['Требуемые места в школе (95% охват)', 'C23', outputs.requiredSchoolPlaces, 'мест', 'от 500 на объект', '—', 'ROUND(C17 * E3 * 0.95, 0)'],
    ['Требуемые постоянные машиноместа', 'C24', outputs.requiredParkingPermanent, 'м/м', '1 на 80 м²', '—', 'ROUND(C14 / 80, 0)'],
    ['Требуемые временные машиноместа', 'C25', outputs.requiredParkingTemporary, 'м/м', '1 на 560 м²', '—', 'ROUND(C14 / 560, 0)'],
    ['Поликлиническое обслуживание', 'C26', outputs.requiredClinicVisitsPerShift, 'посещений в смену', '6 на 10 000 м²', 'мощность, не объекты', 'ROUND(C14 / 10000 * 6, 0)'],
    ['Баланс мест в детсаду', 'C28', outputs.rawBalanceKindergarten ?? 'нет данных', 'мест', '—', outputs.unmetKindergarten && outputs.unmetKindergarten > 0 ? 'Дефицит' : 'Обеспечено', 'C22 - C9'],
    ['Баланс мест в школе', 'C29', outputs.rawBalanceSchool ?? 'нет данных', 'мест', '—', outputs.unmetSchool && outputs.unmetSchool > 0 ? 'Дефицит' : 'Обеспечено', 'C23 - C10'],
    ['Баланс постоянных машиномест', 'C30', outputs.rawBalanceParkingPermanent ?? 'нет данных', 'м/м', '—', outputs.unmetParkingPermanent && outputs.unmetParkingPermanent > 0 ? 'Дефицит' : 'Обеспечено', 'C24 - C11'],
    ['Альтернативная жил. обеспеченность', 'E6', outputs.alternativeHousingProvision, 'м²/чел.', '—', 'аналитический', 'C5 / C6'],
  ];
  const wsTep = XLSX.utils.aoa_to_sheet(tepData);
  XLSX.utils.book_append_sheet(wb, wsTep, 'ТЭП_и_расчеты');

  // 3. Формулы и описание модели
  const descData = [
    ['Раздел', 'Описание и формулы'],
    ['Название системы', `${MODEL_METADATA.name} — ${MODEL_METADATA.subtitle}`],
    ['Версия модели', MODEL_METADATA.version],
    ['Исходная книга', `${MODEL_METADATA.sourceWorkbook} (${MODEL_METADATA.sourceSheet})`],
    ['Тестовая территория', MODEL_METADATA.testTerritory],
    ['Обязательное уведомление', MODEL_METADATA.constantNotice],
    ['Синтетические данные', MODEL_METADATA.syntheticDataNotice],
    ['Ограничение знаменателя', MODEL_METADATA.areaDenominatorNotice],
    ['Возрастные группы', MODEL_METADATA.ageGroupMethodNotice],
    ['Отказ от ответственности', 'Расчет предназначен исключительно для предварительной оценки градостроительного потенциала.'],
  ];
  const wsDesc = XLSX.utils.aoa_to_sheet(descData);
  XLSX.utils.book_append_sheet(wb, wsDesc, 'Описание_и_методика');

  const filename = `cityok_${scenario.name.replace(/[^a-zA-Zа-яА-Я0-9]/g, '_')}_${Date.now()}.xlsx`;
  XLSX.writeFile(wb, filename);
}
