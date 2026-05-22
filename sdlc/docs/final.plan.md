---
document: "Implementation Plan"
version: "1.0"
status: "final"
source: "sdlc/docs/draft.plan.md"
pdr: "sdlc/docs/final.pdr.md"
user_requirements: "sdlc/docs/final.user.md"
finalized_date: "2026-05-22"
total_phases: 10
---

# HAx Static Website — Implementation Plan

**Source PDR:** `sdlc/docs/final.pdr.md`
**Source User Requirements:** `sdlc/docs/final.user.md`

## Work Queue Instructions

### State Transitions

```
Open  ──>  Started  ──>  Completed
              │
              └──>  Blocked  ──>  Started  ──>  Completed
```

- **Open**: Not yet begun.
- **Started**: Actively in progress. Record the start datetime (PST).
- **Completed**: Done and verified. Record the completion datetime (PST).
- **Blocked**: Cannot proceed; note the blocker in the description.

### Commit Protocol

1. Work through all tasks in a phase.
2. When every task reaches Completed, write the Phase Summary.
3. Stage and commit all changes for the phase. Do not push.
4. Proceed immediately to the next phase.

## Technology Stack

| Concern | Choice | Justification |
|---------|--------|--------------|
| Static site generator | Astro 5.x | Static output, content collections with Zod schemas, islands architecture, built-in i18n, responsive image pipeline |
| Language | TypeScript | Type safety for content schemas, component props, and utility functions |
| Search | Pagefind 1.x | Fully static, indexes build output, chunked loading, no server needed |
| Hosting | Cloudflare Pages | Git-driven deploys, preview deployments per PR, CDN-backed, HTTPS by default |
| Unit testing | Vitest | Fast, TypeScript-native, compatible with Astro |
| E2E testing | Playwright | Cross-browser, accessibility testing via axe-core integration |
| Accessibility testing | @axe-core/playwright | WCAG 2.1 AA automated checks in CI |
| Schema validation | Zod (via Astro) | Content collection schemas validated at build time |
| Analytics | Plausible (optional) | Cookieless, no PII, configurable via env var |

## Phase 00: Project Scaffold and Risk Validation

**Goal:** Working Astro project with content schemas, sample content, TED embed validation, Cloudflare Pages deployment, and CI pipeline.
**Depends on:** None (first phase).
**PDR sections:** 1.2, 1.3, 2.1, 2.2, 2.4, 3
**User stories:** US-024, US-025, US-026

| No | Status | Started (PST) | Completed (PST) | Description |
|----|--------|---------------|------------------|-------------|
| 00.01 | Completed | 2026-05-22 09:56 PM | 2026-05-22 10:00 PM | Initialize Astro project with TypeScript: `npm create astro@latest`, configure `output: 'static'` in `astro.config.mjs` |
| 00.02 | Completed | 2026-05-22 10:00 PM | 2026-05-22 10:01 PM | Create `src/lib/taxonomy.ts` with cluster IDs, evidence level enum, effort enum as shared constants |
| 00.03 | Completed | 2026-05-22 10:01 PM | 2026-05-22 10:02 PM | Create `src/content/config.ts` with Zod schemas for all six collections (talks, experiments, studies, clusters, personas, resources) per PDR Section 2.1 |
| 00.04 | Completed | 2026-05-22 10:02 PM | 2026-05-22 10:06 PM | Create sample content files: 2 talks, 3 experiments, 2 studies, 1 cluster, 1 persona, 1 resource — all with complete frontmatter and body content |
| 00.05 | Completed | 2026-05-22 10:06 PM | 2026-05-22 10:06 PM | Configure Astro i18n in `astro.config.mjs` with default locale `en` and prefix routing strategy |
| 00.06 | Completed | 2026-05-22 10:06 PM | 2026-05-22 10:07 PM | Create a minimal test page at `src/pages/test-embed.astro` that renders a TED iframe embed and fallback link |
| 00.07 | Blocked | 2026-05-22 10:07 PM | | Set up Cloudflare Pages deployment from the repository (connect repo, configure build command `npm run build`, output directory `dist/`) [BLOCKED: Requires manual Cloudflare Pages dashboard setup — connect GitHub repo, configure build settings] |
| 00.08 | Blocked | 2026-05-22 10:07 PM | | Deploy the test page and verify TED embed loads from the live Cloudflare Pages preview URL [BLOCKED: Depends on 00.07 Cloudflare Pages setup] |
| 00.09 | Completed | 2026-05-22 10:07 PM | 2026-05-22 10:07 PM | Set up CI pipeline (GitHub Actions): install deps, type-check (`astro check`), build (`astro build`), verify build succeeds |
| 00.10 | Completed | 2026-05-22 10:07 PM | 2026-05-22 10:08 PM | Verify schema validation: create an intentionally invalid content file, confirm build fails with a clear error, then remove the invalid file |
| 00.11 | Completed | 2026-05-22 10:07 PM | 2026-05-22 10:07 PM | Create `package.json` scripts: `dev`, `build`, `preview`, `check`, `test` |
| 00.12 | Completed | 2026-05-22 10:08 PM | 2026-05-22 10:10 PM | Stage all changes and commit: "Phase 00: Project scaffold with content schemas, TED embed validation, and CI pipeline" |

