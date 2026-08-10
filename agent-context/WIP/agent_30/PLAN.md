# Goal

Make the clinic's Instagram, Facebook, and YouTube links more noticeable by adding them to the sticky top utility bar with recognizable brand colors, while preserving the existing footer links and responsive usability.

# Plan

1. Extend the reusable social-links component with an opt-in brand-color presentation suitable for the header, leaving the existing footer presentation unchanged.
2. Place the social links at the right side of the header utility bar alongside the clinic contact information and adjust responsive behavior so they remain visible on small screens without crowding the header.
3. Preserve accessible names, keyboard focus behavior, secure external-link attributes, and analytics metadata.
4. Validate the implementation with dependency installation, TypeScript checking, a production Wix build, and a Wix preview startup; record the actual outcomes in `RESULT.md`.

Assumptions: the existing Wix-managed social URLs remain the source of truth, all three configured networks should appear when their URLs are available, and the footer should retain its current neutral styling as a secondary navigation location.
