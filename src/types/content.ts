export interface SiteSettings {
  businessName: string;
  doctorName: string;
  yearsExperience: number;
  phone: string;
  email: string;
  bookingUrl: string;
  medicalDisclaimer: string;
}

export interface Treatment {
  id: string;
  title: string;
  slug: string;
  category: string;
  serviceGroup: "core" | "specialized";
  shortDescription: string;
  description: string;
  howItWorks: string;
  indications: string;
  benefits: string;
  imagePath: string;
  price: string;
  duration: string;
  seoTitle: string;
  seoDescription: string;
  displayOrder: number;
  featured: boolean;
  published: boolean;
}

export interface Condition {
  id: string;
  title: string;
  slug: string;
  category: string;
  summary: string;
  description: string;
  displayOrder: number;
  featured: boolean;
  published: boolean;
}

export interface Location {
  id: string;
  name: string;
  slug: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  phone: string;
  email: string;
  weekdayHours: string;
  saturdayHours: string;
  sundayHours: string;
  mapUrl: string;
  directionsUrl: string;
  status: "open" | "opening_soon";
  displayOrder: number;
  active: boolean;
}

export interface InsuranceProvider {
  id: string;
  providerName: string;
  coverageNote: string;
  networkStatus: "in_network" | "welcomed" | "verify";
  displayOrder: number;
  active: boolean;
  verifiedDate: string;
}

export interface PricingItem {
  id: string;
  serviceName: string;
  category: string;
  price: string;
  priceNote: string;
  displayOrder: number;
  active: boolean;
}

export interface Testimonial {
  id: string;
  patientDisplayName: string;
  quote: string;
  sourceNote: string;
  consentConfirmed: boolean;
  displayOrder: number;
  published: boolean;
}

// ── Direct-booking domain types ────────────────────────────────────────────
// Backing collections and behavior are documented in
// agent-context/WIP/agent_21/PLAN.md. All maintainable values are CMS-driven.

/** A service a patient can pick in the Book Directly wizard. */
export interface BookableService {
  id: string;
  key: string; // "acupuncture" | "cupping" | "herbal" | "met"
  label: string;
  allowsFirstTime: boolean;
  allowsExisting: boolean;
  displayOrder: number;
  active: boolean;
}

/** Maps an internal calendar category to a real Google Calendar id + role. */
export interface CalendarConfigEntry {
  id: string;
  category: string; // "NEW_PATIENT" | "ACUPUNCTURE" | "CA_VA_HERB_ETC" | "INSURANCE" | "RESCHEDULE" | "PERSONAL"
  label: string;
  googleCalendarId: string;
  countsAsBusy: boolean; // included in freeBusy availability checks
  active: boolean;
  displayOrder: number;
}

/** One open window for a location on a given weekday (Phoenix local time). */
export interface BusinessHour {
  id: string;
  location: string; // location slug
  weekday: number; // 0=Sun .. 6=Sat
  openTime: string; // "HH:mm"
  closeTime: string; // "HH:mm"
  active: boolean;
}

/** A holiday or manual closed-date exception. */
export interface Closure {
  id: string;
  location: string; // location slug or "all"
  startDate: string; // "YYYY-MM-DD" (inclusive)
  endDate: string; // "YYYY-MM-DD" (inclusive)
  reason: string;
  active: boolean;
}

/** Global booking behavior; editable in the Wix dashboard. */
export interface BookingSettings {
  slotMinutes: number;
  minLeadMinutes: number;
  maxAdvanceDays: number;
  cancellationPolicyText: string;
}

/** A structured website booking record (ADMIN-read; contains PII). */
export interface Appointment {
  id: string;
  patientType: string; // "first_time" | "existing"
  service: string; // BookableService.key
  location: string; // location slug
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
  status: string; // "pending" | "booked" | "failed" | "cancelled"
  referenceId: string;
  createdAt: string; // UTC ISO
}
