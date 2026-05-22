---
document: "Physical Design Requirements"
version: "1.0"
status: "final"
source: "sdlc/docs/draft.pdr.md"
user_requirements: "sdlc/docs/final.user.md"
finalized_date: "2026-05-22"
---

# HAx Static Website — Physical Design Requirements

**Source document:** `sdlc/docs/final.user.md`
**Project root:** `C:\Projects\hax`
**Date:** 2026-05-22

## 1. System Context

### 1.1 Existing Infrastructure to Reuse

| Asset | Location | Reuse Strategy |
|-------|----------|---------------|
| (none) | — | Greenfield project; no existing code to reuse |

### 1.2 New Dependencies

| Package | Purpose | Version Constraint | License |
|---------|---------|-------------------|---------|
| astro | Static site generator | ^5.x | MIT |
| @astrojs/sitemap | XML sitemap generation | ^5.x (match Astro) | MIT |
| @astrojs/check | TypeScript type checking for Astro | latest | MIT |
| typescript | Type checking | ^5.x | Apache-2.0 |
| pagefind | Static search indexing | ^1.x | MIT |
| zod | Schema validation (used by Astro content collections) | ^3.x | MIT |
| playwright | End-to-end testing | ^1.x | Apache-2.0 |
| @axe-core/playwright | Accessibility testing in Playwright | ^4.x | MPL-2.0 |
| vitest | Unit/component testing | ^3.x | MIT |

<!-- Added during finalization: playwright, @axe-core/playwright, vitest — test dependencies not in draft PDR. Required by test strategy (Section 8). -->

### 1.3 Configuration

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `SITE_URL` | string | `https://hax.example.com` | Canonical site URL for sitemap, OG metadata, and canonical links |
| `PLAUSIBLE_DOMAIN` | string | (empty) | Plausible Analytics domain; if empty, analytics script is not injected |
| `PLAUSIBLE_SCRIPT_URL` | string | `https://plausible.io/js/script.js` | Plausible script source URL (supports self-hosted) |
| `DEFAULT_LOCALE` | string | `en` | Default locale for i18n routing |
| `TED_EMBED_ENABLED` | boolean | `true` | Master toggle for TED embed iframes; if false, all talk pages show outbound link only |

<!-- Added during finalization: Configuration variables not in draft PDR. Required for deployment flexibility and TED embed fallback (Risk 1). -->

## 2. Data Model

### 2.1 Content Collection Schema

HAx uses Astro content collections with Zod-based schemas defined in `src/content/config.ts`. This is the equivalent of a database schema for a static site — it validates all content at build time and generates TypeScript types for template consumption.

