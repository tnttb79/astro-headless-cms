/**
 * One-time Wix backend seed for Marin Holy Hill Acupuncture.
 *
 * Follows the installed wix-headless skill recipes:
 *   - CMS (Wix Data v2): public-read collections + bulk item insert + verify
 *   - Forms (Form Schemas v4): clean default form, create contact form, verify
 *
 * Token is minted at runtime from the logged-in Wix CLI session (no secrets in repo).
 * Content here is DRAFT, source-derived, and must be reviewed/approved before publishing
 * (see MARIN_HOLY_HILL_PROJECT_CONTEXT.md §17 compliance rules). No medical guarantees.
 */
import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { randomUUID } from "node:crypto";

const cfg = JSON.parse(readFileSync(new URL("../wix.config.json", import.meta.url)));
const SITE_ID = cfg.siteId;
const TOKEN = execSync(`npx @wix/cli@latest token --site ${SITE_ID}`, {
  encoding: "utf8",
}).trim();

const BASE = "https://www.wixapis.com";
const headers = {
  Authorization: `Bearer ${TOKEN}`,
  "wix-site-id": SITE_ID,
  "Content-Type": "application/json",
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function call(method, path, body, { retryOnFresh = false } = {}) {
  const doFetch = () =>
    fetch(`${BASE}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  let res = await doFetch();
  if (retryOnFresh && (res.status === 403 || res.status === 400 || res.status >= 500)) {
    await sleep(4000);
    res = await doFetch();
  }
  const text = await res.text();
  let json;
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    json = { raw: text };
  }
  return { status: res.status, json };
}

const PERM_PUBLIC = { insert: "ADMIN", update: "ADMIN", remove: "ADMIN", read: "ANYONE" };

const collections = [
  {
    id: "Treatments",
    displayName: "Treatments",
    fields: [
      { key: "title", displayName: "Title", type: "TEXT" },
      { key: "slug", displayName: "Slug", type: "TEXT" },
      { key: "category", displayName: "Category", type: "TEXT" },
      { key: "shortDescription", displayName: "Short Description", type: "TEXT" },
      { key: "description", displayName: "Description", type: "RICH_TEXT" },
      { key: "benefits", displayName: "Benefits", type: "RICH_TEXT" },
      { key: "price", displayName: "Price", type: "TEXT" },
      { key: "duration", displayName: "Duration", type: "TEXT" },
      { key: "displayOrder", displayName: "Display Order", type: "NUMBER" },
      { key: "featured", displayName: "Featured", type: "BOOLEAN" },
      { key: "published", displayName: "Published", type: "BOOLEAN" },
    ],
    items: [
      {
        title: "Acupuncture",
        slug: "acupuncture",
        category: "Acupuncture",
        shortDescription:
          "Fine, sterile needles placed at specific points to support the body's natural balance and ease discomfort.",
        description:
          "<p>Acupuncture is a core practice of traditional Chinese medicine. Thin, single-use needles are gently placed at selected points to encourage circulation and support the body's own regulatory processes. Each session is tailored to the individual after a careful assessment.</p>",
        benefits:
          "<ul><li>Personalized, whole-person assessment</li><li>Gentle, single-use sterile needles</li><li>May help support comfort and everyday wellbeing</li></ul>",
        price: "From $80 (initial visit $130)",
        duration: "45–60 minutes",
        displayOrder: 1,
        featured: true,
        published: true,
      },
      {
        title: "Cupping & Moxibustion",
        slug: "cupping-moxibustion",
        category: "Holistic Therapies",
        shortDescription:
          "Traditional warming and suction techniques often used alongside acupuncture to support circulation and relaxation.",
        description:
          "<p>Cupping uses gentle suction on the skin, while moxibustion applies warmth from mugwort near specific points. Both are traditional techniques frequently combined with acupuncture as part of a personalized care plan.</p>",
        benefits:
          "<ul><li>Traditionally used to support circulation</li><li>Often combined with acupuncture</li><li>Relaxing, non-needle options available</li></ul>",
        price: "From $50",
        duration: "20–40 minutes",
        displayOrder: 2,
        featured: false,
        published: true,
      },
      {
        title: "Herbal Medicine",
        slug: "herbal-medicine",
        category: "Herbal Medicine",
        shortDescription:
          "Personalized traditional herbal formulas prepared to complement your treatment plan.",
        description:
          "<p>Herbal medicine uses time-honored formulas selected to suit each person. Dr. Kang reviews your health picture and lifestyle before recommending a personalized formula intended to complement in-clinic care.</p>",
        benefits:
          "<ul><li>Personalized traditional formulas</li><li>Complements in-clinic treatment</li><li>Guidance on safe, appropriate use</li></ul>",
        price: "From $80 (ingredient dependent)",
        duration: "Consultation based",
        displayOrder: 3,
        featured: true,
        published: true,
      },
    ],
  },
  {
    id: "Conditions",
    displayName: "Conditions",
    fields: [
      { key: "title", displayName: "Title", type: "TEXT" },
      { key: "slug", displayName: "Slug", type: "TEXT" },
      { key: "category", displayName: "Category", type: "TEXT" },
      { key: "summary", displayName: "Summary", type: "TEXT" },
      { key: "description", displayName: "Description", type: "RICH_TEXT" },
      { key: "displayOrder", displayName: "Display Order", type: "NUMBER" },
      { key: "featured", displayName: "Featured", type: "BOOLEAN" },
      { key: "published", displayName: "Published", type: "BOOLEAN" },
    ],
    items: [
      {
        title: "Neck & Shoulder Pain",
        slug: "neck-shoulder-pain",
        category: "Pain & Injury",
        summary:
          "Support for everyday neck and shoulder tension through a personalized, whole-person approach.",
        description:
          "<p>Neck and shoulder discomfort is one of the most common reasons people visit the clinic. After a careful assessment, Dr. Kang designs an individualized plan that may include acupuncture and complementary techniques to support comfort and mobility.</p>",
        displayOrder: 1,
        featured: true,
        published: true,
      },
      {
        title: "Stress & Headaches",
        slug: "stress-headaches",
        category: "Mental & Emotional Health",
        summary:
          "A calming, individualized approach for people managing everyday stress and tension headaches.",
        description:
          "<p>Everyday stress can affect sleep, focus, and physical comfort. Care is tailored to the whole person and may combine acupuncture with lifestyle guidance. This information is educational and is not a substitute for medical care.</p>",
        displayOrder: 2,
        featured: true,
        published: true,
      },
      {
        title: "Insomnia",
        slug: "insomnia",
        category: "Energy & Sleep",
        summary:
          "Gentle, personalized support for people looking to improve rest and daily energy.",
        description:
          "<p>Restful sleep supports overall wellbeing. Dr. Kang takes time to understand your patterns and builds an individualized plan. This content is for general education and does not replace advice from your physician.</p>",
        displayOrder: 3,
        featured: false,
        published: true,
      },
    ],
  },
  {
    id: "SiteSettings",
    displayName: "Site Settings",
    fields: [
      { key: "businessName", displayName: "Business Name", type: "TEXT" },
      { key: "doctorName", displayName: "Doctor Name", type: "TEXT" },
      { key: "phone", displayName: "Phone", type: "TEXT" },
      { key: "email", displayName: "Email", type: "TEXT" },
      { key: "address", displayName: "Address", type: "TEXT" },
      { key: "weekdayHours", displayName: "Weekday Hours", type: "TEXT" },
      { key: "saturdayHours", displayName: "Saturday Hours", type: "TEXT" },
      { key: "sundayHours", displayName: "Sunday Hours", type: "TEXT" },
      { key: "bookingUrl", displayName: "Booking URL", type: "TEXT" },
      { key: "medicalDisclaimer", displayName: "Medical Disclaimer", type: "TEXT" },
    ],
    items: [
      {
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
      },
    ],
  },
];

async function seedCms() {
  const result = {};
  for (const c of collections) {
    process.stdout.write(`\n[CMS] Creating collection "${c.id}"... `);
    const create = await call(
      "POST",
      "/wix-data/v2/collections",
      {
        collection: {
          id: c.id,
          displayName: c.displayName,
          fields: c.fields,
          permissions: PERM_PUBLIC,
        },
      },
      { retryOnFresh: true }
    );
    console.log(create.status);
    if (create.status !== 200 && create.status !== 201) {
      console.log("  create response:", JSON.stringify(create.json));
    }

    process.stdout.write(`[CMS] Inserting ${c.items.length} item(s) into "${c.id}"... `);
    const insert = await call(
      "POST",
      "/wix-data/v2/bulk/items/insert",
      {
        dataCollectionId: c.id,
        dataItems: c.items.map((data) => ({ data })),
        returnEntity: true,
      },
      { retryOnFresh: true }
    );
    console.log(insert.status);
    const ids = (insert.json.results || []).map((r) => r.dataItem?.id).filter(Boolean);

    const verify = await call("POST", "/wix-data/v2/items/query", {
      dataCollectionId: c.id,
    });
    const count = verify.json.dataItems?.length ?? verify.json.items?.length ?? 0;
    console.log(`[CMS] Verify "${c.id}": ${count} item(s) stored`);
    result[c.id] = { collectionId: c.id, fieldKeys: c.fields.map((f) => f.key), itemIds: ids };
  }
  return result;
}

async function seedForms() {
  const NS = "wix.form_app.form";
  process.stdout.write(`\n[Forms] Listing existing forms... `);
  const list = await call("GET", `/form-schema-service/v4/forms?namespace=${NS}`);
  console.log(list.status);
  for (const f of list.json.forms || []) {
    process.stdout.write(`[Forms] Deleting default form ${f.id}... `);
    const del = await call("DELETE", `/form-schema-service/v4/forms/${f.id}`);
    console.log(del.status);
  }

  const lc = () => randomUUID().toLowerCase();
  const F_FIRST = lc(),
    F_LAST = lc(),
    F_EMAIL = lc(),
    F_PHONE = lc(),
    F_MSG = lc(),
    SUBMIT = lc(),
    STEP = lc();

  const input = (id, identifier, target, label, { required = false, pii = false, format = "UNKNOWN_FORMAT" } = {}) => ({
    id,
    hidden: false,
    identifier,
    fieldType: "INPUT",
    inputOptions: {
      target,
      pii,
      required,
      inputType: "STRING",
      readOnly: false,
      stringOptions: {
        validation: { format, enum: [] },
        componentType: "TEXT_INPUT",
        textInputOptions: { label, showLabel: true },
      },
    },
  });

  const body = {
    form: {
      name: "Contact",
      namespace: NS,
      formFields: [
        {
          id: SUBMIT,
          hidden: false,
          identifier: "SUBMIT_BUTTON",
          fieldType: "DISPLAY",
          displayOptions: {
            displayFieldType: "PAGE_NAVIGATION",
            pageNavigationOptions: { nextPageText: "Next", previousPageText: "Back", submitText: "Send message" },
          },
        },
        input(F_FIRST, "CONTACTS_FIRST_NAME", "first_name", "First name", { required: true, pii: true }),
        input(F_LAST, "CONTACTS_LAST_NAME", "last_name", "Last name", { required: true, pii: true }),
        input(F_EMAIL, "CONTACTS_EMAIL", "email", "Email", { required: true, pii: true, format: "EMAIL" }),
        input(F_PHONE, "CONTACTS_PHONE", "phone", "Phone", { required: false, pii: true, format: "PHONE" }),
        input(F_MSG, "message", "message", "How can we help?", { required: true }),
      ],
      steps: [
        {
          id: STEP,
          name: "Page 1",
          layout: {
            large: {
              items: [
                { fieldId: F_FIRST, row: 0, column: 0, width: 6, height: 1 },
                { fieldId: F_LAST, row: 0, column: 6, width: 6, height: 1 },
                { fieldId: F_EMAIL, row: 1, column: 0, width: 6, height: 1 },
                { fieldId: F_PHONE, row: 1, column: 6, width: 6, height: 1 },
                { fieldId: F_MSG, row: 2, column: 0, width: 12, height: 1 },
                { fieldId: SUBMIT, row: 3, column: 0, width: 12, height: 1 },
              ],
              sections: [],
            },
          },
        },
      ],
      enabled: true,
    },
  };

  process.stdout.write(`[Forms] Creating "Contact" form... `);
  const create = await call("POST", "/form-schema-service/v4/forms", body, { retryOnFresh: true });
  console.log(create.status);
  if (create.status !== 200 && create.status !== 201) {
    console.log("  create response:", JSON.stringify(create.json));
    return null;
  }
  const formId = create.json.form?.id;
  const targets = (create.json.form?.fields || []).map((f) => f.target).filter(Boolean);

  const summary = await call("GET", `/form-schema-service/v4/forms/${formId}/summary`);
  const summaryFields = summary.json.formSummary?.fields?.length ?? 0;
  console.log(`[Forms] Verify: formId=${formId}, targets=[${targets.join(", ")}], dashboard fields=${summaryFields}`);
  return { formId, targets };
}

const cms = await seedCms();
const forms = await seedForms();

console.log("\n===== SEED SUMMARY =====");
console.log(JSON.stringify({ cms, forms }, null, 2));
