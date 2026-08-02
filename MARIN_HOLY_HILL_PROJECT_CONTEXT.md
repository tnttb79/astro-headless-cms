# Marin Holy Hill Acupuncture Website Redesign
## Project Context for an IDE Coding Agent

**Status:** Planning and technical setup  
**Last updated:** August 1, 2026  
**Primary business:** Marin Holy Hill Acupuncture Clinic  
**Current public site:** `https://www.marinholyhillacu.com/`  
**Chosen implementation:** Wix-managed headless frontend using Astro and the Wix JavaScript SDK  
**Primary purpose of this document:** Give a Cursor/IDE coding agent enough context to build the frontend layer, the Wix SDK integration points, and to link/push the codebase to Wix. The agent still does not perform account-level administration that cannot be done from code (billing, premium-plan changes, domain/DNS transfer, historical-data migration, dashboard-only configuration). The user handles those separately with ChatGPT.

---

## Scope decision log

**August 1, 2026 — Wix integration ownership expanded.**
The user directed the Cursor agent to own the Wix SDK integration and to link/push the codebase to Wix from within this repository, rather than deferring all Wix work to the user + ChatGPT. This supersedes the earlier boundary that said the agent must not create/connect the Wix Headless project.

What changed:

- The agent **now owns**: installing and configuring the Wix Astro integration (`@wix/astro`) and Wix SDK packages, running the Wix CLI to **link this existing Astro project** to a Wix-managed headless project (`npm create @wix/new@latest -- headless link`), writing SDK-backed data-access modules, building server-only privileged operations, and running the Wix build/release (deploy) workflow.
- The agent **still cannot** do anything that requires interactive Wix-account authentication it does not have credentials for. The `headless link`, `wix login`, `wix dev`, and deploy commands require the user to be logged into the correct Wix account in the CLI (browser OAuth). Where a step needs that login, the agent prepares everything up to that point and hands the exact command to the user.
- The agent **still does not** manage billing, premium plans, DNS/domain transfer, historical contact/submission migration, or dashboard-only settings that have no code surface.

Preferred linking approach: because a local Astro project already exists in this repo, connect the existing project rather than scaffolding a new one, to avoid discarding the current code.

**August 1, 2026 — Official Wix Headless skill installed.** The Wix agent skill set is installed at `./.agents/skills/` and is now the canonical, always-current procedure for Wix work. See §11.1. This project resolves to skill **project type `managed`** + **operation `connect`**. All Wix backend/headless steps should follow `.agents/skills/wix-headless/SKILL.md` (and its `references/`), which pulls its instructions from live Wix docs. The interactive `wix login` device-code step still requires the user's browser authorization.

---

# 1. Instructions for the Coding Agent

Treat this document as the project source of context unless the repository or the user provides newer information.

Important operating rules:

1. Focus on the frontend layer: Astro pages, layouts, components, styling, responsive behavior, accessibility, SEO markup, client-side interactions, and Wix SDK calls that belong in the codebase.
2. Own the Wix integration from code: install and configure the Wix Astro integration and SDK packages, link this existing Astro project to a Wix-managed headless project via the Wix CLI, write SDK-backed data-access modules, and run the Wix build/release (deploy) workflow. Any step that requires interactive Wix-account login (`headless link`, `wix login`, deploy) must be prepared fully and then handed to the user as an exact command when the agent lacks that session. Do not delete or migrate an existing production Wix project.
3. Do not manage DNS, domains, premium plans, production dashboards, old form submissions, contact migration, or account permissions. Those account-administration tasks that have no code surface remain with the user and ChatGPT.
4. Use the current public website at `https://www.marinholyhillacu.com/` as the baseline reference for existing visible content, navigation, business information, imagery, and visitor flows.
5. Use Dr. Kang's 67-page document as the source for redesign scope, expanded content, proposed pages, and new messaging.
6. When the live website and the document conflict, do not block frontend development. Keep the value centralized in mock data, configuration, or CMS mappings so it can be changed later. Note the conflict briefly in code comments or project notes only when necessary.
7. Do not invent credentials, medical claims, insurance participation, prices, or legal policies. Use supplied source text, the live-site baseline, or a clearly labeled placeholder.
8. Use current Wix-managed headless and Astro documentation rather than older Velo or legacy Wix Headless examples.
9. This project uses the Wix-managed Astro integration, not Wix Studio as the public frontend and not a self-hosted Next.js frontend.
10. In a Wix-managed Astro project, prefer direct Wix SDK module calls. Do not create a manual Wix SDK client unless the generated project or current Wix documentation requires one.
11. Place privileged SDK operations in server-only code and use elevated permissions only when required. Never expose administrative permissions, API keys, secrets, or private operations to browser code.
12. Never send names, email addresses, phone numbers, messages, symptoms, appointment details, or other personally identifiable or health-related information to analytics.
13. Do not log contact-form request bodies or health-related information.
14. Build reusable content models and page templates. Do not hard-code dozens of nearly identical treatment and condition pages.
15. Favor semantic HTML, accessibility, responsive layouts, performance, local SEO, and maintainability.
16. Before implementing a major feature, inspect the generated project structure and installed package versions.

---

## 1.1 Source precedence for frontend work

Use sources in this order:

1. The user's latest explicit instruction.
2. The live website for the clinic's current public content and current visitor experience.
3. Dr. Kang's 67-page document for the redesign vision, expanded page scope, and proposed copy.
4. Confirmed Wix technical details supplied by the user or project documentation.
5. Clearly labeled temporary mock data only when the sources contain no usable value.

The agent should derive ordinary visible facts from the live website instead of turning every detail into a blocking question. Examples include the currently displayed clinic name, navigation labels, phone, address, hours, page copy, calls to action, and existing image choices.

Business approval questions may still exist, but they are handled by the user outside the frontend coding workflow. The code should make these values easy to replace later.

---

# 2. Project Summary

The goal is to redesign Dr. Kang's current Wix website into a professional, modern, patient-focused acupuncture clinic website.

This is not merely a visual refresh. Dr. Kang provided a large 67-page content document proposing a much broader site with:

- A stronger clinic and practitioner identity
- Detailed treatment information
- Condition-focused educational pages
- New-patient guidance
- Insurance and pricing information
- Specialized-care landing pages
- Stronger calls to action
- Better booking and contact paths
- Christian faith and spiritual healing as a visible part of the clinic's identity

The new website should educate prospective patients, build trust in Dr. Kang, clarify what to expect, answer practical questions, improve local search visibility, and convert visitors into appointment inquiries or bookings.

---

# 3. Business and Brand Context

## 3.1 Clinic

Working business name from Dr. Kang's content:

**Marin Holy Hill Acupuncture Clinic**

The current Wix site is named:

**Dr. Kang Healing**

For frontend implementation, use the exact brand treatment currently visible on the live website as the baseline unless the repository contains newer approved branding. Keep the business name in one configuration or CMS-backed location so the user can change it later.

## 3.2 Practitioner

Dr. Hyo-won Henry Kang is presented as:

