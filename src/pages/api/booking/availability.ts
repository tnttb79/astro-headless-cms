import type { APIRoute } from "astro";
import { computeAvailableSlots } from "../../../lib/booking/availability";
import { isValidDateISO } from "../../../lib/booking/time";

export const prerender = false;

/**
 * Returns bookable 15-minute slot starts (UTC ISO) for a location + date.
 * Read-only, no PII: only free start times and slot length are returned.
 * Availability is recomputed from a FRESH Google freeBusy on every call.
 */
export const GET: APIRoute = async ({ url }) => {
  const date = url.searchParams.get("date");
  const location = url.searchParams.get("location");

  if (!isValidDateISO(date) || !location || !/^[a-z0-9-]{1,40}$/.test(location)) {
    return json({ ok: false, error: "Invalid request." }, 400);
  }

  try {
    const result = await computeAvailableSlots(date, location);
    return json({ ok: true, ...result });
  } catch (err) {
    console.error("[booking] availability failed", err);
    return json({ ok: false, error: "Availability is temporarily unavailable. Please try again or call us." }, 503);
  }
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}
