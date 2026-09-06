// Prescription wording for the Rx step. These are sig phrases, not dosing data:
// every mg/mL number still comes from medications.js via calculations.js.
// Drafted 2026-09-06 for CJ's review.
import { OPTIONS } from "../chart/data/dropdownOptions";
export const RX_ORAL_ROUTES = [
  "by mouth",
  "by mouth with food",
  "by mouth as needed for pain",
  "by mouth as needed for pain/fever",
];

// Injection routes for the carpule-dispensed agents. Taken from OPTIONS.technique
// so the injection wording has a single source — that list is the prototype's,
// kept verbatim in src/chart/data/dropdownOptions.js.
export const RX_ROUTES = [...RX_ORAL_ROUTES, ...OPTIONS.technique];

export const RX_FREQUENCIES = [
  "every 4 hours",
  "every 4–6 hours",
  "every 6 hours",
  "every 6–8 hours",
  "every 8 hours",
  "every 12 hours",
  "once daily",
  "twice daily",
  "three times daily",
  "four times daily",
];

export const RX_REFILLS = ["0", "1", "2", "3"];
