# 005 — Replace Framer Motion x/y shorthand props with full transform strings

- **Status**: TODO
- **Commit**: e40b7ad
- **Severity**: MEDIUM
- **Category**: Performance
- **Estimated scope**: 2 files (`components/Projects.tsx`, `components/Hero.tsx`), 3 call sites

## Problem

AUDIT.md §5 (Performance): "Framer Motion `x`/`y`/`scale` shorthands are not hardware-accelerated — they run on the main thread and drop frames under load. Target: the full transform string, `animate={{ transform: "translateX(100px)" }}`."

Three scroll-linked motion values in this codebase are bound via the shorthand `style={{ x }}` / `style={{ y }}` props instead of a full transform string:

```tsx
/* components/Projects.tsx:679-682 — current */
<motion.div
  ref={trackRef}
  style={{ x }}
  className="flex w-max gap-5 md:gap-6 px-4 md:px-6"
>
```

```tsx
/* components/Hero.tsx:128-133 — current */
<motion.div
  style={{ y: heroParallaxY }}
  initial={{ opacity: 0, scale: 0.95 }}
  animate={{ opacity: 1, scale: 1 }}
  transition={{ duration: 1, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
  className="hidden lg:flex items-center justify-center"
  aria-hidden="true"
>
```

```tsx
/* components/Hero.tsx:172-180 — current */
<motion.button
  animate={{ y: [0, 6, 0] }}
  transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' as const }}
  className="text-neutral-600 hover:text-neutral-300 transition-colors cursor-pointer"
  onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
  aria-label={t.hero.scrollDown}
>
  <FiArrowDown size={20} />
</motion.button>
```

`Projects.tsx`'s `x` is the highest-leverage of the three — it's the value driving the entire scroll-jack track on every scroll frame while `/portfolio`'s Projects section is in view.

## Target

Framer Motion's `useTransform` output (a `MotionValue<number>`) can be composed into a template string with `useMotionTemplate`, then passed as a full `transform` string to `style`. For the two `Hero.tsx` cases (one scroll-linked, one a fixed keyframe array), the fixed-array case (`animate={{ y: [0, 6, 0] }}`) can be converted directly to a `transform` keyframe array; the scroll-linked one needs `useMotionTemplate`.

```tsx
/* target — components/Projects.tsx, inside StickyHorizontalTrack */
import { motion, useScroll, useTransform, useMotionTemplate } from 'framer-motion'
// ...
const x = useTransform(scrollYProgress, [0, 1], [0, reduced ? 0 : -overflow]) // reduced only if plan 002 is already applied; otherwise just [0, -overflow]
const trackTransform = useMotionTemplate`translateX(${x}px)`
// ...
<motion.div
  ref={trackRef}
  style={{ transform: trackTransform }}
  className="flex w-max gap-5 md:gap-6 px-4 md:px-6"
>
```

```tsx
/* target — components/Hero.tsx, hero visual parallax */
import { motion, useScroll, useTransform, useMotionTemplate } from 'framer-motion'
// ...
const heroParallaxY = useTransform(scrollYProgress, [0, 1], [0, reduced ? 0 : 72])
const heroParallaxTransform = useMotionTemplate`translateY(${heroParallaxY}px)`
// ...
<motion.div
  style={{ transform: heroParallaxTransform }}
  initial={{ opacity: 0, scale: 0.95 }}
  animate={{ opacity: 1, scale: 1 }}
  transition={{ duration: 1, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
  className="hidden lg:flex items-center justify-center"
  aria-hidden="true"
>
```

```tsx
/* target — components/Hero.tsx, scroll-down bounce */
<motion.button
  animate={{ transform: ['translateY(0px)', 'translateY(6px)', 'translateY(0px)'] }}
  transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' as const }}
  className="text-neutral-600 hover:text-neutral-300 transition-colors cursor-pointer"
  onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
  aria-label={t.hero.scrollDown}
>
  <FiArrowDown size={20} />
</motion.button>
```

