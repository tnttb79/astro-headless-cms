# What Was Done

- Added a `--schema-only` option to `scripts/wix-seed.mjs` so collection schema changes can be applied without rewriting live CMS content.
- Applied the schema-only migration to Wix site `c68648ed-1577-4028-86b1-7312970b1945`.
- Added the live `BookingEmails` fields `patientName`, `patientPhone`, `patientType`, and `reservationCreatedAt`.
- Confirmed a second schema-only run made no further changes.
- Released the validated application build with `npx wix release`.
- Verified the production `/book` route and booking availability API after release.

# Result

Wix reported “Site published on marinholyhillacu.com.” The live booking page resolves to `https://www.marinholyhillacu.com/book` and returns HTTP 200. The live availability endpoint returns the expected HTTP 400 validation response when called without required parameters. The released server bundle contains the new `patientPhone` and `reservationCreatedAt` booking-email fields.

The deployment and CMS schema are ready for a real booking test. No synthetic booking was submitted because that would create a real Google Calendar appointment.

# Items Left to Take Care Of

- Configure and activate the Wix Automation email action for the `BookingEmails` “Item added” trigger, with `marinholyhillacu@gmail.com` as the clinic recipient. Until that dashboard-only action is active, bookings will save the notification data but the clinic email will not be sent.
- Submit one controlled real booking and confirm both the Google Calendar event and clinic email after the Automation is active.