- A third-generation acupuncture practitioner
- DAOM and Ph.D.
- A practitioner with more than 28 years of clinical experience
- A practitioner combining traditional knowledge with modern medical understanding
- A provider focused on root-cause, whole-person care
- A practitioner drawing from traditional Korean spiritual healing
- A Christian provider who begins sessions with prayer

The content document also says "30 years" in one location, which conflicts with the repeated "28+ years" language. The frontend agent should use the wording currently approved in the supplied content or live site and keep it centralized for later replacement. This conflict is not a reason to stop building components.

## 3.3 Desired brand themes

The proposed brand is built around:

- Third-generation expertise
- Root-cause healing
- Body, mind, and spirit
- Patient-first care
- Compassion
- Traditional medicine combined with modern understanding
- Prevention and long-term wellness
- Faith-based healing and prayer

Proposed slogans from Dr. Kang's content include:

- "Prevention is better than cure. Nip it in the bud."
- "Don't Just Treat the Pain, Master Your Health."
- "Don't Chase Symptoms. Master Your Whole Body Health."

These are drafts, not approved final marketing copy.

## 3.4 Christian and spiritual identity

The faith component is not a minor footnote in Dr. Kang's document. It is part of his desired identity.

The content says that he:

- Begins sessions with prayer
- Sees healing as a sacred journey
- Treats patients as children of God
- Wants care to communicate dignity, compassion, and unconditional love
- Uses the message: "God loves you, you were born to be loved, and you shall be healed."

The design should respect this identity without making the site feel exclusionary, confusing, or medically misleading. Final language should be reviewed with Dr. Kang.

---

# 4. Current Wix Site

## 4.1 Confirmed Wix project

Current published site:

- **Site name:** Dr. Kang Healing
- **Wix site ID:** `330eb101-1304-4048-a32a-07357d9b4b2b`
- **Public URL:** `https://www.marinholyhillacu.com/`
- **Status:** Published
- **Plan:** Premium
- **Custom domain:** Connected
- **Editor:** Wix Studio
- **Velo:** Enabled
- **Created:** August 29, 2024
- **Last known update:** July 22, 2026
- **Language:** English
- **Country:** United States
- **Configured timezone:** `America/Los_Angeles`
- **Configured currency:** USD

The clinic is in Mesa, Arizona, while the old Wix project is configured for `America/Los_Angeles`. This is Wix project administration and is outside the Cursor agent's scope.

## 4.2 Current Wix business contact settings

The Wix project settings currently show:

- Email: `tcmkang67@gmail.com`
- Phone: `8188087198`

These differ from the redesign document and public-facing content. For the frontend, use the values visibly presented on the live website unless the user supplies newer approved values. Store them in one config/CMS mapping so they are easy to replace.

## 4.3 Installed apps on the current site

The current project has these Wix apps installed:

- Promote SEO
- Wix Bookings
- Wix Forms
- Wix Forms & Payments
- Wix Invoices
- Wix Members Area

Installed does not mean actively configured or meaningfully used.

## 4.4 Actual current functionality

The existing site is best classified as:

> A mostly static informational website with Wix-managed forms and CRM functionality.

Current visible content is primarily manually authored Wix pages containing text, images, practitioner information, service descriptions, testimonials, galleries, contact information, and business hours.

There is no evidence that the current public treatment and condition content is driven by a well-structured custom CMS.

## 4.5 Current forms and CRM

A previous audit found:

- A functional Wix contact form
- Existing submissions stored in Wix
- Wix Contact creation or update behavior
- Approximately 139 historical contact-form submissions
- Approximately 42 submissions marked unseen at the time of the audit

These numbers must be re-verified before migration.

The current contact form is an important business asset because it preserves historical leads and operational history.

## 4.6 Current booking functionality

Wix Bookings is installed, but the previous audit found:

- Zero configured booking services
- No actual online appointment scheduler
- The public "Booking" page is effectively a contact page
- No visible service selection, date selection, time selection, rescheduling, cancellation, or checkout

This means there is no mature booking system to preserve. Booking can remain a contact/inquiry path for the first release, or a real Wix Bookings setup can be introduced later.

## 4.7 Existing public navigation

The current site includes pages such as Home, Meet Dr. Kang, About, Before and After, Testimonials, Photo Gallery, Contact, and Booking.

Known current problems include:

- Weak and unclear information architecture
- Poor URL slugs such as `/blank-1`
- "Booking" is not a real scheduler
- A "Coming Soon" before-and-after page
- Very long or poorly organized content
- Inconsistent business details
- Weak mobile and conversion structure
- Inconsistent visual assets
- Questionable medical claims
- Awkward or repetitive English copy
- Limited content hierarchy
- Unclear distinction between treatments and conditions

## 4.8 How to use the existing website as a reference

The coding agent should actively review the current public website at:

**`https://www.marinholyhillacu.com/`**

Use the existing site as a reference for:

- Current page content and wording that may need to be preserved, rewritten, or migrated
- Existing navigation and URLs that may require redirects
- Dr. Kang's current biography, credentials, testimonials, images, and service descriptions
- Current brand elements, visual tone, calls to action, and contact details
- Existing form placement and the visitor journey
- Identifying content or functionality that should not be lost during the redesign

Do not treat the existing site as the final design or unquestioned source of truth. It contains outdated, inconsistent, incomplete, and potentially noncompliant content. Compare it against Dr. Kang's 67-page redesign document and mark conflicts for confirmation.

Before implementation, create a page-by-page inventory of the live site that records:

- Current URL
- Page title and purpose
- Important text and images
- Whether the content should be kept, rewritten, merged, redirected, or removed
- Any SEO metadata worth preserving
- Any forms, buttons, or external links

Preserve screenshots or another visual archive of the current site before the production domain is changed. The old site should remain available for rollback and historical reference until the replacement is approved.

---

# 5. Contact Information from Dr. Kang's Redesign Document

The 67-page content document lists:

- **Phone:** `(480) 730-4991`
- **Email:** `marinholyhillacu@gmail.com`
- **Address:** `1933 W. Main Street, Suite 1, Mesa, AZ 85201`
- **Hours:**
  - Monday-Friday: 8:30 AM-6:00 PM
  - Saturday: 9:00 AM-4:00 PM
  - Sunday: Closed

For the frontend baseline, use the current public website's displayed phone, email, address, and hours. The redesign-document values are useful as a secondary reference. Keep all business details centralized. Social icons should be omitted or disabled until actual URLs are supplied.

---

# 6. What Dr. Kang Wants from the Redesign

Dr. Kang wants a larger, more organized clinic website that functions as both a marketing site and a patient education resource.

The redesign should:

- Present Dr. Kang as the central trust figure
- Explain his experience, credentials, heritage, and philosophy
- Clarify the patient journey before the first visit
- Explain individual treatments
- Let visitors browse by symptoms or condition category
- Highlight specialized services
- Clearly show insurance and pricing
- Provide strong calls to action throughout
- Improve credibility and professionalism
- Support content editing through Wix
- Preserve Wix business-management advantages
- Improve analytics and conversion tracking
- Improve SEO and local search discoverability
- Work well on desktop, tablet, and mobile

