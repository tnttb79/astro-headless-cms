# Goal

Implement the **"Book Directly"** flow on the Marin Holy Hill Acupuncture site **without Wix Bookings**, while leaving the existing **"Book through Zocdoc"** option unchanged.

The direct flow lets a patient: choose patient type → service → location → date → a 15‑minute slot → fill a form → book. On booking the server revalidates availability, creates a Google Calendar event in the correct color‑coded calendar, saves a structured record in Wix CMS, and a confirmation email is sent to the patient.

**Source of truth for schedule/availability = Google Calendar.** Maintainable configuration + the structured booking record live in **Wix CMS**. Google credentials must **never** reach the browser — all Calendar calls happen in Astro server API routes.

This document is written to be **resumable**: any agent can pick it up mid‑way by reading the "Progress log" and "File-by-file checklist" at the bottom. Update those sections as you go.

---

# Plan

## 0. Decisions already locked (do not re-litigate)

| Topic | Decision |
|---|---|
| Google auth | **Option A — service account + shared calendars.** Dr. Kang shares each calendar with the service-account email. No OAuth/consent/refresh-token flow. |
| Concurrency | **Freebusy re-check + atomic CMS deterministic-id lock.** (See §7.) |
| Entry-point UX | **Two paths on `/book`: "Book Directly" primary + "Book through Zocdoc" secondary.** Zocdoc behavior stays exactly as today. |
| Email | **Wix Automation.** The clinic owner sets up the email template + trigger in the Wix dashboard UI. Server triggers it reliably via a Wix Form submission (see §8). |
| Appointment length | Always **15 minutes** (fixed; variable durations are out of scope). |
| Timezone | **America/Phoenix = fixed UTC‑07:00 year-round** (Arizona never observes DST). We can construct slot times with a hardcoded `-07:00` offset. |

## 1. Hard constraints from this codebase (read before writing code)

1. **Production runtime is a Wix-managed edge/fetch runtime, NOT Node.** `astro.config.mjs` uses `output: 'server'` + `@wix/cloud-provider-fetch-adapter` (Cloudflare-style). Therefore:
   - **Do NOT use `googleapis` or `google-auth-library`** (Node-only). Call Google REST directly with `fetch`.
   - **Sign the service-account JWT with Web Crypto** (`crypto.subtle`, `RSASSA-PKCS1-v1_5` / SHA-256). No Node `crypto`.
   - No SMTP — email is HTTP-triggered (handled via Wix Automation, §8).
   - `Intl` with `timeZone` is available, but for Arizona we use a fixed `-07:00` offset anyway.
2. **This is a `managed` + `iterate` Wix project that is already linked.** NEVER run `wix init` / `headless link`. Reuse existing `siteId`/`appId` in `wix.config.json`.
3. **Adapter pattern is mandatory.** Pages/routes never touch raw Wix shapes — go through typed adapters in `src/lib/wix/` returning `src/types/content.ts` domain types. Every SDK read is wrapped in `try/catch` with a safe fallback.
4. **Wix Data item shape:** fields are on the item directly (`item.title`), id is **`item._id`**. Native collection ids have **no namespace**.
5. **Privacy (project rule):** never log request bodies; never send name/email/phone/message/insurance/DOB/appointment details to analytics or logs. Analytics events are no-PII only (e.g. `booking_start`, `booking_success`, `booking_failure`, `slot_select`).
6. **Release discipline:** `npm run build` to surface real errors; `npm run release` **once** at the very end. Content is fetched live at runtime, so re-release only when frontend build output changes.
7. **Compliance:** cancellation-policy text and any patient-facing copy are configurable in CMS, not hardcoded.

## 2. Architecture overview

