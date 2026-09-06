import { useMemo, useReducer, useState } from "react";
import { FACTORY_TEMPLATES } from "./data/initialTemplates";
import { CDT_CODES } from "./data/cdtCodes";
import { tokenizeVersion, flattenTokens } from "./tokenize";
import { getPlainChart } from "./serializer";
import Sidebar from "./Sidebar";
import ChartCard from "./ChartCard";
import "./chart.css";

function findVersion(catKey, key, versionId) {
  const item = FACTORY_TEMPLATES[catKey]?.items[key];
  if (!item) return null;
  const version = item.versions.find((v) => v.id === versionId) ?? item.versions[0];
  return { item, version };
}

const initialCard = { fieldValues: {}, cdtCodes: [], anesthesia: { agentIdx: null, carpules: "" } };

function cardReducer(state, action) {
  switch (action.type) {
    case "reset":
      return { fieldValues: {}, cdtCodes: action.cdtCodes, anesthesia: { agentIdx: null, carpules: "" } };
    case "setField": {
      const next = { ...state.fieldValues, [action.id]: action.value };
      // Tooth sync: filling one tooth token backfills every other *empty*
      // tooth token, mirroring the prototype's setFieldValue (L705) — but
      // never overwrites a tooth the user already set individually.
      if (action.ph === "tooth") {
        for (const otherId of action.toothIds) {
          if (otherId !== action.id && !state.fieldValues[otherId]) next[otherId] = action.value;
        }
      }
      return { ...state, fieldValues: next };
    }
    case "addCdt":
      return state.cdtCodes.includes(action.code) ? state : { ...state, cdtCodes: [...state.cdtCodes, action.code] };
    case "removeCdt":
      return { ...state, cdtCodes: state.cdtCodes.filter((c) => c !== action.code) };
    case "setAnesthesia":
      return { ...state, anesthesia: { ...state.anesthesia, ...action.value } };
    default:
      return state;
  }
}

export default function ChartView({ weightKg }) {
  const [search, setSearch] = useState("");
  const [active, setActive] = useState(null);
  const [mobilePanel, setMobilePanel] = useState("list");
  const [card, dispatch] = useReducer(cardReducer, initialCard);
  const [copyStatus, setCopyStatus] = useState("");

  const selected = active ? findVersion(active.catKey, active.key, active.versionId) : null;
  const tokens = useMemo(() => (selected ? tokenizeVersion(selected.version) : null), [selected]);
  const flatTokens = useMemo(() => (tokens ? flattenTokens(tokens) : []), [tokens]);
  const toothIds = useMemo(
    () => flatTokens.filter((p) => p.type === "field" && p.ph === "tooth").map((p) => p.id),
    [flatTokens]
  );
  const showAnesthesia = useMemo(
    () => flatTokens.some((p) => p.type === "field" && (p.ph === "anesthetic" || p.ph === "dose")),
    [flatTokens]
  );
  const totalFields = flatTokens.filter((p) => p.type === "field").length;
  const filledFields = Object.values(card.fieldValues).filter(Boolean).length;

  function selectProc(catKey, key, versionId) {
    setActive({ catKey, key, versionId });
    dispatch({ type: "reset", cdtCodes: CDT_CODES[catKey]?.[key] ?? [] });
    setMobilePanel("chart");
  }

  function handleReset() {
    if (!active) return;
    dispatch({ type: "reset", cdtCodes: CDT_CODES[active.catKey]?.[active.key] ?? [] });
  }

  async function handleCopy() {
    if (!selected || !tokens) return;
    const verLabel = selected.item.versions.length > 1 ? ` — ${selected.version.label}` : "";
    const text = getPlainChart({
      procedureName: selected.item.name + verLabel,
      tokens,
      fieldValues: card.fieldValues,
      cdtCodes: card.cdtCodes,
    });
    await navigator.clipboard.writeText(text);
    setCopyStatus("Chart copied to clipboard");
    setTimeout(() => setCopyStatus(""), 2000);
  }

  return (
    <div className="chart">
      <Sidebar
        search={search}
        onSearch={setSearch}
        active={active}
        onSelect={selectProc}
        className={mobilePanel === "list" ? "mob-visible" : ""}
      />
      <div className={`chart-main${mobilePanel === "chart" ? " mob-visible" : ""}`}>
        <div className="chart-topbar">
          <button type="button" className="mob-back-btn" onClick={() => setMobilePanel("list")}>
            ← Procedures
          </button>
          <div className="chart-topbar-title">
            {selected ? (
              <>
                {selected.item.name}
                {selected.item.versions.length > 1 ? ` — ${selected.version.label}` : ""}
              </>
            ) : (
              "Select a procedure"
            )}
          </div>
          {selected && (
            <>
              <span className="field-count">
                {filledFields}/{totalFields} filled
              </span>
              <button type="button" className="chart-action-btn" onClick={handleReset}>
                Clear
              </button>
              <button type="button" className="chart-action-btn primary" onClick={handleCopy}>
                Copy chart
              </button>
            </>
          )}
        </div>
        <div className="chart-scroll">
          {selected && tokens ? (
            <>
              <ChartCard
                item={selected.item}
                version={selected.version}
                tokens={tokens}
                fieldValues={card.fieldValues}
                onSetField={(id, ph, value) => dispatch({ type: "setField", id, ph, value, toothIds })}
                cdtCodes={card.cdtCodes}
                onAddCdt={(code) => dispatch({ type: "addCdt", code })}
                onRemoveCdt={(code) => dispatch({ type: "removeCdt", code })}
                showAnesthesia={showAnesthesia}
                anesthesia={card.anesthesia}
                onSetAnesthesia={(value) => dispatch({ type: "setAnesthesia", value })}
                weightKg={weightKg}
              />
              <p className="hint">
                Tap a highlighted blank to choose from a list or type your own · tooth number fills across the
                chart
              </p>
            </>
          ) : (
            <div className="chart-empty">
              <div className="chart-empty-title">Pick a procedure to begin</div>
              <p>
                Choose from the list on the left.
                <br />
                Tap highlighted blanks to select from a dropdown or type your own.
              </p>
            </div>
          )}
        </div>
      </div>
      {copyStatus && <div className="toast">{copyStatus}</div>}
    </div>
  );
}
