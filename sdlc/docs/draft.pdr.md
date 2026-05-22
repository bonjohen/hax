# HAx Static Website — Product Design Review

## Gaps in Source Document

### Critical

None. The user requirements document provides end-to-end user flows, clear functional requirements with priority and effort ratings, product boundaries and non-goals, and a well-defined interaction model (multi-perspective navigation via cluster, persona, behavior, goal, evidence level, and search).

### Notable

- **No explicit error/unhappy paths for technical failures.** The URD describes content contraindications and evidence contestation but does not specify what happens when a TED embed fails to load, when search returns zero results, when local storage is full or unavailable, or when a content file fails schema validation at build time. This PDR infers error handling for all of these (Section 14).
- **Data deletion lifecycle is implicit.** The URD says "save experiments" and specifies "local browser storage" but never says whether saved experiments can be removed, whether there is a limit, or what happens when storage fills. This PDR adds explicit clear/remove behaviors.
- **Configurability is implicit.** The URD does not state which editorial values are hardcoded vs. configurable (e.g., evidence rubric tiers, cluster definitions, persona definitions). This PDR treats all taxonomy values as content-driven (editable in content files) rather than code-driven.

## 1. Product Summary

HAx is a static, editorially curated discovery website for "Human Advantage Experiments" drawn from TED Talks. It organizes talks into four clusters (Body, Cognition, Environment, Social), extracts actionable experiments from those talks, tags content with evidence levels, and provides persona-guided navigation to help users find and act on relevant experiments. The site is non-commercial, uses TED embeds and links rather than rehosted media, and launches as an English-first MVP.

## 2. Product Intent

The product exists to solve the gap between "I watched a TED talk" and "I tried the experiment." TED's catalog is organized by topic and popularity; HAx reorganizes it by actionable outcome, evidence quality, and user context. The defensible value is the structured editorial layer — taxonomy, evidence labels, experiment extraction, and persona-guided navigation — not the underlying TED content itself.

## 3. Planning Scope

**In scope for MVP:**
- Static site with Astro, deployed to Cloudflare Pages
- Four cluster hubs, talk detail pages, experiment detail pages
- At least three persona dashboards
- Client-side search via Pagefind
- Tag-based filtering (behavior, goal, evidence level, duration)
- Local browser storage for saved experiments
- Printable experiment cards, shareable permalinks
- About page, Resources page
- WCAG 2.1 AA accessibility
- Privacy-minimal analytics (Plausible or none)
- 40–60 initial talks/experiments

**Out of scope:**
- User accounts or server-side state
- Video hosting, transcript mirroring, or TED media downloads
- Multilingual content (i18n routing is structural-only in MVP)
- Public contributor submissions or comments
- CMS integration (deferred to post-MVP)
- Commercial features (ads, sponsorships, paid tiers)

## 4. Primary Requirements (summary from user doc)

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Static landing page with cluster and persona entry points | MUST |
| FR-2 | Cluster hubs for Body, Cognition, Environment, Social | MUST |
| FR-3 | Talk detail pages with TED embed/link, evidence level, related content | MUST |
| FR-4 | Experiment detail pages with instructions, evidence, print/share/save | MUST |
| FR-5 | Structured metadata with evidence levels on all content | MUST |
| FR-6 | Client-side search across all content types | MUST |
| FR-7 | Tag-based filters for behavior, goal, evidence, duration | MUST |
| FR-8 | Shareable permalinks for all content pages | MUST |
| FR-9 | Printable experiment cards | SHOULD |
| FR-10 | Saved experiments in browser local storage | SHOULD |
| FR-11 | Persona dashboards (at least 3 for MVP) | SHOULD |
| FR-12 | Progressive disclosure on evidence and caveats | SHOULD |
| FR-13 | Transcript-first mode / prominent transcript links | SHOULD |
| FR-14 | Related studies pages | SHOULD |
| FR-15 | Multilingual routing and localized metadata | CAN (post-MVP) |
| FR-16 | Public contributor submissions or comments | CAN (post-MVP) |

