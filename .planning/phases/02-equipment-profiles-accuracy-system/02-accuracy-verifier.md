---
phase: 2
plan: "02-accuracy-verifier"
type: execute
wave: 1
depends_on: "01-equipment-profiles"
files_modified:
  - "src/CookingVisualizer.jsx"
autonomous: true
requirements:
  - "VIZ-03"
---

# Plan 02: Accuracy Verification Engine

## Objective

Build an automated accuracy verification engine that audits every time and temperature value in the STEPS array against the SKILL.md Core Accuracy Rules. The verifier runs at app load and produces a report of violations. A verification status badge in the ActionStepsPanel header shows: ✅ All verified / ⚠ N issues / ❌ Blocking errors.

## Tasks

### Task 1 — Define Core Accuracy Rules as checkable predicates
- **Type:** file-edit
- **Files:** `src/CookingVisualizer.jsx`
- **Action:** Add an `ACCURACY_RULES` array of rule objects. Each rule has: `id`, `name`, `description`, `severity` (error/warning/info), and a `check(step)` predicate function. Rules:
  1. **R1-AccuracyRequired**: Every `duration` and `temperature` in every step MUST have an `accuracy` field. Severity: error.
  2. **R2-EstimatedTag**: If `accuracy: 'estimated'`, the value text MUST contain a `~` somewhere in the UI rendering path. Severity: warning.
  3. **R3-EmpiricalTag**: If `accuracy: 'empirical'`, the value text MUST contain a `?` somewhere in the UI rendering path. Severity: error.
  4. **R4-VerifiedNoTag**: If `accuracy: 'verified'`, there must be NO `~` or `?` badge in the rendered output for this value. Severity: info (authoring rule).
  5. **R5-EquipmentRequired**: If `temperature` exists and is not null, `equipment` must be specified (cannot have temperature without equipment). Severity: error.
  6. **R6-CalibrationRequired**: If `accuracy: 'estimated'` AND `equipment` is an air fryer type, `calibration` must be non-null. Severity: error.
  7. **R7-DoneWhenRequired**: Every step must have a non-empty `doneWhen` field. Severity: error.
  8. **R8-IfSkippedRequired**: Every step must have a non-empty `ifSkipped` field. Severity: error.
  9. **R9-KenwoodBowl**: Any reference to Kenwood FDP22 bowl capacity must be "2.1 L", not "1.5 L". Severity: error.
- **Verify:** All 9 rules are defined. Each rule has a valid `check` function that accepts a step object and returns `{ pass: boolean, message?: string }`. Rules are enumerated and documented.
- **Acceptance criteria:**
  - 9 rules defined with id, name, severity, and check function
  - Error rules: R1, R3, R5, R6, R7, R8, R9
  - Warning rules: R2
  - Info rules: R4

### Task 2 — Build the verifier engine
- **Type:** file-edit
- **Files:** `src/CookingVisualizer.jsx`
- **Action:** Add a `runAccuracyVerification(steps)` function that iterates all STEPS, runs every rule against every step, and collects results into a report:
  ```js
  {
    totalSteps: number,
    totalRules: number,
    checksRun: number,
    passed: number,
    errors: [{ rule, stepId, stepTitle, message }],
    warnings: [{ rule, stepId, stepTitle, message }],
    infos: [{ rule, stepId, stepTitle, message }],
  }
  ```
  The verifier runs once on app mount via `useMemo` and the report is stored in state.
- **Verify:** Running the verifier on the current STEPS array returns a report with zero errors (all Phase 1 data should pass). Introducing a deliberate violation (e.g., removing accuracy from a step) produces the expected error.
- **Acceptance criteria:**
  - Verifier runs on app mount
  - Report contains counts and categorized violations
  - Current STEPS data passes all 9 rules
  - Deliberate violations are caught

### Task 3 — Add verification status badge to ActionStepsPanel
- **Type:** file-edit
- **Files:** `src/CookingVisualizer.jsx`
- **Action:** Add a status badge next to the "Этапы приготовления" panel header:
  - ✅ "Все проверки пройдены" (green) — 0 errors, 0 warnings
  - ⚠ "N предупреждений" (amber) — 0 errors, N warnings
  - ❌ "N ошибок" (red) — N errors

  Clicking the badge opens a verification report modal showing:
  - Summary counts (steps, rules, checks, passed)
  - Error list with step number, rule name, and violation message
  - Warning list
  - Info list (collapsed by default)
- **Verify:** Badge shows correct status based on report. Modal opens with categorized violation lists. Current data shows ✅ green badge.
- **Acceptance criteria:**
  - Status badge updates based on verification report
  - Green/amber/red color coding correct
  - Modal shows full report with categorized violations
  - Current Phase 1 data passes all checks

### Task 4 — Integrate verifier with equipment profiles
- **Type:** file-edit
- **Files:** `src/CookingVisualizer.jsx`
- **Action:** Extend the verifier to check equipment references (R5, R6) against the live profile store (from Plan 01). If a step references an equipment ID that doesn't exist in the profile store, flag it. If air fryer equipment is referenced but has no `maxTemp` field, flag it.
- **Verify:** Removing an equipment profile that is referenced by steps triggers equipment-related verification errors. Adding back the profile clears the errors.
- **Acceptance criteria:**
  - Equipment reference validation works against live profile store
  - Missing equipment triggers error
  - Air fryer without maxTemp triggers warning

## Verification

1. All 9 rules defined with check predicates
2. Verifier runs on mount and produces categorized report
3. Current STEPS data passes all checks (green badge)
4. Deliberate violations are caught and categorized correctly
5. Status badge renders with correct color and count
6. Verification modal shows full report
7. Equipment profile changes reflect in verification results

## Success Criteria

- [ ] 9 Core Accuracy Rules implemented as checkable predicates
- [ ] Verification engine produces structured report with errors/warnings/infos
- [ ] Status badge shows green on clean data, amber/red on violations
- [ ] Modal shows categorized violation lists with step references
- [ ] Equipment profile store integrated with verifier
- [ ] Deliberate violations produce correct error messages
