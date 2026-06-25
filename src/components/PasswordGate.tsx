import { useState, useEffect } from "react";

// SIMPLE PASSWORD GATE - not real authentication.
//
// This protects against accidental edits by people using the app normally.
// It does NOT protect the database itself - Firestore rules underneath
// still need `allow write: if true`, since there's no real auth token for
// them to check. Anyone who opens browser dev tools and talks to Firestore
// directly bypasses this completely. This is an intentional tradeoff: full
// real authentication needs Identity Platform + billing, which isn't
// available right now. If that changes later, swap this for src/components/
// Login.tsx (the Firebase Auth version), which is a stricter replacement
// for the same call sites.
//
// The password is read from an environment variable rather than hardcoded
// directly in this file, so it's at least not sitting in plain sight at
// the top of a source file - though since this whole app ships its
// JavaScript to the browser, a sufficiently motivated person could still
// find it by reading the built bundle. This stops casual/accidental access,
// not a deliberate attacker.

const EDIT_PASSWORD = import.meta.env.VITE_EDIT_PASSWORD || "";
const SESSION_KEY = "ortho_edit_unlocked";

// Lightweight client-side rate limiting: after 5 wrong attempts, force a
// cooldown that doubles each time (30s, 60s, 120s...) before another
// attempt is accepted. This is NOT a real defense against a determined
// attacker scripting around the UI - it only slows down someone typing
// guesses by hand in the browser. Real protection against brute-forcing
// has to live server-side (Firebase App Check + Firestore rules), which is
// Real protection against brute-forcing has to live server-side (Firebase
// App Check + Firestore rules), which is why this is paired with App Check
// rather than relied on alone.
let failedAttempts = 0;
let cooldownUntil = 0;

export function useEditUnlocked() {
  const [unlocked, setUnlocked] = useState(false);

  useEffect(() => {
    // Session-only: closing the tab/browser re-locks it. Using
    // sessionStorage rather than localStorage is deliberate - a shared OR
    // computer shouldn't stay unlocked indefinitely just because someone
    // once typed the password.
    try {
      setUnlocked(sessionStorage.getItem(SESSION_KEY) === "true");
    } catch {
      setUnlocked(false);
    }
  }, []);

  const unlock = (attempt: string): boolean => {
    if (!EDIT_PASSWORD) {
      console.error(
        "VITE_EDIT_PASSWORD is not set - no password configured, so the edit gate cannot be unlocked. Set it in your environment before relying on this."
      );
      return false;
    }

    // Rate limit: refuse to even check the password while in cooldown,
    // regardless of what was typed. This is what actually slows down rapid
    // manual guessing - without this check, a wrong guess wouldn't matter
    // since correctness is still checked below, but spamming attempts
    // would have no cost at all.
    if (Date.now() < cooldownUntil) {
      return false;
    }

    if (attempt === EDIT_PASSWORD) {
      failedAttempts = 0;
      cooldownUntil = 0;
      setUnlocked(true);
      try {
        sessionStorage.setItem(SESSION_KEY, "true");
      } catch {
        // sessionStorage unavailable (e.g. private browsing) - still
        // unlock for this render, just won't persist across reloads.
      }
      return true;
    }

    failedAttempts += 1;
    if (failedAttempts >= 5) {
      // Cooldown doubles each time it's triggered again after expiring:
      // 30s, 60s, 120s, capped at 10 minutes so a legitimate user who
      // forgot the right capitalization a few times isn't locked out for
      // an unreasonable stretch.
      const tier = Math.min(failedAttempts - 5, 5);
      const cooldownMs = Math.min(30_000 * Math.pow(2, tier), 10 * 60_000);
      cooldownUntil = Date.now() + cooldownMs;
    }
    return false;
  };

  // Returns a human-readable message if currently in cooldown, or null if
  // not. Callers (e.g. the Archive password form) can show this instead of
  // a generic "incorrect password" message when relevant.
  const getCooldownMessage = (): string | null => {
    const remainingMs = cooldownUntil - Date.now();
    if (remainingMs <= 0) return null;
    const remainingSec = Math.ceil(remainingMs / 1000);
    return `Too many incorrect attempts. Please wait ${remainingSec}s before trying again.`;
  };

  const lock = () => {
    setUnlocked(false);
    try {
      sessionStorage.removeItem(SESSION_KEY);
    } catch {
      // ignore
    }
  };

  return { unlocked, unlock, lock, getCooldownMessage };
}

interface PasswordGateModalProps {
  onClose: () => void;
  onUnlock: (attempt: string) => boolean;
  onSuccess: () => void;
}

export function PasswordGateModal({ onClose, onUnlock, onSuccess }: PasswordGateModalProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUnlock(password)) {
      onSuccess();
    } else {
      setError("Incorrect password.");
      setPassword("");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center px-4 z-50">
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
        <h3 className="font-semibold text-slate-900 text-lg">Password required</h3>
        <p className="text-sm text-slate-500 mt-1">
          Anyone can search and view sets. Enter the team password to add, edit, or verify entries.
        </p>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <div>
            <input
              type="password"
              required
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500"
              placeholder="Team password"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-slate-200 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 rounded-lg bg-teal-700 text-white py-2.5 text-sm font-medium hover:bg-teal-800"
            >
              Unlock
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
