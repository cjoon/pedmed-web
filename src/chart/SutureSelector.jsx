import { useState } from "react";
import { createPortal } from "react-dom";
import { SUTURE_SIZES, SUTURE_MATERIALS } from "./data/sutureOptions";
import useAnchoredPopover from "./useAnchoredPopover";
import { parseSuture, formatSuture, isSutureSize } from "./suture";

// Two-part picker for the {suture} token: gauge + material, joined as
// "4-0 silk". Either half may be left blank, and either may be typed in
// (Custom) when the case needs something off-list.
export default function SutureSelector({ value, onApply, onClose, anchorRef }) {
  const parsed = parseSuture(value);
  const [size, setSize] = useState(parsed.size);
  const [material, setMaterial] = useState(parsed.material);
  const [custom, setCustom] = useState("");
  const { popRef, popStyle } = useAnchoredPopover(anchorRef, onClose);

  function toggle(current, setter, next) {
    setter(current === next ? "" : next);
  }

  function commitCustom() {
    const v = custom.trim();
    if (!v) return;
    if (isSutureSize(v)) setSize(v);
    else setMaterial(v);
    setCustom("");
  }

  return createPortal(
    <div
      className="dropdown suture-selector"
      ref={popRef}
      style={popStyle}
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => {
        if (e.key === "Escape") onClose();
      }}
    >
      <div className="dd-head">Suture size</div>
      <div className="suture-chips">
        {SUTURE_SIZES.map((s) => (
          <button
            type="button"
            key={s}
            className={`suture-chip${size === s ? " active" : ""}`}
            onClick={() => toggle(size, setSize, s)}
          >
            {s}
          </button>
        ))}
      </div>
      <div className="dd-head">Suture material</div>
      <div className="suture-chips">
        {SUTURE_MATERIALS.map((m) => (
          <button
            type="button"
            key={m}
            className={`suture-chip${material === m ? " active" : ""}`}
            onClick={() => toggle(material, setMaterial, m)}
          >
            {m}
          </button>
        ))}
      </div>
      <div className="dd-custom">
        <input
          type="text"
          placeholder="Custom size or material…"
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
        <button type="button" className="tooth-apply" onClick={() => onApply(formatSuture(size, material))}>
          {size || material ? `Apply ${formatSuture(size, material)}` : "Clear"}
        </button>
      </div>
    </div>,
    document.body
  );
}
