# What Was Done

Updated the affected portfolio project configuration so its `details` value is null, causing the shared project-card component to omit the “Technical details” action. Replaced the GitHub target with the user-provided `https://github.com/tnttb79/astro-headless-cms` URL. The standalone `/healthcare-booking-system` case-study route was left intact.

# Result

Portfolio ESLint completed with zero warnings or errors, and the Vite production build completed successfully. The build continues to generate `dist/healthcare-booking-system/index.html`. Focused validation confirmed the corrected configuration and the existing conditional card rendering. No application source, configuration, dependency, or README files in this repository were changed during this iteration. Nothing was deployed.

# Items Left to Take Care Of

The portfolio changes must be deployed through the owner's normal release workflow before they appear on `thangta.net`.
