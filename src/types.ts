export type VerificationStatus =
  | 'tray-verified'      // a human physically checked this against the real implant
  | 'source-verified'    // confirmed against an independent document/catalog
  | 'confirmed-no-ref'    // existence and core facts (diameter, etc.) are confidently established by strong circumstantial evidence (e.g. unbroken sequential pattern, every sibling in the family agrees), but the SPECIFIC fact in question (usually a ref number) could not be independently found - distinct from "unverified," which means "not checked" or "actively in doubt"
  | 'unverified';        // not yet checked, or checked and genuinely unresolved/in doubt

// Records a single act of someone actively trying to find a problem with
// an entry, as opposed to merely confirming it once. "source-verified"
// answers "did I find agreement somewhere" - this answers "did anyone
// actually try to break this." The 214.920 mislabeling was caught this
// way: the user directly challenged an entry already marked verified.
// Without recording that a challenge happened, there's no way to tell
// "checked once, never revisited" apart from "actually stress-tested."
export interface ChallengeRecord {
  date: string;
  challengedBy: string; // e.g. "user", "Notebook LM cross-reference", "web search audit"
  outcome: 'confirmed-correct' | 'corrected' | 'inconclusive';
  details?: string;
}

// Records that this specific entry's behavior in the contamination
// matcher was actually exercised and checked, not just assumed correct
// because the underlying data looks right. Bugs in this project have
// repeatedly been "data and logic both look fine individually, but the
// actual match result was wrong/missing/misleading" - this field lets a
// future reviewer know whether that end-to-end check has ever happened
// for this specific entry, and avoid assuming a data edit is safe just
// because it doesn't touch matching code.
export interface MatchTestRecord {
  date: string;
  scenario: string; // e.g. "tested as contaminated set, checked top result"
  result: 'as-expected' | 'unexpected-result' | 'no-alternatives-found';
  details?: string;
}

export type ScrewFunction = 'cortex' | 'locking' | 'cannulated' | 'cancellous' | 'variable-angle-locking' | 'metaphyseal' | 'recon' | 'other';

export type ThreadCoverage = 'fully-threaded' | 'partially-threaded' | 'n/a';

// One real, individually-numbered implant at one specific length. This is
// the atomic unit - never re-derive diameter/function/ref from a label at
// match time. Every field here is a verified fact, not a guess.
export interface ScrewSize {
  length: string; // mm, as a single value (e.g. "50"), never a range
  ref: string | null; // the real manufacturer catalog number for THIS length. null (not a guess) if genuinely unknown.
  // If the SOURCE DOCUMENT ITSELF records one ref for multiple consecutive
  // lengths (a real, documented quirk - see 7.3mm Cannulated SS, 100mm and
  // 105mm both show as #209.70 in the actual PDF), list the sibling
  // length(s) here. This is structured/machine-readable rather than a
  // prose note, so the matcher/UI can flag it consistently instead of
  // relying on someone reading a comment.
  refShared?: string[];
  verificationStatus: VerificationStatus;
  details?: string; // explanation specific to this one size, when the family-level `notes` isn't precise enough
  challengeHistory?: ChallengeRecord[];
  matchTestHistory?: MatchTestRecord[];
}

export interface ScrewFamily {
  diameter: string; // e.g. "3.5" - structured, never parsed from a type string
  function: ScrewFunction;
  // Whether the screw's thread covers its full length or only part of it.
  // This is a real clinical distinction (compression vs. non-compression
  // use) that was previously only encoded in `displayName` text - i.e. not
  // actually readable by matching logic at all, despite being a genuine
  // functional difference between two screws of the same diameter and
  // function category. Required, not optional, so it can't be silently
  // skipped the way it was before this field existed.
  threadCoverage: ThreadCoverage;
  material: 'SS' | 'Ti' | 'Other';
  displayName: string; // human label for UI, e.g. "3.5mm Cortex Self-Tapping" - cosmetic only, never read by matching logic
  // The manufacturer's full published range, if known independently of
  // what the hospital stocks - lets us tell "narrower than the catalog"
  // (a real, common, non-error situation - see 4.5mm Cannulated, hospital
  // stocks to 72mm, manufacturer makes to 80mm) apart from "data is wrong."
  manufacturerRange?: { min: number; max: number; source: string };
  // What MUHC's PDF/inventory actually shows. This is what matching uses.
  sizes: ScrewSize[];
  notes?: string;
}

export interface PlateSize {
  holes: number | null;
  length: string | null; // mm
  ref: string | null;
  refShared?: string[];
  side?: 'left' | 'right' | 'n/a';
  verificationStatus: VerificationStatus;
  challengeHistory?: ChallengeRecord[];
  matchTestHistory?: MatchTestRecord[];
}

export interface PlateFamily {
  diameter: string | null; // null when genuinely not diameter-based (angle/length-based plates like DHS, Blade Plate)
  angleDegrees?: string; // for angle-based plates - keeps them out of diameter-based matching entirely, rather than guessing
  familyName: string; // e.g. "LCP Medial Distal Tibia" - used for the keyword-fallback matcher when diameter is null
  material: 'SS' | 'Ti' | 'Other';
  displayName: string;
  manufacturerRange?: { min: number; max: number; source: string };
  sizes: PlateSize[];
  notes?: string;
}

