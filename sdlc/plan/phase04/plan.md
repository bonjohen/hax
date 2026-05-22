---
phase: 04
title: "Search Integration"
depends_on: "Phase 03"
goal: "Client-side search powered by Pagefind, accessible from any page, with result type chips and zero-results feedback."
source_pdr_sections: ["4.12", "1.2"]
source_user_stories: ["US-006", "US-008"]
status: "open"
---

# Phase 04: Search Integration

## Tasks

| No | Status | Started (PST) | Completed (PST) | Description |
|----|--------|---------------|------------------|-------------|
| 04.01 | Open | | | Install `pagefind` as a dev dependency; add a `postbuild` script to `package.json` that runs `pagefind --site dist` after `astro build` |
| 04.02 | Open | | | Add `data-pagefind-body` attributes to content areas on talk detail, experiment detail, and cluster hub pages; exclude nav, footer, sidebar from indexing |
| 04.03 | Open | | | Add `data-pagefind-meta` attributes to tag result types: `data-pagefind-meta="type:talk"` on talk pages, `data-pagefind-meta="type:experiment"` on experiment pages |
| 04.04 | Open | | | Create `src/islands/SearchWidget.tsx` — Pagefind UI wrapper, `client:idle` hydration, search input with `aria-label="Search experiments and talks"`, result list with type chips |
| 04.05 | Open | | | Implement zero-results state in SearchWidget: message with suggestions (browse by cluster, check spelling) per US-008 |
| 04.06 | Open | | | Create `src/pages/search.astro` wrapping SearchWidget in BaseLayout |
| 04.07 | Open | | | Add search link to Header nav (links to `/search/`) |
| 04.08 | Open | | | Document Pagefind index size for current content volume (number of files, total index size in KB) |
| 04.09 | Open | | | Create `tests/e2e/search.spec.ts` — Playwright tests: search "stress" returns results; search "meeting" returns results; search nonsense shows zero-results message; search input is keyboard-accessible |
| 04.10 | Open | | | Extend `tests/e2e/accessibility.spec.ts` to scan search page |
| 04.11 | Open | | | Verify: search works after build; Pagefind loads on first interaction, not on page load |
| 04.12 | Open | | | Stage all changes and commit: "Phase 04: Pagefind search integration with result types and zero-results feedback" |

## Context

### Files to Create or Modify

- `src/islands/SearchWidget.tsx` — Pagefind UI wrapper island (new)
- `src/pages/search.astro` — Search page wrapping the island (new)
- `src/pages/talks/[slug].astro` — Add `data-pagefind-body` and `data-pagefind-meta` (modify, from Phase 02)
- `src/pages/experiments/[slug].astro` — Add `data-pagefind-body` and `data-pagefind-meta` (modify, from Phase 02)
- `src/pages/clusters/[id].astro` — Add `data-pagefind-body` (modify, from Phase 03)
- `src/components/Header.astro` — Add search link to nav (modify, from Phase 01)
- `src/layouts/BaseLayout.astro` — Exclude `<header>`, `<footer>` from Pagefind with `data-pagefind-ignore` (modify)
- `package.json` — Add `pagefind` dependency, `postbuild` script (modify)
- `tests/e2e/search.spec.ts` — Search e2e tests (new)
- `tests/e2e/accessibility.spec.ts` — Add search page scan (modify)

### Key Patterns and Imports

**Pagefind setup in `package.json`:**
```json
{
  "scripts": {
    "build": "astro build",
    "postbuild": "pagefind --site dist"
  },
  "devDependencies": {
    "pagefind": "^1.0.0"
  }
}
```

**Pagefind indexing attributes:**
```html
<!-- On content pages (talks, experiments): -->
<article data-pagefind-body>
  <!-- Only this content is indexed -->
</article>

<!-- On content pages, tag the result type: -->
<body data-pagefind-meta="type:talk">
<!-- or -->
<body data-pagefind-meta="type:experiment">

<!-- Exclude from indexing (BaseLayout): -->
<header data-pagefind-ignore>...</header>
<footer data-pagefind-ignore>...</footer>
<aside data-pagefind-ignore>...</aside>
```

