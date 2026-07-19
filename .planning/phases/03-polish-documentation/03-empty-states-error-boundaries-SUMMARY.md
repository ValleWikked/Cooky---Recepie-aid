# Summary: 03-empty-states-error-boundaries

## What was done

Added a React ErrorBoundary class component, empty-state fallbacks for all data-driven panels (ingredients, steps, equipment profiles), and localStorage corruption handling with user-visible toast notifications.

## Changes

### 1. ErrorBoundary class component (`src/CookingVisualizer.jsx`)
- `class ErrorBoundary extends React.Component` added after the `useReducedMotion` hook
- `getDerivedStateFromError` / `componentDidCatch` lifecycle methods
- Fallback UI: dark card with "⚠ Что-то пошло не так" message and "Обновить" button calling `window.location.reload()`
- Error boundary wraps the entire App return tree

### 2. Toast notification system (`src/CookingVisualizer.jsx`)
- Module-level `let _showToast = null` dispatcher set by App's `useEffect` on mount
- `Toast` functional component: fixed-position notification at bottom-center, auto-dismisses after 4s
- Styled with THEME tokens, fade-in animation

### 3. Empty state for ingredient panel (`src/CookingVisualizer.jsx`)
- When `INGREDIENTS.length === 0`: renders "Нет данных об ингредиентах" inside a styled card with 📋 icon
- Uses ternary wrapping `INGREDIENTS.map(...)` for graceful fallback

### 4. Empty state for steps panel (`src/CookingVisualizer.jsx`)
- When `STEPS.length === 0`: renders "Нет данных о шагах приготовления" inside a styled card with 📝 icon
- Uses ternary wrapping `STEPS.map(...)`

### 5. Empty state for equipment profiles (`src/CookingVisualizer.jsx`)
- When `profiles.length === 0` in EquipmentSettingsPanel: renders "Нет устройств. Добавьте первое устройство." with 🔌 icon
- Includes a prominent "＋ Добавить устройство" button that opens the add form directly
- Uses ternary wrapping `profiles.map(...)`

### 6. localStorage corruption handling (`src/CookingVisualizer.jsx`)
- `EquipmentProfiles._init()` catch block: calls `_showToast?.('Данные оборудования повреждены. Настройки сброшены.')` then resets to defaults
- `CalibrationStore._init()` catch block: calls `_showToast?.('Данные калибровок повреждены. Настройки сброшены.')` then resets to empty object
- Both storage modules already had functional try/catch; only the toast notification was added

## Files modified

- `src/CookingVisualizer.jsx` — all changes in single file (new: ErrorBoundary class, Toast component, `_showToast` global, empty-state ternaries, corruption toast calls, App wrapper)

## Verification notes

- Error boundary uses React class component lifecycle (`getDerivedStateFromError` + `componentDidCatch`) — standard React error boundary pattern
- Empty state ternaries preserve original map logic; falsy branch only renders when data arrays are empty (defensive)
- Toast uses `useEffect` cleanup to clear timer on unmount — no memory leaks
- `_showToast` is set to `null` in App's `useEffect` cleanup — safe against stale closures
