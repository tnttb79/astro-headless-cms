# Goal

Add a clinic-facing email notification data path for every successfully created direct booking, addressed to `marinholyhillacu@gmail.com`, including the patient contact and booking details plus the reservation-created date.

# Plan

1. Preserve the existing Google Calendar booking and patient-confirmation behavior.
2. Reuse the existing admin-only `BookingEmails` collection, which is already inserted only after the Google Calendar booking succeeds, and extend its record with the clinic-safe patient and creation-time fields.
3. Keep DOB, insurance ID, and free-text medical notes out of the email workflow.
4. Extend the idempotent Wix seed migration with the exact additional fields, including two existing runtime fields that were missing from the declared schema.
5. Add focused tests if the repository has an established test setup; otherwise validate with TypeScript, Wix build, and Wix preview.
6. Document the one manual Wix Automation step required to turn each added notification record into an email to the clinic.

Assumptions: the clinic wants an operational notification rather than a second source of truth; Google Calendar remains authoritative. The notification is best-effort so an email outage must not invalidate a confirmed appointment. The clinic email will include patient name, email, phone, patient type, service, location, appointment time, booking-created time, and reference ID. Sensitive DOB, insurance details, and free-text messages remain in the admin-only `Appointments` record and are not copied into email.
