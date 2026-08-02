# Marin Holy Hill Acupuncture Website Redesign
## Project Context for the IDE Coding Agent

**Status:** Active frontend build on a working Wix-managed Astro foundation  
**Last updated:** August 2, 2026  
**Business:** Marin Holy Hill Acupuncture Clinic  
**Current public site:** `https://www.marinholyhillacu.com/`  
**New headless site:** `https://marin-holy-17907997-marinholyhillacu.wix-site-host.com`  
**Implementation:** Astro + React islands + Wix-managed hosting + Wix JavaScript SDK

This file is the complete business, content, UX, and project-scope source of truth for the coding agent. The agent should not depend on any external requirement attachments. Use `ARCHITECTURE.md` for how the system works and `DEVELOPMENT.md` for the development workflow and Wix procedures.

---

# 1. Authority and Update Rules

Treat this file as the complete source of truth for business requirements, content scope, page structure, and frontend priorities.

- The requirements written here represent Dr. Kang's latest direction.
- Use the current public website at `https://www.marinholyhillacu.com/` only as a reference for existing URLs, approved public content, visitor flows, testimonials, and details not covered here.
- All relevant requirements and useful background details are incorporated into the sections below.
- The user's newest explicit instruction always overrides this file.
- Use clearly labeled placeholders only when neither this file nor the current website provides a usable value.

Keep uncertain business values centralized in Wix CMS or configuration so they can be corrected without redesigning components.

---

# 2. Agent Responsibilities

The coding agent owns:

- Astro routes, layouts, reusable components, styling, responsive behavior, and accessibility.
- The design system, typography, spacing, buttons, cards, menus, forms, and page sections.
- Wix SDK data adapters, domain types, server endpoints, CMS-backed pages, and safe analytics calls.
- Wix-managed build and release work using the already-linked project.
- Updating CMS schemas or seed scripts when a frontend requirement needs new structured data.
- Loading, empty, validation, and failure states.
- SEO metadata, sitemap/robots support, structured data, and redirect documentation.

The agent does not own:

- Domain/DNS transfer, premium plans, billing, or account ownership.
- Historical contact or form-submission migration from the old Wix Studio project.
- Final approval of medical, insurance, pricing, testimonial, legal, or policy wording.
- Interactive Wix login when the user must approve access in a browser.
- Deleting the old production site or the abandoned Wix project.

Important project rule: the Wix-managed Astro project is already connected. Reuse its existing `wix.config.json`, `siteId`, and `appId`. Never run another init or headless-link flow.

---

# 3. Project Goal

Replace the current manually assembled Wix Studio site with a modern, trustworthy, patient-focused clinic website that:

- Presents Dr. Kang as the central trust figure.
- Explains his background, family tradition, education, faith, and care philosophy.
- Makes services and conditions easy to understand and browse.
- Gives new patients clear preparation and aftercare guidance.
- Highlights VA participation, insurance options, pricing, and auto-injury support.
- Supports both the Mesa and Payson clinic locations.
- Uses strong, clear contact and booking calls to action.
- Is fast, accessible, responsive, locally searchable, and easy to maintain.
- Lets clinic content be edited in Wix without changing frontend code.

Dr. Kang has approved organizing the site in the most effective way based on professional judgment. Do not copy the original draft layout literally. Preserve its requested content and hierarchy while improving usability and presentation.

---

# 4. Current System State

## Old production project

- Site name: **Dr. Kang Healing**
- URL: `https://www.marinholyhillacu.com/`
- Wix site ID: `330eb101-1304-4048-a32a-07357d9b4b2b`
- Wix Studio, published, premium plan, custom domain connected, Velo enabled.
- Contains existing pages, forms, contacts, historical submissions, and analytics history.
- Remains live and untouched during development; use it as a content/URL reference and rollback archive.

The old site is mostly an informational website. Wix Bookings is installed but no real booking services were configured. Its booking flow has historically directed visitors to contact-style pages or Zocdoc rather than a complete Wix scheduler.

## New Wix-managed Astro project

