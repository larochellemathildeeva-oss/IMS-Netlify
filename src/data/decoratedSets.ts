import { SETS_V2 as SETS } from "./sets_v2";
import { TraumaSet, Screw, ScrewFamily, PlateFamily } from "../types";

// ---------------------------------------------------------------------------
// LEGACY-SHAPE ADAPTER
// The existing UI reads set.screws (Screw[]) and set.plates (string[]). The v2
// data model uses structured screwFamilies/plateFamilies. These two helpers
// derive the legacy shape from the families so the current UI keeps working
// unchanged during migration. New features (ref cross-reference) read the
// families directly and ignore these derived fields.
// ---------------------------------------------------------------------------

// Collapse a family's individual ScrewSize[] back into the legacy
// "type + lengthRange" summary the old UI expects. Lengths are numeric where
// possible so a contiguous run renders as "10-60" and a lone size as "50".
function familyToLegacyScrew(fam: ScrewFamily): Screw {
  const nums = fam.sizes
    .map((s) => parseFloat(s.length))
    .filter((n) => !isNaN(n))
    .sort((a, b) => a - b);
  const lengthRange =
    nums.length === 0
      ? ""
      : nums.length === 1
      ? `${nums[0]}`
      : `${nums[0]}-${nums[nums.length - 1]}`;
  return {
    type: fam.displayName,
    lengthRange,
    notes: fam.notes,
    // expose a representative ref/status so legacy views that surface them
    // still have something meaningful; per-length detail lives in the family
    ref: fam.sizes[0]?.ref ?? null,
    verificationStatus: fam.sizes[0]?.verificationStatus,
  };
}

// Render a plate family's sizes into the legacy raw-string lines the old UI
// parses, preserving the "#ref" suffix the parser looks for.
function familyToLegacyPlateLines(fam: PlateFamily): string[] {
  return fam.sizes.map((sz) => {
    const dia = fam.diameter ? `${fam.diameter}MM ` : "";
    const holes = sz.holes != null ? `${sz.holes} HOLES ` : "";
    const len = sz.length ? `${sz.length}MM ` : "";
    const ref = sz.ref ? `#${sz.ref}` : "";
    return `PLATES - ${dia}${fam.familyName} ${holes}${len}${ref}`.replace(/\s+/g, " ").trim();
  });
}

export function deriveLegacyShape(set: TraumaSet): { screws: Screw[]; plates: string[] } {
  const screws = set.screwFamilies.map(familyToLegacyScrew);
  const plates = set.plateFamilies.flatMap(familyToLegacyPlateLines);
  return { screws, plates };
}

// Determine material based on actual Synthes properties and set name nomenclature
export function getSetMaterial(set: TraumaSet): "SS" | "Ti" | "Both" {
  const name = set.name.toUpperCase();
  if (name.includes("STAINLESS STEEL") || name.includes("(SS)") || name.includes("SS-")) {
    return "SS";
  }
  if (name.includes("TITANIUM") || name.includes("(TI)") || name.startsWith("TI ")) {
    return "Ti";
  }
  if (set.id.includes("_ss_")) {
    return "SS";
  }
  if (set.id.includes("_ti_") || name.includes("VOLT")) {
    return "Ti";
  }
  
  // Set-by-set precise orthopedic materials mapping for standard hospital inventories
  const materialMap: Record<string, "SS" | "Ti" | "Both"> = {
    set_3_5_4_5_mm_long_pelvic_screws_set: "Both",
    set_foot_modular_set: "Both",
    set_large_external_fixator: "SS",
    set_lateral_entry_expert_femoral_nail_lockin: "Ti",
    set_lcp_distal_radius_plate_set: "Ti",
    set_mini_fragment_set: "Both",
    set_pediatric_lcp_hip_plate_system_implants: "SS",
    set_periarticular_screw_and_instrument_set: "Both",
    set_small_and_mini_external_fixation_w_k_wir: "SS",
    set_small_external_fixator: "SS",
    set_small_fragment_set_regular_: "Both",
    set_small_fragment_set_lc_dcp_self_tapping_s: "SS",
    set_small_fragment_set_lc_dcp_self_tapping_t: "Ti",
    set_small_fragment_set_lcp_instrument_and_im: "Both",
    set_tibial_nail_ex_screws_set: "Both",
    set_universal_small_fragment: "Both"
  };

  return materialMap[set.id] || "Both";
}