**SearchWidget.tsx** (PDR 4.12):
```tsx
// src/islands/SearchWidget.tsx
// Hydrated with client:idle on the search page
import { useEffect, useRef, useState } from 'react'; // or preact

export default function SearchWidget() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [pagefind, setPagefind] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Lazy-load Pagefind on first interaction
    async function loadPagefind() {
      const pf = await import('/pagefind/pagefind.js');
      await pf.init();
      setPagefind(pf);
    }
    // Load on focus or first keystroke, not on mount
  }, []);

  // Search handler: pagefind.search(query) → results
  // Each result has: { url, meta: { title, type }, excerpt }

  // Zero-results state:
  // "No results for '{query}'. Try browsing by cluster or checking your spelling."

  return (
    <div>
      <input
        type="search"
        aria-label="Search experiments and talks"
        value={query}
        onChange={e => setQuery(e.target.value)}
      />
      {/* Result list with type chips */}
      {/* Zero-results feedback */}
    </div>
  );
}
```

**Search page:**
```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import SearchWidget from '../islands/SearchWidget.tsx';
---
<BaseLayout title="Search" description="Search HAx experiments and talks">
  <h1>Search</h1>
  <SearchWidget client:idle />
</BaseLayout>
```

**Pagefind API usage:**
```typescript
// After loading Pagefind:
const search = await pagefind.search(query);
const results = await Promise.all(
  search.results.slice(0, 20).map(r => r.data())
);
// Each result: { url, meta: { title, type }, excerpt (HTML with <mark>) }
```

### Design Notes

- **Pagefind loads lazily**: The Pagefind JavaScript bundle (~30KB) and index files load on first user interaction (focus or keystroke on the search input), NOT on page load. This keeps the initial page load fast (NFR-001, NFR-002).
- **`data-pagefind-body` controls what gets indexed**: Only content areas marked with `data-pagefind-body` are indexed. Nav, footer, sidebar, and filter panels are excluded to keep search results relevant.
- **`data-pagefind-meta` tags result types**: Each page is tagged with its content type so search results can display a chip (Talk, Experiment) next to each result. This helps users distinguish results.
- **Zero-results feedback (US-008)**: When search returns no results, display a helpful message with suggestions: "Browse by cluster" (links to cluster hubs), "Check your spelling", "Try broader terms". Do NOT show an empty page or a bare "No results" message.
- **Astro island hydration**: SearchWidget uses `client:idle` — it hydrates after the page is idle, not immediately. This means the search input appears in the HTML but is non-functional until hydration. Consider a `<noscript>` fallback or placeholder text.
- **React vs Preact**: Astro supports both. Preact is smaller (~3KB vs ~40KB). If React is not already installed, prefer `@astrojs/preact` for islands. All islands in this project (SearchWidget, FilterController, SaveButton, SaveManager, ShareButton) should use the same framework.
- **Header search link**: Add a "Search" link to the nav that navigates to `/search/`. Do not embed a search input in the header — the full search experience is on the dedicated page.

### Verification

- [ ] `npm run build` succeeds AND `postbuild` runs `pagefind --site dist` automatically
- [ ] Pagefind index files exist in `dist/pagefind/` after build
- [ ] Search page renders at `/search/` with a search input
- [ ] Searching "stress" returns at least one result (from the McGonigal talk/experiment content)
- [ ] Search results display result type (Talk or Experiment) as a chip/badge
- [ ] Searching nonsense (e.g., "xyzzy123") shows zero-results message with cluster browse suggestions
- [ ] Search input has `aria-label="Search experiments and talks"`
- [ ] Search input is keyboard-accessible (focusable, typeable, results navigable)
- [ ] Pagefind JS loads on first interaction, not on page load (check network tab)
- [ ] Header nav includes a "Search" link pointing to `/search/`
- [ ] `npx playwright test tests/e2e/search.spec.ts` passes
- [ ] `npx playwright test tests/e2e/accessibility.spec.ts` passes (including search page)
- [ ] Document: Pagefind index size (files, KB) for current content volume

## Phase Summary

_To be filled after completion._

- **Changes:** TBD
- **Commit:** TBD
