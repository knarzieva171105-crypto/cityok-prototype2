import * as XLSX from 'xlsx';
import { ModelInputs } from '../types/model';
import { DEFAULT_EXCEL_INPUTS } from '../constants/modelConfig';
import { validateModelInputs } from '../validation/validator';

export interface ExcelImportPreview {
  sheetName: string;
  extractedValues: {
    siteAreaHa: { raw: any; value: number | null; cell: 'C2'; label: 'Площадь участка, га' };
    floors: { raw: any; value: number | null; cell: 'C3'; label: 'Этажность' };
    buildingRatio: { raw: any; value: number | null; cell: 'C4'; label: 'Коэффициент застройки' };
    avgApartmentArea: { raw: any; value: number | null; cell: 'C5'; label: 'Средняя площадь квартиры' };
    householdSize: { raw: any; value: number | null; cell: 'C6'; label: 'Семейственность' };
    greeningNorm: { raw: any; value: number | null; cell: 'C7'; label: 'Ориентир озеленения' };
    housingProvision: { raw: any; value: number | null; cell: 'C8'; label: 'Жилищная обеспеченность' };
    existingKindergarten: { raw: any; value: number | null; cell: 'C9'; label: 'Места в детсаду' };
    existingSchool: { raw: any; value: number | null; cell: 'C10'; label: 'Места в школе' };
    existingParkingPermanent: { raw: any; value: number | null; cell: 'C11'; label: 'Машиноместа' };
    shareKids0to7: { raw: any; value: number | null; cell: 'E2'; label: 'Доля детей 0–7 лет' };
    shareKids7to18: { raw: any; value: number | null; cell: 'E3'; label: 'Доля детей 7–18 лет' };
  };
  validationIssues: string[];
  canImport: boolean;
  modelInputsCandidate: ModelInputs | null;
}

