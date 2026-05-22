---
document: "User Requirements"
version: "1.0"
status: "final"
source: "sdlc/docs/draft.user.md"
finalized_date: "2026-05-22"
---

# HAx Static Website — User Requirements

## 1. Overview

HAx is a static, editorially curated discovery website for "Human Advantage Experiments" drawn from TED Talks. It organizes talks into clusters (Body, Cognition, Environment, Social), extracts actionable experiments, tags content with evidence levels, and provides persona-guided navigation to help users find and act on relevant experiments quickly.

The site is non-commercial, uses TED embeds and outbound links rather than rehosted media, and launches as an English-first MVP. Its defensible value is the structured editorial layer — taxonomy, evidence labels, experiment extraction, and multi-perspective navigation — not the underlying TED content itself.

HAx is built as a fully static site (Astro + Cloudflare Pages). There is no backend, no database, no user accounts, and no server-side state. Content is authored as Markdown files with YAML frontmatter, validated at build time, and served as prerendered HTML. The only client-side state is saved experiments stored in browser localStorage.

## 2. Personas

### 2.1 Skeptical Knowledge Worker

- **Role:** Professional seeking evidence-backed experiments to improve focus, energy, and time use
- **Goals:** Find practical, research-supported experiments; compare evidence quality; save a short list for personal use
- **Technical level:** Expert
- **Entry point:** Landing page or search
- **Success metric:** Finds one evidence-backed experiment in under 3 minutes

### 2.2 Self-Optimizing Student

- **Role:** Student looking for short, repeatable experiments for study, sleep, procrastination, and memory
- **Goals:** Browse cognition/body clusters; filter by duration and effort; build a saved experiment list
- **Technical level:** Expert
- **Entry point:** "Learn better" persona dashboard
- **Success metric:** Saves at least 3 experiments and returns within a week

### 2.3 Team Lead or Manager

- **Role:** Manager seeking meeting, communication, and work-environment experiments for teams
- **Goals:** Find team-applicable experiments; print experiment cards for workshops; share permalinks
- **Technical level:** Intermediate
- **Entry point:** "Lead teams" persona dashboard or environment cluster
- **Success metric:** Prints or shares 1–2 team experiments per visit

### 2.4 Coach, Educator, or Facilitator

- **Role:** Professional curating cited experiments for classes, workshops, or sessions
- **Goals:** Review studies and evidence; build a workshop shortlist; export/print cards
- **Technical level:** Intermediate
- **Entry point:** Resources page or persona dashboard
- **Success metric:** Uses cited pages in external teaching material

### 2.5 Wellness-Curious Generalist

- **Role:** Casual explorer interested in TED-inspired self-improvement ideas
- **Goals:** Browse without feeling overwhelmed; discover through clusters and progressive disclosure
- **Technical level:** Intermediate-low
- **Entry point:** Homepage cluster cards
- **Success metric:** Reaches an experiment detail page without using search

### 2.6 Accessibility-First Learner

- **Role:** User who relies on text, keyboard navigation, screen readers, or print
- **Goals:** Consume experiment and talk content via accessible interfaces
- **Technical level:** Intermediate
- **Entry point:** Search or resources page
- **Success metric:** Completes a primary task without a pointer device and with no serious accessibility blockers

### 2.7 Content Editor (Editorial System)

- **Role:** Editor or researcher who authors and reviews content files in the Git repository
- **Goals:** Add new talks/experiments, update evidence labels, review content for accuracy
- **Technical level:** Intermediate (comfortable with Markdown and Git)
- **Entry point:** Git repository and preview deployments
- **Success metric:** New content is validated at build time; preview deployment is available for review before merge

<!-- Added during finalization: Content Editor persona not in draft, but URD governance section describes editorial roles and review workflows. This persona represents the content authoring side of the system. -->

## 3. User Stories

### 3.1 Content Discovery

