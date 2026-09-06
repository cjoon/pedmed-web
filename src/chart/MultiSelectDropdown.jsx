import { useState } from "react";
import { createPortal } from "react-dom";
import useAnchoredPopover from "./useAnchoredPopover";

// Multi-select editor for a "{+ph}" blank: check off as many findings as apply,
// in the order chosen, plus free text for anything off-list. Not in the
// prototype, where S/O were fixed sentences.
export default function MultiSelectDropdown({ label, options, value, onApply, onClose, anchorRef }) {
  const [selected, setSelected] = useState(() => (Array.isArray(value) ? value : value ? [value] : []));
  const [custom, setCustom] = useState("");
  const [highlight, setHighlight] = useState(-1);
  const { popRef, popStyle } = useAnchoredPopover(anchorRef, onClose);

  function toggle(opt) {
    setSelected((prev) => (prev.includes(opt) ? prev.filter((o) => o !== opt) : [...prev, opt]));
  }

  function commitCustom() {
    const v = custom.trim();
    if (!v) return;
    setSelected((prev) => (prev.includes(v) ? prev : [...prev, v]));
    setCustom("");
  }

  function handleKeyDown(e) {
    if (e.key === "Escape") {
      onClose();
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => Math.min(h + 1, options.length - 1));
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    }
    if ((e.key === " " || e.key === "Enter") && highlight >= 0) {
      e.preventDefault();
      toggle(options[highlight]);
    }
  }

  return createPortal(
    <div
      className="dropdown multi-select"
      ref={popRef}
      style={popStyle}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="dd-head">{label}</div>
      <div className="dd-opts">
        {options.map((opt, i) => {
          const on = selected.includes(opt);
          return (
            <div
              key={opt}
              className={`dd-opt multi-opt${i === highlight ? " hl" : ""}${on ? " on" : ""}`}
              onClick={() => toggle(opt)}
              onMouseEnter={() => setHighlight(i)}
            >
              <span className="multi-box" aria-hidden="true">
                {on ? "✓" : ""}
              </span>
              {opt}
            </div>
          );
        })}
        {selected
          .filter((v) => !options.includes(v))
          .map((v) => (
            <div key={v} className="dd-opt multi-opt on" onClick={() => toggle(v)}>
              <span className="multi-box" aria-hidden="true">
                ✓
              </span>
              {v}
            </div>
          ))}
      </div>
      <div className="dd-custom">
        <input
          type="text"
          placeholder="Custom…"
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          onKeyDown={(e) => {
            e.stopPropagation();
            if (e.key === "Enter") {
              e.preventDefault();
              commitCustom();
            }
            if (e.key === "Escape") onClose();
          }}
        />
        <button type="button" onClick={commitCustom}>
          Add
        </button>
      </div>
      <div className="dd-custom">
        <button type="button" className="tooth-apply" onClick={() => onApply(selected)}>
          {selected.length ? `Apply ${selected.length} selected` : "Clear"}
        </button>
      </div>
    </div>,
    document.body
  );
}
