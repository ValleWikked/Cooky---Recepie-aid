# Summary: 02-ingredient-panel

**Phase:** 1 — Core Visualization Engine
**Plan:** 02-ingredient-panel
**Wave:** 1
**Status:** Complete

## What Was Built

Implemented the full Ingredient Analysis panel (Panel 1) in `src/CookingVisualizer.jsx`:

1. **INGREDIENTS data constant** — Hardcoded array of 10 ingredients from ingredient-roles.md reference: Нут, Лук, Чеснок, Петрушка, Кумин, Кориандр, Соль, Чёрный перец, Разрыхлитель, Мука. Each entry includes: 4 necessity tiers (ОСНОВА, ВАЖНО, ОПЦИОНАЛЬНО, УСЛОВНЫЙ), amount, role, 6-column matrix with verdicts and consequences, tolerance zone type, form variants, and substitution alternatives.

2. **IngredientPanel component** — Scrollable list of ingredient cards with:
   - Necessity tier badges (gold/amber/blue/dim)
   - Collapsible matrix toggle per card
   - 6-column horizontal scrollable matrix with 1× column highlighted in gold
   - `?` tag on empirically-determined quantities (мука)
   - Tolerance zone visual bar (green fill width proportional to zone)
   - Form variant chips with quantity labels
   - Substitution cards with name, description, and usage note
   - Omission viability noted where applicable

3. **Panel-level toggle** — "Развернуть все / Свернуть все" controls all cards simultaneously. Individual toggles remain independent.

## Verification

- [x] 10 ingredients with complete 6-column matrix data
- [x] 4 necessity tiers (ОСНОВА, ВАЖНО, ОПЦИОНАЛЬНО, УСЛОВНЫЙ)
- [x] Matrix renders with gold-highlighted 1× column
- [x] Tolerance zone bars match zone type (narrow/wide)
- [x] Variants and substitutions render per ingredient
- [x] "Развернуть все / Свернуть все" toggle functional
- [x] All data hardcoded — zero network requests
- [x] Empirical flag (?) on мука at 1×

## Commits

- `6c6e1be` feat(02+03): implement full IngredientPanel and ActionStepsPanel