### Phase 00 Summary

- **Changes:** Initialized Astro 6.x project with TypeScript strict mode and static output. Created content collection schemas for all six collections using glob loaders. Created taxonomy constants, 10 sample content files, TED embed test page, GitHub Actions CI, and package.json scripts.
- **Blocked tasks:** 00.07 (Cloudflare Pages setup), 00.08 (TED embed live verification)
- **Commit:** `Phase 00: Project scaffold with content schemas, TED embed validation, and CI pipeline`

---

## Phase 01: Base Layout and Navigation

**Goal:** Responsive page shell with header, footer, skip links, breadcrumbs, and accessibility CI. All subsequent pages use this layout.
**Depends on:** Phase 00.
**PDR sections:** 4.1, 4.3, 4.4, 4.5
**User stories:** US-018, US-019

| No | Status | Started (PST) | Completed (PST) | Description |
|----|--------|---------------|------------------|-------------|
| 01.01 | Completed | 2026-05-22 10:15 PM | 2026-05-22 10:18 PM | Create `src/styles/global.css` with design tokens (colors, typography scale, spacing, breakpoints at 640px/1024px) |
| 01.02 | Completed | 2026-05-22 10:15 PM | 2026-05-22 10:18 PM | Create `src/layouts/BaseLayout.astro` with HTML `<head>` (meta, OG placeholders, canonical URL slot), skip link, header slot, `<main>`, footer slot, print stylesheet link |
| 01.03 | Completed | 2026-05-22 10:15 PM | 2026-05-22 10:18 PM | Create `src/components/Header.astro` with site title, nav links (Clusters, Personas, Search, About, Saved), `aria-current="page"` on active link |
| 01.04 | Completed | 2026-05-22 10:15 PM | 2026-05-22 10:18 PM | Implement responsive mobile navigation in Header (hamburger menu with `<details>/<summary>` or button toggle with ARIA) |
| 01.05 | Completed | 2026-05-22 10:15 PM | 2026-05-22 10:18 PM | Create `src/components/Footer.astro` with nav links (About, Resources), copyright notice, TED attribution statement, non-commercial notice |
| 01.06 | Completed | 2026-05-22 10:15 PM | 2026-05-22 10:18 PM | Create `src/components/Breadcrumb.astro` with ordered list, `aria-label="Breadcrumb"`, current page not linked |
| 01.07 | Completed | 2026-05-22 10:15 PM | 2026-05-22 10:18 PM | Create `src/styles/print.css` with `@media print` rules hiding nav, footer, and interactive elements |
| 01.08 | Completed | 2026-05-22 10:15 PM | 2026-05-22 10:18 PM | Update `src/pages/index.astro` to use BaseLayout with Header and Footer (placeholder content) |
| 01.09 | Completed | 2026-05-22 10:19 PM | 2026-05-22 10:20 PM | Install Playwright and @axe-core/playwright as dev dependencies |
| 01.10 | Completed | 2026-05-22 10:20 PM | 2026-05-22 10:21 PM | Create `tests/e2e/accessibility.spec.ts` — Playwright test that loads index page, runs axe-core scan, asserts zero critical/serious violations |
| 01.11 | Completed | 2026-05-22 10:20 PM | 2026-05-22 10:21 PM | Add Playwright and Lighthouse CI steps to GitHub Actions CI pipeline |
| 01.12 | Completed | 2026-05-22 10:21 PM | 2026-05-22 10:22 PM | Verify: skip link is first focusable element, moves focus to `<main>`; breadcrumb renders "Home"; Lighthouse accessibility ≥ 90; print preview hides nav/footer |
| 01.13 | Completed | 2026-05-22 10:22 PM | 2026-05-22 10:22 PM | Remove test-embed page from Phase 00 (no longer needed after TED validation) |
| 01.14 | Completed | 2026-05-22 10:22 PM | 2026-05-22 10:23 PM | Stage all changes and commit: "Phase 01: Base layout with responsive navigation, skip links, and accessibility CI" |

### Phase 01 Summary

