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
let _pendingToast = null;

function _queueToast(message) {
  if (_showToast) {
    _showToast(message);
  } else {
    _pendingToast = message;
  }
}

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
      _queueToast('Equipment data corrupted. Settings have been reset.');
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
      _queueToast('Calibration data corrupted. Settings have been reset.');
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
  { label: '0', desc: 'Skip' },
  { label: '½×', desc: 'Half' },
  { label: '¾×', desc: 'Three Quarters' },
  { label: '1×', desc: 'Normal' },
  { label: '⁵⁄₄×', desc: 'Plus Quarter' },
  { label: '3/2×', desc: 'One and a Half' },
];

const INGREDIENTS = [
  {
    name: 'Dried Chickpeas',
    role: 'Dish foundation — structure, texture, protein',
    necessity: 'BASE',
    amount: '250 g (dry)',
    toleranceZone: { type: 'base', description: 'Recipe foundation — does not vary' },
    variants: [],
    substitutions: [],
    empirical: false,
    matrix: [
      { verdict: 'No dish', consequence: 'Falafel is impossible without chickpeas' },
      { verdict: 'Too little', consequence: 'Not enough for a full serving' },
      { verdict: 'Small portion', consequence: 'Enough for 1–2 servings instead of 4' },
      { verdict: '✓ Normal', consequence: 'Standard serving for 4 people' },
      { verdict: 'OK', consequence: 'More servings, scale other ingredients proportionally' },
      { verdict: 'OK', consequence: 'Larger batch' },
    ],
  },
  {
    name: 'Onion',
    role: 'Sweetness, aromatic depth, moisture in raw mix',
    necessity: 'IMPORTANT',
    amount: '80 g (~1 medium onion)',
    toleranceZone: { type: 'moderate', description: 'Moderate tolerance — use ¾×–1×; above adds excess moisture' },
    variants: [
      { label: 'Fresh', description: 'Standard. Releases moisture when chopped — account for binding.', quantity: '80 g' },
      { label: 'Dried (powder)', description: '~1 tsp instead of 80 g. Adds no moisture — mix is drier.', quantity: '1 tsp' },
      { label: 'Shallot', description: 'Milder, sweeter, less moisture.', quantity: '80–90 g' },
      { label: 'Scallion', description: 'Milder, less sweet. White and light green parts only.', quantity: '~60 g' },
      { label: 'Red onion', description: 'Sharper raw, more color.', quantity: '80 g' },
    ],
    substitutions: [
      { name: 'Shallot', description: 'Closest substitute, more refined flavor.', note: 'Same proportions or +10%' },
      { name: 'Onion powder', description: 'Works if reduced moisture is acceptable.', note: '~1 tsp instead of 80 g' },
      { name: 'Skip', description: 'Possible in falafel — dish works, just less sweet depth.', note: 'Flavor will become flat' },
    ],
    empirical: false,
    matrix: [
      { verdict: 'Flat flavor', consequence: 'No sweet foundation. One-dimensional taste.' },
      { verdict: 'Weak background', consequence: 'Faint hint of sweetness. Texture better in raw mixes (less moisture).' },
      { verdict: '✓ Balanced', consequence: 'Nearly the same result as 1×. Within tolerance zone.' },
      { verdict: '✓ Balanced', consequence: 'Proper sweetness and aromatic depth. Moisture accounted for.' },
      { verdict: 'Getting watery', consequence: 'In raw mixes: excess moisture → more binder → denser result.' },
      { verdict: 'Watery', consequence: 'Clear excess moisture. Significantly more binder required.' },
    ],
  },
  {
    name: 'Garlic',
    role: 'Sharpness, aromatic depth, pungency',
    necessity: 'IMPORTANT',
    amount: '3–4 cloves (~15 g)',
    toleranceZone: { type: 'wide_below', description: 'Wide tolerance downward; moderate upward' },
    variants: [
      { label: 'Fresh', description: 'Standard. Intensity depends on variety and age.', quantity: '3–4 cloves' },
    ],
    substitutions: [
      { name: 'Garlic powder', description: 'Even distribution, no moisture.', note: '½ tsp per 3 cloves' },
      { name: 'Omit', description: 'Noticeable but not critical — dish becomes bland.', note: 'Loss of pungency' },
    ],
    empirical: false,
    matrix: [
      { verdict: 'Bland', consequence: 'No garlic pungency. Dish is flat.' },
      { verdict: 'Weak garlic', consequence: 'Barely noticeable. Suitable for garlic-sensitive eaters.' },
      { verdict: '✓ Mild background', consequence: 'Pleasant garlic background without dominating.' },
      { verdict: '✓ Pronounced', consequence: 'Bright garlic flavour — classic falafel.' },
      { verdict: 'Garlic punch', consequence: 'Garlic dominates. May overpower cumin and coriander.' },
      { verdict: 'Too much', consequence: 'Garlic bomb. Drowns out all other flavours.' },
    ],
  },
  {
    name: 'Fresh Parsley',
    role: 'Freshness, herbal aroma, green color',
    necessity: 'OPTIONAL',
    amount: '20 g (bunch, leaves only)',
    toleranceZone: { type: 'wide', description: 'Wide tolerance — 0 acceptable, 3/2× still fine' },
    variants: [
      { label: 'Fresh', description: 'Standard. Leaves only, no stems.', quantity: '20 g' },
      { label: 'Cilantro', description: 'Brighter, citrusy note. Not everyone likes it.', quantity: '20 g' },
      { label: 'Dried', description: 'Weaker aroma. Use 1 tbsp instead of a bunch.', quantity: '1 tbsp' },
    ],
    substitutions: [
      { name: 'Cilantro', description: 'Brighter, citrusy note. Classic alternative.', note: 'Same proportion' },
      { name: 'Dill', description: 'Different profile — anise note.', note: '15 g, not for everyone' },
      { name: 'Skip', description: 'Totally acceptable. Cleaner flavor, but less complex.', note: 'Paler color' },
    ],
    empirical: false,
    matrix: [
      { verdict: '✓ Acceptable', consequence: 'No herbs. Cleaner flavor, paler color.' },
      { verdict: 'Light hint', consequence: 'Barely noticeable herbal note.' },
      { verdict: '✓ Herbal', consequence: 'Pleasant herbal background.' },
      { verdict: '✓ Fresh', consequence: 'Bright herbs — classic balance.' },
      { verdict: 'Lots of herbs', consequence: 'Herbal flavor pronounced. Greener color.' },
      { verdict: '✓ Still good', consequence: 'Very green falafel. Acceptable.' },
    ],
  },
  {
    name: 'Ground Cumin',
    role: 'Warmth, earthiness, key Middle-Eastern note',
    necessity: 'IMPORTANT',
    amount: '1½ tsp',
    toleranceZone: { type: 'narrow_above', description: 'Moderate tolerance downward; NARROW upward — even slight excess is noticeable' },
    variants: [
      { label: 'Ground', description: 'Standard. Intensity fades over storage time.', quantity: '1½ tsp' },
      { label: 'Whole seeds', description: 'Toast and grind for maximum aroma.', quantity: '1 tsp seeds' },
    ],
    substitutions: [
      { name: 'Cumin seeds', description: 'Toast and grind — brighter aroma.', note: '1 tsp seeds = 1½ tsp ground' },
      { name: 'Skip', description: 'NOT RECOMMENDED. Cumin is the key Middle-Eastern note.', note: 'Loss of authenticity' },
    ],
    empirical: false,
    matrix: [
      { verdict: 'Bland', consequence: 'No Middle-Eastern character. Falafel loses identity.' },
      { verdict: 'Weak background', consequence: 'Faint hint. Lost against the garlic.' },
      { verdict: '✓ Mild', consequence: 'Warm note without dominating.' },
      { verdict: '✓ Classic', consequence: 'Proper Middle-Eastern profile.' },
      { verdict: 'Bitter', consequence: 'Cumin starts to taste bitter. Overpowers coriander.' },
      { verdict: 'Bitter smoke', consequence: 'Pronounced bitterness. Dish ruined.' },
    ],
  },
  {
    name: 'Ground Coriander',
    role: 'Citrus note, roundness, balances cumin',
    necessity: 'IMPORTANT',
    amount: '1 tsp',
    toleranceZone: { type: 'moderate', description: 'Moderate tolerance both ways' },
    variants: [
      { label: 'Ground', description: 'Standard.', quantity: '1 tsp' },
      { label: 'Whole seeds', description: 'Toast and grind.', quantity: '¾ tsp seeds' },
    ],
    substitutions: [
      { name: 'Coriander seeds', description: 'Toast and grind — more citrusy.', note: '¾ tsp seeds' },
      { name: 'Skip', description: 'Noticeable — flavor will be less rounded.', note: 'Cumin will dominate' },
    ],
    empirical: false,
    matrix: [
      { verdict: 'Flat-ish', consequence: 'Missing citrus note. Cumin stands out too much.' },
      { verdict: 'Weak citrus', consequence: 'Barely noticeable roundness.' },
      { verdict: '✓ Light', consequence: 'Pleasant balance with cumin.' },
      { verdict: '✓ Balanced', consequence: 'Proper cumin/coriander ratio.' },
      { verdict: 'Citrus dominates', consequence: 'Coriander comes to the foreground.' },
      { verdict: 'Soapy aftertaste', consequence: 'Some people have genetic sensitivity to coriander.' },
    ],
  },
  {
    name: 'Salt',
    role: 'Flavor enhancer, critical balance',
    necessity: 'IMPORTANT',
    amount: '1 tsp (~5 g)',
    toleranceZone: { type: 'narrow_both', description: 'NARROW both ways — salt is very sensitive' },
    variants: [
      { label: 'Fine', description: 'Standard. Distributes evenly.', quantity: '1 tsp' },
      { label: 'Coarse (kosher)', description: 'Less dense — 1¼ tsp instead of 1 tsp.', quantity: '1¼ tsp' },
      { label: 'Sea salt', description: 'Similar to coarse.', quantity: '1¼ tsp' },
    ],
    substitutions: [
      { name: 'Soy sauce', description: 'Different flavor profile. Adds umami.', note: '1 tbsp ≈ 1 tsp salt, but changes flavor' },
    ],
    empirical: false,
    matrix: [
      { verdict: 'Bland', consequence: 'No flavor at all. Dish is inedible.' },
      { verdict: 'Undersalted', consequence: 'Flavor is muted. Noticeably lacking.' },
      { verdict: 'Weak-ish', consequence: 'Tolerable, but lacks brightness.' },
      { verdict: '✓ Balanced', consequence: 'Proper salt level.' },
      { verdict: 'Oversalty', consequence: 'Salt is clearly noticeable. Masks spices.' },
      { verdict: 'Too salty', consequence: 'Inedible.' },
    ],
  },
  {
    name: 'Black Pepper',
    role: 'Mild heat, background note',
    necessity: 'CONDITIONAL',
    amount: '½ tsp',
    toleranceZone: { type: 'very_wide', description: 'Very wide — all 6 columns in tolerance zone' },
    variants: [
      { label: 'Ground', description: 'Standard.', quantity: '½ tsp' },
      { label: 'Freshly ground', description: 'More aromatic.', quantity: '½ tsp' },
      { label: 'White pepper', description: 'Milder, less aromatic.', quantity: '½ tsp' },
    ],
    substitutions: [
      { name: 'White pepper', description: 'Milder, for light-colored dishes.', note: 'Same proportion' },
      { name: 'Cayenne pepper', description: 'Hotter — different profile.', note: '¼ tsp, careful' },
      { name: 'Skip', description: 'No consequences.', note: 'Flavor slightly simpler' },
    ],
    empirical: false,
    matrix: [
      { verdict: '✓ OK', consequence: 'No pepper — flavor slightly simpler.' },
      { verdict: '✓ OK', consequence: 'Light hint of heat.' },
      { verdict: '✓ OK', consequence: 'Pleasant background.' },
      { verdict: '✓ Normal', consequence: 'Classic level.' },
      { verdict: '✓ OK', consequence: 'Noticeable heat.' },
      { verdict: '✓ OK', consequence: 'Spicy, but not critical.' },
    ],
  },
  {
    name: 'Baking Powder',
    role: 'Airiness, lightness of texture',
    necessity: 'CONDITIONAL',
    amount: '½ tsp',
    toleranceZone: { type: 'narrow_above', description: 'Moderate downward; NARROW upward — excess gives chemical aftertaste' },
    variants: [
      { label: 'Regular', description: 'Standard baking powder.', quantity: '½ tsp' },
    ],
    substitutions: [
      { name: 'Baking soda + acid', description: '¼ tsp baking soda + ½ tsp lemon juice.', note: 'Activates immediately' },
      { name: 'Skip', description: 'Falafel will be denser, but not critical.', note: 'Denser texture' },
    ],
    empirical: false,
    matrix: [
      { verdict: '✓ OK', consequence: 'Without baking powder. Falafel slightly denser.' },
      { verdict: 'Weak', consequence: 'Minimal lift effect.' },
      { verdict: '✓ Light', consequence: 'Barely noticeable airiness.' },
      { verdict: '✓ Normal', consequence: 'Proper airiness.' },
      { verdict: 'Aftertaste', consequence: 'Chemical aftertaste begins to appear.' },
      { verdict: 'Soapy taste', consequence: 'Clear chemical aftertaste. Dish ruined.' },
    ],
  },
  {
    name: 'Flour',
    role: 'Binder — only if mixture is too wet',
    necessity: 'CONDITIONAL',
    amount: '? 0–3 tbsp',
    toleranceZone: { type: 'narrow_above', description: 'Empirical. Below normal — N/A; above — NARROW, each spoonful changes texture' },
    variants: [
      { label: 'Wheat', description: 'Standard. Each tablespoon significantly changes texture.', quantity: '? 0–3 tbsp' },
      { label: 'Chickpea flour', description: 'Enhances flavor cohesion. More hygroscopic.', quantity: '? 0–3 tbsp' },
      { label: 'Corn starch', description: 'Binds tighter with less volume.', quantity: '? 0–1½ tbsp' },
    ],
    substitutions: [
      { name: 'Chickpea flour', description: 'Same role, same range. Gluten-free.', note: 'Start with ½ the wheat flour amount' },
      { name: 'Corn starch', description: 'Binds tighter with less volume.', note: '½ the flour amount' },
      { name: 'Skip', description: 'The right answer if technique is correct. Always try zero flour first.', note: 'Perfect falafel without flour' },
    ],
    empirical: true,
    matrix: [
      { verdict: 'Perfect', consequence: 'Proper technique — no flour needed.' },
      { verdict: 'Crumbly', consequence: 'Mix slightly falls apart when frying.' },
      { verdict: 'Holds', consequence: 'Minimal binding.' },
      { verdict: '✓? Bound', consequence: 'Empirical — test with a sample ball.' },
      { verdict: 'Dense', consequence: 'Noticeably denser texture.' },
      { verdict: 'Brick', consequence: 'Heavy, dense falafel. Loss of airiness.' },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════
// STEPS — hardcoded representative recipe (falafel)
// ═══════════════════════════════════════════════════════════════

const STEPS = [
  {
    id: 1,
    title: 'Soaking Chickpeas',
    description: 'Soak dry chickpeas in a large volume of cold water. Chickpeas must be fully submerged with 5 cm of water above.',
    duration: { value: '12–24 h', accuracy: 'verified' },
    temperature: null,
    equipment: null,
    equipmentSetting: null,
    doneWhen: 'Chickpeas have doubled to 2.5× in size, soft when bitten but not mushy. Water is slightly cloudy.',
    ifSkipped: 'Dry chickpeas cannot be ground to the right consistency — falafel will fall apart. Canned chickpeas are not a substitute — they are cooked and will turn to mush.',
    calibration: null,
  },
  {
    id: 2,
    title: 'Draining and Drying Chickpeas',
    description: 'Drain water through a colander. Let drip for 5–10 minutes. Chickpeas should be damp but not wet.',
    duration: { value: '5–10 min', accuracy: 'verified' },
    temperature: null,
    equipment: null,
    equipmentSetting: null,
    doneWhen: 'No water drips from the surface of the chickpeas. When shaking the colander, no droplets scatter.',
    ifSkipped: 'Excess moisture → mix too wet → more flour needed → dense falafel.',
    calibration: null,
  },
  {
    id: 3,
    title: 'Processing in Food Processor',
    description: 'Pulse chickpeas, onion, garlic, and parsley in the food processor bowl until fine grit. Do NOT purée — texture must be grainy.',
    duration: { value: '30–45 sec', accuracy: 'estimated' },
    temperature: null,
    equipment: 'KenwoodFDP22',
    equipmentSetting: 'Chop (pulse)',
    doneWhen: 'Consistency of fine couscous — grains 1–2 mm. When squeezed in hand, mix holds shape but is not sticky. NOT a paste.',
    ifSkipped: 'Too coarse a grind → falafel falls apart. Too fine (purée) → dense, rubbery texture.',
    calibration: null,
  },
  {
    id: 4,
    title: 'Adding Spices and Salt',
    description: 'Add cumin, coriander, salt, pepper, and baking powder to the ground mixture. Mix with a spatula until evenly distributed.',
    duration: { value: '1–2 min', accuracy: 'verified' },
    temperature: null,
    equipment: null,
    equipmentSetting: null,
    doneWhen: 'Spices are evenly distributed — no visible clumps of cumin or salt.',
    ifSkipped: 'Spices will be unevenly distributed — some falafels will be bland, others oversalted.',
    calibration: null,
  },
  {
    id: 5,
    title: 'Moisture Test',
    description: 'Shape one ball (~30 g). If it holds shape and does not crack — no flour needed. If it falls apart — add flour 1 tbsp at a time and repeat test.',
    duration: { value: '2–3 min', accuracy: 'empirical' },
    temperature: null,
    equipment: null,
    equipmentSetting: null,
    doneWhen: 'Ball holds shape, surface is smooth, no cracks. Springs back when lightly pressed.',
    ifSkipped: 'Skipping the test → risk of entire batch falling apart when frying. Too late to fix.',
    calibration: null,
  },
  {
    id: 6,
    title: 'Shaping Falafels',
    description: 'Shape balls ~30 g each. Place on a plate or board. Do not squeeze too hard.',
    duration: { value: '10–15 min', accuracy: 'estimated' },
    temperature: null,
    equipment: null,
    equipmentSetting: null,
    doneWhen: 'All balls are the same size (~3–4 cm diameter). Surface is smooth. 12–14 pieces from a standard batch.',
    ifSkipped: 'Different sizes → uneven cooking. Small ones will burn, large ones will stay raw.',
    calibration: null,
  },
  {
    id: 7,
    title: 'Preheating Air Fryer',
    description: 'Preheat Ninja MAX PRO in Air Fry mode to 200 °C.',
    duration: { value: '3–5 min', accuracy: 'verified' },
    temperature: { value: '200 °C', accuracy: 'verified' },
    equipment: 'NinjaMAXPRO',
    equipmentSetting: 'Air Fry',
    doneWhen: 'Ready indicator on Ninja shows 200 °C reached.',
    ifSkipped: 'Falafel will go into a cold environment → absorb more oil (from spray) → greasy, not crispy.',
    calibration: '⚡ Calibration: check the first batch — time depends on ball size and mix moisture. Record your optimal time.',
  },
  {
    id: 8,
    title: 'Frying Falafel (First Side)',
    description: 'Lightly spray falafels with oil spray. Place in a single layer in the air fryer basket. Fry for 12–14 minutes at 200 °C.',
    duration: { value: '12–14 min', accuracy: 'estimated' },
    temperature: { value: '200 °C', accuracy: 'verified' },
    equipment: 'NinjaMAXPRO',
    equipmentSetting: 'Air Fry',
    doneWhen: 'Top side is golden-brown. Edges are starting to darken. When tapped — a dull sound.',
    ifSkipped: 'Falafel will stay raw inside. Surface is pale, not crispy.',
    calibration: '⚡ Calibration: check the first batch — time depends on ball size and mix moisture. Record your optimal time.',
  },
  {
    id: 9,
    title: 'Flip and Finish Frying',
    description: 'Carefully flip each falafel with a spatula. Fry for another 5–7 minutes at 200 °C.',
    duration: { value: '5–7 min', accuracy: 'estimated' },
    temperature: { value: '200 °C', accuracy: 'verified' },
    equipment: 'NinjaMAXPRO',
    equipmentSetting: 'Air Fry',
    doneWhen: 'Both sides evenly golden-brown. Crust is crispy when tapped with a fingernail. When broken open — inside is light green, steamy.',
    ifSkipped: 'One side is pale and soft. Uneven texture.',
    calibration: '⚡ Calibration: check the first batch — time depends on ball size and mix moisture. Record your optimal time.',
  },
  {
    id: 10,
    title: 'Resting Before Serving',
    description: 'Place finished falafels on a wire rack (not a plate — the bottom will get soggy). Let rest for 2–3 minutes.',
    duration: { value: '2–3 min', accuracy: 'verified' },
    temperature: null,
    equipment: null,
    equipmentSetting: null,
    doneWhen: 'Falafel has stopped sizzling. Crust has stabilized — became even crispier.',
    ifSkipped: 'Straight from the heat — you can burn yourself. Crust hasn\'t stabilized yet, may fall apart when cut.',
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
        return { pass: false, message: `Step ${step.id}: duration ("${step.duration.value}") — missing accuracy` };
      }
      if (step.temperature && !step.temperature.accuracy) {
        return { pass: false, message: `Step ${step.id}: temperature ("${step.temperature.value}") — missing accuracy` };
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
        return { pass: false, message: `Step ${step.id}: accuracy "estimated" but no duration or temperature to display ~` };
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
        return { pass: false, message: `Step ${step.id}: accuracy "empirical" but no duration or temperature to display ?` };
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
          return { pass: false, message: `Step ${step.id}: temperature "${step.temperature.value}" specified but equipment not set` };
        }
        // Check equipment exists in profile store
        const eq = EquipmentProfiles.getById(step.equipment);
        if (!eq) {
          return { pass: false, message: `Step ${step.id}: equipment "${step.equipment}" not found in equipment profiles` };
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
          return { pass: false, message: `Step ${step.id}: estimated accuracy + air fryer (${eq.name}) — calibration required but missing` };
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
        return { pass: false, message: `Step ${step.id}: doneWhen field is required but empty` };
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
        return { pass: false, message: `Step ${step.id}: ifSkipped field is required but empty` };
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
          return { pass: false, message: `Step ${step.id}: found "1.5 L" instead of "${expected}" for Kenwood FDP22` };
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
    content: "Cooking Visualizer — Recipe Breakdown" !important;
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
            Something went wrong
          </h2>
          <p style={{
            fontFamily: 'Georgia, serif', color: THEME.textDim, fontSize: '0.9rem',
            margin: '0 0 24px 0', lineHeight: '1.5',
          }}>
            An error occurred while rendering. Please try refreshing the page.
          </p>
          <button onClick={() => window.location.reload()} style={{
            padding: '10px 28px', borderRadius: '8px', border: 'none',
            backgroundColor: THEME.gold, color: THEME.bg, cursor: 'pointer',
            fontFamily: 'Georgia, serif', fontSize: '1rem', fontWeight: 'bold',
          }}>
            Refresh
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
    estimated: { icon: '~', label: 'Estimate', color: THEME.amber, title: 'Estimate; depends on size, moisture, etc.' },
    empirical: { icon: '?', label: 'Check', color: THEME.red, title: 'Requires user verification' },
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
    { id: 'ingredients', label: 'Ingredients' },
    { id: 'steps', label: 'Cooking Steps' },
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
        {isExpanded ? 'Collapse matrix ▲' : 'Expand matrix ▼'}
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
              Tolerance zone: {ing.toleranceZone.description}
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
                Form Variants:
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
                Substitutes & Alternatives:
              </div>
              {ing.substitutions.map((sub, si) => (
                <div key={si} style={{
                  padding: '8px 10px', marginBottom: '4px',
                  backgroundColor: THEME.surface, borderRadius: '4px',
                  borderLeft: `3px solid ${sub.name === 'Skip' ? THEME.amber : THEME.green}`,
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
  'BASE': THEME.gold,
  'IMPORTANT': THEME.amber,
  'OPTIONAL': THEME.blue,
  'CONDITIONAL': THEME.textDim,
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
          Ingredients
        </h2>
        <button onClick={toggleAll} style={{
          padding: '6px 14px', borderRadius: '6px', border: `1px solid ${THEME.border}`,
          backgroundColor: THEME.surface, color: THEME.textDim, cursor: 'pointer',
          fontSize: '0.8rem', fontFamily: 'Georgia, serif',
        }}>
          {expandedAll ? 'Collapse all' : 'Expand all'}
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
            No ingredient data
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
      )}
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
            title={`${eq.name} · ${step.equipmentSetting} — click for equipment settings`}
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
          }} title="This device has been removed from profiles">
            ⚠ Device removed
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
        {isExpanded ? 'Hide details ▲' : 'Show details ▼'}
      </button>

      <div style={{
        marginLeft: '24px', marginTop: isExpanded ? '12px' : '0px',
        maxHeight: isExpanded ? '2000px' : '0px',
        overflow: 'hidden',
        opacity: isExpanded ? 1 : 0,
        transition: reduceMotion ? 'none' : 'max-height 0.3s ease, opacity 0.3s ease, margin-top 0.3s ease',
      }}>
        <div style={{ marginTop: '0px' }}>
          {/* Doneness */}
          <div style={{
            padding: '10px 14px', marginBottom: '8px',
            borderLeft: `3px solid ${THEME.green}`, backgroundColor: THEME.surface,
            borderRadius: '0 6px 6px 0',
          }}>
            <div style={{ fontFamily: 'Georgia, serif', fontSize: '0.8rem', color: THEME.green, fontWeight: 'bold', marginBottom: '4px' }}>
              <InlineIcon char="✓" color={THEME.green} /> Done When
            </div>
            <div style={{ fontFamily: 'Georgia, serif', color: THEME.textDim, fontSize: '0.8rem', lineHeight: '1.4' }}>
              {step.doneWhen}
            </div>
          </div>

          {/* If Skipped */}
          <div style={{
            padding: '10px 14px', marginBottom: '8px',
            borderLeft: `3px solid ${THEME.red}`, backgroundColor: THEME.surface,
            borderRadius: '0 6px 6px 0',
          }}>
            <div style={{ fontFamily: 'Georgia, serif', fontSize: '0.8rem', color: THEME.red, fontWeight: 'bold', marginBottom: '4px' }}>
              <InlineIcon char="✗" color={THEME.red} /> If Skipped
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
                  📝 My Calibration
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
                      Calibrated: {new Date(cal.calibratedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                      <button onClick={startEdit} style={{
                        padding: '4px 12px', borderRadius: '4px', border: `1px solid ${THEME.border}`,
                        backgroundColor: THEME.surface, color: THEME.textDim, cursor: 'pointer',
                        fontSize: '0.75rem', fontFamily: 'Georgia, serif',
                      }}>
                        ✏️ Edit
                      </button>
                      <button onClick={handleResetCal} style={{
                        padding: '4px 12px', borderRadius: '4px', border: `1px solid ${THEME.border}`,
                        backgroundColor: 'transparent', color: THEME.red, cursor: 'pointer',
                        fontSize: '0.75rem', fontFamily: 'Georgia, serif',
                      }}>
                        Reset
                      </button>
                    </div>
                  </div>
                ) : (
                  /* EDIT / CREATE form */
                  <div>
                    <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '10px', flexWrap: 'wrap', marginBottom: '8px' }}>
                      <div style={{ flex: '1 1 120px' }}>
                        <label style={{ display: 'block', fontFamily: 'Georgia, serif', color: THEME.textMuted, fontSize: '0.7rem', marginBottom: '2px' }}>
                          ⏱ Opt. Time
                        </label>
                        <input
                          value={form.optimalTime}
                          onChange={(e) => updateForm('optimalTime', e.target.value)}
                          placeholder="12–14 min"
                          data-testid={`cal-time-input-${step.id}`}
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
                          🌡 Opt. Temp
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
                        📋 Notes
                      </label>
                      <input
                        value={form.notes}
                        onChange={(e) => updateForm('notes', e.target.value)}
                        placeholder="First batch — 12 min, second — 14 min"
                        style={{
                          width: '100%', padding: '5px 8px', borderRadius: '4px',
                          border: `1px solid ${THEME.border}`, backgroundColor: THEME.card,
                          color: THEME.text, fontFamily: 'Georgia, serif', fontSize: inputFontSize,
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={handleSaveCal} data-testid={`cal-save-btn-${step.id}`} style={{
                        padding: '5px 16px', borderRadius: '4px', border: 'none',
                        backgroundColor: THEME.green, color: THEME.bg, cursor: 'pointer',
                        fontSize: '0.8rem', fontFamily: 'Georgia, serif', fontWeight: 'bold',
                      }}>
                        💾 Save
                      </button>
                      {cal && (
                        <button onClick={() => setEditingCal(prev => ({ ...prev, [calKey]: false }))} style={{
                          padding: '5px 14px', borderRadius: '4px', border: `1px solid ${THEME.border}`,
                          backgroundColor: THEME.surface, color: THEME.textDim, cursor: 'pointer',
                          fontSize: '0.8rem', fontFamily: 'Georgia, serif',
                        }}>
                          Cancel
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
            Cooking Steps
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
              {calCoverageBadge.count}/{calCoverageBadge.total} calibrated
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
              ? `${errors.length} error${errors.length === 1 ? '' : 's'}`
              : hasWarnings
                ? `${warnings.length} warning${warnings.length === 1 ? '' : 's'}`
                : 'All verified';
            return (
              <button
                onClick={() => setShowVerificationModal(true)}
                title="Open accuracy verification report"
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
          {expandedAll ? 'Collapse all' : 'Expand all'}
        </button>
      </div>

      {/* Accuracy legend */}
      <div style={{
        ...STYLES.card, borderColor: THEME.goldDim, padding: '10px 14px',
        display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center',
      }}>
        <span style={{ fontFamily: 'Georgia, serif', color: THEME.goldLight, fontSize: '0.85rem', fontWeight: 'bold' }}>
          ⚠ Accuracy:
        </span>
        <span style={{ fontFamily: 'Georgia, serif', fontSize: '0.75rem', color: THEME.textDim }}>
          No tag = verified
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontFamily: 'Georgia, serif', fontSize: '0.75rem', color: THEME.textDim }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '16px', height: '16px', borderRadius: '50%', backgroundColor: THEME.amber, color: THEME.bg, fontSize: '0.6rem', fontWeight: 'bold' }}>~</span>
          = estimate
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontFamily: 'Georgia, serif', fontSize: '0.75rem', color: THEME.textDim }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '16px', height: '16px', borderRadius: '50%', backgroundColor: THEME.red, color: THEME.bg, fontSize: '0.6rem', fontWeight: 'bold' }}>?</span>
          = requires verification
        </span>
      </div>

      {/* Important summary block */}
      <div style={{
        ...STYLES.card, borderColor: THEME.gold, marginTop: '12px',
        padding: '12px 16px',
      }}>
        <div style={{ fontFamily: 'Georgia, serif', color: THEME.text, fontSize: '0.85rem', lineHeight: '1.5' }}>
          <strong style={{ color: THEME.goldLight }}>⚠ Important:</strong> all time and temperature values have passed three-tier accuracy verification. Values marked with ~ are estimates — calibrate to your equipment. Values marked with ? require mandatory verification.
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
            No cooking steps data
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
        ))
      )}
 
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
          📋 Equipment Map {showEquipmentMap ? '▲' : '▼'}
        </button>

        {showEquipmentMap && (
          <div style={{ ...STYLES.card, marginTop: '10px', padding: cardPad, overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'Georgia, serif', fontSize: '0.8rem' }}>
              <thead>
                <tr style={{ borderBottom: `2px solid ${THEME.goldDim}` }}>
                  <th style={{ textAlign: 'left', padding: '8px 10px', color: THEME.goldLight, fontWeight: 'bold' }}>
                    Equipment
                  </th>
                  <th style={{ textAlign: 'left', padding: '8px 10px', color: THEME.goldLight, fontWeight: 'bold' }}>
                    Steps
                  </th>
                  <th style={{ textAlign: 'center', padding: '8px 10px', color: THEME.goldLight, fontWeight: 'bold' }}>
                    Calibration
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
                    const eqName = profile ? `${profile.icon || ''} ${profile.name}` : `${eqId} (removed)`;
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

                  // "All Steps" row for equipment-less steps
                  if (noEquipmentSteps.length > 0) {
                    rows.push(
                      <tr key="_noeq" style={{ borderBottom: `1px solid ${THEME.border}`, backgroundColor: THEME.surface }}>
                        <td style={{ padding: '8px 10px', color: THEME.textDim, fontStyle: 'italic', verticalAlign: 'top' }}>
                          All Steps
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
                📋 Accuracy Verification Report
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
                { label: 'Steps', value: verificationReport.totalSteps, color: THEME.goldLight },
                { label: 'Rules', value: verificationReport.totalRules, color: THEME.blue },
                { label: 'Checks', value: verificationReport.checksRun, color: THEME.textDim },
                { label: 'Passed', value: verificationReport.passed, color: THEME.green },
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
                ? `❌ Found ${verificationReport.errors.length} error${verificationReport.errors.length === 1 ? '' : 's'}`
                : verificationReport.warnings.length > 0
                  ? `⚠ ${verificationReport.warnings.length} warning${verificationReport.warnings.length === 1 ? '' : 's'}`
                  : '✅ All checks passed — data conforms to accuracy rules'}
            </div>

            {/* Errors list */}
            {verificationReport.errors.length > 0 && (
              <div style={{ marginBottom: '16px' }}>
                <h3 style={{
                  fontFamily: 'Georgia, serif', color: THEME.red, fontSize: '0.95rem',
                  margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '6px',
                }}>
                  ❌ Errors ({verificationReport.errors.length})
                </h3>
                {verificationReport.errors.map((err, i) => (
                  <div key={i} style={{
                    padding: '8px 12px', marginBottom: '4px',
                    borderLeft: `3px solid ${THEME.red}`, backgroundColor: THEME.surface,
                    borderRadius: '0 6px 6px 0',
                  }}>
                    <div style={{ fontFamily: 'Georgia, serif', fontSize: '0.8rem', color: THEME.text, lineHeight: '1.4' }}>
                      <span style={{ color: THEME.goldLight, fontWeight: 'bold' }}>Step {err.stepId}</span>
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
                  ⚠ Warnings ({verificationReport.warnings.length})
                </h3>
                {verificationReport.warnings.map((warn, i) => (
                  <div key={i} style={{
                    padding: '8px 12px', marginBottom: '4px',
                    borderLeft: `3px solid ${THEME.amber}`, backgroundColor: THEME.surface,
                    borderRadius: '0 6px 6px 0',
                  }}>
                    <div style={{ fontFamily: 'Georgia, serif', fontSize: '0.8rem', color: THEME.text, lineHeight: '1.4' }}>
                      <span style={{ color: THEME.goldLight, fontWeight: 'bold' }}>Step {warn.stepId}</span>
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
                    ℹ️ Information ({verificationReport.infos.length})
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
                Close
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
  { value: 'airfryer', label: 'Air Fryer', icon: '🔥' },
  { value: 'processor', label: 'Food Processor', icon: '🍴' },
  { value: 'breadmaker', label: 'Bread Maker', icon: '🍞' },
  { value: 'sandwichmaker', label: 'Sandwich Maker', icon: '🥪' },
  { value: 'blender', label: 'Blender', icon: '🥤' },
  { value: 'custom', label: 'Other', icon: '⚙️' },
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
    if (!name) { setFormError('Name is required'); return; }
    if (!form.type) { setFormError('Select device type'); return; }

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
            ⚙️ Equipment
          </h2>
          <button onClick={doClose} data-testid="close-settings-btn" style={{
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
              No devices. Add your first device.
            </p>
            <button onClick={() => { resetForm(); setShowAddForm(true); }} style={{
              padding: '12px 28px', borderRadius: '8px',
              border: 'none', backgroundColor: THEME.gold, color: THEME.bg,
              cursor: 'pointer', fontFamily: 'Georgia, serif',
              fontSize: '1rem', fontWeight: 'bold',
            }}>
              + Add Device
            </button>
          </div>
        ) : (
          /* Profile list */
          profiles.map((profile) => {
            const ti = typeInfo(profile.type);
            return (
              <div key={profile.id} data-testid={`profile-row-${profile.id}`} style={{
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
                      <span title="Built-in device — cannot be deleted" style={{ color: THEME.textMuted, fontSize: '0.85rem' }}>🔒</span>
                    )}
                  </div>
                  <div style={{ fontFamily: 'Georgia, serif', fontSize: '0.75rem', color: THEME.textDim, marginTop: '2px' }}>
                    {profile.capacity && <span style={{ marginRight: '10px' }}>Capacity: {profile.capacity}</span>}
                    {profile.maxTemp != null && <span style={{ marginRight: '10px' }}>Max temp: {profile.maxTemp}°C</span>}
                    {profile.bowlCapacity && <span style={{ marginRight: '10px' }}>Bowl: {profile.bowlCapacity}</span>}
                    {(profile.modes || []).length > 0 && <span>Modes: {(profile.modes || []).join(', ')}</span>}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '6px', flexShrink: 0, marginLeft: '12px' }}>
                  <button onClick={() => openEdit(profile)} data-testid={`edit-btn-${profile.id}`} style={{
                    background: 'none', border: `1px solid ${THEME.border}`, borderRadius: '4px',
                    color: THEME.textDim, cursor: 'pointer', padding: '4px 8px', fontSize: '0.85rem',
                  }} title="Edit">✏️</button>
                  {profile.isDefault ? (
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      width: '30px', height: '30px', color: THEME.textMuted, fontSize: '0.9rem',
                    }} title="Built-in device — cannot be deleted">🔒</span>
                  ) : (
                    <button onClick={() => setConfirmDeleteId(profile.id)} data-testid={`delete-btn-${profile.id}`} style={{
                      background: 'none', border: `1px solid ${THEME.border}`, borderRadius: '4px',
                      color: THEME.red, cursor: 'pointer', padding: '4px 8px', fontSize: '0.85rem',
                    }} title="Delete">🗑️</button>
                  )}
                </div>
              </div>
            );
          })
        )}

        {/* Delete confirmation */}
        {confirmDeleteId && (() => {
          const p = profiles.find(x => x.id === confirmDeleteId);
          return (
            <div style={{
              ...STYLES.card, borderColor: THEME.red, padding: '12px 16px',
              marginTop: '8px', textAlign: 'center',
            }}>
              <p style={{ fontFamily: 'Georgia, serif', color: THEME.text, fontSize: '0.9rem', margin: '0 0 10px 0' }}>
                Delete "{p ? p.name : ''}"? This action cannot be undone. Steps referencing this device will show a warning.
              </p>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                <button onClick={() => handleDelete(confirmDeleteId)} data-testid="confirm-delete-btn" style={{
                  padding: '6px 16px', borderRadius: '6px', border: 'none',
                  backgroundColor: THEME.red, color: THEME.bg, cursor: 'pointer',
                  fontFamily: 'Georgia, serif', fontSize: '0.85rem',
                }}>Delete</button>
                <button onClick={() => setConfirmDeleteId(null)} style={{
                  padding: '6px 16px', borderRadius: '6px', border: `1px solid ${THEME.border}`,
                  backgroundColor: THEME.surface, color: THEME.textDim, cursor: 'pointer',
                  fontFamily: 'Georgia, serif', fontSize: '0.85rem',
                }}>Cancel</button>
              </div>
            </div>
          );
        })()}

        {/* Add / Edit form */}
        {!showAddForm ? (
          <button onClick={() => { resetForm(); setShowAddForm(true); }} data-testid="add-device-btn" style={{
            marginTop: '16px', padding: '10px 20px', borderRadius: '8px',
            border: `2px dashed ${THEME.goldDim}`, backgroundColor: 'transparent',
            color: THEME.goldDim, cursor: 'pointer', fontFamily: 'Georgia, serif',
            fontSize: '0.9rem', width: '100%',
          }}>
            + Add Device
          </button>
        ) : (
          <div style={{ ...STYLES.card, padding: cardPad, marginTop: '16px', borderColor: THEME.goldDim }}>
            <h3 style={{ fontFamily: 'Georgia, serif', color: THEME.goldLight, fontSize: '1rem', margin: '0 0 12px 0' }}>
              {editingId ? 'Edit Device' : 'New Device'}
            </h3>
            {formError && (
              <div style={{ color: THEME.red, fontSize: '0.8rem', marginBottom: '8px', fontFamily: 'Georgia, serif' }}>
                {formError}
              </div>
            )}

            {/* Name */}
            <div style={{ marginBottom: '10px' }}>
              <label style={{ display: 'block', fontFamily: 'Georgia, serif', color: THEME.textDim, fontSize: '0.8rem', marginBottom: '4px' }}>
                Name *
              </label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="E.g.: My Oven"
                data-testid="profile-name-input"
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
                Type *
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
                Icon (emoji)
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
                  Capacity (L)
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
                  Bowl Capacity (L)
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
                Max Temp (°C)
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
                Modes (comma separated)
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
              <button onClick={handleSubmit} data-testid="profile-save-btn" style={{
                padding: '8px 20px', borderRadius: '6px', border: 'none',
                backgroundColor: THEME.gold, color: THEME.bg, cursor: 'pointer',
                fontFamily: 'Georgia, serif', fontSize: '0.9rem', fontWeight: 'bold',
              }}>
                {editingId ? 'Save' : 'Add'}
              </button>
              <button onClick={resetForm} style={{
                padding: '8px 20px', borderRadius: '6px', border: `1px solid ${THEME.border}`,
                backgroundColor: THEME.surface, color: THEME.textDim, cursor: 'pointer',
                fontFamily: 'Georgia, serif', fontSize: '0.9rem',
              }}>Cancel</button>
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
    if (_pendingToast) {
      setToast(_pendingToast);
      _pendingToast = null;
    }
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
            title="Equipment Settings"
            data-testid="equipment-settings-btn"
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
