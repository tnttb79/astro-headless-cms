import { items } from "@wix/data";
import type { BookableService, BookingSettings, BusinessHour, CalendarConfigEntry, Closure, Condition, InsuranceProvider, Location, PricingItem, SiteSettings, Testimonial, Treatment } from "../../types/content";
import { FALLBACK_BOOKABLE_SERVICES, FALLBACK_BOOKING_SETTINGS, FALLBACK_BUSINESS_HOURS, FALLBACK_CALENDAR_CONFIG, FALLBACK_CLOSURES, FALLBACK_CONDITIONS, FALLBACK_INSURANCE, FALLBACK_LOCATIONS, FALLBACK_PRICING, FALLBACK_SETTINGS, FALLBACK_TREATMENTS } from "../../content/fallback-data";

const COLLECTIONS = {
  treatments: "Treatments", conditions: "Conditions", siteSettings: "SiteSettings", locations: "Locations",
  insurance: "InsuranceProviders", pricing: "Pricing", testimonials: "Testimonials",
  bookableServices: "BookableServices", calendarConfig: "CalendarConfig", businessHours: "BusinessHours",
  closures: "Closures", bookingSettings: "BookingSettings",
} as const;

const text = (value: unknown): string => typeof value === "string" ? value : "";
const number = (value: unknown, fallback = 0): number => typeof value === "number" ? value : fallback;
const bool = (value: unknown, fallback = false): boolean => typeof value === "boolean" ? value : fallback;

function toTreatment(item: any): Treatment {
  return { id:text(item._id), title:text(item.title), slug:text(item.slug), category:text(item.category), serviceGroup:item.serviceGroup === "specialized" ? "specialized" : "core", shortDescription:text(item.shortDescription), description:text(item.description), howItWorks:text(item.howItWorks), indications:text(item.indications), benefits:text(item.benefits), imagePath:text(item.imagePath), price:text(item.price), duration:text(item.duration), seoTitle:text(item.seoTitle), seoDescription:text(item.seoDescription), displayOrder:number(item.displayOrder), featured:bool(item.featured), published:bool(item.published, true) };
}
function toCondition(item: any): Condition { return { id:text(item._id), title:text(item.title), slug:text(item.slug), category:text(item.category), summary:text(item.summary), description:text(item.description), displayOrder:number(item.displayOrder), featured:bool(item.featured), published:bool(item.published,true) }; }
function toLocation(item: any): Location { return { id:text(item._id), name:text(item.name), slug:text(item.slug), addressLine1:text(item.addressLine1), addressLine2:text(item.addressLine2), city:text(item.city), state:text(item.state), postalCode:text(item.postalCode), phone:text(item.phone), email:text(item.email), weekdayHours:text(item.weekdayHours), saturdayHours:text(item.saturdayHours), sundayHours:text(item.sundayHours), mapUrl:text(item.mapUrl), directionsUrl:text(item.directionsUrl), status:item.status === "opening_soon" ? "opening_soon" : "open", displayOrder:number(item.displayOrder), active:bool(item.active,true) }; }
function toInsurance(item: any): InsuranceProvider { const status = ["in_network","welcomed","verify"].includes(item.networkStatus) ? item.networkStatus : "verify"; return { id:text(item._id), providerName:text(item.providerName), coverageNote:text(item.coverageNote), networkStatus:status, displayOrder:number(item.displayOrder), active:bool(item.active,true), verifiedDate:text(item.verifiedDate) }; }
function toPricing(item: any): PricingItem { return { id:text(item._id), serviceName:text(item.serviceName), category:text(item.category), price:text(item.price), priceNote:text(item.priceNote), displayOrder:number(item.displayOrder), active:bool(item.active,true) }; }
function toTestimonial(item: any): Testimonial { return { id:text(item._id), patientDisplayName:text(item.patientDisplayName), quote:text(item.quote), sourceNote:text(item.sourceNote), consentConfirmed:bool(item.consentConfirmed), displayOrder:number(item.displayOrder), published:bool(item.published,true) }; }

