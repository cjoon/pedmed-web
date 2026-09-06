// Pure helpers for the {suture} token value, kept out of SutureSelector.jsx so
// that file only exports a component. Value format: "<size> <material>".
const SIZE_RE = /^\d+-0$/;

export function isSutureSize(text) {
  return SIZE_RE.test(text);
}

export function parseSuture(value) {
  if (!value) return { size: "", material: "" };
  const parts = value.trim().split(/\s+/);
  if (parts.length && isSutureSize(parts[0])) {
    return { size: parts[0], material: parts.slice(1).join(" ") };
  }
  return { size: "", material: value.trim() };
}

export function formatSuture(size, material) {
  return [size, material].filter(Boolean).join(" ");
}
