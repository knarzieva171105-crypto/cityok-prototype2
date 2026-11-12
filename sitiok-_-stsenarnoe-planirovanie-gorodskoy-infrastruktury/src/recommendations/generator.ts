import { ModelInputs, ModelOutputs, RecommendationItem } from '../types/model';

export function generateRecommendations(
  inputs: ModelInputs,
  outputs: ModelOutputs
): RecommendationItem[] {
  const list: RecommendationItem[] = [];

  // 1. Плотность населения
  if (outputs.populationDensityPerHa > 210) {
    list.push({
      id: 'rec_pop_density',
      problem: `Расчётная плотность населения (${outputs.populationDensityPerHa.toLocaleString('ru-RU')} чел./га) превышает ориентир модели (210 чел./га).`,
      action:
        'Рассмотреть снижение этажности (C3), уменьшение коэффициента застройки (C4) либо уточнение границ расчётного градостроительного элемента.',
      priority: 'high',
      recommendedStage: 'Концепция / Мастер-план',
      rationale: `Превышение на ${(outputs.populationDensityPerHa - 210).toFixed(1)} чел./га при площади ${inputs.siteAreaHa} га.`,
      source: 'Ориентир РНГП из комментариев Excel',
      limitation:
        'Автоматическое увеличение площади участка недопустимо; требуется согласование границ планировочного квартала.',
    });
  }

  // 2. Плотность застройки
  if (outputs.buildingDensityThousandM2PerHa > 12) {
    list.push({
      id: 'rec_build_density',
      problem: `Плотность застройки (${outputs.buildingDensityThousandM2PerHa.toFixed(2)} тыс. м²/га) превышает ориентир Казани (12.0 тыс. м²/га).`,
      action:
        'Скорректировать ТЭП: снизить этажность или уменьшить пятно застройки для соответствия предельным параметрам.',
      priority: 'high',
      recommendedStage: 'Стадия ППТ / Эскиз застройки',
      rationale: `Общая площадь жилья ${outputs.totalHousingAreaM2.toLocaleString('ru-RU')} м² на ${inputs.siteAreaHa} га.`,
      source: 'Ориентир градостроительного регламента г. Казань',
      limitation:
        'Не является юридическим предписанием; применимость зависит от территориальной зоны в ПЗЗ г. Казани.',
    });
  }

  // 3. Школьный спрос и дефицит
  if (inputs.existingSchool.qualityStatus === 'no_data') {
    list.push({
      id: 'rec_school_nodata',
      problem: 'Отсутствуют подтверждённые данные о свободной мощности и загрузке школ в радиусе доступности.',
      action:
        'Запросить в Управлении образования фактическую численность обучающихся (по сменам) и проектную вместимость соседних СОШ.',
      priority: 'high',
      recommendedStage: 'Сбор исходных данных (ИРД)',
      rationale: `Расчётная потребность ЖК составляет ${outputs.requiredSchoolPlaces} мест. Баланс не определён (no_data).`,
      source: 'Методика оценки обеспеченности инфраструктурой',
      limitation:
        'Нельзя считать нулевой резерв установленным фактом или утверждать о невозможности размещения детей.',
    });
  } else if (outputs.unmetSchool !== null && outputs.unmetSchool > 0) {
    const isSingleFacilitySufficient = outputs.unmetSchool >= 500;
    list.push({
      id: 'rec_school_deficit',
      problem: `Неудовлетворённая потребность в школьных местах составляет ${outputs.unmetSchool} мест.`,
      action: isSingleFacilitySufficient
        ? `Размер дефицита (${outputs.unmetSchool} мест) позволяет рассматривать строительство отдельной СОШ (минимальный норматив вместимости отдельной школы по модели — от 500 мест).`
        : `Дефицит (${outputs.unmetSchool} мест) ниже минимальной вместимости отдельной школы (500 мест). Рекомендуется пристройка к существующей школе или межквартальное соглашение КРТ.`,
      priority: 'high',
      recommendedStage: 'Разработка проекта планировки (ППТ)',
      rationale: `Потребность ${outputs.requiredSchoolPlaces} мест минус учтённый резерв ${inputs.existingSchool.value ?? 0} мест.`,
      source: 'Ориентир модели: охват 95% школьников, мин. размер отдельной школы 500 мест',
      limitation:
        'Не гарантирует наличие земельного участка под школу внутри ЖК; свободная территория не признаётся автоматически пригодной под размещение объекта образования.',
    });
  }

  // 4. Дошкольные учреждения
  if (inputs.existingKindergarten.qualityStatus === 'no_data') {
    list.push({
      id: 'rec_kinder_nodata',
      problem: 'Нет сведений о загрузке и свободных местах в детских садах микрорайона.',
      action: 'Запросить данные о наполняемости ДОО в пешеходной доступности 300–500 м.',
      priority: 'high',
      recommendedStage: 'Сбор исходных данных (ИРД)',
      rationale: `Расчётный спрос ЖК: ${outputs.requiredKindergartenPlaces} мест (охват 85% детей 0–7 лет).`,
      source: 'Методика оценки обеспеченности ДОО',
      limitation: 'Без сведений о реальной загрузке расчёт окончательного дефицита невозможен.',
    });
  } else if (outputs.unmetKindergarten !== null && outputs.unmetKindergarten > 0) {
    list.push({
      id: 'rec_kinder_deficit',
      problem: `Неудовлетворённая потребность в детсадах: ${outputs.unmetKindergarten} мест.`,
      action:
        outputs.unmetKindergarten <= 150
          ? 'Рассмотреть встроенно-пристроенный детский сад на 1–2 этажах жилых секций с собственной огороженной площадкой.'
          : 'Предусмотреть отдельно стоящее дошкольное образовательное учреждение (предельная вместимость одного ДОО по ориентиру модели — до 350 мест).',
      priority: 'medium',
      recommendedStage: 'Архитектурно-градостроительная концепция',
      rationale: `Спрос: ${outputs.requiredKindergartenPlaces} мест, учтённый резерв: ${inputs.existingKindergarten.value ?? 0} мест.`,
      source: 'Ориентир модели: 85% охвата дошкольников, макс. 350 мест на объект',
      limitation:
        'Встроенно-пристроенные ДОО требуют соблюдения санитарных разрывов и инсоляции игровых зон.',
    });
  }

  // 5. Постоянные парковки
  if (inputs.existingParkingPermanent.qualityStatus === 'no_data') {
    list.push({
      id: 'rec_parking_nodata',
      problem: 'Нет данных о наличии свободных постоянных машиномест на прилегающей территории.',
      action: 'Провести инвентаризацию стоянок и гаражных кооперативов в радиусе 800 м.',
      priority: 'medium',
      recommendedStage: 'Транспортное обследование',
      rationale: `Потребность ЖК составляет ${outputs.requiredParkingPermanent} постоянных м/м (1 м/м на 80 м² жилья).`,
      source: 'Ориентир модели: C14 / 80',
      limitation: 'Пешеходная доступность внеуличных стоянок ограничена 800 метрами.',
    });
  } else if (outputs.unmetParkingPermanent !== null && outputs.unmetParkingPermanent > 0) {
    list.push({
      id: 'rec_parking_deficit',
      problem: `Дефицит постоянных парковок составляет ${outputs.unmetParkingPermanent} машиномест.`,
      action:
        'Разработать проект многоуровневого либо подземного паркинга, оценить возможность перехватывающих стоянок.',
      priority: 'high',
      recommendedStage: 'Проектирование схемы планировочной организации земельного участка (СПОЗУ)',
      rationale: `Требуется ${outputs.requiredParkingPermanent} м/м, учтено ${inputs.existingParkingPermanent.value ?? 0} м/м.`,
      source: 'Ориентир модели: 1 постоянное место на 80 м² жилья',
      limitation:
        'Открытые наземные плоскостные стоянки не должны занимать нормативную площадь озеленения двора (C19).',
    });
  }

  // 6. Озеленение
  if (outputs.greeningProvisionM2PerPerson < 6.0) {
    list.push({
      id: 'rec_greening_below',
      problem: `Обеспеченность озеленением (${outputs.greeningProvisionM2PerPerson.toFixed(2)} м²/чел.) ниже ориентира (6.0 м²/чел.).`,
      action: 'Увеличить долю благоустроенных озеленённых пространств или снизить численность жителей.',
      priority: 'medium',
      recommendedStage: 'Благоустройство / Мастер-план',
      rationale: `Расчётная площадь озеленения ${outputs.greeningAreaM2.toLocaleString('ru-RU')} м² недостаточна для ${outputs.population.toLocaleString('ru-RU')} жителей.`,
      source: 'Ориентир модели: C7 = 6 м²/чел.',
      limitation: 'Озеленение на кровле подземного паркинга требует соблюдения грунтового слоя.',
    });
  }

  return list;
}
