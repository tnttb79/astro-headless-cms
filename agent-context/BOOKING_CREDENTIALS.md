# Booking — Google Calendar Credentials & Setup

**Audience:** future developers / AI agents working on the direct-booking feature.
**Purpose:** everything needed to run/deploy booking, since the secret key is **not** in git.

> **⚠️ The raw private key is intentionally NOT in this file or anywhere in the repo.**
> Pasting it here would (a) be blocked by GitHub secret scanning and (b) expose a
> live credential to real patient data. Get the key from the owner (out-of-band)
> or regenerate it in Google Cloud.

---

## Owner risk-acceptance note

The site owner is aware that, ideally, no secret touches the repo at all. This is
a small, low-stakes project and the owner accepts pragmatic handling. The chosen
approach is: **the key is git-ignored (never committed) and provided out-of-band**,
because GitHub push protection blocks committing it *and* the booking calendars now
contain real patient PII (name, phone, DOB, insurance in event descriptions), so a
leaked key would put patient data at risk — not just the owner's. If that risk ever
needs to drop to zero: rotate the key in Google Cloud and delete any local copies.

## What the credential is

A **Google Cloud service account** used server-side to read calendar availability
(freeBusy) and create/update/delete booking events. No end-user OAuth.

| Item | Value |
|---|---|
| Service account email | `marin-booking@marin-holy-hill.iam.gserviceaccount.com` |
| Google Cloud project | `marin-holy-hill` |
| API enabled | Google Calendar API |
| Key file (git-ignored) | `marin-holy-hill-270969aef97c.json` at **repo root** |
| Calendars shared with the SA | "Make changes and see all event details" |

Calendar IDs and the busy/write mapping are in `agent-context/WIP/agent_21/PLAN.md`
(CONFIRMED VALUES) and live-editable in the `CalendarConfig` CMS collection.

## How the code loads it

`src/lib/google/credentials.ts` (server-only) resolves credentials in this order:
1. **Env override (preferred if set):** `GOOGLE_SA_CLIENT_EMAIL` +
   `GOOGLE_SA_PRIVATE_KEY_B64` (base64 of the PEM). Set via `wix env set` (stored
   on Wix servers, backend-only).
2. **Fallback:** the committed-at-root JSON key file (git-ignored).

It is imported only by server code (`src/lib/google/*`, `src/pages/api/booking/*`)
and is verified to never enter the client bundle.

## To build/deploy (owner)

The key file already exists on the owner's machine, so `npm run build` /
`npm run release` work as-is. The file is git-ignored, so it is **not** pushed to
GitHub — that is expected and correct.

## To set up on a fresh clone (no key file present)

`wix build` will fail to resolve the JSON import if the key file is absent — that
missing-file error is the signal that credentials aren't set up. Do one of:

- **Option A (match the owner's setup):** obtain `marin-holy-hill-270969aef97c.json`
  from the owner and place it at the repo root; or regenerate a key for the
  `marin-booking@…` service account in the Google Cloud console (project
  `marin-holy-hill`) and share the calendars with it.
- **Option B (env vars, no file):** set `GOOGLE_SA_CLIENT_EMAIL` and
  `GOOGLE_SA_PRIVATE_KEY_B64` (via `wix env set`) — but note the static JSON
  import in `credentials.ts` still needs the file to exist at build time on this
  runtime, so Option A is the reliable path today. (If a file-free build is ever
  required, switch the JSON import in `credentials.ts` to an env-only load.)

## Related

- Feature spec & confirmed values: `agent-context/WIP/agent_21/PLAN.md`
- Developer notes: `agent-context/DEVELOPMENT.md` §7b
- Credential loader: `src/lib/google/credentials.ts`
