// ============================================================================
// PHI GUARD — prevents protected health information (PHI) from being entered,
// stored, or transmitted by the app.
//
// This is a clinical inventory tool. It has NO legitimate reason to ever hold
// patient-identifying data, so the safest posture is to actively block it at
// the point of entry rather than rely on users to refrain. Under PHIPA
// (Quebec/Canada) and HIPAA-equivalent regimes, even accidental capture of an
// MRN, name, or DOB in a free-text "notes" field that then syncs to the cloud
// is a reportable problem. Everything below is defense-in-depth: each layer
// is independently useful, and none of it replaces staff training - it just
// makes the accidental case hard.
//
// Design stance: detect with HIGH RECALL on the patterns that are unambiguous
// (MRN/health-card numbers, DOB, SSN/SIN, phone, email), warn-and-confirm on
// the fuzzier ones (possible names), and never silently store raw input that
// tripped a hard pattern. False positives are acceptable here - a nurse being
// asked "are you sure this has no patient info?" costs seconds; a real MRN in
// the cloud costs a breach notification.
// ============================================================================

export type PhiSeverity = "block" | "warn";

export interface PhiFinding {
  kind: string; // human label, e.g. "Possible medical record number"
  severity: PhiSeverity;
  // the matched substring, for highlighting - never logged anywhere
  match: string;
  index: number;
}

interface PhiRule {
  kind: string;
  severity: PhiSeverity;
  pattern: RegExp;
  // optional extra test to cut obvious false positives (e.g. a catalog ref
  // number looks like digits too - don't flag those)
  reject?: (match: string, fullText: string) => boolean;
}

// Catalog reference numbers are the app's whole vocabulary and look numeric
// (e.g. "02.118.510", "204.840", "P0026904"). We must not flag those as PHI.
// This recognizes the shapes this database actually uses.
const looksLikeCatalogRef = (s: string): boolean => {
  const t = s.trim();
  return (
    /^\d{2,3}\.\d{2,3}(\.\d{1,3})?[A-Za-z*]*$/.test(t) || // 204.840, 02.118.510
    /^0[24]\.\d{3}\.\d{3}$/.test(t) || // 02.205.025
    /^P\d{6,7}$/i.test(t) || // P0026904 set numbers
    /^I\d{6,7}$/i.test(t) // I0068241 item numbers
  );
};

