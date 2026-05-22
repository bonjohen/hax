---
phase: 02
title: "Content Detail Pages"
depends_on: "Phase 01"
goal: "Talk detail and Experiment detail page templates rendering from content collections, with evidence badges, TED embeds, progressive disclosure, and JSON-LD structured data."
source_pdr_sections: ["4.2", "4.8", "4.10", "4.11", "2.1"]
source_user_stories: ["US-003", "US-004", "US-014", "US-015", "US-016", "US-017", "US-021"]
status: "open"
---

# Phase 02: Content Detail Pages

## Tasks

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

## Context

### Files to Create or Modify

- `src/layouts/ContentLayout.astro` — Content detail layout extending BaseLayout (new)
- `src/components/EvidenceBadge.astro` — Evidence level badge component (new)
- `src/components/TedEmbed.astro` — TED iframe embed with fallback (new)
- `src/components/StudyLink.astro` — Study reference link component (new)
- `src/pages/talks/[slug].astro` — Talk detail page template (new)
- `src/pages/experiments/[slug].astro` — Experiment detail page template (new)
- `src/lib/structured-data.ts` — JSON-LD generation helpers (new)
- `src/content/talks/` — 3 additional talk files (new)
- `src/content/experiments/` — 2 additional experiment files (new)
- `tests/e2e/navigation.spec.ts` — Navigation e2e tests (new)
- `tests/e2e/accessibility.spec.ts` — Add detail page scans (modify, created in Phase 01)

### Data Model

Relevant schemas from `src/content/config.ts` (created in Phase 00):

**Talk schema fields used in this phase:**
- `title`, `speaker`, `ted_url`, `embed_url`, `transcript_url`, `thumbnail`
- `clusters`, `behaviors`, `goals`
- `evidence_level`, `evidence_notes`
- `related_experiments` (array of experiment references)
- `related_studies` (array of study references)
- `last_reviewed`

**Experiment schema fields used in this phase:**
- `title`, `one_line_claim`, `instructions` (array of strings)
- `time_cost_minutes`, `effort`
- `clusters`, `behaviors`, `goals`
- `contraindications` (optional string)
- `source_talks` (array of talk references)
- `related_studies` (array of study references)
- `evidence_level`, `evidence_notes`
- `last_reviewed`

**Study schema fields used in this phase:**
- `title`, `authors`, `year`, `source_type`, `doi_or_url`

### Key Patterns and Imports

**ContentLayout.astro** (PDR 4.2):
```astro
---
import BaseLayout from './BaseLayout.astro';
import Breadcrumb from '../components/Breadcrumb.astro';

interface Props {
  title: string;
  description: string;
  breadcrumbs: Array<{ label: string; href: string }>;
  lastReviewed: Date;
  structuredData: object;
}
const { title, description, breadcrumbs, lastReviewed, structuredData } = Astro.props;
---
<BaseLayout title={title} description={description} structuredData={structuredData}>
  <Breadcrumb items={breadcrumbs} />
  <div class="content-layout">
    <article class="content-main">
      <slot />
    </article>
    <aside class="content-sidebar">
      <slot name="sidebar" />
    </aside>
  </div>
  <footer class="content-footer">
    <p>Last reviewed: <time datetime={lastReviewed.toISOString()}>
      {lastReviewed.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
    </time></p>
  </footer>
</BaseLayout>
```

**EvidenceBadge.astro** (PDR 4.8):
```astro
---
interface Props {
  level: 'high' | 'moderate' | 'preliminary' | 'mixed_contested' | 'narrative_conceptual';
  showTooltip?: boolean;
}
---
```
Colors: High = green, Moderate = blue, Preliminary = yellow, Mixed/Contested = orange, Narrative/Conceptual = gray. Tooltip describes the level meaning.

**TedEmbed.astro** (PDR 4.10):
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
If `TED_EMBED_ENABLED` is true and `embedUrl` is provided: `<iframe loading="lazy" sandbox="allow-scripts allow-same-origin allow-popups" aria-label="{title} by {speaker} — TED Talk">`. Always renders "Watch on TED.com" outbound link below.

**StudyLink.astro** (PDR 4.11):
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
Link opens in new tab with `rel="noopener noreferrer"`.

