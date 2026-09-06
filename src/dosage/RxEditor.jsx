import { RX_ROUTES, RX_REFILLS } from "./rxOptions";

// Step 2 of the Dosage tab's calc → rx → final flow. Every field is editable;
// route/frequency/refills are dropdowns per CJ's request, the rest free text.
export default function RxEditor({ fields, onChange, frequencyOptions, onBack, onDone }) {
  const set = (key) => (e) => onChange({ ...fields, [key]: e.target.value });

  return (
    <section className="card rx-form">
      <h2 className="section-title">Prescription</h2>

      <label className="rx-row">
        <span className="rx-label">Drug</span>
        <input className="rx-input" type="text" value={fields.drug} onChange={set("drug")} />
      </label>

      <label className="rx-row">
        <span className="rx-label">Weight</span>
        <input className="rx-input" type="text" value={fields.weightKg} onChange={set("weightKg")} />
      </label>

      <label className="rx-row">
        <span className="rx-label">Dose</span>
        <input className="rx-input" type="text" value={fields.dose} onChange={set("dose")} />
      </label>

      {/* A list-backed input, not a plain select: the suggestions cover the oral
          and injection routes, and anything else can still be typed — a route
          that cannot be entered would leave injectables with a blank sig. */}
      <label className="rx-row">
        <span className="rx-label">Route</span>
        <input
          className="rx-input"
          type="text"
          list="rx-routes"
          placeholder="Select or type a route"
          value={fields.route}
          onChange={set("route")}
        />
        <datalist id="rx-routes">
          {RX_ROUTES.map((r) => (
            <option key={r} value={r} />
          ))}
        </datalist>
      </label>

      <label className="rx-row">
        <span className="rx-label">Frequency</span>
        <select className="select" value={fields.frequency} onChange={set("frequency")}>
          {frequencyOptions.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>
      </label>

      <label className="rx-row">
        <span className="rx-label">Disp</span>
        <input
          className="rx-input"
          type="text"
          placeholder="e.g. 150 mL"
          value={fields.disp}
          onChange={set("disp")}
        />
      </label>

      <label className="rx-row">
        <span className="rx-label">Refills</span>
        <select className="select" value={fields.refills} onChange={set("refills")}>
          {(RX_REFILLS.includes(fields.refills) ? RX_REFILLS : [fields.refills, ...RX_REFILLS]).map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </label>

      <label className="rx-row">
        <span className="rx-label">Notes</span>
        <input
          className="rx-input"
          type="text"
          placeholder="optional"
          value={fields.notes}
          onChange={set("notes")}
        />
      </label>

      <div className="step-actions">
        <button type="button" className="step-btn" onClick={onBack}>
          ← Back
        </button>
        <button type="button" className="step-btn primary" onClick={onDone}>
          Done
        </button>
      </div>
    </section>
  );
}
