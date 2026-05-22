import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

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
  loader: glob({ pattern: '**/*.md', base: './src/content/talks' }),
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
    related_experiments: z.array(z.string()).default([]),
    related_studies: z.array(z.string()).default([]),
    last_reviewed: z.coerce.date(),
  }),
});

const experiments = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/experiments' }),
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
    source_talks: z.array(z.string()).min(1),
    related_studies: z.array(z.string()).default([]),
    evidence_level: evidenceLevelEnum,
    evidence_notes: z.string(),
    printable: z.boolean().default(true),
    last_reviewed: z.coerce.date(),
  }),
});

const studies = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/studies' }),
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
  loader: glob({ pattern: '**/*.md', base: './src/content/clusters' }),
  schema: z.object({
    id: clusterEnum,
    name: z.string(),
    hero_experiments: z.array(z.string()).min(3),
    canonical_talks: z.array(z.string()).min(3),
    related_clusters: z.array(clusterEnum).default([]),
  }),
});

const personas = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/personas' }),
  schema: z.object({
    id: z.string(),
    persona_name: z.string(),
    recommended_clusters: z.array(clusterEnum).min(1),
    recommended_experiments: z.array(z.string()).min(1),
  }),
});

const resources = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/resources' }),
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
