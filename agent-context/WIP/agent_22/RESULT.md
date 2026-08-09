# What Was Done

- Created `src/components/ui/SocialLinks.astro` — a reusable component rendering accessible, round icon buttons for Instagram, Facebook, and YouTube using inline brand SVGs (no external requests). Each link opens in a new tab with `rel="noopener noreferrer"`, has an `aria-label`, and emits a `social_click` analytics event. Links with empty URLs are filtered out; nothing renders if none are set.
- Extended the `SiteSettings` type (`src/types/content.ts`) with `instagramUrl`, `facebookUrl`, `youtubeUrl`.
- Added the three client-provided URLs to `FALLBACK_SETTINGS` (`src/content/fallback-data.ts`).
- Mapped the new fields in `getSiteSettings()` (`src/lib/wix/data.ts`) as `text(row.x) || FALLBACK_SETTINGS.x`, so CMS values override the fallbacks.
- Rendered `<SocialLinks settings={settings} />` under a "Follow" heading in the footer's "Connect" column (`src/components/layout/Footer.astro`), which appears on the homepage and site-wide.

# Result

- `astro build` completed successfully (30 routes).
- Deployed via `wix release --version-type minor`. Site published to https://marin-holy-17907997-marinholyhillacu.wix-site-host.com
- Icons render live using the fallback URLs.

# Items Left to Take Care Of

- Declared the three fields in the `SiteSettings` collection definition in `scripts/wix-seed.mjs` (`instagramUrl`, `facebookUrl`, `youtubeUrl`, type `URL`) and ran the seed. Confirmed output: `[CMS] Added SiteSettings.instagramUrl` / `.facebookUrl` / `.youtubeUrl` and `[CMS] Updated primary SiteSettings row`. The fields now exist and are populated in the Wix dashboard — no manual step remains.
- Minor: `npm run seed` invokes `node scripts/wix-seed.mjs`, which throws `ERR_UNKNOWN_FILE_EXTENSION` because the script imports `../src/content/fallback-data.ts`. It must be run as `node --experimental-strip-types scripts/wix-seed.mjs`. Consider updating the package.json `seed` script to include the flag.
