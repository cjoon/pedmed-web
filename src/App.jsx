import { useState, useEffect } from "react";
import { medications } from "./medications";
import {
  calculateDose,
  getEffectiveRegimen,
  lbsToKg,
  isCleanVolume,
  formatMl,
  formatMg,
  formatTablets,
} from "./calculations";
import Disclaimer from "./Disclaimer";
import "./App.css";

export default function App() {
  const [accepted, setAccepted] = useState(() => localStorage.getItem("disclaimerAccepted") === "true");
  const [weightInput, setWeightInput] = useState("");
  const [unit, setUnit] = useState("kg");
  const [selectedMed, setSelectedMed] = useState(null);
  const [selectedFormulation, setSelectedFormulation] = useState(null);
  const [selectedRegimen, setSelectedRegimen] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedDoseMg, setSelectedDoseMg] = useState(null);

  function handleAccept() {
    localStorage.setItem("disclaimerAccepted", "true");
    setAccepted(true);
  }

  function handleMedSelect(med) {
    setSelectedMed(med);
    setSelectedFormulation(null);
    setSelectedRegimen(null);
    setSelectedDay(null);
    setSelectedDoseMg(null);
  }

  function handleFormulationChange(e) {
    const idx = parseInt(e.target.value, 10);
    const f = selectedMed.formulationOptions?.[idx] ?? null;
    setSelectedFormulation(isNaN(idx) ? null : f);
    setSelectedRegimen(null);
    setSelectedDoseMg(null);
  }

  const weightKg =
    weightInput === "" ? null : unit === "kg" ? parseFloat(weightInput) : lbsToKg(parseFloat(weightInput));
  const weightKgDisplay = weightKg != null && !isNaN(weightKg) && weightKg > 0 ? weightKg : null;

  // Reset selected dose when weight changes
  useEffect(() => { setSelectedDoseMg(null); }, [weightKgDisplay, selectedDay, selectedRegimen]);

  const effectiveRegimen =
    selectedMed?.dosingRegimens
      ? getEffectiveRegimen(selectedMed, selectedRegimen, selectedFormulation)
      : null;

  const result =
    selectedMed && weightKgDisplay
      ? calculateDose(selectedMed, weightKgDisplay, selectedFormulation, selectedRegimen, selectedDay)
      : null;

  const showTablets = result?.tabletMg != null;
  const showLiquid = result?.volumeMl != null;

  // Build dose options in 0.5 mL steps between min and max
  function getDoseOptions() {
    if (!result) return null;
    if (showLiquid && result.minDoseMg) {
      const minMl = result.minDoseMg / result.concentration;
      const maxMl = result.volumeMl;
      if (maxMl <= minMl + 0.05) return null;
      const opts = [];
      let v = parseFloat(minMl.toFixed(1));
      while (v <= maxMl + 0.05) {
        opts.push(parseFloat(v.toFixed(1)));
        v = parseFloat((v + 0.5).toFixed(1));
      }
      const unitVol = result.dispensingUnit?.volumeMl ?? 5;
      return opts.length > 1
        ? opts.map((ml) => ({
            mg: parseFloat((ml * result.concentration).toFixed(1)),
            ml,
            clean: isCleanVolume(ml, unitVol),
          }))
        : null;
    }
    if (showTablets && result.minDoseMg && result.tabletMg) {
      const minTabs = Math.ceil(result.minDoseMg / result.tabletMg);
      const maxTabs = Math.floor(result.doseMg / result.tabletMg);
      if (maxTabs <= minTabs) return null;
      const opts = [];
      for (let t = minTabs; t <= maxTabs; t++) {
        opts.push({ mg: t * result.tabletMg, tabs: t });
      }
      return opts.length > 1 ? opts : null;
    }
    return null;
  }

  const doseOptions = getDoseOptions();

  // Active dose: user selection, or last (max) option, or calculated max
  const defaultDoseMg = doseOptions ? doseOptions[doseOptions.length - 1].mg : result?.doseMg ?? null;
  const activeDoseMg = selectedDoseMg ?? defaultDoseMg;
  const activeVolumeMl = showLiquid && activeDoseMg && result
    ? activeDoseMg / result.concentration
    : result?.volumeMl ?? null;
  const activeTablets = showTablets && activeDoseMg && result?.tabletMg
    ? activeDoseMg / result.tabletMg
    : result?.tablets ?? null;

  if (!accepted) return <Disclaimer onAccept={handleAccept} />;

  return (
    <div className="app">
      <header className="header">
        <h1 className="header-title">PedMed</h1>
        <p className="header-subtitle">Pediatric Dosage Calculator</p>
      </header>

      <main className="main">
        {/* Weight Section */}
        <section className="card">
          <h2 className="section-title">Patient Weight</h2>
          <div className="weight-row">
            <input
              className="weight-input no-spinner"
              type="number"
              min="0"
              step="0.1"
              placeholder="Enter weight"
              value={weightInput}
              onChange={(e) => setWeightInput(e.target.value)}
            />
            <div className="unit-toggle">
              {["kg", "lbs"].map((u) => (
                <button
                  key={u}
                  className={`unit-btn${unit === u ? " active" : ""}`}
                  onClick={() => setUnit(u)}
                >
                  {u}
                </button>
              ))}
            </div>
          </div>
          {weightKgDisplay && unit === "lbs" && (
            <p className="conversion">≈ {weightKgDisplay.toFixed(2)} kg</p>
          )}
          {weightKgDisplay && unit === "kg" && (
            <p className="conversion">≈ {(weightKgDisplay / 0.453592).toFixed(1)} lbs</p>
          )}
        </section>

        {/* Medication Selection */}
        <section className="card">
          <h2 className="section-title">Medication</h2>
          <div className="med-list">
            {medications.map((med) => (
              <button
                key={med.id}
                className={`med-btn${selectedMed?.id === med.id ? " active" : ""}`}
                onClick={() => handleMedSelect(med)}
              >
                <div className="med-btn-text">
                  <span className="med-name">{med.name}</span>
                  <span className="med-generic">{med.genericName}</span>
                </div>
                {selectedMed?.id === med.id && <span className="checkmark">✓</span>}
              </button>
            ))}
          </div>
        </section>

        {/* Formulation Picker */}
        {selectedMed?.formulationOptions && (
          <section className="card">
            <h2 className="section-title">Formulation</h2>
            <select
              className="select"
              value={
                selectedFormulation
                  ? selectedMed.formulationOptions.indexOf(selectedFormulation)
                  : ""
              }
              onChange={handleFormulationChange}
            >
              <option value="">Select formulation…</option>
              {selectedMed.formulationOptions.map((f, i) => (
                <option key={i} value={i}>
                  {f.label}
                </option>
              ))}
            </select>
          </section>
        )}

        {/* Dosing Regimen Picker */}
        {selectedMed?.dosingRegimens && selectedFormulation?.tabletMg !== 875 && (
          <section className="card">
            <h2 className="section-title">Dosing Regimen</h2>
            <select
              className="select"
              value={effectiveRegimen?.id ?? ""}
              onChange={(e) => {
                const r = selectedMed.dosingRegimens.find((x) => x.id === e.target.value);
                setSelectedRegimen(r ?? null);
              }}
            >
              {selectedMed.dosingRegimens.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.label}
                </option>
              ))}
            </select>
          </section>
        )}

        {/* Results */}
        {result && (
          <section className="card results-card">
            <h2 className="section-title">
              {result.adult ? "Adult Dose" : "Calculated Dose"}
            </h2>
            {result.adult && (
              <p className="adult-badge">Weight &gt;40 kg — using adult dose</p>
            )}

            {/* Day picker for Azithromycin */}
            {selectedMed?.dayDoses && (
              <div className="day-picker">
                {selectedMed.dayDoses.map((d) => (
                  <button
                    key={d.id}
                    className={`day-btn${(selectedDay?.id ?? selectedMed.dayDoses[0].id) === d.id ? " active" : ""}`}
                    onClick={() => setSelectedDay(d)}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            )}

            <div className="results-table">
              {/* Per dose — dropdown if range exists, static otherwise */}
              <div className="result-row highlight">
                <span className="result-label">Per dose</span>
                {doseOptions ? (
                  <select
                    className="dose-select"
                    value={activeDoseMg ?? result.doseMg}
                    onChange={(e) => setSelectedDoseMg(parseFloat(e.target.value))}
                  >
                    {doseOptions.map((opt) => (
                      <option key={opt.mg} value={opt.mg}>
                        {opt.clean ? "✓ " : ""}{formatMg(opt.mg)} mg
                      </option>
                    ))}
                  </select>
                ) : (
                  <span className="result-value">{formatMg(activeDoseMg)} mg</span>
                )}
              </div>

              {showTablets && (
                <ResultRow label="Tablets" value={`${formatTablets(activeTablets)} tab`} />
              )}

              {showLiquid && (
                <>
                  <ResultRow label="Volume" value={`${formatMl(activeVolumeMl)} mL`} />
                  {result.dispensingUnit && (
                    <ResultRow
                      label={result.dispensingUnit.volumeMl === 1.7 ? "Carpules" : "Teaspoons"}
                      value={`${formatMl(activeVolumeMl / result.dispensingUnit.volumeMl)} ${
                        result.dispensingUnit.volumeMl === 1.7 ? "Carpule" : "tsp"
                      }`}
                    />
                  )}
                </>
              )}

              {result.dosesPerDay > 1 && (
                <ResultRow
                  label="Per day total"
                  value={`${formatMg(activeDoseMg * result.dosesPerDay)} mg`}
                />
              )}

              <ResultRow label="Frequency" value={result.frequency} />
              <ResultRow label="Max per day" value={`${formatMg(result.maxDailyMg)} mg`} />

              {selectedMed?.absoluteMaxMg && (
                <ResultRow label="Absolute max" value={`${selectedMed.absoluteMaxMg} mg`} />
              )}
            </div>

            <div className="warnings">
              {result.maxDosesPerDay != null && result.maxDosesPerDay > 1 && (
                <p className="warning-text">⚠ Max {result.maxDosesPerDay} doses per 24 hours</p>
              )}
              {result.maxTabletsPerDay != null && (
                <p className="warning-text">⚠ Max {result.maxTabletsPerDay} tablets per 24 hours</p>
              )}
              {selectedMed?.warning && <p className="warning-text">⚠ {selectedMed.warning}</p>}
              {result.adult && selectedMed?.adultNote && (
                <p className="warning-text info">ℹ {selectedMed.adultNote}</p>
              )}
            </div>

            <div className="result-disclaimer">
              For reference only. Verify all doses with a licensed healthcare provider.
              Based on AAPD Reference Manual 2025–2026.
            </div>
          </section>
        )}
      </main>

      <footer className="footer">
        PedMed Dosage Calculator · Clinical reference only
      </footer>
    </div>
  );
}

function ResultRow({ label, value }) {
  return (
    <div className="result-row">
      <span className="result-label">{label}</span>
      <span className="result-value">{value}</span>
    </div>
  );
}
