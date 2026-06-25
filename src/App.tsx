import React, { useState, useMemo, useEffect } from "react";
import { db, handleFirestoreError, OperationType } from "./firebase";
import { collection, onSnapshot, doc, setDoc, deleteDoc } from "firebase/firestore";
import {
  DECORATED_SETS,
  getCustomLocationsMap,
  saveSetLocation,
  getReorderList as getSavedReorders,
  saveReorderList as saveAllReorders,
  addReorderItem as addSetReorderItem,
  removeReorderItem as removeSetReorderItem,
  clearReorderList as clearAllReorders,
  getArchivedOrders,
  saveArchivedOrders,
  getOnSiteSetsMap,
  saveOnSiteSetsMap,
  getLocalVerifications,
  saveLocalVerifications,
  computeSetVerificationStatus,
  getContaminationAnalysis,
  lookupRef,
} from "./data/decoratedSets";
import { checkPhi, describeFindings, scrubObject, assertTransmitSafe } from "./data/phiGuard";
import { DISPATCH_LABEL } from "./data/dispatchConfig";
import { VERIFICATION_REPORT_MD } from "./data/verificationReport";
import { TraumaSet, Screw, ReorderItem, ArchivedOrder, FlaggedIssue, OutOfStockAlert, VerificationStatus } from "./types";
import { Highlight } from "./components/Highlight";
import { SetDetail } from "./components/SetDetail";
import { VerificationBadge } from "./components/VerificationBadge";
import { useEditUnlocked } from "./components/PasswordGate";
import {
  Search,
  X,
  Layers,
  Shield,
  FolderOpen,
  LayoutGrid,
  Table,
  SlidersHorizontal,
  Bookmark,
  Hospital,
  AlertTriangle,
  FileCheck,
  Stethoscope,
  Clock,
  MapPin,
  CalendarCheck,
  Wrench,
  Plus,
  Minus,
  ClipboardList,
  Trash2,
  Check,
  PlusCircle,
  Copy,
  Phone,
  PhoneCall,
  Building,
  Mail,
  Lock,
  Unlock,
  ShieldCheck,
  Star,
  ChevronDown,
  Zap,
  MessageSquare,
  RotateCcw,
  Download,
  FileText,
  HelpCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// Helper to classify/filter functional screw categories
function matchesScrewTypeFilter(
  screwType: string | undefined | null,
  filter: "all" | "Cannulated" | "Locking" | "Cortex" | "Cancellous",
): boolean {
  if (filter === "all") return true;
  if (!screwType) return false;
  const typeLower = screwType.toLowerCase();
  if (filter === "Cannulated") {
    return typeLower.includes("cannulated");
  }
  if (filter === "Locking") {
    return typeLower.includes("locking");
  }
  if (filter === "Cortex") {
    return typeLower.includes("cortex") || typeLower.includes("cortical");
  }
  if (filter === "Cancellous") {
    return typeLower.includes("cancellous");
  }
  return true;
}

// Extract screw size by parsing the numeric prefix of the screw type
function getScrewSize(screwType: string | undefined | null): string {
  if (!screwType) return "Other";
  const match = screwType.match(/^(\d+(\.\d+)?)/);
  if (match) {
    const num = parseFloat(match[1]);
    if (Number.isInteger(num)) {
      return num.toFixed(1);
    }
    return match[1];
  }
  return "Other";
}

// Helper to filter by screw size
function matchesScrewSizeFilter(screwType: string | undefined | null, filter: string): boolean {
  if (filter === "all") return true;
  if (!screwType) return false;
  return getScrewSize(screwType) === filter;
}

// Parses diameter and hole count out of a raw plate line, e.g.
// "PLATES - 3.5MM CURVED BROAD LCP 10 HOLES #02.161.270" -> { diameter: "3.5", holes: 10 }.
// Returns nulls for fields that can't be found rather than guessing - many
// plate lines (angle-based blade plates, DHS barrel plates) genuinely have
// no diameter or hole count to extract, and treating "not found" as "0" or
// some default would silently misrepresent the data.
function parsePlateLineForFilter(raw: string): { diameter: string | null; holes: number | null } {
  const body = raw.replace(/#\s*[\w.]+\s*$/, "").replace(/^PLATES?\s*-?\s*/i, "").trim();
  const diaMatch = body.match(/(\d+(?:\.\d+)?)\s*MM/i);
  const diameter = diaMatch ? diaMatch[1] : null;
  const holesMatch = body.match(/(\d+)\s*HOLES?\b/i);
  const holes = holesMatch ? parseInt(holesMatch[1], 10) : null;
  return { diameter, holes };
}
// NOTE: matchesPlateSizeFilter / matchesPlateHoleFilter (diameter and
// hole-count filtering) were removed per direct instruction - "remove plate
// diameter and plate hole count from search strategy." parsePlateLineForFilter
// itself is kept because it's still used to DISPLAY a plate's diameter/hole
// count inline (informational, not a filter control).

// Helper to filter by plate type
function matchesPlateTypeFilter(plates: string[] | undefined, filter: string): boolean {
  if (filter === "all") return true;
  if (!plates || plates.length === 0) return false;
  const f = filter.toLowerCase();
  return plates.some((p) => {
    const pl = p.toLowerCase();
    if (f === "lcp") return pl.includes("lcp") || pl.includes("locking");
    if (f === "dhs") return pl.includes("dhs");
    if (f === "t-plate") {
      return (
        pl.includes("t-plate") ||
        pl.includes("t-pl") ||
        pl.includes("t plate") ||
        pl.includes("l-plate") ||
        pl.includes("l-pl") ||
        pl.includes("l plate") ||
        pl.includes("y-plate") ||
        pl.includes("y-pl") ||
        pl.includes("y plate") ||
        pl.includes("cloverleaf") ||
        pl.includes(", t,") ||
        pl.includes(" t (") ||
        pl.includes(", t ") ||
        pl.includes(" t,") ||
        pl.includes(" y ") ||
        pl.includes(", y,") ||
        /\b(t|l|y)\b/i.test(pl) ||
        /(^|[^a-z])(t|l|y)([^a-z]|$)/i.test(pl) ||
        /(^|[^a-z])(t|l|y)(-|\s)*(pl|plate)/i.test(pl)
      );
    }
    if (f === "tubular") return pl.includes("tubular") || pl.includes("one third");
    if (f === "osteotomy") return pl.includes("osteotomy") || pl.includes("child") || pl.includes("adolescent") || pl.includes("adult") || pl.includes("infant");
    if (f === "pediplates") return pl.includes("pediplates") || pl.includes("i plate") || pl.includes("o plate");
    if (f === "volt") return pl.includes("volt");
    return pl.includes(f);
  });
}

// Parse a range like "10-50" or "6-40" into standard clinical size choices
function getLengthOptions(lengthRange: string, interval?: string, screwType?: string): string[] {
  try {
    const cleanRange = lengthRange.replace(/\s+/g, "");
    if (cleanRange.includes(",")) {
      return cleanRange.split(",");
    }

    const typeLower = screwType?.toLowerCase() || "";
    if (typeLower.includes("volt")) {
      const bounds = cleanRange.split("-");
      if (bounds.length === 2) {
        const start = parseInt(bounds[0], 10);
        const end = parseInt(bounds[1], 10);
        if (!isNaN(start) && !isNaN(end)) {
          const list: string[] = [];
          if (typeLower.includes("2.0")) {
            // 2.0 Volt: 6-20 (1mm step), 22-50 (2mm step)
            for (let l = 6; l <= 20; l += 1) {
              if (l >= start && l <= end) list.push(`${l}`);
            }
            for (let l = 22; l <= 50; l += 2) {
              if (l >= start && l <= end) list.push(`${l}`);
            }
          } else if (typeLower.includes("2.4") || typeLower.includes("2.7")) {
            // 2.4 and 2.7 Volt: 6-20 (1mm step), 22-60 (2mm step), 65-90 (5mm step)
            for (let l = 6; l <= 20; l += 1) {
              if (l >= start && l <= end) list.push(`${l}`);
            }
            for (let l = 22; l <= 60; l += 2) {
              if (l >= start && l <= end) list.push(`${l}`);
            }
            for (let l = 65; l <= 90; l += 5) {
              if (l >= start && l <= end) list.push(`${l}`);
            }
          } else if (typeLower.includes("3.5")) {
            // 3.5 Volt: 10-60 (2mm step), 65-110 (5mm step)
            for (let l = 10; l <= 60; l += 2) {
              if (l >= start && l <= end) list.push(`${l}`);
            }
            for (let l = 65; l <= 110; l += 5) {
              if (l >= start && l <= end) list.push(`${l}`);
            }
          } else if (typeLower.includes("4.0")) {
            // 4.0 Volt: 10-40 (2mm step), 45-100 (5mm step)
            for (let l = 10; l <= 40; l += 2) {
              if (l >= start && l <= end) list.push(`${l}`);
            }
            for (let l = 45; l <= 100; l += 5) {
              if (l >= start && l <= end) list.push(`${l}`);
            }
          } else {
            // Fallback default step 2
            for (let l = start; l <= end; l += 2) {
              list.push(`${l}`);
            }
          }
          return list;
        }
      }
    }

    const bounds = cleanRange.split("-");
    if (bounds.length === 2) {
      const start = parseInt(bounds[0], 10);
      const end = parseInt(bounds[1], 10);
      if (!isNaN(start) && !isNaN(end)) {
        let step = 2; // Default
        const intVal = interval ? interval.toLowerCase() : "";
        if (intVal.includes("5")) step = 5;
        else if (intVal.includes("2")) step = 2;
        else if (intVal.includes("1")) step = 1;
        else if (start >= 50) step = 5;

        const list: string[] = [];
        for (let l = start; l <= end; l += step) {
          list.push(`${l}`);
        }
        if (!list.includes(`${end}`)) {
          list.push(`${end}`);
        }
        return list;
      }
    }
  } catch (e) {
    console.warn("Failed to parse length range", e);
  }
  return lengthRange.split(/[\s,]+/);
}

// Generate realistic Synthes catalog reference numbers which clinical teams use for order replenishment
// NOTE: the VOLT-specific branch below was checked directly against a
// confirmed reconciliation of real catalog numbers (cross-referenced
// against the source PDF and independently verified) and produces correct
// results for 2.0/2.4/2.7/3.5mm Volt screws - kept as-is.
//
// The GENERIC (non-Volt) branch that used to follow it has been REMOVED.
// It generated a plausible-looking number from a guessed pattern (e.g.
// "cannulated screws are usually 208-xxx") that turned out to be wrong -
// direct verification against the official DePuy Synthes catalog showed
// a 7.3mm Fully Threaded Cannulated screw's real family is 209.xxx, not
// 208.xxx, and the generated number for a 50mm screw ("02.208.250") bore
// no resemblance to the real one ("209.650"). Inventing a number that
// LOOKS correct is worse than showing nothing, especially for something
// that feeds real supplier reorder requisitions. Non-Volt screws now
// return a clear placeholder; the field stays editable so staff can enter
// the real, verified number themselves.
function generateCatalogRef(
  screwType: string,
  length: string,
  material: "SS" | "Ti" | "Both",
): string {
  const cleanType = screwType.toLowerCase();

  // Volt-specific exact catalog mapping - VERIFIED correct, keep.
  if (cleanType.includes("volt")) {
    const lenNum = parseInt(length, 10) || 0;
    const isLocking = cleanType.includes("locking");

    if (cleanType.includes("2.0")) {
      const typeCode = "420";
      const suffixCode = isLocking ? "3" : "1";
      const lenStr = `${suffixCode}${lenNum.toString().padStart(2, "0")}`;
      return `02.${typeCode}.${lenStr}`;
    }
    if (cleanType.includes("2.4")) {
      const typeCode = "424";
      const suffixCode = isLocking ? "3" : "1";
      const lenStr = `${suffixCode}${lenNum.toString().padStart(2, "0")}`;
      return `02.${typeCode}.${lenStr}`;
    }
    if (cleanType.includes("2.7")) {
      const typeCode = "527";
      const suffixCode = isLocking ? "3" : "1";
      const lenStr = `${suffixCode}${lenNum.toString().padStart(2, "0")}`;
      return `02.${typeCode}.${lenStr}`;
    }
    if (cleanType.includes("3.5")) {
      const typeCode = "535";
      let suffixCode = "";
      if (isLocking) {
        suffixCode = lenNum < 100 ? "3" : "4";
      } else {
        suffixCode = lenNum < 100 ? "1" : "2";
      }

      const lastTwoDigits = (lenNum % 100).toString().padStart(2, "0");
      let lenStr = `${suffixCode}${lastTwoDigits}`;

      // Add emergency S* suffix for lengths >= 95
      if (lenNum >= 95) {
        lenStr += "S*";
      }
      return `02.${typeCode}.${lenStr}`;
    }

    // Volt 4.0mm has no verified formula yet - don't guess.
    return "VERIFY WITH REP";
  }

  // Non-Volt screws: no verified formula exists for these families.
  // Previously this fabricated a plausible-looking but incorrect number
  // (see note above) - now returns an honest placeholder instead.
  return "VERIFY WITH REP";
}

interface RepInfo {
  company: string;
  name: string;
  role: string;
  phone: string;
  pager?: string;
  email?: string; // intentionally optional - see note above COMPANY_REPS
  territory: string;
  notes?: string;
}

// NOTE: rep names, companies, roles, and phone numbers below are confirmed
// real by the hospital. Email addresses were NOT confirmed and followed a
// suspiciously uniform AI-generated pattern (firstname.lastname@company-
// rep.ca for every single rep) - they have been removed rather than risk
// someone emailing a non-existent address during an actual contamination
// event. Add real emails back here once confirmed, or leave them out and
// rely on phone contact only.

const COMPANY_REPS: RepInfo[] = [
  {
    company: "Synthes",
    name: "Emilie Lefort",
    role: "Spine specialist / I-Factor",
    phone: "(514) 705-3764",
    territory: "Spine & Biologics Support"
  },
  {
    company: "Synthes",
    name: "Maxime Grandin",
    role: "Spine specialist",
    phone: "(514) 402-9222",
    territory: "Spine Clinical Support"
  },
  {
    company: "Synthes",
    name: "Jonathan Trottier",
    role: "—",
    phone: "(514) 880-7561",
    territory: "Montreal Area Support"
  },
  {
    company: "Synthes",
    name: "Paul Zavaro",
    role: "—",
    phone: "(514) 513-4534",
    territory: "Montreal Area Support"
  },
  {
    company: "Synthes",
    name: "Kelsey",
    role: "On-Call Representative",
    phone: "(514) 250-4070",
    territory: "Montreal Area Support",
    notes: "Prioritized Synthes Contact"
  },
  {
    company: "Synthes",
    name: "Alex Trépanier",
    role: "On-Call Representative",
    phone: "(514) 237-9569",
    territory: "Montreal Area Support",
    notes: "Prioritized Synthes Contact"
  },
  {
    company: "Synthes",
    name: "Andrew",
    role: "—",
    phone: "(514) 207-9366",
    territory: "Montreal Area Support"
  },
  {
    company: "Stryker",
    name: "Alexandre Leduc",
    role: "Ignite (bone graft)",
    phone: "(514) 952-8797",
    territory: "Bone Graft & Biologics"
  },
  {
    company: "Stryker",
    name: "Tony Andreou",
    role: "General",
    phone: "(514) 516-4102",
    territory: "Trauma & Reconstruction"
  },
  {
    company: "Smith+Nephew",
    name: "Jean-Pierre Maria",
    role: "Arthroscopy",
    phone: "(514) 404-8620",
    territory: "Arthroscopy & Sports Med"
  },
  {
    company: "Smith+Nephew",
    name: "Audrey McDonald",
    role: "Arthroscopy",
    phone: "(438) 872-1717",
    territory: "Arthroscopy & Sports Med"
  },
  {
    company: "Medtronic",
    name: "Jacob Lavigne",
    role: "MR8",
    phone: "(514) 984-9582",
    territory: "MR8 Systems Support"
  },
  {
    company: "Arthrex",
    name: "Francois Gatien",
    role: "Arthroscopy supplies, anchors, headless screws (biocomposite)",
    phone: "(514) 661-3393",
    territory: "Biocomposite & Instruments"
  },
  {
    company: "Zimmer",
    name: "Michele Price",
    role: "General",
    phone: "(514) 978-5984",
    territory: "General Orthopedics"
  },
  {
    company: "Orthofix",
    name: "Nick Munden",
    role: "8-plate",
    phone: "(514) 710-5419",
    territory: "8-Plate Systems"
  },
  {
    company: "Advance LRS",
    name: "Sean Robertson",
    role: "General",
    phone: "(519) 572-4613",
    territory: "LRS Systems Support"
  },
  {
    company: "Conmed",
    name: "Chantale Bertrand",
    role: "Power Pro drill",
    phone: "(514) 707-4082",
    territory: "Power Pro Systems"
  },
  {
    company: "Misonix",
    name: "Marie-Michele",
    role: "Bone scalpel",
    phone: "(438) 507-9966",
    territory: "Bone Scalpel Systems"
  },
  {
    company: "NuVasive / Orthopediatrics / Pega Medical / F. Duval / Conmed / Accutrack",
    name: "Dominic Rheaume",
    role: "Headless screws (metal, mini/micro), various lines",
    phone: "(514) 865-2335",
    territory: "Extremities & Micro-screws"
  },
  {
    company: "Magec rods",
    name: "Jad Bachaalerny",
    role: "—",
    phone: "(514) 448-3497",
    territory: "Magec Systems Support"
  },
  {
    company: "Magec rods",
    name: "David Wood",
    role: "—",
    phone: "(514) 497-1260",
    territory: "Magec Systems Support"
  },
  {
    company: "Articulated brace / MPFL arthroscopy",
    name: "Carlos Beretta",
    role: "—",
    phone: "(514) 953-8974",
    territory: "MPFL & Bracing Support"
  },
  {
    company: "Pro-Dense / Stimulant-Genex",
    name: "— (Rep)",
    role: "Pro-Dense cement — for Dr. Bozzo",
    phone: "(514) 299-9441",
    territory: "Pro-Dense Cement Only"
  },
  {
    company: "Pro-Dense / Stimulant-Genex",
    name: "Melanie Tremblay",
    role: "Stimulant/Genex cement",
    phone: "(514) 449-0060",
    territory: "Stimulant Genex Cement Support"
  },
  {
    company: "Evos plate / Taylor Spatial Frame",
    name: "Eric Doyle",
    role: "—",
    phone: "(514) 220-8646",
    territory: "Taylor Spatial Frames"
  },
  {
    company: "LARS ligament",
    name: "Jonathan Korah",
    role: "—",
    phone: "(514) 831-9116 / (514) 421-3227",
    territory: "LARS Ligament Support"
  }
];

// Helper to map sets to their manufacturers & reps
const getSetManufacturerDetail = (setId: string, setName: string) => {
  const nameLower = setName.toLowerCase();
  const idLower = setId.toLowerCase();

  // Volt is a Stryker Orthopaedics product line
  if (nameLower.includes("volt") || idLower.includes("volt")) {
    const strykerRep = COMPANY_REPS.find(r => r.company === "Stryker") || COMPANY_REPS[7];
    return {
      company: "Stryker Orthopaedics",
      logoColor: "text-amber-700 bg-amber-50/75 border-amber-200",
      rep: strykerRep,
    };
  }

  // Distal radius, Expert femoral/tibial nails, Cannulated series, LCP, Pelvic screws, External fixators and Fragment sets are all DePuy Synthes
  // Spine check: Only associate Emilie Lefort and Maxime Grandin to spine set searches
  const isSpine = nameLower.includes("spine") || idLower.includes("spine");
  if (isSpine) {
    const spineRep = COMPANY_REPS.find(r => r.name === "Emilie Lefort" || r.name === "Maxime Grandin") || COMPANY_REPS[5];
    return {
      company: "DePuy Synthes (Johnson & Johnson)",
      logoColor: "text-rose-700 bg-rose-50/75 border-rose-200",
      rep: spineRep,
    };
  } else {
    // Non-spine Synthes sets: prioritize Alex Trépanier and Kelsey as representatives
    const prioritisedRep = COMPANY_REPS.find(r => r.name.includes("Trépanier") || r.name === "Kelsey") || COMPANY_REPS[0];
    return {
      company: "DePuy Synthes (Johnson & Johnson)",
      logoColor: "text-rose-700 bg-rose-50/75 border-rose-200",
      rep: prioritisedRep,
    };
  }
};

export default function App() {
  // =========================================================================
  // STRUCTURED FLAGGING: all presets, no free text
  // =========================================================================
  const AFFECTED_LABELS: Record<import("./types").FlaggedAffected, string> = {
    "implant": "Implant (screw/nail/etc)",
    "instrument": "Instrument (drill/guide/etc)",
    "plate": "Plate",
    "tray-container": "Tray/Container",
    "labelling": "Labelling/Label",
    "location": "Location/Storage"
  };

  const ISSUE_TYPE_LABELS: Record<import("./types").FlaggedIssueType, string> = {
    "missing": "Missing from tray",
    "wrong-quantity": "Wrong quantity / short count",
    "wrong-item-present": "Wrong item present",
    "mislabeled-ref-mismatch": "Mislabeled / ref mismatch",
    "damaged-unusable": "Damaged / unusable",
    "wrong-location": "Wrong location / displaced"
  };

  const REPORTER_ROLES = ["Circulating Nurse", "Scrub Technician", "OR Manager", "Inventory Staff"];

  // =========================================================================
  // STATE & HANDLERS
  // =========================================================================
  // --- Edit gate: a shared password, NOT real authentication. Protects
  // against accidental edits by people using the app normally; does not
  // protect the database itself (Firestore rules still allow writes from
  // anyone who talks to Firestore directly, since there's no real auth
  // token to check against). This is a deliberate tradeoff - real auth
  // needs Identity Platform + billing, which isn't available right now.
  // See src/components/PasswordGate.tsx for the full explanation.
  //
  // Reading/searching the database is always allowed regardless of this
  // gate. Each write handler checks `if (!unlocked)` at its top and shows
  // the password modal instead of proceeding - after entering the correct
  // password, the person clicks the same button again, which re-runs the
  // handler with the now-unlocked state.
  const { unlocked, unlock, lock, getCooldownMessage } = useEditUnlocked();

  const [mode, setMode] = useState<"screw" | "set" | "plate">("set");
  const [view, setView] = useState<"grouped" | "sets" | "table">("grouped");
  const [searchQuery, setSearchQuery] = useState("");
  const [openSetId, setOpenSetId] = useState<string | null>(null);

  // Screw size filtering states
  const [screwSizeFilter, setScrewSizeFilter] = useState<string>("all");
  // Plate-type filter gates entire SETS based on whether they contain a
  // matching plate category (e.g. "T-Plate", "LCP/Locking"). Diameter and
  // hole-count narrowing filters were removed per direct instruction - plate
  // type alone is the search strategy now.
  const [plateTypeFilter, setPlateTypeFilter] = useState<string>("all");

  // Flag an issue modal states
  const [showFlagIssueModal, setShowFlagIssueModal] = useState(false);
  const [flaggedSetId, setFlaggedSetId] = useState<string>("all");
  const [flaggedSeverity, setFlaggedSeverity] = useState<"Low" | "Medium" | "High">("Medium");
  // STRUCTURED FLAG STATE (replaces free-text description/reporter/contact).
  // Every flag is now composed from selections only - no keyboard input - so
  // patient data cannot be entered on this path by construction.
  const [flaggedAffected, setFlaggedAffected] = useState<import("./types").FlaggedAffected | "">("");
  const [flaggedAffectedRef, setFlaggedAffectedRef] = useState<string>(""); // "" = not specified
  const [flaggedIssueType, setFlaggedIssueType] = useState<import("./types").FlaggedIssueType | "">("");
  const [flaggedReporterRole, setFlaggedReporterRole] = useState<string>("");
  const [flaggedSuccessMessage, setFlaggedSuccessMessage] = useState(false);
  // Surfaced when a free-text field is blocked for containing possible patient
  // data. Holds a non-identifying description of WHAT kind was detected, never
  // the matched value itself.
  const [phiBlockMessage, setPhiBlockMessage] = useState<string>("");

  // Paste interception: bulk paste (e.g. copying a line out of an EMR) is the
  // most likely way an entire patient record lands in a field. If pasted text
  // trips a hard PHI pattern, cancel the paste and warn, so it never even
  // populates the field. Returns true if the paste was blocked.
  const guardPaste = (e: React.ClipboardEvent): boolean => {
    const pasted = e.clipboardData?.getData("text") || "";
    const { blocking } = checkPhi(pasted);
    if (blocking.length > 0) {
      e.preventDefault();
      setPhiBlockMessage(
        `That paste was blocked because it appears to contain patient information (${describeFindings(
          blocking
        )}). This tool stores no patient data — paste only set names, sizes, and catalog numbers.`
      );
      return true;
    }
    return false;
  };
  const [flaggedIssues, setFlaggedIssues] = useState<FlaggedIssue[]>(() => {
    try {
      const raw = localStorage.getItem("ortho_flagged_issues");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  // Out-of-stock alerts: same persistence pattern as flaggedIssues
  // (localStorage for instant local view + Firestore for cross-device
  // sync), viewable in the Secure Archive's new "Out of Stock" tab.
  const [oosAlerts, setOosAlerts] = useState<OutOfStockAlert[]>(() => {
    try {
      const raw = localStorage.getItem("ortho_oos_alerts");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  // Archive modal active tab state
  const [archiveActiveTab, setArchiveActiveTab] = useState<"requisitions" | "issues" | "oos">("requisitions");

  // Representative Directory Modal states
  const [showRepsModal, setShowRepsModal] = useState(false);
  const [repSearchQuery, setRepSearchQuery] = useState("");
  const [copiedRepField, setCopiedRepField] = useState<string | null>(null);
  const [repViewMode, setRepViewMode] = useState<"cards" | "table">("cards");

  // Sets Info Table Modal states
  const [showSetsModal, setShowSetsModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [setsSearchQuery, setSetsSearchQuery] = useState("");
  const [setsSectionFilter, setSetsSectionFilter] = useState<string>("all");

  // Custom states for locations and filters persistency
  const [customLocations, setCustomLocations] = useState<
    Record<string, string>
  >(() => getCustomLocationsMap());

  // Reorder / Usage states
  const [reorderList, setReorderList] = useState<ReorderItem[]>(() =>
    getSavedReorders(),
  );
  const [showReorderModal, setShowReorderModal] = useState(false);
  // Holds the ID of the most recently submitted order, to show a brief
  // confirmation that it was saved to the Archive. Cleared when the reorder
  // modal is reopened.
  const [orderSubmittedId, setOrderSubmittedId] = useState<string>("");
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [activeUsageScrew, setActiveUsageScrew] = useState<{
    screw: Screw;
    set: TraumaSet;
  } | null>(null);

  // Active usage confirmation states
  const [selectedQuantity, setSelectedQuantity] = useState<number>(1);
  const [selectedLength, setSelectedLength] = useState<string>("");
  const [customCatalogRef, setCustomCatalogRef] = useState<string>("");

  // Reorder sheet metadata details
  const [showCopySuccess, setShowCopySuccess] = useState(false);

  // Secure Order Archive & Credentials system states
  const [archivedOrders, setArchivedOrders] = useState<ArchivedOrder[]>(() =>
    getArchivedOrders(),
  );
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [inputPassword, setInputPassword] = useState("");
  const [isPasswordIncorrect, setIsPasswordIncorrect] = useState(false);
  const [passwordCooldownMessage, setPasswordCooldownMessage] = useState<string>("");

  // Contamination Protocol States
  const [showContaminationModal, setShowContaminationModal] = useState(false);
  const [selectedContaminatedSetId, setSelectedContaminatedSetId] = useState<string>("");
  // Lets staff type a catalog reference number to filter the contaminated-set
  // picker to only sets that actually carry that implant - the "I'm holding an
  // implant stamped 204.840, which trays have it" entry point.
  const [contaminationRefLookup, setContaminationRefLookup] = useState<string>("");
  const [selectedCompanyFilter, setSelectedCompanyFilter] = useState<string>("all");
  const [expandedRepSetId, setExpandedRepSetId] = useState<string | null>(null);
  const [dispatchedRequests, setDispatchedRequests] = useState<Record<string, boolean>>({});
  const [onSiteSetsMap, setOnSiteSetsMap] = useState<Record<string, boolean>>(() => getOnSiteSetsMap());
  const [showOffSiteAlternatives, setShowOffSiteAlternatives] = useState<boolean>(false);
  // Lets someone narrow contamination results to backups matching a SPECIFIC
  // screw/plate within the contaminated set, rather than the whole set's
  // general match score. E.g. "the contaminated set has 6 screw types, but
  // I specifically need a 4.0 Cancellous replacement" - selecting that one
  // narrows the list to sets that actually cover it. Merged in from the
  // parallel AI Studio implementation.
  const [prioritizedScrewType, setPrioritizedScrewType] = useState<string>("");
  const [prioritizedPlate, setPrioritizedPlate] = useState<string>("");
  const [showOffsiteSimWindow, setShowOffsiteSimWindow] = useState(false);

  // Out of Stock System Alerts States
  const [oosModalScrew, setOosModalScrew] = useState<Screw | null>(null);
  const [oosModalSet, setOosModalSet] = useState<TraumaSet | null>(null);
  const [oosSelectedLength, setOosSelectedLength] = useState<string>("");
  const [oosCatalogRef, setOosCatalogRef] = useState<string>("");
  const [oosAlertSuccess, setOosAlertSuccess] = useState<boolean>(false);
  const [oosAlertId, setOosAlertId] = useState<string>("");

  // Tray/Item Verification Status States
  const [verifications, setVerifications] = useState<Record<string, Record<string, { verificationStatus: "tray-verified" | "source-verified" | "unverified"; verifiedBy?: string; verifiedDate?: string }>>>(() => getLocalVerifications());
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationModalTarget, setVerificationModalTarget] = useState<{ setId: string; itemId?: string; itemType: "screw" | "plate" | "set"; itemName: string } | null>(null);
  const [verifierName, setVerifierName] = useState("");
  const [verificationStatusVal, setVerificationStatusVal] = useState<"tray-verified" | "source-verified" | "unverified">("tray-verified");

  // Manual Entry States
  const [showManualEntryModal, setShowManualEntryModal] = useState(false);
  const [manualSetId, setManualSetId] = useState<string>("");
  const [manualImplantType, setManualImplantType] = useState<"screw" | "plate" | "">("");
  const [manualCatalogRef, setManualCatalogRef] = useState<string>("");
  const [manualQty, setManualQty] = useState(1);

  useEffect(() => {
    setPrioritizedScrewType("");
    setSelectedCompanyFilter("all");
    setExpandedRepSetId(null);
    setShowOffSiteAlternatives(false);
  }, [selectedContaminatedSetId]);

  // Real-time Firebase Firestore Sync Listeners
  useEffect(() => {
    try {
      const unsub = onSnapshot(
        collection(db, "custom_locations"),
        (snapshot) => {
          const locationsMap: Record<string, string> = {};
          snapshot.forEach((doc) => {
            const data = doc.data();
            if (data && data.location) {
              locationsMap[doc.id] = data.location;
            }
          });
          if (Object.keys(locationsMap).length > 0) {
            setCustomLocations((prev) => ({ ...prev, ...locationsMap }));
          }
        },
        (error) => {
          handleFirestoreError(error, OperationType.GET, "custom_locations");
        }
      );
      return unsub;
    } catch (e) {
      console.warn("Firestore custom_locations subscription error:", e);
    }
  }, []);

  useEffect(() => {
    try {
      const unsub = onSnapshot(
        collection(db, "onsite_sets"),
        (snapshot) => {
          const onsiteMap: Record<string, boolean> = {};
          snapshot.forEach((doc) => {
            const data = doc.data();
            if (data && typeof data.isOnSite === "boolean") {
              onsiteMap[doc.id] = data.isOnSite;
            }
          });
          if (Object.keys(onsiteMap).length > 0) {
            setOnSiteSetsMap((prev) => ({ ...prev, ...onsiteMap }));
          }
        },
        (error) => {
          handleFirestoreError(error, OperationType.GET, "onsite_sets");
        }
      );
      return unsub;
    } catch (e) {
      console.warn("Firestore onsite_sets subscription error:", e);
    }
  }, []);

  useEffect(() => {
    try {
      const unsub = onSnapshot(
        collection(db, "set_verifications"),
        (snapshot) => {
          const verifMap: Record<string, Record<string, { verificationStatus: "tray-verified" | "source-verified" | "unverified"; verifiedBy?: string; verifiedDate?: string }>> = {};
          snapshot.forEach((doc) => {
            const data = doc.data();
            if (data && data.items) {
              verifMap[doc.id] = data.items;
            }
          });
          if (Object.keys(verifMap).length > 0) {
            setVerifications(verifMap);
            saveLocalVerifications(verifMap);
          }
        },
        (error) => {
          handleFirestoreError(error, OperationType.GET, "set_verifications");
        }
      );
      return unsub;
    } catch (e) {
      console.warn("Firestore set_verifications subscription error:", e);
    }
  }, []);

  useEffect(() => {
    try {
      const unsub = onSnapshot(
        collection(db, "flagged_issues"),
        (snapshot) => {
          const issues: FlaggedIssue[] = [];
          snapshot.forEach((doc) => {
            const data = doc.data() as FlaggedIssue;
            if (data && data.id) {
              issues.push(data);
            }
          });
          if (issues.length > 0) {
            setFlaggedIssues(issues);
          }
        },
        (error) => {
          handleFirestoreError(error, OperationType.GET, "flagged_issues");
        }
      );
      return unsub;
    } catch (e) {
      console.warn("Firestore flagged_issues subscription error:", e);
    }
  }, []);

  useEffect(() => {
    try {
      const unsub = onSnapshot(
        collection(db, "oos_alerts"),
        (snapshot) => {
          const alerts: OutOfStockAlert[] = [];
          snapshot.forEach((doc) => {
            const data = doc.data() as OutOfStockAlert;
            if (data && data.id) {
              alerts.push(data);
            }
          });
          if (alerts.length > 0) {
            setOosAlerts(alerts);
          }
        },
        (error) => {
          handleFirestoreError(error, OperationType.GET, "oos_alerts");
        }
      );
      return unsub;
    } catch (e) {
      console.warn("Firestore oos_alerts subscription error:", e);
    }
  }, []);

  useEffect(() => {
    try {
      const unsub = onSnapshot(
        collection(db, "archived_orders"),
        (snapshot) => {
          const orders: ArchivedOrder[] = [];
          snapshot.forEach((doc) => {
            const data = doc.data() as ArchivedOrder;
            if (data && data.id) {
              orders.push(data);
            }
          });
          if (orders.length > 0) {
            orders.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
            setArchivedOrders(orders);
          }
        },
        (error) => {
          handleFirestoreError(error, OperationType.GET, "archived_orders");
        }
      );
      return unsub;
    } catch (e) {
      console.warn("Firestore archived_orders subscription error:", e);
    }
  }, []);

  const contaminatedSet = useMemo(() => {
    return DECORATED_SETS.find((s) => s.id === selectedContaminatedSetId);
  }, [selectedContaminatedSetId]);

  // The set list shown in the contamination picker, optionally filtered to
  // only sets carrying a typed reference number. When a ref is entered, each
  // matching set also reports which of its implants matched, so staff see at a
  // glance why a set is in the list. Empty lookup = show everything.
  const contaminationSetList = useMemo(() => {
    const raw = contaminationRefLookup.trim().toLowerCase().replace(/\s+/g, "");
    if (!raw) return DECORATED_SETS.map((s) => ({ set: s, matchedRefs: [] as string[] }));
    const out: { set: typeof DECORATED_SETS[number]; matchedRefs: string[] }[] = [];
    for (const s of DECORATED_SETS) {
      const matchedRefs: string[] = [];
      for (const fam of s.screwFamilies || []) {
        for (const sz of fam.sizes) {
          if (sz.ref && sz.ref.toLowerCase().replace(/\s+/g, "").includes(raw)) {
            matchedRefs.push(`${sz.ref} (${fam.displayName} ${sz.length}mm)`);
          }
        }
      }
      for (const fam of s.plateFamilies || []) {
        for (const sz of fam.sizes) {
          if (sz.ref && sz.ref.toLowerCase().replace(/\s+/g, "").includes(raw)) {
            matchedRefs.push(`${sz.ref} (${fam.displayName}${sz.holes != null ? " " + sz.holes + "H" : ""})`);
          }
        }
      }
      if (matchedRefs.length > 0) out.push({ set: s, matchedRefs });
    }
    return out;
  }, [contaminationRefLookup]);

  const contaminationAlternatives = useMemo(() => {
    if (!contaminatedSet) return [];

    // REF-BASED MATCHER (v2): identity is the manufacturer reference number,
    // not parsed label text. getContaminationAnalysis cross-references every
    // implant in the contaminated set against the global ref index and returns
    // both per-implant alternatives and ranked whole-set backups. We then map
    // that onto the result shape the existing UI already renders.
    const { matches, backupSets } = getContaminationAnalysis(contaminatedSet.id);

    // Index the per-implant matches by the backup setId so we can, for each
    // candidate set, list exactly which contaminated implants it covers.
    const bySet = new Map<
      string,
      { screwMatches: any[]; plateMatches: any[] }
    >();
    for (const m of matches) {
      for (const alt of m.alternatives) {
        const entry = bySet.get(alt.setId) || { screwMatches: [], plateMatches: [] };
        const isText = alt.matchType === "text";
        const sharedNote = alt.viaSharedRef
          ? " — via documented shared-reference quirk (one catalog number legitimately covers consecutive lengths)"
          : "";
        const statusNote =
          alt.verificationStatus === "unverified"
            ? " — ⚠️ backup is UNVERIFIED, confirm physically before use"
            : "";
        // Text matches (same description/size, different or absent ref - e.g.
        // the material twin) are real-world alternatives but NOT guaranteed
        // identical, so they're labelled differently and always carry a
        // verify-before-use caution.
        const textCaution = isText
          ? " — ⚠️ matched by description/size, NOT an identical catalog number (may differ in material e.g. SS vs Ti); verify before use"
          : "";
        if (m.contaminated.itemType === "screw") {
          entry.screwMatches.push({
            screwA: { type: m.contaminated.familyDisplayName, lengthRange: m.contaminated.length || "" },
            screwB: { type: alt.familyDisplayName, lengthRange: alt.length || "" },
            matchType: isText ? ("Same size & type" as const) : ("Exact size & function" as const),
            description: isText
              ? `${alt.familyDisplayName} ${alt.length ?? ""}mm${textCaution}${statusNote}`
              : `${alt.familyDisplayName} ${alt.length ?? ""}mm — same implant by catalog #${m.ref}${sharedNote}${statusNote}`,
          });
        } else {
          entry.plateMatches.push({
            plateA: `${m.contaminated.familyDisplayName} ${m.contaminated.length ?? ""}`,
            plateB: `${alt.familyDisplayName} ${alt.length ?? ""}${isText ? "" : ` #${m.ref}`}`,
            matchType: isText ? ("Same size & type" as const) : ("Exact size & function" as const),
            description: isText
              ? `Same plate type & size${textCaution}${statusNote}`
              : `Exact reference match (#${m.ref})${sharedNote}${statusNote}`,
          });
        }
        bySet.set(alt.setId, entry);
      }
    }

    let results = backupSets.map((cand) => {
      const otherSet = DECORATED_SETS.find((s) => s.id === cand.setId)!;
      const detail = bySet.get(cand.setId) || { screwMatches: [], plateMatches: [] };

      // Coverage % is honest: how many of the contaminated set's distinct
      // referenced implants this backup can actually supply.
      const matchPercentage = cand.coveragePct;

      const matA = contaminatedSet.defaultMaterial || "Both";
      const matB = otherSet.defaultMaterial || "Both";
      let metalWarning = "";
      if (matA !== "Both" && matB !== "Both" && matA !== matB) {
        metalWarning = `⚠️ Material alert: Contaminated is ${matA}, but backup is ${matB}. Mixing metals causes risk of galvanic corrosion!`;
      }

      let recommendation = "";
      if (cand.isDiscontinued) {
        recommendation = `This set is flagged discontinued — use only if no current alternative exists, and verify availability.`;
      } else if (matchPercentage >= 75) {
        recommendation = `Optimal immediate alternative — covers ${cand.coveredRefs} of ${cand.totalRefs} referenced implants by exact catalog number. Safe swap.`;
      } else if (matchPercentage >= 40) {
        recommendation = `Viable partial backup — supplies ${cand.coveredRefs} of ${cand.totalRefs} referenced implants exactly. Confirm the remaining items are sourced elsewhere.`;
      } else {
        recommendation = `Partial support — covers ${cand.coveredRefs} of ${cand.totalRefs} referenced implants. Useful as a supplement, not a full replacement.`;
      }
      if (cand.weakestStatus === "unverified") {
        recommendation += ` Note: some supplied refs are unverified — confirm physically.`;
      }

      const mfg = getSetManufacturerDetail(otherSet.id, otherSet.name);
      const onSite = !!onSiteSetsMap[otherSet.id];

      return {
        set: otherSet,
        company: mfg.company,
        rep: mfg.rep,
        logoColor: mfg.logoColor,
        matchPercentage,
        matchedCount: detail.screwMatches.length + detail.plateMatches.length,
        matches: detail.screwMatches,
        plateMatches: detail.plateMatches,
        metalWarning,
        recommendation,
        onSite,
      };
    });

    // Narrow down search if a specific implant is prioritized
    if (prioritizedScrewType) {
      results = results.filter((item) =>
        item.matches.some((m: any) => m.screwA.type === prioritizedScrewType)
      );
    }
    if (prioritizedPlate) {
      results = results.filter((item) =>
        item.plateMatches.some((m: any) => m.plateA === prioritizedPlate)
      );
    }

    // Filter by selected brand/company vendor if not 'all'
    if (selectedCompanyFilter !== "all") {
      results = results.filter((item) => item.company === selectedCompanyFilter);
    }

    // Sort by onSite status first, then highest coverage
    results = results.sort((a, b) => {
      if (a.onSite !== b.onSite) {
        return a.onSite ? -1 : 1;
      }
      return b.matchPercentage - a.matchPercentage;
    });

    return results;
  }, [contaminatedSet, prioritizedScrewType, prioritizedPlate, selectedCompanyFilter, onSiteSetsMap]);

  const visibleAlternatives = useMemo(() => {
    if (showOffSiteAlternatives) {
      return contaminationAlternatives;
    }
    return contaminationAlternatives.filter((alt) => alt.onSite);
  }, [contaminationAlternatives, showOffSiteAlternatives]);

  // --- Infinite scroll for the alternatives list ---
  // The full match list is already computed in-memory (no live Firestore
  // query happens at search time - see contaminationAlternatives above),
  // so "pagination" here just means revealing more of an already-loaded
  // array as the person scrolls, not fetching more data from anywhere.
  // ALTERNATIVES_PAGE_SIZE controls how many cards are shown per reveal.
  const ALTERNATIVES_PAGE_SIZE = 8;
  const [revealedCount, setRevealedCount] = useState(ALTERNATIVES_PAGE_SIZE);
  const scrollSentinelRef = React.useRef<HTMLDivElement | null>(null);

  // Reset how many are revealed whenever the underlying result set changes
  // (new search, toggled off-site visibility, etc.) - otherwise switching
  // to a different contaminated set could start already scrolled past
  // results that haven't been shown yet for the new list.
  useEffect(() => {
    setRevealedCount(ALTERNATIVES_PAGE_SIZE);
  }, [visibleAlternatives]);

  useEffect(() => {
    const sentinel = scrollSentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setRevealedCount((prev) => Math.min(prev + ALTERNATIVES_PAGE_SIZE, visibleAlternatives.length));
        }
      },
      { rootMargin: "200px" } // start loading slightly before the sentinel is actually visible, so scrolling feels continuous rather than pausing at the bottom
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [visibleAlternatives.length]);

  const pagedAlternatives = useMemo(
    () => visibleAlternatives.slice(0, revealedCount),
    [visibleAlternatives, revealedCount]
  );

  const hiddenOffSiteCount = useMemo(() => {
    return contaminationAlternatives.filter((alt) => !alt.onSite).length;
  }, [contaminationAlternatives]);

  // Reset clear confirmation state when modal is toggled
  useEffect(() => {
    if (!showReorderModal) {
      setShowClearConfirm(false);
    }
  }, [showReorderModal]);

// Look up the REAL, verified catalog ref for a given screw family + length
// directly from the set's own screwFamilies data, instead of trying to
// re-derive/guess one from a flattened type+lengthRange string. This is the
// authoritative source - sets_v2.ts carries the actual verified ref per
// individual length. Falls back to generateCatalogRef's honest
// "VERIFY WITH REP" only if this exact family+length truly isn't in the data
// (e.g. a length outside the verified set, or a legacy-only set).
function lookupVerifiedScrewRef(
  set: TraumaSet,
  screwTypeLabel: string,
  length: string,
  material: "SS" | "Ti" | "Both" = "Both"
): string {
  const targetLen = parseFloat(length);
  for (const fam of set.screwFamilies || []) {
    if (fam.displayName !== screwTypeLabel) continue;
    for (const sz of fam.sizes) {
      if (parseFloat(sz.length) === targetLen && sz.ref) {
        return sz.ref;
      }
    }
  }
  // Not found in verified data for this exact family/length - fall back to
  // the honest generator (which itself refuses to guess for non-Volt screws).
  return generateCatalogRef(screwTypeLabel, length, material);
}

// Handler to trigger confirmation modal for out of stock items
  const handleOutOfStockAlert = (screw: Screw, set: TraumaSet) => {
    setOosModalScrew(screw);
    setOosModalSet(set);
    setOosAlertSuccess(false);
    setOosAlertId("");

    const lengths = getLengthOptions(screw.lengthRange, screw.interval);
    const initialLength = lengths[0] || "30";
    setOosSelectedLength(initialLength);

    // Look up the REAL verified ref for this exact family + length, same
    // authoritative lookup used in the usage-log flow - never a guess.
    const mat = set.defaultMaterial || "Both";
    setOosCatalogRef(lookupVerifiedScrewRef(set, screw.type, initialLength, mat));
  };

  // Handler to update the ref shown when the OOS length selection changes
  const handleOosLengthChange = (lengthVal: string) => {
    setOosSelectedLength(lengthVal);
    if (oosModalSet && oosModalScrew) {
      const mat = oosModalSet.defaultMaterial || "Both";
      setOosCatalogRef(lookupVerifiedScrewRef(oosModalSet, oosModalScrew.type, lengthVal, mat));
    }
  };

  // Handler to initiate a screw usage log
  const handleInitiateUsageLog = (screw: Screw, set: TraumaSet) => {
    setActiveUsageScrew({ screw, set });
    setSelectedQuantity(1);

    // Compute length options and pre-fill initial
    const lengths = getLengthOptions(screw.lengthRange, screw.interval);
    const initialLength = lengths[0] || "30";
    setSelectedLength(initialLength);

    // Look up the REAL verified catalog ref for this exact family + length
    const mat = set.defaultMaterial || "Both";
    const ref = lookupVerifiedScrewRef(set, screw.type, initialLength, mat);
    setCustomCatalogRef(ref);
  };

  // Handler to update selected length and recalculate reference number
  const handleLengthChange = (lengthVal: string) => {
    setSelectedLength(lengthVal);
    if (activeUsageScrew) {
      const mat = activeUsageScrew.set.defaultMaterial || "Both";
      const ref = lookupVerifiedScrewRef(
        activeUsageScrew.set,
        activeUsageScrew.screw.type,
        lengthVal,
        mat,
      );
      setCustomCatalogRef(ref);
    }
  };

  // Handler to commit screw use to reorder list
  const handleConfirmUsageLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeUsageScrew) return;

    const itemToAdd: Omit<ReorderItem, "id"> = {
      screwType: activeUsageScrew.screw.type,
      setId: activeUsageScrew.set.id,
      setName: activeUsageScrew.set.name,
      selectedLength,
      quantity: selectedQuantity,
      catalogRef: customCatalogRef.trim() || "N/A",
      location:
        customLocations[activeUsageScrew.set.id] ||
        activeUsageScrew.set.defaultLocation ||
        "Cabinet Core C, Shelf 4",
      material: activeUsageScrew.set.defaultMaterial || "Both",
    };

    const updated = addSetReorderItem(itemToAdd);
    setReorderList(updated);
    setActiveUsageScrew(null);
  };

  // Handler to add a plate directly to the reorder list
  const handleAddPlateReorder = (plateName: string, set: TraumaSet, qty: number, catalogRef: string) => {
    const itemToAdd: Omit<ReorderItem, "id"> = {
      screwType: plateName,
      setId: set.id,
      setName: set.name,
      selectedLength: "N/A",
      quantity: qty,
      catalogRef: catalogRef || "N/A",
      location:
        customLocations[set.id] ||
        set.defaultLocation ||
        "Cabinet Core C, Shelf 4",
      notes: "Ordered plate implant",
      material: set.defaultMaterial || "Both",
      itemType: "plate",
    };

    const updated = addSetReorderItem(itemToAdd);
    setReorderList(updated);
  };

  // Handler to add a manually inputted implant directly to the reorder list
  const handleConfirmAddManualItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualSetId || !manualImplantType || !manualCatalogRef.trim()) {
      setPhiBlockMessage("Please complete all fields.");
      return;
    }

    // NUMERIC-REF VALIDATION: digits, periods, dashes, and 1-2 trailing
    // letters/asterisk. Still structurally impossible to type a name, MRN,
    // email, or date - only catalog-number-shaped characters are accepted.
    //
    // Widened per simulation testing (sim6_manual_entry) which found this
    // pattern rejecting REAL refs already in the verified database:
    //  - VOLT sterile-marked refs like "02.535.195S*" need a 2-character
    //    trailing marker (S then *), not just 1.
    //  - OrthoPediatrics refs like "00-1015-8016" use dashes as a group
    //    separator, a real manufacturer convention distinct from Synthes'
    //    period convention - without dash support, none of the PediPlates
    //    sets' real refs could ever be manually re-entered.
    const refPattern = /^[0-9]+([.\-][0-9]+){0,3}[a-zA-Z*]{0,2}$/;
    if (!refPattern.test(manualCatalogRef)) {
      setPhiBlockMessage("Reference number must contain only digits, periods, dashes, and up to two trailing letters (e.g. 204.840, 02.535.195S*, 00-1015-8016).");
      return;
    }
    setPhiBlockMessage("");

    const set = DECORATED_SETS.find(s => s.id === manualSetId);
    if (!set) return;

    // Find the matching implant in the database by ref.
    let matchedLabel = "Custom item";
    let matchedLength = "N/A";
    if (manualImplantType === "screw") {
      const found = set.screwFamilies
        .flatMap(f => f.sizes.map(sz => ({ ...sz, family: f })))
        .find(s => s.ref === manualCatalogRef);
      if (found) {
        matchedLabel = found.family.displayName;
        matchedLength = found.length;
      }
    } else {
      const found = set.plateFamilies
        .flatMap(f => f.sizes.map(sz => ({ ...sz, family: f })))
        .find(s => s.ref === manualCatalogRef);
      if (found) {
        matchedLabel = found.family.displayName;
        matchedLength = found.length || (found.holes ? found.holes + "H" : "N/A");
      }
    }

    const newItem: ReorderItem = {
      id: `manual_${Math.random().toString(36).substring(2, 9)}`,
      screwType: matchedLabel,
      setId: manualSetId,
      setName: set.name,
      selectedLength: matchedLength,
      quantity: manualQty > 0 ? manualQty : 1,
      catalogRef: manualCatalogRef.trim(),
      location: set.defaultLocation || "Not in Database",
      material: set.defaultMaterial || "Custom",
      isManualEntry: true,
    };

    const list = [...reorderList, newItem];
    setReorderList(list);
    saveAllReorders(list);

    // Reset form states
    setManualSetId("");
    setManualImplantType("");
    setManualQty(1);
    setManualCatalogRef("");
    setShowManualEntryModal(false);
    setManualSuccessMessage(true);
    setTimeout(() => setManualSuccessMessage(false), 2000);
  };

  // Handler to download the PDF vs. Database Verification & Audit Report
  const handleDownloadVerificationReport = () => {
    const blob = new Blob([VERIFICATION_REPORT_MD], { type: "text/markdown;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "surgical_sets_verification_report.md");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Inline updater for reorder item quantities
  const handleUpdateItemQty = (id: string, delta: number) => {
    const list = [...reorderList];
    const item = list.find((i) => i.id === id);
    if (item) {
      const newQty = item.quantity + delta;
      if (newQty <= 0) {
        handleRemoveReorderItem(id);
      } else {
        item.quantity = newQty;
        setReorderList(list);
        saveAllReorders(list);
      }
    }
  };

  // Inline updater for catalog code changes
  const handleUpdateItemCatalog = (id: string, newCode: string) => {
    // Hard character constraint, same as structured entry: digits, periods,
    // dashes (for manufacturers like OrthoPediatrics that use dash-separated
    // refs instead of Synthes' period convention), and letters only. No path
    // in the app can attach arbitrary text to a ref field.
    const filtered = newCode.replace(/[^0-9.\-a-zA-Z*]/g, "");
    const list = [...reorderList];
    const item = list.find((i) => i.id === id);
    if (item) {
      item.catalogRef = filtered;
      setReorderList(list);
      saveAllReorders(list);
    }
  };

  // Inline updater for length changes
  const handleUpdateItemLength = (id: string, newLength: string) => {
    const list = [...reorderList];
    const item = list.find((i) => i.id === id);
    if (item) {
      item.selectedLength = newLength;
      if (!item.isManualEntry) {
        // Recalculate using the REAL verified ref for this set/family/length
        const mat = (item.material as "SS" | "Ti" | "Both") || "Both";
        const ownerSet = DECORATED_SETS.find((s) => s.id === item.setId);
        item.catalogRef = ownerSet
          ? lookupVerifiedScrewRef(ownerSet, item.screwType, newLength, mat)
          : generateCatalogRef(item.screwType, newLength, mat);
      }
      setReorderList(list);
      saveAllReorders(list);
    }
  };

  // Remove single reorder item
  const handleRemoveReorderItem = (id: string) => {
    const updated = removeSetReorderItem(id);
    setReorderList(updated);
  };

  // Clear reorder list
  const handleClearReorderList = () => {
    if (showClearConfirm) {
      clearAllReorders();
      setReorderList([]);
      setShowClearConfirm(false);
    } else {
      setShowClearConfirm(true);
    }
  };

  // Plain-text copy builder for simple email orders
  const handleCopyOrderText = () => {
    if (reorderList.length === 0) return;

    let text = `==================================================\n`;
    text += `ORTHOPEDIC REORDERING FORM\n`;
    text += `==================================================\n`;
    text += `Date Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}\n`;
    text += `\nITEMS FOR REPLENISHMENT:\n`;
    text += `--------------------------------------------------\n`;

    reorderList.forEach((item, index) => {
      const lenSuffix = item.itemType === "plate" || item.selectedLength === "N/A" ? " (Plate)" : `, Length: ${item.selectedLength}mm`;
      text += `${index + 1}. [Qty: ${item.quantity}] - ${item.screwType}${lenSuffix}\n`;
      text += `   Catalog Ref: ${item.catalogRef}\n`;
      text += `   Source: ${item.setName}\n`;
      text += `   Storage Location: ${item.location}\n`;
      if (item.notes) {
        text += `   Notes: ${item.notes}\n`;
      }
      text += `\n`;
    });

    text += `--------------------------------------------------\n`;
    text += `Total Implants Needed: ${reorderList.reduce((sum, item) => sum + item.quantity, 0)}\n`;
    text += `==================================================`;

    navigator.clipboard.writeText(text);
    setShowCopySuccess(true);
    setTimeout(() => setShowCopySuccess(false), 2500);
  };

  const handleVerifyPassword = (e: React.FormEvent) => {
    e.preventDefault();
    const cooldownMsg = getCooldownMessage();
    if (cooldownMsg) {
      setPasswordCooldownMessage(cooldownMsg);
      return;
    }
    setPasswordCooldownMessage("");
    if (unlock(inputPassword.trim())) {
      setIsPasswordIncorrect(false);
      setInputPassword("");
    } else {
      setIsPasswordIncorrect(true);
      // Check again immediately - this attempt may have just triggered a
      // fresh cooldown (e.g. the 5th wrong attempt).
      const newCooldown = getCooldownMessage();
      if (newCooldown) setPasswordCooldownMessage(newCooldown);
    }
  };

  const handleLogoutAdmin = () => {
    lock();
    setInputPassword("");
  };

  const handleFlagIssueSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Structured form: all selections, nothing free-text. No PHI blocking needed
    // because there's nowhere to enter patient data by construction.
    if (!flaggedSetId || !flaggedAffected || !flaggedIssueType || !flaggedReporterRole) {
      setPhiBlockMessage("Please complete all required fields.");
      return;
    }
    if (!unlocked) { setShowAdminModal(true); return; }

    // Compose a human-readable description from the structured selections.
    const set = DECORATED_SETS.find(s => s.id === flaggedSetId);
    const affectedLabel = AFFECTED_LABELS[flaggedAffected as import("./types").FlaggedAffected];
    const issueLabel = ISSUE_TYPE_LABELS[flaggedIssueType as import("./types").FlaggedIssueType];
    
    let affectedDetail = affectedLabel;
    if (flaggedAffected === "implant" || flaggedAffected === "plate") {
      if (flaggedAffectedRef) {
        // Look up the chosen implant in the set to get its display label.
        const allItems = [
          ...(set?.screwFamilies || []).flatMap(f => f.sizes.map(sz => ({ 
            ref: sz.ref, 
            label: `${f.displayName} ${sz.length}mm`,
            type: 'screw' as const
          }))),
          ...(set?.plateFamilies || []).flatMap(f => f.sizes.map(sz => ({
            ref: sz.ref,
            label: `${f.displayName}${sz.holes ? ' ' + sz.holes + 'H' : ''}${sz.length ? ' ' + sz.length + 'mm' : ''}`,
            type: 'plate' as const
          })))
        ];
        const chosen = allItems.find(x => x.ref === flaggedAffectedRef);
        affectedDetail = `${affectedLabel} #${flaggedAffectedRef}${chosen ? ` (${chosen.label})` : ''}`;
      }
    }

    const composedDescription = `${issueLabel} — ${affectedDetail} — ${set?.name || flaggedSetId}`;
    const localTime = `${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`;

    const newIssue: FlaggedIssue = {
      id: `ISSUE-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: localTime,
      setId: flaggedSetId,
      setName: set?.name || flaggedSetId,
      affected: flaggedAffected as import("./types").FlaggedAffected,
      affectedItemRef: flaggedAffectedRef || null,
      affectedItemLabel: flaggedAffectedRef ? 
        (set?.screwFamilies || []).flatMap(f => f.sizes).find(s => s.ref === flaggedAffectedRef)?.length ||
        (set?.plateFamilies || []).flatMap(f => f.sizes).find(s => s.ref === flaggedAffectedRef)?.length
        : undefined,
      issueType: flaggedIssueType as import("./types").FlaggedIssueType,
      severity: flaggedSeverity,
      description: composedDescription,
      reporter: flaggedReporterRole,
      status: "Pending"
    };

    // STORAGE BACKSTOP: even though input was blocked above, scrub the object
    // before it touches localStorage or the cloud, so no unscanned text can be
    // persisted by any path.
    const { value: safeIssue } = scrubObject(newIssue);

    const updatedIssues = [safeIssue, ...flaggedIssues];
    setFlaggedIssues(updatedIssues);
    try {
      localStorage.setItem("ortho_flagged_issues", JSON.stringify(updatedIssues));
    } catch (err) {
      console.error("Failed to save flagged issue", err);
    }

    try {
      await setDoc(doc(db, "flagged_issues", safeIssue.id), safeIssue);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `flagged_issues/${safeIssue.id}`);
    }

    setFlaggedSuccessMessage(true);
    // Reset structured state
    setFlaggedSetId("all");
    setFlaggedAffected("");
    setFlaggedAffectedRef("");
    setFlaggedIssueType("");
    setFlaggedReporterRole("");
    setFlaggedSeverity("Medium");
    setPhiBlockMessage("");
  };

  const handleResolveFlaggedIssue = async (issueId: string, notes: string) => {
    if (!unlocked) { setShowAdminModal(true); return; }

    // PHI GUARD + BACKSTOP: resolution notes are free text written by an
    // admin and persist to Firestore. Block obvious PHI, and scrub as a
    // backstop regardless.
    const phi = checkPhi(notes);
    if (phi.blocking.length > 0) {
      setPhiBlockMessage(
        `Resolution can't be saved because the notes appear to contain patient information (${describeFindings(
          phi.blocking
        )}). Please describe the resolution using set names and catalog numbers only.`
      );
      return;
    }
    const { value: safeNotes } = scrubObject({ notes: notes || "Resolved by system administrator" });

    const updated = flaggedIssues.map(issue => {
      if (issue.id === issueId) {
        const resolved = {
          ...issue,
          status: "Resolved" as const,
          resolutionNotes: safeNotes.notes
        };
        setDoc(doc(db, "flagged_issues", issueId), resolved).catch(e => {
          handleFirestoreError(e, OperationType.WRITE, `flagged_issues/${issueId}`);
        });
        return resolved;
      }
      return issue;
    });
    setFlaggedIssues(updated);
    try {
      localStorage.setItem("ortho_flagged_issues", JSON.stringify(updated));
    } catch (err) {
      console.error("Failed to preserve resolved issue state", err);
    }
  };

  const handleDeleteFlaggedIssue = async (issueId: string) => {
    if (!unlocked) { setShowAdminModal(true); return; }
    const updated = flaggedIssues.filter(issue => issue.id !== issueId);
    setFlaggedIssues(updated);
    try {
      localStorage.setItem("ortho_flagged_issues", JSON.stringify(updated));
    } catch (err) {
      console.error("Failed to delete issue log", err);
    }
    try {
      await deleteDoc(doc(db, "flagged_issues", issueId));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `flagged_issues/${issueId}`);
    }
  };

  const handleFinalizeAndArchiveOrder = async () => {
    if (reorderList.length === 0) return;

    const orderId = `#ORTHO-${Math.floor(1000 + Math.random() * 9000)}`;
    const timestamp = `${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`;

    const rawOrder: ArchivedOrder = {
      id: orderId,
      timestamp,
      items: [...reorderList],
      alertSent: false, // notification is a future backend (Cloud Function) job
      status: "Stored"
    };
    // STORAGE BACKSTOP: reorder items can include manual free-text entries.
    // Scrub the whole order before it is stored locally or in the cloud.
    const { value: newOrder } = scrubObject(rawOrder);

    const updatedArchive = [newOrder, ...archivedOrders];
    setArchivedOrders(updatedArchive);
    saveArchivedOrders(updatedArchive);

    // Write to Firestore. When the backend notification Cloud Function is
    // added later, it will trigger on this exact write (onCreate of an
    // archived_orders document) and send the "new order" notification
    // server-side - no email is composed or sent from the client, and no
    // address is shown anywhere in the UI.
    try {
      await setDoc(doc(db, "archived_orders", newOrder.id), newOrder);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `archived_orders/${newOrder.id}`);
    }

    // Confirmation for the user, then clear the cart. The order is now in the
    // Secure Archive.
    setOrderSubmittedId(orderId);

    setReorderList([]);
    clearAllReorders();
  };

  const [materialFilter, setMaterialFilter] = useState<"all" | "SS" | "Ti">(
    "all",
  );
  const [screwTypeFilter, setScrewTypeFilter] = useState<
    "all" | "Cannulated" | "Locking" | "Cortex" | "Cancellous"
  >("all");

  // Save customized location code
  const handleSaveLocation = async (setId: string, loc: string) => {
    if (!unlocked) { setShowAdminModal(true); return; }
    saveSetLocation(setId, loc);
    setCustomLocations(getCustomLocationsMap()); // refresh app state
    try {
      await setDoc(doc(db, "custom_locations", setId), { setId, location: loc });
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `custom_locations/${setId}`);
    }
  };

  const handleToggleOnSite = async (setId: string) => {
    if (!unlocked) { setShowAdminModal(true); return; }
    const nextVal = !onSiteSetsMap[setId];
    setOnSiteSetsMap((prev) => {
      const updated = { ...prev, [setId]: nextVal };
      saveOnSiteSetsMap(updated);
      return updated;
    });
    try {
      await setDoc(doc(db, "onsite_sets", setId), { setId, isOnSite: nextVal });
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `onsite_sets/${setId}`);
    }
  };

  const handleUpdateItemVerification = async (
    setId: string,
    itemId: string,
    status: "tray-verified" | "source-verified" | "unverified",
    verifiedBy?: string,
    verifiedDate?: string
  ) => {
    if (!unlocked) { setShowAdminModal(true); return; }
    try {
      const dbRef = doc(db, "set_verifications", setId);
      const existing = verifications[setId] || {};
      const updatedItems = { ...existing };

      if (status === "unverified") {
        delete updatedItems[itemId];
      } else {
        updatedItems[itemId] = {
          verificationStatus: status,
          verifiedBy,
          verifiedDate
        };
      }

      const updatedVerifications = {
        ...verifications,
        [setId]: updatedItems
      };
      setVerifications(updatedVerifications);
      saveLocalVerifications(updatedVerifications);

      await setDoc(dbRef, {
        setId,
        items: updatedItems
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `set_verifications/${setId}`);
    }
  };

  const handleUpdateBulkVerification = async (
    setId: string,
    targetSet: TraumaSet,
    status: "tray-verified" | "source-verified" | "unverified",
    verifiedBy?: string,
    verifiedDate?: string
  ) => {
    if (!unlocked) { setShowAdminModal(true); return; }
    try {
      const dbRef = doc(db, "set_verifications", setId);
      const updatedItems = { ...(verifications[setId] || {}) };

      const screws = targetSet.screws || [];
      const plates = targetSet.plates || [];

      screws.forEach((screw) => {
        if (status === "unverified") {
          delete updatedItems[screw.type];
        } else {
          updatedItems[screw.type] = {
            verificationStatus: status,
            verifiedBy,
            verifiedDate
          };
        }
      });

      plates.forEach((plate) => {
        if (status === "unverified") {
          delete updatedItems[plate];
        } else {
          updatedItems[plate] = {
            verificationStatus: status,
            verifiedBy,
            verifiedDate
          };
        }
      });

      const updatedVerifications = {
        ...verifications,
        [setId]: updatedItems
      };
      setVerifications(updatedVerifications);
      saveLocalVerifications(updatedVerifications);

      await setDoc(dbRef, {
        setId,
        items: updatedItems
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `set_verifications/${setId}`);
    }
  };

  const openItemVerificationFlow = (
    setId: string,
    itemId: string | undefined, // undefined for set bulk
    itemType: "screw" | "plate" | "set",
    itemName: string
  ) => {
    const setVerifs = verifications[setId] || {};
    let existingStatus: "tray-verified" | "source-verified" | "unverified" = "unverified";
    let existingBy = "";

    if (itemType === "set") {
      const setObj = DECORATED_SETS.find((s) => s.id === setId);
      if (setObj) {
        const computed = computeSetVerificationStatus(setObj, setVerifs);
        existingStatus = computed.status;
        existingBy = computed.verifiedBy || "";
      }
    } else if (itemId) {
      const record = setVerifs[itemId];
      if (record) {
        existingStatus = record.verificationStatus;
        existingBy = record.verifiedBy || "";
      }
    }

    setVerificationModalTarget({ setId, itemId, itemType, itemName });
    setVerificationStatusVal(existingStatus);
    setVerifierName(existingBy);
    setShowVerificationModal(true);
  };

  const handleConfirmVerificationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationModalTarget) return;

    // PHI GUARD: this is meant to be a staff name/ID, but it's still free
    // text that persists - block anything resembling patient data.
    const phi = checkPhi(verifierName);
    if (phi.blocking.length > 0) {
      setPhiBlockMessage(
        `Can't save — this field appears to contain patient information (${describeFindings(
          phi.blocking
        )}). Enter only your own name or staff ID.`
      );
      return;
    }

    const { setId, itemId, itemType } = verificationModalTarget;
    const targetSetObj = DECORATED_SETS.find((s) => s.id === setId);
    if (!targetSetObj) return;

    const todayStr = new Date().toISOString().split("T")[0]; // "YYYY-MM-DD"
    const byName = verifierName.trim() || undefined;

    if (itemType === "set") {
      handleUpdateBulkVerification(setId, targetSetObj, verificationStatusVal, byName, todayStr);
    } else if (itemId) {
      handleUpdateItemVerification(setId, itemId, verificationStatusVal, byName, todayStr);
    }

    setShowVerificationModal(false);
    setVerificationModalTarget(null);
  };



  // Clear query helper
  const handleClearQuery = () => {
    setSearchQuery("");
  };

  // Click on suggestion tag helper
  const handleSelectTag = (tag: string) => {
    setSearchQuery(tag);
  };

  // Filter sets by Alloy choice
  const materialFilteredSets = useMemo(() => {
    return DECORATED_SETS.filter((s) => {
      if (materialFilter === "all") return true;
      const mat = s.defaultMaterial || "Both";
      if (materialFilter === "SS") {
        return mat === "SS" || mat === "Both";
      }
      if (materialFilter === "Ti") {
        return mat === "Ti" || mat === "Both";
      }
      return true;
    });
  }, [materialFilter]);

  // Dynamically compute all unique screw sizes available in the reference dataset
  const availableScrewSizes = useMemo(() => {
    const sizes = new Set<string>();
    DECORATED_SETS.forEach((set) => {
      if (set && set.screws) {
        set.screws.forEach((sc) => {
          if (sc && sc.type) {
            const size = getScrewSize(sc.type);
            if (size !== "Other") {
              sizes.add(size);
            }
          }
        });
      }
    });
    return Array.from(sizes).sort((a, b) => parseFloat(a) - parseFloat(b));
  }, []);

  // Real diameters and hole-count buckets pulled from the actual plate
  // data, the same way availableScrewSizes is built from real screw data -
  // so the filter buttons only ever show options that genuinely exist in
  // the database, never a guessed/static list that could drift out of sync.
  // Find matches of screw lines across filtered sets
  const matchedScrews = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q && screwTypeFilter === "all" && screwSizeFilter === "all" && plateTypeFilter === "all") return [];
    const results: { set: TraumaSet; screw: Screw }[] = [];
    materialFilteredSets.forEach((s) => {
      if (s) {
        if (!matchesPlateTypeFilter(s.plates, plateTypeFilter)) return;
        if (s.screws) {
          s.screws.forEach((sc) => {
            if (!sc || !sc.type) return;
            // Apply functional class filter
            if (!matchesScrewTypeFilter(sc.type, screwTypeFilter)) return;
            // Apply size filter
            if (!matchesScrewSizeFilter(sc.type, screwSizeFilter)) return;

            if (q) {
              if (
                sc.type.toLowerCase().includes(q) ||
                (sc.notes || "").toLowerCase().includes(q)
              ) {
                results.push({ set: s, screw: sc });
              }
            } else {
              // If query is empty but filter is active, return matching screws
              results.push({ set: s, screw: sc });
            }
          });
        }
      }
    });
    return results;
  }, [searchQuery, materialFilteredSets, screwTypeFilter, screwSizeFilter, plateTypeFilter]);

  // Plate equivalent of matchedScrews - flattens every (set, plate line)
  // pair that matches the current search into a single list, for the plate
  // table view. Diameter/hole-count narrowing was removed per direct
  // instruction; plate type (gated upstream via materialFilteredSets/
  // plateTypeFilter on the whole set) and free-text search remain.
  const matchedPlates = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q && plateTypeFilter === "all") return [];
    const results: { set: TraumaSet; plate: string }[] = [];
    materialFilteredSets.forEach((s) => {
      if (!s || !s.plates) return;
      s.plates.forEach((p) => {
        if (q) {
          if (p.toLowerCase().includes(q) || (s.name && s.name.toLowerCase().includes(q))) {
            results.push({ set: s, plate: p });
          }
        } else {
          results.push({ set: s, plate: p });
        }
      });
    });
    return results;
  }, [searchQuery, materialFilteredSets, plateTypeFilter]);

  // Group by screw type for the "grouped" view
  const groupedScrews = useMemo(() => {
    const groups: { [screwType: string]: { set: TraumaSet; screw: Screw }[] } =
      {};
    matchedScrews.forEach((item) => {
      if (!item || !item.screw || !item.screw.type) return;
      const type = item.screw.type;
      if (!groups[type]) {
        groups[type] = [];
      }
      groups[type].push(item);
    });
    return groups;
  }, [matchedScrews]);

  // Flat list of matching sets for "sets" tab
  const matchedSetsInScrewMode = useMemo(() => {
    const bySet: { [setId: string]: { set: TraumaSet; screws: Screw[] } } = {};
    matchedScrews.forEach((item) => {
      if (!item || !item.set || !item.set.id || !item.screw || !item.screw.type) return;
      if (!bySet[item.set.id]) {
        bySet[item.set.id] = { set: item.set, screws: [] };
      }
      if (!bySet[item.set.id].screws.some((s) => s && s.type === item.screw.type)) {
        bySet[item.set.id].screws.push(item.screw);
      }
    });
    return Object.values(bySet);
  }, [matchedScrews]);

  // Search sets by name within the material-filtered sets
  const filteredSets = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    let sets = materialFilteredSets;
    if (screwTypeFilter !== "all" || screwSizeFilter !== "all") {
      sets = sets.filter((s) =>
        s && s.screws && s.screws.some((sc) => 
          sc && sc.type &&
          matchesScrewTypeFilter(sc.type, screwTypeFilter) &&
          matchesScrewSizeFilter(sc.type, screwSizeFilter)
        ),
      );
    }

    if (plateTypeFilter !== "all") {
      sets = sets.filter((s) => matchesPlateTypeFilter(s.plates, plateTypeFilter));
    }

    if (!q) return sets;

    // REFERENCE-NUMBER SEARCH: a query that looks like a catalog ref (digits
    // with dots, optional trailing sterile marker - e.g. "204.840",
    // "02.527.073", "02.535.195s*") is matched against the actual reference
    // numbers of every screw AND plate, not just the set name. This is the
    // cross-reference path: a surgeon or nurse can type the number stamped on
    // an implant/wrapper and find every set that carries it. Partial refs work
    // too (e.g. "02.527" finds the whole 2.7mm VOLT family).
    const looksLikeRef = /^[0-9][0-9.\s]*[0-9a-z*]*$/i.test(q) && /[0-9]/.test(q) && q.length >= 3;
    if (looksLikeRef) {
      const refQ = q.replace(/\s+/g, "");
      const refMatches = sets.filter((s) => {
        if (!s) return false;
        const screwHit = (s.screwFamilies || []).some((fam) =>
          fam.sizes.some((sz) => sz.ref && sz.ref.toLowerCase().replace(/\s+/g, "").includes(refQ))
        );
        const plateHit = (s.plateFamilies || []).some((fam) =>
          fam.sizes.some((sz) => sz.ref && sz.ref.toLowerCase().replace(/\s+/g, "").includes(refQ))
        );
        // also catch a name match, so a numeric query that also appears in a
        // set name (rare, but e.g. a P-number) still surfaces it
        const nameHit = s.name && s.name.toLowerCase().includes(q);
        const pNumberHit = s.pNumber && s.pNumber.toLowerCase().includes(q);
        return screwHit || plateHit || nameHit || pNumberHit;
      });
      // If the ref query matched anything, return those. If it matched nothing,
      // fall through to normal name search rather than showing an empty list
      // for a query that might just be a numeric name fragment.
      if (refMatches.length > 0) return refMatches;
    }

    if (mode === "plate") {
      return sets.filter((s) => 
        (s.name && s.name.toLowerCase().includes(q)) ||
        (s.pNumber && s.pNumber.toLowerCase().includes(q)) ||
        (s.plates && s.plates.some((p) => p.toLowerCase().includes(q)))
      );
    }

    return sets.filter((s) =>
      s && ((s.name && s.name.toLowerCase().includes(q)) ||
            (s.pNumber && s.pNumber.toLowerCase().includes(q)))
    );
  }, [searchQuery, materialFilteredSets, screwTypeFilter, screwSizeFilter, plateTypeFilter, mode]);

  // Handle open/close set detail
  const handleOpenSet = (id: string) => {
    setOpenSetId(id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCloseSet = () => {
    setOpenSetId(null);
  };

  // Look up selected set content
  const selectedSet = useMemo(() => {
    if (!openSetId) return null;
    return DECORATED_SETS.find((s) => s.id === openSetId) || null;
  }, [openSetId]);

  return (
    <div className="min-h-screen bg-slate-55 text-slate-800 flex flex-col antialiased">
      {/* Clinically Polished Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            {/* Signature Icon */}
            <div className="flex flex-shrink-0 select-none items-center justify-center w-[34px] h-[34px] bg-teal-50 border border-teal-150 rounded-xl" id="ortho-logo">
              <Stethoscope size={18} className="text-teal-850 animate-pulse" />
            </div>
            <div>
              <h1 className="text-base sm:text-xl font-bold font-display tracking-tight text-slate-900 flex items-center gap-2">
                Orthopedic Implants Manager
              </h1>
              <p className="text-[10px] sm:text-xs text-slate-450 font-medium tracking-normal mt-0.5">
                Pediatrics Orthopaedic • Orthopaedic Reference System
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowHelpModal(true)}
              className="relative flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-650 hover:text-slate-850 bg-slate-50 hover:bg-slate-100/90 rounded-xl border border-slate-200 cursor-pointer select-none transition shadow-2xs hover:shadow-xs"
              id="btn-open-help-modal"
              title="Help & FAQ"
            >
              <HelpCircle size={13} className="text-slate-500" />
              <span>Help</span>
            </button>

            <button
              onClick={() => setShowRepsModal(true)}
              className="relative flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 hover:text-slate-955 bg-slate-100 hover:bg-slate-200/80 rounded-xl border border-slate-205 cursor-pointer select-none transition shadow-2xs hover:shadow-xs"
              id="btn-open-reps-modal"
            >
              <Phone size={13} className="text-[#00A3E0]" />
              <span className="hidden xs:inline">Vendor Reps</span>
              <span className="xs:hidden">Reps</span>
            </button>
            <button
              onClick={() => { setOrderSubmittedId(""); setShowReorderModal(true); }}
              className="relative flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-teal-850 hover:text-teal-955 bg-[#F4FAFD] hover:bg-[#E0F2FE]/80 rounded-xl border border-teal-200 cursor-pointer select-none transition shadow-2xs hover:shadow-xs"
              id="btn-open-reorder-cart"
            >
              <ClipboardList size={13} className="text-teal-805" />
              <span className="hidden xs:inline">Reorder Form</span>
              <span className="xs:hidden">Reorders</span>
              {reorderList.length > 0 && (
                <span className="flex h-5 min-w-5 px-1.5 items-center justify-center text-[9px] bg-[#ED1B2F] text-white rounded-full font-extrabold shadow-2xs">
                  {reorderList.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              )}
            </button>

            <button
              onClick={() => setShowSetsModal(true)}
              className="relative flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-teal-850 hover:text-teal-955 bg-[#EFF6FF] hover:bg-blue-105/90 rounded-xl border border-blue-200 cursor-pointer select-none transition shadow-2xs hover:shadow-xs"
              id="btn-open-sets-modal"
            >
              <Layers size={13} className="text-blue-700" />
              <span>Sets</span>
            </button>

            {/* Edit-unlock status: anyone can read/search regardless of this
                state. The password is only required to edit, verify, order,
                or flag - and "unlocked" just means the team password was
                entered this browser session (see PasswordGate.tsx).
                Per team decision, the single entry point for entering the
                password is the Secure Archive popup below, not a separate
                toolbar control - this button only shows the re-lock action
                once already unlocked. */}
            {unlocked && (
              <button
                onClick={() => lock()}
                title="Editing unlocked for this session - click to re-lock"
                className="relative flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100/80 rounded-xl border border-emerald-200 cursor-pointer select-none transition shadow-2xs hover:shadow-xs"
              >
                <span className="hidden sm:inline">Editing unlocked</span>
                <span className="sm:hidden">Unlocked</span>
              </button>
            )}

            <button
              onClick={() => {
                setShowContaminationModal(true);
                if (!selectedContaminatedSetId && DECORATED_SETS.length > 0) {
                  setSelectedContaminatedSetId(DECORATED_SETS[0].id);
                }
              }}
              className="relative flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-rose-850 hover:text-rose-955 bg-rose-50 hover:bg-rose-100/70 rounded-xl border border-rose-200 cursor-pointer select-none transition shadow-2xs hover:shadow-xs"
              id="btn-open-contamination-wizard"
            >
              <AlertTriangle size={13} className="text-rose-600 animate-pulse" />
              <span className="hidden sm:inline">Contamination Protocol</span>
              <span className="sm:hidden">Contamination</span>
            </button>

            <button
              id="btn-open-flag-issue"
              onClick={() => {
                setShowFlagIssueModal(true);
                setFlaggedSuccessMessage(false);
              }}
              className="relative flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-blue-800 hover:text-white bg-blue-50 hover:bg-blue-600 rounded-xl border border-blue-200 cursor-pointer select-none transition shadow-2xs hover:shadow-xs group"
            >
              <AlertTriangle size={13} className="text-blue-500 group-hover:text-white" />
              <span>Flag an issue</span>
            </button>

            <button
              onClick={() => {
                setShowAdminModal(true);
                setIsPasswordIncorrect(false);
              }}
              className="relative flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-amber-850 hover:text-amber-955 bg-amber-50 hover:bg-amber-100 rounded-xl border border-amber-200 cursor-pointer select-none transition shadow-2xs hover:shadow-xs"
              id="btn-open-secure-archive"
            >
              {unlocked ? <Unlock size={13} className="text-emerald-600" /> : <Lock size={13} className="text-amber-700" />}
              <span className="hidden xs:inline">Secure Archive</span>
              <span className="xs:hidden">Archive</span>
              {archivedOrders.length > 0 && (
                <span className="flex h-4 min-w-4 px-1 items-center justify-center text-[8px] bg-amber-600 text-white rounded-full font-bold">
                  {archivedOrders.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6" id="main-content-flow">
        <AnimatePresence mode="wait">
          {selectedSet ? (
            <div key="detail">
              <SetDetail
                traumaSet={selectedSet}
                customLocation={
                  customLocations[selectedSet.id] ||
                  selectedSet.defaultLocation ||
                  "Cabinet Core C, Shelf 4"
                }
                onBack={handleCloseSet}
                searchQuery={searchQuery}
                onSaveLocation={handleSaveLocation}
                onAddReorder={handleInitiateUsageLog}
                onOutOfStock={handleOutOfStockAlert}
                isOnSite={!!onSiteSetsMap[selectedSet.id]}
                onToggleOnSite={handleToggleOnSite}
                onAddPlateReorder={handleAddPlateReorder}
                setVerifications={verifications[selectedSet.id] || {}}
                onVerifyClick={(itemId, itemType, itemName) => openItemVerificationFlow(selectedSet.id, itemId, itemType, itemName)}
                onAddManualItemClick={() => {
                  setManualSetId(""); setManualImplantType(""); setManualCatalogRef(""); setManualQty(1);
                  setShowManualEntryModal(true);
                }}
              />
            </div>
          ) : (
            <motion.div
              key="list-view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className="w-full"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* 🛠️ INTEGRATED DENTAL & TRAUMA SIDEBAR CONTROL STATION */}
                <div className="lg:col-span-4 space-y-4">
                  {/* SEARCH OPTIONS CARD */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3">
                    <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest select-none flex items-center gap-1.5">
                      <LayoutGrid size={13} className="text-[#00A3E0]" />
                      <span>Search Strategy</span>
                    </h3>
                    
                    <div
                      className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/40 select-none"
                      id="mode-toggle-group"
                    >
                      <button
                        id="btn-mode-set"
                        onClick={() => {
                          setMode("set");
                          setOpenSetId(null);
                        }}
                        className={`flex-1 py-1.5 px-2 text-[11px] font-semibold rounded-lg transition-all duration-150 flex items-center justify-center gap-1 cursor-pointer select-none ${
                          mode === "set"
                            ? "bg-white text-teal-850 font-bold shadow-xs border border-slate-200"
                            : "text-slate-500 hover:text-slate-800 hover:bg-slate-200/40"
                        }`}
                      >
                        <Layers
                          size={12}
                          className={mode === "set" ? "text-teal-850" : "text-slate-400"}
                        />
                        <span>Find by set</span>
                      </button>
                      <button
                        id="btn-mode-screw"
                        onClick={() => {
                          setMode("screw");
                          setOpenSetId(null);
                        }}
                        className={`flex-1 py-1.5 px-2 text-[11px] font-semibold rounded-lg transition-all duration-155 flex items-center justify-center gap-1 cursor-pointer select-none ${
                          mode === "screw"
                            ? "bg-white text-teal-850 font-bold shadow-xs border border-slate-200"
                            : "text-slate-500 hover:text-slate-800 hover:bg-slate-200/40"
                        }`}
                      >
                        <FolderOpen
                          size={12}
                          className={mode === "screw" ? "text-teal-850" : "text-slate-400"}
                        />
                        <span>Find by screw</span>
                      </button>
                      <button
                        id="btn-mode-plate"
                        onClick={() => {
                          setMode("plate");
                          setOpenSetId(null);
                        }}
                        className={`flex-1 py-1.5 px-2 text-[11px] font-semibold rounded-lg transition-all duration-150 flex items-center justify-center gap-1 cursor-pointer select-none ${
                          mode === "plate"
                            ? "bg-white text-teal-850 font-bold shadow-xs border border-slate-200"
                            : "text-slate-500 hover:text-slate-800 hover:bg-slate-200/40"
                        }`}
                      >
                        <LayoutGrid
                          size={12}
                          className={mode === "plate" ? "text-teal-850" : "text-slate-400"}
                        />
                        <span>Find by plate</span>
                      </button>
                    </div>

                    {/* Enhanced Keyword Search Input */}
                    <div className="relative group shadow-3xs" id="searchbar-container">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-650 transition pointer-events-none">
                        <Search size={14} />
                      </span>
                      <input
                        id="search-input"
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={
                          mode === "screw"
                            ? "e.g. 3.5 cortex, 4.0 locking..."
                            : mode === "plate"
                              ? "e.g. LCP Broad, T-Plate, Volt..."
                              : "e.g. Small Fragment, Pelvic..."
                        }
                        className="w-full bg-slate-50 hover:bg-white border border-slate-200 rounded-xl pl-8.5 pr-8 py-2.5 text-xs text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-teal-705/10 focus:border-[#008CBF] transition shadow-inner-3xs"
                      />
                      {searchQuery && (
                        <button
                          id="btn-clear-search"
                          onClick={handleClearQuery}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 h-5 w-5 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition cursor-pointer"
                          title="Clear search"
                        >
                          <X size={12} />
                        </button>
                      )}
                    </div>
                              {/* HIGH CONTRAST MEDICAL FILTER BOARD */}
                  <div
                    className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-4.5"
                    id="filter-panel-card"
                  >
                    {/* Filter 1: Screw Diameter Size */}
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-widest select-none pb-0.5">
                        <span className="flex items-center gap-1.5 animate-fadeIn">
                          <SlidersHorizontal size={12} className="text-teal-705" strokeWidth={2.5} />
                          <span>Screw Diameter</span>
                        </span>
                      </div>
                      <div className="flex gap-1.5 flex-wrap" id="screw-size-filter-group">
                        <button
                          onClick={() => setScrewSizeFilter("all")}
                          className={`px-2.5 py-1.5 text-[11px] font-bold rounded-lg border transition-all duration-150 cursor-pointer select-none ${
                            screwSizeFilter === "all"
                              ? "bg-teal-800 text-white border-teal-850 shadow-3xs font-extrabold"
                              : "bg-slate-50 hover:bg-slate-100 text-slate-655 border-slate-200 shadow-3xs hover:text-slate-800"
                          }`}
                        >
                          All Sizes
                        </button>
                        {availableScrewSizes.map((size) => (
                          <button
                            key={size}
                            onClick={() => setScrewSizeFilter(size)}
                            className={`px-2.5 py-1.5 text-[11px] font-bold rounded-lg border transition-all duration-150 cursor-pointer select-none ${
                              screwSizeFilter === size
                                ? "bg-teal-800 text-white border-teal-850 shadow-3xs font-extrabold"
                                : "bg-slate-50 hover:bg-slate-100 text-slate-650 border-slate-200 shadow-3xs hover:text-slate-800"
                            }`}
                          >
                            {size} mm
                          </button>
                        ))}
                      </div>

                      {/* Plate Type Filters Added Under Screw Diameter */}
                      <div className="pt-2.5 border-t border-slate-100/70 flex flex-col gap-1.5">
                        <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-widest select-none pb-0.5">
                          <span className="flex items-center gap-1.5">
                            <Layers size={11} className="text-teal-705" />
                            <span>Filter by Plate Type</span>
                          </span>
                          {plateTypeFilter !== "all" && (
                            <button
                              onClick={() => setPlateTypeFilter("all")}
                              className="text-[10px] text-teal-805 hover:underline font-extrabold cursor-pointer"
                            >
                              Reset
                            </button>
                          )}
                        </div>
                        <div className="flex gap-1.5 flex-wrap" id="plate-type-filter-group">
                          {[
                            { id: "all", label: "All Plates" },
                            { id: "lcp", label: "LCP/Locking" },
                            { id: "dhs", label: "DHS" },
                            { id: "t-plate", label: "T-/L-/Y-Plates" },
                            { id: "tubular", label: "Tubular" },
                            { id: "osteotomy", label: "Osteotomy" },
                            { id: "pediplates", label: "Pediplates" },
                            { id: "volt", label: "Volt Plates" },
                          ].map((pCat) => (
                            <button
                              key={pCat.id}
                              onClick={() => setPlateTypeFilter(pCat.id)}
                              className={`px-2.5 py-1.5 text-[11px] font-bold rounded-lg border transition-all duration-150 cursor-pointer select-none ${
                                plateTypeFilter === pCat.id
                                  ? "bg-teal-800 text-white border-teal-850 shadow-3xs font-extrabold"
                                  : "bg-slate-50 hover:bg-slate-100 text-slate-650 border-slate-200 shadow-3xs hover:text-slate-800"
                              }`}
                            >
                              {pCat.label}
                            </button>
                          ))}
                        </div>
                      </div>

                    </div>

                    <div className="h-[1px] bg-slate-100" />

                    {/* Filter 2: Screw Type */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-widest select-none pb-0.5">
                        <span className="flex items-center gap-1.5">
                          <Wrench size={12} className="text-[#00A3E0]" strokeWidth={2.5} />
                          <span>Screw Type</span>
                        </span>
                      </div>
                      <div className="grid grid-cols-2 xs:grid-cols-3 gap-1.5" id="screw-class-filter-group">
                        {(
                          [
                            "all",
                            "Cannulated",
                            "Locking",
                            "Cortex",
                            "Cancellous",
                          ] as const
                        ).map((filter) => (
                          <button
                            key={filter}
                            onClick={() => setScrewTypeFilter(filter)}
                            className={`py-1.5 px-2 text-[11px] font-bold rounded-lg border transition-all duration-150 cursor-pointer select-none text-center ${
                              screwTypeFilter === filter
                                ? "bg-teal-800 text-white border-teal-850 shadow-3xs"
                                : "bg-slate-50 hover:bg-slate-100 text-slate-655 border-slate-200/80 shadow-3xs hover:text-slate-900"
                            }`}
                          >
                            {filter === "all" ? "All" : filter}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="h-[1px] bg-slate-100" />

                    {/* Filter 3: Alloy Material Selection */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-widest select-none pb-0.5">
                        <span className="flex items-center gap-1.5">
                          <SlidersHorizontal size={12} className="text-[#00A3E0]" />
                          <span>Alloy Material</span>
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-1.5" id="material-filter-group">
                        {(["all", "SS", "Ti"] as const).map((filter) => (
                          <button
                            key={filter}
                            onClick={() => setMaterialFilter(filter)}
                            className={`py-1.5 px-2 text-[11px] font-bold rounded-lg border transition-all duration-150 cursor-pointer select-none text-center ${
                              materialFilter === filter
                                ? "bg-teal-800 text-white border-teal-850 shadow-3xs"
                                : "bg-slate-50 hover:bg-slate-100 text-slate-655 border-slate-200/80 shadow-3xs hover:text-slate-900"
                            }`}
                          >
                            {filter === "all"
                              ? "All"
                              : filter === "SS"
                                ? "Steel"
                                : "Titanium"}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="h-[1px] bg-slate-100" />

                    {/* Reset Search Parameters Widget */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-widest select-none pb-0.5">
                        <span className="flex items-center gap-1.5 animate-fadeIn">
                          <RotateCcw size={11} className="text-[#00A3E0]" />
                          <span>Search Controls</span>
                        </span>
                      </div>
                      <div className="bg-slate-50 border border-slate-205 rounded-xl p-3.5 space-y-3 shadow-3xs" id="reset-search-parameters-container">
                        <p className="text-[10.5px] text-slate-500 font-semibold leading-relaxed">
                          Click below to clear all filters, active search queries, and manufacturer preferences.
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setSearchQuery("");
                            setMaterialFilter("all");
                            setScrewTypeFilter("all");
                            setScrewSizeFilter("all");
                            setPlateTypeFilter("all");
                            setSelectedCompanyFilter("all");
                          }}
                          className="w-full py-2 px-3 bg-teal-800 hover:bg-teal-900 border border-teal-950 text-white font-bold text-xs rounded-xl shadow-2xs hover:shadow-xs transition duration-150 cursor-pointer select-none flex items-center justify-center gap-1.5 uppercase tracking-wide"
                        >
                          <RotateCcw size={12} className="text-teal-200 stroke-[2.5]" />
                          <span>Reset Parameters</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                </div>

                {/* 📋 DYNAMIC SEARCH RESULTS MAIN PANEL */}
                <div className="lg:col-span-8 space-y-4">

              {/* View switches & search metadata feedback banner */}
              {(mode === "screw" || mode === "plate") &&
              (searchQuery.trim() !== "" || screwTypeFilter !== "all" || screwSizeFilter !== "all" || plateTypeFilter !== "all") ? (
                <div className="space-y-4" id="screw-view-search-results">
                  {/* Tabs view selection */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-3">
                    <div
                      className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200 select-none"
                      id="view-tabs"
                    >
                      <button
                        id="tab-view-grouped"
                        onClick={() => setView("grouped")}
                        className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer select-none ${
                          view === "grouped"
                            ? "bg-white text-teal-800 shadow-xs font-bold border border-slate-205"
                            : "text-slate-500 hover:text-slate-750 font-medium"
                        }`}
                      >
                        <LayoutGrid size={13} />
                        By screw
                      </button>
                      <button
                        id="tab-view-sets"
                        onClick={() => setView("sets")}
                        className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer select-none ${
                          view === "sets"
                            ? "bg-white text-teal-800 shadow-xs font-bold border border-slate-205"
                            : "text-slate-500 hover:text-slate-750 font-medium"
                        }`}
                      >
                        <Layers size={13} />
                        By set
                      </button>
                      <button
                        id="tab-view-table"
                        onClick={() => setView("table")}
                        className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer select-none ${
                          view === "table"
                            ? "bg-white text-teal-800 shadow-xs font-bold border border-slate-205"
                            : "text-slate-500 hover:text-slate-750 font-medium"
                        }`}
                      >
                        <Table size={13} />
                        Table
                      </button>
                    </div>

                    <div
                      className="text-xs text-slate-500 font-medium bg-white px-2.5 py-1 rounded-md border border-slate-200 shadow-inner-sm"
                      id="matching-stats-pill"
                    >
                      Found{" "}
                      <strong className="text-teal-700">
                        {matchedScrews.length}
                      </strong>{" "}
                      matching screw{matchedScrews.length !== 1 ? "s" : ""}{" "}
                      across{" "}
                      <strong className="text-teal-700">
                        {matchedSetsInScrewMode.length}
                      </strong>{" "}
                      set{matchedSetsInScrewMode.length !== 1 ? "s" : ""}
                    </div>
                  </div>

                  {/* Search Output */}
                  <AnimatePresence mode="wait">
                    {matchedScrews.length === 0 ? (
                      <motion.div
                        key="empty"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-white border border-slate-200 rounded-2xl p-8 text-center space-y-3"
                        id="empty-state-container"
                      >
                        <div className="max-w-xs mx-auto text-slate-450 flex flex-col items-center">
                          <AlertTriangle
                            size={36}
                            className="text-slate-300 stroke-1.5 mb-2"
                          />
                          <h3 className="text-sm font-semibold text-slate-900">
                            No matching screws found
                          </h3>
                          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                            We couldn't find any implants matching your current
                            search terms, alloy selection, or screw type
                            filters.
                          </p>
                          <div className="pt-2 flex flex-col gap-2 w-full">
                            <button
                              onClick={() => {
                                setManualSetId(""); setManualImplantType(""); setManualCatalogRef(""); setManualQty(1);
                                setShowManualEntryModal(true);
                              }}
                              className="px-4 py-2 bg-amber-50 hover:bg-amber-100 border border-amber-250 text-amber-850 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-3xs"
                              id="btn-screws-search-add-custom-item"
                            >
                              <Plus size={13} className="text-amber-600 stroke-[2.5]" />
                              <span>Can't find it? Add it manually</span>
                            </button>
                            <button
                              onClick={() => {
                                handleClearQuery();
                                setMaterialFilter("all");
                                setScrewTypeFilter("all");
                                setScrewSizeFilter("all");
                              }}
                              className="px-4 py-1.5 bg-slate-100 hover:bg-slate-205 text-slate-755 rounded-xl text-xs font-semibold border border-slate-200 transition cursor-pointer"
                              id="btn-failed-search-reset"
                            >
                              Reset All Filters & Search
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ) : view === "grouped" ? (
                      /* Grouped by screw results */
                      <motion.div
                        key="grouped"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-4"
                        id="grouped-screws-list"
                      >
                        {Object.keys(groupedScrews)
                          .sort()
                          .map((screwType) => {
                            const occurrences = groupedScrews[screwType];
                            return (
                              <div
                                key={screwType}
                                className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs transition hover:shadow-sm"
                                id={`grouped-card-${screwType.toLowerCase().replace(/\s+/g, "-")}`}
                              >
                                <div className="text-base font-bold text-teal-800 tracking-tight pb-3 border-b border-slate-100 flex items-center justify-between gap-2">
                                  <span className="flex items-center gap-2">
                                    <span className="h-2 w-2 rounded-full bg-teal-600"></span>
                                    <Highlight
                                      text={screwType}
                                      query={searchQuery}
                                    />
                                  </span>
                                  <span className="text-[10px] uppercase tracking-wider font-semibold bg-slate-105 text-slate-500 px-2 py-0.5 rounded border border-slate-200">
                                    {occurrences.length} set
                                    {occurrences.length !== 1 ? "s" : ""}
                                  </span>
                                </div>
                                <div className="mt-3 divide-y divide-slate-50">
                                  {occurrences.map(({ set, screw }, subIdx) => {
                                    const currentLoc =
                                      customLocations[set.id] ||
                                      set.defaultLocation ||
                                      "Core Cabinet";
                                    return (
                                      <div
                                        key={subIdx}
                                        onClick={() => handleOpenSet(set.id)}
                                        className="py-2.5 flex items-center justify-between text-sm hover:bg-teal-50/20 px-2 rounded-lg cursor-pointer transition group"
                                        id={`grouped-sub-row-${set.id}`}
                                      >
                                        <div className="flex flex-col">
                                          <span className="text-slate-707 font-medium group-hover:text-teal-750 transition flex items-center gap-1.5 flex-wrap">
                                            <span>{set.name}</span>
                                            <VerificationBadge
                                              status={computeSetVerificationStatus(set, verifications[set.id] || {}).status}
                                              verifiedBy={computeSetVerificationStatus(set, verifications[set.id] || {}).verifiedBy}
                                              verifiedDate={computeSetVerificationStatus(set, verifications[set.id] || {}).verifiedDate}
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                openItemVerificationFlow(set.id, undefined, "set", set.name);
                                              }}
                                              size="sm"
                                            />
                                          </span>
                                          <div className="flex flex-wrap items-center gap-1.5 mt-0.5 text-[10px] text-slate-400">
                                            <span className="font-semibold text-slate-500 bg-slate-100/70 px-1.5 py-0.2 rounded border border-slate-200/10">
                                              📍 {currentLoc}
                                            </span>
                                            {set.defaultMaterial && (
                                              <span className="text-slate-400">
                                                ({set.defaultMaterial})
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                        <div className="flex items-center gap-2 self-stretch sm:self-center">
                                          <div className="font-mono text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 group-hover:border-teal-350 group-hover:bg-teal-55 group-hover:text-teal-805 transition">
                                            <span>{screw.lengthRange}</span>
                                            <span className="text-[10px] text-slate-400 ml-0.5">
                                              mm
                                            </span>
                                          </div>
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleInitiateUsageLog(
                                                screw,
                                                set,
                                              );
                                            }}
                                            className="px-2 py-1 bg-slate-100 dark:bg-slate-100 hover:bg-teal-850 hover:text-white border border-slate-200 hover:border-teal-900 text-[10px] text-slate-650 font-extrabold rounded select-none cursor-pointer transition flex items-center gap-0.5 uppercase tracking-wider"
                                            title="Record usage for this implant"
                                          >
                                            <Plus size={10} strokeWidth={2.5} />
                                            <span>Use</span>
                                          </button>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })}
                      </motion.div>
                    ) : view === "sets" ? (
                      /* Flat set view containing matches */
                      <motion.div
                        key="sets"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-3"
                        id="sets-screws-list"
                      >
                        {matchedSetsInScrewMode.map(({ set, screws }) => {
                          const currentLoc =
                            customLocations[set.id] ||
                            set.defaultLocation ||
                            "Core Cabinet";
                          const computedStatus = computeSetVerificationStatus(set, verifications[set.id] || {});
                          return (
                            <div
                              key={set.id}
                              onClick={() => handleOpenSet(set.id)}
                              className="bg-white border border-slate-200 hover:border-teal-400 rounded-2xl p-4 sm:p-5 shadow-xs hover:shadow-sm cursor-pointer transition group flex flex-col justify-between"
                              id={`matching-set-card-${set.id}`}
                            >
                              <div className="flex justify-between items-start gap-4">
                                <div className="space-y-1">
                                  <h3 className="text-base font-bold text-slate-900 group-hover:text-teal-750 transition font-display leading-tight flex items-center gap-1.5 flex-wrap">
                                    <span>{set.name}</span>
                                    <VerificationBadge
                                      status={computedStatus.status}
                                      verifiedBy={computedStatus.verifiedBy}
                                      verifiedDate={computedStatus.verifiedDate}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        openItemVerificationFlow(set.id, undefined, "set", set.name);
                                      }}
                                      size="sm"
                                    />
                                  </h3>
                                  <div className="flex flex-wrap items-center gap-1.5 mt-1.5 text-[10px] text-slate-400 font-medium">
                                    <span className="text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200/40">
                                      📍 {currentLoc}
                                    </span>
                                    <span className="text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200/40">
                                      Alloy: {set.defaultMaterial || "Both"}
                                    </span>
                                  </div>
                                </div>
                                <span className="text-[10px] font-semibold text-slate-400 group-hover:text-teal-650 flex-shrink-0">
                                  View Full Set &rarr;
                                </span>
                              </div>
                              <div className="flex flex-wrap gap-1.5 mt-3 pt-2.5 border-t border-slate-100">
                                {screws.map((sc, scIdx) => (
                                  <span
                                    key={scIdx}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleInitiateUsageLog(sc, set);
                                    }}
                                    className="inline-flex items-center gap-1 text-[11px] font-semibold bg-teal-50 text-teal-850 hover:bg-teal-100 hover:text-teal-950 px-2.5 py-1 rounded-lg border border-teal-250/60 hover:border-teal-400 transition cursor-pointer select-none shadow-3xs group/tag"
                                    title="Click to register implant use"
                                  >
                                    <Plus
                                      size={10}
                                      className="text-teal-650 group-hover/tag:scale-115 transition"
                                    />
                                    <span>
                                      <Highlight
                                        text={sc.type}
                                        query={searchQuery}
                                      />
                                    </span>
                                    <span className="text-teal-400 font-normal select-none">
                                      &bull;
                                    </span>
                                    <span className="font-mono text-[10px] text-teal-700 bg-white px-1 rounded border border-teal-200/50">
                                      {sc.lengthRange} mm
                                    </span>
                                  </span>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </motion.div>
                    ) : (
                      /* Table view comparison - branches by mode since
                         screws and plates have different relevant columns
                         (length/increment vs diameter/hole count). */
                      <motion.div
                        key="table"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden"
                        id="table-comparison-container"
                      >
                        <div className="overflow-x-auto">
                          {mode === "plate" ? (
                            <table className="w-full text-left text-xs border-collapse">
                              <thead>
                                <tr className="bg-slate-50 border-b border-slate-205 text-slate-600 font-bold tracking-wider">
                                  <th className="p-3.5 pl-4">Plate</th>
                                  <th className="p-3.5">Trauma Set</th>
                                  <th className="p-3.5">Location</th>
                                  <th className="p-3.5">Diameter</th>
                                  <th className="p-3.5">Holes</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 text-slate-700">
                                {matchedPlates.map(({ set, plate }, idx) => {
                                  const { diameter, holes } = parsePlateLineForFilter(plate);
                                  const cleanLabel = plate.replace(/#\s*[\w.]+\s*$/, "").replace(/^PLATES?\s*-?\s*/i, "").trim();
                                  return (
                                    <tr
                                      key={idx}
                                      onClick={() => handleOpenSet(set.id)}
                                      className="hover:bg-slate-50/80 cursor-pointer transition"
                                      id={`plate-table-row-${idx}`}
                                    >
                                      <td className="p-3.5 pl-4 font-semibold text-slate-900">
                                        <Highlight text={cleanLabel} query={searchQuery} />
                                      </td>
                                      <td className="p-3.5 text-slate-500 font-medium">{set.name}</td>
                                      <td className="p-3.5 text-slate-500 font-mono text-[11px]">
                                        {customLocations[set.id] || set.defaultLocation || "Core"}
                                      </td>
                                      <td className="p-3.5 font-mono text-teal-700 font-bold whitespace-nowrap">
                                        {diameter ? `${diameter} mm` : "—"}
                                      </td>
                                      <td className="p-3.5 font-mono text-slate-700 font-bold whitespace-nowrap">
                                        {holes !== null ? holes : "—"}
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          ) : (
                          <table className="w-full text-left text-xs border-collapse">
                            <thead>
                              <tr className="bg-slate-50 border-b border-slate-205 text-slate-600 font-bold tracking-wider">
                                <th className="p-3.5 pl-4">Screw Type</th>
                                <th className="p-3.5">Trauma Set</th>
                                <th className="p-3.5">Location</th>
                                <th className="p-3.5">Length Range</th>
                                <th className="p-3.5">Increment</th>
                                <th className="p-3.5 pr-4 text-right">
                                  Action
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-slate-700">
                              {matchedScrews.map(({ set, screw }, idx) => (
                                <tr
                                  key={idx}
                                  onClick={() => handleOpenSet(set.id)}
                                  className="hover:bg-slate-50/80 cursor-pointer transition"
                                  id={`table-row-${idx}`}
                                >
                                  <td className="p-3.5 pl-4 font-semibold text-slate-900">
                                    <Highlight
                                      text={screw.type}
                                      query={searchQuery}
                                    />
                                  </td>
                                  <td className="p-3.5 text-slate-500 font-medium">
                                    {set.name}
                                  </td>
                                  <td className="p-3.5 text-slate-500 font-mono text-[11px]">
                                    {customLocations[set.id] ||
                                      set.defaultLocation ||
                                      "Core"}
                                  </td>
                                  <td className="p-3.5 font-mono text-teal-700 font-bold whitespace-nowrap">
                                    {screw.lengthRange} mm
                                  </td>
                                  <td className="p-3.5 text-slate-500 italic">
                                    <Highlight
                                      text={
                                        screw.notes || screw.interval || "N/A"
                                      }
                                      query={searchQuery}
                                    />
                                  </td>
                                  <td className="p-3.5 pr-4 text-right">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleInitiateUsageLog(screw, set);
                                      }}
                                      className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-teal-850 hover:bg-teal-900 border border-teal-950 text-white text-[10px] font-bold rounded cursor-pointer transition select-none tracking-wide"
                                      title="Record use"
                                    >
                                      <Plus size={10} strokeWidth={2.5} />
                                      <span>Use</span>
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                /* Flat set list mode (When searching by set, or when 'find by screw' has no keyword query entered) */
                <div className="space-y-4" id="sets-view-results-container">
                  <div className="flex items-center justify-between px-1 text-xs text-slate-400 font-semibold uppercase tracking-wider select-none">
                    <span>Orthopedic Trauma Sets</span>
                    <span className="text-slate-500 font-medium flex items-center gap-1 lowercase">
                      <FileCheck size={12} className="text-teal-650" />
                      {filteredSets.length} sets matched
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-3.5">
                    {filteredSets.length === 0 ? (
                      <div className="bg-white border border-slate-205 rounded-2xl p-8 text-center space-y-3">
                        <AlertTriangle
                          size={32}
                          className="mx-auto text-slate-300"
                        />
                        <div className="space-y-1">
                          <h3 className="text-sm font-semibold text-slate-905">
                            No matching sets found
                          </h3>
                          <p className="text-xs text-slate-400">
                            Try searching for &ldquo;Fragment&rdquo;,
                            &ldquo;Hip&rdquo;, or select a different alloy status.
                          </p>
                        </div>
                        <div className="pt-1 select-none max-w-xs mx-auto">
                          <button
                            onClick={() => {
                              setManualSetId(""); setManualImplantType(""); setManualCatalogRef(""); setManualQty(1);
                              setShowManualEntryModal(true);
                            }}
                            className="w-full px-4 py-2 bg-amber-50 hover:bg-amber-100 border border-amber-250 text-amber-850 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-3xs"
                            id="btn-sets-search-add-custom-item"
                          >
                            <Plus size={13} className="text-amber-600 stroke-[2.5]" />
                            <span>Can't find it? Add it manually</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      filteredSets.map((s) => {
                        const currentLoc =
                          customLocations[s.id] ||
                          s.defaultLocation ||
                          "Core Cabinet";
                        const computedStatus = computeSetVerificationStatus(s, verifications[s.id] || {});
                        return (
                          <div
                            key={s.id}
                            onClick={() => handleOpenSet(s.id)}
                            className="bg-white border border-slate-205 hover:border-teal-400/85 rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-4 cursor-pointer shadow-xs hover:shadow-sm group transition duration-150 animate-fadeIn"
                            id={`set-card-${s.id}`}
                          >
                            <div className="space-y-1.5 text-left">
                              <h3 className="text-[15px] sm:text-base font-bold font-display text-slate-905 leading-tight group-hover:text-teal-750 transition flex items-center gap-1.5 flex-wrap">
                                <Highlight
                                  text={s.name}
                                  query={mode === "set" ? searchQuery : ""}
                                />
                                <VerificationBadge
                                  status={computedStatus.status}
                                  verifiedBy={computedStatus.verifiedBy}
                                  verifiedDate={computedStatus.verifiedDate}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openItemVerificationFlow(s.id, undefined, "set", s.name);
                                  }}
                                  size="sm"
                                />
                              </h3>
                              <div className="text-xs text-slate-400 font-medium flex flex-wrap items-center gap-1.5">
                                {s.screws && s.screws.length > 0 ? (
                                  <span className="font-mono text-teal-650 bg-teal-50 border border-teal-100/30 px-1.5 py-0.5 rounded">
                                    {s.screws.length} Screw Type
                                    {s.screws.length !== 1 ? "s" : ""}
                                  </span>
                                ) : (
                                  <span className="font-mono text-blue-650 bg-blue-50 border border-blue-100/30 px-1.5 py-0.5 rounded select-none">
                                    Plates Only
                                  </span>
                                )}
                                {s.plates && s.plates.length > 0 && (
                                  <span className="font-mono text-indigo-650 bg-indigo-50 border border-indigo-100/30 px-1.5 py-0.5 rounded select-none">
                                    {s.plates.length} Plate Type
                                    {s.plates.length !== 1 ? "s" : ""}
                                  </span>
                                )}
                                <span className="text-slate-500 bg-slate-100 border border-slate-200/40 px-1.5 py-0.5 rounded select-none">
                                  📍 {currentLoc}
                                </span>
                                <span className="text-slate-500 bg-slate-100 border border-slate-200/40 px-1.5 py-0.5 rounded select-none">
                                  Alloy: {s.defaultMaterial || "Both"}
                                </span>
                                {s.pNumber && (
                                  <span className="font-mono text-blue-650 bg-blue-50 border border-blue-100/70 px-1.5 py-0.5 rounded uppercase select-all" title="Hospital Catalog ID">
                                    Ref: {s.pNumber}
                                  </span>
                                )}
                                {s.hospitalNotes && (
                                  <span className="text-rose-700 bg-rose-50 border border-rose-150 px-1.5 py-0.5 rounded font-extrabold animate-pulse text-[10px]" title={s.hospitalNotes}>
                                    ⚠️ Caution
                                  </span>
                                )}
                                {s.source && (
                                  <span className="text-[10px] text-slate-350">
                                    • {s.source}
                                  </span>
                                )}
                              </div>

                              {/* Plate Search matches listing snippet */}
                              {s.plates && s.plates.length > 0 && (searchQuery.trim() !== "" || mode === "plate" || plateTypeFilter !== "all") && (
                                <div className="mt-2.5 text-xs text-slate-505 bg-slate-50/80 border border-slate-200/70 rounded-xl p-2.5 space-y-1 max-w-lg">
                                  <div className="text-[10.5px] uppercase font-bold text-slate-400 tracking-wider">
                                    Matching Plates ({
                                      s.plates.filter((p) => {
                                        if (mode === "plate") {
                                          if (!searchQuery.trim()) return true;
                                          return p.toLowerCase().includes(searchQuery.trim().toLowerCase());
                                        }
                                        if (plateTypeFilter !== "all") {
                                          return matchesPlateTypeFilter([p], plateTypeFilter);
                                        }
                                        return false;
                                      }).length
                                    }):
                                  </div>
                                  <div className="flex flex-col gap-1 max-h-24 overflow-y-auto">
                                    {s.plates
                                      .filter((p) => {
                                        if (mode === "plate") {
                                          if (!searchQuery.trim()) return true;
                                          return p.toLowerCase().includes(searchQuery.trim().toLowerCase());
                                        }
                                        if (plateTypeFilter !== "all") {
                                          return matchesPlateTypeFilter([p], plateTypeFilter);
                                        }
                                        return false;
                                      })
                                      .slice(0, 5) // limit to top 5
                                      .map((p, pIdx) => (
                                        <div key={pIdx} className="font-mono text-[10.5px] text-slate-650 flex items-center gap-1.5 pl-1.5 border-l-2 border-[#00A3E0]/30 animate-fadeIn">
                                          <span className="w-1.5 h-1.5 rounded-full bg-[#00A3E0]" />
                                          <Highlight text={p} query={mode === "plate" ? searchQuery : ""} />
                                        </div>
                                      ))}
                                    {s.plates.filter((p) => {
                                      if (mode === "plate") {
                                        if (!searchQuery.trim()) return true;
                                        return p.toLowerCase().includes(searchQuery.trim().toLowerCase());
                                      }
                                      if (plateTypeFilter !== "all") {
                                        return matchesPlateTypeFilter([p], plateTypeFilter);
                                      }
                                      return false;
                                    }).length > 5 && (
                                      <div className="text-[9.5px] font-semibold text-slate-400 italic pl-1.5 pt-0.5">
                                        + {s.plates.filter((p) => {
                                          if (mode === "plate") {
                                            if (!searchQuery.trim()) return true;
                                            return p.toLowerCase().includes(searchQuery.trim().toLowerCase());
                                          }
                                          if (plateTypeFilter !== "all") {
                                            return matchesPlateTypeFilter([p], plateTypeFilter);
                                          }
                                          return false;
                                        }).length - 5} more matching plates (open set to view all)
                                      </div>
                                    )}
                                    {mode !== "plate" && plateTypeFilter === "all" && (
                                      <div className="text-[10px] font-medium text-slate-450 italic pl-1.5">
                                        Open set to view complete list of plates.
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                            <span className="text-xs font-bold text-slate-400 group-hover:text-teal-700 translate-x-0 group-hover:translate-x-1.5 transition duration-150 flex items-center gap-1 flex-shrink-0">
                              <span>Open</span>
                              <span className="text-base leading-none">
                                &rarr;
                              </span>
                            </span>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
                </div> {/* Close of dynamic search results main panel lg:col-span-8 */}
              </div> {/* Close of grid container */}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Safety Legal Warning Footer */}
      <footer className="bg-slate-100/80 border-t border-slate-200/80 text-center py-6 px-4 mt-12 text-xs text-slate-505 leading-relaxed font-medium">
        <div className="max-w-xl mx-auto space-y-1.5">
          <p className="font-bold text-slate-700 flex items-center justify-center gap-1 text-[11px] uppercase tracking-wider">
            <Hospital size={12} className="text-teal-800" />
            Sterile Processing & Orthopedic Support Tool
          </p>
          <p>
            References are based on standard Synthes inventory configuration
            sheets for orthopaedic implants.
          </p>
          <p className="text-[10px] text-slate-450 uppercase select-none font-mono">
            Clinical alignment check required. &copy; {new Date().getFullYear()}{" "}
            Surgical Support Services
          </p>
        </div>
      </footer>

      {/* 🧾 ACTIVE SCREW USAGE LOG DIALOG */}
      <AnimatePresence>
        {activeUsageScrew && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-slate-200 rounded-3xl w-full max-w-md shadow-2xl p-6 sm:p-7 relative"
              id="active-usage-modal-card"
            >
              <button
                onClick={() => setActiveUsageScrew(null)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition cursor-pointer"
                title="Cancel"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-2.5 text-teal-800 font-bold mb-4 font-display text-base">
                <PlusCircle size={20} className="stroke-[2.5]" />
                <span>Log Implant Usage / Reorder</span>
              </div>

              <div className="space-y-4 text-xs">
                <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-3.5 space-y-1">
                  <div className="text-[10px] uppercase font-bold text-slate-400">
                    Selected Implant
                  </div>
                  <div className="text-[15px] font-bold text-slate-900 leading-snug">
                    {activeUsageScrew.screw.type}
                  </div>
                  <div className="text-[11px] text-slate-500 font-semibold flex items-center gap-1.5 mt-0.5">
                    <span>Set: {activeUsageScrew.set.name}</span>
                    <span className="text-slate-350">|</span>
                    <span>
                      Alloy: {activeUsageScrew.set.defaultMaterial || "Both"}
                    </span>
                  </div>
                </div>

                <form
                  onSubmit={handleConfirmUsageLog}
                  className="space-y-4 text-slate-700"
                >
                  {/* Size Length Selection */}
                  <div className="space-y-1.5">
                    <label className="block text-[11px] uppercase font-bold text-slate-400 tracking-wider">
                      Used Screws Length (mm)
                    </label>
                    <div className="grid grid-cols-4 sm:grid-cols-5 gap-1.5 max-h-32 overflow-y-auto p-1 bg-slate-50 rounded-xl border border-slate-200/65 select-none">
                      {getLengthOptions(
                        activeUsageScrew.screw.lengthRange,
                        activeUsageScrew.screw.interval,
                      ).map((len) => (
                        <button
                          key={len}
                          type="button"
                          onClick={() => handleLengthChange(len)}
                          className={`py-1.5 px-2 rounded-lg text-xs font-mono font-bold transition text-center border cursor-pointer select-none ${
                            selectedLength === len
                              ? "bg-teal-800 text-white border-teal-900 shadow-2xs"
                              : "bg-white hover:bg-slate-100 text-slate-700 border-slate-200"
                          }`}
                        >
                          {len} mm
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Qty & Ref inputs */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-[11px] uppercase font-bold text-slate-400 tracking-wider">
                        Quantity Used
                      </label>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedQuantity(
                              Math.max(1, selectedQuantity - 1),
                            )
                          }
                          className="p-1 px-3 border border-slate-200 bg-slate-100 rounded-lg hover:bg-slate-150 font-bold transition text-center cursor-pointer select-none text-xs"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min="1"
                          required
                          value={selectedQuantity}
                          onChange={(e) =>
                            setSelectedQuantity(
                              parseInt(e.target.value, 10) || 1,
                            )
                          }
                          className="w-11 py-1 border border-slate-250 rounded-lg font-mono font-bold text-center bg-white"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedQuantity(selectedQuantity + 1)
                          }
                          className="p-1 px-3 border border-slate-200 bg-slate-100 rounded-lg hover:bg-slate-150 font-bold transition text-center cursor-pointer select-none text-xs"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[11px] uppercase font-bold text-slate-400 tracking-wider">
                        Catalog Ref #
                      </label>
                      <input
                        type="text"
                        required
                        value={customCatalogRef}
                        onChange={(e) => setCustomCatalogRef(e.target.value)}
                        className="w-full py-1 text-center font-mono font-bold border border-slate-250 rounded-lg text-[11px] bg-slate-50 focus:bg-white focus:outline-none"
                        placeholder="02.XXX.XXX"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[11px] uppercase font-bold text-slate-400 tracking-wider">
                      Location Storage
                    </label>
                    <div className="text-[11px] font-mono text-slate-500 font-semibold bg-slate-100 px-2 py-1.5 rounded-lg border border-slate-200">
                      📍{" "}
                      {customLocations[activeUsageScrew.set.id] ||
                        activeUsageScrew.set.defaultLocation ||
                        "Core Cabinet"}
                    </div>
                  </div>

                  {/* Actions buttons */}
                  <div className="pt-4 flex gap-2.5 bg-white">
                    <button
                      type="button"
                      onClick={() => setActiveUsageScrew(null)}
                      className="flex-1 py-2 text-center border border-slate-250 hover:bg-slate-50 text-slate-500 hover:text-slate-750 text-xs font-bold rounded-xl cursor-pointer transition uppercase tracking-wider"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2 text-center bg-teal-850 hover:bg-teal-900 border border-teal-950 hover:shadow-xs text-white text-xs font-bold rounded-xl cursor-pointer transition uppercase tracking-wider"
                    >
                      Confirm Log
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Standalone password gate modal removed - per team decision, the
          single entry point for entering the team password is the Secure
          Archive popup (id="secure-archive-vault-modal"). Any locked edit
          attempt now opens that modal directly (setShowAdminModal(true))
          instead of a separate floating password prompt. */}

      {/* Help & FAQ modal - static reference content, no data dependency,
          describing what each real button/feature in the app actually
          does. Kept here as a single self-contained block rather than a
          separate file so it can't silently drift from the actual UI
          without someone noticing while editing this same file. */}
      {showHelpModal && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 z-50 overflow-y-auto">
          <div className="bg-white border border-slate-205 rounded-3xl w-full max-w-2xl shadow-3xl flex flex-col max-h-[88vh]">
            <div className="p-4 sm:p-5 border-b border-slate-150 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2">
                <HelpCircle size={18} className="text-teal-700" />
                <h2 className="font-bold text-slate-900 text-base">Help &amp; FAQ</h2>
              </div>
              <button
                onClick={() => setShowHelpModal(false)}
                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer transition"
              >
                <X size={18} />
              </button>
            </div>

            <div className="overflow-y-auto p-4 sm:p-5 space-y-5 text-sm text-slate-700">
              <section>
                <h3 className="font-bold text-slate-900 text-[13px] mb-1.5">Finding an implant</h3>
                <p className="leading-relaxed">
                  Use the <strong>Set / Screw / Plate</strong> tabs at the top to choose how you want to search:
                </p>
                <ul className="list-disc pl-5 mt-1.5 space-y-1 leading-relaxed">
                  <li><strong>Set</strong> - browse or search by trauma tray name (e.g. "Large Fragment").</li>
                  <li><strong>Screw</strong> - search by screw type, diameter, or length across every set at once.</li>
                  <li><strong>Plate</strong> - search by plate type, and narrow results using the <strong>Diameter</strong> and <strong>Hole Count</strong> filters that appear once a search returns plate results.</li>
                </ul>
              </section>

              <section>
                <h3 className="font-bold text-slate-900 text-[13px] mb-1.5">Table view</h3>
                <p className="leading-relaxed">
                  While in Screw or Plate search mode, switch to <strong>Table</strong> view (next to Grouped/Sets) to see a flat, sortable-by-scanning comparison: item, which set it's in, its storage location, and size - useful for comparing the same implant across multiple sets at a glance.
                </p>
              </section>

              <section>
                <h3 className="font-bold text-slate-900 text-[13px] mb-1.5">Contamination Protocol</h3>
                <p className="leading-relaxed">
                  Use this when a tray is sterile-compromised mid-case and you need a backup. Select the contaminated set in Step 1, and the engine searches every other set for screws/plates matching on <strong>diameter, length range overlap, and function</strong> (cortex vs. locking vs. cannulated, etc.) - not just "same diameter."
                </p>
                <p className="leading-relaxed mt-1.5">
                  Results are ranked by match quality. <strong>On-site</strong> matches show first; toggle <strong>"Show off-site alternatives"</strong> to also see sets not currently on-site (useful for knowing what a rep could bring, not what's available right now).
                </p>
              </section>

              <section>
                <h3 className="font-bold text-slate-900 text-[13px] mb-1.5">Reorder list &amp; Reps directory</h3>
                <p className="leading-relaxed">
                  The <strong>cart icon</strong> builds a reorder requisition you can finalize and email. The <strong>Reps</strong> button opens the vendor contact directory (names/phone numbers are confirmed real; not every rep has an email on file - if none shows, use the phone number).
                </p>
              </section>

              <section>
                <h3 className="font-bold text-slate-900 text-[13px] mb-1.5">Editing, verifying, or flagging an issue</h3>
                <p className="leading-relaxed">
                  Searching and browsing never requires sign-in. Editing a location, verifying an item, submitting an order, or flagging an issue does - you'll be prompted for the team password the first time you try. Once entered, editing stays unlocked for that browser session; the header shows <strong>"Editing unlocked"</strong> when active, and you can tap it to lock again before stepping away from a shared computer.
                </p>
              </section>

              <section>
                <h3 className="font-bold text-slate-900 text-[13px] mb-1.5">What do the verification badges mean?</h3>
                <ul className="list-disc pl-5 space-y-1 leading-relaxed">
                  <li><strong>Source-verified</strong> - confirmed against an official manufacturer document or catalog.</li>
                  <li><strong>Tray-verified</strong> - confirmed by physically checking the item against the tray.</li>
                  <li><strong>Unverified</strong> - present in the data but not yet confirmed against either source. Treat as a starting point, not a guarantee, until checked.</li>
                </ul>
              </section>

              <section>
                <h3 className="font-bold text-slate-900 text-[13px] mb-1.5">Something looks wrong - what should I do?</h3>
                <p className="leading-relaxed">
                  Use <strong>"Flag an Issue"</strong> to report it directly from the app - this is the fastest way to get a data error corrected. Please don't rely on a low-confidence match (anything not marked as a strong/exact match) as a substitute without confirming size and function against the physical implant first.
                </p>
              </section>
            </div>

            <div className="p-3.5 border-t border-slate-150 flex-shrink-0">
              <button
                onClick={() => setShowHelpModal(false)}
                className="w-full py-2.5 bg-teal-800 hover:bg-teal-900 text-white text-sm font-bold rounded-xl transition cursor-pointer"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 📄 REORDER REQUISITION SHEET OVERLAY MODAL */}
      <AnimatePresence>
        {showReorderModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto">
            <motion.div
              initial={{ scale: 0.97, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.97, opacity: 0 }}
              className="bg-white border border-slate-200 rounded-3xl w-full max-w-2xl shadow-3xl flex flex-col max-h-[92vh] overflow-hidden"
              id="reorder-requisition-sheet-panel"
            >
              {/* Header */}
              <div className="px-5 py-4 border-b border-slate-150 flex items-center justify-between bg-slate-50 flex-shrink-0 select-none">
                <div className="flex items-center gap-2">
                  <ClipboardList
                    className="text-teal-800 stroke-[2.2]"
                    size={18}
                  />
                  <h2 className="font-bold text-slate-900 text-sm sm:text-base font-display">
                    Clinical Implant Replenishment Sheet
                  </h2>
                </div>
                <button
                  onClick={() => setShowReorderModal(false)}
                  className="p-1 px-2.5 text-xs border border-slate-200 bg-white hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-700 transition cursor-pointer font-bold"
                >
                  Close [ESC]
                </button>
              </div>

              {/* Sheet Body & Form */}
              <div
                className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-5"
                id="printable-replenishment-sheet-area"
              >
                {/* Visual Hospital Header (Visible on print too) */}
                <div className="border border-slate-250 p-4 sm:p-5 rounded-2xl bg-slate-50/50 space-y-4">
                  <div className="flex items-start justify-between border-b border-slate-150 pb-3 flex-wrap gap-2">
                    <div className="text-left">
                      <div className="text-[10px] font-mono tracking-widest font-bold text-slate-400">
                        PEDIATRICS ORTHOPAEDIC DEPT
                      </div>
                      <h3 className="text-base font-bold text-teal-850 font-display mt-0.5">
                        ORTHOPEDIC REORDERING FORM
                      </h3>
                    </div>
                    <div className="bg-amber-100/60 border border-amber-250 text-amber-905 font-semibold px-2 py-0.5 rounded text-[10px] uppercase">
                      Implant Requisition
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-700">
                    <div className="space-y-1.5">
                      <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                        Date Sheet Generated
                      </span>
                      <div className="font-mono text-xs font-semibold text-slate-805 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg select-none inline-flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-teal-500 animate-pulse" />
                        <span>
                          {new Date().toLocaleDateString(undefined, {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}{" "}
                          at{" "}
                          {new Date().toLocaleTimeString(undefined, {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Submission Card */}
                <div className="border border-teal-150 p-4.5 rounded-2xl bg-[#F4FAFD] space-y-2.5 shadow-3xs" id="order-submission-card">
                  {orderSubmittedId ? (
                    <div className="flex items-start gap-2.5 text-xs">
                      <CheckCircle size={18} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-emerald-900">Order {orderSubmittedId} submitted</p>
                        <p className="text-[11px] text-emerald-800 mt-0.5 leading-relaxed">
                          It's been saved to the Secure Archive. The coordination team will be notified automatically.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                        Submitting saves this replenishment list to the Secure Archive, where the coordination team can review it. A notification is sent automatically once submitted.
                      </p>
                      <div className="pt-1.5 flex justify-start">
                        <button
                          onClick={handleFinalizeAndArchiveOrder}
                          disabled={reorderList.length === 0}
                          className="w-full sm:w-auto px-6 py-2.5 bg-teal-805 hover:bg-teal-850 text-white text-xs font-bold rounded-xl cursor-pointer select-none transition shadow-2xs hover:shadow-xs disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-1.5 uppercase tracking-wider"
                        >
                          <span>Submit</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>

                {/* Items List */}
                {reorderList.length === 0 ? (
                  <div className="border border-dashed border-slate-200 rounded-3xl p-10 text-center space-y-4 bg-slate-50/20">
                    <ClipboardList
                      size={36}
                      className="mx-auto text-slate-300"
                    />
                    <div className="space-y-1">
                      <h4 className="text-slate-805 text-sm font-bold">
                        Replenishment list is empty
                      </h4>
                      <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                        Browse the database catalog to record product usages, or add a custom implant that isn't in our database manually using the option below.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setManualSetId(""); setManualImplantType(""); setManualCatalogRef(""); setManualQty(1);
                        setShowManualEntryModal(true);
                      }}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-50 hover:bg-amber-100 border border-amber-250 text-amber-850 hover:text-amber-900 text-xs font-bold rounded-xl shadow-3xs cursor-pointer select-none transition-all"
                    >
                      <Plus size={14} className="text-amber-600" />
                      <span>Add Custom Item Manually</span>
                    </button>
                  </div>
                ) : (
                  <div className="border border-slate-250 rounded-2xl overflow-hidden shadow-xs bg-white">
                    <div className="bg-slate-50 border-b border-slate-150 p-2.5 uppercase text-[10px] font-bold text-slate-500 grid grid-cols-12 gap-2 select-none">
                      <span className="col-span-5 sm:col-span-6 pl-2">
                        Implant Details
                      </span>
                      <span className="col-span-2 text-center">Length/Size</span>
                      <span className="col-span-3 sm:col-span-2 text-center">
                        Catalog Ref
                      </span>
                      <span className="col-span-2 text-center pr-2">Qty</span>
                    </div>

                    <div className="divide-y divide-slate-150 text-xs text-left">
                      {reorderList.map((item) => {
                        const isManual = !!item.isManualEntry;
                        return (
                          <div
                            key={item.id}
                            className={`p-3 grid grid-cols-12 gap-2 items-center transition ${
                              isManual
                                ? "bg-amber-50/30 hover:bg-amber-50/50 border-l-4 border-l-amber-500"
                                : "hover:bg-slate-50"
                            }`}
                          >
                            {/* Implant info */}
                            <div className="col-span-5 sm:col-span-6 space-y-1.5 flex items-start gap-1.5">
                              <button
                                onClick={() => handleRemoveReorderItem(item.id)}
                                className="text-slate-350 hover:text-rose-600 transition cursor-pointer select-none p-0.5 mt-0.5"
                                title="Delete row"
                              >
                                <Trash2 size={13} />
                              </button>
                              <div>
                                <div className="font-bold text-slate-905 leading-tight flex items-center gap-1.5 flex-wrap">
                                  <span>{item.screwType}</span>
                                  {isManual && (
                                    <span className="bg-amber-100/80 text-amber-900 border border-amber-200 text-[8px] font-extrabold uppercase px-1.5 py-0.2 rounded-md select-none tracking-wide flex items-center gap-0.5">
                                      Manual Entry
                                    </span>
                                  )}
                                </div>
                                <div className="text-[10px] text-slate-400 font-semibold leading-none mt-1">
                                  {isManual ? (
                                    <span className="text-amber-705 font-bold uppercase tracking-wider">
                                      ⚠️ Custom Implant (Single-Use Requisition Request)
                                    </span>
                                  ) : (
                                    <>Set: {item.setName} &bull; 📍 {item.location}</>
                                  )}
                                </div>
                                {item.notes && (
                                  <div className="text-[10px] text-slate-500 italic mt-1 font-medium bg-slate-50 px-2 py-0.5 rounded border border-slate-100 w-fit">
                                    Note: {item.notes}
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Length / Size modification */}
                            <div className="col-span-2 text-center font-mono">
                              {isManual ? (
                                <input
                                  type="text"
                                  inputMode="decimal"
                                  value={item.selectedLength}
                                  onChange={(e) => {
                                    // Same hard constraint as structured entry:
                                    // digits, decimal point, optional trailing
                                    // unit-like letter only. No free text.
                                    const filtered = e.target.value.replace(/[^0-9.a-zA-Z]/g, "");
                                    const list = [...reorderList];
                                    const match = list.find((i) => i.id === item.id);
                                    if (match) {
                                      match.selectedLength = filtered;
                                      setReorderList(list);
                                      saveAllReorders(list);
                                    }
                                  }}
                                  placeholder="e.g. 10mm"
                                  className="w-11 sm:w-16 py-0.5 border border-amber-250 hover:border-amber-400 focus:border-amber-500 rounded text-center bg-white font-bold text-amber-900 text-xs focus:outline-none"
                                  title="Size/Length (numeric only)"
                                />
                              ) : item.itemType === "plate" || item.selectedLength === "N/A" ? (
                                <span className="bg-slate-100 text-slate-500 text-[10px] font-bold px-2 py-1 rounded uppercase font-sans select-none">
                                  Plate
                                </span>
                              ) : (
                                <>
                                  <input
                                    type="number"
                                    value={item.selectedLength}
                                    onChange={(e) =>
                                      handleUpdateItemLength(item.id, e.target.value)
                                    }
                                    className="w-11 sm:w-14 py-0.5 border border-slate-205 rounded text-center bg-white font-bold"
                                    title="Length (mm)"
                                  />
                                  <span className="text-[9px] text-slate-400 ml-0.5 font-sans font-semibold">
                                    mm
                                  </span>
                                </>
                              )}
                            </div>

                            {/* Catalog ref text */}
                            <div className="col-span-3 sm:col-span-2 text-center font-mono text-[10px] font-bold">
                              <input
                                type="text"
                                value={item.catalogRef}
                                onChange={(e) =>
                                  handleUpdateItemCatalog(item.id, e.target.value)
                                }
                                className={`w-full py-0.5 border text-center font-bold text-[10px] uppercase focus:outline-none ${
                                  isManual
                                    ? "bg-amber-50/20 border-amber-205 text-amber-800"
                                    : "border-slate-100 text-teal-850"
                                }`}
                                title="Catalog ref number"
                              />
                            </div>

                            {/* Qty increment inline count */}
                            <div className="col-span-2 text-center flex items-center justify-center gap-1">
                              <button
                                onClick={() => handleUpdateItemQty(item.id, -1)}
                                className="w-5 h-5 flex items-center justify-center border border-slate-200 hover:bg-slate-100 rounded text-[10px] font-bold cursor-pointer select-none"
                              >
                                -
                              </button>
                              <span className="font-mono font-bold w-4 text-center text-slate-900">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => handleUpdateItemQty(item.id, 1)}
                                className="w-5 h-5 flex items-center justify-center border border-slate-200 hover:bg-slate-100 rounded text-[10px] font-bold cursor-pointer select-none"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Persistent custom entries helper bar */}
                    <div className="bg-slate-50 border-t border-slate-150 p-2.5 flex items-center justify-between gap-3 text-[11px] font-semibold select-none flex-wrap sm:flex-nowrap">
                      <span className="text-slate-400 font-medium pl-2 leading-tight">
                        Need another custom implant or non-catalog specifications?
                      </span>
                      <button
                        onClick={() => {
                          setManualSetId(""); setManualImplantType(""); setManualCatalogRef(""); setManualQty(1);
                          setShowManualEntryModal(true);
                        }}
                        className="mr-2 px-3 py-1 border border-amber-300 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-lg transition-all duration-150 flex items-center gap-1 cursor-pointer shadow-3xs"
                        id="btn-add-custom-item-cart-row"
                        type="button"
                      >
                        <Plus size={11} className="text-amber-100 stroke-[2.5]" />
                        <span>Add Manually</span>
                      </button>
                    </div>

                    <div className="bg-slate-50 border-t border-slate-150 p-3 sm:p-4 text-right text-xs text-slate-800 flex justify-between items-center sm:px-5">
                      <div className="text-slate-400 font-bold uppercase text-[10px]">
                        REPLY SLIP / REQUISITION CONFIRMED
                      </div>
                      <div className="flex items-center gap-2 font-display text-sm font-bold">
                        <span>Grand Total count:</span>
                        <span className="bg-teal-850 text-white font-mono px-2 py-0.5 rounded text-xs select-none">
                          {reorderList.reduce(
                            (sum, item) => sum + item.quantity,
                            0,
                          )}{" "}
                          Implants
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Actions Footer */}
              <div className="px-5 py-4 border-t border-slate-150 bg-slate-50 flex items-center justify-between flex-shrink-0 flex-wrap gap-3">
                <button
                  onClick={handleClearReorderList}
                  disabled={reorderList.length === 0}
                  className={`px-3.5 py-1.5 border text-xs font-bold rounded-xl cursor-pointer transition-all duration-155 select-none disabled:opacity-50 disabled:pointer-events-none uppercase tracking-wider ${
                    showClearConfirm
                      ? "border-amber-300 bg-amber-500 hover:bg-amber-600 text-white font-extrabold animate-pulse"
                      : "border-rose-200 text-rose-750 hover:bg-rose-50"
                  }`}
                >
                  {showClearConfirm ? "Click again to clear" : "Clear Sheet"}
                </button>

                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={handleFinalizeAndArchiveOrder}
                    disabled={reorderList.length === 0}
                    className="px-4 py-1.5 bg-teal-805 hover:bg-teal-850 text-white text-xs font-bold rounded-xl cursor-pointer transition select-none disabled:opacity-50 disabled:pointer-events-none flex items-center gap-1.5 uppercase tracking-wider shadow-2xs"
                  >
                    <span>Submit</span>
                  </button>

                  <button
                    onClick={handleCopyOrderText}
                    disabled={reorderList.length === 0}
                    className="relative px-3.5 py-1.5 bg-slate-200 hover:bg-slate-250 border border-slate-300 text-slate-750 text-xs font-bold rounded-xl cursor-pointer transition select-none disabled:opacity-50 disabled:pointer-events-none flex items-center gap-1.5 uppercase tracking-wider"
                  >
                    {showCopySuccess ? (
                      <>
                        <Check size={13} className="text-emerald-600" />
                        <span>Summary Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={13} />
                        <span>Copy Summary</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 📞 VENDOR REPRESENTATIVE DIRECTORY MODAL */}
      <AnimatePresence>
        {showRepsModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto">
            <motion.div
              initial={{ scale: 0.97, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.97, opacity: 0 }}
              className="bg-white border border-slate-200 rounded-3xl w-full max-w-2xl shadow-3xl flex flex-col max-h-[92vh] overflow-hidden"
              id="vendor-reps-modal-panel"
            >
              {/* Header */}
              <div className="px-5 py-4 border-b border-slate-150 flex items-center justify-between bg-slate-50 flex-shrink-0 select-none">
                <div className="flex items-center gap-2">
                  <PhoneCall
                    className="text-teal-800 stroke-[2.2]"
                    size={18}
                  />
                  <h2 className="font-bold text-slate-900 text-sm sm:text-base font-display">
                    Medical Device Vendor Representatives
                  </h2>
                </div>
                <button
                  onClick={() => {
                    setShowRepsModal(false);
                    setRepSearchQuery("");
                  }}
                  className="p-1 px-2.5 text-xs border border-slate-200 bg-white hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-705 transition cursor-pointer font-bold"
                >
                  Close [ESC]
                </button>
              </div>

              {/* Search filter for Reps */}
              <div className="px-5 py-3.5 bg-slate-100/50 border-b border-slate-150 flex-shrink-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-450 whitespace-nowrap pointer-events-none" size={15} />
                  <input
                    type="text"
                    value={repSearchQuery}
                    onChange={(e) => setRepSearchQuery(e.target.value)}
                    placeholder="Search by company, rep name, role, or territory..."
                    className="w-full pl-9 pr-8 py-2 bg-white border border-slate-250 rounded-xl text-xs text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-750/15 focus:border-teal-750 transition"
                  />
                  {repSearchQuery && (
                    <button
                      onClick={() => setRepSearchQuery("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-405 hover:text-slate-605 transition"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                <div className="flex bg-slate-200 p-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wide shrink-0 inline-flex" id="rep-layout-toggle-group">
                  <button
                    type="button"
                    onClick={() => setRepViewMode("table")}
                    className={`px-2.5 py-1 rounded transition-all duration-150 cursor-pointer ${
                      repViewMode === "table"
                        ? "bg-white text-slate-900 shadow-3xs font-extrabold"
                        : "text-slate-550 hover:text-slate-800"
                    }`}
                  >
                    Grouped Table
                  </button>
                  <button
                    type="button"
                    onClick={() => setRepViewMode("cards")}
                    className={`px-2.5 py-1 rounded transition-all duration-150 cursor-pointer ${
                      repViewMode === "cards"
                        ? "bg-white text-slate-900 shadow-3xs font-extrabold"
                        : "text-slate-550 hover:text-slate-800"
                    }`}
                  >
                    Card Directory
                  </button>
                </div>
              </div>

              {/* Rep Directory Body */}
              <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4">
                <p className="text-xs text-slate-550 leading-relaxed">
                  Below is the direct pager and phone assistance directory for major orthopedic implant manufacturers. For emergency kit support, clinical trial questions, or rapid surgical core room replenishments, contact the assigned representative below.
                </p>

                <div className="space-y-3">
                  {(() => {
                    const filteredReps = COMPANY_REPS.filter((rep) => {
                      const q = repSearchQuery.toLowerCase().trim();
                      if (!q) return true;
                      return (
                        rep.company.toLowerCase().includes(q) ||
                        rep.name.toLowerCase().includes(q) ||
                        rep.role.toLowerCase().includes(q) ||
                        rep.territory.toLowerCase().includes(q) ||
                        (rep.notes || "").toLowerCase().includes(q) ||
                        rep.phone.includes(q) ||
                        (rep.pager || "").includes(q)
                      );
                    });

                    if (repViewMode === "table") {
                      // Group by company
                      const grouped: Record<string, typeof COMPANY_REPS> = {};
                      filteredReps.forEach((rep) => {
                        const company = rep.company || "Other";
                        if (!grouped[company]) {
                          grouped[company] = [];
                        }
                        grouped[company].push(rep);
                      });

                      return (
                        <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-3xs bg-white text-xs">
                          <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                              <thead>
                                <tr className="bg-slate-50 text-slate-700 text-[10px] font-bold uppercase tracking-wider border-b border-slate-200 select-none">
                                  <th className="px-4 py-2.5 font-semibold w-1/3">Company</th>
                                  <th className="px-4 py-2.5 font-semibold w-1/3">Rep Name</th>
                                  <th className="px-4 py-2.5 font-semibold w-1/3 border-r-0">Phone / Contact</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 text-slate-700">
                                {Object.entries(grouped).map(([company, reps]) => {
                                  let bgClass = "bg-teal-50 text-teal-800 border-teal-205";
                                  if (company.includes("Synthes")) {
                                    bgClass = "bg-rose-50 text-rose-800 border-rose-205";
                                  } else if (company.includes("Stryker")) {
                                    bgClass = "bg-amber-50 text-amber-900 border-amber-255";
                                  } else if (company.includes("Acumed")) {
                                    bgClass = "bg-cyan-50 text-cyan-800 border-cyan-205";
                                  } else if (company.includes("Smith")) {
                                    bgClass = "bg-slate-100 text-slate-800 border-slate-255";
                                  }

                                  return reps.map((rep, rIdx) => (
                                    <tr key={`${company}-${rIdx}`} className="hover:bg-slate-50/50 transition-colors">
                                      {rIdx === 0 ? (
                                        <td
                                          className="px-4 py-3 font-extrabold text-slate-900 border-r border-slate-150 align-top select-all bg-slate-50/20"
                                          rowSpan={reps.length}
                                        >
                                          <span className={`text-[9px] font-mono font-extrabold uppercase px-1.5 py-0.5 rounded border block text-center truncate ${bgClass}`}>
                                            {company}
                                          </span>
                                        </td>
                                      ) : null}
                                      <td className="px-4 py-3 font-bold text-slate-800 border-r border-slate-100">
                                        {rep.name === "— (Rep)" ? (
                                          <span className="text-slate-400 italic font-medium">— (Rep)</span>
                                        ) : (
                                          rep.name
                                        )}
                                      </td>
                                      <td className="px-4 py-3 font-mono font-bold text-slate-650">
                                        <div className="flex items-center gap-1.5 justify-between">
                                          <a
                                            href={`tel:${rep.phone.replace(/[^\d+]/g, "")}`}
                                            className="text-teal-805 hover:underline hover:text-teal-905"
                                          >
                                            {rep.phone}
                                          </a>
                                          <button
                                            onClick={() => {
                                              const uniqueId = `table-${company}-${rIdx}`;
                                              navigator.clipboard.writeText(rep.phone);
                                              setCopiedRepField(uniqueId);
                                              setTimeout(() => setCopiedRepField(null), 1500);
                                            }}
                                            className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-teal-850 transition shrink-0 cursor-pointer"
                                            title="Copy Phone"
                                          >
                                            {copiedRepField === `table-${company}-${rIdx}` ? (
                                              <Check size={11} className="text-emerald-600 font-bold" />
                                            ) : (
                                              <Copy size={11} />
                                            )}
                                          </button>
                                        </div>
                                      </td>
                                    </tr>
                                  ));
                                })}
                              </tbody>
                            </table>
                          </div>
                          {Object.keys(grouped).length === 0 && (
                            <div className="text-center py-8 text-slate-450 italic text-xs">
                              No matching vendors found for "{repSearchQuery}"
                            </div>
                          )}
                        </div>
                      );
                    }

                    return (
                      <div className="space-y-3">
                        {filteredReps.map((rep, idx) => {
                          const hasCopiedPhone = copiedRepField === `${idx}-phone`;
                          const hasCopiedEmail = copiedRepField === `${idx}-email`;
                          const hasCopiedPager = copiedRepField === `${idx}-pager`;

                          const handleCopyText = (text: string, id: string) => {
                            navigator.clipboard.writeText(text);
                            setCopiedRepField(id);
                            setTimeout(() => setCopiedRepField(null), 1500);
                          };

                          let headerBadgeColor = "bg-teal-50 text-teal-850 border-teal-200/60";
                          if (rep.company.includes("Synthes")) {
                            headerBadgeColor = "bg-rose-50 text-rose-800 border-rose-200/65";
                          } else if (rep.company.includes("Stryker")) {
                            headerBadgeColor = "bg-amber-50 text-amber-905 border-amber-250";
                          } else if (rep.company.includes("Acumed")) {
                            headerBadgeColor = "bg-cyan-50 text-cyan-705 border-cyan-200";
                          } else if (rep.company.includes("Smith")) {
                            headerBadgeColor = "bg-slate-105 text-slate-705 border-slate-250";
                          }

                          return (
                            <div
                              key={idx}
                              className="bg-slate-55 hover:bg-slate-105/50 border border-slate-205 rounded-2xl p-4 transition-all hover:shadow-xs space-y-3"
                            >
                              {/* Company Badge and Territory */}
                              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-150 pb-2">
                                <span className={`text-[10px] font-mono font-extrabold uppercase px-2 py-0.5 rounded border ${headerBadgeColor}`}>
                                  {rep.company}
                                </span>
                                <span className="text-[10px] font-semibold text-slate-455 font-mono">
                                  📍 {rep.territory}
                                </span>
                              </div>

                              {/* Representative Metadata */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                                <div className="space-y-1">
                                  <h3 className="font-bold text-slate-900 text-sm font-display flex items-center gap-1.5">
                                    {rep.name}
                                  </h3>
                                  <p className="text-xs text-slate-550 font-medium font-sans">
                                    {rep.role}
                                  </p>
                                  {rep.notes && (
                                    <p className="text-[11px] text-slate-455 italic mt-1 leading-relaxed">
                                      {rep.notes}
                                    </p>
                                  )}
                                </div>

                                {/* Contact Methods */}
                                <div className="space-y-1.5 text-xs">
                                  {/* Pager */}
                                  {rep.pager && (
                                    <div className="flex items-center justify-between bg-white border border-slate-205 px-2.5 py-1 rounded-lg">
                                      <span className="font-semibold text-slate-550 uppercase text-[9px] tracking-wide font-mono">
                                        Pager / Beeper:
                                      </span>
                                      <div className="flex items-center gap-1.5">
                                        <span className="font-mono font-bold text-slate-800">{rep.pager}</span>
                                        <button
                                          onClick={() => handleCopyText(rep.pager!, `${idx}-pager`)}
                                          className="p-1 hover:bg-slate-105 rounded text-slate-405 hover:text-teal-705 transition cursor-pointer"
                                          title="Copy pager number"
                                        >
                                          {hasCopiedPager ? <Check size={11} className="text-emerald-600" /> : <Copy size={11} />}
                                        </button>
                                      </div>
                                    </div>
                                  )}

                                  {/* Mobile */}
                                  <div className="flex items-center justify-between bg-white border border-slate-205 px-2.5 py-1 rounded-lg">
                                    <span className="font-semibold text-slate-550 uppercase text-[9px] tracking-wide font-mono">
                                      Mobile / Call:
                                    </span>
                                    <div className="flex items-center gap-1.5">
                                      <a
                                        href={`tel:${rep.phone.replace(/[^\d+]/g, "")}`}
                                        className="font-mono font-bold text-teal-805 hover:underline"
                                      >
                                        {rep.phone}
                                      </a>
                                      <button
                                        onClick={() => handleCopyText(rep.phone, `${idx}-phone`)}
                                        className="p-1 hover:bg-slate-105 rounded text-slate-405 hover:text-teal-705 transition cursor-pointer"
                                        title="Copy phone number"
                                      >
                                        {hasCopiedPhone ? <Check size={11} className="text-emerald-600" /> : <Copy size={11} />}
                                      </button>
                                    </div>
                                  </div>

                                  {/* Email - only shown when one is actually
                                      on file. Real rep emails were never
                                      confirmed for this directory, so most
                                      entries will have no email at all here
                                      rather than showing a fabricated one. */}
                                  {rep.email && (
                                    <div className="flex items-center justify-between bg-white border border-slate-205 px-2.5 py-1 rounded-lg">
                                      <span className="font-semibold text-slate-550 uppercase text-[9px] tracking-wide font-mono">
                                        Email Address:
                                      </span>
                                      <div className="flex items-center gap-1.5">
                                        <a
                                          href={`mailto:${rep.email}`}
                                          className="font-mono font-semibold text-slate-650 hover:text-teal-805 hover:underline truncate max-w-[150px] text-right sm:max-w-none"
                                        >
                                          {rep.email}
                                        </a>
                                        <button
                                          onClick={() => handleCopyText(rep.email!, `${idx}-email`)}
                                          className="p-1 hover:bg-slate-105 rounded text-slate-405 hover:text-teal-705 transition cursor-pointer"
                                          title="Copy email address"
                                        >
                                          {hasCopiedEmail ? <Check size={11} className="text-emerald-600" /> : <Copy size={11} />}
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                        {filteredReps.length === 0 && (
                          <div className="text-center py-6 text-slate-450 italic text-xs">
                            No matching vendors found for "{repSearchQuery}"
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Footer */}
              <div className="px-5 py-4 border-t border-slate-150 bg-slate-50 flex items-center justify-between flex-shrink-0 select-none">
                <span className="text-[10px] text-slate-450 italic">
                  * Note: Representatives can be contacted 24/7 for trauma cases.
                </span>
                <button
                  onClick={() => {
                    setShowRepsModal(false);
                    setRepSearchQuery("");
                  }}
                  className="px-4 py-1.5 bg-slate-250 hover:bg-slate-350 border border-slate-350 text-slate-750 text-xs font-bold rounded-xl cursor-pointer transition select-none uppercase tracking-wider"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 📦 SURGICAL TRAUMA SETS DIRECTORY TABLE MODAL */}
      <AnimatePresence>
        {showSetsModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto">
            <motion.div
              initial={{ scale: 0.97, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.97, opacity: 0 }}
              className="bg-white border border-slate-205 rounded-3xl w-full max-w-4xl shadow-3xl flex flex-col max-h-[92vh] overflow-hidden"
              id="surgical-sets-modal-panel"
            >
              {/* Header */}
              <div className="px-5 py-4 border-b border-slate-150 flex items-center justify-between bg-slate-50 flex-shrink-0 select-none">
                <div className="flex items-center gap-2">
                  <Layers
                    className="text-blue-700 stroke-[2.2]"
                    size={18}
                  />
                  <h2 className="font-bold text-slate-900 text-sm sm:text-base font-display">
                    Surgical Trauma Sets & MDR Locations
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleDownloadVerificationReport}
                    className="flex items-center gap-1.5 px-3 py-1.5 border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-805 hover:text-amber-900 rounded-lg transition cursor-pointer font-bold shadow-2xs"
                    id="btn-download-verification-report"
                    title="Download side-by-side audit report comparing digital trays with official PDF registers"
                  >
                    <Download size={13} className="text-amber-700 stroke-[2.5]" />
                    <span className="hidden sm:inline">Download Verification Report</span>
                    <span className="sm:hidden">Report</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowSetsModal(false);
                      setSetsSearchQuery("");
                    }}
                    className="p-1.5 px-2.5 text-xs border border-slate-200 bg-white hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-705 transition cursor-pointer font-bold"
                  >
                    Close [ESC]
                  </button>
                </div>
              </div>

              {/* Search filter for Sets */}
              <div className="px-5 py-3.5 bg-slate-100/50 border-b border-slate-150 flex-shrink-0 flex flex-col gap-3">
                <div className="flex items-center justify-between gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-455 whitespace-nowrap pointer-events-none" size={15} />
                    <input
                      type="text"
                      value={setsSearchQuery}
                      onChange={(e) => setSetsSearchQuery(e.target.value)}
                      placeholder="Search sets by name, P-number, or MDR location..."
                      className="w-full pl-9 pr-8 py-2 bg-white border border-slate-250 rounded-xl text-xs text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500/15 focus:border-blue-500 transition"
                    />
                    {setsSearchQuery && (
                      <button
                        onClick={() => setSetsSearchQuery("")}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-405 hover:text-slate-605 transition"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                  <div className="text-xs font-semibold text-slate-505 shrink-0 bg-slate-200/60 px-2.5 py-1 rounded-lg select-none hidden sm:block">
                    Total Tray Sets: {DECORATED_SETS.length}
                  </div>
                </div>

                {/* Section Filter Buttons */}
                <div className="flex flex-wrap gap-1.5 overflow-x-auto py-0.5 max-h-24 scrollbar-thin">
                  {[
                    { id: "all", label: "All Sections" },
                    { id: "plates_and_screws", label: "Plates & Screws" },
                    { id: "cannulated_screws", label: "Cannulated Screws" },
                    { id: "hip", label: "Hip" },
                    { id: "tibia", label: "Tibia" },
                    { id: "external", label: "External" },
                    { id: "other", label: "Other / Backup" }
                  ].map((sec) => {
                    const isSelected = setsSectionFilter === sec.id;
                    return (
                      <button
                        key={sec.id}
                        onClick={() => setSetsSectionFilter(sec.id)}
                        className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition border cursor-pointer ${
                          isSelected
                            ? "bg-blue-600 text-white border-blue-600 shadow-2xs"
                            : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-800"
                        }`}
                      >
                        {sec.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Table wrapper */}
              <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4">
                <p className="text-xs text-slate-550 leading-relaxed">
                  The listing below includes all active surgical sets currently managed by the orthopedics department, complete with clinical inventory P-numbers and designated Medical Device Room (MDR) safe storage coordinates.
                </p>

                <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs bg-white text-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-205 text-slate-600 font-bold uppercase tracking-wider text-[10px] select-none">
                          <th className="px-4 py-3 font-semibold">Set Name</th>
                          <th className="px-4 py-3 font-semibold">Section</th>
                          <th className="px-4 py-3 font-semibold">P-Number</th>
                          <th className="px-4 py-3 font-semibold">MDR Location</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {(() => {
                          const sectionBadgeMap: Record<string, { label: string; bg: string; text: string; border: string }> = {
                            plates_and_screws: { label: "Plates & Screws", bg: "bg-slate-100", text: "text-slate-700", border: "border-slate-200/65" },
                            cannulated_screws: { label: "Cannulated", bg: "bg-teal-50", text: "text-teal-700", border: "border-teal-200/50" },
                            hip: { label: "Hip", bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200/50" },
                            tibia: { label: "Tibia", bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200/50" },
                            external: { label: "External Fx", bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200/50" },
                            other: { label: "Other / Backup", bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-200/50" }
                          };

                          const filtered = DECORATED_SETS.filter((s) => {
                            if (setsSectionFilter !== "all" && s.section !== setsSectionFilter) {
                              return false;
                            }

                            const q = setsSearchQuery.toLowerCase().trim();
                            if (!q) return true;
                            // Check custom location if any
                            const customLoc = customLocations[s.id] || "";
                            return (
                              s.name.toLowerCase().includes(q) ||
                              (s.pNumber || "").toLowerCase().includes(q) ||
                              (s.defaultLocation || "").toLowerCase().includes(q) ||
                              customLoc.toLowerCase().includes(q)
                            );
                          });

                          if (filtered.length === 0) {
                            return (
                              <tr className="text-center bg-slate-50/50">
                                <td colSpan={4} className="px-4 py-8 text-xs text-slate-450 italic">
                                  No matching surgical sets found. Refine your search query or section filter.
                                </td>
                              </tr>
                            );
                          }

                          return filtered.map((s) => {
                            const finalLocation = customLocations[s.id] || s.defaultLocation || "MDR Cabinet Core C, Shelf 4";
                            const isCustom = !!customLocations[s.id];
                            const badge = sectionBadgeMap[s.section || "other"] || { label: "Other", bg: "bg-slate-100", text: "text-slate-700", border: "border-slate-200" };
                            
                            return (
                              <tr
                                key={s.id}
                                className="hover:bg-slate-50/70 transition-colors animate-fadeIn"
                              >
                                <td className="px-4 py-3 font-medium text-slate-850">
                                  <button
                                    onClick={() => {
                                      handleOpenSet(s.id);
                                      setShowSetsModal(false);
                                    }}
                                    className="text-left font-bold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer focus:outline-none transition-colors"
                                  >
                                    {s.name}
                                  </button>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${badge.bg} ${badge.text} ${badge.border}`}>
                                    {badge.label}
                                  </span>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap font-mono text-[11px] font-semibold text-blue-800">
                                  <span className="bg-blue-50 border border-blue-100/70 rounded-md px-1.5 py-0.5 select-all">
                                    {s.pNumber}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-slate-700">
                                  <div className="flex items-center gap-1.5 font-medium">
                                    <MapPin size={11.5} className={isCustom ? "text-amber-500" : "text-[#00A3E0] shrink-0"} />
                                    <span>{finalLocation}</span>
                                    {isCustom && (
                                      <span className="text-[8.5px] uppercase font-bold text-amber-600 bg-amber-50 border border-amber-200/50 px-1.5 py-0.2 rounded">
                                        Custom
                                      </span>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            );
                          });
                        })()}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="bg-slate-100 px-5 sm:px-6 py-3 border-t border-slate-200 flex justify-end shrink-0 select-none">
                <button
                  onClick={() => {
                    setShowSetsModal(false);
                    setSetsSearchQuery("");
                  }}
                  className="px-4 py-1.5 bg-slate-250 hover:bg-slate-350 border border-slate-350 text-slate-750 text-xs font-bold rounded-xl cursor-pointer transition select-none uppercase tracking-wider"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 🔐 CLINICAL SECURE ORDER ARCHIVE VAULT MODAL */}
      <AnimatePresence>
        {showAdminModal && (
          <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto">
            <motion.div
              initial={{ scale: 0.97, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.97, opacity: 0 }}
              className="bg-white border border-slate-205 rounded-3xl w-full max-w-2xl shadow-3xl flex flex-col max-h-[92vh] overflow-hidden"
              id="secure-archive-vault-modal"
            >
              {/* Header */}
              <div className="px-5 py-4 border-b border-slate-150 flex items-center justify-between bg-slate-50 flex-shrink-0 select-none">
                <div className="flex items-center gap-2">
                  <ShieldCheck
                    className="text-amber-600 stroke-[2.2]"
                    size={18}
                  />
                  <div>
                    <h2 className="font-bold text-slate-900 text-sm sm:text-base font-display">
                      Secure Requisition Archive
                    </h2>
                    <p className="text-[10px] text-slate-450 font-medium">
                      Clinician-gated order audit logs & database
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowAdminModal(false);
                    setIsPasswordIncorrect(false);
                  }}
                  className="p-1 px-2.5 text-xs border border-slate-200 bg-white hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-705 transition cursor-pointer font-bold"
                >
                  Close [ESC]
                </button>
              </div>

              {/* Password Gate Screen */}
              {!unlocked ? (
                <div className="p-6 sm:p-8 flex flex-col items-center justify-center text-center space-y-6 flex-1 overflow-y-auto">
                  <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center border border-amber-200 text-amber-600 select-none animate-pulse">
                    <Lock size={20} />
                  </div>
                  <div className="space-y-1 max-w-md">
                    <h3 className="font-bold text-slate-800 text-sm sm:text-base uppercase tracking-wider font-display">Protected Personnel Access Only</h3>
                    <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                      Please enter the team password to access historical tray manifest data and order histories - and to unlock editing, verification, and flagging anywhere else in the app for this browser session.
                    </p>
                  </div>

                  <form onSubmit={handleVerifyPassword} className="w-full max-w-sm space-y-3 pt-2">
                    <div className="space-y-1 text-left">
                      <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider block">Credential Access Key</label>
                      <input
                        type="password"
                        placeholder="Enter password..."
                        value={inputPassword}
                        onChange={(e) => {
                          setInputPassword(e.target.value);
                          setIsPasswordIncorrect(false);
                        }}
                        autoFocus
                        className={`w-full px-4 py-2 bg-white border rounded-xl text-sm text-center font-mono font-bold transition focus:outline-none ${
                          isPasswordIncorrect 
                            ? "border-rose-400 focus:ring-1 focus:ring-rose-505/20 focus:border-rose-500 text-rose-800 bg-rose-50/20" 
                            : "border-slate-300 focus:ring-1 focus:ring-amber-500/20 focus:border-amber-600 text-slate-900"
                        }`}
                      />
                      {passwordCooldownMessage ? (
                        <p className="text-[11px] text-amber-700 font-bold font-sans mt-1 text-center select-none">
                          ⏱️ {passwordCooldownMessage}
                        </p>
                      ) : isPasswordIncorrect && (
                        <p className="text-[11px] text-rose-600 font-bold font-sans mt-1 text-center select-none animate-bounce">
                          ⚠️ Access Denied: Incorrect credentials
                        </p>
                      )}
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2 px-4 bg-slate-900 hover:bg-slate-950 text-white text-xs font-bold rounded-xl cursor-pointer shadow-xs transition uppercase tracking-wider animate-pulse"
                    >
                      Authenticate credentials
                    </button>
                  </form>
                </div>
              ) : (                <div className="flex flex-col flex-1 overflow-hidden">
                  {/* Stats & Controls bar */}
                  <div className="px-5 py-3 bg-slate-100 border-b border-slate-150 flex items-center justify-between flex-shrink-0">
                    <div className="text-xs text-slate-655 flex items-center gap-1 font-bold">
                      <ShieldCheck className="text-emerald-600 animate-bounce" size={14} />
                      <span>Authenticated Session • <strong>Access Authorized</strong></span>
                    </div>
                    <button
                      onClick={handleLogoutAdmin}
                      className="px-2.5 py-1 text-[10px] bg-white hover:bg-rose-50 border border-slate-255 hover:border-rose-200 text-slate-600 hover:text-rose-700 rounded-lg cursor-pointer transition flex items-center gap-1 font-bold select-none uppercase tracking-wider"
                    >
                      <Lock size={10} />
                      <span>Lock Portal</span>
                    </button>
                  </div>

                  {/* Tabs Selector for Requisitions vs Flagged Issues */}
                  <div className="px-5 bg-slate-50 border-b border-slate-150 flex gap-4 select-none flex-shrink-0">
                    <button
                      onClick={() => setArchiveActiveTab("requisitions")}
                      className={`py-2.5 text-[11px] font-bold uppercase tracking-wider border-b-2 transition cursor-pointer ${
                        archiveActiveTab === "requisitions"
                          ? "border-[#008CBF] text-[#002D62]"
                          : "border-transparent text-slate-450 hover:text-slate-705"
                      }`}
                    >
                      Audit Requisitions ({archivedOrders.length})
                    </button>
                    <button
                      onClick={() => setArchiveActiveTab("issues")}
                      className={`py-2.5 text-[11px] font-bold uppercase tracking-wider border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
                        archiveActiveTab === "issues"
                          ? "border-rose-500 text-rose-800"
                          : "border-transparent text-slate-450 hover:text-slate-705"
                      }`}
                    >
                      <span>Flagged Issues ({flaggedIssues.length})</span>
                      {flaggedIssues.filter(i => i.status === "Pending").length > 0 && (
                        <span className="bg-rose-500 text-white rounded-full text-[8px] h-4 min-w-4 px-1 flex items-center justify-center font-extrabold animate-pulse">
                          {flaggedIssues.filter(i => i.status === "Pending").length}
                        </span>
                      )}
                    </button>
                    <button
                      onClick={() => setArchiveActiveTab("oos")}
                      className={`py-2.5 text-[11px] font-bold uppercase tracking-wider border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
                        archiveActiveTab === "oos"
                          ? "border-amber-500 text-amber-800"
                          : "border-transparent text-slate-450 hover:text-slate-705"
                      }`}
                    >
                      <span>Out of Stock ({oosAlerts.length})</span>
                      {oosAlerts.filter(a => a.status === "Pending").length > 0 && (
                        <span className="bg-amber-500 text-white rounded-full text-[8px] h-4 min-w-4 px-1 flex items-center justify-center font-extrabold animate-pulse">
                          {oosAlerts.filter(a => a.status === "Pending").length}
                        </span>
                      )}
                    </button>
                  </div>

                  {/* Orders List Container */}
                  <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4">
                    {archiveActiveTab === "requisitions" ? (
                      /* Original Requisitions view */
                      archivedOrders.length === 0 ? (
                        <div className="text-center py-12 space-y-3">
                          <div className="w-14 h-14 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 mx-auto select-none animate-bounce">
                            <FolderOpen size={24} />
                          </div>
                          <div className="space-y-1">
                            <h4 className="font-bold text-slate-805 text-sm uppercase">Archive is currently empty</h4>
                            <p className="text-xs text-slate-400 max-w-xs mx-auto font-medium">
                              Submit a new replenishment requisition to automatically log your surgical run history safely inside this secure archive list.
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {archivedOrders.map((order) => {
                            const orderTotalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);
                            
                            const handleCopyOrderManifest = () => {
                              let text = `MANIFEST REQUISITION ${order.id}\n`;
                              text += `Timestamp: ${order.timestamp}\n`;
                              text += `--------------------------------------------------\n`;
                              order.items.forEach((item, index) => {
                                const sizeStr = item.itemType === "plate" || item.selectedLength === "N/A" ? "Plate" : `Size: ${item.selectedLength}mm`;
                                text += `${index + 1}. [Qty: ${item.quantity}] ${item.screwType}, ${sizeStr}\n`;
                                text += `   Catalog Ref: ${item.catalogRef} | Source Base: ${item.setName}\n`;
                                text += `   Current Location: ${item.location}\n`;
                                if (item.notes) text += `   Notes: ${item.notes}\n`;
                                text += `\n`;
                              });
                              text += `--------------------------------------------------\n`;
                              text += `Total Implants: ${orderTotalItems}`;
                              navigator.clipboard.writeText(text);
                              alert(`Manifest details for Order ${order.id} copied successfully!`);
                            };

                            const handleDeleteArchivedOrder = (idToDelete: string) => {
                              if (window.confirm(`Are you sure you want to permanently clear record ${idToDelete}?`)) {
                                const updated = archivedOrders.filter((o) => o.id !== idToDelete);
                                setArchivedOrders(updated);
                                saveArchivedOrders(updated);
                              }
                            };

                            return (
                              <div
                                key={order.id}
                                className="border border-slate-205 rounded-2xl bg-slate-50/50 p-4 space-y-3 shadow-3xs"
                              >
                                {/* Order Header */}
                                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2">
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-mono font-bold text-slate-900 text-xs sm:text-sm bg-slate-200 px-2 py-0.5 rounded">
                                      {order.id}
                                    </span>
                                    <span className="text-[10px] text-slate-450 font-medium font-mono">
                                      {order.timestamp}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1.5 font-sans">
                                    <button
                                      onClick={handleCopyOrderManifest}
                                      className="p-1 px-2 text-[10px] bg-white hover:bg-slate-105 border border-slate-200 hover:border-slate-300 text-slate-600 hover:text-slate-850 rounded-lg cursor-pointer transition flex items-center gap-1 font-semibold"
                                      title="Copy manifest text"
                                    >
                                      <Copy size={10} />
                                      <span>Copy Manifest</span>
                                    </button>
                                    <button
                                      onClick={() => handleDeleteArchivedOrder(order.id)}
                                      className="p-1 px-2 text-[10px] bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-250 text-slate-455 hover:text-rose-700 rounded-lg cursor-pointer transition flex items-center gap-1 font-semibold"
                                      title="Delete archive record"
                                    >
                                      <Trash2 size={10} />
                                      <span>Delete</span>
                                    </button>
                                  </div>
                                </div>

                                {/* Order Items Table layout */}
                                <div className="bg-white border border-slate-150 rounded-xl overflow-hidden shadow-xs">
                                  <table className="w-full text-xs text-left">
                                    <thead className="bg-slate-100 text-[10px] uppercase font-bold text-slate-450 border-b border-slate-200">
                                      <tr>
                                        <th className="px-3 py-1.5 font-semibold">Implant</th>
                                        <th className="px-2 py-1.5 text-center font-semibold">Length</th>
                                        <th className="px-2 py-1.5 text-center font-semibold">Catalog Ref</th>
                                        <th className="px-3 py-1.5 text-right font-semibold">Qty</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-101 font-medium">
                                      {order.items.map((item, idy) => {
                                        const isManual = !!item.isManualEntry;
                                        return (
                                          <tr key={idy} className={`hover:bg-slate-50/50 ${isManual ? "bg-amber-50/30" : ""}`}>
                                            <td className="px-3 py-1.5">
                                              <div className="font-bold text-slate-800 flex items-center gap-1">
                                                <span>{item.screwType}</span>
                                                {isManual && (
                                                  <span className="bg-amber-100 text-amber-900 border border-amber-200 text-[7px] font-extrabold uppercase px-1 rounded select-none font-sans">
                                                    Manual
                                                  </span>
                                                )}
                                              </div>
                                              <div className="text-[9px] text-slate-400 font-semibold font-mono">
                                                {isManual ? (
                                                  <span className="text-amber-705 font-bold">⚠️ MANUALLY ENTERED SPECIFICATIONS</span>
                                                ) : (
                                                  <>Tray: {item.setName} • Spot: {item.location}</>
                                                )}
                                              </div>
                                            </td>
                                            <td className="px-2 py-1.5 text-center font-mono font-bold text-slate-700">
                                              {isManual ? item.selectedLength : item.itemType === "plate" || item.selectedLength === "N/A" ? "Plate" : `${item.selectedLength}mm`}
                                            </td>
                                            <td className="px-2 py-1.5 text-center font-mono text-slate-650">{item.catalogRef}</td>
                                            <td className="px-3 py-1.5 text-right font-mono font-bold text-slate-900">{item.quantity}</td>
                                          </tr>
                                        );
                                      })}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )
                    ) : (
                      /* Flagged Issues List View */
                      flaggedIssues.length === 0 ? (
                        <div className="text-center py-12 space-y-3">
                          <div className="w-14 h-14 rounded-full bg-slate-105 border border-slate-200 flex items-center justify-center text-slate-355 mx-auto select-none animate-bounce">
                            <FileCheck size={24} />
                          </div>
                          <div className="space-y-1">
                            <h4 className="font-bold text-slate-805 text-sm uppercase font-display">No Flagged Discrepancies</h4>
                            <p className="text-xs text-slate-400 max-w-xs mx-auto text-center font-semibold">
                              Excellent! There are currently zero flagged clinical issues. Main tray entries and catalogs are perfectly aligned.
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {flaggedIssues.map((issue) => {
                            const isPending = issue.status === "Pending";
                            const isHigh = issue.severity === "High";
                            const isMed = issue.severity === "Medium";
                            
                            const severityBadge = 
                              isHigh 
                                ? "bg-rose-50 border-rose-250 text-rose-700 font-extrabold" 
                                : isMed 
                                  ? "bg-amber-50 border-amber-250 text-amber-705 font-extrabold" 
                                  : "bg-sky-50 border-sky-250 text-sky-700 font-extrabold";

                            return (
                              <div
                                key={issue.id}
                                className={`border rounded-2xl p-4 space-y-3 shadow-3xs transition ${
                                  isPending 
                                    ? isHigh 
                                      ? "bg-rose-50/15 border-rose-205" 
                                      : "bg-white border-slate-205"
                                    : "bg-slate-50 border-slate-200 opacity-80"
                                }`}
                              >
                                {/* Issue Header */}
                                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-dashed border-slate-200 pb-2 select-none">
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-mono font-bold text-slate-850 text-xs sm:text-xs bg-slate-105 border border-slate-250 px-2 py-0.5 rounded">
                                      {issue.id}
                                    </span>
                                    <span className="text-[10px] text-slate-450 font-bold font-mono">
                                      {issue.timestamp}
                                    </span>
                                    <span className={`text-[9px] border px-1.5 py-0.5 rounded uppercase ${severityBadge}`}>
                                      {issue.severity} Priority
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                      isPending 
                                        ? "bg-amber-50 text-amber-800 border border-amber-205 animate-pulse" 
                                        : "bg-emerald-50 text-emerald-800 border border-emerald-200"
                                    }`}>
                                      {isPending ? "🔴 Pending Fix" : "🟢 Solved / Resolved"}
                                    </span>
                                    <button
                                      onClick={() => {
                                        if (window.confirm(`Are you sure you want to permanently clear logged issue ${issue.id}?`)) {
                                          handleDeleteFlaggedIssue(issue.id);
                                        }
                                      }}
                                      className="p-1 px-1.5 bg-rose-50 hover:bg-rose-600 border border-rose-100 hover:border-rose-700 text-rose-700 hover:text-white rounded-lg cursor-pointer transition select-none flex items-center justify-center border-slate-200 hover:border-rose-250 text-slate-455 rounded-lg transition"
                                      title="Delete Log"
                                    >
                                      <Trash2 size={11} />
                                    </button>
                                  </div>
                                </div>

                                {/* Main discrepancy details */}
                                <div className="space-y-1.5 text-xs text-slate-705 text-left">
                                  <div className="flex items-center gap-1.5 font-semibold text-slate-850 bg-slate-50 p-2 rounded-xl border border-slate-150">
                                    <span className="text-slate-450 uppercase text-[9px] font-bold">Affected Instrument Set:</span>
                                    <span className="font-extrabold text-rose-900">{issue.setName}</span>
                                  </div>
                                  <div className="bg-white/90 p-3 rounded-xl border border-slate-200 text-slate-800 leading-relaxed font-semibold whitespace-pre-wrap shadow-3xs">
                                    {issue.description}
                                  </div>
                                </div>

                                {/* Author info */}
                                <div className="flex items-center justify-between text-[11px] text-slate-500 font-bold bg-slate-50 p-2 rounded-xl border border-slate-200 shadow-3xs select-none">
                                  <div>
                                    <span className="text-slate-450 font-bold uppercase text-[9px]">Reporter:</span> <span className="text-slate-755 font-bold">{issue.reporter}</span>
                                  </div>
                                  {issue.contact && (
                                    <div>
                                      <span className="text-slate-455 font-bold uppercase text-[9px]">Contact:</span> <span className="text-slate-755 font-bold">{issue.contact}</span>
                                    </div>
                                  )}
                                </div>

                                {/* Admin resolution card */}
                                {isPending ? (
                                  <div className="pt-1 select-none">
                                    <form 
                                      onSubmit={(e) => {
                                        e.preventDefault();
                                        const form = e.currentTarget;
                                        const input = form.elements.namedItem("resNotes") as HTMLInputElement;
                                        handleResolveFlaggedIssue(issue.id, input.value);
                                        input.value = "";
                                      }}
                                      className="flex gap-2 items-center"
                                    >
                                      <input
                                        type="text"
                                        name="resNotes"
                                        onPaste={guardPaste}
                                        placeholder="Add resolution details (e.g. 'Cross-referenced pdf specifications.')"
                                        className="flex-1 bg-white border border-slate-200 hover:border-slate-300 focus:border-[#008CBF] rounded-xl px-3 py-1.5 text-xs font-semibold focus:outline-none transition shadow-2xs"
                                        required
                                      />
                                      <button
                                        type="submit"
                                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg cursor-pointer transition select-none flex items-center gap-1 shadow-2xs uppercase tracking-wide"
                                      >
                                        <Check size={11} />
                                        <span>Resolve Fix</span>
                                      </button>
                                    </form>
                                  </div>
                                ) : (
                                  issue.resolutionNotes && (
                                    <div className="bg-emerald-50/50 p-3 rounded-xl border border-emerald-250 text-xs font-semibold text-slate-705 space-y-1 animate-fadeIn shadow-2xs select-none text-left">
                                      <div className="text-[10px] text-emerald-850 font-black uppercase tracking-wider flex items-center gap-1">
                                        <Check size={11} />
                                        <span>Administrative Action Logged</span>
                                      </div>
                                      <p className="italic leading-relaxed text-slate-655 font-medium">"{issue.resolutionNotes}"</p>
                                    </div>
                                  )
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )
                    )}

                    {archiveActiveTab === "oos" && (
                      oosAlerts.length === 0 ? (
                        <div className="text-center py-12 space-y-3">
                          <div className="w-14 h-14 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 mx-auto select-none animate-bounce">
                            <FolderOpen size={24} />
                          </div>
                          <div className="space-y-1">
                            <h4 className="font-bold text-slate-805 text-sm uppercase">No out-of-stock alerts logged</h4>
                            <p className="text-xs text-slate-400 max-w-xs mx-auto font-medium">
                              Implants flagged as out of stock from any set's detail page will appear here.
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {oosAlerts.map((alert) => {
                            const isPending = alert.status === "Pending";
                            return (
                              <div
                                key={alert.id}
                                className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2.5 shadow-2xs"
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <div className="flex items-center gap-2 text-[10px] text-slate-450 font-bold uppercase tracking-wider">
                                    <span className="font-mono">{alert.id}</span>
                                    <span>•</span>
                                    <span>{alert.timestamp}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span
                                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                        isPending
                                          ? "bg-amber-50 text-amber-800 border border-amber-205 animate-pulse"
                                          : "bg-emerald-50 text-emerald-800 border border-emerald-200"
                                      }`}
                                    >
                                      {isPending ? "🟡 Pending Reorder" : "🟢 Resolved"}
                                    </span>
                                    {isPending && (
                                      <button
                                        onClick={() => {
                                          if (!unlocked) { setShowAdminModal(true); return; }
                                          const updated = oosAlerts.map((a) =>
                                            a.id === alert.id ? { ...a, status: "Resolved" as const } : a
                                          );
                                          setOosAlerts(updated);
                                          try {
                                            localStorage.setItem("ortho_oos_alerts", JSON.stringify(updated));
                                          } catch (e) {
                                            console.error("Failed to save OOS resolution locally", e);
                                          }
                                          setDoc(doc(db, "oos_alerts", alert.id), { ...alert, status: "Resolved" }).catch((e) => {
                                            handleFirestoreError(e, OperationType.WRITE, `oos_alerts/${alert.id}`);
                                          });
                                        }}
                                        className="px-2.5 py-1 text-[10px] bg-emerald-50 hover:bg-emerald-600 border border-emerald-200 hover:border-emerald-700 text-emerald-700 hover:text-white rounded-lg cursor-pointer transition select-none font-bold uppercase tracking-wide"
                                      >
                                        Mark Reordered
                                      </button>
                                    )}
                                  </div>
                                </div>
                                <div className="grid grid-cols-12 gap-1 items-center text-xs">
                                  <span className="col-span-4 text-[10px] font-bold text-slate-450 uppercase tracking-wider">Implant</span>
                                  <span className="col-span-8 font-extrabold text-slate-900">{alert.screwType} ({alert.length} mm)</span>
                                </div>
                                <div className="grid grid-cols-12 gap-1 items-center text-xs">
                                  <span className="col-span-4 text-[10px] font-bold text-slate-450 uppercase tracking-wider">Catalog Ref</span>
                                  <span className="col-span-8 font-mono font-extrabold text-rose-800">{alert.catalogRef}</span>
                                </div>
                                <div className="grid grid-cols-12 gap-1 items-center text-xs">
                                  <span className="col-span-4 text-[10px] font-bold text-slate-450 uppercase tracking-wider">Set</span>
                                  <span className="col-span-8 font-bold text-slate-700">{alert.setName}</span>
                                </div>
                                <div className="grid grid-cols-12 gap-1 items-center text-xs">
                                  <span className="col-span-4 text-[10px] font-bold text-slate-450 uppercase tracking-wider">Location</span>
                                  <span className="col-span-8 font-bold text-slate-650">📍 {alert.location}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )
                    )}
                  </div>

                  {/* Authenticated Footer */}
                  <div className="px-5 py-3 border-t border-slate-150 bg-slate-50 flex items-center justify-between flex-shrink-0 select-none">
                    <span className="text-[10px] text-slate-450 font-medium italic">
                      * Manifest and catalogs conform with hospital DePuy/Stryker inventory.
                    </span>
                    <button
                      onClick={() => {
                        setShowAdminModal(false);
                      }}
                      className="px-4 py-1.5 bg-slate-805 hover:bg-slate-850 text-white text-xs font-bold rounded-xl cursor-pointer transition select-none uppercase tracking-wider"
                    >
                      Done Checking
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ⚠️ CLINICAL CONTAMINATION PROTOCOL & CRITICAL BACKUP WIZARD */}
      <AnimatePresence>
        {showContaminationModal && (
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 z-50 overflow-y-auto">
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              className="bg-white border border-slate-205 rounded-3xl w-full max-w-5xl shadow-3xl flex flex-col max-h-[92vh] overflow-hidden"
              id="critical-contamination-protocol-modal"
            >
              {/* Header */}
              <div className="px-6 py-4.5 border-b border-rose-150 flex items-center justify-between bg-rose-50/50 flex-shrink-0 select-none">
                <div className="flex items-center gap-2">
                  <div className="p-1 px-2 border border-rose-200 bg-rose-100/50 text-rose-800 rounded-lg animate-pulse">
                    <AlertTriangle size={16} />
                  </div>
                  <div>
                    <h2 className="font-bold text-rose-950 text-sm sm:text-base font-display flex items-center gap-1.5 uppercase tracking-wide">
                      Clinical Contamination Protocol
                    </h2>
                    <p className="text-[10px] text-slate-500 font-medium">
                      OR Crisis Management • Dynamic Tray Alternative & Cross-Reference Solver
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowContaminationModal(false)}
                  className="p-1 px-2.5 text-xs border border-slate-200 bg-white hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-705 transition cursor-pointer font-bold"
                >
                  Close [ESC]
                </button>
              </div>

              {/* Main Content Pane - Grid Split */}
              <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-0">
                
                {/* LEFT COLUMN: Setup Contaminated Set (5 cols) */}
                <div className="lg:col-span-6 border-r border-slate-150 bg-slate-50/55 flex flex-col min-h-[280px]">
                  <div className="p-4 border-b border-slate-150 flex-shrink-0 space-y-1.5 pb-3">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block font-mono">
                      Step 1: Select the Contaminated Set
                    </label>
                    <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">
                      Toggle any trauma tray below that experienced sterile compromise in the operating suite:
                    </p>
                    {/* Reference-number cross-reference lookup */}
                    <div className="relative pt-1">
                      <input
                        type="text"
                        value={contaminationRefLookup}
                        onChange={(e) => setContaminationRefLookup(e.target.value)}
                        placeholder="Or type a catalog ref # (e.g. 204.840, 02.527.073)…"
                        className="w-full text-[11px] font-mono font-semibold px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-800 placeholder:text-slate-350 placeholder:font-sans focus:outline-none focus:border-rose-300 focus:ring-1 focus:ring-rose-200"
                      />
                      {contaminationRefLookup.trim() !== "" && (
                        <button
                          onClick={() => setContaminationRefLookup("")}
                          className="absolute right-1.5 top-1/2 -translate-y-1/2 mt-0.5 text-slate-400 hover:text-slate-700 text-sm font-bold px-1 cursor-pointer"
                        >
                          ×
                        </button>
                      )}
                    </div>
                    {contaminationRefLookup.trim() !== "" && (
                      <p className="text-[10px] font-semibold text-rose-700">
                        {contaminationSetList.length === 0
                          ? "No set in inventory carries that reference number."
                          : `${contaminationSetList.length} set${contaminationSetList.length === 1 ? "" : "s"} carry this reference — these are your sterile alternatives.`}
                      </p>
                    )}
                  </div>

                  {/* List of sets */}
                  <div className="p-3 overflow-y-auto flex-1 space-y-1.5">
                    {contaminationSetList.map(({ set, matchedRefs }) => {
                      const isSelected = selectedContaminatedSetId === set.id;
                      return (
                        <button
                          key={set.id}
                          onClick={() => setSelectedContaminatedSetId(set.id)}
                          className={`w-full text-left p-3 rounded-xl border transition cursor-pointer flex flex-col gap-1 text-xs font-semibold ${
                            isSelected
                              ? "bg-rose-50/60 border-rose-300 text-rose-950 shadow-3xs"
                              : "bg-white border-slate-200 hover:bg-slate-50 text-slate-700 hover:text-slate-900"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-1.5">
                            <span className="font-bold tracking-tight line-clamp-1 text-slate-800">{set.name}</span>
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded flex-shrink-0 uppercase font-mono ${
                              isSelected ? "bg-rose-100 border border-rose-200 text-rose-800" : "bg-slate-100 border border-slate-200 text-slate-500"
                            }`}>
                              {set.defaultMaterial || "Both"}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-1 text-[10px] text-slate-450 mt-1 font-semibold">
                            <MapPin size={9} />
                            <span className="truncate">{customLocations[set.id] || set.defaultLocation}</span>
                          </div>

                          {matchedRefs.length > 0 && (
                            <div className="mt-1 pt-1 border-t border-rose-100 space-y-0.5">
                              <span className="text-[9px] font-bold text-rose-700 uppercase tracking-wider block">
                                Carries this reference:
                              </span>
                              {matchedRefs.slice(0, 4).map((mr, i) => (
                                <span key={i} className="text-[10px] font-mono font-semibold text-slate-600 block truncate">
                                  • {mr}
                                </span>
                              ))}
                              {matchedRefs.length > 4 && (
                                <span className="text-[9px] text-slate-400 font-semibold">
                                  + {matchedRefs.length - 4} more
                                </span>
                              )}
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Contaminated Set Screw Summary Drawer */}
                  {contaminatedSet && (
                    <div className="p-4 bg-rose-50/30 border-t border-rose-100 flex-shrink-0 space-y-2 select-none">
                      <div className="flex items-center justify-between gap-1.5 flex-wrap">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-rose-850 uppercase tracking-wider">
                          <AlertTriangle size={12} className="text-rose-600 animate-pulse" />
                          <span>Compromised Implants ({(contaminatedSet.screws.length || 0) + (contaminatedSet.plates?.length || 0)})</span>
                        </div>
                        {(prioritizedScrewType || prioritizedPlate) && (
                          <button
                            onClick={() => {
                              setPrioritizedScrewType("");
                              setPrioritizedPlate("");
                            }}
                            className="text-[9px] text-[#A30000] hover:text-rose-950 font-bold bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-md cursor-pointer transition select-none flex items-center gap-0.5"
                          >
                            <span>Clear Priority</span>
                            <span className="font-sans">×</span>
                          </button>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-550 font-semibold italic leading-normal">
                        💡 Click any screw or plate below to prioritize it and narrow alternative sets dynamically.
                      </p>
                      <div className="space-y-2 max-h-[175px] overflow-y-auto">
                        {/* Screws list */}
                        {contaminatedSet.screws.length > 0 && (
                          <div className="space-y-1">
                            <span className="text-[9px] font-extrabold text-slate-450 uppercase tracking-wider block font-mono">Screws ({contaminatedSet.screws.length}):</span>
                            <div className="bg-white border border-rose-150 rounded-xl p-1 shadow-3xs space-y-0.5">
                              {contaminatedSet.screws.map((scr, idx) => {
                                const isPrioritized = prioritizedScrewType === scr.type;
                                return (
                                  <button
                                    key={`scr-${idx}`}
                                    onClick={() => {
                                      setPrioritizedScrewType(isPrioritized ? "" : scr.type);
                                      setPrioritizedPlate(""); // Clear plate priority when a screw is selected
                                    }}
                                    className={`w-full text-left p-1.5 px-2 rounded-lg border transition cursor-pointer flex justify-between items-center text-[11px] font-medium ${
                                      isPrioritized
                                        ? "bg-amber-50 border-amber-300 text-amber-950 font-bold shadow-3xs"
                                        : "bg-white border-transparent hover:bg-slate-50 text-slate-700"
                                    }`}
                                  >
                                    <div className="flex items-center gap-1.5 min-w-0">
                                      {isPrioritized ? (
                                        <Star size={11} className="text-amber-500 fill-amber-500 shrink-0" />
                                      ) : (
                                        <div className="w-1.5 h-1.5 bg-slate-350 rounded-full shrink-0" />
                                      )}
                                      <span className="truncate">{scr.type}</span>
                                    </div>
                                    <span className={`font-mono text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0 ${
                                      isPrioritized ? "bg-amber-150 border border-amber-300 text-amber-900" : "bg-slate-50 border border-slate-200 text-slate-450"
                                    }`}>
                                      {scr.lengthRange}mm
                                    </span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Plates list */}
                        {contaminatedSet.plates && contaminatedSet.plates.length > 0 && (
                          <div className="space-y-1">
                            <span className="text-[9px] font-extrabold text-slate-450 uppercase tracking-wider block font-mono">Plates ({contaminatedSet.plates.length}):</span>
                            <div className="bg-white border border-rose-150 rounded-xl p-1 shadow-3xs space-y-0.5">
                              {contaminatedSet.plates.map((plt, idx) => {
                                const isPrioritized = prioritizedPlate === plt;
                                return (
                                  <button
                                    key={`plt-${idx}`}
                                    onClick={() => {
                                      setPrioritizedPlate(isPrioritized ? "" : plt);
                                      setPrioritizedScrewType(""); // Clear screw priority when a plate is selected
                                    }}
                                    className={`w-full text-left p-1.5 px-2 rounded-lg border transition cursor-pointer flex justify-between items-center text-[11px] font-medium ${
                                      isPrioritized
                                        ? "bg-amber-50 border-amber-300 text-amber-950 font-bold shadow-3xs"
                                        : "bg-white border-transparent hover:bg-slate-50 text-slate-700"
                                    }`}
                                  >
                                    <div className="flex items-center gap-1.5 min-w-0">
                                      {isPrioritized ? (
                                        <Star size={11} className="text-amber-500 fill-amber-500 shrink-0" />
                                      ) : (
                                        <div className="w-1.5 h-1.5 bg-slate-350 rounded-full shrink-0" />
                                      )}
                                      <span className="truncate">{plt.replace(/#\s*[\w.]+\s*$/, "").trim()}</span>
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* RIGHT COLUMN: Brainstorm & cross reference alternatives (7 cols) */}
                <div className="lg:col-span-6 flex flex-col min-h-[280px] bg-white">
                  <div className="p-4 border-b border-slate-150 flex-shrink-0 space-y-1 bg-slate-50/20">
                    <label className="text-[10px] font-bold text-teal-850 uppercase tracking-widest block">
                      Step 2: Dynamic Replacement Alternatives Matrix
                    </label>
                    <p className="text-[11px] text-slate-500 leading-relaxed font-semibold">
                      The cross-reference engine analyzes substitute trays in active hospital storage, matching on screw diameter, length range overlap, and function (cortex/cancellous/locking/cannulated):
                    </p>


                    {contaminatedSet && (
                      <div className="mt-3.5 p-3.5 bg-gradient-to-r from-teal-50/70 to-[#f0fcfc] border border-teal-200 rounded-2xl space-y-2 text-left shadow-2xs select-none">
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 rounded-lg bg-teal-500 text-white flex items-center justify-center font-bold text-xs">
                            🔍
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-tight font-display">
                              Verify Off-Site Alternatives
                            </h4>
                            <p className="text-[9px] text-slate-500 font-semibold font-sans">
                              Surgical Sterile Field Contingency Checklist
                            </p>
                          </div>
                        </div>
                        <p className="text-[10px] text-slate-600 font-semibold leading-relaxed font-sans">
                          Off-site alternatives are included in the results list below when no on-site match is sufficient - use the "Show off-site alternatives" toggle there rather than a separate window.
                        </p>
                      </div>
                    )}

                  </div>

                  {/* Results list */}
                  <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-5">
                    {!contaminatedSet ? (
                      <div className="text-center py-20 space-y-3">
                        <div className="w-14 h-14 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 mx-auto select-none animate-bounce">
                          <Layers size={22} />
                        </div>
                        <h4 className="font-bold text-slate-705 text-sm">Waiting for Selection</h4>
                        <p className="text-xs text-slate-455 max-w-xs mx-auto font-semibold">
                          Select a contaminated tray from the left pane to analyze matching back-up replacement kits dynamically.
                        </p>
                      </div>
                    ) : contaminationAlternatives.length === 0 ? (
                      <div className="text-center py-20 space-y-3">
                        <div className="w-14 h-14 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500 mx-auto select-none">
                          <AlertTriangle size={22} />
                        </div>
                        <h4 className="font-bold text-slate-800 text-sm">No Substitutes Map Found</h4>
                        <p className="text-xs text-slate-505 max-w-xs mx-auto font-semibold">
                          {(prioritizedScrewType || prioritizedPlate)
                            ? `No alternative trays share a compatibility match with your prioritized implant (${prioritizedScrewType || prioritizedPlate}). Try selecting a different priority or clearing the priority filter.`
                            : `This is a highly specialized set. No other trays share matching screw sizes in this library. Contact Sterile processing or product representative.`}
                        </p>
                        {(prioritizedScrewType || prioritizedPlate) && (
                          <button
                            onClick={() => {
                              setPrioritizedScrewType("");
                              setPrioritizedPlate("");
                            }}
                            className="px-3 py-1.5 text-xs font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl cursor-pointer transition select-none"
                          >
                            Clear Priority Filter
                          </button>
                        )}
                      </div>
                    ) : visibleAlternatives.length === 0 ? (
                      <div className="text-center py-16 space-y-4">
                        <div className="w-16 h-16 rounded-full bg-amber-50 border border-amber-150 flex items-center justify-center text-amber-605 mx-auto select-none bg-amber-50">
                          <Building size={24} className="animate-pulse text-amber-600" />
                        </div>
                        <h4 className="font-bold text-slate-850 text-sm">No Matching On-Site Trays Found</h4>
                        <p className="text-xs text-slate-500 max-w-sm mx-auto font-semibold leading-relaxed">
                          We found compatible backups, but they are all specialized sets currently located in <strong>Off-Site / Rep Loaner Storage</strong>. Would you like to suggest these external alternatives?
                        </p>
                        <button
                          onClick={() => setShowOffSiteAlternatives(true)}
                          className="px-4 py-2 bg-slate-900 hover:bg-slate-950 text-white rounded-xl text-xs font-bold cursor-pointer transition flex items-center gap-2 mx-auto shadow-sm"
                        >
                          <span>🔍 Suggest {hiddenOffSiteCount} Off-Site Rep Alternative Sets</span>
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {(prioritizedScrewType || prioritizedPlate) && (
                          <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl p-3 px-4 text-xs font-semibold flex items-center justify-between select-none">
                            <div className="flex items-center gap-2">
                              <Star size={13} className="text-amber-500 fill-amber-500 animate-pulse shrink-0" />
                              <span>Search narrowed to backups matching: <strong className="font-bold text-slate-900 underline">{prioritizedScrewType || prioritizedPlate?.replace(/#\s*[\w.]+\s*$/, "").trim()}</strong></span>
                            </div>
                            <button
                              onClick={() => {
                                setPrioritizedScrewType("");
                                setPrioritizedPlate("");
                              }}
                              className="text-[10px] text-amber-800 hover:text-amber-950 font-bold bg-white border border-amber-200 px-2.5 py-1 rounded-lg cursor-pointer transition whitespace-nowrap shrink-0"
                            >
                              Show All Backups ({DECORATED_SETS.filter(s => s.id !== contaminatedSet.id).length})
                            </button>
                          </div>
                        )}
                        {pagedAlternatives.map((alt) => {
                          const isHighMatch = alt.matchPercentage >= 70;
                          const isMediumMatch = alt.matchPercentage >= 40 && alt.matchPercentage < 70;

                          let scoreColor = "bg-rose-50 border-rose-200 text-rose-800";
                          if (isHighMatch) scoreColor = "bg-emerald-50 border-emerald-200 text-emerald-800";
                          else if (isMediumMatch) scoreColor = "bg-amber-50 border-amber-200 text-amber-850";

                          return (
                            <div
                              key={alt.set.id}
                              className="border border-slate-205 rounded-2xl bg-slate-50/55 p-4.5 space-y-3 shadow-3xs border-slate-200"
                            >
                              {/* Alternative Header */}
                              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-250/60 pb-2.5">
                                <div className="space-y-1 max-w-[70%]">
                                  <h4 className="font-bold text-slate-850 text-xs sm:text-sm tracking-tight leading-snug">
                                    {alt.set.name}
                                  </h4>
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-[10px] text-slate-600 bg-white border border-slate-200 px-2 py-0.5 rounded font-mono font-bold flex items-center gap-1">
                                      <MapPin size={10} className="text-[#00A3E0]" />
                                      <span>Storage: {customLocations[alt.set.id] || alt.set.defaultLocation}</span>
                                    </span>
                                    <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded border select-none ${alt.logoColor}`}>
                                      🏢 {alt.company}
                                    </span>
                                    <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded border select-none ${
                                      alt.onSite 
                                        ? "bg-emerald-50 text-emerald-800 border-emerald-200" 
                                        : "bg-amber-50 text-amber-805 border-amber-205"
                                    }`}>
                                      {alt.onSite ? "🟢 On-Site" : "🚚 External Rep Loaner"}
                                    </span>
                                  </div>
                                </div>

                                <div className={`px-2.5 py-1 rounded-xl border font-bold text-center select-none flex-shrink-0 ${scoreColor}`}>
                                  <div className="text-[8px] uppercase tracking-wider font-extrabold font-sans">Similarity Match</div>
                                  <div className="text-xs sm:text-sm font-mono tracking-tight font-extrabold">{alt.matchPercentage}% match</div>
                                </div>
                              </div>

                              {/* Warnings & Custom generated recommendation */}
                              <div className="space-y-1.5 select-none">
                                {alt.metalWarning && (
                                  <p className="text-[10px] text-rose-600 bg-rose-50/50 border border-rose-150 p-2 rounded-xl font-bold flex items-center gap-1.5 leading-relaxed">
                                    <span>🚨</span>
                                    <span>{alt.metalWarning}</span>
                                  </p>
                                )}
                                <div className="bg-white border border-slate-200 p-2.5 rounded-xl text-[11px] text-slate-650 font-semibold leading-relaxed">
                                  <strong className="text-teal-850 font-extrabold uppercase tracking-widest text-[9px] block mb-0.5">Replacement Brainstorm Plan:</strong>
                                  {alt.recommendation}
                                </div>
                              </div>

                              {/* 📞 Representative Contact & Direct Courier Dispatch */}
                              <div className="bg-slate-100/75 border border-slate-200 rounded-xl p-3 space-y-2 select-none">
                                <div className="flex items-center justify-between gap-2 flex-wrap">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="text-[10px] md:text-[11px] font-bold text-slate-800">
                                      On-Call Territory Rep:
                                    </span>
                                    <span className="text-xs font-extrabold text-teal-850 bg-teal-50 border border-teal-150 px-2 py-0.5 rounded-md">
                                      {alt.rep.name}
                                    </span>
                                  </div>
                                  <button
                                    onClick={() => setExpandedRepSetId(expandedRepSetId === alt.set.id ? null : alt.set.id)}
                                    className="text-[10px] font-bold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 px-2.5 py-0.5 rounded-lg transition flex items-center gap-1 cursor-pointer"
                                  >
                                    <span>{expandedRepSetId === alt.set.id ? "Hide Details" : "Contact & Order Set Info"}</span>
                                    <ChevronDown size={12} className={`transform transition-transform ${expandedRepSetId === alt.set.id ? "rotate-180" : ""}`} />
                                  </button>
                                </div>

                                {expandedRepSetId === alt.set.id ? (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    className="space-y-2.5 pt-2 border-t border-slate-200/60"
                                  >
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-medium text-slate-705">
                                      <div className="space-y-1 bg-white p-2 rounded-lg border border-slate-150">
                                        <div className="text-[8px] uppercase tracking-wider text-slate-400 font-extrabold font-mono">Role & Division</div>
                                        <div className="font-bold text-slate-800 truncate">{alt.rep.role}</div>
                                        <div className="text-[10px] text-slate-500 font-semibold">{alt.company}</div>
                                      </div>
                                      <div className="space-y-1 bg-white p-2 rounded-lg border border-slate-150">
                                        <div className="text-[8px] uppercase tracking-wider text-slate-400 font-extrabold font-mono">Territory Coverage</div>
                                        <div className="font-bold text-slate-800 truncate">{alt.rep.territory}</div>
                                        <div className="text-[10px] text-slate-500 font-semibold">Immediate Emergency Delivery</div>
                                      </div>
                                    </div>

                                    {/* Direct Contact triggers */}
                                    <div className="flex items-center gap-2 flex-wrap text-xs font-semibold">
                                      <a
                                        href={`tel:${alt.rep.phone.replace(/[^\d+]/g, "")}`}
                                        className="flex-1 bg-white hover:bg-teal-50/20 border border-slate-205 text-teal-850 p-2 rounded-lg text-center font-mono font-bold transition flex items-center justify-center gap-1.5"
                                      >
                                        <Phone size={12} className="text-teal-600 animate-pulse" />
                                        <span>Call: {alt.rep.phone}</span>
                                      </a>
                                      {alt.rep.pager && (
                                        <div className="flex-1 bg-white border border-slate-205 text-slate-700 p-2 rounded-lg text-center font-mono font-bold flex items-center justify-center gap-1.5">
                                          <MessageSquare size={12} className="text-slate-500" />
                                          <span>Pager: {alt.rep.pager}</span>
                                        </div>
                                      )}
                                    </div>

                                    {/* Pre-formatted requisition email draft helper */}
                                    <div className="bg-white border border-slate-200 rounded-xl p-2.5 space-y-1">
                                      <label className="text-[9px] font-extrabold text-slate-450 uppercase tracking-widest block font-mono">
                                        Urgent Courier Dispatch Form Message:
                                      </label>
                                      <textarea
                                        readOnly
                                        rows={3}
                                        value={`URGENT DISPATCH - CONTAM/BACKUP EMERGENCY\nRequired Replacement Set: ${alt.set.name}\nPrioritized Implant Match: ${prioritizedScrewType || prioritizedPlate || "Universal specs"}\nPlease dispatch backup courier immediately to Operating Core.\nRoute to: ${DISPATCH_LABEL}`}
                                        className="w-full text-[10px] text-slate-600 bg-slate-50/40 p-2 border border-slate-150 rounded-lg font-mono focus:outline-none resize-none"
                                      />
                                      <div className="flex items-center gap-2 justify-between pt-1">
                                        <button
                                          onClick={() => {
                                            navigator.clipboard.writeText(
                                              `URGENT DISPATCH - CONTAM/BACKUP EMERGENCY\nRequired Replacement Set: ${alt.set.name}\nPrioritized Implant Match: ${prioritizedScrewType || prioritizedPlate || "Universal specs"}\nPlease dispatch backup courier immediately to Operating Core.\nRoute to: ${DISPATCH_LABEL}`
                                            );
                                            setShowCopySuccess(true);
                                            setTimeout(() => setShowCopySuccess(false), 2000);
                                          }}
                                          className="text-[10px] text-slate-655 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 p-1.5 rounded-lg font-bold cursor-pointer transition select-none flex items-center gap-1"
                                        >
                                          <Copy size={11} />
                                          <span>Copy text</span>
                                        </button>
                                        <button
                                          onClick={() => {
                                            // Simulate direct dispatch to beeper/mail
                                            setDispatchedRequests(prev => ({ ...prev, [alt.set.id]: true }));
                                          }}
                                          disabled={dispatchedRequests[alt.set.id]}
                                          className={`text-[10px] p-1.5 rounded-lg font-extrabold cursor-pointer transition select-none flex items-center gap-1 ${
                                            dispatchedRequests[alt.set.id]
                                              ? "bg-emerald-50 text-emerald-800 border border-emerald-250 cursor-default"
                                              : "bg-teal-900 text-white hover:bg-teal-950 shadow-3xs"
                                          }`}
                                        >
                                          {dispatchedRequests[alt.set.id] ? (
                                            <>
                                              <Check size={11} className="text-emerald-600 shrink-0 stroke-[3]" />
                                              <span>Requested ✓</span>
                                            </>
                                          ) : (
                                            <>
                                              <Zap size={10} className="text-amber-300 animate-bounce shrink-0" />
                                              <span>Dispatch courier ASAP</span>
                                            </>
                                          )}
                                        </button>
                                      </div>
                                    </div>

                                    {dispatchedRequests[alt.set.id] && (
                                      <div className="bg-emerald-500/10 border border-emerald-200 text-emerald-950 font-semibold p-2.5 rounded-xl text-[10px] leading-relaxed flex items-center gap-1.5 animate-pulse select-none">
                                        <span>🔔</span>
                                        <span>
                                          Trauma Dispatch Broadcast forwarded to <strong>{alt.rep.name}</strong>
                                          {alt.rep.email ? <> ({alt.rep.email})</> : null}. Courier delivery for <strong>{alt.set.name}</strong> is in progress!
                                        </span>
                                      </div>
                                    )}

                                  </motion.div>
                                ) : (
                                  <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium font-sans">
                                    <span>📞 Direct Call: <strong className="font-bold text-slate-750 font-mono">{alt.rep.phone}</strong></span>
                                    {alt.rep.email && (
                                      <span>✉️ Email: <strong className="font-bold text-slate-750 font-mono truncate max-w-[130px] sm:max-w-none">{alt.rep.email}</strong></span>
                                    )}
                                  </div>
                                )}
                              </div>

                              {/* Overlapping matching screws list */}
                              <div className="space-y-1.5">
                                <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider block">Overlapping Implant Sizing mapped ({alt.matches.length}):</span>
                                <div className="bg-white border border-slate-150 rounded-xl overflow-hidden divide-y divide-slate-100 shadow-3xs max-h-[190px] overflow-y-auto">
                                  {alt.matches.map((mt, midx) => {
                                    const exact = mt.matchType === "Exact size & function";
                                    const isThisPrioritized = mt.screwA.type === prioritizedScrewType;
                                    return (
                                      <div
                                        key={midx}
                                        className={`p-2 px-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px] transition ${
                                          isThisPrioritized
                                            ? "bg-amber-50/50 hover:bg-amber-55 border-l-4 border-l-amber-500"
                                            : "hover:bg-slate-50/50"
                                        }`}
                                      >
                                        <div className="space-y-0.5 font-medium">
                                          <div className="font-bold text-slate-800 flex items-center gap-1 flex-wrap">
                                            {isThisPrioritized && (
                                              <Star size={11} className="text-amber-500 fill-amber-500 shrink-0 animate-bounce" />
                                            )}
                                            <span>{mt.screwA.type}</span>
                                            <span className="text-slate-400 font-normal">➔</span>
                                            <span className="text-teal-850 font-extrabold font-mono text-[11px]">{mt.screwB.type}</span>
                                          </div>
                                          <p className="text-[10px] text-slate-450 font-semibold italic">{mt.description}</p>
                                        </div>
                                        <div className="flex items-center gap-1.5 shrink-0 flex-wrap sm:flex-nowrap">
                                          {isThisPrioritized && (
                                            <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200 uppercase font-sans shrink-0">
                                              Priority Mapped
                                            </span>
                                          )}
                                          <span className={`text-[9px] font-extrabold self-start sm:self-center px-1.5 py-0.5 rounded uppercase font-sans border ${
                                            exact ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-amber-50 border-amber-200 text-amber-850"
                                          }`}>
                                            {exact ? "Exact Match" : "Substitutable Size"}
                                          </span>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>

                              {/* Overlapping matching plates list - this section
                                  was missing entirely before: plateMatches was
                                  being computed correctly by the matching logic,
                                  but never rendered, so plate-only contamination
                                  results (DHS, Blade Plate, etc.) showed a card
                                  with no visible matched-items list at all. */}
                              {alt.plateMatches && alt.plateMatches.length > 0 && (
                                <div className="space-y-1.5 mt-3">
                                  <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider block">Overlapping Plate Matches ({alt.plateMatches.length}):</span>
                                  <div className="bg-white border border-slate-150 rounded-xl overflow-hidden divide-y divide-slate-100 shadow-3xs max-h-[190px] overflow-y-auto">
                                    {alt.plateMatches.map((mt, midx) => {
                                      const exact = mt.matchType === "Exact size & function";
                                      const isThisPrioritized = mt.plateA === prioritizedPlate;
                                      return (
                                        <div
                                          key={`plt-match-${midx}`}
                                          className={`p-2 px-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px] transition ${
                                            isThisPrioritized
                                              ? "bg-amber-50/50 hover:bg-amber-55 border-l-4 border-l-amber-500"
                                              : "hover:bg-slate-50/50"
                                          }`}
                                        >
                                          <div className="space-y-0.5 font-medium">
                                            <div className="font-bold text-slate-800 flex items-center gap-1 flex-wrap">
                                              {isThisPrioritized && (
                                                <Star size={11} className="text-amber-500 fill-amber-500 shrink-0 animate-bounce" />
                                              )}
                                              <span>{mt.plateA.replace(/#\s*[\w.]+\s*$/, "").trim()}</span>
                                              <span className="text-slate-400 font-normal">➔</span>
                                              <span className="text-indigo-850 font-extrabold font-mono text-[11px]">{mt.plateB.replace(/#\s*[\w.]+\s*$/, "").trim()}</span>
                                            </div>
                                            <p className="text-[10px] text-slate-450 font-semibold italic">{mt.description}</p>
                                          </div>
                                          <div className="flex items-center gap-1.5 shrink-0 flex-wrap sm:flex-nowrap">
                                            {isThisPrioritized && (
                                              <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200 uppercase font-sans shrink-0">
                                                Priority Mapped
                                              </span>
                                            )}
                                            <span className={`text-[9px] font-extrabold self-start sm:self-center px-1.5 py-0.5 rounded uppercase font-sans border ${
                                              exact ? "bg-indigo-50 border-indigo-200 text-indigo-800" : "bg-purple-50 border border-purple-200 text-purple-800"
                                            }`}>
                                              {exact ? "Exact Match" : "Compatible Spec"}
                                            </span>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}

                        {/* Infinite scroll: this element is invisible (no
                            visible height/content beyond the small status
                            text) but is watched by an IntersectionObserver -
                            scrolling it into view reveals the next batch of
                            already-loaded results. Once everything in the
                            current list is revealed, it just shows a plain
                            "showing all N" line instead of a loading cue,
                            since there's nothing further to fetch. */}
                        {pagedAlternatives.length < visibleAlternatives.length ? (
                          <div ref={scrollSentinelRef} className="text-center py-3 text-[11px] text-slate-400 font-semibold">
                            Showing {pagedAlternatives.length} of {visibleAlternatives.length} &middot; scroll for more
                          </div>
                        ) : visibleAlternatives.length > ALTERNATIVES_PAGE_SIZE ? (
                          <div className="text-center py-3 text-[11px] text-slate-400 font-semibold">
                            Showing all {visibleAlternatives.length} matching sets
                          </div>
                        ) : null}

                        {/* Suggest Off-Site panel/button */}
                        {hiddenOffSiteCount > 0 && !showOffSiteAlternatives && (
                          <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-5 text-center space-y-3 mt-6">
                            <div className="font-extrabold text-slate-800 text-xs sm:text-sm">
                              Need additional alternative options?
                            </div>
                            <p className="text-[11px] text-slate-505 font-semibold max-w-xs sm:max-w-md mx-auto leading-relaxed">
                              There are <strong>{hiddenOffSiteCount} additional compatible alternative sets</strong> available within the product libraries of on-call external manufacturers (Stryker, Acumed, Zimmer, Smith & Nephew) that can be dispatched by clinical couriers.
                            </p>
                            <button
                              onClick={() => setShowOffSiteAlternatives(true)}
                              className="px-4 py-1.5 bg-white hover:bg-slate-100 border border-slate-250 text-slate-800 rounded-xl text-xs font-bold cursor-pointer transition flex items-center gap-1.5 mx-auto shadow-3xs"
                            >
                              <span>🔍 Suggest {hiddenOffSiteCount} Off-Site / Rep Alternative Sets</span>
                            </button>
                          </div>
                        )}

                        {showOffSiteAlternatives && hiddenOffSiteCount > 0 && (
                          <div className="text-center pt-2">
                            <button
                              onClick={() => setShowOffSiteAlternatives(false)}
                              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-250 text-slate-650 rounded-xl text-xs font-bold cursor-pointer transition select-none inline-flex items-center gap-1"
                            >
                              <span>Collapse Off-Site Loaners (Show On-Site Only)</span>
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="px-6 py-4.5 border-t border-slate-150 bg-slate-50 flex items-center justify-between flex-shrink-0 select-none">
                    <span className="text-[10px] text-slate-400 font-semibold italic max-w-sm leading-normal">
                      * Clinicians must ensure matching drills and support accessories conform with the replacement template before surgery.
                    </span>
                    <button
                      onClick={() => setShowContaminationModal(false)}
                      className="px-5 py-2 bg-slate-900 hover:bg-slate-950 text-white text-xs font-bold rounded-xl cursor-pointer transition select-none uppercase tracking-wider hover:shadow-xs"
                    >
                      Done Protocol
                    </button>
                  </div>

                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 🔴 OUT OF STOCK AUTO-ALERT SYSTEM MODAL */}
      <AnimatePresence>
        {oosModalScrew && oosModalSet && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto">
            <motion.div
              initial={{ scale: 0.97, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.97, opacity: 0 }}
              className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg shadow-3xl overflow-hidden flex flex-col"
              id="oos-alert-modal-panel"
            >
              {/* Header */}
              <div className="px-5 py-4 border-b border-slate-150 flex items-center justify-between bg-rose-50 flex-shrink-0 select-none">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-rose-100 flex items-center justify-center text-rose-700 font-bold select-none text-xs">
                    ⚠️
                  </div>
                  <h2 className="font-extrabold text-rose-900 text-sm sm:text-base font-display">
                    Flag Implant Out of Stock
                  </h2>
                </div>
                <button
                  onClick={() => {
                    setOosModalScrew(null);
                    setOosModalSet(null);
                    setOosAlertSuccess(false);
                  }}
                  className="p-1 px-2.5 text-xs border border-rose-200 bg-white hover:bg-rose-50 rounded-lg text-rose-700 hover:text-rose-900 transition cursor-pointer font-bold"
                >
                  Cancel
                </button>
              </div>

              {/* Body */}
              <div className="p-5 sm:p-6 space-y-4 flex-1">
                {!oosAlertSuccess ? (
                  <>
                    <p className="text-xs text-slate-550 leading-relaxed font-semibold">
                      You are about to flag this clinical implant as <strong className="text-rose-700 font-extrabold">OUT OF STOCK</strong>. Please specify the specific length that is missing to trigger the alert notification to the main users.
                    </p>

                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2.5 text-xs text-slate-850">
                      <div className="grid grid-cols-12 gap-1 items-center">
                        <span className="col-span-4 text-[10px] font-bold text-slate-450 uppercase tracking-wider">Implant Spec</span>
                        <span className="col-span-8 font-extrabold text-slate-900">{oosModalScrew.type}</span>
                      </div>
                      <div className="grid grid-cols-12 gap-1 items-center">
                        <span className="col-span-4 text-[10px] font-bold text-slate-450 uppercase tracking-wider">Catalog Ref</span>
                        <span className="col-span-8 font-mono font-extrabold text-rose-800">{oosCatalogRef || "VERIFY WITH REP"}</span>
                      </div>
                      <div className="grid grid-cols-12 gap-1 items-center">
                        <span className="col-span-4 text-[10px] font-bold text-slate-450 uppercase tracking-wider">Surgical Tray</span>
                        <span className="col-span-8 font-bold text-slate-700">{oosModalSet.name}</span>
                      </div>
                      <div className="grid grid-cols-12 gap-1 items-center">
                        <span className="col-span-4 text-[10px] font-bold text-slate-450 uppercase tracking-wider">Primary Location</span>
                        <span className="col-span-8 font-bold text-slate-650">📍 {customLocations[oosModalSet.id] || oosModalSet.defaultLocation || "Cabinet Core C, Shelf 4"}</span>
                      </div>
                    </div>

                    {/* Specify length list of buttons / options */}
                    <div className="space-y-2">
                      <label className="block text-[10px] font-black text-slate-450 uppercase tracking-wider">
                        Specify Out of Stock Length *
                      </label>
                      <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1.5 border border-slate-200 rounded-2xl bg-white">
                        {getLengthOptions(oosModalScrew.lengthRange, oosModalScrew.interval).map((len) => (
                          <button
                            key={len}
                            type="button"
                            onClick={() => handleOosLengthChange(len)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                              oosSelectedLength === len
                                ? "bg-rose-600 border border-rose-600 text-white shadow-xs scale-102"
                                : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                            }`}
                          >
                            {len} mm
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-500 bg-rose-50/50 border border-rose-100/50 rounded-xl p-3 flex items-start gap-2 leading-relaxed">
                      <span className="text-rose-600 mt-0.5">🔔</span>
                      <div className="font-semibold text-slate-650">
                        <strong className="text-slate-800 font-bold block">Internal Inventory Alert:</strong> confirming will immediately record the missing implant and notify standard administrative users (<span className="font-semibold text-rose-900 font-mono">the secure hospital inventory address</span>).
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        onClick={() => {
                          setOosModalScrew(null);
                          setOosModalSet(null);
                        }}
                        className="px-4 py-2 border border-slate-200 hover:bg-slate-100 text-slate-650 text-xs font-bold rounded-xl transition cursor-pointer select-none"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={async () => {
                          if (!unlocked) { setShowAdminModal(true); return; }
                          const alertId = `OOS-${Math.floor(1000 + Math.random() * 9000)}`;
                          const newAlert: OutOfStockAlert = {
                            id: alertId,
                            timestamp: `${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`,
                            setId: oosModalSet.id,
                            setName: oosModalSet.name,
                            screwType: oosModalScrew.type,
                            length: oosSelectedLength,
                            catalogRef: oosCatalogRef || "VERIFY WITH REP",
                            location: customLocations[oosModalSet.id] || oosModalSet.defaultLocation || "Cabinet Core C, Shelf 4",
                            status: "Pending",
                          };
                          const updated = [newAlert, ...oosAlerts];
                          setOosAlerts(updated);
                          try {
                            localStorage.setItem("ortho_oos_alerts", JSON.stringify(updated));
                          } catch (e) {
                            console.error("Failed to save OOS alert locally", e);
                          }
                          try {
                            await setDoc(doc(db, "oos_alerts", newAlert.id), newAlert);
                          } catch (e) {
                            handleFirestoreError(e, OperationType.WRITE, `oos_alerts/${newAlert.id}`);
                          }
                          setOosAlertId(alertId);
                          setOosAlertSuccess(true);
                        }}
                        className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition cursor-pointer select-none flex items-center gap-1.5 shadow-sm uppercase tracking-wider font-display hover:shadow-md"
                      >
                        <span>Confirm Out of Stock</span>
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-6 space-y-4">
                    <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200 mx-auto text-2xl select-none animate-bounce font-extrabold">
                      ✓
                    </div>
                    
                    <div className="space-y-1.5">
                      <h3 className="font-black text-slate-800 text-base uppercase tracking-wider font-display">Alert Dispatched Successfully!</h3>
                      <p className="text-[11px] text-slate-505 font-semibold max-w-sm mx-auto leading-relaxed">
                        An inventory stock exception has been successfully registered in the system.
                      </p>
                    </div>

                    <div className="bg-slate-50 border border-slate-150 rounded-2xl p-4 inline-block text-left text-xs max-w-sm space-y-1.5 bg-gradient-to-br from-white to-slate-50 w-full font-semibold">
                      <div className="flex justify-between py-1 border-b border-slate-100">
                        <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider">Alert ID:</span>
                        <span className="font-mono font-bold text-slate-850 bg-slate-200/50 px-1.5 py-0.5 rounded">{oosAlertId}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-100">
                        <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider">Item Flagged:</span>
                        <span className="font-bold text-rose-700">{oosModalScrew.type} ({oosSelectedLength} mm) — #{oosCatalogRef || "VERIFY WITH REP"}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-100">
                        <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider">Target Users:</span>
                        <span className="font-bold text-slate-850 font-mono text-[11px]">the secure hospital inventory address</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider">Status:</span>
                        <span className="font-bold text-emerald-600 bg-emerald-50 border border-emerald-200/50 px-1.5 py-0.5 rounded uppercase text-[9px]">🟢 Alert Logged</span>
                      </div>
                    </div>

                    <div className="pt-2">
                      <button
                        onClick={() => {
                          setOosModalScrew(null);
                          setOosModalSet(null);
                          setOosAlertSuccess(false);
                        }}
                        className="px-6 py-2 bg-slate-900 hover:bg-slate-950 text-white text-xs font-bold rounded-xl transition cursor-pointer select-none uppercase tracking-wider inline-block"
                      >
                        Dismiss Alert
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 🛑 CLINICAL ERROR CORRECTION & FLAG AN ISSUE FORM */}
      <AnimatePresence>
        {showFlagIssueModal && (
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 z-50 overflow-y-auto">
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg shadow-3xl flex flex-col max-h-[92vh] overflow-hidden"
              id="critical-flag-issue-modal"
            >
              {/* Header */}
              <div className="px-5 py-4 border-b border-rose-150 flex items-center justify-between bg-rose-50/45 flex-shrink-0 select-none">
                <div className="flex items-center gap-2">
                  <div className="p-1 px-2 border border-rose-200 bg-rose-100/50 text-rose-800 rounded-lg">
                    <AlertTriangle size={15} className="animate-pulse" />
                  </div>
                  <div>
                    <h2 className="font-bold text-rose-955 text-sm sm:text-base font-display flex items-center gap-1.5 uppercase tracking-wide">
                      Clinical Quality Assurance Form
                    </h2>
                    <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                      Report Tray discrepancies, incorrect sizing, or database errors
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowFlagIssueModal(false)}
                  className="p-1 px-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Form Scroll Area */}
              <div className="p-5 overflow-y-auto space-y-4 animate-fadeIn">
                {!flaggedSuccessMessage ? (
                  <form onSubmit={handleFlagIssueSubmit} className="space-y-4">
                    <div className="bg-gradient-to-r from-teal-50/60 to-blue-50/60 border-l-4 border-l-[#008CBF] border-slate-200/80 text-slate-705 p-3 px-4 rounded-r-xl rounded-l-none flex gap-3 w-full text-xs font-medium leading-relaxed shadow-3xs">
                      <span className="text-teal-600 font-bold select-none text-base">🛡️</span>
                      <p className="text-slate-650 leading-relaxed font-semibold">
                        This report will be securely archived. Only administrators with authorization keys can view and resolve clinical reports in the Archive database.
                        <span className="block mt-1.5 text-rose-700 font-bold">Structured selections only — no patient information possible. All fields required.</span>
                      </p>
                    </div>

                    {/* Field 1: Target Set */}
                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider select-none">
                        1. Affected Instrument Set
                      </label>
                      <select
                        value={flaggedSetId}
                        onChange={(e) => setFlaggedSetId(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-205 rounded-xl px-3 py-2 text-xs text-slate-850 font-bold focus:outline-none focus:ring-2 focus:ring-rose-500/10 focus:border-rose-500 transition-all cursor-pointer"
                        required
                      >
                        <option value="">— Select set —</option>
                        <option value="all">General / Other System Error</option>
                        {DECORATED_SETS.map((set) => (
                          <option key={set.id} value={set.id}>
                            {set.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Field 2: What's affected (cascading) */}
                    {flaggedSetId && (
                      <div className="space-y-1.5">
                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider select-none">
                          2. What's affected
                        </label>
                        <select
                          value={flaggedAffected}
                          onChange={(e) => { setFlaggedAffected(e.target.value); setFlaggedAffectedRef(""); }}
                          className="w-full bg-slate-50 border border-slate-205 rounded-xl px-3 py-2 text-xs text-slate-850 font-bold focus:outline-none focus:ring-2 focus:ring-rose-500/10 focus:border-rose-500 transition-all cursor-pointer"
                          required
                        >
                          <option value="">— Select category —</option>
                          {Object.entries(AFFECTED_LABELS).map(([key, label]) => (
                            <option key={key} value={key}>
                              {label}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Field 3: Which implant/plate (if applicable) */}
                    {flaggedAffected && (flaggedAffected === "implant" || flaggedAffected === "plate") && (
                      <div className="space-y-1.5">
                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider select-none">
                          3. Which {flaggedAffected}
                        </label>
                        <select
                          value={flaggedAffectedRef}
                          onChange={(e) => setFlaggedAffectedRef(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-205 rounded-xl px-3 py-2 text-xs text-slate-850 font-bold focus:outline-none focus:ring-2 focus:ring-rose-500/10 focus:border-rose-500 transition-all cursor-pointer"
                          required
                        >
                          <option value="">— Select {flaggedAffected} —</option>
                          {flaggedSetId !== "all" &&
                            DECORATED_SETS.find(s => s.id === flaggedSetId)?.[
                              flaggedAffected === "implant" ? "screwFamilies" : "plateFamilies"
                            ]?.flatMap(fam =>
                              fam.sizes.map(sz => (
                                <option key={sz.ref} value={sz.ref || ""}>
                                  {sz.ref} {flaggedAffected === "implant" ? `(${fam.displayName} ${sz.length}mm)` : `(${fam.displayName}${sz.holes ? " " + sz.holes + "H" : ""})`}
                                </option>
                              ))
                            )}
                        </select>
                      </div>
                    )}

                    {/* Field 4: Issue type */}
                    {flaggedAffected && (
                      <div className="space-y-1.5">
                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider select-none">
                          {flaggedAffected && (flaggedAffected === "implant" || flaggedAffected === "plate") ? "4" : "3"}. Issue / Problem
                        </label>
                        <select
                          value={flaggedIssueType}
                          onChange={(e) => setFlaggedIssueType(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-205 rounded-xl px-3 py-2 text-xs text-slate-850 font-bold focus:outline-none focus:ring-2 focus:ring-rose-500/10 focus:border-rose-500 transition-all cursor-pointer"
                          required
                        >
                          <option value="">— Select issue type —</option>
                          {Object.entries(ISSUE_TYPE_LABELS).map(([key, label]) => (
                            <option key={key} value={key}>
                              {label}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Field 5: Reporter role */}
                    {flaggedIssueType && (
                      <div className="space-y-1.5">
                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider select-none">
                          {flaggedAffected && (flaggedAffected === "implant" || flaggedAffected === "plate") ? "5" : "4"}. Your role
                        </label>
                        <select
                          value={flaggedReporterRole}
                          onChange={(e) => setFlaggedReporterRole(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-205 rounded-xl px-3 py-2 text-xs text-slate-850 font-bold focus:outline-none focus:ring-2 focus:ring-rose-500/10 focus:border-rose-500 transition-all cursor-pointer"
                          required
                        >
                          <option value="">— Select your role —</option>
                          {REPORTER_ROLES.map(role => (
                            <option key={role} value={role}>
                              {role}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Field 6: Severity */}
                    {flaggedReporterRole && (
                      <div className="space-y-1.5">
                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider select-none">
                          {flaggedAffected && (flaggedAffected === "implant" || flaggedAffected === "plate") ? "6" : "5"}. Clinical Severity
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          {(["Low", "Medium", "High"] as const).map((sev) => {
                            const isSelected = flaggedSeverity === sev;
                            const activeClass =
                              sev === "Low"
                                ? "bg-sky-50 border-sky-300 text-sky-800 font-extrabold"
                                : sev === "Medium"
                                  ? "bg-amber-50 border-amber-300 text-amber-800 font-extrabold"
                                  : "bg-rose-50 border-rose-300 text-rose-800 font-extrabold";
                            const inactiveClass = "bg-slate-50 border-slate-200 text-slate-505 hover:bg-slate-100/70";

                            return (
                              <button
                                key={sev}
                                type="button"
                                onClick={() => setFlaggedSeverity(sev)}
                                className={`py-2 px-1.5 border rounded-xl text-[11px] font-bold cursor-pointer select-none text-center transition-all shadow-3xs ${
                                  isSelected ? activeClass : inactiveClass
                                }`}
                              >
                                {sev === "Low" && "🟢 Low"}
                                {sev === "Medium" && "🟡 Medium"}
                                {sev === "High" && "🔴 High"}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Error message */}
                    {phiBlockMessage && (
                      <div className="rounded-xl border border-amber-300 bg-amber-50 px-3 py-2.5 flex items-start gap-2">
                        <AlertTriangle size={15} className="text-amber-600 flex-shrink-0 mt-0.5" />
                        <p className="text-[11px] font-semibold text-amber-900 leading-relaxed">
                          {phiBlockMessage}
                        </p>
                      </div>
                    )}

                    {/* Success message */}
                    {flaggedSuccessMessage && (
                      <div className="rounded-xl border border-teal-300 bg-teal-50 p-3 flex items-start gap-2">
                        <CheckCircle size={16} className="text-teal-600 flex-shrink-0 mt-0.5" />
                        <p className="text-[11px] font-bold text-teal-800">
                          Issue reported and archived securely. Thank you.
                        </p>
                      </div>
                    )}

                    {/* Buttons */}
                    <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 flex-shrink-0 select-none">
                      <button
                        type="button"
                        onClick={() => setShowFlagIssueModal(false)}
                        className="px-4 py-2 bg-white hover:bg-slate-105 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={!flaggedSetId || !flaggedAffected || !flaggedIssueType || !flaggedReporterRole}
                        className="px-4 py-2 bg-rose-500 hover:bg-rose-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-3xs uppercase tracking-wide flex items-center gap-1.5"
                      >
                        <Flag size={13} className="text-rose-100 stroke-[2.5]" />
                        <span>Report Issue</span>
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="rounded-xl border border-teal-300 bg-teal-50 p-4 flex items-start gap-3">
                    <CheckCircle size={18} className="text-teal-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[12px] font-bold text-teal-900">Issue reported successfully</p>
                      <p className="text-[11px] text-teal-700 mt-1">Your flag has been securely archived. The coordination team will review and follow up.</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Simulation Window for Off-Site Alternatives Verification */}
      <AnimatePresence>
        {showOffsiteSimWindow && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl h-[85vh] flex flex-col overflow-hidden text-left"
              id="offsite-verification-popup-window"
            >
              {/* Desktop OS Style Window Title Bar */}
              <div className="bg-slate-100 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between select-none">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button 
                      onClick={() => setShowOffsiteSimWindow(false)}
                      className="h-3 w-3 rounded-full bg-rose-500 hover:bg-rose-600 transition cursor-pointer"
                      title="Close"
                    />
                    <div className="h-3 w-3 rounded-full bg-amber-400" />
                    <div className="h-3 w-3 rounded-full bg-emerald-500" />
                  </div>
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest pl-2">
                    Reference-Subsystem-Portal.dll
                  </span>
                </div>
                <div className="bg-slate-200 border border-slate-300 rounded-md px-3 py-0.5 text-[9.5px] font-mono text-slate-650 flex items-center gap-1">
                  <span className="text-emerald-700 font-bold">🔒 Secure Reference</span> | <span>https://pediatric.ortho.network/verified-repos</span>
                </div>
                <button
                  onClick={() => setShowOffsiteSimWindow(false)}
                  className="text-slate-400 hover:text-slate-600 transition cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Simulated Window Content */}
              <div className="flex-1 overflow-auto bg-slate-50 p-6 flex flex-col space-y-6">
                <div className="flex items-start justify-between border-b border-slate-200 pb-4">
                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-teal-100 border border-teal-200 text-teal-850 rounded-lg text-[9px] uppercase tracking-wider font-extrabold font-mono">
                      <span>🏥 Off-Site Verified Directories</span>
                    </div>
                    <h2 className="text-xl font-bold font-display text-slate-900">
                      Pediatric Implant Off-Site Registry Sheet
                    </h2>
                    <p className="text-xs text-slate-550 font-semibold font-sans">
                      Auxiliary warehouse assets & collaborative regional pediatric inventories
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-mono font-bold block text-slate-400 uppercase">System Sync</span>
                    <span className="text-xs font-mono font-extrabold text-emerald-600">● LIVE CONNECTION ACTIVE</span>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-rose-50/50 via-amber-50/40 to-orange-50/50 border-l-4 border-l-amber-500 border-slate-200/80 p-4 rounded-r-xl rounded-l-none text-xs space-y-2 select-none text-left shadow-3xs">
                  <h4 className="font-extrabold text-amber-905 uppercase tracking-wide flex items-center gap-1.5 pl-0.5 font-display">
                    <span>⚠️ EMERGENCY DISPATCH PROTOCOL</span>
                  </h4>
                  <p className="text-slate-705 leading-relaxed font-semibold">
                    Off-site reserve implants listed below reside in our partner pediatric networks and central trauma vaults. If required, click the rep pager link to trigger immediate priority courier transfer to Operating Core. Under regional Pediatric protocols, backup couriers operate with code-grey clearance.
                  </p>
                </div>

                {/* Grid Listing */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white border border-slate-200 rounded-2xl p-4.5 space-y-4 shadow-3xs hover:shadow-2xs transition">
                    <div className="flex items-start justify-between border-b border-slate-100 pb-2.5">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Acumed Repo</span>
                        <h3 className="font-extrabold font-display text-slate-900 mt-0.5">ACUMED FOOT MODULAR</h3>
                      </div>
                      <span className="px-2 py-0.5 bg-slate-100 rounded-md text-[9.5px] font-mono font-bold text-slate-500 select-none">
                        12.5 km (Vault B)
                      </span>
                    </div>

                    <div className="space-y-2.5 text-xs text-slate-600 select-none">
                      <div className="flex justify-between">
                        <span>Compatible Screws:</span>
                        <span className="font-mono font-bold text-slate-800 text-right">2.7mm, 3.2mm, 3.5mm LCP</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Lead Courier Logistics:</span>
                        <span className="font-semibold text-slate-800 text-right">Emergency ETA: 25 mins</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Primary Dispatch Representative:</span>
                        <span className="font-semibold text-teal-800 text-right">Elena Rostova</span>
                      </div>
                    </div>

                    <div className="pt-1.5 flex gap-2">
                      <a
                        href="tel:5145550123"
                        className="flex-1 py-1.5 bg-slate-900 hover:bg-slate-950 text-white font-bold rounded-xl text-center text-[11px] transition shadow-3xs"
                      >
                        Call Specialist
                      </a>
                      <button
                        onClick={() => alert("Urgent dispatch request transmitted to Acumed regional support.")}
                        className="flex-1 py-1.5 bg-teal-800 hover:bg-teal-900 text-white font-bold rounded-xl text-center text-[11px] transition shadow-3xs cursor-pointer"
                      >
                        Dispatch Courier
                      </button>
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-2xl p-4.5 space-y-4 shadow-3xs hover:shadow-2xs transition">
                    <div className="flex items-start justify-between border-b border-slate-100 pb-2.5">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-450 tracking-wider">Zimmer Biomet Repo</span>
                        <h3 className="font-extrabold font-display text-slate-900 mt-0.5">PEDIATRIC HIP SYSTEM</h3>
                      </div>
                      <span className="px-2 py-0.5 bg-emerald-50 border border-emerald-250 rounded-md text-[9.5px] font-mono font-bold text-emerald-700 select-none">
                        8.1 km (Local Vault)
                      </span>
                    </div>

                    <div className="space-y-2.5 text-xs text-slate-650 select-none">
                      <div className="flex justify-between">
                        <span>Compatible Screws:</span>
                        <span className="font-mono font-bold text-slate-800 text-right">3.5mm, 4.0mm Cannulated</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Lead Courier Logistics:</span>
                        <span className="font-semibold text-slate-800 text-right">Emergency ETA: 15 mins</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Primary Dispatch Representative:</span>
                        <span className="font-semibold text-teal-800 text-right">Pierre-Luc Gagné</span>
                      </div>
                    </div>

                    <div className="pt-1.5 flex gap-2">
                      <a
                        href="tel:5145550155"
                        className="flex-1 py-1.5 bg-slate-900 hover:bg-slate-950 text-white font-bold rounded-xl text-center text-[11px] transition shadow-3xs"
                      >
                        Call Specialist
                      </a>
                      <button
                        onClick={() => alert("Urgent dispatch request transmitted to Zimmer Biomet central vault.")}
                        className="flex-1 py-1.5 bg-teal-800 hover:bg-teal-900 text-white font-bold rounded-xl text-center text-[11px] transition shadow-3xs cursor-pointer"
                      >
                        Dispatch Courier
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-100 border border-slate-200 p-4 rounded-xl text-center text-xs select-none">
                  <p className="text-slate-500 font-semibold font-sans">
                    Additional emergency items can be searched in the active catalog index or by consulting your department supervisor.
                  </p>
                </div>
              </div>

              {/* Title bar footer */}
              <div className="bg-slate-100 px-6 py-3 border-t border-slate-200 flex justify-end gap-2 shrink-0 select-none">
                <button
                  onClick={() => setShowOffsiteSimWindow(false)}
                  className="px-5 py-2 bg-slate-905 hover:bg-slate-950 text-white text-xs font-bold rounded-xl transition cursor-pointer select-none uppercase tracking-wider font-display shadow-2xs"
                >
                  Close Reference Session
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 🛡️ CLINICAL VERIFICATION MODAL OVERLAY */}
      <AnimatePresence>
        {showVerificationModal && verificationModalTarget && (
          <div className="fixed inset-0 bg-slate-900/85 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 z-[100] overflow-y-auto">
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg shadow-3xl flex flex-col max-h-[92vh] overflow-hidden text-left"
              id="clinical-verification-modal"
            >
              {/* Header */}
              <div className="px-5 py-4 border-b border-teal-150 flex items-center justify-between bg-teal-50/45 flex-shrink-0 select-none">
                <div className="flex items-center gap-2">
                  <div className="p-1 px-2 border border-teal-250 bg-teal-100 text-teal-850 rounded-lg">
                    <Shield size={16} className="animate-pulse" />
                  </div>
                  <div>
                    <h2 className="font-bold text-teal-955 text-sm sm:text-base font-display flex items-center gap-1.5 uppercase tracking-wide">
                      Clinical Accuracy Verification
                    </h2>
                    <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                      Verify specifications against physical trays or catalogs
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowVerificationModal(false);
                    setVerificationModalTarget(null);
                  }}
                  className="p-1 px-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Form Content */}
              <form onSubmit={handleConfirmVerificationSubmit} className="flex flex-col flex-1 overflow-hidden">
                <div className="p-5 overflow-y-auto space-y-4 animate-fadeIn">
                  {/* Scope info card */}
                  <div className="bg-slate-50 border border-slate-150 rounded-2xl p-3.5 space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Scope & Item Target</span>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-slate-800">{verificationModalTarget.itemName}</span>
                      <span className="bg-teal-50 text-teal-800 text-[9px] font-bold border border-teal-205 uppercase px-2 py-0.5 rounded-md">
                        {verificationModalTarget.itemType === "set" ? "Entire Set" : `${verificationModalTarget.itemType} model`}
                      </span>
                    </div>
                  </div>

                  {/* Warning if unverified */}
                  {verificationStatusVal === "unverified" && (
                    <div className="bg-amber-50 border-l-4 border-l-amber-500 border-slate-250 text-amber-900 p-3 rounded-r-xl text-xs space-y-1">
                      <h4 className="font-bold uppercase tracking-tight text-amber-950">⚠️ Clinical Alert</h4>
                      <p className="leading-relaxed font-semibold">
                        This item has <strong>never been independently verified</strong>. Speak with clinical supervisors or compare against physical trays before relying on this layout during an active surgical case.
                      </p>
                    </div>
                  )}

                  {/* Radios for verification types */}
                  <div className="space-y-2">
                    <label className="block text-xs uppercase font-extrabold text-slate-505 tracking-wider">
                      Verification Status State
                    </label>
                    <div className="grid grid-cols-1 gap-2">
                      <label className={`border rounded-2xl p-3.5 flex items-start gap-3 cursor-pointer transition select-none ${verificationStatusVal === "tray-verified" ? "bg-emerald-50/50 border-emerald-400 ring-1 ring-emerald-400" : "bg-white border-slate-200 hover:border-slate-350"}`}>
                        <input
                          type="radio"
                          name="verification_status"
                          value="tray-verified"
                          checked={verificationStatusVal === "tray-verified"}
                          onChange={() => setVerificationStatusVal("tray-verified")}
                          className="mt-1 accent-emerald-600"
                        />
                        <div className="space-y-0.5">
                          <span className="text-xs font-bold text-slate-800 block uppercase">Tray-Verified (Checked Physical Set)</span>
                          <span className="text-[11px] text-slate-500 leading-relaxed block font-semibold">Verified by comparing each compartment against the actual sterile trauma tray in central supply.</span>
                        </div>
                      </label>

                      <label className={`border rounded-2xl p-3.5 flex items-start gap-3 cursor-pointer transition select-none ${verificationStatusVal === "source-verified" ? "bg-amber-50/50 border-amber-400 ring-1 ring-amber-400" : "bg-white border-slate-200 hover:border-slate-350"}`}>
                        <input
                          type="radio"
                          name="verification_status"
                          value="source-verified"
                          checked={verificationStatusVal === "source-verified"}
                          onChange={() => setVerificationStatusVal("source-verified")}
                          className="mt-1 accent-amber-600"
                        />
                        <div className="space-y-0.5">
                          <span className="text-xs font-bold text-slate-800 block uppercase">Source-Verified (Matches Catalog Document)</span>
                          <span className="text-[11px] text-slate-500 leading-relaxed block font-semibold">Verified against the manufacturer's official technique guide or surgical system handbook.</span>
                        </div>
                      </label>

                      <label className={`border rounded-2xl p-3.5 flex items-start gap-3 cursor-pointer transition select-none ${verificationStatusVal === "unverified" ? "bg-slate-50 border-slate-350 ring-1 ring-slate-300" : "bg-white border-slate-200 hover:border-slate-300"}`}>
                        <input
                          type="radio"
                          name="verification_status"
                          value="unverified"
                          checked={verificationStatusVal === "unverified"}
                          onChange={() => setVerificationStatusVal("unverified")}
                          className="mt-1 accent-slate-600"
                        />
                        <div className="space-y-0.5">
                          <span className="text-xs font-bold text-slate-800 block uppercase">Unverified (Original System Export)</span>
                          <span className="text-[11px] text-slate-505 leading-relaxed block font-semibold">Revert to the original database baseline. Tagged as unverified for all clinical lookups.</span>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Investigator Credentials */}
                  <div className="space-y-1.5 pt-1">
                    <label className="block text-xs uppercase font-extrabold text-slate-505 tracking-wider">
                      Clinician Name / ID Code <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={verifierName}
                      onChange={(e) => setVerifierName(e.target.value)}
                      onPaste={guardPaste}
                      placeholder="e.g. Dr. Jennifer Collins, MD"
                      className="w-full bg-white border border-slate-205 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:ring-1 focus:ring-teal-700 focus:outline-hidden"
                    />
                    <p className="text-[10px] text-slate-405 font-semibold">
                      Verifying commits your credentials and locks today's date ({new Date().toISOString().split("T")[0]}) to the inventory log.
                    </p>
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex justify-end gap-2 shrink-0 select-none">
                  <button
                    type="button"
                    onClick={() => {
                      setShowVerificationModal(false);
                      setVerificationModalTarget(null);
                    }}
                    className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-3xs uppercase tracking-wide"
                  >
                    Confirm & Store Verification
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 📝 MANUAL ITEM ENTRY MODAL OVERLAY */}
      <AnimatePresence>
        {showManualEntryModal && (
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 z-[100] overflow-y-auto">
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg shadow-3xl flex flex-col max-h-[92vh] overflow-hidden text-left"
              id="manual-entry-submission-modal"
            >
              {/* Header */}
              <div className="px-5 py-4 border-b border-amber-150 flex items-center justify-between bg-amber-50/45 flex-shrink-0 select-none">
                <div className="flex items-center gap-2">
                  <div className="p-1 px-2 border border-amber-250 bg-amber-100 text-amber-855 rounded-lg">
                    <ClipboardList size={16} className="text-amber-805" />
                  </div>
                  <div>
                    <h2 className="font-bold text-amber-955 text-sm sm:text-base font-display flex items-center gap-1.5 uppercase tracking-wide animate-fadeIn">
                      Add Custom Implant Requisition
                    </h2>
                    <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                      For clinical items not residing in the tray databases
                    </p>
                    <p className="text-[10px] text-rose-700 font-bold normal-case tracking-normal mt-0.5">
                      Product details only — no patient information.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowManualEntryModal(false)}
                  className="p-1 px-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Form Content */}
              <form onSubmit={handleConfirmAddManualItem} className="flex flex-col flex-1 overflow-hidden">
                <div className="p-5 overflow-y-auto space-y-4">
                  
                  {/* Warning notice */}
                  <div className="bg-slate-50 border border-slate-200 p-3 rounded-2xl text-[11px] flex gap-2 items-start text-slate-600 font-semibold leading-relaxed">
                    <span className="text-amber-550 shrink-0 text-xs">⚠️</span>
                    <p>
                      Structured entry only — select a set, implant type, and catalog reference number. The reference field accepts only digits, periods, and an optional trailing letter (no patient information can be entered here).
                    </p>
                  </div>

                  {/* Field 1: Set */}
                  <div className="space-y-1.5">
                    <label className="block text-xs uppercase font-extrabold text-slate-505 tracking-wider">
                      1. Set <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={manualSetId}
                      onChange={(e) => { setManualSetId(e.target.value); setManualImplantType(""); setManualCatalogRef(""); }}
                      required
                      className="w-full bg-white border border-slate-250 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-amber-500/15 focus:border-amber-500 focus:outline-none cursor-pointer"
                    >
                      <option value="">— Select set —</option>
                      {DECORATED_SETS.map((set) => (
                        <option key={set.id} value={set.id}>
                          {set.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Field 2: Implant type */}
                  {manualSetId && (
                    <div className="space-y-1.5">
                      <label className="block text-xs uppercase font-extrabold text-slate-505 tracking-wider">
                        2. Implant Type <span className="text-rose-500">*</span>
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {(["screw", "plate"] as const).map((t) => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => { setManualImplantType(t); setManualCatalogRef(""); }}
                            className={`py-2 px-2 border rounded-xl text-xs font-bold cursor-pointer select-none text-center transition-all capitalize ${
                              manualImplantType === t
                                ? "bg-amber-50 border-amber-300 text-amber-800"
                                : "bg-white border-slate-250 text-slate-600 hover:bg-slate-50"
                            }`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Field 3: Catalog reference number - numeric-only entry */}
                  {manualImplantType && (
                    <div className="space-y-1.5">
                      <label className="block text-xs uppercase font-extrabold text-slate-505 tracking-wider">
                        3. Catalog Reference Number <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        inputMode="decimal"
                        value={manualCatalogRef}
                        onChange={(e) => {
                          // Hard character constraint: digits, periods,
                          // dashes, and up to two trailing letters only.
                          // Anything else is stripped immediately - there is
                          // no way to type a name, label, or date into this
                          // field.
                          const filtered = e.target.value.replace(/[^0-9.\-a-zA-Z*]/g, "");
                          setManualCatalogRef(filtered);
                          if (phiBlockMessage) setPhiBlockMessage("");
                        }}
                        placeholder="e.g. 204.840 or 02.535.195S"
                        className="w-full bg-white border border-slate-250 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-amber-500/15 focus:border-amber-500 focus:outline-none"
                      />
                      <p className="text-[10px] text-slate-450 font-semibold">
                        Digits, periods, and an optional trailing letter only.
                      </p>
                    </div>
                  )}

                  {/* Field 4: Quantity */}
                  {manualCatalogRef && (
                    <div className="space-y-1.5">
                      <label className="block text-xs uppercase font-extrabold text-slate-505 tracking-wider">
                        4. Quantity <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={manualQty}
                        onChange={(e) => setManualQty(parseInt(e.target.value, 10) || 1)}
                        className="w-full bg-white border border-slate-250 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-amber-500/15 focus:border-amber-500 focus:outline-none"
                      />
                    </div>
                  )}

                </div>

                {/* Footer Controls */}
                <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex flex-col gap-2 shrink-0 select-none">
                  {phiBlockMessage && (
                    <div className="rounded-xl border border-amber-300 bg-amber-50 px-3 py-2.5 flex items-start gap-2">
                      <AlertTriangle size={15} className="text-amber-600 flex-shrink-0 mt-0.5" />
                      <p className="text-[11px] font-semibold text-amber-900 leading-relaxed">
                        {phiBlockMessage}
                      </p>
                    </div>
                  )}
                  <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowManualEntryModal(false)}
                    className="px-4 py-2 bg-white hover:bg-slate-105 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-3xs uppercase tracking-wide flex items-center gap-1.5"
                  >
                    <Plus size={13} className="text-amber-100 stroke-[3]" />
                    <span>Compile Custom Item</span>
                  </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
