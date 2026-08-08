# Goal

Improve the homepage VA, insurance, and pricing CTA so its label reads cleanly in a wider pill instead of wrapping into a narrow multi-line block.

# Plan

1. Add homepage-section-specific CTA sizing that prevents flex shrinking and keeps the label on one line at desktop widths.
2. Preserve a responsive fallback that allows wrapping only on genuinely narrow mobile screens without overflowing the viewport.
3. Build the Wix-managed Astro site, inspect the compiled CSS, release once, and verify the published CTA styling.

Scope is limited to this homepage CTA; shared button styling and other calls to action will remain unchanged.
