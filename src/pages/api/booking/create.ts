import type { APIRoute } from "astro";
import { getBookableServices, getCalendarConfig, getLocations } from "../../../lib/wix/data";
import { computeAvailableSlots } from "../../../lib/booking/availability";
import { calendarCategoryFor, type PatientType, type ServiceKey } from "../../../lib/booking/routing";
import { deterministicAppointmentId, insertPendingAppointment, markAppointmentBooked, releaseAppointment, type AppointmentRecord } from "../../../lib/booking/appointments";
import { insertEvent } from "../../../lib/google/calendar";
import { sendBookingConfirmation } from "../../../lib/booking/confirmation";
import { formatPhoenixLabel, phoenixDateISOOf } from "../../../lib/booking/time";

export const prerender = false;

const PATIENT_TYPES: PatientType[] = ["first_time", "existing"];

/**
 * Books a direct appointment. Order (see PLAN.md §9):
 *  1. validate input           2. revalidate slot is still free (fresh freeBusy)
 *  3. atomic CMS lock (pending) 4. create Google event in the mapped calendar
 *  5. mark record booked        6. submit confirmation form (email + CRM)
 * Any failure after the lock releases it so the slot reopens.
 *
 * Privacy: request bodies are never logged. The calendar event carries the
 * FULL booking details by owner decision — Dr. Kang uses Google Calendar as the
 * main dashboard. The confirmation FORM/email path stays minimal
 * (name/email/phone/service/location/time/ref) — DOB/insurance/message are
 * never sent to the email/CRM path.
 */
