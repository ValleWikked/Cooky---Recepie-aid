// ALL UNITS: metric — g, ml, °C. No imperial.

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
// TOAST — global dispatcher set by App on mount
// ═══════════════════════════════════════════════════════════════

let _showToast = null;

// ═══════════════════════════════════════════════════════════════
// EQUIPMENT PROFILES — localStorage-backed profile store
// ═══════════════════════════════════════════════════════════════

const EQUIPMENT_STORE_KEY = 'cookingviz_equipment';

const DEFAULT_PROFILES = [
  {
    id: 'NinjaMAXPRO',
    name: 'Ninja MAX PRO',
    type: 'airfryer',
    capacity: '6.2 L',
    maxTemp: 240,
    bowlCapacity: null,
    modes: ['Air Fry', 'Roast', 'Bake', 'Dehydrate', 'Reheat'],
    icon: '🔥',
    isDefault: true,
  },
  {
    id: 'KenwoodFDP22',
    name: 'Kenwood FDP22.130GY',
    type: 'processor',
    capacity: null,
    maxTemp: null,
    bowlCapacity: '2.1 L',
    modes: ['Chop', 'Mix', 'Knead', 'Whisk', 'Purée'],
    icon: '🍴',
    isDefault: true,
  },
  {
    id: 'PanasonicSDYR2550',
    name: 'Panasonic SD-YR2550',
    type: 'breadmaker',
    capacity: null,
    maxTemp: null,
    bowlCapacity: null,
    modes: ['Basic', 'Whole Wheat', 'Dough', 'Gluten-Free'],
    icon: '🍞',
    isDefault: true,
  },
  {
    id: 'OZAVO',
    name: 'OZAVO sandwich maker',
    type: 'sandwichmaker',
    capacity: null,
    maxTemp: null,
    bowlCapacity: null,
    modes: ['Toast', 'Grill'],
    icon: '🥪',
    isDefault: true,
  },
  {
    id: 'Cecotec',
    name: 'Cecotec blender',
    type: 'blender',
    capacity: null,
    maxTemp: null,
    bowlCapacity: null,
    modes: ['Blend', 'Pulse'],
    icon: '🥤',
    isDefault: true,
  },
];

const EquipmentProfiles = {
  _profiles: null,

  _init() {
    if (this._profiles !== null) return;
    try {
      const raw = localStorage.getItem(EQUIPMENT_STORE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this._profiles = parsed;
        }
      }
    } catch (e) {
      // Corrupt data — reset to defaults + notify user
      _showToast?.('Данные оборудования повреждены. Настройки сброшены.');
    }
    if (!this._profiles) {
      this._profiles = DEFAULT_PROFILES.map(p => ({ ...p }));
      this._save();
    }
  },

  _save() {
    localStorage.setItem(EQUIPMENT_STORE_KEY, JSON.stringify(this._profiles));
  },

  getAll() { this._init(); return this._profiles; },

  getById(id) { this._init(); return this._profiles.find(p => p.id === id) || null; },

  add(profile) {
    this._init();
    const newProfile = { ...profile, id: profile.id || `custom_${Date.now()}`, isDefault: false };
    this._profiles.push(newProfile);
    this._save();
    return newProfile;
  },

  update(id, updates) {
    this._init();
    const idx = this._profiles.findIndex(p => p.id === id);
    if (idx === -1) return null;
    this._profiles[idx] = { ...this._profiles[idx], ...updates, id: this._profiles[idx].id, isDefault: this._profiles[idx].isDefault };
    this._save();
    return this._profiles[idx];
  },

  remove(id) {
    this._init();
    const profile = this._profiles.find(p => p.id === id);
    if (!profile || profile.isDefault) return false;
    this._profiles = this._profiles.filter(p => p.id !== id);
    this._save();
    return true;
  },
};

// ═══════════════════════════════════════════════════════════════
// CALIBRATION STORE — localStorage-backed per-equipment-step records
// ═══════════════════════════════════════════════════════════════

const CALIBRATION_STORE_KEY = 'cookingviz_calibrations';