export async function parseExcelTemplateFile(file: File): Promise<ExcelImportPreview> {
  const buffer = await file.arrayBuffer();
  const wb = XLSX.read(buffer, { type: 'array' });

  // Ищем лист Лист1 или берем первый лист
  let sheetName = 'Лист1';
  if (!wb.Sheets[sheetName]) {
    sheetName = wb.SheetNames[0] || '';
  }

  const ws = wb.Sheets[sheetName];
  if (!ws) {
    throw new Error('Книга не содержит доступных листов для чтения');
  }

  const getCellValue = (cellAddress: string): any => {
    const cell = ws[cellAddress];
    if (!cell) return undefined;
    return cell.v;
  };

  const toNumber = (val: any): number | null => {
    if (val === undefined || val === null || val === '') return null;
    const n = Number(val);
    return isNaN(n) ? null : n;
  };

  const rawC2 = getCellValue('C2');
  const rawC3 = getCellValue('C3');
  const rawC4 = getCellValue('C4');
  const rawC5 = getCellValue('C5');
  const rawC6 = getCellValue('C6');
  const rawC7 = getCellValue('C7');
  const rawC8 = getCellValue('C8');
  const rawC9 = getCellValue('C9');
  const rawC10 = getCellValue('C10');
  const rawC11 = getCellValue('C11');
  const rawE2 = getCellValue('E2');
  const rawE3 = getCellValue('E3');

  const valC2 = toNumber(rawC2);
  const valC3 = toNumber(rawC3);
  const valC4 = toNumber(rawC4);
  const valC5 = toNumber(rawC5);
  const valC6 = toNumber(rawC6);
  const valC7 = toNumber(rawC7);
  const valC8 = toNumber(rawC8);
  const valC9 = toNumber(rawC9);
  const valC10 = toNumber(rawC10);
  const valC11 = toNumber(rawC11);
  const valE2 = toNumber(rawE2);
  const valE3 = toNumber(rawE3);

  const validationIssues: string[] = [];

  if (valC2 === null || valC2 <= 0) validationIssues.push('Ячейка C2 (площадь участка): требуется число > 0');
  if (valC3 === null || valC3 < 1) validationIssues.push('Ячейка C3 (этажность): требуется целое число ≥ 1');
  if (valC4 === null || valC4 <= 0 || valC4 > 1) validationIssues.push('Ячейка C4 (коэффициент застройки): требуется число от 0 до 1');
  if (valC5 === null || valC5 <= 0) validationIssues.push('Ячейка C5 (средняя площадь квартиры): требуется число > 0');
  if (valC6 === null || valC6 <= 0) validationIssues.push('Ячейка C6 (семейственность): требуется число > 0');
  if (valC8 === null || valC8 <= 0) validationIssues.push('Ячейка C8 (жилищная обеспеченность): требуется число > 0');

  let candidate: ModelInputs | null = null;
  const canImport = validationIssues.length === 0;

  if (canImport) {
    candidate = {
      siteAreaHa: valC2!,
      floors: Math.round(valC3!),
      buildingRatio: valC4!,
      avgApartmentArea: valC5!,
      householdSize: valC6!,
      greeningNorm: valC7 ?? DEFAULT_EXCEL_INPUTS.greeningNorm,
      housingProvision: valC8!,
      existingKindergarten: {
        value: valC9 ?? 0,
        qualityStatus: valC9 !== null ? 'estimate' : 'no_data',
        provenance: 'assumption',
        sourceNotes: 'Импортировано из ячейки C9 книги Excel',
      },
      existingSchool: {
        value: valC10 ?? 0,
        qualityStatus: valC10 !== null ? 'estimate' : 'no_data',
        provenance: 'assumption',
        sourceNotes: 'Импортировано из ячейки C10 книги Excel',
      },
      existingParkingPermanent: {
        value: valC11 ?? 0,
        qualityStatus: valC11 !== null ? 'estimate' : 'no_data',
        provenance: 'assumption',
        sourceNotes: 'Импортировано из ячейки C11 книги Excel',
      },
      shareKids0to7: valE2 ?? DEFAULT_EXCEL_INPUTS.shareKids0to7,
      shareKids7to18: valE3 ?? DEFAULT_EXCEL_INPUTS.shareKids7to18,
      calculationMode: 'excel',
    };

    const inputVal = validateModelInputs(candidate);
    if (!inputVal.isValid) {
      inputVal.issues.forEach((iss) => validationIssues.push(`${iss.field}: ${iss.message}`));
    }
  }

  return {
    sheetName,
    extractedValues: {
      siteAreaHa: { raw: rawC2, value: valC2, cell: 'C2', label: 'Площадь участка, га' },
      floors: { raw: rawC3, value: valC3, cell: 'C3', label: 'Этажность' },
      buildingRatio: { raw: rawC4, value: valC4, cell: 'C4', label: 'Коэффициент застройки' },
      avgApartmentArea: { raw: rawC5, value: valC5, cell: 'C5', label: 'Средняя площадь квартиры' },
      householdSize: { raw: rawC6, value: valC6, cell: 'C6', label: 'Семейственность' },
      greeningNorm: { raw: rawC7, value: valC7, cell: 'C7', label: 'Ориентир озеленения' },
      housingProvision: { raw: rawC8, value: valC8, cell: 'C8', label: 'Жилищная обеспеченность' },
      existingKindergarten: { raw: rawC9, value: valC9, cell: 'C9', label: 'Места в детсаду' },
      existingSchool: { raw: rawC10, value: valC10, cell: 'C10', label: 'Места в школе' },
      existingParkingPermanent: { raw: rawC11, value: valC11, cell: 'C11', label: 'Машиноместа' },
      shareKids0to7: { raw: rawE2, value: valE2, cell: 'E2', label: 'Доля детей 0–7 лет' },
      shareKids7to18: { raw: rawE3, value: valE3, cell: 'E3', label: 'Доля детей 7–18 лет' },
    },
    validationIssues,
    canImport: validationIssues.length === 0 && candidate !== null,
    modelInputsCandidate: candidate,
  };
}
