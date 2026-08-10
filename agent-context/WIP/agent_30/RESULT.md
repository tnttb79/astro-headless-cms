# What Was Done

- Added the reusable social-links component to the right side of the sticky header utility bar, following the clinic phone links.
- Added an opt-in brand presentation to the social-links component: Instagram uses a multicolor gradient, Facebook uses brand blue, and YouTube uses brand red, each on a white circular surface.
- Kept the footer instance in its existing neutral white presentation.
- Added responsive header behavior that preserves the social icons while progressively hiding the compact location label and, on the narrowest screens, the separate Veterans eyebrow.
- Preserved accessible link names, visible keyboard focus treatment, secure external-link attributes, reduced-motion behavior, and per-network analytics metadata.

# Result

The three social networks are now displayed prominently in the top sticky utility bar on desktop and mobile without adding pressure to the primary navigation row. The implementation uses the existing Wix-managed social URLs and does not require a new Wix extension or data collection.

Validation completed successfully:

- `npm install` exited successfully. Wix's existing dependency tree emitted peer-dependency and audit warnings, but installation completed.
- `npx tsc --noEmit` exited with no errors.
- `npx wix build` completed successfully for all 32 routes.
- `npx wix preview` uploaded successfully and created the site preview at `https://mtbyoa-marin-holy-17907997-marinholyhillacu.wix-site-host.com`.
- The hosted page output contains the Instagram, Facebook, and YouTube header links with their expected header analytics metadata.
- `git diff --check` passed for the two changed source files.

# Items Left to Take Care Of

None.