- Project name: **Marin Holy Hill Acupuncture**
- `siteId`: `c68648ed-1577-4028-86b1-7312970b1945`
- `appId`: `6b6784ba-48b1-47bb-8a5a-86ddb8545b2f`
- Live Wix host URL: `https://marin-holy-17907997-marinholyhillacu.wix-site-host.com`
- Dashboard: `https://manage.wix.com/dashboard/c68648ed-1577-4028-86b1-7312970b1945`
- Existing CMS collections: `Treatments`, `Conditions`, `SiteSettings`
- Existing contact form ID: `ef70c223-ff89-4a90-a784-9de20cc87b69`
- Existing contact targets: `first_name`, `last_name`, `email`, `phone`, `message`
- Existing SDK boundary: `src/lib/wix/data.ts`
- Existing structural IDs: `src/lib/wix/config.ts`
- Existing domain types: `src/types/content.ts`

The foundation already works end to end: CMS data renders on the homepage and treatment pages, and the contact page reads the Wix form schema and posts through a server route. The current visual design and seeded content are placeholders.

There is an abandoned Wix site from an earlier attempt with site ID `ca662f24-2101-45db-b1e6-d717ea15300e`. Do not use it.

---

# 5. Latest Dr. Kang Update

Dr. Kang requested a simpler primary structure:

- Home
- Dr. Kang
- New Patient
- Services
- Treats
- VA & Insurance
- Contact
- Book

Treat **Book** as a prominent CTA, not necessarily a separate content-heavy page. Do not build a full Wix Bookings system unless requested.

## Confirmed booking destination

**Confirmed August 2, 2026.** Book routes to the clinic's Zocdoc profile:

```
https://www.zocdoc.com/practice/marin-holy-hill-acupuncture-clinic-175973?lock=true&isNewPatient=false&referrerType=widget
```

Implementation requirements:

- Store this URL in `SiteSettings.bookingUrl` so it can be changed in the Wix dashboard without a code release. Never hard-code it in a component. The `getSiteSettings()` fallback in `src/lib/wix/data.ts` should also use it instead of `/contact`.
- Every Book CTA links to it and opens in a new tab with `rel="noopener noreferrer"`, since it leaves the site for a third-party scheduler.
- Fire a no-PII booking-click analytics event, recording only which section the click came from.
- Keep `/contact` and click-to-call as visible secondary paths for visitors who would rather not use an online scheduler.

`TODO: CONFIRM THE QUERY STRING.` `isNewPatient=false` preselects a returning patient, and `referrerType=widget` indicates the link was copied from an embed snippet. Most website Book traffic is new patients, so confirm whether the site should use `isNewPatient=true`, omit the parameter so Zocdoc asks, or offer separate new-patient and returning-patient CTAs.

Dr. Kang is also preparing a second clinic. The Contact experience must show both locations with separate address, phone, map, and directions actions.

### Mesa Clinic

- Address: `1933 W. Main St. #1, Mesa, AZ 85201`
- Phone: `(480) 730-4991`
- Public email: `marinholyhillacu@gmail.com`
- Draft hours from the older requirements/current content:
  - Monday-Friday: 8:30 AM-6:00 PM
  - Saturday: 9:00 AM-4:00 PM
  - Sunday: Closed

### Payson Clinic

- Address: `600 E. Hwy 260 #5, Payson, AZ 85541`
- Phone: `(928) 595-2018`
- Hours: not supplied; do not invent them.

Build the locations UI from structured data. The current single-location `SiteSettings` model should evolve to either a `Locations` CMS collection or an equivalent structured location model. Each location should support name, address, phone, hours, map URL/embed, directions URL, display order, and active status.

---

# 6. Brand and Practitioner Context

## Clinic identity

Use **Marin Holy Hill Acupuncture Clinic** as the working public name. The old Wix project name, “Dr. Kang Healing,” is historical and should not control the new branding.

## Dr. Kang

Public name: **Dr. Hyo-won Kang**. Some older content uses **Dr. Hyo-won Henry Kang**. Keep the display name centralized so it can be confirmed later.

Current practitioner profile:

