import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { OPTIONS } from "./data/dropdownOptions";

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
  const [style, setStyle] = useState({ top: 0, left: 0, visibility: "hidden" });
  const popRef = useRef(null);

  useLayoutEffect(() => {
    const anchor = anchorRef.current;
    const pop = popRef.current;
    if (!anchor || !pop) return;
    const r = anchor.getBoundingClientRect();
    let top = r.bottom + 6;
    let left = r.left;
    const w = pop.offsetWidth;
    const h = pop.offsetHeight;
    if (left + w > window.innerWidth - 12) left = window.innerWidth - w - 12;
    if (top + h > window.innerHeight - 12) top = r.top - h - 6;
    setStyle({ top, left: Math.max(12, left), visibility: "visible" });
  }, [anchorRef]);

  useEffect(() => {
    function handleOutside(e) {
      if (popRef.current && !popRef.current.contains(e.target) && !anchorRef.current?.contains(e.target)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [anchorRef, onClose]);

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
      style={{ position: "fixed", top: style.top, left: style.left, visibility: style.visibility }}
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
