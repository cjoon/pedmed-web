# pedcalc-med — Pediatric Dosage Calculator + ChartRx (web)

## Overview
Weight-based pediatric drug dosage calculator, merged with a SOAP
charting template tool (ChartRx). React + Vite SPA, deployed to GitHub
Pages: cjoon.github.io/pedcalc-web. See PLAN.md for the integration roadmap.

## Roles
- Claude writes and edits all code.
- Codex reviews only — reads diffs, reports defects, never edits.
- After each PLAN.md phase: build/lint pass → Codex review (`/review`) →
  fix P0/P1 → next phase. P2/P3 are reported and left alone.

## File Map
- src/main.jsx                    : entry point
- src/App.jsx                     : shell — chart/dosage tab switch, shared
                                     weightKg, Topbar/MobileNav, footer disclaimer
- src/App.css                     : shell styles + shared ChartRx palette tokens
- src/medications.js              : drug database (name, mg/kg, max dose, forms, sig/disp)
- src/calculations.js             : weight-based dosing logic
- src/dosage/DosageCalculator.jsx : pediatric dosage calculator UI
- src/dosage/dosage.css           : Dosage-tab-only styles
- src/chart/ChartView.jsx         : Initial Chart tab — sidebar + card + copy/reset
- src/chart/Sidebar.jsx           : procedure list, search filter, version pills
- src/chart/ChartCard.jsx         : SOAP card, wires in anesthesia/CDT rows
- src/chart/SoapRow.jsx           : one S/O/A/P row, renders field tokens
- src/chart/FieldToken.jsx        : clickable {ph} blank, opens dropdown/tooth picker
- src/chart/FieldDropdown.jsx     : anchored option list + custom text entry
- src/chart/ToothSelector.jsx     : multi-tooth picker (new — not in the prototype)
- src/chart/AnesthesiaRow.jsx     : carpule→mg calculator vs. weight-based max
- src/chart/CdtRow.jsx            : CDT code chips, add/remove
- src/chart/tokenize.js           : parses "{ph}" tokens out of template text
- src/chart/serializer.js         : plain-text chart export format
- src/chart/anesthesia.js         : carpule→mg / max-dose pure functions
- src/chart/chart.css             : Chart-tab-only styles
- src/chart/data/initialTemplates.js : FACTORY_TEMPLATES, verbatim from the prototype
- src/chart/data/dropdownOptions.js  : OPTIONS/PH_LABELS, verbatim from the prototype
- src/chart/data/cdtCodes.js         : CDT code per procedure (UNKNOWN — empty until CJ provides)
- src/chart/data/anesthetics.js      : anesthetic agent specs (only Lidocaine max confirmed)
- scripts/check-data-parity.mjs      : chart data vs. dental-charting.html, exit 1 on mismatch

## Domain Rules (NEVER violate)
- Drug data follows AAPD Reference Manual 2025-2026. Never invent doses,
  concentrations, or sig instructions. Missing value = UNKNOWN, ask CJ.
- Every dose calculation MUST enforce the max dose cap. Weight-based
  result exceeding max dose is a critical bug, not an edge case.
- New drugs must match the existing medications.js schema exactly.
  Read the file first; never guess the format.
- Chart template wording ported from dental-charting.html (procedure S/O/A/P
  text, hint/empty-state copy) must stay VERBATIM. Don't edit clinical
  phrasing while refactoring; run `node scripts/check-data-parity.mjs` after
  touching src/chart/data/*.
- No PHI fields anywhere in the app. Patient state (weightKg, chart field
  values, anesthesia inputs) is session-only — never written to
  localStorage/sessionStorage — and must reset on page refresh by design.
- Anesthesia max-dose has one source of truth: src/medications.js (already
  governs the Dosage tab). src/chart/data/anesthetics.js must not introduce
  a second, possibly conflicting max — leave `maxMgPerKg`/`absoluteMaxMg` as
  `null` (UNKNOWN) until medications.js covers that agent.
- Clinical reference tool: correctness > features > style.

## Commands
- dev: npm run dev / build: npm run build / lint: npm run lint
- Build + lint must pass before any commit (claude-gate hook).

## Deploy
- GitHub Actions → GitHub Pages, auto-deploys on push to main.
  Never merge to main without CJ's approval.
