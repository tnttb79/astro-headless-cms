/**
 * SERVER-ONLY. Thin Google Calendar REST client (freeBusy + create/delete
 * event). All times are RFC3339 strings with an explicit offset; callers build
 * them via src/lib/booking/time.ts (Arizona = fixed -07:00).
 */
import { getAccessToken } from "./auth";

const BASE = "https://www.googleapis.com/calendar/v3";
const TIME_ZONE = "America/Phoenix";

export interface BusyInterval { start: number; end: number } // epoch ms

/**
 * Merged busy intervals across the given calendars for [timeMin, timeMax).
 * Calendars that return an error (e.g. unshared) are skipped with a warning so
 * one bad id never blocks the whole availability calculation.
 */
export async function freeBusy(
  calendarIds: string[],
  timeMinRfc3339: string,
  timeMaxRfc3339: string,
): Promise<BusyInterval[]> {
  if (!calendarIds.length) return [];
  const token = await getAccessToken();
  const res = await fetch(`${BASE}/freeBusy`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      timeMin: timeMinRfc3339,
      timeMax: timeMaxRfc3339,
      timeZone: TIME_ZONE,
      items: calendarIds.map((id) => ({ id })),
    }),
  });
  if (!res.ok) throw new Error(`Google freeBusy failed (${res.status}).`);
  const json = (await res.json()) as {
    calendars?: Record<string, { busy?: { start: string; end: string }[]; errors?: unknown[] }>;
  };
  const intervals: BusyInterval[] = [];
  for (const [id, cal] of Object.entries(json.calendars ?? {})) {
    if (cal.errors?.length) {
      console.warn(`[google] freeBusy calendar unavailable: ${id}`);
      continue;
    }
    for (const b of cal.busy ?? []) {
      intervals.push({ start: Date.parse(b.start), end: Date.parse(b.end) });
    }
  }
  return intervals;
}

export interface EventInput {
  summary: string;
  description: string;
  startRfc3339: string;
  endRfc3339: string;
}

/** Creates an event in the target calendar; returns the new event id. */
export async function insertEvent(calendarId: string, ev: EventInput): Promise<string> {
  const token = await getAccessToken();
  const res = await fetch(`${BASE}/calendars/${encodeURIComponent(calendarId)}/events`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      summary: ev.summary,
      description: ev.description,
      start: { dateTime: ev.startRfc3339, timeZone: TIME_ZONE },
      end: { dateTime: ev.endRfc3339, timeZone: TIME_ZONE },
    }),
  });
  if (!res.ok) throw new Error(`Google event insert failed (${res.status}).`);
  const json = (await res.json()) as { id: string };
  return json.id;
}

/** Best-effort delete (used to release a slot if a later step fails). */
export async function deleteEvent(calendarId: string, eventId: string): Promise<void> {
  const token = await getAccessToken();
  const res = await fetch(
    `${BASE}/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}`,
    { method: "DELETE", headers: { Authorization: `Bearer ${token}` } },
  );
  // 410 = already gone; treat as success.
  if (!(res.ok || res.status === 204 || res.status === 410)) {
    throw new Error(`Google event delete failed (${res.status}).`);
  }
}