---

# 7. Content Scope from the 67-Page Document

## 7.1 Proposed top-level structure from Dr. Kang

The document proposes Home, About, New Patient, Services, We Treat, Special, Insurance & Price, Contact, and Social Media.

This is useful as content inventory, but it should not be copied mechanically into the final navigation.

## 7.2 About content

Proposed subpages:

- Who We Are
- Why Choose Us
- Meet Dr. Kang

Important content:

- Third-generation practice
- 28+ years of experience
- DAOM and Ph.D.
- Root-cause focus
- Body, mind, and spirit
- Traditional Korean spiritual healing
- Prayer
- Compassion and patient-first care
- Diagnostic methods such as pulse observation, facial observation, palpation, posture, and movement assessment

## 7.3 New-patient content

Proposed sections:

- What to Expect
- Treatment Plan
- Post-Treatment

The document describes a six-step first-visit process:

1. Preparation and arrival
2. Intake and health information
3. Consultation and traditional assessment
4. Personalized care plan
5. First treatment
6. Aftercare and next steps

Patient guidance includes:

- Arrive early
- Bring identification and insurance information
- Eat a light meal one to two hours before the appointment
- Wear loose, comfortable clothing
- Avoid strenuous activity after treatment
- Follow dietary and lifestyle guidance

## 7.4 Three treatment phases

The proposed care plan is divided into:

1. **Relief Phase**
   - Approximately 1-4 weeks
   - Reduce acute pain and primary symptoms

2. **Corrective Phase**
   - Approximately 4-12 weeks
   - Address underlying causes and stabilize the body

3. **Wellness Phase**
   - Ongoing
   - Maintenance visits every 2-4 weeks or seasonally

The timing and medical framing should be treated as draft copy and reviewed before publishing.

## 7.5 Services

The document includes:

### Acupuncture
- Acupuncture
- Electro-acupuncture
- Facial acupuncture
- Auricular acupuncture

### Holistic therapies
- Cupping
- Moxibustion
- Medical massage / MET

### Massage and bodywork
- Therapeutic massage
- Facial healing acupressure
- Lymphatic massage
- Medical foot therapy / foot reflexology

### Herbal medicine
- TCM formulas
- Personalized prescriptions
- Family formulas

## 7.6 Conditions and treatment categories

Proposed categories include:

- Pain and injury
- Mental and emotional health
- Immune and respiratory concerns
- Energy and digestive disorders
- Women's health
- Skin therapy

Examples mentioned in the document include neck pain, frozen shoulder, interscapular pain, lower back pain, sciatica, neuropathy, anxiety, depression, emotional imbalance, asthma, chronic fatigue, indigestion, menstrual pain, menopause, skin allergies, eczema, psoriasis, headaches, insomnia, constipation, and allergies.

Many condition entries near the end of the document are headings only or incomplete.

`TODO: DO NOT GENERATE MISSING CONDITION COPY WITHOUT APPROVAL`

## 7.7 Specialized-care pages

Dr. Kang emphasizes:

- Facial acupuncture
- Car accident injury recovery
- Colds and allergies
- Weight loss
- Constipation
- Fertility support
- Oncology acupuncture

These should be treated as high-priority landing-page candidates, but their medical claims require careful review.

## 7.8 Insurance

The document claims in-network participation or acceptance involving:

- UnitedHealthcare
- Blue Cross Blue Shield
- Cigna
- SCAN
- Humana Medicare
- Aetna
- Federal employee insurance

Additional coverage categories:

- Motor vehicle accidents
- Veterans Affairs with prior authorization
- Workers' compensation
- HSA
- FSA
- Out-of-network superbills
- International travel insurance

Every insurance claim must be confirmed before publishing.

`TODO: VERIFY EACH PAYER, NETWORK STATUS, COVERAGE WORDING, AND BILLING PROCESS`

## 7.9 Pricing from the content document

Draft pricing:

- Initial consultation and treatment: $130
- Comprehensive follow-up visit: $120
- Focused acupuncture follow-up: $80
- Medical massage / MET: $80
- Facial acupuncture: $80
- Cupping: $50
- Moxibustion: $50
- Facial acupressure: $50
- Foot reflexology: $50
- Custom herbal formula: $80, ingredient dependent

The document mentions pay-per-visit and package plans but does not provide final package pricing or discounts.

It also says "three flexible payment methods" while listing only two.

`TODO: CONFIRM PRICES, PACKAGE OPTIONS, PAYMENT METHODS, AND EFFECTIVE DATE`

---

# 8. Recommended Launch Information Architecture

Do not launch all 67 pages as separate pages.

Recommended primary navigation:

- Home
- About Dr. Kang
- Treatments
- Conditions We Treat
- New Patients
- Insurance & Pricing
- Contact
- Book Appointment

Recommended treatment groups:

- Acupuncture
- Cupping and Moxibustion
- Medical Massage and Bodywork
- Herbal Medicine
- Facial Acupuncture
- Specialized Care

Recommended specialized-care pages:

- Auto Accident Recovery
- Fertility Support
- Oncology Support
- Digestive Health
- Allergy and Respiratory Support
- Facial Rejuvenation

The final number of pages should be driven by search intent, content quality, user needs, and Dr. Kang's priorities rather than the numbering in the draft document.

---

# 9. Homepage Strategy

Recommended homepage sequence:

1. Hero with clear clinic identity and appointment CTA
2. Trust indicators
3. Conditions overview
4. Featured treatments
5. Why choose Dr. Kang
6. What to expect
7. Meet Dr. Kang
8. Testimonials
9. Insurance and pricing summary
10. Location and contact
11. Final call to action

---

# 9.1 Cursor Agent Scope Boundary

The Cursor agent owns:

- Astro page and route implementation
- Layouts, components, design system, typography, spacing, and responsive behavior
- Reusable treatment, condition, testimonial, pricing, FAQ, and location UI
- Accessibility and semantic HTML
- SEO metadata, structured-data components, sitemap/robots code where applicable
- Wix SDK query modules used by the frontend
- Server-only code inside the project when needed for safe SDK operations
- TypeScript types and data-mapping adapters
- Loading, empty, and error states
- Contact-form UI and a clean submission adapter/interface
- Analytics event calls that contain no PII or health data
- Mock-data fallbacks so frontend work can continue before Wix collections are connected
- Documentation of the SDK inputs the user must provide later, such as collection IDs, field keys, form IDs, and enabled Wix apps

The Cursor agent also owns (updated August 1, 2026):

- Installing and configuring the Wix Astro integration (`@wix/astro`) and Wix SDK packages (`@wix/sdk`, `@wix/data`, `@wix/forms`, etc.) in this repository
- Running the Wix CLI to link this existing Astro project to a Wix-managed headless project (`npm create @wix/new@latest -- headless link`) and committing the generated Wix config
- Wiring SDK-backed data-access modules to real Wix collections/forms as those become available
- Running the Wix build/release (deploy) workflow to push code to Wix