- **Changes:** Created `src/styles/global.css` with design tokens, `src/styles/print.css` with print rules, `src/layouts/BaseLayout.astro` with skip link and semantic structure, `src/components/Header.astro` with responsive mobile/desktop nav and `aria-current`, `src/components/Footer.astro` with TED attribution, `src/components/Breadcrumb.astro` with JSON-LD. Updated `src/pages/index.astro` to use BaseLayout. Installed Playwright and axe-core, created `tests/e2e/accessibility.spec.ts` with 5 passing tests. Updated CI pipeline with Playwright. Removed test-embed page.
- **Commit:** `Phase 01: Base layout with responsive navigation, skip links, and accessibility CI`

---

## Phase 02: Content Detail Pages

**Goal:** Talk detail and Experiment detail page templates rendering from content collections, with evidence badges, TED embeds, progressive disclosure, and JSON-LD structured data.
**Depends on:** Phase 01.
**PDR sections:** 4.2, 4.8, 4.10, 4.11, 2.1
**User stories:** US-003, US-004, US-014, US-015, US-016, US-017, US-021

| No | Status | Started (PST) | Completed (PST) | Description |
|----|--------|---------------|------------------|-------------|
| 02.01 | Completed | 2026-05-22 10:20 PM | 2026-05-22 10:22 PM | Create `src/layouts/ContentLayout.astro` extending BaseLayout with breadcrumbs, two-column layout (content + sidebar slot), last-reviewed date footer |
| 02.02 | Completed | 2026-05-22 10:20 PM | 2026-05-22 10:22 PM | Create `src/components/EvidenceBadge.astro` with color-coded label (green/blue/yellow/orange/gray) and title tooltip per PDR 4.8 |
| 02.03 | Completed | 2026-05-22 10:20 PM | 2026-05-22 10:22 PM | Create `src/components/TedEmbed.astro` with lazy-loaded iframe, sandbox attributes, fallback outbound link, `TED_EMBED_ENABLED` config check per PDR 4.10 |
| 02.04 | Completed | 2026-05-22 10:20 PM | 2026-05-22 10:22 PM | Create `src/components/StudyLink.astro` rendering study reference with title link, authors, year, source type per PDR 4.11 |
| 02.05 | Completed | 2026-05-22 10:22 PM | 2026-05-22 10:23 PM | Create `src/pages/talks/[slug].astro` — Talk detail page: title, speaker, summary, TedEmbed, transcript link, EvidenceBadge, evidence notes (collapsible `<details>`), related experiments, related studies |
| 02.06 | Completed | 2026-05-22 10:22 PM | 2026-05-22 10:23 PM | Create `src/pages/experiments/[slug].astro` — Experiment detail page: title, one-line claim, instructions (ordered list), time cost, effort, EvidenceBadge, evidence notes (collapsible `<details>`), source talks, contraindications, related studies |
| 02.07 | Completed | 2026-05-22 10:22 PM | 2026-05-22 10:23 PM | Create `src/lib/structured-data.ts` with helpers for generating JSON-LD for Talk (CreativeWork) and Experiment (HowTo) pages |
| 02.08 | Completed | 2026-05-22 10:22 PM | 2026-05-22 10:23 PM | Add JSON-LD structured data to Talk and Experiment page heads via ContentLayout |
| 02.09 | Completed | 2026-05-22 10:23 PM | 2026-05-22 10:24 PM | Write 3 additional talk content files and 2 additional experiment content files with full frontmatter and body (total: 5 talks, 5 experiments across all four clusters) |
| 02.10 | Completed | 2026-05-22 10:24 PM | 2026-05-22 10:25 PM | Create `tests/e2e/navigation.spec.ts` — Playwright test: navigate to a talk detail page, verify title, speaker, evidence badge, TED embed/link, and related experiments are present |
| 02.11 | Completed | 2026-05-22 10:24 PM | 2026-05-22 10:25 PM | Extend `tests/e2e/navigation.spec.ts` — Playwright test: navigate to an experiment detail page, verify title, claim, instructions, evidence badge, source talks are present |
| 02.12 | Completed | 2026-05-22 10:25 PM | 2026-05-22 10:26 PM | Extend `tests/e2e/accessibility.spec.ts` to scan talk detail and experiment detail pages |
| 02.13 | Completed | 2026-05-22 10:26 PM | 2026-05-22 10:27 PM | Verify: every talk page has all required elements per US-003 acceptance criteria; every experiment page has all required elements per US-004; JSON-LD validates |
| 02.14 | Completed | 2026-05-22 10:27 PM | 2026-05-22 10:28 PM | Stage all changes and commit: "Phase 02: Talk and experiment detail pages with evidence badges, TED embeds, and structured data" |

