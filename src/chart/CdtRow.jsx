import { useState } from "react";

// Not in the prototype — CDT codes aren't in dental-charting.html at all
// (see src/chart/data/cdtCodes.js). Default chips come from that per-procedure
// list (currently empty pending CJ's mapping); users can add/remove ad hoc.
export default function CdtRow({ codes, onAdd, onRemove }) {
  const [input, setInput] = useState("");

  function commit() {
    const v = input.trim();
    if (v) {
      onAdd(v);
      setInput("");
    }
  }

  return (
    <div className="cdt-row">
      <div className="soap-name">CDT codes</div>
      <div className="cdt-chips">
        {codes.map((code) => (
          <span key={code} className="cdt-chip">
            {code}
            <button type="button" onClick={() => onRemove(code)} aria-label={`Remove ${code}`}>
              &times;
            </button>
          </span>
        ))}
        <input
          type="text"
          className="cdt-input"
          placeholder="+ Add code"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              commit();
            }
          }}
          onBlur={commit}
        />
      </div>
    </div>
  );
}