The Cursor agent does not own:

- Interactive Wix-account authentication when the agent lacks the session. `headless link`, `wix login`, `wix dev`, and deploy require the user logged into the correct Wix account via browser OAuth. The agent prepares everything and hands the exact command to the user for these steps.
- Installing Wix apps in the dashboard
- Configuring Forms, Contacts, Automations, Bookings, permissions, or premium plans in the dashboard (beyond what the SDK/CLI does from code)
- Migrating old contacts or historical submissions
- Connecting or transferring the production domain
- DNS, billing, publishing approval, or rollback operations
- Deciding final medical, insurance, legal, pricing, or policy language

The frontend must still expose clear integration points and keep SDK access isolated so collection IDs, form IDs, and field keys can be supplied/confirmed without redesigning the UI.

---

# 10. Chosen Technical Architecture

## 10.1 Final decision

Build a **new Wix-managed headless project using Astro's full Wix integration**.

This replaces the plan to use Wix Studio as the public frontend, self-managed Next.js on Vercel, a React SPA uploaded to Wix, or a traditional Velo page-code architecture.

## 10.2 Why Astro was selected

The website is primarily content-oriented. Astro supports:

- Server-rendered and statically generated content
- Small client-side JavaScript payloads
- React components only where interactivity is useful
- Strong SEO and performance characteristics
- Full Wix-managed headless integration

## 10.3 Wix-managed responsibilities

With the full Astro integration, Wix is expected to provide:

- Frontend hosting
- Global CDN
- SSL
- Deployment previews
- Scaling
- Managed Wix authentication
- Visitor session handling
- Wix SDK integration
- Wix Analytics event infrastructure
- Wix SEO integration
- Secrets management
- Error and log monitoring
- Wix extension support
- Access to Wix business solutions

## 10.4 Application responsibilities

The Astro project will provide:

- Page routes
- Layouts
- Components
- Design system
- Content rendering
- CMS queries
- Form interface
- Server endpoints
- Analytics event calls
- SEO metadata and structured data
- Accessibility behavior
- Redirect planning
- Conversion flows

## 10.5 High-level architecture

```text
Visitors
   |
   v
Astro frontend
Wix-managed hosting
   |
   +-- Wix CMS
   +-- Wix Forms
   +-- Wix Contacts / CRM
   +-- Wix Automations
   +-- Wix Media
   +-- Wix Analytics
   +-- Optional Wix Bookings later
   +-- Wix Dashboard
```

## 10.6 Important Wix project context, for awareness only

The standard Wix-managed Astro CLI flow creates a **new Wix Headless project**.

It does not simply replace the frontend of the existing Wix Studio project.

Therefore, the likely target state is:

```text
Wix account
|
+-- Old project: Dr. Kang Healing
|   +-- Existing Wix Studio site
|   +-- Historical forms and submissions
|   +-- Existing contacts and configuration
|   +-- Remains live during development
|   +-- Retained as archive/rollback after launch
|
+-- New project: Marin Holy Hill Acupuncture Headless
    +-- Astro frontend
    +-- Wix-managed hosting
    +-- New primary dashboard after migration
    +-- New CMS and form configuration
    +-- Native Wix Analytics
```

The Cursor agent does not perform this migration. It only needs to avoid coupling the frontend to old-site IDs and should accept IDs/field mappings through configuration when the user provides them.

---

# 11. Initial Wix/Astro Setup

Current official Wix CLI requirements include:

- Node.js 20.11.0 or newer
- Git installed and configured
- Access to the correct Wix account

There are two CLI entry points. Because this repository already contains a working Astro project, prefer linking rather than scaffolding a new one:

**Preferred — link the existing Astro project (used for this repo):**

```bash
# run at the repo root, where astro.config.mjs lives
npm create @wix/new@latest -- headless link --business-name "Marin Holy Hill Acupuncture"
```

This provisions a Wix business and site, adds Wix configuration files, installs the `@wix/astro` integration and required SDK dependencies, and wires the existing Astro project to Wix. It requires an interactive Wix-account login the first time.

**Alternative — scaffold a brand-new project from a template (discards existing code):**

```bash
npm create @wix/new@latest headless
```

The CLI will prompt for business/project name, an initial Astro template, and a local folder name. It then creates the Wix Headless project, a linked private app, local files, installs dependencies, initializes Git, and builds/publishes an initial version. Only use this if starting from an empty directory.

Run local development with:

```bash
wix dev
```

Use the Wix CLI build/release workflow generated for the project. Do not assume a Vercel or standard standalone Astro deployment workflow.

Before executing any setup command, confirm:

- The correct Wix account is logged in
- The intended new project name
- The local repository folder
- The selected starter template
- The Git remote strategy

Recommended project name:

**Marin Holy Hill Acupuncture**

Recommended repository name:

**marin-holy-hill-acupuncture**

---

# 11.1 Installed Wix Headless Skill (canonical procedure)

**Added August 1, 2026.** The official Wix Headless agent skill set is installed in this repository at `./.agents/skills/`. The agent should treat this skill as the **authoritative, up-to-date procedure** for all Wix backend + headless work, superseding hand-written CLI notes in this document when they conflict. The skill reads its "how" from live Wix docs (`dev.wix.com/docs`, `.md` twin of any page), so it stays current.

Installed skills:

- `wix-headless` — connect Wix business services (CMS/Data, Forms, Bookings, Stores, etc.) to the headless frontend; for managed projects it can also scaffold/connect the frontend, build, and release. **This is the primary skill for this project.**
- `wix-auth` — authentication flows.
- `wix-docs` — live Wix documentation access.
- `wix-app`, `wix-design-system`, `wix-manage`, `wix-vibe-headless` — supporting skills.

Cold-start entry and bootstrap: `https://www.wix.com/headless/skill.md` (Node ≥ 20.11 prerequisite, then a bootstrap that verifies the Wix CLI and drives `wix login` via a device-code flow).

How this project maps onto the skill:

- **Project type: `managed`** — hosted on Wix infrastructure. Detected/declared because we intend to `deploy to Wix`.
- **Operation: `connect`** — a frontend already exists on disk (this Astro project) **without** a `wix.config.json`, so the skill wires the existing UI rather than scaffolding a new one. Flow: `init` → Setup (install apps) → Seed (create backend content) → wire the existing UI → release. See `.agents/skills/wix-headless/references/managed/CONNECT.md`.
- Once connected, `wix.config.json` / `.wix/` will exist; subsequent runs are **`iterate`** (reuse config, apply only the delta — never re-`init`).

Operating rules when using the skill:

