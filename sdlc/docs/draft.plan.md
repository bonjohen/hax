# HAx Static Website — Phased Release Plan

## Gaps in Source Document

### Critical

None. The PDR provides a complete component list with responsibilities (Section 10), a detailed data model with entities and relationships (Section 9), five identified risks with validation approaches and fallbacks (Section 15), and explicit architectural layers with dependency direction (Section 10).

### Notable

- **No explicit test strategy.** The PDR defines acceptance criteria (Section 17) but does not specify a test framework, runner, or coverage approach. This plan includes test/verification tasks per phase as a default. The Concerns for Finalization section flags this for the finalizer to resolve.

### PDR Concerns Addressed

The PDR's "Concerns for Release Planning" section (Section 20) raised 8 concerns. Each is addressed below:

1. **Content production pacing** — Addressed by splitting content work: sample content in Phase 0, real content can be authored from Phase 2 onward, dedicated content population in Phase 9. Minimum viable content per cluster is defined in Phase 9 acceptance criteria.
2. **TED embed testing** — Addressed by including TED embed validation in Phase 0 as a risk-first gate.
3. **Pagefind integration timing** — Pagefind is Phase 4, after content detail pages (Phase 2) and cluster hubs (Phase 3) produce rendered HTML to index.
4. **Accessibility audit sequencing** — Lighthouse/axe CI checks run from Phase 1 onward. Formal remediation is Phase 8.
5. **i18n structural preparation** — Astro i18n routing scaffolded in Phase 0 (low cost, avoids route restructure later). No translated content in MVP.
6. **Evidence rubric calibration** — Included as a dedicated step in Phase 9 before bulk content authoring.
7. **Print stylesheet scope** — Phase 6 implements print for experiment cards only (per URD). Talk/cluster print styles are explicitly out of scope for MVP.
8. **Analytics decision** — Binary decision required in Phase 8: Plausible or none. Flagged in Phase 8 acceptance criteria.

PDR recommended 10 phases. This plan uses 10 phases with the same general ordering. The main structural change is that TED embed risk validation is pulled into Phase 0 (PDR Phase 1 treated it as part of general scaffolding), and the PDR's separate "Search and filtering" phase is maintained because Pagefind requires rendered HTML to index.

## 1. Release Strategy

The plan follows a risk-first, dependency-ordered sequence. Phase 0 validates the two highest-risk elements (content schema viability and TED embed compatibility) before any feature work begins. Phases 1–3 build the structural core (layout, content pages, cluster hubs) that all later features depend on. Phases 4–6 add interactive features (search, personas, save/print/share). Phases 7–8 complete the product surface (landing page, SEO, accessibility). Phase 9 populates content and prepares for launch.

Every phase produces a deployable preview. The team can deploy after any phase and have a working (if incomplete) site.

## 2. Release Milestones

| Milestone | Phase | What the user can do |
|-----------|-------|---------------------|
| **Minimum Useful Release** | Phase 3 | Browse four cluster hubs, view talk and experiment detail pages, navigate via breadcrumbs and header nav. No search, save, or personas, but the core value (organized TED experiments with evidence labels) is demonstrable. |
| **First Full Feature Release** | Phase 8 | All primary features functional: search, filtering, personas, save/print/share, landing page, about/resources pages, SEO, structured data, accessibility audit complete. Content may be sparse but all features work. |

---

## Phase 0 — Project Scaffold and Risk Validation

### Purpose

Initialize the project, validate the content schema, and prove that TED embeds work from the deployed domain. This phase exists to catch structural problems before feature development begins.

### Scope

- Astro project initialization with TypeScript
- Content collection schema definitions (`src/content/config.ts`) for all six entity types: Talk, Experiment, Study, Cluster, Persona, Resource
- Sample content files (at least 2 talks, 3 experiments, 2 studies, 1 cluster, 1 persona, 1 resource) that pass schema validation
- Astro i18n routing scaffold (default locale `en`, no translations)
- TED embed proof-of-concept: a minimal page that loads a TED iframe and verifies it renders from the deployment domain
- Cloudflare Pages deployment pipeline (Git push → build → deploy preview)
- Basic CI: Astro build + content schema validation on every push

