import { useState } from "react";
import { createPortal } from "react-dom";
import { OPTIONS } from "./data/dropdownOptions";
import useAnchoredPopover from "./useAnchoredPopover";

// Not in the prototype (dental-charting.html has no multi-tooth UI — a
// {tooth} field there is a plain single-value dropdown). Value format
// mirrors PLAN.md's decision: selected teeth join as "3, #14, #19" so that,
// combined with the template's own leading "#", the chart reads "#3, #14, #19".
function parseTeeth(value) {
  if (!value) return [];
  return value
    .split(",")
    .map((s) => s.trim().replace(/^#/, ""))
    .filter(Boolean);
}

export default function ToothSelector({ value, onApply, onClose, anchorRef }) {
  const [selected, setSelected] = useState(() => parseTeeth(value));
  const { popRef, popStyle } = useAnchoredPopover(anchorRef, onClose);

  function toggle(tooth) {
    setSelected((prev) => (prev.includes(tooth) ? prev.filter((t) => t !== tooth) : [...prev, tooth]));
  }

  function apply() {
    onApply(selected.join(", #"));
  }

  return createPortal(
    <div
      className="dropdown tooth-selector"
      ref={popRef}
      style={popStyle}
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => {
        if (e.key === "Escape") onClose();
      }}
    >
      <div className="dd-head">Tooth number</div>
      <div className="tooth-grid">
        {OPTIONS.tooth.map((t) => (
          <button
            type="button"
            key={t}
            className={`tooth-btn${selected.includes(t) ? " active" : ""}`}
            onClick={() => toggle(t)}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="dd-custom">
        <button type="button" className="tooth-apply" onClick={apply}>
          {selected.length ? `Apply #${selected.join(", #")}` : "Clear"}
        </button>
      </div>
    </div>,
    document.body
  );
}
