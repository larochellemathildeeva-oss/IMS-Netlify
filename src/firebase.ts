import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";
import firebaseConfig from "../firebase-applet-config.json";

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId); /* CRITICAL: The app will break without this line */
export const auth = getAuth();

// ---------------------------------------------------------------------------
// FIREBASE APP CHECK
// Verifies that requests reaching Firestore actually come from this deployed
// app (running in a real browser, on the registered domain) rather than from
// someone calling the Firestore REST/SDK API directly with the project's
// public config values copied out of the page source. This closes a real
// gap the open "allow read/write: if true" Firestore rules otherwise leave -
// rules alone can't tell a legitimate browser session from a script.
//
// SETUP REQUIRED (one-time, in the Firebase console, not something this
// code can do on its own):
//   1. Firebase console -> App Check -> register this web app
//   2. Choose reCAPTCHA v3 as the provider, get a site key
//   3. Set VITE_RECAPTCHA_SITE_KEY in your environment (.env.local locally,
//      or your hosting provider's environment variable settings)
//   4. In Firebase console -> App Check -> Firestore, switch enforcement
//      from "Unenforced" to "Enforced" once you've confirmed real traffic
//      is passing (test with it unenforced first, or this can silently
//      lock out the live app if the site key is missing/wrong)
//
// Until VITE_RECAPTCHA_SITE_KEY is set, this is a no-op (App Check simply
// isn't initialized) - the app keeps working exactly as before, it just
// isn't protected by this layer yet.
// ---------------------------------------------------------------------------
const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY || "";

if (RECAPTCHA_SITE_KEY) {
  try {
    initializeAppCheck(app, {
      provider: new ReCaptchaV3Provider(RECAPTCHA_SITE_KEY),
      isTokenAutoRefreshEnabled: true,
    });
  } catch (e) {
    console.error("Failed to initialize Firebase App Check:", e);
  }
} else {
  console.warn(
    "VITE_RECAPTCHA_SITE_KEY is not set - Firebase App Check is NOT active. " +
    "This is fine for local development, but should be configured before " +
    "relying on this as a production deployment. See the comment above " +
    "this code for setup steps."
  );
}

export enum OperationType {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  LIST = "list",
  GET = "get",
  WRITE = "write"
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId
    },
    operationType,
    path
  };
  console.error("Firestore Error: ", JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
