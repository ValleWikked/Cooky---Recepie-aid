// ALL UNITS: metric — г, мл, °C. No imperial.

// ═══════════════════════════════════════════════════════════════
// THEME — dark warm kitchen color palette (14 tokens)
// ═══════════════════════════════════════════════════════════════

const THEME = {
  bg: '#1a1610',
  surface: '#242018',
  card: '#2e2820',
  border: '#3d3428',
  gold: '#c8a96e',
  goldLight: '#e0c48a',
  goldDim: '#8a7040',
  red: '#c05040',
  amber: '#d4904a',
  green: '#6a9e6e',
  blue: '#5a8aaa',
  text: '#f0e8d8',
  textDim: '#9a8a6a',
  textMuted: '#5a4a2a',
};

// ═══════════════════════════════════════════════════════════════
// STYLES — shared CSS-in-JS fragments
// ═══════════════════════════════════════════════════════════════

const STYLES = {
  card: {
    backgroundColor: THEME.card,
    border: `1px solid ${THEME.border}`,
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '12px',
    color: THEME.text,
  },
  badge: (color) => ({
    display: 'inline-block',
    padding: '2px 10px',
    borderRadius: '4px',
    fontSize: '0.7rem',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    backgroundColor: color,
    color: THEME.bg,
  }),
  chip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '3px 10px',
    borderRadius: '12px',
    fontSize: '0.8rem',
    backgroundColor: THEME.surface,
    border: `1px solid ${THEME.border}`,
    color: THEME.textDim,
    marginRight: '6px',
    marginBottom: '4px',
  },
  collapsible: {
    cursor: 'pointer',
    userSelect: 'none',
  },
  matrixCell: (highlighted) => ({
    minWidth: '80px',
    padding: '8px 6px',
    textAlign: 'center',
    borderRight: `1px solid ${THEME.border}`,
    backgroundColor: highlighted ? 'rgba(200,169,110,0.1)' : 'transparent',
  }),
};

// ═══════════════════════════════════════════════════════════════
// EQUIPMENT — verified specs for 5 user devices
// ═══════════════════════════════════════════════════════════════

const EQUIPMENT = {
  NinjaMAXPRO: {
    name: 'Ninja MAX PRO',
    capacity: '6.2 L',
    maxTemp: 240,
    modes: ['Air Fry', 'Roast', 'Bake', 'Dehydrate', 'Reheat'],
  },
  KenwoodFDP22: {
    name: 'Kenwood FDP22.130GY',
    bowlCapacity: '2.1 L',
    modes: ['Chop', 'Mix', 'Knead', 'Whisk', 'Purée'],
  },
  PanasonicSDYR2550: {
    name: 'Panasonic SD-YR2550',
    modes: ['Basic', 'Whole Wheat', 'Dough', 'Gluten-Free'],
  },
  OZAVO: {
    name: 'OZAVO sandwich maker',
    modes: ['Toast', 'Grill'],
  },
  Cecotec: {
    name: 'Cecotec blender',
    modes: ['Blend', 'Pulse'],
  },
};

// ═══════════════════════════════════════════════════════════════
// INGREDIENTS — hardcoded from ingredient-roles.md reference
// ═══════════════════════════════════════════════════════════════

const COLUMNS = ['0', '½×', '¾×', '1×', '⁵⁄₄×', '3/2×'];

const MATRIX_COLS = [
  { label: '0', desc: 'Пропустить' },
  { label: '½×', desc: 'Половина' },
  { label: '¾×', desc: 'Три четверти' },
  { label: '1×', desc: 'Норма' },
  { label: '⁵⁄₄×', desc: 'С четвертью' },
  { label: '3/2×', desc: 'Полторы' },
];

