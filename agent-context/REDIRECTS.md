# Redirect Map for Future Custom-Domain Launch

These redirects apply only after `marinholyhillacu.com` points to the new managed Headless project. Do not configure them on the old Wix Studio site during review.

| Legacy path | New destination | Reason |
|---|---|---|
| `/` | `/` | New homepage |
| `/bookingpage` | Confirmed Zocdoc booking URL from `SiteSettings.bookingUrl` | Preserve booking intent; external destination |
| `/team` | `/dr-kang` | Practitioner profile |
| `/beforeafter` | `/services/facial-acupuncture` | Closest safe destination; unverified before/after content is intentionally not republished |
| `/blank` | `/services` | General service discovery |
| `/blank-1` | `/conditions` | Condition-category discovery |
| `/blank-2` | `/va-insurance` | Insurance and pricing information |

The old site currently remains live and untouched. Validate these mappings again immediately before domain cutover, because the three legacy `blank*` page purposes are not descriptive in their URLs.
