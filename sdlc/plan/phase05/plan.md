---
phase: 05
title: "Persona Dashboards"
depends_on: "Phase 03"
goal: "At least 3 persona dashboard pages with curated recommendations, goal-oriented navigation, and editorial rationale."
source_pdr_sections: ["4.6", "4.7"]
source_user_stories: ["US-005"]
status: "open"
---

# Phase 05: Persona Dashboards

## Tasks

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

## Context

### Files to Create or Modify

- `src/pages/personas/[id].astro` — Persona dashboard page template (new)
- `src/content/personas/knowledge-worker.md` — Knowledge worker persona (modify if exists from Phase 00, or ensure complete with body content)
- `src/content/personas/student.md` — Student persona (new)
- `src/content/personas/team-lead.md` — Team lead persona (new)
- `src/components/Header.astro` — Add Personas nav link/dropdown (modify)
- `tests/e2e/navigation.spec.ts` — Add persona dashboard tests (modify)
- `tests/e2e/accessibility.spec.ts` — Add persona dashboard scans (modify)

### Data Model

**Persona schema** (from `src/content/config.ts`):
```typescript
const personas = defineCollection({
  type: 'content',
  schema: z.object({
    id: z.string(),
    persona_name: z.string(),
    recommended_clusters: z.array(clusterEnum).min(1),
    recommended_experiments: z.array(reference('experiments')).min(1),
  }),
});
```

The persona's Markdown body content provides:
- Goals description
- "Why this path" editorial rationale
- Any additional guidance or context

**Persona content file example:**
```yaml
---
id: knowledge-worker
persona_name: "Work Better"
recommended_clusters: [cognition, body, environment]
recommended_experiments: [stress-reframe, power-pose, walking-meeting]
---

## Your Goals

You want to find practical, evidence-backed experiments to improve focus, energy, and time use at work.

## Why This Path

These experiments are selected for busy professionals who need...

## Best First Steps

Start with stress reframing — it takes 5 minutes and has moderate evidence support...
```

### Key Patterns and Imports

**Persona dashboard page:**
```astro
---
import { getCollection, getEntry } from 'astro:content';
import BaseLayout from '../../layouts/BaseLayout.astro';
import ExperimentCard from '../../components/ExperimentCard.astro';

export async function getStaticPaths() {
  const personas = await getCollection('personas');
  return personas.map(persona => ({
    params: { id: persona.data.id },
    props: { persona },
  }));
}

const { persona } = Astro.props;
const { Content } = await persona.render();

// Resolve recommended experiments
const recommendedExperiments = await Promise.all(
  persona.data.recommended_experiments.map(ref => getEntry(ref))
);

// "Best first steps" = first 2-3 recommended experiments
const bestFirstSteps = recommendedExperiments.slice(0, 3);
---
<BaseLayout title={persona.data.persona_name} description={`${persona.data.persona_name} — curated experiments for your goals`}>
  <h1>{persona.data.persona_name}</h1>

  <!-- Body content (goals, why this path) -->
  <Content />

  <!-- Recommended clusters -->
  <section>
    <h2>Recommended Clusters</h2>
    <ul>
      {persona.data.recommended_clusters.map(c => (
        <li><a href={`/clusters/${c}/`}>{c}</a></li>
      ))}
    </ul>
  </section>

  <!-- Best first steps -->
  <section>
    <h2>Best First Steps</h2>
    {bestFirstSteps.map(exp => (
      <ExperimentCard
        slug={exp.slug}
        title={exp.data.title}
        oneLineClaim={exp.data.one_line_claim}
        evidenceLevel={exp.data.evidence_level}
        timeCostMinutes={exp.data.time_cost_minutes}
        effort={exp.data.effort}
        clusters={exp.data.clusters}
        behaviors={exp.data.behaviors}
        goals={exp.data.goals}
      />
    ))}
  </section>

  <!-- All recommended experiments -->
  <section>
    <h2>All Recommended Experiments</h2>
    {recommendedExperiments.map(exp => (
      <ExperimentCard ... />
    ))}
  </section>
</BaseLayout>
```

### Design Notes

- **Persona names are goal-oriented**: "Work Better", "Learn Better", "Lead Teams" — not role titles. The `persona_name` field is the display name; the `id` is the slug (knowledge-worker, student, team-lead).
- **Cross-cluster recommendations**: Each persona recommends experiments from multiple clusters. The knowledge-worker persona, for example, should reference cognition, body, AND environment clusters — not be locked to a single cluster. Task 05.05 explicitly verifies this.
- **"Best first steps" is editorial**: The first 2–3 recommended experiments are the "best first steps." The ordering in the `recommended_experiments` array is intentional — the most approachable or highest-value experiments should be listed first. The persona's body content should include brief editorial notes about why these specific experiments are recommended first.
- **Body content structure**: The persona Markdown body provides the editorial layer. It should have sections for Goals, Why This Path, and optionally Best First Steps rationale. The page template renders this body content directly.
- **Header nav**: Add "Personas" to the nav. This could be a dropdown listing all personas or a direct link to a personas index page. Since there are only 3 personas at launch, direct links in a dropdown are fine.
- **Reuses ExperimentCard from Phase 03**: No new card components needed. The ExperimentCard component created in Phase 03 renders the same way here as on cluster hubs.

### Verification

- [ ] Persona dashboard pages render at `/personas/knowledge-worker/`, `/personas/student/`, `/personas/team-lead/`
- [ ] Each dashboard displays: persona name (as h1), goals/rationale (from body content), recommended clusters (linked to cluster hubs), "Best first steps" section (2–3 ExperimentCards), all recommended experiments (ExperimentCards)
- [ ] Each persona references experiments from at least 2 different clusters
- [ ] Recommended cluster links navigate to the correct cluster hub pages
- [ ] ExperimentCards on persona dashboards link to correct experiment detail pages
- [ ] Header nav includes "Personas" link(s)
- [ ] `npx playwright test tests/e2e/navigation.spec.ts` passes
- [ ] `npx playwright test tests/e2e/accessibility.spec.ts` passes (including persona dashboard scans)
- [ ] `npm run build` succeeds

## Phase Summary

_To be filled after completion._

- **Changes:** TBD
- **Commit:** TBD