const RULES: PhiRule[] = [
  {
    // Quebec health insurance number (RAMQ): 4 letters + 8 digits, e.g.
    // TREM 8005 1234. Also catches the common no-space form.
    kind: "Possible health-card / RAMQ number",
    severity: "block",
    pattern: /\b[A-Za-z]{4}\s?\d{4}\s?\d{4}\b/g,
  },
  {
    // Canadian SIN / US SSN style: 9 digits, often grouped 3-3-3 or 3-2-4.
    kind: "Possible SIN / SSN",
    severity: "block",
    pattern: /\b\d{3}[-\s]?\d{2,3}[-\s]?\d{3,4}\b/g,
    reject: (m) => looksLikeCatalogRef(m),
  },
  {
    // A bare medical record number is hard to define, but a long run of
    // digits (7+) that ISN'T a catalog ref is suspicious in this context.
    kind: "Possible medical record number (long digit sequence)",
    severity: "block",
    pattern: /\b\d{7,}\b/g,
    reject: (m) => looksLikeCatalogRef(m),
  },
  {
    // Explicit MRN/dossier/patient labels followed by an actual
    // identifier-shaped value - not just any following word. Two real
    // bugs fixed here from simulation testing:
    //  1. "MRN4485912" (no space/separator between label and digits) used
    //     to slip through, because \b doesn't match between a letter and a
    //     digit - both count as "word" characters in regex terms, so there
    //     is no boundary there. Replaced \b\s* with an explicit optional
    //     separator that matches whether or not there's a space.
    //  2. "patient" alone followed by an ordinary word (e.g. "the patient
    //     line") used to false-positive, because the suffix after the
    //     label was unconstrained (\S+ matches anything). The captured
    //     value now must look like an identifier (digits, or letters+digits
    //     mixed, at least 4 characters) rather than any token.
    kind: "Explicit patient identifier label",
    severity: "block",
    pattern: /\b(mrn|dossier|patient(?:\s*(?:id|#|no|number))?|chart\s*#?|ramq|health\s*card)[:#\s]{0,3}([A-Za-z0-9]{4,})/gi,
    reject: (m, full) => {
      // The match includes the label AND the captured value; re-extract the
      // value to check it actually looks identifier-shaped (has a digit,
      // not just an ordinary English word like "line" or "room").
      const valueMatch = m.match(/([A-Za-z0-9]{4,})\s*$/);
      const value = valueMatch ? valueMatch[1] : "";
      const looksLikeRealWord = /^[A-Za-z]+$/.test(value) && value.length <= 8;
      return looksLikeRealWord && !/\d/.test(value);
    },
  },
  {
    // Dates of birth: DOB label, or a date in common formats.
    kind: "Possible date of birth",
    severity: "block",
    pattern: /\b(dob|d\.o\.b|date\s*of\s*birth|born|né[e]?\s*le)\b\s*[:#]?\s*\S+/gi,
  },
  {
    kind: "Possible date (verify it is not a DOB)",
    severity: "warn",
    pattern: /\b(19|20)\d{2}[-/.](0?[1-9]|1[0-2])[-/.](0?[1-9]|[12]\d|3[01])\b|\b(0?[1-9]|[12]\d|3[01])[-/.](0?[1-9]|1[0-2])[-/.](19|20)?\d{2}\b/g,
  },
  {
    kind: "Possible email address",
    severity: "block",
    pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g,
  },
  {
    kind: "Possible phone number",
    severity: "block",
    pattern: /\b(\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g,
    reject: (m) => looksLikeCatalogRef(m),
  },
  {
    // "patient", "mr.", "mrs.", "dr." followed by a capitalized word is a
    // soft signal of a person's name. WARN, not block - "Dr. Smith's
    // preferred plate" is a plausible legitimate note, but worth a pause.
    kind: "Possible person name",
    severity: "warn",
    pattern: /\b(patient|mr|mrs|ms|dr|monsieur|madame|m|mme|dr)\.?\s+[A-Z][a-zà-ÿ]+/g,
  },
];

// Scan text and return every finding. Pure function, no side effects, never
// logs the input.
export function scanForPhi(text: string): PhiFinding[] {
  if (!text) return [];
  const findings: PhiFinding[] = [];
  for (const rule of RULES) {
    rule.pattern.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = rule.pattern.exec(text)) !== null) {
      const matched = m[0];
      if (rule.reject && rule.reject(matched, text)) continue;
      findings.push({
        kind: rule.kind,
        severity: rule.severity,
        match: matched,
        index: m.index,
      });
      if (m.index === rule.pattern.lastIndex) rule.pattern.lastIndex++; // avoid zero-width loop
    }
  }
  return findings;
}

export interface PhiCheckResult {
  clean: boolean;
  blocking: PhiFinding[]; // must be cleared before save is allowed
  warnings: PhiFinding[]; // user may proceed after explicit confirmation
}

export function checkPhi(text: string): PhiCheckResult {
  const findings = scanForPhi(text);
  const blocking = findings.filter((f) => f.severity === "block");
  const warnings = findings.filter((f) => f.severity === "warn");
  return { clean: findings.length === 0, blocking, warnings };
}

// A friendly, non-clinical-jargon explanation for the UI. Deliberately does
// NOT echo the matched value back (so a flagged MRN isn't re-displayed and
// re-stored in an error message / screenshot).
export function describeFindings(findings: PhiFinding[]): string {
  const kinds = Array.from(new Set(findings.map((f) => f.kind)));
  return kinds.join("; ");
}

// ============================================================================
// STORE / TRANSMIT BACKSTOPS
// The input-time block (checkPhi) is the primary defense, but a clinical tool
// should never rely on a single layer. These functions are the last line:
// they run inside the save and email-compose paths themselves, so no code
// path can persist or transmit unscanned free text - even a future feature
// that forgets to call checkPhi at the UI.
// ============================================================================

// Redacts any hard-blocking PHI pattern from a string, replacing the matched
// span with a marker. Used as a storage/transmission backstop, NOT as a
// substitute for blocking at input (a redacted note is a degraded note - we
// still want the user to fix it at entry). Warn-level patterns (possible
// names/dates) are left intact here to avoid mangling legitimate text; only
// the unambiguous identifiers are scrubbed.
export function redactPhi(text: string): { redacted: string; didRedact: boolean } {
  if (!text) return { redacted: text, didRedact: false };
  const blocking = scanForPhi(text).filter((f) => f.severity === "block");
  if (blocking.length === 0) return { redacted: text, didRedact: false };

  // Merge overlapping/adjacent spans first. Without this, two rules matching
  // overlapping regions (e.g. an "MRN 12345678" label match and the bare
  // "12345678" digit match) would be redacted independently, and replacing one
  // shifts the indices of the other - leaving stray fragments like "ED]" in
  // the output. Merging guarantees each character region is redacted exactly
  // once, cleanly.
  const spans = blocking
    .map((f) => ({ start: f.index, end: f.index + f.match.length }))
    .sort((a, b) => a.start - b.start);
  const merged: { start: number; end: number }[] = [];
  for (const s of spans) {
    const last = merged[merged.length - 1];
    if (last && s.start <= last.end) {
      last.end = Math.max(last.end, s.end);
    } else {
      merged.push({ ...s });
    }
  }

  // Apply merged spans right-to-left so earlier indices stay valid.
  let out = text;
  for (let i = merged.length - 1; i >= 0; i--) {
    out = out.slice(0, merged[i].start) + "[REDACTED]" + out.slice(merged[i].end);
  }
  return { redacted: out, didRedact: true };
}

// Deep-scrub an arbitrary object's string values before it is written to
// storage or assembled into a message. Returns a new object; never mutates
// the input. Use on reorder items, flagged issues, archived orders, and email
// payloads as a hard backstop.
export function scrubObject<T>(obj: T): { value: T; didRedact: boolean } {
  let didRedact = false;
  const walk = (v: any): any => {
    if (typeof v === "string") {
      const { redacted, didRedact: r } = redactPhi(v);
      if (r) didRedact = true;
      return redacted;
    }
    if (Array.isArray(v)) return v.map(walk);
    if (v && typeof v === "object") {
      const next: any = {};
      for (const k of Object.keys(v)) next[k] = walk(v[k]);
      return next;
    }
    return v;
  };
  return { value: walk(obj), didRedact };
}

// Assert a string is safe to transmit. Throws if hard PHI remains - callers in
// the email path use this so a message is never sent with patient data, even
// if some upstream guard was bypassed.
export function assertTransmitSafe(text: string): void {
  const { blocking } = checkPhi(text);
  if (blocking.length > 0) {
    throw new Error(
      "Refusing to transmit: message contains possible patient information (" +
        describeFindings(blocking) +
        ")."
    );
  }
}