| ID | As a... | I want to... | So that... | Priority | Acceptance Criteria |
|----|---------|-------------|-----------|----------|-------------------|
| US-001 | any visitor | see a landing page with cluster and persona entry points | I can orient myself and choose a navigation path | MUST | Landing page displays at least 4 cluster cards, 3 persona cards, featured experiments, and a search bar |
| US-002 | any visitor | browse a cluster hub (Body, Cognition, Environment, Social) | I can see all talks and experiments organized by theme | MUST | Each cluster hub displays an editorial intro, "Start here" experiments, and a card grid of all matching content |
| US-003 | any visitor | view a talk detail page | I can understand the talk's context, watch or link to the TED video, and see related experiments | MUST | Talk page displays title, speaker, summary, TED embed or link, transcript link, evidence badge, and related experiments |
| US-004 | any visitor | view an experiment detail page | I can understand what to try, how long it takes, and what evidence supports it | MUST | Experiment page displays title, claim, instructions, time cost, effort, evidence badge, evidence notes, source talks, and contraindications (if any) |
| US-005 | any visitor | view a persona dashboard | I can navigate by goal rather than by topic | SHOULD | Persona dashboard displays goals, recommended clusters, curated experiments, best first steps, and editorial rationale |

### 3.2 Search and Filtering

| ID | As a... | I want to... | So that... | Priority | Acceptance Criteria |
|----|---------|-------------|-----------|----------|-------------------|
| US-006 | any visitor | search across all content types | I can find specific talks, experiments, or resources by keyword | MUST | Search returns relevant results from talks, experiments, and resources in one unified result set; result type is indicated per result |
| US-007 | any visitor | filter content by behavior, goal, evidence level, time cost, and effort | I can narrow results to what's relevant to me | MUST | Filter controls on cluster hubs show/hide cards matching selected criteria; at least 5 filter dimensions are available |
| US-008 | any visitor | see useful feedback when search returns no results | I don't think the site is broken | MUST | Zero-results state displays a message with suggestions (browse by cluster, check spelling, try broader terms) |
| US-009 | any visitor | share a filtered view via URL | I can send someone a link to my specific filter state | SHOULD | Filter selections are encoded in URL query parameters; pasting the URL reproduces the same filtered view |

### 3.3 Save, Print, and Share

| ID | As a... | I want to... | So that... | Priority | Acceptance Criteria |
|----|---------|-------------|-----------|----------|-------------------|
| US-010 | any visitor | save experiments to a local list | I can build a personal collection without creating an account | SHOULD | Clicking Save on an experiment adds it to a list that persists across page loads and browser restarts (via localStorage) |
| US-011 | any visitor | view and manage my saved experiments | I can review, remove, or clear my saved list | SHOULD | A Saved page lists all saved experiments with remove-single and clear-all actions |
| US-012 | any visitor | print an experiment as a clean card | I can use it in a workshop, class, or personal reference | SHOULD | Browser print dialog produces a single-column layout on US Letter and A4 with readable text, no navigation chrome, and evidence attribution |
| US-013 | any visitor | copy a shareable permalink for any content page | I can share a specific talk or experiment with someone | MUST | Share button copies the current page URL to clipboard with a confirmation indicator |

### 3.4 Evidence and Trust

| ID | As a... | I want to... | So that... | Priority | Acceptance Criteria |
|----|---------|-------------|-----------|----------|-------------------|
| US-014 | skeptical knowledge worker | see an evidence level badge on every talk and experiment | I can quickly assess the strength of the underlying research | MUST | Every talk and experiment page displays one of five evidence levels (High, Moderate, Preliminary, Mixed/Contested, Narrative/Conceptual) with a color-coded badge |
| US-015 | any visitor | expand evidence notes to see the justification for a rating | I can understand why a claim is rated the way it is | SHOULD | Evidence notes are available via progressive disclosure (collapsible section, visible by default in summary form) |
| US-016 | coach or educator | view related studies for a talk or experiment | I can verify claims and cite sources in my own materials | SHOULD | Talk and experiment detail pages link to related studies with title, authors, year, and URL |
| US-017 | any visitor | see source attribution and last-reviewed date on every content page | I can assess the currency and provenance of the content | MUST | Every content page displays the source talk attribution, last-reviewed date, and evidence status |

