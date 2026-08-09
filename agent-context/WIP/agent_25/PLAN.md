# Goal

Make Zocdoc a clearly secondary booking option, with restrained wording and styling, while keeping its visibility controlled by Wix CMS so the owner can remove it after the contract expires.

# Plan

1. Locate every Zocdoc UI reference and trace the Wix CMS content/data flow that controls booking links.
2. Adjust the presentation and copy so the website's primary booking path remains dominant and Zocdoc is offered only as a subtle alternative.
3. Ensure the Zocdoc option is rendered only when its CMS URL is populated, allowing the owner to remove it without a code change.
4. Run the repository's relevant type, build, and automated validation commands; inspect the built output where useful.
5. Document the exact implementation, validation results, and any owner-facing CMS action in `RESULT.md`.
