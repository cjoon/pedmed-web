import { FACTORY_TEMPLATES } from "./initialTemplates.js";
import { SO_OVERRIDES } from "./soOverrides.js";
import { MULTI_FIELDS } from "./soOptions.js";

// Imports carry explicit .js extensions so scripts/check-data-parity.mjs can
// load this module under plain node, not just through Vite.
// The procedure list the UI actually renders: the verbatim prototype data with
// the S/O lines replaced by the multi-select versions. Everything else (name,
// tag, version labels, A, P) is copied through untouched, and the checks below
// fail loudly at module load if an override drifts out of sync.
function assert(condition, message) {
  if (!condition) throw new Error(`soOverrides.js: ${message}`);
}

function buildTemplates() {
  const out = {};
  for (const [catKey, cat] of Object.entries(FACTORY_TEMPLATES)) {
    const items = {};
    for (const [itemKey, item] of Object.entries(cat.items)) {
      const overrides = SO_OVERRIDES[catKey]?.[itemKey] ?? {};
      for (const versionId of Object.keys(overrides)) {
        assert(
          item.versions.some((v) => v.id === versionId),
          `${catKey}/${itemKey}/${versionId} has no matching version in initialTemplates.js`
        );
      }
      items[itemKey] = {
        ...item,
        versions: item.versions.map((version) => {
          const override = overrides[version.id];
          if (!override) return { ...version, P: [...version.P] };
          const extraKeys = Object.keys(override).filter((k) => k !== "S" && k !== "O");
          assert(
            extraKeys.length === 0,
            `${catKey}/${itemKey}/${version.id} may only override S and O (got ${extraKeys.join(", ")})`
          );
          for (const text of [override.S, override.O]) {
            for (const match of text.matchAll(/\{\+([^}]+)\}/g)) {
              assert(
                MULTI_FIELDS[match[1]],
                `${catKey}/${itemKey}/${version.id} references unknown multi-select group "${match[1]}"`
              );
            }
          }
          return { ...version, S: override.S, O: override.O, P: [...version.P] };
        }),
      };
    }
    out[catKey] = { ...cat, items };
  }
  return out;
}

export const TEMPLATES = buildTemplates();
