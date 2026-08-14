# ChartRx — Combined App Plan

**ChartRx** is a dental clinical tool combining SOAP charting templates and a pediatric medication dosage calculator into one offline-ready PWA.

---

## Sources

| Repo | Role | Current state |
|---|---|---|
| `charting-template` | ChartRx charting app | Complete in `dental-charting.html`. React port not started. |
| `pedcalc-med` | PedMed dosage calculator | Complete React 19 + Vite app. Deployed on GitHub Pages. |

The React app is built from scratch, with both sources migrated in.

---

## Stack

| Layer | Choice |
|---|---|
| Framework | React + Vite + TypeScript |
| Styling | Tailwind CSS v4 |
| State | Zustand |
| Storage | `localStorage` key `chartrx_v2` + JSON export/import |
| Drag-and-drop | dnd-kit |
| PWA | vite-plugin-pwa |
| Deploy | Netlify |

---

## Directory Structure

```
chartrx/
├── public/
│   ├── icon-192.png
│   ├── icon-512.png
│   └── manifest.json
├── src/
│   ├── data/
│   │   ├── initialTemplates.ts     ← FACTORY_TEMPLATES from HTML
│   │   ├── visitTemplates.ts       ← VN_TEMPLATES from HTML
│   │   ├── dropdownOptions.ts      ← OPTIONS + DEFAULT_OPTIONS + PH_LABELS from HTML
│   │   └── medications.ts          ← medications.js from pedcalc-med
│   ├── store/
│   │   └── useStore.ts             ← Zustand global state
│   ├── utils/
│   │   ├── storage.ts              ← localStorage read/write
│   │   ├── serializer.ts           ← chart → plain text for EMR copy
│   │   └── calculations.ts         ← calculations.js from pedcalc-med
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Topbar.tsx
│   │   │   └── MobileNav.tsx
│   │   ├── chart/
│   │   │   ├── ChartCard.tsx
│   │   │   ├── SoapRow.tsx
│   │   │   ├── FieldToken.tsx
│   │   │   └── FieldDropdown.tsx
│   │   ├── visit/
│   │   │   ├── VisitCard.tsx
│   │   │   ├── StepList.tsx
│   │   │   └── OutcomeRow.tsx
│   │   ├── dosage/
│   │   │   ├── DosageCalculator.tsx
│   │   │   ├── WeightInput.tsx
│   │   │   ├── MedPicker.tsx
│   │   │   ├── FormulationPicker.tsx
│   │   │   ├── RegimenPicker.tsx
│   │   │   └── DoseResult.tsx
│   │   ├── preview/
│   │   │   └── PreviewModal.tsx
│   │   └── settings/
│   │       ├── SettingsModal.tsx
│   │       ├── TemplateEditor.tsx
│   │       └── OptionsEditor.tsx
│   ├── App.tsx
│   └── main.tsx
├── tailwind.config.ts
├── vite.config.ts
└── package.json
```

---

## Navigation

```
Desktop sidebar:   [ Initial Chart ]  [ Visit Notes ]  [ Dosage ]
Mobile bottom nav: [ Initial ] [ Visit ] [ Chart ] [ Dosage ] [ Settings ]
```

Mode union type: `'initial' | 'visit' | 'dosage'`

---

## Data Reference

All data is extracted from `dental-charting.html`. Do not redesign — copy and type.

### Initial Chart templates (`FACTORY_TEMPLATES` → `initialTemplates.ts`)

24 procedures across 5 categories:

| Category | Procedures |
|---|---|
| Restorative & Pros | Direct Resto, Indirect Resto (Inlay/Onlay), Fixed Pros (Crown/Bridge), Removable Pros (CD/RPD), SSC |
| Endodontics | Pulpotomy (primary), Pulpectomy (primary RCT), Vital Pulp Therapy (IPC/DPC + Partial pulpotomy), Conventional RCT, Apicoectomy |
| Oral Surgery & Implant | Extraction (Simple / Surgical), Implant Surgery, Implant 2nd Stage/Impression/Delivery, Sinus Surgery (Lateral window / Crestal), Bone Graft / Socket Preservation, GBR (Simultaneous / Staged) |
| Periodontics | SRP, Periodontal Maintenance (SPT), GTR, Crown Lengthening (Esthetic / Functional), Frenectomy, CTG, FGG |
| General & Other | Regular Checkup, Orthodontics (Bonding/Adjustment/Debond), TMD / Occlusal Splint |

