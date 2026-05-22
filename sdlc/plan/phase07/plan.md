---
phase: 07
title: "Landing Page and Static Pages"
depends_on: "Phase 05, Phase 04"
goal: "Landing page with all entry points, About page with methodology, Resources page with study listings."
source_pdr_sections: ["4.1", "4.4", "4.11"]
source_user_stories: ["US-001", "US-022", "US-023"]
status: "open"
---

# Phase 07: Landing Page and Static Pages

## Tasks

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

## Context

### Files to Create or Modify

- `src/pages/index.astro` — Complete rebuild as landing page (modify, exists as placeholder from Phase 01)
- `src/pages/about.astro` — Methodology/about page (new)
- `src/pages/resources.astro` — Resources listing page (new)
- `src/content/resources/` — Additional resource content files (new, some may exist from Phase 00)
- `tests/e2e/navigation.spec.ts` — Add landing page and about page tests (modify)
- `tests/e2e/accessibility.spec.ts` — Add scans for landing, about, resources pages (modify)

### Data Model

**Resource schema** (from `src/content/config.ts`):
```typescript
const resources = defineCollection({
  type: 'content',
  schema: z.object({
    id: z.string(),
    title: z.string(),
    type: z.string(),           // e.g., 'study', 'playlist', 'guide', 'glossary'
    url: z.string().url().optional(),
    license_or_usage_note: z.string().optional(),
  }),
});
```

**Cluster and Persona data** used on landing page:
- 4 clusters from `getCollection('clusters')` — display as cards with name and link
- 3+ personas from `getCollection('personas')` — display as cards with persona_name and link
- Featured experiments: editorially selected (e.g., first 3–4 experiments from all collections, or a curated list)

### Key Patterns and Imports

**Landing page structure:**
```astro
---
import { getCollection } from 'astro:content';
import BaseLayout from '../layouts/BaseLayout.astro';
import ExperimentCard from '../components/ExperimentCard.astro';

const clusters = await getCollection('clusters');
const personas = await getCollection('personas');
const experiments = await getCollection('experiments');

// Featured experiments: curated selection (e.g., highest evidence, most approachable)
const featured = experiments.slice(0, 4); // or editorial selection
---
<BaseLayout title="HAx — Human Advantage Experiments" description="Discover evidence-backed experiments from TED Talks">
  <!-- Hero section -->
  <section class="hero">
    <h1>Human Advantage Experiments</h1>
    <p>Discover actionable, evidence-rated experiments drawn from TED Talks...</p>
  </section>

  <!-- Cluster cards (4) -->
  <section>
    <h2>Browse by Cluster</h2>
    <div class="card-grid">
      {clusters.map(c => (
        <a href={`/clusters/${c.data.id}/`} class="cluster-card">
          <h3>{c.data.name}</h3>
        </a>
      ))}
    </div>
  </section>

  <!-- Persona cards (3+) -->
  <section>
    <h2>Navigate by Goal</h2>
    {personas.map(p => (
      <a href={`/personas/${p.data.id}/`} class="persona-card">
        <h3>{p.data.persona_name}</h3>
      </a>
    ))}
  </section>

  <!-- Featured experiments strip -->
  <section>
    <h2>Featured Experiments</h2>
    {featured.map(exp => <ExperimentCard ... />)}
  </section>

  <!-- Search bar -->
  <section>
    <h2>Search</h2>
    <a href="/search/" class="search-cta">Search experiments and talks</a>
  </section>

  <!-- Methodology ribbon -->
  <section class="methodology-ribbon">
    <p>Every experiment is rated on a five-level evidence scale.
    <a href="/about/">Learn about our methodology</a></p>
  </section>
</BaseLayout>
```

**About page — evidence rubric table:**
```html
<table>
  <thead>
    <tr><th>Level</th><th>Color</th><th>Definition</th></tr>
  </thead>
  <tbody>
    <tr><td>High</td><td>Green</td><td>Multiple RCTs, systematic reviews, or meta-analyses with consistent findings</td></tr>
    <tr><td>Moderate</td><td>Blue</td><td>At least one RCT or multiple controlled studies with generally consistent findings</td></tr>
    <tr><td>Preliminary</td><td>Yellow</td><td>Pilot studies, observational data, or single studies awaiting replication</td></tr>
    <tr><td>Mixed / Contested</td><td>Orange</td><td>Conflicting evidence, failed replications, or active scientific debate</td></tr>
    <tr><td>Narrative / Conceptual</td><td>Gray</td><td>Expert opinion, logical argument, or anecdotal support without formal study</td></tr>
  </tbody>
</table>
```

**Resources page pattern:**
```astro
---
import { getCollection } from 'astro:content';
import BaseLayout from '../layouts/BaseLayout.astro';
import StudyLink from '../components/StudyLink.astro';

const resources = await getCollection('resources');
const studies = await getCollection('studies');

// Group resources by type
const grouped = resources.reduce((acc, r) => {
  const type = r.data.type;
  if (!acc[type]) acc[type] = [];
  acc[type].push(r);
  return acc;
}, {} as Record<string, typeof resources>);
---
```

### Design Notes

- **Landing page is the gateway (US-001)**: Must display ALL entry points: cluster cards (4), persona cards (3+), featured experiments, search bar, and methodology ribbon. The page should feel like a curated starting point, not a content dump.
- **Featured experiments are editorial**: Not computed. The implementer should select 3–4 experiments that represent the site's range — one from each cluster, or the highest-evidence experiments. This could be hardcoded in the page template or driven by a curated list.
- **Search bar on landing page is a link, not an input**: The landing page doesn't need a Pagefind widget. A styled link/button that says "Search experiments and talks" and navigates to `/search/` is sufficient. This avoids loading Pagefind JS on the landing page.
- **About page legal notes**: Must include TED attribution ("HAx is not affiliated with TED"), CC BY-NC-ND notice, and a note that TED content is used under non-commercial terms. This is a legal requirement from the URD constraints.
- **Resources page groups by type**: Resources have a `type` field (study, playlist, guide, glossary). The page should group resources by type with section headings. Study-type resources use the StudyLink component from Phase 02 for consistent rendering.
- **Additional resource files**: Write content files for TED playlists (links to curated TED playlists), transcript guidance (how to find TED transcripts), and optionally glossary entries. Each is a resource content file with type, URL, and description body.

### Verification

- [ ] Landing page at `/` displays: hero section, 4 cluster cards, 3+ persona cards, featured experiments strip, search link, methodology ribbon
- [ ] All cluster cards link to correct cluster hub pages
- [ ] All persona cards link to correct persona dashboard pages
- [ ] Featured experiments link to correct experiment detail pages
- [ ] Search link navigates to `/search/`
- [ ] Methodology ribbon links to `/about/`
- [ ] About page at `/about/` displays: evidence rubric table (5 levels with definitions), citation policy, editorial posture, TED attribution, CC BY-NC-ND notice
- [ ] Resources page at `/resources/` displays: resources grouped by type, StudyLink components for study-type resources
- [ ] `npx playwright test tests/e2e/navigation.spec.ts` passes (including landing page and about page tests)
- [ ] `npx playwright test tests/e2e/accessibility.spec.ts` passes (including landing, about, resources scans)
- [ ] `npm run build` succeeds

## Phase Summary

_To be filled after completion._

- **Changes:** TBD
- **Commit:** TBD
