---
phase: 00
title: "Project Scaffold and Risk Validation"
depends_on: "none"
goal: "Working Astro project with content schemas, sample content, TED embed validation, Cloudflare Pages deployment, and CI pipeline."
source_pdr_sections: ["1.2", "1.3", "2.1", "2.2", "2.4", "3"]
source_user_stories: ["US-024", "US-025", "US-026"]
status: "open"
---

# Phase 00: Project Scaffold and Risk Validation

## Tasks

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

## Context

### Files to Create or Modify

- `astro.config.mjs` — Astro configuration: `output: 'static'`, i18n with `defaultLocale: 'en'`, site URL from env
- `tsconfig.json` — TypeScript configuration for Astro
- `package.json` — Dependencies, scripts (`dev`, `build`, `preview`, `check`, `test`)
- `src/content/config.ts` — All six content collection schemas with Zod validation
- `src/lib/taxonomy.ts` — Shared constants for clusters, evidence levels, effort levels
- `src/content/talks/amy-cuddy-body-language.md` — Sample talk (body cluster)
- `src/content/talks/kelly-mcgonigal-stress.md` — Sample talk (cognition cluster)
- `src/content/experiments/power-pose.md` — Sample experiment linked to Cuddy talk
- `src/content/experiments/stress-reframe.md` — Sample experiment linked to McGonigal talk
- `src/content/experiments/walking-meeting.md` — Sample experiment (third)
- `src/content/studies/carney-cuddy-yap-2010.md` — Sample study
- `src/content/studies/jamieson-mendes-nock-2013.md` — Sample study
- `src/content/clusters/body.md` — Sample cluster with hero_experiments and canonical_talks
- `src/content/personas/knowledge-worker.md` — Sample persona
- `src/content/resources/ted-playlist-stress.md` — Sample resource
- `src/pages/test-embed.astro` — Temporary TED embed test page (removed in Phase 01)
- `src/pages/index.astro` — Minimal placeholder index page
- `.github/workflows/ci.yml` — GitHub Actions CI pipeline
- `public/` — Static assets directory (initially empty or favicon)

### Data Model

All six content collection schemas from PDR Section 2.1:

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

### Key Patterns and Imports

```typescript
// src/lib/taxonomy.ts — shared constants
export const CLUSTERS = ['body', 'cognition', 'environment', 'social'] as const;
export type ClusterId = typeof CLUSTERS[number];

export const EVIDENCE_LEVELS = [
  'high',
  'moderate',
  'preliminary',
  'mixed_contested',
  'narrative_conceptual',
] as const;
export type EvidenceLevel = typeof EVIDENCE_LEVELS[number];

export const EFFORT_LEVELS = ['low', 'medium', 'high'] as const;
export type EffortLevel = typeof EFFORT_LEVELS[number];
```

```yaml
# Content file frontmatter pattern (example: talk)
---
id: amy-cuddy-body-language
title: "Your body language may shape who you are"
speaker: "Amy Cuddy"
ted_url: "https://www.ted.com/talks/amy_cuddy_your_body_language_may_shape_who_you_are"
clusters: [body]
behaviors: [posture, confidence]
goals: [reduce-anxiety, boost-confidence]
evidence_level: mixed_contested
evidence_notes: "Original power-pose findings (Carney et al. 2010) partially replicated..."
related_experiments: [power-pose]
related_studies: [carney-cuddy-yap-2010]
last_reviewed: 2026-05-22
---

Talk body content (summary, analysis, editorial notes) in Markdown.
```

```mjs
// astro.config.mjs pattern
import { defineConfig } from 'astro/config';

export default defineConfig({
  output: 'static',
  site: process.env.SITE_URL || 'https://hax.example.com',
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
    routing: { prefixDefaultLocale: false },
  },
});
```

```yaml
# .github/workflows/ci.yml pattern
name: CI
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci
      - run: npx astro check
      - run: npm run build
```

### Design Notes

- **Astro content collections with `reference()`**: References between collections (e.g., `Experiment.source_talks` → `Talk`) are validated at build time. A broken reference slug fails the build with a clear error — this satisfies US-025.
- **i18n routing**: Configure `prefixDefaultLocale: false` so English routes don't have a `/en/` prefix at MVP. Future locales will get prefixed routes (e.g., `/es/clusters/body/`).
- **TED embed risk validation**: Task 00.06 creates a test page specifically to validate that TED iframe embeds work from a Cloudflare Pages domain. This is the #1 risk from the PDR — if TED blocks embedding, the site falls back to outbound links only (controlled by `TED_EMBED_ENABLED` config).
- **Sample content minimum**: The cluster schema requires `min(3)` for `hero_experiments` and `canonical_talks`. Phase 00 creates only 1 cluster with 3 experiments and 2 talks — the cluster file will need to reference all 3 experiments and both talks (plus a third talk that must also be created, OR relax to `min(1)` during scaffolding and tighten later). The implementer should create enough sample content to satisfy all schema constraints.
- **Configuration variables**: `SITE_URL`, `TED_EMBED_ENABLED`, `PLAUSIBLE_DOMAIN`, `PLAUSIBLE_SCRIPT_URL`, `DEFAULT_LOCALE` are defined in PDR 1.3. Only `SITE_URL` and `DEFAULT_LOCALE` are needed in Phase 00.

### Verification

- [ ] `npm run build` succeeds with zero errors
- [ ] `npx astro check` passes with zero type errors
- [ ] All six content collections resolve — `astro build` validates all sample content frontmatter
- [ ] Creating a content file with an invalid `evidence_level` value causes `astro build` to fail with a clear error message identifying the file and field
- [ ] Creating a content file with a broken `reference()` slug causes `astro build` to fail
- [ ] `src/pages/test-embed.astro` renders a TED iframe when served locally via `npm run dev`
- [ ] TED embed loads on the live Cloudflare Pages preview URL (no X-Frame-Options or CSP blocking)
- [ ] GitHub Actions CI pipeline runs and passes on push
- [ ] `package.json` has scripts: `dev`, `build`, `preview`, `check`, `test`

## Phase Summary

- **Changes:** Initialized Astro 6.x project with TypeScript strict mode and static output. Created `src/content.config.ts` with Zod schemas for all six collections (talks, experiments, studies, clusters, personas, resources) using glob loaders. Created `src/lib/taxonomy.ts` with shared taxonomy constants. Created 10 sample content files (3 talks, 3 experiments, 2 studies, 1 cluster, 1 persona, 1 resource) with complete frontmatter and body content. Configured i18n with English default locale. Created TED embed test page. Set up GitHub Actions CI pipeline (type-check + build). Added `@astrojs/check` and TypeScript dependencies. Verified schema validation catches invalid content.
- **Blocked tasks:** 00.07 (Cloudflare Pages setup — requires manual dashboard configuration), 00.08 (TED embed live verification — depends on 00.07)
- **Commit:** `Phase 00: Project scaffold with content schemas, TED embed validation, and CI pipeline`