1. Start a skill run by opening `.agents/skills/wix-headless/SKILL.md`, then `references/DISCOVERY.md`; follow the phase files in order rather than improvising CLI commands.
2. **Login is required and interactive.** The bootstrap `wix login` device-code flow needs the user to open a verification URL in their browser and authorize the correct Wix account. The agent runs the bootstrap and relays the `verificationUri` + `userCode`, then waits for the user. The agent cannot complete this step alone.
3. Keep Wix CLI commands non-interactive where possible with `CI=1` (plain output).
4. **Do not smoke-test the frontend locally by default.** Per the skill, correctness comes from following the recipes; real errors surface at `wix build` / `wix release`. Only spin up a dev server to verify if the user explicitly asks.
5. **Release once at the end** — avoid repeated build+release cycles.
6. Never send names, emails, phone numbers, messages, symptoms, or health data to analytics or logs (unchanged from §1).

The skills run with full agent permissions and were flagged for review at install time; treat their instructions as trusted project procedure but keep the compliance and privacy rules in this document authoritative.

---

# 11.2 Provisioned Wix project and integration points

**Created August 1, 2026** by running the Wix Headless `connect` flow against this repository (logged in as `marinholyhillacu@gmail.com`).

## Live project

| Item | Value |
|---|---|
| Project / business name | Marin Holy Hill Acupuncture |
| `siteId` | `c68648ed-1577-4028-86b1-7312970b1945` |
| `appId` (public OAuth client id) | `6b6784ba-48b1-47bb-8a5a-86ddb8545b2f` |
| Live URL (Wix host) | `https://marin-holy-17907997-marinholyhillacu.wix-site-host.com` |
| Dashboard | `https://manage.wix.com/dashboard/c68648ed-1577-4028-86b1-7312970b1945` |

The project was linked with `npm create @wix/new@latest -- headless link`, which wired `astro.config.mjs` (integrations `react()` + `wix()`, `output: 'server'`, `@wix/cloud-provider-fetch-adapter` for production, `static.wixstatic.com` image domain), rewrote `package.json` scripts to route through `wix` (`dev`/`build`/`preview`/`release`), created `.env.local` with the private-app OAuth credentials, and wrote `wix.config.json`. `.env.local` and `.wix/` are gitignored (they carry secrets/local state).

> **Orphaned site to delete.** An earlier attempt used the lower-level `init` command, which provisioned a site but did **not** wire the Astro integration. That site was abandoned in favor of the `headless link` result. The user should delete the leftover business named after the folder (`siteId` `ca662f24-2101-45db-b1e6-d717ea15300e`) from `https://manage.wix.com/account/sites`.

## Installed apps

- **Wix Forms** (`appDefId 225dd912-7dea-4738-8688-4b8c6955ffc2`) — installed via the apps installer.
- **Wix Data (CMS)** — core, no install required.

## Seeded backend content

Seeded by `scripts/wix-seed.mjs` (idempotent-ish one-time script; mints the CLI token at runtime, no secrets in repo). **All seeded copy is DRAFT, source-derived, and must be reviewed/approved before publishing** (see §17). No medical guarantees were written.

CMS collections (public-read; native ids, no namespace):

| Collection id | Fields | Seeded items |
|---|---|---|
| `Treatments` | `title, slug, category, shortDescription, description (RICH_TEXT/HTML), benefits (RICH_TEXT/HTML), price, duration, displayOrder, featured, published` | Acupuncture, Cupping & Moxibustion, Herbal Medicine |
| `Conditions` | `title, slug, category, summary, description (RICH_TEXT/HTML), displayOrder, featured, published` | Neck & Shoulder Pain, Stress & Headaches, Insomnia |
| `SiteSettings` | `businessName, doctorName, phone, email, address, weekdayHours, saturdayHours, sundayHours, bookingUrl, medicalDisclaimer` | 1 record (contact values from the redesign doc §5 — verify against the live site) |

Contact form (Wix Forms, namespace `wix.form_app.form`):

- **`formId`: `ef70c223-ff89-4a90-a784-9de20cc87b69`**
- Field `target`s: `first_name`, `last_name`, `email`, `phone`, `message`.
- `first_name`/`last_name`/`email`/`phone` carry `CONTACTS_*` identifiers and render in the Wix Forms dashboard; **`message` is a custom field** — its data is captured on every submission but it does **not** appear as a column in the dashboard summary (Wix Forms platform limitation). Submissions are still recorded in full.

## Frontend integration (in this repo)

- **Data access boundary:** `src/lib/wix/data.ts` — typed adapters `getSiteSettings()`, `getTreatments()`, `getTreatmentBySlug()`, `getConditions()` using `@wix/data` `items.query` (auto-auth, no client; every call guarded with a fallback).
- **Domain types:** `src/types/content.ts` (pages bind to these, not to raw Wix shapes).
- **Structural IDs:** `src/lib/wix/config.ts` (`CONTACT_FORM_ID`).
- **Pages:** `src/pages/index.astro` (reads CMS), `src/pages/treatments/index.astro` + `[slug].astro`, `src/pages/contact.astro` (reads the live form schema and renders it schema-driven).
- **Contact form:** `src/components/forms/ContactForm.tsx` (React island, schema-driven, client validation) → posts to `src/pages/api/contact.ts` (server route calls `@wix/forms` `submissions.createSubmission`; no request-body logging).
- Installed SDK packages: `@wix/sdk`, `@wix/data`, `@wix/forms` (plus `@wix/astro`, `@astrojs/react` from linking).

## Verified on the live site (post-release)

Homepage renders seeded treatments/conditions from the CMS; `/treatments/acupuncture` renders the detail; `/contact` renders the schema-driven form. Contact submissions were not test-sent to avoid creating junk leads.

## Remaining Wix inputs still owned by the user

- Real approved content to replace the DRAFT seed (treatments, conditions, business details, plus any testimonials/pricing/insurance/FAQ collections not yet created).
- Final booking CTA destination (currently `/contact` via `SiteSettings.bookingUrl`).
- Custom domain connection, premium plan, analytics/GA4, and any Bookings setup — dashboard/account tasks.

---

# 12. Proposed Repository Structure

The generated Wix project is the source of truth. Do not force this exact structure if Wix generates something different.

```text
src/
├── components/
│   ├── layout/
│   ├── ui/
│   ├── cards/
│   ├── forms/
│   └── sections/
├── layouts/
│   └── SiteLayout.astro
├── pages/
│   ├── index.astro
│   ├── about.astro
│   ├── new-patients.astro
│   ├── insurance-pricing.astro
│   ├── contact.astro
│   ├── treatments/
│   │   ├── index.astro
│   │   └── [slug].astro
│   ├── conditions/
│   │   ├── index.astro
│   │   └── [slug].astro
│   └── specialized-care/
│       ├── index.astro
│       └── [slug].astro
├── lib/
│   ├── wix/
│   ├── analytics/
│   ├── seo/
│   └── validation/
├── styles/
├── types/
└── content/
```

Use React components only where client-side state or interaction is genuinely needed, such as mobile navigation, form interaction, filters, accordions, booking UI, or dialogs.

Do not hydrate static cards, headings, layouts, or simple links unnecessarily.

---

# 13. Wix CMS Plan

## Treatments

Suggested fields:

