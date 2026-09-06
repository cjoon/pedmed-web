// S/O rewrites layered over FACTORY_TEMPLATES so the original prototype data in
// initialTemplates.js stays byte-identical (see scripts/check-data-parity.mjs).
// Only the S and O lines change; A and P are untouched.
//
// What changed and why: the prototype hard-coded symptoms and findings into the
// sentence. Here each S/O carries a "{+group}" multi-select blank (vocabulary in
// soOptions.js) so findings are picked per patient. Structural blanks that are
// single-valued or numeric ({surface}, {grade}, {pd}, {height}, …) are kept as
// they were. Only {symptom} (VPT) and {complaint} (Ortho) were absorbed into
// their multi-select groups. Drafted 2026-09-06 for CJ's review.
//
// Endo O lines carry three blanks: the chairside/radiographic findings, then
// the AAE pulpal and periapical diagnostic categories (soOptions.js).
// Perio procedures and the recall exam end with the 2017 World Workshop
// periodontal diagnosis. Extent, stage and grade are optional blanks ("{?+…}")
// because staging and grading apply to periodontitis only — for peri-implant
// conditions, gingivitis or health they are left empty and drop out of the note.
// A second optional blank holds the older 1999 AAP diagnosis for charts that
// still use it; it carries its own "1999 AAP:" label and closing period.
export const SO_OVERRIDES = {
  restorative: {
    direct_resto: {
      v1: {
        S: "Px c/o {+restoSx} #{tooth}.",
        O: "#{tooth} {surface} caries, ICDAS {grade}; {+restoFindings}.",
      },
    },
    indirect_resto: {
      v1: {
        S: "Px for #{tooth} {restoType}; {+restoSx}.",
        O: "#{tooth} {+restoFindings}.",
      },
    },
    fixed_pros: {
      v1: {
        S: "Px for #{tooth} crown prep; {+restoSx}.",
        O: "#{tooth} {existing} restoration; {+restoFindings}.",
      },
    },
    removable_pros: {
      v1: {
        S: "Px for {prosType} fabrication; {+prosSx}.",
        O: "{archDesc}. {kennedy}; {+prosFindings}.",
      },
    },
    ssc: {
      v1: {
        S: "Pediatric Px, #{tooth} (primary); {+restoSx}.",
        O: "#{tooth} {+restoFindings}.",
      },
    },
  },
  endo: {
    pulpotomy: {
      v1: {
        S: "#{tooth} c/o {+pulpalSx}.",
        O: "#{tooth} {+clinicalFindings}. Pulpal: {+pulpalDx}; Periapical: {+periapicalDx}.",
      },
    },
    pulpectomy: {
      v1: {
        S: "#{tooth} c/o {+pulpalSx}.",
        O: "#{tooth} {+clinicalFindings}. Pulpal: {+pulpalDx}; Periapical: {+periapicalDx}.",
      },
    },
    vpt: {
      v1: {
        S: "#{tooth} c/o {+pulpalSx}.",
        O: "#{tooth} {exposure}; {+clinicalFindings}. Pulpal: {+pulpalDx}; Periapical: {+periapicalDx}.",
      },
      v2: {
        S: "#{tooth} c/o {+pulpalSx}.",
        O: "#{tooth} {+clinicalFindings}. Pulpal: {+pulpalDx}; Periapical: {+periapicalDx}.",
      },
    },
    rct: {
      v1: {
        S: "#{tooth} c/o {+pulpalSx}.",
        O: "#{tooth} {+clinicalFindings}. Pulpal: {+pulpalDx}; Periapical: {+periapicalDx}.",
      },
    },
    apicoectomy: {
      v1: {
        S: "#{tooth} c/o {+pulpalSx}.",
        O: "#{tooth} {+clinicalFindings}. Pulpal: {+pulpalDx}; Periapical: {+periapicalDx}.",
      },
    },
  },
  surgical: {
    extraction: {
      v1: {
        S: "Px c/o {+surgSx} #{tooth}.",
        O: "#{tooth} {+surgFindings}.",
      },
      v2: {
        S: "Px c/o {+surgSx} #{tooth}.",
        O: "#{tooth} {+surgFindings}.",
      },
    },
    implant_surg: {
      v1: {
        S: "Px c/o {+surgSx} #{tooth}.",
        O: "#{tooth} CBCT: ridge width {width}mm, height {height}mm; {+surgFindings}.",
      },
    },
    implant_resto: {
      v1: {
        S: "#{tooth} implant, {months} mo post-placement; {+surgSx}.",
        O: "#{tooth} {+surgFindings}.",
      },
    },
    sinus: {
      v1: {
        S: "Px for #{tooth} implant; {+surgSx}.",
        O: "CBCT: #{tooth} residual height {height}mm; {+surgFindings}.",
      },
      v2: {
        S: "Px for #{tooth} implant; {+surgSx}.",
        O: "CBCT: #{tooth} residual height {height}mm; {+surgFindings}.",
      },
    },
    bone_graft: {
      v1: {
        S: "#{tooth} {+surgSx}.",
        O: "#{tooth} {wallDesc} socket; {+surgFindings}.",
      },
      v2: {
        S: "#{tooth} area, {+surgSx}.",
        O: "{+surgFindings}.",
      },
    },
    gbr: {
      v1: {
        S: "Px for #{tooth} implant placement; {+surgSx}.",
        O: "#{tooth} site, {defect} expected. CBCT: {boneDesc}; {+surgFindings}.",
      },
      v2: {
        S: "#{tooth} {+surgSx}.",
        O: "#{tooth} site, {defect}. CBCT: {boneDesc}; {+surgFindings}.",
      },
    },
  },
  perio: {
    srp: {
      v1: {
        S: "Px {+perioSx}.",
        O: "Perio charting: generalized PD {pd}mm, bone loss {boneloss}%; {+perioFindings}. Perio Dx: {?+perioExtent} {?+perioStage} {?+perioGrade} {+perioDx}. {?+perioDx1999}",
      },
    },
    perio_maint: {
      v1: {
        S: "Px {+perioSx}.",
        O: "Re-charting: localized residual PD {pd}mm at {sites}; BOP {bop}%; {+perioFindings}. Perio Dx: {?+perioExtent} {?+perioStage} {?+perioGrade} {+perioDx}. {?+perioDx1999}",
      },
    },
    gtr: {
      v1: {
        S: "#{tooth} {+perioSx}.",
        O: "#{tooth} {wall} intrabony defect, PD {pd}mm; {+perioFindings}. Perio Dx: {?+perioExtent} {?+perioStage} {?+perioGrade} {+perioDx}. {?+perioDx1999}",
      },
    },
    crown_length: {
      v1: {
        S: "Px c/o {+perioSx}.",
        O: "{+perioFindings}. Perio Dx: {?+perioExtent} {?+perioStage} {?+perioGrade} {+perioDx}. {?+perioDx1999}",
      },
      v2: {
        S: "#{tooth} {+perioSx}.",
        O: "#{tooth} {+perioFindings}. Perio Dx: {?+perioExtent} {?+perioStage} {?+perioGrade} {+perioDx}. {?+perioDx1999}",
      },
    },
    frenectomy: {
      v1: {
        S: "Px c/o {+perioSx}.",
        O: "Prominent {frenum} frenum; {+perioFindings}. Perio Dx: {?+perioExtent} {?+perioStage} {?+perioGrade} {+perioDx}. {?+perioDx1999}",
      },
    },
    ctg: {
      v1: {
        S: "#{tooth} {+perioSx}.",
        O: "#{tooth} {recClass} recession {recAmount}mm; {+perioFindings}. Perio Dx: {?+perioExtent} {?+perioStage} {?+perioGrade} {+perioDx}. {?+perioDx1999}",
      },
    },
    fgg: {
      v1: {
        S: "#{tooth} {+perioSx}.",
        O: "#{tooth} inadequate KT (<{kt}mm); {+perioFindings}. Perio Dx: {?+perioExtent} {?+perioStage} {?+perioGrade} {+perioDx}. {?+perioDx1999}",
      },
    },
  },
  general: {
    checkup: {
      v1: {
        S: "Px for {+examSx}.",
        O: "{+examFindings} ({xray}). Perio Dx: {?+perioExtent} {?+perioStage} {?+perioGrade} {+perioDx}. {?+perioDx1999}",
      },
    },
    ortho: {
      v1: {
        S: "Px c/o {+orthoSx}.",
        O: "{classification}, crowding {crowding}mm, OJ {oj}mm, OB {ob}%; {+orthoFindings}.",
      },
    },
    tmd: {
      v1: {
        S: "Px c/o {+tmdSx}.",
        O: "MIO {mio}mm, {deviation}, {tmjFinding}; {+tmdFindings}.",
      },
    },
  },
};