### Phase 02 Summary

- **Changes:** Created `ContentLayout.astro` with two-column grid, `EvidenceBadge.astro` with WCAG-compliant colors, `TedEmbed.astro` with lazy iframe and sandbox, `StudyLink.astro` with outbound links, `structured-data.ts` with CreativeWork/HowTo JSON-LD helpers. Created `talks/[slug].astro` and `experiments/[slug].astro` detail pages. Added 3 talks (Susan Cain, Shawn Achor, Andy Puddicombe) and 3 experiments (solitude break, gratitude journal, 10-min meditation) covering all four clusters. Created `navigation.spec.ts` with talk/experiment tests and extended accessibility tests. Total: 6 talks, 6 experiments, 13 pages.
- **Commit:** `Phase 02: Talk and experiment detail pages with evidence badges, TED embeds, and structured data`

---

## Phase 03: Cluster Hubs

**Goal:** Four cluster hub pages with "Start here" strips, card grids, and cross-cluster content. This is the Minimum Useful Release.
**Depends on:** Phase 02.
**PDR sections:** 4.6, 4.7, 4.9
**User stories:** US-002, US-007 (partial — filter UI rendered but not interactive until Phase 06)

| No | Status | Started (PST) | Completed (PST) | Description |
|----|--------|---------------|------------------|-------------|
| 03.01 | Completed | 2026-05-22 10:28 PM | 2026-05-22 10:30 PM | Create `src/components/ExperimentCard.astro` with title, one-line claim, EvidenceBadge, time cost, effort, cluster tags as `data-*` attributes per PDR 4.6 |
| 03.02 | Completed | 2026-05-22 10:28 PM | 2026-05-22 10:30 PM | Create `src/components/TalkCard.astro` with title, speaker, thumbnail/placeholder, EvidenceBadge, cluster tags as `data-*` attributes per PDR 4.7 |
| 03.03 | Completed | 2026-05-22 10:30 PM | 2026-05-22 10:32 PM | Create `src/pages/clusters/[id].astro` — Cluster hub page: editorial intro from cluster content body, "Start here" experiment strip from `hero_experiments`, card grid of all matching talks and experiments |
| 03.04 | Completed | 2026-05-22 10:30 PM | 2026-05-22 10:32 PM | Implement responsive card grid layout: 1 column mobile, 2 tablet, 3 desktop |
| 03.05 | Completed | 2026-05-22 10:30 PM | 2026-05-22 10:32 PM | Implement "Related clusters" section with links to adjacent cluster hubs |
| 03.06 | Completed | 2026-05-22 10:28 PM | 2026-05-22 10:30 PM | Write cluster content files for all four clusters (body, cognition, environment, social) with editorial descriptions, hero experiments, canonical talks, and related clusters |
| 03.07 | Completed | 2026-05-22 10:28 PM | 2026-05-22 10:30 PM | Create `src/components/FilterPanel.astro` with checkbox/chip controls for behavior, goal, evidence level, time cost, effort per PDR 4.9 — renders as static HTML (interactive filtering in Phase 06) |
| 03.08 | Completed | 2026-05-22 10:30 PM | 2026-05-22 10:32 PM | Add FilterPanel to cluster hub page (collapsed on mobile, sidebar on desktop) |
| 03.09 | Completed | 2026-05-22 10:28 PM | 2026-05-22 10:30 PM | Add `data-behavior`, `data-goal`, `data-evidence`, `data-time`, `data-effort` attributes to ExperimentCard and TalkCard for future filter targeting |
| 03.10 | Completed | 2026-05-22 10:32 PM | 2026-05-22 10:33 PM | Verify cross-cluster content: a talk tagged `[body, social]` appears on both cluster hubs |
| 03.11 | Completed | 2026-05-22 10:32 PM | 2026-05-22 10:33 PM | Extend `tests/e2e/navigation.spec.ts` — navigate to each cluster hub, verify intro, "Start here" strip, and card grid are present |
| 03.12 | Completed | 2026-05-22 10:32 PM | 2026-05-22 10:33 PM | Extend `tests/e2e/accessibility.spec.ts` to scan cluster hub pages |
| 03.13 | Completed | 2026-05-22 10:33 PM | 2026-05-22 10:34 PM | Verify: this is the Minimum Useful Release — browsable clusters with evidence-labeled experiments and talks |
| 03.14 | Started | 2026-05-22 10:34 PM | | Stage all changes and commit: "Phase 03: Cluster hubs with card grids — Minimum Useful Release" |

### Phase 03 Summary