// Map of default hospital storage locations in the surgical sterile core and mobile trauma carts
const defaultLocationsMap: Record<string, string> = {
  set_3_5mm_pelvic_cortex_screws_self_tapping: "550-C",
  set_3_5_4_5_mm_long_pelvic_screws_set: "555-D",
  set_3_5mm_cannulated_screw_instrument_implants: "555-B",
  set_3_5_4_5_mm_cvd_locking_compression_plates: "550-A",
  set_4_5mm_cannulated_screw_instrument_implan: "555-B",
  set_7_0mm_cannulated_screw_instrument_implan: "555-B",
  set_7_3mm_stainless_steel_cannulated_screws: "555-B",
  set_7_3mm_titanium_cannulated_screw_set: "555-B",
  set_7_3mm_titanium_cannulated_screws: "555-B",
  set_blade_plate_set: "552-F",
  set_common_synthes_instruments: "555-C",
  set_cc_pediplates_titanium_c0003: "550-A",
  set_cc_pediplates_lp_system_0040: "550-A",
  set_dhs_implants_the_only_system: "555-C",
  set_large_external_fixator: "551-C",
  set_large_fragment_set_asif_screws_ss_: "551-A",
  set_large_fragment_set_asif_screws_ti_: "551-A",
  set_large_fragment_set_lc_dcp_titanium_plates: "551-A",
  set_large_fragment_set_stainless_steel_plates: "551-A",
  set_lateral_entry_expert_femoral_nail_lockin: "In nailing cart by elevator",
  set_lcp_distal_radius_plate_set: "555-C",
  set_mini_fragment_set: "551-B",
  set_pediatric_lcp_hip_plate_system_implants: "555-D",
  set_periarticular_4_5mm_plates_set: "555-A",
  set_periarticular_screw_and_instrument_set: "551-C",
  set_small_and_mini_external_fixation_w_k_wir: "551-C",
  set_small_external_fixator: "551-C",
  set_small_fragment_set_lc_dcp_self_tapping_s: "551-D",
  set_small_fragment_set_lc_dcp_self_tapping_t: "551-D",
  set_small_fragment_set_lcp_instrument_and_im: "551-D",
  set_ti_cannulated_retrograde_antegrade_femor: "555-E",
  set_tibial_nail_ex_screws_set: "551-A",
  set_universal_small_fragment: "551-C",
  set_volt_mini_fragment: "551-B",
  set_foot_modular_set: "550-E",
  set_small_box_7_3_fully_threaded_screws_ss_30_155: "555-B",
  set_small_box_7_3_fully_threaded_screws_ss_160_180: "555-B",
  set_small_box_7_3_partially_threaded_screws_ss: "555-B",
  set_richard_pediatric: "552-F",
  set_richard_intermediaire: "552-F",
  set_3_5_lcp_low_bend_medial_distal_tibia_plates: "550-A",
  set_spine_screw_removal_set: "555-C",
  set_flexible_reamer: "555-E",
  set_richards_staples: "-",
  set_2_7_recon_plates: "Sterile core, section 733",
  set_2_7_lc_dcp_plates: "Sterile core, section 733",
  set_elastic_nail: "555-C",
  set_im_nail_extraction: "551-B",
  set_elastic_nail_backup: "Sterile core / MDR section 350-H",
};

