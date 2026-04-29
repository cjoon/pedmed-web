export const ADULT_WEIGHT_KG = 40;

export function lbsToKg(lbs) {
  return lbs * 0.453592;
}

export function isAdult(weightKg) {
  return weightKg > ADULT_WEIGHT_KG;
}

export function getEffectiveRegimen(medication, selectedRegimen, selectedFormulation) {
  if (!medication.dosingRegimens) return null;
  // 875 mg tablet auto-selects high dose
  if (selectedFormulation?.tabletMg === 875) {
    return medication.dosingRegimens.find((r) => r.id === "high") || medication.dosingRegimens[0];
  }
  return selectedRegimen || medication.dosingRegimens[0];
}

export function calculateDose(medication, weightKg, selectedFormulation, selectedRegimen, selectedDay) {
  if (!weightKg || weightKg <= 0) return null;

  const adult = isAdult(weightKg);
  const regimen = getEffectiveRegimen(medication, selectedRegimen, selectedFormulation);

  // Determine dosePerKg for this context
  let dosePerKg = medication.dosePerKg;
  if (regimen) dosePerKg = regimen.dosePerKg;

  // Day-based dosing (Azithromycin)
  const dayDose = medication.dayDoses
    ? selectedDay || medication.dayDoses[0]
    : null;
  if (dayDose) dosePerKg = dayDose.dosePerKg;

  // Base calculation
  let doseMg = weightKg * dosePerKg;

  // Adult dosing override
  if (adult) {
    if (dayDose) {
      doseMg = dayDose.maxMg ?? doseMg;
    } else if (medication.adultDoseMg) {
      doseMg = medication.adultDoseMg;
    } else if (selectedFormulation?.tabletMg && selectedFormulation?.maxTablets) {
      doseMg = selectedFormulation.tabletMg * selectedFormulation.maxTablets;
    }
  } else {
    // Pediatric: tablet max cap
    if (selectedFormulation?.tabletMg && selectedFormulation?.maxTablets) {
      doseMg = Math.min(doseMg, selectedFormulation.tabletMg * selectedFormulation.maxTablets);
    }
    // Regimen max single dose cap
    if (regimen?.maxSingleDoseMg) {
      doseMg = Math.min(doseMg, regimen.maxSingleDoseMg);
    }
    // Day dose max cap
    if (dayDose?.maxMg) {
      doseMg = Math.min(doseMg, dayDose.maxMg);
    }
    // Medication max single dose
    if (medication.maxSingleDoseMg) {
      doseMg = Math.min(doseMg, medication.maxSingleDoseMg);
    }
  }

  // Absolute max (regardless of weight)
  if (medication.absoluteMaxMg) {
    doseMg = Math.min(doseMg, medication.absoluteMaxMg);
  }

  // Round down if required
  if (medication.roundDown) doseMg = Math.floor(doseMg);

  // Concentration and volume
  const concentration = selectedFormulation?.mgPerMl ?? medication.concentration;
  const tabletMg = selectedFormulation?.tabletMg ?? null;

  const volumeMl = tabletMg ? null : doseMg / concentration;
  const tablets = tabletMg ? doseMg / tabletMg : null;

  // Min dose range (for liquid picker)
  const minDosePerKg = regimen?.minDosePerKg ?? medication.minDosePerKg;
  const minDoseMg = minDosePerKg && !adult ? Math.ceil(weightKg * minDosePerKg) : null;

  // Daily dose info
  const dosesPerDay = regimen?.dosesPerDay ?? medication.dosesPerDay ?? 1;
  const maxDailyMg = adult
    ? medication.adultMaxDailyMg ?? doseMg * dosesPerDay
    : (regimen?.maxDosePerKgPerDay ?? medication.maxDosePerKgPerDay)
      ? weightKg * (regimen?.maxDosePerKgPerDay ?? medication.maxDosePerKgPerDay)
      : doseMg * dosesPerDay;

  const maxDosesPerDay = tabletMg ? null : Math.floor(maxDailyMg / doseMg);
  const maxTabletsPerDay = tabletMg ? Math.floor(maxDailyMg / tabletMg) : null;

  const frequency = dayDose?.frequency ?? regimen?.frequency ?? medication.frequency;

  return {
    doseMg,
    volumeMl,
    tablets,
    tabletMg,
    concentration,
    minDoseMg,
    dosesPerDay,
    maxDailyMg,
    maxDosesPerDay,
    maxTabletsPerDay,
    frequency,
    adult,
    dispensingUnit: medication.dispensingUnit,
  };
}

export function isCleanVolume(ml, unitVol) {
  return Math.abs(ml - Math.round(ml)) < 0.001 || Math.abs(ml / unitVol - Math.round(ml / unitVol)) < 0.001;
}

export function formatMl(ml) {
  if (ml == null) return null;
  return ml % 1 === 0 ? ml.toFixed(0) : ml.toFixed(1);
}

export function formatMg(mg) {
  if (mg == null) return null;
  return mg % 1 === 0 ? mg.toFixed(0) : mg.toFixed(1);
}

export function formatTablets(t) {
  if (t == null) return null;
  return t % 1 === 0 ? t.toFixed(0) : t.toFixed(2);
}