const INGREDIENTS = [
  {
    name: 'Нут сухой',
    role: 'Основа блюда — структура, текстура, белок',
    necessity: 'ОСНОВА',
    amount: '250 г (сухой)',
    toleranceZone: { type: 'base', description: 'Основа рецепта — не варьируется' },
    variants: [],
    substitutions: [],
    empirical: false,
    matrix: [
      { verdict: 'Нет блюда', consequence: 'Без нута фалафель невозможен' },
      { verdict: 'Слишком мало', consequence: 'Не хватит на полноценную порцию' },
      { verdict: 'Малая порция', consequence: 'Хватит на 1-2 порции вместо 4' },
      { verdict: '✓ Норма', consequence: 'Стандартная порция на 4 человек' },
      { verdict: 'Можно', consequence: 'Больше порций, пропорционально остальным ингредиентам' },
      { verdict: 'Можно', consequence: 'Увеличенная партия' },
    ],
  },
  {
    name: 'Лук репчатый',
    role: 'Сладость, ароматическая глубина, влажность в сырой смеси',
    necessity: 'ВАЖНО',
    amount: '80 г (~1 средняя луковица)',
    toleranceZone: { type: 'wide_below', description: '¾× ≈ 1× — широкий допуск вниз; умеренный вверх' },
    variants: [
      { label: 'Свежий', description: 'Стандарт. Выделяет влагу при нарезке — учитывать при связывании.', quantity: '80 г' },
      { label: 'Сушёный (порошок)', description: '~1 ч.л. вместо 80 г. Не даёт влаги — смесь суше.', quantity: '1 ч.л.' },
      { label: 'Шалот', description: 'Нежнее, слаще, меньше влаги.', quantity: '80–90 г' },
      { label: 'Зелёный лук', description: 'Мягче, менее сладкий. Только белые и светло-зелёные части.', quantity: '~60 г' },
      { label: 'Красный лук', description: 'Острее в сыром виде, больше цвета.', quantity: '80 г' },
    ],
    substitutions: [
      { name: 'Шалот', description: 'Ближайший заменитель, более изысканный вкус.', note: 'Те же пропорции или +10%' },
      { name: 'Луковый порошок', description: 'Работает если снижение влажности допустимо.', note: '~1 ч.л. вместо 80 г' },
      { name: 'Пропуск', description: 'Возможен в фалафеле — блюдо работает, просто меньше сладкой глубины.', note: 'Вкус станет плоским' },
    ],
    empirical: false,
    matrix: [
      { verdict: 'Плоский вкус', consequence: 'Нет сладкой основы. Вкус одномерный.' },
      { verdict: 'Слабый фон', consequence: 'Тонкий намёк сладости. Текстура лучше в сырых смесях (меньше влаги).' },
      { verdict: '✓ Баланс', consequence: 'Практически тот же результат что и 1×. В зоне допуска.' },
      { verdict: '✓ Баланс', consequence: 'Правильная сладость и ароматическая глубина. Влажность учтена.' },
      { verdict: 'Начинает водянить', consequence: 'В сырых смесях: лишняя влага → больше связующего → плотнее результат.' },
      { verdict: 'Водянисто', consequence: 'Явный избыток влаги. Требуется значительно больше связующего.' },
    ],
  },
  {
    name: 'Чеснок',
    role: 'Острота, ароматическая глубина, пикантность',
    necessity: 'ВАЖНО',
    amount: '3–4 зубчика (~15 г)',
    toleranceZone: { type: 'wide_below', description: 'Широкий допуск вниз; умеренный вверх' },
    variants: [
      { label: 'Свежий', description: 'Стандарт. Интенсивность зависит от сорта и возраста.', quantity: '3–4 зубчика' },
      { label: 'Чесночный порошок', description: '~½ ч.л. вместо 3 зубчиков. Равномернее распределение.', quantity: '½ ч.л.' },
      { label: 'Печёный чеснок', description: 'Мягче, слаще. Увеличить количество в 1.5×.', quantity: '5–6 зубчиков' },
    ],
    substitutions: [
      { name: 'Чесночный порошок', description: 'Равномерное распределение, без влаги.', note: '½ ч.л. за 3 зубчика' },
      { name: 'Пропуск', description: 'Заметно, но не критично — блюдо станет пресным.', note: 'Потеря пикантности' },
    ],
    empirical: false,
    matrix: [
      { verdict: 'Пресно', consequence: 'Нет чесночной остроты. Блюдо плоское.' },
      { verdict: 'Слабый чеснок', consequence: 'Едва заметно. Подходит для чувствительных к чесноку.' },
      { verdict: '✓ Мягкий фон', consequence: 'Приятный чесночный фон без доминирования.' },
      { verdict: '✓ Выраженный', consequence: 'Яркий чесночный вкус — классический фалафель.' },
      { verdict: 'Чесночный удар', consequence: 'Чеснок доминирует. Может перебить кумин и кориандр.' },
      { verdict: 'Перебор', consequence: 'Чесночная бомба. Забивает все остальные вкусы.' },
    ],
  },
  {
    name: 'Петрушка свежая',
    role: 'Свежесть, травяной аромат, зелёный цвет',
    necessity: 'ОПЦИОНАЛЬНО',
    amount: '20 г (пучок, только листья)',
    toleranceZone: { type: 'wide', description: 'Широкий допуск — 0 приемлемо, 3/2× всё ещё хорошо' },
    variants: [
      { label: 'Свежая', description: 'Стандарт. Только листья, без стеблей.', quantity: '20 г' },
      { label: 'Кинза', description: 'Более яркий, цитрусовый оттенок. Не всем нравится.', quantity: '20 г' },
      { label: 'Сушёная', description: 'Слабее аромат. Использовать 1 ст.л. вместо пучка.', quantity: '1 ст.л.' },
    ],
    substitutions: [
      { name: 'Кинза', description: 'Ярче, цитрусовый оттенок. Классическая альтернатива.', note: 'Та же пропорция' },
      { name: 'Укроп', description: 'Другой профиль — анисовый оттенок.', note: '15 г, не всем подходит' },
      { name: 'Пропуск', description: 'Полностью допустимо. Вкус чище, но менее сложный.', note: 'Цвет бледнее' },
    ],
    empirical: false,
    matrix: [
      { verdict: '✓ Допустимо', consequence: 'Без зелени. Чище вкус, бледнее цвет.' },
      { verdict: 'Лёгкий намёк', consequence: 'Едва заметная травяная нота.' },
      { verdict: '✓ Зелень', consequence: 'Приятный травяной фон.' },
      { verdict: '✓ Свежесть', consequence: 'Яркая зелень — классический баланс.' },
      { verdict: 'Много зелени', consequence: 'Травяной вкус выражен. Цвет зеленее.' },
      { verdict: '✓ Всё ещё хорошо', consequence: 'Очень зелёный фалафель. Допустимо.' },
    ],
  },
  {
    name: 'Кумин молотый',
    role: 'Теплота, землистость, ключевая восточная нота',
    necessity: 'ВАЖНО',
    amount: '1½ ч.л.',
    toleranceZone: { type: 'narrow_above', description: 'Умеренный допуск вниз; УЗКИЙ вверх — даже небольшой перебор заметен' },
    variants: [
      { label: 'Молотый', description: 'Стандарт. Интенсивность падает со временем хранения.', quantity: '1½ ч.л.' },
      { label: 'Целые семена', description: 'Обжарить и смолоть для максимального аромата.', quantity: '1 ч.л. семян' },
    ],
    substitutions: [
      { name: 'Семена кумина', description: 'Обжарить и смолоть — ярче аромат.', note: '1 ч.л. семян = 1½ ч.л. молотого' },
      { name: 'Пропуск', description: 'НЕ РЕКОМЕНДУЕТСЯ. Кумин — ключевая восточная нота.', note: 'Потеря аутентичности' },
    ],
    empirical: false,
    matrix: [
      { verdict: 'Пресно', consequence: 'Нет восточного характера. Фалафель теряет идентичность.' },
      { verdict: 'Слабый фон', consequence: 'Тонкий намёк. Теряется на фоне чеснока.' },
      { verdict: '✓ Мягкий', consequence: 'Тёплая нота без доминирования.' },
      { verdict: '✓ Классика', consequence: 'Правильный восточный профиль.' },
      { verdict: 'Горчит', consequence: 'Кумин начинает горчить. Перекрывает кориандр.' },
      { verdict: 'Горький дым', consequence: 'Выраженная горечь. Блюдо испорчено.' },
    ],
  },
  {
    name: 'Кориандр молотый',
    role: 'Цитрусовая нота, округлость, балансирует кумин',
    necessity: 'ВАЖНО',
    amount: '1 ч.л.',
    toleranceZone: { type: 'moderate', description: 'Умеренный допуск в обе стороны' },
    variants: [
      { label: 'Молотый', description: 'Стандарт.', quantity: '1 ч.л.' },
      { label: 'Целые семена', description: 'Обжарить и смолоть.', quantity: '¾ ч.л. семян' },
    ],
    substitutions: [
      { name: 'Семена кориандра', description: 'Обжарить и смолоть — цитрусовее.', note: '¾ ч.л. семян' },
      { name: 'Пропуск', description: 'Заметно — вкус станет менее округлым.', note: 'Кумин будет доминировать' },
    ],
    empirical: false,
    matrix: [
      { verdict: 'Плосковато', consequence: 'Не хватает цитрусовой ноты. Кумин слишком выделяется.' },
      { verdict: 'Слабый цитрус', consequence: 'Едва заметная округлость.' },
      { verdict: '✓ Лёгкий', consequence: 'Приятный баланс с кумином.' },
      { verdict: '✓ Баланс', consequence: 'Правильное соотношение кумин/кориандр.' },
      { verdict: 'Цитрус доминирует', consequence: 'Кориандр выходит на первый план.' },
      { verdict: 'Мыльный привкус', consequence: 'У некоторых людей генетическая чувствительность к кориандру.' },
    ],
  },
  {
    name: 'Соль',
    role: 'Усилитель вкуса, критический баланс',
    necessity: 'ВАЖНО',
    amount: '1 ч.л. (~5 г)',
    toleranceZone: { type: 'narrow_both', description: 'УЗКИЙ в обе стороны — соль очень чувствительна' },
    variants: [
      { label: 'Мелкая', description: 'Стандарт. Равномерно распределяется.', quantity: '1 ч.л.' },
      { label: 'Крупная (кошерная)', description: 'Менее плотная — 1¼ ч.л. вместо 1 ч.л.', quantity: '1¼ ч.л.' },
      { label: 'Морская', description: 'Аналогично крупной.', quantity: '1¼ ч.л.' },
    ],
    substitutions: [
      { name: 'Соевый соус', description: 'Другой профиль вкуса. Добавляет умами.', note: '1 ст.л. ≈ 1 ч.л. соли, но меняет вкус' },
    ],
    empirical: false,
    matrix: [
      { verdict: 'Пресно', consequence: 'Никакого вкуса. Блюдо несъедобно.' },
      { verdict: 'Недосол', consequence: 'Вкус приглушён. Заметно не хватает.' },
      { verdict: 'Слабовато', consequence: 'Терпимо, но не хватает яркости.' },
      { verdict: '✓ Баланс', consequence: 'Правильный уровень соли.' },
      { verdict: 'Пересол', consequence: 'Соль чувствуется явно. Маскирует специи.' },
      { verdict: 'Сильно пересол', consequence: 'Несъедобно.' },
    ],
  },
  {
    name: 'Чёрный перец',
    role: 'Лёгкая острота, фоновая нота',
    necessity: 'УСЛОВНЫЙ',
    amount: '½ ч.л.',
    toleranceZone: { type: 'very_wide', description: 'Очень широкий — все 6 колонок в зоне допуска' },
    variants: [
      { label: 'Молотый', description: 'Стандарт.', quantity: '½ ч.л.' },
      { label: 'Свежемолотый', description: 'Ароматнее.', quantity: '½ ч.л.' },
      { label: 'Белый перец', description: 'Мягче, менее ароматный.', quantity: '½ ч.л.' },
    ],
    substitutions: [
      { name: 'Белый перец', description: 'Мягче, для светлых блюд.', note: 'Та же пропорция' },
      { name: 'Кайенский перец', description: 'Острее — другой профиль.', note: '¼ ч.л., осторожно' },
      { name: 'Пропуск', description: 'Без последствий.', note: 'Вкус чуть проще' },
    ],
    empirical: false,
    matrix: [
      { verdict: '✓ Ок', consequence: 'Без перца — вкус немного проще.' },
      { verdict: '✓ Ок', consequence: 'Лёгкий намёк остроты.' },
      { verdict: '✓ Ок', consequence: 'Приятный фон.' },
      { verdict: '✓ Норма', consequence: 'Классический уровень.' },
      { verdict: '✓ Ок', consequence: 'Заметная острота.' },
      { verdict: '✓ Ок', consequence: 'Острый, но не критично.' },
    ],
  },
  {
    name: 'Разрыхлитель',
    role: 'Воздушность, лёгкость текстуры',
    necessity: 'УСЛОВНЫЙ',
    amount: '½ ч.л.',
    toleranceZone: { type: 'narrow_above', description: 'Умеренный вниз; УЗКИЙ вверх — избыток даёт химический привкус' },
    variants: [
      { label: 'Обычный', description: 'Стандартный разрыхлитель.', quantity: '½ ч.л.' },
    ],
    substitutions: [
      { name: 'Сода + кислота', description: '¼ ч.л. соды + ½ ч.л. лимонного сока.', note: 'Активируется сразу' },
      { name: 'Пропуск', description: 'Фалафель будет плотнее, но не критично.', note: 'Текстура плотнее' },
    ],
    empirical: false,
    matrix: [
      { verdict: '✓ Ок', consequence: 'Без разрыхлителя. Фалафель немного плотнее.' },
      { verdict: 'Слабо', consequence: 'Минимальный эффект подъёма.' },
      { verdict: '✓ Лёгкий', consequence: 'Едва заметная воздушность.' },
      { verdict: '✓ Норма', consequence: 'Правильная воздушность.' },
      { verdict: 'Привкус', consequence: 'Химический привкус начинает появляться.' },
      { verdict: 'Мыльный вкус', consequence: 'Явный химический привкус. Блюдо испорчено.' },
    ],
  },
  {
    name: 'Мука',
    role: 'Связующее — только если смесь слишком влажная',
    necessity: 'УСЛОВНЫЙ',
    amount: '? 0–3 ст.л.',
    toleranceZone: { type: 'narrow_above', description: 'Эмпирически. Ниже нормы — N/A; выше — УЗКИЙ, каждая ложка меняет текстуру' },
    variants: [
      { label: 'Пшеничная', description: 'Стандарт. Каждая столовая ложка существенно меняет текстуру.', quantity: '? 0–3 ст.л.' },
      { label: 'Нутовая мука', description: 'Усиливает вкусовую связность. Более гигроскопична.', quantity: '? 0–3 ст.л.' },
      { label: 'Кукурузный крахмал', description: 'Связывает плотнее при меньшем объёме.', quantity: '? 0–1½ ст.л.' },
    ],
    substitutions: [
      { name: 'Нутовая мука', description: 'Та же роль, тот же диапазон. Без глютена.', note: 'Начать с ½ от количества пшеничной' },
      { name: 'Кукурузный крахмал', description: 'Связывает плотнее с меньшим объёмом.', note: '½ от количества муки' },
      { name: 'Пропуск', description: 'Правильный ответ если техника верна. Всегда пробуйте ноль муки сначала.', note: 'Идеальный фалафель без муки' },
    ],
    empirical: true,
    matrix: [
      { verdict: 'Идеально', consequence: 'Правильная техника — мука не нужна.' },
      { verdict: 'Рыхло', consequence: 'Смесь слегка рассыпается при жарке.' },
      { verdict: 'Держится', consequence: 'Минимальное связывание.' },
      { verdict: '✓? Связано', consequence: 'Эмпирически — проверьте тест-шариком.' },
      { verdict: 'Плотно', consequence: 'Заметно плотнее текстура.' },
      { verdict: 'Кирпич', consequence: 'Тяжёлый, плотный фалафель. Потеря воздушности.' },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════
// STEPS — hardcoded representative recipe (фалафель)
// ═══════════════════════════════════════════════════════════════

const STEPS = [
  {
    id: 1,
    title: 'Замачивание нута',
    description: 'Замочить сухой нут в большом объёме холодной воды. Нут должен быть полностью покрыт водой с запасом 5 см сверху.',
    duration: { value: '12–24 ч', accuracy: 'verified' },
    temperature: null,
    equipment: null,
    equipmentSetting: null,
    doneWhen: 'Нут увеличился в 2–2.5 раза, стал мягким при раскусывании, но не кашеобразным. Вода слегка мутная.',
    ifSkipped: 'Сухой нут невозможно измельчить до нужной консистенции — фалафель развалится. Консервированный нут не замена — он варёный и даст кашу.',
    calibration: null,
  },
  {
    id: 2,
    title: 'Слив и просушка нута',
    description: 'Слить воду через дуршлаг. Дать стечь 5–10 минут. Нут должен быть влажным, но не мокрым.',
    duration: { value: '5–10 мин', accuracy: 'verified' },
    temperature: null,
    equipment: null,
    equipmentSetting: null,
    doneWhen: 'С поверхности нута не капает вода. При встряхивании дуршлага капли не разлетаются.',
    ifSkipped: 'Лишняя влага → смесь слишком мокрая → потребуется больше муки → плотный фалафель.',
    calibration: null,
  },
  {
    id: 3,
    title: 'Измельчение в комбайне',
    description: 'Измельчить нут, лук, чеснок и петрушку в чаше комбайна импульсным режимом до мелкой крупки. НЕ пюрировать — текстура должна быть зернистой.',
    duration: { value: '30–45 сек', accuracy: 'estimated' },
    temperature: null,
    equipment: 'KenwoodFDP22',
    equipmentSetting: 'Chop (импульсный)',
    doneWhen: 'Консистенция мелкого кускуса — крупинки 1–2 мм. При сжатии в руке смесь держит форму, но не липкая. НЕ паста.',
    ifSkipped: 'Слишком крупный помол → фалафель разваливается. Слишком мелкий (пюре) → плотная, резиновая текстура.',
    calibration: null,
  },
  {
    id: 4,
    title: 'Добавление специй и соли',
    description: 'Добавить кумин, кориандр, соль, перец, разрыхлитель в измельчённую смесь. Перемешать лопаткой до равномерного распределения.',
    duration: { value: '1–2 мин', accuracy: 'verified' },
    temperature: null,
    equipment: null,
    equipmentSetting: null,
    doneWhen: 'Специи равномерно распределены — нет видимых скоплений кумина или соли.',
    ifSkipped: 'Специи распределятся неравномерно — одни фалафели будут пресными, другие пересоленными.',
    calibration: null,
  },
  {
    id: 5,
    title: 'Тест на влажность',
    description: 'Слепить один шарик (~30 г). Если держит форму и не трескается — мука не нужна. Если разваливается — добавить муку по 1 ст.л. и повторить тест.',
    duration: { value: '2–3 мин', accuracy: 'empirical' },
    temperature: null,
    equipment: null,
    equipmentSetting: null,
    doneWhen: 'Шарик держит форму, поверхность гладкая, без трещин. При лёгком нажатии пружинит.',
    ifSkipped: 'Пропуск теста → риск что вся партия развалится при жарке. Исправлять поздно.',
    calibration: null,
  },
  {
    id: 6,
    title: 'Формовка фалафелей',
    description: 'Слепить шарики ~30 г каждый. Выложить на тарелку или доску. Не сдавливать слишком сильно.',
    duration: { value: '10–15 мин', accuracy: 'estimated' },
    temperature: null,
    equipment: null,
    equipmentSetting: null,
    doneWhen: 'Все шарики одинакового размера (~3–4 см диаметр). Поверхность гладкая. 12–14 штук из стандартной порции.',
    ifSkipped: 'Разный размер → неравномерное приготовление. Мелкие сгорят, крупные останутся сырыми.',
    calibration: null,
  },
  {
    id: 7,
    title: 'Разогрев аэрофритюрницы',
    description: 'Разогреть Ninja MAX PRO в режиме Air Fry до 200 °C.',
    duration: { value: '3–5 мин', accuracy: 'verified' },
    temperature: { value: '200 °C', accuracy: 'verified' },
    equipment: 'NinjaMAXPRO',
    equipmentSetting: 'Air Fry',
    doneWhen: 'Индикатор готовности на Ninja показывает достижение 200 °C.',
    ifSkipped: 'Фалафель попадёт в холодную среду → впитает больше масла (из спрея) → жирный, не хрустящий.',
    calibration: '⚡ Калибровка: проверьте первую партию — время зависит от размера шариков и влажности смеси. Запишите своё оптимальное время.',
  },
  {
    id: 8,
    title: 'Жарка фалафеля (первая сторона)',
    description: 'Слегка сбрызнуть фалафели масляным спреем. Выложить в один слой в корзину аэрофритюрницы. Жарить 12–14 минут при 200 °C.',
    duration: { value: '12–14 мин', accuracy: 'estimated' },
    temperature: { value: '200 °C', accuracy: 'verified' },
    equipment: 'NinjaMAXPRO',
    equipmentSetting: 'Air Fry',
    doneWhen: 'Верхняя сторона золотисто-коричневая. Края начинают темнеть. При постукивании — глухой звук.',
    ifSkipped: 'Фалафель останется сырым внутри. Поверхность бледная, не хрустящая.',
    calibration: '⚡ Калибровка: проверьте первую партию — время зависит от размера шариков и влажности смеси. Запишите своё оптимальное время.',
  },
  {
    id: 9,
    title: 'Переворот и дожарка',
    description: 'Аккуратно перевернуть каждый фалафель лопаткой. Жарить ещё 5–7 минут при 200 °C.',
    duration: { value: '5–7 мин', accuracy: 'estimated' },
    temperature: { value: '200 °C', accuracy: 'verified' },
    equipment: 'NinjaMAXPRO',
    equipmentSetting: 'Air Fry',
    doneWhen: 'Обе стороны равномерно золотисто-коричневые. Корка хрустящая при постукивании ногтем. При разламывании — внутри светло-зелёный, паровой.',
    ifSkipped: 'Одна сторона бледная и мягкая. Неравномерная текстура.',
    calibration: '⚡ Калибровка: проверьте первую партию — время зависит от размера шариков и влажности смеси. Запишите своё оптимальное время.',
  },
  {
    id: 10,
    title: 'Отдых перед подачей',
    description: 'Выложить готовые фалафели на решётку (не на тарелку — низ отмокнет). Дать отдохнуть 2–3 минуты.',
    duration: { value: '2–3 мин', accuracy: 'verified' },
    temperature: null,
    equipment: null,
    equipmentSetting: null,
    doneWhen: 'Фалафель перестал шипеть. Корка стабилизировалась — стала ещё хрустящее.',
    ifSkipped: 'Сразу с пылу — можно обжечься. Корка ещё не стабилизировалась, при разрезании может развалиться.',
    calibration: null,
  },
];

// ═══════════════════════════════════════════════════════════════
// React hooks
// ═══════════════════════════════════════════════════════════════

const { useState } = React;

// ═══════════════════════════════════════════════════════════════
// Accuracy tag component
// ═══════════════════════════════════════════════════════════════

function AccuracyTag({ accuracy }) {
  if (!accuracy || accuracy === 'verified') return null;
  const config = {
    estimated: { icon: '~', label: 'Оценка', color: THEME.amber, title: 'Оценка; зависит от размера, влажности и т.д.' },
    empirical: { icon: '?', label: 'Проверка', color: THEME.red, title: 'Требует проверки пользователем' },
  };
  const c = config[accuracy];
  if (!c) return null;
  return (
    <span title={c.title} style={{
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '18px',
      height: '18px',
      borderRadius: '50%',
      backgroundColor: c.color,
      color: THEME.bg,
      fontSize: '0.65rem',
      fontWeight: 'bold',
      marginLeft: '4px',
      flexShrink: 0,
    }}>{c.icon}</span>
  );
}

// ═══════════════════════════════════════════════════════════════
// TabBar component
// ═══════════════════════════════════════════════════════════════

function TabBar({ activeTab, onTabChange }) {
  const tabs = [
    { id: 'ingredients', label: 'Ингредиенты' },
    { id: 'steps', label: 'Этапы приготовления' },
  ];
  return (
    <div style={{ display: 'flex', borderBottom: `2px solid ${THEME.border}`, marginBottom: '20px' }}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button key={tab.id} onClick={() => onTabChange(tab.id)} style={{
            flex: 1, padding: '12px 24px', fontSize: '1rem', fontFamily: 'Georgia, serif',
            fontWeight: isActive ? 'bold' : 'normal',
            color: isActive ? THEME.goldLight : THEME.textDim,
            backgroundColor: 'transparent', border: 'none',
            borderBottom: isActive ? `3px solid ${THEME.gold}` : '3px solid transparent',
            cursor: 'pointer', transition: 'color 0.2s, border-color 0.2s',
          }}>{tab.label}</button>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// InlineIcon — tiny inline icon for detail blocks
// ═══════════════════════════════════════════════════════════════

function InlineIcon({ char, color }) {
  return <span style={{ marginRight: '6px', color: color || THEME.textDim, fontWeight: 'bold' }}>{char}</span>;
}

// ═══════════════════════════════════════════════════════════════
// INGREDIENT PANEL (Panel 1)
// ═══════════════════════════════════════════════════════════════

const NECESSITY_COLORS = {
  'ОСНОВА': THEME.gold,
  'ВАЖНО': THEME.amber,
  'ОПЦИОНАЛЬНО': THEME.blue,
  'УСЛОВНЫЙ': THEME.textDim,
};

function IngredientPanel() {
  const [expandedAll, setExpandedAll] = useState(false);
  const [expandedCards, setExpandedCards] = useState({});

  const toggleAll = () => {
    if (expandedAll) {
      setExpandedAll(false);
      setExpandedCards({});
    } else {
      setExpandedAll(true);
      const all = {};
      INGREDIENTS.forEach((_, i) => { all[i] = true; });
      setExpandedCards(all);
    }
  };

  const toggleCard = (i) => {
    setExpandedCards((prev) => ({ ...prev, [i]: !prev[i] }));
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 style={{ fontFamily: 'Georgia, serif', color: THEME.goldLight, fontSize: '1.25rem', margin: 0 }}>
          Ингредиенты
        </h2>
        <button onClick={toggleAll} style={{
          padding: '6px 14px', borderRadius: '6px', border: `1px solid ${THEME.border}`,
          backgroundColor: THEME.surface, color: THEME.textDim, cursor: 'pointer',
          fontSize: '0.8rem', fontFamily: 'Georgia, serif',
        }}>
          {expandedAll ? 'Свернуть все' : 'Развернуть все'}
        </button>
      </div>

      {INGREDIENTS.map((ing, i) => {
        const isExpanded = expandedCards[i] || false;
        const necColor = NECESSITY_COLORS[ing.necessity] || THEME.textDim;
        const zoneType = ing.toleranceZone.type;

        return (
          <div key={i} style={STYLES.card}>
            {/* Card header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
              <div>
                <span style={{ fontFamily: 'Georgia, serif', color: THEME.goldLight, fontSize: '1.05rem', fontWeight: 'bold', marginRight: '8px' }}>
                  {ing.name}
                </span>
                <span style={STYLES.badge(necColor)}>{ing.necessity}</span>
              </div>
              <span style={{ fontFamily: 'Georgia, serif', color: THEME.textDim, fontSize: '0.9rem' }}>
                {ing.amount}
                {ing.empirical ? ' ?' : ''}
              </span>
            </div>

            {/* Role */}
            <p style={{ fontFamily: 'Georgia, serif', color: THEME.textDim, fontSize: '0.85rem', margin: '0 0 8px 0' }}>
              {ing.role}
            </p>

            {/* Toggle button */}
            <button onClick={() => toggleCard(i)} style={{
              padding: '4px 12px', borderRadius: '4px', border: `1px solid ${THEME.border}`,
              backgroundColor: 'transparent', color: THEME.goldDim, cursor: 'pointer',
              fontSize: '0.75rem', fontFamily: 'Georgia, serif', marginBottom: isExpanded ? '12px' : '0',
            }}>
              {isExpanded ? 'Свернуть матрицу ▲' : 'Развернуть матрицу ▼'}
            </button>

            {isExpanded && (
              <div>
                {/* 6-column matrix */}
                <div style={{ overflowX: 'auto', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', minWidth: '480px', border: `1px solid ${THEME.border}`, borderRadius: '6px', overflow: 'hidden' }}>
                    {MATRIX_COLS.map((col, ci) => (
                      <div key={ci} style={STYLES.matrixCell(ci === 3)}>
                        <div style={{ fontFamily: 'Georgia, serif', fontSize: '0.75rem', color: THEME.textMuted, marginBottom: '4px' }}>
                          {col.label}
                          <div style={{ fontSize: '0.6rem' }}>{col.desc}</div>
                        </div>
                        <div style={{
                          fontFamily: 'Georgia, serif', fontSize: '0.8rem', fontWeight: 'bold',
                          color: ci === 3 ? THEME.goldLight : THEME.text,
                          marginBottom: '2px',
                        }}>
                          {ing.matrix[ci].verdict}
                        </div>
                        <div style={{ fontFamily: 'Georgia, serif', fontSize: '0.7rem', color: THEME.textDim, lineHeight: '1.3' }}>
                          {ing.matrix[ci].consequence}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tolerance zone bar */}
                <div style={{ marginBottom: '12px' }}>
                  <div style={{ fontFamily: 'Georgia, serif', fontSize: '0.7rem', color: THEME.textMuted, marginBottom: '4px' }}>
                    Зона допуска: {ing.toleranceZone.description}
                  </div>
                  <div style={{ display: 'flex', height: '6px', borderRadius: '3px', overflow: 'hidden', backgroundColor: THEME.border }}>
                    {(() => {
                      const ranges = {
                        'base': [0, 0, 0, 1, 0, 0],
                        'narrow_both': [0, 0, 0, 1, 0, 0],
                        'narrow_above': [1, 1, 1, 1, 0, 0],
                        'wide_below': [0, 0, 1, 1, 1, 1],
                        'wide': [1, 1, 1, 1, 1, 1],
                        'very_wide': [1, 1, 1, 1, 1, 1],
                        'moderate': [0, 1, 1, 1, 1, 0],
                      };
                      const zone = ranges[zoneType] || [0, 0, 0, 1, 0, 0];
                      return zone.map((inZone, zi) => (
                        <div key={zi} style={{ flex: 1, backgroundColor: inZone ? THEME.green : 'transparent', borderRight: zi < 5 ? `1px solid ${THEME.border}` : 'none' }} />
                      ));
                    })()}
                  </div>
                </div>

                {/* Variants */}
                {ing.variants.length > 0 && (
                  <div style={{ marginBottom: '10px' }}>
                    <div style={{ fontFamily: 'Georgia, serif', fontSize: '0.75rem', color: THEME.goldDim, fontWeight: 'bold', marginBottom: '4px' }}>
                      Варианты формы:
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {ing.variants.map((v, vi) => (
                        <span key={vi} title={v.description} style={{
                          ...STYLES.chip, backgroundColor: THEME.card, border: `1px solid ${THEME.goldDim}`,
                          color: THEME.textDim, fontSize: '0.7rem', cursor: 'default',
                        }}>
                          {v.label} — {v.quantity}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Substitutions */}
                {ing.substitutions.length > 0 && (
                  <div>
                    <div style={{ fontFamily: 'Georgia, serif', fontSize: '0.75rem', color: THEME.goldDim, fontWeight: 'bold', marginBottom: '4px' }}>
                      Варианты и замены:
                    </div>
                    {ing.substitutions.map((sub, si) => (
                      <div key={si} style={{
                        padding: '8px 10px', marginBottom: '4px',
                        backgroundColor: THEME.surface, borderRadius: '4px',
                        borderLeft: `3px solid ${sub.name === 'Пропуск' ? THEME.amber : THEME.green}`,
                      }}>
                        <div style={{ fontFamily: 'Georgia, serif', fontSize: '0.8rem', color: THEME.text, fontWeight: 'bold' }}>
                          {sub.name}
                        </div>
                        <div style={{ fontFamily: 'Georgia, serif', fontSize: '0.7rem', color: THEME.textDim, marginTop: '2px' }}>
                          {sub.description}
                        </div>
                        <div style={{ fontFamily: 'Georgia, serif', fontSize: '0.65rem', color: THEME.textMuted, marginTop: '2px', fontStyle: 'italic' }}>
                          {sub.note}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// ACTION STEPS PANEL (Panel 2)
// ═══════════════════════════════════════════════════════════════

function ActionStepsPanel() {
  const [expandedAll, setExpandedAll] = useState(false);
  const [expandedSteps, setExpandedSteps] = useState({});

  const toggleAll = () => {
    if (expandedAll) {
      setExpandedAll(false);
      setExpandedSteps({});
    } else {
      setExpandedAll(true);
      const all = {};
      STEPS.forEach((_, i) => { all[i] = true; });
      setExpandedSteps(all);
    }
  };

  const toggleStep = (i) => {
    setExpandedSteps((prev) => ({ ...prev, [i]: !prev[i] }));
  };

  return (
    <div>
      {/* Panel header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 style={{ fontFamily: 'Georgia, serif', color: THEME.goldLight, fontSize: '1.25rem', margin: 0 }}>
          Этапы приготовления
        </h2>
        <button onClick={toggleAll} style={{
          padding: '6px 14px', borderRadius: '6px', border: `1px solid ${THEME.border}`,
          backgroundColor: THEME.surface, color: THEME.textDim, cursor: 'pointer',
          fontSize: '0.8rem', fontFamily: 'Georgia, serif',
        }}>
          {expandedAll ? 'Свернуть все' : 'Развернуть все'}
        </button>
      </div>

      {/* Accuracy legend */}
      <div style={{
        ...STYLES.card, borderColor: THEME.goldDim, padding: '10px 14px',
        display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center',
      }}>
        <span style={{ fontFamily: 'Georgia, serif', color: THEME.goldLight, fontSize: '0.85rem', fontWeight: 'bold' }}>
          ⚠ Точность:
        </span>
        <span style={{ fontFamily: 'Georgia, serif', fontSize: '0.75rem', color: THEME.textDim }}>
          Нет метки = проверено
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontFamily: 'Georgia, serif', fontSize: '0.75rem', color: THEME.textDim }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '16px', height: '16px', borderRadius: '50%', backgroundColor: THEME.amber, color: THEME.bg, fontSize: '0.6rem', fontWeight: 'bold' }}>~</span>
          = оценка
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontFamily: 'Georgia, serif', fontSize: '0.75rem', color: THEME.textDim }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '16px', height: '16px', borderRadius: '50%', backgroundColor: THEME.red, color: THEME.bg, fontSize: '0.6rem', fontWeight: 'bold' }}>?</span>
          = требует проверки
        </span>
      </div>

      {/* Важно summary block */}
      <div style={{
        ...STYLES.card, borderColor: THEME.gold, marginTop: '12px',
        padding: '12px 16px',
      }}>
        <div style={{ fontFamily: 'Georgia, serif', color: THEME.text, fontSize: '0.85rem', lineHeight: '1.5' }}>
          <strong style={{ color: THEME.goldLight }}>⚠ Важно:</strong> все указанные значения времени и температуры прошли трёхуровневую проверку точности. Значения с меткой ~ являются оценками — откалибруйте под своё оборудование. Значения с меткой ? требуют обязательной проверки.
        </div>
      </div>

      {/* Step cards */}
      {STEPS.map((step, i) => {
        const isExpanded = expandedSteps[i] || false;
        const eq = step.equipment ? EQUIPMENT[step.equipment] : null;
        const isAirFryer = step.equipment === 'NinjaMAXPRO';

        return (
          <div key={i} style={{ ...STYLES.card, marginTop: '12px', position: 'relative' }}>
            {/* Step number badge */}
            <div style={{
              position: 'absolute', top: '-10px', left: '-10px',
              width: '32px', height: '32px', borderRadius: '50%',
              backgroundColor: THEME.gold, color: THEME.bg,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'Georgia, serif', fontSize: '0.85rem', fontWeight: 'bold',
              border: `2px solid ${THEME.card}`,
            }}>
              {step.id}
            </div>

            {/* Step title */}
            <h3 style={{
              fontFamily: 'Georgia, serif', color: THEME.goldLight, fontSize: '1rem',
              margin: '4px 0 6px 24px',
            }}>
              {step.title}
            </h3>

            {/* Description */}
            <p style={{ fontFamily: 'Georgia, serif', color: THEME.textDim, fontSize: '0.85rem', margin: '0 0 10px 24px', lineHeight: '1.5' }}>
              {step.description}
            </p>

            {/* Chips row */}
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', marginLeft: '24px', marginBottom: '8px', gap: '4px' }}>
              {eq && (
                <span style={STYLES.chip} title={`${eq.name} · ${step.equipmentSetting}`}>
                  {eq.name}{step.equipmentSetting ? ` · ${step.equipmentSetting}` : ''}
                </span>
              )}
              {step.duration && (
                <span style={STYLES.chip}>
                  ⏱ {step.duration.value}
                  <AccuracyTag accuracy={step.duration.accuracy} />
                </span>
              )}
              {step.temperature && (
                <span style={STYLES.chip}>
                  🌡 {step.temperature.value}
                  <AccuracyTag accuracy={step.temperature.accuracy} />
                </span>
              )}
            </div>

            {/* Expand toggle */}
            <button onClick={() => toggleStep(i)} style={{
              padding: '4px 12px', borderRadius: '4px', border: `1px solid ${THEME.border}`,
              backgroundColor: 'transparent', color: THEME.goldDim, cursor: 'pointer',
              fontSize: '0.75rem', fontFamily: 'Georgia, serif', marginLeft: '24px',
            }}>
              {isExpanded ? 'Скрыть детали ▲' : 'Показать детали ▼'}
            </button>

            {isExpanded && (
              <div style={{ marginLeft: '24px', marginTop: '12px' }}>
                {/* Готовность */}
                <div style={{
                  padding: '10px 14px', marginBottom: '8px',
                  borderLeft: `3px solid ${THEME.green}`, backgroundColor: THEME.surface,
                  borderRadius: '0 6px 6px 0',
                }}>
                  <div style={{ fontFamily: 'Georgia, serif', fontSize: '0.8rem', color: THEME.green, fontWeight: 'bold', marginBottom: '4px' }}>
                    <InlineIcon char="✓" color={THEME.green} /> Готовность
                  </div>
                  <div style={{ fontFamily: 'Georgia, serif', color: THEME.textDim, fontSize: '0.8rem', lineHeight: '1.4' }}>
                    {step.doneWhen}
                  </div>
                </div>

                {/* Если пропустить */}
                <div style={{
                  padding: '10px 14px', marginBottom: '8px',
                  borderLeft: `3px solid ${THEME.red}`, backgroundColor: THEME.surface,
                  borderRadius: '0 6px 6px 0',
                }}>
                  <div style={{ fontFamily: 'Georgia, serif', fontSize: '0.8rem', color: THEME.red, fontWeight: 'bold', marginBottom: '4px' }}>
                    <InlineIcon char="✗" color={THEME.red} /> Если пропустить
                  </div>
                  <div style={{ fontFamily: 'Georgia, serif', color: THEME.textDim, fontSize: '0.8rem', lineHeight: '1.4' }}>
                    {step.ifSkipped}
                  </div>
                </div>

                {/* Calibration (air fryer only) */}
                {isAirFryer && step.calibration && (
                  <div style={{
                    padding: '10px 14px',
                    borderLeft: `3px solid ${THEME.amber}`, backgroundColor: THEME.surface,
                    borderRadius: '0 6px 6px 0',
                  }}>
                    <div style={{ fontFamily: 'Georgia, serif', color: THEME.textDim, fontSize: '0.8rem', lineHeight: '1.4' }}>
                      {step.calibration}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// App — root component
// ═══════════════════════════════════════════════════════════════

function App() {
  const [activeTab, setActiveTab] = useState('ingredients');

  return (
    <div style={{
      maxWidth: '800px',
      margin: '0 auto',
      padding: '24px 16px',
      backgroundColor: THEME.bg,
      minHeight: '100vh',
      fontFamily: 'Georgia, serif',
      color: THEME.text,
    }}>
      <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
      {activeTab === 'ingredients' ? <IngredientPanel /> : <ActionStepsPanel />}
    </div>
  );
}
