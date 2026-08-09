/**
 * SERVER-ONLY. Never import this from a client component or React island — it
 * would pull the service-account key into the browser bundle.
 *
 * ⚠️ SECURITY NOTE:
 * The service-account key (`marin-holy-hill-270969aef97c.json`, repo root) is
 * GIT-IGNORED — never committed. It is provided out-of-band and read only here,
 * server-side. GitHub push protection blocks committing it, and the booking
 * calendars hold real patient PII, so a leaked key is a genuine risk. Prefer the
 * env override (GOOGLE_SA_CLIENT_EMAIL + GOOGLE_SA_PRIVATE_KEY_B64 via
 * `wix env set`) when you can. Full setup: agent-context/BOOKING_CREDENTIALS.md.
 *
 * NEVER log, print, or return the private key.
 */
// @ts-ignore - JSON import resolved at build time (resolveJsonModule); server bundle only.
import serviceAccountKey from "../../../marin-holy-hill-270969aef97c.json";

export interface GoogleCredentials {
  clientEmail: string;
  privateKeyPem: string;
}

let cached: GoogleCredentials | null = null;

export function getGoogleCredentials(): GoogleCredentials {
  if (cached) return cached;

  // Preferred override: Wix server secrets (kept out of the repo). Falls back to
  // the committed JSON key so a fresh GitHub clone works with no extra setup.
  const envEmail = import.meta.env.GOOGLE_SA_CLIENT_EMAIL as string | undefined;
  const envKeyB64 = import.meta.env.GOOGLE_SA_PRIVATE_KEY_B64 as string | undefined;
  if (envEmail && envKeyB64) {
    cached = { clientEmail: envEmail, privateKeyPem: atob(envKeyB64) };
    return cached;
  }

  const key = serviceAccountKey as { client_email?: string; private_key?: string };
  if (!key.client_email || !key.private_key) {
    throw new Error("Google service-account credentials are unavailable.");
  }
  cached = { clientEmail: key.client_email, privateKeyPem: key.private_key };
  return cached;
}
