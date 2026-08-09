# Production Web Application — Technical Architecture

An anonymized case study of a custom Astro application combining a server-rendered frontend, headless content infrastructure, managed business services, and a direct Google Calendar booking system.

[![Astro 5](https://img.shields.io/badge/Astro-5-BC52EE?logo=astro&logoColor=white)](https://astro.build/)
[![React 18](https://img.shields.io/badge/React-18-149ECA?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
![Server rendered](https://img.shields.io/badge/rendering-SSR-16302A)
[![Google Calendar API](https://img.shields.io/badge/Google_Calendar-API-4285F4?logo=googlecalendar&logoColor=white)](https://developers.google.com/calendar/api)

> The customer identity, production domain, business content, and operational identifiers are intentionally omitted. See the [interactive architecture walkthrough](https://thangta.net/technical-architecture) for a visual presentation of the system.

## Overview

I rebuilt an existing production website as a custom application, with Astro and TypeScript owning the page structure, responsive experience, server logic, and third-party integrations.

The central requirement was to combine complete frontend control with a straightforward operating model. A fully custom backend would have created unnecessary administrative scope, while a conventional builder-led frontend would have constrained the interface and application logic.

The resulting hybrid headless architecture separates presentation from operations. The public application remains custom coded, while structured content, publishing, forms, contact workflows, analytics, and infrastructure are supplied by managed services through SDK and API boundaries.

## Architecture

```text
Browser / visitor
        │
        │ HTTPS
        ▼
Astro application
  ├─ server-rendered pages
  ├─ React islands
  ├─ TypeScript components
  └─ server API routes
        │
        │ typed calls
        ▼
Integration and data layer
  ├─ API adapters
  ├─ domain models
  ├─ guarded fallbacks
  └─ trusted write paths
        │
        ├────────► Managed business platform
        │           CMS · forms · CRM · publishing · analytics
        │
        └────────► External services
                    Google Calendar · Google Cloud · email workflow
```

| Layer | Responsibility |
| --- | --- |
| Frontend system | Page architecture, responsive UI, component system, and interactive React islands |
| Integration layer | Typed adapters, domain models, guarded data access, and server API routes |
| Booking engine | Availability calculation, conflict checks, slot locking, event creation, and confirmation flow |
| Managed services | Content, publishing, forms, contacts, analytics, hosting, CDN, and SSL |
| External services | Google Calendar scheduling, Google Cloud authentication, and confirmation delivery |

## Architectural tradeoff

| Approach | Tradeoff |
| --- | --- |
| Fully custom application | Maximum product control, but also requires building and maintaining a custom admin, CMS, forms stack, and operations layer |
| Traditional site builder | Straightforward day-to-day management, but less control over frontend architecture and application behavior |
| **Hybrid headless architecture** | **A code-owned frontend backed by managed content and business services** |

The ownership boundary is deliberate: code owns the customer experience; managed services own routine business operations.

## Frontend architecture

### Server rendering with selective hydration

The application is configured for Astro server output. Content-heavy pages render as complete HTML documents, while React is reserved for interactions that benefit from client-side state:

- the multi-step booking workflow;
- the schema-driven contact form;
- rich-content article rendering; and
- mobile navigation.

This avoids turning the project into a full single-page application while still supporting stateful workflows where they add value.

### Component system

The UI is organized into layouts, reusable page sections, and small interface primitives. Global design tokens define typography, color, spacing, radii, and responsive behavior. Page-specific and component-specific styles remain close to the markup they support.

Responsive image variants are generated ahead of time and rendered with explicit dimensions, `srcset`, and intentional loading behavior.

### SEO and accessibility

The implementation includes:

- canonical URLs, descriptions, Open Graph metadata, and social preview images;
- managed metadata for published articles;
- JSON-LD structured data;
- a dynamic sitemap containing static and content-driven routes;
- semantic page structure and breadcrumbs;
- skip navigation and labeled controls; and
- focus management and accessible form-validation states.

## Headless data architecture

Application code and business content have separate lifecycles. Developers own route structure, components, styling, domain logic, and integrations. Authorized operators can update structured records, scheduling configuration, and published articles without editing frontend code.

Pages and components do not consume raw SDK responses. The integration layer translates external records into TypeScript domain models, applies publication rules, normalizes media, sorts display data, and centralizes fallback behavior.

```text
External SDK / API
        ↓
Typed adapter layer
        ↓
Domain models
        ↓
Astro pages and React components
```

This boundary reduces coupling, contains vendor-specific response formats, and gives the presentation layer predictable application contracts.

## Custom booking system

The scheduling workflow uses Google Calendar as the source of truth for busy time and confirmed events. The application owns the rules around which times may be offered and how a booking progresses from request to confirmation.

### Availability pipeline

1. Load active services and scheduling configuration.
2. Apply operating windows, closures, lead time, booking horizon, and slot duration.
3. Request fresh busy periods from every configured blocking calendar.
4. Normalize external time ranges into domain intervals.
5. Remove overlapping or otherwise ineligible candidate slots.
6. Return only verified availability to the browser.

All scheduling values are normalized through one business-local time boundary before being converted to unambiguous UTC and RFC 3339 timestamps.

### Reservation and event creation

The booking endpoint does not trust availability previously shown in the browser. It validates the current managed configuration and recomputes availability immediately before attempting a write.

```text
Validate request
      ↓
Recheck live availability
      ↓
Acquire deterministic per-slot reservation
      ↓
Create Google Calendar event
      ↓
Record successful booking
      ↓
Trigger confirmation workflow
```

A deterministic identifier derived from the scheduling context and slot start acts as an application-level concurrency lock. Two near-simultaneous requests for the same slot cannot both reserve it. Fresh in-progress locks are respected, stale interrupted records can be recovered, and a reservation is released if calendar event creation fails.

Calendar destinations are configuration-driven rather than hardcoded. This preserves the operator's established calendar organization while keeping the routing rules explicit in the application layer.

Confirmation delivery is decoupled from the authoritative scheduling result. After the calendar write succeeds, a limited payload triggers a managed email workflow. A notification failure therefore does not incorrectly report that an already-created event failed.

## Publishing, forms, and analytics

### Content publishing

Authorized editors publish through an external content service. The frontend queries the publishing API, maps posts into typed article models, resolves managed media, paginates listings, renders rich content, and loads managed SEO metadata for detail routes.

### Contact workflow

The custom form reads its schema from a managed forms service. Field definitions, labels, requirements, options, and validation constraints are projected into a small frontend model and rendered by a React island.

Submissions pass through a trusted Astro endpoint that:

- enforces a request-size limit;
- rejects unexpected fields;
- validates against the current server-side schema;
- normalizes supported input formats;
- maps service validation errors back to individual controls; and
- sends accepted submissions into managed forms and contact infrastructure.

### Analytics

The application emits a fixed event vocabulary for page views, calls to action, booking interactions, contact actions, and form outcomes. Events include the interaction type and page section, not submitted form values or personal details.

## Privacy and security

- API credentials and privileged service operations remain in server-only modules.
- Google access tokens are minted through signed JWT assertions using Web Crypto and cached only until shortly before expiry.
- Browser bundles receive display data and availability, never trusted integration credentials.
- Contact and booking payloads are size-limited and validated on the server.
- Request bodies are not intentionally logged.
- Analytics events exclude personally identifiable submission data.
- Confirmation delivery receives only the fields required for the notification workflow.
- Public content is filtered through explicit publication and consent rules where applicable.
- Local secrets, generated platform state, and service-account material are excluded from version control.

These safeguards describe the implemented trust boundaries; they are not a claim of regulatory certification.

## Engineering decisions

| Decision | Rationale |
| --- | --- |
| Astro instead of a full SPA | Content-heavy pages remain server rendered; React is reserved for stateful interactions |
| Headless services instead of a custom admin | Operators retain a mature management interface without coupling it to the public UI |
| Adapters instead of raw SDK calls | External response formats remain isolated from page components |
| Google Calendar instead of a scheduling suite | The product needed a focused direct-booking flow around an existing calendar workflow |
| Server API routes for writes | Trusted operations and credentials stay out of browser bundles |
| Live revalidation before booking | Previously displayed availability is never treated as authoritative |
| Deterministic per-slot locking | Concurrent requests cannot both claim the same appointment |
| Configuration instead of hardcoding | Content and scheduling rules can evolve without presentation-layer edits |
| Guarded reads with curated fallbacks | Essential public pages remain usable during transient service failures |

## Technology stack

| Area | Technology |
| --- | --- |
| Frontend | Astro 5, React 18, TypeScript, semantic HTML, scoped CSS |
| Architecture | Server-side rendering, React islands, domain models, typed adapters, server API routes |
| Managed services | Headless CMS, forms and CRM, article publishing, analytics, hosting, CDN, SSL |
| External APIs | Google Calendar API, Google Cloud, managed email confirmation workflow |
| Authentication | Service account, JWT bearer flow, Web Crypto |
| Tooling | npm scripts, managed platform CLI, Sharp-based image optimization |

## Repository structure

```text
src/
├── components/
│   ├── articles/        # Article cards and rich-content rendering
│   ├── booking/         # Multi-step React booking workflow
│   ├── forms/           # Schema-driven React contact form
│   ├── layout/          # Shared shell, metadata, breadcrumbs, JSON-LD
│   ├── sections/        # Reusable page-level sections
│   └── ui/              # Design-system primitives
├── content/             # Curated fallback and static editorial content
├── layouts/             # Shared Astro document layout
├── lib/
│   ├── booking/         # Availability, locking, routing, time, confirmation
│   ├── google/          # Server-only Google auth and Calendar client
│   └── …                # Analytics, forms, CMS, and publishing adapters
├── pages/
│   ├── api/             # Contact and booking endpoints
│   ├── articles/        # Published article routes
│   └── …                # Content-driven application routes
├── styles/              # Global styles and design tokens
└── types/               # Domain models
```

## Local development

### Prerequisites

- Node.js 20.11 or newer
- npm
- Authorized access to the linked managed project for live service data
- Private runtime configuration supplied out of band for Calendar integration

### Setup

```bash
git clone <repository-url>
cd <repository-directory>
npm install
npm run dev
```

The managed development command starts the local server with hot reload and an authenticated service context. A direct Astro server is also available for frontend-focused work:

```bash
npm run start
```

### Validation

```bash
npm run build
npm run preview
```

The build command exercises the production server adapter and is the primary compilation check. Production release access remains separate from local development.