## 5. Operating Modes

Not applicable. HAx is a static website with no distinct operating modes. All pages are prerendered and served statically. The only client-side state is the saved experiments list in local storage.

## 6. Interaction Model

Users interact with HAx through five navigation perspectives that all resolve to the same content model:

| Entry perspective | Entry point | Resolution |
|---|---|---|
| By cluster | Landing page → Cluster hub | Filtered view of talks and experiments in that cluster |
| By persona | Landing page → Persona dashboard | Curated experiment/talk recommendations for that persona's goals |
| By search | Search bar (any page) → Results page | Unified results across talks, experiments, and resources |
| By behavior/goal tag | Filter controls on cluster hubs or results | Narrowed content within current view |
| By evidence level | Filter controls on cluster hubs or results | Content filtered to a specific evidence tier |

All perspectives converge on the same detail pages (Talk detail, Experiment detail). No perspective requires a different data model or rendering pipeline.

## 7. Core Pipeline / Data Flow

### Build-time pipeline

```
Content files (Markdown + YAML frontmatter)
    │
    ├── src/content/talks/*.md
    ├── src/content/experiments/*.md
    ├── src/content/studies/*.md
    ├── src/content/clusters/*.md
    ├── src/content/personas/*.md
    └── src/content/resources/*.md
    │
    ▼
Astro Content Collections (schema validation at build)
    │
    ▼
Astro Build (static HTML generation)
    │
    ├── Page rendering (templates × content = static HTML)
    ├── Responsive image optimization
    ├── Sitemap generation
    ├── RSS/Atom feed generation (optional)
    └── Structured data injection (JSON-LD)
    │
    ▼
Pagefind indexing (post-build, indexes rendered HTML)
    │
    ▼
Static output (dist/)
    │
    ▼
Cloudflare Pages deployment
```

### Client-side data flow

```
User action (browse/search/filter/save)
    │
    ▼
Page navigation (full page load — static HTML)
    │
    ├── Search: Pagefind JS loads index → renders results
    ├── Filter: Client JS shows/hides tagged elements or re-queries Pagefind
    ├── Save: LocalStorage write (experiment ID + timestamp)
    ├── Print: CSS print stylesheet + browser print dialog
    └── Share: Copy permalink URL to clipboard
```

## 8. Content Model and Taxonomy Design

### Many-to-many taxonomy

The URD specifies a many-to-many taxonomy where a single talk or experiment belongs to multiple clusters, behaviors, goals, and persona tags. This is implemented through array-valued frontmatter fields, not through directory hierarchy. A talk in `src/content/talks/kelly-mcgonigal-stress.md` can have `clusters: [body, social]` — it does not live "in" a single cluster folder.

### Taxonomy values

Taxonomy values (cluster names, behavior tags, goal tags, persona tags) are defined in a central taxonomy file (`src/content/taxonomy.ts` or equivalent) that serves as both the Astro collection schema source and the filter UI source. This ensures the build fails if a content file uses an undefined tag.

### Evidence rubric

| Level | Label | Meaning |
|-------|-------|---------|
| `high` | High | Replicated experimental evidence from peer-reviewed sources |
| `moderate` | Moderate | At least one peer-reviewed study with direct relevance |
| `preliminary` | Preliminary | Pilot studies, conference papers, or indirect evidence |
| `mixed_contested` | Mixed/Contested | Conflicting findings or ongoing reproducibility debate |
| `narrative_conceptual` | Narrative/Conceptual | Speaker's framework, anecdote, or conceptual model without direct experimental support |

Evidence levels are editorial assignments, not computed. Each content file includes an `evidence_notes` field explaining the rating.

## 9. Data Model

