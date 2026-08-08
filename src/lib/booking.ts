import type { Location } from "../types/content";

export const DIRECT_BOOKING_PATH = "/book";

export interface DirectBookingOption {
  available: boolean;
  href?: string;
}

export function getDirectBookingOption(location: Location): DirectBookingOption {
  if (location.status !== "open" || !location.phone) return { available: false };
  return { available: true, href: `tel:${location.phone.replace(/[^\d+]/g, "")}` };
}