- `title`
- `slug`
- `category`
- `shortDescription`
- `description`
- `heroImage`
- `benefits`
- `howItWorks`
- `relatedConditions`
- `price`
- `duration`
- `bookingUrl`
- `featured`
- `displayOrder`
- `seoTitle`
- `seoDescription`
- `published`

## Conditions

Suggested fields:

- `title`
- `slug`
- `category`
- `summary`
- `description`
- `symptoms`
- `relatedTreatments`
- `heroImage`
- `featured`
- `displayOrder`
- `seoTitle`
- `seoDescription`
- `published`

## SpecializedCare

Suggested fields:

- `title`
- `slug`
- `summary`
- `description`
- `heroImage`
- `relatedTreatments`
- `disclaimer`
- `featured`
- `displayOrder`
- `seoTitle`
- `seoDescription`
- `published`

## Testimonials

Suggested fields:

- `patientDisplayName`
- `quote`
- `rating`
- `relatedTreatment`
- `consentConfirmed`
- `featured`
- `displayOrder`
- `published`

Never publish testimonials without confirming permission and applicable advertising rules.

## Pricing

Suggested fields:

- `serviceName`
- `category`
- `price`
- `priceNote`
- `displayOrder`
- `active`

## InsuranceProviders

Suggested fields:

- `providerName`
- `logo`
- `coverageNote`
- `displayOrder`
- `active`
- `verifiedDate`

## FAQs

Suggested fields:

- `question`
- `answer`
- `category`
- `displayOrder`
- `published`

## SiteSettings

Use one settings record for:

- `businessName`
- `doctorName`
- `phone`
- `email`
- `address`
- `weekdayHours`
- `saturdayHours`
- `sundayHours`
- `bookingUrl`
- `facebookUrl`
- `instagramUrl`
- `youtubeUrl`
- `medicalDisclaimer`
- `announcement`
- `googleMapsUrl`

Do not hard-code business information across multiple pages.

---

# 14. Forms and CRM Strategy

Create a custom form UI in Astro while storing submissions in Wix Forms and managing leads in Wix Contacts.

```text
Astro contact form
   |
   v
Server-side Wix form submission operation
   |
   +-- Wix Forms submission
   +-- Wix Contact creation/update
   +-- Wix Automations/notifications
   +-- Wix dashboard visibility
```

Recommended first-release fields:

- First name
- Last name
- Email
- Phone
- Preferred contact method
- General inquiry category
- Short message
- Consent checkbox

Display a warning:

> Please do not include private medical details or sensitive health information in this form.

Security rules:

- Validate on the server
- Use rate limiting
- Use Wix-supported spam protection or a reviewed alternative
- Do not log request bodies
- Redact user information from errors
- Do not expose privileged form APIs to the browser
- Use server-side elevated permissions only where required
- Confirm Wix contact mapping and automations for SDK-created submissions
- Test duplicate-contact behavior
- Test notification delivery
- Test submission status and dashboard visibility

Before launch, export or archive old submissions, document the old form schema, record submission counts, record automation behavior, retain old dashboard access, and decide whether contacts should be imported.

Do not promise historical form submissions will appear in the new project's Forms dashboard.

---

# 15. Analytics Strategy

Use Wix Analytics events through `@wix/site`.

Conceptual example:

```ts
import { analytics } from "@wix/site";

analytics.trackEvent("Lead", {
  origin: "Contact Form"
});
```

Relevant events:

- `ViewContent`
- `Lead`
- `Schedule`
- Custom engagement events

Suggested events:

- Home primary CTA click
- Book appointment click
- Phone click
- Directions click
- Contact form start
- Contact form success
- Contact form failure
- Treatment page view
- Condition page view
- Insurance section view
- New-patient guide view

Rules:

- Verify analytics on the deployed custom-domain site, not local development.
- Never send names, emails, phone numbers, messages, symptoms, treatment interests tied to identity, or health information.
- Connect GA4 or Google Tag Manager through Wix if external reporting is desired.
- Define an event naming convention before implementation.

---

# 16. SEO Strategy

Core SEO work:

- Clean page slugs
- Unique titles and descriptions
- Canonical URLs
- Open Graph metadata
- Sitemap
- Robots configuration
- Breadcrumbs
- Internal linking
- Structured data
- Image alt text
- Fast mobile performance
- Accessible headings
- Location and contact consistency
- Google Business Profile alignment
- Search Console verification
- Redirects from old Wix URLs

Likely structured data:

- Local business or medical business type, selected carefully
- Person for Dr. Kang
- Breadcrumb list
- FAQ only when the visible page contains the same FAQ content

Do not add ratings, medical claims, credentials, accepted insurance, or hours to structured data until verified.

Existing routes to investigate include:

- `/blank`
- `/blank-1`
- `/blank-2`
- `/bookingpage`

Before launch, inventory current URLs, map valuable old URLs to new pages, add permanent redirects, preserve the domain, and monitor 404s.

---

# 17. Content and Compliance Risks

The draft document contains many strong medical statements that should not be published without review.

Examples include language equivalent to:

- Cure at the root
- Instant relief
- Zero side effects
- Repairs nerve pathways
- Prevents recurrence
- Clinically proven
- Permanently resolves a condition
- Significantly increases IVF success
- Detoxifies the body
- Treats immune disorders
- Treats oncology-related conditions
- Restores or retrains organs or nerves

Required approach:

- Treat the 67-page document as raw source material, not final approved web copy.
- Rewrite claims into careful, patient-friendly language.
- Avoid guarantees.
- Avoid implying that acupuncture replaces emergency, oncology, fertility, mental-health, or conventional medical care.
- Add appropriate disclaimers.
- Obtain Dr. Kang's review.
- Consider legal or professional review for healthcare advertising.
- Verify whether services and claims are within the clinic's licensed scope.

Missing policy content includes:

- Privacy policy
- Terms
- Accessibility statement
- Cancellation policy
- Payment policy
- Medical disclaimer
- Consent language
- Cookie/analytics consent where applicable

---

# 18. Visual and Media Direction

The draft document includes many inconsistent images, including stock-like, low-resolution, or possibly AI-generated visuals.

Avoid:

- Different visual styles across pages
- Images that appear to show unrelated practitioners
- Unverified before-and-after images
- Low-resolution screenshots
- Text embedded inside images
- Buttons represented as images
- Images without usage rights
- Medical imagery that feels alarming or misleading

Prefer:

- Professional photos of Dr. Kang
- Real clinic interior
- Real treatment rooms
- Dr. Kang interacting with patients only with written consent
- Detail shots of the clinic environment
- Consistent treatment photography
- Mesa/clinic location context
- Properly licensed supporting imagery when real photography is unavailable

Before publishing any image, verify ownership or license, confirm patient/model consent, add useful alt text, optimize size and format, and avoid exposing private medical information.

---

# 19. Accessibility Requirements

Target a strong accessible baseline:

- Semantic landmarks
- Correct heading order
- Keyboard-accessible navigation
- Visible focus styles
- Sufficient color contrast
- Form labels and error messages
- Accessible mobile menu
- Reduced-motion support
- Descriptive link labels
- Alt text
- No text baked into images
- Large enough touch targets
- Error summaries for forms
- Clear language
- Screen-reader testing for major flows