- **Changes:** Created `ExperimentCard.astro` and `TalkCard.astro` with data-* filter attributes, `FilterPanel.astro` with static checkbox filters, `clusters/[id].astro` hub page with editorial intro, Start Here strip, responsive card grids, and related clusters. Created cluster content for cognition, environment, social. Added 1 talk (Margaret Heffernan) and 1 experiment (Thinking Partner) for social cluster coverage. Fixed EvidenceBadge colors for WCAG AA compliance. Added 5 cluster hub e2e tests and accessibility scan. Total: 19 pages (4 cluster hubs, 7 experiments, 7 talks, 1 index).
- **Commit:** `Phase 03: Cluster hubs with card grids — Minimum Useful Release`

---

## Phase 04: Search Integration

**Goal:** Client-side search powered by Pagefind, accessible from any page, with result type chips and zero-results feedback.
**Depends on:** Phase 03 (Pagefind needs rendered HTML to index).
**PDR sections:** 4.12, 1.2
**User stories:** US-006, US-008

| No | Status | Started (PST) | Completed (PST) | Description |
|----|--------|---------------|------------------|-------------|
| 04.01 | Open | | | Install `pagefind` as a dev dependency; add a `postbuild` script to `package.json` that runs `pagefind --site dist` after `astro build` |
| 04.02 | Open | | | Add `data-pagefind-body` attributes to content areas on talk detail, experiment detail, and cluster hub pages; exclude nav, footer, sidebar from indexing |
| 04.03 | Open | | | Add `data-pagefind-meta` attributes to tag result types: `data-pagefind-meta="type:talk"` on talk pages, `data-pagefind-meta="type:experiment"` on experiment pages |
| 04.04 | Open | | | Create `src/islands/SearchWidget.tsx` — Pagefind UI wrapper, `client:idle` hydration, search input with `aria-label="Search experiments and talks"`, result list with type chips |
| 04.05 | Open | | | Implement zero-results state in SearchWidget: message with suggestions (browse by cluster, check spelling) per US-008 |
| 04.06 | Open | | | Create `src/pages/search.astro` wrapping SearchWidget in BaseLayout |
| 04.07 | Open | | | Add search link to Header nav (links to `/search/`) |
| 04.08 | Open | | | Document Pagefind index size for current content volume (number of files, total index size in KB) |
| 04.09 | Open | | | Create `tests/e2e/search.spec.ts` — Playwright tests: search "stress" returns results; search "meeting" returns results; search nonsense shows zero-results message; search input is keyboard-accessible |
| 04.10 | Open | | | Extend `tests/e2e/accessibility.spec.ts` to scan search page |
| 04.11 | Open | | | Verify: search works after build; Pagefind loads on first interaction, not on page load |
| 04.12 | Open | | | Stage all changes and commit: "Phase 04: Pagefind search integration with result types and zero-results feedback" |

### Phase 04 Summary

_To be filled after completion._

- **Changes:** TBD
- **Commit:** TBD

---

## Phase 05: Persona Dashboards

**Goal:** At least 3 persona dashboard pages with curated recommendations, goal-oriented navigation, and editorial rationale.
**Depends on:** Phase 03.
**PDR sections:** 4.6, 4.7 (reuse ExperimentCard, TalkCard)
**User stories:** US-005

| No | Status | Started (PST) | Completed (PST) | Description |
|----|--------|---------------|------------------|-------------|
| 05.01 | Open | | | Create `src/pages/personas/[id].astro` — Persona dashboard page: persona name, goals (from body content), recommended clusters (linked), recommended experiments (ExperimentCards), "Best first steps" curated section (top 2–3 experiments with editorial context), "Why this path" explanation |
| 05.02 | Open | | | Write persona content files for at least 3 personas: `knowledge-worker.md` ("Work better"), `student.md` ("Learn better"), `team-lead.md` ("Lead teams") — each with goals, recommended clusters, recommended experiments, and editorial body content |
| 05.03 | Open | | | Implement "Best first steps" section: render the first 2–3 recommended experiments with full ExperimentCard and a brief editorial note |
| 05.04 | Open | | | Add persona dashboard links to Header nav (under a "Personas" dropdown or direct links) |
| 05.05 | Open | | | Verify personas reference content from multiple clusters (not locked to one cluster) |
| 05.06 | Open | | | Extend `tests/e2e/navigation.spec.ts` — navigate to each persona dashboard, verify goals, recommended experiments, and recommended clusters are present |
| 05.07 | Open | | | Extend `tests/e2e/accessibility.spec.ts` to scan persona dashboard pages |
| 05.08 | Open | | | Stage all changes and commit: "Phase 05: Persona dashboards with curated recommendations" |