```typescript
// src/content/config.ts
import { defineCollection, z, reference } from 'astro:content';

const evidenceLevelEnum = z.enum([
  'high',
  'moderate',
  'preliminary',
  'mixed_contested',
  'narrative_conceptual',
]);

const clusterEnum = z.enum(['body', 'cognition', 'environment', 'social']);

const effortEnum = z.enum(['low', 'medium', 'high']);

const talks = defineCollection({
  type: 'content',
  schema: z.object({
    id: z.string(),
    title: z.string(),
    speaker: z.string(),
    ted_url: z.string().url(),
    event: z.string().optional(),
    published_year: z.number().int().optional(),
    duration_seconds: z.number().int().min(0).optional(),
    clusters: z.array(clusterEnum).min(1),
    behaviors: z.array(z.string()).min(1),
    goals: z.array(z.string()).min(1),
    persona_tags: z.array(z.string()).default([]),
    transcript_url: z.string().url().optional(),
    embed_url: z.string().url().optional(),
    thumbnail: z.string().optional(),
    evidence_level: evidenceLevelEnum,
    evidence_notes: z.string(),
    related_experiments: z.array(reference('experiments')).default([]),
    related_studies: z.array(reference('studies')).default([]),
    last_reviewed: z.coerce.date(),
  }),
});

const experiments = defineCollection({
  type: 'content',
  schema: z.object({
    id: z.string(),
    title: z.string(),
    one_line_claim: z.string(),
    instructions: z.array(z.string()).min(1),
    time_cost_minutes: z.number().int().min(0),
    effort: effortEnum,
    contexts: z.array(z.string()).default([]),
    contraindications: z.string().optional(),
    clusters: z.array(clusterEnum).min(1),
    behaviors: z.array(z.string()).min(1),
    goals: z.array(z.string()).min(1),
    persona_tags: z.array(z.string()).default([]),
    source_talks: z.array(reference('talks')).min(1),
    related_studies: z.array(reference('studies')).default([]),
    evidence_level: evidenceLevelEnum,
    evidence_notes: z.string(),
    printable: z.boolean().default(true),
    last_reviewed: z.coerce.date(),
  }),
});

const studies = defineCollection({
  type: 'content',
  schema: z.object({
    id: z.string(),
    title: z.string(),
    authors: z.string(),
    year: z.number().int(),
    source_type: z.string(),
    doi_or_url: z.string().url(),
    relevance_note: z.string().optional(),
    evidence_tier: z.string().optional(),
  }),
});

const clusters = defineCollection({
  type: 'content',
  schema: z.object({
    id: clusterEnum,
    name: z.string(),
    hero_experiments: z.array(reference('experiments')).min(3),
    canonical_talks: z.array(reference('talks')).min(3),
    related_clusters: z.array(clusterEnum).default([]),
  }),
});

const personas = defineCollection({
  type: 'content',
  schema: z.object({
    id: z.string(),
    persona_name: z.string(),
    recommended_clusters: z.array(clusterEnum).min(1),
    recommended_experiments: z.array(reference('experiments')).min(1),
  }),
});

const resources = defineCollection({
  type: 'content',
  schema: z.object({
    id: z.string(),
    title: z.string(),
    type: z.string(),
    url: z.string().url().optional(),
    license_or_usage_note: z.string().optional(),
  }),
});

export const collections = {
  talks,
  experiments,
  studies,
  clusters,
  personas,
  resources,
};
```

### 2.2 Content File Layout

```
src/content/
  talks/
    amy-cuddy-body-language.md
    kelly-mcgonigal-stress.md
    ...
  experiments/
    power-pose.md
    stress-reframe.md
    ...
  studies/
    oppezzo-schwartz-2014.md
    ...
  clusters/
    body.md
    cognition.md
    environment.md
    social.md
  personas/
    knowledge-worker.md
    student.md
    team-lead.md
    ...
  resources/
    ted-playlist-stress.md
    ...
```

Each file uses YAML frontmatter for structured fields and Markdown body for long-form editorial content (summary, description, goals, why-this-path).

### 2.3 Relationships

All relationships are stored as ID arrays in frontmatter. Astro's `reference()` function validates that referenced IDs exist at build time — a broken reference fails the build (satisfies US-025).

```
Talk.related_experiments[]  →  Experiment (by collection slug)
Talk.related_studies[]      →  Study (by collection slug)
Experiment.source_talks[]   →  Talk (by collection slug)
Experiment.related_studies[] → Study (by collection slug)
Cluster.hero_experiments[]  →  Experiment (by collection slug)
Cluster.canonical_talks[]   →  Talk (by collection slug)
Persona.recommended_experiments[] → Experiment (by collection slug)
```

### 2.4 Seed Data

Phase 0 creates sample content files for validation:
- 2 talks (one per cluster, covering body and cognition)
- 3 experiments (linked to sample talks)
- 2 studies (linked from experiments)
- 1 cluster (body, with hero experiments and canonical talks)
- 1 persona (knowledge-worker)
- 1 resource (TED playlist link)

This is the minimum needed to validate the schema and exercise all collection references. Real content is populated in Phase 9.

### 2.5 localStorage Schema

Saved experiments are stored in `localStorage` under key `hax-saved`:

```typescript
interface SavedExperimentsStore {
  version: 1;
  items: Array<{
    experimentId: string;  // matches Experiment collection slug
    savedAt: string;       // ISO 8601 datetime
  }>;
}
```

<!-- Added during finalization: version field added per draft plan Concern 5 — enables future migration if the schema changes. -->

## 3. Package Layout

