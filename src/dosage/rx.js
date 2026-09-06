import { formatMg, formatMl, formatTablets } from "../calculations";
import { RX_FREQUENCIES } from "./rxOptions";

// Builds the prescription draft out of an already-capped dose. This module
// performs no dose arithmetic of its own — doseMg/volumeMl/tablets arrive from
// calculateDose(), which owns the max-dose caps (see CLAUDE.md domain rules).

// medications.js phrases frequency as "Every 8 hours" / "Once daily — Day 1".
// Match it case-insensitively against the sig list; when there is no match
// (Azithromycin's day-specific text) keep the medication's own wording and put
// it at the top of the dropdown, so medications.js stays the single source.
export function frequencyOptionsFor(medFrequency) {
  if (!medFrequency) return { options: RX_FREQUENCIES, selected: RX_FREQUENCIES[0] };
  const match = RX_FREQUENCIES.find((f) => f.toLowerCase() === medFrequency.toLowerCase());
  if (match) return { options: RX_FREQUENCIES, selected: match };
  return { options: [medFrequency, ...RX_FREQUENCIES], selected: medFrequency };
}

export function buildInitialRx({ med, formulation, result, doseMg, volumeMl, tablets, weightKg }) {
  const drug = [med?.genericName, formulation?.label].filter(Boolean).join(" ");

  let dose = "";
  if (doseMg != null) {
    if (result?.tabletMg && tablets != null) {
      dose = `${formatTablets(tablets)} tab (${formatMg(doseMg)} mg)`;
    } else if (volumeMl != null) {
      dose = `${formatMl(volumeMl)} mL (${formatMg(doseMg)} mg)`;
    } else {
      dose = `${formatMg(doseMg)} mg`;
    }
  }

  // Never assert a route we don't know: the carpule-dispensed agents
  // (Lidocaine) are injected, not oral, so leave the route for the user rather
  // than printing "by mouth" on an injectable.
  const oral = med?.dispensingUnit?.volumeMl !== 1.7;

  return {
    drug,
    weightKg: weightKg != null ? `${weightKg.toFixed(1)} kg` : "",
    dose,
    route: oral ? "by mouth" : "",
    frequency: frequencyOptionsFor(result?.frequency).selected,
    disp: "",
    refills: "0",
    notes: "",
  };
}

export function buildRxText(fields) {
  const lines = ["Rx"];
  if (fields.drug) lines.push(fields.drug);
  if (fields.weightKg) lines.push(`Weight: ${fields.weightKg}`);
  lines.push(`Sig: ${[fields.dose, fields.route, fields.frequency].filter(Boolean).join(" ")}`.trim());
  lines.push(`Disp: ${fields.disp || "________"}`);
  lines.push(`Refills: ${fields.refills || "0"}`);
  if (fields.notes) lines.push(`Notes: ${fields.notes}`);
  return lines.join("\n");
}
