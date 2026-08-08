# Goal

Restore gentle proximity-based section alignment while retaining the newly added homepage dividers and tonal contrast.

# Plan

- Restore `scroll-snap-type: y proximity` on the document.
- Restore section snap targets using non-forcing `start` alignment and normal snap stops.
- Keep scroll snapping disabled for visitors who prefer reduced motion.
- Leave homepage spacing, dividers, backgrounds, content, and layout unchanged.
- Build, release once to Wix, and verify the published stylesheet contains proximity snapping and the visual-separation rules.
