# Goal

Remove the technical-details action from the portfolio project card and correct its GitHub repository URL while keeping the standalone case-study route intact.

# Plan

1. Update only the affected portfolio project configuration: clear the details link and replace the GitHub URL with the user-provided repository.
2. Verify the shared project-card component will omit the technical-details button and retain the GitHub action.
3. Run portfolio lint and production build, inspect the focused diff, and confirm unrelated application files remain untouched.
