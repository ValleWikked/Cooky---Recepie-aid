---
phase: 1
plan: "03-action-steps-panel"
type: execute
wave: 2
depends_on: "02-ingredient-panel"
files_modified:
  - "src/CookingVisualizer.jsx"
autonomous: true
requirements:
  - "VIZ-01"
  - "VIZ-03"
  - "VIZ-04"
---

# Plan 03: Step-by-Step Action Steps Panel (Panel 2)

## Objective

Implement the full Step-by-Step Action Steps panel from the cooking-visualizer skill spec. This includes: chronological, granular step cards with equipment-to-device mapping, accuracy tier tags (~ ESTIMATED, ? EMPIRICAL) on relevant time/temperature values — verified values carry NO tag (absence of ~/? implies verification per SKILL.md), "Готовность" (done-when) sensory cues per step, "Если пропустить" (if-skipped) consequence warnings per step, calibration instructions for air fryer steps, an overall "Важно" summary block, and a panel-level "Развернуть все / Свернуть все" toggle.

## Tasks

### Task 1 — Define the STEPS data constant
- **Type:** file-edit
- **Files:** `src/CookingVisualizer.jsx`
- **Action:** Add a hardcoded `STEPS` array constant. Each step entry has:
  - `id`: sequential number
  - `title`: step name in Russian (e.g., "Замачивание нута", "Измельчение в комбайне")
  - `description`: action text
  - `duration`: time string (e.g., "12–14 мин") with `accuracy` field: `verified`, `estimated`, or `empirical`
  - `temperature`: temp string (e.g., "200 °C") with `accuracy` field
  - `equipment`: device key matching EQUIPMENT constant name
  - `equipmentSetting`: mode to use (e.g., "Air Fry")
  - `doneWhen`: sensory cue string (e.g., "Поверхность золотисто-коричневая, при нажатии пружинит")
  - `ifSkipped`: consequence string (e.g., "Смесь будет слишком влажной — фалафель развалится при жарке")
  - `calibration`: calibration note (only for air fryer steps, null otherwise)
- **Verify:** STEPS array covers all steps from a representative recipe (e.g., фалафель). Each step maps equipment to the correct EQUIPMENT constant. Every time/temperature has an accuracy tier. Done-when and if-skipped strings are concrete and actionable.
- **Acceptance criteria:**
  - All recipe steps present in chronological order
  - Equipment field maps to exact EQUIPMENT key name
  - Every time value has accuracy tier
  - Every temperature value has accuracy tier
  - Done-when strings are sensory (visual, tactile, olfactory)
  - If-skipped strings state specific consequences

### Task 2 — Build the ActionStepsPanel component
- **Type:** file-edit
- **Files:** `src/CookingVisualizer.jsx`
- **Action:** Implement the `ActionStepsPanel` component. Render a vertically scrollable timeline of step cards. Each card shows:
  - Step number (gold circle badge, left side of card)
  - Step title (large, gold text)
  - Description paragraph
  - Equipment chip with device name and setting (e.g., "Ninja MAX PRO · Air Fry")
  - Time chip with accuracy tier tag (✓, ~, or ?)
  - Temperature chip with accuracy tier tag (✓, ~, or ?)
- **Verify:** All steps render in order. Equipment chips map to correct device names from EQUIPMENT constant. Accuracy tier tags render next to time/temperature values. Styling matches dark kitchen theme.
- **Acceptance criteria:**
  - Step cards render in numbered vertical timeline
  - Step number shown as gold circle badge
  - Equipment chip displays device label and mode from EQUIPMENT constant
  - Accuracy tags visible on every time/temperature chip
  - Visual hierarchy clear: title > description > chips

### Task 3 — Implement accuracy tier visualization
- **Type:** file-edit
- **Files:** `src/CookingVisualizer.jsx`
- **Action:** Style the accuracy tier tags per the skill spec (SKILL.md line 174: "No tag for verified durations"):
  - VERIFIED: no tag shown — absence of ~/? implies verification. The value appears clean without any badge.
  - ~ ESTIMATED: amber badge, tilde icon — "оценка; зависит от размера, влажности и т.д."
  - ? EMPIRICAL: red badge, question mark icon — "требует проверки пользователем"
  Tag tooltips show the tier description on hover. A legend at the top of the panel explains: "Нет метки = проверено, ~ = оценка, ? = требует проверки."
- **Verify:** Only ~ and ? tags appear on time/temperature chips. Verified values have no badge. Tooltips show correct descriptions. Legend present at panel top.
- **Acceptance criteria:**
  - VERIFIED values: no badge, clean display
  - ~ = amber tilde badge
  - ? = red question mark badge
  - Hover tooltips describe each tier
  - Legend explains "нет метки = проверено" convention

