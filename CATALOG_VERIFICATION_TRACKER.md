# Catalog Number Verification Tracker (BACKEND ONLY — not shown in app)

This file tracks every plate/screw catalog number that uses a literal "X"
placeholder in `sets.ts` (meaning: the real digit depends on material or
diameter and hasn't been individually confirmed), along with the current
provisional decision for each. None of this should ever be displayed to
end users — it exists so these items can be found and corrected later.

---

## RESOLVED FAMILIES (confirmed via official/independent sources)

### X41 family → confirmed 241 (SS) / 441 (Ti)
Source: DePuy Synthes "LCP Locking Compression Plate - Ordering" PDF
(rch.org.au mirror), confirms LCP T-Plates 3.5 use 241.xxx (steel) /
441.xxx (titanium) pairs.
**Status: needs the same per-item application as X39 below — not yet
applied to sets.ts. Revisit.**

---

## PROVISIONAL / UNVERIFIED — NEEDS FOLLOW-UP

### X39 family → PROVISIONALLY treated as 239 (stainless steel)
**Decision date/context:** User directed "label all these as
XStainlessS... Convert to stainless for the time being" when material
(SS vs Ti) could not be determined from the line itself.

**Confirmed pair (source: rch.org.au "3.5 mm LCP Proximal Tibia Plate"
PDF, official Synthes ordering data):**
- 239.935 / 439.935 = 4 holes, 81mm, left
- 239.936 / 439.936 = 6 holes, 107mm, right
- 239.937 / 439.937 = 6 holes, 107mm, left
- 239.938 / 439.938 = 8 holes, 133mm, right
- 239.939 / 439.939 = 8 holes, 133mm, left
- (full range continues 239.940–239.947 / 439.940–439.947)

**IMPORTANT: sets.ts currently still shows the literal "X39" placeholder,
NOT "239" — the provisional stainless-steel decision was recorded here
but deliberately NOT applied to the live file, because:**
1. There's no reliable way to verify which of the 12 specific lines are
   actually stainless vs titanium without a real source per line, and
2. Writing "239" into the live data would make an unverified guess look
   exactly as confirmed as the genuinely-sourced fixes elsewhere in this
   file, which is the same mistake already made and corrected once this
   session.

**Affected lines (in UNIVERSAL SMALL FRAGMENT, still showing literal X39
in sets.ts as of this tracker entry):**
- PLATE-3.5MM LCP MEDIAL PROX TIBIA 4H 81MM #X39.935
- PLATE-3.5MM LCP MEDIAL PROX TIBIA 4H 93MM #X39.955
- PLATE-3.5MM LCP MEDIAL PROX TIBIA 6H 107MM #X39.937
- PLATE-3.5MM LCP MEDIAL PROX TIBIA 6H 119MM #X39.957
- PLATE-3.5MM LCP MEDIAL PROX TIBIA 8H 133MM #X39.939
- PLATE-3.5MM LCP MEDIAL PROX TIBIA 8H 145MM #X39.959
- PLATE-3.5MM LCP MEDIAL PROXIMAL TIBIA 4H 93MM #X39.954
- PLATE-3.5MM LCP MEDIAL PROXIMAL TIBIA 6H 119MM #X39.956
- PLATE-3.5MM LCP MEDIAL PROXIMAL TIBIA 8H 145MM #X39.958
- PLATE-3.5MM LCP PROXIMAL TIBIA 4H 81MM #X39.934
- PLATE-3.5MM LCP PROXIMAL TIBIA 6H 107MM #X39.936
- PLATE-3.5MM LCP PROXIMAL TIBIA 8H 133MM #X39.938

**To find these again quickly:** search `sets.ts` for the literal string
`#X39.` — all 12 lines use this exact pattern and nothing else in the
file currently does (verified at time of writing).

**To resolve properly:** either (a) find a source confirming material
for each specific catalog number, or (b) accept the user's "default to
stainless" instruction and replace `#X39.` with `#239.` directly in
`sets.ts` once that's a deliberate final decision, not a placeholder.

---

## STILL COMPLETELY UNVERIFIED (not yet researched at all)

### X23 family (8 items)
Sample: `PLATE - 3.5MM LCP, 10H #X23.601`
Search `sets.ts` for `#X23.` to find all 8 lines.

### X47 family (2 items)
Sample: `PLATE - 2.7MM LCP, STRAIGHT, 10HOLES #X47.374`
Search `sets.ts` for `#X47.` to find both lines.

### X49 family (4 items)
Sample: `PLATE - 2.7MM LCP, STRAIGHT, 4HOLES #X49.680`
Search `sets.ts` for `#X49.` to find all 4 lines.

### X41 family (19 items) — see "RESOLVED FAMILIES" above; source found
but not yet applied per-item to sets.ts.
Search `sets.ts` for `#X41.` to find all 19 lines.
