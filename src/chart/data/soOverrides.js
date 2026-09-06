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
        O: "#{tooth} {+pulpalFindings}.",
      },
    },
    pulpectomy: {
      v1: {
        S: "#{tooth} c/o {+pulpalSx}.",
        O: "#{tooth} {+pulpalFindings}.",
      },
    },
    vpt: {
      v1: {
        S: "#{tooth} c/o {+pulpalSx}.",
        O: "#{tooth} {exposure}; {+pulpalFindings}.",
      },
      v2: {
        S: "#{tooth} c/o {+pulpalSx}.",
        O: "#{tooth} {+pulpalFindings}.",
      },
    },
    rct: {
      v1: {
        S: "#{tooth} c/o {+pulpalSx}.",
        O: "#{tooth} {+pulpalFindings}.",
      },
    },
    apicoectomy: {
      v1: {
        S: "#{tooth} c/o {+pulpalSx}.",
        O: "#{tooth} {+pulpalFindings}.",
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
        O: "Perio charting: generalized PD {pd}mm, bone loss {boneloss}%; {+perioFindings}.",
      },
    },
    perio_maint: {
      v1: {
        S: "Px {+perioSx}.",
        O: "Re-charting: localized residual PD {pd}mm at {sites}; BOP {bop}%; {+perioFindings}.",
      },
    },
    gtr: {
      v1: {
        S: "#{tooth} {+perioSx}.",
        O: "#{tooth} {wall} intrabony defect, PD {pd}mm; {+perioFindings}.",
      },
    },
    crown_length: {
      v1: {
        S: "Px c/o {+perioSx}.",
        O: "{+perioFindings}.",
      },
      v2: {
        S: "#{tooth} {+perioSx}.",
        O: "#{tooth} {+perioFindings}.",
      },
    },
    frenectomy: {
      v1: {
        S: "Px c/o {+perioSx}.",
        O: "Prominent {frenum} frenum; {+perioFindings}.",
      },
    },
    ctg: {
      v1: {
        S: "#{tooth} {+perioSx}.",
        O: "#{tooth} {recClass} recession {recAmount}mm; {+perioFindings}.",
      },
    },
    fgg: {
      v1: {
        S: "#{tooth} {+perioSx}.",
        O: "#{tooth} inadequate KT (<{kt}mm); {+perioFindings}.",
      },
    },
  },
  general: {
    checkup: {
      v1: {
        S: "Px for {+examSx}.",
        O: "{+examFindings} ({xray}).",
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