// A single real-world implant location: which set/tray it's physically
// stored in. An implant can have more than one (see 7.3mm Cannulated SS,
// found under both its own set header AND "Instrument Tree" in the PDF) -
// this is a real relationship, not duplicated/copy-pasted data that can
// drift out of sync.
export interface StorageLocation {
  setId: string;
  setName: string;
  defaultLocation?: string;
}

// Describes a real dependency relationship: this set is INCOMPLETE on its
// own and requires one or more companion sets to be opened alongside it
// for an actual case. Distinct from StorageLocation (which describes the
// same implant living in multiple places) - this describes a set that is
// only ever used together with named others, in a specific real workflow
// (e.g. "this is a contamination backup; when opened, also open these 4
// length-specific caddies").
export interface SetDependency {
  relatedSetId: string;
  relatedSetName: string;
  relationship: 'backup-for' | 'requires-companion-caddy' | 'instruments-only-pair';
  notes?: string;
}

export interface TraumaSet {
  id: string;
  name: string;
  pNumber?: string;
  manufacturer?: string; // e.g. "DePuy Synthes", "OrthoPediatrics" - every prior set in this database implicitly assumed Synthes; this field makes that assumption explicit and lets non-Synthes sets be correctly distinguished
  screwFamilies: ScrewFamily[];
  plateFamilies: PlateFamily[];
  // LEGACY COMPAT (read-only, derived): the original UI was built against a
  // flat `screws: Screw[]` / `plates: string[]` shape. The v2 schema replaced
  // these with structured screwFamilies/plateFamilies. Rather than rewrite the
  // entire (very large) UI at once, decoratedSets.ts derives these legacy
  // fields from the families so existing components keep working. New code
  // (e.g. the ref-based contamination matcher) reads the families directly and
  // must NOT depend on these. Optional, because the raw v2 data doesn't carry
  // them - they're populated by the decoration step only.
  screws?: Screw[];
  plates?: string[];
  storageLocations?: StorageLocation[]; // other sets/trays that also physically hold this same set's implants, if any
  dependencies?: SetDependency[]; // other sets that must be opened alongside this one in a real workflow
  source?: string;
  defaultLocation?: string;
  defaultMaterial?: "SS" | "Ti" | "Both";
  hospitalNotes?: string;
  verificationStatus: VerificationStatus; // required at the set level now - no set ships without an explicit status
  verifiedBy?: string;
  verifiedDate?: string;
  section?: string;
  isDiscontinued?: boolean;
}

// LEGACY shape used by the existing UI. A flattened, display-oriented view of
// what is, in the v2 schema, a ScrewFamily + its ScrewSize[]. Derived by the
// decoration step; not part of the authoritative data model.
export interface Screw {
  type: string; // e.g. "3.5 Cortex Self-Tapping"
  lengthRange: string; // e.g. "10-60" or a single "50"
  interval?: string;
  notes?: string;
  ref?: string | null;
  verificationStatus?: VerificationStatus;
}

export interface ReorderItem {
  id: string;
  screwType: string;
  setId: string;
  setName: string;
  selectedLength: string;
  quantity: number;
  catalogRef: string;
  location: string;
  notes?: string;
  material?: string;
  itemType?: "screw" | "plate";
  isManualEntry?: boolean;
}

export interface ArchivedOrder {
  id: string;
  timestamp: string;
  items: ReorderItem[];
  alertSent: boolean;
  status: "Stored" | "Processed" | "Dispatched";
}

// The category of inventory element a flag is about. Structured (not free
// text) so a flag can never carry typed prose.
export type FlaggedAffected = 'implant' | 'instrument' | 'plate' | 'tray-container' | 'labelling' | 'location';

// The preset issue types. Extensible - add to this union and the UI list.
export type FlaggedIssueType =
  | 'missing'
  | 'wrong-quantity'
  | 'wrong-item-present'
  | 'mislabeled-ref-mismatch'
  | 'damaged-unusable'
  | 'wrong-location';

export interface FlaggedIssue {
  id: string;
  timestamp: string;
  setId?: string;       // the selected set's id (structured)
  setName: string;
  affected?: FlaggedAffected;       // what element is affected (structured)
  affectedItemRef?: string | null;  // when affected==implant/plate: the chosen catalog ref
  affectedItemLabel?: string;       // human label of the chosen item, derived from DB (not typed)
  issueType?: FlaggedIssueType;     // the preset problem (structured)
  severity: "Low" | "Medium" | "High";
  // A human-readable summary COMPOSED from the structured selections above
  // (e.g. "Missing — implant #212.117 (3.5mm Locking 40mm) — Small Fragment
  // Set"). Never user-typed; kept so existing archive views render unchanged.
  description: string;
  reporter: string;     // selected role, not typed (e.g. "Circulating Nurse")
  contact?: string;
  status: "Pending" | "Resolved";
  resolutionNotes?: string;
}

// Out-of-stock alert: structured, no free text (same principle as
// FlaggedIssue). Captures exactly which implant/length/ref ran out, in
// which set, and at which location - everything an admin needs to
// reorder or investigate, with nowhere for patient data to be entered.
export interface OutOfStockAlert {
  id: string;            // e.g. "OOS-1234"
  timestamp: string;
  setId: string;
  setName: string;
  screwType: string;     // the family display name, e.g. "3.5mm Cortex, Self-Tapping"
  length: string;        // the specific length flagged out of stock
  catalogRef: string;    // the REAL verified ref for this exact type+length, or "VERIFY WITH REP"
  location: string;
  status: "Pending" | "Resolved";
}


