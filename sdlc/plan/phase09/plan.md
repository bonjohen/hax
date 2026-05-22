---
phase: 09
title: "Content Population and Launch Readiness"
depends_on: "Phase 08"
goal: "40–60 content items with calibrated evidence labels, all QA checklists passed, production deployment ready."
source_pdr_sections: ["2.4", "8"]
source_user_stories: ["US-001", "US-002", "US-003", "US-004", "US-005", "US-006", "US-007", "US-008", "US-009", "US-010", "US-011", "US-012", "US-013", "US-014", "US-015", "US-016", "US-017", "US-018", "US-019", "US-020", "US-021", "US-022", "US-023", "US-024", "US-025", "US-026"]
status: "open"
---

# Phase 09: Content Population and Launch Readiness

## Tasks

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

## Context

### Files to Create or Modify

- `src/content/talks/` — 35+ additional talk content files (new, bringing total to ≥ 40)
- `src/content/experiments/` — 15+ additional experiment content files (new, bringing total to ≥ 20)
- `src/content/studies/` — Additional study files linked from new talks and experiments (new)
- `src/content/clusters/` — Update hero_experiments and canonical_talks arrays if new content is better suited (modify)
- `src/content/personas/` — Update recommended_experiments if new content is better suited (modify)
- `public/_headers` — Verify CSP still works with full content (verify, no change expected)

### Data Model

Content volume targets from PDR 2.4 and NFR-021:

| Collection | Current (after Phase 08) | Target | Per Cluster |
|------------|------------------------|--------|-------------|
| Talks | ~5 | ≥ 40 | ≥ 10 per cluster |
| Experiments | ~5 | ≥ 20 | ≥ 5 per cluster |
| Studies | ~2 | As needed | Linked from talks/experiments |
| Clusters | 4 | 4 | — |
| Personas | 3 | 3+ | — |
| Resources | ~2 | 5+ | — |

**Content file structure** (same as defined in Phase 00):

Talk content files:
```yaml
---
id: [unique-slug]
title: "[Talk title]"
speaker: "[Speaker name]"
ted_url: "https://www.ted.com/talks/[slug]"
embed_url: "https://embed.ted.com/talks/[slug]"
transcript_url: "https://www.ted.com/talks/[slug]/transcript"
clusters: [cluster1, cluster2]
behaviors: [behavior1, behavior2]
goals: [goal1, goal2]
evidence_level: [high|moderate|preliminary|mixed_contested|narrative_conceptual]
evidence_notes: "[Justification for the evidence level rating]"
related_experiments: [experiment-slug-1, experiment-slug-2]
related_studies: [study-slug-1]
last_reviewed: 2026-05-22
---

[Editorial summary of the talk, key arguments, and relevance to HAx themes.]
```

Experiment content files:
```yaml
---
id: [unique-slug]
title: "[Experiment title]"
one_line_claim: "[One sentence describing the expected outcome]"
instructions:
  - "Step 1..."
  - "Step 2..."
  - "Step 3..."
time_cost_minutes: [number]
effort: [low|medium|high]
clusters: [cluster1]
behaviors: [behavior1]
goals: [goal1]
source_talks: [talk-slug-1]
evidence_level: [level]
evidence_notes: "[Justification]"
last_reviewed: 2026-05-22
---

[Detailed description, context, and editorial notes about the experiment.]
```

### Key Patterns and Imports

**Internal link checker** (for task 09.06):
```bash
# Option 1: Use linkinator
npx linkinator dist --recurse --skip "^https?://"

# Option 2: Custom build step — check after astro build
# Verify all <a href="/..."> paths resolve to files in dist/
```

**External link checker** (for task 09.07):
```bash
# Check external links (TED URLs, DOIs)
npx linkinator dist --recurse --skip "^(?!https?://)"
# Or use a dedicated tool with retry logic for rate limiting
```

**Core Web Vitals measurement** (for task 09.08):
```bash
# Lighthouse CI against the built site
npx @lhci/cli autorun --collect.url=http://localhost:4321/ --collect.url=http://localhost:4321/clusters/body/ --collect.url=http://localhost:4321/talks/amy-cuddy-body-language/
# Or use Google PageSpeed Insights against the production URL
```

