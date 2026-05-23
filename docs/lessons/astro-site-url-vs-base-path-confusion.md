---
title: "Astro Site URL vs Base Path Confusion"
date: 2026-05-22
project: hax
tags: [astro, configuration, deployment, github-pages, routing]
---

# Astro Site URL vs Base Path Confusion

## The Lesson

Astro's `site` and `base` config fields look like they do the same thing but serve completely different purposes. Getting them wrong produces a site that deploys successfully but generates incorrect canonical URLs, broken sitemaps, or broken routing -- and the failure mode changes depending on whether you're using a subdirectory path or a custom domain.

## Context

HAx migrated from Cloudflare Pages to GitHub Pages. The initial deployment served the site at `bonjohen.github.io/hax/`. After fixing all internal links to use the `/hax/` base path (a 24-file change), the site was later moved to a custom domain (`hax.johnboen.com`), which serves at the root `/` rather than a subdirectory. This required a second configuration correction to the same `astro.config.mjs` that had just been fixed.

## What Happened

1. Phase 10 set `site` to a placeholder via env var: `process.env.SITE_URL || 'https://example.github.io/hax'`. No `base` was configured.
2. The first fix (commit `2a63499`) hardcoded `site: 'https://bonjohen.github.io'` and added `base: '/hax'`, and updated all 24 files with internal links to use `import.meta.env.BASE_URL`. This worked correctly for the GitHub Pages subdirectory deployment.
3. A custom domain (`hax.johnboen.com`) was then configured for the GitHub Pages site. With a custom domain, GitHub Pages serves at the root `/`, not at `/hax/`.
4. The second fix (commit `e948387`) was needed: remove `base: '/hax'` entirely and change `site` to `'https://hax.johnboen.com'`. The Playwright tests also had to be updated to remove `/hax/` from their `baseURL` and assertion paths.
5. The result was three commits touching `astro.config.mjs` in quick succession -- each one a different understanding of how `site` and `base` interact.

## Key Insights

- **`site` is the full origin (protocol + domain). `base` is the path prefix.** `site: 'https://bonjohen.github.io'` + `base: '/hax'` means the site lives at `https://bonjohen.github.io/hax/`. With a custom domain, `site: 'https://hax.johnboen.com'` with no `base` means the site lives at the root. Conflating these (e.g., putting the path in `site`) produces wrong canonical URLs and sitemap entries.
- **Custom domains eliminate the need for `base`.** GitHub Pages project sites serve at `/<repo>/` by default, but a custom domain moves the site to the root. If you configure a custom domain, remove `base` -- otherwise every `import.meta.env.BASE_URL` reference will prepend a path that doesn't exist.
- **Config-via-environment-variable defers the problem, it doesn't solve it.** The Phase 10 approach (`process.env.SITE_URL || 'https://example.github.io/hax'`) avoided committing a wrong URL but also meant the correct URL was never validated in CI. The placeholder default was wrong in every environment.
- **Test infrastructure must track the config.** Each `astro.config.mjs` change required a corresponding Playwright config change (`baseURL`) and test assertion updates. The tests are coupled to the routing config by design -- that's how they catch routing bugs -- but it means config changes have a blast radius beyond the config file.
- **Decide your domain strategy before your first deploy, not after.** The three-commit fix chain (deploy workflow -> base path fix -> custom domain fix) could have been one commit if the custom domain decision had been made before Phase 10 shipped.

## Examples

**GitHub Pages subdirectory (no custom domain):**
```javascript
// astro.config.mjs
export default defineConfig({
  site: 'https://bonjohen.github.io',
  base: '/hax',
});
// import.meta.env.BASE_URL === '/hax/'
```

**GitHub Pages with custom domain:**
```javascript
// astro.config.mjs
export default defineConfig({
  site: 'https://hax.johnboen.com',
  // No base -- custom domain serves at root
});
// import.meta.env.BASE_URL === '/'
```

**Wrong -- path baked into site:**
```javascript
// astro.config.mjs
export default defineConfig({
  site: 'https://bonjohen.github.io/hax',
  // Sitemap and canonical URLs will be wrong
});
```

## Applicability

This applies to any Astro project deployed to a platform that supports both subdirectory and custom-domain hosting (GitHub Pages, GitLab Pages, Netlify with base path). The `site` vs `base` distinction is Astro-specific, but the underlying problem -- confusing the origin with the path prefix -- exists in Next.js (`basePath`), Vite (`base`), and other frameworks.

Does NOT apply to platforms that always serve at the root (Vercel, Cloudflare Pages with custom domain) -- there, `base` is always `/` and the distinction is moot.

## Related Lessons

- [GitHub Pages Base Path Pitfall](github-pages-base-path-pitfall.md) -- The preceding fix that added `base: '/hax'` and updated all internal links, which this lesson's fix then partially reversed.
- [Astro Type Errors as Silent Deploy Blockers](astro-type-errors-silent-deploy-blockers.md) -- Another deploy failure from the same migration wave, caused by type errors rather than config.
