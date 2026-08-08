# Goal

Implement the approved client revisions by replacing the incorrect Facial Acupuncture image, adding the Mesa clinic phone number to the contact alternate-route panel, and making the homepage Featured Services CTA reachable and visible with scroll snapping enabled. Leave direct booking and social links unchanged until their required details are supplied.

# Plan

1. Add the client-supplied Facial Acupuncture source image, generate optimized WebP variants, and update the canonical frontend and future CMS seed mappings while preserving compatibility with the currently stored CMS image path.
2. Add a semantic click-to-call Mesa clinic number beneath “Call the clinic” in the Contact page’s “Prefer another route?” panel.
3. Add a compact presentation option for the homepage Featured Services grid and reduce that section’s vertical footprint on desktop.
4. Change mandatory page snapping to proximity snapping so content inside sections taller than the viewport remains reachable on shorter displays and mobile devices.
5. Build the Wix-managed Astro project, inspect the diff and generated image metadata, release once if validation succeeds, then spot-check the published site.

Assumptions: the previously supplied 1024×1024 Facial Acupuncture image is the approved replacement; direct booking is deferred; Facebook and YouTube links remain hidden until received. Validation will include the production Wix build, static source checks, asset metadata checks, and post-release HTTP checks.
