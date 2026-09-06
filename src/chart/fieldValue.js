import { MULTI_FIELDS } from "./data/soOptions";

// A field value is a string for a normal {ph} blank and an array of selected
// findings for a multi-select {+ph} blank. These helpers keep the difference in
// one place: an empty array counts as unfilled, and arrays render joined by the
// separator the field group declares (", " for symptoms, "; " for findings).
export function isFilled(value) {
  return Array.isArray(value) ? value.length > 0 : Boolean(value);
}

export function displayValue(ph, value) {
  if (!isFilled(value)) return "";
  if (!Array.isArray(value)) return value;
  return value.join(MULTI_FIELDS[ph]?.sep ?? ", ");
}
