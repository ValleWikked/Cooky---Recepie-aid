# Cooking Visualizer — Interactive Recipe Analysis

A single-page React application for detailed cooking recipe analysis. Two main sections: an **ingredient panel** with a 6-column quantity matrix and a **cooking steps panel** with a three-tier accuracy system.

## Features

### Panel 1 — Ingredient Analysis

- **Necessity levels**: BASE, IMPORTANT, OPTIONAL, CONDITIONAL
- **6-column quantity matrix**: 0 | ½× | ¾× | 1× | ⁵⁄₄× | 3/2×
- **Tolerance zones**: visual indicator of acceptable range width per ingredient
- **Form variants**: different physical forms of the same ingredient with conversion ratios
- **Substitutions**: alternative ingredients with honest assessment of trade-offs

### Panel 2 — Cooking Steps

- **10 steps** of falafel preparation with chronological structure
- **Three-tier accuracy system**:
  - ✓ VERIFIED — no tag: physically or chemically established, or from manufacturer spec
  - ~ ESTIMATED — depends on size, moisture, and other variables
  - ? EMPIRICAL — requires user testing under specific conditions
- **Calibration**: save optimal parameters for each air fryer step
- **Verification**: automated checking of 9 accuracy rules
- **Equipment map**: summary table of steps by device

### Equipment Profiles

- **5 built-in profiles**: Ninja MAX PRO (air fryer), Kenwood FDP22.130GY (food processor, 2.1 L bowl), Panasonic SD-YR2550 (bread maker), OZAVO (sandwich maker), Cecotec (blender)
- Add, edit, and remove custom devices
- localStorage persistence

### Additional

- **Responsive design**: mobile (≤600px), tablet (≤900px), desktop
- **Reduced-motion support**: disables animations when `prefers-reduced-motion: reduce`
- **Print styles**: hide interactive elements, white background
- **Toast notifications**: on localStorage data corruption
- **ErrorBoundary**: prevents white screen on render errors

## Architecture

- **Single file**: `src/CookingVisualizer.jsx` (~2680 lines)
- **Data model**: hardcoded `INGREDIENTS` (9 entries) and `STEPS` (10 steps) arrays
- **localStorage stores**:
  - `cookingviz_equipment` — equipment profiles
  - `cookingviz_calibrations` — calibration records (equipmentId::stepId)
- **Theme**: 14 color tokens in `THEME` (warm kitchen palette)
- **Styles**: CSS-in-JS via `STYLES` object

## Usage

1. Open `index.html` in a browser
2. Switch between **Ingredients** and **Cooking Steps** tabs
3. Expand ingredient cards to view the matrix and substitutions
4. Expand step cards for details and calibration
5. Use the ⚙️ icon to configure equipment
6. Click the verification indicator to view the audit report

## Requirements

- **Browser**: any modern browser (Chrome, Firefox, Safari, Edge)
- **React**: loaded via CDN (UMD build)
- **Dependencies**: none (React only via script tag)
- **Units**: metric only (g, ml, °C)

## Visualizer Requirements

| Code | Description |
|------|-------------|
| VIZ-01 | Two panels: ingredients and steps |
| VIZ-02 | 6-column quantity matrix with verdicts |
| VIZ-03 | Three-tier accuracy system (~, ?, no tag) |
| VIZ-04 | Equipment profiles with calibration |
| VIZ-05 | Verification of 9 accuracy rules |
| VIZ-06 | Responsive design, print, reduced-motion |

## License

Internal project. All rights reserved.

## Testing

### Install

```bash
npm install
npx playwright install
```

### Run E2E tests locally

```bash
# Headless (all browsers)
npm run test:e2e

# Playwright UI mode
npm run test:e2e:ui

# Headed mode (visible browser window)
npm run test:e2e:headed
```

Tests are located under `tests/` and require Node.js ≥ 18.

### Covered scenarios

| File | Scenarios |
|------|-----------|
| `tests/smoke.spec.ts` | App loads, page title, Ingredients and Cooking Steps tabs visible, tab switching |
| `tests/persistence.spec.ts` | Equipment profile add/edit/delete, calibration save and reload persistence |
| `tests/localstorage-recovery.spec.ts` | App loads and shows toast when `cookingviz_equipment` or `cookingviz_calibrations` contains invalid JSON |
| `tests/responsive.spec.ts` | Tab visibility, tab switch, settings button reachability, no horizontal overflow at mobile (375 px), tablet (768 px), and desktop (1280 px) |

CI runs automatically on every push and pull request via `.github/workflows/playwright.yml`.  
The Playwright HTML report is uploaded as an artifact on failure.
