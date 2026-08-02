/**
 * Stable frontend domain types. Pages bind to these, never to raw Wix response
 * shapes, so the Wix Data adapters can change without touching page components.
 */

export interface SiteSettings {
  businessName: string;
  doctorName: string;
  phone: string;
  email: string;
  address: string;
  weekdayHours: string;
  saturdayHours: string;
  sundayHours: string;
  bookingUrl: string;
  medicalDisclaimer: string;
}

export interface Treatment {
  id: string;
  title: string;
  slug: string;
  category: string;
  shortDescription: string;
  /** HTML string (from a Wix RICH_TEXT field). */
  description: string;
  /** HTML string (from a Wix RICH_TEXT field). */
  benefits: string;
  price: string;
  duration: string;
  displayOrder: number;
  featured: boolean;
}

export interface Condition {
  id: string;
  title: string;
  slug: string;
  category: string;
  summary: string;
  /** HTML string (from a Wix RICH_TEXT field). */
  description: string;
  displayOrder: number;
  featured: boolean;
}