Accessibility is part of the definition of done.

---

# 20. Performance Requirements

The site should feel fast on mobile.

Guidelines:

- Prefer Astro components for static content
- Hydrate only interactive components
- Optimize and resize images
- Use responsive image sources
- Avoid unnecessary animation libraries
- Avoid large client-side bundles
- Preload only critical assets
- Use efficient font loading
- Keep third-party scripts minimal
- Measure Core Web Vitals
- Avoid repeated CMS requests
- Use caching appropriate to Wix-managed Astro
- Confirm how Wix content updates invalidate or refresh rendered pages

---

# 21. Frontend Delivery Plan

## Phase 1: Establish and link the Wix-managed Astro repository

- If no Astro project exists, scaffold or link one; if a local Astro project already exists (as in this repo), link it with `npm create @wix/new@latest -- headless link`
- Install/confirm the Wix Astro integration and SDK packages
- Read the resulting project structure and configuration
- Confirm package versions and available Wix integration helpers
- Run the local development environment (`wix dev` once linked, otherwise `astro dev`)
- Do not delete or reconfigure the existing production Wix Studio site (Dr. Kang Healing); the new headless project is separate

## Phase 2: Build the frontend foundation

- Design tokens
- Typography
- Colors
- Base layout
- Header and footer
- Responsive navigation
- Reusable buttons, cards, badges, sections, and form controls
- Accessibility baseline

## Phase 3: Build routes and page templates

- Home
- About Dr. Kang
- Treatments index and detail template
- Conditions index and detail template
- Specialized Care index and detail template
- New Patients
- Insurance and Pricing
- Contact

Use the current website for baseline content and the 67-page document for the expanded redesign scope.

## Phase 4: Create a data-access boundary

Implement typed repository/service modules such as:

- `getTreatments()`
- `getTreatmentBySlug()`
- `getConditions()`
- `getConditionBySlug()`
- `getTestimonials()`
- `getPricing()`
- `getSiteSettings()`

Start with mock data when necessary. Keep page components independent from raw Wix response shapes. Later, replace the mock adapters with Wix SDK implementations after the user supplies the actual collection IDs and field mappings.

## Phase 5: Add Wix SDK integration points

- Read public CMS content through the Wix SDK
- Map Wix records to stable frontend domain types
- Add safe server-only functions where a method requires elevated permission
- Build contact-form submission behind a single adapter
- Add non-sensitive Wix analytics events
- Handle loading, empty, permission, and API-failure states

## Phase 6: Frontend QA

- Responsive testing
- Cross-browser testing
- Keyboard and screen-reader checks
- Performance checks
- Image optimization
- Metadata and structured-data checks
- Broken-link checks
- Form validation and error-state checks
- Verify that no secrets or sensitive data enter the browser bundle or analytics

## External Wix setup handled by the user with ChatGPT

The following may be required before the real integrations work, but they are not Cursor-agent tasks:

- Create/connect the Wix-managed Astro project
- Create CMS collections and field keys
- Configure the Wix form and obtain form/field IDs
- Configure Contacts and Automations
- Enable analytics and connect the custom domain
- Configure Bookings if it is added
- Manage old-site data, domain migration, premium plan, and launch

---

# 22. Definition of Done for the Cursor Agent

The Cursor frontend work is complete when:

- The Astro project runs locally and follows the generated Wix project conventions.
- The visual design is professional, responsive, and accessible.
- The required routes and reusable page templates exist.
- Current-site content has been used as the baseline reference instead of being ignored.
- Expanded redesign content from the 67-page document is represented in the information architecture.
- Business details are centralized rather than repeated across components.
- CMS-backed sections use typed data adapters and can temporarily run from mock data.
- Wix SDK integrations are isolated in clear modules.
- Contact-form UI, validation, success/error states, and submission adapter are implemented.
- Analytics events contain no PII or health information.
- No API keys, app secrets, or elevated credentials appear in browser code.
- Loading, empty, and API-error states are handled.
- Metadata, structured-data helpers, sitemap/robots code, and redirect documentation are prepared where relevant.
- The repository clearly documents which Wix IDs, collection keys, and dashboard settings the user must supply.
- The agent has not attempted domain, plan, dashboard, migration, or production-account work.

---

# 23. Frontend-Relevant Inputs Still Needed

Most ordinary content questions should be answered from the live website and the 67-page document. They should not become blocking questions for the Cursor agent.

Only these integration inputs may be needed later:

1. The final design direction if the user wants a visual style different from both the current website and the source document.
2. The approved logo files, brand colors, fonts, and high-resolution clinic photography. Until then, derive a reasonable baseline from the current site and keep tokens easy to change.
3. The actual Wix CMS collection IDs and field keys after the user creates or confirms them.
4. The actual Wix Forms form ID and field identifiers after the user configures the target form.
5. The final booking CTA destination: contact form, phone call, external scheduling URL, or Wix Bookings. Until supplied, use a configurable link.
6. The final social profile URLs. Omit unavailable links rather than inventing them.
7. Final approved medical, insurance, pricing, testimonial, and policy copy. Until approval, use source-derived draft content and keep it easy to replace.
8. The specific analytics events the user wants enabled in production. A safe recommended event map may be prepared in code.

Questions about domain transfer, premium plans, historical submissions, contact migration, dashboard ownership, Wix project creation, and automation setup are outside this agent's scope and should not appear as frontend blockers.

---

# 24. First Tasks for the IDE Agent

When the repository is available:

1. Inspect the generated Wix-managed Astro project tree.
2. Read `package.json`, Wix configuration, Astro configuration, TypeScript configuration, and generated documentation.
3. Run the local development environment without modifying production Wix data.
4. Review `https://www.marinholyhillacu.com/` page by page as the existing-site reference.
5. Create a concise content inventory for the frontend: routes, sections, reusable components, images, calls to action, and old URLs.
6. Establish design tokens and the global layout.
7. Build the header, footer, mobile navigation, button styles, typography, and one homepage section.
8. Define stable TypeScript domain types for treatments, conditions, testimonials, pricing, FAQs, and site settings.
9. Implement a mock-data adapter so the UI can be developed before Wix collections are connected.
10. Create the Wix SDK integration folder and stub the future data-access functions without guessing collection IDs or field keys.
11. Build one CMS-driven page template against the adapter.
12. Add clear loading, empty, and error states.
13. Document the exact Wix inputs still needed from the user.
14. Do not attempt domain, dashboard, migration, premium-plan, or old-data tasks.

Recommended first milestone:

- Global layout
- Header and footer
- Responsive navigation
- Homepage hero and one supporting section
- Typed mock data
- One treatment-detail route
- One SDK-ready repository interface
- Basic metadata and accessibility checks

---

# 25. First Milestone Acceptance Criteria

