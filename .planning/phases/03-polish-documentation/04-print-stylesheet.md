---
phase: 3
plan: "04-print-stylesheet"
type: execute
wave: 2
depends_on: "02-animations-transitions"
files_modified:
  - "src/CookingVisualizer.jsx"
autonomous: true
requirements:
  - "VIZ-01"
---

# Plan 04: Print Stylesheet

## Objective

Add print media styles so recipe cards print cleanly on paper without dark backgrounds, animations, or interactive chrome.

## Tasks

### Task 1 — Inject print style tag
- **Type:** file-edit
- **Files:** `src/CookingVisualizer.jsx`
- **Action:** Add a `useEffect` in App that injects a `<style id="cookingviz-print">` tag with `@media print` rules: white background, black text, hide tab bar, hide expand/collapse toggles (show all content), hide settings gear, hide calibration forms, hide modals, card borders become thin gray, matrix renders full width, font-size 11pt.
- **Verify:** Print preview shows clean layout with all content visible.
- **Acceptance criteria:** Print output is readable, no dark backgrounds.

### Task 2 — Ensure all content visible in print
- **Type:** file-edit
- **Files:** `src/CookingVisualizer.jsx`
- **Action:** `@media print` overrides: all collapsed content becomes visible (`max-height: none !important; overflow: visible !important`), `display: none` removed from collapsed sections, opacity forced to 1.
- **Verify:** All matrix rows and step details visible in print.
- **Acceptance criteria:** No hidden content in print.

### Task 3 — Print-only recipe header
- **Type:** file-edit
- **Files:** `src/CookingVisualizer.jsx`
- **Action:** Add a print-only header via `@media print`: "Cooking Visualizer — Разбор рецепта" title + print date. Hidden on screen.
- **Verify:** Print preview shows header.
- **Acceptance criteria:** Print header present, not visible on screen.

## Verification

1. Print preview: white background, black text
2. All cards expanded in print
3. No interactive chrome (tabs, toggles, gear)
4. Print header visible
5. Matrix fits page width

## Success Criteria

- [ ] Clean print output on white background
- [ ] All content visible (no collapsed sections)
- [ ] Interactive elements hidden
- [ ] Print header with title and date
