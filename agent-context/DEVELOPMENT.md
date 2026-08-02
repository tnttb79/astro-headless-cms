# Development Process — Marin Holy Hill Acupuncture

**Audience:** developers and AI coding agents building on this application.
**Purpose:** a repeatable, safe process for making changes. Follow it top to bottom.
**Last updated:** August 1, 2026

> Read alongside:
> - `ARCHITECTURE.md` — how the system works.
> - `MARIN_HOLY_HILL_PROJECT_CONTEXT.md` — business context, scope boundary, and compliance rules (authoritative).
> - `.agents/skills/wix-headless/SKILL.md` — the canonical, always-current Wix procedure. **When Wix mechanics here conflict with the skill or live Wix docs, the skill/docs win** (Wix APIs evolve).

---

## 0. Golden rules (read first)

1. **This is a `managed` + `iterate` Wix project.** It is already connected (`wix.config.json` exists). **Never run `init` or `headless link` again** — that provisions a *new* site. Reuse the existing `siteId`.
2. **Content vs. code.** Adding/editing content rows is a dashboard or data-API action (no release). Only *code* changes require `wix build` + `wix release`.
3. **Release once, at the end.** Do not `build && release` repeatedly to preview. Content is fetched live at runtime, so a re-release does **not** refresh content — only re-release when the **frontend build output** changed.
4. **Compliance (from the context doc §17):** all seeded/authored medical, insurance, pricing, and testimonial copy is **draft** and must be reviewed before publishing. No guarantees, no unverified medical claims. Do not invent credentials, prices, or insurance participation.
5. **Privacy:** never send names, emails, phones, messages, symptoms, or health data to analytics or logs. Never log form request bodies.
6. **Secrets:** never commit `.env.local` or `.wix/`. Never edit the `WIX_CLIENT_*` vars — the CLI manages them. The public `clientId` (= `appId`) is not a secret, but on managed Astro you don't need it in app code.
7. **Scope the agent does NOT own:** domain/DNS transfer, premium/billing, historical-data migration, and dashboard-only configuration with no code surface. The interactive `wix login` requires the user.

---

## 1. Prerequisites / environment

- **Node ≥ 20.11** (`node -v`).
- **Logged in to the correct Wix account:** `npx @wix/cli@latest whoami` → expect `marinholyhillacu@gmail.com`. If logged out, run `npx @wix/cli@latest login` (device-code flow — **the user must approve it in a browser**; an agent cannot complete it alone).
- Install deps if needed: `npm install --ignore-scripts` (the `--ignore-scripts` avoids the optional `sharp` native build, which is unused here and can abort install).

---

## 2. The core dev loop

```bash
npm run dev       # wix dev — local server + hot reload + Wix auth (uses .env.local)
npm run build     # wix build — production build; real errors surface here
npm run release   # wix release — publish build output to Wix hosting
```

- Prefer following recipes over local smoke-testing. If you do verify locally, keep it to a single lightweight pass (pages compile/render).
- After a release, one sanctioned check is fine: `curl` a couple of live URLs to confirm content renders.

---

## 3. Minting a REST token (only for backend/seed scripts)

Frontend code needs **no** token (auto-auth). Backend maintenance scripts (like seeding) use the CLI token:

```bash
SITE_ID=$(node -e "console.log(require('./wix.config.json').siteId)")
TOKEN=$(npx @wix/cli@latest token --site "$SITE_ID")
# then call https://www.wixapis.com/... with:
#   Authorization: Bearer $TOKEN
#   wix-site-id: $SITE_ID
#   Content-Type: application/json
```

The token is byte-identical on every mint within a run — mint once, reuse. Shell env vars do **not** persist between separate tool calls here, so set them inline in each command.

---

## 4. Recipes — how to add things

### 4a. Add or edit a frontend page

1. If it consumes structured content, add/extend a typed adapter in `src/lib/wix/data.ts` and a type in `src/types/content.ts`.
2. Create the page in `src/pages/…` using `SiteLayout.astro`.
3. **Guard every SDK call** in `.astro` frontmatter with `try/catch` and a fallback (an unguarded throw can white-screen the page).
4. `npm run build` → fix errors → `npm run release`.