- Born in Korea.
- Majored in theology at Sungwha Theology.
- Completed a Master's degree in Oriental Medicine at Samra Acupuncture School.
- Pursued a Doctor of Acupuncture and Oriental Medicine (DAOM) at South Baylor Acupuncture School.
- Comes from a family of traditional practitioners and learned acupuncture and herbal medicine from a young age.
- Also studied therapeutic massage, osteopathy, and spiritual healing under different mentors.
- Presented as a third-generation practitioner with 28 years of clinical experience.
- Uses pulse diagnosis, physical palpation, and whole-person assessment.
- Emphasizes individualized treatment based on constitution, diet, lifestyle, genetics, life circumstances, seasons, weather, and temperature.
- Describes his approach as traditional medicine interpreted through a modern lens.
- Begins diagnosis and treatment with prayer and expresses sincere Christian faith.
- Explicitly recognizes that no practitioner can accurately diagnose or cure every condition and emphasizes sincerity and dedication.

Brand themes:

- Third-generation tradition
- 28 years of clinical experience
- Personalized care
- Root-cause and whole-person thinking
- Traditional medicine with modern understanding
- Compassion and sincerity
- Body, mind, and spirit
- Christian faith and prayer

Keep faith visible but welcoming. Do not imply divine guarantees or guaranteed healing.

---

# 7. Information Architecture and Page Requirements

## 7.1 Home

The homepage should quickly communicate who Dr. Kang is, what the clinic offers, where it operates, and how to take the next step.

Recommended sequence:

1. Hero: clinic identity, concise benefit statement, primary Book CTA, secondary Call/Contact CTA.
2. Trust summary: third-generation practice, 28 years, personalized care, Mesa and Payson.
3. Meet Dr. Kang preview.
4. Featured services.
5. Conditions/Treats overview.
6. Why choose Dr. Kang.
7. New-patient process preview.
8. VA and insurance preview.
9. Two clinic locations with maps and phones.
10. Final booking/contact CTA.

Use concise language. Avoid unsupported “cure,” “instant,” “zero side effects,” or guaranteed-result claims.

## 7.2 Dr. Kang

This page should contain three clear sections.

### Meet Dr. Hyo-won Kang

Use the biography in Section 6. Present education, traditional family background, diagnostic approach, prayer, humility, and dedication in polished, patient-friendly language.

### Why Choose Dr. Kang?

Core points:

- Deep care and determination to help patients.
- Third-generation traditional medicine heritage.
- 28 years of clinical experience.
- Traditional medicine interpreted through a modern lens.
- Focus on the individual rather than a one-size-fits-all method.
- Treatment decisions consider constitution, diet, lifestyle, genetics, circumstances, seasons, weather, and temperature.
- Personalized care based on clinical experience and broad study.

Do not publish the claim that he can “diagnose unseen internal illnesses” without careful rewriting and approval.

### Chronic & Complex Diseases

Explain that chronic and complex conditions may involve multiple factors such as genetics, lifestyle, aging, inflammation, circulation, immune function, and nervous-system balance. Present Dr. Kang's role as supportive, personalized, integrative care that may complement appropriate medical treatment and healthy lifestyle changes.

Source examples include cancer, allergies, arthritis, Parkinson's disease, stroke recovery, chronic fatigue, insomnia, anxiety, and depression. These examples require careful wording. Never imply that acupuncture replaces oncology, neurology, emergency, or mental-health care.

## 7.3 New Patient

Create one organized page with these sections.

### Your First Visit: six steps

1. **Check-in and registration:** arrive 15 minutes early; bring photo ID and insurance card.
2. **Initial assessment:** review health history and current concerns.
3. **Comprehensive consultation:** discuss medical history, lifestyle, goals, and traditional tongue/pulse assessment.
4. **Personalized care plan:** develop a plan based on the patient's needs and assessment.
5. **First treatment:** may include acupuncture and, when appropriate, cupping, moxibustion, massage/Tui Na, or herbal support.
6. **Aftercare and next steps:** provide lifestyle guidance and recommend an appropriate follow-up schedule.

Quick preparation guidance:

- Eat a light meal 1-2 hours before the appointment.
- Wear loose, comfortable clothing.
- Avoid strenuous activity after the visit.

### Treatment plan

Explain that plans are individualized and may combine acupuncture, cupping, moxibustion, massage, and herbal medicine. Improvement varies by person; avoid guaranteeing immediate or long-lasting results.

Three draft phases:

