---
name: cooking-visualizer
description: >
  Creates interactive React visualizations for cooking recipes. ALWAYS use this skill
  when the user says "visualize", "breakdown", "show steps", "visualize recipe",
  "show ingredients", or any similar phrase after a recipe has been given or discussed.
  The visualization has two mandatory panels: (1) Ingredient Analysis — necessity,
  6-column quantity matrix, and alternatives/substitutions for every non-base
  ingredient; (2) Step-by-step action sequence with equipment settings and accuracy
  tier labelling. Equipment defaults to the user's devices (Ninja MAX PRO, Kenwood
  FDP22 with 2.1 L bowl, Panasonic SD-YR2550, OZAVO sandwich maker, Cecotec blender)
  unless stated otherwise. Always build a single self-contained React artifact.
---

# Cooking Visualizer Skill

Produces a two-panel interactive React artifact for any recipe discussed in the
conversation. Read this file AND `/references/ingredient-roles.md` fully before
writing any code.

Accuracy is non-negotiable. Treat every number, ratio, and claim as if the
correctness of the output directly affects real outcomes. Where certainty is
incomplete, label it explicitly rather than presenting estimates as facts.

---

## Core Accuracy Rules

These rules override everything else.

**Rule 1 — Three tiers of certainty.** Every parameter you state must be tagged
in your reasoning (and where relevant, shown in the UI):

- **✓ VERIFIED** — physically or chemically established, or directly from a
  manufacturer spec. Example: Kenwood FDP22 bowl = 2.1 L (from spec sheet).
- **~ ESTIMATED** — well-founded inference from culinary principles, but depends
  on variables not controlled in this session (moisture level, flour protein,
  room temperature, exact machine behaviour). State the dependency explicitly.
  Example: "Air Fry 200°C 12–14 min — estimated for ~30 g balls; calibrate
  on first batch because time shifts with ball size and mixture moisture."
- **? EMPIRICAL** — must be tested by the user in their specific conditions.
  No fixed value can be given. Example: flour quantity in falafel depends on
  how wet this particular batch turned out.

In the React UI: show ~ and ? tags next to time and temperature chips in steps
where estimation or empirical calibration applies. Never omit these tags.

**Rule 2 — Conditional ingredients must be labelled.** Some ingredients appear
in western-adapted recipes as error-compensation, not as traditional components.
Label them with necessity tier `CONDITIONAL` and state the error they compensate for:

- Flour in falafel: not traditional. Needed only if mixture fails the ball test
  due to excess moisture from incorrect drying or over-processed chickpeas. Label:
  "safety net — only needed if mixture doesn't hold its shape".
- Baking powder in falafel: not traditional. More justified in an air fryer than
  in deep-fry (hot oil creates explosive steam lift that air fryers lack). Label:
  "western adaptation — makes texture slightly lighter, not required".

**Rule 3 — Verified equipment specs.**

- Kenwood FDP22.130GY: bowl **2.1 L** — not 1.5 L. Do not repeat the 1.5 L error.
- Ninja MAX PRO: 6.2 L, max 240°C. Air fry times are always ESTIMATED (~).
  Always instruct the user to calibrate on the first batch.

**Rule 4 — No conflation of different dishes.** Ta'amia is Egyptian
falafel made from fava beans, not chickpeas. Chickpea falafel
is Levantine (Lebanon, Syria, Jordan, Israel). These are different dishes.
Never cite ta'amia as a reference for chickpea-based recipes.

---

## Panel 1 — Ingredient Analysis

For every ingredient **except the base** (the ingredient that defines the dish),
each row of the ingredient panel contains three parts: necessity level, 6-column
quantity matrix, and alternatives/substitutions.

### Part A — Necessity Level

Assign one of four tiers:

- `BASE` — the dish structurally or chemically fails without it.
- `IMPORTANT` — omitting significantly changes the character; the dish still works.
- `OPTIONAL` — omitting is fully acceptable; this is flavour or texture
  enhancement only.
- `CONDITIONAL` — present in western adaptations to compensate for technique errors;
  the traditional dish does not use it. Always name the specific error it covers.

### Part B — Six-Column Quantity Matrix

Columns in fixed order: **0 | ½× | ¾× | 1× | ⁵⁄₄× | 3/2×**

- `0` — ingredient completely absent
- `½×` — 50% of recommended amount
- `¾×` — 75% of recommended (25% below norm)
- `1×` — recommended amount; the correct column; visually highlighted in gold
- `⁵⁄₄×` — 125% of recommended (25% above norm)
- `3/2×` — 150% of recommended

**The Tolerance Zone concept.** The key insight this matrix communicates is not
just "what happens at each point" but "how wide is the acceptable zone around 1×".
Some ingredients tolerate wide variation (herbs, black pepper); others are
critically sensitive (salt, baking powder). When ¾× and 1× produce effectively
the same result, mark both with the same verdict and add a visual indicator that
they fall within the same tolerance zone. When ⁵⁄₄× already departs from the
norm, this tells the cook that the upper boundary is close.

Never copy identical verdicts across columns just to fill cells. Reason each
column honestly. If the difference between ¾× and 1× is genuinely imperceptible,
say so explicitly — that is useful information.

**Sensitive ingredients** have narrow zones in one or both directions:
- Salt: both ¾× and ⁵⁄₄× are already noticeably wrong. Very narrow zone.
- Baking powder: ⁵⁄₄× causes structural collapse and soapy taste. Narrow upper bound.
- Flour (as binder): mark the entire 1× column as `?` — the correct amount is
  empirically determined by the ball test, not by a fixed number.

**Forgiving ingredients** have wide zones:
- Black pepper: the zone spans roughly ¾× to ⁵⁄₄× without meaningful difference.
- Parsley/cilantro: wide zone below 1×; moderate zone above (moisture risk at 3/2×).

