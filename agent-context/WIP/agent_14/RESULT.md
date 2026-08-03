# What Was Done

Changed the document scroll container from proximity snapping to mandatory snapping on every viewport, removing the fine-pointer-only desktop override that left mobile with weak or imperceptible snapping. Retained `scroll-snap-stop: normal` for scrolling through tall sections, the sticky-header offset on snap targets, and the reduced-motion opt-out.

# Result

`npx tsc --noEmit` and `npm run build` passed. The corrected frontend was released successfully to `https://marin-holy-17907997-marinholyhillacu.wix-site-host.com`, which returned HTTP 200. The production page references the new CSS bundle, and that bundle was verified to contain `scroll-snap-type:y mandatory` and no proximity rule. Devices with the operating-system reduced-motion preference enabled will still intentionally receive `scroll-snap-type:none`.

# Items Left to Take Care Of

None.
