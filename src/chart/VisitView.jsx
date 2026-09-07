import { useMemo, useReducer, useState } from "react";
import { VN_TEMPLATES } from "./data/visitTemplates";
import { VN_EXTRA_OPTIONS } from "./data/visitOptions";
import { OPTIONS, PH_LABELS } from "./data/dropdownOptions";
import { CDT_CODES } from "./data/cdtCodes";
import { tokenizeVisit, flattenTokens } from "./tokenize";
import { getPlainVisit } from "./serializer";
import { isFilled } from "./fieldValue";
import { cardReducer, initialCard } from "./cardReducer";
import { FieldOptionsContext } from "./FieldOptionsContext";
import Sidebar from "./Sidebar";
import VisitCard from "./VisitCard";
import DraftEditor from "../shared/DraftEditor";
import FinalOutput from "../shared/FinalOutput";
import "./chart.css";

// Same merge the prototype performs at L1320: the Visit Note vocabulary wins
// over the shared OPTIONS for keys both define ({complaint} is the notable one).
const VISIT_FIELD_OPTIONS = {
  options: { ...OPTIONS, ...VN_EXTRA_OPTIONS },
  labels: PH_LABELS,
};

function findVisit(catKey, key, visitId) {
  const item = VN_TEMPLATES[catKey]?.items[key];
  if (!item) return null;
  const visit = item.visits.find((v) => v.id === visitId) ?? item.visits[0];
  return { item, visit };
}

function today() {
  // Local date, not UTC — toISOString() would roll over a day early west of
  // Greenwich, which is where this is used.
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export default function VisitView({ weightKg }) {
  const [search, setSearch] = useState("");
  const [active, setActive] = useState(null);
  const [mobilePanel, setMobilePanel] = useState("list");
  const [card, dispatch] = useReducer(cardReducer, initialCard);
  const [step, setStep] = useState("fill");
  const [draftText, setDraftText] = useState("");
  // Session-only, like every other patient value here — never persisted.
  const [date, setDate] = useState(today);

  const selected = active ? findVisit(active.catKey, active.key, active.versionId) : null;
  const tokens = useMemo(() => (selected ? tokenizeVisit(selected.visit) : null), [selected]);
  const flatTokens = useMemo(() => (tokens ? flattenTokens(tokens) : []), [tokens]);
  const toothIds = useMemo(
    () => flatTokens.filter((p) => p.type === "field" && p.ph === "tooth").map((p) => p.id),
    [flatTokens]
  );
  const showAnesthesia = useMemo(
    () => flatTokens.some((p) => p.type === "field" && (p.ph === "anesthetic" || p.ph === "dose")),
    [flatTokens]
  );
  const requiredIds = useMemo(
    () => flatTokens.filter((p) => p.type === "field" && !p.optional).map((p) => p.id),
    [flatTokens]
  );
  const totalFields = requiredIds.length;
  const filledFields = requiredIds.filter((id) => isFilled(card.fieldValues[id])).length;

  function selectVisit(catKey, key, visitId) {
    setActive({ catKey, key, versionId: visitId });
    dispatch({ type: "reset", cdtCodes: CDT_CODES[catKey]?.[key] ?? [] });
    setStep("fill");
    setDraftText("");
    setMobilePanel("chart");
  }

  function handleReset() {
    if (!active) return;
    dispatch({ type: "reset", cdtCodes: CDT_CODES[active.catKey]?.[active.key] ?? [] });
    setStep("fill");
    setDraftText("");
  }

  function handleNext() {
    if (!selected || !tokens) return;
    setDraftText(
      getPlainVisit({
        procedureName: selected.item.name,
        visitLabel: selected.visit.label,
        date,
        tokens,
        fieldValues: card.fieldValues,
        cdtCodes: card.cdtCodes,
      })
    );
    setStep("edit");
  }

  return (
    <FieldOptionsContext.Provider value={VISIT_FIELD_OPTIONS}>
      <div className="chart">
        <Sidebar
          templates={VN_TEMPLATES}
          search={search}
          onSearch={setSearch}
          active={active}
          onSelect={selectVisit}
          className={mobilePanel === "list" ? "mob-visible" : ""}
        />
        <div className={`chart-main${mobilePanel === "chart" ? " mob-visible" : ""}`}>
          <div className="chart-topbar">
            <button type="button" className="mob-back-btn" onClick={() => setMobilePanel("list")}>
              ← Procedures
            </button>
            <div className="chart-topbar-title">
              {selected ? `${selected.item.name} · ${selected.visit.label}` : "Select a procedure"}
            </div>
            {selected && step === "fill" && (
              <>
                <span className="field-count">
                  {filledFields}/{totalFields} filled
                </span>
                <button type="button" className="chart-action-btn" onClick={handleReset}>
                  Clear
                </button>
                <button type="button" className="chart-action-btn primary" onClick={handleNext}>
                  Next
                </button>
              </>
            )}
          </div>
          <div className="chart-scroll">
            {selected && tokens && step === "edit" && (
              <DraftEditor
                title="Review & edit"
                text={draftText}
                onChange={setDraftText}
                onBack={() => setStep("fill")}
                onDone={() => setStep("final")}
                hint="Edit freely. Going back and pressing Next again rebuilds this from the blanks."
              />
            )}
            {selected && tokens && step === "final" && (
              <FinalOutput title="Final visit note" text={draftText} onBack={() => setStep("edit")} />
            )}
            {selected && tokens && step === "fill" ? (
              <>
                <VisitCard
                  item={selected.item}
                  visit={selected.visit}
                  visits={selected.item.visits}
                  onSelectVisit={(visitId) => selectVisit(active.catKey, active.key, visitId)}
                  date={date}
                  onDateChange={setDate}
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
                  Pick the visit at the top, then tap a highlighted blank · tooth number fills across the note
                </p>
              </>
            ) : step === "fill" ? (
              <div className="chart-empty">
                <div className="chart-empty-title">Pick a procedure to begin</div>
                <p>
                  Choose from the list on the left.
                  <br />
                  Multi-visit procedures show a tab per visit at the top of the note.
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </FieldOptionsContext.Provider>
  );
}
