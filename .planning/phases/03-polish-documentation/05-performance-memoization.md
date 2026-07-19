---
phase: 3
plan: "05-performance-memoization"
type: execute
wave: 2
depends_on: "02-animations-transitions"
files_modified:
  - "src/CookingVisualizer.jsx"
autonomous: true
requirements:
  - "VIZ-01"
---

# Plan 05: Performance — Memoization

## Objective

Apply React.memo, useMemo, and useCallback to prevent unnecessary re-renders in the 2182-line component tree.

## Tasks

### Task 1 — Memoize IngredientPanel sub-components
- **Type:** file-edit
- **Files:** `src/CookingVisualizer.jsx`
- **Action:** Extract individual ingredient card into `IngredientCard` wrapped in `React.memo`. Memoize the expanded matrix rendering. Use `useCallback` for toggle handlers.
- **Verify:** Expanding one card doesn't re-render other cards.
- **Acceptance criteria:** Independent card renders, no full-list re-render on single toggle.

### Task 2 — Memoize ActionStepsPanel step cards
- **Type:** file-edit
- **Files:** `src/CookingVisualizer.jsx`
- **Action:** Extract step card into `StepCard` wrapped in `React.memo`. Memoize calibration form. Use `useCallback` for toggle handlers.
- **Verify:** Expanding one step doesn't re-render other steps.
- **Acceptance criteria:** Independent step renders.

### Task 3 — Memoize heavy computations
- **Type:** file-edit
- **Files:** `src/CookingVisualizer.jsx`
- **Action:** Wrap `runAccuracyVerification` result in `useMemo` (already done — verify). Memoize equipment-to-step mapping computation. Memoize calibration coverage count.
- **Verify:** These computations don't re-run on unrelated state changes.
- **Acceptance criteria:** Heavy computations only re-run when dependencies change.

### Task 4 — useCallback for event handlers
- **Type:** file-edit
- **Files:** `src/CookingVisualizer.jsx`
- **Action:** Wrap all event handlers passed as props (`onTabChange`, `onOpenSettings`, `toggleCard`, `toggleStep`, `toggleAll`, `onSaveCalibration`, etc.) in `useCallback` with correct dependency arrays.
- **Verify:** No new function references created on every render.
- **Acceptance criteria:** Stable callback references across renders.

## Verification

1. React DevTools Profiler: no unnecessary re-renders on toggle
2. Expanding one card doesn't re-render other cards
3. Calibration save doesn't re-render ingredient panel
4. Tab switch doesn't re-run verification (already memoized)

## Success Criteria

- [ ] Card toggles don't cascade re-renders
- [ ] Heavy computations memoized
- [ ] Event handler references stable
- [ ] Profiler confirms performance improvement
