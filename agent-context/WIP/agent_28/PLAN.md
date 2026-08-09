# Goal

Update the personal portfolio integration for this project by adding its GitHub action, changing the case-study route from the generic architecture path to the project's existing portfolio slug, removing unnecessary navigation actions from the case-study page, and keeping the README link current.

# Plan

1. Use the existing portfolio project configuration and repository remote as the source of truth for the slug and GitHub URL.
2. Update the portfolio project card, multi-page Vite entry, case-study HTML route, and case-study page actions without disturbing unrelated portfolio worktree changes.
3. Update the README's architecture-walkthrough link to the renamed route.
4. Run the portfolio lint and production build, inspect route output and diffs, and confirm the application repository changed only in README plus this required WIP record.