- **Relief Phase, approximately 1-4 weeks:** focus on comfort and primary symptoms.
- **Corrective Phase, approximately 4-12 weeks:** focus on longer-term patterns and structural/functional balance.
- **Wellness Phase, ongoing:** maintenance visits every 2-4 weeks or seasonally when appropriate.

The timelines are draft guidance, not promises.

### Post-treatment wellness guide

General focus:

- Hydration
- Warm, easy-to-digest meals
- Rest and sleep
- Listening to the body's response
- Keeping treated areas comfortable and warm when advised

General avoid list:

- High-intensity exercise immediately after treatment
- Alcohol and stimulants
- Heavy, greasy meals
- Excessive screen strain
- Sudden cold exposure when the practitioner advises against it

Treatment-specific guidance:

- Acupuncture: relaxation, mild light-headedness, fatigue, or minor bruising may occur; rest and avoid scratching treatment points.
- Cupping: temporary circular marks and tenderness may occur; protect sensitive skin and follow practitioner bathing guidance.
- Moxibustion: warmth may remain after the session; avoid sudden temperature changes.
- Massage/manual therapy: mild soreness may occur; avoid heavy lifting for the rest of the day when advised.
- Herbal medicine: take only as prescribed and report unexpected changes.

Contact the clinic for persistent dizziness, discomfort that does not improve with rest, dosage questions, or schedule adjustments. All aftercare statements must be medically reviewed before final publication.

## 7.4 Services

The updated launch service list is:

1. Acupuncture
2. Electric Acupuncture / Electro-acupuncture
3. Facial Acupuncture
4. Ear Acupuncture / Auricular Acupuncture
5. Moxa / Moxibustion
6. Medical Massage / Muscle Energy Technique (MET)
7. Lymphatic Massage
8. Herbal Medicine
9. Auto Injury Care

Use these as the primary service routes/cards. Names should be polished for consistency while preserving Dr. Kang's terminology.

Concise service descriptions:

- **Acupuncture:** uses very fine needles at selected points; presented for pain management, relaxation, circulation, sleep, and whole-person balance.
- **Electric Acupuncture:** applies mild electrical stimulation through selected needles; presented for pain, muscle activation/relaxation, nerve-related symptoms, and swelling support.
- **Facial Acupuncture:** cosmetic and wellness-focused acupuncture presented for circulation, facial tone, skin texture, and complexion.
- **Ear Acupuncture:** uses points on the ear and is presented for stress, sleep, cravings, appetite, and pain support.
- **Moxibustion:** a warming therapy using moxa; presented for circulation, stiffness, digestive comfort, cold sensations, and women's wellness.
- **Medical Massage / MET:** an active manual technique using post-isometric relaxation and reciprocal inhibition; presented for range of motion, tight muscles, muscular imbalance, mobility, and swelling support.
- **Lymphatic Massage:** very gentle, rhythmic manual therapy following lymphatic pathways; presented for relaxation and fluid/swelling support.
- **Herbal Medicine:** individualized traditional formulas adjusted to constitution, digestion, symptoms, and progress; the herbal offering may also include personalized prescriptions and family formulas.
- **Auto Injury Care:** integrative support after motor-vehicle injuries, potentially combining acupuncture and manual therapies, with documentation/billing assistance when coverage applies.

These are draft content directions, not approved clinical claims. Strong mechanisms and outcome promises must be softened or omitted.

## 7.5 Treats

The requested navigation includes a **Treats** page. Use the following condition categories as its initial structure:

### Pain and injury

- Neck and shoulder pain
- Frozen shoulder
- Upper/inter-scapular pain
- Lower-back pain
- Sciatica
- Neuropathy/neuralgia
- Headaches and migraines
- Arthritis and joint pain
- Sports, work, and auto injuries

### Mental and emotional wellness

- Stress and anxiety
- Depression and mood concerns
- Insomnia
- Emotional imbalance
- Fatigue

### Immune and respiratory

- Allergies and sinus concerns
- Asthma and coughing
- Colds, flu, and seasonal wellness

### Energy and digestive

- Chronic fatigue
- Indigestion, gas, and bloating
- Acid reflux and IBS
- Constipation and diarrhea

