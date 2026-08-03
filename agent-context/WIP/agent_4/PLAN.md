# Goal

Release the currently completed and preview-validated strategic-direction update to the connected Wix-managed production site, then verify the live Wix host renders the intended VA and Mesa/Payson changes.

# Plan

1. Confirm the connected `siteId` and `appId`, current worktree scope, release command, and live Wix host target without reinitializing or relinking the project.
2. Run the required sequential validation: dependency installation, full TypeScript check, Wix production build, and Wix preview deployment.
3. Spot-check the final preview for the competence-and-sincerity hero, VA authorization guidance, both clinic phone/address paths, Payson’s “Opening soon” state, and absence of unapproved credential patterns.
4. Run `npm run release` once to publish the validated frontend build.
5. Verify the live Wix host returns successful responses and contains the intended strategic-direction content.
6. Record the release outcome, live URL, validation evidence, and any remaining client approvals in `RESULT.md`.
