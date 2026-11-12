import { Scenario, ModelOutputs } from '../types/model';
import { MODEL_METADATA } from '../constants/modelConfig';

export function exportScenarioToJson(scenario: Scenario): void {
  const payload = {
    meta: {
      app: MODEL_METADATA.name,
      version: MODEL_METADATA.version,
      sourceWorkbook: MODEL_METADATA.sourceWorkbook,
      exportedAt: new Date().toISOString(),
    },
    scenario,
  };

  const str = JSON.stringify(payload, null, 2);
  const blob = new Blob([str], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `cityok_scenario_${scenario.id}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportTepToCsv(scenario: Scenario, outputs: ModelOutputs): void {
  const rows = [
    ['Показатель', 'Ячейка', 'Значение', 'Единица', 'Ориентир', 'Формула'],
    ['Площадь участка', 'C2', scenario.inputs.siteAreaHa, 'га', '—', 'Вход'],
    ['Этажность', 'C3', scenario.inputs.floors, 'эт.', '—', 'Вход'],
    ['Коэффициент застройки', 'C4', scenario.inputs.buildingRatio, 'доля', '—', 'Вход'],
    ['Площадь застройки', 'C13', outputs.buildingFootprintHa, 'га', '—', 'C2 * C4'],
    ['Общая площадь жилья', 'C14', outputs.totalHousingAreaM2, 'м²', '—', 'C13 * C3 * 10000'],
    ['Плотность застройки', 'C15', outputs.buildingDensityThousandM2PerHa, 'тыс. м²/га', '<= 12.0', 'C14 / C2 / 1000'],
    ['Количество квартир', 'C16', outputs.apartmentsCount, 'кв.', '—', 'ROUND(C14 / C5, 0)'],
    ['Численность населения', 'C17', outputs.population, 'чел.', '—', scenario.inputs.calculationMode === 'excel' ? 'C14 / C8' : 'ROUND(C16 * C6, 0)'],
    ['Плотность населения', 'C18', outputs.populationDensityPerHa, 'чел./га', '<= 210.0', 'C17 / C2'],
    ['Площадь озеленения', 'C19', outputs.greeningAreaM2, 'м²', '—', 'C2 * 10000 * 0.25'],
    ['Обеспеченность озеленением', 'C20', outputs.greeningProvisionM2PerPerson, 'м²/чел.', '>= 6.0', 'C19 / C17'],
    ['Требуемые места в детсаду', 'C22', outputs.requiredKindergartenPlaces, 'мест', 'до 350 на объект', 'ROUND(C17 * E2 * 0.85, 0)'],
    ['Требуемые места в школе', 'C23', outputs.requiredSchoolPlaces, 'мест', 'от 500 на объект', 'ROUND(C17 * E3 * 0.95, 0)'],
    ['Требуемые постоянные машиноместа', 'C24', outputs.requiredParkingPermanent, 'м/м', '1 на 80 м²', 'ROUND(C14 / 80, 0)'],
    ['Требуемые временные машиноместа', 'C25', outputs.requiredParkingTemporary, 'м/м', '1 на 560 м²', 'ROUND(C14 / 560, 0)'],
    ['Поликлиническое обслуживание', 'C26', outputs.requiredClinicVisitsPerShift, 'посещений в смену', '6 на 10 000 м²', 'ROUND(C14 / 10000 * 6, 0)'],
    ['Баланс мест в детсаду', 'C28', outputs.rawBalanceKindergarten ?? 'нет данных', 'мест', '—', 'C22 - C9'],
    ['Баланс мест в школе', 'C29', outputs.rawBalanceSchool ?? 'нет данных', 'мест', '—', 'C23 - C10'],
    ['Баланс постоянных парковок', 'C30', outputs.rawBalanceParkingPermanent ?? 'нет данных', 'м/м', '—', 'C24 - C11'],
  ];

  const csvContent =
    '\uFEFF' +
    rows
      .map((row) =>
        row
          .map((cell) => {
            const str = String(cell);
            if (str.includes(';') || str.includes('\n') || str.includes('"')) {
              return `"${str.replace(/"/g, '""')}"`;
            }
            return str;
          })
          .join(';')
      )
      .join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `cityok_tep_${scenario.name.replace(/[^a-zA-Zа-яА-Я0-9]/g, '_')}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
