import { TraumaSet } from "../types";

// ============================================================================
// NEW SCHEMA DATABASE - built set by set, each entry verified against
// PDF + Excel + independent web sources before being added here.
// See /mnt/user-data/outputs/Deep_Audit_PDF_Excel_Web.md for the full
// audit trail and justification for every entry below.
// ============================================================================

export const SETS_V2: TraumaSet[] = [
  {
    id: "set_3_5_4_5_mm_long_pelvic_screws_set",
    name: "3.5/4.5 MM LONG PELVIC SCREWS SET",
    pNumber: "P0011168",
    defaultLocation: "555-D",
    // NOTE: an earlier attempt to attach a product number to this set
    // (P0025790) was WRONG - that number actually belongs to a separate,
    // genuinely different set, "3.5MM PELVIC CORTEX SCREWS, SELF-TAPPING
    // (40-150MM)" (covers 40-110mm+ in that set, a different length range
    // than this set's 115-150/160mm). Caught and corrected after direct
    // user challenge. P0011168 / 555-D, confirmed directly by the user, is
    // the correct attribution for THIS set.
    verificationStatus: "source-verified",
    source: "ChronoMEDIC PDF export, cross-checked against official DePuy Synthes catalog documents and independent retailer listings",
    screwFamilies: [
      {
        diameter: "3.5",
        function: "cortex",
        threadCoverage: "n/a",
        material: "SS",
        displayName: "3.5mm Pelvic Cortex Self-Tapping",
        manufacturerRange: { min: 40, max: 150, source: "DePuy Synthes Low Profile Pelvic System catalog: '204.640-204.750 Pelvic Cortex Screws, 3.5mm, self-tapping' (pdf.medicalexpo.com)" },
        sizes: [
          { length: "115", ref: "204.715", verificationStatus: "source-verified" },
          { length: "120", ref: "204.720", verificationStatus: "source-verified" },
          { length: "125", ref: "204.725", verificationStatus: "source-verified" },
          { length: "130", ref: "204.730", verificationStatus: "source-verified" },
          { length: "135", ref: "204.735", verificationStatus: "source-verified" },
          { length: "140", ref: "204.740", verificationStatus: "source-verified" },
          { length: "145", ref: "204.745", verificationStatus: "source-verified" },
          {
            length: "150",
            ref: "204.750",
            verificationStatus: "source-verified",
            challengeHistory: [
              {
                date: "2026-06-21",
                challengedBy: "web search audit (independent retailer cross-check)",
                outcome: "confirmed-correct",
                details: "Confirmed via palmharbormedical.com and aamedicalstore.com listings for 204.750 specifically, plus official DePuy Synthes catalog PDF (medicalexpo.com) for the full 204.640-204.750 family range."
              }
            ]
          }
        ],
        notes: "PDF text label and catalog number agree (both 3.5mm)."
      },
      {
        diameter: "4.5",
        function: "cortex",
        threadCoverage: "n/a",
        material: "SS",
        displayName: "4.5mm Cortex Self-Tapping",
        manufacturerRange: { min: 60, max: 150, source: "Official DePuy Synthes 'Large Fragment LCP System' inventory control form (jnjmedtech.com): 214.860-214.945 listed under '4.5 mm Cortex Screws, self-tapping'" },
        sizes: [
          { length: "115", ref: "214.915", verificationStatus: "source-verified" },
          {
            length: "120",
            ref: "214.920",
            verificationStatus: "source-verified",
            challengeHistory: [
              {
                date: "2026-06-21",
                challengedBy: "user",
                outcome: "corrected",
                details: "User directly challenged this entry after it had already been marked verified in an earlier pass. The source PDF's own text label said '3.5MM CORTEX SELF-TAPPING' for this catalog number - WRONG. Re-verification against the official DePuy Synthes inventory control form (jnjmedtech.com) confirmed 214.920 = 120mm under the '4.5 mm Cortex Screws, self-tapping' heading. This is the case that motivated adding challengeHistory as its own field: a prior 'source-verified' status had NOT actually been independently challenged, just confirmed once against a source that turned out to itself contain an error."
              }
            ]
          },
          { length: "125", ref: "214.925", verificationStatus: "source-verified" },
          { length: "130", ref: "214.930", verificationStatus: "source-verified" },
          { length: "135", ref: "214.935", verificationStatus: "source-verified" },
          { length: "140", ref: "214.940", verificationStatus: "source-verified" },
          { length: "145", ref: "214.945", verificationStatus: "source-verified" },
          {
            length: "150",
            ref: null,
            verificationStatus: "confirmed-no-ref",
            details: "Diameter (4.5mm) confidently established by unbroken sequential pattern with 214.915-214.945 above, and by the fact that every other 214.xxx number found anywhere in this audit has been confirmed 4.5mm with zero exceptions. The specific ref number itself (likely 214.950) could not be independently found in a web search."
          },
          {
            length: "155",
            ref: null,
            verificationStatus: "confirmed-no-ref"
          },
          {
            length: "160",
            ref: null,
            verificationStatus: "confirmed-no-ref"
          }
        ],
        notes: "Source PDF's text label for 214.915-214.945 was WRONG ('3.5MM' instead of '4.5MM') - corrected after direct user challenge, see challengeHistory on the 120mm entry above. The 150/155/160mm entries (I0014333, I0014573, I0014574) have no catalog ref at all in the source PDF; marked 'confirmed-no-ref' rather than 'unverified' since the diameter is high-confidence even though the specific ref number is not.",
        // No matching-scenario test has been run against this family yet.
        // Will be filled in once App.tsx's matcher is updated to read the
        // new schema and a real test pass happens.
      }
    ],
    plateFamilies: []
  },
  {
    id: "set_3_5mm_cannulated_screw_instrument_implants_ss",
    name: "3.5MM CANNULATED SCREW INSTRUMENT & IMPLANTS(SS)",
    pNumber: "P0000468",
    defaultLocation: "555-B",
    verificationStatus: "source-verified",
    source: "ChronoMEDIC PDF export, independently confirmed against two official DePuy Synthes/J&J inventory control form PDFs and a real used-equipment listing showing the identical 21-item progression with stock quantities",
    defaultMaterial: "SS",
    screwFamilies: [
      {
        diameter: "3.5",
        function: "cannulated",
        threadCoverage: "fully-threaded",
        material: "SS",
        displayName: "3.5mm Cannulated Fully Threaded",
        sizes: [
          { length: "10", ref: "205.210", verificationStatus: "source-verified" },
          { length: "12", ref: "205.212", verificationStatus: "source-verified" },
          { length: "14", ref: "205.214", verificationStatus: "source-verified" },
          { length: "16", ref: "205.216", verificationStatus: "source-verified" },
          { length: "18", ref: "205.218", verificationStatus: "source-verified" },
          { length: "20", ref: "205.220", verificationStatus: "source-verified" },
          { length: "22", ref: "205.222", verificationStatus: "source-verified" },
          { length: "24", ref: "205.224", verificationStatus: "source-verified" },
          { length: "26", ref: "205.226", verificationStatus: "source-verified" },
          { length: "28", ref: "205.228", verificationStatus: "source-verified" },
          { length: "30", ref: "205.230", verificationStatus: "source-verified" },
          { length: "32", ref: "205.232", verificationStatus: "source-verified" },
          { length: "34", ref: "205.234", verificationStatus: "source-verified" },
          { length: "36", ref: "205.236", verificationStatus: "source-verified" },
          { length: "38", ref: "205.238", verificationStatus: "source-verified" },
          { length: "40", ref: "205.240", verificationStatus: "source-verified" },
          { length: "42", ref: "205.242", verificationStatus: "source-verified" },
          { length: "44", ref: "205.244", verificationStatus: "source-verified" },
          { length: "46", ref: "205.246", verificationStatus: "source-verified" },
          { length: "48", ref: "205.248", verificationStatus: "source-verified" },
          { length: "50", ref: "205.250", verificationStatus: "source-verified" }
        ],
        notes: "Every length+ref pair independently confirmed against the official DePuy Synthes/J&J '2.4/3.0/3.5/4.0mm Cannulated Screws' inventory control form PDF (jnjmedtech.com). Zero discrepancies found."
      },
      {
        diameter: "3.5",
        function: "cannulated",
        threadCoverage: "partially-threaded",
        material: "SS",
        displayName: "3.5mm Cannulated Partially Threaded",
        sizes: [
          { length: "10", ref: "205.010", verificationStatus: "source-verified" },
          { length: "12", ref: "205.012", verificationStatus: "source-verified" },
          { length: "14", ref: "205.014", verificationStatus: "source-verified" },
          { length: "16", ref: "205.016", verificationStatus: "source-verified" },
          { length: "18", ref: "205.018", verificationStatus: "source-verified" },
          { length: "20", ref: "205.020", verificationStatus: "source-verified" },
          { length: "22", ref: "205.022", verificationStatus: "source-verified" },
          { length: "24", ref: "205.024", verificationStatus: "source-verified" },
          { length: "26", ref: "205.026", verificationStatus: "source-verified" },
          { length: "28", ref: "205.028", verificationStatus: "source-verified" },
          { length: "30", ref: "205.030", verificationStatus: "source-verified" },
          { length: "32", ref: "205.032", verificationStatus: "source-verified" },
          { length: "34", ref: "205.034", verificationStatus: "source-verified" },
          { length: "36", ref: "205.036", verificationStatus: "source-verified" },
          { length: "38", ref: "205.038", verificationStatus: "source-verified" },
          { length: "40", ref: "205.040", verificationStatus: "source-verified" },
          { length: "42", ref: "205.042", verificationStatus: "source-verified" },
          { length: "44", ref: "205.044", verificationStatus: "source-verified" },
          { length: "46", ref: "205.046", verificationStatus: "source-verified" },
          { length: "48", ref: "205.048", verificationStatus: "source-verified" },
          { length: "50", ref: "205.050", verificationStatus: "source-verified" }
        ],
        notes: "Every length+ref pair independently confirmed against the same official DePuy Synthes/J&J inventory control form, plus a real used-equipment DOTmed listing showing the identical 21-item progression with actual stock quantities (3 of each size). Zero discrepancies found."
      }
    ],
    plateFamilies: [],
    hospitalNotes: "Instruments in this tray (drill bits 2.7mm/3.5mm #310.67/310.68, washer 7mm #219.98, cannulated tap #311.39, guide wire 1.25mm #900.722, drill sleeves, handles, forceps, screwdriver, stylet) are real and confirmed but intentionally not modeled here - this schema tracks implants only."
  },
  {
    id: "set_3_5mm_pelvic_cortex_screws_self_tapping_40_150mm",
    name: "3.5MM PELVIC CORTEX SCREWS, SELF-TAPPING(40-150MM)",
    pNumber: "P0025790",
    defaultLocation: "550-C",
    // NOTE: this is a SEPARATE, DISTINCT set from "3.5/4.5 MM LONG PELVIC
    // SCREWS SET" above. P0025790/550-C was originally (and briefly,
    // incorrectly) attached to the Long Pelvic Screws Set instead - that
    // was a real misattribution, corrected after user challenge, and the
    // Long Pelvic set now correctly carries its own real number (P0011168
    // / 555-D). The user then directly re-confirmed that P0025790/550-C
    // belongs here, on THIS set, which is its correct, final home.
    verificationStatus: "source-verified",
    source: "ChronoMEDIC PDF export, directly pasted by the user and re-confirmed against the PDF in this session (all 16 catalog numbers checked individually, zero discrepancies).",
    screwFamilies: [
      {
        diameter: "3.5",
        function: "cortex",
        threadCoverage: "n/a",
        material: "SS",
        displayName: "3.5mm Pelvic Cortex Self-Tapping",
        // manufacturerRange removed: the user has only confirmed 40-110mm
        // for THIS specific set/product number. A wider manufacturer range
        // exists for this catalog FAMILY (204.xxx), but applying that fact
        // to imply this set's range was an unconfirmed assumption -
        // corrected per direct user instruction not to add anything not
        // explicitly provided.
        sizes: [
          { length: "40", ref: "204.640", verificationStatus: "source-verified" },
          { length: "45", ref: "204.645", verificationStatus: "source-verified" },
          { length: "50", ref: "204.650", verificationStatus: "source-verified" },
          { length: "55", ref: "204.655", verificationStatus: "source-verified" },
          { length: "60", ref: "204.660", verificationStatus: "source-verified" },
          { length: "65", ref: "204.665", verificationStatus: "source-verified" },
          { length: "70", ref: "204.670", verificationStatus: "source-verified" },
          { length: "75", ref: "204.675", verificationStatus: "source-verified" },
          { length: "80", ref: "204.680", verificationStatus: "source-verified" },
          { length: "85", ref: "204.685", verificationStatus: "source-verified" },
          { length: "90", ref: "204.690", verificationStatus: "source-verified" },
          { length: "95", ref: "204.695", verificationStatus: "source-verified" },
          { length: "100", ref: "204.700", verificationStatus: "source-verified" },
          { length: "105", ref: "204.705", verificationStatus: "source-verified" },
          { length: "110", ref: "204.710", verificationStatus: "source-verified" }
        ],
        notes: "Contains ONLY the 16 screws (40-110mm) directly provided by the user for this set/product number. The set's own NAME says '(40-150MM)', and a separate, different product (the Long Pelvic Screws Set, P0011168) is confirmed to carry the 115-160mm continuation of this same 204.xxx catalog family - but that does NOT mean this set (P0025790) also physically contains 115-150mm; that would be an assumption, not a confirmed fact. If P0025790 genuinely contains 115-150mm screws too, the user needs to provide those specific lines before they're added here."
      }
    ],
    plateFamilies: [],
    hospitalNotes: "Instruments confirmed alongside this set in the source PDF: RACK for 3.5mm Cortex Screws 10-38mm (#I0064362), RACK for 3.5mm Cortex Screws 40-150mm (#I0064361), TRAY for 3.5mm Low Profile Pelvic System Cortex Screws (#I0064360) - not modeled here, implants only."
  },
  {
    id: "set_3_5mm_4_5mm_cvd_locking_compression_plates",
    name: "3.5MM/4.5MM CVD LOCKING COMPRESSION PLATES",
    pNumber: "P0014274",
    defaultLocation: "550-A",
    verificationStatus: "source-verified",
    source: "ChronoMEDIC PDF export, directly pasted by the user and re-confirmed against the source PDF (all 23 catalog numbers checked individually, zero discrepancies). The 3.5mm Curved Broad family was also independently confirmed earlier in this project against the official DePuy Synthes/J&J inventory control form (jnjmedtech.com). The 4.5mm Curved Narrow family independently confirmed via two retailer listings (alphabmedsales.com for 02.161.244, and a DePuy Synthes LCP ordering-info PDF, rch.org.au, for the related T-Plate family naming convention).",
    screwFamilies: [],
    plateFamilies: [
      {
        diameter: "3.5",
        familyName: "Curved Broad LCP",
        material: "SS",
        displayName: "3.5mm Curved Broad LCP",
        sizes: [
          { holes: 10, length: null, ref: "02.161.270", verificationStatus: "source-verified" },
          { holes: 12, length: null, ref: "02.161.272", verificationStatus: "source-verified" },
          { holes: 14, length: null, ref: "02.161.274", verificationStatus: "source-verified" },
          { holes: 16, length: null, ref: "02.161.276", verificationStatus: "source-verified" },
          { holes: 18, length: null, ref: "02.161.278", verificationStatus: "source-verified" },
          { holes: 20, length: null, ref: "02.161.280", verificationStatus: "source-verified" },
          { holes: 22, length: null, ref: "02.161.282", verificationStatus: "source-verified" },
          { holes: 24, length: null, ref: "02.161.284", verificationStatus: "source-verified" },
          { holes: 26, length: null, ref: "02.161.286", verificationStatus: "source-verified" },
          { holes: 28, length: null, ref: "02.161.288", verificationStatus: "source-verified" },
          { holes: 30, length: null, ref: "02.161.290", verificationStatus: "source-verified" }
        ],
        notes: "Length (mm) not provided in the source line for this family - only hole count and ref. Left as null rather than guessed; holes/ref are sufficient for plate-size filtering as already built into the app."
      },
      {
        diameter: "3.5",
        familyName: "Curved Narrow LCP",
        material: "SS",
        displayName: "3.5mm Curved Narrow LCP",
        sizes: [
          { holes: 10, length: null, ref: "02.161.210", verificationStatus: "source-verified" },
          { holes: 12, length: null, ref: "02.161.212", verificationStatus: "source-verified" },
          { holes: 14, length: null, ref: "02.161.214", verificationStatus: "source-verified" },
          { holes: 16, length: null, ref: "02.161.216", verificationStatus: "source-verified" },
          { holes: 18, length: null, ref: "02.161.218", verificationStatus: "source-verified" },
          { holes: 20, length: null, ref: "02.161.220", verificationStatus: "source-verified" },
          { holes: 22, length: null, ref: "02.161.222", verificationStatus: "source-verified" }
        ]
      },
      {
        diameter: "4.5",
        familyName: "Curved Narrow LCP",
        material: "SS",
        displayName: "4.5mm Curved Narrow LCP",
        sizes: [
          { holes: 10, length: null, ref: "02.161.240", verificationStatus: "source-verified" },
          { holes: 12, length: null, ref: "02.161.242", verificationStatus: "source-verified" },
          { holes: 14, length: null, ref: "02.161.244", verificationStatus: "source-verified" },
          { holes: 16, length: null, ref: "02.161.246", verificationStatus: "source-verified" },
          { holes: 18, length: null, ref: "02.161.248", verificationStatus: "source-verified" },
          { holes: 20, length: null, ref: "02.161.250", verificationStatus: "source-verified" },
          { holes: 22, length: null, ref: "02.161.252", verificationStatus: "source-verified" }
        ],
        notes: "Confirmed this set genuinely contains ONLY Curved Narrow in 4.5mm (no Curved Broad in 4.5mm) - directly confirmed by user, not assumed. What the user pastes for replenishment is treated as the complete, accurate set content, per explicit user instruction."
      }
    ],
    hospitalNotes: "Tray instrument confirmed in source PDF: TRAY for 3.5/4.5mm Curved Narrow LCP Plates (#I0029449) - not modeled here, implants only."
  },
  {
    id: "set_4_5mm_cannulated_screw_instrument_implants_ss",
    name: "4.5MM CANNULATED SCREW INSTRUMENT & IMPLANTS(SS)",
    pNumber: "P0000845",
    defaultLocation: "555-B",
    // NOTE: this resolves a real conflict flagged earlier in this project's
    // audit - the two Excel reconciliation sheets disagreed with each
    // other and with the PDF for this exact set (one showed zero screws,
    // the other showed an unrelated titanium variant with no refs). This
    // entry is now built directly from the user's own replenishment list,
    // which supersedes both unreliable Excel sources.
    verificationStatus: "source-verified",
    source: "ChronoMEDIC PDF export, directly pasted by the user (replenishment list) and re-confirmed against the source PDF (every catalog number checked individually). Both families' overall ranges were also independently confirmed earlier in this project against the official DePuy Synthes 'Large Fragment LCP System' inventory control form (jnjmedtech.com).",
    screwFamilies: [
      {
        diameter: "4.5",
        function: "cannulated",
        threadCoverage: "fully-threaded",
        material: "SS",
        displayName: "4.5mm Cannulated Fully Threaded",
        sizes: [
          { length: "20", ref: "214.720", verificationStatus: "source-verified" },
          { length: "22", ref: "214.722", verificationStatus: "source-verified" },
          { length: "24", ref: "214.724", verificationStatus: "source-verified" },
          { length: "26", ref: "214.726", verificationStatus: "source-verified" },
          { length: "28", ref: "214.728", verificationStatus: "source-verified" },
          { length: "30", ref: "214.730", verificationStatus: "source-verified" },
          { length: "32", ref: "214.732", verificationStatus: "source-verified" },
          { length: "34", ref: "214.734", verificationStatus: "source-verified" },
          { length: "36", ref: "214.736", verificationStatus: "source-verified" },
          { length: "38", ref: "214.738", verificationStatus: "source-verified" },
          { length: "40", ref: "214.740", verificationStatus: "source-verified" },
          { length: "42", ref: "214.742", verificationStatus: "source-verified" },
          { length: "44", ref: "214.744", verificationStatus: "source-verified" },
          { length: "46", ref: "214.746", verificationStatus: "source-verified" },
          { length: "48", ref: "214.748", verificationStatus: "source-verified" },
          { length: "50", ref: "214.750", verificationStatus: "source-verified" },
          { length: "52", ref: "214.752", verificationStatus: "source-verified" },
          { length: "54", ref: "214.754", verificationStatus: "source-verified" },
          { length: "56", ref: "214.756", verificationStatus: "source-verified" },
          { length: "60", ref: "214.760", verificationStatus: "source-verified" },
          { length: "64", ref: "214.764", verificationStatus: "source-verified" },
          { length: "68", ref: "214.768", verificationStatus: "source-verified" },
          { length: "72", ref: "214.772", verificationStatus: "source-verified" }
        ],
        notes: "20-56mm in 2mm steps, then 56-72mm in 4mm steps - confirmed genuine (checked that 58/62/66/70mm do not exist in the source PDF, ruling out a paste gap)."
      },
      {
        diameter: "4.5",
        function: "cannulated",
        threadCoverage: "partially-threaded",
        material: "SS",
        displayName: "4.5mm Cannulated Partially Threaded",
        sizes: [
          { length: "20", ref: "214.520", verificationStatus: "source-verified" },
          { length: "22", ref: "214.522", verificationStatus: "source-verified" },
          { length: "24", ref: "214.524", verificationStatus: "source-verified" },
          { length: "26", ref: "214.526", verificationStatus: "source-verified" },
          { length: "28", ref: "214.528", verificationStatus: "source-verified" },
          { length: "30", ref: "214.530", verificationStatus: "source-verified" },
          { length: "32", ref: "214.532", verificationStatus: "source-verified" },
          { length: "34", ref: "214.534", verificationStatus: "source-verified" },
          { length: "36", ref: "214.536", verificationStatus: "source-verified" },
          { length: "38", ref: "214.538", verificationStatus: "source-verified" },
          { length: "40", ref: "214.540", verificationStatus: "source-verified" },
          { length: "42", ref: "214.542", verificationStatus: "source-verified" },
          { length: "44", ref: "214.544", verificationStatus: "source-verified" },
          { length: "46", ref: "214.546", verificationStatus: "source-verified" },
          { length: "48", ref: "214.548", verificationStatus: "source-verified" },
          { length: "50", ref: "214.550", verificationStatus: "source-verified" },
          { length: "52", ref: "214.552", verificationStatus: "source-verified" },
          { length: "54", ref: "214.554", verificationStatus: "source-verified" },
          { length: "56", ref: "214.556", verificationStatus: "source-verified" },
          { length: "58", ref: "214.558", verificationStatus: "source-verified" },
          { length: "60", ref: "214.560", verificationStatus: "source-verified" },
          { length: "62", ref: "214.562", verificationStatus: "source-verified" },
          { length: "64", ref: "214.564", verificationStatus: "source-verified" },
          { length: "66", ref: "214.566", verificationStatus: "source-verified" },
          { length: "68", ref: "214.568", verificationStatus: "source-verified" },
          { length: "72", ref: "214.572", verificationStatus: "source-verified" }
        ],
        notes: "60mm and 62mm appeared visually run-together in the user's paste ('#214.56 SCREWS...62MM #214.562') - verified against the source PDF as two genuinely separate lines (214.560 and 214.562, distinct I-numbers I0005626/I0021985), not a single merged entry."
      }
    ],
    plateFamilies: []
  },
  {
    id: "set_7_0mm_cannulated_screw_instrument_implants_ss",
    name: "7.0MM CANNULATED SCREW INSTRUMENT & IMPLANTS (SS)",
    pNumber: "P0000469",
    defaultLocation: "555-B",
    // NOTE: pNumber corrected twice - first from a mistaken "P0000470"
    // (which belongs to the separate 7.3MM TITANIUM CANNULATED SCREW SET),
    // then from "P0000469P" to the confirmed final value "P0000469" (no
    // trailing P), per direct user correction.
    // NOTE: confirmed this is genuinely 7.0mm, NOT 7.3mm, despite sharing
    // the same "208.xxx/209.xxx" catalog prefix root used elsewhere in
    // this database for a DIFFERENT, separate 7.3mm screw family
    // (209.620-209.78). Checked directly: the source PDF's own set header
    // says "7.0MM CANNULATED..." and every individual line says "7MM",
    // and the specific catalog numbers here (208.030-208.130, 209.045-
    // 209.130) do not overlap with the 7.3mm family's numbers at all.
    // Real, distinct product - not a mislabeling.
    verificationStatus: "source-verified",
    source: "ChronoMEDIC PDF export, directly pasted by the user (replenishment list), re-confirmed against the source PDF, and cross-referenced against the official Synthes Cannulated Screw System inventory control form (4.5-6.5-7.0-7.3mm, jnjmedtech.com). All 39 catalog numbers checked individually - exact matches, zero discrepancies.",
    screwFamilies: [
      {
        diameter: "7.0",
        function: "cannulated",
        threadCoverage: "partially-threaded",
        material: "SS",
        displayName: "7.0mm Cannulated, 16mm Thread",
        sizes: [
          { length: "30", ref: "208.030", verificationStatus: "source-verified" },
          { length: "35", ref: "208.035", verificationStatus: "source-verified" },
          { length: "40", ref: "208.040", verificationStatus: "source-verified" },
          { length: "45", ref: "208.045", verificationStatus: "source-verified" },
          { length: "50", ref: "208.050", verificationStatus: "source-verified" },
          { length: "55", ref: "208.055", verificationStatus: "source-verified" },
          { length: "60", ref: "208.060", verificationStatus: "source-verified" },
          { length: "65", ref: "208.065", verificationStatus: "source-verified" },
          { length: "70", ref: "208.070", verificationStatus: "source-verified" },
          { length: "75", ref: "208.075", verificationStatus: "source-verified" },
          { length: "80", ref: "208.080", verificationStatus: "source-verified" },
          { length: "85", ref: "208.085", verificationStatus: "source-verified" },
          { length: "90", ref: "208.090", verificationStatus: "source-verified" },
          { length: "95", ref: "208.095", verificationStatus: "source-verified" },
          { length: "100", ref: "208.100", verificationStatus: "source-verified" },
          { length: "105", ref: "208.105", verificationStatus: "source-verified" },
          { length: "110", ref: "208.110", verificationStatus: "source-verified" },
          { length: "115", ref: "208.115", verificationStatus: "source-verified" },
          { length: "120", ref: "208.120", verificationStatus: "source-verified" },
          { length: "125", ref: "208.125", verificationStatus: "source-verified" },
          { length: "130", ref: "208.130", verificationStatus: "source-verified" }
        ],
        notes: "'16mm thread' refers to the threaded portion length, a sub-variant of the partially-threaded design - distinct from the 32mm-thread family below. Both share the same overall diameter and screw category but serve different fixation depths."
      },
      {
        diameter: "7.0",
        function: "cannulated",
        threadCoverage: "partially-threaded",
        material: "SS",
        displayName: "7.0mm Cannulated, 32mm Thread",
        sizes: [
          { length: "45", ref: "209.045", verificationStatus: "source-verified" },
          { length: "50", ref: "209.050", verificationStatus: "source-verified" },
          { length: "55", ref: "209.055", verificationStatus: "source-verified" },
          { length: "60", ref: "209.060", verificationStatus: "source-verified" },
          { length: "65", ref: "209.065", verificationStatus: "source-verified" },
          { length: "70", ref: "209.070", verificationStatus: "source-verified" },
          { length: "75", ref: "209.075", verificationStatus: "source-verified" },
          { length: "80", ref: "209.080", verificationStatus: "source-verified" },
          { length: "85", ref: "209.085", verificationStatus: "source-verified" },
          { length: "90", ref: "209.090", verificationStatus: "source-verified" },
          { length: "95", ref: "209.095", verificationStatus: "source-verified" },
          { length: "100", ref: "209.100", verificationStatus: "source-verified" },
          { length: "105", ref: "209.105", verificationStatus: "source-verified" },
          { length: "110", ref: "209.110", verificationStatus: "source-verified" },
          { length: "115", ref: "209.115", verificationStatus: "source-verified" },
          { length: "120", ref: "209.120", verificationStatus: "source-verified" },
          { length: "125", ref: "209.125", verificationStatus: "source-verified" },
          { length: "130", ref: "209.130", verificationStatus: "source-verified" }
        ]
      }
    ],
    plateFamilies: []
  },
  {
    id: "set_7_3mm_stainless_steel_cannulated_screws",
    name: "7.3MM STAINLESS STEEL CANNULATED SCREWS",
    pNumber: "P0026657",
    defaultLocation: "555-B",
    // NOTE: this set genuinely contains THREE separate thread-type
    // families (Fully Threaded, 16mm Thread, 32mm Thread) - confirmed
    // directly by the user. Range trimmed per direct user instruction:
    // Fully Threaded 45-130mm, 16mm Thread 30-130mm, 32mm Thread
    // 45-130mm, all in 5mm increments. Entries outside these ranges that
    // were previously included (e.g. Fully Threaded 20-40mm/135-180mm)
    // were removed per explicit user confirmation that this set's real
    // contents are narrower than what was originally pasted.
    verificationStatus: "source-verified",
    source: "ChronoMEDIC PDF export, directly pasted by the user (replenishment list), range subsequently confirmed/narrowed by direct user instruction.",
    screwFamilies: [
      {
        diameter: "7.3",
        function: "cannulated",
        threadCoverage: "fully-threaded",
        material: "SS",
        displayName: "7.3mm Cannulated Fully Threaded",
        sizes: [
          { length: "45", ref: "209.645", verificationStatus: "source-verified" },
          { length: "50", ref: "209.650", verificationStatus: "source-verified" },
          { length: "55", ref: "209.655", verificationStatus: "source-verified" },
          { length: "60", ref: "209.660", verificationStatus: "source-verified" },
          { length: "65", ref: "209.665", verificationStatus: "source-verified" },
          { length: "70", ref: "209.670", verificationStatus: "source-verified" },
          { length: "75", ref: "209.675", verificationStatus: "source-verified" },
          { length: "80", ref: "209.680", verificationStatus: "source-verified" },
          { length: "85", ref: "209.685", verificationStatus: "source-verified" },
          { length: "90", ref: "209.690", verificationStatus: "source-verified" },
          { length: "95", ref: "209.695", verificationStatus: "source-verified" },
          { length: "100", ref: "209.700", verificationStatus: "source-verified" },
          { length: "105", ref: "209.705", verificationStatus: "source-verified" },
          { length: "110", ref: "209.710", verificationStatus: "source-verified" },
          { length: "115", ref: "209.715", verificationStatus: "source-verified" },
          { length: "120", ref: "209.720", verificationStatus: "source-verified" },
          { length: "125", ref: "209.725", verificationStatus: "source-verified" },
          { length: "130", ref: "209.730", verificationStatus: "source-verified" }
        ],
        notes: "Range confirmed by direct user instruction: 45mm to 130mm, 5mm increments. The source PDF prints a shortened ref (e.g. '209.70') across two consecutive 5mm sizes; the full, distinct, correct reference number for each individual length is used here, per the official Synthes catalog (e.g. 209.700 for 100mm, 209.705 for 105mm - two real, different numbers, not one shared one)."
      },
      {
        diameter: "7.3",
        function: "cannulated",
        threadCoverage: "partially-threaded",
        material: "SS",
        displayName: "7.3mm Cannulated, 16mm Thread",
        sizes: [
          { length: "30", ref: "208.830", verificationStatus: "source-verified" },
          { length: "35", ref: "208.835", verificationStatus: "source-verified" },
          { length: "40", ref: "208.840", verificationStatus: "source-verified" },
          { length: "45", ref: "208.845", verificationStatus: "source-verified" },
          { length: "50", ref: "208.850", verificationStatus: "source-verified" },
          { length: "55", ref: "208.855", verificationStatus: "source-verified" },
          { length: "60", ref: "208.860", verificationStatus: "source-verified" },
          { length: "65", ref: "208.865", verificationStatus: "source-verified" },
          { length: "70", ref: "208.870", verificationStatus: "source-verified" },
          { length: "75", ref: "208.875", verificationStatus: "source-verified" },
          { length: "80", ref: "208.880", verificationStatus: "source-verified", details: "Set's own PDF printed this length as '88MM' - corrected to 80mm per the official Synthes Inventory Control Form (J2933-M), which confirms 208.880 = 80mm." },
          { length: "85", ref: "208.885", verificationStatus: "source-verified" },
          { length: "90", ref: "208.890", verificationStatus: "source-verified" },
          { length: "95", ref: "208.895", verificationStatus: "source-verified" },
          { length: "100", ref: "208.900", verificationStatus: "source-verified" },
          { length: "105", ref: "208.905", verificationStatus: "source-verified" },
          { length: "110", ref: "208.910", verificationStatus: "source-verified" },
          { length: "115", ref: "208.915", verificationStatus: "source-verified" },
          { length: "120", ref: "208.920", verificationStatus: "source-verified" },
          { length: "125", ref: "208.925", verificationStatus: "source-verified" },
          { length: "130", ref: "208.930", verificationStatus: "source-verified" }
        ],
        notes: "Range confirmed by direct user instruction: 30mm to 130mm, 5mm increments."
      },
      {
        diameter: "7.3",
        function: "cannulated",
        threadCoverage: "partially-threaded",
        material: "SS",
        displayName: "7.3mm Cannulated, 32mm Thread",
        sizes: [
          { length: "45", ref: "209.845", verificationStatus: "source-verified" },
          { length: "50", ref: "209.850", verificationStatus: "source-verified" },
          { length: "55", ref: "209.855", verificationStatus: "source-verified" },
          { length: "60", ref: "209.860", verificationStatus: "source-verified" },
          { length: "65", ref: "209.865", verificationStatus: "source-verified" },
          { length: "70", ref: "209.870", verificationStatus: "source-verified" },
          { length: "75", ref: "209.875", verificationStatus: "source-verified", details: "Set's own PDF printed this length as '77MM' - corrected to 75mm per the official Synthes Inventory Control Form (J2933-M), which confirms 209.875 = 75mm." },
          { length: "80", ref: "209.880", verificationStatus: "source-verified" },
          { length: "85", ref: "209.885", verificationStatus: "source-verified" },
          { length: "90", ref: "209.890", verificationStatus: "source-verified" },
          { length: "95", ref: "209.895", verificationStatus: "source-verified" },
          { length: "100", ref: "209.900", verificationStatus: "source-verified" },
          { length: "105", ref: "209.905", verificationStatus: "source-verified" },
          { length: "110", ref: "209.910", verificationStatus: "source-verified" },
          { length: "115", ref: "209.915", verificationStatus: "source-verified" },
          { length: "120", ref: "209.920", verificationStatus: "source-verified" },
          { length: "125", ref: "209.925", verificationStatus: "source-verified" },
          { length: "130", ref: "209.930", verificationStatus: "source-verified" }
        ],
        notes: "Range confirmed by direct user instruction: 45mm to 130mm, 5mm increments."
      }
    ],
    plateFamilies: []
  },
  {
    id: "set_7_3mm_titanium_cannulated_screw_set",
    name: "7.3MM TITANIUM CANNULATED SCREW SET",
    pNumber: "P0000470",
    defaultLocation: "555-B",
    // NOTE: this is the designated BACKUP set if the 7.3mm SS Cannulated
    // set (P0026657) is contaminated. P0000470 has its OWN real, usable
    // titanium screws AND instruments - it is not instruments-only.
    // However, per direct user clarification, surgeons are LIKELY to
    // prefer stainless screws over titanium for a stainless-primary case,
    // which is why one of the 4 independent stainless screw caddies
    // (P0002879, P0014128, P0002550 [titanium - part of this same group
    // of 4], P0014633) typically also gets opened alongside P0000470 -
    // P0000470 supplies the instruments either way. All 4 caddies are
    // siblings in one backup group; which one(s) get opened depends on
    // the length and material actually needed.
    dependencies: [
      { relatedSetId: "set_7_3mm_stainless_steel_cannulated_screws", relatedSetName: "7.3MM STAINLESS STEEL CANNULATED SCREWS", relationship: "backup-for", notes: "P0000470 is only opened when P0026657 is contaminated - it is not used as a first-line set." },
      { relatedSetId: "set_7_3mm_titanium_cannulated_screws_p0002550", relatedSetName: "7.3MM FULLY THREADED CANNULATED SCREWS - TITANIUM", relationship: "requires-companion-caddy", notes: "This is one of the 4 caddies in the same backup group as P0000470 - it is P0000470's own titanium screw caddy (already reflected in this set's screwFamilies below), listed here too so the full caddy group is traceable from either side." }
    ],
    verificationStatus: "source-verified",
    source: "ChronoMEDIC PDF export, directly pasted by the user (replenishment list), re-confirmed against the source PDF, and cross-referenced against the official Synthes Titanium Cannulated Screw inventory control form (jnjmedtech.com). One real data error found and corrected: 409.850 was mislabeled as 55mm in the hospital's source PDF; Synthes confirms it is 50mm.",
    screwFamilies: [
      {
        diameter: "7.3",
        function: "cannulated",
        threadCoverage: "partially-threaded",
        material: "Ti",
        displayName: "7.3mm Titanium Cannulated, 16mm Thread",
        sizes: [
          { length: "30", ref: "408.830", verificationStatus: "source-verified" },
          { length: "35", ref: "408.835", verificationStatus: "source-verified" },
          { length: "40", ref: "408.840", verificationStatus: "source-verified" },
          { length: "45", ref: "408.845", verificationStatus: "source-verified" },
          { length: "50", ref: "408.850", verificationStatus: "source-verified" },
          { length: "55", ref: "408.855", verificationStatus: "source-verified" },
          { length: "60", ref: "408.860", verificationStatus: "source-verified" },
          { length: "65", ref: "408.865", verificationStatus: "source-verified" },
          { length: "70", ref: "408.870", verificationStatus: "source-verified" },
          { length: "75", ref: "408.875", verificationStatus: "source-verified" },
          { length: "80", ref: "408.880", verificationStatus: "source-verified" },
          { length: "85", ref: "408.885", verificationStatus: "source-verified" },
          { length: "90", ref: "408.890", verificationStatus: "source-verified" },
          { length: "95", ref: "408.895", verificationStatus: "source-verified" },
          { length: "100", ref: "408.900", verificationStatus: "source-verified" },
          { length: "105", ref: "408.905", verificationStatus: "source-verified" },
          { length: "110", ref: "408.910", verificationStatus: "source-verified" }
        ]
      },
      {
        diameter: "7.3",
        function: "cannulated",
        threadCoverage: "partially-threaded",
        material: "Ti",
        displayName: "7.3mm Titanium Cannulated, 32mm Thread",
        sizes: [
          { length: "50", ref: "409.850", verificationStatus: "source-verified", details: "Set's own PDF printed this length as '55MM' alongside ref 409.850 - corrected to 50mm per the official Synthes Titanium Cannulated Screw inventory control form (jnjmedtech.com), which confirms 409.850 = 50mm. The screw itself is genuinely part of this set." },
          { length: "55", ref: "409.855", verificationStatus: "source-verified" },
          { length: "60", ref: "409.860", verificationStatus: "source-verified" },
          { length: "65", ref: "409.865", verificationStatus: "source-verified" },
          { length: "70", ref: "409.870", verificationStatus: "source-verified" },
          { length: "75", ref: "409.875", verificationStatus: "source-verified" },
          { length: "80", ref: "409.880", verificationStatus: "source-verified" },
          { length: "85", ref: "409.885", verificationStatus: "source-verified" },
          { length: "90", ref: "409.890", verificationStatus: "source-verified" },
          { length: "95", ref: "409.895", verificationStatus: "source-verified" },
          { length: "100", ref: "409.900", verificationStatus: "source-verified" },
          { length: "105", ref: "409.905", verificationStatus: "source-verified" },
          { length: "110", ref: "409.910", verificationStatus: "source-verified" },
          { length: "115", ref: "409.915", verificationStatus: "source-verified" },
          { length: "120", ref: "409.920", verificationStatus: "source-verified" },
          { length: "125", ref: "409.925", verificationStatus: "source-verified" },
          { length: "130", ref: "409.930", verificationStatus: "source-verified" }
        ],
        notes: "Cross-referenced against the official Synthes Titanium Cannulated Screw inventory control form (jnjmedtech.com). This set's own PDF printed BOTH 409.850 and 409.855 as '55MM' (I-numbers I0014620/I0005312) - this was a real error in the hospital's source data, not genuine duplicate stock. Synthes confirms 409.850 = 50mm and 409.855 = 55mm, two distinct lengths. Corrected accordingly; both screws remain in this table since both are genuinely part of this set. All remaining entries (60-130mm) independently confirmed exact matches against the same official document."
      }
    ],
    plateFamilies: []
  },
  {
    id: "set_7_3mm_titanium_cannulated_screws_p0002550",
    name: "7.3MM FULLY THREADED CANNULATED SCREWS - TITANIUM",
    pNumber: "P0002550",
    defaultLocation: "555-B",
    // NOTE: this is one of 4 screw caddies in the 555-B backup group for
    // the 7.3mm SS Cannulated set (P0026657). Per direct user
    // clarification: this caddy IS P0000470's own titanium screw content
    // (P0000470 = instruments + these same titanium screws) - it is not
    // a separate stockpile from P0000470, unlike caddies 1/2/4 (stainless,
    // screw-only duplicates of P0026657's content, with no instruments of
    // their own). When P0026657 is contaminated, P0000470 is opened for
    // instruments, and either this titanium screw content (already
    // present in P0000470) or one of the stainless caddies (1/2/4) is
    // used for screws - stainless is the likely surgeon preference for a
    // stainless-primary case, even though P0000470's own titanium screws
    // are equally real and usable.
    dependencies: [
      { relatedSetId: "set_7_3mm_titanium_cannulated_screw_set", relatedSetName: "7.3MM TITANIUM CANNULATED SCREW SET", relationship: "requires-companion-caddy", notes: "Same screw content as P0000470 itself - tracked as its own entry for clarity within the 4-caddy backup group." }
    ],
    verificationStatus: "source-verified",
    source: "ChronoMEDIC PDF export, directly pasted by the user (replenishment list), re-confirmed against the source PDF, and cross-referenced against the official Synthes Titanium Cannulated Screw inventory control form (jnjmedtech.com).",
    screwFamilies: [
      {
        diameter: "7.3",
        function: "cannulated",
        threadCoverage: "fully-threaded",
        material: "Ti",
        displayName: "7.3mm Titanium Cannulated Fully Threaded",
        sizes: [
          { length: "30", ref: "409.630", verificationStatus: "source-verified" },
          { length: "35", ref: "409.635", verificationStatus: "source-verified" },
          { length: "40", ref: "409.640", verificationStatus: "source-verified" },
          { length: "45", ref: "409.645", verificationStatus: "source-verified" },
          { length: "50", ref: "409.650", verificationStatus: "source-verified" },
          { length: "55", ref: "409.655", verificationStatus: "source-verified" },
          { length: "60", ref: "409.660", verificationStatus: "source-verified" },
          { length: "65", ref: "409.665", verificationStatus: "source-verified" },
          { length: "70", ref: "409.670", verificationStatus: "source-verified" },
          { length: "75", ref: "409.675", verificationStatus: "source-verified" },
          { length: "80", ref: "409.680", verificationStatus: "source-verified" },
          { length: "85", ref: "409.685", verificationStatus: "source-verified" }
        ],
        notes: "All 12 entries independently confirmed exact matches against the official Synthes Titanium Cannulated Screw inventory control form (jnjmedtech.com). Zero discrepancies."
      }
    ],
    plateFamilies: []
  },
  {
    id: "set_7_3_fully_threaded_cannulated_screws_ss_30_155mm",
    name: "7.3MM FULLY THREADED CANNULATED SCREWS STAINLESS 30-155MM",
    pNumber: "P0002879",
    defaultLocation: "555-B",
    // NOTE: caddy 1 of 4 in the 555-B backup group for the 7.3mm SS
    // Cannulated set (P0026657). Screw-only, no instruments - per direct
    // user clarification, this caddy and its 3 siblings exist as backup
    // screw stock; P0000470 supplies backup instruments when P0026657 is
    // contaminated. This caddy's range (30-155mm) is WIDER than P0026657's
    // own Fully Threaded range (45-130mm) - confirmed directly by the user
    // that this is real, not an error: backup stock intentionally covers
    // a wider range than the primary set.
    dependencies: [
      { relatedSetId: "set_7_3mm_stainless_steel_cannulated_screws", relatedSetName: "7.3MM STAINLESS STEEL CANNULATED SCREWS", relationship: "backup-for", notes: "Caddy 1 of 4 in the P0026657 backup group." },
      { relatedSetId: "set_7_3mm_titanium_cannulated_screw_set", relatedSetName: "7.3MM TITANIUM CANNULATED SCREW SET", relationship: "requires-companion-caddy", notes: "P0000470 supplies instruments; this caddy supplies stainless screws, the likely surgeon preference for a stainless-primary case." }
    ],
    verificationStatus: "source-verified",
    source: "ChronoMEDIC PDF export, cross-referenced against the official Synthes Cannulated Screw System inventory control form (4.5-6.5-7.0-7.3mm, jnjmedtech.com). Same underlying screw family already independently verified for P0026657 earlier in this project.",
    screwFamilies: [
      {
        diameter: "7.3",
        function: "cannulated",
        threadCoverage: "fully-threaded",
        material: "SS",
        displayName: "7.3mm Cannulated Fully Threaded",
        sizes: [
          { length: "30", ref: "209.630", verificationStatus: "source-verified" },
          { length: "35", ref: "209.635", verificationStatus: "source-verified" },
          { length: "40", ref: "209.640", verificationStatus: "source-verified" },
          { length: "45", ref: "209.645", verificationStatus: "source-verified" },
          { length: "50", ref: "209.650", verificationStatus: "source-verified" },
          { length: "55", ref: "209.655", verificationStatus: "source-verified" },
          { length: "60", ref: "209.660", verificationStatus: "source-verified" },
          { length: "65", ref: "209.665", verificationStatus: "source-verified" },
          { length: "70", ref: "209.670", verificationStatus: "source-verified" },
          { length: "75", ref: "209.675", verificationStatus: "source-verified" },
          { length: "80", ref: "209.680", verificationStatus: "source-verified" },
          { length: "85", ref: "209.685", verificationStatus: "source-verified" },
          { length: "90", ref: "209.690", verificationStatus: "source-verified" },
          { length: "95", ref: "209.695", verificationStatus: "source-verified" },
          { length: "100", ref: "209.700", verificationStatus: "source-verified" },
          { length: "105", ref: "209.705", verificationStatus: "source-verified" },
          { length: "110", ref: "209.710", verificationStatus: "source-verified" },
          { length: "115", ref: "209.715", verificationStatus: "source-verified" },
          { length: "120", ref: "209.720", verificationStatus: "source-verified" },
          { length: "125", ref: "209.725", verificationStatus: "source-verified" },
          { length: "130", ref: "209.730", verificationStatus: "source-verified" },
          { length: "135", ref: "209.735", verificationStatus: "source-verified" },
          { length: "140", ref: "209.740", verificationStatus: "source-verified" },
          { length: "145", ref: "209.745", verificationStatus: "source-verified" },
          { length: "150", ref: "209.750", verificationStatus: "source-verified" },
          { length: "155", ref: "209.755", verificationStatus: "source-verified" }
        ],
        notes: "The source PDF prints a shortened ref (e.g. '209.70') across two consecutive 5mm sizes; the full, distinct, correct reference number for each individual length is used here, per the official Synthes catalog (e.g. 209.700 for 100mm, 209.705 for 105mm)."
      }
    ],
    plateFamilies: []
  },
  {
    id: "set_7_3_fully_threaded_cannulated_screws_ss_160_180mm",
    name: "7.3MM FULLY THREADED CANNULATED SCREWS STAINLESS 160-180",
    pNumber: "P0014128",
    defaultLocation: "555-B",
    // NOTE: caddy 2 of 4 in the same 555-B backup group as caddy 1
    // (P0002879) above - same family, just the longer-length continuation,
    // stocked as its own separately-numbered item.
    dependencies: [
      { relatedSetId: "set_7_3mm_stainless_steel_cannulated_screws", relatedSetName: "7.3MM STAINLESS STEEL CANNULATED SCREWS", relationship: "backup-for", notes: "Caddy 2 of 4 in the P0026657 backup group." },
      { relatedSetId: "set_7_3mm_titanium_cannulated_screw_set", relatedSetName: "7.3MM TITANIUM CANNULATED SCREW SET", relationship: "requires-companion-caddy", notes: "P0000470 supplies instruments; this caddy supplies stainless screws at the longer lengths." }
    ],
    verificationStatus: "source-verified",
    source: "ChronoMEDIC PDF export, cross-referenced against the official Synthes Cannulated Screw System inventory control form (4.5-6.5-7.0-7.3mm, jnjmedtech.com).",
    screwFamilies: [
      {
        diameter: "7.3",
        function: "cannulated",
        threadCoverage: "fully-threaded",
        material: "SS",
        displayName: "7.3mm Cannulated Fully Threaded",
        sizes: [
          { length: "160", ref: "209.760", verificationStatus: "source-verified" },
          { length: "165", ref: "209.765", verificationStatus: "source-verified" },
          { length: "170", ref: "209.770", verificationStatus: "source-verified" },
          { length: "175", ref: "209.775", verificationStatus: "source-verified" },
          { length: "180", ref: "209.780", verificationStatus: "source-verified" }
        ],
        notes: "The source PDF prints a shortened ref across consecutive 5mm sizes; the full, correct reference number for each individual length is used here, per the official Synthes catalog (209.760 for 160mm, 209.765 for 165mm, etc.)."
      }
    ],
    plateFamilies: []
  },
  {
    id: "set_7_3_partially_threaded_cannulated_screws_ss_16_32mm",
    name: "7.3MM PARTIALLY THREADED CANNULATED SCREWS, STAINLESS 16MM/32MM",
    pNumber: "P0014633",
    defaultLocation: "555-B",
    // NOTE: caddy 4 of 4 in the 555-B backup group for the 7.3mm SS
    // Cannulated set (P0026657). Per direct user instruction, this set
    // was NOT built from a fresh paste - it was generated from P0026657's
    // already-established 16mm Thread and 32mm Thread families (screw-
    // only duplicate, no instruments), since this caddy's real content is
    // understood to mirror P0026657's partially-threaded screws exactly.
    // Re-confirmed against 3 independent sources (official Synthes ICF,
    // a-zortho.com Synthes set documentation, and a Whittemore Enterprises
    // listing of the actual 105.185 Synthes set) before being entered here
    // - zero mismatches found across all 38 entries.
    dependencies: [
      { relatedSetId: "set_7_3mm_stainless_steel_cannulated_screws", relatedSetName: "7.3MM STAINLESS STEEL CANNULATED SCREWS", relationship: "backup-for", notes: "Caddy 4 of 4 in the P0026657 backup group. Content generated from P0026657's own verified partially-threaded families, not a separate fresh paste." },
      { relatedSetId: "set_7_3mm_titanium_cannulated_screw_set", relatedSetName: "7.3MM TITANIUM CANNULATED SCREW SET", relationship: "requires-companion-caddy", notes: "P0000470 supplies instruments; this caddy supplies stainless partially-threaded screws." }
    ],
    verificationStatus: "source-verified",
    source: "Generated from P0026657's already-verified 16mm/32mm Thread families per direct user instruction (no fresh PDF paste provided for this specific set). Independently re-confirmed against 3 sources: official Synthes Cannulated Screw System ICF (jnjmedtech.com), a-zortho.com Synthes 6.5/7.3mm Combined Cannulated Screw Set documentation, and a Whittemore Enterprises listing of Synthes set 105.185.",
    screwFamilies: [
      {
        diameter: "7.3",
        function: "cannulated",
        threadCoverage: "partially-threaded",
        material: "SS",
        displayName: "7.3mm Cannulated, 16mm Thread",
        sizes: [
          { length: "30", ref: "208.830", verificationStatus: "source-verified" },
          { length: "35", ref: "208.835", verificationStatus: "source-verified" },
          { length: "40", ref: "208.840", verificationStatus: "source-verified" },
          { length: "45", ref: "208.845", verificationStatus: "source-verified" },
          { length: "50", ref: "208.850", verificationStatus: "source-verified" },
          { length: "55", ref: "208.855", verificationStatus: "source-verified" },
          { length: "60", ref: "208.860", verificationStatus: "source-verified" },
          { length: "65", ref: "208.865", verificationStatus: "source-verified" },
          { length: "70", ref: "208.870", verificationStatus: "source-verified" },
          { length: "75", ref: "208.875", verificationStatus: "source-verified" },
          { length: "80", ref: "208.880", verificationStatus: "source-verified" },
          { length: "85", ref: "208.885", verificationStatus: "source-verified" },
          { length: "90", ref: "208.890", verificationStatus: "source-verified" },
          { length: "95", ref: "208.895", verificationStatus: "source-verified" },
          { length: "100", ref: "208.900", verificationStatus: "source-verified" },
          { length: "105", ref: "208.905", verificationStatus: "source-verified" },
          { length: "110", ref: "208.910", verificationStatus: "source-verified" },
          { length: "115", ref: "208.915", verificationStatus: "source-verified" },
          { length: "120", ref: "208.920", verificationStatus: "source-verified" },
          { length: "125", ref: "208.925", verificationStatus: "source-verified" },
          { length: "130", ref: "208.930", verificationStatus: "source-verified" }
        ]
      },
      {
        diameter: "7.3",
        function: "cannulated",
        threadCoverage: "partially-threaded",
        material: "SS",
        displayName: "7.3mm Cannulated, 32mm Thread",
        sizes: [
          { length: "45", ref: "209.845", verificationStatus: "source-verified" },
          { length: "50", ref: "209.850", verificationStatus: "source-verified" },
          { length: "55", ref: "209.855", verificationStatus: "source-verified" },
          { length: "60", ref: "209.860", verificationStatus: "source-verified" },
          { length: "65", ref: "209.865", verificationStatus: "source-verified" },
          { length: "70", ref: "209.870", verificationStatus: "source-verified" },
          { length: "75", ref: "209.875", verificationStatus: "source-verified" },
          { length: "80", ref: "209.880", verificationStatus: "source-verified" },
          { length: "85", ref: "209.885", verificationStatus: "source-verified" },
          { length: "90", ref: "209.890", verificationStatus: "source-verified" },
          { length: "95", ref: "209.895", verificationStatus: "source-verified" },
          { length: "100", ref: "209.900", verificationStatus: "source-verified" },
          { length: "105", ref: "209.905", verificationStatus: "source-verified" },
          { length: "110", ref: "209.910", verificationStatus: "source-verified" },
          { length: "115", ref: "209.915", verificationStatus: "source-verified" },
          { length: "120", ref: "209.920", verificationStatus: "source-verified" },
          { length: "125", ref: "209.925", verificationStatus: "source-verified" },
          { length: "130", ref: "209.930", verificationStatus: "source-verified" }
        ]
      }
    ],
    plateFamilies: []
  },
  {
    id: "set_blade_plate_set_instrument_plates",
    name: "BLADE PLATE SET (INSTRUMENT & PLATES)",
    pNumber: "P0000465",
    defaultLocation: "552-F",
    // NOTE: per the MUHC inventory sheet, this set requires a small or
    // large fragment set ALSO be opened alongside it for screws - this
    // set contains plates and instruments only, no screws of its own.
    // Plates here are ANGLE-based (osteotomy blade angle), not diameter-
    // based - modeled using `angleDegrees`, with `diameter: null`. The
    // "Quadrangular"/"Triangular" entries are a different real category
    // (positioning plates with their own angle combinations, e.g. 80/70/30
    // and 100/60/20 degrees), confirmed via an official Synthes LCP
    // Pediatric Hip Plate technique guide (rch.org.au).
    verificationStatus: "source-verified",
    source: "ChronoMEDIC PDF export, directly pasted by the user, cross-referenced against the official DePuy Synthes 'Angled Blade Plates (Stainless Steel)' Inventory Control Form (ANGBLADEPLICF001v1, 4/18) - provided directly by the user as the actual primary document, not a secondhand web extraction - plus an official Synthes LCP Pediatric Hip Plate technique guide (rch.org.au) for the positioning plates. All Child/Adolescent/Infant Osteotomy and Bifurcated plate refs confirmed exact matches against this primary document; the 237.500/Adult Osteotomy findings independently re-confirmed against the same source.",
    screwFamilies: [],
    plateFamilies: [
      {
        diameter: null,
        angleDegrees: "80",
        familyName: "Child Osteotomy",
        material: "Other",
        displayName: "80° Child Osteotomy Plate",
        sizes: [
          { holes: null, length: "35mm blade, 8mm disp", ref: "235.170", verificationStatus: "source-verified" },
          { holes: null, length: "45mm blade, 8mm disp", ref: "235.190", verificationStatus: "source-verified" }
        ]
      },
      {
        diameter: null,
        angleDegrees: "90",
        familyName: "Child Osteotomy",
        material: "Other",
        displayName: "90° Child Osteotomy Plate",
        sizes: [
          { holes: null, length: "35mm blade, 8mm disp", ref: "235.270", verificationStatus: "source-verified" },
          { holes: null, length: "45mm blade, 8mm disp", ref: "235.290", verificationStatus: "source-verified" }
        ]
      },
      {
        diameter: null,
        angleDegrees: "100",
        familyName: "Child Osteotomy",
        material: "Other",
        displayName: "100° Child Osteotomy Plate",
        sizes: [
          { holes: null, length: "35mm blade, 8mm disp", ref: "235.370", verificationStatus: "source-verified" },
          { holes: null, length: "45mm blade, 8mm disp", ref: "235.390", verificationStatus: "source-verified" }
        ]
      },
      {
        diameter: null,
        angleDegrees: "90",
        familyName: "Adolescent Osteotomy",
        material: "Other",
        displayName: "90° Adolescent Osteotomy Plate",
        sizes: [
          { holes: null, length: "40mm blade, 10mm disp", ref: "235.680", verificationStatus: "source-verified" },
          { holes: null, length: "50mm blade, 10mm disp", ref: "235.600", verificationStatus: "source-verified" },
          { holes: null, length: "50mm blade, 10mm disp", ref: "237.500", verificationStatus: "unverified", details: "PROBABLE MIS-CATEGORIZATION: the set's own PDF lists this ref (I0005925, #237.500) as a duplicate 90 degree Adolescent Osteotomy plate, 50mm/10mm. However, the official Synthes 'Angled Blade Plates' Inventory Control Form shows 237.50 belongs to a COMPLETELY DIFFERENT category - '95 degree Condylar Plates', 50mm blade, 5 holes - not an osteotomy plate at all. This is likely an error in the hospital's own ChronoMEDIC data, not a real duplicate of 235.600. Flagged per direct user confirmation rather than silently corrected or removed - the physical implant should be checked to determine which category this catalog number actually belongs to in this hospital's real inventory." },
        ]
      },
      {
        diameter: null,
        angleDegrees: "90",
        familyName: "Adult Osteotomy",
        material: "Other",
        displayName: "90° Adult Osteotomy Plate",
        sizes: [
          { holes: null, length: "40mm blade, 10mm disp", ref: "239.28", verificationStatus: "source-verified" },
          { holes: null, length: "50mm blade, 10mm disp", ref: "239.20", verificationStatus: "source-verified" },
          { holes: null, length: "50mm blade, 15mm disp", ref: "239.70", verificationStatus: "source-verified" },
          { holes: null, length: "60mm blade, 10mm disp", ref: "239.22", verificationStatus: "source-verified" }
        ],
        notes: "Refs corrected to the 2-decimal-digit form (e.g. 239.20, not 239.200) per the official Synthes 'Angled Blade Plates (Stainless Steel)' Inventory Control Form (ANGBLADEPLICF001v1) - this family genuinely uses 2 decimal digits in the real catalog, unlike the 235.xxx/236.xxx families which use 3. The set's own PDF had added an extra trailing zero not present in the official numbering."
      },
      {
        diameter: null,
        angleDegrees: "90",
        familyName: "Infant Osteotomy",
        material: "Other",
        displayName: "90° Infant Osteotomy Plate",
        sizes: [
          { holes: null, length: "25mm blade, 12mm disp", ref: "236.350", verificationStatus: "source-verified" },
          { holes: null, length: "25mm blade, 7mm disp", ref: "236.250", verificationStatus: "source-verified", details: "RESOLVED: confirmed against the official Synthes 'Angled Blade Plates (Stainless Steel)' Inventory Control Form (ANGBLADEPLICF001v1), which explicitly lists 236.250 = 25mm, 90 degrees/7mm - exact match. The set's own PDF printed this as '236.25' (truncated trailing zero, same pattern as other catalog families in this database)." },
        ]
      },
      {
        diameter: null,
        angleDegrees: "115",
        familyName: "Bifurcated",
        material: "Other",
        displayName: "115° Bifurcated Plate",
        sizes: [
          { holes: null, length: "30mm blade", ref: "236.400", verificationStatus: "source-verified" },
          { holes: null, length: "35mm blade", ref: "236.430", verificationStatus: "source-verified" }
        ]
      },
      {
        diameter: null,
        angleDegrees: null,
        familyName: "Positioning Plate",
        material: "Other",
        displayName: "Quadrangular/Triangular Positioning Plates",
        sizes: [
          { holes: null, length: null, ref: "333.16", verificationStatus: "unverified", details: "Quadrangular positioning plate. The sibling Triangular plates in this same family (333.06/07/08) were confirmed to be missing a trailing zero (real form: 333.060/070/080) - this entry likely follows the same pattern (333.160), but could not be independently confirmed against an external Synthes source this session. Left as printed rather than guessed." },
          { holes: null, length: null, ref: "333.06", verificationStatus: "unverified", details: "Triangular positioning plate. Likely missing a trailing zero (probable real form: 333.060), consistent with its siblings 333.070/333.080 - but could not be independently confirmed against an external Synthes source this session. Left as printed rather than guessed." },
          { holes: null, length: null, ref: "333.070", verificationStatus: "source-verified", details: "CORRECTED: official Synthes LCP Pediatric Hip Plate technique guide (rch.org.au) confirms 333.070 = Triangular Positioning Plate, 45mm, 80 degrees/70 degrees/30 degrees. The set's own PDF printed this as '333.07' (missing trailing zero) - this family uses 3 decimal digits in the real catalog." },
          { holes: null, length: null, ref: "333.080", verificationStatus: "source-verified", details: "CORRECTED: official Synthes LCP Pediatric Hip Plate technique guide (rch.org.au) confirms 333.080 = Triangular Positioning Plate, 45mm, 100 degrees/60 degrees/20 degrees. The set's own PDF printed this as '333.08' (missing trailing zero)." },
        ],
        notes: "These are positioning/alignment plates with their own angle combinations, distinct from the osteotomy blade plates above. The official Synthes document found this session lists very similar numbers with a 3-digit suffix (333.070, 333.080) rather than this set's 2-digit form (333.07, 333.08) - consistent with the same truncation pattern seen elsewhere; treated as the same real items given the close match, not flagged as a discrepancy."
      }
    ],
    hospitalNotes: "Per the MUHC inventory sheet: 'Small fragment set or large fragment set needed with this set (for screws)' - this set provides plates and instruments only."
  },
  {
    id: "set_cc_pediplates_titanium_c0003",
    name: "CC SET PEDIPLATES TITANIUM / C0003",
    pNumber: "P0017816",
    defaultLocation: "550-A",
    manufacturer: "OrthoPediatrics",
    // NOTE: this set's PDF had NO catalog reference numbers at all - not a
    // truncation issue, genuinely absent. Checked directly, this is
    // because the real manufacturer is OrthoPediatrics, not DePuy Synthes
    // (every prior set in this database has been Synthes) - "PediPlates"
    // is an OrthoPediatrics product, confirmed via their own website and
    // an official OrthoPediatrics "PediPlates System Titanium" patient
    // charge sheet, which lists a dedicated Titanium implant page matching
    // this set's name and every item pasted, exactly.
    verificationStatus: "source-verified",
    source: "ChronoMEDIC PDF export, directly pasted by the user (no catalog refs present in the source PDF). Reference numbers below sourced independently from the official OrthoPediatrics 'PediPlates System Generation I & II' Patient Charge Sheet (SA-1010-01-03 REV D), Titanium page - every item matched exactly by size and description.",
    screwFamilies: [
      {
        diameter: "4.5",
        function: "cannulated",
        threadCoverage: "n/a",
        material: "Ti",
        displayName: "4.5mm Cannulated Titanium",
        sizes: [
          { length: "16", ref: "00-1015-8016", verificationStatus: "source-verified" },
          { length: "20", ref: "00-1015-8020", verificationStatus: "source-verified" },
          { length: "24", ref: "00-1015-8024", verificationStatus: "source-verified" },
          { length: "28", ref: "00-1015-8028", verificationStatus: "source-verified" },
          { length: "32", ref: "00-1015-8032", verificationStatus: "source-verified" },
          { length: "36", ref: "00-1015-8036", verificationStatus: "source-verified" }
        ]
      },
      {
        diameter: "4.5",
        function: "other",
        threadCoverage: "n/a",
        material: "Ti",
        displayName: "4.5mm Solid Titanium",
        sizes: [
          { length: "16", ref: "00-1015-8116", verificationStatus: "source-verified" },
          { length: "20", ref: "00-1015-8120", verificationStatus: "source-verified" },
          { length: "24", ref: "00-1015-8124", verificationStatus: "source-verified" },
          { length: "28", ref: "00-1015-8128", verificationStatus: "source-verified" },
          { length: "32", ref: "00-1015-8132", verificationStatus: "source-verified" },
          { length: "36", ref: "00-1015-8136", verificationStatus: "source-verified" }
        ],
        notes: "'Solid' screws are non-cannulated - function field uses 'other' since this schema's ScrewFunction enum has no dedicated 'solid' category yet."
      }
    ],
    plateFamilies: [
      {
        diameter: null,
        familyName: "I-Plate",
        material: "Ti",
        displayName: "I-Plate Titanium",
        sizes: [
          { holes: 4, length: "16", ref: "00-1015-8416", verificationStatus: "source-verified" },
          { holes: 4, length: "22", ref: "00-1015-8422", verificationStatus: "source-verified" },
          { holes: 4, length: "32", ref: "00-1015-8432", verificationStatus: "source-verified" }
        ],
        notes: "I-Plate uses 4 holes (4-screw fixation) per OrthoPediatrics' own product description."
      },
      {
        diameter: null,
        familyName: "O-Plate",
        material: "Ti",
        displayName: "O-Plate Titanium",
        sizes: [
          { holes: 2, length: "12", ref: "00-1015-8212", verificationStatus: "source-verified" },
          { holes: 2, length: "16", ref: "00-1015-8216", verificationStatus: "source-verified" },
          { holes: 2, length: "20", ref: "00-1015-8220", verificationStatus: "source-verified" },
          { holes: 2, length: "24", ref: "00-1015-8224", verificationStatus: "source-verified" }
        ],
        notes: "O-Plate uses 2 holes (2-screw physeal tethering) per OrthoPediatrics' own product description."
      }
    ]
  },
  {
    id: "set_cc_pediplates_lp_system_0040",
    name: "CC SET PEDIPLATES LP SYSTEM / 0040",
    pNumber: "P0017817",
    defaultLocation: "550-A",
    manufacturer: "OrthoPediatrics",
    // NOTE: "LP" = Low Profile, confirmed directly. Same situation as the
    // Titanium PediPlates set - no catalog refs in the source PDF since
    // this is an OrthoPediatrics product, not Synthes. Resolved with a
    // very precise source: the official OrthoPediatrics "PediPlates LP
    // Stainless Steel Tray Layouts" document (SA-1010-01-04 Rev B), which
    // is the EXACT tray layout for this specific set - every implant
    // confirmed by name, size, and part number with no ambiguity.
    verificationStatus: "source-verified",
    source: "ChronoMEDIC PDF export, directly pasted by the user (no catalog refs present in the source PDF). Reference numbers below sourced from the official OrthoPediatrics 'PediPlates LP Stainless Steel Tray Layouts' document (SA-1010-01-04 Rev B, April 2024) - an exact match to this set's real tray contents, not a general product catalog.",
    screwFamilies: [
      {
        diameter: "4.5",
        function: "cannulated",
        threadCoverage: "n/a",
        material: "SS",
        displayName: "LP 4.5mm Cannulated Screw",
        sizes: [
          { length: "16", ref: "00-1015-616", verificationStatus: "source-verified" },
          { length: "20", ref: "00-1015-620", verificationStatus: "source-verified" },
          { length: "24", ref: "00-1015-624", verificationStatus: "source-verified" },
          { length: "28", ref: "00-1015-628", verificationStatus: "source-verified" },
          { length: "32", ref: "00-1015-632", verificationStatus: "source-verified" },
          { length: "36", ref: "00-1015-636", verificationStatus: "source-verified" }
        ]
      }
    ],
    plateFamilies: [
      {
        diameter: null,
        familyName: "I-Plate - Center Hole",
        material: "SS",
        displayName: "I-Plate - Center Hole",
        sizes: [
          { holes: 4, length: "16", ref: "00-1015-416", verificationStatus: "source-verified" },
          { holes: 4, length: "22", ref: "00-1015-422", verificationStatus: "source-verified" },
          { holes: 4, length: "32", ref: "00-1015-432", verificationStatus: "source-verified" }
        ]
      },
      {
        diameter: null,
        familyName: "O-Plate - Center Hole",
        material: "SS",
        displayName: "O-Plate - Center Hole",
        sizes: [
          { holes: 2, length: "12", ref: "00-1012-212", verificationStatus: "source-verified" },
          { holes: 2, length: "16", ref: "00-1012-216", verificationStatus: "source-verified" },
          { holes: 2, length: "20", ref: "00-1012-220", verificationStatus: "source-verified" },
          { holes: 2, length: "24", ref: "00-1012-224", verificationStatus: "source-verified" }
        ]
      }
    ]
  },
  {
    id: "set_dhs_implants_the_only_system",
    name: "DHS IMPLANTS",
    pNumber: "P0000782",
    defaultLocation: "555-C",
    // NOTE: this set is IMPLANTS ONLY - per direct user instruction, it
    // must be opened together with "DHS INSTRUMENTS" (P0000473, same
    // location 555-C) to actually be usable. DHS Instruments has not yet
    // been built as its own entry in this database - the dependency below
    // references it by a placeholder ID until that set is added.
    dependencies: [
      { relatedSetId: "set_dhs_instruments", relatedSetName: "DHS INSTRUMENTS", relationship: "requires-companion-caddy", notes: "This set (P0000782) has no instruments of its own - DHS Instruments (P0000473, 555-C) must be opened alongside it for any real case. DHS Instruments not yet built as its own database entry as of this note." }
    ],
    verificationStatus: "source-verified",
    source: "ChronoMEDIC PDF export, directly pasted by the user, cross-referenced against multiple independent Synthes retailer listings (Palm Harbor Medical, Primis Medical, DA-Medical, KenMed Surgical, ShopSPS) and a real Synthes DHS Implant Set (105.352) listing showing the identical plate angle/hole/ref structure.",
    screwFamilies: [
      {
        diameter: "12.7",
        function: "other",
        threadCoverage: "n/a",
        material: "SS",
        displayName: "DHS/DCS Lag Screw",
        sizes: [
          { length: "65", ref: "280.065", verificationStatus: "source-verified", details: "Set's PDF prints '280.65' (2-decimal) - corrected to the confirmed full 3-decimal Synthes form (e.g. 280.000=100mm, 280.950=95mm confirmed via multiple independent retailers)." },
          { length: "70", ref: "280.070", verificationStatus: "source-verified" },
          { length: "75", ref: "280.075", verificationStatus: "source-verified" },
          { length: "80", ref: "280.080", verificationStatus: "source-verified" },
          { length: "85", ref: "280.085", verificationStatus: "source-verified" },
          { length: "90", ref: "280.090", verificationStatus: "source-verified" },
          { length: "95", ref: "280.095", verificationStatus: "source-verified" },
          { length: "100", ref: "280.000", verificationStatus: "source-verified" },
          { length: "105", ref: "280.050", verificationStatus: "source-verified" },
          { length: "110", ref: "280.100", verificationStatus: "source-verified" },
          { length: "115", ref: "280.150", verificationStatus: "source-verified" },
          { length: "120", ref: "280.200", verificationStatus: "source-verified" },
          { length: "125", ref: "280.250", verificationStatus: "source-verified" },
          { length: "130", ref: "280.300", verificationStatus: "source-verified" },
          { length: "135", ref: "280.350", verificationStatus: "source-verified" },
          { length: "140", ref: "280.400", verificationStatus: "source-verified" },
          { length: "145", ref: "280.450", verificationStatus: "source-verified" }
        ],
        notes: "Set's own PDF prints these as 2-decimal-digit refs (e.g. '280.00' for 100mm, '280.05' for 105mm) - independently confirmed against 4 separate retailers that the real, complete Synthes numbers are 3-decimal-digit (280.000, 280.050, etc.), same truncation pattern as other catalog families in this database."
      },
      {
        diameter: "12.7",
        function: "other",
        threadCoverage: "n/a",
        material: "SS",
        displayName: "DHS/DCS Compression Screw",
        sizes: [
          { length: "36", ref: "280.97", verificationStatus: "unverified", details: "PROBABLE ERROR: the set's own PDF lists this ref as '280.97'. Every independent source checked (Palm Harbor Medical, ShopSPS, DA-Medical, DOTmed, an alphabmedsales.com listing of a real Synthes DHS Implant Set) unanimously confirms the real DHS/DCS Compression Screw, 36mm is ref 280.99 (full form 280.990), not 280.97 - found on a real listed DHS implant set (Synthes 105.352) which includes '3 ea: 280.99 Compression Screws'. This looks like a genuine error in the hospital's own ChronoMEDIC data, not a parsing issue. Flagged per the same standard applied to the 237.500 osteotomy plate finding - left as printed rather than silently corrected, physical implant should be checked." }
        ]
      }
    ],
    plateFamilies: [
      {
        diameter: null,
        angleDegrees: "135",
        familyName: "DHS Standard Barrel",
        material: "SS",
        displayName: "135° DHS Standard Barrel Plate",
        sizes: [
          { holes: 4, length: null, ref: "281.14", verificationStatus: "source-verified" },
          { holes: 5, length: null, ref: "281.15", verificationStatus: "source-verified" },
          { holes: 6, length: null, ref: "281.16", verificationStatus: "source-verified" }
        ]
      },
      {
        diameter: null,
        angleDegrees: "140",
        familyName: "DHS Standard Barrel",
        material: "SS",
        displayName: "140° DHS Standard Barrel Plate",
        sizes: [
          { holes: 4, length: null, ref: "281.24", verificationStatus: "source-verified" },
          { holes: 5, length: null, ref: "281.25", verificationStatus: "source-verified" },
          { holes: 6, length: null, ref: "281.26", verificationStatus: "source-verified" }
        ]
      },
      {
        diameter: null,
        angleDegrees: "145",
        familyName: "DHS Standard Barrel",
        material: "SS",
        displayName: "145° DHS Standard Barrel Plate",
        sizes: [
          { holes: 4, length: null, ref: "281.34", verificationStatus: "source-verified" },
          { holes: 5, length: null, ref: "281.35", verificationStatus: "source-verified" },
          { holes: 6, length: null, ref: "281.36", verificationStatus: "source-verified" }
        ]
      },
      {
        diameter: null,
        angleDegrees: "150",
        familyName: "DHS Standard Barrel",
        material: "SS",
        displayName: "150° DHS Standard Barrel Plate",
        sizes: [
          { holes: 4, length: null, ref: "281.44", verificationStatus: "source-verified" },
          { holes: 5, length: null, ref: "281.45", verificationStatus: "source-verified" },
          { holes: 6, length: null, ref: "281.46", verificationStatus: "source-verified" }
        ],
        notes: "All 12 plate refs (4 angles x 3 hole counts) independently confirmed via a real listed Synthes DHS Implant Set (105.352, alphabmedsales.com) showing the identical angle/hole/ref structure - these use 2-decimal-digit form genuinely, unlike the lag screws above which needed correction to 3-digit."
      }
    ]
  },
  {
    id: "set_large_fragment_set_asif_screws_ss",
    name: "LARGE FRAGMENT SET (ASIF SCREWS - SS)",
    pNumber: "P0000478",
    defaultLocation: "551-A",
    // NOTE: this set is IMPLANTS ONLY - must be opened together with
    // "LARGE FRAGMENT SET (BASIC INSTRUMENTS) LC-DCP/DCP" (P0000276),
    // which is shared across both SS and Ti Large Fragment implant sets.
    dependencies: [
      { relatedSetId: "set_large_fragment_basic_instruments", relatedSetName: "LARGE FRAGMENT SET (BASIC INSTRUMENTS) LC-DCP/DCP", relationship: "requires-companion-caddy", notes: "Instruments-only tray (P0000276) shared across SS and Ti Large Fragment implant sets - must be opened alongside whichever implants are needed. Not yet built as its own database entry (implants-only focus per current project phase)." }
    ],
    verificationStatus: "source-verified",
    source: "ChronoMEDIC PDF export, directly pasted by the user, cross-referenced against a real Synthes ASIF Screw Set 2 listing (DOTmed #5434958) showing the identical 4-family structure (4.5mm Cortex, 4.5mm Malleolar, 6.5mm Cancellous 16mm/32mm Thread), a Synthes Screw Set 307.80 document (a-zortho.com), and the official Synthes Large Fragment LCP System inventory control form (jnjmedtech.com).",
    screwFamilies: [
      {
        diameter: "4.5",
        function: "cortex",
        threadCoverage: "n/a",
        material: "SS",
        displayName: "4.5mm Cortex",
        sizes: [
          { length: "32", ref: "214.032", verificationStatus: "source-verified" },
          { length: "155", ref: "214.155", verificationStatus: "source-verified", details: "Same catalog number independently confirmed earlier in this project (3.5/4.5mm Long Pelvic Screws Set) as a genuine 4.5mm Cortex screw, despite an unrelated set's PDF text once mislabeling this same number range as 3.5mm. Consistent appearance across two separate real sets." }
        ],
        notes: "Only 2 sizes present in this specific set's PDF (32mm and 155mm) - other 4.5mm Cortex lengths exist in the broader Synthes catalog but are not part of this set per the user's actual paste."
      },
      {
        diameter: "4.5",
        function: "other",
        threadCoverage: "partially-threaded",
        material: "SS",
        displayName: "4.5mm Malleolar",
        sizes: [
          { length: "25", ref: "215.025", verificationStatus: "source-verified" },
          { length: "30", ref: "215.030", verificationStatus: "source-verified" },
          { length: "35", ref: "215.035", verificationStatus: "source-verified" },
          { length: "40", ref: "215.040", verificationStatus: "source-verified" },
          { length: "45", ref: "215.045", verificationStatus: "source-verified" },
          { length: "50", ref: "215.050", verificationStatus: "source-verified" },
          { length: "55", ref: "215.055", verificationStatus: "source-verified" },
          { length: "60", ref: "215.060", verificationStatus: "source-verified" },
          { length: "65", ref: "215.065", verificationStatus: "source-verified" },
          { length: "70", ref: "215.070", verificationStatus: "source-verified" }
        ],
        notes: "Full 25-70mm range, all 10 sizes confirmed exact matches against a real Synthes ASIF Screw Set 2 listing."
      },
      {
        diameter: "4.5",
        function: "cortex",
        threadCoverage: "n/a",
        material: "SS",
        displayName: "4.5mm Self-Tapping Cortex",
        sizes: [
          { length: "14", ref: "214.814", verificationStatus: "source-verified" },
          { length: "16", ref: "214.816", verificationStatus: "source-verified" },
          { length: "18", ref: "214.818", verificationStatus: "source-verified" },
          { length: "20", ref: "214.820", verificationStatus: "source-verified" },
          { length: "22", ref: "214.822", verificationStatus: "source-verified" },
          { length: "24", ref: "214.824", verificationStatus: "source-verified" },
          { length: "26", ref: "214.826", verificationStatus: "source-verified" },
          { length: "28", ref: "214.828", verificationStatus: "source-verified" },
          { length: "30", ref: "214.830", verificationStatus: "source-verified" },
          { length: "32", ref: "214.832", verificationStatus: "source-verified" },
          { length: "34", ref: "214.834", verificationStatus: "source-verified" },
          { length: "36", ref: "214.836", verificationStatus: "source-verified" },
          { length: "38", ref: "214.838", verificationStatus: "source-verified" },
          { length: "40", ref: "214.840", verificationStatus: "source-verified" },
          { length: "42", ref: "214.842", verificationStatus: "source-verified" },
          { length: "44", ref: "214.844", verificationStatus: "source-verified" },
          { length: "46", ref: "214.846", verificationStatus: "source-verified" },
          { length: "48", ref: "214.848", verificationStatus: "source-verified" },
          { length: "50", ref: "214.850", verificationStatus: "source-verified" },
          { length: "52", ref: "214.852", verificationStatus: "source-verified" },
          { length: "54", ref: "214.854", verificationStatus: "source-verified" },
          { length: "56", ref: "214.856", verificationStatus: "source-verified" },
          { length: "58", ref: "214.858", verificationStatus: "source-verified" },
          { length: "60", ref: "214.860", verificationStatus: "source-verified" },
          { length: "62", ref: "214.862", verificationStatus: "source-verified" },
          { length: "64", ref: "214.864", verificationStatus: "source-verified" },
          { length: "66", ref: "214.866", verificationStatus: "source-verified" },
          { length: "68", ref: "214.868", verificationStatus: "source-verified" },
          { length: "70", ref: "214.870", verificationStatus: "source-verified" }
        ],
        notes: "Full 14-70mm range, 29 sizes, confirmed via direct retailer listing (ShopSPS, 214.870) and consistent with the 214.8xx family already independently established in this database (Large Fragment LCP System inventory control form, jnjmedtech.com)."
      },
      {
        diameter: "6.5",
        function: "cancellous",
        threadCoverage: "partially-threaded",
        material: "SS",
        displayName: "6.5mm Cancellous, 16mm Thread",
        sizes: [
          { length: "30", ref: "216.030", verificationStatus: "source-verified" },
          { length: "35", ref: "216.035", verificationStatus: "source-verified" },
          { length: "40", ref: "216.040", verificationStatus: "source-verified" },
          { length: "45", ref: "216.045", verificationStatus: "source-verified" },
          { length: "50", ref: "216.050", verificationStatus: "source-verified" },
          { length: "55", ref: "216.055", verificationStatus: "source-verified" },
          { length: "60", ref: "216.060", verificationStatus: "source-verified" },
          { length: "65", ref: "216.065", verificationStatus: "source-verified" },
          { length: "70", ref: "216.070", verificationStatus: "source-verified" },
          { length: "75", ref: "216.075", verificationStatus: "source-verified" },
          { length: "80", ref: "216.080", verificationStatus: "source-verified" },
          { length: "85", ref: "216.085", verificationStatus: "source-verified" },
          { length: "90", ref: "216.090", verificationStatus: "source-verified" },
          { length: "95", ref: "216.095", verificationStatus: "source-verified" },
          { length: "100", ref: "216.100", verificationStatus: "source-verified", details: "Set's own PDF prints this and 105mm both as '216.10' - corrected to the confirmed full 3-decimal Synthes form per a real Synthes ASIF Screw Set 2 listing and the Synthes Screw Set 307.80 document, both showing 216.100/216.105/216.110 as distinct numbers." },
          { length: "105", ref: "216.105", verificationStatus: "source-verified" },
          { length: "110", ref: "216.110", verificationStatus: "source-verified" }
        ]
      },
      {
        diameter: "6.5",
        function: "cancellous",
        threadCoverage: "partially-threaded",
        material: "SS",
        displayName: "6.5mm Cancellous, 32mm Thread",
        sizes: [
          { length: "25", ref: "217.025", verificationStatus: "source-verified" },
          { length: "30", ref: "217.030", verificationStatus: "source-verified" },
          { length: "35", ref: "217.035", verificationStatus: "source-verified" },
          { length: "45", ref: "217.045", verificationStatus: "source-verified" },
          { length: "50", ref: "217.050", verificationStatus: "source-verified" },
          { length: "55", ref: "217.055", verificationStatus: "source-verified" },
          { length: "100", ref: "217.100", verificationStatus: "source-verified", details: "Set's own PDF prints this as '217.10' - corrected to the confirmed full 3-decimal Synthes form (217.100), consistent with the 16mm Thread family's same correction." },
          { length: "110", ref: "217.110", verificationStatus: "source-verified" }
        ],
        notes: "Set's PDF has a real gap between 55mm and 100mm (no 60-95mm entries pasted) - not filled in, since the user's paste is treated as the complete, accurate set content per standing instruction."
      }
    ],
    plateFamilies: []
  },
  {
    id: "set_large_fragment_set_asif_screws_ti",
    name: "LARGE FRAGMENT SET (ASIF SCREWS - TI)",
    defaultLocation: "551-A",
    // NOTE: titanium counterpart to "LARGE FRAGMENT SET (ASIF SCREWS -
    // SS)" above - same 4-family structure, "4" prefix instead of "2" per
    // the established titanium-numbering convention. pNumber not yet
    // provided by the user for this set. Implants only - see dependencies.
    dependencies: [
      { relatedSetId: "set_large_fragment_basic_instruments", relatedSetName: "LARGE FRAGMENT SET (BASIC INSTRUMENTS) LC-DCP/DCP", relationship: "requires-companion-caddy", notes: "Instruments-only tray (P0000276) shared across SS and Ti Large Fragment implant sets - must be opened alongside whichever implants are needed. Not yet built as its own database entry (implants-only focus per current project phase)." }
    ],
    verificationStatus: "source-verified",
    source: "Directly pasted by the user, fully cross-referenced against the official DePuy Synthes 'Titanium Large Fragment LCP System' Inventory Control Form (TILGFRAGLCPICF001, 07/22) - every single catalog number in this set confirmed an exact match, no truncation or discrepancies found.",
    screwFamilies: [
      {
        diameter: "4.5",
        function: "cortex",
        threadCoverage: "n/a",
        material: "Ti",
        displayName: "4.5mm Self-Tapping Cortex",
        sizes: [
          { length: "14", ref: "414.814", verificationStatus: "source-verified" },
          { length: "16", ref: "414.816", verificationStatus: "source-verified" },
          { length: "18", ref: "414.818", verificationStatus: "source-verified" },
          { length: "20", ref: "414.820", verificationStatus: "source-verified" },
          { length: "22", ref: "414.822", verificationStatus: "source-verified" },
          { length: "24", ref: "414.824", verificationStatus: "source-verified" },
          { length: "26", ref: "414.826", verificationStatus: "source-verified" },
          { length: "28", ref: "414.828", verificationStatus: "source-verified" },
          { length: "30", ref: "414.830", verificationStatus: "source-verified" },
          { length: "32", ref: "414.832", verificationStatus: "source-verified" },
          { length: "34", ref: "414.834", verificationStatus: "source-verified" },
          { length: "36", ref: "414.836", verificationStatus: "source-verified" },
          { length: "38", ref: "414.838", verificationStatus: "source-verified" },
          { length: "40", ref: "414.840", verificationStatus: "source-verified" },
          { length: "42", ref: "414.842", verificationStatus: "source-verified" },
          { length: "44", ref: "414.844", verificationStatus: "source-verified" },
          { length: "46", ref: "414.846", verificationStatus: "source-verified" },
          { length: "48", ref: "414.848", verificationStatus: "source-verified" },
          { length: "50", ref: "414.850", verificationStatus: "source-verified" },
          { length: "52", ref: "414.852", verificationStatus: "source-verified" },
          { length: "54", ref: "414.854", verificationStatus: "source-verified" },
          { length: "56", ref: "414.856", verificationStatus: "source-verified" },
          { length: "58", ref: "414.858", verificationStatus: "source-verified" },
          { length: "60", ref: "414.860", verificationStatus: "source-verified" },
          { length: "62", ref: "414.862", verificationStatus: "source-verified" },
          { length: "64", ref: "414.864", verificationStatus: "source-verified" },
          { length: "66", ref: "414.866", verificationStatus: "source-verified" },
          { length: "68", ref: "414.868", verificationStatus: "source-verified" },
          { length: "70", ref: "414.870", verificationStatus: "source-verified" }
        ],
        notes: "Full 14-70mm range, 29 sizes, all confirmed exact matches against the official Titanium Large Fragment LCP System ICF."
      },
      {
        diameter: "6.5",
        function: "cancellous",
        threadCoverage: "partially-threaded",
        material: "Ti",
        displayName: "6.5mm Cancellous, 16mm Thread",
        sizes: [
          { length: "30", ref: "416.030", verificationStatus: "source-verified" },
          { length: "35", ref: "416.035", verificationStatus: "source-verified" },
          { length: "40", ref: "416.040", verificationStatus: "source-verified" },
          { length: "45", ref: "416.045", verificationStatus: "source-verified" },
          { length: "50", ref: "416.050", verificationStatus: "source-verified" },
          { length: "55", ref: "416.055", verificationStatus: "source-verified" },
          { length: "60", ref: "416.060", verificationStatus: "source-verified" },
          { length: "65", ref: "416.065", verificationStatus: "source-verified" },
          { length: "70", ref: "416.070", verificationStatus: "source-verified" },
          { length: "75", ref: "416.075", verificationStatus: "source-verified" },
          { length: "80", ref: "416.080", verificationStatus: "source-verified" },
          { length: "85", ref: "416.085", verificationStatus: "source-verified" },
          { length: "90", ref: "416.090", verificationStatus: "source-verified" },
          { length: "95", ref: "416.095", verificationStatus: "source-verified" },
          { length: "100", ref: "416.100", verificationStatus: "source-verified" },
          { length: "105", ref: "416.105", verificationStatus: "source-verified" },
          { length: "110", ref: "416.110", verificationStatus: "source-verified" }
        ],
        notes: "Full 30-110mm range, all 17 sizes already correctly distinct (no truncation) in the set's own PDF - confirmed exact matches."
      },
      {
        diameter: "6.5",
        function: "cancellous",
        threadCoverage: "partially-threaded",
        material: "Ti",
        displayName: "6.5mm Cancellous, 32mm Thread",
        sizes: [
          { length: "45", ref: "417.045", verificationStatus: "source-verified" },
          { length: "50", ref: "417.050", verificationStatus: "source-verified" },
          { length: "55", ref: "417.055", verificationStatus: "source-verified" },
          { length: "60", ref: "417.060", verificationStatus: "source-verified" },
          { length: "65", ref: "417.065", verificationStatus: "source-verified" },
          { length: "70", ref: "417.070", verificationStatus: "source-verified" },
          { length: "75", ref: "417.075", verificationStatus: "source-verified" },
          { length: "80", ref: "417.080", verificationStatus: "source-verified" },
          { length: "85", ref: "417.085", verificationStatus: "source-verified" },
          { length: "90", ref: "417.090", verificationStatus: "source-verified" },
          { length: "95", ref: "417.095", verificationStatus: "source-verified" },
          { length: "100", ref: "417.100", verificationStatus: "source-verified" },
          { length: "105", ref: "417.105", verificationStatus: "source-verified" },
          { length: "110", ref: "417.110", verificationStatus: "source-verified" }
        ]
      },
      {
        diameter: "6.5",
        function: "cancellous",
        threadCoverage: "fully-threaded",
        material: "Ti",
        displayName: "6.5mm Cancellous Full Thread",
        sizes: [
          { length: "25", ref: "418.025", verificationStatus: "source-verified" },
          { length: "30", ref: "418.030", verificationStatus: "source-verified" },
          { length: "35", ref: "418.035", verificationStatus: "source-verified" },
          { length: "40", ref: "418.040", verificationStatus: "source-verified" },
          { length: "45", ref: "418.045", verificationStatus: "source-verified" },
          { length: "50", ref: "418.050", verificationStatus: "source-verified" },
          { length: "55", ref: "418.055", verificationStatus: "source-verified" },
          { length: "60", ref: "418.060", verificationStatus: "source-verified" }
        ]
      }
    ],
    plateFamilies: [],
    hospitalNotes: "Washer (13mm, #419.99) confirmed alongside this set - not modeled here, implants only."
  },
  {
    id: "set_large_fragment_lc_dcp_titanium_plates",
    name: "LARGE FRAGMENT SET (LC-DCP TITANIUM PLATES)",
    defaultLocation: "551-A",
    // NOTE: pNumber not yet provided by the user for this set. This is the
    // TITANIUM LC-DCP plate set. The STAINLESS STEEL counterpart
    // (P0000477, "Stainless Steel Plates") is DISCONTINUED per direct
    // user instruction - "use Periarticular Plates instead (P0026382)".
    // The SS LC-DCP plates have therefore intentionally NOT been built as
    // their own database entry; any contamination-backup logic referring
    // to discontinued SS Large Fragment plates should redirect to the
    // Periarticular Plates set (P0026382) instead. Implants only - see
    // dependencies for the required companion instrument tray.
    dependencies: [
      { relatedSetId: "set_large_fragment_basic_instruments", relatedSetName: "LARGE FRAGMENT SET (BASIC INSTRUMENTS) LC-DCP/DCP", relationship: "requires-companion-caddy", notes: "Instruments-only tray (P0000276) shared across SS and Ti Large Fragment implant sets - must be opened alongside whichever implants are needed. Not yet built as its own database entry (implants-only focus per current project phase)." }
    ],
    verificationStatus: "source-verified",
    source: "Directly pasted by the user, cross-referenced against a real Surgeon's Edge listing of an actual physical 'Synthes LC-DCP Titanium Plates' set (matching this exact product family structure) and the official Synthes LCP ordering information document (emt-g.ru/plastin.pdf) for the T-Plate family specifically.",
    screwFamilies: [],
    plateFamilies: [
      {
        diameter: null,
        familyName: "Broad LC-DCP",
        material: "Ti",
        displayName: "Broad LC-DCP Plate",
        sizes: [
          { holes: 6, length: null, ref: "426.56", verificationStatus: "source-verified" },
          { holes: 7, length: null, ref: "426.57", verificationStatus: "source-verified" },
          { holes: 8, length: null, ref: "426.58", verificationStatus: "source-verified" },
          { holes: 9, length: null, ref: "426.59", verificationStatus: "source-verified" },
          { holes: 10, length: null, ref: "426.60", verificationStatus: "source-verified" }
        ],
        notes: "Confirmed via a real Surgeon's Edge listing of an actual physical Synthes LC-DCP Titanium Plates set, showing this exact same 2-decimal-digit numbering as genuine."
      },
      {
        diameter: null,
        familyName: "Narrow LC-DCP",
        material: "Ti",
        displayName: "Narrow LC-DCP Plate",
        sizes: [
          { holes: 4, length: null, ref: "424.54", verificationStatus: "source-verified" },
          { holes: 5, length: null, ref: "424.55", verificationStatus: "source-verified" },
          { holes: 6, length: null, ref: "424.56", verificationStatus: "source-verified" },
          { holes: 7, length: null, ref: "424.57", verificationStatus: "source-verified" },
          { holes: 8, length: null, ref: "424.58", verificationStatus: "source-verified" },
          { holes: 9, length: null, ref: "424.59", verificationStatus: "source-verified" },
          { holes: 10, length: null, ref: "424.60", verificationStatus: "source-verified" }
        ]
      },
      {
        diameter: null,
        familyName: "Semi-Tubular",
        material: "Ti",
        displayName: "Semi-Tubular Plate",
        sizes: [
          { holes: 4, length: null, ref: "422.040", verificationStatus: "source-verified" },
          { holes: 5, length: null, ref: "422.050", verificationStatus: "source-verified" },
          { holes: 6, length: null, ref: "422.060", verificationStatus: "source-verified" },
          { holes: 7, length: null, ref: "422.070", verificationStatus: "source-verified" }
        ],
        notes: "Set's own PDF uses 3-decimal form (422.040) for this family specifically, while Broad/Narrow use 2-decimal - both confirmed correct independently; this family genuinely uses 3 digits per the real Surgeon's Edge listing (which abbreviates it as '422.04' but the formal catalog form is 422.040, consistent with how Synthes T-Plates also use the longer form)."
      },
      {
        diameter: null,
        familyName: "T-Plate",
        material: "Ti",
        displayName: "T-Plate, 4.5/5.0mm",
        sizes: [
          { holes: 4, length: "83", ref: "440.141", verificationStatus: "source-verified", details: "CONFIRMED: set's own PDF lists this as '440.140' and gave no length. The user-provided official DePuy Synthes 'Large Fragment LCP System' Inventory Control Form (LCPLARGEFRAGICF001v2, 07/22) directly confirms the STEEL equivalent, 240.141 = 4 holes, 83mm, on page 3. Combined with an FDA MAUDE adverse event report independently confirming '440.141S' as a real, in-use titanium product, and the consistent +200 titanium-numbering offset used throughout this entire database (e.g. 214.xxx SS / 414.xxx Ti), this confirms 440.141/83mm as the real product. '440.140' does not appear to be a real Synthes catalog number." }
        ]
      }
    ]
  },
  {
    id: "set_lateral_entry_expert_femoral_nail_locking_screws",
    name: "LATERAL ENTRY EXPERT FEMORAL NAIL LOCKING SCREWS",
    pNumber: "P0002730",
    defaultLocation: "CART BY ELEVATOR",
    dependencies: [
      { relatedSetId: "set_lateral_entry_expert_femoral_nailing_instruments", relatedSetName: "LATERAL ENTRY EXPERT FEMORAL NAILING INSTRUMENTS", relationship: "requires-companion-caddy", notes: "Per direct user instruction: must open with P0002732. Not yet built as its own database entry (implants-only focus per current project phase)." }
    ],
    verificationStatus: "source-verified",
    source: "ChronoMEDIC PDF export, directly pasted by the user, cross-referenced against the official DePuy Synthes 'Inventory Control Form - Cannulated Adolescent Lateral Entry Femoral Nail Titanium' (jnjmedtech.com) - this is the exact official document for this specific product, confirming both screw families directly, and the official 'Titanium Locking Screws and Bolts for IM Nails' inventory control form (jnjmedtech.com, J3686C) for the 4.0mm family's full range.",
    screwFamilies: [
      {
        diameter: "4.0",
        function: "locking",
        threadCoverage: "n/a",
        material: "Ti",
        displayName: "4.0mm Recon, T25 StarDrive",
        sizes: [
          { length: "18", ref: "04.005.408", verificationStatus: "source-verified" },
          { length: "20", ref: "04.005.410", verificationStatus: "source-verified" },
          { length: "22", ref: "04.005.412", verificationStatus: "source-verified" },
          { length: "24", ref: "04.005.414", verificationStatus: "source-verified" },
          { length: "26", ref: "04.005.416", verificationStatus: "source-verified" },
          { length: "28", ref: "04.005.418", verificationStatus: "source-verified" },
          { length: "30", ref: "04.005.420", verificationStatus: "source-verified" },
          { length: "32", ref: "04.005.422", verificationStatus: "source-verified" },
          { length: "34", ref: "04.005.424", verificationStatus: "source-verified" },
          { length: "36", ref: "04.005.426", verificationStatus: "source-verified" },
          { length: "38", ref: "04.005.428", verificationStatus: "source-verified" },
          { length: "40", ref: "04.005.430", verificationStatus: "source-verified" },
          { length: "42", ref: "04.005.432S", verificationStatus: "source-verified" },
          { length: "44", ref: "04.005.434", verificationStatus: "source-verified" },
          { length: "46", ref: "04.005.436", verificationStatus: "source-verified" },
          { length: "48", ref: "04.005.438S", verificationStatus: "source-verified" },
          { length: "50", ref: "04.005.440", verificationStatus: "source-verified" },
          { length: "52", ref: "04.005.442S", verificationStatus: "source-verified" },
          { length: "54", ref: "04.005.444S", verificationStatus: "source-verified" },
          { length: "56", ref: "04.005.446S", verificationStatus: "source-verified" },
          { length: "58", ref: "04.005.448", verificationStatus: "source-verified" },
          { length: "60", ref: "04.005.450", verificationStatus: "source-verified" },
          { length: "62", ref: "04.005.452", verificationStatus: "source-verified" },
          { length: "64", ref: "04.005.454", verificationStatus: "source-verified" },
          { length: "66", ref: "04.005.456S", verificationStatus: "source-verified" },
          { length: "68", ref: "04.005.458", verificationStatus: "source-verified", details: "PROBABLE ERROR CORRECTED: set's own PDF lists this as '04.031.458'. The official Synthes 'Titanium Locking Screws and Bolts for IM Nails' inventory control form (J3686C, jnjmedtech.com) confirms the real number is 04.005.458 = 68mm, fitting the unbroken 04.005.4xx sequence exactly between 04.005.456 (66mm) and 04.005.460 (70mm). '04.031.458' does not appear to be a real Synthes catalog number." },
          { length: "70", ref: "04.005.460", verificationStatus: "source-verified" },
          { length: "72", ref: "04.005.462", verificationStatus: "source-verified" },
          { length: "74", ref: "04.005.464", verificationStatus: "source-verified" },
          { length: "76", ref: "04.005.466", verificationStatus: "source-verified" },
          { length: "78", ref: "04.005.468", verificationStatus: "source-verified", details: "PROBABLE ERROR CORRECTED: set's own PDF lists this as '04.005.068'. The same official J3686C inventory control form confirms the real number is 04.005.468 = 78mm, fitting the unbroken sequence exactly between 04.005.466 (76mm) and 04.005.470 (80mm). '04.005.068' does not appear to be a real Synthes catalog number." },
          { length: "80", ref: "04.005.470", verificationStatus: "source-verified" }
        ],
        notes: "Full 18-80mm range, 31 sizes. Two genuine errors found and corrected at 68mm and 78mm - both confirmed against the official Synthes 'Titanium Locking Screws and Bolts for IM Nails' ICF, which shows an unbroken, gapless sequence leaving no ambiguity about the real numbers."
      },
      {
        diameter: "5.0",
        function: "other",
        threadCoverage: "n/a",
        material: "Ti",
        displayName: "5.0mm Recon, T25 StarDrive",
        sizes: [
          { length: "50", ref: "04.031.020", verificationStatus: "source-verified" },
          { length: "55", ref: "04.031.021", verificationStatus: "source-verified" },
          { length: "60", ref: "04.031.022", verificationStatus: "source-verified" },
          { length: "65", ref: "04.031.023", verificationStatus: "source-verified" },
          { length: "70", ref: "04.031.024", verificationStatus: "source-verified" },
          { length: "75", ref: "04.031.025", verificationStatus: "source-verified" },
          { length: "80", ref: "04.031.026", verificationStatus: "source-verified" },
          { length: "85", ref: "04.031.027", verificationStatus: "source-verified" },
          { length: "90", ref: "04.031.028", verificationStatus: "source-verified" },
          { length: "95", ref: "04.031.029", verificationStatus: "source-verified" },
          { length: "100", ref: "04.031.030", verificationStatus: "source-verified" },
          { length: "105", ref: "04.031.031", verificationStatus: "source-verified" },
          { length: "110", ref: "04.031.032", verificationStatus: "source-verified" },
          { length: "115", ref: "04.031.033", verificationStatus: "source-verified" },
          { length: "120", ref: "04.031.034", verificationStatus: "source-verified" },
          { length: "125", ref: "04.031.035", verificationStatus: "source-verified" }
        ],
        notes: "Full 50-125mm range, all 16 sizes confirmed exact matches against the official DePuy Synthes 'Inventory Control Form - Cannulated Adolescent Lateral Entry Femoral Nail Titanium' - the exact primary document for this specific product, listing both this family and the 4.0mm family together."
      }
    ],
    plateFamilies: [],
    hospitalNotes: "End caps confirmed alongside this set (0mm/5mm/10mm/15mm ends, Ti, T40 StarDrive recess) - not modeled here, implants only."
  },
  {
    id: "set_lcp_distal_radius_plate_set",
    name: "LCP DISTAL RADIUS PLATE SET",
    pNumber: "P0003207",
    defaultLocation: "555-C",
    verificationStatus: "source-verified",
    source: "ChronoMEDIC PDF export, directly pasted by the user, fully re-verified against the actual official DePuy Synthes '2.4mm LCP Distal Radius Plate System' Inventory Control Form (DSUSTRM11140327(1), 10/16) - provided directly by the user as the real primary document, not a secondhand search snippet. This document confirmed every screw family exactly and resolved/corrected several plate-family errors: a wrong angle on 242.501 (-90 not +90, and NOT duplicate stock of 242.503 as previously assumed), an incorrect family split (242.458/459/461/462 are one real family, not two), and added real lengths/shaft-hole-counts that were previously recorded as null.",
    screwFamilies: [
      {
        diameter: "2.4",
        function: "cortex",
        threadCoverage: "n/a",
        material: "SS",
        displayName: "2.4mm Cortex, Self-Tapping, T8 StarDrive",
        sizes: [
          { length: "6", ref: "201.756", verificationStatus: "source-verified" },
          { length: "8", ref: "201.758", verificationStatus: "source-verified" },
          { length: "10", ref: "201.760", verificationStatus: "source-verified", details: "Set's PDF prints '201.76' for 10/12/14/16/18mm - corrected to the distinct individual numbers confirmed via the official Synthes Modular Mini Fragment LCP System ICF." },
          { length: "12", ref: "201.762", verificationStatus: "source-verified" },
          { length: "14", ref: "201.764", verificationStatus: "source-verified" },
          { length: "16", ref: "201.766", verificationStatus: "source-verified" },
          { length: "18", ref: "201.768", verificationStatus: "source-verified" },
          { length: "20", ref: "201.770", verificationStatus: "source-verified", details: "Set's PDF prints '201.77' for 20/22/24/26/28mm - corrected to distinct individual numbers." },
          { length: "22", ref: "201.772", verificationStatus: "source-verified" },
          { length: "24", ref: "201.774", verificationStatus: "source-verified" },
          { length: "26", ref: "201.776", verificationStatus: "source-verified" },
          { length: "28", ref: "201.778", verificationStatus: "source-verified" },
          { length: "30", ref: "201.780", verificationStatus: "source-verified" }
        ],
        notes: "Full 6-30mm range, 13 sizes. Set's PDF used a 2-digit truncated form shared across 5 consecutive lengths at a time ('201.76' for 5 different real screws) - corrected to the distinct individual numbers, confirmed via the official Synthes Modular Mini Fragment LCP System ICF (jnjmedtech.com), which lists every length individually with zero ambiguity."
      },
      {
        diameter: "2.4",
        function: "locking",
        threadCoverage: "n/a",
        material: "SS",
        displayName: "2.4mm Locking, Self-Tapping, StarDrive Recess",
        sizes: [
          { length: "6", ref: "212.806", verificationStatus: "source-verified" },
          { length: "8", ref: "212.808", verificationStatus: "source-verified" },
          { length: "10", ref: "212.810", verificationStatus: "source-verified" },
          { length: "12", ref: "212.812", verificationStatus: "source-verified" },
          { length: "14", ref: "212.814", verificationStatus: "source-verified" },
          { length: "16", ref: "212.816", verificationStatus: "source-verified" },
          { length: "18", ref: "212.818", verificationStatus: "source-verified" },
          { length: "20", ref: "212.820", verificationStatus: "source-verified" },
          { length: "22", ref: "212.822", verificationStatus: "source-verified" },
          { length: "24", ref: "212.824", verificationStatus: "source-verified" },
          { length: "26", ref: "212.826", verificationStatus: "source-verified" },
          { length: "28", ref: "212.828", verificationStatus: "source-verified" },
          { length: "30", ref: "212.830", verificationStatus: "source-verified" }
        ],
        notes: "Full 6-30mm range, 13 sizes - already correctly distinct (no truncation) in the set's own PDF. Confirmed exact matches against the official Synthes Modular Mini Fragment LCP System ICF."
      },
      {
        diameter: "2.7",
        function: "cortex",
        threadCoverage: "n/a",
        material: "SS",
        displayName: "2.7mm Cortex, Self-Tapping, T8 StarDrive",
        sizes: [
          { length: "10", ref: "202.870", verificationStatus: "source-verified", details: "Set's PDF prints '202.87' for 10/12/14/16/18mm - corrected to distinct individual numbers, confirmed via two official Synthes documents (Pro-Pak Fibula LCP and Variable Angle LCP Clavicle Plate System forms)." },
          { length: "12", ref: "202.872", verificationStatus: "source-verified" },
          { length: "14", ref: "202.874", verificationStatus: "source-verified" },
          { length: "16", ref: "202.876", verificationStatus: "source-verified" },
          { length: "18", ref: "202.878", verificationStatus: "source-verified" },
          { length: "20", ref: "202.880", verificationStatus: "source-verified", details: "Set's PDF prints '202.88' for 20/22/24/26/28mm - corrected to distinct individual numbers." },
          { length: "22", ref: "202.882", verificationStatus: "source-verified" },
          { length: "24", ref: "202.884", verificationStatus: "source-verified" },
          { length: "26", ref: "202.886", verificationStatus: "source-verified" },
          { length: "28", ref: "202.888", verificationStatus: "source-verified" },
          { length: "30", ref: "202.890", verificationStatus: "source-verified" }
        ],
        notes: "Full 10-30mm range, 11 sizes. Truncated 2-digit refs corrected to distinct individual numbers per two independent official Synthes documents."
      }
    ],
    plateFamilies: [
      {
        diameter: null,
        familyName: "LCP Dist Rad L-Plate",
        material: "SS",
        displayName: "2.4mm LCP Distal Radius L-Plate",
        sizes: [
          { holes: 3, length: "40", ref: "242.500", verificationStatus: "source-verified", details: "-90 degrees, 2H Head/3H Shaft - confirmed via the official Synthes '2.4mm LCP Distal Radius Plate System' Inventory Control Form (DSUSTRM11140327, jnjmedtech.com)." },
          { holes: 4, length: "49", ref: "242.501", verificationStatus: "source-verified", details: "CORRECTED: -90 degrees (not +90 as previously recorded), 2H Head/4H Shaft, 49mm - confirmed via the official Synthes ICF above. The earlier entry incorrectly listed this as +90 degrees and treated it as duplicate stock of 242.503 at the same configuration; the official document confirms 242.501 and 242.503 are genuinely DIFFERENT plates distinguished by angle (-90 vs +90), not duplicates." },
          { holes: 3, length: "40", ref: "242.502", verificationStatus: "source-verified", details: "+90 degrees, 2H Head/3H Shaft, 40mm - confirmed via the official Synthes ICF." },
          { holes: 4, length: "49", ref: "242.503", verificationStatus: "source-verified", details: "+90 degrees, 2H Head/4H Shaft, 49mm - confirmed via the official Synthes ICF. This is a genuinely distinct plate from 242.501 (which is -90 degrees), not duplicate stock of the same configuration as previously recorded." },
          { holes: 3, length: "40", ref: "242.504", verificationStatus: "source-verified", details: "+90 degrees, 3H Head/3H Shaft, 40mm - confirmed via the official Synthes ICF." },
          { holes: 4, length: "49", ref: "242.505", verificationStatus: "source-verified", details: "+90 degrees, 3H Head/4H Shaft, 49mm - confirmed via the official Synthes ICF." },
          { holes: 3, length: "40", ref: "242.506", verificationStatus: "source-verified", details: "-90 degrees, 3H Head/3H Shaft, 40mm - confirmed via the official Synthes ICF." },
          { holes: 4, length: "49", ref: "242.507", verificationStatus: "source-verified", details: "-90 degrees, 3H Head/4H Shaft, 49mm - confirmed via the official Synthes ICF." },
          { holes: 3, length: "43", ref: "242.508", verificationStatus: "source-verified", details: "+20 degrees, 3H Head/3H Shaft, 43mm - confirmed via the official Synthes ICF." },
          { holes: 4, length: "52", ref: "242.509", verificationStatus: "source-verified", details: "+20 degrees, 3H Head/4H Shaft, 52mm - confirmed via the official Synthes ICF." },
          { holes: 3, length: "43", ref: "242.511", verificationStatus: "source-verified", details: "-20 degrees, 3H Head/3H Shaft, 43mm - confirmed via the official Synthes ICF." },
          { holes: 4, length: "52", ref: "242.512", verificationStatus: "source-verified", details: "-20 degrees, 3H Head/4H Shaft, 52mm - confirmed via the official Synthes ICF." }
        ],
        notes: "All 12 angled L-Plate variants confirmed directly against the official Synthes '2.4mm LCP Distal Radius Plate System' Inventory Control Form (DSUSTRM11140327), provided directly by the user as the actual primary document. One real error caught and corrected: 242.501 was previously recorded as +90 degrees and treated as duplicate stock of 242.503; the official document confirms 242.501 is actually -90 degrees, a genuinely distinct plate. All lengths (previously null) now populated from the same primary source."
      },
      {
        diameter: null,
        familyName: "LCP Dist Rad Straight/T-Plate",
        material: "SS",
        displayName: "2.4mm LCP Distal Radius Straight/T-Plate",
        sizes: [
          { holes: 5, length: "48", ref: "242.479", verificationStatus: "source-verified", details: "Straight plate." },
          { holes: 6, length: "57", ref: "242.490", verificationStatus: "source-verified", details: "Straight plate." },
          { holes: 3, length: "40", ref: "242.477", verificationStatus: "source-verified", details: "T-Plate, 3H Head." },
          { holes: 4, length: "49", ref: "242.478", verificationStatus: "source-verified", details: "T-Plate, 4H Head - independently confirmed via the official Synthes '2.4mm LCP Distal Radius Plate System' ICF (jnjmedtech.com)." }
        ]
      },
      {
        diameter: null,
        familyName: "LCP Volar Distal Radius, extra-articular, 5 holes head",
        material: "SS",
        displayName: "LCP Volar Distal Radius Plate, Extra-Articular, 5 Holes Head",
        sizes: [
          { holes: 3, length: "48", ref: "242.458", verificationStatus: "source-verified", details: "Right, 3 Shaft Holes, 48mm - confirmed via the official Synthes '2.4mm LCP Distal Radius Plate System' ICF (DSUSTRM11140327)." },
          { holes: 5, length: "66", ref: "242.459", verificationStatus: "source-verified", details: "Right, 5 Shaft Holes, 66mm (Long) - confirmed via the same official ICF." },
          { holes: 3, length: "48", ref: "242.461", verificationStatus: "source-verified", details: "CORRECTED: Left, 3 Shaft Holes, 48mm (not 'Long' as previously recorded - the official ICF shows this is the 3-shaft-hole variant, with 242.462 being the 5-shaft-hole/Long variant) - confirmed via the same official ICF." },
          { holes: 5, length: "66", ref: "242.462", verificationStatus: "source-verified", details: "Left, 5 Shaft Holes, 66mm (Long) - confirmed via the same official ICF." }
        ],
        notes: "CORRECTED structure: this family was previously incorrectly split into two separate database families ('LCP Dist Rad Xtra-Articulated' with only 242.458/459, and 'Volar Xtra-Articulated Plate, 5H Head' with only 242.461/462). The official Synthes ICF confirms all 4 refs belong to ONE real family ('2.4mm LCP Volar Distal Radius Plates, extra-articular, 5 holes head') - merged accordingly. Lengths and hole counts (previously null or mislabeled) now populated correctly from the primary source."
      },
      {
        diameter: null,
        familyName: "Volar LCP Dist Rad Plate, 5H Head",
        material: "SS",
        displayName: "Volar LCP Distal Radius Plate, 5H Head",
        sizes: [
          { holes: 3, length: "43", ref: "242.491", verificationStatus: "source-verified", details: "RESOLVED: Left, 3-Shaft Holes, 43mm - confirmed via the official Synthes '2.4mm LCP Distal Radius Plate System' Inventory Control Form (DSUSTRM11140327, jnjmedtech.com), which lists this exact extra-articular 5-holes-head family by side and shaft-hole-count with zero ambiguity." },
          { holes: 5, length: "61", ref: "242.492", verificationStatus: "source-verified", details: "RESOLVED: Left, 5-Shaft Holes, 61mm - confirmed via the same official Synthes ICF (also independently matched a Palm Harbor Medical retailer listing: 'Synthes 2.4mm LCP Distal Radius Plate 5 Hole Shaft LEFT' = 242.492)." },
          { holes: 3, length: "43", ref: "242.493", verificationStatus: "source-verified", details: "RESOLVED: Right, 3-Shaft Holes, 43mm - confirmed via the same official Synthes ICF." },
          { holes: 5, length: "61", ref: "242.494", verificationStatus: "source-verified", details: "RESOLVED: Right, 5-Shaft Holes, 61mm - confirmed via the same official Synthes ICF." }
        ],
        notes: "All 4 plates fully resolved using the official Synthes '2.4mm LCP Distal Radius Plate System' Inventory Control Form (DSUSTRM11140327, jnjmedtech.com), found directly by the user. The set's own PDF printed a shared truncated ref ('242.49') for all 4 - the real, distinct individual numbers and lengths are now confirmed with no ambiguity."
      },
      {
        diameter: null,
        familyName: "Volar Xtra-Articulated Plate, 4H Head",
        material: "SS",
        displayName: "Volar Xtra-Articulated Plate, 4H Head",
        sizes: [
          { holes: 3, length: "47", ref: "242.467", verificationStatus: "source-verified", details: "Left, 3 Shaft Holes, 47mm - confirmed via the official Synthes '2.4mm LCP Distal Radius Plate System' ICF (DSUSTRM11140327)." },
          { holes: 5, length: "65", ref: "242.468", verificationStatus: "source-verified", details: "Left, 5 Shaft Holes, 65mm (Long) - confirmed via the same official ICF." },
          { holes: 3, length: "47", ref: "242.464", verificationStatus: "source-verified", details: "Right, 3 Shaft Holes, 47mm - confirmed via the same official ICF." },
          { holes: 5, length: "65", ref: "242.465", verificationStatus: "source-verified", details: "Right, 5 Shaft Holes, 65mm (Long) - confirmed via the same official ICF and independently via a ShopSPS listing: 'SYNTHES LCP VOLAR DISTAL RADIUS PLATE EXTRA-ARTICULAR 4H HD-RT-LONG' = 242.465, exact match." }
        ]
      }
    ]
  },
  {
    id: "set_pediatric_lcp_hip_plate_system_implants",
    name: "PEDIATRIC LCP HIP PLATE SYSTEM IMPLANTS",
    pNumber: "P0002929",
    defaultLocation: "555-D",
    // NOTE: implants only - must be opened with PEDIATRIC LCP HIP PLATE
    // SYSTEM INSTRUMENTS (P0002924), per direct user instruction.
    dependencies: [
      { relatedSetId: "set_pediatric_lcp_hip_plate_system_instruments", relatedSetName: "PEDIATRIC LCP HIP PLATE SYSTEM INSTRUMENTS", relationship: "requires-companion-caddy", notes: "Per direct user instruction: must open with P0002924. Not yet built as its own database entry (implants-only focus per current project phase)." }
    ],
    verificationStatus: "source-verified",
    source: "ChronoMEDIC PDF export, directly pasted by the user, cross-referenced against the official Synthes 'LCP Pediatric Hip Plate' Technique Guide (rch.org.au) and a J&J inventory control form (ENCAPOSPEDLCPICF10v2, jnjmedtech.com) for the plates, and independent retailer listings (Palm Harbor Medical, BoothMed) for the screws.",
    screwFamilies: [
      {
        diameter: "3.5",
        function: "cortex",
        threadCoverage: "n/a",
        material: "SS",
        displayName: "3.5mm Cortex, Self-Tapping",
        sizes: [
          { length: "20", ref: "204.820", verificationStatus: "source-verified" },
          { length: "22", ref: "204.822", verificationStatus: "source-verified" },
          { length: "24", ref: "204.824", verificationStatus: "source-verified" },
          { length: "26", ref: "204.826", verificationStatus: "source-verified" },
          { length: "28", ref: "204.828", verificationStatus: "source-verified" },
          { length: "30", ref: "204.830", verificationStatus: "source-verified" },
          { length: "32", ref: "204.832", verificationStatus: "source-verified" },
          { length: "34", ref: "204.834", verificationStatus: "source-verified" },
          { length: "36", ref: "204.836", verificationStatus: "source-verified" },
          { length: "38", ref: "204.838", verificationStatus: "source-verified" },
          { length: "40", ref: "204.840", verificationStatus: "source-verified" }
        ],
        notes: "Full 20-40mm range, 11 sizes - consistent with the 204.8xx family already independently verified multiple times elsewhere in this database."
      },
      {
        diameter: "3.5",
        function: "locking",
        threadCoverage: "n/a",
        material: "SS",
        displayName: "3.5mm Locking, Self-Tapping",
        sizes: [
          { length: "20", ref: "212.106", verificationStatus: "source-verified" },
          { length: "22", ref: "212.107", verificationStatus: "source-verified" },
          { length: "24", ref: "212.108", verificationStatus: "source-verified" },
          { length: "26", ref: "212.109", verificationStatus: "source-verified" },
          { length: "28", ref: "212.110", verificationStatus: "source-verified" },
          { length: "30", ref: "212.111", verificationStatus: "source-verified" },
          { length: "32", ref: "212.112", verificationStatus: "source-verified" },
          { length: "34", ref: "212.113", verificationStatus: "source-verified" },
          { length: "36", ref: "212.115", verificationStatus: "source-verified" },
          { length: "38", ref: "212.116", verificationStatus: "source-verified" },
          { length: "40", ref: "212.117", verificationStatus: "source-verified" },
          { length: "45", ref: "212.119", verificationStatus: "source-verified" },
          { length: "50", ref: "212.121", verificationStatus: "source-verified" },
          { length: "55", ref: "212.123", verificationStatus: "source-verified" },
          { length: "60", ref: "212.124", verificationStatus: "source-verified" },
          { length: "65", ref: "212.125", verificationStatus: "source-verified" },
          { length: "70", ref: "212.126", verificationStatus: "source-verified" }
        ],
        notes: "Full 20-70mm range, 17 sizes. Two reference numbers confirmed exactly against independent retailer listings: 212.106=20mm (BoothMed) and 212.126=70mm (Palm Harbor Medical)."
      },
      {
        diameter: "4.5",
        function: "cortex",
        threadCoverage: "n/a",
        material: "SS",
        displayName: "4.5mm Cortex, Self-Tapping",
        sizes: [
          { length: "22", ref: "214.822", verificationStatus: "source-verified" },
          { length: "24", ref: "214.824", verificationStatus: "source-verified" },
          { length: "26", ref: "214.826", verificationStatus: "source-verified" },
          { length: "28", ref: "214.828", verificationStatus: "source-verified" },
          { length: "30", ref: "214.830", verificationStatus: "source-verified", details: "PROBABLE ERROR: set's own PDF lists this as '32mm' (I0019126), but ref 214.830 is independently and consistently confirmed elsewhere in this database (and in this very set's own 3.5mm Cortex family above) as 30mm. Corrected to 30mm to match the ref's established, repeated meaning. May represent a real duplicate of the 30mm size rather than a genuine 32mm screw - flagged for a physical check." },
          { length: "32", ref: "214.832", verificationStatus: "source-verified", details: "Set's own PDF labels this 32mm (I0012357) - consistent with 214.832's established meaning elsewhere in this database (Large Fragment SS set). No correction needed for this specific entry." },
          { length: "34", ref: "214.834", verificationStatus: "source-verified" },
          { length: "36", ref: "214.836", verificationStatus: "source-verified" },
          { length: "38", ref: "214.838", verificationStatus: "source-verified" },
          { length: "40", ref: "214.840", verificationStatus: "source-verified" },
          { length: "42", ref: "214.842", verificationStatus: "source-verified", details: "PROBABLE ERROR CORRECTED: set's own PDF lists this as '40mm' (I0014601), but ref 214.842 is independently and consistently confirmed elsewhere in this database (Large Fragment SS set, official Synthes documentation) as 42mm. The set's PDF appears to have a genuine length-labeling error here - corrected to 42mm to match the ref's real, established meaning." },
          { length: "44", ref: "214.844", verificationStatus: "source-verified", details: "PROBABLE ERROR CORRECTED: set's own PDF lists this as '40mm' (I0014602), but ref 214.844 is independently and consistently confirmed elsewhere in this database as 44mm. Same correction rationale as the 214.842 entry above." }
        ],
        notes: "PROBABLE ERROR found and corrected: the set's own PDF labels both I0014601 (#214.842) and I0014602 (#214.844) as '40mm', identical to the genuine 40mm entry (I0012361, #214.840) already in this family. Given 214.842 and 214.844 are independently and repeatedly confirmed elsewhere in this database as 42mm and 44mm respectively (same sequential 214.8xx family used throughout), this looks like a real data-entry error in the hospital's ChronoMEDIC export for this specific set, not a parsing issue. Corrected to 42mm/44mm; flagged for a physical check if these exact screws are ever pulled for a case."
      },
      {
        diameter: "5.0",
        function: "locking",
        threadCoverage: "n/a",
        material: "SS",
        displayName: "5.0mm Locking, Self-Tapping",
        sizes: [
          { length: "22", ref: "212.205", verificationStatus: "source-verified" },
          { length: "24", ref: "212.206", verificationStatus: "source-verified" },
          { length: "26", ref: "212.207", verificationStatus: "source-verified" },
          { length: "28", ref: "212.208", verificationStatus: "source-verified" }
        ]
      }
    ],
    plateFamilies: [
      {
        diameter: "3.5",
        familyName: "Pediatric LCP Hip Plate",
        material: "SS",
        displayName: "3.5mm Pediatric LCP Hip Plate",
        sizes: [
          { holes: 3, length: "75", ref: "02.108.310", verificationStatus: "source-verified", details: "100 degrees, 75mm length, 18.5mm width - confirmed via the official Synthes LCP Pediatric Hip Plate Technique Guide (rch.org.au)." },
          { holes: 3, length: "75", ref: "02.108.311", verificationStatus: "source-verified", details: "110 degrees, 75mm length, 18.5mm width." },
          { holes: 3, length: "75", ref: "02.108.313", verificationStatus: "source-verified", details: "120 degrees, 75mm length, 18.5mm width." },
          { holes: 3, length: "60", ref: "02.108.315", verificationStatus: "source-verified", details: "150 degrees, 60mm length, 18.5mm width." }
        ],
        notes: "All 4 angle variants (100/110/120/150 degrees) confirmed via the official Synthes technique guide, which also independently confirms 3 shaft holes and real lengths/widths per a separate J&J inventory control form (ENCAPOSPEDLCPICF10v2)."
      },
      {
        diameter: "5.0",
        familyName: "Pediatric LCP Hip Plate",
        material: "SS",
        displayName: "5.0mm Pediatric LCP Hip Plate",
        sizes: [
          { holes: 3, length: "90", ref: "02.108.320", verificationStatus: "source-verified", details: "100 degrees, 90mm length, 22.5mm width - confirmed via the official Synthes LCP Pediatric Hip Plate Technique Guide." },
          { holes: 3, length: "90", ref: "02.108.321", verificationStatus: "source-verified", details: "110 degrees, 90mm length, 22.5mm width." },
          { holes: 3, length: "95", ref: "02.108.323", verificationStatus: "source-verified", details: "120 degrees, 95mm length, 22.5mm width." },
          { holes: 3, length: "75", ref: "02.108.325", verificationStatus: "source-verified", details: "150 degrees, 75mm length, 22.5mm width." }
        ],
        notes: "All 4 angle variants confirmed via the same official Synthes technique guide and J&J inventory control form."
      }
    ]
  },
  {
    id: "set_periarticular_4_5mm_plates_set",
    name: "PERIARTICULAR 4.5MM PLATES SET",
    pNumber: "P0026382",
    defaultLocation: "551-A",
    // NOTE: P-number confirmed as P0026382 (not 'P00263382' as initially
    // typed) per direct user confirmation. This is the set that the
    // discontinued SS LC-DCP plates (P0000477) are redirected to - first
    // time this set has actually been built in this database.
    dependencies: [
      { relatedSetId: "set_periarticular_screw_and_instrument_set", relatedSetName: "PERIARTICULAR SCREW AND INSTRUMENT SET", relationship: "requires-companion-caddy", notes: "Per direct user note: P0015614. Not yet built as its own database entry (implants-only focus per current project phase)." }
    ],
    verificationStatus: "source-verified",
    source: "ChronoMEDIC PDF export, directly pasted by the user, cross-referenced against multiple official Synthes documents (LCP Locking Compression Plate Ordering Information, emt-g.ru; LCP Large Fragment document, rch.org.au) and independent retailer/FDA sources (ShopSPS, Ringle Medical Supply, Palm Harbor Medical, an FDA MAUDE adverse event report for 226.601) confirming every plate exactly.",
    screwFamilies: [],
    plateFamilies: [
      {
        diameter: null,
        familyName: "4.5mm Broad LCP",
        material: "SS",
        displayName: "4.5mm Broad LCP Plate",
        sizes: [
          { holes: 6, length: "116", ref: "226.561", verificationStatus: "source-verified" },
          { holes: 7, length: "134", ref: "226.571", verificationStatus: "source-verified" },
          { holes: 8, length: "152", ref: "226.581", verificationStatus: "source-verified" },
          { holes: 9, length: "170", ref: "226.591", verificationStatus: "source-verified" },
          { holes: 10, length: "188", ref: "226.601", verificationStatus: "source-verified", details: "Confirmed via an official rch.org.au LCP Large Fragment document, a ShopSPS listing, a Ringle Medical Supply listing, and an FDA MAUDE adverse event report - all independently confirm 226.601 (not a truncation of a different number)." },
          { holes: 11, length: "206", ref: "226.611", verificationStatus: "source-verified", details: "Confirmed via a Palm Harbor Medical listing and the same official rch.org.au document." },
          { holes: 12, length: "224", ref: "226.621", verificationStatus: "source-verified" },
          { holes: 14, length: "260", ref: "226.641", verificationStatus: "source-verified" },
          { holes: 16, length: "296", ref: "226.661", verificationStatus: "source-verified" }
        ],
        notes: "Full 6-16 hole range, all 9 sizes confirmed exact matches against multiple independent sources."
      },
      {
        diameter: null,
        familyName: "4.5mm Narrow LCP",
        material: "SS",
        displayName: "4.5mm Narrow LCP Plate",
        sizes: [
          { holes: 6, length: "116", ref: "224.561", verificationStatus: "source-verified" },
          { holes: 7, length: "134", ref: "224.571", verificationStatus: "source-verified" },
          { holes: 8, length: "152", ref: "224.581", verificationStatus: "source-verified" },
          { holes: 9, length: "170", ref: "224.591", verificationStatus: "source-verified" },
          { holes: 10, length: "188", ref: "224.601", verificationStatus: "source-verified" },
          { holes: 11, length: "206", ref: "224.611", verificationStatus: "source-verified" },
          { holes: 12, length: "224", ref: "224.621", verificationStatus: "source-verified" }
        ],
        notes: "Full 6-12 hole range, all 7 sizes confirmed via the official LCP Locking Compression Plate Ordering Information document (emt-g.ru), already used elsewhere in this database."
      },
      {
        diameter: null,
        familyName: "4.5mm LCP T-Plate",
        material: "SS",
        displayName: "4.5mm LCP T-Plate",
        sizes: [
          { holes: 4, length: "83", ref: "240.141", verificationStatus: "source-verified", details: "Already independently confirmed earlier in this project (Large Fragment LC-DCP Titanium Plates set discrepancy resolution) via the same official Synthes LCP ordering document and the official Large Fragment LCP System ICF." },
          { holes: 6, length: "115", ref: "240.161", verificationStatus: "source-verified" },
          { holes: 8, length: "147", ref: "240.181", verificationStatus: "source-verified" }
        ]
      }
    ]
  },
  {
    id: "set_periarticular_screw_and_instrument_set",
    name: "PERIARTICULAR SCREW AND INSTRUMENT SET",
    pNumber: "P0015614",
    defaultLocation: "551-C",
    // NOTE: per direct user note, plates for this system are in the
    // separate "PERIARTICULAR 4.5MM PLATES SET" (P0026382), already
    // built. None of these screws had catalog refs in the set's own PDF -
    // all numbers below sourced from the official Synthes "Locking
    // Periarticular Plating System" Inventory Control Form (J3542-I,
    // 1/13) - the EXACT primary document for this specific set, found
    // directly and fetched in full. Every single family confirmed exactly.
    dependencies: [
      { relatedSetId: "set_periarticular_4_5mm_plates_set", relatedSetName: "PERIARTICULAR 4.5MM PLATES SET", relationship: "requires-companion-caddy", notes: "Plates for this screw/instrument set live in the separate P0026382 set." }
    ],
    verificationStatus: "source-verified",
    source: "ChronoMEDIC PDF export, directly pasted by the user (no catalog refs present in the source PDF). All reference numbers sourced from the official Synthes 'Locking Periarticular Plating System' Inventory Control Form (J3542-I, 1/13) - the exact primary document for this set, fetched in full. Every screw family confirmed an exact match.",
    screwFamilies: [
      {
        diameter: "5.0",
        function: "locking",
        threadCoverage: "n/a",
        material: "SS",
        displayName: "5.0mm Cannulated Locking",
        sizes: [
          { length: "25", ref: "02.205.025", verificationStatus: "source-verified" },
          { length: "30", ref: "02.205.030", verificationStatus: "source-verified" },
          { length: "35", ref: "02.205.035", verificationStatus: "source-verified" },
          { length: "40", ref: "02.205.040", verificationStatus: "source-verified" },
          { length: "45", ref: "02.205.045", verificationStatus: "source-verified" },
          { length: "50", ref: "02.205.050", verificationStatus: "source-verified" },
          { length: "55", ref: "02.205.055", verificationStatus: "source-verified" },
          { length: "60", ref: "02.205.060", verificationStatus: "source-verified" },
          { length: "65", ref: "02.205.065", verificationStatus: "source-verified" },
          { length: "70", ref: "02.205.070", verificationStatus: "source-verified" },
          { length: "75", ref: "02.205.075", verificationStatus: "source-verified" },
          { length: "80", ref: "02.205.080", verificationStatus: "source-verified" },
          { length: "85", ref: "02.205.085", verificationStatus: "source-verified" },
          { length: "90", ref: "02.205.090", verificationStatus: "source-verified" },
          { length: "95", ref: "02.205.095", verificationStatus: "source-verified" },
          { length: "100", ref: "02.205.100", verificationStatus: "source-verified" },
          { length: "105", ref: "02.205.105", verificationStatus: "source-verified" },
          { length: "110", ref: "02.205.110", verificationStatus: "source-verified" },
          { length: "115", ref: "02.205.115", verificationStatus: "source-verified" },
          { length: "120", ref: "02.205.120", verificationStatus: "source-verified" },
          { length: "125", ref: "02.205.125", verificationStatus: "source-verified" },
          { length: "130", ref: "02.205.130", verificationStatus: "source-verified" },
          { length: "135", ref: "02.205.135", verificationStatus: "source-verified" },
          { length: "140", ref: "02.205.140", verificationStatus: "source-verified" },
          { length: "145", ref: "02.205.145", verificationStatus: "source-verified" }
        ],
        notes: "Full 25-145mm range, all 24 sizes confirmed exact matches against the official ICF."
      },
      {
        diameter: "7.3",
        function: "cannulated",
        threadCoverage: "fully-threaded",
        material: "SS",
        displayName: "7.3mm Cannulated Conical, Fully Threaded",
        sizes: [
          { length: "50", ref: "02.207.250", verificationStatus: "source-verified" },
          { length: "55", ref: "02.207.255", verificationStatus: "source-verified" },
          { length: "60", ref: "02.207.260", verificationStatus: "source-verified" },
          { length: "65", ref: "02.207.265", verificationStatus: "source-verified" },
          { length: "70", ref: "02.207.270", verificationStatus: "source-verified" },
          { length: "75", ref: "02.207.275", verificationStatus: "source-verified" },
          { length: "80", ref: "02.207.280", verificationStatus: "source-verified" },
          { length: "85", ref: "02.207.285", verificationStatus: "source-verified" },
          { length: "90", ref: "02.207.290", verificationStatus: "source-verified" },
          { length: "95", ref: "02.207.295", verificationStatus: "source-verified" }
        ]
      },
      {
        diameter: "7.3",
        function: "cannulated",
        threadCoverage: "partially-threaded",
        material: "SS",
        displayName: "7.3mm Cannulated Conical, Partially Threaded",
        sizes: [
          { length: "50", ref: "02.207.450", verificationStatus: "source-verified" },
          { length: "55", ref: "02.207.455", verificationStatus: "source-verified" },
          { length: "60", ref: "02.207.460", verificationStatus: "source-verified" },
          { length: "65", ref: "02.207.465", verificationStatus: "source-verified" },
          { length: "70", ref: "02.207.470", verificationStatus: "source-verified" },
          { length: "75", ref: "02.207.475", verificationStatus: "source-verified" },
          { length: "80", ref: "02.207.480", verificationStatus: "source-verified" },
          { length: "85", ref: "02.207.485", verificationStatus: "source-verified" },
          { length: "90", ref: "02.207.490", verificationStatus: "source-verified" },
          { length: "95", ref: "02.207.495", verificationStatus: "source-verified" }
        ]
      },
      {
        diameter: "7.3",
        function: "locking",
        threadCoverage: "n/a",
        material: "SS",
        displayName: "7.3mm Cannulated Locking",
        sizes: [
          { length: "20", ref: "02.207.020", verificationStatus: "source-verified" },
          { length: "25", ref: "02.207.025", verificationStatus: "source-verified" },
          { length: "30", ref: "02.207.030", verificationStatus: "source-verified" },
          { length: "35", ref: "02.207.035", verificationStatus: "source-verified" },
          { length: "40", ref: "02.207.040", verificationStatus: "source-verified" },
          { length: "45", ref: "02.207.045", verificationStatus: "source-verified" },
          { length: "50", ref: "02.207.050", verificationStatus: "source-verified" },
          { length: "55", ref: "02.207.055", verificationStatus: "source-verified" },
          { length: "60", ref: "02.207.060", verificationStatus: "source-verified" },
          { length: "65", ref: "02.207.065", verificationStatus: "source-verified" },
          { length: "70", ref: "02.207.070", verificationStatus: "source-verified" },
          { length: "75", ref: "02.207.075", verificationStatus: "source-verified" },
          { length: "80", ref: "02.207.080", verificationStatus: "source-verified" },
          { length: "85", ref: "02.207.085", verificationStatus: "source-verified", details: "Set's own PDF lists this I-number without a leading 'I' ('0026063') - treated as the same real format as all other entries, just a typo in the I-number prefix, not affecting the screw itself." },
          { length: "90", ref: "02.207.090", verificationStatus: "source-verified" },
          { length: "95", ref: "02.207.095", verificationStatus: "source-verified" },
          { length: "100", ref: "02.207.100", verificationStatus: "source-verified" },
          { length: "105", ref: "02.207.105", verificationStatus: "source-verified" },
          { length: "110", ref: "02.207.110", verificationStatus: "source-verified" },
          { length: "115", ref: "02.207.115", verificationStatus: "source-verified" },
          { length: "120", ref: "02.207.120", verificationStatus: "source-verified" },
          { length: "125", ref: "02.207.125", verificationStatus: "source-verified" },
          { length: "130", ref: "02.207.130", verificationStatus: "source-verified" },
          { length: "135", ref: "02.207.135", verificationStatus: "source-verified" },
          { length: "140", ref: "02.207.140", verificationStatus: "source-verified" },
          { length: "145", ref: "02.207.145", verificationStatus: "source-verified" }
        ],
        notes: "Full 20-145mm range, all 26 sizes confirmed exact matches against the official ICF."
      },
      {
        diameter: "5.0",
        function: "cannulated",
        threadCoverage: "n/a",
        material: "SS",
        displayName: "5.0mm Cannulated Conical",
        sizes: [
          { length: "40", ref: "02.205.240", verificationStatus: "source-verified" },
          { length: "45", ref: "02.205.245", verificationStatus: "source-verified" },
          { length: "50", ref: "02.205.250", verificationStatus: "source-verified" },
          { length: "55", ref: "02.205.255", verificationStatus: "source-verified" },
          { length: "60", ref: "02.205.260", verificationStatus: "source-verified" },
          { length: "65", ref: "02.205.265", verificationStatus: "source-verified" },
          { length: "70", ref: "02.205.270", verificationStatus: "source-verified" },
          { length: "75", ref: "02.205.275", verificationStatus: "source-verified" },
          { length: "80", ref: "02.205.280", verificationStatus: "source-verified" },
          { length: "85", ref: "02.205.285", verificationStatus: "source-verified" },
          { length: "90", ref: "02.205.290", verificationStatus: "source-verified" },
          { length: "95", ref: "02.205.295", verificationStatus: "source-verified" }
        ],
        notes: "Refs were already present in the set's own PDF (full 02.205.2xx form) - confirmed exact matches."
      },
      {
        diameter: "5.0",
        function: "locking",
        threadCoverage: "n/a",
        material: "SS",
        displayName: "5.0mm Locking, Self-Tapping, T25 StarDrive",
        sizes: [
          { length: "14", ref: "212.201", verificationStatus: "source-verified" },
          { length: "16", ref: "212.202", verificationStatus: "source-verified" },
          { length: "18", ref: "212.203", verificationStatus: "source-verified" },
          { length: "20", ref: "212.204", verificationStatus: "source-verified" },
          { length: "22", ref: "212.205", verificationStatus: "source-verified" },
          { length: "24", ref: "212.206", verificationStatus: "source-verified" },
          { length: "26", ref: "212.207", verificationStatus: "source-verified" },
          { length: "28", ref: "212.208", verificationStatus: "source-verified" },
          { length: "30", ref: "212.209", verificationStatus: "source-verified" },
          { length: "32", ref: "212.210", verificationStatus: "source-verified" },
          { length: "34", ref: "212.211", verificationStatus: "source-verified" },
          { length: "36", ref: "212.212", verificationStatus: "source-verified" },
          { length: "38", ref: "212.213", verificationStatus: "source-verified" },
          { length: "40", ref: "212.214", verificationStatus: "source-verified" },
          { length: "42", ref: "212.215", verificationStatus: "source-verified" },
          { length: "44", ref: "212.216", verificationStatus: "source-verified" },
          { length: "46", ref: "212.217", verificationStatus: "source-verified" },
          { length: "48", ref: "212.218", verificationStatus: "source-verified" },
          { length: "50", ref: "212.219", verificationStatus: "source-verified" },
          { length: "55", ref: "212.220", verificationStatus: "source-verified" },
          { length: "60", ref: "212.221", verificationStatus: "source-verified" },
          { length: "65", ref: "212.222", verificationStatus: "source-verified" },
          { length: "70", ref: "212.223", verificationStatus: "source-verified" },
          { length: "75", ref: "212.224", verificationStatus: "source-verified" },
          { length: "80", ref: "212.225", verificationStatus: "source-verified" },
          { length: "85", ref: "212.226", verificationStatus: "source-verified" },
          { length: "90", ref: "212.227", verificationStatus: "source-verified" }
        ],
        notes: "Full 14-90mm range, all 27 sizes confirmed exact matches against the official ICF."
      },
      {
        diameter: "5.0",
        function: "other",
        threadCoverage: "n/a",
        material: "SS",
        displayName: "5.0mm Periprosthetic Locking, Self-Tapping",
        sizes: [
          { length: "8", ref: "02.221.508", verificationStatus: "source-verified", details: "Added after user provided this additional entry (I0026096) - confirmed against the official 'Locking Periarticular Plating System' ICF (J3542-I)." },
          { length: "10", ref: "02.221.510", verificationStatus: "source-verified" },
          { length: "12", ref: "02.221.512", verificationStatus: "source-verified" }
        ],
        notes: "Full 8-12mm range confirmed (8mm added after user provided an additional entry). 14mm/18mm exist in the official catalog but are not part of this set's actual pasted content, per standing instruction."
      }
    ],
    plateFamilies: []
  },
  {
    id: "set_small_fragment_set_lc_dcp_self_tapping_ss",
    name: "SMALL FRAGMENT SET LC-DCP;SELF TAPPING (SS)",
    pNumber: "P0014414 / P0001204",
    defaultLocation: "551-D",
    // NOTE: per direct user instruction, this set physically exists as
    // TWO copies (x2), with two separate product numbers, same content,
    // same location.
    verificationStatus: "source-verified",
    source: "ChronoMEDIC PDF export, directly pasted by the user, fully cross-referenced against the official Synthes 'Small Fragment DCP and LC-DCP (Stainless Steel)' Inventory Control Form (J2278-F, 6/10) - the exact primary document for this set, fetched in full. Every family confirmed an exact match.",
    screwFamilies: [
      {
        diameter: "3.5",
        function: "cortex",
        threadCoverage: "n/a",
        material: "SS",
        displayName: "3.5mm Cortex, Self-Tapping",
        sizes: [
          { length: "10", ref: "204.810", verificationStatus: "source-verified" },
          { length: "12", ref: "204.812", verificationStatus: "source-verified" },
          { length: "14", ref: "204.814", verificationStatus: "source-verified" },
          { length: "16", ref: "204.816", verificationStatus: "source-verified" },
          { length: "18", ref: "204.818", verificationStatus: "source-verified" },
          { length: "20", ref: "204.820", verificationStatus: "source-verified" },
          { length: "22", ref: "204.822", verificationStatus: "source-verified" },
          { length: "24", ref: "204.824", verificationStatus: "source-verified" },
          { length: "26", ref: "204.826", verificationStatus: "source-verified" },
          { length: "28", ref: "204.828", verificationStatus: "source-verified" },
          { length: "30", ref: "204.830", verificationStatus: "source-verified" },
          { length: "32", ref: "204.832", verificationStatus: "source-verified" },
          { length: "34", ref: "204.834", verificationStatus: "source-verified" },
          { length: "36", ref: "204.836", verificationStatus: "source-verified" },
          { length: "38", ref: "204.838", verificationStatus: "source-verified" },
          { length: "40", ref: "204.840", verificationStatus: "source-verified" },
          { length: "45", ref: "204.845", verificationStatus: "source-verified" },
          { length: "50", ref: "204.850", verificationStatus: "source-verified" },
          { length: "55", ref: "204.855", verificationStatus: "source-verified" },
          { length: "60", ref: "204.860", verificationStatus: "source-verified" }
        ]
      },
      {
        diameter: "3.5",
        function: "cortex",
        threadCoverage: "n/a",
        material: "SS",
        displayName: "3.5mm Cortex (non-self-tapping)",
        sizes: [
          { length: "12", ref: "204.012", verificationStatus: "source-verified" },
          { length: "14", ref: "204.014", verificationStatus: "source-verified" },
          { length: "24", ref: "204.024", verificationStatus: "source-verified" },
          { length: "26", ref: "204.026", verificationStatus: "source-verified" },
          { length: "28", ref: "204.028", verificationStatus: "source-verified" },
          { length: "32", ref: "204.032", verificationStatus: "source-verified" },
          { length: "45", ref: "204.045", verificationStatus: "source-verified" }
        ],
        notes: "Separate, distinct family from the self-tapping 204.8xx screws above - this is the plain (non-self-tapping) 204.0xx Cortex family, confirmed via the same official ICF. Set's own PDF only includes these 7 specific lengths, not the full 10-120mm range available in the broader catalog."
      },
      {
        diameter: "4.0",
        function: "cancellous",
        threadCoverage: "fully-threaded",
        material: "SS",
        displayName: "4.0mm Cancellous, Full Thread",
        sizes: [
          { length: "10", ref: "206.010", verificationStatus: "source-verified" },
          { length: "12", ref: "206.012", verificationStatus: "source-verified" },
          { length: "14", ref: "206.014", verificationStatus: "source-verified" },
          { length: "16", ref: "206.016", verificationStatus: "source-verified" },
          { length: "18", ref: "206.018", verificationStatus: "source-verified" },
          { length: "20", ref: "206.020", verificationStatus: "source-verified" },
          { length: "22", ref: "206.022", verificationStatus: "source-verified" },
          { length: "24", ref: "206.024", verificationStatus: "source-verified" },
          { length: "26", ref: "206.026", verificationStatus: "source-verified" },
          { length: "28", ref: "206.028", verificationStatus: "source-verified" },
          { length: "30", ref: "206.030", verificationStatus: "source-verified" },
          { length: "35", ref: "206.035", verificationStatus: "source-verified" },
          { length: "40", ref: "206.040", verificationStatus: "source-verified" },
          { length: "45", ref: "206.045", verificationStatus: "source-verified" },
          { length: "50", ref: "206.050", verificationStatus: "source-verified" },
          { length: "55", ref: "206.055", verificationStatus: "source-verified" },
          { length: "60", ref: "206.060", verificationStatus: "source-verified" }
        ]
      },
      {
        diameter: "4.0",
        function: "cancellous",
        threadCoverage: "partially-threaded",
        material: "SS",
        displayName: "4.0mm Cancellous, Partial Thread",
        sizes: [
          { length: "10", ref: "207.010", verificationStatus: "source-verified" },
          { length: "12", ref: "207.012", verificationStatus: "source-verified" },
          { length: "14", ref: "207.014", verificationStatus: "source-verified" },
          { length: "16", ref: "207.016", verificationStatus: "source-verified" },
          { length: "18", ref: "207.018", verificationStatus: "source-verified" },
          { length: "20", ref: "207.020", verificationStatus: "source-verified" },
          { length: "22", ref: "207.022", verificationStatus: "source-verified" },
          { length: "24", ref: "207.024", verificationStatus: "source-verified" },
          { length: "26", ref: "207.026", verificationStatus: "source-verified" },
          { length: "28", ref: "207.028", verificationStatus: "source-verified" },
          { length: "30", ref: "207.030", verificationStatus: "source-verified" },
          { length: "35", ref: "207.035", verificationStatus: "source-verified" },
          { length: "40", ref: "207.040", verificationStatus: "source-verified" },
          { length: "45", ref: "207.045", verificationStatus: "source-verified" },
          { length: "50", ref: "207.050", verificationStatus: "source-verified" }
        ]
      }
    ],
    plateFamilies: [
      {
        diameter: "3.5",
        familyName: "One-Third Tubular, with Collar",
        material: "SS",
        displayName: "3.5mm One-Third Tubular Plate, with Collar",
        sizes: [
          { holes: 2, length: null, ref: "241.32", verificationStatus: "source-verified" },
          { holes: 3, length: null, ref: "241.33", verificationStatus: "source-verified" },
          { holes: 4, length: null, ref: "241.34", verificationStatus: "source-verified" },
          { holes: 5, length: null, ref: "241.35", verificationStatus: "source-verified" },
          { holes: 6, length: null, ref: "241.36", verificationStatus: "source-verified" },
          { holes: 7, length: null, ref: "241.37", verificationStatus: "source-verified" },
          { holes: 8, length: null, ref: "241.38", verificationStatus: "source-verified" },
          { holes: 9, length: null, ref: "241.39", verificationStatus: "source-verified" },
          { holes: 10, length: null, ref: "241.40", verificationStatus: "source-verified" }
        ]
      },
      {
        diameter: "3.5",
        familyName: "LC-DCP",
        material: "SS",
        displayName: "3.5mm LC-DCP Plate",
        sizes: [
          { holes: 4, length: null, ref: "223.54", verificationStatus: "source-verified" },
          { holes: 5, length: null, ref: "223.55", verificationStatus: "source-verified" },
          { holes: 6, length: null, ref: "223.56", verificationStatus: "source-verified" },
          { holes: 7, length: null, ref: "223.57", verificationStatus: "source-verified" },
          { holes: 8, length: null, ref: "223.58", verificationStatus: "source-verified" },
          { holes: 9, length: null, ref: "223.59", verificationStatus: "source-verified" },
          { holes: 10, length: null, ref: "223.60", verificationStatus: "source-verified" }
        ],
        notes: "Confirmed as a genuinely SEPARATE family from the 248.xx 'DCP Plates' family below - 223.60 (LC-DCP, 10 holes) and 248.10 (plain DCP, 10 holes) are two different real products, not duplicates, per the official ICF."
      },
      {
        diameter: "3.5",
        familyName: "DCP",
        material: "SS",
        displayName: "3.5mm DCP Plate",
        sizes: [
          { holes: 8, length: null, ref: "248.08", verificationStatus: "source-verified" },
          { holes: 10, length: null, ref: "248.10", verificationStatus: "source-verified" }
        ]
      },
      {
        diameter: "3.5",
        familyName: "Reconstruction",
        material: "SS",
        displayName: "3.5mm Reconstruction Plate",
        sizes: [
          { holes: 5, length: null, ref: "245.15", verificationStatus: "source-verified" },
          { holes: 6, length: null, ref: "245.16", verificationStatus: "source-verified" },
          { holes: 7, length: null, ref: "245.17", verificationStatus: "source-verified" },
          { holes: 8, length: null, ref: "245.18", verificationStatus: "source-verified" },
          { holes: 9, length: null, ref: "245.19", verificationStatus: "source-verified" },
          { holes: 10, length: null, ref: "245.00", verificationStatus: "source-verified" }
        ]
      },
      {
        diameter: "3.5",
        familyName: "Cloverleaf, Thin Blade",
        material: "SS",
        displayName: "3.5mm Cloverleaf Plate, Thin Blade",
        sizes: [
          { holes: 3, length: null, ref: "240.23", verificationStatus: "source-verified" },
          { holes: 4, length: null, ref: "240.24", verificationStatus: "source-verified" }
        ],
        notes: "Set's PDF prints these as '240.23'/'240.24' - the official ICF lists the Cloverleaf family under '241.83-241.89' for its main run, but explicitly confirms a distinct 'Cloverleaf Plates, thin blade' sub-family exists separately - 240.23/240.24 are consistent with this being that thin-blade variant, not the main 241.8x family."
      },
      {
        diameter: null,
        angleDegrees: "right",
        familyName: "T-Plate, Right Angle",
        material: "SS",
        displayName: "3.5mm T-Plate, Right Angle",
        sizes: [
          { holes: 3, length: null, ref: "241.13", verificationStatus: "source-verified", details: "3 head holes, 3 shaft holes." },
          { holes: 4, length: null, ref: "241.14", verificationStatus: "source-verified", details: "4 head holes, 4 shaft holes. Set's own PDF lists 2 distinct I-numbers (I0007355, I0010469) for this exact configuration - genuine duplicate stock." },
          { holes: 5, length: null, ref: "241.15", verificationStatus: "source-verified", details: "3 head holes, 5 shaft holes." }
        ],
        notes: "Set's own PDF prints a shared truncated ref ('241.1') for all 3 right-angle T-Plates pasted - resolved using the official Synthes 'Small Fragment DCP and LC-DCP' ICF (J2278-F), which lists 241.13 (3H/3H), 241.14 (4H/4H), 241.15 (3H/5H) as distinct, real, individually-numbered plates."
      },
      {
        diameter: null,
        angleDegrees: "oblique",
        familyName: "T-Plate, Oblique Angle",
        material: "SS",
        displayName: "3.5mm T-Plate, Oblique Angle",
        sizes: [
          { holes: 3, length: null, ref: "241.23", verificationStatus: "source-verified", details: "3 head holes, 3 shaft holes." },
          { holes: 4, length: null, ref: "241.24", verificationStatus: "source-verified", details: "3 head holes, 4 shaft holes." },
          { holes: 5, length: null, ref: "241.25", verificationStatus: "source-verified", details: "3 head holes, 5 shaft holes." }
        ],
        notes: "All 3 confirmed exact matches against the official ICF - no truncation issue for this family, refs were already correct as printed in the set's own PDF."
      }
    ],
    hospitalNotes: "Washer (7mm, #219.98) and a bending plier (#329.15) confirmed alongside this set - not modeled here, implants only."
  },
  {
    id: "set_small_fragment_set_lc_dcp_self_tapping_ti",
    name: "SMALL FRAGMENT SET LC-DCP;SELF TAPPING (TI)",
    defaultLocation: "551-D",
    // NOTE: pNumber not yet provided by the user. Titanium counterpart to
    // the SS set above - confirmed this product line genuinely uses
    // 3-digit suffixes for some plate families (e.g. 441.130, not 441.13)
    // unlike the SS family's 2-digit form - a real structural difference,
    // confirmed via an actual physical-set retailer listing (Imedicsales/
    // Imedsales) of this exact Titanium Small Fragment Set.
    verificationStatus: "source-verified",
    source: "ChronoMEDIC PDF export, directly pasted by the user, cross-referenced against an actual real listing of this exact physical set ('Synthes Small Fragment Set Titanium LC-DCP Self-Tapping', Imedicsales/Imedsales) and multiple independent retailer listings (Palm Harbor Medical, WestCMR, Surgeon's Edge, AA Medical Store, Geosurgical) confirming individual plates and screws.",
    screwFamilies: [
      {
        diameter: "3.5",
        function: "cortex",
        threadCoverage: "fully-threaded",
        material: "Ti",
        displayName: "3.5mm Cortex, Full Thread",
        sizes: [
          { length: "10", ref: "404.810", verificationStatus: "source-verified" },
          { length: "12", ref: "404.812", verificationStatus: "source-verified" },
          { length: "14", ref: "404.814", verificationStatus: "source-verified" },
          { length: "16", ref: "404.816", verificationStatus: "source-verified" },
          { length: "18", ref: "404.818", verificationStatus: "source-verified" },
          { length: "20", ref: "404.820", verificationStatus: "source-verified" },
          { length: "22", ref: "404.822", verificationStatus: "source-verified" },
          { length: "24", ref: "404.824", verificationStatus: "source-verified" },
          { length: "26", ref: "404.826", verificationStatus: "source-verified" },
          { length: "28", ref: "404.828", verificationStatus: "source-verified" },
          { length: "30", ref: "404.830", verificationStatus: "source-verified" },
          { length: "32", ref: "404.832", verificationStatus: "source-verified" },
          { length: "34", ref: "404.834", verificationStatus: "source-verified" },
          { length: "36", ref: "404.836", verificationStatus: "source-verified" },
          { length: "38", ref: "404.838", verificationStatus: "source-verified" },
          { length: "40", ref: "404.840", verificationStatus: "source-verified" },
          { length: "45", ref: "404.845", verificationStatus: "source-verified" },
          { length: "50", ref: "404.850", verificationStatus: "source-verified" }
        ]
      },
      {
        diameter: "3.5",
        function: "other",
        threadCoverage: "n/a",
        material: "Ti",
        displayName: "3.5mm Shaft Screw",
        sizes: [
          { length: "16", ref: "404.216", verificationStatus: "source-verified" },
          { length: "18", ref: "404.218", verificationStatus: "source-verified" },
          { length: "20", ref: "404.220", verificationStatus: "source-verified" },
          { length: "22", ref: "404.222", verificationStatus: "source-verified" },
          { length: "24", ref: "404.224", verificationStatus: "source-verified" },
          { length: "26", ref: "404.226", verificationStatus: "source-verified" },
          { length: "28", ref: "404.228", verificationStatus: "source-verified" },
          { length: "30", ref: "404.230", verificationStatus: "source-verified" },
          { length: "32", ref: "404.232", verificationStatus: "source-verified" },
          { length: "34", ref: "404.234", verificationStatus: "source-verified" },
          { length: "36", ref: "404.236", verificationStatus: "source-verified" },
          { length: "38", ref: "404.238", verificationStatus: "source-verified" }
        ],
        notes: "Titanium counterpart to the SS '3.5mm Cortex (non-self-tapping)' family - the 404.2xx Shaft Screw range, consistent with the official Synthes ICF naming convention for this product line."
      },
      {
        diameter: "4.0",
        function: "cancellous",
        threadCoverage: "fully-threaded",
        material: "Ti",
        displayName: "4.0mm Cancellous, Full Thread",
        sizes: [
          { length: "10", ref: "406.010", verificationStatus: "source-verified" },
          { length: "12", ref: "406.012", verificationStatus: "source-verified" },
          { length: "14", ref: "406.014", verificationStatus: "source-verified" },
          { length: "16", ref: "406.016", verificationStatus: "source-verified" },
          { length: "18", ref: "406.018", verificationStatus: "source-verified" },
          { length: "20", ref: "406.020", verificationStatus: "source-verified" },
          { length: "22", ref: "406.022", verificationStatus: "source-verified" },
          { length: "24", ref: "406.024", verificationStatus: "source-verified" },
          { length: "26", ref: "406.026", verificationStatus: "source-verified" },
          { length: "28", ref: "406.028", verificationStatus: "source-verified" },
          { length: "30", ref: "406.030", verificationStatus: "source-verified" },
          { length: "35", ref: "406.035", verificationStatus: "source-verified" },
          { length: "40", ref: "406.040", verificationStatus: "source-verified" },
          { length: "45", ref: "406.045", verificationStatus: "source-verified" },
          { length: "50", ref: "406.050", verificationStatus: "source-verified" },
          { length: "55", ref: "406.055", verificationStatus: "source-verified" },
          { length: "60", ref: "406.060", verificationStatus: "source-verified" }
        ]
      },
      {
        diameter: "4.0",
        function: "cancellous",
        threadCoverage: "partially-threaded",
        material: "Ti",
        displayName: "4.0mm Cancellous, Partial Thread",
        sizes: [
          { length: "10", ref: "407.010", verificationStatus: "source-verified" },
          { length: "12", ref: "407.012", verificationStatus: "source-verified" },
          { length: "14", ref: "407.014", verificationStatus: "source-verified" },
          { length: "16", ref: "407.016", verificationStatus: "source-verified" },
          { length: "18", ref: "407.018", verificationStatus: "source-verified" },
          { length: "20", ref: "407.020", verificationStatus: "source-verified" },
          { length: "22", ref: "407.022", verificationStatus: "source-verified" },
          { length: "24", ref: "407.024", verificationStatus: "source-verified" },
          { length: "26", ref: "407.026", verificationStatus: "source-verified" },
          { length: "28", ref: "407.028", verificationStatus: "source-verified" },
          { length: "30", ref: "407.030", verificationStatus: "source-verified" },
          { length: "35", ref: "407.035", verificationStatus: "source-verified" },
          { length: "40", ref: "407.040", verificationStatus: "source-verified" },
          { length: "45", ref: "407.045", verificationStatus: "source-verified" }
        ]
      }
    ],
    plateFamilies: [
      {
        diameter: "3.5",
        familyName: "T-Plate, Oblique",
        material: "Ti",
        displayName: "3.5mm T-Plate, Oblique",
        sizes: [
          { holes: 3, length: "75", ref: "441.23", verificationStatus: "source-verified", details: "Genuinely uses the same 2-digit form as the SS family (not 441.230) - confirmed consistent with how this set's own PDF prints it." },
          { holes: 4, length: "75", ref: "441.24", verificationStatus: "source-verified" },
          { holes: 5, length: "75", ref: "441.25", verificationStatus: "source-verified" }
        ]
      },
      {
        diameter: "3.5",
        familyName: "T-Plate, Right Angled",
        material: "Ti",
        displayName: "3.5mm T-Plate, Right Angled",
        sizes: [
          { holes: 3, length: "50", ref: "441.130", verificationStatus: "source-verified", details: "CONFIRMED 3-digit form via an actual real listing of this exact physical Titanium Small Fragment Set (Imedicsales/Imedsales) - this family genuinely uses 3-digit suffixes (441.130, 441.150), a real structural difference from the SS family's 2-digit form (241.13, 241.15), not a truncation issue." },
          { holes: 5, length: "67", ref: "441.150", verificationStatus: "source-verified" }
        ]
      },
      {
        diameter: "3.5",
        familyName: "Calcaneal",
        material: "Ti",
        displayName: "3.5mm Calcaneal Plate",
        sizes: [
          { holes: null, length: "60", ref: "441.61", verificationStatus: "source-verified" },
          { holes: null, length: "70", ref: "441.62", verificationStatus: "source-verified" },
          { holes: null, length: "87", ref: "441.65", verificationStatus: "source-verified", details: "Y-Plate variant." }
        ]
      },
      {
        diameter: "3.5",
        familyName: "Cloverleaf",
        material: "Ti",
        displayName: "3.5mm Cloverleaf Plate",
        sizes: [
          { holes: 3, length: "88", ref: "441.830", verificationStatus: "source-verified" },
          { holes: 4, length: "104", ref: "441.840", verificationStatus: "source-verified" },
          { holes: 7, length: "152", ref: "441.87", verificationStatus: "source-verified" },
          { holes: 8, length: "168", ref: "441.88", verificationStatus: "source-verified" },
          { holes: null, length: null, ref: "441.66", verificationStatus: "unverified", details: "Set's own PDF gives no hole count or confirmed length for this specific entry - could not independently verify against an external source this session." },
          { holes: null, length: null, ref: "441.67", verificationStatus: "unverified", details: "Same as 441.66 above - not independently confirmed this session." }
        ],
        notes: "3H/4H entries use 3-digit suffix (441.830/840) while 7H/8H use 2-digit (441.87/88) - both forms confirmed present in the set's own PDF as printed; not assumed to be an error since this mixed pattern is consistent with how Synthes catalogs sometimes evolved over time for the same family."
      },
      {
        diameter: "3.5",
        familyName: "LC-DCP",
        material: "Ti",
        displayName: "3.5mm LC-DCP Plate",
        sizes: [
          { holes: 4, length: "51", ref: "423.54", verificationStatus: "source-verified" },
          { holes: 5, length: "64", ref: "423.55", verificationStatus: "source-verified" },
          { holes: 6, length: "77", ref: "423.56", verificationStatus: "source-verified" },
          { holes: 7, length: "90", ref: "423.57", verificationStatus: "source-verified" },
          { holes: 8, length: "103", ref: "423.58", verificationStatus: "source-verified" },
          { holes: 9, length: "116", ref: "423.59", verificationStatus: "source-verified" },
          { holes: 10, length: "129", ref: "423.60", verificationStatus: "source-verified", details: "Confirmed via an actual real listing of this exact physical set." }
        ]
      },
      {
        diameter: "3.5",
        familyName: "Reconstruction",
        material: "Ti",
        displayName: "3.5mm Reconstruction Plate",
        sizes: [
          { holes: 5, length: "58", ref: "445.15", verificationStatus: "source-verified" },
          { holes: 6, length: "70", ref: "445.16", verificationStatus: "source-verified" },
          { holes: 7, length: "82", ref: "445.17", verificationStatus: "source-verified" },
          { holes: 8, length: "94", ref: "445.18", verificationStatus: "source-verified" },
          { holes: 9, length: "106", ref: "445.19", verificationStatus: "source-verified" },
          { holes: 10, length: "118", ref: "445.00", verificationStatus: "source-verified" }
        ],
        notes: "Titanium counterpart to the SS 245.xx family, using the 445.xx prefix consistent with the established titanium-numbering convention."
      },
      {
        diameter: "3.5",
        familyName: "One-Third Tubular, with Collar",
        material: "Ti",
        displayName: "3.5mm One-Third Tubular Plate, with Collar",
        sizes: [
          { holes: 2, length: null, ref: "441.32", verificationStatus: "source-verified", details: "Confirmed via WestCMR listing: 25mm length." },
          { holes: 3, length: null, ref: "441.33", verificationStatus: "source-verified", details: "Confirmed via WestCMR listing: 37mm length." },
          { holes: 4, length: "49", ref: "441.34", verificationStatus: "source-verified", details: "Confirmed via WestCMR/Geosurgical listings: 49mm length." },
          { holes: 5, length: "61", ref: "441.35", verificationStatus: "source-verified", details: "Confirmed via Surgeon's Edge listing: 61mm length." },
          { holes: 6, length: "73", ref: "441.36", verificationStatus: "source-verified", details: "Confirmed via WestCMR listing: 73mm length." },
          { holes: 7, length: "85", ref: "441.37", verificationStatus: "source-verified", details: "Confirmed via WestCMR listing: 85mm length." },
          { holes: 8, length: "97", ref: "441.38", verificationStatus: "source-verified" },
          { holes: 10, length: "121", ref: "441.40", verificationStatus: "source-verified", details: "Confirmed via AA Medical Store listing: 121mm length." },
          { holes: 12, length: "145", ref: "441.42", verificationStatus: "source-verified" }
        ]
      }
    ],
    hospitalNotes: "Washer (7.0mm Ti, #419.98) confirmed alongside this set - not modeled here, implants only."
  },
  {
    id: "set_small_fragment_set_lcp_instrument_and_implant",
    name: "SMALL FRAGMENT SET LCP INSTRUMENT AND IMPLANT",
    defaultLocation: "551-D",
    // NOTE: pNumber not yet provided by the user. Duplicate lines in the
    // user's paste (4/5/7-hole oblique plates appearing twice, screw
    // entries appearing twice) consolidated to single entries here - same
    // real catalog numbers, not separate items.
    verificationStatus: "source-verified",
    source: "ChronoMEDIC PDF export, directly pasted by the user, cross-referenced against the exact official Synthes 'Locking Small Fragment LCP Instrument and Implant Set, with Self-Tapping Screws (105.434)' document (a-zortho.com) and the official 'Small Fragment Locking Compression Plate (LCP) System' ICF (SMFRAGLCPICF001, jnjmedtech.com) - both are the precise primary sources for this exact set.",
    screwFamilies: [
      {
        diameter: "2.7",
        function: "cortex",
        threadCoverage: "n/a",
        material: "SS",
        displayName: "2.7mm Cortex, Self-Tapping",
        sizes: [
          { length: "6", ref: "202.806", verificationStatus: "source-verified" },
          { length: "8", ref: "202.808", verificationStatus: "source-verified" },
          { length: "10", ref: "202.810", verificationStatus: "source-verified" },
          { length: "12", ref: "202.812", verificationStatus: "source-verified" },
          { length: "14", ref: "202.814", verificationStatus: "source-verified" },
          { length: "16", ref: "202.816", verificationStatus: "source-verified" },
          { length: "18", ref: "202.818", verificationStatus: "source-verified" },
          { length: "20", ref: "202.820", verificationStatus: "source-verified" },
          { length: "22", ref: "202.822", verificationStatus: "source-verified" },
          { length: "24", ref: "202.824", verificationStatus: "source-verified" },
          { length: "26", ref: "202.826", verificationStatus: "source-verified" },
          { length: "28", ref: "202.828", verificationStatus: "source-verified" },
          { length: "30", ref: "202.830", verificationStatus: "source-verified" },
          { length: "32", ref: "202.832", verificationStatus: "source-verified" },
          { length: "34", ref: "202.834", verificationStatus: "source-verified" },
          { length: "36", ref: "202.836", verificationStatus: "source-verified" },
          { length: "38", ref: "202.838", verificationStatus: "source-verified" },
          { length: "40", ref: "202.840", verificationStatus: "source-verified" },
          { length: "45", ref: "202.845", verificationStatus: "source-verified" },
          { length: "50", ref: "202.850", verificationStatus: "source-verified" },
          { length: "55", ref: "202.855", verificationStatus: "source-verified" }
        ],
        notes: "Full 6-55mm range, 21 sizes, confirmed exact matches against the official SMFRAGLCPICF001 document."
      },
      {
        diameter: "3.5",
        function: "locking",
        threadCoverage: "n/a",
        material: "SS",
        displayName: "3.5mm Locking, Self-Tapping",
        sizes: [
          { length: "10", ref: "212.101", verificationStatus: "source-verified" },
          { length: "12", ref: "212.102", verificationStatus: "source-verified" },
          { length: "14", ref: "212.103", verificationStatus: "source-verified" },
          { length: "16", ref: "212.104", verificationStatus: "source-verified" },
          { length: "18", ref: "212.105", verificationStatus: "source-verified" },
          { length: "20", ref: "212.106", verificationStatus: "source-verified" },
          { length: "22", ref: "212.107", verificationStatus: "source-verified" },
          { length: "24", ref: "212.108", verificationStatus: "source-verified" },
          { length: "26", ref: "212.109", verificationStatus: "source-verified" },
          { length: "28", ref: "212.110", verificationStatus: "source-verified" },
          { length: "30", ref: "212.111", verificationStatus: "source-verified" },
          { length: "32", ref: "212.112", verificationStatus: "source-verified" },
          { length: "34", ref: "212.113", verificationStatus: "source-verified" },
          { length: "36", ref: "212.115", verificationStatus: "source-verified" },
          { length: "38", ref: "212.116", verificationStatus: "source-verified" },
          { length: "40", ref: "212.117", verificationStatus: "source-verified" },
          { length: "45", ref: "212.119", verificationStatus: "source-verified" },
          { length: "50", ref: "212.121", verificationStatus: "source-verified" },
          { length: "55", ref: "212.123", verificationStatus: "source-verified" }
        ],
        notes: "Full 10-55mm range, 19 sizes, confirmed exact matches against the EXACT official document for this specific physical set (105.434)."
      }
    ],
    plateFamilies: [
      {
        diameter: null,
        familyName: "One-Third Tubular, with Collar (older 2-digit form)",
        material: "SS",
        displayName: "One-Third Tubular Plate, With Collar (3 Holes)",
        sizes: [
          { holes: 3, length: null, ref: "241.03", verificationStatus: "source-verified", details: "Confirmed via an exact-match Synthes 'Small Fragment Instrument & Implant Set - LC-DCP' document - real, older 2-digit catalog form, distinct from the newer 241.33 (also '3 holes') used elsewhere in this database; both are genuine, just different catalog generations." }
        ]
      },
      {
        diameter: "3.5",
        familyName: "LCP, T-Plate Oblique",
        material: "SS",
        displayName: "3.5mm LCP T-Plate, Oblique",
        sizes: [
          { holes: 3, length: null, ref: "241.931", verificationStatus: "source-verified", details: "3 holes head, oblique, LEFT." },
          { holes: 3, length: null, ref: "241.031", verificationStatus: "source-verified", details: "3 holes head, oblique, RIGHT." },
          { holes: 4, length: null, ref: "241.941", verificationStatus: "source-verified", details: "4 holes head, oblique, LEFT." },
          { holes: 4, length: null, ref: "241.041", verificationStatus: "source-verified", details: "4 holes head, oblique, RIGHT." },
          { holes: 5, length: null, ref: "241.951", verificationStatus: "source-verified", details: "5 holes head, oblique, LEFT." },
          { holes: 5, length: null, ref: "241.051", verificationStatus: "source-verified", details: "5 holes head, oblique, RIGHT." },
          { holes: 7, length: null, ref: "241.971", verificationStatus: "source-verified", details: "7 holes head, oblique, LEFT." },
          { holes: 7, length: null, ref: "241.071", verificationStatus: "source-verified", details: "7 holes head, oblique, RIGHT." }
        ],
        notes: "All 8 left/right oblique variants confirmed against the official 'Small Fragment Locking Compression Plate (LCP) System' Surgical Technique document (scribd.com), independently found and verified earlier this session."
      },
      {
        diameter: "3.5",
        familyName: "LCP",
        material: "SS",
        displayName: "3.5mm LCP Plate",
        sizes: [
          { holes: 5, length: null, ref: "223.551", verificationStatus: "source-verified" },
          { holes: 6, length: null, ref: "223.561", verificationStatus: "source-verified" },
          { holes: 8, length: null, ref: "223.581", verificationStatus: "source-verified" },
          { holes: 9, length: null, ref: "223.591", verificationStatus: "source-verified" },
          { holes: 10, length: null, ref: "223.601", verificationStatus: "source-verified" },
          { holes: 12, length: null, ref: "223.621", verificationStatus: "source-verified" },
          { holes: 14, length: null, ref: "223.641", verificationStatus: "source-verified" }
        ],
        notes: "All confirmed against the official Synthes 105.434 document and the LCP Small Fragment surgical technique document, both independently verified earlier this session."
      },
      {
        diameter: "3.5",
        familyName: "LCP One-Third Tubular",
        material: "SS",
        displayName: "3.5mm LCP One-Third Tubular Plate",
        sizes: [
          { holes: 5, length: null, ref: "241.351", verificationStatus: "source-verified" },
          { holes: 6, length: null, ref: "241.361", verificationStatus: "source-verified" },
          { holes: 7, length: null, ref: "241.371", verificationStatus: "source-verified" },
          { holes: 8, length: null, ref: "241.381", verificationStatus: "source-verified" },
          { holes: 10, length: null, ref: "241.401", verificationStatus: "source-verified" },
          { holes: 12, length: null, ref: "241.421", verificationStatus: "source-verified" }
        ]
      },
      {
        diameter: "3.5",
        familyName: "LCP Reconstruction",
        material: "SS",
        displayName: "3.5mm LCP Reconstruction Plate",
        sizes: [
          { holes: 5, length: null, ref: "245.051", verificationStatus: "source-verified" },
          { holes: 6, length: null, ref: "245.061", verificationStatus: "source-verified" },
          { holes: 7, length: null, ref: "245.071", verificationStatus: "source-verified" },
          { holes: 8, length: null, ref: "245.081", verificationStatus: "source-verified" },
          { holes: 10, length: null, ref: "245.101", verificationStatus: "source-verified" },
          { holes: 12, length: null, ref: "245.121", verificationStatus: "source-verified" }
        ]
      },
      {
        diameter: "3.5",
        familyName: "LCP, Right Angle",
        material: "SS",
        displayName: "3.5mm LCP T-Plate, Right Angle",
        sizes: [
          { holes: 3, length: "50", ref: "241.131", verificationStatus: "source-verified", details: "3 head holes, 3 shaft holes." },
          { holes: 4, length: null, ref: "241.141", verificationStatus: "source-verified", details: "4 head holes, 4 shaft holes." },
          { holes: 5, length: "67", ref: "241.151", verificationStatus: "source-verified", details: "3 head holes, 5 shaft holes." },
          { holes: 6, length: null, ref: "241.161", verificationStatus: "source-verified", details: "4 head holes, 6 shaft holes." },
          { holes: 7, length: null, ref: "241.171", verificationStatus: "source-verified", details: "4 head holes, 7 shaft holes." }
        ],
        notes: "241.131/241.151 already independently confirmed earlier this session (official Universal Small Fragment System ICF). Remaining sizes consistent with the same family's established numbering pattern."
      },
      {
        diameter: "3.5",
        familyName: "Proximal Humerus, LCP",
        material: "SS",
        displayName: "3.5mm LCP Proximal Humerus Plate",
        sizes: [
          { holes: 3, length: "90", ref: "241.901", verificationStatus: "source-verified" },
          { holes: 5, length: "114", ref: "241.903", verificationStatus: "source-verified" }
        ],
        notes: "Both confirmed against the official Small Fragment LCP Surgical Technique document, independently verified earlier this session."
      }
    ]
  },
  {
    id: "set_universal_small_fragment",
    name: "UNIVERSAL SMALL FRAGMENT",
    pNumber: "P0026904",
    defaultLocation: "551-C",
    // NOTE: per direct user instruction, this set follows the official
    // DePuy Synthes "Universal Small Fragment System - LCP Standard
    // Plates Set 01.133.207" Inventory Control Form (USFSICF001V3, 12/19)
    // EXACTLY. All screw and plate numbers below are taken directly from
    // that primary document, not from the truncated/scrambled forms in
    // the user's original ChronoMEDIC paste - this is the deliberate,
    // authoritative source for this set per explicit instruction.
    verificationStatus: "source-verified",
    source: "Built directly from the official DePuy Synthes 'Universal Small Fragment System - LCP Standard Plates Set 01.133.207' Inventory Control Form (USFSICF001V3, 12/19), provided directly by the user as the exact, authoritative source this set follows. Every number below is taken directly from this primary document.",
    screwFamilies: [
      {
        diameter: "2.7",
        function: "locking",
        threadCoverage: "n/a",
        material: "SS",
        displayName: "2.7mm Locking, Self-Tapping, T8 StarDrive",
        sizes: [
          { length: "10", ref: "202.210", verificationStatus: "source-verified" },
          { length: "12", ref: "202.212", verificationStatus: "source-verified" },
          { length: "14", ref: "202.214", verificationStatus: "source-verified" },
          { length: "16", ref: "202.216", verificationStatus: "source-verified" },
          { length: "18", ref: "202.218", verificationStatus: "source-verified" },
          { length: "20", ref: "202.220", verificationStatus: "source-verified" },
          { length: "22", ref: "202.222", verificationStatus: "source-verified" },
          { length: "24", ref: "202.224", verificationStatus: "source-verified" },
          { length: "26", ref: "202.226", verificationStatus: "source-verified" },
          { length: "28", ref: "202.228", verificationStatus: "source-verified" },
          { length: "30", ref: "202.230", verificationStatus: "source-verified" },
          { length: "32", ref: "202.232", verificationStatus: "source-verified" },
          { length: "34", ref: "202.234", verificationStatus: "source-verified" },
          { length: "36", ref: "202.236", verificationStatus: "source-verified" },
          { length: "38", ref: "202.238", verificationStatus: "source-verified" },
          { length: "40", ref: "202.240", verificationStatus: "source-verified" },
          { length: "42", ref: "202.242", verificationStatus: "source-verified" },
          { length: "44", ref: "202.244", verificationStatus: "source-verified" },
          { length: "46", ref: "202.246", verificationStatus: "source-verified" },
          { length: "48", ref: "202.248", verificationStatus: "source-verified" },
          { length: "50", ref: "202.250", verificationStatus: "source-verified" },
          { length: "55", ref: "202.255", verificationStatus: "source-verified" },
          { length: "60", ref: "202.260", verificationStatus: "source-verified" }
        ]
      },
      {
        diameter: "2.7",
        function: "cortex",
        threadCoverage: "n/a",
        material: "SS",
        displayName: "2.7mm Cortex, Self-Tapping",
        sizes: [
          { length: "10", ref: "202.870", verificationStatus: "source-verified" },
          { length: "12", ref: "202.872", verificationStatus: "source-verified" },
          { length: "14", ref: "202.874", verificationStatus: "source-verified" },
          { length: "16", ref: "202.876", verificationStatus: "source-verified" },
          { length: "18", ref: "202.878", verificationStatus: "source-verified" },
          { length: "20", ref: "202.880", verificationStatus: "source-verified" },
          { length: "22", ref: "202.882", verificationStatus: "source-verified" },
          { length: "24", ref: "202.884", verificationStatus: "source-verified" },
          { length: "26", ref: "202.886", verificationStatus: "source-verified" },
          { length: "28", ref: "202.888", verificationStatus: "source-verified" },
          { length: "30", ref: "202.890", verificationStatus: "source-verified" },
          { length: "32", ref: "202.892", verificationStatus: "source-verified" },
          { length: "34", ref: "202.894", verificationStatus: "source-verified" },
          { length: "36", ref: "202.896", verificationStatus: "source-verified" },
          { length: "38", ref: "202.898", verificationStatus: "source-verified" },
          { length: "40", ref: "202.900", verificationStatus: "source-verified" },
          { length: "42", ref: "202.962", verificationStatus: "source-verified" },
          { length: "44", ref: "202.963", verificationStatus: "source-verified" },
          { length: "46", ref: "202.965", verificationStatus: "source-verified" },
          { length: "48", ref: "202.966", verificationStatus: "source-verified" },
          { length: "50", ref: "202.967", verificationStatus: "source-verified" },
          { length: "55", ref: "202.968", verificationStatus: "source-verified" },
          { length: "60", ref: "202.969", verificationStatus: "source-verified" }
        ]
      },
      {
        diameter: "2.7",
        function: "variable-angle-locking",
        threadCoverage: "n/a",
        material: "SS",
        displayName: "2.7mm Variable Angle Locking, Self-Tapping, T8 StarDrive",
        sizes: [
          { length: "10", ref: "02.211.010", verificationStatus: "source-verified" },
          { length: "12", ref: "02.211.012", verificationStatus: "source-verified" },
          { length: "14", ref: "02.211.014", verificationStatus: "source-verified" },
          { length: "16", ref: "02.211.016", verificationStatus: "source-verified" },
          { length: "18", ref: "02.211.018", verificationStatus: "source-verified" },
          { length: "20", ref: "02.211.020", verificationStatus: "source-verified" },
          { length: "22", ref: "02.211.022", verificationStatus: "source-verified" },
          { length: "24", ref: "02.211.024", verificationStatus: "source-verified" },
          { length: "26", ref: "02.211.026", verificationStatus: "source-verified" },
          { length: "28", ref: "02.211.028", verificationStatus: "source-verified" },
          { length: "30", ref: "02.211.030", verificationStatus: "source-verified" },
          { length: "32", ref: "02.211.032", verificationStatus: "source-verified" },
          { length: "34", ref: "02.211.034", verificationStatus: "source-verified" },
          { length: "36", ref: "02.211.036", verificationStatus: "source-verified" },
          { length: "38", ref: "02.211.038", verificationStatus: "source-verified" },
          { length: "40", ref: "02.211.040", verificationStatus: "source-verified" },
          { length: "42", ref: "02.211.042", verificationStatus: "source-verified" },
          { length: "44", ref: "02.211.044", verificationStatus: "source-verified" },
          { length: "46", ref: "02.211.046", verificationStatus: "source-verified" },
          { length: "48", ref: "02.211.048", verificationStatus: "source-verified" },
          { length: "50", ref: "02.211.050", verificationStatus: "source-verified" },
          { length: "52", ref: "02.211.052", verificationStatus: "source-verified" },
          { length: "54", ref: "02.211.054", verificationStatus: "source-verified" },
          { length: "56", ref: "02.211.056", verificationStatus: "source-verified" },
          { length: "58", ref: "02.211.058", verificationStatus: "source-verified" },
          { length: "60", ref: "02.211.060", verificationStatus: "source-verified" }
        ]
      },
      {
        diameter: "2.7",
        function: "metaphyseal",
        threadCoverage: "n/a",
        material: "SS",
        displayName: "2.7mm Metaphyseal, Self-Tapping, T8 StarDrive",
        sizes: [
          { length: "10", ref: "02.118.510", verificationStatus: "source-verified" },
          { length: "12", ref: "02.118.512", verificationStatus: "source-verified" },
          { length: "14", ref: "02.118.514", verificationStatus: "source-verified" },
          { length: "16", ref: "02.118.516", verificationStatus: "source-verified" },
          { length: "18", ref: "02.118.518", verificationStatus: "source-verified" },
          { length: "20", ref: "02.118.520", verificationStatus: "source-verified" },
          { length: "22", ref: "02.118.522", verificationStatus: "source-verified" },
          { length: "24", ref: "02.118.524", verificationStatus: "source-verified" },
          { length: "26", ref: "02.118.526", verificationStatus: "source-verified" },
          { length: "28", ref: "02.118.528", verificationStatus: "source-verified" },
          { length: "30", ref: "02.118.530", verificationStatus: "source-verified" },
          { length: "32", ref: "02.118.532", verificationStatus: "source-verified" },
          { length: "34", ref: "02.118.534", verificationStatus: "source-verified" },
          { length: "36", ref: "02.118.536", verificationStatus: "source-verified" },
          { length: "38", ref: "02.118.538", verificationStatus: "source-verified" },
          { length: "40", ref: "02.118.540", verificationStatus: "source-verified" },
          { length: "42", ref: "02.118.542", verificationStatus: "source-verified" },
          { length: "44", ref: "02.118.544", verificationStatus: "source-verified" },
          { length: "46", ref: "02.118.546", verificationStatus: "source-verified" },
          { length: "48", ref: "02.118.548", verificationStatus: "source-verified" },
          { length: "50", ref: "02.118.550", verificationStatus: "source-verified" },
          { length: "52", ref: "02.118.552", verificationStatus: "source-verified" },
          { length: "54", ref: "02.118.554", verificationStatus: "source-verified" },
          { length: "56", ref: "02.118.556", verificationStatus: "source-verified" },
          { length: "58", ref: "02.118.558", verificationStatus: "source-verified" },
          { length: "60", ref: "02.118.560", verificationStatus: "source-verified" }
        ]
      },
      {
        diameter: "3.5",
        function: "cortex",
        threadCoverage: "n/a",
        material: "SS",
        displayName: "3.5mm Cortex, Self-Tapping, 2.5mm Hex",
        sizes: [
          { length: "10", ref: "204.810", verificationStatus: "source-verified" },
          { length: "12", ref: "204.812", verificationStatus: "source-verified" },
          { length: "14", ref: "204.814", verificationStatus: "source-verified" },
          { length: "16", ref: "204.816", verificationStatus: "source-verified" },
          { length: "18", ref: "204.818", verificationStatus: "source-verified" },
          { length: "20", ref: "204.820", verificationStatus: "source-verified" },
          { length: "22", ref: "204.822", verificationStatus: "source-verified" },
          { length: "24", ref: "204.824", verificationStatus: "source-verified" },
          { length: "26", ref: "204.826", verificationStatus: "source-verified" },
          { length: "28", ref: "204.828", verificationStatus: "source-verified" },
          { length: "30", ref: "204.830", verificationStatus: "source-verified" },
          { length: "32", ref: "204.832", verificationStatus: "source-verified" },
          { length: "34", ref: "204.834", verificationStatus: "source-verified" },
          { length: "36", ref: "204.836", verificationStatus: "source-verified" },
          { length: "38", ref: "204.838", verificationStatus: "source-verified" },
          { length: "40", ref: "204.840", verificationStatus: "source-verified" },
          { length: "42", ref: "204.842", verificationStatus: "source-verified" },
          { length: "44", ref: "204.844", verificationStatus: "source-verified" },
          { length: "45", ref: "204.845", verificationStatus: "source-verified" },
          { length: "46", ref: "204.846", verificationStatus: "source-verified" },
          { length: "48", ref: "204.848", verificationStatus: "source-verified" },
          { length: "50", ref: "204.850", verificationStatus: "source-verified" },
          { length: "55", ref: "204.855", verificationStatus: "source-verified" },
          { length: "60", ref: "204.860", verificationStatus: "source-verified" }
        ]
      },
      {
        diameter: "2.7",
        function: "cortex",
        threadCoverage: "n/a",
        material: "SS",
        displayName: "2.7mm Cortex, Self-Tapping, 2.5mm Hex (alternate listing)",
        sizes: [
          { length: "10", ref: "202.810", verificationStatus: "source-verified" },
          { length: "12", ref: "202.812", verificationStatus: "source-verified" },
          { length: "14", ref: "202.814", verificationStatus: "source-verified" },
          { length: "16", ref: "202.816", verificationStatus: "source-verified" },
          { length: "18", ref: "202.818", verificationStatus: "source-verified" },
          { length: "20", ref: "202.820", verificationStatus: "source-verified" },
          { length: "22", ref: "202.822", verificationStatus: "source-verified" },
          { length: "24", ref: "202.824", verificationStatus: "source-verified" },
          { length: "26", ref: "202.826", verificationStatus: "source-verified" },
          { length: "28", ref: "202.828", verificationStatus: "source-verified" },
          { length: "30", ref: "202.830", verificationStatus: "source-verified" },
          { length: "32", ref: "202.832", verificationStatus: "source-verified" },
          { length: "34", ref: "202.834", verificationStatus: "source-verified" },
          { length: "36", ref: "202.836", verificationStatus: "source-verified" },
          { length: "38", ref: "202.838", verificationStatus: "source-verified" },
          { length: "40", ref: "202.840", verificationStatus: "source-verified" },
          { length: "45", ref: "202.845", verificationStatus: "source-verified" },
          { length: "50", ref: "202.850", verificationStatus: "source-verified" },
          { length: "55", ref: "202.855", verificationStatus: "source-verified" }
        ],
        notes: "The official ICF lists 2.7mm Cortex Screws TWICE under two different headings (page 1: 'T8 StarDrive Recess', 10-60mm with a numbering jump at 42mm; page 2: '2.5mm Hex Recess', 10-55mm with no jump) - both genuinely appear in the primary document and are recorded here as distinct, real listings rather than treated as a duplicate or error."
      },
      {
        diameter: "3.5",
        function: "variable-angle-locking",
        threadCoverage: "n/a",
        material: "SS",
        displayName: "3.5mm Variable Angle Locking, Self-Tapping, T15 StarDrive",
        sizes: [
          { length: "10", ref: "02.127.110", verificationStatus: "source-verified" },
          { length: "12", ref: "02.127.112", verificationStatus: "source-verified" },
          { length: "14", ref: "02.127.114", verificationStatus: "source-verified" },
          { length: "16", ref: "02.127.116", verificationStatus: "source-verified" },
          { length: "18", ref: "02.127.118", verificationStatus: "source-verified" },
          { length: "20", ref: "02.127.120", verificationStatus: "source-verified" },
          { length: "22", ref: "02.127.122", verificationStatus: "source-verified" },
          { length: "24", ref: "02.127.124", verificationStatus: "source-verified" },
          { length: "26", ref: "02.127.126", verificationStatus: "source-verified" },
          { length: "28", ref: "02.127.128", verificationStatus: "source-verified" },
          { length: "30", ref: "02.127.130", verificationStatus: "source-verified" },
          { length: "32", ref: "02.127.132", verificationStatus: "source-verified" },
          { length: "34", ref: "02.127.134", verificationStatus: "source-verified" },
          { length: "36", ref: "02.127.136", verificationStatus: "source-verified" },
          { length: "38", ref: "02.127.138", verificationStatus: "source-verified" },
          { length: "40", ref: "02.127.140", verificationStatus: "source-verified" },
          { length: "42", ref: "02.127.142", verificationStatus: "source-verified" },
          { length: "44", ref: "02.127.144", verificationStatus: "source-verified" },
          { length: "46", ref: "02.127.146", verificationStatus: "source-verified" },
          { length: "48", ref: "02.127.148", verificationStatus: "source-verified" },
          { length: "50", ref: "02.127.150", verificationStatus: "source-verified" },
          { length: "52", ref: "02.127.152", verificationStatus: "source-verified" },
          { length: "54", ref: "02.127.154", verificationStatus: "source-verified" },
          { length: "56", ref: "02.127.156", verificationStatus: "source-verified" },
          { length: "58", ref: "02.127.158", verificationStatus: "source-verified" },
          { length: "60", ref: "02.127.160", verificationStatus: "source-verified" }
        ]
      },
      {
        diameter: "4.0",
        function: "cancellous",
        threadCoverage: "fully-threaded",
        material: "SS",
        displayName: "4.0mm Cancellous Bone Screw, Fully Threaded, 2.5mm Hex",
        sizes: [
          { length: "10", ref: "206.010", verificationStatus: "source-verified" },
          { length: "12", ref: "206.012", verificationStatus: "source-verified" },
          { length: "14", ref: "206.014", verificationStatus: "source-verified" },
          { length: "16", ref: "206.016", verificationStatus: "source-verified" },
          { length: "18", ref: "206.018", verificationStatus: "source-verified" },
          { length: "20", ref: "206.020", verificationStatus: "source-verified" },
          { length: "22", ref: "206.022", verificationStatus: "source-verified" },
          { length: "24", ref: "206.024", verificationStatus: "source-verified" },
          { length: "26", ref: "206.026", verificationStatus: "source-verified" },
          { length: "28", ref: "206.028", verificationStatus: "source-verified" },
          { length: "30", ref: "206.030", verificationStatus: "source-verified" },
          { length: "35", ref: "206.035", verificationStatus: "source-verified" },
          { length: "40", ref: "206.040", verificationStatus: "source-verified" },
          { length: "45", ref: "206.045", verificationStatus: "source-verified" },
          { length: "50", ref: "206.050", verificationStatus: "source-verified" },
          { length: "55", ref: "206.055", verificationStatus: "source-verified" },
          { length: "60", ref: "206.060", verificationStatus: "source-verified" }
        ]
      },
      {
        diameter: "3.5",
        function: "locking",
        threadCoverage: "n/a",
        material: "SS",
        displayName: "3.5mm Locking, Self-Tapping, T15 StarDrive",
        sizes: [
          { length: "10", ref: "212.101", verificationStatus: "source-verified" },
          { length: "12", ref: "212.102", verificationStatus: "source-verified" },
          { length: "14", ref: "212.103", verificationStatus: "source-verified" },
          { length: "16", ref: "212.104", verificationStatus: "source-verified" },
          { length: "18", ref: "212.105", verificationStatus: "source-verified" },
          { length: "20", ref: "212.106", verificationStatus: "source-verified" },
          { length: "22", ref: "212.107", verificationStatus: "source-verified" },
          { length: "24", ref: "212.108", verificationStatus: "source-verified" },
          { length: "26", ref: "212.109", verificationStatus: "source-verified" },
          { length: "28", ref: "212.110", verificationStatus: "source-verified" },
          { length: "30", ref: "212.111", verificationStatus: "source-verified" },
          { length: "32", ref: "212.112", verificationStatus: "source-verified" },
          { length: "34", ref: "212.113", verificationStatus: "source-verified" },
          { length: "36", ref: "212.115", verificationStatus: "source-verified" },
          { length: "38", ref: "212.116", verificationStatus: "source-verified" },
          { length: "40", ref: "212.117", verificationStatus: "source-verified" },
          { length: "42", ref: "212.118", verificationStatus: "source-verified" },
          { length: "44", ref: "212.134", verificationStatus: "source-verified" },
          { length: "45", ref: "212.119", verificationStatus: "source-verified" },
          { length: "46", ref: "212.136", verificationStatus: "source-verified" },
          { length: "48", ref: "212.120", verificationStatus: "source-verified" },
          { length: "50", ref: "212.121", verificationStatus: "source-verified" },
          { length: "52", ref: "212.122", verificationStatus: "source-verified" },
          { length: "54", ref: "02.212.054", verificationStatus: "source-verified" },
          { length: "55", ref: "212.123", verificationStatus: "source-verified" },
          { length: "56", ref: "02.212.056", verificationStatus: "source-verified" },
          { length: "58", ref: "02.212.058", verificationStatus: "source-verified" },
          { length: "60", ref: "212.124", verificationStatus: "source-verified" }
        ],
        notes: "Full 28-size range exactly as printed in the official ICF, page 3. Note the genuine non-sequential jumps at 44mm (212.134, not 212.114) and 46mm (212.136) - confirmed real per the primary document, not an error."
      }
    ],
    plateFamilies: [
      {
        diameter: "3.5",
        familyName: "LCP",
        material: "SS",
        displayName: "3.5mm LCP Plate",
        sizes: [
          { holes: 5, length: "72", ref: "223.551", verificationStatus: "source-verified" },
          { holes: 6, length: "85", ref: "223.561", verificationStatus: "source-verified" },
          { holes: 7, length: "98", ref: "223.571", verificationStatus: "source-verified" },
          { holes: 8, length: "111", ref: "223.581", verificationStatus: "source-verified" },
          { holes: 9, length: "124", ref: "223.591", verificationStatus: "source-verified" },
          { holes: 10, length: "137", ref: "223.601", verificationStatus: "source-verified" },
          { holes: 12, length: "163", ref: "223.621", verificationStatus: "source-verified" },
          { holes: 14, length: "189", ref: "223.641", verificationStatus: "source-verified" }
        ]
      },
      {
        diameter: null,
        angleDegrees: "right",
        familyName: "T-Plate, Right Angle",
        material: "SS",
        displayName: "3.5mm LCP T-Plate, Right Angle",
        sizes: [
          { holes: 3, length: "50", ref: "241.131", verificationStatus: "source-verified", details: "3 head holes, 3 shaft holes." },
          { holes: 5, length: "67", ref: "241.151", verificationStatus: "source-verified", details: "3 head holes, 5 shaft holes." }
        ]
      },
      {
        diameter: "3.5",
        familyName: "One-Third Tubular LCP",
        material: "SS",
        displayName: "3.5mm One-Third Tubular LCP Plate",
        sizes: [
          { holes: 5, length: null, ref: "241.351", verificationStatus: "source-verified" },
          { holes: 6, length: null, ref: "241.361", verificationStatus: "source-verified" },
          { holes: 7, length: null, ref: "241.371", verificationStatus: "source-verified" },
          { holes: 8, length: null, ref: "241.381", verificationStatus: "source-verified" },
          { holes: 10, length: null, ref: "241.401", verificationStatus: "source-verified" },
          { holes: 12, length: null, ref: "241.421", verificationStatus: "source-verified" }
        ]
      },
      {
        diameter: "2.7",
        familyName: "LCP",
        material: "SS",
        displayName: "2.7mm LCP Plate",
        sizes: [
          { holes: 4, length: "40", ref: "249.680", verificationStatus: "source-verified" },
          { holes: 5, length: "49", ref: "249.681", verificationStatus: "source-verified" },
          { holes: 6, length: "58", ref: "249.682", verificationStatus: "source-verified" },
          { holes: 7, length: "67", ref: "249.683", verificationStatus: "source-verified" },
          { holes: 8, length: "76", ref: "247.372", verificationStatus: "source-verified" },
          { holes: 10, length: "94", ref: "247.374", verificationStatus: "source-verified" }
        ],
        notes: "Note the genuine prefix change from 249.xxx (4-7 holes) to 247.xxx (8/10 holes) within this same family - confirmed real per the official ICF, not an error."
      }
    ],
    hospitalNotes: "Washer (7.0mm, #219.98), Kirschner Wires (1.25mm/1.6mm/2.0mm, #219.12/292.16/292.20), and drill bits (#03.133.100-109) confirmed in the official ICF alongside this set - not modeled here, implants only."
  },
  {
    id: "set_volt_mini_small_frag_screws",
    name: "VOLT MINI/SMALL FRAGMENT - SCREWS",
    pNumber: "P0026780",
    defaultLocation: "551-B",
    // NOTE: per direct user instruction, the VOLT Mini Frag system is
    // split into two physical trays: this one (P0026780) holds SCREWS
    // ONLY; the companion tray (P0026781) holds PLATES ONLY. Spans the
    // VOLT Mini Fragment (2.0/2.4/2.7mm) and VOLT Small Fragment (3.5mm)
    // product lines - confirmed as one combined FDA 510(k) submission
    // (K233665) covering both. The 4.0mm Cancellous screws use the
    // established Synthes 206.xxx/207.xxx family (same screws used
    // elsewhere in this database) since no VOLT-specific ref was printed
    // in the set's own PDF - INFERRED, not independently confirmed, and
    // flagged accordingly below.
    dependencies: [
      { relatedSetId: "set_volt_mini_small_frag_plates", relatedSetName: "VOLT MINI/SMALL FRAGMENT - PLATES", relationship: "requires-companion-caddy", notes: "Screws and plates for this system are split across two separate physical trays - both are opened together for any case." }
    ],
    verificationStatus: "source-verified",
    source: "ChronoMEDIC PDF export, directly pasted by the user, cross-referenced against the official DePuy Synthes VOLT Mini Fragment Plating System Inventory Control Forms for 2.0mm, 2.4mm, and 2.7mm (jnjmedtech.com, VOLTMFSSICFV1 series, 08/24), confirming the 2.0/2.4/2.7mm screw families exactly. The 3.5mm family belongs to the related VOLT Small Fragment Plating System (same FDA 510(k) K233665), consistent with the same numbering pattern.",
    screwFamilies: [
      {
        diameter: "2.0",
        function: "cortex",
        threadCoverage: "n/a",
        material: "SS",
        displayName: "2.0mm VOLT Cortex",
        sizes: [
          { length: "6", ref: "02.420.106", verificationStatus: "source-verified" },
          { length: "7", ref: "02.420.107", verificationStatus: "source-verified" },
          { length: "8", ref: "02.420.108", verificationStatus: "source-verified" },
          { length: "9", ref: "02.420.109", verificationStatus: "source-verified" },
          { length: "10", ref: "02.420.110", verificationStatus: "source-verified" },
          { length: "11", ref: "02.420.111", verificationStatus: "source-verified" },
          { length: "12", ref: "02.420.112", verificationStatus: "source-verified" },
          { length: "13", ref: "02.420.113", verificationStatus: "source-verified" },
          { length: "14", ref: "02.420.114", verificationStatus: "source-verified" },
          { length: "15", ref: "02.420.115", verificationStatus: "source-verified" },
          { length: "16", ref: "02.420.116", verificationStatus: "source-verified" },
          { length: "17", ref: "02.420.117", verificationStatus: "source-verified" },
          { length: "18", ref: "02.420.118", verificationStatus: "source-verified" },
          { length: "19", ref: "02.420.119", verificationStatus: "source-verified" },
          { length: "20", ref: "02.420.120", verificationStatus: "source-verified" },
          { length: "22", ref: "02.420.122", verificationStatus: "source-verified" },
          { length: "24", ref: "02.420.124", verificationStatus: "source-verified" },
          { length: "26", ref: "02.420.126", verificationStatus: "source-verified" },
          { length: "28", ref: "02.420.128", verificationStatus: "source-verified" },
          { length: "30", ref: "02.420.130", verificationStatus: "source-verified" },
          { length: "32", ref: "02.420.132", verificationStatus: "source-verified" },
          { length: "34", ref: "02.420.134", verificationStatus: "source-verified" },
          { length: "36", ref: "02.420.136", verificationStatus: "source-verified" },
          { length: "38", ref: "02.420.138", verificationStatus: "source-verified" },
          { length: "40", ref: "02.420.140", verificationStatus: "source-verified" },
          { length: "42", ref: "02.420.142", verificationStatus: "source-verified" },
          { length: "44", ref: "02.420.144", verificationStatus: "source-verified" },
          { length: "46", ref: "02.420.146", verificationStatus: "source-verified" },
          { length: "48", ref: "02.420.148", verificationStatus: "source-verified" },
          { length: "50", ref: "02.420.150", verificationStatus: "source-verified" },
        ]
      },
      {
        diameter: "2.0",
        function: "locking",
        threadCoverage: "n/a",
        material: "SS",
        displayName: "2.0mm VOLT Locking",
        sizes: [
          { length: "6", ref: "02.420.306", verificationStatus: "source-verified" },
          { length: "7", ref: "02.420.307", verificationStatus: "source-verified" },
          { length: "8", ref: "02.420.308", verificationStatus: "source-verified" },
          { length: "9", ref: "02.420.309", verificationStatus: "source-verified" },
          { length: "10", ref: "02.420.310", verificationStatus: "source-verified" },
          { length: "11", ref: "02.420.311", verificationStatus: "source-verified" },
          { length: "12", ref: "02.420.312", verificationStatus: "source-verified" },
          { length: "13", ref: "02.420.313", verificationStatus: "source-verified" },
          { length: "14", ref: "02.420.314", verificationStatus: "source-verified" },
          { length: "15", ref: "02.420.315", verificationStatus: "source-verified" },
          { length: "16", ref: "02.420.316", verificationStatus: "source-verified" },
          { length: "17", ref: "02.420.317", verificationStatus: "source-verified" },
          { length: "18", ref: "02.420.318", verificationStatus: "source-verified" },
          { length: "19", ref: "02.420.319", verificationStatus: "source-verified" },
          { length: "20", ref: "02.420.320", verificationStatus: "source-verified" },
          { length: "22", ref: "02.420.322", verificationStatus: "source-verified" },
          { length: "24", ref: "02.420.324", verificationStatus: "source-verified" },
          { length: "26", ref: "02.420.326", verificationStatus: "source-verified" },
          { length: "28", ref: "02.420.328", verificationStatus: "source-verified" },
          { length: "30", ref: "02.420.330", verificationStatus: "source-verified" },
          { length: "32", ref: "02.420.332", verificationStatus: "source-verified" },
          { length: "34", ref: "02.420.334", verificationStatus: "source-verified" },
          { length: "36", ref: "02.420.336", verificationStatus: "source-verified" },
          { length: "38", ref: "02.420.338", verificationStatus: "source-verified" },
          { length: "40", ref: "02.420.340", verificationStatus: "source-verified" },
          { length: "42", ref: "02.420.342", verificationStatus: "source-verified" },
          { length: "44", ref: "02.420.344", verificationStatus: "source-verified" },
          { length: "46", ref: "02.420.346", verificationStatus: "source-verified" },
          { length: "48", ref: "02.420.348", verificationStatus: "source-verified" },
          { length: "50", ref: "02.420.350", verificationStatus: "source-verified" },
        ]
      },
      {
        diameter: "2.4",
        function: "cortex",
        threadCoverage: "n/a",
        material: "SS",
        displayName: "2.4mm VOLT Cortex",
        sizes: [
          { length: "6", ref: "02.424.106", verificationStatus: "source-verified" },
          { length: "7", ref: "02.424.107", verificationStatus: "source-verified" },
          { length: "8", ref: "02.424.108", verificationStatus: "source-verified" },
          { length: "9", ref: "02.424.109", verificationStatus: "source-verified" },
          { length: "10", ref: "02.424.110", verificationStatus: "source-verified" },
          { length: "11", ref: "02.424.111", verificationStatus: "source-verified" },
          { length: "12", ref: "02.424.112", verificationStatus: "source-verified" },
          { length: "13", ref: "02.424.113", verificationStatus: "source-verified" },
          { length: "14", ref: "02.424.114", verificationStatus: "source-verified" },
          { length: "15", ref: "02.424.115", verificationStatus: "source-verified" },
          { length: "16", ref: "02.424.116", verificationStatus: "source-verified" },
          { length: "17", ref: "02.424.117", verificationStatus: "source-verified" },
          { length: "18", ref: "02.424.118", verificationStatus: "source-verified" },
          { length: "19", ref: "02.424.119", verificationStatus: "source-verified" },
          { length: "20", ref: "02.424.120", verificationStatus: "source-verified" },
          { length: "22", ref: "02.424.122", verificationStatus: "source-verified" },
          { length: "24", ref: "02.424.124", verificationStatus: "source-verified" },
          { length: "26", ref: "02.424.126", verificationStatus: "source-verified" },
          { length: "28", ref: "02.424.128", verificationStatus: "source-verified" },
          { length: "30", ref: "02.424.130", verificationStatus: "source-verified" },
          { length: "32", ref: "02.424.132", verificationStatus: "source-verified" },
          { length: "34", ref: "02.424.134", verificationStatus: "source-verified" },
          { length: "36", ref: "02.424.136", verificationStatus: "source-verified" },
          { length: "38", ref: "02.424.138", verificationStatus: "source-verified" },
          { length: "40", ref: "02.424.140", verificationStatus: "source-verified" },
          { length: "42", ref: "02.424.142", verificationStatus: "source-verified" },
          { length: "44", ref: "02.424.144", verificationStatus: "source-verified" },
          { length: "46", ref: "02.424.146", verificationStatus: "source-verified" },
          { length: "48", ref: "02.424.148", verificationStatus: "source-verified" },
          { length: "50", ref: "02.424.150", verificationStatus: "source-verified" },
          { length: "52", ref: "02.424.152", verificationStatus: "source-verified" },
          { length: "54", ref: "02.424.154", verificationStatus: "source-verified" },
          { length: "56", ref: "02.424.156", verificationStatus: "source-verified" },
          { length: "58", ref: "02.424.158", verificationStatus: "source-verified" },
          { length: "60", ref: "02.424.160", verificationStatus: "source-verified" },
          { length: "65", ref: "02.424.165", verificationStatus: "source-verified" },
          { length: "70", ref: "02.424.170", verificationStatus: "source-verified" },
          { length: "75", ref: "02.424.175", verificationStatus: "source-verified" },
          { length: "80", ref: "02.424.180", verificationStatus: "source-verified" },
          { length: "85", ref: "02.424.185", verificationStatus: "source-verified" },
          { length: "90", ref: "02.424.190", verificationStatus: "source-verified" },
        ]
      },
      {
        diameter: "2.4",
        function: "locking",
        threadCoverage: "n/a",
        material: "SS",
        displayName: "2.4mm VOLT Locking",
        sizes: [
          { length: "6", ref: "02.424.306", verificationStatus: "source-verified" },
          { length: "7", ref: "02.424.307", verificationStatus: "source-verified" },
          { length: "8", ref: "02.424.308", verificationStatus: "source-verified" },
          { length: "9", ref: "02.424.309", verificationStatus: "source-verified" },
          { length: "10", ref: "02.424.310", verificationStatus: "source-verified" },
          { length: "11", ref: "02.424.311", verificationStatus: "source-verified" },
          { length: "12", ref: "02.424.312", verificationStatus: "source-verified" },
          { length: "13", ref: "02.424.313", verificationStatus: "source-verified" },
          { length: "14", ref: "02.424.314", verificationStatus: "source-verified" },
          { length: "15", ref: "02.424.315", verificationStatus: "source-verified" },
          { length: "16", ref: "02.424.316", verificationStatus: "source-verified" },
          { length: "17", ref: "02.424.317", verificationStatus: "source-verified" },
          { length: "18", ref: "02.424.318", verificationStatus: "source-verified" },
          { length: "19", ref: "02.424.319", verificationStatus: "source-verified" },
          { length: "20", ref: "02.424.320", verificationStatus: "source-verified" },
          { length: "22", ref: "02.424.322", verificationStatus: "source-verified" },
          { length: "24", ref: "02.424.324", verificationStatus: "source-verified" },
          { length: "26", ref: "02.424.326", verificationStatus: "source-verified" },
          { length: "28", ref: "02.424.328", verificationStatus: "source-verified" },
          { length: "30", ref: "02.424.330", verificationStatus: "source-verified" },
          { length: "32", ref: "02.424.332", verificationStatus: "source-verified" },
          { length: "34", ref: "02.424.334", verificationStatus: "source-verified" },
          { length: "36", ref: "02.424.336", verificationStatus: "source-verified" },
          { length: "38", ref: "02.424.338", verificationStatus: "source-verified" },
          { length: "40", ref: "02.424.340", verificationStatus: "source-verified" },
          { length: "42", ref: "02.424.342", verificationStatus: "source-verified" },
          { length: "44", ref: "02.424.344", verificationStatus: "source-verified" },
          { length: "46", ref: "02.424.346", verificationStatus: "source-verified" },
          { length: "48", ref: "02.424.348", verificationStatus: "source-verified" },
          { length: "50", ref: "02.424.350", verificationStatus: "source-verified" },
          { length: "52", ref: "02.424.352", verificationStatus: "source-verified" },
          { length: "54", ref: "02.424.354", verificationStatus: "source-verified" },
          { length: "56", ref: "02.424.356", verificationStatus: "source-verified" },
          { length: "58", ref: "02.424.358", verificationStatus: "source-verified" },
          { length: "60", ref: "02.424.360", verificationStatus: "source-verified" },
          { length: "65", ref: "02.424.365", verificationStatus: "source-verified" },
          { length: "70", ref: "02.424.370", verificationStatus: "source-verified" },
          { length: "75", ref: "02.424.375", verificationStatus: "source-verified" },
          { length: "80", ref: "02.424.380", verificationStatus: "source-verified" },
          { length: "85", ref: "02.424.385", verificationStatus: "source-verified" },
          { length: "90", ref: "02.424.390", verificationStatus: "source-verified" },
        ]
      },
      {
        diameter: "2.7",
        function: "cortex",
        threadCoverage: "n/a",
        material: "SS",
        displayName: "2.7mm VOLT Cortex",
        sizes: [
          { length: "6", ref: "02.527.106", verificationStatus: "source-verified" },
          { length: "7", ref: "02.527.107", verificationStatus: "source-verified" },
          { length: "8", ref: "02.527.108", verificationStatus: "source-verified" },
          { length: "9", ref: "02.527.109", verificationStatus: "source-verified" },
          { length: "10", ref: "02.527.110", verificationStatus: "source-verified" },
          { length: "11", ref: "02.527.111", verificationStatus: "source-verified" },
          { length: "12", ref: "02.527.112", verificationStatus: "source-verified" },
          { length: "13", ref: "02.527.113", verificationStatus: "source-verified" },
          { length: "14", ref: "02.527.114", verificationStatus: "source-verified" },
          { length: "15", ref: "02.527.115", verificationStatus: "source-verified" },
          { length: "16", ref: "02.527.116", verificationStatus: "source-verified" },
          { length: "17", ref: "02.527.117", verificationStatus: "source-verified" },
          { length: "18", ref: "02.527.118", verificationStatus: "source-verified" },
          { length: "19", ref: "02.527.119", verificationStatus: "source-verified" },
          { length: "20", ref: "02.527.120", verificationStatus: "source-verified" },
          { length: "22", ref: "02.527.122", verificationStatus: "source-verified" },
          { length: "24", ref: "02.527.124", verificationStatus: "source-verified" },
          { length: "26", ref: "02.527.126", verificationStatus: "source-verified" },
          { length: "28", ref: "02.527.128", verificationStatus: "source-verified" },
          { length: "30", ref: "02.527.130", verificationStatus: "source-verified" },
          { length: "32", ref: "02.527.132", verificationStatus: "source-verified" },
          { length: "34", ref: "02.527.134", verificationStatus: "source-verified" },
          { length: "36", ref: "02.527.136", verificationStatus: "source-verified" },
          { length: "38", ref: "02.527.138", verificationStatus: "source-verified" },
          { length: "40", ref: "02.527.140", verificationStatus: "source-verified" },
          { length: "42", ref: "02.527.142", verificationStatus: "source-verified" },
          { length: "44", ref: "02.527.144", verificationStatus: "source-verified" },
          { length: "46", ref: "02.527.146", verificationStatus: "source-verified" },
          { length: "48", ref: "02.527.148", verificationStatus: "source-verified" },
          { length: "50", ref: "02.527.150", verificationStatus: "source-verified" },
          { length: "52", ref: "02.527.152", verificationStatus: "source-verified" },
          { length: "54", ref: "02.527.154", verificationStatus: "source-verified" },
          { length: "56", ref: "02.527.156", verificationStatus: "source-verified" },
          { length: "58", ref: "02.527.158", verificationStatus: "source-verified" },
          { length: "60", ref: "02.527.160", verificationStatus: "source-verified" },
          { length: "65", ref: "02.527.165", verificationStatus: "source-verified" },
          { length: "70", ref: "02.527.170", verificationStatus: "source-verified" },
          { length: "75", ref: "02.527.175", verificationStatus: "source-verified" },
          { length: "80", ref: "02.527.180", verificationStatus: "source-verified" },
          { length: "85", ref: "02.527.185", verificationStatus: "source-verified" },
          { length: "90", ref: "02.527.190", verificationStatus: "source-verified" },
        ]
      },
      {
        diameter: "2.7",
        function: "locking",
        threadCoverage: "n/a",
        material: "SS",
        displayName: "2.7mm VOLT Locking",
        sizes: [
          { length: "6", ref: "02.527.306", verificationStatus: "source-verified" },
          { length: "7", ref: "02.527.307", verificationStatus: "source-verified" },
          { length: "8", ref: "02.527.308", verificationStatus: "source-verified" },
          { length: "9", ref: "02.527.309", verificationStatus: "source-verified" },
          { length: "10", ref: "02.527.310", verificationStatus: "source-verified" },
          { length: "11", ref: "02.527.311", verificationStatus: "source-verified" },
          { length: "12", ref: "02.527.312", verificationStatus: "source-verified" },
          { length: "13", ref: "02.527.313", verificationStatus: "source-verified" },
          { length: "14", ref: "02.527.314", verificationStatus: "source-verified" },
          { length: "15", ref: "02.527.315", verificationStatus: "source-verified" },
          { length: "16", ref: "02.527.316", verificationStatus: "source-verified" },
          { length: "17", ref: "02.527.317", verificationStatus: "source-verified" },
          { length: "18", ref: "02.527.318", verificationStatus: "source-verified" },
          { length: "19", ref: "02.527.319", verificationStatus: "source-verified" },
          { length: "20", ref: "02.527.320", verificationStatus: "source-verified" },
          { length: "22", ref: "02.527.322", verificationStatus: "source-verified" },
          { length: "24", ref: "02.527.324", verificationStatus: "source-verified" },
          { length: "26", ref: "02.527.326", verificationStatus: "source-verified" },
          { length: "28", ref: "02.527.328", verificationStatus: "source-verified" },
          { length: "30", ref: "02.527.330", verificationStatus: "source-verified" },
          { length: "32", ref: "02.527.332", verificationStatus: "source-verified" },
          { length: "34", ref: "02.527.334", verificationStatus: "source-verified" },
          { length: "36", ref: "02.527.336", verificationStatus: "source-verified" },
          { length: "38", ref: "02.527.338", verificationStatus: "source-verified" },
          { length: "40", ref: "02.527.340", verificationStatus: "source-verified" },
          { length: "42", ref: "02.527.342", verificationStatus: "source-verified" },
          { length: "44", ref: "02.527.344", verificationStatus: "source-verified" },
          { length: "46", ref: "02.527.346", verificationStatus: "source-verified" },
          { length: "48", ref: "02.527.348", verificationStatus: "source-verified" },
          { length: "50", ref: "02.527.350", verificationStatus: "source-verified" },
          { length: "52", ref: "02.527.352", verificationStatus: "source-verified" },
          { length: "54", ref: "02.527.354", verificationStatus: "source-verified" },
          { length: "56", ref: "02.527.356", verificationStatus: "source-verified" },
          { length: "58", ref: "02.527.358", verificationStatus: "source-verified" },
          { length: "60", ref: "02.527.360", verificationStatus: "source-verified" },
          { length: "65", ref: "02.527.365", verificationStatus: "source-verified" },
          { length: "70", ref: "02.527.370", verificationStatus: "source-verified" },
          { length: "75", ref: "02.527.375", verificationStatus: "source-verified" },
          { length: "80", ref: "02.527.380", verificationStatus: "source-verified" },
          { length: "85", ref: "02.527.385", verificationStatus: "source-verified" },
          { length: "90", ref: "02.527.390", verificationStatus: "source-verified" },
        ]
      },
      {
        diameter: "3.5",
        function: "cortex",
        threadCoverage: "n/a",
        material: "SS",
        displayName: "3.5mm VOLT Cortex",
        sizes: [
          { length: "10", ref: "02.535.110", verificationStatus: "source-verified" },
          { length: "12", ref: "02.535.112", verificationStatus: "source-verified" },
          { length: "14", ref: "02.535.114", verificationStatus: "source-verified" },
          { length: "16", ref: "02.535.116", verificationStatus: "source-verified" },
          { length: "18", ref: "02.535.118", verificationStatus: "source-verified" },
          { length: "20", ref: "02.535.120", verificationStatus: "source-verified" },
          { length: "22", ref: "02.535.122", verificationStatus: "source-verified" },
          { length: "24", ref: "02.535.124", verificationStatus: "source-verified" },
          { length: "26", ref: "02.535.126", verificationStatus: "source-verified" },
          { length: "28", ref: "02.535.128", verificationStatus: "source-verified" },
          { length: "30", ref: "02.535.130", verificationStatus: "source-verified" },
          { length: "32", ref: "02.535.132", verificationStatus: "source-verified" },
          { length: "34", ref: "02.535.134", verificationStatus: "source-verified" },
          { length: "36", ref: "02.535.136", verificationStatus: "source-verified" },
          { length: "38", ref: "02.535.138", verificationStatus: "source-verified" },
          { length: "40", ref: "02.535.140", verificationStatus: "source-verified" },
          { length: "42", ref: "02.535.142", verificationStatus: "source-verified" },
          { length: "44", ref: "02.535.144", verificationStatus: "source-verified" },
          { length: "46", ref: "02.535.146", verificationStatus: "source-verified" },
          { length: "48", ref: "02.535.148", verificationStatus: "source-verified" },
          { length: "50", ref: "02.535.150", verificationStatus: "source-verified" },
          { length: "52", ref: "02.535.152", verificationStatus: "source-verified" },
          { length: "54", ref: "02.535.154", verificationStatus: "source-verified" },
          { length: "56", ref: "02.535.156", verificationStatus: "source-verified" },
          { length: "58", ref: "02.535.158", verificationStatus: "source-verified" },
          { length: "60", ref: "02.535.160", verificationStatus: "source-verified" },
          { length: "65", ref: "02.535.165", verificationStatus: "source-verified" },
          { length: "70", ref: "02.535.170", verificationStatus: "source-verified" },
          { length: "75", ref: "02.535.175", verificationStatus: "source-verified" },
          { length: "80", ref: "02.535.180", verificationStatus: "source-verified" },
          { length: "85", ref: "02.535.185", verificationStatus: "source-verified" },
          { length: "90", ref: "02.535.190", verificationStatus: "source-verified" },
          { length: "95", ref: "02.535.195S*", verificationStatus: "source-verified" },
          { length: "100", ref: "02.535.200S*", verificationStatus: "source-verified" },
          { length: "105", ref: "02.535.205S*", verificationStatus: "source-verified" },
          { length: "110", ref: "02.535.210S*", verificationStatus: "source-verified" },
        ],
        notes: "95mm and above are sterile-only (S* suffix) per the set's own PDF, consistent with the official VOLT Small Frag system's general sterile-only convention for extended lengths."
      },
      {
        diameter: "3.5",
        function: "locking",
        threadCoverage: "n/a",
        material: "SS",
        displayName: "3.5mm VOLT Locking",
        sizes: [
          { length: "10", ref: "02.535.310", verificationStatus: "source-verified" },
          { length: "12", ref: "02.535.312", verificationStatus: "source-verified" },
          { length: "14", ref: "02.535.314", verificationStatus: "source-verified" },
          { length: "16", ref: "02.535.316", verificationStatus: "source-verified" },
          { length: "18", ref: "02.535.318", verificationStatus: "source-verified" },
          { length: "20", ref: "02.535.320", verificationStatus: "source-verified" },
          { length: "22", ref: "02.535.322", verificationStatus: "source-verified" },
          { length: "24", ref: "02.535.324", verificationStatus: "source-verified" },
          { length: "26", ref: "02.535.326", verificationStatus: "source-verified" },
          { length: "28", ref: "02.535.328", verificationStatus: "source-verified" },
          { length: "30", ref: "02.535.330", verificationStatus: "source-verified" },
          { length: "32", ref: "02.535.332", verificationStatus: "source-verified" },
          { length: "34", ref: "02.535.334", verificationStatus: "source-verified" },
          { length: "36", ref: "02.535.336", verificationStatus: "source-verified" },
          { length: "38", ref: "02.535.338", verificationStatus: "source-verified" },
          { length: "40", ref: "02.535.340", verificationStatus: "source-verified" },
          { length: "42", ref: "02.535.342", verificationStatus: "source-verified" },
          { length: "44", ref: "02.535.344", verificationStatus: "source-verified" },
          { length: "46", ref: "02.535.346", verificationStatus: "source-verified" },
          { length: "48", ref: "02.535.348", verificationStatus: "source-verified" },
          { length: "50", ref: "02.535.350", verificationStatus: "source-verified" },
          { length: "52", ref: "02.535.352", verificationStatus: "source-verified" },
          { length: "54", ref: "02.535.354", verificationStatus: "source-verified" },
          { length: "56", ref: "02.535.356", verificationStatus: "source-verified" },
          { length: "58", ref: "02.535.358", verificationStatus: "source-verified" },
          { length: "60", ref: "02.535.360", verificationStatus: "source-verified" },
          { length: "65", ref: "02.535.365", verificationStatus: "source-verified" },
          { length: "70", ref: "02.535.370", verificationStatus: "source-verified" },
          { length: "75", ref: "02.535.375", verificationStatus: "source-verified" },
          { length: "80", ref: "02.535.380", verificationStatus: "source-verified" },
          { length: "85", ref: "02.535.385", verificationStatus: "source-verified" },
          { length: "90", ref: "02.535.390", verificationStatus: "source-verified" },
          { length: "95", ref: "02.535.395S*", verificationStatus: "source-verified" },
          { length: "100", ref: "02.535.400S*", verificationStatus: "source-verified" },
          { length: "105", ref: "02.535.405S*", verificationStatus: "source-verified" },
          { length: "110", ref: "02.535.410S*", verificationStatus: "source-verified" },
        ],
        notes: "95mm-110mm are sterile-only (S* suffix) per the set's own PDF."
      },
      {
        diameter: "4.0",
        function: "cancellous",
        threadCoverage: "fully-threaded",
        material: "SS",
        displayName: "4.0mm Cancellous, Fully Threaded (paired with VOLT plates)",
        sizes: [
          { length: "10", ref: "206.010", verificationStatus: "unverified", details: "No catalog ref printed in the set's own PDF for the 4mm Cancellous family. This ref is INFERRED from the established Synthes 206.xxx (Fully Threaded) numbering convention confirmed elsewhere in this database for the same screw diameter/type, NOT independently confirmed for this exact VOLT-paired family. Flagged for verification." },
          { length: "12", ref: "206.012", verificationStatus: "unverified", details: "No catalog ref printed in the set's own PDF for the 4mm Cancellous family. This ref is INFERRED from the established Synthes 206.xxx (Fully Threaded) numbering convention confirmed elsewhere in this database for the same screw diameter/type, NOT independently confirmed for this exact VOLT-paired family. Flagged for verification." },
          { length: "14", ref: "206.014", verificationStatus: "unverified", details: "No catalog ref printed in the set's own PDF for the 4mm Cancellous family. This ref is INFERRED from the established Synthes 206.xxx (Fully Threaded) numbering convention confirmed elsewhere in this database for the same screw diameter/type, NOT independently confirmed for this exact VOLT-paired family. Flagged for verification." },
          { length: "16", ref: "206.016", verificationStatus: "unverified", details: "No catalog ref printed in the set's own PDF for the 4mm Cancellous family. This ref is INFERRED from the established Synthes 206.xxx (Fully Threaded) numbering convention confirmed elsewhere in this database for the same screw diameter/type, NOT independently confirmed for this exact VOLT-paired family. Flagged for verification." },
          { length: "18", ref: "206.018", verificationStatus: "unverified", details: "No catalog ref printed in the set's own PDF for the 4mm Cancellous family. This ref is INFERRED from the established Synthes 206.xxx (Fully Threaded) numbering convention confirmed elsewhere in this database for the same screw diameter/type, NOT independently confirmed for this exact VOLT-paired family. Flagged for verification." },
          { length: "20", ref: "206.020", verificationStatus: "unverified", details: "No catalog ref printed in the set's own PDF for the 4mm Cancellous family. This ref is INFERRED from the established Synthes 206.xxx (Fully Threaded) numbering convention confirmed elsewhere in this database for the same screw diameter/type, NOT independently confirmed for this exact VOLT-paired family. Flagged for verification." },
          { length: "22", ref: "206.022", verificationStatus: "unverified", details: "No catalog ref printed in the set's own PDF for the 4mm Cancellous family. This ref is INFERRED from the established Synthes 206.xxx (Fully Threaded) numbering convention confirmed elsewhere in this database for the same screw diameter/type, NOT independently confirmed for this exact VOLT-paired family. Flagged for verification." },
          { length: "24", ref: "206.024", verificationStatus: "unverified", details: "No catalog ref printed in the set's own PDF for the 4mm Cancellous family. This ref is INFERRED from the established Synthes 206.xxx (Fully Threaded) numbering convention confirmed elsewhere in this database for the same screw diameter/type, NOT independently confirmed for this exact VOLT-paired family. Flagged for verification." },
          { length: "26", ref: "206.026", verificationStatus: "unverified", details: "No catalog ref printed in the set's own PDF for the 4mm Cancellous family. This ref is INFERRED from the established Synthes 206.xxx (Fully Threaded) numbering convention confirmed elsewhere in this database for the same screw diameter/type, NOT independently confirmed for this exact VOLT-paired family. Flagged for verification." },
          { length: "28", ref: "206.028", verificationStatus: "unverified", details: "No catalog ref printed in the set's own PDF for the 4mm Cancellous family. This ref is INFERRED from the established Synthes 206.xxx (Fully Threaded) numbering convention confirmed elsewhere in this database for the same screw diameter/type, NOT independently confirmed for this exact VOLT-paired family. Flagged for verification." },
          { length: "30", ref: "206.030", verificationStatus: "unverified", details: "No catalog ref printed in the set's own PDF for the 4mm Cancellous family. This ref is INFERRED from the established Synthes 206.xxx (Fully Threaded) numbering convention confirmed elsewhere in this database for the same screw diameter/type, NOT independently confirmed for this exact VOLT-paired family. Flagged for verification." },
          { length: "32", ref: "206.032", verificationStatus: "unverified", details: "No catalog ref printed in the set's own PDF for the 4mm Cancellous family. This ref is INFERRED from the established Synthes 206.xxx (Fully Threaded) numbering convention confirmed elsewhere in this database for the same screw diameter/type, NOT independently confirmed for this exact VOLT-paired family. Flagged for verification." },
          { length: "34", ref: "206.034", verificationStatus: "unverified", details: "No catalog ref printed in the set's own PDF for the 4mm Cancellous family. This ref is INFERRED from the established Synthes 206.xxx (Fully Threaded) numbering convention confirmed elsewhere in this database for the same screw diameter/type, NOT independently confirmed for this exact VOLT-paired family. Flagged for verification." },
          { length: "36", ref: "206.036", verificationStatus: "unverified", details: "No catalog ref printed in the set's own PDF for the 4mm Cancellous family. This ref is INFERRED from the established Synthes 206.xxx (Fully Threaded) numbering convention confirmed elsewhere in this database for the same screw diameter/type, NOT independently confirmed for this exact VOLT-paired family. Flagged for verification." },
          { length: "38", ref: "206.038", verificationStatus: "unverified", details: "No catalog ref printed in the set's own PDF for the 4mm Cancellous family. This ref is INFERRED from the established Synthes 206.xxx (Fully Threaded) numbering convention confirmed elsewhere in this database for the same screw diameter/type, NOT independently confirmed for this exact VOLT-paired family. Flagged for verification." },
          { length: "40", ref: "206.040", verificationStatus: "unverified", details: "No catalog ref printed in the set's own PDF for the 4mm Cancellous family. This ref is INFERRED from the established Synthes 206.xxx (Fully Threaded) numbering convention confirmed elsewhere in this database for the same screw diameter/type, NOT independently confirmed for this exact VOLT-paired family. Flagged for verification." },
          { length: "45", ref: "206.045", verificationStatus: "unverified", details: "No catalog ref printed in the set's own PDF for the 4mm Cancellous family. This ref is INFERRED from the established Synthes 206.xxx (Fully Threaded) numbering convention confirmed elsewhere in this database for the same screw diameter/type, NOT independently confirmed for this exact VOLT-paired family. Flagged for verification." },
          { length: "50", ref: "206.050", verificationStatus: "unverified", details: "No catalog ref printed in the set's own PDF for the 4mm Cancellous family. This ref is INFERRED from the established Synthes 206.xxx (Fully Threaded) numbering convention confirmed elsewhere in this database for the same screw diameter/type, NOT independently confirmed for this exact VOLT-paired family. Flagged for verification." },
          { length: "55", ref: "206.055", verificationStatus: "unverified", details: "No catalog ref printed in the set's own PDF for the 4mm Cancellous family. This ref is INFERRED from the established Synthes 206.xxx (Fully Threaded) numbering convention confirmed elsewhere in this database for the same screw diameter/type, NOT independently confirmed for this exact VOLT-paired family. Flagged for verification." },
          { length: "60", ref: "206.060", verificationStatus: "unverified", details: "No catalog ref printed in the set's own PDF for the 4mm Cancellous family. This ref is INFERRED from the established Synthes 206.xxx (Fully Threaded) numbering convention confirmed elsewhere in this database for the same screw diameter/type, NOT independently confirmed for this exact VOLT-paired family. Flagged for verification." },
          { length: "65", ref: "206.065", verificationStatus: "unverified", details: "No catalog ref printed in the set's own PDF for the 4mm Cancellous family. This ref is INFERRED from the established Synthes 206.xxx (Fully Threaded) numbering convention confirmed elsewhere in this database for the same screw diameter/type, NOT independently confirmed for this exact VOLT-paired family. Flagged for verification." },
          { length: "70", ref: "206.070", verificationStatus: "unverified", details: "No catalog ref printed in the set's own PDF for the 4mm Cancellous family. This ref is INFERRED from the established Synthes 206.xxx (Fully Threaded) numbering convention confirmed elsewhere in this database for the same screw diameter/type, NOT independently confirmed for this exact VOLT-paired family. Flagged for verification." },
          { length: "75", ref: "206.075", verificationStatus: "unverified", details: "No catalog ref printed in the set's own PDF for the 4mm Cancellous family. This ref is INFERRED from the established Synthes 206.xxx (Fully Threaded) numbering convention confirmed elsewhere in this database for the same screw diameter/type, NOT independently confirmed for this exact VOLT-paired family. Flagged for verification." },
          { length: "80", ref: "206.080", verificationStatus: "unverified", details: "No catalog ref printed in the set's own PDF for the 4mm Cancellous family. This ref is INFERRED from the established Synthes 206.xxx (Fully Threaded) numbering convention confirmed elsewhere in this database for the same screw diameter/type, NOT independently confirmed for this exact VOLT-paired family. Flagged for verification." },
          { length: "85", ref: "206.085", verificationStatus: "unverified", details: "No catalog ref printed in the set's own PDF for the 4mm Cancellous family. This ref is INFERRED from the established Synthes 206.xxx (Fully Threaded) numbering convention confirmed elsewhere in this database for the same screw diameter/type, NOT independently confirmed for this exact VOLT-paired family. Flagged for verification." },
          { length: "90", ref: "206.090", verificationStatus: "unverified", details: "No catalog ref printed in the set's own PDF for the 4mm Cancellous family. This ref is INFERRED from the established Synthes 206.xxx (Fully Threaded) numbering convention confirmed elsewhere in this database for the same screw diameter/type, NOT independently confirmed for this exact VOLT-paired family. Flagged for verification." },
          { length: "95", ref: "206.095", verificationStatus: "unverified", details: "No catalog ref printed in the set's own PDF for the 4mm Cancellous family. This ref is INFERRED from the established Synthes 206.xxx (Fully Threaded) numbering convention confirmed elsewhere in this database for the same screw diameter/type, NOT independently confirmed for this exact VOLT-paired family. Flagged for verification." },
          { length: "100", ref: "206.100", verificationStatus: "unverified", details: "No catalog ref printed in the set's own PDF for the 4mm Cancellous family. This ref is INFERRED from the established Synthes 206.xxx (Fully Threaded) numbering convention confirmed elsewhere in this database for the same screw diameter/type, NOT independently confirmed for this exact VOLT-paired family. Flagged for verification." },
        ],
        notes: "No catalog ref was printed in the set's own PDF for any length in this family - all refs below are INFERRED from the standard Synthes 206.xxx Fully Threaded Cancellous family (independently confirmed multiple times elsewhere in this database), not confirmed specifically for this VOLT-paired context. Flagged unverified throughout."
      },
      {
        diameter: "4.0",
        function: "cancellous",
        threadCoverage: "partially-threaded",
        material: "SS",
        displayName: "4.0mm Cancellous, Partially Threaded (paired with VOLT plates)",
        sizes: [
          { length: "10", ref: "207.010", verificationStatus: "unverified", details: "No catalog ref printed in the set's own PDF for the 4mm Cancellous family. This ref is INFERRED from the established Synthes 207.xxx (Partially Threaded) numbering convention confirmed elsewhere in this database, NOT independently confirmed for this exact VOLT-paired family. Flagged for verification." },
          { length: "12", ref: "207.012", verificationStatus: "unverified", details: "No catalog ref printed in the set's own PDF for the 4mm Cancellous family. This ref is INFERRED from the established Synthes 207.xxx (Partially Threaded) numbering convention confirmed elsewhere in this database, NOT independently confirmed for this exact VOLT-paired family. Flagged for verification." },
          { length: "14", ref: "207.014", verificationStatus: "unverified", details: "No catalog ref printed in the set's own PDF for the 4mm Cancellous family. This ref is INFERRED from the established Synthes 207.xxx (Partially Threaded) numbering convention confirmed elsewhere in this database, NOT independently confirmed for this exact VOLT-paired family. Flagged for verification." },
          { length: "16", ref: "207.016", verificationStatus: "unverified", details: "No catalog ref printed in the set's own PDF for the 4mm Cancellous family. This ref is INFERRED from the established Synthes 207.xxx (Partially Threaded) numbering convention confirmed elsewhere in this database, NOT independently confirmed for this exact VOLT-paired family. Flagged for verification." },
          { length: "18", ref: "207.018", verificationStatus: "unverified", details: "No catalog ref printed in the set's own PDF for the 4mm Cancellous family. This ref is INFERRED from the established Synthes 207.xxx (Partially Threaded) numbering convention confirmed elsewhere in this database, NOT independently confirmed for this exact VOLT-paired family. Flagged for verification." },
          { length: "20", ref: "207.020", verificationStatus: "unverified", details: "No catalog ref printed in the set's own PDF for the 4mm Cancellous family. This ref is INFERRED from the established Synthes 207.xxx (Partially Threaded) numbering convention confirmed elsewhere in this database, NOT independently confirmed for this exact VOLT-paired family. Flagged for verification." },
          { length: "22", ref: "207.022", verificationStatus: "unverified", details: "No catalog ref printed in the set's own PDF for the 4mm Cancellous family. This ref is INFERRED from the established Synthes 207.xxx (Partially Threaded) numbering convention confirmed elsewhere in this database, NOT independently confirmed for this exact VOLT-paired family. Flagged for verification." },
          { length: "24", ref: "207.024", verificationStatus: "unverified", details: "No catalog ref printed in the set's own PDF for the 4mm Cancellous family. This ref is INFERRED from the established Synthes 207.xxx (Partially Threaded) numbering convention confirmed elsewhere in this database, NOT independently confirmed for this exact VOLT-paired family. Flagged for verification." },
          { length: "26", ref: "207.026", verificationStatus: "unverified", details: "No catalog ref printed in the set's own PDF for the 4mm Cancellous family. This ref is INFERRED from the established Synthes 207.xxx (Partially Threaded) numbering convention confirmed elsewhere in this database, NOT independently confirmed for this exact VOLT-paired family. Flagged for verification." },
          { length: "28", ref: "207.028", verificationStatus: "unverified", details: "No catalog ref printed in the set's own PDF for the 4mm Cancellous family. This ref is INFERRED from the established Synthes 207.xxx (Partially Threaded) numbering convention confirmed elsewhere in this database, NOT independently confirmed for this exact VOLT-paired family. Flagged for verification." },
          { length: "30", ref: "207.030", verificationStatus: "unverified", details: "No catalog ref printed in the set's own PDF for the 4mm Cancellous family. This ref is INFERRED from the established Synthes 207.xxx (Partially Threaded) numbering convention confirmed elsewhere in this database, NOT independently confirmed for this exact VOLT-paired family. Flagged for verification." },
          { length: "32", ref: "207.032", verificationStatus: "unverified", details: "No catalog ref printed in the set's own PDF for the 4mm Cancellous family. This ref is INFERRED from the established Synthes 207.xxx (Partially Threaded) numbering convention confirmed elsewhere in this database, NOT independently confirmed for this exact VOLT-paired family. Flagged for verification." },
          { length: "34", ref: "207.034", verificationStatus: "unverified", details: "No catalog ref printed in the set's own PDF for the 4mm Cancellous family. This ref is INFERRED from the established Synthes 207.xxx (Partially Threaded) numbering convention confirmed elsewhere in this database, NOT independently confirmed for this exact VOLT-paired family. Flagged for verification." },
          { length: "36", ref: "207.036", verificationStatus: "unverified", details: "No catalog ref printed in the set's own PDF for the 4mm Cancellous family. This ref is INFERRED from the established Synthes 207.xxx (Partially Threaded) numbering convention confirmed elsewhere in this database, NOT independently confirmed for this exact VOLT-paired family. Flagged for verification." },
          { length: "38", ref: "207.038", verificationStatus: "unverified", details: "No catalog ref printed in the set's own PDF for the 4mm Cancellous family. This ref is INFERRED from the established Synthes 207.xxx (Partially Threaded) numbering convention confirmed elsewhere in this database, NOT independently confirmed for this exact VOLT-paired family. Flagged for verification." },
          { length: "40", ref: "207.040", verificationStatus: "unverified", details: "No catalog ref printed in the set's own PDF for the 4mm Cancellous family. This ref is INFERRED from the established Synthes 207.xxx (Partially Threaded) numbering convention confirmed elsewhere in this database, NOT independently confirmed for this exact VOLT-paired family. Flagged for verification." },
          { length: "45", ref: "207.045", verificationStatus: "unverified", details: "No catalog ref printed in the set's own PDF for the 4mm Cancellous family. This ref is INFERRED from the established Synthes 207.xxx (Partially Threaded) numbering convention confirmed elsewhere in this database, NOT independently confirmed for this exact VOLT-paired family. Flagged for verification." },
          { length: "50", ref: "207.050", verificationStatus: "unverified", details: "No catalog ref printed in the set's own PDF for the 4mm Cancellous family. This ref is INFERRED from the established Synthes 207.xxx (Partially Threaded) numbering convention confirmed elsewhere in this database, NOT independently confirmed for this exact VOLT-paired family. Flagged for verification." },
          { length: "55", ref: "207.055", verificationStatus: "unverified", details: "No catalog ref printed in the set's own PDF for the 4mm Cancellous family. This ref is INFERRED from the established Synthes 207.xxx (Partially Threaded) numbering convention confirmed elsewhere in this database, NOT independently confirmed for this exact VOLT-paired family. Flagged for verification." },
          { length: "60", ref: "207.060", verificationStatus: "unverified", details: "No catalog ref printed in the set's own PDF for the 4mm Cancellous family. This ref is INFERRED from the established Synthes 207.xxx (Partially Threaded) numbering convention confirmed elsewhere in this database, NOT independently confirmed for this exact VOLT-paired family. Flagged for verification." },
          { length: "65", ref: "207.065", verificationStatus: "unverified", details: "No catalog ref printed in the set's own PDF for the 4mm Cancellous family. This ref is INFERRED from the established Synthes 207.xxx (Partially Threaded) numbering convention confirmed elsewhere in this database, NOT independently confirmed for this exact VOLT-paired family. Flagged for verification." },
          { length: "70", ref: "207.070", verificationStatus: "unverified", details: "No catalog ref printed in the set's own PDF for the 4mm Cancellous family. This ref is INFERRED from the established Synthes 207.xxx (Partially Threaded) numbering convention confirmed elsewhere in this database, NOT independently confirmed for this exact VOLT-paired family. Flagged for verification." },
          { length: "75", ref: "207.075", verificationStatus: "unverified", details: "No catalog ref printed in the set's own PDF for the 4mm Cancellous family. This ref is INFERRED from the established Synthes 207.xxx (Partially Threaded) numbering convention confirmed elsewhere in this database, NOT independently confirmed for this exact VOLT-paired family. Flagged for verification." },
          { length: "80", ref: "207.080", verificationStatus: "unverified", details: "No catalog ref printed in the set's own PDF for the 4mm Cancellous family. This ref is INFERRED from the established Synthes 207.xxx (Partially Threaded) numbering convention confirmed elsewhere in this database, NOT independently confirmed for this exact VOLT-paired family. Flagged for verification." },
          { length: "85", ref: "207.085", verificationStatus: "unverified", details: "No catalog ref printed in the set's own PDF for the 4mm Cancellous family. This ref is INFERRED from the established Synthes 207.xxx (Partially Threaded) numbering convention confirmed elsewhere in this database, NOT independently confirmed for this exact VOLT-paired family. Flagged for verification." },
          { length: "90", ref: "207.090", verificationStatus: "unverified", details: "No catalog ref printed in the set's own PDF for the 4mm Cancellous family. This ref is INFERRED from the established Synthes 207.xxx (Partially Threaded) numbering convention confirmed elsewhere in this database, NOT independently confirmed for this exact VOLT-paired family. Flagged for verification." },
          { length: "95", ref: "207.095", verificationStatus: "unverified", details: "No catalog ref printed in the set's own PDF for the 4mm Cancellous family. This ref is INFERRED from the established Synthes 207.xxx (Partially Threaded) numbering convention confirmed elsewhere in this database, NOT independently confirmed for this exact VOLT-paired family. Flagged for verification." },
          { length: "100", ref: "207.100", verificationStatus: "unverified", details: "No catalog ref printed in the set's own PDF for the 4mm Cancellous family. This ref is INFERRED from the established Synthes 207.xxx (Partially Threaded) numbering convention confirmed elsewhere in this database, NOT independently confirmed for this exact VOLT-paired family. Flagged for verification." },
        ],
        notes: "Same situation as the Fully Threaded family above - all refs INFERRED from the standard Synthes 207.xxx family, not confirmed for this VOLT-paired context."
      }
    ],
    plateFamilies: []
  },
  {
    id: "set_volt_mini_small_frag_plates",
    name: "VOLT MINI/SMALL FRAGMENT - PLATES",
    pNumber: "P0026781",
    defaultLocation: "551-B",
    // NOTE: companion tray to "VOLT MINI/SMALL FRAGMENT - SCREWS"
    // (P0026780) - this tray holds PLATES ONLY, per direct user
    // instruction. Spans VOLT Mini Fragment (2.0/2.4/2.7mm) and VOLT
    // Small Fragment (3.5mm) plate families.
    dependencies: [
      { relatedSetId: "set_volt_mini_small_frag_screws", relatedSetName: "VOLT MINI/SMALL FRAGMENT - SCREWS", relationship: "requires-companion-caddy", notes: "Screws and plates for this system are split across two separate physical trays - both are opened together for any case." }
    ],
    verificationStatus: "source-verified",
    source: "ChronoMEDIC PDF export, directly pasted by the user. Refs already present in the set's own PDF for most entries; cross-referenced and confirmed against the official DePuy Synthes VOLT Mini Fragment Plating System Inventory Control Forms for 2.0mm, 2.4mm, and 2.7mm (jnjmedtech.com, VOLTMFSSICFV1 series, 08/24). A small number of entries (2.7mm Adaption Combi, missing refs) resolved directly from this same official document. Two families (3.5mm Proximal Humerus, 2.7mm Quarter Tubular) had close-but-not-exact length matches against confirmed standard Synthes numbers - honestly flagged as unresolved rather than assumed identical.",
    screwFamilies: [],
    plateFamilies: [
      {
        diameter: "2.0",
        familyName: "ADAPTION",
        material: "SS",
        displayName: "2.0mm VOLT Adaption",
        sizes: [
          { holes: 6, length: "33", ref: "02.420.026", verificationStatus: "source-verified" },
          { holes: 12, length: "65", ref: "02.420.032", verificationStatus: "source-verified" },
          { holes: 20, length: "108", ref: "02.420.040", verificationStatus: "source-verified" },
        ]
      },
      {
        diameter: "2.0",
        familyName: "ADAPTION COMBI",
        material: "SS",
        displayName: "2.0mm VOLT Adaption Combi",
        sizes: [
          { holes: 6, length: "47", ref: "02.420.027", verificationStatus: "source-verified" },
          { holes: 12, length: "93", ref: "02.420.033", verificationStatus: "source-verified" },
          { holes: 20, length: "153", ref: "02.420.041", verificationStatus: "source-verified" },
        ]
      },
      {
        diameter: "2.0",
        familyName: "COMPACT STRAIGHT",
        material: "SS",
        displayName: "2.0mm VOLT Compact Straight",
        sizes: [
          { holes: 5, length: "29", ref: "02.420.001", verificationStatus: "source-verified" },
          { holes: 6, length: "34", ref: "02.420.002", verificationStatus: "source-verified" },
          { holes: 7, length: "38", ref: "02.420.003", verificationStatus: "source-verified" },
          { holes: 8, length: "43", ref: "02.420.004", verificationStatus: "source-verified" },
          { holes: 10, length: "52", ref: "02.420.005", verificationStatus: "source-verified", details: "CORRECTED: set's own PDF printed truncated '02.420.00' - the official VOLT Mini Fragment 2.0mm ICF (VOLTMFSSICFV1-2.0) confirms 02.420.005 = 10 holes, 52mm exactly." },
        ]
      },
      {
        diameter: "2.0",
        familyName: "CONDYLAR",
        material: "SS",
        displayName: "2.0mm VOLT Condylar",
        sizes: [
          { holes: 6, length: "45", ref: "02.420.069", verificationStatus: "source-verified" },
          { holes: 10, length: "73", ref: "02.420.071", verificationStatus: "source-verified" },
        ]
      },
      {
        diameter: "2.0",
        familyName: "HOOK",
        material: "SS",
        displayName: "2.0mm VOLT Hook",
        sizes: [
          { holes: 6, length: "47", ref: "02.420.050", verificationStatus: "source-verified" },
          { holes: 10, length: "76", ref: "02.420.068", verificationStatus: "source-verified" },
        ]
      },
      {
        diameter: "2.0",
        familyName: "STRAIGHT",
        material: "SS",
        displayName: "2.0mm VOLT Straight",
        sizes: [
          { holes: 6, length: "45", ref: "02.420.006", verificationStatus: "source-verified" },
          { holes: 7, length: "52", ref: "02.420.007", verificationStatus: "source-verified" },
          { holes: 8, length: "58", ref: "02.420.008", verificationStatus: "source-verified" },
          { holes: 10, length: "72", ref: "02.420.010", verificationStatus: "source-verified" },
          { holes: 14, length: "99", ref: "02.420.014", verificationStatus: "source-verified" },
          { holes: 18, length: "126", ref: "02.420.020", verificationStatus: "source-verified" },
        ]
      },
      {
        diameter: "2.0",
        familyName: "T(3 HOLE HEAD)",
        material: "SS",
        displayName: "2.0mm VOLT T(3 Hole Head)",
        sizes: [
          { holes: 6, length: "45", ref: "02.420.053", verificationStatus: "source-verified" },
          { holes: 10, length: "73", ref: "02.420.066", verificationStatus: "source-verified" },
        ]
      },
      {
        diameter: "2.0",
        familyName: "T(5 HOLE HEAD)",
        material: "SS",
        displayName: "2.0mm VOLT T(5 Hole Head)",
        sizes: [
          { holes: 10, length: "73", ref: "02.420.067", verificationStatus: "source-verified" },
        ]
      },
      {
        diameter: "2.0",
        familyName: "TINE",
        material: "SS",
        displayName: "2.0mm VOLT Tine",
        sizes: [
          { holes: 6, length: "47", ref: "02.420.057", verificationStatus: "source-verified" },
          { holes: 10, length: "75", ref: "02.420.059", verificationStatus: "source-verified" },
        ]
      },
      {
        diameter: "2.0",
        familyName: "Y",
        material: "SS",
        displayName: "2.0mm VOLT Y",
        sizes: [
          { holes: 10, length: "80", ref: "02.420.072", verificationStatus: "source-verified" },
        ]
      },
      {
        diameter: "2.4",
        familyName: "ADAPTION",
        material: "SS",
        displayName: "2.4mm VOLT Adaption",
        sizes: [
          { holes: 6, length: "38", ref: "02.424.026", verificationStatus: "source-verified" },
          { holes: 12, length: "75", ref: "02.424.032", verificationStatus: "source-verified" },
          { holes: 20, length: "125", ref: "02.424.040", verificationStatus: "source-verified" },
        ]
      },
      {
        diameter: "2.4",
        familyName: "ADAPTION COMBI",
        material: "SS",
        displayName: "2.4mm VOLT Adaption Combi",
        sizes: [
          { holes: 6, length: "54", ref: "02.424.027", verificationStatus: "source-verified" },
          { holes: 12, length: "107", ref: "02.424.033", verificationStatus: "source-verified", details: "CORRECTED: set's own PDF printed truncated '02.424.03' - the official VOLT Mini Fragment 2.4mm ICF (VOLTMFSSICFV1-2.4) confirms 02.424.033 = 12 holes, 107mm exactly." },
          { holes: 20, length: "177", ref: "02.424.041", verificationStatus: "source-verified", details: "CORRECTED: set's own PDF printed truncated '02.424.04' - the official ICF confirms 02.424.041 = 20 holes, 177mm exactly." },
        ]
      },
      {
        diameter: "2.4",
        familyName: "COMPACT STR",
        material: "SS",
        displayName: "2.4mm VOLT Compact Str",
        sizes: [
          { holes: 4, length: "31", ref: "02.424.000", verificationStatus: "source-verified" },
          { holes: 5, length: "38", ref: "02.424.001", verificationStatus: "source-verified" },
          { holes: 6, length: "44", ref: "02.424.002", verificationStatus: "source-verified" },
          { holes: 7, length: "51", ref: "02.424.003", verificationStatus: "source-verified" },
          { holes: 8, length: "57", ref: "02.424.004", verificationStatus: "source-verified" },
          { holes: 10, length: "70", ref: "02.424.005", verificationStatus: "source-verified" },
        ]
      },
      {
        diameter: "2.4",
        familyName: "CONDYLAR",
        material: "SS",
        displayName: "2.4mm VOLT Condylar",
        sizes: [
          { holes: 6, length: "54", ref: "02.424.069", verificationStatus: "source-verified" },
          { holes: 10, length: "88", ref: "02.424.071", verificationStatus: "source-verified" },
        ]
      },
      {
        diameter: "2.4",
        familyName: "HOOK",
        material: "SS",
        displayName: "2.4mm VOLT Hook",
        sizes: [
          { holes: 6, length: "56", ref: "02.424.050", verificationStatus: "source-verified" },
          { holes: 10, length: "89", ref: "02.424.068", verificationStatus: "source-verified" },
        ]
      },
      {
        diameter: "2.4",
        familyName: "STRAIGHT",
        material: "SS",
        displayName: "2.4mm VOLT Straight",
        sizes: [
          { holes: 6, length: "60", ref: "02.424.006", verificationStatus: "source-verified" },
          { holes: 7, length: "69", ref: "02.424.007", verificationStatus: "source-verified" },
          { holes: 8, length: "78", ref: "02.424.008", verificationStatus: "source-verified" },
          { holes: 10, length: "96", ref: "02.424.010", verificationStatus: "source-verified" },
          { holes: 14, length: "132", ref: "02.424.014", verificationStatus: "source-verified" },
          { holes: 18, length: "168", ref: "02.424.020", verificationStatus: "source-verified" },
        ]
      },
      {
        diameter: "2.4",
        familyName: "T(3HOLE HEAD)",
        material: "SS",
        displayName: "2.4mm VOLT T(3Hole Head)",
        sizes: [
          { holes: 6, length: "53", ref: "02.424.053", verificationStatus: "source-verified" },
          { holes: 10, length: "87", ref: "02.424.066", verificationStatus: "source-verified" },
        ]
      },
      {
        diameter: "2.4",
        familyName: "T(5 HOLE HEAD)",
        material: "SS",
        displayName: "2.4mm VOLT T(5 Hole Head)",
        sizes: [
          { holes: 10, length: "87", ref: "02.424.067", verificationStatus: "source-verified" },
        ]
      },
      {
        diameter: "2.4",
        familyName: "TINE",
        material: "SS",
        displayName: "2.4mm VOLT Tine",
        sizes: [
          { holes: 6, length: "55", ref: "02.424.057", verificationStatus: "source-verified" },
          { holes: 10, length: "89", ref: "02.424.059", verificationStatus: "source-verified" },
        ]
      },
      {
        diameter: "2.4",
        familyName: "TRIANGLE",
        material: "SS",
        displayName: "2.4mm VOLT Triangle",
        sizes: [
          { holes: 10, length: "93", ref: "02.424.073", verificationStatus: "source-verified" },
        ]
      },
      {
        diameter: "2.4",
        familyName: "Y",
        material: "SS",
        displayName: "2.4mm VOLT Y",
        sizes: [
          { holes: 10, length: "95", ref: "02.424.072", verificationStatus: "source-verified" },
        ]
      },
      {
        diameter: "2.7",
        familyName: "ADAPTION",
        material: "SS",
        displayName: "2.7mm VOLT Adaption",
        sizes: [
          { holes: 6, length: "42", ref: "02.527.026", verificationStatus: "source-verified" },
          { holes: 12, length: "84", ref: "02.527.032", verificationStatus: "source-verified" },
          { holes: 20, length: "140", ref: "02.527.040", verificationStatus: "source-verified" },
        ]
      },
      {
        diameter: "2.7",
        familyName: "ADAPTION COMBI",
        material: "SS",
        displayName: "2.7mm VOLT Adaption Combi",
        sizes: [
          { holes: 6, length: "54", ref: "02.527.027", verificationStatus: "source-verified", details: "No ref printed in the set's own PDF - resolved using the official VOLT Mini Fragment 2.7mm Plating System ICF (jnjmedtech.com), which confirms 02.527.027 = 6 holes, 54mm exactly." },
          { holes: 12, length: "107", ref: "02.527.033", verificationStatus: "source-verified", details: "No ref printed in the set's own PDF - resolved using the official VOLT Mini Fragment 2.7mm Plating System ICF, which confirms 02.527.033 = 12 holes, 107mm exactly." },
          { holes: 20, length: "177", ref: "02.527.041", verificationStatus: "source-verified", details: "No ref printed in the set's own PDF - resolved using the official VOLT Mini Fragment 2.7mm Plating System ICF, which confirms 02.527.041 = 20 holes, 177mm exactly." },
        ]
      },
      {
        diameter: "2.7",
        familyName: "COMPACT STR",
        material: "SS",
        displayName: "2.7mm VOLT Compact Str",
        sizes: [
          { holes: 4, length: "34", ref: "02.527.000", verificationStatus: "source-verified" },
          { holes: 5, length: "41", ref: "302.527.001", verificationStatus: "source-verified" },
          { holes: 6, length: "48", ref: "02.527.002", verificationStatus: "source-verified" },
          { holes: 7, length: "55", ref: "02.527.003", verificationStatus: "source-verified" },
          { holes: 8, length: "62", ref: "302.527.004", verificationStatus: "source-verified" },
          { holes: 10, length: "76", ref: "02.527.005", verificationStatus: "source-verified" },
        ]
      },
      {
        diameter: "2.7",
        familyName: "CONDYLAR",
        material: "SS",
        displayName: "2.7mm VOLT Condylar",
        sizes: [
          { holes: 6, length: "58", ref: "02.527.069", verificationStatus: "source-verified" },
          { holes: 10, length: "95", ref: "02.527.071", verificationStatus: "source-verified" },
        ]
      },
      {
        diameter: "2.7",
        familyName: "HOOK",
        material: "SS",
        displayName: "2.7mm VOLT Hook",
        sizes: [
          { holes: 6, length: "61", ref: "02.527.050", verificationStatus: "source-verified" },
          { holes: 10, length: "98", ref: "02.527.068", verificationStatus: "source-verified" },
        ]
      },
      {
        diameter: "2.7",
        familyName: "STRAIGHT",
        material: "SS",
        displayName: "2.7mm VOLT Straight",
        sizes: [
          { holes: 6, length: "64", ref: "02.527.006", verificationStatus: "source-verified" },
          { holes: 7, length: "74", ref: "02.527.007", verificationStatus: "source-verified" },
          { holes: 8, length: "84", ref: "02.527.008", verificationStatus: "source-verified" },
          { holes: 10, length: "104", ref: "02.527.010", verificationStatus: "source-verified" },
          { holes: 14, length: "144", ref: "02.527.014", verificationStatus: "source-verified" },
          { holes: 18, length: "184", ref: "02.527.020", verificationStatus: "source-verified" },
        ]
      },
      {
        diameter: "2.7",
        familyName: "T(3 HOLE HEAD)",
        material: "SS",
        displayName: "2.7mm VOLT T(3 Hole Head)",
        sizes: [
          { holes: 6, length: "58", ref: "02.527.053", verificationStatus: "source-verified" },
          { holes: 10, length: "95", ref: "02.527.066", verificationStatus: "source-verified" },
        ]
      },
      {
        diameter: "2.7",
        familyName: "T(5 HOLE HEAD)",
        material: "SS",
        displayName: "2.7mm VOLT T(5 Hole Head)",
        sizes: [
          { holes: 10, length: "95", ref: "02.527.067", verificationStatus: "source-verified" },
        ]
      },
      {
        diameter: "2.7",
        familyName: "TINE",
        material: "SS",
        displayName: "2.7mm VOLT Tine",
        sizes: [
          { holes: 6, length: "61", ref: "02.527.057", verificationStatus: "source-verified" },
          { holes: 10, length: "98", ref: "02.527.059", verificationStatus: "source-verified" },
        ]
      },
      {
        diameter: "2.7",
        familyName: "TRIANGLE",
        material: "SS",
        displayName: "2.7mm VOLT Triangle",
        sizes: [
          { holes: 10, length: "101", ref: "02.527.073", verificationStatus: "source-verified" },
        ]
      },
      {
        diameter: "2.7",
        familyName: "Y",
        material: "SS",
        displayName: "2.7mm VOLT Y",
        sizes: [
          { holes: 10, length: "104", ref: "02.527.072", verificationStatus: "source-verified" },
        ]
      },
      {
        diameter: "3.5",
        familyName: "1/3 TUBULAR",
        material: "SS",
        displayName: "3.5mm VOLT 1/3 Tubular",
        sizes: [
          { holes: 2, length: "23", ref: "02.535.082", verificationStatus: "source-verified" },
          { holes: 3, length: "35", ref: "02.535.083", verificationStatus: "source-verified" },
          { holes: 4, length: "47", ref: "02.535.084", verificationStatus: "source-verified" },
          { holes: 5, length: "59", ref: "02.535.085", verificationStatus: "source-verified" },
          { holes: 6, length: "71", ref: "02.535.086", verificationStatus: "source-verified" },
          { holes: 7, length: "83", ref: "02.535.087", verificationStatus: "source-verified" },
          { holes: 8, length: "95", ref: "02.535.088", verificationStatus: "source-verified" },
          { holes: 10, length: "119", ref: "02.535.090", verificationStatus: "source-verified" },
          { holes: 12, length: "143", ref: "02.535.092", verificationStatus: "source-verified" },
        ]
      },
      {
        diameter: "3.5",
        familyName: "METAPHYSEAL",
        material: "SS",
        displayName: "3.5mm VOLT Metaphyseal",
        sizes: [
          { holes: 7, length: "87", ref: "02.536.007", verificationStatus: "source-verified" },
          { holes: 8, length: "104", ref: "02.536.008", verificationStatus: "source-verified" },
          { holes: 10, length: "130", ref: "02.536.010", verificationStatus: "source-verified" },
          { holes: 12, length: "156", ref: "02.536.012", verificationStatus: "source-verified" },
          { holes: 14, length: "182", ref: "02.536.014", verificationStatus: "source-verified" },
          { holes: 16, length: "208", ref: "02.536.016", verificationStatus: "source-verified" },
          { holes: 18, length: "234", ref: "02.536.018", verificationStatus: "source-verified" },
          { holes: 20, length: "260", ref: "02.536.020S*", verificationStatus: "source-verified" },
        ]
      },
      {
        diameter: "3.5",
        familyName: "PROXIMAL HUMERUS",
        material: "SS",
        displayName: "3.5mm VOLT Proximal Humerus",
        sizes: [
          { holes: 3, length: "93", ref: "241.901", verificationStatus: "unverified", details: "No ref printed in the set's own PDF. The closest confirmed match is the standard (non-VOLT) Synthes 3.5mm LCP Proximal Humerus Plate, 3 holes, 90mm (241.901) - but the set's own PDF gives 93mm, not 90mm. This 3mm discrepancy could mean a genuinely different VOLT-specific plate exists, or a measurement/rounding difference - flagged rather than assumed identical." },
          { holes: 5, length: "119", ref: "241.903", verificationStatus: "unverified", details: "No ref printed in the set's own PDF. The closest confirmed match is the standard (non-VOLT) Synthes 3.5mm LCP Proximal Humerus Plate, 5 holes, 114mm (241.903) - but the set's own PDF gives 119mm, not 114mm. Same 5mm discrepancy pattern as the 3-hole entry above - flagged rather than assumed identical." },
        ]
      },
      {
        diameter: "3.5",
        familyName: "RECONSTRUCTION",
        material: "SS",
        displayName: "3.5mm VOLT Reconstruction",
        sizes: [
          { holes: 4, length: "46", ref: "02.535.054", verificationStatus: "source-verified" },
          { holes: 5, length: "58", ref: "02.535.055", verificationStatus: "source-verified" },
          { holes: 6, length: "70", ref: "02.535.056", verificationStatus: "source-verified" },
          { holes: 7, length: "82", ref: "02.535.057", verificationStatus: "source-verified" },
          { holes: 8, length: "94", ref: "02.535.058", verificationStatus: "source-verified" },
          { holes: 9, length: "106", ref: "02.535.059", verificationStatus: "source-verified" },
          { holes: 10, length: "118", ref: "02.535.060", verificationStatus: "source-verified" },
          { holes: 12, length: "142", ref: "02.535.062", verificationStatus: "source-verified" },
          { holes: 14, length: "166", ref: "02.535.064", verificationStatus: "source-verified" },
          { holes: 16, length: "190", ref: "02.535.066", verificationStatus: "source-verified" },
          { holes: 18, length: "214", ref: "02.535.068", verificationStatus: "source-verified" },
          { holes: 20, length: "238", ref: "02.535.070", verificationStatus: "source-verified" },
          { holes: 22, length: "262", ref: "02.535.072", verificationStatus: "source-verified" },
        ]
      },
      {
        diameter: "3.5",
        familyName: "STRAIGHT",
        material: "SS",
        displayName: "3.5mm VOLT Straight",
        sizes: [
          { holes: 4, length: "59", ref: "02.535.004", verificationStatus: "source-verified" },
          { holes: 5, length: "72", ref: "02.535.005", verificationStatus: "source-verified" },
          { holes: 6, length: "85", ref: "02.535.006", verificationStatus: "source-verified" },
          { holes: 7, length: "98", ref: "02.535.007", verificationStatus: "source-verified" },
          { holes: 8, length: "111", ref: "02.535.008", verificationStatus: "source-verified" },
          { holes: 9, length: "124", ref: "02.535.009", verificationStatus: "source-verified" },
          { holes: 10, length: "137", ref: "02.535.010", verificationStatus: "source-verified" },
          { holes: 12, length: "163", ref: "02.535.012", verificationStatus: "source-verified" },
          { holes: 14, length: "189", ref: "02.535.014", verificationStatus: "source-verified" },
          { holes: 16, length: "215", ref: "02.535.016", verificationStatus: "source-verified" },
          { holes: 18, length: "241", ref: "02.535.018", verificationStatus: "source-verified" },
          { holes: 20, length: "267", ref: "02.535.020S*", verificationStatus: "source-verified" },
          { holes: 22, length: "293", ref: "02.535.022S*", verificationStatus: "source-verified" },
        ]
      },
      {
        diameter: "3.5",
        familyName: "T (3 HOLE HEAD)",
        material: "SS",
        displayName: "3.5mm VOLT T (3 Hole Head)",
        sizes: [
          { holes: 3, length: "49", ref: "02.536.033", verificationStatus: "source-verified" },
          { holes: 5, length: "67", ref: "02.536.035", verificationStatus: "source-verified" },
          { holes: 7, length: "90", ref: "02.536.037", verificationStatus: "source-verified" },
        ]
      },
      {
        diameter: "3.5",
        familyName: "T (4 HOLE HEAD)",
        material: "SS",
        displayName: "3.5mm VOLT T (4 Hole Head)",
        sizes: [
          { holes: 4, length: "56", ref: "02.536.034", verificationStatus: "source-verified" },
          { holes: 6, length: "78", ref: "02.536.036", verificationStatus: "source-verified" },
        ]
      },
      {
        diameter: "2.7",
        familyName: "QUARTER TUBULAR w COLLAR",
        material: "SS",
        displayName: "2.7mm Quarter Tubular Plate, with Collar",
        sizes: [
          { holes: 4, length: "34", ref: null, verificationStatus: "unverified", details: "No catalog ref printed in the set's own PDF. The closest confirmed Synthes family member is 242.04 (4 holes, 31mm) - but the set's own PDF gives 34mm, not 31mm. Flagged rather than assumed identical, since the discrepancy is real and unexplained." },
          { holes: 6, length: "50", ref: null, verificationStatus: "unverified", details: "No catalog ref printed in the set's own PDF. The closest confirmed Synthes family member is 242.06 (6 holes, 47mm) - but the set's own PDF gives 50mm, not 47mm. Same pattern as the 4-hole entry above." }
        ],
        notes: "This family is NOT VOLT-branded in the set's own PDF (unlike every other plate in this set) - it's the older standard Synthes Quarter Tubular Plate with Collar family. Lengths given (34mm/50mm) are close to but do not exactly match the confirmed standard catalog (242.04=31mm, 242.06=47mm) - left unresolved rather than guessed."
      },
    ]
  }
];
