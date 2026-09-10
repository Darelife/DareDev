import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

// Server-only. Never import this file (or firebase-admin) from apps/web —
// there is no client-side Firebase SDK anywhere in this project on purpose.

let app: App | null = null;

function getServiceAccount() {
  const b64 = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!b64) {
    throw new Error("Missing required environment variable: FIREBASE_SERVICE_ACCOUNT");
  }
  const json = Buffer.from(b64, "base64").toString("utf8");
  return JSON.parse(json);
}

export function getFirestoreDb(): Firestore {
  if (!app) {
    app = getApps().length > 0 ? getApps()[0] : initializeApp({ credential: cert(getServiceAccount()) });
  }
  return getFirestore(app);
}
