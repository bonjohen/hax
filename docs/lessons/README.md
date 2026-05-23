# Lessons Learned

Reusable insights extracted from real project work on HAx.

## Deployment & Hosting

- [GitHub Pages Base Path Pitfall](github-pages-base-path-pitfall.md) — Hosting platform migrations require auditing every internal link for path prefix changes
- [Astro Type Errors as Silent Deploy Blockers](astro-type-errors-silent-deploy-blockers.md) — Deprecated imports and missing pragmas can pass local dev but fail CI type checks
- [Astro Site URL vs Base Path Confusion](astro-site-url-vs-base-path-confusion.md) — Astro's `site` and `base` config fields serve different purposes and interact non-obviously
