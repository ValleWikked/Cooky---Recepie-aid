# Summary: 03-action-steps-panel

**Phase:** 1 — Core Visualization Engine
**Plan:** 03-action-steps-panel
**Wave:** 2
**Status:** Complete

## What Was Built

Implemented the full Step-by-Step Action Steps panel (Panel 2) in `src/CookingVisualizer.jsx`:

1. **STEPS data constant** — Hardcoded array of 10 chronological steps for a falafel recipe: Замачивание нута, Слив и просушка, Измельчение в комбайне, Добавление специй, Тест на влажность, Формовка, Разогрев аэрофритюрницы, Жарка (первая сторона), Переворот и дожарка, Отдых перед подачей.

2. **ActionStepsPanel component** — Vertical timeline of step cards with:
   - Numbered gold circle badges on each step
   - Equipment chips mapped to EQUIPMENT constants (Kenwood FDP22, Ninja MAX PRO)
   - Time/temperature chips with accuracy tier tags (~ amber tilde, ? red question mark)
   - **No ✓ tag on verified values** — per SKILL.md line 174: "No tag for verified durations"
   - Accuracy legend at panel top explaining the convention

3. **Detail blocks per step:**
   - "Готовность" (green border, check icon) — sensory cues for determining when each step is complete
   - "Если пропустить" (red border, warning icon) — specific consequences of skipping each step
   - "Калибровка" (amber border, info icon) — calibration instructions on all air fryer (Ninja MAX PRO) steps

4. **"Важно" summary block** — Gold-bordered card at panel top explaining the 3-tier accuracy system.

5. **Panel-level toggle** — "Развернуть все / Свернуть все" controls all step detail blocks.

## Verification

- [x] 10 steps in chronological order with numbered badges
- [x] Equipment mapping: steps 3→KenwoodFDP22, steps 7-9→NinjaMAXPRO
- [x] ~ tags on estimated values (30-45 сек, 10-15 мин, 12-14 мин, 5-7 мин)
- [x] ? tag on empirical value (Тест на влажность: 2-3 мин)
- [x] No ✓ tags — verified values display clean without badge
- [x] Accuracy legend explains "нет метки = проверено"
- [x] "Готовность" blocks with green border on all steps
- [x] "Если пропустить" blocks with red border on all steps
- [x] Calibration instructions on all Ninja MAX PRO steps (3 steps)
- [x] "Важно" summary at panel top
- [x] Kenwood displayed as 2.1 L

## Commits

- `6c6e1be` feat(02+03): implement full IngredientPanel and ActionStepsPanel