### Women's health

- PMS and menstrual pain
- Irregular cycles
- Menopause symptoms
- PCOS
- Uterine fibroids
- Fertility support

### Skin and facial wellness

- Skin allergies
- Acne and dermatitis
- Eczema and psoriasis
- Facial acupuncture for cosmetic wellness

Use category/index pages and reusable condition templates. Do not generate detailed disease-treatment claims simply because a condition is listed. Condition pages should clearly frame acupuncture as supportive care and encourage appropriate medical evaluation.

## 7.6 VA & Insurance

This is a primary navigation page and a major trust/conversion section.

Current draft business information:

- The clinic describes itself as an official VA Acupuncture Provider.
- VA care requires prior authorization.
- The clinic states that it welcomes UnitedHealthcare, Blue Cross Blue Shield, UMR, Cigna, SCAN, Humana Medicare, Aetna, and Workers' Compensation.
- The current in-network list is: UnitedHealthcare, Blue Cross Blue Shield, Cigna, SCAN, Humana Medicare, Aetna, and Federal Employee Insurance.
- Motor-vehicle accident coverage may apply, with documentation and billing support.
- Workers' Compensation coordination may be available.
- HSA and FSA cards may be accepted; itemized receipts can be provided.
- Out-of-network patients may request a superbill for possible reimbursement.
- Travel-insurance coverage varies and must be verified directly with the insurer.
- Acupuncture coverage depends on each individual plan. Tell visitors to confirm benefits with their insurer.

Do not publish payer-network status until verified. UMR is mentioned as welcomed but not included in the separate in-network list, so do not silently classify it.

### Draft pricing

- New Patient: initial consultation and treatment — **$130**
- Comprehensive returning-patient follow-up — **$120**
- Focused acupuncture-only follow-up — **$80**
- Medical Massage / MET — **$80**
- Facial Acupuncture — **$80**
- Cupping — **$50**
- Moxibustion — **$50**
- Facial Acupressure — **$50**
- Foot Reflexology — **$50**
- Custom Herbal Formula — **$80**, ingredients may change the price

Payment options include pay-per-visit and package plans, but package pricing and discounts have not been provided. It also says new pricing takes effect January 1 each year. Treat all prices as drafts until Dr. Kang confirms them.

## 7.7 Contact

The Contact page must include:

- A reusable location card for Mesa.
- A reusable location card for Payson.
- Address, click-to-call phone, map, directions link, and available hours for each location.
- The Wix-backed contact form.
- A privacy warning: “Please do not include private medical details or sensitive health information in this form.”
- Clear booking/contact choices: Book opens the Zocdoc scheduler from Section 5 in a new tab, alongside click-to-call and the form as alternatives.

Do not show social icons until real profile URLs are supplied.

---

# 8. Content and Data Model Direction

Keep page components independent from raw Wix objects. Use typed adapters in `src/lib/wix/`.

Current collections:

- `Treatments`
- `Conditions`
- `SiteSettings`

Expected additions or extensions:

- `Locations` for Mesa and Payson
- Optional `InsuranceProviders`
- Optional `Pricing`
- Optional `Testimonials`
- Optional `FAQs`

Recommended `Locations` fields:

- `name`
- `slug`
- `addressLine1`
- `addressLine2`
- `city`
- `state`
- `postalCode`
- `phone`
- `email`
- `weekdayHours`
- `saturdayHours`
- `sundayHours`
- `mapUrl`
- `directionsUrl`
- `displayOrder`
- `active`

Keep the booking destination, business name, practitioner display name, public email, disclaimer, and social links centralized in CMS/configuration. The booking destination is the confirmed Zocdoc URL in Section 5; seed it into `SiteSettings.bookingUrl` rather than repeating it in components.

Do not hard-code curated treatment or condition IDs in page components. Use `featured`, `published`, category, and display-order fields.

---

# 9. Image and Media Direction

The existing extracted image library remains the approved working asset pool. Continue using the assets in:

`public/images/source-document/`

The existing extracted images remain valid source material for the redesign.

Priority:

1. Real, approved photos of Dr. Kang and the clinic.
2. Appropriate treatment images already extracted into the project.
3. Licensed supporting imagery only when necessary.

