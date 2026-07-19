# 02-accuracy-verifier — SUMMARY

## What was built

The 9-rule accuracy verification engine was implemented entirely in `src/CookingVisualizer.jsx`:

1. **ACCURACY_RULES array** — 9 rule objects (R1–R9) each with `id`, `name`, `description`, `severity` (error/warning/info), and `check(step)` predicate returning `{ pass, message }`.

2. **runAccuracyVerification(steps)** — iterates all STEPS × all RULES, produces a categorized report with `totalSteps`, `totalRules`, `checksRun`, `passed`, plus `errors[]`, `warnings[]`, `infos[]` arrays.

3. **Status badge** — `✅ Всё проверено` / `⚠ N предупреждений` / `❌ N ошибок` button next to the ActionStepsPanel header. Color-coded green/amber/red.

4. **Verification report modal** — full modal with summary counts, overall status banner, error/warning/info categorized lists with step references and rule names. Info section collapsed by default (`<details>`).

5. **Equipment profile integration** — R5 validates equipment references against the live EquipmentProfiles store; R6 checks calibration for estimated+airfryer combos; R9 checks Kenwood bowl capacity.

## Rules summary

| Rule | Name | Severity | What it checks |
|------|------|----------|---------------|
| R1 | AccuracyRequired | error | duration/temperature must have `accuracy` field |
| R2 | EstimatedTag | warning | estimated values validated against `~` badge |
| R3 | EmpiricalTag | error | empirical values validated against `?` badge |
| R4 | VerifiedNoTag | info | verified values need no uncertainty badge |
| R5 | EquipmentRequired | error | temperature → equipment must exist in profile store |
| R6 | CalibrationRequired | error | estimated + airfryer → calibration must be non-null |
| R7 | DoneWhenRequired | error | every step must have non-empty `doneWhen` |
| R8 | IfSkippedRequired | error | every step must have non-empty `ifSkipped` |
| R9 | KenwoodBowl | error | Kenwood FDP22 bowl capacity must be "2.1 L" not "1.5 L" |

## Verification result

With current STEPS data, all 90 checks (10 steps × 9 rules) pass — the badge shows ✅ green "Всё проверено".

## Files modified

- `src/CookingVisualizer.jsx` — +395 lines (1408 → 1803): ACCURACY_RULES, runAccuracyVerification, status badge, verification modal, App wiring
