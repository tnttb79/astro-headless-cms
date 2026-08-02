/**
 * Idempotent Wix CMS migration and content seed for the approved redesign.
 * Source and compliance record: agent-context/PROJECT_CONTEXT.md and CONTENT_REVIEW.md.
 * Existing rows are never deleted. Replaced placeholder rows are retained with published=false.
 */
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import {
  FALLBACK_CONDITIONS,
  FALLBACK_INSURANCE,
  FALLBACK_LOCATIONS,
  FALLBACK_PRICING,
  FALLBACK_SETTINGS,
  FALLBACK_TESTIMONIALS,
  FALLBACK_TREATMENTS,
} from "../src/content/fallback-data.ts";

const cfg = JSON.parse(readFileSync(new URL("../wix.config.json", import.meta.url), "utf8"));
const SITE_ID = cfg.siteId;
const TOKEN = execFileSync("npx", ["@wix/cli@latest", "token", "--site", SITE_ID], { encoding: "utf8" }).trim();
const BASE = "https://www.wixapis.com";
const headers = { Authorization: `Bearer ${TOKEN}`, "wix-site-id": SITE_ID, "Content-Type": "application/json" };
const PERMISSIONS = { insert: "ADMIN", update: "ADMIN", remove: "ADMIN", read: "ANYONE" };
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function call(method, path, body, retry = true) {
  const run = () => fetch(`${BASE}${path}`, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) });
  let response = await run();
  let raw = await response.text();
  if (retry && (response.status === 403 || response.status >= 500 || (response.status === 400 && raw.includes("WDE0117")))) {
    await sleep(2500);
    response = await run();
    raw = await response.text();
  }
  let json = {};
  try { json = raw ? JSON.parse(raw) : {}; } catch { json = { raw }; }
  if (!response.ok) throw new Error(`${method} ${path} returned ${response.status}: ${JSON.stringify(json)}`);
  return json;
}

function stableId(collectionId, key) {
  const hex = createHash("sha1").update(`${collectionId}:${key}`).digest("hex").slice(0, 32);
  return `${hex.slice(0,8)}-${hex.slice(8,12)}-5${hex.slice(13,16)}-a${hex.slice(17,20)}-${hex.slice(20,32)}`;
}

const commonPublishFields = [
  { key:"displayOrder",displayName:"Display Order",type:"NUMBER" },
  { key:"published",displayName:"Published",type:"BOOLEAN" },
];

