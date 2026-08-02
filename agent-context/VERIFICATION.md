# Redesign Verification Record

**Run date:** August 2, 2026

This file records evidence against `CURRENT_PLAN.md` §13. It is updated from actual commands and deployed state rather than intent.

| Requirement | Evidence | Status |
|---|---|---|
| Approved navigation + external Book CTA | Live navigation is Home, Dr. Kang, New Patient, Services, Conditions, VA & Insurance, Contact; 82 audited Book links use the supplied CMS Zocdoc URL, `_blank`, and `noopener noreferrer` | Pass live |
| All routes render with unique metadata | Production audit returned 200 for all 27 public HTML routes plus `/sitemap.xml`, `/pages-sitemap.xml`, and `/robots.txt`; all 27 pages have unique titles and descriptions | Pass live |
| Mesa + Payson details | Live contact page renders both supplied addresses and phones with deterministic Google Maps actions; Payson displays `Opening soon` and no hours | Pass live |
| CMS-backed service/condition pages | Pages call guarded typed adapters; production serves 14 service and six condition-category detail routes from migrated Wix data | Pass live |
| Graceful SDK failure/empty state | Every adapter wraps Wix calls in `try/catch`; local missing-collection errors rendered fallback content and all checked pages remained HTTP 200 | Pass |
| Form validation and privacy | Client mirrors required/email/phone/length rules, renders/focuses an error summary; server validates before Wix; live empty POST returns 422 with four required-field errors; privacy warning renders; no request-body logging | Pass; one real submission remains an intentional client QA step |
| Compliance copy and review log | `CONTENT_REVIEW.md` has one row per route/page and identifies every softened/dropped claim; prohibited-claim search reviewed; testimonial adapter requires both `published` and `consentConfirmed` and fails closed | Pass pending client approval |
| Responsive optimized images | 45 source images emitted as 90 WebP variants (800/1600), reducing 33 MB to 3.0 MB; referenced images carry dimensions, alt, loading, and decoding attributes; prohibited baked-text assets have no `src/` references | Pass |
| Accessibility | Semantic landmarks; one h1 per template; focus-visible ring; 44 px controls; mobile focus trap/Escape/restore; reduced motion; form labels/errors; light-surface normal text contrast 6.34:1 and amber text 4.79:1 | Pass in code/static audit; client visual QA recommended |
| Privacy/secrets/analytics | Secret scan clean; `.env.local` and `.wix/` untracked; deployed event bundle contains page/CTA/booking/phone/directions/form-start/form-success/form-failure events carrying only event + section; exactly two React islands | Pass live |
| SEO discovery | Wix sitemap index links `pages-sitemap.xml`; the expanded Wix page registry and canonical pages sitemap contain exactly all 27 public HTML URLs; robots points to the sitemap | Pass live |
| Build/release | `npx tsc --noEmit` passed; final `npm run build` completed and processed 27 routes; site published to the Wix host and spot-checked. Two corrective publishes followed the initial release: one for Wix's dynamic-page sitemap registry and one to make testimonial consent fail closed. | Pass with documented corrective publishes |
| Documentation | Stale context references fixed; architecture/routes/collections/status, redirect map, content review, source extraction, and this verification record added | Pass |

## Live CMS migration

The idempotent migration completed against site `c68648ed-1577-4028-86b1-7312970b1945`. Independent reads verified public-read schemas and the following live row totals: `Treatments` 17 (14 published + 3 retired placeholders), `Conditions` 34 (31 published + 3 retired placeholders), `SiteSettings` 1, `Locations` 2, `InsuranceProviders` 8, `Pricing` 10, and `Testimonials` 3. Testimonial `consentConfirmed` remains false pending client approval.

The final production audit passed 18/18 assertions across 30 requested resources. It covered route status, canonical service links, supplied Zocdoc behavior, location details, medical/insurance guardrails, deployed analytics, sitemap/robots, Mesa-only LocalBusiness JSON-LD, unique metadata, and server-side rejection of an invalid contact submission. A separate post-release privacy check confirmed the three testimonial names and the entire testimonial section are absent while consent remains unconfirmed.

## Dependency audit

`npm audit --omit=dev` reports no critical findings and four upstream/no-fix entries: Astro (high, view-transition/spread-attribute vectors unused here), Sharp/libvips (high, used only at build time on trusted repository images), `@wix/astro-pages` (low), and esbuild (low, development-server scope). Astro is intentionally held at Wix-supported major version 5.