export const POST: APIRoute = async ({ request }) => {
  if (Number(request.headers.get("content-length") ?? 0) > 32_768) {
    return json({ ok: false, error: "Request is too large." }, 413);
  }
  let payload: Record<string, unknown>;
  try {
    payload = await request.json();
  } catch {
    return json({ ok: false, error: "Invalid request." }, 400);
  }
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return json({ ok: false, error: "Invalid request." }, 400);
  }

  const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");
  const patientType = str(payload.patientType) as PatientType;
  const service = str(payload.service) as ServiceKey;
  const location = str(payload.location);
  const slotStart = str(payload.slotStart);
  const form = {
    name: str(payload.name),
    email: str(payload.email),
    phone: str(payload.phone),
    insuranceCompany: str(payload.insuranceCompany),
    insuranceId: str(payload.insuranceId),
    dateOfBirth: str(payload.dateOfBirth),
    message: str(payload.message),
  };

  // ── Field validation ──
  const fieldErrors: Record<string, string> = {};
  if (!PATIENT_TYPES.includes(patientType)) fieldErrors.patientType = "Please choose a patient type.";
  if (form.name.length < 2 || form.name.length > 80) fieldErrors.name = "Please enter your name.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) || form.email.length > 254) fieldErrors.email = "Please enter a valid email address.";
  if (!/^\+?[\d().\-\s]{7,40}$/.test(form.phone)) fieldErrors.phone = "Please enter a valid phone number.";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(form.dateOfBirth)) fieldErrors.dateOfBirth = "Please enter your date of birth.";
  if (form.insuranceCompany.length > 120) fieldErrors.insuranceCompany = "Insurance company is too long.";
  if (form.insuranceId.length > 60) fieldErrors.insuranceId = "Insurance ID is too long.";
  if (form.message.length > 2000) fieldErrors.message = "Message is too long.";
  if (Object.keys(fieldErrors).length) return json({ ok: false, error: "Please correct the highlighted fields.", fieldErrors }, 422);

  // ── Service / location validation (CMS-driven) ──
  const [services, locations, calConfig] = await Promise.all([getBookableServices(), getLocations(), getCalendarConfig()]);
  const svc = services.find((s) => s.key === service && s.active);
  const loc = locations.find((l) => l.slug === location && l.status === "open" && l.active);
  if (!svc) return json({ ok: false, error: "That service isn't available to book online." }, 400);
  if (!loc) return json({ ok: false, error: "That location isn't available to book online." }, 400);
  if (patientType === "first_time" && !svc.allowsFirstTime) return json({ ok: false, error: "That service isn't available for a first visit." }, 400);
  if (patientType === "existing" && !svc.allowsExisting) return json({ ok: false, error: "That service isn't available for returning patients." }, 400);

  const dateISO = phoenixDateISOOf(slotStart);
  if (!dateISO) return json({ ok: false, error: "Invalid appointment time." }, 400);

  // ── Revalidate the slot against a FRESH availability computation ──
  let availability;
  try {
    availability = await computeAvailableSlots(dateISO, location);
  } catch (err) {
    console.error("[booking] revalidation failed", err);
    return json({ ok: false, error: "We couldn't confirm that time. Please try again or call us." }, 503);
  }
  if (availability.configPending) {
    return json({ ok: false, error: "Online booking is being set up. Please call us to book." }, 503);
  }
  if (!availability.slots.includes(slotStart)) {
    return json({ ok: false, code: "SLOT_TAKEN", error: "That time was just taken. Please choose another slot." }, 409);
  }

  const slotMinutes = availability.slotMinutes;
  const endTime = new Date(Date.parse(slotStart) + slotMinutes * 60_000).toISOString();

  // ── Resolve target calendar ──
  const category = calendarCategoryFor(patientType, service);
  const calEntry = calConfig.find((c) => c.category === category && c.active && c.googleCalendarId);
  if (!calEntry) {
    return json({ ok: false, error: "Online booking is being set up. Please call us to book." }, 503);
  }

  // ── Atomic CMS lock (deterministic id per slot) ──
  const id = await deterministicAppointmentId(location, slotStart);
  const referenceId = makeReferenceId();
  const record: AppointmentRecord = {
    _id: id,
    patientType,
    service,
    location,
    name: form.name,
    email: form.email,
    phone: form.phone,
    insuranceCompany: form.insuranceCompany,
    insuranceId: form.insuranceId,
    dateOfBirth: form.dateOfBirth,
    message: form.message,
    startTime: slotStart,
    endTime,
    googleCalendarId: "",
    googleEventId: "",
    status: "pending",
    referenceId,
    createdAt: new Date().toISOString(),
  };
  const lock = await insertPendingAppointment(record);
  if (!lock.ok) {
    if (lock.conflict) return json({ ok: false, code: "SLOT_TAKEN", error: "That time was just taken. Please choose another slot." }, 409);
    return json({ ok: false, error: "Something went wrong. Please try again or call us." }, 500);
  }

  // ── Create the Google Calendar event in the correct color-coded calendar ──
  const patientLabel = patientType === "first_time" ? "New patient" : "Existing patient";
  let eventId: string;
  try {
    eventId = await insertEvent(calEntry.googleCalendarId, {
      summary: `${form.name} — ${svc.label} (${patientType === "first_time" ? "New" : "Existing"})`,
      description: [
        `Patient type: ${patientLabel}`,
        `Service: ${svc.label}`,
        `Location: ${loc.name}`,
        `Phone: ${form.phone}`,
        `Email: ${form.email}`,
        `Date of birth: ${form.dateOfBirth}`,
        ...(form.insuranceCompany ? [`Insurance company: ${form.insuranceCompany}`] : []),
        ...(form.insuranceId ? [`Insurance ID: ${form.insuranceId}`] : []),
        ...(form.message ? [`Message: ${form.message}`] : []),
        `Website ref: ${referenceId}`,
      ].join("\n"),
      startRfc3339: slotStart, // UTC instant; unambiguous with America/Phoenix tz
      endRfc3339: endTime,
    });
  } catch (err) {
    console.error("[booking] calendar event creation failed", err);
    await releaseAppointment(id); // free the slot again
    return json({ ok: false, error: "We couldn't complete the booking. Please try again or call us." }, 502);
  }

  // ── Promote record to booked (best-effort — the calendar event is authoritative) ──
  try {
    await markAppointmentBooked(record, { googleCalendarId: calEntry.googleCalendarId, googleEventId: eventId });
  } catch (err) {
    console.error("[booking] failed to mark appointment booked (event exists)", err);
  }

  // ── Confirmation email (best-effort; drives the Wix Automation) ──
  await sendBookingConfirmation({
    firstName: form.name.split(/\s+/)[0] || form.name,
    email: form.email,
    service: svc.label,
    location: loc.name,
    appointmentTime: formatPhoenixLabel(slotStart),
    referenceId,
    clinicPhone: loc.phone,
    clinicAddress: [loc.addressLine1, loc.addressLine2, `${loc.city}, ${loc.state} ${loc.postalCode}`]
      .filter(Boolean)
      .join(", "),
  });

  return json({
    ok: true,
    referenceId,
    startTime: slotStart,
    endTime,
    slotMinutes,
    service: svc.label,
    location: loc.name,
    appointmentTime: formatPhoenixLabel(slotStart),
  });
};

function makeReferenceId(): string {
  const t = Date.now().toString(36).toUpperCase().slice(-5);
  const r = Math.random().toString(36).toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 3).padEnd(3, "X");
  return `MHH-${t}${r}`;
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}
