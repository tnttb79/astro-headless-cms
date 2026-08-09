# Goal

Implement a simple, responsive Health Articles feature backed entirely by the already-installed Wix Blog app, including navigation, an article index, article detail pages, and a three-post homepage preview.

# Plan

1. Review the existing Astro routes, shared layout, design tokens, Wix data adapters, and sitemap conventions.
2. Confirm the current Wix Blog SDK query methods and post/rich-content field shapes in Wix documentation, without reinstalling apps, reinitializing Wix, or seeding content.
3. Add typed, guarded Wix Blog data access that returns published posts in newest-first order and supports slug lookup.
4. Build reusable article cards plus `/articles` and `/articles/[slug]` routes, including empty states, rich-content rendering, responsive styling, metadata, and the appointment CTA.
5. Add Health Articles to desktop/mobile navigation and a three-item latest-articles section to the homepage.
6. Update route registration/sitemap behavior if required by the current architecture, then run focused type/build validation and review the resulting diff.

Assumptions: Wix Blog is already installed and has no content that should be modified; Blog remains Dr. Kang's only authoring interface; visitor-facing reads use the managed Astro/Wix authentication already configured; no release will be performed unless explicitly requested.
