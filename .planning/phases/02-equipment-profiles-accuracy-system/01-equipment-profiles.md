---
phase: 2
plan: "01-equipment-profiles"
type: execute
wave: 0
depends_on: ""
files_modified:
  - "src/CookingVisualizer.jsx"
autonomous: true
requirements:
  - "VIZ-04"
---

# Plan 01: Equipment Profile Management

## Objective

Transform the hardcoded EQUIPMENT object into a dynamic equipment profile system with user-customizable devices, localStorage persistence, and runtime equipment selection in the UI. Users can add, edit, and remove devices. The 5 default devices ship as pre-loaded profiles.

## Tasks

### Task 1 — Extract EQUIPMENT into a profile store with localStorage
- **Type:** file-edit
- **Files:** `src/CookingVisualizer.jsx`
- **Action:** Add an `EquipentProfiles` module (inline or helper function) that:
  - Reads profiles from `localStorage.getItem('cookingviz_equipment')` on init
  - Falls back to the 5 default devices if no stored profiles exist
  - Provides `getAll()`, `add(profile)`, `update(id, profile)`, `remove(id)` functions
  - Persists to localStorage on every mutation
  - Each profile has: `id`, `name`, `type` (airfryer/processor/breadmaker/sandwichmaker/blender/custom), `capacity`, `maxTemp`, `bowlCapacity`, `modes[]`, `icon`
- **Verify:** `localStorage.getItem('cookingviz_equipment')` returns valid JSON after first load. Default profiles include all 5 original devices with their verified specs. Kenwood bowl is 2.1 L. Adding a custom device persists across page refresh.
- **Acceptance criteria:**
  - 5 default profiles pre-loaded on first visit
  - localStorage persistence works across sessions
  - CRUD functions produce correct results
  - Kenwood bowlCapacity remains 2.1 L

### Task 2 — Add equipment profile editor UI
- **Type:** file-edit
- **Files:** `src/CookingVisualizer.jsx`
- **Action:** Add an "Оборудование" settings panel accessible from a gear icon in the App header. The panel shows:
  - List of all equipment profiles with name, type badge, and key specs
  - "Добавить устройство" button that opens a form with fields: name, type dropdown, capacity, maxTemp, bowlCapacity, modes (comma-separated)
  - Edit (pencil) and Delete (trash) icons per profile
  - Confirmation dialog before deleting
  - Default devices have a lock icon — cannot be deleted (only edited)
- **Verify:** Panel opens from gear icon. Add form creates new device that appears in list and persists across refresh. Edit updates existing profile. Delete removes custom devices but not defaults.
- **Acceptance criteria:**
  - Settings panel accessible from App header
  - CRUD operations work on custom devices
  - Default devices are protected from deletion
  - Form validates required fields (name, type)

### Task 3 — Wire equipment profiles into step rendering
- **Type:** file-edit
- **Files:** `src/CookingVisualizer.jsx`
- **Action:** Update `ActionStepsPanel` to resolve equipment from the profile store instead of the static EQUIPMENT constant. Steps reference equipment by profile `id`. If a referenced profile is deleted, show a warning badge "Устройство удалено" on that step. The equipment chip in each step card now links to the profile editor for quick access.
- **Verify:** Steps render with equipment from profile store. Editing a device name in settings updates the name in all steps referencing it. Deleting a referenced device shows warning badge.
- **Acceptance criteria:**
  - Equipment resolution uses profile store, not static constant
  - Deleted device shows warning badge on affected steps
  - Equipment chip is clickable → opens settings panel

## Verification

1. Profile store reads from localStorage on init, falls back to defaults
2. Settings panel opens/closes, lists all profiles
3. Add/edit/delete works for custom devices
4. Default devices are locked from deletion
5. Equipment names in steps update when profile is edited
6. Deleted device reference shows warning badge
7. localStorage persistence survives page refresh

## Success Criteria

- [ ] Equipment profiles replace static EQUIPMENT constant
- [ ] 5 default devices pre-loaded with verified specs
- [ ] User can add custom equipment via settings panel
- [ ] Equipment chip in steps reflects profile store
- [ ] Data persists across sessions via localStorage
- [ ] Kenwood bowlCapacity verified as 2.1 L in default profile
