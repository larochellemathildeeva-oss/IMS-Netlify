import { TraumaSet, ScrewFamily, PlateFamily } from "../types";

// ============================================================================
// CROSS-REFERENCE & CONTAMINATION PROTOCOL
//
// Purpose: when a tray is contaminated mid-case, the OR staff need to know
// which OTHER sets in the hospital carry the same implant (by manufacturer
// reference number, the only truly reliable identity key), so they can pull
// a sterile backup of the exact item without re-opening the contaminated tray.
//
// Design principles for this protocol:
//  - The reference number is the STRONGEST identity key: two implants that
//    share a real catalog ref are guaranteed identical, and those matches are
//    always shown first, labelled as exact matches.
//  - In ADDITION to exact-ref matching, the protocol also matches on the
//    implant DESCRIPTION text (like the main search bar), so a contaminated
//    implant still surfaces real-world alternatives even when no other tray
//    carries the identical catalog number. Added deliberately: ~88% of refs
//    in this library are unique to one set, so exact-ref-only matching left
//    most sets showing "no substitute" even when a same-size/same-type
//    implant (e.g. the stainless twin of a titanium set) sat in the next
//    tray. Text matches are clearly distinguished and flagged "verify before
//    use", since a same-description implant may differ in material (SS vs
//    Ti), which can matter clinically.
//  - null refs never match by ref (missing data, not a wildcard) - but such
//    implants can still match by description text.
//  - refShared is honoured for ref matching.
//  - The verification status of every match is surfaced.
// ============================================================================

