# 006 — Consolidate hand-typed easing curves into lib/portfolioMotion.ts tokens

- **Status**: TODO
- **Commit**: e40b7ad
- **Severity**: MEDIUM
- **Category**: Cohesion & tokens
- **Estimated scope**: 5 files (`lib/portfolioMotion.ts`, `components/home/BlogPostsCarousel3D.tsx`, `components/Hero.tsx`, `components/portfolio/CareerTimeline.tsx`, `components/portfolio/ProjectModal.tsx`)

## Problem

`lib/portfolioMotion.ts` already exports shared Framer Motion presets built on the curve `[0.22, 1, 0.36, 1]`:

```ts
/* lib/portfolioMotion.ts:1-52 — current, full file */
/** Shared Framer Motion presets for /portfolio scroll reveals. */

export const portfolioViewport = {
  once: true,
  amount: 0.12,
  margin: '-30px 0px -50px 0px',
} as const

/** Section container: slides up as a block */
export const sectionReveal = {
  hidden: { opacity: 0, y: 60 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
  },
} as const

/**
 * Masked text reveal — parent must have overflow:hidden.
 * Text slides up from below the clip boundary.
 */
export const maskReveal = {
  hidden: { y: '110%' },
  visible: {
    y: '0%',
    transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] },
  },
} as const

/** Full-width horizontal rule: draws left → right */
export const lineReveal = {
  hidden: { scaleX: 0 },
  visible: {
    scaleX: 1,
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
  },
} as const

/** Fade + slide up for body text / cards */
export const staggerContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1, delayChildren: 0.05 },
  },
} as const

export const staggerItem = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] },
  },
} as const
```

Four other files hand-type the identical `[0.22, 1, 0.36, 1]` (or its CSS `cubic-bezier(0.22, 1, 0.36, 1)` equivalent) curve instead of importing it:

```tsx
/* components/home/BlogPostsCarousel3D.tsx:227-231 — current */
transition: draggingUi
  ? 'none'
  : 'transform 0.55s cubic-bezier(0.22, 1, 0.36, 1)',
```

```tsx
/* components/home/BlogPostsCarousel3D.tsx:243 — current */
transition: 'opacity 0.45s cubic-bezier(0.22, 1, 0.36, 1)',
```

```tsx
/* components/Hero.tsx:132 — current */
transition={{ duration: 1, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
```

```tsx
/* components/portfolio/CareerTimeline.tsx:130 — current */
transition={{ duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
```

```tsx
/* components/portfolio/ProjectModal.tsx:57 — current */
transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
```

AUDIT.md §7 (Cohesion & tokens): "Curves and durations should live as shared tokens. Five hand-typed cubic-beziers that almost match is a consolidation finding."

## Target