```
/book (Astro page)
  ├─ "Book Directly" (primary CTA)  ── React island wizard (client:only="react")
  │      patientType → service → location → date → slots → form → confirm → success
  │            │ fetch (JSON)
  │            ▼
  │      Astro API routes (edge; Google creds are server secrets)
  │        GET  /api/booking/availability   → free 15-min slots for a date/location
  │        POST /api/booking/create         → revalidate → CMS lock → Google event → confirm
  │            │
  │            ├─ Google Calendar REST (freebusy + events.insert)  [src/lib/google/*]
  │            ├─ Wix CMS Appointments (auth.elevate insert/update) [ADMIN read/write]
  │            └─ Wix Form submit → triggers Wix Automation email + adds Contact
  │
  └─ "Book through Zocdoc" (secondary)  ── unchanged; links SiteSettings.bookingUrl (new tab)
```

## 3. Human-in-the-loop setup (BLOCKERS — cannot be done by an agent)

These must be completed by the user / Dr. Kang. Track status in the Progress log.

### 3a. Google Cloud service account
1. Create (or reuse) a Google Cloud project.
2. **Enable the Google Calendar API** for that project.
3. Create a **service account**; create a **JSON key**; download it.
4. Note the service-account email (looks like `something@project-id.iam.gserviceaccount.com`).

### 3b. Share calendars with the service account
For **each** relevant calendar in Dr. Kang's Google Calendar, open Settings → *Share with specific people* → add the service-account email:
- Calendars we WRITE to (need **"Make changes to events"**): `NEW PATIENT`, `ACUPUNCTURE`, `CA, VA, HERB, ETC`.
- Calendars we only READ for availability (need at least **"See all event details"**, or "Free/busy" is enough for freebusy): `INSURANCE`, `RESCHEDULE`, any personal/busy calendar, plus the three write calendars above.
- Do **NOT** share (or mark `countsAsBusy=false`): `CANCELLATION`, `NO SHOW`.

### 3c. Provide the real calendar IDs + confirm mapping
Send back, for every calendar to be used: its **display name** and **calendar ID** (Google Calendar → Settings for that calendar → "Integrate calendar" → *Calendar ID*). Confirm:
- Write mapping (see §5 CalendarConfig / routing).
- Which calendars **count as busy** for availability.

### 3d. Store secrets as Wix server-secret env vars
Using the Wix CLI env command (`npm run env` → `wix env`), set **server + secret** variables (login-gated CLI step; user runs it):
- `GOOGLE_SA_CLIENT_EMAIL` = service-account email.
- `GOOGLE_SA_PRIVATE_KEY_B64` = base64 of the PEM private key (base64 avoids newline breakage). Code will base64-decode at runtime.
- (Later, if ever needed) any additional keys.
> ⚠️ **Verification spike (do this FIRST in implementation):** confirm exactly how a **server-secret** env var is read at runtime in this managed-Astro edge build (candidates: `import.meta.env.X`, `process.env.X`, or an Astro `locals`/runtime binding). The Wix docs page "about-environment-variables-in-the-cli" describes the four var types (client/server × public/secret). Verify with a throwaway `/api/_envcheck` route that returns only `{ hasKey: boolean }` (never the value), release once to a preview, confirm, then delete it. Everything else depends on this working.

### 3e. Wix Automation for the confirmation email (owner does in dashboard)
After the "Booking Confirmation" Wix Form exists (§8), the owner: Dashboard → Automations → New → **Trigger: form submitted (Booking Confirmation form)** → **Action: Send email** → design the template using the form fields (patient name, service, location, appointment time, reference id). This is the manual UI step the user agreed to own.

## 4. Timezone handling (America/Phoenix, fixed -07:00)

- All business hours, slot boundaries, closures, and "today/lead time" comparisons are computed in Arizona local time.
- Because Arizona is UTC‑7 all year, construct RFC3339 timestamps as `YYYY-MM-DDTHH:mm:00-07:00`. Store `startTime`/`endTime` in the Appointments record in **UTC ISO** (`...Z`) for consistency; send Google `dateTime` with `timeZone: "America/Phoenix"`.
- Put a single helper module `src/lib/booking/time.ts` with: `phoenixOffset = "-07:00"`, `slotToRfc3339(dateISO, "HH:mm")`, `toUtcIso(...)`, `nowInPhoenix()`, `weekdayOf(dateISO)`. Keep ALL offset logic here so a future DST-aware change is one file.