### Required Work

1. Initialize Astro project with TypeScript, configure output to `static`
2. Define content collection schemas for Talk, Experiment, Study, Cluster, Persona, Resource in `src/content/config.ts`
3. Define taxonomy constants (cluster IDs, evidence levels, effort levels) as a shared module referenced by schemas
4. Create sample content files for each entity type with complete frontmatter
5. Configure Astro i18n with default locale `en` and route prefix strategy
6. Build a minimal test page that renders a TED embed iframe and a fallback link
7. Set up Cloudflare Pages deployment from the repository
8. Deploy the test page and verify TED embed loads from the live domain
9. Set up CI pipeline: lint, type-check, Astro build (which validates content schemas)

### Deliverables

- Working Astro project that builds with sample content
- Content schemas that reject invalid frontmatter at build time
- Deployed preview URL with a TED embed rendering successfully
- CI pipeline running on every push

### Acceptance Criteria

- `npm run build` succeeds with all sample content files
- Intentionally invalid content file (wrong evidence level, missing required field) causes build failure with a clear error
- TED embed iframe loads and plays on the deployed Cloudflare Pages preview URL
- i18n routing produces `/en/` prefixed routes (or equivalent locale-aware structure)
- CI pipeline runs and reports pass/fail on push

---

## Phase 1 — Base Layout and Navigation

### Purpose

Build the responsive page shell that all content pages will use. After this phase, the site has a navigable structure with header, footer, breadcrumbs, and accessibility fundamentals — but no content pages yet.

### Scope

- BaseLayout component (HTML head, skip links, header, footer, nav, print stylesheet link)
- Responsive header with site title, cluster nav links, search placeholder, mobile hamburger menu
- Footer with about link, resources link, copyright, and legal notice
- Breadcrumb component
- Skip link targeting main content area
- Responsive breakpoints (mobile < 640px, tablet 640–1024px, desktop > 1024px)
- Global CSS/design tokens (colors, typography, spacing)
- Lighthouse/axe-core CI integration (automated accessibility checks from this phase onward)

### Required Work

1. Create BaseLayout component with HTML `<head>` management (meta, OG placeholders, canonical URL)
2. Implement site header with navigation links to cluster hubs, personas, search, about
3. Implement responsive mobile navigation (hamburger menu / slide-out)
4. Implement site footer with legal notice, nav links, and last-updated date
5. Implement Breadcrumb component driven by page hierarchy
6. Implement skip-to-content link with visible focus styles
7. Define global CSS design tokens and base typography
8. Implement responsive breakpoint system
9. Add Lighthouse CI and axe-core checks to the CI pipeline

### Deliverables

- BaseLayout wrapping a placeholder index page
- Responsive navigation working at all three breakpoints
- Skip links and semantic landmarks (header, main, nav, footer) in place
- CI running accessibility checks on every build

### Acceptance Criteria

- Header nav links are visible and responsive across mobile, tablet, and desktop
- Skip link is the first focusable element and moves focus to main content
- Breadcrumb renders at least a "Home" link on the index page
- Lighthouse accessibility score ≥ 90 on the placeholder index page
- axe-core reports zero critical or serious violations
- Print stylesheet hides nav and footer in print preview

---

## Phase 2 — Content Detail Pages

### Purpose

Build the Talk detail and Experiment detail page templates. After this phase, individual talks and experiments are browsable at their permalink URLs with full metadata, evidence badges, and related content links.

### Scope

- Talk detail page template (`/talks/{slug}/`)
- Experiment detail page template (`/experiments/{slug}/`)
- ContentLayout component (extends BaseLayout with sidebar, structured data, breadcrumbs)
- EvidenceBadge component
- TED embed with fallback to outbound link
- Transcript link display
- Related content sections (related experiments on talk pages, source talks on experiment pages)
- Experiment instruction rendering (ordered steps)
- Contraindications display
- Evidence notes with progressive disclosure (collapsible details)
- JSON-LD structured data for Talk (`CreativeWork`) and Experiment (`HowTo` or `CreativeWork`)
- Expand sample content to at least 5 talks and 5 experiments across all four clusters

