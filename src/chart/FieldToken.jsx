import { useRef, useState } from "react";
import FieldDropdown from "./FieldDropdown";
import ToothSelector from "./ToothSelector";
import SutureSelector from "./SutureSelector";
import MultiSelectDropdown from "./MultiSelectDropdown";
import { OPTIONS, PH_LABELS } from "./data/dropdownOptions";
import { MULTI_FIELDS } from "./data/soOptions";
import { displayValue, isFilled } from "./fieldValue";

// The clickable "{ph}" blank in a SOAP line. Clicking toggles its editor
// (dropdown or, for tooth, the multi-select ToothSelector) — mirrors the
// prototype's .fld click behavior (dental-charting.html L700/708). Using a
// real <button> also gives free native Tab-order movement between fields,
// which the prototype (plain clickable <span>s) never had; the ":focus-visible"
// check below opens the editor on keyboard-Tab arrival without also
// double-toggling on a mouse click (a plain click's resulting focus is not
// ":focus-visible" in evergreen browsers).
export default function FieldToken({ id, ph, value, multi = false, optional = false, onSetField }) {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef(null);

  function handleFocus(e) {
    if (e.target.matches(":focus-visible")) setOpen(true);
  }

  function handleKeyDown(e) {
    if (e.key === "Escape" && open) setOpen(false);
  }

  function close() {
    setOpen(false);
  }

  function commit(v) {
    onSetField(id, ph, v);
    close();
  }

  return (
    <button
      type="button"
      ref={anchorRef}
      className={`fld${isFilled(value) ? " filled" : ""}${open ? " open" : ""}${
        optional && !isFilled(value) ? " optional" : ""
      }`}
      title={optional && !isFilled(value) ? "Optional — leave empty to drop it from the note" : undefined}
      onClick={() => setOpen((o) => !o)}
      onFocus={handleFocus}
      onKeyDown={handleKeyDown}
    >
      {isFilled(value) ? displayValue(ph, value) : <span className="ph">{ph}</span>}
      <svg className="caret" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
        <path d="m6 9 6 6 6-6" />
      </svg>
      {open &&
        (multi ? (
          <MultiSelectDropdown
            label={MULTI_FIELDS[ph]?.label ?? ph}
            options={MULTI_FIELDS[ph]?.options ?? []}
            single={MULTI_FIELDS[ph]?.single ?? false}
            value={value}
            onApply={commit}
            onClose={close}
            anchorRef={anchorRef}
          />
        ) : ph === "tooth" ? (
          <ToothSelector value={value} onApply={commit} onClose={close} anchorRef={anchorRef} />
        ) : ph === "suture" ? (
          <SutureSelector value={value} onApply={commit} onClose={close} anchorRef={anchorRef} />
        ) : (
          <FieldDropdown
            label={PH_LABELS[ph] ?? ph}
            options={OPTIONS[ph] ?? []}
            value={value}
            onSelect={commit}
            onClose={close}
            anchorRef={anchorRef}
          />
        ))}
    </button>
  );
}