```
C:\Projects\hax\
  astro.config.mjs            # Astro configuration (site URL, integrations, i18n)
  tsconfig.json                # TypeScript configuration
  package.json                 # Dependencies and scripts
  public/                      # Static assets (favicon, fonts, images)
    fonts/
    images/
  src/
    content/
      config.ts                # Content collection schemas (Section 2.1)
      talks/                   # Talk content files (.md)
      experiments/             # Experiment content files (.md)
      studies/                 # Study content files (.md)
      clusters/                # Cluster content files (.md)
      personas/                # Persona content files (.md)
      resources/               # Resource content files (.md)
    layouts/
      BaseLayout.astro         # Root layout (head, skip links, header, footer)
      ContentLayout.astro      # Content detail layout (extends Base, adds breadcrumbs + sidebar)
    components/
      Header.astro             # Site header with navigation
      Footer.astro             # Site footer
      Breadcrumb.astro         # Breadcrumb navigation
      ExperimentCard.astro     # Compact experiment card for listings
      TalkCard.astro           # Compact talk card for listings
      EvidenceBadge.astro      # Evidence level badge with tooltip
      FilterPanel.astro        # Filter UI (behavior, goal, evidence, time, effort)
      TedEmbed.astro           # TED iframe embed with fallback
      StudyLink.astro          # Study reference link
    islands/
      SearchWidget.tsx         # Pagefind search (Astro island, client:idle)
      FilterController.tsx     # Filter state manager (Astro island, client:idle)
      SaveButton.tsx           # Save toggle (Astro island, client:idle)
      SaveManager.tsx          # Saved list manager (Astro island, client:idle)
      ShareButton.tsx          # Copy permalink (Astro island, client:idle)
    pages/
      index.astro              # Landing page
      about.astro              # About / methodology page
      resources.astro          # Resources listing page
      saved.astro              # Saved experiments page
      search.astro             # Search page
      clusters/
        [id].astro             # Cluster hub (dynamic route)
      talks/
        [slug].astro           # Talk detail (dynamic route)
      experiments/
        [slug].astro           # Experiment detail (dynamic route)
      personas/
        [id].astro             # Persona dashboard (dynamic route)
    styles/
      global.css               # Global styles, design tokens, typography
      print.css                # Print stylesheet
    lib/
      taxonomy.ts              # Taxonomy constants (clusters, evidence levels, efforts)
      saved.ts                 # localStorage save/load/remove utilities
      structured-data.ts       # JSON-LD generation helpers
  tests/
    e2e/
      navigation.spec.ts      # Playwright: site navigation flows
      search.spec.ts           # Playwright: search functionality
      save.spec.ts             # Playwright: save/remove experiments
      accessibility.spec.ts   # Playwright + axe-core: accessibility audit
      print.spec.ts            # Playwright: print layout verification
    unit/
      saved.test.ts            # Vitest: localStorage utility tests
      taxonomy.test.ts         # Vitest: taxonomy constant tests
      structured-data.test.ts  # Vitest: JSON-LD generation tests
  sdlc/
    docs/                      # SDLC documents (this file, etc.)
```

<!-- Added during finalization: tests/ directory, islands/ directory separation, lib/ utilities — not in draft PDR. Required for test strategy (Section 8) and clean component architecture. -->

## 4. Component Designs

### 4.1 BaseLayout

- **Purpose:** Root layout wrapping all pages; provides HTML head, skip links, header, footer, and print stylesheet
- **Location:** `src/layouts/BaseLayout.astro`
- **Implements:** US-018 (keyboard nav), US-019 (screen reader), US-013 (permalinks via canonical URL), NFR-005 (WCAG), NFR-012 (structured data shell), NFR-013 (OG metadata)
- **Interface:**
  ```astro
  ---
  interface Props {
    title: string;
    description: string;
    canonicalUrl?: string;
    ogImage?: string;
    structuredData?: object;
    noIndex?: boolean;
  }
  ---
  ```
- **Behavior:** Renders `<!DOCTYPE html>` with `<head>` (meta, OG, canonical, structured data JSON-LD, print stylesheet), skip link, Header component, `<main>` slot, Footer component. Injects Plausible script if `PLAUSIBLE_DOMAIN` is set.
- **Dependencies:** Header, Footer. Depended on by all pages.

