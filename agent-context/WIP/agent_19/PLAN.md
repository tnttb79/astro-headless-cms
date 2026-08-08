# Goal

Separate Zocdoc booking from a future-ready `Book directly` path, with Mesa currently bookable by phone and Payson clearly unavailable until it opens.

# Plan

- Add a reusable booking-actions component that presents `Book on Zocdoc` and `Book directly` as distinct choices with separate analytics labels.
- Add a centralized direct-booking resolver that currently maps open locations to their phone number and leaves opening-soon locations unavailable.
- Create a `/book` location-choice page driven by the live Wix location records: Mesa receives an active `Book directly` telephone action and Payson receives a visible, non-interactive `Opening soon` state.
- Apply the separated actions to the desktop header, compact header/mobile menu, homepage hero, shared CTA bands, contact page, and footer while preserving responsive usability.
- Keep proximity scroll snapping and the recently added section-separation styling unchanged.
- Build the Astro/Wix frontend, release it once, and verify the live booking page and published booking links.
