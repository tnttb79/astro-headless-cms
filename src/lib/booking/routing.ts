/**
 * Which color-coded Google Calendar a new website booking is written to. The
 * category NAMES are stable and live here; the actual calendar IDs live in the
 * CalendarConfig CMS collection (category -> googleCalendarId). This preserves
 * Dr. Kang's existing color workflow — we create the event in the right
 * calendar rather than inventing a separate color system.
 *
 * Mapping (confirmed):
 *   first-time (any service)      -> NEW_PATIENT
 *   existing + acupuncture        -> ACUPUNCTURE
 *   existing + cupping/herbal/met -> CA_VA_HERB_ETC
 *
 * We never write to INSURANCE, RESCHEDULE, CANCELLATION, or NO_SHOW.
 */
export type PatientType = "first_time" | "existing";
export type ServiceKey = "acupuncture" | "cupping" | "herbal" | "met";

export function calendarCategoryFor(patientType: PatientType, service: ServiceKey): string {
  if (patientType === "first_time") return "NEW_PATIENT";
  if (service === "acupuncture") return "ACUPUNCTURE";
  return "CA_VA_HERB_ETC"; // cupping | herbal | met
}