### Talk

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | string | Yes | Stable identifier, e.g. `talk-cuddy-body-language` |
| slug | string | Yes | URL-safe, unique, used for routing |
| title | string | Yes | Talk title as presented by TED |
| speaker | string | Yes | Speaker name |
| ted_url | string (URL) | Yes | Canonical TED talk page URL |
| event | string | No | TED event name (e.g., "TEDGlobal 2012") |
| published_year | integer | No | Year published on TED.com |
| duration_seconds | integer | No | Talk length in seconds |
| clusters | string[] | Yes | 1+ cluster IDs from taxonomy |
| behaviors | string[] | Yes | 1+ behavior tags |
| goals | string[] | Yes | 1+ goal tags |
| persona_tags | string[] | No | 0+ persona IDs |
| summary | string (Markdown) | Yes | 2–4 sentence editorial summary |
| transcript_url | string (URL) | No | Link to TED interactive transcript |
| embed_url | string (URL) | No | TED embed URL for iframe |
| thumbnail | string | No | Path to local optimized thumbnail image |
| evidence_level | enum | Yes | One of the five rubric levels |
| evidence_notes | string (Markdown) | Yes | Justification for the evidence rating |
| related_experiments | string[] | No | Experiment IDs |
| related_studies | string[] | No | Study IDs |
| last_reviewed | date | Yes | ISO date of last editorial review |

### Experiment

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | string | Yes | Stable identifier, e.g. `exp-power-pose` |
| slug | string | Yes | URL-safe, unique |
| title | string | Yes | Experiment name |
| one_line_claim | string | Yes | Single-sentence claim the experiment tests |
| instructions | string[] | Yes | Ordered steps to try the experiment |
| time_cost_minutes | integer | Yes | Estimated time in minutes |
| effort | enum | Yes | `low`, `medium`, or `high` |
| contexts | string[] | No | Where/when to use (e.g., "before a meeting", "at your desk") |
| contraindications | string | No | When NOT to use this experiment |
| clusters | string[] | Yes | 1+ cluster IDs |
| behaviors | string[] | Yes | 1+ behavior tags |
| goals | string[] | Yes | 1+ goal tags |
| persona_tags | string[] | No | 0+ persona IDs |
| source_talks | string[] | Yes | 1+ Talk IDs this experiment is drawn from |
| related_studies | string[] | No | Study IDs |
| evidence_level | enum | Yes | Inherited from or independent of source talk |
| evidence_notes | string (Markdown) | Yes | Justification for the evidence rating |
| printable | boolean | Yes | Whether this experiment has a print-friendly card |
| last_reviewed | date | Yes | ISO date of last editorial review |

### Study

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | string | Yes | Stable identifier, e.g. `study-oppezzo-2014` |
| title | string | Yes | Publication title |
| authors | string | Yes | Author list |
| year | integer | Yes | Publication year |
| source_type | string | Yes | e.g., "journal article", "meta-analysis", "conference paper" |
| doi_or_url | string (URL) | Yes | DOI link or direct URL |
| summary | string (Markdown) | Yes | 2–3 sentence summary of findings |
| relevance_note | string | No | How this study relates to HAx experiments |
| evidence_tier | string | No | Where this study sits in evidence hierarchy |

### Cluster

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | string | Yes | One of: `body`, `cognition`, `environment`, `social` |
| name | string | Yes | Display name |
| description | string (Markdown) | Yes | Editorial description of the cluster's scope |
| hero_experiments | string[] | Yes | 3–5 experiment IDs for "Start here" strip |
| canonical_talks | string[] | Yes | Key talk IDs for this cluster |
| related_clusters | string[] | No | IDs of adjacent clusters |

### Persona Dashboard

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | string | Yes | e.g., `persona-knowledge-worker` |
| persona_name | string | Yes | Display name |
| goals | string (Markdown) | Yes | What this persona is trying to achieve |
| recommended_clusters | string[] | Yes | Cluster IDs |
| recommended_experiments | string[] | Yes | Experiment IDs, ordered by editorial priority |
| why_this_path | string (Markdown) | Yes | Editorial explanation of the curation rationale |

