import { useEffect, useLayoutEffect, useRef, useState } from "react";

// Shared positioning + dismiss logic for the token popovers (dropdown, tooth,
// suture, multi-select). Behavior is unchanged from the original inline copies
// in FieldDropdown/ToothSelector, which mirrored the prototype's positionDD()
// (dental-charting.html L725-731): anchor below the field, flip up or shift
// left when it would overflow the viewport, close on an outside mousedown.
export default function useAnchoredPopover(anchorRef, onClose) {
  const popRef = useRef(null);
  const [style, setStyle] = useState({ top: 0, left: 0, visibility: "hidden" });

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

  return { popRef, popStyle: { position: "fixed", top: style.top, left: style.left, visibility: style.visibility } };
}
