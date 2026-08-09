/**
 * Time helpers for the booking flow. The clinic is in Arizona, which does NOT
 * observe DST, so America/Phoenix is a FIXED UTC-07:00 offset year-round. That
 * lets us build slot timestamps with a constant offset instead of DST math.
 *
 * If the clinic ever opens a location in a DST-observing timezone, this is the
 * one file to change (switch to Intl/Temporal-based offset resolution).
 */
export const PHOENIX_OFFSET = "-07:00";
const PHOENIX_OFFSET_MS = 7 * 60 * 60 * 1000;
export const PHOENIX_TZ = "America/Phoenix";

/** RFC3339 timestamp for a Phoenix-local date + "HH:mm" (e.g. 2026-08-10T14:15:00-07:00). */
export function rfc3339(dateISO: string, time: string): string {
  return `${dateISO}T${time}:00${PHOENIX_OFFSET}`;
}

/** Epoch ms for a Phoenix-local date + "HH:mm". */
export function slotEpochMs(dateISO: string, time: string): number {
  return Date.parse(rfc3339(dateISO, time));
}

/** Weekday (0=Sun..6=Sat) of a Phoenix-local calendar date. */
export function weekdayOf(dateISO: string): number {
  // Noon Phoenix stays on the same calendar day in UTC; getUTCDay is stable.
  return new Date(`${dateISO}T12:00:00${PHOENIX_OFFSET}`).getUTCDay();
}

/** Today's date (YYYY-MM-DD) in Phoenix local time. */
export function phoenixTodayISO(): string {
  return new Date(Date.now() - PHOENIX_OFFSET_MS).toISOString().slice(0, 10);
}

/** Add whole days to a YYYY-MM-DD date, returning YYYY-MM-DD. */
export function addDaysISO(dateISO: string, days: number): string {
  const d = new Date(`${dateISO}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** "HH:mm" of a minute-of-day value. */
export function minutesToTime(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** "HH:mm" -> minutes since midnight. */
export function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map((n) => parseInt(n, 10));
  return h * 60 + m;
}

const DATE_ISO_RE = /^\d{4}-\d{2}-\d{2}$/;
export function isValidDateISO(v: unknown): v is string {
  return typeof v === "string" && DATE_ISO_RE.test(v) && !Number.isNaN(Date.parse(`${v}T12:00:00Z`));
}

/** Phoenix-local calendar date (YYYY-MM-DD) of a UTC ISO instant. */
export function phoenixDateISOOf(utcIso: string): string {
  const d = new Date(utcIso);
  if (Number.isNaN(d.getTime())) return "";
  // en-CA formats as YYYY-MM-DD.
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: PHOENIX_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

/** Human-friendly Phoenix label for a UTC ISO instant (for emails/confirmation). */
export function formatPhoenixLabel(utcIso: string): string {
  const d = new Date(utcIso);
  if (Number.isNaN(d.getTime())) return utcIso;
  return new Intl.DateTimeFormat("en-US", {
    timeZone: PHOENIX_TZ,
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(d);
}