## 5. Wix CMS — collections & schemas

Extend `scripts/wix-seed.mjs` (idempotent `ensureCollection` + `seedRows` pattern already present) and add fallback data + adapters. **Permissions:** all config collections are `read: ANYONE` (like existing ones) EXCEPT `Appointments`.

### 5a. `Appointments` — **`read: ADMIN`, all writes ADMIN** (contains PII/DOB/insurance)
Fields: `patientType` TEXT, `service` TEXT, `location` TEXT (location slug), `name` TEXT, `email` TEXT, `phone` TEXT, `insuranceCompany` TEXT, `insuranceId` TEXT, `dateOfBirth` TEXT, `message` TEXT, `startTime` DATE/TEXT (UTC ISO), `endTime` DATE/TEXT (UTC ISO), `googleCalendarId` TEXT, `googleEventId` TEXT, `status` TEXT (`pending`|`booked`|`failed`|`cancelled`), `referenceId` TEXT (short human code), `createdAt` DATE/TEXT.
- **Custom permissions block:** `{ insert: "ADMIN", update: "ADMIN", remove: "ADMIN", read: "ADMIN" }`. Do **not** make it public-read.
- Deterministic `_id` per `(location + startUtcIso)` used as the concurrency lock (§7).

### 5b. `BookableServices` — `read: ANYONE`
Fields: `key` TEXT (`acupuncture|cupping|herbal|met`), `label` TEXT, `allowsFirstTime` BOOLEAN, `allowsExisting` BOOLEAN, `displayOrder` NUMBER, `active` BOOLEAN.
Seed rows: Acupuncture, Cupping Therapy, Herbal Medicine, Medical Massage (MET). (Note: "Cupping Therapy" is a booking-only service — it is NOT in the `Treatments` collection; do not try to derive the booking menu from `Treatments`.)

### 5c. `CalendarConfig` — `read: ANYONE` (contains no secrets — calendar IDs are not secret; the private key is the secret)
Fields: `category` TEXT (`NEW_PATIENT|ACUPUNCTURE|CA_VA_HERB_ETC|INSURANCE|RESCHEDULE|PERSONAL`), `label` TEXT, `googleCalendarId` TEXT, `countsAsBusy` BOOLEAN, `active` BOOLEAN, `displayOrder` NUMBER.
Seed rows with **empty `googleCalendarId`** placeholders until §3c returns real IDs. `countsAsBusy` defaults: NEW_PATIENT/ACUPUNCTURE/CA_VA_HERB_ETC/INSURANCE/RESCHEDULE/PERSONAL = true; CANCELLATION/NO_SHOW are simply not represented (never queried, never written).

### 5d. `BusinessHours` — `read: ANYONE`
Fields: `location` TEXT (slug), `weekday` NUMBER (0=Sun..6=Sat), `openTime` TEXT (`HH:mm`), `closeTime` TEXT (`HH:mm`), `active` BOOLEAN.
Seed Mesa from draft hours (Mon–Fri 08:30–18:00, Sat 09:00–16:00, Sun closed = no row/active=false). Payson: none until supplied.

### 5e. `Closures` — `read: ANYONE`
Fields: `location` TEXT (slug or `all`), `startDate` TEXT (`YYYY-MM-DD`), `endDate` TEXT (`YYYY-MM-DD`), `reason` TEXT, `active` BOOLEAN. Covers holidays + manual exceptions.

### 5f. `BookingSettings` — `read: ANYONE`
Fields: `settingsKey` TEXT (`primary`), `slotMinutes` NUMBER (15), `minLeadMinutes` NUMBER (e.g. 120), `maxAdvanceDays` NUMBER (e.g. 45), `cancellationPolicyText` TEXT (default: "For cancellations, please contact us 24 hours in advance."), `active` BOOLEAN.