### Required Work

1. Create ContentLayout extending BaseLayout with content-specific sidebar and breadcrumbs
2. Implement Talk detail page template rendering from Talk content collection
3. Implement TED embed iframe with lazy loading and error fallback
4. Implement transcript link display
5. Implement Experiment detail page template rendering from Experiment content collection
6. Implement experiment instruction steps as an ordered list
7. Implement contraindications section (conditionally rendered when present)
8. Implement EvidenceBadge component with color-coded label and tooltip
9. Implement evidence notes section with progressive disclosure (collapsible `<details>`)
10. Implement related content sections (related experiments, source talks, related studies as links)
11. Add JSON-LD structured data to Talk and Experiment page heads
12. Write 3 additional talks and 2 additional experiments with complete frontmatter and body content

### Deliverables

- Talk detail pages rendering at `/talks/{slug}/` for all sample talks
- Experiment detail pages rendering at `/experiments/{slug}/` for all sample experiments
- Evidence badges displaying on all content pages
- TED embeds loading on talk pages with fallback behavior

### Acceptance Criteria

- Every talk page displays: title, speaker, summary, evidence badge, TED embed or link, transcript link (if available), and related experiments
- Every experiment page displays: title, one-line claim, instructions, time cost, effort, evidence badge, evidence notes, source talks, and contraindications (if present)
- Evidence badge shows correct color and label for each evidence level
- TED embed loads successfully; if blocked, fallback link to TED.com is visible
- Evidence notes expand/collapse via progressive disclosure
- JSON-LD structured data validates with Google Rich Results Test (or equivalent)
- All pages pass axe-core with zero critical/serious violations

---

## Phase 3 — Cluster Hubs

### Purpose

Build the four cluster hub pages that serve as the primary browsing entry points. After this phase, users can browse Body, Cognition, Environment, and Social clusters, see curated "Start here" experiments, and view card grids of all content in that cluster.

### Scope

- Cluster hub page template (`/clusters/{cluster-id}/`)
- Cluster content files for all four clusters with hero experiments and canonical talks
- ExperimentCard component (compact card for listings)
- TalkCard component (compact card for listings)
- "Start here" experiment strip (3–5 editorially chosen experiments)
- Card grid layout (responsive: 1 column mobile, 2 tablet, 3 desktop)
- Related clusters section
- Cluster intro and methodology note

### Required Work

1. Create Cluster hub page template rendering from Cluster content collection
2. Implement ExperimentCard component with title, one-line claim, evidence badge, time cost, cluster tags
3. Implement TalkCard component with title, speaker, thumbnail (or placeholder), evidence badge, cluster tags
4. Implement "Start here" experiment strip from cluster's `hero_experiments` field
5. Implement responsive card grid layout
6. Query and render all talks and experiments matching the cluster's ID
7. Implement "Related clusters" section with links to adjacent clusters
8. Write cluster content files for Body, Cognition, Environment, and Social with editorial descriptions, hero experiments, and canonical talks
9. Ensure card links navigate to the correct Talk and Experiment detail pages

### Deliverables

- Four cluster hub pages at `/clusters/body/`, `/clusters/cognition/`, `/clusters/environment/`, `/clusters/social/`
- ExperimentCard and TalkCard components reusable across the site
- Card grid populated with all matching content per cluster

### Acceptance Criteria

- Each cluster hub displays its editorial intro, "Start here" strip with 3–5 experiments, and a card grid of all matching content
- ExperimentCard links navigate to the correct experiment detail page
- TalkCard links navigate to the correct talk detail page
- Card grid is responsive: 1 column on mobile, 2 on tablet, 3 on desktop
- Cross-cluster content appears on multiple hubs (e.g., a talk tagged `[body, social]` appears on both)
- Related clusters section links to adjacent cluster hubs
- **This is the Minimum Useful Release.** The core value proposition (organized TED experiments by cluster with evidence labels) is demonstrable.

