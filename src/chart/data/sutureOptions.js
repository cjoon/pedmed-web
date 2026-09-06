// Suture size + material pickers for the {suture} token. Not in the prototype,
// where {suture} was one flat dropdown mixing sizes and materials
// (OPTIONS.suture in dropdownOptions.js, left untouched — that file is verbatim).
// List confirmed by CJ, 2026-09-06. Value format: "<size> <material>", e.g. "4-0 silk".
export const SUTURE_SIZES = ["3-0", "4-0", "5-0", "6-0"];

export const SUTURE_MATERIALS = [
  "silk",
  "chromic gut",
  "plain gut",
  "PGA (Vicryl)",
  "PTFE",
  "nylon",
  "polypropylene",
];
