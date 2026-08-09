# Goal

Add social media icons (Instagram, Facebook, YouTube) to the site and link them to the client-provided URLs, with the URLs managed through the Wix `SiteSettings` CMS collection rather than hardcoded. Deploy the result.

- Instagram: https://www.instagram.com/tcmkang67/
- Facebook: https://www.facebook.com/marinholyhillacu/
- YouTube: https://www.youtube.com/channel/UCHUYhknnVi1FEgMXLn21q_w

# Plan

1. Create a reusable `SocialLinks.astro` UI component using inline brand SVGs (no external assets) that renders accessible, round icon buttons and emits `social_click` analytics events consistent with the rest of the site.
2. Extend the `SiteSettings` type with `instagramUrl`, `facebookUrl`, `youtubeUrl`.
3. Add the three URLs to `FALLBACK_SETTINGS` so the icons work even before the CMS columns are populated.
4. Map the new fields in `getSiteSettings()` (`text(row.x) || FALLBACK`).
5. Have `SocialLinks` take the `settings` object as a prop and filter out any empty URLs so missing links simply don't render.
6. Render the component in the footer's "Connect" column (shows on the homepage and site-wide).
7. Validate with `astro build`, then deploy via `wix release`.

## Assumptions
- Footer placement satisfies "on the homepage" since the footer renders on the homepage; icons appear site-wide, which is the conventional pattern.
- Adding the matching `instagramUrl`/`facebookUrl`/`youtubeUrl` columns to the Wix `SiteSettings` collection is a manual dashboard step for the client; fallbacks keep the site correct until then.