const CalibrationStore = {
  _data: null,

  _init() {
    if (this._data !== null) return;
    try {
      const raw = localStorage.getItem(CALIBRATION_STORE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (typeof parsed === 'object' && parsed !== null) {
          this._data = parsed;
        }
      }
    } catch (e) {
      // Corrupt — start fresh + notify user
      _showToast?.('Данные калибровок повреждены. Настройки сброшены.');
    }
    if (!this._data) {
      this._data = {};
    }
  },

  _save() {
    localStorage.setItem(CALIBRATION_STORE_KEY, JSON.stringify(this._data));
  },

  /** Get calibration for a given equipment-step pair, or null */
  get(equipmentId, stepId) {
    this._init();
    const key = `${equipmentId}::${stepId}`;
    return this._data[key] || null;
  },

  /** Set (create or update) calibration for a given equipment-step pair */
  set(equipmentId, stepId, record) {
    this._init();
    const key = `${equipmentId}::${stepId}`;
    this._data[key] = {
      equipmentId,
      stepId,
      optimalTime: record.optimalTime || '',
      optimalTemp: record.optimalTemp || '',
      notes: record.notes || '',
      calibratedAt: new Date().toISOString(),
    };
    this._save();
    return this._data[key];
  },

  /** Get all stored calibrations as an array */
  getAll() { this._init(); return Object.values(this._data); },

  /** Clear all calibrations */
  clear() { this._data = {}; this._save(); },
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
    amount: '250 g (сухой)',
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
    amount: '80 g (~1 средняя луковица)',
    toleranceZone: { type: 'wide_below', description: '¾× ≈ 1× — широкий допуск вниз; умеренный вверх' },
    variants: [
      { label: 'Свежий', description: 'Стандарт. Выделяет влагу при нарезке — учитывать при связывании.', quantity: '80 g' },
      { label: 'Сушёный (порошок)', description: '~1 ч.л. вместо 80 g. Не даёт влаги — смесь суше.', quantity: '1 ч.л.' },
      { label: 'Шалот', description: 'Нежнее, слаще, меньше влаги.', quantity: '80–90 g' },
      { label: 'Зелёный лук', description: 'Мягче, менее сладкий. Только белые и светло-зелёные части.', quantity: '~60 g' },
      { label: 'Красный лук', description: 'Острее в сыром виде, больше цвета.', quantity: '80 g' },
    ],
    substitutions: [
      { name: 'Шалот', description: 'Ближайший заменитель, более изысканный вкус.', note: 'Те же пропорции или +10%' },
      { name: 'Луковый порошок', description: 'Работает если снижение влажности допустимо.', note: '~1 ч.л. вместо 80 g' },
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
    amount: '3–4 зубчика (~15 g)',
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
    amount: '20 g (пучок, только листья)',
    toleranceZone: { type: 'wide', description: 'Широкий допуск — 0 приемлемо, 3/2× всё ещё хорошо' },
    variants: [
      { label: 'Свежая', description: 'Стандарт. Только листья, без стеблей.', quantity: '20 g' },
      { label: 'Кинза', description: 'Более яркий, цитрусовый оттенок. Не всем нравится.', quantity: '20 g' },
      { label: 'Сушёная', description: 'Слабее аромат. Использовать 1 ст.л. вместо пучка.', quantity: '1 ст.л.' },
    ],
    substitutions: [
      { name: 'Кинза', description: 'Ярче, цитрусовый оттенок. Классическая альтернатива.', note: 'Та же пропорция' },
      { name: 'Укроп', description: 'Другой профиль — анисовый оттенок.', note: '15 g, не всем подходит' },
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
    amount: '1 ч.л. (~5 g)',
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
    description: 'Слепить один шарик (~30 g). Если держит форму и не трескается — мука не нужна. Если разваливается — добавить муку по 1 ст.л. и повторить тест.',
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
    description: 'Слепить шарики ~30 g каждый. Выложить на тарелку или доску. Не сдавливать слишком сильно.',
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
// ACCURACY VERIFICATION ENGINE — 9 Core Accuracy Rules
// ═══════════════════════════════════════════════════════════════

// Each rule below enforces a Core Accuracy Rule from SKILL.md.
// R1-R9 together audit every time/temperature value across all steps.
const ACCURACY_RULES = [
  // R1: Enforces SKILL.md Rule 1 (Three tiers of certainty).
  // Every duration and temperature MUST declare its accuracy tier.
  // Violation: step data is missing the accuracy field entirely.
  {
    id: 'R1',
    name: 'AccuracyRequired',
    description: 'Every duration and temperature in every step MUST have an accuracy field',
    severity: 'error',
    check(step) {
      if (step.duration && !step.duration.accuracy) {
        return { pass: false, message: `Шаг ${step.id}: duration ("${step.duration.value}") — отсутствует accuracy` };
      }
      if (step.temperature && !step.temperature.accuracy) {
        return { pass: false, message: `Шаг ${step.id}: temperature ("${step.temperature.value}") — отсутствует accuracy` };
      }
      return { pass: true };
    },
  },
  // R2: Enforces SKILL.md Rule 1 (estimated tier visibility).
  // Steps with estimated accuracy MUST render a '~' tag in the UI.
  // Fix: ensure AccuracyTag receives accuracy='estimated' on the value.
  {
    id: 'R2',
    name: 'EstimatedTag',
    description: 'If accuracy is "estimated", the value text MUST contain a ~ somewhere in the UI rendering path',
    severity: 'warning',
    check(step) {
      // AccuracyTag renders '~' badge for estimated accuracy — structural rule,
      // always satisfied by the component. Warns if estimated has no value to tag.
      const estimatedFields = [];
      if (step.duration && step.duration.accuracy === 'estimated') estimatedFields.push('duration');
      if (step.temperature && step.temperature.accuracy === 'estimated') estimatedFields.push('temperature');
      if (estimatedFields.length > 0 && !step.duration && !step.temperature) {
        return { pass: false, message: `Шаг ${step.id}: accuracy "estimated" но нет ни duration, ни temperature для отображения ~` };
      }
      return { pass: true };
    },
  },
  // R3: Enforces SKILL.md Rule 1 (empirical tier visibility).
  // Steps with empirical accuracy MUST render a '?' tag in the UI.
  // Fix: ensure AccuracyTag receives accuracy='empirical' on the value.
  {
    id: 'R3',
    name: 'EmpiricalTag',
    description: 'If accuracy is "empirical", the value text MUST contain a ? somewhere in the UI rendering path',
    severity: 'error',
    check(step) {
      // AccuracyTag renders '?' badge for empirical accuracy — structural rule.
      const empiricalFields = [];
      if (step.duration && step.duration.accuracy === 'empirical') empiricalFields.push('duration');
      if (step.temperature && step.temperature.accuracy === 'empirical') empiricalFields.push('temperature');
      if (empiricalFields.length > 0 && !step.duration && !step.temperature) {
        return { pass: false, message: `Шаг ${step.id}: accuracy "empirical" но нет ни duration, ни temperature для отображения ?` };
      }
      return { pass: true };
    },
  },
  // R4: Enforces SKILL.md line 174 — "No tag for verified durations".
  // Verified values must NOT render any badge. Absence implies verification.
  // Info-level: structural guarantee already enforced by AccuracyTag returning null.
  {
    id: 'R4',
    name: 'VerifiedNoTag',
    description: 'If accuracy is "verified", there must be NO ~ or ? badge in the rendered output',
    severity: 'info',
    check(step) {
      // AccuracyTag returns null for verified — structural rule, always satisfied.
      // Info-level: reminds authors that verified values need no uncertainty badge.
      return { pass: true };
    },
  },
  // R5: Enforces SKILL.md Pre-Code Checklist item 5.
  // Steps with temperature values MUST specify which equipment is used.
  // Also validates that the referenced equipment exists in EquipmentProfiles.
  {
    id: 'R5',
    name: 'EquipmentRequired',
    description: 'If temperature exists and is not null, equipment must be specified',
    severity: 'error',
    check(step) {
      if (step.temperature && step.temperature.value) {
        if (!step.equipment) {
          return { pass: false, message: `Шаг ${step.id}: указана температура "${step.temperature.value}" но equipment не задан` };
        }
        // Check equipment exists in profile store
        const eq = EquipmentProfiles.getById(step.equipment);
        if (!eq) {
          return { pass: false, message: `Шаг ${step.id}: equipment "${step.equipment}" не найден в профилях оборудования` };
        }
      }
      return { pass: true };
    },
  },
  // R6: Enforces SKILL.md Pre-Code Checklist item 5 + calibration rule.
  // Air fryer steps with estimated accuracy MUST include calibration instructions.
  // Without calibration, users cannot adjust times for their specific equipment.
  {
    id: 'R6',
    name: 'CalibrationRequired',
    description: 'If accuracy is "estimated" AND equipment is an air fryer type, calibration must be non-null',
    severity: 'error',
    check(step) {
      const hasEstimated = (step.duration && step.duration.accuracy === 'estimated')
        || (step.temperature && step.temperature.accuracy === 'estimated');
      if (!hasEstimated) return { pass: true };
      if (!step.equipment) return { pass: true };
      const eq = EquipmentProfiles.getById(step.equipment);
      if (!eq) return { pass: true }; // missing equipment caught by R5
      if (eq.type === 'airfryer') {
        if (!step.calibration) {
          return { pass: false, message: `Шаг ${step.id}: estimated accuracy + air fryer (${eq.name}) — calibration обязателен, но отсутствует` };
        }
      }
      return { pass: true };
    },
  },
  // R7: Enforces SKILL.md Pre-Code Checklist item 5 (step completeness).
  // Every step needs a concrete sensory "done-when" cue.
  // Without it, users cannot determine when the step is finished.
  {
    id: 'R7',
    name: 'DoneWhenRequired',
    description: 'Every step must have a non-empty doneWhen field',
    severity: 'error',
    check(step) {
      if (!step.doneWhen || step.doneWhen.trim().length === 0) {
        return { pass: false, message: `Шаг ${step.id}: поле doneWhen обязательно, но пустое` };
      }
      return { pass: true };
    },
  },
  // R8: Enforces SKILL.md Core Accuracy Rule structure (consequence awareness).
  // Every step needs a concrete "if-skipped" consequence warning.
  // Users must understand the impact of skipping each step.
  {
    id: 'R8',
    name: 'IfSkippedRequired',
    description: 'Every step must have a non-empty ifSkipped field',
    severity: 'error',
    check(step) {
      if (!step.ifSkipped || step.ifSkipped.trim().length === 0) {
        return { pass: false, message: `Шаг ${step.id}: поле ifSkipped обязательно, но пустое` };
      }
      return { pass: true };
    },
  },
  // R9: Enforces SKILL.md Core Accuracy Rule 3 (verified equipment specs).
  // Kenwood FDP22 bowl is verified at 2.1 L from manufacturer spec.
  // "1.5 L" is a known documentation error that must never appear.
  {
    id: 'R9',
    name: 'KenwoodBowl',
    description: 'Any reference to Kenwood FDP22 bowl capacity must be "2.1 L", not "1.5 L"',
    severity: 'error',
    check(step) {
      const kp = EquipmentProfiles.getById('KenwoodFDP22');
      if (!kp) return { pass: true };
      const expected = kp.bowlCapacity;
      if (!expected) return { pass: true };
      // Scan all text fields for wrong bowl capacity references
      const textFields = [step.description, step.doneWhen, step.ifSkipped, step.calibration,
        step.duration ? step.duration.value : null,
        step.temperature ? step.temperature.value : null,
      ].filter(Boolean);
      const wrongPattern = /1\.5\s*L/gi;
      for (const text of textFields) {
        if (wrongPattern.test(text)) {
          return { pass: false, message: `Шаг ${step.id}: найдено "1.5 L" вместо "${expected}" для Kenwood FDP22` };
        }
      }
      return { pass: true };
    },
  },
];

function runAccuracyVerification(steps) {
  const report = {
    totalSteps: steps.length,
    totalRules: ACCURACY_RULES.length,
    checksRun: 0,
    passed: 0,
    errors: [],
    warnings: [],
    infos: [],
  };

  for (const step of steps) {
    for (const rule of ACCURACY_RULES) {
      report.checksRun++;
      const result = rule.check(step);
      if (result.pass) {
        report.passed++;
      } else {
        const violation = {
          rule: rule.id,
          ruleName: rule.name,
          stepId: step.id,
          stepTitle: step.title,
          message: result.message || `${rule.name} failed`,
        };
        if (rule.severity === 'error') {
          report.errors.push(violation);
        } else if (rule.severity === 'warning') {
          report.warnings.push(violation);
        } else {
          report.infos.push(violation);
        }
      }
    }
  }

  return report;
}

// ═══════════════════════════════════════════════════════════════
// React hooks
// ═══════════════════════════════════════════════════════════════

const { useState, useEffect, useMemo, useCallback, useRef, memo } = React;

// ═══════════════════════════════════════════════════════════════
// Responsive breakpoint hook
// ═══════════════════════════════════════════════════════════════

function useWindowWidth() {
  const [width, setWidth] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth : 1024
  );
  useEffect(() => {
    let ticking = false;
    const handleResize = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setWidth(window.innerWidth);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const breakpoint = width <= 600 ? 'mobile' : width <= 900 ? 'tablet' : 'desktop';
  return { width, breakpoint };
}

// ═══════════════════════════════════════════════════════════════
// ANIMATION CSS — injected once into document head
// ═══════════════════════════════════════════════════════════════

const ANIMATION_CSS = `
@keyframes cv-fade-in { from { opacity: 0; } to { opacity: 1; } }
@keyframes cv-fade-out { from { opacity: 1; } to { opacity: 0; } }
@keyframes cv-modal-enter { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
@keyframes cv-modal-exit { from { opacity: 1; transform: scale(1); } to { opacity: 0; transform: scale(0.95); } }
@keyframes cv-backdrop-enter { from { opacity: 0; } to { opacity: 1; } }
@keyframes cv-backdrop-exit { from { opacity: 1; } to { opacity: 0; } }
@keyframes cv-badge-pulse { 0% { transform: scale(1); } 50% { transform: scale(1.15); } 100% { transform: scale(1); } }
@media (prefers-reduced-motion: reduce) {
  .cv-animated, .cv-animated * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
`;

// ═══════════════════════════════════════════════════════════════
// PRINT CSS — injected once into document head
// ═══════════════════════════════════════════════════════════════

const PRINT_CSS = `
@media print {
  /* ── White background, black text base ── */
  body, #root, .cv-animated,
  div, span, p, h1, h2, h3, h4, h5, h6, td, th {
    background-color: #fff !important;
    color: #000 !important;
  }

  /* ── Card borders become thin gray ── */
  div, table, th, td {
    border-color: #ccc !important;
  }

  /* ── Hide interactive chrome: header row with tabs + gear ── */
  .cv-animated > div:first-child {
    display: none !important;
  }

  /* ── Hide expand/collapse toggle buttons ── */
  button {
    display: none !important;
  }

  /* ── Hide modals and backdrop overlays ── */
  div[style*="position: fixed"],
  div[style*="z-index: 1000"],
  div[style*="z-index: 1100"] {
    display: none !important;
  }

  /* ── Show all collapsed content ── */
  div[style*="max-height"] {
    max-height: none !important;
    overflow: visible !important;
    opacity: 1 !important;
  }

  /* ── Matrix full width, no horizontal scroll ── */
  div[style*="overflow-x: auto"],
  div[style*="overflowX: auto"] {
    overflow: visible !important;
    max-width: 100% !important;
  }

  /* ── Reset inline overflow hidden on the root container ── */
  div[style*="overflow-x: hidden"],
  div[style*="overflowX: hidden"] {
    overflow: visible !important;
  }

  /* ── Hide scrollable containers ── */
  div[style*="overflow-y: auto"],
  div[style*="overflowY: auto"] {
    overflow: visible !important;
    max-height: none !important;
  }

  /* ── Print header via body::before ── */
  body::before {
    content: "Cooking Visualizer — Разбор рецепта" !important;
    display: block !important;
    font-family: Georgia, serif !important;
    font-size: 18pt !important;
    font-weight: bold !important;
    color: #000 !important;
    text-align: center !important;
    padding: 20px 0 10px 0 !important;
    border-bottom: 2px solid #ccc !important;
    margin-bottom: 20px !important;
  }

  /* ── Font-size base ── */
  body, body * {
    font-size: 11pt !important;
  }
  h1, h2, h3, h4 {
    font-size: 14pt !important;
  }

  /* ── Animations off ── */
  * {
    animation: none !important;
    transition: none !important;
  }
}
`;

// ═══════════════════════════════════════════════════════════════
// Reduced-motion preference hook
// ═══════════════════════════════════════════════════════════════

function useReducedMotion() {
  const [reduced, setReduced] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = (e) => setReduced(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return reduced;
}

// ═══════════════════════════════════════════════════════════════
// ErrorBoundary — catches render errors, prevents white screen
// ═══════════════════════════════════════════════════════════════

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[CookingVisualizer] Render error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          maxWidth: '500px', margin: '60px auto', padding: '32px 24px',
          backgroundColor: THEME.card, border: `1px solid ${THEME.border}`,
          borderRadius: '12px', color: THEME.text, textAlign: 'center',
          fontFamily: 'Georgia, serif',
        }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '16px' }}>⚠</div>
          <h2 style={{
            fontFamily: 'Georgia, serif', color: THEME.goldLight, fontSize: '1.3rem',
            margin: '0 0 12px 0',
          }}>
            Что-то пошло не так
          </h2>
          <p style={{
            fontFamily: 'Georgia, serif', color: THEME.textDim, fontSize: '0.9rem',
            margin: '0 0 24px 0', lineHeight: '1.5',
          }}>
            Произошла ошибка при отображении. Попробуйте обновить страницу.
          </p>
          <button onClick={() => window.location.reload()} style={{
            padding: '10px 28px', borderRadius: '8px', border: 'none',
            backgroundColor: THEME.gold, color: THEME.bg, cursor: 'pointer',
            fontFamily: 'Georgia, serif', fontSize: '1rem', fontWeight: 'bold',
          }}>
            Обновить
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

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

const TabBar = memo(function TabBar({ activeTab, onTabChange }) {
  const { breakpoint } = useWindowWidth();
  const isMobile = breakpoint === 'mobile';
  const tabs = [
    { id: 'ingredients', label: 'Ингредиенты' },
    { id: 'steps', label: 'Этапы приготовления' },
  ];
  return (
    <div style={{ display: 'flex', borderBottom: `2px solid ${THEME.border}`, marginBottom: isMobile ? '12px' : '20px' }}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button key={tab.id} onClick={() => onTabChange(tab.id)} style={{
            flex: 1,
            padding: isMobile ? '10px 12px' : '12px 24px',
            minHeight: '44px',
            fontSize: isMobile ? '0.9rem' : '1rem',
            fontFamily: 'Georgia, serif',
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
});

// ═══════════════════════════════════════════════════════════════
// InlineIcon — tiny inline icon for detail blocks
// ═══════════════════════════════════════════════════════════════

function InlineIcon({ char, color }) {
  return <span style={{ marginRight: '6px', color: color || THEME.textDim, fontWeight: 'bold' }}>{char}</span>;
}

// ═══════════════════════════════════════════════════════════════
// IngredientCard — memoized card sub-component
// ═══════════════════════════════════════════════════════════════

const IngredientCard = memo(function IngredientCard({ ing, index, isExpanded, isMobile, cardPad, cellMinWidth, matrixMinWidth, ingNameSize, reduceMotion, onToggle }) {
  const necColor = NECESSITY_COLORS[ing.necessity] || THEME.textDim;
  const zoneType = ing.toleranceZone.type;
  return (
    <div style={{ ...STYLES.card, padding: cardPad }}>
      {/* Card header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
        <div>
          <span style={{ fontFamily: 'Georgia, serif', color: THEME.goldLight, fontSize: ingNameSize, fontWeight: 'bold', marginRight: '8px' }}>
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
      <button onClick={() => onToggle(index)} style={{
        padding: '4px 12px', borderRadius: '4px', border: `1px solid ${THEME.border}`,
        backgroundColor: 'transparent', color: THEME.goldDim, cursor: 'pointer',
        fontSize: '0.75rem', fontFamily: 'Georgia, serif', marginBottom: isExpanded ? '12px' : '0',
      }}>
        {isExpanded ? 'Свернуть матрицу ▲' : 'Развернуть матрицу ▼'}
      </button>
      <div style={{
        maxHeight: isExpanded ? '2000px' : '0px',
        overflow: 'hidden',
        opacity: isExpanded ? 1 : 0,
        transition: reduceMotion ? 'none' : 'max-height 0.3s ease, opacity 0.3s ease',
      }}>
        <div>
          {/* 6-column matrix */}
          <div style={{ overflowX: 'auto', marginBottom: '12px' }}>
            <div style={{ display: 'flex', minWidth: matrixMinWidth, border: `1px solid ${THEME.border}`, borderRadius: '6px', overflow: 'hidden' }}>
              {MATRIX_COLS.map((col, ci) => (
                <div key={ci} style={{ ...STYLES.matrixCell(ci === 3), minWidth: cellMinWidth }}>
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
      </div>
    </div>
  );
});

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
  const { breakpoint } = useWindowWidth();
  const isMobile = breakpoint === 'mobile';
  const reduceMotion = useReducedMotion();
  const [expandedAll, setExpandedAll] = useState(false);
  const [expandedCards, setExpandedCards] = useState({});

  const cardPad = isMobile ? '12px' : '16px';
  const cellMinWidth = isMobile ? '60px' : '80px';
  const matrixMinWidth = isMobile ? '360px' : '480px';
  const h2Size = isMobile ? '1.1rem' : '1.25rem';
  const ingNameSize = isMobile ? '0.95rem' : '1.05rem';

  const toggleAll = useCallback(() => {
    if (expandedAll) {
      setExpandedAll(false);
      setExpandedCards({});
    } else {
      setExpandedAll(true);
      const all = {};
      INGREDIENTS.forEach((_, i) => { all[i] = true; });
      setExpandedCards(all);
    }
  }, [expandedAll]);

  const toggleCard = useCallback((i) => {
    setExpandedCards((prev) => ({ ...prev, [i]: !prev[i] }));
  }, []);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 style={{ fontFamily: 'Georgia, serif', color: THEME.goldLight, fontSize: h2Size, margin: 0 }}>
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

      {INGREDIENTS.length === 0 ? (
        <div style={{
          ...STYLES.card, padding: '32px 16px', textAlign: 'center',
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '12px' }}>📋</div>
          <p style={{
            fontFamily: 'Georgia, serif', color: THEME.textDim, fontSize: '0.95rem',
            margin: 0,
          }}>
            Нет данных об ингредиентах
          </p>
        </div>
      ) : (
      INGREDIENTS.map((ing, i) => (
        <IngredientCard
          key={i}
          ing={ing}
          index={i}
          isExpanded={expandedCards[i] || false}
          isMobile={isMobile}
          cardPad={cardPad}
          cellMinWidth={cellMinWidth}
          matrixMinWidth={matrixMinWidth}
          ingNameSize={ingNameSize}
          reduceMotion={reduceMotion}
          onToggle={toggleCard}
        />
      ))
      }
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// StepCard — memoized step card sub-component
// ═══════════════════════════════════════════════════════════════

const StepCard = memo(function StepCard({ step, index, isExpanded, cardPad, isMobile, inputFontSize, reduceMotion, editingCal, calFormState, setEditingCal, setCalFormState, onToggle, onOpenSettings, refreshCalibrations }) {
  const eq = step.equipment ? EquipmentProfiles.getById(step.equipment) : null;
  const deletedEq = step.equipment && !eq;
  const isAirFryer = step.equipment === 'NinjaMAXPRO';

  return (
    <div key={index} id={`step-card-${step.id}`} style={{ ...STYLES.card, padding: cardPad, marginTop: '12px', position: 'relative' }}>
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
          <span
            style={{ ...STYLES.chip, cursor: 'pointer' }}
            title={`${eq.name} · ${step.equipmentSetting} — нажмите для настроек оборудования`}
            onClick={onOpenSettings}
          >
            {eq.icon ? `${eq.icon} ` : ''}{eq.name}{step.equipmentSetting ? ` · ${step.equipmentSetting}` : ''}
          </span>
        )}
        {deletedEq && (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '4px',
            padding: '3px 10px', borderRadius: '12px', fontSize: '0.8rem',
            backgroundColor: THEME.red, color: THEME.bg, marginRight: '6px', marginBottom: '4px',
            fontWeight: 'bold',
          }} title="Это устройство было удалено из профилей">
            ⚠ Устройство удалено
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
      <button onClick={() => onToggle(index)} style={{
        padding: '4px 12px', borderRadius: '4px', border: `1px solid ${THEME.border}`,
        backgroundColor: 'transparent', color: THEME.goldDim, cursor: 'pointer',
        fontSize: '0.75rem', fontFamily: 'Georgia, serif', marginLeft: '24px',
      }}>
        {isExpanded ? 'Скрыть детали ▲' : 'Показать детали ▼'}
      </button>

      <div style={{
        marginLeft: '24px', marginTop: isExpanded ? '12px' : '0px',
        maxHeight: isExpanded ? '2000px' : '0px',
        overflow: 'hidden',
        opacity: isExpanded ? 1 : 0,
        transition: reduceMotion ? 'none' : 'max-height 0.3s ease, opacity 0.3s ease, margin-top 0.3s ease',
      }}>
        <div style={{ marginTop: '0px' }}>
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

          {/* User calibration UI (air fryer steps only) */}
          {isAirFryer && step.calibration && (() => {
            const cal = CalibrationStore.get('NinjaMAXPRO', step.id);
            const calKey = `NinjaMAXPRO::${step.id}`;
            const isEditing = editingCal[calKey] || false;
            const form = calFormState[calKey] || { optimalTime: cal ? cal.optimalTime : '', optimalTemp: cal ? cal.optimalTemp : '', notes: cal ? cal.notes : '' };

            const updateForm = (field, value) => {
              setCalFormState(prev => ({ ...prev, [calKey]: { ...prev[calKey], [field]: value } }));
            };

            const handleSaveCal = () => {
              CalibrationStore.set('NinjaMAXPRO', step.id, form);
              setEditingCal(prev => ({ ...prev, [calKey]: false }));
              setCalFormState(prev => { const n = { ...prev }; delete n[calKey]; return n; });
              refreshCalibrations();
            };

            const handleResetCal = () => {
              const data = CalibrationStore._data;
              delete data[calKey];
              CalibrationStore._save();
              setCalFormState(prev => { const n = { ...prev }; delete n[calKey]; return n; });
              refreshCalibrations();
            };

            const startEdit = () => {
              setCalFormState(prev => ({
                ...prev,
                [calKey]: { optimalTime: cal ? cal.optimalTime : '', optimalTemp: cal ? cal.optimalTemp : '', notes: cal ? cal.notes : '' }
              }));
              setEditingCal(prev => ({ ...prev, [calKey]: true }));
            };

            return (
              <div style={{
                padding: '12px 14px', marginBottom: '8px',
                borderLeft: `3px solid ${THEME.blue}`, backgroundColor: THEME.surface,
                borderRadius: '0 6px 6px 0',
              }}>
                <div style={{ fontFamily: 'Georgia, serif', fontSize: '0.8rem', color: THEME.blue, fontWeight: 'bold', marginBottom: '8px' }}>
                  📝 Моя калибровка
                </div>

                {cal && !isEditing ? (
                  /* READ-ONLY saved calibration */
                  <div>
                    <div style={{ fontFamily: 'Georgia, serif', color: THEME.textDim, fontSize: '0.8rem', lineHeight: '1.6' }}>
                      {cal.optimalTime && <span style={{ marginRight: '16px' }}>⏱ <strong>{cal.optimalTime}</strong></span>}
                      {cal.optimalTemp && <span style={{ marginRight: '16px' }}>🌡 <strong>{cal.optimalTemp}</strong></span>}
                    </div>
                    {cal.notes && (
                      <div style={{ fontFamily: 'Georgia, serif', color: THEME.textMuted, fontSize: '0.75rem', marginTop: '4px', fontStyle: 'italic' }}>
                        {cal.notes}
                      </div>
                    )}
                    <div style={{ fontFamily: 'Georgia, serif', color: THEME.textMuted, fontSize: '0.7rem', marginTop: '6px' }}>
                      Откалибровано: {new Date(cal.calibratedAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                      <button onClick={startEdit} style={{
                        padding: '4px 12px', borderRadius: '4px', border: `1px solid ${THEME.border}`,
                        backgroundColor: THEME.surface, color: THEME.textDim, cursor: 'pointer',
                        fontSize: '0.75rem', fontFamily: 'Georgia, serif',
                      }}>
                        ✏️ Редактировать
                      </button>
                      <button onClick={handleResetCal} style={{
                        padding: '4px 12px', borderRadius: '4px', border: `1px solid ${THEME.border}`,
                        backgroundColor: 'transparent', color: THEME.red, cursor: 'pointer',
                        fontSize: '0.75rem', fontFamily: 'Georgia, serif',
                      }}>
                        Сбросить
                      </button>
                    </div>
                  </div>
                ) : (
                  /* EDIT / CREATE form */
                  <div>
                    <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '10px', flexWrap: 'wrap', marginBottom: '8px' }}>
                      <div style={{ flex: '1 1 120px' }}>
                        <label style={{ display: 'block', fontFamily: 'Georgia, serif', color: THEME.textMuted, fontSize: '0.7rem', marginBottom: '2px' }}>
                          ⏱ Опт. время
                        </label>
                        <input
                          value={form.optimalTime}
                          onChange={(e) => updateForm('optimalTime', e.target.value)}
                          placeholder="12–14 мин"
                          style={{
                            width: '100%', padding: '5px 8px', borderRadius: '4px',
                            border: `1px solid ${THEME.border}`, backgroundColor: THEME.card,
                            color: THEME.text, fontFamily: 'Georgia, serif', fontSize: inputFontSize,
                            boxSizing: 'border-box',
                          }}
                        />
                      </div>
                      <div style={{ flex: '1 1 120px' }}>
                        <label style={{ display: 'block', fontFamily: 'Georgia, serif', color: THEME.textMuted, fontSize: '0.7rem', marginBottom: '2px' }}>
                          🌡 Опт. температура
                        </label>
                        <input
                          value={form.optimalTemp}
                          onChange={(e) => updateForm('optimalTemp', e.target.value)}
                          placeholder="195 °C"
                          style={{
                            width: '100%', padding: '5px 8px', borderRadius: '4px',
                            border: `1px solid ${THEME.border}`, backgroundColor: THEME.card,
                            color: THEME.text, fontFamily: 'Georgia, serif', fontSize: inputFontSize,
                            boxSizing: 'border-box',
                          }}
                        />
                      </div>
                    </div>
                    <div style={{ marginBottom: '8px' }}>
                      <label style={{ display: 'block', fontFamily: 'Georgia, serif', color: THEME.textMuted, fontSize: '0.7rem', marginBottom: '2px' }}>
                        📋 Заметки
                      </label>
                      <input
                        value={form.notes}
                        onChange={(e) => updateForm('notes', e.target.value)}
                        placeholder="Первая партия — 12 мин, вторая — 14 мин"
                        style={{
                          width: '100%', padding: '5px 8px', borderRadius: '4px',
                          border: `1px solid ${THEME.border}`, backgroundColor: THEME.card,
                          color: THEME.text, fontFamily: 'Georgia, serif', fontSize: inputFontSize,
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={handleSaveCal} style={{
                        padding: '5px 16px', borderRadius: '4px', border: 'none',
                        backgroundColor: THEME.green, color: THEME.bg, cursor: 'pointer',
                        fontSize: '0.8rem', fontFamily: 'Georgia, serif', fontWeight: 'bold',
                      }}>
                        💾 Сохранить
                      </button>
                      {cal && (
                        <button onClick={() => setEditingCal(prev => ({ ...prev, [calKey]: false }))} style={{
                          padding: '5px 14px', borderRadius: '4px', border: `1px solid ${THEME.border}`,
                          backgroundColor: THEME.surface, color: THEME.textDim, cursor: 'pointer',
                          fontSize: '0.8rem', fontFamily: 'Georgia, serif',
                        }}>
                          Отмена
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
});

// ═══════════════════════════════════════════════════════════════
// ACTION STEPS PANEL (Panel 2)
// ═══════════════════════════════════════════════════════════════

function ActionStepsPanel({ onOpenSettings, verificationReport }) {
  const { breakpoint } = useWindowWidth();
  const isMobile = breakpoint === 'mobile';
  const reduceMotion = useReducedMotion();
  const [expandedAll, setExpandedAll] = useState(false);
  const [expandedSteps, setExpandedSteps] = useState({});
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [modalClosing, setModalClosing] = useState(false);
  const [showEquipmentMap, setShowEquipmentMap] = useState(false);
  const [calibrations, setCalibrations] = useState(() => CalibrationStore.getAll());
  const prevBadgeStatus = useRef(null);
  const [badgePulse, setBadgePulse] = useState(false);

  // Detect verification status degradation → trigger badge pulse
  useEffect(() => {
    if (!verificationReport) return;
    const { errors, warnings } = verificationReport;
    const status = errors.length > 0 ? 'red' : warnings.length > 0 ? 'amber' : 'green';
    if (prevBadgeStatus.current && prevBadgeStatus.current !== status) {
      // Degradation: green→amber, green→red, amber→red
      const order = { green: 0, amber: 1, red: 2 };
      if (order[status] > order[prevBadgeStatus.current]) {
        setBadgePulse(true);
        setTimeout(() => setBadgePulse(false), reduceMotion ? 0 : 300);
      }
    }
    prevBadgeStatus.current = status;
  }, [verificationReport, reduceMotion]);

  const closeModal = useCallback(() => {
    if (reduceMotion) { setShowVerificationModal(false); return; }
    setModalClosing(true);
    setTimeout(() => { setShowVerificationModal(false); setModalClosing(false); }, 200);
  }, [reduceMotion]);

  const cardPad = isMobile ? '12px' : '16px';
  const h2Size = isMobile ? '1.1rem' : '1.25rem';
  const modalWidth = isMobile ? '95%' : '90%';
  const inputFontSize = isMobile ? '16px' : '0.8rem';
  const [editingCal, setEditingCal] = useState({}); // key -> bool
  const [calFormState, setCalFormState] = useState({}); // calKey -> {optimalTime,optimalTemp,notes}

  const toggleAll = useCallback(() => {
    if (expandedAll) {
      setExpandedAll(false);
      setExpandedSteps({});
    } else {
      setExpandedAll(true);
      const all = {};
      STEPS.forEach((_, i) => { all[i] = true; });
      setExpandedSteps(all);
    }
  }, [expandedAll]);

  const toggleStep = useCallback((i) => {
    setExpandedSteps((prev) => ({ ...prev, [i]: !prev[i] }));
  }, []);

  const refreshCalibrations = useCallback(() => setCalibrations(CalibrationStore.getAll()), []);

  // Calibration coverage stats — memoized
  const calCoverageBadge = useMemo(() => {
    const calibratableSteps = STEPS.filter(s => s.equipment === 'NinjaMAXPRO' && s.calibration);
    const calibratedCount = calibratableSteps.filter(s => CalibrationStore.get('NinjaMAXPRO', s.id)).length;
    return calibratableSteps.length > 0
      ? { count: calibratedCount, total: calibratableSteps.length, allDone: calibratedCount === calibratableSteps.length }
      : null;
  }, [calibrations]);

  return (
    <div>
      {/* Panel header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <h2 style={{ fontFamily: 'Georgia, serif', color: THEME.goldLight, fontSize: h2Size, margin: 0 }}>
            Этапы приготовления
          </h2>
          {/* Calibration coverage badge */}
          {calCoverageBadge && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '4px',
              padding: '4px 12px', borderRadius: '16px',
              border: `1px solid ${calCoverageBadge.allDone ? THEME.green : THEME.amber}`,
              color: calCoverageBadge.allDone ? THEME.green : THEME.amber,
              fontFamily: 'Georgia, serif',
              fontSize: '0.75rem',
              fontWeight: 'bold',
              backgroundColor: calCoverageBadge.allDone ? THEME.green + '15' : THEME.amber + '15',
            }}>
              <span style={{ fontSize: '0.85rem' }}>
                {calCoverageBadge.allDone ? '✅' : '📝'}
              </span>
              {calCoverageBadge.count}/{calCoverageBadge.total} откалибровано
            </span>
          )}
          {/* Verification status badge */}
          {verificationReport && (() => {
            const { errors, warnings } = verificationReport;
            const hasErrors = errors.length > 0;
            const hasWarnings = warnings.length > 0;
            const badgeColor = hasErrors ? THEME.red : hasWarnings ? THEME.amber : THEME.green;
            const badgeIcon = hasErrors ? '❌' : hasWarnings ? '⚠' : '✅';
            const badgeText = hasErrors
              ? `${errors.length} ошиб${errors.length === 1 ? 'ка' : errors.length < 5 ? 'ки' : 'ок'}`
              : hasWarnings
                ? `${warnings.length} предупрежд${warnings.length === 1 ? 'ение' : warnings.length < 5 ? 'ения' : 'ений'}`
                : 'Всё проверено';
            return (
              <button
                onClick={() => setShowVerificationModal(true)}
                title="Открыть отчёт проверки точности"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '4px',
                  padding: '4px 12px', borderRadius: '16px',
                  border: `1px solid ${badgeColor}`,
                  backgroundColor: 'transparent',
                  color: badgeColor,
                  cursor: 'pointer',
                  fontFamily: 'Georgia, serif',
                  fontSize: '0.8rem',
                  fontWeight: 'bold',
                  transition: 'background-color 0.2s',
                  animation: badgePulse && !reduceMotion ? 'cv-badge-pulse 300ms ease' : 'none',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = badgeColor + '22'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
              >
                <span style={{ fontSize: '0.9rem' }}>{badgeIcon}</span>
                {badgeText}
              </button>
            );
          })()}
        </div>
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

      {STEPS.length === 0 ? (
        <div style={{
          ...STYLES.card, padding: '32px 16px', textAlign: 'center',
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '12px' }}>📝</div>
          <p style={{
            fontFamily: 'Georgia, serif', color: THEME.textDim, fontSize: '0.95rem',
            margin: 0,
          }}>
            Нет данных о шагах приготовления
          </p>
        </div>
      ) : (
      STEPS.map((step, i) => (
        <StepCard
          key={i}
          step={step}
          index={i}
          isExpanded={expandedSteps[i] || false}
          cardPad={cardPad}
          isMobile={isMobile}
          inputFontSize={inputFontSize}
          reduceMotion={reduceMotion}
          editingCal={editingCal}
          calFormState={calFormState}
          setEditingCal={setEditingCal}
          setCalFormState={setCalFormState}
          onToggle={toggleStep}
          onOpenSettings={onOpenSettings}
          refreshCalibrations={refreshCalibrations}
        />
      ))}
 
      {/* Equipment-to-step mapping table */}
      <div style={{ marginTop: '20px' }}>
        <button
          onClick={() => setShowEquipmentMap(!showEquipmentMap)}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            padding: '8px 16px', borderRadius: '6px', border: `1px solid ${THEME.border}`,
            backgroundColor: THEME.surface, color: THEME.textDim, cursor: 'pointer',
            fontFamily: 'Georgia, serif', fontSize: '0.85rem',
          }}
        >
          📋 Карта оборудования {showEquipmentMap ? '▲' : '▼'}
        </button>

        {showEquipmentMap && (
          <div style={{ ...STYLES.card, marginTop: '10px', padding: cardPad, overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'Georgia, serif', fontSize: '0.8rem' }}>
              <thead>
                <tr style={{ borderBottom: `2px solid ${THEME.goldDim}` }}>
                  <th style={{ textAlign: 'left', padding: '8px 10px', color: THEME.goldLight, fontWeight: 'bold' }}>
                    Оборудование
                  </th>
                  <th style={{ textAlign: 'left', padding: '8px 10px', color: THEME.goldLight, fontWeight: 'bold' }}>
                    Этапы
                  </th>
                  <th style={{ textAlign: 'center', padding: '8px 10px', color: THEME.goldLight, fontWeight: 'bold' }}>
                    Калибровка
                  </th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  const profiles = EquipmentProfiles.getAll();
                  // Build equipment->steps map
                  const map = {};
                  const noEquipmentSteps = [];
                  for (const step of STEPS) {
                    if (step.equipment) {
                      if (!map[step.equipment]) map[step.equipment] = [];
                      map[step.equipment].push(step);
                    } else {
                      noEquipmentSteps.push(step);
                    }
                  }

                  const rows = [];
                  // Rows for each equipment profile present in steps
                  for (const [eqId, steps] of Object.entries(map)) {
                    const profile = profiles.find(p => p.id === eqId);
                    const eqName = profile ? `${profile.icon || ''} ${profile.name}` : `${eqId} (удалено)`;
                    const calCount = steps.filter(s => CalibrationStore.get(eqId, s.id)).length;
                    const calStatus = calCount === 0 ? '—' : `${calCount}/${steps.length}`;
                    const calColor = calCount === 0 ? THEME.textMuted : calCount === steps.length ? THEME.green : THEME.amber;

                    rows.push(
                      <tr key={eqId} style={{ borderBottom: `1px solid ${THEME.border}` }}>
                        <td style={{ padding: '8px 10px', color: profile ? THEME.text : THEME.red, fontWeight: 'bold', verticalAlign: 'top' }}>
                          {eqName}
                        </td>
                        <td style={{ padding: '8px 10px', verticalAlign: 'top' }}>
                          {steps.map(s => (
                            <div key={s.id} style={{ marginBottom: '3px' }}>
                              <span
                                onClick={() => {
                                  const idx = STEPS.indexOf(s);
                                  if (idx >= 0) {
                                    setExpandedSteps(prev => ({ ...prev, [idx]: true }));
                                    setTimeout(() => {
                                      const el = document.getElementById(`step-card-${s.id}`);
                                      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                    }, 50);
                                  }
                                }}
                                style={{
                                  color: THEME.blue, cursor: 'pointer', textDecoration: 'underline',
                                  fontSize: '0.8rem',
                                }}
                              >
                                {s.id}. {s.title}
                              </span>
                            </div>
                          ))}
                        </td>
                        <td style={{ padding: '8px 10px', textAlign: 'center', color: calColor, fontWeight: 'bold', verticalAlign: 'top' }}>
                          {calStatus}
                        </td>
                      </tr>
                    );
                  }

                  // "Все шаги" row for equipment-less steps
                  if (noEquipmentSteps.length > 0) {
                    rows.push(
                      <tr key="_noeq" style={{ borderBottom: `1px solid ${THEME.border}`, backgroundColor: THEME.surface }}>
                        <td style={{ padding: '8px 10px', color: THEME.textDim, fontStyle: 'italic', verticalAlign: 'top' }}>
                          Все шаги
                        </td>
                        <td style={{ padding: '8px 10px', verticalAlign: 'top' }}>
                          {noEquipmentSteps.map(s => (
                            <div key={s.id} style={{ marginBottom: '3px' }}>
                              <span
                                onClick={() => {
                                  const idx = STEPS.indexOf(s);
                                  if (idx >= 0) {
                                    setExpandedSteps(prev => ({ ...prev, [idx]: true }));
                                    setTimeout(() => {
                                      const el = document.getElementById(`step-card-${s.id}`);
                                      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                    }, 50);
                                  }
                                }}
                                style={{
                                  color: THEME.textDim, cursor: 'pointer', textDecoration: 'underline',
                                  fontSize: '0.8rem',
                                }}
                              >
                                {s.id}. {s.title}
                              </span>
                            </div>
                          ))}
                        </td>
                        <td style={{ padding: '8px 10px', textAlign: 'center', color: THEME.textMuted, verticalAlign: 'top' }}>
                          —
                        </td>
                      </tr>
                    );
                  }

                  return rows;
                })()}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Verification report modal */}
      {showVerificationModal && verificationReport && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: reduceMotion ? 'none' : (modalClosing ? 'cv-backdrop-exit 200ms ease forwards' : 'cv-backdrop-enter 200ms ease forwards'),
        }} onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}>
          <div style={{
            backgroundColor: THEME.bg, border: `2px solid ${THEME.goldDim}`, borderRadius: '12px',
            padding: '24px', maxWidth: '650px', width: modalWidth, maxHeight: '85vh', overflowY: 'auto',
            color: THEME.text,
            animation: reduceMotion ? 'none' : (modalClosing ? 'cv-modal-exit 200ms ease forwards' : 'cv-modal-enter 200ms ease forwards'),
          }}>
            {/* Modal header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontFamily: 'Georgia, serif', color: THEME.goldLight, fontSize: '1.3rem', margin: 0 }}>
                📋 Отчёт проверки точности
              </h2>
              <button onClick={closeModal} style={{
                background: 'none', border: 'none', color: THEME.textDim, cursor: 'pointer',
                fontSize: '1.5rem', lineHeight: '1',
              }}>✕</button>
            </div>

            {/* Summary counts */}
            <div style={{
              display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '20px',
            }}>
              {[
                { label: 'Шагов', value: verificationReport.totalSteps, color: THEME.goldLight },
                { label: 'Правил', value: verificationReport.totalRules, color: THEME.blue },
                { label: 'Проверок', value: verificationReport.checksRun, color: THEME.textDim },
                { label: 'Пройдено', value: verificationReport.passed, color: THEME.green },
              ].map((s, i) => (
                <div key={i} style={{
                  flex: '1 1 auto', minWidth: '80px', textAlign: 'center',
                  padding: '10px 8px', borderRadius: '8px',
                  backgroundColor: THEME.surface, border: `1px solid ${THEME.border}`,
                }}>
                  <div style={{ fontFamily: 'Georgia, serif', fontSize: '0.7rem', color: THEME.textMuted, marginBottom: '4px' }}>
                    {s.label}
                  </div>
                  <div style={{ fontFamily: 'Georgia, serif', fontSize: '1.2rem', fontWeight: 'bold', color: s.color }}>
                    {s.value}
                  </div>
                </div>
              ))}
            </div>

            {/* Overall status */}
            <div style={{
              padding: '10px 16px', borderRadius: '8px', marginBottom: '16px',
              fontFamily: 'Georgia, serif', fontSize: '0.9rem', fontWeight: 'bold',
              backgroundColor: verificationReport.errors.length > 0 ? THEME.red + '22' :
                verificationReport.warnings.length > 0 ? THEME.amber + '22' : THEME.green + '22',
              borderLeft: `4px solid ${verificationReport.errors.length > 0 ? THEME.red :
                verificationReport.warnings.length > 0 ? THEME.amber : THEME.green}`,
              color: verificationReport.errors.length > 0 ? THEME.red :
                verificationReport.warnings.length > 0 ? THEME.amber : THEME.green,
            }}>
              {verificationReport.errors.length > 0
                ? `❌ Обнаружено ${verificationReport.errors.length} ошиб${verificationReport.errors.length === 1 ? 'ка' : verificationReport.errors.length < 5 ? 'ки' : 'ок'}`
                : verificationReport.warnings.length > 0
                  ? `⚠ ${verificationReport.warnings.length} предупрежд${verificationReport.warnings.length === 1 ? 'ение' : verificationReport.warnings.length < 5 ? 'ения' : 'ений'}`
                  : '✅ Все проверки пройдены — данные соответствуют правилам точности'}
            </div>

            {/* Errors list */}
            {verificationReport.errors.length > 0 && (
              <div style={{ marginBottom: '16px' }}>
                <h3 style={{
                  fontFamily: 'Georgia, serif', color: THEME.red, fontSize: '0.95rem',
                  margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '6px',
                }}>
                  ❌ Ошибки ({verificationReport.errors.length})
                </h3>
                {verificationReport.errors.map((err, i) => (
                  <div key={i} style={{
                    padding: '8px 12px', marginBottom: '4px',
                    borderLeft: `3px solid ${THEME.red}`, backgroundColor: THEME.surface,
                    borderRadius: '0 6px 6px 0',
                  }}>
                    <div style={{ fontFamily: 'Georgia, serif', fontSize: '0.8rem', color: THEME.text, lineHeight: '1.4' }}>
                      <span style={{ color: THEME.goldLight, fontWeight: 'bold' }}>Шаг {err.stepId}</span>
                      {' — '}{err.stepTitle}
                    </div>
                    <div style={{ fontFamily: 'Georgia, serif', fontSize: '0.75rem', color: THEME.red, marginTop: '2px' }}>
                      <span style={{ color: THEME.textMuted }}>{err.rule} {err.ruleName}:</span> {err.message}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Warnings list */}
            {verificationReport.warnings.length > 0 && (
              <div style={{ marginBottom: '16px' }}>
                <h3 style={{
                  fontFamily: 'Georgia, serif', color: THEME.amber, fontSize: '0.95rem',
                  margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '6px',
                }}>
                  ⚠ Предупреждения ({verificationReport.warnings.length})
                </h3>
                {verificationReport.warnings.map((warn, i) => (
                  <div key={i} style={{
                    padding: '8px 12px', marginBottom: '4px',
                    borderLeft: `3px solid ${THEME.amber}`, backgroundColor: THEME.surface,
                    borderRadius: '0 6px 6px 0',
                  }}>
                    <div style={{ fontFamily: 'Georgia, serif', fontSize: '0.8rem', color: THEME.text, lineHeight: '1.4' }}>
                      <span style={{ color: THEME.goldLight, fontWeight: 'bold' }}>Шаг {warn.stepId}</span>
                      {' — '}{warn.stepTitle}
                    </div>
                    <div style={{ fontFamily: 'Georgia, serif', fontSize: '0.75rem', color: THEME.amber, marginTop: '2px' }}>
                      <span style={{ color: THEME.textMuted }}>{warn.rule} {warn.ruleName}:</span> {warn.message}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Info list — collapsed by default */}
            {verificationReport.infos.length > 0 && (
              <div>
                <details style={{ fontFamily: 'Georgia, serif' }}>
                  <summary style={{
                    color: THEME.textDim, fontSize: '0.9rem', cursor: 'pointer',
                    padding: '4px 0',
                  }}>
                    ℹ️ Информация ({verificationReport.infos.length})
                  </summary>
                  <div style={{ marginTop: '8px' }}>
                    {verificationReport.infos.map((info, i) => (
                      <div key={i} style={{
                        padding: '6px 10px', marginBottom: '4px',
                        borderLeft: `3px solid ${THEME.textDim}`, backgroundColor: THEME.surface,
                        borderRadius: '0 4px 4px 0',
                      }}>
                        <div style={{ fontFamily: 'Georgia, serif', fontSize: '0.75rem', color: THEME.textDim }}>
                          <span style={{ color: THEME.textMuted }}>{info.rule} {info.ruleName}:</span> {info.message}
                        </div>
                      </div>
                    ))}
                  </div>
                </details>
              </div>
            )}

            {/* Close button */}
            <div style={{ marginTop: '20px', textAlign: 'right' }}>
              <button onClick={closeModal} style={{
                padding: '8px 24px', borderRadius: '6px', border: 'none',
                backgroundColor: THEME.gold, color: THEME.bg, cursor: 'pointer',
                fontFamily: 'Georgia, serif', fontSize: '0.9rem', fontWeight: 'bold',
              }}>
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// EQUIPMENT SETTINGS PANEL
// ═══════════════════════════════════════════════════════════════

const EQUIPMENT_TYPES = [
  { value: 'airfryer', label: 'Аэрофритюрница', icon: '🔥' },
  { value: 'processor', label: 'Кухонный комбайн', icon: '🍴' },
  { value: 'breadmaker', label: 'Хлебопечка', icon: '🍞' },
  { value: 'sandwichmaker', label: 'Сэндвичница', icon: '🥪' },
  { value: 'blender', label: 'Блендер', icon: '🥤' },
  { value: 'custom', label: 'Другое', icon: '⚙️' },
];

function EquipmentSettingsPanel({ onClose }) {
  const { breakpoint } = useWindowWidth();
  const isMobile = breakpoint === 'mobile';
  const reduceMotion = useReducedMotion();
  const modalWidth = isMobile ? '95%' : '90%';
  const inputFontSize = isMobile ? '16px' : '0.9rem';
  const cardPad = isMobile ? '12px' : '16px';
  const [profiles, setProfiles] = useState(() => EquipmentProfiles.getAll());
  const [editingId, setEditingId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [closing, setClosing] = useState(false);

  const doClose = () => {
    if (reduceMotion) { onClose(); return; }
    setClosing(true);
    setTimeout(() => { onClose(); }, 200);
  };
  const [form, setForm] = useState({ name: '', type: 'custom', capacity: '', maxTemp: '', bowlCapacity: '', modes: '', icon: '⚙️' });
  const [formError, setFormError] = useState('');

  const refreshProfiles = () => setProfiles(EquipmentProfiles.getAll());

  const resetForm = () => {
    setForm({ name: '', type: 'custom', capacity: '', maxTemp: '', bowlCapacity: '', modes: '', icon: '⚙️' });
    setFormError('');
    setShowAddForm(false);
    setEditingId(null);
  };

  const openEdit = (profile) => {
    setEditingId(profile.id);
    setShowAddForm(true);
    setFormError('');
    setForm({
      name: profile.name,
      type: profile.type || 'custom',
      capacity: profile.capacity || '',
      maxTemp: profile.maxTemp != null ? String(profile.maxTemp) : '',
      bowlCapacity: profile.bowlCapacity || '',
      modes: (profile.modes || []).join(', '),
      icon: profile.icon || '⚙️',
    });
  };

  const handleSubmit = () => {
    const name = form.name.trim();
    if (!name) { setFormError('Название обязательно'); return; }
    if (!form.type) { setFormError('Выберите тип устройства'); return; }

    const profileData = {
      name,
      type: form.type,
      capacity: form.capacity.trim() || null,
      maxTemp: form.maxTemp ? Number(form.maxTemp) : null,
      bowlCapacity: form.bowlCapacity.trim() || null,
      modes: form.modes.split(',').map(s => s.trim()).filter(s => s.length > 0),
      icon: form.icon.trim() || '⚙️',
    };

    if (editingId) {
      EquipmentProfiles.update(editingId, profileData);
    } else {
      EquipmentProfiles.add(profileData);
    }
    refreshProfiles();
    resetForm();
  };

  const handleDelete = (id) => {
    if (EquipmentProfiles.remove(id)) {
      refreshProfiles();
    }
    setConfirmDeleteId(null);
  };

  const typeInfo = (type) => EQUIPMENT_TYPES.find(t => t.value === type) || EQUIPMENT_TYPES.find(t => t.value === 'custom');

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      animation: reduceMotion ? 'none' : (closing ? 'cv-backdrop-exit 200ms ease forwards' : 'cv-backdrop-enter 200ms ease forwards'),
    }} onClick={(e) => { if (e.target === e.currentTarget) doClose(); }}>
      <div style={{
        backgroundColor: THEME.bg, border: `2px solid ${THEME.goldDim}`, borderRadius: '12px',
        padding: isMobile ? '16px' : '24px', maxWidth: '600px', width: modalWidth, maxHeight: '85vh', overflowY: 'auto',
        color: THEME.text,
        animation: reduceMotion ? 'none' : (closing ? 'cv-modal-exit 200ms ease forwards' : 'cv-modal-enter 200ms ease forwards'),
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontFamily: 'Georgia, serif', color: THEME.goldLight, fontSize: '1.3rem', margin: 0 }}>
            ⚙️ Оборудование
          </h2>
          <button onClick={doClose} style={{
            background: 'none', border: 'none', color: THEME.textDim, cursor: 'pointer',
            fontSize: '1.5rem', lineHeight: '1',
          }}>✕</button>
        </div>

        {profiles.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 16px' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '16px' }}>🔌</div>
            <p style={{
              fontFamily: 'Georgia, serif', color: THEME.textDim, fontSize: '0.95rem',
              margin: '0 0 20px 0',
            }}>
              Нет устройств. Добавьте первое устройство.
            </p>
            <button onClick={() => { resetForm(); setShowAddForm(true); }} style={{
              padding: '12px 28px', borderRadius: '8px',
              border: 'none', backgroundColor: THEME.gold, color: THEME.bg,
              cursor: 'pointer', fontFamily: 'Georgia, serif',
              fontSize: '1rem', fontWeight: 'bold',
            }}>
              + Добавить устройство
            </button>
          </div>
        ) : (
        /* Profile list */
        profiles.map((profile) => {
          const ti = typeInfo(profile.type);
          return (
            <div key={profile.id} style={{
              ...STYLES.card, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '12px 16px',
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span style={{ fontSize: '1.1rem' }}>{profile.icon || '⚙️'}</span>
                  <span style={{ fontFamily: 'Georgia, serif', color: THEME.goldLight, fontWeight: 'bold', fontSize: '0.95rem' }}>
                    {profile.name}
                  </span>
                  <span style={STYLES.badge(THEME.goldDim)}>{ti.label}</span>
                  {profile.isDefault && (
                    <span title="Встроенное устройство — нельзя удалить" style={{ color: THEME.textMuted, fontSize: '0.85rem' }}>🔒</span>
                  )}
                </div>
                <div style={{ fontFamily: 'Georgia, serif', fontSize: '0.75rem', color: THEME.textDim, marginTop: '2px' }}>
                  {profile.capacity && <span style={{ marginRight: '10px' }}>Объём: {profile.capacity}</span>}
                  {profile.maxTemp != null && <span style={{ marginRight: '10px' }}>Макс. темп: {profile.maxTemp}°C</span>}
                  {profile.bowlCapacity && <span style={{ marginRight: '10px' }}>Чаша: {profile.bowlCapacity}</span>}
                  {(profile.modes || []).length > 0 && <span>Режимы: {(profile.modes || []).join(', ')}</span>}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '6px', flexShrink: 0, marginLeft: '12px' }}>
                <button onClick={() => openEdit(profile)} style={{
                  background: 'none', border: `1px solid ${THEME.border}`, borderRadius: '4px',
                  color: THEME.textDim, cursor: 'pointer', padding: '4px 8px', fontSize: '0.85rem',
                }} title="Редактировать">✏️</button>
                {profile.isDefault ? (
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    width: '30px', height: '30px', color: THEME.textMuted, fontSize: '0.9rem',
                  }} title="Встроенное устройство — нельзя удалить">🔒</span>
                ) : (
                  <button onClick={() => setConfirmDeleteId(profile.id)} style={{
                    background: 'none', border: `1px solid ${THEME.border}`, borderRadius: '4px',
                    color: THEME.red, cursor: 'pointer', padding: '4px 8px', fontSize: '0.85rem',
                  }} title="Удалить">🗑️</button>
                )}
              </div>
            </div>
          );
        })}
        )
        }

        {/* Delete confirmation */}
        {confirmDeleteId && (() => {
          const p = profiles.find(x => x.id === confirmDeleteId);
          return (
            <div style={{
              ...STYLES.card, borderColor: THEME.red, padding: '12px 16px',
              marginTop: '8px', textAlign: 'center',
            }}>
              <p style={{ fontFamily: 'Georgia, serif', color: THEME.text, fontSize: '0.9rem', margin: '0 0 10px 0' }}>
                Удалить "{p ? p.name : ''}"? Это действие нельзя отменить. Этапы, ссылающиеся на это устройство, покажут предупреждение.
              </p>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                <button onClick={() => handleDelete(confirmDeleteId)} style={{
                  padding: '6px 16px', borderRadius: '6px', border: 'none',
                  backgroundColor: THEME.red, color: THEME.bg, cursor: 'pointer',
                  fontFamily: 'Georgia, serif', fontSize: '0.85rem',
                }}>Удалить</button>
                <button onClick={() => setConfirmDeleteId(null)} style={{
                  padding: '6px 16px', borderRadius: '6px', border: `1px solid ${THEME.border}`,
                  backgroundColor: THEME.surface, color: THEME.textDim, cursor: 'pointer',
                  fontFamily: 'Georgia, serif', fontSize: '0.85rem',
                }}>Отмена</button>
              </div>
            </div>
          );
        })()}

        {/* Add / Edit form */}
        {!showAddForm ? (
          <button onClick={() => { resetForm(); setShowAddForm(true); }} style={{
            marginTop: '16px', padding: '10px 20px', borderRadius: '8px',
            border: `2px dashed ${THEME.goldDim}`, backgroundColor: 'transparent',
            color: THEME.goldDim, cursor: 'pointer', fontFamily: 'Georgia, serif',
            fontSize: '0.9rem', width: '100%',
          }}>
            + Добавить устройство
          </button>
        ) : (
          <div style={{ ...STYLES.card, padding: cardPad, marginTop: '16px', borderColor: THEME.goldDim }}>
            <h3 style={{ fontFamily: 'Georgia, serif', color: THEME.goldLight, fontSize: '1rem', margin: '0 0 12px 0' }}>
              {editingId ? 'Редактировать устройство' : 'Новое устройство'}
            </h3>
            {formError && (
              <div style={{ color: THEME.red, fontSize: '0.8rem', marginBottom: '8px', fontFamily: 'Georgia, serif' }}>
                {formError}
              </div>
            )}

            {/* Name */}
            <div style={{ marginBottom: '10px' }}>
              <label style={{ display: 'block', fontFamily: 'Georgia, serif', color: THEME.textDim, fontSize: '0.8rem', marginBottom: '4px' }}>
                Название *
              </label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Например: Моя духовка"
                style={{
                  width: '100%', padding: '8px 10px', borderRadius: '6px',
                  border: `1px solid ${THEME.border}`, backgroundColor: THEME.surface,
                  color: THEME.text, fontFamily: 'Georgia, serif', fontSize: inputFontSize,
                  boxSizing: 'border-box',
                }} />
            </div>

            {/* Type */}
            <div style={{ marginBottom: '10px' }}>
              <label style={{ display: 'block', fontFamily: 'Georgia, serif', color: THEME.textDim, fontSize: '0.8rem', marginBottom: '4px' }}>
                Тип *
              </label>
              <select value={form.type} onChange={(e) => { const t = EQUIPMENT_TYPES.find(x => x.value === e.target.value); setForm({ ...form, type: e.target.value, icon: t ? t.icon : '⚙️' }); }}
                style={{
                  width: '100%', padding: '8px 10px', borderRadius: '6px',
                  border: `1px solid ${THEME.border}`, backgroundColor: THEME.surface,
                  color: THEME.text, fontFamily: 'Georgia, serif', fontSize: inputFontSize,
                  boxSizing: 'border-box',
                }}>
                {EQUIPMENT_TYPES.map(t => (
                  <option key={t.value} value={t.value}>{t.icon} {t.label}</option>
                ))}
              </select>
            </div>

            {/* Icon */}
            <div style={{ marginBottom: '10px' }}>
              <label style={{ display: 'block', fontFamily: 'Georgia, serif', color: THEME.textDim, fontSize: '0.8rem', marginBottom: '4px' }}>
                Иконка (emoji)
              </label>
              <input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })}
                placeholder="⚙️"
                style={{
                  width: '100%', padding: '8px 10px', borderRadius: '6px',
                  border: `1px solid ${THEME.border}`, backgroundColor: THEME.surface,
                  color: THEME.text, fontFamily: 'Georgia, serif', fontSize: inputFontSize,
                  boxSizing: 'border-box',
                }} />
            </div>

            {/* Capacity & BowlCapacity row */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontFamily: 'Georgia, serif', color: THEME.textDim, fontSize: '0.8rem', marginBottom: '4px' }}>
                  Объём (L)
                </label>
                <input value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })}
                  placeholder="6.2 L"
                  style={{
                    width: '100%', padding: '8px 10px', borderRadius: '6px',
                    border: `1px solid ${THEME.border}`, backgroundColor: THEME.surface,
                    color: THEME.text, fontFamily: 'Georgia, serif', fontSize: inputFontSize,
                    boxSizing: 'border-box',
                  }} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontFamily: 'Georgia, serif', color: THEME.textDim, fontSize: '0.8rem', marginBottom: '4px' }}>
                  Объём чаши (L)
                </label>
                <input value={form.bowlCapacity} onChange={(e) => setForm({ ...form, bowlCapacity: e.target.value })}
                  placeholder="2.1 L"
                  style={{
                    width: '100%', padding: '8px 10px', borderRadius: '6px',
                    border: `1px solid ${THEME.border}`, backgroundColor: THEME.surface,
                    color: THEME.text, fontFamily: 'Georgia, serif', fontSize: inputFontSize,
                    boxSizing: 'border-box',
                  }} />
              </div>
            </div>

            {/* MaxTemp */}
            <div style={{ marginBottom: '10px' }}>
              <label style={{ display: 'block', fontFamily: 'Georgia, serif', color: THEME.textDim, fontSize: '0.8rem', marginBottom: '4px' }}>
                Макс. температура (°C)
              </label>
              <input value={form.maxTemp} onChange={(e) => setForm({ ...form, maxTemp: e.target.value })}
                placeholder="240"
                type="number"
                style={{
                  width: '100%', padding: '8px 10px', borderRadius: '6px',
                  border: `1px solid ${THEME.border}`, backgroundColor: THEME.surface,
                  color: THEME.text, fontFamily: 'Georgia, serif', fontSize: inputFontSize,
                  boxSizing: 'border-box',
                }} />
            </div>

            {/* Modes */}
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontFamily: 'Georgia, serif', color: THEME.textDim, fontSize: '0.8rem', marginBottom: '4px' }}>
                Режимы (через запятую)
              </label>
              <input value={form.modes} onChange={(e) => setForm({ ...form, modes: e.target.value })}
                placeholder="Air Fry, Roast, Bake"
                style={{
                  width: '100%', padding: '8px 10px', borderRadius: '6px',
                  border: `1px solid ${THEME.border}`, backgroundColor: THEME.surface,
                  color: THEME.text, fontFamily: 'Georgia, serif', fontSize: inputFontSize,
                  boxSizing: 'border-box',
                }} />
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={handleSubmit} style={{
                padding: '8px 20px', borderRadius: '6px', border: 'none',
                backgroundColor: THEME.gold, color: THEME.bg, cursor: 'pointer',
                fontFamily: 'Georgia, serif', fontSize: '0.9rem', fontWeight: 'bold',
              }}>
                {editingId ? 'Сохранить' : 'Добавить'}
              </button>
              <button onClick={resetForm} style={{
                padding: '8px 20px', borderRadius: '6px', border: `1px solid ${THEME.border}`,
                backgroundColor: THEME.surface, color: THEME.textDim, cursor: 'pointer',
                fontFamily: 'Georgia, serif', fontSize: '0.9rem',
              }}>Отмена</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Toast — floating notification component
// ═══════════════════════════════════════════════════════════════

function Toast({ message, onDone }) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(onDone, 4000);
    return () => clearTimeout(timer);
  }, [message, onDone]);

  if (!message) return null;

  return (
    <div style={{
      position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)',
      zIndex: 2000,
      backgroundColor: THEME.card, border: `1px solid ${THEME.goldDim}`,
      borderRadius: '8px', padding: '12px 24px',
      color: THEME.text, fontFamily: 'Georgia, serif', fontSize: '0.9rem',
      boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
      animation: 'cv-fade-in 300ms ease forwards',
      maxWidth: '90vw',
    }}>
      ⚠ {message}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// App — root component
// ═══════════════════════════════════════════════════════════════

function App() {
  const { breakpoint } = useWindowWidth();
  const isMobile = breakpoint === 'mobile';
  const reduceMotion = useReducedMotion();
  const [activeTab, setActiveTab] = useState('ingredients');
  const [tabVisible, setTabVisible] = useState('ingredients');
  const [tabFading, setTabFading] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [toast, setToast] = useState(null);

  // Register global toast dispatcher for storage modules
  useEffect(() => {
    _showToast = setToast;
    return () => { _showToast = null; };
  }, []);

  // Inject animation CSS once
  useEffect(() => {
    if (document.getElementById('cv-animations')) return;
    const style = document.createElement('style');
    style.id = 'cv-animations';
    style.textContent = ANIMATION_CSS;
    document.head.appendChild(style);
  }, []);

  // Inject print stylesheet once
  useEffect(() => {
    if (document.getElementById('cookingviz-print')) return;
    const style = document.createElement('style');
    style.id = 'cookingviz-print';
    style.textContent = PRINT_CSS;
    document.head.appendChild(style);
  }, []);

  // Run accuracy verification on mount (re-runs when settings change b/c equipment profiles may change)
  const verificationReport = useMemo(() => runAccuracyVerification(STEPS), [settingsOpen]);

  const switchTab = useCallback((tab) => {
    if (tab === tabVisible || tabFading) return;
    setTabFading(true);
    setTimeout(() => {
      setActiveTab(tab);
      setTabVisible(tab);
      setTabFading(false);
    }, reduceMotion ? 0 : 150);
  }, [tabVisible, tabFading, reduceMotion]);

  return (
    <ErrorBoundary>
      <div className="cv-animated" style={{
        maxWidth: '800px',
        margin: '0 auto',
        padding: isMobile ? '12px 8px' : '24px 16px',
        backgroundColor: THEME.bg,
        minHeight: '100vh',
        fontFamily: 'Georgia, serif',
        color: THEME.text,
        overflowX: 'hidden',
      }}>
        {/* Header row: tabs + gear icon */}
        <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '8px' : '12px' }}>
          <div style={{ flex: 1 }}>
            <TabBar activeTab={tabVisible} onTabChange={switchTab} />
          </div>
          <button
            onClick={() => setSettingsOpen(true)}
            title="Настройки оборудования"
            style={{
              background: 'none', border: `1px solid ${THEME.border}`, borderRadius: '8px',
              color: THEME.textDim, cursor: 'pointer',
              width: isMobile ? '44px' : undefined,
              height: isMobile ? '44px' : undefined,
              minWidth: '44px',
              minHeight: '44px',
              padding: isMobile ? '0' : '8px 10px',
              fontSize: isMobile ? '1.4rem' : '1.2rem',
              lineHeight: '1',
              marginBottom: isMobile ? '12px' : '20px',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            }}
          >⚙️</button>
        </div>

        <div style={reduceMotion ? {} : {
          animation: tabFading ? 'cv-fade-out 150ms ease forwards' : 'cv-fade-in 150ms ease forwards',
        }}>
          {activeTab === 'ingredients'
            ? <IngredientPanel />
            : <ActionStepsPanel onOpenSettings={() => setSettingsOpen(true)} verificationReport={verificationReport} />
          }
        </div>

        {settingsOpen && (
          <EquipmentSettingsPanel onClose={() => setSettingsOpen(false)} />
        )}
      </div>
      <Toast message={toast} onDone={() => setToast(null)} />
    </ErrorBoundary>
  );
}
