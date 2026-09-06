// Anesthetic agent specs for the chart's AnesthesiaRow (carpule count -> mg, max-dose warning).
// concentrationMgMl is derived from the % label itself (e.g. "4% Articaine" = 40 mg/mL) —
// arithmetic, not a clinical claim. maxMgPerKg / absoluteMaxMg are clinical limits and stay
// null (UNKNOWN) unless they match medications.js, the single source of truth for max doses.
export const CARPULE_ML = 1.7;

export const ANESTHETICS = [
  {
    name: "2% Lidocaine 1:100,000 epi",
    concentrationMgMl: 20,
    maxMgPerKg: 4.4,
    absoluteMaxMg: 500,
  },
  {
    name: "2% Lidocaine 1:50,000 epi",
    concentrationMgMl: 20,
    maxMgPerKg: null,
    absoluteMaxMg: null,
  },
  {
    name: "4% Articaine 1:100,000 epi",
    concentrationMgMl: 40,
    maxMgPerKg: null,
    absoluteMaxMg: null,
  },
  {
    name: "4% Articaine 1:200,000 epi",
    concentrationMgMl: 40,
    maxMgPerKg: null,
    absoluteMaxMg: null,
  },
  {
    name: "3% Mepivacaine plain",
    concentrationMgMl: 30,
    maxMgPerKg: null,
    absoluteMaxMg: null,
  },
  {
    name: "0.5% Bupivacaine 1:200,000 epi",
    concentrationMgMl: 5,
    maxMgPerKg: null,
    absoluteMaxMg: null,
  },
];
