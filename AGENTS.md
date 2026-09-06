# pedcalc-med — Pediatric Dosage Calculator + ChartRx (web)

## Overview
Weight-based pediatric drug dosage calculator, being merged with a SOAP
charting template tool (ChartRx). React + Vite SPA, deployed to GitHub
Pages: cjoon.github.io/pedcalc-web. See PLAN.md for the integration roadmap.

## Roles
- Claude writes and edits all code.
- Codex reviews only — reads diffs, reports defects, never edits.
- After each PLAN.md phase: build/lint pass → Codex review (`/review`) →
  fix P0/P1 → next phase. P2/P3 are reported and left alone.

## File Map
- src/medications.js   : drug database (name, mg/kg, max dose, forms, sig/disp)
- src/calculations.js  : weight-based dosing logic
- src/App.jsx          : main UI component
- src/Disclaimer.jsx   : legal/clinical disclaimer
- src/main.jsx         : entry point

## Domain Rules (NEVER violate)
- Drug data follows AAPD Reference Manual 2025-2026. Never invent doses,
  concentrations, or sig instructions. Missing value = UNKNOWN, ask CJ.
- Every dose calculation MUST enforce the max dose cap. Weight-based
  result exceeding max dose is a critical bug, not an edge case.
- New drugs must match the existing medications.js schema exactly.
  Read the file first; never guess the format.
- Clinical reference tool: correctness > features > style.

## Commands
- dev: npm run dev / build: npm run build / lint: npm run lint
- Build + lint must pass before any commit (claude-gate hook).

## Deploy
- GitHub Actions → GitHub Pages, auto-deploys on push to main.
  Never merge to main without CJ's approval.