export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const { items: rows } = await items.query(COLLECTIONS.siteSettings).limit(20).find();
    const row:any = rows.find((candidate:any) => candidate.settingsKey === "primary") ?? rows[0];
    if (!row) return FALLBACK_SETTINGS;
    return { businessName:text(row.businessName) || FALLBACK_SETTINGS.businessName, doctorName:text(row.doctorName) || FALLBACK_SETTINGS.doctorName, yearsExperience:number(row.yearsExperience,FALLBACK_SETTINGS.yearsExperience), phone:text(row.phone) || FALLBACK_SETTINGS.phone, email:text(row.email) || FALLBACK_SETTINGS.email, bookingUrl:text(row.bookingUrl).trim(), medicalDisclaimer:text(row.medicalDisclaimer) || FALLBACK_SETTINGS.medicalDisclaimer, instagramUrl:text(row.instagramUrl) || FALLBACK_SETTINGS.instagramUrl, facebookUrl:text(row.facebookUrl) || FALLBACK_SETTINGS.facebookUrl, youtubeUrl:text(row.youtubeUrl) || FALLBACK_SETTINGS.youtubeUrl };
  } catch (error) { console.error("[wix] getSiteSettings failed", error); return FALLBACK_SETTINGS; }
}

export async function getTreatments(): Promise<Treatment[]> {
  try { const { items:rows } = await items.query(COLLECTIONS.treatments).eq("published",true).ascending("displayOrder").limit(100).find(); return rows.map(toTreatment); }
  catch (error) { console.error("[wix] getTreatments failed",error); return FALLBACK_TREATMENTS; }
}
export async function getServiceBySlug(slug:string):Promise<Treatment|null> {
  try { const { items:rows } = await items.query(COLLECTIONS.treatments).eq("slug",slug).eq("published",true).limit(1).find(); return rows[0] ? toTreatment(rows[0]) : null; }
  catch (error) { console.error("[wix] getServiceBySlug failed",error); return FALLBACK_TREATMENTS.find((item)=>item.slug===slug) ?? null; }
}
export const getTreatmentBySlug = getServiceBySlug;

export async function getConditions():Promise<Condition[]> {
  try { const {items:rows}=await items.query(COLLECTIONS.conditions).eq("published",true).ascending("displayOrder").limit(100).find(); return rows.map(toCondition); }
  catch(error){ console.error("[wix] getConditions failed",error); return FALLBACK_CONDITIONS; }
}
export async function getConditionsByCategory(category:string):Promise<Condition[]> {
  try { const {items:rows}=await items.query(COLLECTIONS.conditions).eq("category",category).eq("published",true).ascending("displayOrder").limit(100).find(); return rows.map(toCondition); }
  catch(error){ console.error("[wix] getConditionsByCategory failed",error); return FALLBACK_CONDITIONS.filter((item)=>item.category===category); }
}
export async function getLocations():Promise<Location[]> {
  try { const {items:rows}=await items.query(COLLECTIONS.locations).eq("active",true).ascending("displayOrder").limit(20).find(); return rows.map(toLocation); }
  catch(error){ console.error("[wix] getLocations failed",error); return FALLBACK_LOCATIONS; }
}
export async function getInsuranceProviders():Promise<InsuranceProvider[]> {
  try { const {items:rows}=await items.query(COLLECTIONS.insurance).eq("active",true).ascending("displayOrder").limit(50).find(); return rows.map(toInsurance); }
  catch(error){ console.error("[wix] getInsuranceProviders failed",error); return FALLBACK_INSURANCE; }
}
export async function getPricing():Promise<PricingItem[]> {
  try { const {items:rows}=await items.query(COLLECTIONS.pricing).eq("active",true).ascending("displayOrder").limit(50).find(); return rows.map(toPricing); }
  catch(error){ console.error("[wix] getPricing failed",error); return FALLBACK_PRICING; }
}
export async function getTestimonials():Promise<Testimonial[]> {
  try { const {items:rows}=await items.query(COLLECTIONS.testimonials).eq("published",true).eq("consentConfirmed",true).ascending("displayOrder").limit(20).find(); return rows.map(toTestimonial); }
  catch(error){ console.error("[wix] getTestimonials failed",error); return []; }
}

