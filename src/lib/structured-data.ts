const SITE_NAME = 'HAx — Human Advantage Experiments';

interface ClusterData {
  id: string;
  name: string;
}

interface ContentItem {
  title: string;
  collection: string;
  slug: string;
}

export function clusterJsonLd(cluster: ClusterData, items: ContentItem[], siteUrl: string): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: cluster.name,
    url: `${siteUrl}/clusters/${cluster.id}/`,
    hasPart: items.map(i => ({
      '@type': 'CreativeWork',
      name: i.title,
      url: `${siteUrl}/${i.collection}/${i.slug}/`,
    })),
  };
}

export function websiteJsonLd(siteUrl: string): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: siteUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteUrl}/search/?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function webPageJsonLd(title: string, description: string, url: string): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: title,
    description,
    url,
  };
}

export function collectionPageJsonLd(name: string, url: string, items: ContentItem[], siteUrl: string): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name,
    url,
    hasPart: items.map(i => ({
      '@type': 'CreativeWork',
      name: i.title,
      url: `${siteUrl}/${i.collection}/${i.slug}/`,
    })),
  };
}

interface TalkData {
  title: string;
  speaker: string;
  ted_url: string;
  published_year?: number;
  evidence_notes: string;
}

interface ExperimentData {
  title: string;
  one_line_claim: string;
  instructions: string[];
  time_cost_minutes: number;
}

export function talkJsonLd(
  talk: { data: TalkData; id: string },
  siteUrl: string
): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: talk.data.title,
    author: {
      '@type': 'Person',
      name: talk.data.speaker,
    },
    url: `${siteUrl}/talks/${talk.id}/`,
    ...(talk.data.published_year && {
      datePublished: String(talk.data.published_year),
    }),
    description: talk.data.evidence_notes,
    isPartOf: {
      '@type': 'WebSite',
      name: 'HAx',
      url: siteUrl,
    },
  };
}

export function experimentJsonLd(
  exp: { data: ExperimentData; id: string },
  siteUrl: string
): object {
  const totalMinutes = exp.data.time_cost_minutes;
  const isoDuration = `PT${totalMinutes}M`;

  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: exp.data.title,
    description: exp.data.one_line_claim,
    url: `${siteUrl}/experiments/${exp.id}/`,
    totalTime: isoDuration,
    step: exp.data.instructions.map((text, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      text,
    })),
  };
}