const definitions = [
  { id:"Treatments", displayName:"Treatments", fields:[
    {key:"title",displayName:"Title",type:"TEXT"},{key:"slug",displayName:"Slug",type:"TEXT"},{key:"category",displayName:"Category",type:"TEXT"},{key:"serviceGroup",displayName:"Service Group",type:"TEXT"},{key:"shortDescription",displayName:"Short Description",type:"TEXT"},{key:"description",displayName:"Description",type:"RICH_TEXT"},{key:"howItWorks",displayName:"How It Works",type:"RICH_TEXT"},{key:"indications",displayName:"Indications",type:"RICH_TEXT"},{key:"benefits",displayName:"Benefits",type:"RICH_TEXT"},{key:"imagePath",displayName:"Image Path",type:"TEXT"},{key:"price",displayName:"Price",type:"TEXT"},{key:"duration",displayName:"Duration",type:"TEXT"},{key:"seoTitle",displayName:"SEO Title",type:"TEXT"},{key:"seoDescription",displayName:"SEO Description",type:"TEXT"},{key:"featured",displayName:"Featured",type:"BOOLEAN"},...commonPublishFields
  ]},
  { id:"Conditions", displayName:"Conditions", fields:[
    {key:"title",displayName:"Title",type:"TEXT"},{key:"slug",displayName:"Slug",type:"TEXT"},{key:"category",displayName:"Category",type:"TEXT"},{key:"summary",displayName:"Summary",type:"TEXT"},{key:"description",displayName:"Description",type:"RICH_TEXT"},{key:"featured",displayName:"Featured",type:"BOOLEAN"},...commonPublishFields
  ]},
  { id:"SiteSettings", displayName:"Site Settings", fields:[
    {key:"settingsKey",displayName:"Settings Key",type:"TEXT"},{key:"businessName",displayName:"Business Name",type:"TEXT"},{key:"doctorName",displayName:"Doctor Name",type:"TEXT"},{key:"yearsExperience",displayName:"Years Experience",type:"NUMBER"},{key:"phone",displayName:"Phone",type:"TEXT"},{key:"email",displayName:"Email",type:"TEXT"},{key:"bookingUrl",displayName:"Booking URL",type:"TEXT"},{key:"medicalDisclaimer",displayName:"Medical Disclaimer",type:"TEXT"},{key:"address",displayName:"Legacy Address",type:"TEXT"},{key:"weekdayHours",displayName:"Legacy Weekday Hours",type:"TEXT"},{key:"saturdayHours",displayName:"Legacy Saturday Hours",type:"TEXT"},{key:"sundayHours",displayName:"Legacy Sunday Hours",type:"TEXT"}
  ]},
  { id:"Locations", displayName:"Locations", fields:[
    {key:"name",displayName:"Name",type:"TEXT"},{key:"slug",displayName:"Slug",type:"TEXT"},{key:"addressLine1",displayName:"Address Line 1",type:"TEXT"},{key:"addressLine2",displayName:"Address Line 2",type:"TEXT"},{key:"city",displayName:"City",type:"TEXT"},{key:"state",displayName:"State",type:"TEXT"},{key:"postalCode",displayName:"Postal Code",type:"TEXT"},{key:"phone",displayName:"Phone",type:"TEXT"},{key:"email",displayName:"Email",type:"TEXT"},{key:"weekdayHours",displayName:"Weekday Hours",type:"TEXT"},{key:"saturdayHours",displayName:"Saturday Hours",type:"TEXT"},{key:"sundayHours",displayName:"Sunday Hours",type:"TEXT"},{key:"mapUrl",displayName:"Map URL",type:"URL"},{key:"directionsUrl",displayName:"Directions URL",type:"URL"},{key:"status",displayName:"Status",type:"TEXT"},{key:"displayOrder",displayName:"Display Order",type:"NUMBER"},{key:"active",displayName:"Active",type:"BOOLEAN"}
  ]},
  { id:"InsuranceProviders", displayName:"Insurance Providers", fields:[
    {key:"providerName",displayName:"Provider Name",type:"TEXT"},{key:"coverageNote",displayName:"Coverage Note",type:"TEXT"},{key:"networkStatus",displayName:"Network Status",type:"TEXT"},{key:"displayOrder",displayName:"Display Order",type:"NUMBER"},{key:"active",displayName:"Active",type:"BOOLEAN"},{key:"verifiedDate",displayName:"Verified Date",type:"TEXT"}
  ]},
  { id:"Pricing", displayName:"Pricing", fields:[
    {key:"serviceName",displayName:"Service Name",type:"TEXT"},{key:"category",displayName:"Category",type:"TEXT"},{key:"price",displayName:"Price",type:"TEXT"},{key:"priceNote",displayName:"Price Note",type:"TEXT"},{key:"displayOrder",displayName:"Display Order",type:"NUMBER"},{key:"active",displayName:"Active",type:"BOOLEAN"}
  ]},
  { id:"Testimonials", displayName:"Testimonials", fields:[
    {key:"patientDisplayName",displayName:"Patient Display Name",type:"TEXT"},{key:"quote",displayName:"Quote",type:"TEXT"},{key:"sourceNote",displayName:"Source Note",type:"TEXT"},{key:"consentConfirmed",displayName:"Consent Confirmed",type:"BOOLEAN"},{key:"displayOrder",displayName:"Display Order",type:"NUMBER"},{key:"published",displayName:"Published",type:"BOOLEAN"}
  ]},
];

async function ensureCollection(definition) {
  const path = `/wix-data/v2/collections/${encodeURIComponent(definition.id)}`;
  let existing;
  try { existing = (await call("GET", path)).collection; }
  catch (error) {
    if (!String(error).includes("returned 404")) throw error;
    await call("POST", "/wix-data/v2/collections", { collection:{ id:definition.id,displayName:definition.displayName,fields:definition.fields,permissions:PERMISSIONS } });
    console.log(`[CMS] Created ${definition.id}`);
    return;
  }
  const keys = new Set((existing?.fields ?? []).map((field) => field.key));
  for (const field of definition.fields.filter((candidate) => !keys.has(candidate.key))) {
    await call("POST", "/wix-data/v2/collections/create-field", { dataCollectionId:definition.id,field });
    console.log(`[CMS] Added ${definition.id}.${field.key}`);
  }
}

