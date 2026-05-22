---
phase: 06
title: "Interactive Features"
depends_on: "Phase 03, Phase 04"
goal: "Save, print, share, and filter functionality. Full client-side interaction model from URD."
source_pdr_sections: ["4.13", "4.14", "4.15", "4.16", "4.17", "2.5"]
source_user_stories: ["US-007", "US-009", "US-010", "US-011", "US-012", "US-013", "US-020"]
status: "open"
---

# Phase 06: Interactive Features

## Tasks

| No | Status | Started (PST) | Completed (PST) | Description |
|----|--------|---------------|------------------|-------------|
| 06.01 | Open | | | Create `src/lib/saved.ts` — localStorage utilities: `getSaved()`, `saveExperiment(id)`, `removeExperiment(id)`, `clearAll()`, `isSaved(id)`. Store format: `{ version: 1, items: [{ experimentId, savedAt }] }` per PDR 2.5 |
| 06.02 | Open | | | Create `tests/unit/saved.test.ts` — Vitest tests for saved.ts: save, remove, clearAll, isSaved, version field, graceful handling of missing/corrupt localStorage |
| 06.03 | Open | | | Create `src/islands/SaveButton.tsx` — toggle saved state, filled/outline icon, localStorage unavailable tooltip, localStorage full error per PDR 4.14. Hydrate `client:idle`. |
| 06.04 | Open | | | Create `src/islands/SaveManager.tsx` — list saved experiments with remove-single and clear-all actions, empty state with browse link, localStorage unavailable message per PDR 4.15. Hydrate `client:idle`. |
| 06.05 | Open | | | Create `src/pages/saved.astro` wrapping SaveManager in BaseLayout |
| 06.06 | Open | | | Add SaveButton to experiment detail page (`src/pages/experiments/[slug].astro`) |
| 06.07 | Open | | | Create `src/islands/ShareButton.tsx` — copy `window.location.href` to clipboard, confirmation indicator for 2 seconds, Clipboard API fallback per PDR 4.16. Hydrate `client:idle`. |
| 06.08 | Open | | | Add ShareButton to experiment detail and talk detail pages |
| 06.09 | Open | | | Create `src/components/PrintButton.astro` — `<button>` with `onclick="window.print()"`, hidden in print via `.no-print` class per PDR 4.17 |
| 06.10 | Open | | | Add PrintButton to experiment detail page |
| 06.11 | Open | | | Enhance `src/styles/print.css` — experiment detail print layout: single column, hide nav/footer/interactive elements, show evidence notes expanded, US Letter and A4 safe margins |
| 06.12 | Open | | | Create `src/islands/FilterController.tsx` — read URL query params on mount, sync with FilterPanel checkboxes, show/hide cards by `data-*` attributes, update URL via `history.replaceState` per PDR 4.13. Hydrate `client:idle`. |
| 06.13 | Open | | | Wire FilterController into cluster hub pages alongside FilterPanel |
| 06.14 | Open | | | Create `tests/e2e/save.spec.ts` — Playwright tests: save an experiment, navigate away, return to /saved/ and see it listed; remove it; clear all; verify persistence across page loads |
| 06.15 | Open | | | Create `tests/e2e/print.spec.ts` — Playwright test: emulate print media on experiment page, verify nav/footer hidden, evidence notes visible |
| 06.16 | Open | | | Add filter interaction tests to `tests/e2e/navigation.spec.ts` — select a filter on cluster hub, verify cards are filtered; verify URL query params update |
| 06.17 | Open | | | Verify graceful degradation: with JS disabled, save/filter/share elements are hidden or show fallback messages; content remains readable (US-020) |
| 06.18 | Open | | | Extend `tests/e2e/accessibility.spec.ts` to scan /saved/ page |
| 06.19 | Open | | | Stage all changes and commit: "Phase 06: Save, print, share, and filter interactions" |

## Context

### Files to Create or Modify