### 4.2 ContentLayout

- **Purpose:** Extends BaseLayout for content detail pages with breadcrumbs, sidebar, and content-type-specific structured data
- **Location:** `src/layouts/ContentLayout.astro`
- **Implements:** US-003 (talk detail structure), US-004 (experiment detail structure), US-017 (source attribution, last-reviewed date)
- **Interface:**
  ```astro
  ---
  interface Props {
    title: string;
    description: string;
    breadcrumbs: Array<{ label: string; href: string }>;
    lastReviewed: Date;
    structuredData: object;
  }
  ---
  ```
- **Behavior:** Renders BaseLayout with Breadcrumb component, a two-column layout (content area + sidebar slot), and last-reviewed date footer. Passes structured data to BaseLayout.
- **Dependencies:** BaseLayout, Breadcrumb. Depended on by talk and experiment detail pages.

### 4.3 Header

- **Purpose:** Site header with navigation links and search entry point
- **Location:** `src/components/Header.astro`
- **Implements:** US-001 (navigation entry points), US-006 (search access), US-018 (keyboard nav)
- **Interface:**
  ```astro
  ---
  interface Props {
    currentPath: string;
  }
  ---
  ```
- **Behavior:** Renders site title/logo, nav links (Clusters dropdown, Personas, Search, About, Saved), mobile hamburger menu. Current page link gets `aria-current="page"`. Search link navigates to `/search/`. Mobile menu uses `<details>/<summary>` or a button toggle with proper ARIA attributes.
- **Dependencies:** None. Depended on by BaseLayout.

### 4.4 Footer

- **Purpose:** Site footer with nav links, copyright, legal notice
- **Location:** `src/components/Footer.astro`
- **Implements:** US-022 (methodology link)
- **Behavior:** Renders nav links (About, Resources, methodology link), copyright notice, TED attribution statement ("HAx is not affiliated with TED"), non-commercial use notice.
- **Dependencies:** None. Depended on by BaseLayout.

### 4.5 Breadcrumb

- **Purpose:** Breadcrumb navigation trail
- **Location:** `src/components/Breadcrumb.astro`
- **Implements:** NFR-012 (BreadcrumbList structured data)
- **Interface:**
  ```astro
  ---
  interface Props {
    items: Array<{ label: string; href: string }>;
  }
  ---
  ```
- **Behavior:** Renders an ordered list of breadcrumb links with `aria-label="Breadcrumb"`. Last item is current page (not linked). Emits `BreadcrumbList` JSON-LD alongside the visual breadcrumb.
- **Dependencies:** None. Depended on by ContentLayout.

### 4.6 ExperimentCard

- **Purpose:** Compact card for experiment listings on cluster hubs, persona dashboards, and search results
- **Location:** `src/components/ExperimentCard.astro`
- **Implements:** US-002 (cluster hub content), US-005 (persona dashboard content), US-007 (filterable cards), US-014 (evidence badge in listing)
- **Interface:**
  ```astro
  ---
  interface Props {
    slug: string;
    title: string;
    oneLineClaim: string;
    evidenceLevel: string;
    timeCostMinutes: number;
    effort: string;
    clusters: string[];
    behaviors: string[];
    goals: string[];
  }
  ---
  ```
- **Behavior:** Renders a linked card with title, one-line claim, EvidenceBadge, time cost, effort indicator, and cluster/behavior/goal tags as `data-*` attributes for filtering. Links to `/experiments/{slug}/`.
- **Dependencies:** EvidenceBadge. Depended on by cluster hub, persona dashboard, search results, saved experiments pages.

### 4.7 TalkCard

- **Purpose:** Compact card for talk listings
- **Location:** `src/components/TalkCard.astro`
- **Implements:** US-002 (cluster hub content), US-005 (persona dashboard content), US-014 (evidence badge in listing)
- **Interface:**
  ```astro
  ---
  interface Props {
    slug: string;
    title: string;
    speaker: string;
    thumbnail?: string;
    evidenceLevel: string;
    clusters: string[];
  }
  ---
  ```
