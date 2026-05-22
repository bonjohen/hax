---
phase: 08
title: "SEO, Structured Data, Accessibility, and Analytics"
depends_on: "Phase 07"
goal: "Production-quality SEO, complete structured data, accessibility remediation, analytics decision. This is the First Full Feature Release."
source_pdr_sections: ["6", "7", "8", "4.1", "4.5"]
source_user_stories: ["US-018", "US-019", "US-026"]
status: "open"
---

# Phase 08: SEO, Structured Data, Accessibility, and Analytics

## Tasks

| No | Status | Started (PST) | Completed (PST) | Description |
|----|--------|---------------|------------------|-------------|
| 08.01 | Open | | | Add JSON-LD structured data to remaining page types: cluster hubs (CollectionPage), persona dashboards (CollectionPage), landing page (WebSite), About (WebPage), Resources (CollectionPage) via `src/lib/structured-data.ts` |
| 08.02 | Open | | | Add Open Graph and Twitter card meta tags to BaseLayout: `og:title`, `og:description`, `og:image`, `og:url`, `twitter:card`, `twitter:title`, `twitter:description` — populated from page props |
| 08.03 | Open | | | Install and configure `@astrojs/sitemap` in `astro.config.mjs` for XML sitemap generation at `/sitemap-index.xml` |
| 08.04 | Open | | | Verify canonical URLs on all pages (BaseLayout should set `<link rel="canonical">` from `SITE_URL` + current path) |
| 08.05 | Open | | | Create `public/_headers` file for Cloudflare Pages with Content Security Policy: `default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; frame-src embed.ted.com; img-src 'self' data:; connect-src 'self'` per PDR Section 6 |
| 08.06 | Open | | | Conduct manual keyboard navigation walkthrough on all page templates: landing, cluster hub, talk detail, experiment detail, persona dashboard, search, saved, about, resources — document findings |
| 08.07 | Open | | | Conduct screen reader testing (NVDA or VoiceOver) on talk detail, experiment detail, cluster hub, and landing page — document findings |
| 08.08 | Open | | | Fix all critical and serious accessibility issues found in manual testing (keyboard and screen reader) |
| 08.09 | Open | | | Verify color contrast: all body text meets 4.5:1 ratio, all large text meets 3:1 ratio (WCAG AA) |
| 08.10 | Open | | | Make analytics decision: if Plausible, add conditional script injection to BaseLayout (controlled by `PLAUSIBLE_DOMAIN` env var per PDR 1.3); if no analytics, document the decision in About page |
| 08.11 | Open | | | Create `public/robots.txt` allowing all crawlers, pointing to sitemap |
| 08.12 | Open | | | Verify preview deployment workflow: create a test PR, confirm Cloudflare Pages generates a preview URL (US-026) |
| 08.13 | Open | | | Run full Lighthouse CI across all page templates — verify Performance ≥ 90, Accessibility ≥ 90 |
| 08.14 | Open | | | Run full axe-core scan across all page templates — verify zero critical/serious violations |
| 08.15 | Open | | | Stage all changes and commit: "Phase 08: SEO, structured data, accessibility remediation, analytics — First Full Feature Release" |

## Context

### Files to Create or Modify

- `src/lib/structured-data.ts` — Add JSON-LD helpers for CollectionPage, WebSite, WebPage (modify, from Phase 02)
- `src/layouts/BaseLayout.astro` — Add OG/Twitter meta tags, canonical URL, Plausible injection (modify)
- `src/pages/clusters/[id].astro` — Pass structuredData prop (modify)
- `src/pages/personas/[id].astro` — Pass structuredData prop (modify)
- `src/pages/index.astro` — Pass structuredData prop (modify)
- `src/pages/about.astro` — Pass structuredData prop (modify)
- `src/pages/resources.astro` — Pass structuredData prop (modify)
- `astro.config.mjs` — Add @astrojs/sitemap integration (modify)
- `public/_headers` — Cloudflare Pages CSP headers (new)
- `public/robots.txt` — Robots file with sitemap reference (new)
- `package.json` — Add @astrojs/sitemap dependency (modify)

### Key Patterns and Imports

**structured-data.ts additions:**
```typescript
// Cluster hub → CollectionPage
export function clusterJsonLd(cluster: ClusterData, items: ContentItem[], siteUrl: string): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: cluster.name,
    url: `${siteUrl}/clusters/${cluster.id}/`,
    hasPart: items.map(i => ({ '@type': 'CreativeWork', name: i.title, url: `${siteUrl}/${i.collection}/${i.slug}/` })),
  };
}

// Landing page → WebSite
export function websiteJsonLd(siteUrl: string): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'HAx — Human Advantage Experiments',
    url: siteUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: { '@type': 'EntryPoint', urlTemplate: `${siteUrl}/search/?q={search_term_string}` },
      'query-input': 'required name=search_term_string',
    },
  };
}

// About → WebPage
export function webPageJsonLd(title: string, description: string, url: string): object {
  return { '@context': 'https://schema.org', '@type': 'WebPage', name: title, description, url };
}
```

