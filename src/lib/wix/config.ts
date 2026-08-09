/**
 * Structural IDs the frontend needs to bind to the Wix backend.
 * Content itself is discovered live via queries; only these schema-level
 * identifiers are carried in code.
 */

// Wix Forms — the seeded "Contact" form. Fields are read live from the schema.
export const CONTACT_FORM_ID = "ef70c223-ff89-4a90-a784-9de20cc87b69";

// DEPRECATED — no longer used. The direct-booking confirmation email is now
// driven by the `BookingEmails` CMS collection ("Item added" Automation), not
// this form, because Wix Form *custom* fields (service/location/time/ref) can't
// be inserted into an Automation email. Kept only for reference; the form and
// its old submissions can be deleted from the dashboard. See
// src/lib/booking/confirmation.ts.
export const BOOKING_CONFIRMATION_FORM_ID = "23843eca-a00a-4128-b3cd-b6c192309f66";