Astro gotchas (from the skill's `astro.md` caveats):
- `.astro` frontmatter is TypeScript — use `//` comments, never `<!-- -->`.
- Interactive React that reads browser-only state must be `client:only="react"`; otherwise `client:load` is fine.
- Wix media fields come back as `wix:image://…` URIs — resolve with `media.getScaledToFillImageUrl(uri, w, h, {})` from `@wix/sdk` (returns the URL string directly). Never hand-build a `static.wixstatic.com` URL.
- Rich-text (`RICH_TEXT`) fields seeded as HTML strings render with `set:html`; if a field is Ricos JSON, render it via `@wix/ricos`, not `set:html`.

### 4b. Add content to an existing CMS collection

Two options:
- **Dashboard (preferred for real content):** the clinic edits rows at `manage.wix.com/dashboard/<siteId>` → CMS. No code, no release.
- **Programmatically (bulk/seed):** `POST https://www.wixapis.com/wix-data/v2/bulk/items/insert` with `{ dataCollectionId, dataItems:[{data:{…}}], returnEntity:true }`. See `scripts/wix-seed.mjs`.

Reading in code: `items.query("CollectionId")…find()`. **Fields are on the item directly** (`item.title`), and the id is **`item._id`** (never `item.data.title`, never `item.id`).

### 4c. Add a new CMS collection

1. Follow `.agents/skills/wix-headless/references/inline-recipes/setup-cms.md`.
2. `POST /wix-data/v2/collections` with a **`permissions` block** — for public content, `read: "ANYONE"`, writes `ADMIN`. (Omitting permissions fails; wrong `read` makes visitor queries silently return empty.)
3. Native collection ids have **no namespace** — use the exact id you set.
4. Add the adapter + type + page as in 4a. Update `scripts/wix-seed.mjs` if it should be part of the seed.
5. Extend `ARCHITECTURE.md` §6 and the context doc §11.2 tables.

### 4d. Add or change a form

1. Follow `.agents/skills/wix-headless/references/inline-recipes/setup-forms.md`.
2. Forms live in namespace `wix.form_app.form`. Every input field needs a `stringOptions.validation` block (or submissions 400) and a `CONTACTS_*` `identifier` to show in the dashboard (custom fields still capture data but don't show as dashboard columns).
3. The frontend reads the schema **live** (`forms.getForm(formId)`), renders fields from `form.fields[]` (not `formFields[]`), binds each input `name` = the field's `target`, and submits via `submissions.createSubmission(submission, options)` (positional args).
4. Keep the `formId` in `src/lib/wix/config.ts`.

### 4e. Add a new Wix business capability (Bookings, Blog, Stores, …)

Follow the skill. In short:
1. **Discovery** — confirm the capability from intent (`references/DISCOVERY.md`).
2. **Setup** — install the app by `appDefId` via `POST /apps-installer-service/v1/app-instance/install` (`references/SETUP.md`).
3. **Seed** — create backend content from the capability's `inline-recipes/setup-*.md`.
4. **Wire** — install the SDK package (see `SDK_HANDOFF.md` §3 map, e.g. `@wix/bookings`), read the capability's `how-to-code-*.md`, and build pages/adapters.
5. **Release** once.

---

## 5. Conventions

- **Never bind pages to raw Wix shapes.** Go through `src/lib/wix/*` adapters returning `src/types/content.ts` domain types.
- **Guard + fallback** on every SDK read; empty/error states must render gracefully.
- **Server-only** for privileged operations (`src/pages/api/*.ts` + `auth.elevate()`), never in browser code.
- **Curation/nav/"featured" are live queries**, never hardcoded id/slug lists — so owner-added content appears automatically.
- **Item/detail SEO:** any `[slug]` route that should let the owner control `<title>`/description needs the item-page SEO wiring (`@wix/seo`) — add it when SEO matters for that route.
- Keep business details centralized in the `SiteSettings` collection; don't hardcode phone/email/hours across pages.

---

## 6. Verification checklist (before calling a change done)

- [ ] `npm run build` succeeds with no errors.
- [ ] SDK calls are guarded; empty/error states render.
- [ ] No secrets, tokens, or PII in committed files, logs, or the client bundle.
- [ ] Content edits done in the dashboard (not hardcoded) where they belong.
- [ ] `npm run release` run **once** at the end; live URL spot-checked.
- [ ] Docs updated if schema/IDs/structure changed (`ARCHITECTURE.md`, context doc §11.2).

---

## 7. Known IDs and endpoints (quick reference)

| Item | Value |
|---|---|
| `siteId` | `c68648ed-1577-4028-86b1-7312970b1945` |
| `appId` (public client id) | `6b6784ba-48b1-47bb-8a5a-86ddb8545b2f` |
| Contact `formId` | `ef70c223-ff89-4a90-a784-9de20cc87b69` |
| CMS collections | `Treatments`, `Conditions`, `SiteSettings` |
| Wix Forms `appDefId` | `225dd912-7dea-4738-8688-4b8c6955ffc2` |
| Live URL | `https://marin-holy-17907997-marinholyhillacu.wix-site-host.com` |
| Dashboard | `https://manage.wix.com/dashboard/c68648ed-1577-4028-86b1-7312970b1945` |
| Wix Data v2 base | `https://www.wixapis.com/wix-data/v2/…` |
| Form Schemas v4 base | `https://www.wixapis.com/form-schema-service/v4/forms` |

> There is also an **orphaned** site from an earlier abandoned attempt (`siteId ca662f24-2101-45db-b1e6-d717ea15300e`) — the user should delete it from `manage.wix.com/account/sites`. Do not use it.

---

## 8. When to stop and ask the user

- Anything requiring `wix login` / re-auth.
- Domain, DNS, premium/billing, or dashboard-only setup.
- Publishing final medical / insurance / pricing / testimonial copy (needs approval).
- Deleting or overwriting existing real content (seeding is additive; deletion needs approval).