**OG meta tags in BaseLayout:**
```astro
<meta property="og:title" content={title} />
<meta property="og:description" content={description} />
<meta property="og:url" content={canonicalUrl || Astro.url.href} />
<meta property="og:type" content="website" />
{ogImage && <meta property="og:image" content={ogImage} />}
<meta name="twitter:card" content="summary" />
<meta name="twitter:title" content={title} />
<meta name="twitter:description" content={description} />
```

**Plausible conditional injection:**
```astro
{import.meta.env.PLAUSIBLE_DOMAIN && (
  <script
    defer
    data-domain={import.meta.env.PLAUSIBLE_DOMAIN}
    src={import.meta.env.PLAUSIBLE_SCRIPT_URL || 'https://plausible.io/js/script.js'}
  />
)}
```

**Canonical URL:**
```astro
<link rel="canonical" href={canonicalUrl || new URL(Astro.url.pathname, import.meta.env.SITE_URL || 'https://hax.example.com').href} />
```

**Sitemap config:**
```mjs
// astro.config.mjs
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: process.env.SITE_URL || 'https://hax.example.com',
  integrations: [sitemap()],
  // ...
});
```

**CSP _headers file:**
```
/*
  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; frame-src embed.ted.com; img-src 'self' data:; connect-src 'self'
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
```

**robots.txt:**
```
User-agent: *
Allow: /
Sitemap: https://hax.example.com/sitemap-index.xml
```

### Design Notes

- **JSON-LD coverage**: After this phase, every page type has structured data: Talk (CreativeWork, from Phase 02), Experiment (HowTo, from Phase 02), Cluster hub (CollectionPage), Persona (CollectionPage), Landing (WebSite with SearchAction), About (WebPage), Resources (CollectionPage). Breadcrumb (BreadcrumbList) was added in Phase 01.
- **OG meta tags**: BaseLayout needs `og:title`, `og:description`, `og:url`, and optionally `og:image`. These are populated from page props. Every page should pass title and description. Image is optional — use a default HAx OG image stored in `public/images/og-default.png` if no page-specific image is available.
- **CSP policy**: The CSP allows `'self'` for scripts and styles, plus `'unsafe-inline'` (needed for Astro's hydration scripts and inline onclick handlers like PrintButton). `frame-src embed.ted.com` allows TED embeds. If Plausible is enabled, add its domain to `script-src` and `connect-src`. The CSP is set via Cloudflare Pages `_headers` file.
- **Accessibility remediation (Tasks 08.06–08.09)**: These are manual testing tasks. Document findings in a temporary markdown file (e.g., `sdlc/docs/a11y-audit.md`). Fix all critical and serious issues. Common issues to check: focus visibility, heading hierarchy, form labels, color contrast, ARIA roles on interactive elements.
- **Analytics decision**: The PDR defers the analytics decision. If Plausible is chosen, the implementation is a conditional `<script>` tag in BaseLayout controlled by `PLAUSIBLE_DOMAIN` env var. If no analytics at MVP, document this in the About page.
- **Preview deployment (US-026)**: Verify that Cloudflare Pages generates a preview URL for every PR. This was configured in Phase 00 but hasn't been tested end-to-end with a real PR.
- **First Full Feature Release**: After Phase 08, all features from the URD are implemented. Phase 09 is content population and launch prep.

### Verification

- [ ] JSON-LD validates on all page types (use https://validator.schema.org/ or Google Rich Results Test)
- [ ] OG meta tags present in HTML `<head>` on all pages (`og:title`, `og:description`, `og:url`)
- [ ] `<link rel="canonical">` present on all pages with correct URL
- [ ] Sitemap generated at `/sitemap-index.xml` listing all content pages
- [ ] `public/_headers` file contains CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy
- [ ] `public/robots.txt` allows all crawlers and references sitemap
- [ ] Keyboard navigation: all interactive elements focusable, focus visible, logical tab order on all page templates
- [ ] Color contrast: body text ≥ 4.5:1, large text ≥ 3:1 (check with browser dev tools or axe-core)
- [ ] Plausible script injected only when `PLAUSIBLE_DOMAIN` is set; not present when unset
- [ ] Preview deployment: a test PR generates a unique Cloudflare Pages preview URL
- [ ] Lighthouse Performance ≥ 90 on landing page, talk detail, experiment detail
- [ ] Lighthouse Accessibility ≥ 90 on all page templates
- [ ] axe-core: zero critical/serious violations across all page templates
- [ ] `npm run build` succeeds

## Phase Summary

_To be filled after completion._

- **Changes:** TBD
- **Commit:** TBD
