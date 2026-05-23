# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**HAx** — Evidence-rated experiments drawn from TED Talks. Astro 6.x static site with Preact islands, Pagefind search, and Zod-validated content collections.

## Repository Structure

```
src/
  content/          # Markdown content collections (talks, experiments, studies, clusters, personas, resources)
  components/       # Astro components (Header, Footer, ExperimentCard, TalkCard, etc.)
  islands/          # Preact islands (SearchWidget, SaveButton, FilterController, etc.)
  layouts/          # BaseLayout, ContentLayout
  lib/              # Utilities (taxonomy, structured-data, saved)
  pages/            # Astro page routes
  styles/           # Global CSS with design tokens
public/             # Static assets (print.css, robots.txt)
tests/e2e/          # Playwright + axe-core e2e tests
sdlc/               # Design documents, PDRs, and phased plans
.github/workflows/  # CI (ci.yml) and GitHub Pages deploy (deploy.yml)
```

## Build / Test / Lint

```bash
npm run build       # Astro build + Pagefind indexing (postbuild)
npm run dev         # Dev server on port 4331
npm run preview     # Preview built site
npx playwright test # 44 e2e tests (navigation, accessibility, search, save, print)
npx astro check     # TypeScript type checking
```

## Hosting

GitHub Pages via `actions/deploy-pages`. Deploy workflow at `.github/workflows/deploy.yml` triggers on push to main. Set `SITE_URL` environment variable in GitHub Actions to match the production URL.

## Content

- 55 TED talks, 24 experiments, 12 studies across 4 clusters (body, cognition, environment, social)
- 3 persona dashboards, 5 resource files
- Content schemas validated at build time via Zod (see `src/content.config.ts`)

## Port

Frontend dev server: **4331** (per global port registry)
