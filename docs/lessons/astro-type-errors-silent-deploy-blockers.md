---
title: "Astro Type Errors as Silent Deploy Blockers"
date: 2026-05-22
project: hax
tags: [ci, astro, typescript, preact, deployment]
---

# Astro Type Errors as Silent Deploy Blockers

## The Lesson

A site can build and run perfectly in dev mode while harboring type errors that fail `astro check` in CI. If CI gates on type checking (and it should), these latent errors become deploy blockers that surface only after pushing -- never during local development.

## Context

HAx is an Astro 6.x static site using Preact for interactive islands (search, save, share buttons) and Zod for content schema validation. The CI pipeline runs `npx astro check` as a type-checking gate before the build step. The project was developed across 10 phases, with Preact islands and content schemas introduced in different phases by different tooling generations.

## What Happened

1. All 10 phases of development completed successfully with local builds passing (`npm run build` succeeded every time).
2. On push to main, the CI pipeline ran `npx astro check` and failed with multiple type errors that had never appeared during local development.
3. **Error 1: Deprecated import path.** `content.config.ts` imported `z` from `astro:content`, which was deprecated in Astro 6.x in favor of `astro:schema`. The build doesn't care -- Zod works either way at runtime -- but the type checker flags it.
4. **Error 2: Missing JSX pragma.** All four Preact island files (SaveButton, SaveManager, SearchWidget, ShareButton) were missing the `/** @jsxImportSource preact */` pragma. Astro's dev server infers the JSX runtime from the integration config, but the type checker requires the explicit pragma to resolve JSX types.
5. **Error 3: Type narrowing gaps.** Two pages used `.filter(Boolean)` to remove nulls from `getEntry()` results. TypeScript doesn't narrow the type through `Boolean` as a filter predicate -- it needs an explicit type guard like `.filter((e): e is NonNullable<typeof e> => Boolean(e))`.
6. A 7-file fix resolved all three categories: moved the import, added pragmas, and added type guards.

## Key Insights

- **`astro check` and `astro build` have different strictness levels.** The build uses esbuild for speed and skips full type checking. `astro check` uses the TypeScript compiler. Code that builds fine can still fail type checking. Running `astro check` locally before pushing would have caught all three errors.
- **Deprecated-but-functional imports are time bombs.** `import { z } from 'astro:content'` works at runtime but will eventually break. The type checker is the early warning system -- ignoring it means the breakage arrives as a surprise later.
- **JSX pragma requirements differ between dev and check.** Astro's dev server resolves the JSX factory from `astro.config.mjs` integrations. The type checker cannot -- it needs the pragma in each file. This is a common Preact-in-Astro gotcha because React doesn't need the pragma (it's the default).
- **`.filter(Boolean)` doesn't narrow types in TypeScript.** This is a well-known TypeScript limitation. The pattern works at runtime but leaves the array typed as `(T | undefined)[]`. Use a type predicate: `.filter((x): x is T => Boolean(x))`.
- **Run the same checks locally that CI runs.** If CI runs `astro check`, developers should run `astro check` before pushing. The 30-second local check would have prevented the failed deploy and the follow-up fix commit.

## Examples

**Deprecated import (builds, fails type check):**
```typescript
// Bad -- deprecated in Astro 6.x
import { defineCollection, z } from 'astro:content';

// Good -- canonical import path
import { defineCollection } from 'astro:content';
import { z } from 'astro:schema';
```

**Missing JSX pragma (works in dev, fails type check):**
```tsx
// Bad -- Preact island without pragma
import { useState } from 'preact/hooks';
export default function SaveButton() { /* ... */ }

// Good -- explicit pragma
/** @jsxImportSource preact */
import { useState } from 'preact/hooks';
export default function SaveButton() { /* ... */ }
```

**Type narrowing with Boolean filter:**
```typescript
// Bad -- TypeScript can't narrow through Boolean
const resolved = entries.filter(Boolean);
// Type: (Entry | undefined)[]

// Good -- explicit type predicate
const resolved = entries.filter((e): e is NonNullable<typeof e> => Boolean(e));
// Type: Entry[]
```

## Applicability

This applies to any project using Astro with TypeScript, and the JSX pragma issue is specific to Preact (not React) islands. The `.filter(Boolean)` narrowing issue applies to all TypeScript projects. The broader principle -- "run your CI checks locally" -- is universal.

## Related Lessons

- [GitHub Pages Base Path Pitfall](github-pages-base-path-pitfall.md) -- Another deploy failure from the same migration, caused by missing base path prefixes rather than type errors.
