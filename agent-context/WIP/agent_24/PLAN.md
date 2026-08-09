# Goal

Deploy the current managed Wix Astro site, including the completed Health Articles feature, to the connected Wix live site.

# Plan

1. Confirm the connected site ID, current Git/build scope, dependency state, and Wix CLI authentication.
2. Run one fresh production build from the current project state and stop on any build error.
3. Release the successful build once with the Wix CLI, retrying only documented transient infrastructure failures.
4. Verify the published URL responds and record the release result, live URL, dashboard URL, and any remaining owner actions.

Scope: publish the complete current frontend build currently present in this repository. Do not reinstall Wix apps, reinitialize the project, seed content, alter Blog posts, or make unrelated source changes.