### Resource

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | string | Yes | Stable identifier |
| title | string | Yes | Resource title |
| type | string | Yes | e.g., "study", "playlist", "tool", "glossary-entry" |
| url | string (URL) | No | External link (null for inline resources) |
| description | string (Markdown) | Yes | What this resource is and why it's included |
| license_or_usage_note | string | No | Copyright or license note |

### Relationships

```
Talk ──many-to-many──> Cluster       (via clusters[])
Talk ──many-to-many──> Experiment    (via related_experiments[] / source_talks[])
Talk ──many-to-many──> Study         (via related_studies[])
Experiment ──many-to-many──> Cluster (via clusters[])
Experiment ──many-to-many──> Study   (via related_studies[])
Experiment ──many-to-many──> Talk    (via source_talks[])
Cluster ──one-to-many──> Cluster     (via related_clusters[])
Persona ──many-to-many──> Cluster    (via recommended_clusters[])
Persona ──many-to-many──> Experiment (via recommended_experiments[])
```

All relationships are stored as ID arrays in the referencing entity's frontmatter. Resolution happens at build time via Astro content collection references.

## 10. Component Design

### Architectural layers

```
Pages (Astro .astro files)
  │
  ▼
Layout Components (BaseLayout, ContentLayout, PrintLayout)
  │
  ▼
Feature Components (ClusterHub, TalkDetail, ExperimentDetail, PersonaDashboard, SearchResults)
  │
  ▼
UI Components (ExperimentCard, TalkCard, EvidenceBadge, FilterPanel, SaveButton, PrintButton, ShareButton)
  │
  ▼
Content Collections (Astro content layer — schema, queries, references)
  │
  ▼
Client Islands (SaveManager, SearchWidget, FilterController — Astro islands, hydrated on interaction)
```

Dependencies flow downward only. UI components never import from Pages. Client Islands never import from Layout Components.

### Component responsibilities

**BaseLayout** — Wraps all pages. Provides HTML head (meta, OG, structured data), skip links, site header, navigation, footer, and print stylesheet link. Serves FR-8 (permalinks via canonical URL) and accessibility (skip links, landmarks).

**ContentLayout** — Extends BaseLayout for content detail pages. Adds breadcrumb navigation, sidebar with related content, and structured data for the specific content type. Serves FR-3, FR-4 (talk and experiment detail structure).

**ClusterHub** — Renders a cluster page: intro block, "Start here" experiments strip, filter panel, and results grid of experiment and talk cards. Serves FR-2, FR-7. Depends on FilterPanel, ExperimentCard, TalkCard.

**TalkDetail** — Renders a talk page: summary, TED embed or outbound link, transcript link, evidence badge, tags, related experiments, related studies. Serves FR-3, FR-5, FR-13. Depends on EvidenceBadge, ExperimentCard.

**ExperimentDetail** — Renders an experiment page: claim, instructions, time/effort, evidence section, related talks, print/save/share actions, contraindications. Serves FR-4, FR-5, FR-9, FR-10, FR-12. Depends on EvidenceBadge, SaveButton, PrintButton, ShareButton.

**PersonaDashboard** — Renders a persona page: goals, recommended clusters, curated experiments, quick filters, "best first steps." Serves FR-11. Depends on ExperimentCard, TalkCard.

**SearchResults** — Renders search results page: Pagefind search box, result type chips, compact result cards. Serves FR-6. Depends on Pagefind client library.

**ExperimentCard** — Compact card for experiment listings: title, one-line claim, evidence badge, time cost, clusters, save action. Used by ClusterHub, PersonaDashboard, SearchResults, TalkDetail.

**TalkCard** — Compact card for talk listings: title, speaker, thumbnail, evidence badge, clusters. Used by ClusterHub, PersonaDashboard, SearchResults.

**EvidenceBadge** — Displays evidence level as a colored label with tooltip explaining the rating. Used everywhere evidence level appears.

**FilterPanel** — Client-side filter UI: checkboxes/chips for behavior, goal, evidence level, time cost, effort. Emits filter state; consuming components show/hide cards accordingly. Serves FR-7.

