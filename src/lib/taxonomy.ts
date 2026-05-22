export const CLUSTERS = ['body', 'cognition', 'environment', 'social'] as const;
export type ClusterId = (typeof CLUSTERS)[number];

export const EVIDENCE_LEVELS = [
  'high',
  'moderate',
  'preliminary',
  'mixed_contested',
  'narrative_conceptual',
] as const;
export type EvidenceLevel = (typeof EVIDENCE_LEVELS)[number];

export const EVIDENCE_LABELS: Record<EvidenceLevel, string> = {
  high: 'High',
  moderate: 'Moderate',
  preliminary: 'Preliminary',
  mixed_contested: 'Mixed / Contested',
  narrative_conceptual: 'Narrative / Conceptual',
};

export const EVIDENCE_COLORS: Record<EvidenceLevel, string> = {
  high: 'green',
  moderate: 'blue',
  preliminary: 'yellow',
  mixed_contested: 'orange',
  narrative_conceptual: 'gray',
};

export const EFFORT_LEVELS = ['low', 'medium', 'high'] as const;
export type EffortLevel = (typeof EFFORT_LEVELS)[number];

export const EFFORT_LABELS: Record<EffortLevel, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
};