// Map of standard P-numbers (Product / Inventory catalog tray reference IDs)
const setPNumbersMap: Record<string, string> = {
  set_3_5mm_pelvic_cortex_screws_self_tapping: "P0025790",
  set_3_5_4_5_mm_long_pelvic_screws_set: "P0011168",
  set_3_5mm_cannulated_screw_instrument_implants: "P0000468",
  set_3_5_4_5_mm_cvd_locking_compression_plates: "P0014274",
  set_4_5mm_cannulated_screw_instrument_implan: "P0000845",
  set_7_0mm_cannulated_screw_instrument_implan: "P0000469P",
  set_7_3mm_stainless_steel_cannulated_screws: "P0026657",
  set_7_3mm_titanium_cannulated_screw_set: "P0000470",
  set_7_3mm_titanium_cannulated_screws: "P0002550",
  set_blade_plate_set: "P0000465",
  set_common_synthes_instruments: "P0000473",
  set_cc_pediplates_titanium_c0003: "P0017816",
  set_cc_pediplates_lp_system_0040: "P0017817",
  set_dhs_implants_the_only_system: "P0000782",
  set_large_external_fixator: "P0000475",
  set_large_fragment_set_asif_screws_ss_: "P0000478",
  set_large_fragment_set_asif_screws_ti_: "P0000276",
  set_large_fragment_set_lc_dcp_titanium_plates: "P0000276",
  set_large_fragment_set_stainless_steel_plates: "P0000477",
  set_lateral_entry_expert_femoral_nail_lockin: "P0002730",
  set_lcp_distal_radius_plate_set: "P0003207",
  set_mini_fragment_set: "P0026780 / P0026781",
  set_pediatric_lcp_hip_plate_system_implants: "P0002929 - P0002924",
  set_periarticular_4_5mm_plates_set: "P0026382",
  set_periarticular_screw_and_instrument_set: "P0015614",
  set_small_and_mini_external_fixation_w_k_wir: "P0016553",
  set_small_external_fixator: "P0016553",
  set_small_fragment_set_lc_dcp_self_tapping_s: "P0014414 / P0001204",
  set_small_fragment_set_lc_dcp_self_tapping_t: "P0014414 / P0001204",
  set_small_fragment_set_lcp_instrument_and_im: "P0002928",
  set_ti_cannulated_retrograde_antegrade_femor: "P0002732",
  set_tibial_nail_ex_screws_set: "P0027024 / P0027025",
  set_universal_small_fragment: "P0026904",
  set_volt_mini_fragment: "P0026780 / P0026781",
  set_foot_modular_set: "P0014221",
  set_small_box_7_3_fully_threaded_screws_ss_30_155: "P0002879",
  set_small_box_7_3_fully_threaded_screws_ss_160_180: "P0014128",
  set_small_box_7_3_partially_threaded_screws_ss: "P0014633",
  set_richard_pediatric: "P0000482",
  set_richard_intermediaire: "P0000486",
  set_3_5_lcp_low_bend_medial_distal_tibia_plates: "P0013193",
  set_spine_screw_removal_set: "P0011193",
  set_flexible_reamer: "P0002437",
  set_richards_staples: "P0000911",
  set_2_7_recon_plates: "P0015537",
  set_2_7_lc_dcp_plates: "P0015536",
  set_elastic_nail: "P0000474",
  set_im_nail_extraction: "P0027060",
  set_elastic_nail_backup: "Backup Tools",
};

// Map of clinical precautions and tray instruction notes from the central hospital register
const setHospitalNotesMap: Record<string, string> = {
  set_3_5_4_5_mm_long_pelvic_screws_set: "**Warning: pelvic set NOT available at the Children's - only at the Shriners",
  set_7_3mm_titanium_cannulated_screw_set: "Contains 16mm/32mm thread. Backup set if P0026557 contaminated - open with Small Box",
  set_blade_plate_set: "Small or large fragment set needed for screws",
  set_large_fragment_set_stainless_steel_plates: "**Discontinued - use periarticular plates",
  set_lateral_entry_expert_femoral_nail_lockin: "Nail sizes: 8.2mm, 10mm. Nails are side-specific - open for right or left femur accordingly",
  set_small_fragment_set_lcp_instrument_and_im: "Contains implants from regular small fragment set as well as locking",
  set_tibial_nail_ex_screws_set: "Nail sizes 8-9-10-11-12mm (255-420mm), in cart by elevator with locking screws, lower level",
  set_flexible_reamer: "Only flexible reamer available - no solid reamers",
  set_elastic_nail: "Only one set available - see Elastic Nail Backup Instruments if more than one nail is needed",
  set_elastic_nail_backup: "T-handle, Drill bit 2.0 / 2.5mm (or use ortho sharps), Impactor kept sterile in sterile core, extra elastic nails sterile in MDR section 350-H",
};