- The Wix-managed Astro project runs locally.
- The current website has been reviewed and reflected in the frontend inventory.
- Global design tokens and layout are implemented.
- Header, footer, and mobile navigation work responsively.
- One homepage section and one detail-page template are implemented.
- Frontend pages consume stable TypeScript domain models rather than raw Wix response objects.
- Mock data can be replaced by a Wix SDK adapter without rewriting page components.
- SDK integration stubs do not guess production collection or form IDs.
- No browser bundle contains privileged credentials.
- The old production website remains unaffected.

---

# 26. Source Inventory

Primary sources:

1. Dr. Kang's 67-page content draft:
   - `웹사이트 Home About US New Patient.docx`

2. Current public website:
   - `https://www.marinholyhillacu.com/`

3. Current Wix project:
   - Site name: Dr. Kang Healing
   - Site ID: `330eb101-1304-4048-a32a-07357d9b4b2b`

4. Wix documentation reviewed:
   - About Wix-Managed Headless
   - About Supported Frameworks
   - About the Astro Integration
   - Quick Start with the Wix CLI
   - Track Analytics Events
   - Wix Forms and Form Submissions documentation
   - Wix JavaScript SDK setup and usage documentation

## 26.1 Extracted static image assets

All 45 images embedded in `웹사이트 Home About US New Patient.docx` have been extracted to:

`public/images/source-document/`

Because Astro copies files in `public/` to the site root, reference these assets in frontend code as `/images/source-document/<filename>`. The document's one EMF image was converted to PNG for browser compatibility; all other files retain their embedded format and original dimensions.

### General, home, and about assets

| File | Intended source-document use |
|---|---|
| `email-contact-icon.png` | Email/contact icon in the document header |
| `home-hero-meditation-sunrise.png` | Homepage hero image with a person meditating at sunrise |
| `dr-kang-headshot.png` | Formal practitioner headshot |
| `dr-kang-acupuncture-home.png` | Homepage photo of Dr. Kang treating a patient |
| `book-now-button-home.png` | Homepage baked-text booking button; do not use in the website UI |
| `dr-kang-acupuncture-about.png` | About/Who We Are photo of Dr. Kang treating a patient |
| `book-now-button-about.png` | About-section baked-text booking button; do not use in the website UI |
| `why-choose-us-family.png` | Family image used by the Why Choose Us section |
| `book-now-button-meet-dr-kang.png` | Meet Dr. Kang baked-text booking button; do not use in the website UI |
| `dr-kang-acupuncture-profile.png` | Meet Dr. Kang practitioner treatment photo |
| `book-now-button-content-sections.png` | Booking button reused throughout New Patient, Services, We Treat, Special, Price, and Contact; do not use in the website UI |

### Treatment assets

| File | Intended source-document use |
|---|---|
| `acupuncture-neck-treatment.png` | Acupuncture treatment image |
| `electro-acupuncture-treatment.png` | Electro-acupuncture treatment image with embedded label |
| `facial-acupuncture-before-after.png` | Facial acupuncture comparison image with embedded label |
| `auricular-acupuncture-ear.jpeg` | Auricular acupuncture close-up |
| `cupping-therapy-back.png` | Cupping therapy on a patient's back |
| `moxibustion-therapy-back.png` | Moxibustion treatment close-up |
| `medical-massage-met-treatment.png` | Medical Massage/MET treatment image |
| `therapeutic-massage-treatment.png` | Therapeutic massage treatment image |
| `facial-healing-acupressure-treatment.png` | Facial healing acupressure treatment image |
| `lymphatic-massage-treatment.png` | Lymphatic massage treatment image |
| `medical-foot-therapy-treatment.png` | Medical foot therapy close-up with embedded label |
| `tcm-formula-consultation.png` | TCM formula consultation with Dr. Kang and a patient |
| `personalized-herbal-prescriptions.png` | Personalized herbal prescription ingredients and packages |
| `family-herbal-formula.png` | Family herbal formula ingredients with embedded label |
| `cupping-therapy-closeup.png` | Cupping Therapy detail-page image with embedded label |
| `moxibustion-therapy-comparison.png` | Two-panel Moxibustion Therapy detail-page image with embedded label |
| `moxibustion-therapy-closeup.png` | Moxibustion Therapy detail-page close-up |
| `herbal-medicine-ingredients.png` | Herbal Medicine detail-page ingredients image |
| `facial-acupuncture-specialty.png` | Facial Acupuncture specialty image with embedded label |

### Specialized-care and condition assets

| File | Intended source-document use |
|---|---|
| `motor-vehicle-accident-care.png` | Motor vehicle injury graphic with promotional text |
| `book-now-button-specialized-care.png` | Motor vehicle injury baked-text booking button; do not use in the website UI |
| `cold-and-allergies.png` | Cold and Allergies condition image with embedded label |
| `book-now-button-specialty-sections.png` | Booking button reused between specialty sections; do not use in the website UI |
| `weight-loss-support.png` | Weight Loss condition image with embedded label |
| `constipation-support.png` | Constipation condition image with embedded label |
| `fertility-support.png` | Fertility Support image with embedded label |
| `oncology-acupuncture-support.png` | Oncology Acupuncture graphic with embedded labels |
| `stress-and-headache.png` | Stress and Headache condition image with embedded label |
| `insomnia-support.png` | Insomnia condition image with embedded label |

### Insurance and social assets

| File | Intended source-document use |
|---|---|
| `insurance-section-heading.png` | Browser-compatible conversion of the document's EMF `#26. Insurance` heading; do not use because it is text baked into an image |
| `facebook-icon.png` | Facebook icon; omit until an approved profile URL is supplied |
| `instagram-icon.jpeg` | Instagram icon; omit until an approved profile URL is supplied |
| `tiktok-icon.png` | TikTok icon; omit until an approved profile URL is supplied |
| `youtube-icon.jpeg` | YouTube icon; omit until an approved profile URL is supplied |

The extracted files are source material, not automatically approved production assets. Follow the image review requirements in Section 17.3 before publishing them. Recreate every booking CTA as an accessible Astro button/link instead of using the baked-text button images. Prefer real, approved practitioner and clinic photography; treat stock-like, AI-like, low-resolution, text-embedded, patient, treatment, before-and-after, insurance, and social-media imagery as provisional until ownership, accuracy, consent, and final usage are confirmed.

---

# 27. Final Project Goal

Build a fast, trustworthy, accessible, and maintainable acupuncture clinic website that:

- Represents Dr. Kang professionally
- Communicates his third-generation and faith-based identity carefully
- Helps patients understand treatments and the first-visit process
- Makes pricing, insurance, location, and contact information easy to find
- Converts visitors into qualified inquiries or appointments
- Uses Wix CMS, Forms, Contacts, Automations, Analytics, and dashboard tools
- Gives Dr. Kang a manageable Wix business backend
- Gives the developer a modern code-first Astro workflow
- Keeps frontend code cleanly separated from Wix dashboard administration
- Uses SDK-ready adapters so the user can connect the project to Wix with ChatGPT
- Avoids the limitations of the current manually assembled Wix Studio site
- Leaves old-site migration and production launch decisions to the user
