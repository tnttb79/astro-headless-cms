# What Was Done

Added site-wide vertical scroll snapping in `src/styles/global.css` for top-level content sections, inner-page heroes, calls to action, and the site footer. Desktop devices with a fine pointer use mandatory snapping; touch and mobile devices use proximity snapping so tall content, cards, and forms remain naturally scrollable. Snap targets retain an 8rem sticky-header offset, use normal snap stops, and decorative dividers are not targets. Scroll snapping is disabled for visitors who prefer reduced motion.

# Result

The final implementation passed `npm install`, `npx tsc --noEmit`, `npx wix build`, and `npx wix preview`. The generated CSS contains the expected proximity, desktop mandatory, and reduced-motion-disabled rules. The hosted preview returned HTTP 200 at `https://lzhd11-marin-holy-17907997-marinholyhillacu.wix-site-host.com`.

# Items Left to Take Care Of

Review the existing dependency audit findings when dependency maintenance is next scheduled: `npm install` reported 18 vulnerabilities (5 low, 12 high, and 1 critical). No forced dependency upgrades were made as part of this styling change.
