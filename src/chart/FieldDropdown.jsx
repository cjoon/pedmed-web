import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

// Anchored option list + free-text fallback for a single {ph} token.
// Positioning/flip-up logic mirrors the prototype's positionDD()
// (dental-charting.html L725-731).
export default function FieldDropdown({ label, options, value, onSelect, onClose, anchorRef }) {
  const [custom, setCustom] = useState(value || "");
  const [highlight, setHighlight] = useState(-1);
  const [style, setStyle] = useState({ top: 0, left: 0, visibility: "hidden" });
  const ddRef = useRef(null);

  useLayoutEffect(() => {
    const anchor = anchorRef.current;
    const dd = ddRef.current;
    if (!anchor || !dd) return;
    const r = anchor.getBoundingClientRect();
    let top = r.bottom + 6;
    let left = r.left;
    const w = dd.offsetWidth;
    const h = dd.offsetHeight;
    if (left + w > window.innerWidth - 12) left = window.innerWidth - w - 12;
    if (top + h > window.innerHeight - 12) top = r.top - h - 6;
    setStyle({ top, left: Math.max(12, left), visibility: "visible" });
  }, [anchorRef]);

  useEffect(() => {
    const dd = ddRef.current;
    if (options.length) dd?.focus();
    else dd?.querySelector("input")?.focus();
  }, [options.length]);

  useEffect(() => {
    function handleOutside(e) {
      if (ddRef.current && !ddRef.current.contains(e.target) && !anchorRef.current?.contains(e.target)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [anchorRef, onClose]);

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
      style={{ position: "fixed", top: style.top, left: style.left, visibility: style.visibility }}
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
