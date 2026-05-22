---
phase: 01
title: "Base Layout and Navigation"
depends_on: "Phase 00"
goal: "Responsive page shell with header, footer, skip links, breadcrumbs, and accessibility CI. All subsequent pages use this layout."
source_pdr_sections: ["4.1", "4.3", "4.4", "4.5"]
source_user_stories: ["US-018", "US-019"]
status: "open"
---

# Phase 01: Base Layout and Navigation

## Tasks

| No | Status | Started (PST) | Completed (PST) | Description |
|----|--------|---------------|------------------|-------------|
| 01.01 | Open | | | Create `src/styles/global.css` with design tokens (colors, typography scale, spacing, breakpoints at 640px/1024px) |
| 01.02 | Open | | | Create `src/layouts/BaseLayout.astro` with HTML `<head>` (meta, OG placeholders, canonical URL slot), skip link, header slot, `<main>`, footer slot, print stylesheet link |
| 01.03 | Open | | | Create `src/components/Header.astro` with site title, nav links (Clusters, Personas, Search, About, Saved), `aria-current="page"` on active link |
| 01.04 | Open | | | Implement responsive mobile navigation in Header (hamburger menu with `<details>/<summary>` or button toggle with ARIA) |
| 01.05 | Open | | | Create `src/components/Footer.astro` with nav links (About, Resources), copyright notice, TED attribution statement, non-commercial notice |
| 01.06 | Open | | | Create `src/components/Breadcrumb.astro` with ordered list, `aria-label="Breadcrumb"`, current page not linked |
| 01.07 | Open | | | Create `src/styles/print.css` with `@media print` rules hiding nav, footer, and interactive elements |
| 01.08 | Open | | | Update `src/pages/index.astro` to use BaseLayout with Header and Footer (placeholder content) |
| 01.09 | Open | | | Install Playwright and @axe-core/playwright as dev dependencies |
| 01.10 | Open | | | Create `tests/e2e/accessibility.spec.ts` — Playwright test that loads index page, runs axe-core scan, asserts zero critical/serious violations |
| 01.11 | Open | | | Add Playwright and Lighthouse CI steps to GitHub Actions CI pipeline |
| 01.12 | Open | | | Verify: skip link is first focusable element, moves focus to `<main>`; breadcrumb renders "Home"; Lighthouse accessibility ≥ 90; print preview hides nav/footer |
| 01.13 | Open | | | Remove test-embed page from Phase 00 (no longer needed after TED validation) |
| 01.14 | Open | | | Stage all changes and commit: "Phase 01: Base layout with responsive navigation, skip links, and accessibility CI" |

## Context

### Files to Create or Modify

- `src/styles/global.css` — Design tokens and global styles (new)
- `src/styles/print.css` — Print-specific styles (new)
- `src/layouts/BaseLayout.astro` — Root layout component (new)
- `src/components/Header.astro` — Site header with nav (new)
- `src/components/Footer.astro` — Site footer (new)
- `src/components/Breadcrumb.astro` — Breadcrumb navigation (new)
- `src/pages/index.astro` — Update to use BaseLayout (modify, created in Phase 00)
- `src/pages/test-embed.astro` — Delete (created in Phase 00, no longer needed)
- `tests/e2e/accessibility.spec.ts` — Accessibility test (new)
- `.github/workflows/ci.yml` — Add Playwright and Lighthouse CI steps (modify, created in Phase 00)
- `package.json` — Add Playwright and axe-core dev dependencies (modify)
- `playwright.config.ts` — Playwright configuration (new)

### Key Patterns and Imports

**BaseLayout.astro** (PDR 4.1):
```astro
---
interface Props {
  title: string;
  description: string;
  canonicalUrl?: string;
  ogImage?: string;
  structuredData?: object;
  noIndex?: boolean;
}
const { title, description, canonicalUrl, ogImage, structuredData, noIndex } = Astro.props;
---
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>{title} | HAx</title>
  <meta name="description" content={description} />
  {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
  {ogImage && <meta property="og:image" content={ogImage} />}
  {structuredData && (
    <script type="application/ld+json" set:html={JSON.stringify(structuredData)} />
  )}
  <link rel="stylesheet" href="/styles/global.css" />
  <link rel="stylesheet" href="/styles/print.css" media="print" />
</head>
<body>
  <a href="#main-content" class="skip-link">Skip to main content</a>
  <Header currentPath={Astro.url.pathname} />
  <main id="main-content">
    <slot />
  </main>
  <Footer />
</body>
</html>
```

**Header.astro** (PDR 4.3):
```astro
---
interface Props {
  currentPath: string;
}
---
```
Nav links: Clusters (dropdown with body/cognition/environment/social), Personas, Search, About, Saved. Active link gets `aria-current="page"`. Mobile: `<details>/<summary>` or button toggle with `aria-expanded`.

**Footer.astro** (PDR 4.4):
Nav links (About, Resources), copyright notice, TED attribution: "HAx is not affiliated with TED", non-commercial notice.

**Breadcrumb.astro** (PDR 4.5):
```astro
---
interface Props {
  items: Array<{ label: string; href: string }>;
}
---
```
Renders `<nav aria-label="Breadcrumb"><ol>...</ol></nav>`. Last item is current page (not a link). Emits `BreadcrumbList` JSON-LD.

**Accessibility test pattern:**
```typescript
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('index page has no critical accessibility violations', async ({ page }) => {
  await page.goto('/');
  const results = await new AxeBuilder({ page }).analyze();
  const serious = results.violations.filter(v =>
    v.impact === 'critical' || v.impact === 'serious'
  );
  expect(serious).toEqual([]);
});
```

### Design Notes

- **Skip link**: Must be the first focusable element in the DOM. Visually hidden by default, visible on focus. Targets `#main-content` on the `<main>` element. This is the primary keyboard navigation aid (US-018).
- **Mobile nav**: Use `<details>/<summary>` for the hamburger menu — it works without JavaScript. If a button toggle is used instead, it must have `aria-expanded` and manage focus correctly.
- **Breadcrumb JSON-LD**: The Breadcrumb component generates `BreadcrumbList` structured data alongside the visual breadcrumb. This satisfies NFR-012.
- **Design tokens**: Define CSS custom properties for colors, typography (font stack, scale), spacing (4px base), and breakpoints (640px tablet, 1024px desktop). These tokens are referenced by all subsequent components.
- **Print stylesheet**: Loaded with `media="print"` so it doesn't affect screen rendering. Hides `.no-print`, `nav`, `footer`, and interactive elements. This is the foundation for US-012 (print experiment cards) in Phase 06.
- **Lighthouse CI**: Add `@lhci/cli` to CI pipeline. Run against the built site on at least the index page. Accessibility score target: ≥ 90. Performance baseline established here, enforced in Phase 08.

### Verification

- [ ] Skip link is the first focusable element when tabbing from page load
- [ ] Skip link moves focus to `<main id="main-content">` when activated
- [ ] `aria-current="page"` is set on the nav link matching the current path
- [ ] Mobile hamburger menu opens/closes and is keyboard-accessible
- [ ] Breadcrumb renders "Home" on the index page
- [ ] Footer displays TED attribution and non-commercial notice
- [ ] `@media print` hides nav, footer, and interactive elements (verify in browser print preview)
- [ ] `npx playwright test tests/e2e/accessibility.spec.ts` passes with zero critical/serious violations
- [ ] Lighthouse accessibility score ≥ 90 on index page
- [ ] `npm run build` still succeeds

## Phase Summary

_To be filled after completion._

- **Changes:** TBD
- **Commit:** TBD