<!-- Structurally required: no explicit user requirement names FilterPanel as a component,
     but FR-7 (tag-based filters) requires a reusable filter UI across cluster hubs,
     persona dashboards, and search results. -->

**SaveButton** — Astro island. Toggles saved state for an experiment in localStorage. Shows filled/outline icon. Serves FR-10.

**PrintButton** — Triggers browser print dialog with print-optimized stylesheet active. Serves FR-9.

**ShareButton** — Copies the current page permalink to clipboard with confirmation toast. Serves FR-8.

**SaveManager** — Astro island on the "Saved Experiments" page (or section). Reads localStorage, renders saved experiment list, allows removal. Serves FR-10.

**SearchWidget** — Astro island wrapping Pagefind UI. Loads Pagefind index on first interaction (not on page load). Serves FR-6.

**FilterController** — Astro island that manages filter state on cluster hubs. Reads URL query params for sharable filter state, shows/hides cards. Serves FR-7.

## 11. Privacy and Permissions

| Concern | Design decision |
|---------|----------------|
| Analytics | Plausible Analytics (cookieless, no persistent identifiers) or none at MVP. No Google Analytics. |
| Local storage | Saved experiments stored in `localStorage` under a namespaced key (`hax-saved`). No PII stored. |
| Cookies | None set by the application. If Plausible is used, it sets no cookies. |
| Third-party scripts | TED embed iframes are the only third-party resource. Loaded with `loading="lazy"` and behind a click-to-load interaction where jurisdictional requirements are uncertain. |
| Consent | No cookie consent banner needed at MVP (no cookies). If third-party resources are added later, jurisdiction-aware consent must be implemented before deployment. |
| Data export/deletion | Saved experiments can be cleared by the user via SaveManager UI or by clearing browser storage. No server-side data to delete. |

## 12. User Interface Requirements

### Page templates (minimal screens)

| Template | Route pattern | Content source |
|----------|---------------|----------------|
| Landing | `/` | Hardcoded layout + dynamic cluster/persona/featured content from collections |
| Cluster hub | `/clusters/{cluster-id}/` | Cluster content file + filtered talks/experiments |
| Talk detail | `/talks/{slug}/` | Talk content file |
| Experiment detail | `/experiments/{slug}/` | Experiment content file |
| Persona dashboard | `/personas/{persona-id}/` | Persona content file + referenced experiments/clusters |
| Search/results | `/search/` | Pagefind client-side rendering |
| Saved experiments | `/saved/` | Client-side rendering from localStorage |
| About | `/about/` | Markdown content page |
| Resources | `/resources/` | Resource collection listing |
| Print card | `/experiments/{slug}/print/` | Experiment content, print-optimized layout (or CSS-only print variant) |

### Responsive breakpoints

| Breakpoint | Layout behavior |
|------------|----------------|
| < 640px (mobile) | Single column. Filters collapse to expandable panel. Cards stack vertically. |
| 640–1024px (tablet) | Two-column card grid. Filters in collapsible sidebar. |
| > 1024px (desktop) | Filter rail on left, content area on right. Three-column card grid on cluster hubs. |

### Print styles

Experiment detail pages include a `@media print` stylesheet that hides navigation, footer, interactive elements, and decorative images. The print layout is single-column, optimized for US Letter and A4. Evidence notes and source attribution are always visible in print.

## 13. State Model

The site is stateless on the server. Client-side state is minimal:

### Saved Experiments State

```
┌──────────┐     save()      ┌───────┐     remove()    ┌──────────┐
│ Not Saved │ ──────────────> │ Saved │ ──────────────> │ Not Saved │
└──────────┘                  └───────┘                 └──────────┘
                                  │
                                  │ clearAll()
                                  ▼
                              ┌──────────┐
                              │ Not Saved │ (all experiments)
                              └──────────┘
```

**State storage:** `localStorage` key `hax-saved` holds a JSON array of `{ experimentId: string, savedAt: string (ISO datetime) }` objects.

