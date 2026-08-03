# What Was Done

- Identified the root cause: the sticky header's `backdrop-filter` establishes a containing block for fixed descendants, limiting the mobile overlay and drawer background to the header's height while the links overflow over page content.
- Rendered the open mobile-menu overlay into `document.body` with a React portal so it is positioned against the viewport instead of the filtered header.
- Made the drawer explicitly full-height, vertically scrollable, safe-area aware, and overscroll-contained while preserving the existing backdrop, focus trap, Escape handling, scroll lock, and appointment CTA.
- Left all unrelated working-tree changes untouched.
- Ran `npx tsc --noEmit`, a scoped `git diff --check`, and `npm run build`.

# Result

The menu overlay now escapes the header's containing block and its opaque drawer covers the full mobile viewport rather than ending at the header and exposing the hero beneath it. TypeScript and the Wix production build completed successfully. The build emitted an existing non-blocking Vite warning about `@wix/stores` being listed for dependency optimization but not installed.

# Items Left to Take Care Of

None.
