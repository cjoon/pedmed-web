# PROGRESS — ChartRx

Running record of what is built and what is next. PLAN.md holds the original
integration roadmap and the phase checklists; this file is the short version
plus the backlog that came out of chairside use.

Live: https://cjoon.github.io/pedcalc-web/ (auto-deploys on push to `main`)
Stack: React 19 + Vite, plain CSS, no state library. Session-only patient data.

---

## Shipped

| Date | Commit | What |
|---|---|---|
| 2026-09-05 | `1fb24f1` | Ported `FACTORY_TEMPLATES` / `OPTIONS` / `PH_LABELS` verbatim from the `dental-charting.html` prototype, with `scripts/check-data-parity.mjs` to prove they stay identical |
| 2026-09-05 | `43bf79b` | Split the app shell from the dosage calculator: tab switch, shared `weightKg`, ChartRx palette, footer disclaimer replacing the full-screen gate |
| 2026-09-05 | `3a635b3` | Initial Chart tab: sidebar with search and version pills, SOAP card, clickable `{ph}` blanks with dropdown / tooth picker, anesthesia dose check, CDT chips, plain-text copy |
| 2026-09-06 | `60f69f5` | File map and domain rules in CLAUDE.md / AGENTS.md |
| 2026-09-06 | `cc357dc` | Review/finalize steps, suture picker, Rx flow, S/O multi-select (details below) |
| 2026-09-06 | `7ff2c15` | Endo O line split into clinical findings + AAE pulpal Dx + AAE periapical Dx |
| 2026-09-06 | `44a8295` | Periodontal diagnosis: 2017 World Workshop (extent / stage / grade optional) and 1999 AAP |

### What the last three commits added

**Three-step flow, both tabs.** Chart goes fill → edit → final: `Next` builds
the plain-text note from the filled blanks, the draft is freely editable, and
the final step is read-only with Copy. Dosage goes calc → rx → final, where the
final step also prints. Shared components live in `src/shared/`.

**Prescriptions.** `src/dosage/rx.js` formats the already-capped values from
`calculations.js` and performs no dose math of its own. A formulation must be
selected before prescribing, and injectables get no default oral route.

**Suture.** `{suture}` opens a size + material picker producing `4-0 silk`.

**Multi-select findings.** New `{+ph}` token renders a findings picker; all 32
procedure versions have rewritten S/O lines in `src/chart/data/soOverrides.js`,
layered over the untouched verbatim `initialTemplates.js` by `templates.js`.
Groups marked `single: true` (the diagnostic categories) behave as radio lists.

**Optional blanks.** `{?+ph}` disappears from the note when left empty, so
modifiers that only apply to some diagnoses (periodontal stage and grade) do not
print a `[ph]` placeholder. `MULTI_FIELDS` entries can carry `prefix`/`suffix`
so a label such as `1999 AAP:` vanishes together with its value.

### Awaiting CJ's clinical review

- `src/chart/data/soOptions.js` — the S/O finding vocabulary. Diagnostic
  categories follow published classifications (AAE consensus terminology, 2017
  World Workshop, 1999 AAP); the surrounding chairside findings are drafts.
- `src/dosage/rxOptions.js` — sig wording (routes, frequencies, refills).
- `src/chart/data/cdtCodes.js` — still empty per procedure. UNKNOWN until CJ
  provides the mapping; nothing is guessed.
- Max mg/kg for Articaine, Mepivacaine and Bupivacaine remain `null` in
  `src/chart/data/anesthetics.js`. Only Lidocaine is confirmed, via
  `medications.js`.

---

## Next

### 1. Drop unfilled blanks when advancing a step

**Today:** pressing `Next` serializes an unfilled required blank as a literal
`[anesthetic]` placeholder, so the draft carries bracket text the clinician has
to delete by hand. Only blanks written as `{?+ph}` disappear on their own.

**Wanted:** advancing to the edit step removes every blank left empty, whether
or not it is marked optional, and tidies what is left behind.

Points to settle before building it:

- **Punctuation and spacing.** Removing a blank mid-sentence leaves stray
  commas, semicolons and doubled spaces. `serializer.js` already collapses
  whitespace; it needs a pass that also drops orphaned separators and a space
  before `.` `,` `;`.
- **Whole lines.** A plan step such as `LA: {anesthetic} {dose}` with both
  blanks empty should drop the entire bullet, not print `LA:`.
- **Required blanks.** Silently deleting a blank the clinician meant to fill is
  a real risk in a clinical note. Options: show a confirmation listing what will
  be dropped, or keep `[ph]` for a small set of genuinely required blanks.
  Decide with CJ before implementing.
- **Counter.** `filled/total` counts required blanks only; that logic already
  exists in `ChartView.jsx` and should drive whatever warning is shown.

Same behavior applies to the Rx step, where an empty `Disp` currently prints
`________`.

### 2. Smaller items

- Mobile (375px): the chart topbar title overlaps the `0/10 filled` counter.
  Pre-existing layout bug, not caused by the recent work.
- SRP's Assessment line is prototype text (`Generalized {stage} periodontitis.`)
  and now duplicates the periodontal diagnosis in O. A and P are never
  overridden by design, so changing this needs a decision first.
- From PLAN.md: Visit Notes (v1.1), Settings with template editing and
  export/import (v1.2), PWA (v2.0).

---

## Verification

```
npm run build                        # exit 0
npm run lint                         # exit 0
node scripts/check-data-parity.mjs   # prototype data unchanged; only S/O differ
~/dotfiles/claude/bin/claude-gate full
```

Workflow per CLAUDE.md: build and lint pass → Codex review (`/review`) → fix
P0/P1 → merge to `main` only with CJ's approval, since that deploys.