### Phase 05 Summary

_To be filled after completion._

- **Changes:** TBD
- **Commit:** TBD

---

## Phase 06: Interactive Features

**Goal:** Save, print, share, and filter functionality. Full client-side interaction model from URD.
**Depends on:** Phase 03 (filter targets), Phase 04 (search page exists).
**PDR sections:** 4.13, 4.14, 4.15, 4.16, 4.17, 2.5
**User stories:** US-007, US-009, US-010, US-011, US-012, US-013, US-020

| No | Status | Started (PST) | Completed (PST) | Description |
|----|--------|---------------|------------------|-------------|
| 06.01 | Open | | | Create `src/lib/saved.ts` — localStorage utilities: `getSaved()`, `saveExperiment(id)`, `removeExperiment(id)`, `clearAll()`, `isSaved(id)`. Store format: `{ version: 1, items: [{ experimentId, savedAt }] }` per PDR 2.5 |
| 06.02 | Open | | | Create `tests/unit/saved.test.ts` — Vitest tests for saved.ts: save, remove, clearAll, isSaved, version field, graceful handling of missing/corrupt localStorage |
| 06.03 | Open | | | Create `src/islands/SaveButton.tsx` — toggle saved state, filled/outline icon, localStorage unavailable tooltip, localStorage full error per PDR 4.14. Hydrate `client:idle`. |
| 06.04 | Open | | | Create `src/islands/SaveManager.tsx` — list saved experiments with remove-single and clear-all actions, empty state with browse link, localStorage unavailable message per PDR 4.15. Hydrate `client:idle`. |
| 06.05 | Open | | | Create `src/pages/saved.astro` wrapping SaveManager in BaseLayout |
| 06.06 | Open | | | Add SaveButton to experiment detail page (`src/pages/experiments/[slug].astro`) |
| 06.07 | Open | | | Create `src/islands/ShareButton.tsx` — copy `window.location.href` to clipboard, confirmation indicator for 2 seconds, Clipboard API fallback per PDR 4.16. Hydrate `client:idle`. |
| 06.08 | Open | | | Add ShareButton to experiment detail and talk detail pages |
| 06.09 | Open | | | Create `src/components/PrintButton.astro` — `<button>` with `onclick="window.print()"`, hidden in print via `.no-print` class per PDR 4.17 |
| 06.10 | Open | | | Add PrintButton to experiment detail page |
| 06.11 | Open | | | Enhance `src/styles/print.css` — experiment detail print layout: single column, hide nav/footer/interactive elements, show evidence notes expanded, US Letter and A4 safe margins |
| 06.12 | Open | | | Create `src/islands/FilterController.tsx` — read URL query params on mount, sync with FilterPanel checkboxes, show/hide cards by `data-*` attributes, update URL via `history.replaceState` per PDR 4.13. Hydrate `client:idle`. |
| 06.13 | Open | | | Wire FilterController into cluster hub pages alongside FilterPanel |
| 06.14 | Open | | | Create `tests/e2e/save.spec.ts` — Playwright tests: save an experiment, navigate away, return to /saved/ and see it listed; remove it; clear all; verify persistence across page loads |
| 06.15 | Open | | | Create `tests/e2e/print.spec.ts` — Playwright test: emulate print media on experiment page, verify nav/footer hidden, evidence notes visible |
| 06.16 | Open | | | Add filter interaction tests to `tests/e2e/navigation.spec.ts` — select a filter on cluster hub, verify cards are filtered; verify URL query params update |
| 06.17 | Open | | | Verify graceful degradation: with JS disabled, save/filter/share elements are hidden or show fallback messages; content remains readable (US-020) |
| 06.18 | Open | | | Extend `tests/e2e/accessibility.spec.ts` to scan /saved/ page |
| 06.19 | Open | | | Stage all changes and commit: "Phase 06: Save, print, share, and filter interactions" |

### Phase 06 Summary

_To be filled after completion._

- **Changes:** TBD
- **Commit:** TBD

---

## Phase 07: Landing Page and Static Pages

**Goal:** Landing page with all entry points, About page with methodology, Resources page with study listings.
**Depends on:** Phase 05 (persona cards link to dashboards), Phase 04 (search bar links to search).
**PDR sections:** 4.1, 4.4, 4.11
**User stories:** US-001, US-022, US-023

