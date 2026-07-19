# Requirements: Cooking Visualizer

**Defined:** 2026-07-19
**Core Value:** Transform any recipe into an accurate, interactive visual guide where every measurement and instruction carries a verifiable accuracy tier.

## v1 Requirements

### Visualization

- [ ] **VIZ-01**: Generate two-panel interactive React visualization from recipe text
- [ ] **VIZ-02**: Panel 1 — Ingredient analysis with necessity tier, 6-column quantity matrix, and alternatives/substitutions for each non-base ingredient
- [ ] **VIZ-03**: Panel 2 — Step-by-step action sequence with equipment settings and accuracy tier labelling (✓, ~, ?)
- [ ] **VIZ-04**: Support user's equipment defaults (Ninja MAX PRO, Kenwood FDP22, Panasonic SD-YR2550, OZAVO sandwich maker, Cecotec blender)
- [ ] **VIZ-05**: Self-contained single React .jsx artifact — no API calls, all data hardcoded from conversation
- [ ] **VIZ-06**: All units in metric: г, мл, °C

## Out of Scope

| Feature | Reason |
|---------|--------|
| Backend/API integration | Fully client-side |
| Mobile app | Web React artifact only |
| Multi-language UI beyond Russian/English | Scope limitation |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| VIZ-01 | Phase 1 | Pending |
| VIZ-02 | Phase 1 | Pending |
| VIZ-03 | Phase 1 | Pending |
| VIZ-04 | Phase 1 | Pending |
| VIZ-05 | Phase 1 | Pending |
| VIZ-06 | Phase 1 | Pending |

**Coverage:**
- v1 requirements: 6 total
- Mapped to phases: 6
- Unmapped: 0

---
*Requirements defined: 2026-07-19*
*Last updated: 2026-07-19 after project initialization*