// Normalizes an implant's description into a comparison key, so the protocol
// can find "the same kind of implant" across sets the way search does -
// independent of catalog number. Strips material words (SS/Ti/etc.) and
// punctuation so a "3.5mm Cortex Screw, Self-Tapping" in a stainless set keys
// the same as the titanium equivalent. Conservative: keys on description PLUS
// the specific size, so a 3.5mm cortex screw never matches a 4.5mm one.
export function normalizeDescription(
  familyDisplayName: string,
  length: string | null,
  holes: number | null | undefined
): string {
  const base = familyDisplayName
    .toLowerCase()
    .replace(/\b(ss|ti|titanium|stainless steel|stainless|steel)\b/g, "")
    .replace(/[^a-z0-9. ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const sizePart =
    length != null && length !== ""
      ? `len:${parseFloat(length)}`
      : holes != null
      ? `holes:${holes}`
      : "nosize";
  return `${base}|${sizePart}`;
}

export interface ImplantLocation {
  setId: string;
  setName: string;
  pNumber?: string;
  defaultLocation?: string;
  // where within the set this ref lives
  familyDisplayName: string;
  itemType: "screw" | "plate";
  length: string | null;
  holes?: number | null;
  diameter: string | null;
  material: string;
  verificationStatus: string;
  isDiscontinued?: boolean;
  // true when this ref was matched via a documented refShared quirk rather
  // than being the primary ref for this exact length
  viaSharedRef?: boolean;
  // how this location was matched to the contaminated implant:
  //  - "exact-ref": shares the identical catalog number (guaranteed same implant)
  //  - "text": same description + size, but a different/absent ref (e.g. the
  //    material twin) - a real-world alternative that must be verified before use
  matchType?: "exact-ref" | "text";
}

// A normalized reference number. Refs in the source data appear in a few
// cosmetic variants (e.g. trailing "S*" sterile markers, stray whitespace).
// We strip purely-cosmetic decoration so "02.535.195S*" and "02.535.195"
// are recognized as the same underlying implant, WITHOUT collapsing genuinely
// different numbers together.
export function normalizeRef(ref: string): string {
  return ref
    .trim()
    .toUpperCase()
    // strip a trailing sterile-packaging marker ("S", "S*", "TS") that
    // denotes packaging, not a different implant
    .replace(/\s*S\*?$/, "")
    .replace(/\s*TS$/, "")
    .replace(/\s+/g, "");
}

// The core index: ref -> every place that exact implant physically lives.
// The core index now has TWO lookup maps, both built in one pass:
//  - byRef:  normalized catalog ref -> every location of that exact implant
//  - byDesc: normalized description+size -> every location of that kind of
//            implant (material-agnostic), powering the text-match dimension
export interface RefIndex {
  byRef: Map<string, ImplantLocation[]>;
  byDesc: Map<string, ImplantLocation[]>;
}

export function buildRefIndex(sets: TraumaSet[]): RefIndex {
  const byRef = new Map<string, ImplantLocation[]>();
  const byDesc = new Map<string, ImplantLocation[]>();

  const addByRef = (ref: string | null, loc: ImplantLocation, viaSharedRef = false) => {
    if (!ref) return; // null ref is missing data, never indexed by ref
    const key = normalizeRef(ref);
    if (!key) return;
    const list = byRef.get(key) || [];
    list.push({ ...loc, viaSharedRef });
    byRef.set(key, list);
  };

  const addByDesc = (loc: ImplantLocation) => {
    const key = normalizeDescription(loc.familyDisplayName, loc.length, loc.holes);
    if (!key) return;
    const list = byDesc.get(key) || [];
    list.push({ ...loc });
    byDesc.set(key, list);
  };

  for (const set of sets) {
    for (const fam of set.screwFamilies) {
      for (const sz of fam.sizes) {
        const loc: ImplantLocation = {
          setId: set.id,
          setName: set.name,
          pNumber: set.pNumber,
          defaultLocation: set.defaultLocation,
          familyDisplayName: fam.displayName,
          itemType: "screw",
          length: sz.length,
          diameter: fam.diameter,
          material: fam.material,
          verificationStatus: sz.verificationStatus,
          isDiscontinued: set.isDiscontinued,
        };
        addByRef(sz.ref, loc);
        addByDesc(loc);
        // a documented shared-ref quirk makes this implant findable by the
        // sibling ref too
        if (sz.refShared) {
          for (const shared of sz.refShared) addByRef(shared, loc, true);
        }
      }
    }
    for (const fam of set.plateFamilies) {
      for (const sz of fam.sizes) {
        const loc: ImplantLocation = {
          setId: set.id,
          setName: set.name,
          pNumber: set.pNumber,
          defaultLocation: set.defaultLocation,
          familyDisplayName: fam.displayName,
          itemType: "plate",
          length: sz.length,
          holes: sz.holes,
          diameter: fam.diameter,
          material: fam.material,
          verificationStatus: sz.verificationStatus,
          isDiscontinued: set.isDiscontinued,
        };
        addByRef(sz.ref, loc);
        addByDesc(loc);
        if (sz.refShared) {
          for (const shared of sz.refShared) addByRef(shared, loc, true);
        }
      }
    }
  }

  return { byRef, byDesc };

}

// Look up every location that carries a given reference number. Excludes the
// contaminated set itself (by setId) so the results are genuinely usable
// alternatives, not the tray you can't touch.
export function findAlternativeLocations(
  index: RefIndex,
  ref: string,
  excludeSetId?: string
): ImplantLocation[] {
  const key = normalizeRef(ref);
  const hits = index.byRef.get(key) || [];
  return hits
    .filter((h) => h.setId !== excludeSetId)
    .map((h) => ({ ...h, matchType: "exact-ref" as const }));
}

export interface ContaminationMatch {
  ref: string;
  // the implant as it exists in the contaminated set
  contaminated: ImplantLocation;
  // every sterile alternative elsewhere, best (tray-verified, non-discontinued)
  // first
  alternatives: ImplantLocation[];
}

const STATUS_RANK: Record<string, number> = {
  "tray-verified": 0,
  "source-verified": 1,
  "confirmed-no-ref": 2,
  unverified: 3,
};

function rankAlternative(a: ImplantLocation): number {
  let score = STATUS_RANK[a.verificationStatus] ?? 4;
  if (a.isDiscontinued) score += 10; // strongly deprioritize discontinued
  if (a.viaSharedRef) score += 1; // slightly prefer a primary-ref match
  return score;
}

// Given an entire contaminated set, produce - for every implant in it that
// has a real ref - the list of sterile alternatives elsewhere. Implants with
// no alternative anywhere are still reported (with an empty alternatives
// list) so staff can see at a glance what genuinely has no backup.
export function findContaminationAlternatives(
  index: RefIndex,
  contaminatedSet: TraumaSet
): ContaminationMatch[] {
  const matches: ContaminationMatch[] = [];

  const processFamily = (
    fam: ScrewFamily | PlateFamily,
    itemType: "screw" | "plate"
  ) => {
    for (const sz of fam.sizes) {
      const holes = itemType === "plate" ? (sz as any).holes : undefined;
      const contaminated: ImplantLocation = {
        setId: contaminatedSet.id,
        setName: contaminatedSet.name,
        pNumber: contaminatedSet.pNumber,
        defaultLocation: contaminatedSet.defaultLocation,
        familyDisplayName: fam.displayName,
        itemType,
        length: sz.length,
        holes,
        diameter: fam.diameter,
        material: fam.material,
        verificationStatus: sz.verificationStatus,
      };

      // (1) Exact-ref matches: guaranteed-identical implants elsewhere.
      // Only possible when this implant actually has a ref.
      const exactMatches = sz.ref
        ? findAlternativeLocations(index, sz.ref, contaminatedSet.id)
        : [];

      // (2) Text/description matches: same KIND of implant at the same size
      // anywhere else, the way the search bar matches - independent of ref.
      // This is what lets a contaminated implant surface its real-world
      // alternatives (e.g. the stainless twin of a titanium screw) even when
      // no other tray carries the identical catalog number.
      const descKey = normalizeDescription(fam.displayName, sz.length, holes);
      const textMatches = (index.byDesc.get(descKey) || [])
        .filter((h) => h.setId !== contaminatedSet.id)
        .map((h) => ({ ...h, matchType: "text" as const }));

      // (3) Merge, deduplicating by setId+familyDisplayName+length. When the
      // same physical location matches BOTH ways, exact-ref wins (it's the
      // stronger guarantee), so we add exact matches first and only add a
      // text match if that location isn't already covered.
      const seen = new Set<string>();
      const locKey = (a: ImplantLocation) =>
        `${a.setId}|${a.familyDisplayName}|${a.length}|${a.holes ?? ""}`;
      const alternatives: ImplantLocation[] = [];
      for (const m of exactMatches) {
        const k = locKey(m);
        if (!seen.has(k)) {
          seen.add(k);
          alternatives.push(m);
        }
      }
      for (const m of textMatches) {
        const k = locKey(m);
        if (!seen.has(k)) {
          seen.add(k);
          alternatives.push(m);
        }
      }

      // Sort: exact-ref matches always rank above text matches; within each
      // tier, by verification status / discontinued / shared-ref.
      alternatives.sort((a, b) => {
        const tierA = a.matchType === "exact-ref" ? 0 : 1;
        const tierB = b.matchType === "exact-ref" ? 0 : 1;
        if (tierA !== tierB) return tierA - tierB;
        return rankAlternative(a) - rankAlternative(b);
      });

      matches.push({ ref: sz.ref || "(no ref)", contaminated, alternatives });
    }
  };

  for (const fam of contaminatedSet.screwFamilies) processFamily(fam, "screw");
  for (const fam of contaminatedSet.plateFamilies) processFamily(fam, "plate");

  return matches;
}

// Roll the per-implant matches up to the SET level: "if this tray is down,
// which other whole sets can supply the most coverage?" Returns candidate
// backup sets ranked by how many of the contaminated set's implants they can
// cover. This is the headline contamination-protocol answer.
export interface BackupSetCandidate {
  setId: string;
  setName: string;
  pNumber?: string;
  defaultLocation?: string;
  coveredRefs: number; // how many distinct contaminated refs this set covers
  totalRefs: number; // how many distinct contaminated refs exist at all
  coveragePct: number;
  isDiscontinued?: boolean;
  // worst verification status among the items it would supply, so staff know
  // if relying on this backup means relying on unverified data
  weakestStatus: string;
}

export function rankBackupSets(
  matches: ContaminationMatch[]
): BackupSetCandidate[] {
  // Identity of a contaminated implant for coverage-counting purposes: its
  // ref if it has one, otherwise its description+size. This works whether an
  // implant is matched by exact ref or by text, so coverage percentages stay
  // meaningful now that text-only (no-ref) implants can also have backups.
  const implantKey = (m: ContaminationMatch) =>
    m.ref && m.ref !== "(no ref)"
      ? normalizeRef(m.ref)
      : normalizeDescription(
          m.contaminated.familyDisplayName,
          m.contaminated.length,
          m.contaminated.holes
        );

  const distinctRefs = new Set(matches.map(implantKey));
  const totalRefs = distinctRefs.size;

  // setId -> { covered refs, statuses }
  const bySet = new Map<
    string,
    {
      name: string;
      pNumber?: string;
      defaultLocation?: string;
      isDiscontinued?: boolean;
      refs: Set<string>;
      statuses: string[];
    }
  >();

  for (const m of matches) {
    const refKey = implantKey(m);
    for (const alt of m.alternatives) {
      const entry =
        bySet.get(alt.setId) || {
          name: alt.setName,
          pNumber: alt.pNumber,
          defaultLocation: alt.defaultLocation,
          isDiscontinued: alt.isDiscontinued,
          refs: new Set<string>(),
          statuses: [],
        };
      entry.refs.add(refKey);
      entry.statuses.push(alt.verificationStatus);
      bySet.set(alt.setId, entry);
    }
  }

  const candidates: BackupSetCandidate[] = [];
  for (const [setId, entry] of bySet) {
    const covered = entry.refs.size;
    // weakest = highest rank number among the statuses actually supplied
    const weakest = entry.statuses.reduce((worst, s) => {
      return (STATUS_RANK[s] ?? 4) > (STATUS_RANK[worst] ?? 4) ? s : worst;
    }, "tray-verified");
    candidates.push({
      setId,
      setName: entry.name,
      pNumber: entry.pNumber,
      defaultLocation: entry.defaultLocation,
      coveredRefs: covered,
      totalRefs,
      coveragePct: totalRefs === 0 ? 0 : Math.round((covered / totalRefs) * 100),
      isDiscontinued: entry.isDiscontinued,
      weakestStatus: weakest,
    });
  }

  // best coverage first; break ties by preferring non-discontinued, then by
  // stronger weakest-status
  candidates.sort((a, b) => {
    if (b.coveredRefs !== a.coveredRefs) return b.coveredRefs - a.coveredRefs;
    if (!!a.isDiscontinued !== !!b.isDiscontinued)
      return a.isDiscontinued ? 1 : -1;
    return (STATUS_RANK[a.weakestStatus] ?? 4) - (STATUS_RANK[b.weakestStatus] ?? 4);
  });

  return candidates;
}
