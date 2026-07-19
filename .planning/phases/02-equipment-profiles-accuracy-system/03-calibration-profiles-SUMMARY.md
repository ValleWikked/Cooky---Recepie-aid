# Plan 03: Calibration Profiles — Summary

## Status: COMPLETED

All four tasks implemented in a single file (`src/CookingVisualizer.jsx`).

## Changes

### Task 1 — CalibrationStore
- Added `CalibrationStore` object after `EquipmentProfiles` (line ~192)
- Persists to `localStorage` under key `cookingviz_calibrations`
- Records keyed by `{equipmentId}::{stepId}`
- Each record: `equipmentId`, `stepId`, `optimalTime`, `optimalTemp`, `notes`, `calibratedAt`
- Provides: `get()`, `set()`, `getAll()`, `clear()`
- Falls back to empty object on corrupt/missing data

### Task 2 — Calibration UI on air fryer step cards
- Added "📝 Моя калибровка" section to expanded air fryer step cards (below the existing calibration note)
- No calibration saved: shows input fields (optimal time, optimal temperature, notes) + "💾 Сохранить" button
- Calibration saved: shows saved values, calibrated date, "✏️ Редактировать" and "Сбросить" buttons
- Edit mode re-shows form with pre-filled values; save updates the record
- Form state managed via component-level `calFormState` to comply with React hooks rules

### Task 3 — Equipment-to-step mapping table
- Added "📋 Карта оборудования" toggle button at bottom of `ActionStepsPanel`
- When expanded, shows a table with columns: Оборудование, Этапы, Калибровка
- Equipment rows show: equipment name (icon + name), linked step numbers/titles, calibration status (— / N/M)
- "Все шаги" row shows equipment-less steps
- Clicking a step link expands the step card and scrolls to it (`scrollIntoView`)
- Step cards now have `id={`step-card-${step.id}`}` for scroll targeting

### Task 4 — Calibration coverage badge
- Added "📝 N/M откалибровано" badge in `ActionStepsPanel` header (next to the title)
- N = number of calibrated air fryer steps, M = total calibratable air fryer steps
- Green badge (+ checkmark) when all calibrated; amber badge when partial
- Updates in real-time on save/clear via `refreshCalibrations()` state trigger

## File Modified
- `src/CookingVisualizer.jsx` (+380 lines)

## Verification Notes
- All changes are contained in a single file as required
- CalibrationStore follows the same pattern as EquipmentProfiles
- React hooks rules respected (no hooks inside loops/conditions)
- Step card `id` attributes enable scroll-to navigation