Each procedure has one or more `versions`, each with `S`, `O`, `A` strings and `P` step array. Fields use `{placeholder}` syntax; `#{tooth}` syncs across all tokens in the same card.

### Visit Notes templates (`VN_TEMPLATES` → `visitTemplates.ts`)

Same 24 procedures, broken into numbered visit steps (V1–V5 for complex procedures like implants). Each visit step has free-text `S`, `O`, `A` (no tokens), an editable `steps[]` list, `outcome`, and `next`. Visit-only placeholders: `pain`, `asa`, `isq`, `tissue`, `buccal`, `plaque`, `response`, `prevPD`, `boneSound`, `coverage`, `ktGain`, `tacks`, `membraneStatus`, `elastics`, `adjustments`, `ohi`, `cariesRisk`, `healing`.

### Dropdown options (`OPTIONS` → `dropdownOptions.ts`)

~80 placeholders, each with a string array of preset choices and a human-readable `PH_LABELS` entry. `DEFAULT_OPTIONS` is a deep copy used for reset. Stored in localStorage under `chartrx_v2`.

### Medications (`medications.js` → `medications.ts`)

5 medications: Acetaminophen, Ibuprofen, Amoxicillin (standard + high-dose regimens), Azithromycin (Z-Pak, Day 1/Day 2+), Lidocaine 2% w/ Epi. Adult threshold: `ADULT_WEIGHT_KG = 40`.

---

## TypeScript Interfaces

```typescript
// ── Initial Chart ──────────────────────────────────────────────
interface TemplateVersion {
  id: string;
  label: string;
  S: string;
  O: string;
  A: string;
  P: string[];
}
interface InitialTemplate {
  name: string;
  tag: string;
  versions: TemplateVersion[];
}
type InitialTemplates = {
  [category: string]: { label: string; items: { [key: string]: InitialTemplate } };
};

// ── Visit Notes ────────────────────────────────────────────────
interface VisitStep {
  id: string;
  label: string;
  S: string;
  O: string;
  A: string;
  steps: string[];
  outcome: string;
  next: string;
}
interface VisitTemplate {
  name: string;
  tag: string;
  visits: VisitStep[];
}
type VisitTemplates = {
  [category: string]: { label: string; items: { [key: string]: VisitTemplate } };
};

// ── Dropdown Options ────────────────────────────────────────────
type DropdownOptions = { [placeholder: string]: string[] };

// ── Medications (PedMed) ────────────────────────────────────────
interface FormulationOption {
  label: string;
  mgPerMl?: number;
  tabletMg?: number;
  maxTablets?: number;
}
interface DosingRegimen {
  id: string;
  label: string;
  dosePerKg: number;
  minDosePerKg?: number;
  frequency: string;
  maxSingleDoseMg?: number;
  maxDosePerKgPerDay?: number;
  dosesPerDay: number;
  adultDoseMg?: number;
  adultMinDoseMg?: number;
}
interface DayDose {
  id: string;
  label: string;
  dosePerKg: number;
  maxMg?: number;
  frequency: string;
}
interface DispenseUnit {
  label: string;
  volumeMl: number;
}
interface Medication {
  id: string;
  name: string;
  genericName: string;
  dosePerKg: number;
  concentration: number;
  formulationOptions: FormulationOption[];
  dispensingUnit?: DispenseUnit;
  adultDoseMg?: number;
  adultMaxDailyMg?: number;
  adultMinDoseMg?: number;
  adultNote?: string;
  frequency: string;
  maxDosePerKgPerDay?: number;
  minDosePerKg?: number;
  maxSingleDoseMg?: number;
  absoluteMaxMg?: number;
  dosesPerDay?: number;
  warning?: string;
  roundDown?: boolean;
  dosingRegimens?: DosingRegimen[];
  dayDoses?: DayDose[];
}
interface DoseResult {
  doseMg: number;
  volumeMl: number | null;
  tablets: number | null;
  tabletMg: number | null;
  concentration: number;
  minDoseMg: number | null;
  dosesPerDay: number;
  maxDailyMg: number;
  maxDosesPerDay: number | null;
  maxTabletsPerDay: number | null;
  frequency: string;
  adult: boolean;
  dispensingUnit?: DispenseUnit;
}

// ── Zustand Store ───────────────────────────────────────────────
interface AppState {
  mode: 'initial' | 'visit' | 'dosage';

  // Initial Chart
  activeInitialKey: string | null;   // e.g. "restorative/direct_resto"
  activeVersionId: string | null;
  fieldValues: Record<string, string>;

  // Visit Notes
  activeVisitKey: string | null;     // e.g. "surgical/implant_surg"
  activeVisitStepId: string | null;
  visitDate: string;

  // Preview edits (contenteditable overrides)
  previewEdits: Record<number, { text?: string; steps?: Record<number, string> }>;

  // Persisted user data (saved to localStorage chartrx_v2)
  customTemplates: InitialTemplates;
  customVisitTemplates: VisitTemplates;
  customOptions: DropdownOptions;
}
```