// Section grouping function for orthopedic trays
export function getSetSection(id: string, name: string): "plates_and_screws" | "cannulated_screws" | "hip" | "tibia" | "external" | "other" {
  const normId = id.toLowerCase();
  const normName = name.toLowerCase();

  if (normId.includes("cannulated") || normId.includes("small_box_7_3") || normName.includes("cannulated")) {
    return "cannulated_screws";
  }
  if (
    normId.includes("hip_plate") ||
    normName.includes("hip plate") ||
    normId.includes("dhs") ||
    normName.includes("dhs") ||
    normId.includes("richard") ||
    normName.includes("richard") ||
    normId.includes("blade_plate") ||
    normName.includes("blade plate")
  ) {
    return "hip";
  }
  if (
    normId.includes("tibial_nail") ||
    normId.includes("tibia_plates") ||
    normName.includes("tibial nail") ||
    normName.includes("tibia plate") ||
    normName.includes("tibial plate") ||
    normId.includes("low_bend_medial_distal_tibia")
  ) {
    return "tibia";
  }
  if (normId.includes("external_fix") || normName.includes("external fix")) {
    return "external";
  }
  if (
    normId.includes("pelvic_cortex_screws") ||
    normId.includes("locking_compression") ||
    normId.includes("fragment_set") ||
    normId.includes("foot_modular") ||
    normId.includes("radius_plate") ||
    normId.includes("volt_mini") ||
    normId.includes("periarticular") ||
    normId.includes("recon_plates") ||
    normId.includes("lc_dcp_plates") ||
    normName.includes("pelvic cortex screws") ||
    normName.includes("radius plate") ||
    normName.includes("mini fragment") ||
    normName.includes("volt") ||
    normName.includes("periarticular") ||
    normName.includes("recon plate") ||
    normName.includes("lc-dcp plate") ||
    normName.includes("small fragment") ||
    normName.includes("large fragment") ||
    normName.includes("universal small fragment")
  ) {
    // Note: long pelvic screws is classified under other in user's request
    if (normId.includes("long_pelvic_screws")) {
      return "other";
    }
    return "plates_and_screws";
  }

  return "other";
}

// Access precompiled decorated details
export const DECORATED_SETS: TraumaSet[] = SETS.map((s, idx) => ({
  ...s,
  ...deriveLegacyShape(s), // populate legacy screws[]/plates[] for the existing UI
  // v2 sets carry their own verified defaultLocation/pNumber - prefer those,
  // and only fall back to the legacy maps (keyed by old IDs) or a placeholder
  // when a set genuinely doesn't specify its own.
  defaultLocation: s.defaultLocation || defaultLocationsMap[s.id] || "Cabinet Core C, Shelf 4",
  defaultMaterial: s.defaultMaterial || getSetMaterial(s),
  pNumber: s.pNumber || setPNumbersMap[s.id] || `P-${1000 + idx}`,
  hospitalNotes: s.hospitalNotes || setHospitalNotesMap[s.id] || undefined,
  section: getSetSection(s.id, s.name),
}));

// Local storage keys
const CUSTOM_LOCATIONS_KEY = "ortho_set_custom_locations";

