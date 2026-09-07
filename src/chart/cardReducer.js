// Shared card state for the Chart and Visit Note tabs: the filled-in blanks,
// the CDT chips and the anesthesia calculator inputs. Session-only — nothing
// here is ever persisted (PHI-safety, see CLAUDE.md).
export const initialCard = {
  fieldValues: {},
  cdtCodes: [],
  anesthesia: { agentIdx: null, carpules: "" },
};

export function cardReducer(state, action) {
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
