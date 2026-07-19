---
phase: 3
plan: "02-animations-transitions"
type: execute
wave: 1
depends_on: "01-responsive-mobile-layout"
files_modified:
  - "src/CookingVisualizer.jsx"
autonomous: true
requirements:
  - "VIZ-01"
---

# Plan 02: Animations & Transitions

## Objective

Add smooth animations to tab switching, card expand/collapse, and modal open/close.

## Tasks

### Task 1 — Tab content fade transition
- **Type:** file-edit
- **Files:** `src/CookingVisualizer.jsx`
- **Action:** Wrap panel content in fade: outgoing fades out 150ms, incoming fades in. Use transition key state.
- **Verify:** Smooth cross-fade, no layout jump, no flicker.
- **Acceptance criteria:** Tab switch feels smooth, 150ms transition.

### Task 2 — Card expand/collapse animation
- **Type:** file-edit
- **Files:** `src/CookingVisualizer.jsx`
- **Action:** Replace instant show/hide with CSS max-height transition (0→2000px, 0.3s ease). Apply to IngredientPanel rows and ActionStepsPanel step cards.
- **Verify:** Smooth vertical slide, no content clipping.
- **Acceptance criteria:** Expand/collapse animated, 0.3s duration.

### Task 3 — Modal open/close animation
- **Type:** file-edit
- **Files:** `src/CookingVisualizer.jsx`
- **Action:** Add fade+scale animation to EquipmentSettingsPanel and verification report modal: opacity 0→1, transform scale(0.95→1), 200ms. Backdrop fade 0→0.6 opacity.
- **Verify:** Modals animate in/out smoothly.
- **Acceptance criteria:** Modal enter/exit animated, backdrop fades.

### Task 4 — Verification badge pulse
- **Type:** file-edit
- **Files:** `src/CookingVisualizer.jsx`
- **Action:** When verification status changes from green to amber/red, badge gets a single pulse animation (scale 1→1.1→1, 300ms).
- **Verify:** Pulse triggers on status change only.
- **Acceptance criteria:** Single pulse on status degradation.

## Verification

1. Tab switch: smooth fade, no flicker
2. Card expand/collapse: animated slide
3. Modal: animated enter/exit with backdrop
4. Badge pulse on status change
5. Animations respect `prefers-reduced-motion`

## Success Criteria

- [ ] Tab transitions smooth (150ms fade)
- [ ] Expand/collapse animated (0.3s slide)
- [ ] Modals animate in/out (200ms)
- [ ] Reduced-motion media query respected
