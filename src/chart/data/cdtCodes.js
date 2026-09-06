// CDT code mapping per procedure key (matches FACTORY_TEMPLATES category/item keys).
// Not present in dental-charting.html — CJ has not provided codes yet, so every
// procedure starts with an empty array. UNKNOWN, not guessed; fill in as CJ confirms.
export const CDT_CODES = {
  restorative: {
    direct_resto: [],
    indirect_resto: [],
    fixed_pros: [],
    removable_pros: [],
    ssc: [],
  },
  endo: {
    pulpotomy: [],
    pulpectomy: [],
    vpt: [],
    rct: [],
    apicoectomy: [],
  },
  surgical: {
    extraction: [],
    implant_surg: [],
    implant_resto: [],
    sinus: [],
    bone_graft: [],
    gbr: [],
  },
  perio: {
    srp: [],
    perio_maint: [],
    gtr: [],
    crown_length: [],
    frenectomy: [],
    ctg: [],
    fgg: [],
  },
  general: {
    checkup: [],
    ortho: [],
    tmd: [],
  },
};