### 5g. Reuse existing `Locations`
Mesa `status:"open"` → enabled. Payson `status:"opening_soon"` → rendered visible but disabled ("Coming Soon"). No schema change needed.

> After adding collections: update `ARCHITECTURE.md` §6/§9 and `PROJECT_CONTEXT.md` §8 collection lists, and `DEVELOPMENT.md` §7 known-IDs table (add the Booking Confirmation formId once created).

## 6. Domain types + adapters

- Extend `src/types/content.ts`: `BookableService`, `CalendarConfigEntry`, `BusinessHour`, `Closure`, `BookingSettings`, `Appointment`.
- Extend `src/lib/wix/data.ts` with guarded adapters: `getBookableServices()`, `getCalendarConfig()`, `getBusinessHours(location?)`, `getClosures(location?)`, `getBookingSettings()`. Each `try/catch` → fallback (fallbacks in `src/content/fallback-data.ts`, matching existing style).
- Appointments writes are **not** in `data.ts` (which is visitor-scoped reads). Put elevated Appointments insert/update in a server-only module `src/lib/booking/appointments.ts` using `auth.elevate(...)` from `@wix/essentials` (see the skill's elevation reference). Never import this from client code.

## 7. Google Calendar server client (`src/lib/google/`)

`src/lib/google/auth.ts`
- `getAccessToken()`: build JWT (`{alg:"RS256",typ:"JWT"}` + claims `iss`=SA email, `scope`="https://www.googleapis.com/auth/calendar", `aud`="https://oauth2.googleapis.com/token", `iat`, `exp`=iat+3600), sign with Web Crypto (`importKey('pkcs8', pkcs8FromPem(GOOGLE_SA_PRIVATE_KEY_B64), {name:'RSASSA-PKCS1-v1_5', hash:'SHA-256'}, false, ['sign'])`), POST `https://oauth2.googleapis.com/token` with `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=<jwt>`. Cache the token in module scope until ~5 min before expiry.
- Helpers: base64url encode, PEM→PKCS8 DER (`atob` + strip header/footer).

`src/lib/google/calendar.ts`
- `freeBusy(calendarIds, timeMinRfc3339, timeMaxRfc3339)`: POST `https://www.googleapis.com/calendar/v3/freeBusy` with `{ timeMin, timeMax, timeZone:"America/Phoenix", items:[{id}...] }` → returns merged busy intervals across all calendars.
- `insertEvent(calendarId, {summary, description, startRfc3339, endRfc3339})`: POST `.../calendars/{calendarId}/events`. Body `start/end` = `{ dateTime, timeZone:"America/Phoenix" }`. Return the created `id`.
- `deleteEvent(calendarId, eventId)`: for rollback if the CMS/email step fails after event creation.

## 8. Availability engine (`src/lib/booking/availability.ts`)

`computeAvailableSlots({ dateISO, locationSlug })`:
1. Load `BookingSettings`, `Locations`, `BusinessHours(location)`, `Closures(location)`, `CalendarConfig`.
2. Reject if location not `open`, or date is a closure/holiday, or date < today or > `maxAdvanceDays`.
3. Build candidate slots at `slotMinutes` (15) steps between `openTime`/`closeTime` for that weekday; drop any slot whose start is before `now + minLeadMinutes` (Phoenix).
4. `freeBusy` over all `countsAsBusy && active && googleCalendarId!=""` calendar IDs for `[dayStart, dayEnd]`.
5. Remove any slot `[start,end)` overlapping a busy interval.
6. Return `{ slots: string[] /* UTC ISO starts */, slotMinutes }`.
- If `CalendarConfig` has no real IDs yet (pre §3c), freebusy is skipped and the endpoint returns an explicit `{ configPending: true, slots: [] }` so the UI shows "Online booking is being set up — please call." (graceful, no crash).

## 9. API routes

`src/pages/api/booking/availability.ts` (`export const prerender = false; GET`)
- Query params: `date` (`YYYY-MM-DD`), `location` (slug). Validate format; clamp.
- Returns `{ ok, slots, slotMinutes, configPending? }`. **No PII, no calendar contents** — only free start times.

`src/pages/api/booking/create.ts` (`export const prerender = false; POST`)
1. Size guard (like `contact.ts`, e.g. > 32KB → 413). Parse JSON; reject non-object.
2. Validate payload: `patientType` ∈ {first_time, existing}; `service` ∈ active BookableServices and allowed for that patientType; `location` is an open location; `slotStart` UTC ISO that maps to a currently-legal slot; form fields (name, email, phone, insuranceCompany, insuranceId, dateOfBirth, message) — required/format per rules. Return `422` with `fieldErrors` on failure (mirror contact route shape).
3. **Revalidate availability server-side:** recompute the slot is legal AND `freeBusy` still shows it free. If not → **409 `{ ok:false, code:"SLOT_TAKEN" }`** ("that time was just taken, please pick another").
4. **Atomic lock:** compute deterministic `_id = uuidFromString(location + "|" + slotStartUtcIso)`. `auth.elevate(items.insert)("Appointments", { _id, ...data, status:"pending", referenceId, createdAt })`. On **duplicate-id error → 409 `SLOT_TAKEN`** (two website users raced).
5. **Route to calendar:** `first_time` → `NEW_PATIENT`; else `acupuncture`→`ACUPUNCTURE`, `cupping|herbal|met`→`CA_VA_HERB_ETC`. Resolve category → `googleCalendarId` from CalendarConfig. (Routing rule lives in `src/lib/booking/routing.ts`; the IDs live in CMS.)
6. **Create Google event.** Event content (minimal, useful for Dr. Kang — do NOT dump every field):
   - `summary`: `"{Name} — {Service} ({Existing|New})"`.
   - `description`: `Patient type, Service, Location, Phone, Reference ID`. (No insurance/DOB/message dump.)
   - On failure → set Appointments row `status:"failed"` (or delete to fully free the slot) and return `502 { ok:false, code:"CALENDAR_ERROR" }`.
7. On success: `auth.elevate(items.update)` the row with `googleEventId`, `googleCalendarId`, `status:"booked"`.
8. **Trigger email + CRM:** submit the **"Booking Confirmation" Wix Form** (server-side `submissions.createSubmission`, like `contact.ts`) with only the email-needed fields: firstName, lastName, email, phone, service, location, appointmentTime (Phoenix-readable), referenceId. This reliably fires the owner's Wix Automation and lands the patient in Contacts. **Insurance/DOB/message never go to the form** — they live only in the ADMIN Appointments collection. If the form submit fails, the booking is still valid — log a non-PII warning and return success (email is best-effort; the record is authoritative).
9. Return `200 { ok:true, referenceId, startTime, location, service }`.

Rollback ordering rationale: insert CMS lock (pending) → create Google event → update to booked → email. Any failure after the lock but before success releases/marks the slot so it doesn't stay falsely blocked.

## 10. Frontend

`src/pages/book.astro` (rewrite)
- Two clearly separated paths. **Book Directly** (primary) mounts the wizard island. **Book through Zocdoc** (secondary) keeps today's behavior: link `SiteSettings.bookingUrl`, `target="_blank" rel="noopener noreferrer"`, `data-analytics-event="booking_click"`. Keep click-to-call as a tertiary path. Read `Locations` + `BookingSettings.cancellationPolicyText` server-side and pass to the island as props.
- Reuse existing design system components (`Section`, `Eyebrow`, `Button`, `Card`) and tokens; match current `/book` styling language.

`src/components/booking/BookingWizard.tsx` (React island, `client:only="react"`)
- Steps: (1) patient type, (2) service (filtered by patient type via `allowsFirstTime/allowsExisting`), (3) location (Mesa enabled; Payson visible + disabled "Coming Soon"), (4) date picker, (5) slots (fetch `/api/booking/availability`, render 15-min slots, loading/empty/`configPending` states), (6) form (name, email, phone, insurance company, insurance id, DOB, message) + cancellation-policy text, (7) review + Book, (8) success.
- Client validation mirrors server; on submit POST `/api/booking/create`. Handle `SLOT_TAKEN` (409) by bouncing user back to slot step with a message and refreshed availability. Fire no-PII analytics: `booking_start`, `slot_select`, `booking_success`, `booking_failure`.
- Accessibility: labeled inputs, keyboard nav, focus management between steps, error summary, large touch targets (per PROJECT_CONTEXT §12).

## 11. `scripts/wix-seed.mjs` additions
- Add the six new collection definitions (§5) to `definitions[]` with correct `permissions` (Appointments = ADMIN read).
- Add seed rows for `BookableServices`, `CalendarConfig` (empty IDs), `BusinessHours` (Mesa), `BookingSettings`, and any `Closures` known. Do **not** seed `Appointments`.
- Keep it idempotent/additive (never delete). Add matching `FALLBACK_*` exports in `src/content/fallback-data.ts`.

## 12. Verification (before "done")
1. `npm run build` passes, no type errors. All SDK reads guarded.
2. Env-secret read confirmed via the throwaway `/api/_envcheck` (then deleted).
3. Local `wix dev` smoke: wizard renders; availability endpoint returns slots for a Mesa weekday (with a couple of real busy events on a shared calendar to prove exclusion); a test booking creates a Google event in the correct calendar, an Appointments row (ADMIN), and a Booking Confirmation form submission; the Wix Automation sends the email.
4. Double-book test: fire two `create` calls for the same slot ~simultaneously → exactly one `200`, one `409 SLOT_TAKEN`.
5. Manual-change test: Dr. Kang moves/deletes an event in Google → next availability call reflects it.
6. Privacy: no PII in logs/analytics; Appointments not publicly readable (query as visitor returns empty/denied); browser bundle contains no Google key.
7. Zocdoc path unchanged.
8. `npm run release` **once**; spot-check live `/book` and one availability call.

## 13. Explicit DO-NOT list
- Do NOT install Wix Bookings, SMS, reminders, payments, multi-staff, variable durations, patient accounts, or a booking-history UI.
- Do NOT use `googleapis`/Node `crypto`.
- Do NOT make `Appointments` public-read.
- Do NOT write to `CANCELLATION` / `NO SHOW` calendars, or count them as busy.
- Do NOT hardcode calendar IDs, cancellation text, hours, or the Zocdoc URL in components (all CMS-driven).
- Do NOT log request bodies or send PII to analytics.
- Do NOT run `wix init` / `headless link`; do NOT release more than once.

## 14. Open items / still needed from the user
- **[BLOCKER]** Real Google **calendar IDs** + confirmation of the busy-set and write-mapping (§3c).
- **[BLOCKER]** Service account created + calendars shared + secrets set via `wix env` (§3a/b/d).
- Confirm `minLeadMinutes` and `maxAdvanceDays` values (defaults proposed: 120 min / 45 days).
- Confirm Mesa hours are current (draft: Mon–Fri 08:30–18:00, Sat 09:00–16:00, Sun closed).
- Owner builds the Wix Automation email template once the Booking Confirmation form exists (§3e/§8).
- Confirm Payson stays fully disabled for now (yes per plan).

---

## Progress log (update as you work)
- 2026-08-08 — Review complete; decisions locked (§0). Plan written.
- 2026-08-08 — **Google setup CONFIRMED by user. All §14 Google blockers cleared.** Values below are now authoritative.

### CONFIRMED VALUES (2026-08-08)
**Service account:** `marin-booking@marin-holy-hill.iam.gserviceaccount.com` (project `marin-holy-hill`). Calendar API enabled. Calendars shared with "Make changes and see all event details".

**Credential source — UPDATED (see agent-context/BOOKING_CREDENTIALS.md):** Originally the JSON key was committed to the repo for reproducibility. That was **reversed** once the calendars started carrying real patient PII and GitHub push protection blocked the push: the key (`marin-holy-hill-270969aef97c.json`, repo root) is now **GIT-IGNORED — never committed**, provided out-of-band, and read only in `src/lib/google/credentials.ts` (server-only), preferring the `GOOGLE_SA_*` env override, else the local file. **Never log/print the private key.**

**Runtime spike result:** PASSED. Web Crypto (`crypto.subtle`, RSASSA-PKCS1-v1_5/SHA-256) JWT signing → token → freeBusy → event create+delete all verified against the live account with the committed key (via a throwaway node script mirroring the exact prod path). Web Crypto is available on the Wix/Cloudflare edge runtime. Wix env types confirmed (public-client / public-server in `.env.local`; secret-server via `wix env set`/`pull`) but not used per the decision above.

**Calendar IDs (real):**
| Category | Calendar ID | Role |
|---|---|---|
| NEW_PATIENT | `05f0e2b82241b7ae61d3bc426bf5644785048ddeb1ba8ea5688003eb3680d123@group.calendar.google.com` | WRITE (first-time) + busy |
| ACUPUNCTURE | `marinholyhillacu@gmail.com` | WRITE (existing+acupuncture) + busy |
| CA_VA_HERB_ETC | `633c5c3d44a76886ce997c136d28a2067b2cde47f2eef0349a0326d815086ce0@group.calendar.google.com` | WRITE (existing+cupping/herbal/met) + busy |
| INSURANCE | `5dd73177b27637183694425f7352a0ce939d6215049a4b178ac3d3686e208d3f@group.calendar.google.com` | busy only (never write) |
| RESCHEDULE | `9df651109780d417ae5296e5ea10331368b7301bb1298f8c9c90432e48e44ba6@group.calendar.google.com` | busy only (never write) |
| CANCELLATION | `5a94fff7407d2939760091db5dfff8beb5c70d0a9d69458a4311d31450056d3a@group.calendar.google.com` | **IGNORE** (never busy, never write) |
| NO_SHOW | `b09a3d22f58700942e8126de3343d007338f63e9144260aa3b420f4de26ebd3a@group.calendar.google.com` | **IGNORE** (never busy, never write) |

**Busy set for availability:** NEW_PATIENT, ACUPUNCTURE, CA_VA_HERB_ETC, INSURANCE, RESCHEDULE. **Excluded:** CANCELLATION, NO_SHOW. (No separate personal calendar was provided/needed — do NOT add one without user confirmation.)

**Write routing:** first_time→NEW_PATIENT; existing+acupuncture→ACUPUNCTURE; existing+{cupping|herbal|met}→CA_VA_HERB_ETC.

**Booking settings (confirmed):** slotMinutes=15, minLeadMinutes=120, maxAdvanceDays=45. Locations: Mesa enabled, Payson visible+disabled. Mesa hours from draft (Mon–Fri 08:30–18:00, Sat 09:00–16:00, Sun closed) as CMS seed. Cancellation text: "For cancellations, please contact us 24 hours in advance." All CMS-driven.

## Progress log — 2026-08-08 (implementation complete)
- Runtime/secret spike PASSED; chose committed-JSON credential path (see CONFIRMED VALUES). Env-secret `/api/_envcheck` throwaway NOT needed — the JSON path is bundled server-side and doesn't depend on the runtime env mechanism (build log confirmed Wix uses `locals.VAR`, so the `import.meta.env` override is inert but harmless; JSON fallback is the live path).
- Google spike PASSED (token/freeBusy/create/delete) against the live account.
- All collections seeded; Booking Confirmation form created (`23843eca-a00a-4128-b3cd-b6c192309f66`).
- `npm run build` PASSED (30 routes). Client-bundle scan: **no key material leaked** (key present only in server bundle).
- Live dev test PASSED: availability correct (near date excludes real busy events; far date shows full 8:30–17:45); real booking created 200 → slot removed from availability → duplicate returned 409 SLOT_TAKEN → Appointments row `booked` with correct calendar + event id + PII isolated → Google event and CMS row cleaned up. Confirmation form submission accepted (no throw).
- **NOT committed** — awaiting user decision on git (would commit the service-account key).
- **RELEASED to production** (user chose "release now"). Live spot-check passed: `/book` 200, live availability endpoint returns slots — confirms the committed-JSON Google credential works on the real Wix edge runtime.
- **Email mechanism changed (user-reported): Wix Form custom fields can't be used in Automation emails** (they show "not in the collection"). Switched confirmation from the Booking Confirmation Wix Form to a new **`BookingEmails` CMS collection** — the server inserts a row on booking success, and the owner builds the Automation on the **"Item added"** trigger (all fields are first-class). New collection in `wix-seed.mjs`; `confirmation.ts` rewritten; `BOOKING_CONFIRMATION_FORM_ID` deprecated. Re-released; live-verified (BookingEmails row created with firstName/email/service/location/appointmentTime/referenceId). The old form + its test submissions can be deleted from the dashboard.
- **Bug fix (user-reported): stale CMS lock blocked rebooking.** A successful booking left a permanent deterministic-`_id` lock row; deleting the Google event freed availability but not the row, so rebooking the same slot got 409 SLOT_TAKEN. Fixed in `src/lib/booking/appointments.ts`: on duplicate `_id`, take over the row (freeBusy already confirmed the slot free) unless a *fresh* `pending` row (<5 min) shows a genuine concurrent booking. Re-released; reproduced-and-verified fixed in production (book → delete event → rebook now returns 200 with a new event id).
- **Follow-up change (user request): calendar event now carries FULL booking details** (patient type, service, location, phone, email, DOB, insurance company, insurance id, message, ref) — Dr. Kang uses Google Calendar as the main dashboard. Optional lines (insurance/message) appear only when filled. The confirmation FORM/email path stays minimal (no DOB/insurance). Re-released and live-verified (`src/pages/api/booking/create.ts`).

## File-by-file checklist
- [x] `src/lib/booking/time.ts` — Phoenix time helpers
- [x] `src/lib/google/credentials.ts` — server-only credential loader (committed JSON + env override)
- [x] `src/lib/google/auth.ts` — service-account JWT → access token (Web Crypto)
- [x] `src/lib/google/calendar.ts` — freeBusy / insertEvent / deleteEvent
- [x] `src/lib/booking/routing.ts` — patientType+service → calendar category
- [x] `src/lib/booking/availability.ts` — slot computation
- [x] `src/lib/booking/appointments.ts` — elevated CMS insert/update + deterministic id
- [x] `src/lib/booking/confirmation.ts` — confirmation-form submit (email + CRM)
- [x] `src/types/content.ts` — new domain types
- [x] `src/content/fallback-data.ts` — fallbacks for new collections
- [x] `src/lib/wix/data.ts` — new guarded adapters
- [x] `scripts/wix-seed.mjs` — new collections + seed rows (Appointments = ADMIN); Windows npx fix
- [x] Wix Form "Booking Confirmation" created; formId in `src/lib/wix/config.ts`
- [x] `src/pages/api/booking/availability.ts`
- [x] `src/pages/api/booking/create.ts`
- [x] `src/components/booking/BookingWizard.tsx`
- [x] `src/pages/book.astro` — two-path layout
- [x] Docs updated (`ARCHITECTURE.md`, `PROJECT_CONTEXT.md`, `DEVELOPMENT.md`)
- [ ] **PENDING USER DECISION:** owner builds Wix Automation email template; `npm run release`; commit/push
- [x] `RESULT.md` written in this directory
