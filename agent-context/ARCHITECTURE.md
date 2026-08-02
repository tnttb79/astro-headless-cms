# Architecture — Marin Holy Hill Acupuncture Website

**Audience:** anyone (developer or not) who wants to understand how this application is built and how it runs.
**Goal:** explain the whole system simply, but in enough detail that a developer can be productive.
**Last updated:** August 2, 2026

> For the *business* context (who Dr. Kang is, content scope, compliance rules) see `PROJECT_CONTEXT.md`.
> For the *step-by-step process* an engineer or AI agent follows when building features, see `DEVELOPMENT.md`.

---

## 1. What this application is

A modern, content-driven website for an acupuncture clinic. It is built as a **Wix-managed headless** application:

- The **frontend** is an [Astro](https://astro.build/) app that lives in this repository. We own and write this code.
- The **backend and hosting** are provided by **Wix**: content storage (CMS), forms, contacts/CRM, analytics, authentication, hosting, CDN, and SSL.

"Headless" means Wix does **not** design or render the pages. We render them with Astro and call Wix's services for data. This is very different from a traditional drag-and-drop Wix site.

Think of it like this:

```
┌────────────────────────────────┐          ┌─────────────────────────────────┐
│  THIS REPO (our code)          │          │  WIX (backend + host)           │
│                                │          │                                 │
│  Astro frontend                │  Wix     │  • CMS (Wix Data collections)   │
│   • pages & layouts            │  SDK  ⇄  │  • Forms + submissions          │
│   • React islands (interactive)│  /REST   │  • Contacts / CRM               │
│   • data-access adapters       │          │  • Analytics                    │
│   • server API routes          │          │  • Auth (visitor/member tokens) │
│                                │          │  • Hosting, CDN, SSL            │
│  Runs ON Wix's servers (SSR)   │          │  • Dashboard (manage.wix.com)   │
└────────────────────────────────┘          └─────────────────────────────────┘
```

---

## 2. Technology stack

| Layer | Technology | Notes |
|---|---|---|
| Framework | **Astro 5** | Server-rendered (`output: 'server'`). Ships almost no JS by default. |
| Interactivity | **React 18** | Only for "islands" that need client-side state (e.g. the contact form). |
| Language | **TypeScript** | Types in `src/types/`, adapters in `src/lib/`. |
| Backend/data | **Wix SDK** (`@wix/data`, `@wix/forms`, `@wix/sdk`) | Called directly; auth is automatic (see §4). |
| Integration | **`@wix/astro`** | The glue that gives Astro automatic Wix auth + hosting. |
| Hosting | **Wix-managed** | `wix release` publishes to Wix infrastructure. No Vercel/Netlify/Docker. |
| Tooling | **Wix CLI** (`@wix/cli`) | `wix dev` / `wix build` / `wix release`. |

---

## 3. The two halves and where things live

The single most important concept: **content and code live in different places**, and they change through different workflows.

| Thing | Defined / stored in | Changed by |
|---|---|---|
| Page layout, styling, logic | **Code** (this repo) | A developer, then a release |
| Collection *schema* (which fields exist) | **Wix** (created by our seed script) | Developer via API/seed, or dashboard |
| Actual content rows (the treatments, hours, etc.) | **Wix CMS** | The clinic in the dashboard — **no release needed** |
| Contact form *schema* (fields) | **Wix Forms** | Seed script / dashboard |
| Form submissions (leads) | **Wix** | Visitors submit; the clinic reads them in the dashboard |
| Secrets (OAuth credentials) | **`.env.local`** (gitignored) + Wix hosting | Managed by the Wix CLI — never edit by hand |

Practical consequence:
- **"Add a new treatment"** → a content action in the Wix dashboard. No code, no deploy.
- **"Add a new page or change the design"** → a code change + `wix release`.
- **"Render a brand-new field or content type"** → both: schema change in Wix **and** a code change to display it.
- **"Add a condition within an existing category"** → a Wix CMS content action. **Adding a seventh condition category** changes page structure in `src/content/condition-categories.ts` and therefore requires code + a release.

---

## 4. Authentication — the "magic" part

On most headless platforms you construct an API client and manage tokens yourself. On **Wix-managed Astro you don't** — the `@wix/astro` integration handles it. You just import a module and call it:

```ts
import { items } from "@wix/data";
const { items: rows } = await items.query("Treatments").find(); // authenticated automatically
```

How it works:

1. When the project was linked (`headless link`), Wix created a **private app**. Its ID is the `appId` in `wix.config.json`; its OAuth credentials are stored in `.env.local` (a secret, gitignored).
2. Every anonymous **visitor** automatically gets a **visitor token** (visitor-level permissions), with the session persisted via cookies. Session middleware runs on the server.
3. Our CMS collections are created **public-read** (`read: ANYONE`), so visitor reads need no extra auth.
4. **Writes** from visitors go through **Wix Forms** (a submission is an allowed visitor write), not by writing to the CMS directly.
5. **Privileged/admin** operations (site-wide data) would need `auth.elevate()` inside a **server-only** endpoint (`src/pages/api/*.ts`). We don't currently need this.

Rules of thumb:
- Visitor-facing **reads** → free, call directly.
- Visitor **writes** → through Forms.
- **Admin** reads → server-side + `auth.elevate()`.
- On the live site, Wix hosting injects the credentials (tied to `appId`); `.env.local` is only for local `wix dev`.

---

## 5. How data flows

### Reading content (CMS)

```
Visitor requests  /services
        │
        ▼
Astro page runs on Wix's server (SSR)
        │  calls
        ▼
src/lib/wix/data.ts → items.query("Treatments").find()   (visitor token)
        │  returns rows
        ▼
Astro renders HTML  →  sent to the browser
```

Because pages are server-rendered on every request, when the clinic edits a treatment in the dashboard, the **next page load shows it** — no rebuild or redeploy.

### Submitting the contact form (write)

```
User fills the form  (React island, in the browser)
        │  POST /api/contact  (JSON)
        ▼
src/pages/api/contact.ts  (our server route)
        │  submissions.createSubmission({ formId, submissions })   (auto-auth, server-side)
        ▼
Wix records the submission  →  visible in dashboard "Forms & Submissions" + Contacts
```

We do the write server-side so auth is reliable and nothing sensitive touches the browser. We never log the request body (privacy rule).

---

## 6. Repository structure

```
holy-accupunture/
├── astro.config.mjs          # Astro + Wix integration; output:'server'; prod fetch adapter; image domain
├── wix.config.json           # links repo → Wix site (siteId, appId). COMMITTED.
├── .env.local                # private-app OAuth secret. GITIGNORED.
├── package.json              # dev/build/preview/release scripts route through `wix`
├── tsconfig.json
│
├── src/
│   ├── types/
│   │   └── content.ts        # domain types (SiteSettings, Treatment, Condition) — the stable contract
│   ├── lib/wix/
│   │   ├── data.ts           # CMS adapters: getSiteSettings/getTreatments/getTreatmentBySlug/getConditions
│   │   └── config.ts         # structural IDs (CONTACT_FORM_ID)
│   ├── layouts/
│   │   └── SiteLayout.astro  # shared header/footer; reads SiteSettings
│   ├── components/forms/
│   │   └── ContactForm.tsx   # React island: schema-driven fields + client validation
│   └── pages/
│       ├── index.astro       # ten-section homepage (reads CMS)
│       ├── dr-kang.astro     # practitioner profile and care philosophy
│       ├── new-patient.astro # first visit, treatment phases, aftercare
│       ├── va-insurance.astro# VA, coverage, and pricing
│       ├── contact.astro     # two locations + live form schema/form island
│       ├── services/         # CMS listing + 14 SSR detail pages
│       ├── conditions/       # grouped listing + six category pages
│       ├── sitemap.xml.ts    # app sitemap response; Wix fronts it with its generated sitemap index
│       └── api/
│           └── contact.ts    # server route → creates a Wix Forms submission
│
├── scripts/
│   └── wix-seed.mjs          # one-time backend seeder (creates CMS collections + contact form)
│
├── public/images/source-document/   # extracted source images (provisional; review before use)
└── .agents/skills/                  # installed Wix Headless skill (procedures the AI agent follows)
```

### The adapter pattern (important)

Pages never touch raw Wix responses. They call typed functions in `src/lib/wix/data.ts` that return clean domain objects (`Treatment`, `Condition`, …) defined in `src/types/content.ts`. Benefits:

- Pages stay independent of Wix's exact response shape.
- Every SDK call is wrapped in `try/catch` and returns a safe fallback, so a backend hiccup never white-screens a page.
- If Wix's API changes, you fix one file.

---

## 7. Hosting and deployment

There is no separate deploy target. The flow is:

```bash
npm run build     # wix build  — production build (Wix runtime adapter)
npm run release   # wix release — uploads the build to Wix hosting
```

Wix provides hosting, global CDN, SSL, and scaling. The current live URL is a Wix host domain:

- **Live:** `https://marin-holy-17907997-marinholyhillacu.wix-site-host.com`
- **Dashboard:** `https://manage.wix.com/dashboard/c68648ed-1577-4028-86b1-7312970b1945`

Connecting the real custom domain (`marinholyhillacu.com`), premium plans, and billing are **dashboard/account tasks**, handled by the site owner — not from code.

---

## 8. The Wix dashboard (the backoffice)

`manage.wix.com/dashboard/<siteId>` is where the business is run:

- **CMS** — edit collection content (treatments, conditions, site settings).
- **Forms & Submissions / Contacts** — read leads submitted through the contact form.
- **Analytics** — traffic and conversion data (on the live custom domain).
- **Apps, domain, billing** — install business apps, connect the domain, manage the plan.

Division of labor: **developers build the experience; the dashboard runs the day-to-day business.**

---

## 9. What is currently built vs. placeholder

**Current released build:**
- Repo linked to a live Wix site; auto-auth working.
- CMS collections (`Treatments`, `Conditions`, `SiteSettings`, `Locations`, `InsuranceProviders`, `Pricing`, `Testimonials`) are represented by typed guarded adapters and the idempotent migration in `scripts/wix-seed.mjs`.
- Contact form seeded; the page reads its schema live and submits to Wix Forms via a server route.
- The complete route set, design system, responsive images, SEO, accessibility behavior, analytics event map, and client/server form validation are implemented.
- Source-derived medical, insurance, pricing, credential, and testimonial copy remains **draft** and is tracked page-by-page in `CONTENT_REVIEW.md`.
- CMS migration is complete and independently verified. The production build passes and is published at the Wix host URL.
- `@wix/astro-pages` registers the 20 concrete service/condition detail URLs so Wix's generated `pages-sitemap.xml` contains all 27 public HTML routes.
- The live route, metadata, sitemap, robots, analytics, location, and invalid-form checks pass. Final business-copy approval and one real form-submission check remain client QA tasks; the old custom-domain site is untouched.

---

## 10. The role of the Wix Headless skill

The `.agents/skills/` folder holds the official **Wix Headless skill** — a set of procedures an AI coding agent follows to perform Wix operations (install apps, seed content, wire the SDK, deploy). It reads its instructions from the live Wix docs, so it stays current. This is why adding a new Wix capability (Bookings, Blog, etc.) is a repeatable, recipe-driven process rather than guesswork. See `DEVELOPMENT.md` for how it's used.