**Evidence rubric for calibration** (for task 09.01):

| Level | Definition | Example |
|-------|-----------|---------|
| High | Multiple RCTs, systematic reviews, or meta-analyses with consistent findings | Exercise → mood (decades of replicated research) |
| Moderate | At least one RCT or multiple controlled studies with generally consistent findings | Stress reframing (Jamieson et al.) |
| Preliminary | Pilot studies, observational data, or single studies awaiting replication | Novel interventions with one study |
| Mixed/Contested | Conflicting evidence, failed replications, or active scientific debate | Power posing (Carney et al. controversy) |
| Narrative/Conceptual | Expert opinion, logical argument, or anecdotal support without formal study | TED-specific insights without formal research |

### Design Notes

- **Content population is primarily editorial, not code**: This phase is mostly about writing Markdown files with correct frontmatter. The code infrastructure is complete after Phase 08. The implementer's role is to ensure schema compliance, reference integrity, and evidence label consistency.
- **Evidence rubric calibration (task 09.01)**: Before scaling content, calibrate the evidence rubric. Have 2+ people independently rate 10 existing items. If agreement is < 80%, refine the rubric definitions. This is a governance step from the URD.
- **Cluster content balance**: The target is ≥ 10 talks and ≥ 5 experiments PER cluster (body, cognition, environment, social). Some TED talks span multiple clusters — a talk tagged `[body, social]` counts toward both.
- **Link checking**: Internal links should be checked on every build (add to CI). External links (TED URLs, study DOIs) should be checked periodically (weekly scheduled CI run) because they can rot over time.
- **Core Web Vitals thresholds** (NFR-001, NFR-002, NFR-003):
  - LCP ≤ 2.5s at 75th percentile on mobile 4G
  - INP ≤ 200ms at 75th percentile
  - CLS ≤ 0.1 at 75th percentile
  - These are measured on the production site after deployment, using PageSpeed Insights or CrUX data.
- **Print QA**: Test printing experiment detail pages in both Chrome and Firefox. Verify: single column layout, no navigation chrome, evidence notes visible (expanded), readable text at 12pt, safe margins for both US Letter (8.5x11") and A4 (210x297mm).
- **Legal QA**: Verify TED attribution statement is on the footer of every page, About page has CC BY-NC-ND notice, TED embeds use the official embed URL format, transcript links point to TED's interactive transcript pages (not mirrored content).
- **Production deployment**: Configure the production domain on Cloudflare Pages, update `SITE_URL` in the build environment, and verify DNS propagation. Smoke test all major pages after deployment.

### Verification

- [ ] Evidence rubric calibration: ≥ 80% inter-rater agreement on 10 sample items
- [ ] ≥ 40 talk content files across all four clusters (≥ 10 per cluster)
- [ ] ≥ 20 experiment content files across all four clusters (≥ 5 per cluster)
- [ ] Every cluster hub has ≥ 5 hero experiments and ≥ 5 canonical talks in its frontmatter
- [ ] `npm run build` succeeds with all content — zero schema validation errors
- [ ] Internal link checker: zero broken internal links
- [ ] External link checker: all TED URLs and study DOIs resolve (or are annotated as known-broken)
- [ ] Core Web Vitals: LCP ≤ 2.5s, INP ≤ 200ms, CLS ≤ 0.1 on key pages
- [ ] Every content page has: source links, evidence label, last-reviewed date
- [ ] Print experiment detail in Chrome and Firefox: legible on US Letter and A4
- [ ] TED attribution on every page footer; CC BY-NC-ND on About page; transcript links accurate
- [ ] Production domain configured and serving the site
- [ ] Smoke test all major pages on production URL: landing, all 4 cluster hubs, 2+ talk details, 2+ experiment details, all 3 persona dashboards, search, saved, about, resources

## Phase Summary

_To be filled after completion._

- **Changes:** TBD
- **Commit:** TBD