// Get user custom locations map
export function getCustomLocationsMap(): Record<string, string> {
  try {
    const raw = localStorage.getItem(CUSTOM_LOCATIONS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    console.error("Failed to load custom locations map", e);
    return {};
  }
}

// Save custom location for a set
export function saveSetLocation(setId: string, location: string): void {
  const map = getCustomLocationsMap();
  if (!location.trim()) {
    delete map[setId];
  } else {
    map[setId] = location.trim();
  }
  
  try {
    localStorage.setItem(CUSTOM_LOCATIONS_KEY, JSON.stringify(map));
  } catch (e) {
    console.error("Failed to save custom location", e);
  }
}

const ONSITE_SETS_KEY = "ortho_onsite_sets_map";

export function getOnSiteSetsMap(): Record<string, boolean> {
  // Build today's correct defaults FIRST, unconditionally, for every set
  // that actually exists right now. This is the source of truth for which
  // ids are real.
  const defaults: Record<string, boolean> = {};
  SETS.forEach((s) => {
    const idLower = s.id.toLowerCase();
    const nameLower = s.name.toLowerCase();
    // Default specialized/non-standard-stock trays as off-site. Patterns are
    // matched against the REAL v2 set ids/names (the old patterns here used
    // to reference ids from the pre-v2 database - e.g. "external_fixator",
    // "retrograde_antegrade", "tibial_nail_ex", "acumed", "acutrak", "smith"
    // - none of which exist in the current 30-set database, so they matched
    // nothing and those categories silently defaulted on-site instead).
    const isOffsiteDefault =
      idLower.includes("pediatric") ||
      nameLower.includes("pediatric") ||
      idLower.includes("pediplates") || // OrthoPediatrics-specific trays, not standard stock
      idLower.includes("pelvic") ||
      idLower.includes("lateral_entry") ||
      nameLower.includes("femoral nail");
    defaults[s.id] = !isOffsiteDefault;
  });

  // Now layer any saved choices on TOP of those defaults, rather than
  // trusting storage blindly. This is the actual fix: previously, any
  // saved map (even one saved against an older/different set of ids -
  // e.g. before the v2 database rebuild) was returned as-is. Since none of
  // its keys matched the current set ids, every lookup came back
  // `undefined` -> falsy -> every set silently registered as off-site,
  // which broke the on-site/off-site split in the contamination protocol
  // (the "on-site only" view was always empty, and "show off-site
  // alternatives" just revealed the same full list).
  //
  // Merging means: a real saved preference for a CURRENT set id still
  // wins (the user's actual toggle choices are respected), but stale or
  // unrecognized keys from old data can never silently blank out today's
  // sets.
  try {
    const raw = localStorage.getItem(ONSITE_SETS_KEY);
    if (raw) {
      const saved = JSON.parse(raw);
      const merged = { ...defaults };
      for (const id of Object.keys(saved)) {
        if (id in defaults) {
          merged[id] = saved[id];
        }
        // else: ignore - this key doesn't correspond to any current set,
        // so it's stale data from a prior database version.
      }
      return merged;
    }
  } catch (e) {
    console.error("Failed to load onsite map", e);
  }

  return defaults;
}

export function saveOnSiteSetsMap(map: Record<string, boolean>): void {
  try {
    localStorage.setItem(ONSITE_SETS_KEY, JSON.stringify(map));
  } catch (e) {
    console.error("Failed to save onsite map", e);
  }
}

// Reorder list local storage key
const REORDER_LIST_KEY = "ortho_set_reorders";

import { ReorderItem, ArchivedOrder } from "../types";

export function getReorderList(): ReorderItem[] {
  try {
    const raw = localStorage.getItem(REORDER_LIST_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("Failed to load reorder list", e);
    return [];
  }
}

export function saveReorderList(list: ReorderItem[]): void {
  try {
    localStorage.setItem(REORDER_LIST_KEY, JSON.stringify(list));
  } catch (e) {
    console.error("Failed to save reorder list", e);
  }
}

export function addReorderItem(item: Omit<ReorderItem, "id">): ReorderItem[] {
  const list = getReorderList();
  
  // See if a matching item with the same set id, screw type, and selected length already exists
  const existingIndex = list.findIndex(
    (i) =>
      i.setId === item.setId &&
      i.screwType === item.screwType &&
      i.selectedLength === item.selectedLength
  );

  if (existingIndex > -1) {
    list[existingIndex].quantity += item.quantity;
  } else {
    const newItem: ReorderItem = {
      ...item,
      id: Math.random().toString(36).substring(2, 9),
    };
    list.push(newItem);
  }

  saveReorderList(list);
  return list;
}

export function removeReorderItem(id: string): ReorderItem[] {
  const list = getReorderList().filter((i) => i.id !== id);
  saveReorderList(list);
  return list;
}

export function clearReorderList(): void {
  try {
    localStorage.removeItem(REORDER_LIST_KEY);
  } catch (e) {
    console.error("Failed to clear reorder list", e);
  }
}

const ARCHIVED_ORDERS_KEY = "ortho_archived_orders";

export function getArchivedOrders(): ArchivedOrder[] {
  try {
    const raw = localStorage.getItem(ARCHIVED_ORDERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("Failed to load archived orders", e);
    return [];
  }
}

export function saveArchivedOrders(list: ArchivedOrder[]): void {
  try {
    localStorage.setItem(ARCHIVED_ORDERS_KEY, JSON.stringify(list));
  } catch (e) {
    console.error("Failed to save archived orders", e);
  }
}

const VERIFICATIONS_KEY = "ortho_set_verifications";

export function getLocalVerifications(): Record<string, Record<string, { verificationStatus: "tray-verified" | "source-verified" | "unverified"; verifiedBy?: string; verifiedDate?: string }>> {
  try {
    const raw = localStorage.getItem(VERIFICATIONS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    console.error("Failed to load local verifications", e);
    return {};
  }
}

export function saveLocalVerifications(verifs: Record<string, Record<string, { verificationStatus: "tray-verified" | "source-verified" | "unverified"; verifiedBy?: string; verifiedDate?: string }>>): void {
  try {
    localStorage.setItem(VERIFICATIONS_KEY, JSON.stringify(verifs));
  } catch (e) {
    console.error("Failed to save local verifications", e);
  }
}

export function computeSetVerificationStatus(
  set: TraumaSet,
  setVerifRecord: Record<string, { verificationStatus: "tray-verified" | "source-verified" | "unverified"; verifiedBy?: string; verifiedDate?: string }> = {}
) {
  const screws = set.screws || [];
  const plates = set.plates || [];
  
  if (screws.length === 0 && plates.length === 0) {
    return {
      status: "unverified" as const,
      verifiedBy: undefined as string | undefined,
      verifiedDate: undefined as string | undefined,
      itemsCount: 0,
      verifiedCount: 0
    };
  }

  const statuses: { id: string; type: "screw" | "plate"; status: "tray-verified" | "source-verified" | "unverified"; verifiedBy?: string; verifiedDate?: string }[] = [];

  screws.forEach((screw) => {
    const record = setVerifRecord[screw.type];
    statuses.push({
      id: screw.type,
      type: "screw",
      status: record?.verificationStatus || "unverified",
      verifiedBy: record?.verifiedBy,
      verifiedDate: record?.verifiedDate
    });
  });

  plates.forEach((plate) => {
    const record = setVerifRecord[plate];
    statuses.push({
      id: plate,
      type: "plate",
      status: record?.verificationStatus || "unverified",
      verifiedBy: record?.verifiedBy,
      verifiedDate: record?.verifiedDate
    });
  });

  const hasUnverified = statuses.some((s) => s.status === "unverified");
  const hasSourceVerified = statuses.some((s) => s.status === "source-verified");

  let computedStatus: "tray-verified" | "source-verified" | "unverified" = "tray-verified";
  if (hasUnverified) {
    computedStatus = "unverified";
  } else if (hasSourceVerified) {
    computedStatus = "source-verified";
  }

  let finalVerifiedBy: string | undefined = undefined;
  let finalVerifiedDate: string | undefined = undefined;

  const verifiedItems = statuses.filter((s) => s.status !== "unverified");
  if (verifiedItems.length > 0) {
    const sorted = [...verifiedItems].sort((a, b) => {
      const dA = a.verifiedDate ? new Date(a.verifiedDate).getTime() : 0;
      const dB = b.verifiedDate ? new Date(b.verifiedDate).getTime() : 0;
      return dB - dA;
    });
    finalVerifiedBy = sorted[0].verifiedBy;
    finalVerifiedDate = sorted[0].verifiedDate;
  }

  return {
    status: computedStatus,
    verifiedBy: finalVerifiedBy,
    verifiedDate: finalVerifiedDate,
    itemsCount: statuses.length,
    verifiedCount: verifiedItems.length
  };
}



// ---------------------------------------------------------------------------
// REFERENCE CROSS-REFERENCE INDEX (contamination protocol)
// Built once over the decorated sets. The contamination feature uses this to
// answer "this tray is down - where else can I get this exact implant?" purely
// by manufacturer reference number, the only reliable identity key.
// ---------------------------------------------------------------------------
import {
  buildRefIndex,
  findContaminationAlternatives as _findContamAlts,
  rankBackupSets as _rankBackups,
  findAlternativeLocations as _findAltLocs,
} from "./crossReference";

export const REF_INDEX = buildRefIndex(DECORATED_SETS);

// All sterile alternatives for a single reference number, anywhere in inventory.
export function lookupRef(ref: string, excludeSetId?: string) {
  return _findAltLocs(REF_INDEX, ref, excludeSetId);
}

// Full contamination analysis for a given set id: per-implant alternatives plus
// the ranked list of whole backup sets.
export function getContaminationAnalysis(setId: string) {
  const set = DECORATED_SETS.find((s) => s.id === setId);
  if (!set) return { matches: [], backupSets: [] };
  const matches = _findContamAlts(REF_INDEX, set);
  const backupSets = _rankBackups(matches);
  return { matches, backupSets };
}
