/**
 * SERVER-ONLY. Computes bookable 15-minute slots for a location + date.
 *
 * Google Calendar is the source of truth for busy time; Wix CMS supplies the
 * config (business hours, closures, calendar ids, lead time, max advance). A
 * slot is offered only if it is inside an open window, not in the past / inside
 * the lead-time buffer, not on a closed date, and free across every "busy"
 * calendar per a FRESH freeBusy query. The create route calls this again at
 * submit time, so it is the single source of truth for availability.
 */
import {
  getBookingSettings,
  getBusinessHours,
  getCalendarConfig,
  getClosures,
  getLocations,
} from "../wix/data";
import { freeBusy } from "../google/calendar";
import {
  addDaysISO,
  minutesToTime,
  phoenixTodayISO,
  rfc3339,
  slotEpochMs,
  timeToMinutes,
  weekdayOf,
} from "./time";

export interface AvailabilityResult {
  slots: string[]; // UTC ISO slot-start instants
  slotMinutes: number;
  configPending?: boolean; // calendar ids not configured yet
  closed?: boolean; // location closed / date out of range / invalid
}

export async function computeAvailableSlots(
  dateISO: string,
  locationSlug: string,
): Promise<AvailabilityResult> {
  const [settings, locations, calConfig, hours, closures] = await Promise.all([
    getBookingSettings(),
    getLocations(),
    getCalendarConfig(),
    getBusinessHours(locationSlug),
    getClosures(locationSlug),
  ]);
  const slotMinutes = settings.slotMinutes || 15;
  const empty = (extra: Partial<AvailabilityResult> = {}): AvailabilityResult => ({ slots: [], slotMinutes, ...extra });

  const loc = locations.find((l) => l.slug === locationSlug);
  if (!loc || loc.status !== "open" || !loc.active) return empty({ closed: true });

  const today = phoenixTodayISO();
  const maxDate = addDaysISO(today, settings.maxAdvanceDays);
  if (dateISO < today || dateISO > maxDate) return empty({ closed: true });

  if (closures.some((c) => dateISO >= c.startDate && dateISO <= c.endDate)) return empty({ closed: true });

  const weekday = weekdayOf(dateISO);
  const windows = hours.filter((h) => h.weekday === weekday && h.active);
  if (!windows.length) return empty({ closed: true });

  const busyCalendarIds = calConfig
    .filter((c) => c.countsAsBusy && c.active && c.googleCalendarId)
    .map((c) => c.googleCalendarId);
  if (!busyCalendarIds.length) return empty({ configPending: true });

  // Fresh busy data for the whole Phoenix day. Let errors propagate so the
  // caller returns a 503 rather than silently offering unverified slots.
  const dayStart = rfc3339(dateISO, "00:00");
  const dayEnd = rfc3339(addDaysISO(dateISO, 1), "00:00");
  const busy = await freeBusy(busyCalendarIds, dayStart, dayEnd);

  const minStartMs = Date.now() + settings.minLeadMinutes * 60_000;
  const seen = new Set<string>();
  const slots: string[] = [];
  for (const w of windows) {
    const openMin = timeToMinutes(w.openTime);
    const closeMin = timeToMinutes(w.closeTime);
    for (let m = openMin; m + slotMinutes <= closeMin; m += slotMinutes) {
      const startMs = slotEpochMs(dateISO, minutesToTime(m));
      const endMs = startMs + slotMinutes * 60_000;
      if (startMs < minStartMs) continue;
      if (busy.some((b) => startMs < b.end && b.start < endMs)) continue;
      const iso = new Date(startMs).toISOString();
      if (seen.has(iso)) continue;
      seen.add(iso);
      slots.push(iso);
    }
  }
  slots.sort();
  return { slots, slotMinutes };
}