---

## Design Tokens

Map to Tailwind custom colors in `tailwind.config.ts`:

```
bg:           #f4f2ec   — app background (+ radial dot grid overlay)
panel:        #fbfaf6   — sidebar, topbar, modal backgrounds
ink:          #1a2420   — primary text
ink-soft:     #5a655e   — secondary/muted text
line:         #d9d5c8   — borders and dividers
accent:       #0f5c4a   — primary green (active states, primary buttons)
accent-soft:  #e3efe9   — light green (hover bg, active item bg)
accent-bright:#14745d   — primary button hover
amber:        #c4702a   — unfilled field tokens
amber-soft:   #f6e9da   — field token background
field:        #fffdf7   — card/input backgrounds
field-active: #fff8e6   — focused field background
red:          #b4452f   — danger / delete
red-soft:     #f7ebe8   — danger hover background

Fonts:
  UI body:    IBM Plex Sans (400/500/600/700)
  Headings:   Newsreader (400/500/600, italic)
  Monospace:  IBM Plex Mono (400/500/600) — tags, tokens, field values
```

---

## Build Phases

### Phase 1 — Scaffold
- [ ] Vite + React + TypeScript project init
- [ ] Tailwind CSS v4 + custom tokens
- [ ] Zustand store (`useStore.ts`) with initial state
- [ ] Base layout: `Sidebar` (290px) + `Main` — desktop grid
- [ ] `MobileNav` bottom bar skeleton (≤700px)
- [ ] `App.tsx` — mode switch renders correct section

### Phase 2 — Data files
- [ ] `initialTemplates.ts` — copy `FACTORY_TEMPLATES`, apply `InitialTemplates` type
- [ ] `visitTemplates.ts` — copy `VN_TEMPLATES`, apply `VisitTemplates` type
- [ ] `dropdownOptions.ts` — copy `OPTIONS`, `DEFAULT_OPTIONS`, `PH_LABELS`
- [ ] `medications.ts` — copy `medications.js`, apply `Medication[]` type
- [ ] `calculations.ts` — copy `calculations.js`, apply typed signatures
- [ ] `storage.ts` — load/save `chartrx_v2` from localStorage

### Phase 3 — Initial Chart
- [ ] `FieldToken.tsx` — amber inline button; `#{tooth}` triggers card-wide sync
- [ ] `FieldDropdown.tsx` — preset options list + custom input; Tab moves to next token
- [ ] `SoapRow.tsx` — letter badge (S/O/A/P) + body; P renders step list
- [ ] `ChartCard.tsx` — card header (name, tag), SOAP rows, token fill counter
- [ ] `Topbar.tsx` — title, filled/total badge, Clear / Preview / Copy buttons
- [ ] Sidebar procedure list — category headers, search filter, version pills

### Phase 4 — Visit Notes
- [ ] `VisitCard.tsx` — date input, free-text S/O/A textareas, P step list, outcome/next grid
- [ ] `StepList.tsx` — dnd-kit drag reorder; add / delete steps
- [ ] `OutcomeRow.tsx` — outcome + next appointment side-by-side textareas
- [ ] Visit Notes sidebar — procedure categories → numbered visit items (V1, V2…)
- [ ] Copy button → plain text with date header

### Phase 5 — Preview Modal
- [ ] Render all tokens resolved to their values
- [ ] S/O/A: `contenteditable` divs with hover/focus ring
- [ ] P steps: inline editable textareas, add/delete per step
- [ ] Unfilled badge (amber) when any `{placeholder}` not filled
- [ ] Topbar Preview button pulses green when all fields filled
- [ ] Copy button → `serializer.ts` → plain text