- **Behavior:** Renders a linked card with title, speaker, thumbnail (or placeholder), EvidenceBadge, and cluster tags as `data-*` attributes. Links to `/talks/{slug}/`.
- **Dependencies:** EvidenceBadge. Depended on by cluster hub, persona dashboard, search results pages.

### 4.8 EvidenceBadge

- **Purpose:** Displays evidence level as a color-coded label with tooltip
- **Location:** `src/components/EvidenceBadge.astro`
- **Implements:** US-014 (evidence level display)
- **Interface:**
  ```astro
  ---
  interface Props {
    level: 'high' | 'moderate' | 'preliminary' | 'mixed_contested' | 'narrative_conceptual';
    showTooltip?: boolean;  // default true
  }
  ---
  ```
- **Behavior:** Renders a `<span>` with class-based coloring and an optional `title` attribute tooltip describing the level. Colors: High = green, Moderate = blue, Preliminary = yellow, Mixed/Contested = orange, Narrative/Conceptual = gray.
- **Dependencies:** None. Depended on by ExperimentCard, TalkCard, talk detail page, experiment detail page.

### 4.9 FilterPanel

- **Purpose:** Filter UI with checkboxes/chips for narrowing content on cluster hubs
- **Location:** `src/components/FilterPanel.astro`
- **Implements:** US-007 (tag-based filters), US-009 (shareable filter state)
- **Interface:**
  ```astro
  ---
  interface Props {
    availableBehaviors: string[];
    availableGoals: string[];
    availableEvidenceLevels: string[];
    availableTimeCosts: number[];
    availableEfforts: string[];
  }
  ---
  ```
- **Behavior:** Renders filter groups with checkbox inputs. Each checkbox has a `name` matching the filter dimension and a `value` matching the tag value. FilterController island reads these inputs and manages state. Collapses to an expandable panel on mobile.
- **Dependencies:** None (static HTML; interactivity from FilterController island). Depended on by cluster hub pages.

### 4.10 TedEmbed

- **Purpose:** TED talk iframe embed with lazy loading and error fallback
- **Location:** `src/components/TedEmbed.astro`
- **Implements:** US-003 (TED video on talk detail)
- **Interface:**
  ```astro
  ---
  interface Props {
    embedUrl: string;
    tedUrl: string;
    title: string;
    speaker: string;
  }
  ---
  ```
- **Behavior:** If `TED_EMBED_ENABLED` config is true and `embedUrl` is provided, renders an `<iframe>` with `loading="lazy"`, `sandbox="allow-scripts allow-same-origin allow-popups"`, and `aria-label="{title} by {speaker} — TED Talk"`. Below the iframe, always renders a "Watch on TED.com" outbound link. If embed is disabled or embedUrl is missing, renders only the outbound link with a thumbnail placeholder.
- **Dependencies:** None. Depended on by talk detail page.

### 4.11 StudyLink

- **Purpose:** Renders a study reference with title, authors, year, and link
- **Location:** `src/components/StudyLink.astro`
- **Implements:** US-016 (related studies display)
- **Interface:**
  ```astro
  ---
  interface Props {
    title: string;
    authors: string;
    year: number;
    url: string;
    sourceType?: string;
  }
  ---
  ```
- **Behavior:** Renders a list item with study title as an outbound link, authors, year, and source type badge. Link opens in new tab with `rel="noopener noreferrer"`.
- **Dependencies:** None. Depended on by talk detail, experiment detail, resources page.

### 4.12 SearchWidget (Astro Island)

- **Purpose:** Client-side search powered by Pagefind
- **Location:** `src/islands/SearchWidget.tsx`
- **Implements:** US-006 (search across content types), US-008 (zero-results feedback)
- **Interface:** React/Preact component, hydrated with `client:idle`
- **Behavior:** On mount, initializes Pagefind JS. Renders a search input, result list with result type chips (Talk, Experiment, Resource), and zero-results state with suggestions. Pagefind index loads on first keystroke, not on page load. Search input is `type="search"` with `aria-label="Search experiments and talks"`.
- **Dependencies:** Pagefind client library. Depended on by search page, header search (optional inline mode).

### 4.13 FilterController (Astro Island)

