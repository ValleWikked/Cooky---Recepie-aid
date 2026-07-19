---
phase: 1
plan: "02-ingredient-panel"
type: execute
wave: 1
depends_on: "01-project-scaffold"
files_modified:
  - "src/CookingVisualizer.jsx"
autonomous: true
requirements:
  - "VIZ-01"
  - "VIZ-02"
---

# Plan 02: Ingredient Analysis Panel (Panel 1)

## Objective

Implement the full Ingredient Analysis panel from the cooking-visualizer skill spec. This includes: necessity tier badges (ОСНОВА, ВАЖНО, ОПЦИОНАЛЬНО, УСЛОВНЫЙ), the 6-column quantity matrix (0 | ½× | ¾× | 1× | ⁵⁄₄× | 3/2×) with per-column verdicts and consequences, tolerance zone visual bridges, the alternatives/substitutions section for each non-base ingredient, and sourcing/processing labels per ingredient. All ingredient data is hardcoded from the ingredient-roles.md reference.

## Tasks

### Task 1 — Define the INGREDIENTS data constant
- **Type:** file-edit
- **Files:** `src/CookingVisualizer.jsx`
- **Action:** Add a hardcoded `INGREDIENTS` array constant containing entries for all ingredients from ingredient-roles.md. Each entry has:
  - `name`: Russian name (Лук, Чеснок, Петрушка, etc.)
  - `role`: role description string
  - `necessity`: one of `ОСНОВА`, `ВАЖНО`, `ОПЦИОНАЛЬНО`, `УСЛОВНЫЙ`
  - `amount`: quantity at 1× (e.g., "80 г")
  - `matrix`: 6-column array of `{verdict, consequence}` objects for columns 0, ½×, ¾×, 1×, ⁵⁄₄×, 3/2×
  - `toleranceZone`: e.g., "wide_below", "narrow_above", "narrow_both"
  - `variants`: array of `{label, description, quantity}` for form variants
  - `substitutions`: array of `{name, description, note}` for alternatives
  - `empirical`: boolean — true for empirically-determined quantities (flour, etc.)
- **Verify:** `INGREDIENTS` array has entries for all 11 ingredients from ingredient-roles.md: Лук, Чеснок, Петрушка, Кумин, Кориандр, Соль, Чёрный перец, Разрыхлитель, Мука, and the base ingredients (Нут, Бобы). Each entry has all 6 matrix columns with verdict and consequence strings. Substitutions present for all non-base ingredients.
- **Acceptance criteria:**
  - All ingredients from ingredient-roles.md are present
  - 6-column matrix complete for every ingredient
  - Correct necessity tiers: base ingredients marked ОСНОВА
  - Empirical flag set on flour and other empirically-determined quantities

### Task 2 — Build the IngredientPanel component
- **Type:** file-edit
- **Files:** `src/CookingVisualizer.jsx`
- **Action:** Implement the `IngredientPanel` component. Render a scrollable list of ingredient cards. Each card shows:
  - Ingredient name (large, gold)
  - Necessity tier badge (ОСНОВА = gold, ВАЖНО = amber, ОПЦИОНАЛЬНО = blue, УСЛОВНЫЙ = dim)
  - Role description text
  - Amount at 1×
  - "Развернуть матрицу" toggle button per ingredient
- **Verify:** All ingredients render with correct necessity badge color. Toggle button exists per ingredient. Card styling matches theme (dark surface, gold borders).
- **Acceptance criteria:**
  - Ingredient cards render in a scrollable list
  - Necessity badges are color-coded correctly
  - Toggle button present on every card
  - No ingredient is missing from the list

### Task 3 — Build the 6-column quantity matrix (collapsible)
- **Type:** file-edit
- **Files:** `src/CookingVisualizer.jsx`
- **Action:** When a card's toggle is expanded, render the 6-column matrix as a horizontal scrollable table. Columns: 0, ½×, ¾×, 1×, ⁵⁄₄×, 3/2×. Each cell shows the verdict (top, bold) and consequence (bottom, smaller). The 1× column is highlighted (gold border or background tint). If `empirical` is true on the ingredient, the 1× cell shows a `?` tag.
- **Verify:** Matrix renders 6 columns. 1× column visually distinct. Verdict/consequence text matches ingredient-roles.md data exactly. Empirical flag renders `?` tag where applicable.
- **Acceptance criteria:**
  - 6 columns visible when expanded
  - 1× column has visual distinction (gold border)
  - `?` tag appears on empirical ingredients at 1×
  - Verdicts and consequences match the reference data verbatim