---

## Phase 4 — Search Integration

### Purpose

Add client-side search powered by Pagefind. After this phase, users can search across all content types from any page and see unified results.

### Scope

- Pagefind integration into the Astro build pipeline
- SearchWidget Astro island (hydrated on interaction, not on page load)
- Search results page (`/search/`)
- Result type chips (Talk, Experiment, Study)
- Search box in site header (triggers navigation to search page or in-place results)
- Zero-results handling with suggestions

### Required Work

1. Install and configure Pagefind to run after Astro build
2. Add Pagefind data attributes to content pages to control what gets indexed and how results are labeled
3. Implement SearchWidget as an Astro island with `client:idle` or `client:visible` hydration
4. Create search results page at `/search/` rendering Pagefind results
5. Add result type chips/labels to distinguish talks, experiments, and resources in results
6. Implement zero-results state with suggestions (browse by cluster, check spelling)
7. Add search box to site header linking to `/search/` or triggering inline search
8. Verify Pagefind index size with current content volume and document baseline

### Deliverables

- Pagefind index generated on every build
- Working search from any page
- Search results page with typed results

### Acceptance Criteria

- Searching "stress" returns relevant talks and experiments
- Searching "meeting" returns environment-cluster content
- Searching a nonsense string shows zero-results message with suggestions
- Search works without JavaScript pre-loaded (Pagefind JS loads on first interaction)
- Pagefind index size is documented for current content volume
- Search box is accessible via keyboard (focusable, operable with Enter key)

---

## Phase 5 — Persona Dashboards

### Purpose

Build persona-guided navigation pages. After this phase, users can enter the site through goal-oriented paths like "Work better" or "Learn better" and see curated content recommendations.

### Scope

- Persona dashboard page template (`/personas/{persona-id}/`)
- Persona content files for at least 3 personas (MVP minimum)
- Curated experiment and talk recommendations per persona
- "Best first steps" section
- Quick filters within persona context
- Why-this-path editorial explanation

### Required Work

1. Create Persona dashboard page template rendering from Persona content collection
2. Write persona content files for at least 3 personas: "Work better" (knowledge worker), "Learn better" (student), "Lead teams" (team lead/manager)
3. Implement recommended experiments section using ExperimentCard components
4. Implement recommended clusters section with links to cluster hubs
5. Implement "Best first steps" curated section (top 2–3 experiments with editorial context)
6. Implement "Why this path" editorial explanation block
7. Add persona dashboard links to site header navigation and landing page (placeholder)

### Deliverables

- At least 3 persona dashboard pages at `/personas/{persona-id}/`
- Persona navigation accessible from site header

### Acceptance Criteria

- Each persona dashboard displays goals, recommended experiments, recommended clusters, best first steps, and why-this-path explanation
- Experiment and talk cards on persona pages link to correct detail pages
- Personas reference content from multiple clusters (a persona is not locked to one cluster)
- Persona dashboards pass axe-core with zero critical/serious violations

---

## Phase 6 — Interactive Features

### Purpose

Add client-side interactivity: saving experiments, printing cards, sharing permalinks, and filtering content. After this phase, the site supports the full interaction model from the URD.

### Scope

- SaveButton Astro island (toggle saved state in localStorage)
- SaveManager page (`/saved/`) listing saved experiments with remove/clear actions
- PrintButton triggering browser print dialog with print-optimized layout
- ShareButton copying permalink URL to clipboard with confirmation
- FilterPanel component for cluster hubs (behavior, goal, evidence level, time cost, effort filters)
- FilterController Astro island managing filter state via URL query parameters
- localStorage graceful degradation (unavailable, full)

### Required Work