| No | Status | Started (PST) | Completed (PST) | Description |
|----|--------|---------------|------------------|-------------|
| 07.01 | Open | | | Rebuild `src/pages/index.astro` as the landing page: hero section explaining HAx, cluster cards (4, linking to cluster hubs), persona cards (3+, linking to dashboards), featured experiments strip (editorially curated), search bar (linking to /search/), methodology ribbon (one-line evidence summary with link to /about/) |
| 07.02 | Open | | | Create `src/pages/about.astro` — methodology page: evidence rubric table (5 levels with definitions), citation policy, editorial posture, update cadence, legal/copyright notes (TED attribution, CC BY-NC-ND) |
| 07.03 | Open | | | Create `src/pages/resources.astro` — resources listing: render all Resource collection entries grouped by type, with StudyLink component for study-type resources; include sections for TED playlists, transcript guidance, glossary |
| 07.04 | Open | | | Write additional Resource content files as needed (TED playlists, transcript guidance links, glossary entries) |
| 07.05 | Open | | | Extend `tests/e2e/navigation.spec.ts` — landing page: verify cluster cards, persona cards, featured experiments, search bar, methodology ribbon are present and linked correctly |
| 07.06 | Open | | | Extend `tests/e2e/navigation.spec.ts` — About page: verify evidence rubric table, legal notes |
| 07.07 | Open | | | Extend `tests/e2e/accessibility.spec.ts` to scan landing page, About, and Resources pages |
| 07.08 | Open | | | Stage all changes and commit: "Phase 07: Landing page, About, and Resources pages" |

### Phase 07 Summary

_To be filled after completion._

- **Changes:** TBD
- **Commit:** TBD

---

## Phase 08: SEO, Structured Data, Accessibility, and Analytics

**Goal:** Production-quality SEO, complete structured data, accessibility remediation, analytics decision. This is the First Full Feature Release.
**Depends on:** Phase 07 (all page templates exist).
**PDR sections:** 6, 7, 8, 4.1, 4.5
**User stories:** US-018, US-019 (remediation), US-026 (preview deployment workflow)
**NFRs:** NFR-004, NFR-005, NFR-006, NFR-007, NFR-008, NFR-011, NFR-012, NFR-013, NFR-014, NFR-015, NFR-016

| No | Status | Started (PST) | Completed (PST) | Description |
|----|--------|---------------|------------------|-------------|
| 08.01 | Open | | | Add JSON-LD structured data to remaining page types: cluster hubs (CollectionPage), persona dashboards (CollectionPage), landing page (WebSite), About (WebPage), Resources (CollectionPage) via `src/lib/structured-data.ts` |
| 08.02 | Open | | | Add Open Graph and Twitter card meta tags to BaseLayout: `og:title`, `og:description`, `og:image`, `og:url`, `twitter:card`, `twitter:title`, `twitter:description` — populated from page props |
| 08.03 | Open | | | Install and configure `@astrojs/sitemap` in `astro.config.mjs` for XML sitemap generation at `/sitemap-index.xml` |
| 08.04 | Open | | | Verify canonical URLs on all pages (BaseLayout should set `<link rel="canonical">` from `SITE_URL` + current path) |
| 08.05 | Open | | | Create `public/_headers` file for Cloudflare Pages with Content Security Policy: `default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; frame-src embed.ted.com; img-src 'self' data:; connect-src 'self'` per PDR Section 6 |
| 08.06 | Open | | | Conduct manual keyboard navigation walkthrough on all page templates: landing, cluster hub, talk detail, experiment detail, persona dashboard, search, saved, about, resources — document findings |
| 08.07 | Open | | | Conduct screen reader testing (NVDA or VoiceOver) on talk detail, experiment detail, cluster hub, and landing page — document findings |
| 08.08 | Open | | | Fix all critical and serious accessibility issues found in manual testing (keyboard and screen reader) |
| 08.09 | Open | | | Verify color contrast: all body text meets 4.5:1 ratio, all large text meets 3:1 ratio (WCAG AA) |
| 08.10 | Open | | | Make analytics decision: if Plausible, add conditional script injection to BaseLayout (controlled by `PLAUSIBLE_DOMAIN` env var per PDR 1.3); if no analytics, document the decision in About page |
| 08.11 | Open | | | Create `public/robots.txt` allowing all crawlers, pointing to sitemap |
| 08.12 | Open | | | Verify preview deployment workflow: create a test PR, confirm Cloudflare Pages generates a preview URL (US-026) |
| 08.13 | Open | | | Run full Lighthouse CI across all page templates — verify Performance ≥ 90, Accessibility ≥ 90 |
| 08.14 | Open | | | Run full axe-core scan across all page templates — verify zero critical/serious violations |
| 08.15 | Open | | | Stage all changes and commit: "Phase 08: SEO, structured data, accessibility remediation, analytics — First Full Feature Release" |

### Phase 08 Summary

_To be filled after completion._

- **Changes:** TBD
- **Commit:** TBD

