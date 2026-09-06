import { useEffect, useState } from "react";
import DosageCalculator from "./dosage/DosageCalculator";
import ChartView from "./chart/ChartView";
import "./App.css";

const TABS = [
  { id: "chart", label: "Initial Chart", mobileLabel: "Chart" },
  { id: "dosage", label: "Dosage", mobileLabel: "Dosage" },
];

export default function App() {
  const [mode, setMode] = useState("chart");
  // Shared across tabs (session-only, never persisted — PHI-safety, matches
  // the "no data stored" footer claim) so Chart's anesthesia calculator can
  // use the weight entered on the Dosage tab.
  const [weightKg, setWeightKg] = useState(null);

  // One-time cleanup: the old full-screen disclaimer gate is gone, so this
  // key from prior versions is dead weight in returning users' localStorage.
  useEffect(() => {
    localStorage.removeItem("disclaimerAccepted");
  }, []);

  return (
    <div className="app">
      <header className="topbar">
        <span className="topbar-brand">ChartRx</span>
        <nav className="topbar-tabs">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              className={`topbar-tab${mode === tab.id ? " active" : ""}`}
              onClick={() => setMode(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </header>

      <div className="app-content">
        <div className={mode === "chart" ? "" : "hidden"}>
          <ChartView weightKg={weightKg} />
        </div>
        <div className={mode === "dosage" ? "" : "hidden"}>
          <DosageCalculator onWeightKgChange={setWeightKg} />
        </div>
      </div>

      <footer className="app-footer">
        <span>⚕️ Reference only</span>
        <span>👨‍⚕️ Consult a provider</span>
        <span>📋 AAPD 2025–2026</span>
        <span>⚠️ No liability</span>
        <span>🔒 No data stored</span>
      </footer>

      <nav className="mobile-nav">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`mobile-nav-btn${mode === tab.id ? " active" : ""}`}
            onClick={() => setMode(tab.id)}
          >
            {tab.mobileLabel}
          </button>
        ))}
      </nav>
    </div>
  );
}
