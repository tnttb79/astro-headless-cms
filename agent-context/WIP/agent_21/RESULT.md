# What Was Done

Implemented the **Book Directly** flow without Wix Bookings, leaving the existing **Book through Zocdoc** path unchanged. Google Calendar is the source of truth for availability; Wix CMS holds configuration and the structured appointment record. All Google calls happen server-side; no Google credentials reach the browser.

**Decisions (confirmed with user):** service account + shared calendars (Option A); double-booking = fresh freeBusy re-check + atomic CMS deterministic-id lock; `/book` = Book Directly (primary) + Book through Zocdoc (secondary); confirmation email = Wix Automation off a lightweight Booking Confirmation form (owner builds the template). Fixed 15-minute slots; Arizona fixed −07:00 (no DST).

**Credential handling (deviation, documented):** the service-account JSON key is committed at the repo root for GitHub reproducibility (owner-accepted risk). It is read only in `src/lib/google/credentials.ts` (server-only), with an `import.meta.env`/`wix env` override preferred when present. Verified the key does **not** appear in the client bundle.

### Backend / config
- **CMS collections** added via `scripts/wix-seed.mjs` (idempotent, additive) and seeded: `BookableServices` (4), `CalendarConfig` (5, real calendar ids), `BusinessHours` (Mesa Mon–Fri 08:30–18:00, Sat 09:00–16:00), `BookingSettings` (slot 15, lead 120 min, max 45 days, cancellation text), `Closures` (empty), and `Appointments` (**ADMIN read** — holds PII). Fixed a Windows `npx`-resolution bug in the seed's token step (`shell:true`).
- **Types + fallbacks + adapters:** `src/types/content.ts`, `src/content/fallback-data.ts`, `src/lib/wix/data.ts` (guarded reads with fallbacks, matching existing conventions).
- **Booking Confirmation Wix Form** created: `23843eca-a00a-4128-b3cd-b6c192309f66` (id in `src/lib/wix/config.ts`). Contact fields render in the dashboard; appointment-detail fields (`service`, `location`, `appointment_time`, `reference_id`) are captured for the automation email. DOB/insurance/message intentionally excluded.

### Server code (never shipped to browser)
- `src/lib/google/{credentials,auth,calendar}.ts` — JWT via Web Crypto → freeBusy / insertEvent / deleteEvent.
- `src/lib/booking/{time,routing,availability,appointments,confirmation}.ts`.
- `src/pages/api/booking/availability.ts` (GET) and `create.ts` (POST): validation → fresh freeBusy revalidation → atomic `Appointments` lock (deterministic `_id`) → Google event in the mapped calendar → mark booked → confirmation form submit. Rollback releases the lock on failure.

### Frontend
- `src/components/booking/BookingWizard.tsx` — React island: patient type → service → location (Payson disabled/Coming Soon) → date → 15-min slots → form (+ cancellation policy) → success. Client validation, accessibility (focus management, error messaging), no-PII analytics.
- `src/pages/book.astro` — rewritten to two paths; Zocdoc CTA + click-to-call preserved.

### Docs
- Updated `ARCHITECTURE.md` §9, `PROJECT_CONTEXT.md` §8, `DEVELOPMENT.md` §7/§7b.

# Result

- **Runtime/Google spike:** PASSED against the live account (token, freeBusy across all busy calendars, event create+delete).
- **`npm run build`:** PASSED (30 routes). **Client-bundle scan:** no key material leaked; key only in the server bundle.
- **Live end-to-end (via `wix dev`):**
  - Availability correct — near date correctly excludes Dr. Kang's real busy events; a far date shows the full day (8:30 AM–5:45 PM). Invalid input → 400; Payson → closed.
  - Real booking → 200 (ref `MHH-…`, correct Phoenix time label); the slot then disappeared from availability; a duplicate for the same slot → **409 SLOT_TAKEN**; `Appointments` row `booked` with correct calendar routing (existing+cupping → CA_VA_HERB_ETC), event id, and PII stored in the ADMIN collection. Test Google event + CMS row were cleaned up.
  - Confirmation form submission accepted (no error; `createSubmission` throws on rejection, so a clean 200 = recorded).

# Items Left to Take Care Of

- **Owner action — build the Wix Automation** (dashboard → Automations → trigger: *Booking Confirmation form submitted* → action: *Send email*, using the form fields) to actually send confirmation emails. Until then, bookings still succeed (event + record created) but no email is sent.
- **Not released to production and not committed to git** — held for user decision. Releasing makes the booking flow live for real patients (before the automation exists). `git` also currently has the committed service-account key staged-to-be — confirm intent before committing/pushing.
- **One leftover test submission** remains in the Booking Confirmation form from the end-to-end test (no contact created; no email since no automation yet). The owner can delete it from the dashboard.
- **Optional/future:** `CalendarConfig` currently has no separate personal "busy" calendar (none was provided). `src/lib/booking.ts` (the old `DIRECT_BOOKING_PATH` constant, still used by the header) intentionally coexists with the new `src/lib/booking/` directory — resolves unambiguously, but a future cleanup could fold it in.
