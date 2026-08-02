export const ANALYTICS_EVENTS = [
  "page_view",
  "cta_click",
  "booking_click",
  "phone_click",
  "directions_click",
  "form_start",
  "form_success",
  "form_failure",
] as const;

export type AnalyticsEvent = (typeof ANALYTICS_EVENTS)[number];

export function track(event: AnalyticsEvent, section = "unknown"): void {
  if (typeof window === "undefined") return;
  const detail = { event, section };
  window.dispatchEvent(new CustomEvent("holyhill:analytics", { detail }));
  const dataLayer = (window as Window & { dataLayer?: unknown[] }).dataLayer;
  if (Array.isArray(dataLayer)) dataLayer.push({ event: `holyhill_${event}`, section });
}

export function initAnalytics(): void {
  track("page_view", document.body.dataset.pageSection || "page");
  document.addEventListener("click", (event) => {
    const target = (event.target as Element | null)?.closest<HTMLElement>("[data-analytics-event]");
    if (!target) return;
    const name = target.dataset.analyticsEvent as AnalyticsEvent;
    if (ANALYTICS_EVENTS.includes(name)) track(name, target.dataset.analyticsSection || "unknown");
  });
}

declare global {
  interface Window { dataLayer?: unknown[]; }
}
