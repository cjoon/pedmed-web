// Verifies that the chart data modules under src/chart/data are byte-for-byte
// equivalent (as JS values) to the literals in the read-only prototype
// dental-charting.html. Run after any edit to initialTemplates.js / dropdownOptions.js.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const prototypePath = path.join(
  process.env.HOME,
  "projects/charting-template/dental-charting.html"
);

const html = readFileSync(prototypePath, "utf8");

function extractLiteral(source, startMarker, endMarker) {
  const start = source.indexOf(startMarker);
  if (start === -1) throw new Error(`marker not found: ${startMarker}`);
  const braceStart = source.indexOf("{", start);
  const end = source.indexOf(endMarker, braceStart);
  if (end === -1) throw new Error(`end marker not found: ${endMarker}`);
  const literal = source.slice(braceStart, source.lastIndexOf("}", end) + 1);
  return new Function(`return (${literal});`)();
}

const htmlOptions = extractLiteral(html, "const OPTIONS=", "\nconst DEFAULT_OPTIONS");
const htmlPhLabels = extractLiteral(html, "const PH_LABELS=", "\n\n/* ===== FACTORY TEMPLATES");
const htmlFactoryTemplates = extractLiteral(
  html,
  "const FACTORY_TEMPLATES=",
  "\n\n/* ===== STORAGE"
);

const { OPTIONS } = await import(
  path.join(repoRoot, "src/chart/data/dropdownOptions.js")
);
const { PH_LABELS } = await import(
  path.join(repoRoot, "src/chart/data/dropdownOptions.js")
);
const { FACTORY_TEMPLATES } = await import(
  path.join(repoRoot, "src/chart/data/initialTemplates.js")
);
const { TEMPLATES } = await import(path.join(repoRoot, "src/chart/data/templates.js"));

let ok = true;
function compare(name, expected, actual) {
  const a = JSON.stringify(expected);
  const b = JSON.stringify(actual);
  if (a !== b) {
    ok = false;
    console.error(`MISMATCH: ${name} differs from dental-charting.html`);
  } else {
    console.log(`OK: ${name} matches dental-charting.html`);
  }
}

compare("OPTIONS", htmlOptions, OPTIONS);
compare("PH_LABELS", htmlPhLabels, PH_LABELS);
compare("FACTORY_TEMPLATES", htmlFactoryTemplates, FACTORY_TEMPLATES);

// The rendered TEMPLATES may differ from the prototype in S and O only (that is
// what src/chart/data/soOverrides.js exists for). Everything else — procedure
// names, tags, category labels, version labels, A and P — must still match.
function stripSO(templates) {
  return Object.fromEntries(
    Object.entries(templates).map(([catKey, cat]) => [
      catKey,
      {
        label: cat.label,
        items: Object.fromEntries(
          Object.entries(cat.items).map(([itemKey, item]) => [
            itemKey,
            {
              name: item.name,
              tag: item.tag,
              versions: item.versions.map((v) => ({ id: v.id, label: v.label, A: v.A, P: v.P })),
            },
          ])
        ),
      },
    ])
  );
}

compare("TEMPLATES (excluding S/O)", stripSO(FACTORY_TEMPLATES), stripSO(TEMPLATES));

if (!ok) process.exit(1);