Export the raw curve as a named constant from `lib/portfolioMotion.ts` in both array form (for Framer Motion's `ease` prop) and CSS string form (for hand-written `cubic-bezier(...)` strings), and have all four consumer files import and use it instead of retyping the four numbers.

```ts
/* target — lib/portfolioMotion.ts, add near the top, before the existing exports */
/** The repo's shared ease-out curve — cite this, never retype the four numbers. */
export const EASE_OUT = [0.22, 1, 0.36, 1] as const
export const EASE_OUT_CSS = 'cubic-bezier(0.22, 1, 0.36, 1)'
```

Then update every existing use of the literal array inside `lib/portfolioMotion.ts` itself (`sectionReveal`, `maskReveal`, `lineReveal`, `staggerItem`) to reference `EASE_OUT` instead of the inline array, so there's exactly one source of truth.

```tsx
/* target — components/home/BlogPostsCarousel3D.tsx */
import { EASE_OUT_CSS } from '@/lib/portfolioMotion'
// ...
transition: draggingUi ? 'none' : `transform ${settleMs}ms ${EASE_OUT_CSS}`, // settleMs from plan 003 if already applied; otherwise the literal '0.55s'
// ...
transition: `opacity 0.45s ${EASE_OUT_CSS}`,
```

```tsx
/* target — components/Hero.tsx */
import { EASE_OUT } from '@/lib/portfolioMotion'
// ...
transition={{ duration: 1, delay: 0.4, ease: EASE_OUT }}
```

```tsx
/* target — components/portfolio/CareerTimeline.tsx */
transition={{ duration: 0.6, delay: i * 0.1, ease: EASE_OUT }}
```

```tsx
/* target — components/portfolio/ProjectModal.tsx */
transition={{ duration: 0.25, ease: EASE_OUT }}
```

## Repo conventions to follow

- `components/Hero.tsx` and `components/portfolio/CareerTimeline.tsx` already import other names from `@/lib/portfolioMotion` (`maskReveal`, `staggerContainer`, `staggerItem`, `lineReveal`, `sectionReveal`, `portfolioViewport` — check each file's existing import line and extend it, don't add a second import statement from the same module).
- `components/portfolio/ProjectModal.tsx` and `components/home/BlogPostsCarousel3D.tsx` currently do NOT import from `lib/portfolioMotion.ts` at all — add a new import line to each.

## Steps

1. In `lib/portfolioMotion.ts`, add the `EASE_OUT`/`EASE_OUT_CSS` constants near the top (right after the file's doc comment, before `portfolioViewport`).
2. Replace the four inline `[0.22, 1, 0.36, 1]` arrays inside `sectionReveal`, `maskReveal`, `lineReveal`, and `staggerItem` (in that same file) with `EASE_OUT`.
3. In `components/home/BlogPostsCarousel3D.tsx`, add `import { EASE_OUT_CSS } from '@/lib/portfolioMotion'`, then replace both hand-typed `cubic-bezier(0.22, 1, 0.36, 1)` strings (the drag-settle transition and the card-opacity transition) with `${EASE_OUT_CSS}` inside their template literals.
4. In `components/Hero.tsx`, extend the existing `@/lib/portfolioMotion` import to include `EASE_OUT`, then replace the hero-visual entrance's `ease: [0.22, 1, 0.36, 1]` with `ease: EASE_OUT`.
5. In `components/portfolio/CareerTimeline.tsx`, extend its existing `@/lib/portfolioMotion` import to include `EASE_OUT`, then replace the timeline-item `ease: [0.22, 1, 0.36, 1]` with `ease: EASE_OUT`.
6. In `components/portfolio/ProjectModal.tsx`, add `import { EASE_OUT } from '@/lib/portfolioMotion'`, then replace the modal entrance's `ease: [0.22, 1, 0.36, 1]` with `ease: EASE_OUT`.

## Boundaries

- Do NOT change any duration value in any of these five files — only the easing curve reference changes.
- Do NOT touch `components/portfolio/Testimonials.tsx`'s un-eased `transition={{ duration: 0.4 }}` in this plan — that's a separate finding (missing easing entirely, not a duplicate-token case) and isn't in scope here.
- Do NOT change `ProjectModal.tsx`'s `initial`/`animate`/`exit` scale/opacity/y values — only its `transition.ease`.
- If any of the five current files don't match the excerpts above (drift since commit `e40b7ad`), STOP and report instead of improvising.

## Verification

- **Mechanical**: `cd client && npx tsc --noEmit` and `npm run build` both succeed.
- **Feel check**:
  - Visually compare the Hero entrance, CareerTimeline item reveals, ProjectModal open animation, and the carousel's drag-settle/card-opacity transitions before and after this change — none should look any different (the numeric curve is identical, only its source moved).
  - Grep the repo for `0.22, 1, 0.36, 1` and `cubic-bezier(0.22, 1, 0.36, 1)` after this plan is applied — the only remaining occurrence should be the two `EASE_OUT`/`EASE_OUT_CSS` constant definitions inside `lib/portfolioMotion.ts` itself.
- **Done when**: `grep -rn "0.22, 1, 0.36, 1" client/components client/lib` returns matches only inside `lib/portfolioMotion.ts`, and every visual animation is pixel-identical to before.
