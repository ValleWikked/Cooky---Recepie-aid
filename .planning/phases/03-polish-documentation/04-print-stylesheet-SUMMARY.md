# Plan 04: Print Stylesheet — Summary

## Objective

Add `@media print` styles so recipe cards print cleanly on white paper without dark backgrounds, interactive chrome, or hidden collapsed content.

## Implementation

### File changed: `src/CookingVisualizer.jsx`

1. **Added `PRINT_CSS` constant** (lines 898–980) — a template-literal string containing a single `@media print` block injected via a `<style id="cookingviz-print">` tag.

2. **Added `useEffect` in `App`** (lines 2543–2550) — injects the print stylesheet once on mount, same pattern as the existing animation-CSS injection.

3. **Print stylesheet rules:**

   - **White background, black text** — brute-force override on all common elements (`body, #root, div, span, p, h1-h6, td, th`) with `!important` to overcome inline dark-theme colors.
   - **Thin gray borders** — `border-color: #ccc !important` on `div, table, th, td`.
   - **Hide interactive chrome** — `.cv-animated > div:first-child` hides the header row (TabBar + gear button).
   - **Hide all buttons** — `button { display: none !important }` removes expand/collapse toggles and gear.
   - **Hide modals/overlays** — `div[style*="position: fixed"]` + z-index selectors hide EquipmentSettingsPanel and verification report modals.
   - **Show all collapsed content** — `div[style*="max-height"]` gets `max-height: none !important; overflow: visible !important; opacity: 1 !important`.
   - **Matrix full width** — `div[style*="overflow-x: auto/auto"]` overflows visible, max-width 100%.
   - **Print header** — `body::before` renders "Cooking Visualizer — Разбор рецепта" centered, 18pt, bold, with a bottom border.
   - **Font-size** — base 11pt, headings 14pt.
   - **Animations off** — `* { animation: none !important; transition: none !important; }`.

## Verification

1. ✅ Print preview: white background, black text (all elements force-overridden)
2. ✅ All cards expanded in print (max-height/overflow/opacity overrides)
3. ✅ No interactive chrome (first-child header row hidden, all buttons hidden, fixed-position modals hidden)
4. ✅ Print header present (body::before with title)
5. ✅ Matrix fits page width (overflow-x auto containers made visible)

## Success Criteria

- [x] Clean print output on white background
- [x] All content visible (no collapsed sections)
- [x] Interactive elements hidden
- [x] Print header with title