- **Purpose:** Manages filter state on cluster hubs, syncs with URL query parameters
- **Location:** `src/islands/FilterController.tsx`
- **Implements:** US-007 (filter content), US-009 (shareable filter state)
- **Interface:** React/Preact component, hydrated with `client:idle`
- **Behavior:** On mount, reads URL query parameters and checks corresponding FilterPanel checkboxes. On filter change, updates URL query params (via `history.replaceState`) and shows/hides cards by comparing card `data-*` attributes against active filters. Cards that match no active filter in a dimension are hidden.
- **Dependencies:** FilterPanel (reads its checkbox state). Depended on by cluster hub pages.

### 4.14 SaveButton (Astro Island)

- **Purpose:** Toggle saved state for an experiment in localStorage
- **Location:** `src/islands/SaveButton.tsx`
- **Implements:** US-010 (save experiments locally)
- **Interface:** React/Preact component, hydrated with `client:idle`
  ```typescript
  interface Props {
    experimentId: string;
    experimentTitle: string;
  }
  ```
- **Behavior:** On mount, reads `hax-saved` from localStorage to determine initial state (filled vs outline icon). On click, toggles the experiment in/out of the saved list. If localStorage is unavailable, renders a disabled button with tooltip "Saving is not available in this browser." If localStorage is full, shows an error toast "Storage is full — remove some saved experiments."
- **Dependencies:** `src/lib/saved.ts`. Depended on by experiment detail page.

### 4.15 SaveManager (Astro Island)

- **Purpose:** Lists and manages saved experiments on the /saved/ page
- **Location:** `src/islands/SaveManager.tsx`
- **Implements:** US-011 (view and manage saved experiments)
- **Interface:** React/Preact component, hydrated with `client:idle`
- **Behavior:** On mount, reads `hax-saved` from localStorage. Renders a list of saved experiment cards (using experiment title and link). Each item has a Remove button. A Clear All button empties the entire list. If localStorage is unavailable, shows a message explaining the limitation. If no experiments are saved, shows an empty state with a link to browse clusters.
- **Dependencies:** `src/lib/saved.ts`. Depended on by saved experiments page.

### 4.16 ShareButton (Astro Island)

- **Purpose:** Copies the current page permalink to clipboard
- **Location:** `src/islands/ShareButton.tsx`
- **Implements:** US-013 (shareable permalinks)
- **Interface:** React/Preact component, hydrated with `client:idle`
- **Behavior:** On click, calls `navigator.clipboard.writeText(window.location.href)`. Shows a confirmation indicator (checkmark or "Copied!" tooltip) for 2 seconds. Falls back to a select-and-copy prompt on browsers that don't support the Clipboard API.
- **Dependencies:** None. Depended on by experiment detail page, talk detail page.

### 4.17 PrintButton

- **Purpose:** Triggers browser print dialog
- **Location:** `src/components/PrintButton.astro`
- **Implements:** US-012 (print experiment cards)
- **Behavior:** Renders a `<button>` that calls `window.print()` via an inline `onclick` handler. Hidden in print view via `@media print { .no-print { display: none } }`.
- **Dependencies:** `src/styles/print.css`. Depended on by experiment detail page.

<!-- 4.17 is an Astro component, not an island, because it only needs a trivial onclick handler — no state, no lifecycle. -->

## 5. Page Routing

HAx is a static site with no API endpoints. All routes produce prerendered HTML.

| Route | Page | Template | Content Source |
|-------|------|----------|----------------|
| `/` | Landing page | `src/pages/index.astro` | Curated content from all collections |
| `/clusters/{id}/` | Cluster hub | `src/pages/clusters/[id].astro` | Cluster content file + filtered talks/experiments |
| `/talks/{slug}/` | Talk detail | `src/pages/talks/[slug].astro` | Talk content file |
| `/experiments/{slug}/` | Experiment detail | `src/pages/experiments/[slug].astro` | Experiment content file |
| `/personas/{id}/` | Persona dashboard | `src/pages/personas/[id].astro` | Persona content file + referenced experiments |
| `/search/` | Search | `src/pages/search.astro` | Pagefind client-side |
| `/saved/` | Saved experiments | `src/pages/saved.astro` | Client-side from localStorage |
| `/about/` | About | `src/pages/about.astro` | Markdown page content |
| `/resources/` | Resources | `src/pages/resources.astro` | Resource collection listing |

