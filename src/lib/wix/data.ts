/**
 * Wix CMS (Wix Data) access boundary.
 *
 * On Wix-managed Astro authentication is ambient — we import the `items` module
 * and call it directly (no client, no clientId, no auth.elevate). Collections are
 * public-read, so the visitor token reads them.
 *
 * Every call is guarded (try/catch) so a failed SDK call degrades to an empty/
 * fallback value instead of white-screening the page (astro.md Caveat A3).
 */
import { items } from "@wix/data";
import type { Condition, SiteSettings, Treatment } from "../../types/content";

const COLLECTIONS = {
  treatments: "Treatments",
  conditions: "Conditions",
  siteSettings: "SiteSettings",
} as const;

/** A Wix RICH_TEXT field seeded with an HTML string reads back as that string. */
function asHtml(value: unknown): string {
  if (typeof value === "string") return value;
  return "";
}

function toTreatment(item: any): Treatment {
  return {
    id: item._id,
    title: item.title ?? "",
    slug: item.slug ?? "",
    category: item.category ?? "",
    shortDescription: item.shortDescription ?? "",
    description: asHtml(item.description),
    benefits: asHtml(item.benefits),
    price: item.price ?? "",
    duration: item.duration ?? "",
    displayOrder: item.displayOrder ?? 0,
    featured: item.featured ?? false,
  };
}

function toCondition(item: any): Condition {
  return {
    id: item._id,
    title: item.title ?? "",
    slug: item.slug ?? "",
    category: item.category ?? "",
    summary: item.summary ?? "",
    description: asHtml(item.description),
    displayOrder: item.displayOrder ?? 0,
    featured: item.featured ?? false,
  };
}

const FALLBACK_SETTINGS: SiteSettings = {
  businessName: "Marin Holy Hill Acupuncture Clinic",
  doctorName: "Dr. Hyo-won Henry Kang",
  phone: "(480) 730-4991",
  email: "marinholyhillacu@gmail.com",
  address: "1933 W. Main Street, Suite 1, Mesa, AZ 85201",
  weekdayHours: "Mon–Fri: 8:30 AM – 6:00 PM",
  saturdayHours: "Sat: 9:00 AM – 4:00 PM",
  sundayHours: "Sun: Closed",
  bookingUrl: "/contact",
  medicalDisclaimer:
    "The information on this website is for general education only and is not a substitute for professional medical advice, diagnosis, or treatment.",
};

export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const { items: rows } = await items.query(COLLECTIONS.siteSettings).limit(1).find();
    const row: any = rows[0];
    if (!row) return FALLBACK_SETTINGS;
    return {
      businessName: row.businessName ?? FALLBACK_SETTINGS.businessName,
      doctorName: row.doctorName ?? FALLBACK_SETTINGS.doctorName,
      phone: row.phone ?? FALLBACK_SETTINGS.phone,
      email: row.email ?? FALLBACK_SETTINGS.email,
      address: row.address ?? FALLBACK_SETTINGS.address,
      weekdayHours: row.weekdayHours ?? FALLBACK_SETTINGS.weekdayHours,
      saturdayHours: row.saturdayHours ?? FALLBACK_SETTINGS.saturdayHours,
      sundayHours: row.sundayHours ?? FALLBACK_SETTINGS.sundayHours,
      bookingUrl: row.bookingUrl ?? FALLBACK_SETTINGS.bookingUrl,
      medicalDisclaimer: row.medicalDisclaimer ?? FALLBACK_SETTINGS.medicalDisclaimer,
    };
  } catch (err) {
    console.error("[wix] getSiteSettings failed:", err);
    return FALLBACK_SETTINGS;
  }
}

export async function getTreatments(): Promise<Treatment[]> {
  try {
    const { items: rows } = await items
      .query(COLLECTIONS.treatments)
      .ascending("displayOrder")
      .limit(50)
      .find();
    return rows.map(toTreatment);
  } catch (err) {
    console.error("[wix] getTreatments failed:", err);
    return [];
  }
}

export async function getTreatmentBySlug(slug: string): Promise<Treatment | null> {
  try {
    const { items: rows } = await items
      .query(COLLECTIONS.treatments)
      .eq("slug", slug)
      .limit(1)
      .find();
    return rows[0] ? toTreatment(rows[0]) : null;
  } catch (err) {
    console.error("[wix] getTreatmentBySlug failed:", err);
    return null;
  }
}

export async function getConditions(): Promise<Condition[]> {
  try {
    const { items: rows } = await items
      .query(COLLECTIONS.conditions)
      .ascending("displayOrder")
      .limit(50)
      .find();
    return rows.map(toCondition);
  } catch (err) {
    console.error("[wix] getConditions failed:", err);
    return [];
  }
}