For each cell, state:
- A short verdict (2–4 words), shown in the collapsed matrix view.
- On expansion: a concrete sensory or physical consequence (1–2 sentences).
  Forbidden language: "slightly different", "a bit changed", "may vary".
  Required language: what you taste, see, feel, or observe specifically.

### Part C — Alternatives & Substitutions

A collapsible sub-section titled "Variants & Substitutions" showing:

**Form variants** — the same ingredient in a different physical form:
- Fresh herb vs dried: conversion ratio (~1:4 by volume); what changes
  (moisture contribution disappears, colour disappears, flavour concentrates).
- Whole spice vs pre-ground vs freshly ground from toasted seeds: potency
  ranking (freshly ground > pre-ground from recent packet > stale pre-ground),
  texture implications for the dish, method using Cecotec chopper.
- Fresh allium vs powder: moisture contribution difference, conversion ratio.

**Substitutions** — a different ingredient serving the same role:
- Name, ratio, and honest assessment of what is lost and gained.
- If there is no viable substitute, state this directly.

Consult `/references/ingredient-roles.md` for detailed data per category.

### Visual Design — Panel 1

The base ingredient sits in a distinct card at the top of the panel, not in the
matrix. Each non-base ingredient is a collapsible row showing the name, necessity
badge, and amount in the collapsed state. The expanded state shows the full
6-column matrix, then the alternatives section.

Column colouring: `0` has a red-tinted background. `½×` has a muted cool tint.
`¾×` and `⁵⁄₄×` share a soft amber tint — they are the near-norm zone. `1×`
has a gold border and a warmer background. `3/2×` matches the amber of ⁵⁄₄×
but slightly more saturated to indicate further departure.

Tolerance zone indicator: when adjacent columns share the same verdict, connect
them with a subtle visual bridge (matching background wash or a light bracket)
so the cook can immediately see "this ingredient is forgiving here".

---

## Panel 2 — Action Steps

### Step Anatomy

Every step must contain all of the following:

1. **Step number + action name** — short, verb-first.
2. **What to do** — maximum 2 sentences. No vague language.
3. **Duration or condition** — tagged with accuracy tier:
   - No tag for verified durations (rare in cooking).
   - ~ for estimated durations and temperatures.
   - ? for steps where the endpoint is empirically determined by a sensory test.
4. **Equipment settings** — shown as compact chips in the collapsed card:
   - Ninja MAX PRO: mode + °C + time (always ~ tagged)
   - Kenwood FDP22 (2.1 L bowl): fill fraction of 2.1 L + pulse count (? tagged)
   - Panasonic SD-YR2550: menu number + size + crust colour
   - Cecotec: function + duration
   - No device: "by hand" + brief technique note
5. **Done when** — a concrete sensory, tactile, or visual cue. Not a time.
   This is the primary stopping condition; time is secondary.
6. **If skipped** — one specific, concrete consequence.

### Accuracy Labels in Steps

Air fryer steps must carry ~ on time and temperature, and include a calibration
instruction naming the specific check: e.g. "check the first batch at 11 min —
break one ball open; if the inside is doughy — add 2 min". This instruction
is not optional. It is the mechanism that converts an estimate into a calibrated
result for this user's specific machine, ball size, and mixture.

Steps with empirical endpoints (pulse count in the food processor, flour addition)
must carry ? and define the physical test that determines the endpoint.

### Visual Design — Panel 2

Vertical timeline. Each step is a clickable card expanding to full detail.
Equipment chips visible in the collapsed state. Accuracy tier tags (~, ?) appear
next to time and temperature values, always. "Done when" block uses a green
background with a check indicator. "If skipped" block uses a red-tinted background
with a warning indicator. "Expand all" toggle at panel level.

---

## General React Rules

**Theme:** dark warm kitchen. bg `#1a1610`, surface `#242018`, card `#2e2820`,
border `#3d3428`, gold `#c8a96e`, goldLight `#e0c48a`, goldDim `#8a7040`,
red `#c05040`, amber `#d4904a`, green `#6a9e6e`, blue `#5a8aaa`,
text `#f0e8d8`, textDim `#9a8a6a`, textMuted `#5a4a2a`.

**Tabs:** "Ingredients" and "Cooking Steps" are mandatory. Third tab only
if there is a genuinely distinct third dimension — never as padding.

**Font:** Georgia or serif only. No Inter, Roboto, or system fonts.

**Interactivity:** collapsible rows in both panels, "Expand all" toggle per
panel. Six-column matrix visible in collapsed state as short verdicts.

**Self-contained:** all data hardcoded from the conversation. No API calls.
Single .jsx file. All units in metric: g, ml, °C.

---

## Pre-Code Extraction Checklist

Before writing a single line of React, complete this checklist mentally:

1. Identify the base ingredient(s). Two co-equal bases → both marked BASE,
   both excluded from the matrix.
2. List all other ingredients with exact amounts. For each, assign necessity tier
   honestly — distinguish IMPORTANT from CONDITIONAL carefully.
3. Fill all 6 matrix columns per ingredient. Identify where the tolerance zone
   is wide vs narrow. Mark flour and other empirically-determined quantities with ?.
4. Enumerate all steps in chronological, granular order. Drying and chopping
   are separate steps; chilling and shaping are separate steps.
5. For each step: map to user's device, assign accuracy tier to every
   time/temperature value. No estimated value appears without its ~ tag.
6. Run a final check against the four Core Accuracy Rules:
   - No ta'amia conflation.
   - No 1.5 L bowl.
   - No unconditional flour/baking powder presentation.
   - No naked estimated times (must carry ~).
   If any of the four are violated, fix before outputting the artifact.
