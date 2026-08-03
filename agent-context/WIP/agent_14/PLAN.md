# Goal

Correct the live website so section scroll snapping is clearly active on mobile devices.

# Plan

1. Confirm the current responsive snap rules and identify why touch devices do not visibly snap.
2. Make the smallest CSS change needed to enforce section snapping on mobile while retaining normal scrolling within tall sections, sticky-header clearance, and the reduced-motion opt-out.
3. Run TypeScript and Wix production build validation.
4. Release the corrected frontend once to the existing Wix-hosted site and verify the live production CSS.

Scope is limited to the scroll-snapping behavior. No CMS, backend, domain, or unrelated frontend changes are planned.
