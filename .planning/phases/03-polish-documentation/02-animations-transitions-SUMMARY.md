# Phase 3, Plan 02 — Animations & Transitions

## What was done

Added four animation categories to `src/CookingVisualizer.jsx` with `prefers-reduced-motion` support:

1. **Tab content fade (150ms)** — Tab switching now cross-fades between panels using CSS `@keyframes cv-fade-in` / `cv-fade-out`. The `App` component manages `tabFading` state with a 150ms timeout to swap content mid-fade.

2. **Card expand/collapse slide (0.3s)** — Both `IngredientPanel` and `ActionStepsPanel` replaced `{isExpanded && (…)}` conditional rendering with a wrapper div using `max-height: 0 ↔ 2000px`, `opacity: 0 ↔ 1`, and `overflow: hidden` with a 0.3s CSS transition.

3. **Modal fade+scale (200ms)** — Both `EquipmentSettingsPanel` and the verification report modal use `@keyframes cv-modal-enter` (fade in + scale 0.95→1) and `cv-modal-exit`. Backdrops use `cv-backdrop-enter`/`cv-backdrop-exit`. A `closing`/`modalClosing` state delays the actual unmount until the exit animation completes.

4. **Verification badge pulse (300ms)** — A `useRef` tracks the previous badge status (green/amber/red). When degradation is detected (green→amber, green→red, amber→red), a single `cv-badge-pulse` keyframe animation (scale 1→1.15→1) fires on the badge button.

**Reduced-motion**: A `useReducedMotion()` hook listens to `(prefers-reduced-motion: reduce)` via `matchMedia`. All animations are gated: when reduced motion is preferred, durations drop to 0.01ms and timeouts fire immediately (0ms). Additionally, the injected CSS uses `.cv-animated` class with a `@media (prefers-reduced-motion)` override.

## Files changed

- `src/CookingVisualizer.jsx` — added ANIMATION_CSS constant, useReducedMotion hook, tab fade in App, expand/collapse transitions in panels, modal enter/exit animations, badge pulse logic
