// Plain-text chart format, matching the prototype's getPlainChart() desktop
// path verbatim (dental-charting.html L946-957): title + "=" underline, then
// "S: text" lines and a "P:\n  - step" list, blank line between sections.
// The MVP adds one line for CDT codes, which the prototype does not have.
import { displayValue, isFilled } from "./fieldValue";

function renderParts(parts, fieldValues) {
  return parts
    .map((part) => {
      if (part.type === "text") return part.value;
      const value = fieldValues[part.id];
      if (isFilled(value)) return displayValue(part.ph, value);
      return part.optional ? "" : `[${part.ph}]`;
    })
    .join("")
    .replace(/\s+/g, " ")
    .trim();
}

export function getPlainChart({ procedureName, tokens, fieldValues, cdtCodes }) {
  let out = `${procedureName}\n${"=".repeat(procedureName.length)}\n\n`;

  out += `S: ${renderParts(tokens.S, fieldValues)}\n\n`;
  out += `O: ${renderParts(tokens.O, fieldValues)}\n\n`;
  out += `A: ${renderParts(tokens.A, fieldValues)}\n\n`;
  out += `P:\n${tokens.P.map((step) => `  - ${renderParts(step, fieldValues)}`).join("\n")}\n\n`;

  if (cdtCodes.length) {
    out += `CDT: ${cdtCodes.join(", ")}\n\n`;
  }

  return out.trim();
}