1. Implement SaveButton as an Astro island toggling experiment saved state in localStorage under `hax-saved` key
2. Implement SaveManager page at `/saved/` reading localStorage and rendering saved experiment list with ExperimentCards
3. Implement remove-single and clear-all actions in SaveManager
4. Implement graceful degradation when localStorage is unavailable (tooltip message, hidden save buttons)
5. Implement graceful degradation when localStorage is full (error message on save attempt)
6. Implement PrintButton triggering `window.print()` with experiment detail print stylesheet
7. Implement print stylesheet for experiment detail pages (hide nav, footer, interactive elements; single-column US Letter/A4 layout)
8. Implement ShareButton copying `window.location.href` to clipboard with confirmation toast
9. Implement FilterPanel component with checkbox/chip controls for behavior, goal, evidence level, time cost, effort
10. Implement FilterController as an Astro island managing filter state via URL query parameters on cluster hubs
11. Wire FilterPanel into cluster hub pages, showing/hiding cards based on active filters
12. Add SaveButton, PrintButton, and ShareButton to experiment detail pages

### Deliverables

- Save, print, and share actions on all experiment detail pages
- Saved experiments page with list management
- Filterable cluster hubs with URL-encoded filter state

### Acceptance Criteria

- Saving an experiment persists across page navigations and browser restarts
- Saved experiments page lists all saved items with working remove and clear actions
- Print preview of an experiment card renders cleanly on US Letter and A4 (verified in Chrome and Firefox print preview)
- Share button copies the correct permalink URL; paste produces the expected URL
- Filters on cluster hubs show/hide cards correctly for each filter type
- Filter state is encoded in URL query params (filtered view is bookmarkable/shareable)
- With localStorage disabled: save buttons show a degradation message, rest of site works
- With JavaScript disabled: save/filter/share buttons are hidden or replaced; content remains readable

---

## Phase 7 — Landing Page and Static Pages

### Purpose

Build the site's front door and informational pages. After this phase, the site has a complete navigable surface from landing through all content paths.

### Scope

- Landing page with hero section, cluster cards, persona cards, featured experiments, search bar, methodology ribbon
- About page explaining methodology, evidence rubric, citation policy, legal notes
- Resources page listing studies, TED playlists, transcript guidance, glossary
- Study detail rendering (inline on Resources or dedicated pages)

### Required Work

1. Build landing page at `/` with hero section explaining HAx
2. Implement cluster cards section linking to four cluster hubs
3. Implement persona cards section linking to persona dashboards
4. Implement featured experiments strip (editorially curated, pulling from content collection)
5. Implement search bar on landing page (links to `/search/` or triggers Pagefind)
6. Implement methodology ribbon (one-line evidence rubric summary with link to About)
7. Build About page at `/about/` with evidence rubric table, citation policy, editorial posture, legal/copyright notes
8. Build Resources page at `/resources/` listing Study content collection entries, external links, and usage guidance
9. Render Resource content files as a browsable list with type, description, and links

### Deliverables

- Landing page with all entry points
- About page with methodology documentation
- Resources page with study listings

### Acceptance Criteria

- Landing page displays cluster cards, persona cards, featured experiments, search bar, and methodology ribbon
- All cluster card links navigate to correct cluster hubs
- All persona card links navigate to correct persona dashboards
- About page explains the five evidence levels with definitions
- Resources page lists all Study and Resource content entries
- Landing page passes Lighthouse performance score ≥ 90 (static page, no heavy JS)

---

## Phase 8 — SEO, Structured Data, Accessibility, and Analytics

### Purpose

Production-readiness pass: complete structured data, SEO metadata, accessibility remediation, and analytics decision. After this phase, all primary features are functional and the site meets quality standards for launch.

### Scope

- JSON-LD structured data for all page types (`WebSite`, `CollectionPage`, `BreadcrumbList`, `CreativeWork`, `HowTo`)
- Open Graph and Twitter card metadata on all pages
- XML sitemap generation
- Canonical URLs on all pages
- Content Security Policy header configuration
- Formal accessibility audit: manual keyboard walkthrough, screen reader testing (NVDA or VoiceOver), color contrast verification
- Accessibility remediation for any issues found
- Analytics decision and implementation (Plausible or none)
- `robots.txt` configuration

### Required Work

