# Goal

Add section-by-section scroll snapping to the website while preserving natural, usable scrolling on mobile devices.

# Plan

1. Inspect the existing frontend structure and styling to identify the page scroll container and section boundaries.
2. Implement CSS-first scroll snapping within the existing architecture, with responsive rules that avoid trapping or clipping content on small screens.
3. Check navigation, overflow, reduced-motion behavior, and any fixed-header interaction affected by snapping.
4. Run the repository's relevant type, lint, test, and build checks, then record the actual results.

Scope is limited to the website's section scrolling behavior and directly related responsive styling. The initial assumption is that existing page sections can be used as snap targets without introducing a new Wix extension or data collection.
