# PedMed — Project Overview & Merge Plan

## What This Project Is

**PedMed** is a pediatric medication dosage calculator built for clinical/dental reference. It calculates weight-based dosing for common pediatric medications, handles adult weight cutoffs, multiple formulations, and dosing regimens.

Deployed via GitHub Pages at base path `/pedcalc-web/`.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | React 19 (JSX) |
| Build | Vite 8 |
| Styling | Plain CSS (`App.css`, `index.css`) |
| State | React `useState` / `useEffect` (no external store) |
| Persistence | `localStorage` (disclaimer acceptance only) |
| Deploy | GitHub Pages (static build in `/dist`) |

---

## File Structure

```
src/
  medications.js     — medication data (doses, formulations, regimens)
  calculations.js    — pure dose math (no React, fully testable)
  App.jsx            — single-page UI
  App.css            — all component styles
  Disclaimer.jsx     — one-time disclaimer gate
  index.css          — global/reset styles
  main.jsx           — React root mount
public/
  favicon.svg
  icons.svg
```

---

## Data Model

Each entry in `medications.js` has this shape (all fields optional unless noted):

```js
{
  id: string,                  // required, unique key
  name: string,                // brand name
  genericName: string,
  dosePerKg: number,           // mg/kg per dose (default regimen)
  concentration: number,       // mg/mL (default liquid)
  formulationOptions: [        // dropdown choices
    { label, mgPerMl }         // liquid
    { label, tabletMg, maxTablets? }  // tablet
  ],
  dispensingUnit: { label, volumeMl },
  adultDoseMg: number,         // dose when weight > 40 kg
  adultMaxDailyMg: number,
  adultMinDoseMg: number,
  frequency: string,
  maxDosePerKgPerDay: number,
  minDosePerKg: number,
  dosesPerDay: number,
  warning: string,
  roundDown: boolean,
  absoluteMaxMg: number,
  dosingRegimens: [ ... ],     // amoxicillin: multiple regimens
  dayDoses: [ ... ],           // azithromycin: Day 1 vs Day 2+
}
```

**Adult threshold:** `ADULT_WEIGHT_KG = 40` in `calculations.js`.

---

## Current Medications

| ID | Name | Notes |
|---|---|---|
| `tylenol` | Acetaminophen | Liquid + tablets |
| `advil` | Ibuprofen | Liquid + tablets |
| `amoxicillin` | Amoxicillin | Standard vs high-dose regimens |
| `azithromycin` | Azithromycin (Z-Pak) | Day 1 / Day 2+ dosing |
| `lidocaine` | Lidocaine 2% w/ Epi | Carpule-based (dental) |

---

## Core Logic (`calculations.js`)

- `calculateDose(medication, weightKg, formulation, regimen, day)` — returns a result object with `doseMg`, `volumeMl`, `tablets`, `frequency`, `maxDailyMg`, etc.
- `getEffectiveRegimen(medication, selectedRegimen, selectedFormulation)` — auto-selects high-dose regimen for 875 mg tablet.
- `lbsToKg`, `formatMl`, `formatMg`, `formatTablets` — utility helpers.
- No side effects; all pure functions — easy to port or test.

---

## UI Flow

1. **Disclaimer gate** — one-time accept, stored in `localStorage`.
2. **Weight input** — kg or lbs with live conversion display.
3. **Medication picker** — button list.
4. **Formulation picker** — dropdown (shown after med selected).
5. **Regimen picker** — dropdown (amoxicillin only).
6. **Results card** — per-dose mg, volume/tablets, frequency, daily max, warnings.
   - Dose range picker (1 mg steps) when a min–max range exists.
   - Day picker for azithromycin (Day 1 / Day 2+).

---

## Merge Considerations

When combining with another project, note:

- **No router** — App.jsx is a single flat component. Adding `react-router-dom` would let this become one route/page of a larger app.
- **No shared state** — all state is local to `App.jsx`. Easy to lift or wrap.
- **CSS is global** — class names like `.card`, `.header`, `.select` are generic. Namespace or migrate to CSS modules / Tailwind to avoid collisions.
- **`localStorage` key** — `"disclaimerAccepted"` is the only persisted key. Rename if the host app uses the same key.
- **`medications.js` and `calculations.js`** are dependency-free — they can be dropped into any JS/TS project as-is.
- **Vite base path** is `/pedcalc-web/` — change or remove when hosting under a different path.
- **No TypeScript** — if the host project uses TS, adding `.d.ts` types or converting `calculations.js` to `.ts` would help.

---

## Pending / To-Do

- [ ] Confirm which project this will be merged into and what the target stack is.
- [ ] Decide routing strategy (this app as a route, a modal, or embedded component).
- [ ] Resolve CSS namespace conflicts.
- [ ] Decide whether to keep the disclaimer gate or use the host app's auth/gating.
- [ ] Add more medications as needed (reference: AAPD Reference Manual 2025–2026).