1. Add JSON-LD structured data to all remaining page types (cluster hubs, persona dashboards, landing page, about, resources)
2. Implement Open Graph and Twitter card meta tags on all pages (title, description, image, URL)
3. Configure Astro sitemap integration for XML sitemap generation
4. Verify canonical URLs on all pages
5. Configure Content Security Policy header in Cloudflare Pages (`_headers` file) allowing `self`, `embed.ted.com`, and Pagefind assets
6. Conduct manual keyboard navigation walkthrough on all page templates
7. Conduct screen reader testing on Talk detail, Experiment detail, Cluster hub, and Landing page
8. Fix all critical and serious accessibility issues found in manual testing
9. Verify color contrast meets WCAG AA (4.5:1 for body text, 3:1 for large text)
10. Make analytics decision: configure Plausible (cookieless) or explicitly document "no analytics at MVP"
11. Configure `robots.txt` and verify crawlability

### Deliverables

- Structured data on all pages, validating with testing tools
- Complete OG/Twitter metadata
- XML sitemap
- CSP header deployed
- Accessibility audit report with all critical/serious issues resolved
- Analytics configured or explicitly deferred

### Acceptance Criteria

- JSON-LD validates on all page types via Google Rich Results Test or Schema.org validator
- OG metadata renders correct previews when URLs are pasted into Slack/Twitter/LinkedIn
- XML sitemap includes all content pages
- CSP header blocks unexpected script sources
- All pages pass axe-core with zero critical/serious violations
- Manual keyboard walkthrough completes all primary flows (browse cluster → view talk → view experiment → save → print)
- Screen reader can navigate and understand all page templates
- Color contrast meets WCAG AA on all text
- Analytics loads without cookies (if Plausible) or is explicitly not present (if deferred)
- **This is the First Full Feature Release.** All primary features from the URD are functional.

---

## Phase 9 — Content Population and Launch Readiness

### Purpose

Populate the site with the target content volume (40–60 talks/experiments), calibrate the evidence rubric, run final QA, and prepare for launch.

### Scope

- Content authoring to reach MVP target (40–60 items across all four clusters)
- Evidence rubric calibration (multi-reviewer rating exercise)
- Internal and external link checking
- Performance testing against Core Web Vitals targets
- Editorial QA (source links, evidence labels, last-reviewed dates)
- Print QA (experiment cards on US Letter and A4)
- Legal QA (TED embed usage, copyright notices, transcript link accuracy)
- Final deployment and DNS configuration

### Required Work

1. Conduct evidence rubric calibration: 2+ reviewers independently rate 10 items, compare agreement, refine rubric definitions if agreement < 80%
2. Author remaining Talk content files to reach at least 10 per cluster (40+ total)
3. Author remaining Experiment content files to reach at least 5 per cluster (20+ total)
4. Author remaining Study content files linked from talks and experiments
5. Ensure every cluster hub has at least 5 hero experiments and 5 canonical talks
6. Run internal link checker across all pages — fix all broken internal links
7. Run external link checker — flag broken TED URLs and study DOIs for editorial review
8. Measure Core Web Vitals (LCP, INP, CLS) on landing page, cluster hub, talk detail, and experiment detail — verify all meet "good" thresholds
9. Conduct editorial QA: verify every page has source links, evidence label, and last-reviewed date
10. Conduct print QA: verify experiment card print layout on US Letter and A4
11. Conduct legal QA: verify TED embed usage, copyright notices, and transcript link accuracy
12. Configure production domain and DNS on Cloudflare Pages
13. Final deployment and smoke test

### Deliverables

- 40–60 content items with complete metadata and evidence labeling
- Evidence rubric calibration report
- All QA checklists completed
- Production site deployed on final domain

### Acceptance Criteria

- At least 10 talks and 5 experiments per cluster (minimum 40 talks, 20 experiments total)
- Evidence rubric inter-rater agreement ≥ 80% on calibration exercise
- Zero broken internal links
- External link issues documented and either fixed or flagged for editorial follow-up
- Core Web Vitals meet "good" thresholds: LCP ≤ 2.5s, INP ≤ 200ms, CLS ≤ 0.1 at 75th percentile
- Every content page has: source attribution, evidence label, and last-reviewed date
- Experiment print cards render legibly on US Letter and A4
- TED embeds, copyright notices, and transcript links pass legal review
- Production URL serves the site over HTTPS with correct domain