## 6. Security Design

| Concern | Design |
|---------|--------|
| HTTPS | Cloudflare Pages enforces HTTPS by default. No action needed. (NFR-015) |
| CSP | `_headers` file on Cloudflare Pages. Policy: `default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; frame-src embed.ted.com; img-src 'self' data:; connect-src 'self'`. If Plausible is enabled, add Plausible script domain to `script-src` and `connect-src`. (NFR-016) |
| Subresource integrity | Pagefind JS/CSS are self-hosted in the build output, not loaded from CDN — SRI is not required. |
| Input sanitization | No user input is processed server-side. Client-side search input is handled by Pagefind operating on a prebuilt index. No query language, no injection surface. |
| localStorage | Contains only experiment IDs and timestamps. No PII, no tokens, no credentials. (NFR-009, NFR-010) |
| Third-party isolation | TED embeds in sandboxed iframes (`sandbox="allow-scripts allow-same-origin allow-popups"`). |
| Dependency supply chain | `npm audit` in CI. Dependabot or Renovate for automated dependency updates. |

<!-- Added during finalization: CSP header details, SRI assessment, dependency supply chain — not detailed in draft PDR. -->

## 7. Observability

HAx is a static site served from a CDN. There is no application server to observe. Observability is limited to:

| Concern | Approach |
|---------|----------|
| Uptime monitoring | Cloudflare Pages provides built-in analytics and uptime data. Optional: external uptime monitor (e.g., UptimeRobot free tier) pinging `/` every 5 minutes. |
| Analytics | Plausible (cookieless) if configured; otherwise no runtime analytics. (NFR-011) |
| Build health | CI pipeline reports build pass/fail. Build includes schema validation, link checking, and Lighthouse/axe-core checks. |
| Error reporting | No server-side errors possible. Client-side errors in Astro islands are caught by standard browser error handling. No error reporting service at MVP. |
| Performance monitoring | Lighthouse CI runs on every build. Core Web Vitals measured in Phase 9 and monitored post-launch via Pagespeed Insights or CrUX. |

<!-- Added during finalization: Observability section not in draft PDR. Minimal for a static site but required for completeness. -->

## 8. Test Strategy

| Test type | Tool | Scope | When |
|-----------|------|-------|------|
| **Build validation** | Astro build | Content schema validation, reference integrity, TypeScript type checking | Every CI run |
| **Unit tests** | Vitest | `src/lib/` utilities: saved.ts, taxonomy.ts, structured-data.ts | Every CI run |
| **End-to-end tests** | Playwright | Navigation flows, search, save/remove, filter, share, print layout | Every CI run |
| **Accessibility tests** | Playwright + axe-core | All page templates scanned for WCAG violations | Every CI run |
| **Link checking** | Custom build step or `linkinator` | Internal links on every build; external links on scheduled CI (weekly) | Build + scheduled |
| **Performance tests** | Lighthouse CI | LCP, INP, CLS, Performance score on key pages | Every CI run |
| **Print tests** | Playwright | Experiment detail print layout renders correctly | Per-phase verification |

**Test fixtures:** Sample content files in `src/content/` serve as fixtures for both build validation and e2e tests. No separate fixture directory needed — the sample content IS the fixture.

**Mocking:** No external APIs to mock. TED embeds are real iframes in e2e tests (testing against the built site). localStorage is available in Playwright browser contexts.

**Coverage target:** No numeric coverage target. Coverage is structural: every content collection type has at least one sample file, every page template has at least one e2e test, every island has at least one interaction test.

<!-- Added during finalization: Test strategy not in draft PDR (flagged as a gap). -->

## 9. Traceability Matrix

