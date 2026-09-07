import { createContext, useContext } from "react";
import { OPTIONS, PH_LABELS } from "./data/dropdownOptions";

// Which dropdown vocabulary a {ph} blank reads from. The Chart tab uses the
// prototype's OPTIONS; the Visit Note tab layers VN_EXTRA_OPTIONS on top,
// exactly as the prototype's `Object.assign({}, ACTIVE_OPTIONS, {…})` does
// (dental-charting.html L1320) — several keys, {complaint} among them, carry a
// different list there.
const DEFAULT_FIELD_OPTIONS = { options: OPTIONS, labels: PH_LABELS };

export const FieldOptionsContext = createContext(DEFAULT_FIELD_OPTIONS);

export function useFieldOptions() {
  return useContext(FieldOptionsContext);
}
