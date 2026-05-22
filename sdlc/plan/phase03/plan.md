---
phase: 03
title: "Cluster Hubs"
depends_on: "Phase 02"
goal: "Four cluster hub pages with 'Start here' strips, card grids, and cross-cluster content. This is the Minimum Useful Release."
source_pdr_sections: ["4.6", "4.7", "4.9"]
source_user_stories: ["US-002", "US-007"]
status: "open"
---

# Phase 03: Cluster Hubs

## Tasks

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
| 03.14 | Completed | 2026-05-22 10:34 PM | 2026-05-22 10:35 PM | Stage all changes and commit: "Phase 03: Cluster hubs with card grids — Minimum Useful Release" |

## Context

### Files to Create or Modify

- `src/components/ExperimentCard.astro` — Compact experiment card for listings (new)
- `src/components/TalkCard.astro` — Compact talk card for listings (new)
- `src/components/FilterPanel.astro` — Filter controls, static HTML only (new)
- `src/pages/clusters/[id].astro` — Cluster hub page template (new)
- `src/content/clusters/body.md` — Body cluster content (modify if exists from Phase 00, or ensure complete)
- `src/content/clusters/cognition.md` — Cognition cluster content (new)
- `src/content/clusters/environment.md` — Environment cluster content (new)
- `src/content/clusters/social.md` — Social cluster content (new)
- `tests/e2e/navigation.spec.ts` — Add cluster hub tests (modify, created in Phase 02)
- `tests/e2e/accessibility.spec.ts` — Add cluster hub scans (modify)

### Data Model

**Cluster schema** (from `src/content/config.ts`):
```typescript
const clusters = defineCollection({
  type: 'content',
  schema: z.object({
    id: clusterEnum,                                         // 'body' | 'cognition' | 'environment' | 'social'
    name: z.string(),                                        // Display name
    hero_experiments: z.array(reference('experiments')).min(3), // "Start here" experiments
    canonical_talks: z.array(reference('talks')).min(3),     // Featured talks
    related_clusters: z.array(clusterEnum).default([]),       // Cross-links
  }),
});
```

**Content querying pattern** — filter experiments/talks by cluster:
```typescript
import { getCollection, getEntry } from 'astro:content';

const allExperiments = await getCollection('experiments');
const clusterExperiments = allExperiments.filter(e =>
  e.data.clusters.includes(clusterId)
);

const allTalks = await getCollection('talks');
const clusterTalks = allTalks.filter(t =>
  t.data.clusters.includes(clusterId)
);
```

### Key Patterns and Imports

**ExperimentCard.astro** (PDR 4.6):
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
<a href={`/experiments/${slug}/`}
   class="experiment-card"
   data-clusters={clusters.join(',')}
   data-behavior={behaviors.join(',')}
   data-goal={goals.join(',')}
   data-evidence={evidenceLevel}
   data-time={timeCostMinutes}
   data-effort={effort}>
  <h3>{title}</h3>
  <p>{oneLineClaim}</p>
  <EvidenceBadge level={evidenceLevel} />
  <span class="time-cost">{timeCostMinutes} min</span>
  <span class="effort">{effort} effort</span>
</a>
```

**TalkCard.astro** (PDR 4.7):
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
<a href={`/talks/${slug}/`}
   class="talk-card"
   data-clusters={clusters.join(',')}
   data-evidence={evidenceLevel}>
  {thumbnail ? <img src={thumbnail} alt="" loading="lazy" /> : <div class="thumbnail-placeholder" />}
  <h3>{title}</h3>
  <p class="speaker">{speaker}</p>
  <EvidenceBadge level={evidenceLevel} />
</a>
```

**FilterPanel.astro** (PDR 4.9):
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
Renders five filter groups with checkbox inputs. Each checkbox has `name` = dimension, `value` = tag. Collapses to expandable panel on mobile. No JavaScript — FilterController island (Phase 06) will handle interactivity.