// ── Direct-booking config adapters (visitor-scoped reads; guarded + fallback) ──
function toBookableService(item:any):BookableService { return { id:text(item._id), key:text(item.key), label:text(item.label), allowsFirstTime:bool(item.allowsFirstTime,true), allowsExisting:bool(item.allowsExisting,true), displayOrder:number(item.displayOrder), active:bool(item.active,true) }; }
function toCalendarConfig(item:any):CalendarConfigEntry { return { id:text(item._id), category:text(item.category), label:text(item.label), googleCalendarId:text(item.googleCalendarId), countsAsBusy:bool(item.countsAsBusy), active:bool(item.active,true), displayOrder:number(item.displayOrder) }; }
function toBusinessHour(item:any):BusinessHour { return { id:text(item._id), location:text(item.location), weekday:number(item.weekday), openTime:text(item.openTime), closeTime:text(item.closeTime), active:bool(item.active,true) }; }
function toClosure(item:any):Closure { return { id:text(item._id), location:text(item.location), startDate:text(item.startDate), endDate:text(item.endDate), reason:text(item.reason), active:bool(item.active,true) }; }

export async function getBookableServices():Promise<BookableService[]> {
  try { const {items:rows}=await items.query(COLLECTIONS.bookableServices).eq("active",true).ascending("displayOrder").limit(50).find(); return rows.length ? rows.map(toBookableService) : FALLBACK_BOOKABLE_SERVICES; }
  catch(error){ console.error("[wix] getBookableServices failed",error); return FALLBACK_BOOKABLE_SERVICES; }
}
export async function getCalendarConfig():Promise<CalendarConfigEntry[]> {
  try { const {items:rows}=await items.query(COLLECTIONS.calendarConfig).eq("active",true).ascending("displayOrder").limit(50).find(); return rows.length ? rows.map(toCalendarConfig) : FALLBACK_CALENDAR_CONFIG; }
  catch(error){ console.error("[wix] getCalendarConfig failed",error); return FALLBACK_CALENDAR_CONFIG; }
}
export async function getBusinessHours(location?:string):Promise<BusinessHour[]> {
  try { let q=items.query(COLLECTIONS.businessHours).eq("active",true); if(location) q=q.eq("location",location); const {items:rows}=await q.ascending("weekday").limit(100).find(); return rows.length ? rows.map(toBusinessHour) : FALLBACK_BUSINESS_HOURS.filter((h)=>!location||h.location===location); }
  catch(error){ console.error("[wix] getBusinessHours failed",error); return FALLBACK_BUSINESS_HOURS.filter((h)=>!location||h.location===location); }
}
export async function getClosures(location?:string):Promise<Closure[]> {
  try { const {items:rows}=await items.query(COLLECTIONS.closures).eq("active",true).limit(200).find(); const mapped=rows.map(toClosure); return location ? mapped.filter((c)=>c.location===location||c.location==="all") : mapped; }
  catch(error){ console.error("[wix] getClosures failed",error); return FALLBACK_CLOSURES; }
}
export async function getBookingSettings():Promise<BookingSettings> {
  try {
    const {items:rows}=await items.query(COLLECTIONS.bookingSettings).limit(5).find();
    const row:any=rows.find((r:any)=>r.settingsKey==="primary") ?? rows[0];
    if(!row) return FALLBACK_BOOKING_SETTINGS;
    return { slotMinutes:number(row.slotMinutes,FALLBACK_BOOKING_SETTINGS.slotMinutes), minLeadMinutes:number(row.minLeadMinutes,FALLBACK_BOOKING_SETTINGS.minLeadMinutes), maxAdvanceDays:number(row.maxAdvanceDays,FALLBACK_BOOKING_SETTINGS.maxAdvanceDays), cancellationPolicyText:text(row.cancellationPolicyText)||FALLBACK_BOOKING_SETTINGS.cancellationPolicyText };
  } catch(error){ console.error("[wix] getBookingSettings failed",error); return FALLBACK_BOOKING_SETTINGS; }
}
