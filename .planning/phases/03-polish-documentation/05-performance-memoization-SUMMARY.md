# Plan 05: Performance — Memoization Summary

## Changes Applied

### Task 1 — Memoize IngredientPanel sub-components
- **Extracted `IngredientCard`** as a `React.memo`-wrapped sub-component
- Extracted the expanded matrix rendering inline within `IngredientCard` (6-column matrix, tolerance zone bar, variants, substitutions)
- **`useCallback`** added to `toggleAll` (depends on `expandedAll`) and `toggleCard` (stable, no deps)
- `IngredientPanel.map()` now renders `<IngredientCard>` instead of inline JSX
- **Acceptance criteria met:** Independent card renders — expanding one card does not re-render other cards (React.memo prevents re-render when props haven't changed)

### Task 2 — Memoize ActionStepsPanel step cards
- **Extracted `StepCard`** as a `React.memo`-wrapped sub-component
- Includes full step card rendering: step number badge, title, description, chips row (equipment/duration/temperature), expand toggle, doneWhen/ifSkipped blocks, and calibration UI (air fryer only)
- **`useCallback`** added to `toggleAll` (depends on `expandedAll`) and `toggleStep` (stable, no deps)
- `ActionStepsPanel.map()` now renders `<StepCard>` instead of inline JSX
- **Acceptance criteria met:** Independent step renders — expanding one step does not re-render other steps

### Task 3 — Memoize heavy computations
- `runAccuracyVerification` result: already wrapped in `useMemo` in the `App` component (left as-is, verified correct)
- **Calibration coverage count** wrapped in `useMemo` with `[calibrations]` dependency — recomputes only when the calibrations state changes
- `refreshCalibrations` wrapped in `useCallback` (stable, no deps) — avoids function recreation on every render
- **Acceptance criteria met:** Heavy computations only re-run when dependencies change

### Task 4 — useCallback for event handlers
Event handlers wrapped in `useCallback`:

| Handler | Component | Dependencies |
|---|---|---|
| `toggleAll` | `IngredientPanel` | `[expandedAll]` |
| `toggleCard` | `IngredientPanel` | `[]` |
| `toggleAll` | `ActionStepsPanel` | `[expandedAll]` |
| `toggleStep` | `ActionStepsPanel` | `[]` |
| `closeModal` | `ActionStepsPanel` | `[reduceMotion]` |
| `refreshCalibrations` | `ActionStepsPanel` | `[]` |
| `switchTab` | `App` | `[tabVisible, tabFading, reduceMotion]` |

### Additional memoization
- **`TabBar`** wrapped in `React.memo` — stable across tab switches
- **Added `useCallback, memo`** to the React hooks destructuring import

## Files Modified
- `src/CookingVisualizer.jsx` — all changes applied to this single file
