---
phase: 2
plan: "03-calibration-profiles"
type: execute
wave: 2
depends_on: "02-accuracy-verifier"
files_modified:
  - "src/CookingVisualizer.jsx"
autonomous: true
requirements:
  - "VIZ-03"
  - "VIZ-04"
---

# Plan 03: Calibration Profiles & Mapping Validation

## Objective

Build per-device calibration records so users can save their empirically-determined optimal times and temperatures. Add an equipment-to-step mapping validation view that shows which steps use which equipment. The calibration data persists in localStorage alongside equipment profiles.

## Tasks

### Task 1 — Build calibration data store
- **Type:** file-edit
- **Files:** `src/CookingVisualizer.jsx`
- **Action:** Add a `CalibrationStore` module that:
  - Stores calibration records keyed by `{equipmentId}-{stepId}` in `localStorage.getItem('cookingviz_calibrations')`
  - Each record: `{ equipmentId, stepId, optimalTime, optimalTemp, notes, calibratedAt }`
  - Provides `get(equipmentId, stepId)`, `set(equipmentId, stepId, data)`, `getAll()`, `clear()`
  - Falls back to empty object if no stored data
- **Verify:** Saving a calibration persists across page refresh. `getAll()` returns all stored calibrations. `clear()` removes all data.
- **Acceptance criteria:**
  - Calibration data persists in localStorage
  - Keyed by equipment-step pair
  - CRUD functions work correctly
  - Empty state handled gracefully

### Task 2 — Add calibration UI to air fryer step cards
- **Type:** file-edit
- **Files:** `src/CookingVisualizer.jsx`
- **Action:** In each air fryer step card (where `calibration` is non-null), add a "📝 Моя калибровка" section below the calibration note:
  - If no calibration saved: shows input fields for optimal time and temperature + "Сохранить" button
  - If calibration saved: shows the saved values with a "Редактировать" button
  - Saved calibration displays the `calibratedAt` date
  - A small "Сбросить" link clears the saved calibration
- **Verify:** Inputting and saving calibration data persists. Editing updates the record. Reset clears it. The saved data appears in the step card.
- **Acceptance criteria:**
  - Calibration inputs appear on all air fryer steps
  - Save persists to localStorage
  - Edit and reset functions work
  - Calibrated-at date displayed
  - Non-air-fryer steps don't show calibration UI

### Task 3 — Build equipment-to-step mapping view
- **Type:** file-edit
- **Files:** `src/CookingVisualizer.jsx`
- **Action:** Add a "📋 Карта оборудования" toggle at the bottom of ActionStepsPanel. When expanded, shows a table:
  - Equipment name (from profile store)
  - Steps using this equipment (with step numbers and titles)
  - Calibration status (has calibration / not calibrated)
  - A "Все шаги" row that shows equipment-less steps

  Clicking a step row scrolls to that step card in the panel.
- **Verify:** Table shows all equipment from profile store. Step counts match STEPS array. Calibration status reflects saved data. Clicking a step scrolls to it.
- **Acceptance criteria:**
  - Equipment-to-step mapping table renders
  - Step counts match actual data
  - Calibration status column accurate
  - Click-to-scroll functionality works
  - Equipment-less steps listed under "Все шаги"

### Task 4 — Add calibration summary badge
- **Type:** file-edit
- **Files:** `src/CookingVisualizer.jsx`
- **Action:** Add a small badge in the ActionStepsPanel header showing calibration coverage: "📝 N/M откалибровано" where N = calibrated steps, M = total calibratable steps (air fryer steps with calibration notes). If all air fryer steps are calibrated: green badge. Otherwise: amber badge with count.
- **Verify:** Badge updates when calibrations are saved or cleared. Count is accurate. Color coding works.
- **Acceptance criteria:**
  - Calibration coverage badge in panel header
  - Count: calibrated / total calibratable
  - Green when all calibrated, amber otherwise
  - Updates in real-time on save/clear

## Verification

1. Calibration store saves/loads/clears data correctly
2. Calibration UI appears on air fryer steps only
3. Saved calibrations persist across page refresh
4. Equipment-to-step mapping table shows accurate data
5. Click-to-scroll navigates to correct step
6. Calibration coverage badge shows accurate count
7. Badge color updates on calibration changes

## Success Criteria

- [ ] Calibration records persist in localStorage by equipment-step pair
- [ ] Air fryer steps show calibration input/saved values UI
- [ ] Equipment-to-step mapping table renders correctly
- [ ] Click-to-scroll navigation works in mapping table
- [ ] Calibration coverage badge tracks saved calibrations
- [ ] Non-air-fryer steps don't show calibration UI
- [ ] All data interoperates with equipment profiles from Plan 01