**Transitions:**
- `save(experimentId)` — User-initiated via SaveButton. Adds entry to array. Idempotent.
- `remove(experimentId)` — User-initiated via SaveManager. Removes entry from array.
- `clearAll()` — User-initiated via SaveManager. Empties the array.

**Capacity:** No hard limit enforced. localStorage typically allows 5–10 MB; a saved list of 1000 experiments would use < 50 KB.

### Search State

Search is stateless between page loads. Pagefind loads its index on first interaction within a page session and discards it on navigation. No search history is persisted.

### Filter State

Filter selections on cluster hubs are encoded in URL query parameters (e.g., `?behavior=posture&evidence=high`). This makes filtered views shareable and bookmarkable. Filter state is not persisted in localStorage.

## 14. Error Handling

| Scenario | Handling |
|----------|----------|
| TED embed fails to load | Show a fallback block with talk title, speaker, and a direct link to the TED page. Use `<iframe>` with `onerror` or a timeout-based fallback. Never show a broken embed. |
| Search returns zero results | Display "No results found" message with suggestions: browse by cluster, check spelling, try broader terms. Never show an empty page. |
| localStorage unavailable | SaveButton degrades gracefully: shows a tooltip "Saving is not available in this browser" instead of failing silently. SaveManager page shows an explanation. The rest of the site functions normally. |
| localStorage full | Save operation catches the quota error and shows "Storage is full — remove some saved experiments to save more." |
| Content file fails schema validation | Astro build fails with a clear error message identifying the file and the invalid field. This is a build-time gate, not a runtime error. No invalid content reaches production. |
| Broken internal link | Detected at build time by link-checking step. Build warns (or fails, configurable) on broken internal links. |
| Broken external link (TED URL, study DOI) | Detected by periodic link-check CI job (not on every build — external links are slow to check). Broken external links are flagged for editorial review, not auto-fixed. |
| Missing referenced content ID | Astro content collection references validate at build time. A talk referencing a nonexistent experiment ID fails the build. |
| JavaScript disabled | All content is readable without JavaScript. Search, save, filter, and share degrade: search shows a "Search requires JavaScript" message; save/filter/share buttons are hidden or replaced with static alternatives. |

## 15. Platform and Implementation Risks

### Risk 1: TED embed policy changes

**What could go wrong:** TED changes its embed policy, breaks embed URLs, or blocks iframe embedding from non-partner sites. This would break talk detail pages that rely on embedded video.

**Requirements threatened:** FR-3 (Talk detail pages).

**What to validate:** Test TED embed loading from the deployed Cloudflare Pages domain before launch. Monitor for embed failures in production via error tracking or periodic smoke tests.

**Fallback:** Every talk page already includes a direct outbound link to the TED page as the primary reference. If embeds break, remove the iframe and promote the outbound link. The site's value does not depend on embedded video — it depends on the editorial layer.

### Risk 2: Pagefind index size at scale

**What could go wrong:** As the content corpus grows beyond MVP (100+ talks, 200+ experiments), the Pagefind index becomes large enough to noticeably slow initial search interaction on mobile connections.

**Requirements threatened:** FR-6 (Client-side search).

**What to validate:** Measure Pagefind index size and load time at 50, 100, 200, and 500 content items during development. Pagefind supports chunked loading — verify that chunks load incrementally.

**Fallback:** Pagefind is designed for static sites up to tens of thousands of pages. If index size becomes a real issue, split the index by content type or implement progressive loading. This is unlikely to be an MVP problem.

### Risk 3: Content volume bottleneck

**What could go wrong:** Writing 40–60 high-quality talk/experiment entries with proper evidence labeling, study references, and editorial review takes longer than expected, blocking the launch.

**Requirements threatened:** All content-dependent features.

**What to validate:** Write 5 complete entries (2 talks, 3 experiments) as a proof-of-concept in the first development phase. Measure time per entry. Extrapolate to estimate total content production time.

**Fallback:** Launch with fewer entries (20–30) concentrated in 2 clusters rather than spreading thin across 4. A dense cluster is more valuable than four sparse ones.