### Task 4 — Add "Готовность" (done-when) and "Если пропустить" (if-skipped) blocks
- **Type:** file-edit
- **Files:** `src/CookingVisualizer.jsx`
- **Action:** Below each step's chips, add two collapsible detail blocks:
  - "Готовность" block (green left border, check icon): shows the `doneWhen` sensory cue text. Always visible but can be toggled.
  - "Если пропустить" block (red left border, warning icon): shows the `ifSkipped` consequence text. Collapsed by default with a "Показать последствия" toggle.
- **Verify:** Every step has both blocks. Done-when is visible by default. If-skipped is collapsed behind toggle. Text matches STEPS data.
- **Acceptance criteria:**
  - Готовность block renders per step with green border
  - Если пропустить block renders per step with red border
  - If-skipped is collapsed by default
  - Both blocks have distinguishing icons
  - Text content is concrete and actionable (no generic placeholders)

### Task 5 — Add calibration instructions for air fryer steps
- **Type:** file-edit
- **Files:** `src/CookingVisualizer.jsx`
- **Action:** For steps where `equipment` is `NinjaMAXPRO`, render an additional calibration note block (amber border, info icon) below the done-when/if-skipped blocks. Text: "⚡ Калибровка: проверьте первую партию — время зависит от размера шариков и влажности смеси. Запишите своё оптимальное время."
- **Verify:** Calibration block appears only on NinjaMAXPRO steps. Text is consistent across all air fryer steps.
- **Acceptance criteria:**
  - Calibration block renders only on Ninja MAX PRO steps
  - Amber/copper border and info icon
  - Text prompts user to calibrate and record their optimal time
  - Block is not present on non-air-fryer steps

### Task 6 — Add "Важно" summary block at panel top
- **Type:** file-edit
- **Files:** `src/CookingVisualizer.jsx`
- **Action:** Add a summary block at the top of ActionStepsPanel: a gold-bordered card with a ⚠ icon and the text: "Важно: все указанные значения времени и температуры прошли трёхуровневую проверку точности. Значения с меткой ~ являются оценками — откалибруйте под своё оборудование. Значения с меткой ? требуют обязательной проверки."
- **Verify:** Summary block renders above the first step card. Gold border, warning icon. Text matches the spec exactly.
- **Acceptance criteria:**
  - Важно block is the first element in the panel
  - Gold border, warning icon
  - Explains the three accuracy tiers to the user
  - Text is exactly as specified

### Task 7 — Add "Развернуть все / Свернуть все" toggle
- **Type:** file-edit
- **Files:** `src/CookingVisualizer.jsx`
- **Action:** Add a panel-level toggle at the top of ActionStepsPanel: "Развернуть все" / "Свернуть все". Expands or collapses all step detail blocks (done-when, if-skipped, calibration) simultaneously.
- **Verify:** Panel toggle expands/collapses all detail blocks. Individual step toggles still work independently after panel toggle use.
- **Acceptance criteria:**
  - Panel-level expand/collapse works on all step detail blocks
  - Label updates between "Развернуть все" and "Свернуть все"
  - Individual toggles remain functional

## Verification

1. STEPS constant covers a complete recipe with all steps in order
2. Equipment mapping uses exact EQUIPMENT constant keys
3. Every time/temperature carries an accuracy tier tag (✓/~/?)
4. Accuracy tier legend renders at panel top with correct colors
5. "Готовность" and "Если пропустить" blocks render on every step
6. Calibration block appears on all Ninja MAX PRO steps
7. "Важно" summary block at panel top with correct text
8. Panel-level expand/collapse toggle works
9. All device names display with verified specs (Kenwood = 2.1 L)
10. No API calls — all data from hardcoded STEPS constant

## Success Criteria

- [ ] Step-by-step cards render in chronological order with numbered badges
- [ ] Every step maps to a device from the EQUIPMENT constant
- [ ] Accuracy tier tags (✓/~/) visible on all relevant time/temperature values
- [ ] Готовность blocks render per step with green border, visible by default
- [ ] Если пропустить blocks render per step with red border, collapsed by default
- [ ] Calibration instructions appear on all air fryer (Ninja MAX PRO) steps
- [ ] "Важно" summary explains the 3-tier accuracy system at panel top
- [ ] Panel-level expand/collapse works on all detail blocks
- [ ] Kenwood always displays as 2.1 L, never 1.5 L
