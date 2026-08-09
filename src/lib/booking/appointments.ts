/**
 * SERVER-ONLY. Writes to the ADMIN-only `Appointments` collection via
 * `auth.elevate` (visitor tokens can't write it). The deterministic per-slot
 * `_id` is the concurrency lock: two website requests for the same
 * location+slot produce the same `_id`, so the second `insert` fails with a
 * duplicate error — that's how we detect a race (see PLAN.md §7/§9).
 */
import { items } from "@wix/data";
import { auth } from "@wix/essentials";

const COLLECTION = "Appointments";

/** UUID-format id derived from location + slot start (stable per slot). */
export async function deterministicAppointmentId(locationSlug: string, startUtcIso: string): Promise<string> {
  const hash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`${locationSlug}|${startUtcIso}`));
  const b = new Uint8Array(hash);
  const hex = [...b].map((x) => x.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-5${hex.slice(13, 16)}-a${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
}

export interface AppointmentRecord {
  _id: string;
  patientType: string;
  service: string;
  location: string;
  name: string;
  email: string;
  phone: string;
  insuranceCompany: string;
  insuranceId: string;
  dateOfBirth: string;
  message: string;
  startTime: string; // UTC ISO
  endTime: string; // UTC ISO
  googleCalendarId: string;
  googleEventId: string;
  status: string;
  referenceId: string;
  createdAt: string; // UTC ISO
}

// A fresh `pending` row (younger than this) means another booking is genuinely
// mid-flight for this slot. Older pending rows are treated as orphaned.
const PENDING_TTL_MS = 5 * 60 * 1000;

/**
 * Reserves the slot's lock row. Returns `{ ok: true }` when reserved — either a
 * clean insert, or by TAKING OVER a stale row from a prior booking whose Google
 * event was later deleted or moved. (freeBusy is checked immediately before
 * this call and the write-target calendars are all in the busy set, so if a
 * live event still occupied the slot we would have rejected upstream — reaching
 * a duplicate `_id` here means the existing row is almost certainly stale.)
 *
 * Returns `{ conflict: true }` only when a *fresh* `pending` row shows another
 * request is actively booking the same slot right now (the real race we guard).
 */
export async function insertPendingAppointment(
  record: AppointmentRecord,
): Promise<{ ok: true } | { ok: false; conflict: boolean }> {
  try {
    await auth.elevate(items.insert)(COLLECTION, record);
    return { ok: true };
  } catch (err) {
    const msg = String((err as { message?: string })?.message ?? err).toLowerCase();
    const isDuplicate = msg.includes("already exists") || msg.includes("wde0074") || msg.includes("duplicate");
    if (!isDuplicate) {
      console.error("[booking] appointment insert failed", err);
      return { ok: false, conflict: false };
    }
    try {
      const existing = (await auth.elevate(items.get)(COLLECTION, record._id)) as any;
      const data = existing?.data ?? existing; // tolerate either SDK shape
      const createdAt = Date.parse(data?.createdAt ?? "");
      const freshPending = data?.status === "pending" && Number.isFinite(createdAt) && Date.now() - createdAt < PENDING_TTL_MS;
      if (freshPending) return { ok: false, conflict: true }; // genuine concurrent booking — let it win
      // Stale lock (deleted/moved event, or orphaned pending): take it over.
      await auth.elevate(items.update)(COLLECTION, record);
      return { ok: true };
    } catch (e) {
      console.error("[booking] slot take-over check failed", e);
      return { ok: false, conflict: true };
    }
  }
}

/** Promote the row to `booked` with the Google event details. */
export async function markAppointmentBooked(
  record: AppointmentRecord,
  google: { googleCalendarId: string; googleEventId: string },
): Promise<void> {
  const elevatedUpdate = auth.elevate(items.update);
  // items.update REPLACES the whole item — pass the full record.
  await elevatedUpdate(COLLECTION, { ...record, ...google, status: "booked" });
}

/**
 * Releases the lock row so the slot can be booked again. Called when a later
 * step (Google event creation) fails after the lock was taken. Best-effort.
 */
export async function releaseAppointment(id: string): Promise<void> {
  try {
    const elevatedRemove = auth.elevate(items.remove);
    await elevatedRemove(COLLECTION, id);
  } catch (err) {
    console.error("[booking] failed to release appointment lock", err);
  }
}
