import SoapRow from "./SoapRow";
import AnesthesiaRow from "./AnesthesiaRow";
import CdtRow from "./CdtRow";

const SOAP_NAMES = { S: "Subjective", O: "Objective", A: "Assessment", P: "Plan" };

export default function ChartCard({
  item,
  version,
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
  const verLabel = item.versions.length > 1 ? ` — ${version.label}` : "";
  return (
    <div className="chart-card">
      <div className="chart-head">
        <div className="name">
          {item.name}
          {verLabel}
        </div>
        <div className="cat">{item.tag}</div>
      </div>
      <div className="soap-block">
        <SoapRow letter="S" name={SOAP_NAMES.S} parts={tokens.S} fieldValues={fieldValues} onSetField={onSetField} />
        <SoapRow letter="O" name={SOAP_NAMES.O} parts={tokens.O} fieldValues={fieldValues} onSetField={onSetField} />
        <SoapRow letter="A" name={SOAP_NAMES.A} parts={tokens.A} fieldValues={fieldValues} onSetField={onSetField} />
        <SoapRow letter="P" name={SOAP_NAMES.P} steps={tokens.P} fieldValues={fieldValues} onSetField={onSetField} />
      </div>
      {showAnesthesia && <AnesthesiaRow anesthesia={anesthesia} onChange={onSetAnesthesia} weightKg={weightKg} />}
      <CdtRow codes={cdtCodes} onAdd={onAddCdt} onRemove={onRemoveCdt} />
    </div>
  );
}
