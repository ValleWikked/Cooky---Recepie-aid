---
phase: 3
plan: "01-responsive-mobile-layout"
type: execute
wave: 0
depends_on: ""
files_modified:
  - "src/CookingVisualizer.jsx"
autonomous: true
requirements:
  - "VIZ-01"
  - "VIZ-05"
---

# Plan 01: Responsive / Mobile Layout

## Objective

Adapt the desktop-first layout to work on mobile screens down to 320px. No horizontal page scroll at any breakpoint.

## Tasks

### Task 1 — Add responsive breakpoint hook
- **Type:** file-edit
- **Files:** `src/CookingVisualizer.jsx`
- **Action:** Add `useWindowWidth()` hook returning `'mobile'` (≤600px), `'tablet'` (601–900px), `'desktop'` (>900px). Uses `matchMedia` with debounce.
- **Verify:** Hook returns correct breakpoint; no render storms on resize.
- **Acceptance criteria:** Three breakpoints work; consistent across resizes.

### Task 2 — Adapt 6-column matrix for mobile
- **Type:** file-edit
- **Files:** `src/CookingVisualizer.jsx`
- **Action:** On mobile, matrix becomes horizontally scrollable (`overflow-x: auto`). Column headers abbreviate. Cell `minWidth` reduces to 60px.
- **Verify:** Matrix scrolls internally at 375px; no page-level horizontal scroll.
- **Acceptance criteria:** Matrix usable at 320px width.

### Task 3 — Adapt card layouts for mobile
- **Type:** file-edit
- **Files:** `src/CookingVisualizer.jsx`
- **Action:** Reduce padding (16→12px), flexWrap chips, stack calibration inputs vertically, modals at 95% width, font sizes reduce 1–2px.
- **Verify:** All elements touchable at 375px.
- **Acceptance criteria:** No horizontal scroll; modals dismissible.

### Task 4 — Tab bar touch-sizing
- **Type:** file-edit
- **Files:** `src/CookingVisualizer.jsx`
- **Action:** Tab buttons → `minHeight: 44px`, larger padding. Gear icon also 44×44px.
- **Verify:** All interactive targets ≥44px on mobile.
- **Acceptance criteria:** WCAG touch target compliance.

### Task 5 — Font scaling
- **Type:** file-edit
- **Files:** `src/CookingVisualizer.jsx`
- **Action:** Mobile headings 1.25→1.1rem, body 0.9→0.8rem. Form inputs stay ≥16px.
- **Verify:** Readable without zoom; inputs ≥16px.
- **Acceptance criteria:** No iOS zoom trigger on input focus.

## Verification

1. Test at 320px, 375px, 768px, 1024px, 1920px
2. No horizontal page scroll at any width
3. Matrix scrolls internally on mobile
4. All touch targets ≥44px
5. Modals functional at all widths
6. Font sizes readable without zoom

## Success Criteria

- [ ] Responsive from 320px to 1920px
- [ ] No horizontal page scroll
- [ ] Matrix scrolls internally on mobile
- [ ] WCAG touch target compliance
- [ ] iOS input zoom prevented