### 3.5 Accessibility and Portability

| ID | As a... | I want to... | So that... | Priority | Acceptance Criteria |
|----|---------|-------------|-----------|----------|-------------------|
| US-018 | accessibility-first learner | navigate the entire site via keyboard | I don't need a pointer device to browse content | MUST | All interactive elements are focusable and operable via keyboard; focus order follows visual order; focus is always visible |
| US-019 | accessibility-first learner | use a screen reader to understand page structure | I can navigate by landmarks, headings, and labels | MUST | All pages have semantic landmarks (header, main, nav, footer), heading hierarchy, and descriptive labels on interactive elements |
| US-020 | any visitor | access all content with JavaScript disabled | I can read content even if JS fails to load | SHOULD | All content is present in the prerendered HTML; interactive features (search, save, filter) degrade gracefully with visible messages |
| US-021 | any visitor | access prominent transcript links on talk pages | I can read the talk content without watching a video | SHOULD | Talk detail pages display a direct link to the TED interactive transcript |

### 3.6 Informational Pages

| ID | As a... | I want to... | So that... | Priority | Acceptance Criteria |
|----|---------|-------------|-----------|----------|-------------------|
| US-022 | any visitor | read an About page explaining the site's methodology | I can understand how evidence levels are assigned and what editorial standards apply | MUST | About page explains the five evidence levels, citation policy, editorial posture, and legal/copyright notes |
| US-023 | coach or educator | browse a Resources page with studies, TED playlists, and guidance | I can find external references and tools | SHOULD | Resources page lists studies, external links, and usage guidance with type, description, and URL |

### 3.7 Content Authoring (Editorial)

| ID | As a... | I want to... | So that... | Priority | Acceptance Criteria |
|----|---------|-------------|-----------|----------|-------------------|
| US-024 | content editor | add a new talk or experiment by creating a Markdown file | I can extend the site's content without changing code | MUST | A valid Markdown file with correct frontmatter schema is picked up by the build and rendered as a new page |
| US-025 | content editor | see a build error if my content file has invalid schema | I catch metadata mistakes before they reach production | MUST | Build fails with a clear error message identifying the file and the invalid field |
| US-026 | content editor | preview my changes on a staging URL before merge | I can review the rendered result before publishing | SHOULD | Every PR triggers a Cloudflare Pages preview deployment accessible via a unique URL |

<!-- Added during finalization: US-024, US-025, US-026 derived from URD governance section and Content Editor persona. Content authoring is a core workflow even though it's not user-facing. -->

## 4. Non-Functional Requirements