**Cluster hub page pattern:**
```astro
---
import { getCollection, getEntry } from 'astro:content';
import BaseLayout from '../../layouts/BaseLayout.astro';
import ExperimentCard from '../../components/ExperimentCard.astro';
import TalkCard from '../../components/TalkCard.astro';
import FilterPanel from '../../components/FilterPanel.astro';

export async function getStaticPaths() {
  const clusters = await getCollection('clusters');
  return clusters.map(cluster => ({
    params: { id: cluster.data.id },
    props: { cluster },
  }));
}

const { cluster } = Astro.props;
const { Content } = await cluster.render();

// Resolve hero experiments
const heroExperiments = await Promise.all(
  cluster.data.hero_experiments.map(ref => getEntry(ref))
);

// Get all experiments and talks for this cluster
const allExperiments = await getCollection('experiments');
const clusterExperiments = allExperiments.filter(e =>
  e.data.clusters.includes(cluster.data.id)
);
// ... similarly for talks
---
```

**Responsive card grid CSS:**
```css
.card-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-4);
}
@media (min-width: 640px) {
  .card-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (min-width: 1024px) {
  .card-grid { grid-template-columns: repeat(3, 1fr); }
}
```

### Design Notes

- **"Start here" strip**: The cluster's `hero_experiments` array defines 3+ experiments shown in a horizontal strip at the top of the hub. These are editorially curated, not algorithmically selected. They should render as full ExperimentCards with visual distinction (e.g., border or background).
- **Cross-cluster content**: Experiments and talks can belong to multiple clusters (e.g., `clusters: [body, social]`). The hub page filters by checking if the cluster ID is in the content's `clusters` array. A talk tagged `[body, social]` appears on BOTH the body and social cluster hubs.
- **Filter data attributes**: `data-behavior`, `data-goal`, `data-evidence`, `data-time`, `data-effort` are added to cards NOW (Phase 03) even though filtering is not interactive until Phase 06. This ensures the DOM is ready for the FilterController island.
- **FilterPanel is static HTML**: In this phase, FilterPanel renders checkboxes that do nothing when clicked. The interactive behavior comes from FilterController (Phase 06). This separation means the page works without JavaScript — the filter UI is visible but non-functional.
- **Cluster content files**: Each cluster file needs a body with an editorial description (displayed as the hub intro) and frontmatter with `hero_experiments` (min 3) and `canonical_talks` (min 3). Ensure enough sample content exists from Phases 00 and 02 to satisfy these minimums for all four clusters.
- **Minimum Useful Release**: After Phase 03, the site has browsable cluster hubs with evidence-labeled cards linking to detail pages. This is the first version that delivers user value (US-002). All subsequent phases add features on top of this base.

### Verification

- [ ] All four cluster hub pages render at `/clusters/body/`, `/clusters/cognition/`, `/clusters/environment/`, `/clusters/social/`
- [ ] Each hub displays: editorial intro, "Start here" experiment strip (≥ 3 experiments), card grid with ExperimentCards and TalkCards
- [ ] ExperimentCard displays: title, one-line claim, EvidenceBadge, time cost, effort
- [ ] TalkCard displays: title, speaker, thumbnail/placeholder, EvidenceBadge
- [ ] Cards link to correct detail pages
- [ ] A multi-cluster talk (e.g., tagged `[body, social]`) appears on both cluster hubs
- [ ] "Related clusters" section shows links to other cluster hubs
- [ ] FilterPanel renders checkbox controls (non-functional in this phase)
- [ ] Cards have `data-*` attributes for all five filter dimensions
- [ ] Card grid is responsive: 1 col mobile, 2 col tablet, 3 col desktop
- [ ] `npx playwright test tests/e2e/navigation.spec.ts` passes
- [ ] `npx playwright test tests/e2e/accessibility.spec.ts` passes (including cluster hub scans)
- [ ] `npm run build` succeeds

## Phase Summary

- **Changes:** Created `ExperimentCard.astro` and `TalkCard.astro` with data-* filter attributes, `FilterPanel.astro` with static checkbox filters, `clusters/[id].astro` hub page with editorial intro, Start Here strip, responsive card grids, and related clusters. Created cluster content for cognition, environment, social. Added 1 talk (Margaret Heffernan) and 1 experiment (Thinking Partner) for social cluster coverage. Fixed EvidenceBadge colors for WCAG AA compliance. Total: 19 pages.
- **Commit:** `Phase 03: Cluster hubs with card grids — Minimum Useful Release`