| User Story | PDR Section | Component(s) | Route |
|-----------|-------------|--------------|-------|
| US-001 | 4.1, 4.3 | BaseLayout, Header, Landing page | `/` |
| US-002 | 4.6, 4.7, 4.9 | ExperimentCard, TalkCard, FilterPanel, Cluster hub page | `/clusters/{id}/` |
| US-003 | 4.2, 4.10, 4.11 | ContentLayout, TedEmbed, StudyLink, Talk detail page | `/talks/{slug}/` |
| US-004 | 4.2, 4.8 | ContentLayout, EvidenceBadge, Experiment detail page | `/experiments/{slug}/` |
| US-005 | 4.6, 4.7 | ExperimentCard, TalkCard, Persona dashboard page | `/personas/{id}/` |
| US-006 | 4.12 | SearchWidget | `/search/` |
| US-007 | 4.9, 4.13 | FilterPanel, FilterController | `/clusters/{id}/?...` |
| US-008 | 4.12 | SearchWidget (zero-results state) | `/search/` |
| US-009 | 4.13 | FilterController (URL query params) | `/clusters/{id}/?...` |
| US-010 | 4.14 | SaveButton | `/experiments/{slug}/` |
| US-011 | 4.15 | SaveManager | `/saved/` |
| US-012 | 4.17 | PrintButton + print.css | `/experiments/{slug}/` |
| US-013 | 4.16 | ShareButton | `/experiments/{slug}/`, `/talks/{slug}/` |
| US-014 | 4.8 | EvidenceBadge | All content pages |
| US-015 | 4.2 | ContentLayout (collapsible `<details>`) | `/talks/{slug}/`, `/experiments/{slug}/` |
| US-016 | 4.11 | StudyLink | `/talks/{slug}/`, `/experiments/{slug}/` |
| US-017 | 4.2 | ContentLayout (last-reviewed date) | All content detail pages |
| US-018 | 4.1, 4.3, 4.5 | BaseLayout (skip links), Header, Breadcrumb | All pages |
| US-019 | 4.1 | BaseLayout (semantic landmarks) | All pages |
| US-020 | 4.1 | BaseLayout (static HTML, no-JS fallback) | All pages |
| US-021 | 4.10 | TedEmbed (transcript link) | `/talks/{slug}/` |
| US-022 | — | About page content | `/about/` |
| US-023 | 4.11 | StudyLink, Resources page | `/resources/` |
| US-024 | 2.1 | Content collection schema | Build-time |
| US-025 | 2.1 | Content collection schema (Zod validation) | Build-time |
| US-026 | 1.3 | Cloudflare Pages preview deployments | CI/CD |

| NFR | PDR Section | Design Response |
|-----|-------------|-----------------|
| NFR-001 | 4.1, 4.10 | Static HTML, lazy-loaded iframes, responsive images | 
| NFR-002 | 4.12–4.16 | Islands hydrate on idle/visible, not eagerly |
| NFR-003 | 4.1 | Explicit image dimensions, no layout-shifting injections |
| NFR-004 | 8 | Lighthouse CI in pipeline |
| NFR-005 | 4.1, 4.3, 4.5 | Skip links, semantic landmarks, ARIA attributes |
| NFR-006 | 8 | axe-core in CI |
| NFR-007 | 8 | axe-core in CI |
| NFR-008 | 4.1, 4.3 | All interactive elements focusable and operable |
| NFR-009 | 6 | No cookies set |
| NFR-010 | 6 | No tracking scripts |
| NFR-011 | 1.3, 4.1 | Plausible conditional injection |
| NFR-012 | 4.1, 4.5 | JSON-LD in BaseLayout + Breadcrumb |
| NFR-013 | 4.1 | OG meta in BaseLayout |
| NFR-014 | 1.2 | @astrojs/sitemap integration |
| NFR-015 | 6 | Cloudflare Pages HTTPS |
| NFR-016 | 6 | CSP _headers file |
| NFR-017 | 2.1 | Zod schemas in content config |
| NFR-018 | 8 | Link checker in CI |
| NFR-019 | — | Static build; Astro is fast for <500 pages |
| NFR-020 | — | Cloudflare Pages CDN |
| NFR-021 | 2.4 | Phase 9 content population targets |
| NFR-022 | 2.1 | Content collections scale to thousands of files |
| NFR-023 | 1.3 | Astro i18n config with default locale |
| NFR-024 | 4.17 | print.css + PrintButton |
