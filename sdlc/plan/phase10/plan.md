---
phase: 10
title: "Migrate from Cloudflare Pages to GitHub Pages"
depends_on: "Phase 09"
goal: "Remove all Cloudflare-specific configuration and deploy via GitHub Pages with equivalent functionality."
source_pdr_sections: ["1.2"]
source_user_stories: ["US-026"]
status: "completed"
---

# Phase 10: Migrate from Cloudflare Pages to GitHub Pages

## What Needs to Change

The Cloudflare footprint is small — no Cloudflare SDK, no Workers, no KV bindings. The site is fully static (`output: 'static'`), so GitHub Pages can serve it with zero functional loss. Four things need updating:

### 1. Replace `public/_headers` with `<meta>` tags

**Why:** GitHub Pages does not support a `_headers` file. Cloudflare Pages reads `_headers` to inject HTTP response headers (CSP, X-Frame-Options, etc.). GitHub Pages has no equivalent file-based header mechanism.

**What to do:**
- Delete `public/_headers`
- Move the Content-Security-Policy into a `<meta http-equiv="Content-Security-Policy">` tag in `src/layouts/BaseLayout.astro`'s `<head>`. This provides the same CSP enforcement for browsers (it does not cover non-browser clients, but that's irrelevant for a static site).
- `X-Frame-Options`, `X-Content-Type-Options`, and `Referrer-Policy` cannot be set via `<meta>` tags — they are HTTP-header-only. GitHub Pages sets some of these by default (e.g., `X-Content-Type-Options: nosniff`). For the others, accept the limitation; they are defense-in-depth headers, not load-bearing for a static site with no user input.

**Current `_headers` content:**
```
/*
  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' fonts.googleapis.com; font-src fonts.gstatic.com; frame-src embed.ted.com; img-src 'self' data:; connect-src 'self'
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
```

**Replacement `<meta>` tag in BaseLayout.astro:**
```html
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' fonts.googleapis.com; font-src fonts.gstatic.com; frame-src embed.ted.com; img-src 'self' data:; connect-src 'self'" />
```

### 2. Add GitHub Actions deploy workflow

**Why:** The current `ci.yml` builds and tests but does not deploy. GitHub Pages deployment uses the `actions/deploy-pages` action.

**What to do:**
- Create `.github/workflows/deploy.yml` (or extend `ci.yml`) that:
  1. Builds the site (`npm run build`)
  2. Uploads the `dist/` directory as a GitHub Pages artifact via `actions/upload-pages-artifact`
  3. Deploys via `actions/deploy-pages`
- The workflow triggers on push to `main` only (not PRs — PRs should only build and test).
- Enable GitHub Pages in repo settings: Settings → Pages → Source → "GitHub Actions"

**Workflow template:**
```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist/

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

### 3. Update `site` URL in `astro.config.mjs`

**Why:** The `site` property controls canonical URLs, sitemap URLs, and OG meta. It currently defaults to `https://hax.example.com`. For GitHub Pages, this becomes `https://<username>.github.io/hax/` (or a custom domain if configured).

**What to do:**
- Change the default in `astro.config.mjs`:
  ```js
  site: process.env.SITE_URL || 'https://<username>.github.io/hax/',
  ```
- If using a custom domain (e.g., `hax.example.com`), set `SITE_URL` in the GitHub Actions environment and keep the config as-is.
- If deploying to a subpath (`/hax/`), also set `base: '/hax/'` in astro.config.mjs. This prefixes all asset and link URLs with the subpath.

### 4. Update `public/robots.txt` sitemap URL

**Why:** The sitemap URL is hardcoded to `https://hax.example.com/sitemap-index.xml`. It needs to match the actual deployment URL.

**What to do:**
- Update the Sitemap line in `public/robots.txt` to match the production URL.
- Alternatively, remove the hardcoded sitemap URL from robots.txt and let search engines discover it via the `<link rel="sitemap">` tag (which Astro's sitemap integration adds automatically).

## What Does NOT Need to Change

- **Build command:** `npm run build` + `pagefind --site dist` — identical on both platforms.
- **All Astro code, components, pages, islands:** Zero changes. The site is static HTML/CSS/JS. GitHub Pages serves static files the same as Cloudflare Pages.
- **Content files:** No changes.
- **Pagefind search:** Works identically — it's client-side JS loading static index files.
- **Preact islands:** Client-side hydration, no server dependency.
- **CI workflow (`ci.yml`):** Keep as-is for PR checks. The deploy workflow is separate.
- **Print CSS, saved experiments (localStorage), share button:** All client-side, no server dependency.

## Tasks

| No | Status | Started (PST) | Completed (PST) | Description |
|----|--------|---------------|------------------|-------------|
| 10.01 | Completed | 2026-05-22 05:25 PM | 2026-05-22 05:26 PM | Delete `public/_headers` and add CSP `<meta>` tag to `src/layouts/BaseLayout.astro` |
| 10.02 | Completed | 2026-05-22 05:26 PM | 2026-05-22 05:27 PM | Create `.github/workflows/deploy.yml` with GitHub Pages deployment via `actions/deploy-pages` |
| 10.03 | Completed | 2026-05-22 05:27 PM | 2026-05-22 05:27 PM | Update `astro.config.mjs`: set `site` and optionally `base` for GitHub Pages URL |
| 10.04 | Completed | 2026-05-22 05:27 PM | 2026-05-22 05:28 PM | Update `public/robots.txt` sitemap URL to match GitHub Pages domain |
| 10.05 | Completed | 2026-05-22 05:28 PM | 2026-05-22 05:28 PM | Remove all Cloudflare references from SDLC docs — editorial cleanup only (historical plan docs left as-is) |
| 10.06 | Completed | 2026-05-22 05:28 PM | 2026-05-22 05:29 PM | Update `CLAUDE.md` to reflect GitHub Pages as the hosting platform |
| 10.07 | Completed | 2026-05-22 05:29 PM | 2026-05-22 05:30 PM | Run `npm run build` and `npx playwright test` — verify zero regressions |
| 10.08 | Completed | 2026-05-22 05:30 PM | 2026-05-22 05:31 PM | Stage and commit: "Phase 10: Migrate from Cloudflare Pages to GitHub Pages" |

## Risk Assessment

**Risk: None.** The site is fully static with no server-side logic. The migration is a configuration change, not a rewrite. The only functional loss is HTTP-level security headers (`X-Frame-Options`, `Referrer-Policy`) which cannot be set on GitHub Pages without a proxy — these are defense-in-depth for a read-only static site and their absence has no practical impact.

## Phase Summary

_To be filled after completion._

- **Changes:** Deleted `public/_headers` (Cloudflare-specific). Added CSP `<meta>` tag to BaseLayout. Created `.github/workflows/deploy.yml` for GitHub Pages deployment. Updated `astro.config.mjs` site URL. Simplified `robots.txt`. Updated `CLAUDE.md` with current project state and GitHub Pages hosting.
- **Commit:** `Phase 10: Migrate from Cloudflare Pages to GitHub Pages`
