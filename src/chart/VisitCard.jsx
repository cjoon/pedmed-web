import SoapRow from "./SoapRow";
import AnesthesiaRow from "./AnesthesiaRow";
import CdtRow from "./CdtRow";

const SOAP_NAMES = { S: "Subjective", O: "Objective", A: "Assessment", P: "Procedure Steps" };

// One visit of a multi-visit procedure. The tab strip across the top is the
// visit picker (V1 — Preparation, V2 — Crown Delivery, …); the rest mirrors
// ChartCard, plus the prototype's closing "Outcome & Next Visit" block
// (dental-charting.html L1416).
export default function VisitCard({
  item,
  visit,
  visits,
  onSelectVisit,
  date,
  onDateChange,
  tokens,
  fieldValues,
  onSetField,
  cdtCodes,
  onAddCdt,
  onRemoveCdt,
  showAnesthesia,
  anesthesia,
  onSetAnesthesia,
  weightKg,
}) {
  return (
    <div className="chart-card">
      <div className="chart-head">
        <div className="name">{item.name}</div>
        <div className="cat">{item.tag}</div>
      </div>

      {visits.length > 1 && (
        <div className="visit-tabs" role="tablist" aria-label="Visit">
          {visits.map((v) => (
            <button
              key={v.id}
              type="button"
              role="tab"
              aria-selected={v.id === visit.id}
              className={`visit-tab${v.id === visit.id ? " active" : ""}`}
              onClick={() => onSelectVisit(v.id)}
            >
              {v.label}
            </button>
          ))}
        </div>
      )}

      <div className="visit-date-row">
        <label className="visit-date-label" htmlFor="visit-date">
          Date
        </label>
        <input
          id="visit-date"
          className="visit-date-input"
          type="date"
          value={date}
          onChange={(e) => onDateChange(e.target.value)}
        />
      </div>

      <div className="soap-block">
        <SoapRow letter="S" name={SOAP_NAMES.S} parts={tokens.S} fieldValues={fieldValues} onSetField={onSetField} />
        <SoapRow letter="O" name={SOAP_NAMES.O} parts={tokens.O} fieldValues={fieldValues} onSetField={onSetField} />
        <SoapRow letter="A" name={SOAP_NAMES.A} parts={tokens.A} fieldValues={fieldValues} onSetField={onSetField} />
        <SoapRow letter="P" name={SOAP_NAMES.P} steps={tokens.P} fieldValues={fieldValues} onSetField={onSetField} />
        <SoapRow
          letter="✓"
          name="Outcome"
          parts={tokens.outcome}
          fieldValues={fieldValues}
          onSetField={onSetField}
        />
        <SoapRow
          letter="→"
          name="Next appointment"
          parts={tokens.next}
          fieldValues={fieldValues}
          onSetField={onSetField}
        />
      </div>

      {showAnesthesia && <AnesthesiaRow anesthesia={anesthesia} onChange={onSetAnesthesia} weightKg={weightKg} />}
      <CdtRow codes={cdtCodes} onAdd={onAddCdt} onRemove={onRemoveCdt} />
    </div>
  );
}