### Task 4 — Add tolerance zone visual indicator
- **Type:** file-edit
- **Files:** `src/CookingVisualizer.jsx`
- **Action:** Below the matrix, render a tolerance zone visual bridge: a horizontal bar showing which columns are in the acceptable range. Wide zones span multiple columns (e.g., чёрный перец: all 6 columns in zone). Narrow zones touch only the 1× column (e.g., соль: no flexibility). Use green gradient fill for the zone, gray for outside. Label the zone description (from ingredient-roles.md zone field).
- **Verify:** Tolerance bar width corresponds to ingredient's zone. Salt = single column wide. Black pepper = full bar width. Zone label matches reference.
- **Acceptance criteria:**
  - Tolerance zone bar renders per ingredient
  - Wide zone ingredients (перец) show full/wide bar
  - Narrow zone ingredients (соль, разрыхлитель) show narrow bar
  - Zone label text is accurate

### Task 5 — Build variants and substitutions section
- **Type:** file-edit
- **Files:** `src/CookingVisualizer.jsx`
- **Action:** Below the matrix (or as a separate collapsible section), render form variants (if any) and substitution alternatives for each non-base ingredient. Variants show as small labeled chips (e.g., "Свежий", "Сушёный/порошок", "Шалот"). Substitutions show as cards with name, description, and usage note. Omission viability is listed when applicable (e.g., "Пропуск возможен: да, но вкус станет плоским").
- **Verify:** All variants from ingredient-roles.md are listed per ingredient. Substitution cards match reference data. Omission notes present where ingredient-roles.md specifies them.
- **Acceptance criteria:**
  - Form variant chips render per ingredient (where applicable)
  - Substitution cards with name/description/note render for all non-base ingredients
  - Omission viability text matches ingredient-roles.md
  - "Варианты и замены" section header present on each expanded card

### Task 6 — Add "Развернуть все / Свернуть все" toggle
- **Type:** file-edit
- **Files:** `src/CookingVisualizer.jsx`
- **Action:** Add a panel-level toggle at the top of IngredientPanel: "Развернуть все" / "Свернуть все". Clicking expands or collapses all ingredient cards' matrix sections simultaneously. State is managed at the panel level.
- **Verify:** Clicking "Развернуть все" expands every card's matrix. Clicking "Свернуть все" collapses all. Toggle label changes to reflect current state.
- **Acceptance criteria:**
  - Panel-level expand/collapse toggle works on all cards
  - Label updates between "Развернуть все" and "Свернуть все"
  - Individual card toggles still work independently when panel toggle is used

## Verification

1. `INGREDIENTS` constant has all 11+ ingredients with complete 6-column matrix data
2. IngredientPanel renders all ingredient cards with correct necessity badges
3. 6-column matrix renders correctly when expanded (verdicts + consequences)
4. Tolerance zone visual bar renders per ingredient (width matches zone)
5. Form variants and substitution cards render for non-base ingredients
6. "Развернуть все / Свернуть все" toggle works at panel level
7. No API calls — all data from hardcoded INGREDIENTS constant
8. All text matches ingredient-roles.md reference verbatim

## Success Criteria

- [ ] Ingredient Analysis panel renders with all ingredients from reference
- [ ] 6-column matrix complete for every ingredient with verdicts and consequences
- [ ] Necessity tiers correctly assigned (ОСНОВА/ВАЖНО/УСЛОВНЫЙ)
- [ ] Tolerance zone visual bridge renders per ingredient
- [ ] Variants and substitutions section complete for non-base ingredients
- [ ] Expand/collapse works at both card and panel level
- [ ] All data hardcoded — zero network requests
