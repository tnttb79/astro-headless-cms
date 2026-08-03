# Goal

Fix the mobile navigation so the open menu displays as an intentional overlay without exposing, overlapping, or visually colliding with the page content beneath it.

# Plan

1. Inspect the existing navigation component, responsive styles, and project scripts to identify the cause of the mobile overlap.
2. Reproduce the relevant menu state locally and trace stacking, height, overflow, and breakpoint behavior.
3. Apply the smallest scoped component/style fix while preserving desktop navigation and existing visual design.
4. Run the available focused tests, type checks, and build validation; document the actual results and any manual follow-up in `RESULT.md`.

Assumptions: the supplied screenshot reflects the current narrow-viewport implementation, and the intended behavior is a usable full mobile menu that visually separates itself from the underlying hero content. No new Wix extension or data collection is expected for this UI-only repair.