### Phase 6 — Settings Modal
- [ ] Modal shell — 2 tabs: Templates | Dropdown Options
- [ ] **Templates tab**
  - Left panel: category tree → procedure → version list; add/delete/rename versions
  - Right editor: S/O/A textareas, `{placeholder}` insert chips, P step list (dnd-kit), "Reset to factory default"
- [ ] **Dropdown Options tab**
  - Search filter; chips per placeholder with × delete; Enter to add
  - Export JSON / Import JSON; Reset all to defaults

### Phase 7 — Dosage tab (PedMed)
- [ ] `DosageCalculator.tsx` — owns all local state (no Zustand needed)
- [ ] `WeightInput.tsx` — number input + kg/lbs toggle, live conversion display
- [ ] `MedPicker.tsx` — medication button list with checkmark on active
- [ ] `FormulationPicker.tsx` — formulation `<select>`
- [ ] `RegimenPicker.tsx` — dosing regimen `<select>` (amoxicillin only; 875 mg tablet auto-selects high-dose)
- [ ] `DoseResult.tsx`
  - Per-dose mg (dropdown if min–max range exists, in 1 mg steps)
  - Volume (mL) + teaspoons / carpules
  - Tablets (fractional shown as decimal)
  - Daily total, frequency, daily max, warnings
  - Day picker tabs for azithromycin (Day 1 / Day 2+)
  - Adult badge when weight > 40 kg
  - Inline disclaimer: "For reference only. Verify with a licensed provider. Based on AAPD Reference Manual 2025–2026."
- [ ] Add `dosage` to sidebar and mobile nav; remove full-screen disclaimer gate

### Phase 8 — Mobile UX
- [ ] Bottom nav: Initial / Visit / Dosage / Settings (active state, SVG icons)
- [ ] Procedure panel — full-screen slide-in from left; close button
- [ ] Chart view — full-screen overlay; back button returns to procedure panel
- [ ] Version sheet — slides up from bottom; overlay backdrop
- [ ] FieldDropdown — repositioned as bottom sheet (≤700px)
- [ ] Settings modal — slides up from bottom edge

### Phase 9 — PWA
- [ ] `vite-plugin-pwa` — manifest + auto-generated Service Worker
- [ ] `manifest.json` — `name: "ChartRx"`, `theme_color: "#0f5c4a"`, icons 192/512
- [ ] Offline cache — app shell + Google Fonts
- [ ] Update banner — shown when new SW version detected; "Update" triggers `skipWaiting`

### Phase 10 — Ship
- [ ] Remove `disclaimerAccepted` localStorage key (PedMed artifact)
- [ ] Test on desktop + iOS Safari + Android Chrome
- [ ] Deploy to Netlify — root path `/`, no base path needed
- [ ] Archive `pedcalc-med` GitHub Pages deployment

---

## File Migration Map

### `charting-template/dental-charting.html` → React

| HTML | Destination |
|---|---|
| `FACTORY_TEMPLATES` | `src/data/initialTemplates.ts` |
| `VN_TEMPLATES` | `src/data/visitTemplates.ts` |
| `OPTIONS` + `DEFAULT_OPTIONS` + `PH_LABELS` | `src/data/dropdownOptions.ts` |
| `loadData` / `saveData` | `src/utils/storage.ts` |
| `selectProc` + `renderChart` | `ChartCard.tsx` + `useStore` |
| `openFieldDropdown` | `FieldDropdown.tsx` |
| `openPreview` + `renderPreview` | `PreviewModal.tsx` |
| `renderTplSidebar` + `renderTplEditor` | `TemplateEditor.tsx` |
| `renderOptions` | `OptionsEditor.tsx` |
| `selectVnVisit` + `renderVnCard` | `VisitCard.tsx` + `useStore` |
| CSS variables | Tailwind custom tokens in `tailwind.config.ts` |

### `pedcalc-med/src/` → React

| PedMed | Destination |
|---|---|
| `medications.js` | `src/data/medications.ts` |
| `calculations.js` | `src/utils/calculations.ts` |
| `App.jsx` | `src/components/dosage/DosageCalculator.tsx` + children |
| `Disclaimer.jsx` | Inline note in `DoseResult.tsx` |
| `App.css` | Deleted — Tailwind only |