Note: `initial`/`animate` `scale`/`opacity` props (as in the hero visual entrance) are NOT part of this finding — AUDIT.md only flags `x`/`y`/`scale` used for continuous/scroll-linked positional motion as a hardware-acceleration concern; a one-shot mount `scale`/`opacity` animation is Framer Motion's normal declarative API and is fine as-is. Leave `initial={{ opacity: 0, scale: 0.95 }}` / `animate={{ opacity: 1, scale: 1 }}` untouched.

## Repo conventions to follow

- `useMotionTemplate` is part of `framer-motion` (already a dependency, `^12.42.2` per `package.json`) — no new package needed, just a new named import from the existing one.
- Keep every other prop on these three elements (`className`, `transition`, `initial`, `animate` for opacity/scale, `aria-label`, `onClick`) exactly as they are — this plan only changes how the positional value is delivered to `style`.

## Steps

1. In `components/Projects.tsx`, add `useMotionTemplate` to the existing `import { motion, useScroll, useTransform } from 'framer-motion'` line (or whatever the current import list is — extend it, don't duplicate the import statement).
2. Inside `StickyHorizontalTrack`, right after the `const x = useTransform(...)` line, add `const trackTransform = useMotionTemplate\`translateX(${x}px)\``.
3. Change the `motion.div` `style={{ x }}` to `style={{ transform: trackTransform }}`.
4. In `components/Hero.tsx`, add `useMotionTemplate` to its `framer-motion` import line.
5. Right after `const heroParallaxY = useTransform(...)`, add `const heroParallaxTransform = useMotionTemplate\`translateY(${heroParallaxY}px)\``.
6. Change that `motion.div`'s `style={{ y: heroParallaxY }}` to `style={{ transform: heroParallaxTransform }}`.
7. Change the scroll-down button's `animate={{ y: [0, 6, 0] }}` to `animate={{ transform: ['translateY(0px)', 'translateY(6px)', 'translateY(0px)'] }}` — no `useMotionTemplate` needed here since it's a fixed keyframe array, not a `MotionValue`.

## Boundaries

- Do NOT touch `heroOpacity` (`style={{ opacity: heroOpacity }}`) — `opacity` is explicitly allowed unshortened per AUDIT.md, this is not a finding.
- Do NOT change any `transition`, `initial`, or non-positional `animate` props.
- Do NOT touch any other file — `PortfolioScrollProgress.tsx`'s `scaleX` shorthand was flagged as LOW severity in the audit and is intentionally excluded from this plan (single 2px bar, not worth the churn here); leave it alone.
- If the current code doesn't match the excerpts above (drift since commit `e40b7ad`), STOP and report instead of improvising.

## Verification

- **Mechanical**: `cd client && npx tsc --noEmit` and `npm run build` both succeed — pay attention to any TypeScript complaint about `useMotionTemplate`'s generic inference; it should infer `MotionValue<string>` for `trackTransform`/`heroParallaxTransform` without extra annotation.
- **Feel check**:
  - Scroll through `/portfolio`'s Projects section and confirm the horizontal scroll-jack still tracks scroll position identically to before (same start/end positions, same speed).
  - Scroll the Hero section and confirm the parallax visual still shifts down as before.
  - Watch the scroll-down arrow bounce and confirm it still moves the same 6px down-and-back.
  - In DevTools Elements panel, inspect each of the three elements' computed/inline style and confirm you see a `transform: translateX(...)` / `transform: translateY(...)` string, not a bare `transform: translate3d(...)` from a legacy shorthand internal representation — Framer Motion may still render `translate3d` under the hood for the template value; the point is the `style` prop source is now `transform`, not `x`/`y`.
  - In the Performance panel, scroll rapidly through the Projects section while recording and confirm the "Composite Layers"/GPU path is used (no long main-thread "Recalculate Style" blocks tied to this element).
- **Done when**: all three animations look and feel identical to before, and DevTools confirms they're driven by `transform` rather than the `x`/`y`/`scale` shorthand.