---

## Cross-Phase Requirements

### Data Persistence

- **Saved experiments** persist in browser `localStorage` under key `hax-saved`. Format: JSON array of `{ experimentId, savedAt }` objects. No server-side persistence.
- **Content** persists in Git-tracked Markdown files under `src/content/`. Content changes require a build and deploy.
- **Search index** is regenerated on every build by Pagefind. No persistent search state.
- **Filter state** is ephemeral, encoded in URL query parameters. Not persisted in localStorage.

### Privacy Requirements

Every phase must respect:
- No cookies set by the application
- No server-side user state or tracking
- No third-party scripts beyond TED embeds (and analytics if Plausible is chosen)
- localStorage contains only experiment IDs and timestamps — no PII
- TED embeds loaded with `loading="lazy"` and appropriate `sandbox` attributes

### Performance Requirements

Every phase must respect:
- No render-blocking JavaScript on initial page load
- Astro islands hydrate on interaction or visibility, not eagerly
- Images use responsive `srcset` and `loading="lazy"`
- Pagefind index loads on first search interaction, not on page load
- Target: LCP ≤ 2.5s, INP ≤ 200ms, CLS ≤ 0.1 at 75th percentile (validated in Phase 9 but respected throughout)

---

## Minimum Useful Release

**Phase 3** (after Cluster Hubs). At this point the user can:
- Browse four cluster hubs with experiment and talk cards
- View talk detail pages with TED embeds, evidence badges, and related experiments
- View experiment detail pages with instructions, evidence notes, and source talks
- Navigate via header, breadcrumbs, and cross-links between content

Missing: search, personas, save/print/share, landing page, about/resources. But the core value — organized, evidence-labeled TED experiments browsable by cluster — is present and demonstrable.

## First Full Feature Release

**Phase 8** (after SEO, Structured Data, Accessibility, and Analytics). At this point:
- All page templates are built and populated with sample content
- Search, filtering, save, print, share all functional
- Persona dashboards provide goal-oriented navigation
- Landing page provides the complete entry experience
- SEO, structured data, and accessibility meet production standards
- Analytics decision made and implemented

Only content volume and final QA (Phase 9) remain before launch.

## Concerns for Finalization

1. **Test framework decision (all phases).** The PDR specifies acceptance criteria but no test framework. The finalizer must choose a test approach — likely Playwright for end-to-end tests and Vitest for unit tests — and add test tasks to each phase.

2. **Content schema evolution (Phase 0 → Phase 9).** The schema defined in Phase 0 will be refined as templates are built. The finalizer should add schema-review tasks to Phases 2 and 3, when templates first consume schema fields and gaps become visible.

3. **Pagefind data attribute strategy (Phase 4).** The plan specifies Pagefind integration but not which HTML elements get indexed or how result types are distinguished. The finalizer should detail the `data-pagefind-*` attribute strategy.

4. **Filter implementation approach (Phase 6).** Filters can be implemented as client-side show/hide (faster, simpler) or as Pagefind faceted search (more powerful, tighter search integration). The finalizer should make this decision and detail the approach.

5. **Saved experiments data migration (Phase 6 → future).** The `hax-saved` localStorage schema is defined here. If the format changes later, saved experiments from earlier versions may break. The finalizer should add a version field to the localStorage schema to enable future migration.

6. **Cluster hub card ordering (Phase 3).** The plan does not specify how cards are ordered within a cluster hub (alphabetical, evidence level, editorial priority, recency). The finalizer should define default sort order and whether it's user-adjustable.

7. **Study content depth (Phase 7).** The plan treats Studies as lightweight reference entries on the Resources page. The finalizer should decide whether Studies get dedicated detail pages or remain inline entries.

8. **Deployment preview workflow (Phase 0 onward).** Cloudflare Pages supports preview deployments per branch/PR. The finalizer should add preview deployment verification as a task in early phases to establish the editorial review workflow described in the URD.