### Risk 4: Evidence labeling subjectivity

**What could go wrong:** The five-tier evidence rubric is applied inconsistently across the initial content set, undermining the site's credibility positioning.

**Requirements threatened:** FR-5 (Structured metadata with evidence levels).

**What to validate:** Have 2–3 reviewers independently rate the same 10 talks/experiments. Compare inter-rater agreement. Refine rubric definitions if agreement is below 80%.

**Fallback:** Add a "Methodology" page that explicitly states the rubric is editorial and subject to revision. Transparency about the process protects credibility even when individual ratings are debatable.

### Risk 5: Accessibility compliance gaps

**What could go wrong:** TED embed iframes may not be fully accessible (keyboard navigation within the iframe, screen reader announcements). Third-party content in iframes is outside the site's control.

**Requirements threatened:** WCAG 2.1 AA compliance.

**What to validate:** Test TED embeds with screen readers (NVDA, VoiceOver) and keyboard-only navigation. Document which accessibility gaps are in TED's embed vs. HAx's own pages.

**Fallback:** Provide a prominent "Watch on TED.com" link as the accessible alternative to the embed. Label the iframe with `aria-label` and provide a text summary above it. The site's own pages must meet AA; the embed iframe is a third-party resource with documented limitations.

## 16. Security and Privacy Requirements

| Area | Requirement |
|------|-------------|
| HTTPS | All pages served over HTTPS. Cloudflare Pages provides this by default. |
| CSP | Content Security Policy header allowing `self`, TED embed domains (`embed.ted.com`), and Pagefind assets. Block inline scripts except for Astro's hydration. |
| Subresource integrity | Pagefind JS/CSS loaded with SRI hashes where supported. |
| No server-side state | No database, no session cookies, no authentication. Attack surface is limited to static file serving and client-side JavaScript. |
| Third-party isolation | TED embeds are loaded in sandboxed iframes (`sandbox="allow-scripts allow-same-origin allow-popups"`). No other third-party scripts at MVP. |
| Input sanitization | No user input is processed server-side. Client-side search input is handled by Pagefind (which operates on a prebuilt index, not a query language). |
| localStorage | Contains only experiment IDs and timestamps. No PII, no tokens, no credentials. |
| Dependency supply chain | `npm audit` run in CI. Dependabot or Renovate enabled for automated dependency updates. |

## 17. Acceptance Criteria

| Criterion | Verification method |
|-----------|-------------------|
| All four cluster hubs render with at least 5 talks and 5 experiments each | Build + manual review |
| Every talk detail page displays summary, evidence badge, TED link, and at least one related experiment | Automated test: query all talk pages, assert required elements |
| Every experiment detail page displays instructions, evidence notes, print/save/share actions | Automated test: query all experiment pages, assert required elements |
| Search returns relevant results for "stress," "meeting," "sleep," "habit" | Manual smoke test against Pagefind output |
| Saved experiments persist across page navigations and browser restarts | Manual test in Chrome, Firefox, Safari |
| Printable experiment cards render cleanly on US Letter and A4 | Manual print preview in Chrome and Firefox |
| All pages pass Lighthouse accessibility audit with score ≥ 90 | CI Lighthouse run against built site |
| All pages pass axe-core automated checks with zero critical/serious violations | CI axe-core run |
| Core Web Vitals meet "good" thresholds (LCP ≤ 2.5s, INP ≤ 200ms, CLS ≤ 0.1) | Lighthouse CI + manual field test on mobile |
| Build fails if any content file has invalid schema | Astro build with intentionally broken content file |
| Build fails if any content file references a nonexistent ID | Astro build with intentionally broken reference |
| No cookies are set by the application | Browser DevTools inspection |
| Site is fully navigable with keyboard only | Manual keyboard walkthrough |
| Site is usable with JavaScript disabled (content readable, interactive features degrade gracefully) | Manual test with JS disabled |

## 18. Recommended Planning Phases

