# 009 — Animate the ExplorationBadge progress ring instead of teleporting

- **Status**: TODO
- **Commit**: e40b7ad
- **Severity**: LOW
- **Category**: Missed opportunities
- **Estimated scope**: 1 file (`components/ExplorationBadge.tsx`), 1 SVG element

## Problem

`components/ExplorationBadge.tsx`'s progress ring updates its fill instantly whenever `pct` changes (a new landmark gets visited), while the fallback linear bar just below it in the same file already animates:

```tsx
/* components/ExplorationBadge.tsx:87-100 — current, the ring (no transition) */
<svg width="30" height="30" viewBox="0 0 34 34">
  <circle cx="17" cy="17" r={r} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="3" />
  <circle
    cx="17"
    cy="17"
    r={r}
    fill="none"
    stroke={pct === 100 ? '#eda100' : '#2a78d6'}
    strokeWidth="3"
    strokeDasharray={circumference}
    strokeDashoffset={circumference - (pct / 100) * circumference}
    strokeLinecap="round"
    transform="rotate(-90 17 17)"
  />
```

```tsx
/* components/ExplorationBadge.tsx:118 — current, the fallback bar (already has a transition) */
<div
  className="h-full rounded-full transition-all"
  style={{ width: `${pct}%`, backgroundColor: pct === 100 ? '#eda100' : '#2a78d6' }}
/>
```

AUDIT.md §8 (Missed opportunities): "State changes that teleport (content swaps, layout jumps) where a brief transition would prevent a jarring change." Every time the visitor reaches a new landmark, the ring's fill jumps straight to the new percentage with no visual feedback that anything just changed — exactly the kind of small, cheap, high-value animation this category calls out.

## Target

Add a CSS transition on `stroke-dashoffset` (and `stroke`, since the color also swaps to amber at 100%) directly to the animated `<circle>`.

```tsx
/* target — components/ExplorationBadge.tsx */
<circle
  cx="17"
  cy="17"
  r={r}
  fill="none"
  stroke={pct === 100 ? '#eda100' : '#2a78d6'}
  strokeWidth="3"
  strokeDasharray={circumference}
  strokeDashoffset={circumference - (pct / 100) * circumference}
  strokeLinecap="round"
  transform="rotate(-90 17 17)"
  style={{ transition: 'stroke-dashoffset 0.4s ease-out, stroke 0.4s ease-out' }}
/>
```

400ms sits within AUDIT.md's "Modals, drawers: 200-500ms" band, which is the closest budget category to a discrete, occasional state change like this (landmark visits happen at most a handful of times per session, not continuously) — using `ease-out` per the decision rule "Entering or exiting → ease-out (starts fast, feels responsive)," since each fill increment is effectively a small "entrance" of newly-filled arc.

## Repo conventions to follow

- `transition-all` (Tailwind) is already the pattern used one element below in this same file for the fallback bar — but AUDIT.md explicitly flags `transition: all` as "always a finding" (it animates unintended properties). Do NOT copy that pattern onto the circle; use the explicit two-property `transition` shown above instead. (Optionally, note as a follow-up that the fallback bar's `transition-all` could also be tightened to `transition-[width,background-color]` — but that's not part of this plan; don't change the bar.)
- `pct === 100 ? '#eda100' : '#2a78d6'` — these are the same two hex values already used for the fallback bar's `backgroundColor`; keep using the literal hex values (this file doesn't currently import from a shared color token module, so don't introduce one here).

## Steps

1. In `components/ExplorationBadge.tsx`, find the second `<circle>` element (the one with `stroke={pct === 100 ? '#eda100' : '#2a78d6'}` and `strokeDashoffset={...}`).
2. Add a `style={{ transition: 'stroke-dashoffset 0.4s ease-out, stroke 0.4s ease-out' }}` prop to it.
3. Leave the first `<circle>` (the static background track, `stroke="rgba(255,255,255,0.15)"`) untouched — it never changes, so it needs no transition.

## Boundaries

- Do NOT touch the fallback linear bar or its existing `transition-all` class.
- Do NOT change `circumference`, `r`, or any other numeric/geometry value.
- Do NOT add a spring or Framer Motion for this — a plain CSS transition on an SVG attribute is sufficient and matches this file's existing plain-React style (no `framer-motion` import anywhere in this component currently; don't add one just for this).
- If the current file doesn't match the excerpt above (drift since commit `e40b7ad`), STOP and report instead of improvising.

## Verification

- **Mechanical**: `cd client && npx tsc --noEmit` and `npm run build` both succeed.
- **Feel check**:
  - Clear `localStorage`'s `portfolio_explored` key (or open in a fresh private window), load the home page, then navigate to `/posts`: confirm the ring's fill animates smoothly from its previous position to the new percentage instead of jumping instantly.
  - Reach 100% (visit all 11 landmarks) and confirm the ring's color transitions smoothly from blue to amber rather than snapping.
  - In DevTools Animations panel, set playback to 10% and scrub through one fill change — confirm no visual jump mid-transition.
- **Done when**: every percentage change on the ring animates over ~400ms instead of teleporting, matching the fallback bar's existing behavior.
