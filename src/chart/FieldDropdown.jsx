import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import useAnchoredPopover from "./useAnchoredPopover";

// Anchored option list + free-text fallback for a single {ph} token.
// Positioning/dismissal come from useAnchoredPopover, which mirrors the
// prototype's positionDD() (dental-charting.html L725-731).
export default function FieldDropdown({ label, options, value, onSelect, onClose, anchorRef }) {
  const [custom, setCustom] = useState(value || "");
  const [highlight, setHighlight] = useState(-1);
  const { popRef: ddRef, popStyle } = useAnchoredPopover(anchorRef, onClose);

  useEffect(() => {
    const dd = ddRef.current;
    if (options.length) dd?.focus();
    else dd?.querySelector("input")?.focus();
  }, [options.length, ddRef]);

  function commitCustom() {
    const v = custom.trim();
    if (v) onSelect(v);
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
    if (e.key === "Enter" && highlight >= 0) {
      e.preventDefault();
      onSelect(options[highlight]);
    }
  }

  return createPortal(
    <div
      className="dropdown"
      ref={ddRef}
      style={popStyle}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="dd-head">{label}</div>
      <div className="dd-opts">
        {options.length ? (
          options.map((opt, i) => (
            <div
              key={opt}
              className={`dd-opt${i === highlight ? " hl" : ""}`}
              onClick={() => onSelect(opt)}
              onMouseEnter={() => setHighlight(i)}
            >
              {opt}
            </div>
          ))
        ) : (
          <div className="dd-opt dd-opt-empty">Type a value below</div>
        )}
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
          Set
        </button>
      </div>
    </div>,
    document.body
  );
}
