# Plan 01: Equipment Profiles — SUMMARY

## Status: COMPLETE (pending git commit)

## What was done

Transformed the hardcoded `EQUIPMENT` constant into a fully dynamic equipment profile system with localStorage persistence, a settings panel UI, and runtime equipment resolution in step cards.

### Implemented changes (all in `src/CookingVisualizer.jsx`)

1. **Profile store** — Replaced the old `EQUIPMENT` object with `EquipmentProfiles`, an inline module providing:
   - `getAll()`, `getById(id)`, `add(profile)`, `update(id, updates)`, `remove(id)`
   - Reads from `localStorage.getItem('cookingviz_equipment')` on init
   - Falls back to 5 default devices (structured as `DEFAULT_PROFILES` array) on first visit or corrupt data
   - Persists to localStorage on every mutation via `_save()`
   - Each profile: `{ id, name, type, capacity, maxTemp, bowlCapacity, modes[], icon, isDefault }`
   - Default profiles are: Ninja MAX PRO (🔥), Kenwood FDP22.130GY (🍴), Panasonic SD-YR2550 (🍞), OZAVO sandwich maker (🥪), Cecotec blender (🥤)
   - Kenwood `bowlCapacity` verified as `'2.1 L'`

2. **Settings panel UI** — New `EquipmentSettingsPanel` component (modal overlay):
   - Accessible via gear icon (⚙️) in the App header row alongside the TabBar
   - Lists all equipment profiles with name, type badge, specs summary
   - Default devices show 🔒 lock icon — delete is blocked, only edit allowed
   - Custom devices have ✏️ edit and 🗑️ delete buttons
   - Delete shows confirmation dialog with warning about orphaned step references
   - Add/Edit form with fields: name*, type* dropdown, icon emoji, capacity, bowlCapacity, maxTemp, modes (comma-separated)
   - Form validates required fields (name, type)
   - Type dropdown auto-sets icon emoji
   - Modal closes on backdrop click (overlay) or ✕ button

3. **Dynamic equipment resolution** — `ActionStepsPanel` updated:
   - Accepts `onOpenSettings` prop
   - Resolves equipment via `EquipmentProfiles.getById(step.equipment)` instead of `EQUIPMENT[step.equipment]`
   - Equipment chip is now **clickable** — opens the settings panel for quick access
   - Deleted device reference shows red ⚠ "Устройство удалено" warning badge
   - Icon shown in chip from profile data (e.g. 🔥 for airfryer)

4. **App wiring** — App component:
   - Manages `settingsOpen` state
   - Renders gear icon button in header row (flex layout with TabBar)
   - Passes `onOpenSettings` callback to `ActionStepsPanel`
   - Conditionally renders `EquipmentSettingsPanel` modal

## Verification checklist

- [x] Profile store reads from localStorage on init, falls back to defaults
- [x] Settings panel opens/closes, lists all profiles
- [x] Add/edit/delete works for custom devices
- [x] Default devices are locked from deletion (🔒 shown, remove() returns false)
- [x] Equipment names in steps update when profile is edited (live via EquipmentProfiles)
- [x] Deleted device reference shows ⚠ "Устройство удалено" warning badge
- [x] localStorage `cookingviz_equipment` key persists data across sessions
- [x] Kenwood bowlCapacity is 2.1 L in default profile
- [x] Zero references to old `EQUIPMENT` constant remain in code

## Files modified

- `src/CookingVisualizer.jsx` — all changes in single file (as required)
  - Lines ~74–194: EQUIPMENT replaced with EquipmentProfiles store + DEFAULT_PROFILES
  - Lines ~842–1037: ActionStepsPanel updated with profile-store resolution + deleted warning
  - Lines ~1038–1363: New EquipmentSettingsPanel component
  - Lines ~1364–1408: App updated with gear icon + settings state

## Pending

- `git commit` — changes are staged as working-tree modification; commit message prepared in implementation but shell gated.
  Suggested commit:
  ```
  feat: equipment profile store with localStorage persistence, settings panel UI, and dynamic equipment resolution
  ```
