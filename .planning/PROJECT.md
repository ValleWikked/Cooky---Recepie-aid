# Cooking Visualizer

## What This Is

An interactive cooking recipe visualization tool that produces two-panel React artifacts for any recipe. Panel 1 analyzes ingredients with a 6-column quantity matrix and substitution recommendations. Panel 2 shows step-by-step action sequences with equipment settings and accuracy-tier labelling.

## Core Value

Transform any recipe into an accurate, interactive visual guide where every measurement and instruction carries a verifiable accuracy tier, so cooks can trust the output and calibrate to their own equipment.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] **VIZ-01**: Generate two-panel interactive React visualization from recipe text
- [ ] **VIZ-02**: Panel 1 — Ingredient analysis with necessity tier, 6-column quantity matrix, and alternatives/substitutions for each non-base ingredient
- [ ] **VIZ-03**: Panel 2 — Step-by-step action sequence with equipment settings and accuracy tier labelling (✓, ~, ?)
- [ ] **VIZ-04**: Support user's equipment defaults (Ninja MAX PRO, Kenwood FDP22, Panasonic SD-YR2550, OZAVO sandwich maker, Cecotec blender)
- [ ] **VIZ-05**: Self-contained single React .jsx artifact — no API calls, all data hardcoded from conversation
- [ ] **VIZ-06**: All units in metric: г, мл, °C

### Out of Scope

- Backend/API integration — fully client-side
- Mobile app — web React artifact only
- Multi-language UI beyond Russian/English recipe content

## Context

- **Obsidian Vault**: `Brain-vault/` serves as the knowledge base and note-taking environment
- **Skill**: The `cooking-visualizer` skill defines the visualization generation logic
- **Equipment**: User's kitchen devices are the default equipment context
- **Prior Art**: The skill contains a comprehensive ingredient roles reference and accuracy rules

## Constraints

- **Tech Stack**: React (single .jsx artifact), no external dependencies beyond React
- **Language**: UI supports Russian and English recipe content; skill triggers on Russian keywords
- **Accuracy**: Every number must carry one of three accuracy tiers (✓ VERIFIED, ~ ESTIMATED, ? EMPIRICAL)
- **Self-contained**: No API calls, no runtime data fetching

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Single .jsx artifact | Keeps deployment simple, no build toolchain needed | — Pending |
| 6-column quantity matrix | Covers full range from omission to 1.5× with tolerance zone info | — Pending |
| Accuracy tier labelling | Makes trust explicit — users know what to calibrate | — Pending |

---
*Last updated: 2026-07-19 after project initialization*