---

## Phase 09: Content Population and Launch Readiness

**Goal:** 40–60 content items with calibrated evidence labels, all QA checklists passed, production deployment ready.
**Depends on:** Phase 08.
**PDR sections:** 2.4 (seed data targets), 8 (test strategy)
**User stories:** All (final verification)
**NFRs:** NFR-001, NFR-002, NFR-003, NFR-017, NFR-018, NFR-021, NFR-024

| No | Status | Started (PST) | Completed (PST) | Description |
|----|--------|---------------|------------------|-------------|
| 09.01 | Open | | | Conduct evidence rubric calibration: 2+ reviewers independently rate 10 items, compare agreement, refine rubric definitions if agreement < 80% |
| 09.02 | Open | | | Author remaining Talk content files to reach at least 10 per cluster (≥ 40 total) |
| 09.03 | Open | | | Author remaining Experiment content files to reach at least 5 per cluster (≥ 20 total) |
| 09.04 | Open | | | Author remaining Study content files linked from talks and experiments |
| 09.05 | Open | | | Verify every cluster hub has at least 5 hero experiments and 5 canonical talks |
| 09.06 | Open | | | Run internal link checker across all built pages — fix all broken internal links |
| 09.07 | Open | | | Run external link checker — flag broken TED URLs and study DOIs for editorial review and fix or annotate |
| 09.08 | Open | | | Measure Core Web Vitals (LCP, INP, CLS) on landing page, cluster hub, talk detail, experiment detail — verify all meet "good" thresholds (NFR-001, NFR-002, NFR-003) |
| 09.09 | Open | | | Conduct editorial QA: verify every content page has source links, evidence label, and last-reviewed date (US-017) |
| 09.10 | Open | | | Conduct print QA: print experiment cards in Chrome and Firefox, verify legibility on US Letter and A4 (NFR-024) |
| 09.11 | Open | | | Conduct legal QA: verify TED embed usage, copyright notices, transcript link accuracy, CC BY-NC-ND compliance |
| 09.12 | Open | | | Configure production domain and DNS on Cloudflare Pages |
| 09.13 | Open | | | Final deployment to production domain, smoke test all major pages |
| 09.14 | Open | | | Stage all changes and commit: "Phase 09: Content population, QA, and launch readiness" |

### Phase 09 Summary

_To be filled after completion._

- **Changes:** TBD
- **Commit:** TBD

---

## Coverage Checklist

_Every PDR component appears in at least one phase task._

| PDR Section | Component | Phase | Task(s) |
|-------------|-----------|-------|---------|
| 1.2 | Dependencies (package.json) | 00 | 00.01 |
| 1.3 | Configuration variables | 00, 08 | 00.05, 08.05, 08.10 |
| 2.1 | Content collection schemas | 00 | 00.03 |
| 2.2 | Content file layout | 00 | 00.04 |
| 2.4 | Seed / sample data | 00, 02, 09 | 00.04, 02.09, 09.02–09.04 |
| 2.5 | localStorage schema | 06 | 06.01 |
| 3 | Package layout | 00 | 00.01 |
| 4.1 | BaseLayout | 01 | 01.02 |
| 4.2 | ContentLayout | 02 | 02.01 |
| 4.3 | Header | 01 | 01.03, 01.04 |
| 4.4 | Footer | 01 | 01.05 |
| 4.5 | Breadcrumb | 01 | 01.06 |
| 4.6 | ExperimentCard | 03 | 03.01 |
| 4.7 | TalkCard | 03 | 03.02 |
| 4.8 | EvidenceBadge | 02 | 02.02 |
| 4.9 | FilterPanel | 03 | 03.07 |
| 4.10 | TedEmbed | 02 | 02.03 |
| 4.11 | StudyLink | 02 | 02.04 |
| 4.12 | SearchWidget | 04 | 04.04 |
| 4.13 | FilterController | 06 | 06.12 |
| 4.14 | SaveButton | 06 | 06.03 |
| 4.15 | SaveManager | 06 | 06.04 |
| 4.16 | ShareButton | 06 | 06.07 |
| 4.17 | PrintButton | 06 | 06.09 |
| 5 | Page routing | 00–07 | All page creation tasks |
| 6 | Security (CSP, HTTPS) | 08 | 08.05 |
| 7 | Observability (analytics) | 08 | 08.10 |
| 8 | Test strategy | 01–09 | All test tasks (01.09–01.11, 02.10–02.12, etc.) |
| 9 | Traceability matrix | — | This coverage checklist validates coverage |

<!-- Added during finalization: Coverage checklist added to verify complete PDR-to-plan traceability. -->