- `src/lib/saved.ts` — localStorage save/load/remove utilities (new)
- `src/islands/SaveButton.tsx` — Save toggle island (new)
- `src/islands/SaveManager.tsx` — Saved list manager island (new)
- `src/islands/ShareButton.tsx` — Clipboard share island (new)
- `src/islands/FilterController.tsx` — Filter state manager island (new)
- `src/components/PrintButton.astro` — Print trigger button (new)
- `src/pages/saved.astro` — Saved experiments page (new)
- `src/pages/experiments/[slug].astro` — Add SaveButton, ShareButton, PrintButton (modify, from Phase 02)
- `src/pages/talks/[slug].astro` — Add ShareButton (modify, from Phase 02)
- `src/pages/clusters/[id].astro` — Wire FilterController (modify, from Phase 03)
- `src/styles/print.css` — Enhanced print layout for experiment detail (modify, from Phase 01)
- `tests/unit/saved.test.ts` — Vitest unit tests for saved.ts (new)
- `tests/e2e/save.spec.ts` — Save feature e2e tests (new)
- `tests/e2e/print.spec.ts` — Print layout e2e tests (new)
- `tests/e2e/navigation.spec.ts` — Add filter interaction tests (modify)
- `tests/e2e/accessibility.spec.ts` — Add /saved/ page scan (modify)

### Data Model

**localStorage schema** (PDR 2.5):
```typescript
// Key: 'hax-saved'
interface SavedExperimentsStore {
  version: 1;
  items: Array<{
    experimentId: string;  // matches Experiment collection slug
    savedAt: string;       // ISO 8601 datetime
  }>;
}
```

### Key Patterns and Imports

**saved.ts** (PDR 2.5):
```typescript
// src/lib/saved.ts
const STORAGE_KEY = 'hax-saved';

interface SavedItem {
  experimentId: string;
  savedAt: string;
}

interface SavedStore {
  version: 1;
  items: SavedItem[];
}

export function getSaved(): SavedItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const store: SavedStore = JSON.parse(raw);
    if (store.version !== 1) return [];
    return store.items;
  } catch {
    return [];
  }
}

export function saveExperiment(id: string): void {
  const items = getSaved().filter(i => i.experimentId !== id);
  items.push({ experimentId: id, savedAt: new Date().toISOString() });
  const store: SavedStore = { version: 1, items };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

export function removeExperiment(id: string): void {
  const items = getSaved().filter(i => i.experimentId !== id);
  const store: SavedStore = { version: 1, items };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

export function clearAll(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function isSaved(id: string): boolean {
  return getSaved().some(i => i.experimentId === id);
}

export function isLocalStorageAvailable(): boolean {
  try {
    const test = '__hax_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}
```

**SaveButton.tsx** (PDR 4.14):
```tsx
interface Props {
  experimentId: string;
  experimentTitle: string;
}
// On mount: check isSaved(experimentId) → filled/outline icon
// On click: toggle saveExperiment/removeExperiment
// If !isLocalStorageAvailable(): disabled button with tooltip
// If localStorage full (QuotaExceededError): error toast
```

**SaveManager.tsx** (PDR 4.15):
```tsx
// On mount: getSaved() → list of { experimentId, savedAt }
// Render each as a card with experiment title (need to pass titles somehow) and Remove button
// Clear All button → clearAll()
// Empty state: "No saved experiments. Browse clusters to find experiments."
// localStorage unavailable: "Saving is not available in this browser."
```

**ShareButton.tsx** (PDR 4.16):
```tsx
// On click: navigator.clipboard.writeText(window.location.href)
// Show "Copied!" confirmation for 2 seconds
// Fallback: if Clipboard API unavailable, show a text input with the URL pre-selected
```