async function queryItems(collectionId) {
  const result = await call("POST", "/wix-data/v2/items/query", { dataCollectionId:collectionId,query:{paging:{limit:100}} });
  return result.dataItems ?? result.items ?? [];
}

async function saveItem(collectionId, id, data) {
  return call("POST", "/wix-data/v2/items/save", { dataCollectionId:collectionId,dataItem:{id,data} });
}

const legacyPlaceholderSlugs = {
  Treatments:new Set(["acupuncture","cupping-moxibustion","herbal-medicine"]),
  Conditions:new Set(["neck-shoulder-pain","stress-headaches","insomnia"]),
};

async function retireReplacedRows(collectionId, canonicalIds) {
  const existing = await queryItems(collectionId);
  const legacySlugs = legacyPlaceholderSlugs[collectionId] ?? new Set();
  for (const row of existing.filter((item) => !canonicalIds.has(item.id) && legacySlugs.has(item.data?.slug) && item.data?.published !== false)) {
    await call("PUT", `/wix-data/v2/items/${row.id}`, { dataCollectionId:collectionId,dataItem:{data:{...row.data,published:false}} });
    console.log(`[CMS] Retained and unpublished ${collectionId}/${row.id}`);
  }
}

const imagePathBySlug = Object.fromEntries([
  ["acupuncture","acupuncture-neck-treatment.png"],["electro-acupuncture","electro-acupuncture-treatment.png"],["facial-acupuncture","facial-acupuncture-specialty.png"],["ear-acupuncture","auricular-acupuncture-ear.jpeg"],["moxibustion","moxibustion-therapy-back.png"],["medical-massage-met","medical-massage-met-treatment.png"],["lymphatic-massage","lymphatic-massage-treatment.png"],["herbal-medicine","herbal-medicine-ingredients.png"],["auto-injury-care","therapeutic-massage-treatment.png"],["colds-and-allergies","cold-and-allergies.png"],["weight-loss-support","weight-loss-support.png"],["constipation-support","constipation-support.png"],["fertility-support","fertility-support.png"],["oncology-support","oncology-acupuncture-support.png"],
]);

async function seedRows(collectionId, rows, keyOf, transform = (row) => row) {
  const expected = new Map(rows.map((row) => [stableId(collectionId,keyOf(row)),transform(row)]));
  if (collectionId === "Treatments" || collectionId === "Conditions") await retireReplacedRows(collectionId,new Set(expected.keys()));
  for (const [id,data] of expected) await saveItem(collectionId,id,data);
  const stored = await queryItems(collectionId);
  for (const [id,data] of expected) {
    const actual = stored.find((item) => item.id === id)?.data;
    if (!actual) throw new Error(`[CMS] ${collectionId}/${id} did not persist`);
    for (const key of Object.keys(data)) if (!(key in actual)) throw new Error(`[CMS] ${collectionId}/${id} missing field ${key}`);
  }
  console.log(`[CMS] Verified ${expected.size} canonical row(s) in ${collectionId}`);
}

for (const definition of definitions) await ensureCollection(definition);

await seedRows("Treatments",FALLBACK_TREATMENTS,(row)=>row.slug,(row)=>{ const {id,...data}=row; return {...data,imagePath:imagePathBySlug[row.slug]??""}; });
await seedRows("Conditions",FALLBACK_CONDITIONS,(row)=>row.slug,(row)=>{ const {id,...data}=row; return data; });

const existingSettings = await queryItems("SiteSettings");
const settingsId = existingSettings[0]?.id ?? stableId("SiteSettings","primary");
await saveItem("SiteSettings",settingsId,{...existingSettings[0]?.data,settingsKey:"primary",...FALLBACK_SETTINGS});
console.log("[CMS] Updated primary SiteSettings row");

await seedRows("Locations",FALLBACK_LOCATIONS,(row)=>row.slug,(row)=>{const {id,...data}=row;return data;});
await seedRows("InsuranceProviders",FALLBACK_INSURANCE,(row)=>row.providerName,(row)=>{const {id,...data}=row;return data;});
await seedRows("Pricing",FALLBACK_PRICING,(row)=>row.serviceName,(row)=>{const {id,...data}=row;return data;});
await seedRows("Testimonials",FALLBACK_TESTIMONIALS,(row)=>row.patientDisplayName,(row)=>{const {id,...data}=row;return {...data,consentConfirmed:false};});

console.log("[CMS] Redesign migration and verification complete.");
