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
