// Parses "{ph}" placeholders out of a template string into text/field parts,
// assigning each field a globally-unique id (shared counter across a whole
// procedure version) so React state can key on it. Mirrors the prototype's
// fieldify() (dental-charting.html L697) but produces data instead of HTML.
function tokenizeText(text, counter) {
  const parts = [];
  const re = /\{([^}]+)\}/g;
  let lastIndex = 0;
  let match;
  while ((match = re.exec(text))) {
    if (match.index > lastIndex) {
      parts.push({ type: "text", value: text.slice(lastIndex, match.index) });
    }
    parts.push({ type: "field", ph: match[1], id: `f${counter.next++}` });
    lastIndex = re.lastIndex;
  }
  if (lastIndex < text.length) {
    parts.push({ type: "text", value: text.slice(lastIndex) });
  }
  return parts;
}

export function tokenizeVersion(version) {
  const counter = { next: 0 };
  return {
    S: tokenizeText(version.S, counter),
    O: tokenizeText(version.O, counter),
    A: tokenizeText(version.A, counter),
    P: version.P.map((step) => tokenizeText(step, counter)),
  };
}

export function flattenTokens(tokens) {
  return [...tokens.S, ...tokens.O, ...tokens.A, ...tokens.P.flat()];
}