| ID | Category | Requirement | Target | Priority |
|----|----------|------------|--------|----------|
| NFR-001 | Performance | Largest Contentful Paint (LCP) | ≤ 2.5s at 75th percentile on mobile 4G | MUST |
| NFR-002 | Performance | Interaction to Next Paint (INP) | ≤ 200ms at 75th percentile | MUST |
| NFR-003 | Performance | Cumulative Layout Shift (CLS) | ≤ 0.1 at 75th percentile | MUST |
| NFR-004 | Performance | Lighthouse Performance score | ≥ 90 on landing page and detail pages | SHOULD |
| NFR-005 | Accessibility | WCAG compliance level | WCAG 2.1 AA on all pages | MUST |
| NFR-006 | Accessibility | Lighthouse Accessibility score | ≥ 90 on all page templates | MUST |
| NFR-007 | Accessibility | axe-core automated audit | Zero critical or serious violations on all page templates | MUST |
| NFR-008 | Accessibility | Keyboard navigation | All primary flows completable without pointer device | MUST |
| NFR-009 | Privacy | Cookies | Zero cookies set by the application | MUST |
| NFR-010 | Privacy | Third-party tracking | No behavioral advertising; no cross-site tracking; no persistent identifiers | MUST |
| NFR-011 | Privacy | Analytics | Cookieless analytics (Plausible) or no analytics at MVP | SHOULD |
| NFR-012 | SEO | Structured data | JSON-LD for WebSite, CollectionPage, BreadcrumbList, and content types on all pages | SHOULD |
| NFR-013 | SEO | Metadata | Open Graph and Twitter card metadata on all pages | SHOULD |
| NFR-014 | SEO | Sitemap | XML sitemap generated at build time, including all content pages | MUST |
| NFR-015 | Security | HTTPS | All pages served over HTTPS | MUST |
| NFR-016 | Security | Content Security Policy | CSP header restricting scripts and frames to self and TED embed domains | SHOULD |
| NFR-017 | Build | Schema validation | All content files validated against typed schema at build time | MUST |
| NFR-018 | Build | Link checking | Internal links validated at build time; external links validated periodically in CI | SHOULD |
| NFR-019 | Build | Build time | Full site build completes in under 60 seconds for 100 content items | SHOULD |
| NFR-020 | Availability | Uptime | Static CDN hosting (Cloudflare Pages) — no custom SLA; expected >99.9% based on platform SLA | MUST |
| NFR-021 | Content Volume | MVP content | 40–60 talks/experiments at launch; at least 10 talks and 5 experiments per cluster | MUST |
| NFR-022 | Content Volume | Growth | Content model supports 500+ items without build or search degradation | SHOULD |
| NFR-023 | i18n | Route structure | i18n-ready route structure in MVP (locale prefix); no translated content required at launch | SHOULD |
| NFR-024 | Print | Experiment cards | Print stylesheet produces legible output on US Letter and A4 paper | SHOULD |

<!-- Added during finalization: NFR-004 (Lighthouse perf score), NFR-017–019 (build requirements), NFR-020 (availability), NFR-022 (growth volume), NFR-023 (i18n readiness), NFR-024 (print) — all implied by URD but not stated as measurable requirements. -->

## 5. Constraints and Assumptions

- **Non-commercial.** The site is non-commercial at launch. TED embedding and reuse rules are materially easier under a non-commercial model. If the site becomes commercial, TED content usage must be re-evaluated.
- **TED content license.** TED content is covered by CC BY-NC-ND license unless otherwise indicated. The site uses metadata, summaries, embeds, and links — not rehosted video or mirrored transcripts.
- **No user accounts.** Saved experiments use browser localStorage. No authentication, no server-side user state, no cross-device sync.
- **English first.** All content is in English at launch. Route structure supports future locales via Astro i18n.
- **Editorial team capacity.** The URD assumes a small team (product owner, editor, researcher, developer). Governance and update cadence are sized accordingly.
- **Static architecture.** All pages are prerendered at build time. No server-side rendering, no API routes, no dynamic content. Client-side interactivity is limited to Astro islands for search, save, filter, and share.
- **TED embed availability.** The site assumes TED embeds will remain available for non-commercial use. If TED changes its embed policy, fallback is outbound links to TED pages.
- **Evidence ratings are editorial.** The five-tier evidence rubric is an editorial judgment, not a computed score. Inter-rater agreement should be ≥ 80% on a calibration exercise.

## 6. Out of Scope

- User accounts and authentication
- Server-side state or database
- Video hosting or TED media downloads
- Full transcript mirroring
- Multilingual content (i18n routing is structural only)
- Public contributor submissions or comments
- CMS integration (deferred to post-MVP)
- Commercial features (ads, sponsorships, paid tiers)
- Native mobile application
- Email notifications or newsletters
- Social media integration beyond share links
- A/B testing or personalization
- Real-time collaborative features

<!-- Added during finalization: "Native mobile application", "Email notifications", "Social media integration beyond share links", "A/B testing", "Real-time collaborative features" added to prevent scope creep — these are common feature requests that the static architecture cannot support without significant changes. -->