1. **Project scaffold and content schema** — Initialize Astro project, define content collection schemas, create sample content files, validate build.
2. **Base layout and navigation** — Build BaseLayout, site header/footer, skip links, breadcrumbs, responsive shell. No content pages yet.
3. **Content detail pages** — Build Talk detail and Experiment detail page templates. Render from content collections.
4. **Cluster hubs** — Build Cluster hub template with "Start here" strip and card grid. Wire up cluster-to-content relationships.
5. **Search and filtering** — Integrate Pagefind, build SearchWidget island, build FilterPanel and FilterController islands.
6. **Persona dashboards** — Build Persona dashboard template. Wire up persona-to-content relationships.
7. **Interactive features** — Build SaveButton, SaveManager, PrintButton, ShareButton islands. Implement localStorage state.
8. **Landing page and static pages** — Build landing page with cluster cards, persona cards, featured experiments, search bar. Build About and Resources pages.
9. **SEO, structured data, and accessibility** — Add JSON-LD structured data, Open Graph metadata, XML sitemap, print stylesheets. Run accessibility audit and remediation.
10. **Content population and editorial QA** — Write remaining content entries to reach 40–60 items. Evidence review, link checking, editorial polish, and launch readiness.

## 19. Planning Notes

- Phase 1 should produce a "hello world" build with at least 2 sample content files of each type that pass schema validation. This validates the data model before any UI work begins.
- Phases 2–4 are the structural core and should be completed before any interactive features. A site with pages but no save/filter/search is a working product; save/filter/search without pages is nothing.
- Phase 5 (search/filtering) depends on rendered HTML existing (Pagefind indexes the build output), so it cannot start until Phase 3–4 produce pages.
- Phase 7 (interactive features) uses Astro islands — small hydrated components in an otherwise static page. These are the only client-side JavaScript the site ships.
- Content population (Phase 10) can partially overlap with earlier phases. Sample content written in Phase 1 serves as the template; real content can be authored as soon as the schema is stable.
- Astro's content collection system handles schema validation, type generation, and reference resolution at build time. This replaces the need for a separate JSON Schema validation step — the schema lives in TypeScript (`src/content/config.ts`) and is enforced by the build.

## 20. Concerns for Release Planning

1. **Content production pacing (Section 9, Data Model).** Each talk/experiment entry requires editorial summary, evidence assessment, study linking, and metadata. The plan must account for content authoring time alongside development time, and should define a minimum viable content set per cluster.

2. **TED embed testing (Section 15, Risk 1).** The plan must include early validation that TED embeds load correctly from the deployed domain. This should happen in Phase 1 or 2, not after the full site is built.

3. **Pagefind integration timing (Section 7, Build Pipeline).** Pagefind indexes rendered HTML, so search integration depends on content pages existing. The plan must sequence search work after at least one content page template is rendering.

4. **Accessibility audit sequencing (Section 17, Acceptance Criteria).** Automated accessibility checks should run in CI from Phase 2 onward (as soon as HTML is rendered). The formal remediation phase (Phase 9) handles manual testing and fixes, but catching regressions early requires CI integration from the start.

5. **i18n structural preparation (Section 3, Planning Scope).** The URD specifies i18n-ready routes in MVP even though multilingual content is post-MVP. The plan must decide whether to implement Astro's i18n routing in Phase 1 (structural scaffolding) or defer it entirely. Implementing it early is low-cost and avoids a route restructure later.

6. **Evidence rubric calibration (Section 15, Risk 4).** The plan should include an explicit step where 2+ reviewers rate the same content independently to calibrate the rubric before the bulk content population phase.

7. **Print stylesheet scope (Section 12, Print Styles).** Print layout applies to experiment cards, but the plan must decide whether talk detail and cluster hub pages also get print styles, or only experiment cards. The URD only specifies experiment cards as printable.

8. **Analytics decision (Section 11, Privacy).** The plan must make a binary decision on analytics before deployment: Plausible (requires a subscription or self-hosted instance) or no analytics at MVP. This affects the deployment configuration in Phase 9.
