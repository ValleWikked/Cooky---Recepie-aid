---
phase: 1
plan: "01-project-scaffold"
type: execute
wave: 0
depends_on: ""
files_modified:
  - "src/CookingVisualizer.jsx"
autonomous: true
requirements:
  - "VIZ-01"
  - "VIZ-05"
  - "VIZ-06"
---

# Plan 01: Project Scaffold — Theme, Structure, Equipment Constants, Metric Units

## Objective

Create the self-contained single `.jsx` React artifact (`src/CookingVisualizer.jsx`) with the full visual theme, all hardcoded equipment data constants, metric unit convention, two-panel tab structure, and empty panel shells. This is the foundation that Plans 02 and 03 build on.

## Tasks

### Task 1 — Create the .jsx file with theme token constants
- **Type:** file-create
- **Files:** `src/CookingVisualizer.jsx`
- **Action:** Define the dark warm kitchen theme color palette as a `THEME` object literal, plus shared CSS-in-JS style fragments (card, badge, chip, collapsible) as a `STYLES` object literal. All values hardcoded — no imports, no external CSS, no API calls.
- **Verify:** File exists; THEME object contains all 14 color tokens exactly as specified:
  - `bg`: `#1a1610`
  - `surface`: `#242018`
  - `card`: `#2e2820`
  - `border`: `#3d3428`
  - `gold`: `#c8a96e`
  - `goldLight`: `#e0c48a`
  - `goldDim`: `#8a7040`
  - `red`: `#c05040`
  - `amber`: `#d4904a`
  - `green`: `#6a9e6e`
  - `blue`: `#5a8aaa`
  - `text`: `#f0e8d8`
  - `textDim`: `#9a8a6a`
  - `textMuted`: `#5a4a2a`
- **Acceptance criteria:**
  - `THEME` object has all 14 tokens with exact hex values
  - File is self-contained: zero `import` statements, zero `fetch`/`axios`/API calls
  - File is a single `.jsx` under `src/`

### Task 2 — Define equipment data constants
- **Type:** file-edit
- **Files:** `src/CookingVisualizer.jsx`
- **Action:** Add an `EQUIPMENT` object literal inside the same file with verified specs for each user device:
  - **Ninja MAX PRO**: capacity 6.2 L, maxTemp 240 °C, modes: Air Fry, Roast, Bake, Dehydrate, Reheat
  - **Kenwood FDP22.130GY**: bowl capacity 2.1 L (explicitly NOT 1.5 L), modes: Chop, Mix, Knead, Whisk, Purée
  - **Panasonic SD-YR2550**: bread maker, modes: Basic, Whole Wheat, Dough, Gluten-Free
  - **OZAVO sandwich maker**: modes: Toast, Grill
  - **Cecotec blender**: modes: Blend, Pulse
- **Verify:** `EQUIPMENT.NinjaMAXPRO` has `capacity: "6.2 L"` and `maxTemp: 240`. `EQUIPMENT.KenwoodFDP22` has `bowlCapacity: "2.1 L"` — greppable to prevent the 1.5 L error. All device labels match the skill spec exactly.
- **Acceptance criteria:**
  - All 5 devices present as constants
  - Kenwood bowl is 2.1 L, not 1.5 L
  - All data is hardcoded (no runtime config fetching)

### Task 3 — Enforce metric units throughout
- **Type:** file-edit
- **Files:** `src/CookingVisualizer.jsx`
- **Action:** Add a comment banner at the top of the file: `// ALL UNITS: metric — г, мл, °C. No imperial.` All displayed quantities use г (grams), мл (millilitres), °C (degrees Celsius). No imperial conversions, no "cups", no "oz", no "°F".
- **Verify:** Grep the file for "oz", "lb", "°F", "cups", "tbsp", "tsp", "inch" — zero hits. Units in any hardcoded recipe data are г/мл/°C only.
- **Acceptance criteria:**
  - Comment banner at file top declaring metric-only convention
  - No imperial unit strings anywhere in the file

### Task 4 — Build two-panel tab structure
- **Type:** file-edit
- **Files:** `src/CookingVisualizer.jsx`
- **Action:** Create the top-level `App` component with a `TabBar` rendering two mandatory tabs: "Ингредиенты" and "Этапы приготовления". Active tab state managed via `useState`. Below the tab bar, render the corresponding panel component (`IngredientPanel` or `ActionStepsPanel`) — initially both as empty functional component shells returning a placeholder `<div>` with the tab label. Font: Georgia/serif via inline style on the root element. No third tab.
- **Verify:** The component renders two tabs with correct Russian labels. Switching tabs via state toggles which panel is visible. Panel components are defined but return placeholder content.
- **Acceptance criteria:**
  - Two tabs: "Ингредиенты" and "Этапы приготовления"
  - Active tab is visually distinguished (gold underline or similar)
  - Panel switching works (only one panel visible at a time)
  - Font stack includes Georgia/serif
  - No third tab exists

### Task 5 — Verify VIZ-05 (self-contained) and VIZ-06 (metric)
- **Type:** verify
- **Files:** `src/CookingVisualizer.jsx`
- **Action:** Run final checks on the scaffold file:
  - Zero `import` or `require` statements
  - Zero `fetch`, `axios`, `XMLHttpRequest`, or any network API calls
  - All data is hardcoded as object literals
  - Metric-only comment banner present
  - No imperial units anywhere
- **Acceptance criteria:**
  - Grep for `import ` → zero results
  - Grep for `fetch(` → zero results
  - Grep for `oz\|lb\|°F\|cups\|tbsp\|tsp\|inch` → zero results
  - File is a valid JSX file that can be dropped into any React project

## Verification

1. `src/CookingVisualizer.jsx` exists and is a valid `.jsx` file
2. `THEME` object has all 13 color tokens with exact hex values
3. `EQUIPMENT` object has all 5 devices with verified specs
4. Kenwood bowl is 2.1 L (grep confirms no "1.5" appears near "Kenwood")
5. Metric units banner at file top; zero imperial unit strings
6. Two-panel tab structure renders with correct Russian labels
7. Zero imports, zero network calls — file is fully self-contained

## Success Criteria

- [ ] `src/CookingVisualizer.jsx` created with THEME, STYLES, EQUIPMENT constants
- [ ] Two tabs (Ингредиенты, Этапы приготовления) with empty panel shells
- [ ] Metric-only convention enforced (no imperial units)
- [ ] Self-contained: no imports, no API calls
- [ ] Kenwood bowl correctly documented as 2.1 L
- [ ] All 14 theme color tokens present with exact hex values
