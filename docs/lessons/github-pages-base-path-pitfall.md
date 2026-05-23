---
title: "GitHub Pages Base Path Pitfall"
date: 2026-05-22
project: hax
tags: [deployment, github-pages, astro, routing]
---

# GitHub Pages Base Path Pitfall

## The Lesson

When migrating a static site to a hosting platform that serves from a subdirectory (e.g., `username.github.io/repo/`), every hardcoded internal link breaks. The migration isn't done when the deploy workflow is green -- it's done when every `href`, asset path, and client-side route has been audited for the new base path.

## Context

HAx is an Astro 6.x static site with ~55 TED talks, 24 experiments, Preact islands (search, save, share), and Playwright e2e tests. The project migrated from Cloudflare Pages (which serves at the domain root) to GitHub Pages (which serves project sites at `/<repo-name>/`). The migration was planned as a single phase (Phase 10) covering the deploy workflow, Astro config, and Cloudflare-specific file cleanup.

## What Happened

1. Phase 10 created the GitHub Actions deploy workflow, updated `astro.config.mjs` to set `site` to the GitHub Pages URL, removed Cloudflare-specific files (`_headers`, `_redirects`), and added a `robots.txt` update.
2. The deploy workflow succeeded -- the site built and deployed to GitHub Pages without errors.
3. On the live site, **every internal navigation link was broken**. Clicking "Experiments" navigated to `/experiments/` instead of `/hax/experiments/`, returning a 404.
4. Root cause: Astro's `base` config option was not set, and all internal `href` values in components were hardcoded strings like `"/experiments/"` rather than using `import.meta.env.BASE_URL`.
5. A 24-file fix was required: every component (`Header`, `Footer`, `Breadcrumb`, cards), every page route, the `BaseLayout` print stylesheet reference, the Pagefind search import path, and all Playwright test assertions had to be updated.
6. The fix used `import.meta.env.BASE_URL` (Astro's built-in) to prefix all internal hrefs, making the site base-path-aware regardless of where it's hosted.

## Key Insights

- **A green deploy is not a working deploy.** The build succeeded, the upload succeeded, the pages deployed -- but the site was completely non-functional because no link pointed to the right place. CI that only checks "does it build?" misses this entire class of failure.
- **Hardcoded paths are a hidden coupling to the hosting platform.** Every `href="/foo/"` in a template is an implicit assumption that the site lives at `/`. This assumption is invisible until you move.
- **The base path fix is an all-or-nothing change.** Fixing half the links makes the site *worse* -- users can reach some pages but then get trapped in broken navigation. The fix had to touch 24 files atomically.
- **Framework-provided base URL helpers exist for this reason.** Astro's `import.meta.env.BASE_URL`, Next.js's `basePath`, Vite's `base` -- every major framework has a mechanism. Using it from day one costs nothing; retrofitting it costs a full audit of every link in the codebase.
- **Playwright tests should use relative paths, not absolute.** Tests that assert `href="/experiments/"` will pass locally (where base is `/`) but would fail on the deployed path. Using the framework's base URL in test assertions catches this mismatch.

## Examples

**Before (hardcoded, breaks on subdirectory hosting):**
```astro
<a href="/experiments/">Experiments</a>
<link rel="stylesheet" href="/print.css" media="print" />
```

**After (base-path-aware, works anywhere):**
```astro
<a href={`${import.meta.env.BASE_URL}experiments/`}>Experiments</a>
<link rel="stylesheet" href={`${import.meta.env.BASE_URL}print.css`} media="print" />
```

## Applicability

This lesson applies to any static site generator (Astro, Next.js, Hugo, Jekyll) when deploying to a subdirectory path. It does NOT apply when deploying to a custom domain at the root (e.g., `hax.example.com/`) -- in that case, the base path is `/` and hardcoded paths happen to work. However, using `BASE_URL` from the start is still good practice because it makes future hosting migrations trivial.

## Related Lessons

- [Astro Site URL vs Base Path Confusion](astro-site-url-vs-base-path-confusion.md) -- The follow-up fix where `site` and `base` were configured incorrectly, requiring a second correction.
