---
phase: 3
plan: "03-empty-states-error-boundaries"
type: execute
wave: 1
depends_on: "01-responsive-mobile-layout"
files_modified:
  - "src/CookingVisualizer.jsx"
autonomous: true
requirements:
  - "VIZ-01"
---

# Plan 03: Empty States & Error Boundaries

## Objective

Add graceful empty states and a React error boundary so the artifact never shows a white screen.

## Tasks

### Task 1 — Add ErrorBoundary component
- **Type:** file-edit
- **Files:** `src/CookingVisualizer.jsx`
- **Action:** Add class-based `ErrorBoundary` catching render errors. Fallback UI: dark card with "⚠ Что-то пошло не так" message and "Обновить" button calling `window.location.reload()`.
- **Verify:** Throwing in a child component shows fallback, not white screen.
- **Acceptance criteria:** Error boundary catches and displays fallback.

### Task 2 — Empty state for ingredient panel
- **Type:** file-edit
- **Files:** `src/CookingVisualizer.jsx`
- **Action:** If `INGREDIENTS` is empty (defensive), show "Нет данных об ингредиентах" with a placeholder card.
- **Verify:** Empty INGREDIENTS shows message, no crash.
- **Acceptance criteria:** Graceful empty state, no errors.

### Task 3 — Empty state for steps panel
- **Type:** file-edit
- **Files:** `src/CookingVisualizer.jsx`
- **Action:** If `STEPS` is empty, show "Нет данных о шагах приготовления" with placeholder.
- **Verify:** Empty STEPS shows message.
- **Acceptance criteria:** Graceful empty state.

### Task 4 — Empty state for equipment profiles
- **Type:** file-edit
- **Files:** `src/CookingVisualizer.jsx`
- **Action:** If EquipmentProfiles.getAll() returns empty, settings panel shows "Нет устройств. Добавьте первое устройство." with prominent add button.
- **Verify:** Clearing localStorage and opening settings shows empty state.
- **Acceptance criteria:** Empty equipment list shows add prompt.

### Task 5 — localStorage corruption handling
- **Type:** file-edit
- **Files:** `src/CookingVisualizer.jsx`
- **Action:** Wrap `JSON.parse` in try/catch for both `cookingviz_equipment` and `cookingviz_calibrations`. On parse failure, reset to defaults and show a one-time toast: "Данные оборудования повреждены. Настройки сброшены."
- **Verify:** Corrupt localStorage triggers reset + toast.
- **Acceptance criteria:** Corrupt data handled gracefully.

## Verification

1. Error boundary catches render errors
2. Empty INGREDIENTS/STEPS show messages
3. Empty equipment list shows add prompt
4. localStorage corruption triggers reset

## Success Criteria

- [ ] Error boundary prevents white screen
- [ ] All data arrays have empty-state fallbacks
- [ ] localStorage corruption handled gracefully
- [ ] No uncaught exceptions reach the user
