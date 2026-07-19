---
phase: 3
plan: "06-documentation"
type: execute
wave: 3
depends_on: "04-print-stylesheet"
files_modified:
  - "src/CookingVisualizer.jsx"
  - "README.md"
autonomous: true
requirements:
  - "VIZ-01"
---

# Plan 06: Documentation — Code Comments, README, UI Tooltips

## Objective

Add developer-facing documentation (inline comments, README.md) and user-facing documentation (in-UI tooltips explaining features).

## Tasks

### Task 1 — Add section header comments
- **Type:** file-edit
- **Files:** `src/CookingVisualizer.jsx`
- **Action:** Review existing `═══` section headers. Ensure every major section (THEME, STYLES, EQUIPMENT, INGREDIENTS, STEPS, ACCURACY_RULES, each component) has a clear one-line description. Add missing descriptions where needed.
- **Verify:** Every `═══` header has a description line immediately after.
- **Acceptance criteria:** Code is navigable by section headers.

### Task 2 — Document Core Accuracy Rules inline
- **Type:** file-edit
- **Files:** `src/CookingVisualizer.jsx`
- **Action:** Above each rule in ACCURACY_RULES, add a comment explaining the reasoning: which SKILL.md rule it enforces, what violation means, and what the user/developer should do to fix it.
- **Verify:** All 9 rules have explanatory comments.
- **Acceptance criteria:** Each rule self-documents its purpose and remediation.

### Task 3 — Write README.md
- **Type:** file-create
- **Files:** `README.md`
- **Action:** Create project README with:
  - Title: "Cooking Visualizer — интерактивная визуализация рецептов"
  - Overview, features (2 panels, 6-column matrix, accuracy tiers, equipment profiles, calibration, verification)
  - Architecture (single .jsx, data model, localStorage stores)
  - Usage instructions (tabs, calibration, accuracy badges, equipment settings)
  - Requirements: VIZ-01 through VIZ-06
  - Tech: React, no deps, metric units
- **Verify:** README is valid Markdown, covers all features, includes usage guide.
- **Acceptance criteria:** Complete, accurate, readable README.

### Task 4 — Add in-UI help tooltips
- **Type:** file-edit
- **Files:** `src/CookingVisualizer.jsx`
- **Action:** Add "?" help icons next to panel headers. On click, show compact tooltip explaining: ingredient tiers, matrix columns, tolerance zones (Panel 1); accuracy tiers, calibration workflow, verification badge (Panel 2). In Russian, matching SKILL.md terminology.
- **Verify:** Tooltips appear on click, dismiss on second click/outside click.
- **Acceptance criteria:** Help tooltips explain key features in user-facing language.

### Task 5 — Add accuracy tier glossary to legend
- **Type:** file-edit
- **Files:** `src/CookingVisualizer.jsx`
- **Action:** Extend the existing accuracy legend in ActionStepsPanel to include a one-line explanation of each tier's meaning: "Нет метки = физически или химически установлено", "~ = оценка; зависит от размера, влажности", "? = требует проверки пользователем".
- **Verify:** Legend text matches SKILL.md Core Accuracy Rules verbatim.
- **Acceptance criteria:** Legend is complete and accurate.

## Verification

1. All section headers have descriptions
2. All 9 accuracy rules have explanatory comments
3. README.md exists with all required sections
4. Help tooltips appear on click
5. Accuracy legend text matches SKILL.md

## Success Criteria

- [ ] Code is navigable via section headers
- [ ] Accuracy rules self-document with comments
- [ ] README.md complete and accurate
- [ ] In-UI tooltips explain features
- [ ] Accuracy legend matches spec