**Talk detail page pattern:**
```astro
---
import { getCollection, getEntry } from 'astro:content';
import ContentLayout from '../../layouts/ContentLayout.astro';

export async function getStaticPaths() {
  const talks = await getCollection('talks');
  return talks.map(talk => ({ params: { slug: talk.slug }, props: { talk } }));
}

const { talk } = Astro.props;
const { Content } = await talk.render();
// Resolve references
const relatedExperiments = await Promise.all(
  talk.data.related_experiments.map(ref => getEntry(ref))
);
const relatedStudies = await Promise.all(
  talk.data.related_studies.map(ref => getEntry(ref))
);
---
```

**structured-data.ts:**
```typescript
// Talk → CreativeWork JSON-LD
export function talkJsonLd(talk: { data: TalkData; slug: string }, siteUrl: string): object

// Experiment → HowTo JSON-LD
export function experimentJsonLd(exp: { data: ExperimentData; slug: string }, siteUrl: string): object
```

### Design Notes

- **Progressive disclosure for evidence notes**: Use native `<details>/<summary>` elements for evidence notes. The summary shows a brief label like "Evidence: [level]" and expanding reveals the full `evidence_notes` text. This satisfies US-015 without requiring JavaScript.
- **Two-column layout**: ContentLayout uses a CSS Grid or Flexbox two-column layout. Content is the primary column; sidebar is for secondary navigation (related experiments/talks, save button in future phases). On mobile (< 640px), sidebar stacks below content.
- **TED_EMBED_ENABLED config check**: Read from `import.meta.env.TED_EMBED_ENABLED` (Astro env). Defaults to `true`. If false, TedEmbed renders only the outbound link — no iframe at all.
- **Content references**: Astro's `reference()` returns a `{ collection, slug }` object. Use `getEntry(ref)` to resolve the full entry. This pattern applies to `related_experiments`, `related_studies`, and `source_talks`.
- **JSON-LD for Talk**: Use `CreativeWork` schema type with `@type: "CreativeWork"`, `name`, `author`, `url`, `datePublished`, `about`.
- **JSON-LD for Experiment**: Use `HowTo` schema type with `@type: "HowTo"`, `name`, `step` (from instructions array), `totalTime` (from time_cost_minutes as ISO 8601 duration).
- **Sample content expansion**: Add 3 more talks and 2 more experiments to cover all four clusters. This ensures every cluster has at least 1 talk and 1 experiment for testing in Phase 03.

### Verification

- [ ] Every talk detail page renders: title, speaker, summary body, TED embed or outbound link, transcript link, EvidenceBadge, evidence notes (expandable), related experiments list, related studies list, last-reviewed date
- [ ] Every experiment detail page renders: title, one-line claim, instructions (ordered list), time cost, effort, EvidenceBadge, evidence notes (expandable), source talks list, contraindications (if present), related studies list, last-reviewed date
- [ ] `<details>` element for evidence notes opens/closes correctly
- [ ] TED iframe has `loading="lazy"` and `sandbox` attributes
- [ ] "Watch on TED.com" link is always present on talk pages
- [ ] StudyLink opens in a new tab with `rel="noopener noreferrer"`
- [ ] JSON-LD validates at https://validator.schema.org/ for both Talk and Experiment pages
- [ ] Breadcrumbs render correctly (Home > Talks > [Talk Title] or Home > Experiments > [Experiment Title])
- [ ] `npx playwright test tests/e2e/navigation.spec.ts` passes
- [ ] `npx playwright test tests/e2e/accessibility.spec.ts` passes (including new detail page scans)
- [ ] `npm run build` succeeds

## Phase Summary

- **Changes:** Created `ContentLayout.astro` with two-column grid, `EvidenceBadge.astro` with WCAG-compliant colors, `TedEmbed.astro` with lazy iframe and sandbox, `StudyLink.astro` with outbound links, `structured-data.ts` with CreativeWork/HowTo JSON-LD helpers. Created `talks/[slug].astro` and `experiments/[slug].astro` detail pages. Added 3 talks (Susan Cain, Shawn Achor, Andy Puddicombe) and 3 experiments (solitude break, gratitude journal, 10-min meditation) covering all four clusters. Created `navigation.spec.ts` with talk/experiment tests and extended accessibility tests. Total: 6 talks, 6 experiments, 13 pages.
- **Commit:** `Phase 02: Talk and experiment detail pages with evidence badges, TED embeds, and structured data`