Do not use the extracted “Book Now” images or other text baked into images. Recreate those elements as accessible HTML buttons and headings.

Before publishing any patient, treatment, before/after, or practitioner image, verify ownership, model/patient consent, accuracy, and suitability. Add useful alt text and optimize image dimensions/formats.

---

# 10. Forms, Privacy, and Analytics

The frontend uses a custom form UI that submits to Wix Forms through a server endpoint.

Requirements:

- Validate on both client and server.
- Never log request bodies.
- Do not expose secrets or elevated permissions to browser code.
- Do not send names, emails, phones, messages, symptoms, appointment details, or health information to analytics.
- Confirm that a production test submission appears in Wix Forms and behaves correctly in Contacts/Automations before launch.
- Use safe analytics events such as page views, CTA clicks, phone clicks, directions clicks, booking clicks, form start, form success, and form failure, without personal data.

Historical forms and contacts from the old Wix Studio site do not automatically transfer to the new project.

---

# 11. Medical, Insurance, and Legal Safety

All medical, insurance, pricing, and promotional copy in this file is draft content until approved.

Do not publish claims equivalent to:

- Cure or permanent resolution
- Guaranteed root-cause healing
- Instant relief
- Zero side effects
- Repairing nerve pathways
- Detoxifying the body
- Preventing recurrence
- Treating cancer, Parkinson's disease, infertility, autoimmune disease, or mental illness as a replacement for medical care
- Guaranteed insurance coverage or reimbursement

Use careful language such as “may support,” “is commonly used to help manage,” or “can be part of an integrative care plan,” where appropriate and approved.

Final approval is required for:

- Credentials and education wording
- Years of experience
- Medical claims
- VA provider status
- Insurance network status
- Prices and packages
- Testimonials and consent
- Privacy policy, terms, medical disclaimer, cancellation/payment policies, and analytics/cookie notices

---

# 12. UX, Accessibility, SEO, and Performance

Requirements:

- Mobile-first responsive design.
- Semantic landmarks and correct heading hierarchy.
- Keyboard-accessible navigation and visible focus states.
- Sufficient color contrast and reduced-motion support.
- Proper form labels, validation messages, and error summaries.
- Descriptive links, useful image alt text, and large touch targets.
- Astro components for static content; hydrate React only when interaction needs client state.
- Optimized responsive images, efficient fonts, and minimal third-party scripts.
- Clean slugs, unique titles/descriptions, canonical URLs, sitemap, robots rules, breadcrumbs, internal links, and local-business structured data after facts are verified.
- Inventory old URLs and prepare redirects, especially weak legacy routes such as `/blank`, `/blank-1`, `/blank-2`, and `/bookingpage`.

---

# 13. Immediate Frontend Priorities

1. Update navigation to the new structure and make Book a prominent configurable CTA.
2. Add the two-location data model and reusable location UI.
3. Build or revise the Dr. Kang page around Meet, Why Choose, and Chronic & Complex Diseases.
4. Build the New Patient page with first-visit steps, treatment phases, and aftercare.
5. Align the Services index and detail routes to the nine updated services.
6. Build the Treats category experience using the fallback condition groups in this document.
7. Build VA & Insurance with draft pricing and strong verification disclaimers.
8. Revise Home to preview the key sections and both locations.
9. Keep the existing Wix SDK adapter pattern and graceful fallback behavior.
10. Build once, verify, and release once after the frontend change set is complete.

---

# 14. Definition of Done

The redesign is ready for client review when:

- The new navigation and Book CTA are implemented.
- Home, Dr. Kang, New Patient, Services, Treats, VA & Insurance, and Contact are complete and responsive.
- Mesa and Payson appear with correct phone, address, map, and directions behavior.
- Service and condition pages use reusable typed CMS adapters.
- The Wix contact form has safe validation and tested dashboard submission behavior.
- Draft/uncertain claims and prices remain clearly controlled and easy to update.
- Existing extracted images are used selectively and accessibly.
- The site passes basic accessibility, mobile, performance, SEO, and broken-link checks.
- No secrets or personal/health information enter browser bundles, logs, or analytics.
- The old production site and its historical data remain untouched until launch planning is approved.