**FilterController.tsx** (PDR 4.13):
```tsx
// On mount:
// 1. Read URL query params (e.g., ?behavior=posture&evidence=high)
// 2. Check corresponding FilterPanel checkboxes
// 3. Apply initial filter state to cards

// On filter change:
// 1. Read all checked FilterPanel checkboxes
// 2. For each card, check data-* attributes against active filters
// 3. Hide cards that don't match (display: none)
// 4. Update URL query params via history.replaceState
// 5. Show count of visible results

// Filter logic: within a dimension (e.g., behavior), OR. Across dimensions, AND.
// Example: behavior=posture OR behavior=breathing AND evidence=high
```

**PrintButton.astro** (PDR 4.17):
```astro
<button class="no-print" onclick="window.print()" aria-label="Print this experiment">
  Print
</button>
```

**Print CSS for experiment detail:**
```css
@media print {
  .no-print, nav, footer, .sidebar, .save-button, .share-button, .filter-panel { display: none; }
  .content-layout { display: block; } /* Single column */
  details[open] { display: block; } /* Evidence notes expanded */
  details:not([open]) > summary::after { content: ' (expand to see)'; }
  body { font-size: 12pt; margin: 0.75in; }
  a[href]::after { content: ' (' attr(href) ')'; font-size: 0.8em; color: #666; }
}
```

### Design Notes

- **SaveManager needs experiment titles**: The SaveManager island only has experiment IDs from localStorage. It needs titles to display meaningful cards. Options: (1) store title alongside ID in localStorage, (2) pass all experiment titles as a prop to SaveManager from the Astro page, (3) fetch from a static JSON endpoint. Option (2) is simplest — the saved.astro page queries all experiments and passes `{id, title, slug}[]` as a prop.
- **Graceful degradation (US-020)**: All islands use `client:idle`, so with JS disabled, the island content doesn't render. Use `<noscript>` tags to show fallback messages: "Save functionality requires JavaScript", "Filtering requires JavaScript", etc. The core content (talks, experiments, cluster hubs) remains fully readable without JS.
- **Filter logic**: Filters use OR within a dimension, AND across dimensions. Example: if "posture" AND "breathing" are checked under behavior, show cards matching either. If "high" is also checked under evidence, show only cards matching (posture OR breathing) AND high evidence.
- **URL query params for filters (US-009)**: FilterController encodes active filters as URL query params. Example: `/clusters/body/?behavior=posture,breathing&evidence=high`. On page load, FilterController reads these params and applies the filter state. This makes filtered views shareable.
- **Print layout**: The experiment detail print layout should be a clean, single-column card with title, claim, instructions, evidence level, evidence notes (expanded), and source attribution. No navigation, no interactive elements, no sidebar. Safe margins for both US Letter and A4. Implemented via `@media print` rules.
- **Vitest for unit tests**: `saved.ts` is pure logic with no DOM dependency (except localStorage). Use Vitest with `jsdom` environment for the localStorage mock.

### Verification

- [ ] `npx vitest run tests/unit/saved.test.ts` passes — save, remove, clearAll, isSaved, version, corrupt data handling
- [ ] SaveButton on experiment detail toggles between filled/outline state
- [ ] Saving an experiment, navigating away, and returning to `/saved/` shows the experiment listed
- [ ] Removing a single saved experiment updates the list
- [ ] "Clear all" removes all saved experiments
- [ ] Empty saved state shows browse suggestion
- [ ] ShareButton copies URL to clipboard with "Copied!" confirmation
- [ ] PrintButton triggers browser print dialog
- [ ] Print preview of experiment detail: single column, no nav/footer, evidence notes visible, readable text
- [ ] FilterController on cluster hub: checking a behavior filter hides non-matching cards
- [ ] Filter state is encoded in URL query params; pasting the URL reproduces the filter state
- [ ] With JS disabled: save/filter/share show fallback messages; content is still readable
- [ ] `npx playwright test tests/e2e/save.spec.ts` passes
- [ ] `npx playwright test tests/e2e/print.spec.ts` passes
- [ ] `npx playwright test tests/e2e/accessibility.spec.ts` passes (including /saved/ page)
- [ ] `npm run build` succeeds

## Phase Summary

_To be filled after completion._

- **Changes:** TBD
- **Commit:** TBD
