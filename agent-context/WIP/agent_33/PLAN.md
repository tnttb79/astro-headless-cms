# Goal

Deploy the validated clinic booking-notification changes to the linked live Wix site so the user can test the production booking flow.

# Plan

1. Confirm the target Wix site and the previously validated booking-notification changes.
2. Add a schema-only mode to the idempotent seed migration, then use it to apply the updated `BookingEmails` fields without rewriting live content rows.
3. Release the current validated application build with the Wix CLI.
4. Verify the live `/book` route responds successfully and confirm the deployed version where possible.
5. Record any dashboard-only setup that still blocks end-to-end clinic email delivery, specifically activation of the Wix Automation action addressed to `marinholyhillacu@gmail.com`.

Scope: deploy only to the site already identified by `wix.config.json`. Do not submit a synthetic booking because it would create a real appointment and calendar event. Preserve existing site content and unrelated working-tree changes.
