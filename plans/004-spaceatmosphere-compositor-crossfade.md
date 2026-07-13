# 004 — Replace SpaceAtmosphere's background/box-shadow transition with opacity crossfade layers

- **Status**: TODO
- **Commit**: e40b7ad
- **Severity**: HIGH
- **Category**: Performance
- **Estimated scope**: 1 file (`components/SpaceAtmosphere.tsx`), full rewrite of the render body (imports/hooks unchanged)

## Problem

`components/SpaceAtmosphere.tsx` currently animates `background-color`, `background-image`, and `box-shadow` directly over 3 seconds whenever the time-of-day palette changes:

```tsx
/* components/SpaceAtmosphere.tsx:19-82 — current, full file */
'use client'

import { useTimeOfDay, type TimeOfDay } from '@/lib/useTimeOfDay'
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion'

const PALETTES: Record<TimeOfDay, { base: string; glow: string; vignette: number }> = {
  dawn: {
    base: '#0c0a1f',
    glow: 'radial-gradient(ellipse 80% 60% at 50% 40%, rgba(120,70,90,0.32) 0%, transparent 55%), radial-gradient(ellipse at bottom, rgba(0,0,0,0.8) 0%, transparent 50%)',
    vignette: 0.5,
  },
  day: {
    base: '#0a0f2b',
    glow: 'radial-gradient(ellipse 80% 60% at 50% 40%, rgba(45,70,120,0.32) 0%, transparent 55%), radial-gradient(ellipse at bottom, rgba(0,0,0,0.75) 0%, transparent 50%)',
    vignette: 0.45,
  },
  dusk: {
    base: '#12081f',
    glow: 'radial-gradient(ellipse 80% 60% at 50% 40%, rgba(130,60,60,0.35) 0%, transparent 55%), radial-gradient(ellipse at bottom, rgba(0,0,0,0.82) 0%, transparent 50%)',
    vignette: 0.52,
  },
  night: {
    base: '#030014',
    glow: 'radial-gradient(ellipse 80% 60% at 50% 40%, rgba(30,27,75,0.35) 0%, transparent 55%), radial-gradient(ellipse at bottom, rgba(0,0,0,0.85) 0%, transparent 50%)',
    vignette: 0.55,
  },
}

export default function SpaceAtmosphere({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  const timeOfDay = useTimeOfDay()
  const reduced = usePrefersReducedMotion()
  const palette = PALETTES[timeOfDay]
  const transition = reduced ? 'none' : 'background-color 3s ease, background-image 3s ease, box-shadow 3s ease'

  return (
    <div
      className={`relative bg-neutral-950 dark:bg-[color:var(--space-base)] ${className}`}
      style={{ '--space-base': palette.base, transition } as React.CSSProperties}
    >
      <div
        className="pointer-events-none fixed inset-0 z-0 hidden dark:block"
        style={{ backgroundImage: palette.glow, transition }}
        aria-hidden
      />
      <div
        className="pointer-events-none fixed inset-0 z-0 hidden dark:block"
        style={{ boxShadow: `inset 0 0 160px 60px rgba(0,0,0,${palette.vignette})`, transition }}
        aria-hidden
      />
      <div
        className="pointer-events-none fixed inset-0 z-0 hidden dark:block dark:opacity-[0.09] mix-blend-overlay"
        aria-hidden
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  )
}
```

AUDIT.md §5 (Performance): "Animate `transform` and `opacity` only. `width`/`height`/`margin`/`padding`/`top`/`left` trigger layout + paint + composite" and "Keep transition-time `filter: blur()` under 20px." `background-color`/`background-image` are paint-triggering properties (not compositor-only), and `box-shadow` is explicitly non-compositor-safe. All three are applied on `fixed inset-0` full-viewport layers, so every frame of the 3-second transition repaints the entire viewport. This runs on every page that wraps content in `SpaceAtmosphere` (currently `/portfolio`, `/posts`, `/posts/[id]`, `/food`, `/games/stats`, `/typing-game`, `/achievements`), every time the visitor's local time crosses a dawn/day/dusk/night boundary while the tab is open.

## Target

Render one pre-built layer per `TimeOfDay` (4 layers total, each containing that time's base color + glow gradient + vignette box-shadow baked in as static, non-animated CSS), stacked in the same position, and crossfade between them by animating only `opacity`. Only the active layer has `opacity: 1`; the rest have `opacity: 0`. Because each layer's own background/box-shadow never changes after mount, the browser can rasterize each layer once and composite the opacity crossfade on the GPU — no repeated paint.

```tsx
/* target — components/SpaceAtmosphere.tsx, full replacement */
'use client'

import { useTimeOfDay, type TimeOfDay } from '@/lib/useTimeOfDay'
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion'

const TIME_ORDER: TimeOfDay[] = ['dawn', 'day', 'dusk', 'night']

const PALETTES: Record<TimeOfDay, { base: string; glow: string; vignette: number }> = {
  dawn: {
    base: '#0c0a1f',
    glow: 'radial-gradient(ellipse 80% 60% at 50% 40%, rgba(120,70,90,0.32) 0%, transparent 55%), radial-gradient(ellipse at bottom, rgba(0,0,0,0.8) 0%, transparent 50%)',
    vignette: 0.5,
  },
  day: {
    base: '#0a0f2b',
    glow: 'radial-gradient(ellipse 80% 60% at 50% 40%, rgba(45,70,120,0.32) 0%, transparent 55%), radial-gradient(ellipse at bottom, rgba(0,0,0,0.75) 0%, transparent 50%)',
    vignette: 0.45,
  },
  dusk: {
    base: '#12081f',
    glow: 'radial-gradient(ellipse 80% 60% at 50% 40%, rgba(130,60,60,0.35) 0%, transparent 55%), radial-gradient(ellipse at bottom, rgba(0,0,0,0.82) 0%, transparent 50%)',
    vignette: 0.52,
  },
  night: {
    base: '#030014',
    glow: 'radial-gradient(ellipse 80% 60% at 50% 40%, rgba(30,27,75,0.35) 0%, transparent 55%), radial-gradient(ellipse at bottom, rgba(0,0,0,0.85) 0%, transparent 50%)',
    vignette: 0.55,
  },
}

const GRAIN_URL =
  `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`

export default function SpaceAtmosphere({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  const timeOfDay = useTimeOfDay()
  const reduced = usePrefersReducedMotion()
  const opacityTransition = reduced ? 'none' : 'opacity 3s ease-in-out'
  const activePalette = PALETTES[timeOfDay]

  return (
    <div className={`relative bg-neutral-950 dark:bg-[color:var(--space-base)] ${className}`} style={{ '--space-base': activePalette.base } as React.CSSProperties}>
      {TIME_ORDER.map((key) => {
        const palette = PALETTES[key]
        return (
          <div
            key={key}
            className="pointer-events-none fixed inset-0 z-0 hidden dark:block"
            aria-hidden
            style={{
              backgroundImage: palette.glow,
              boxShadow: `inset 0 0 160px 60px rgba(0,0,0,${palette.vignette})`,
              opacity: key === timeOfDay ? 1 : 0,
              transition: opacityTransition,
            }}
          />
        )
      })}
      <div
        className="pointer-events-none fixed inset-0 z-0 hidden dark:block dark:opacity-[0.09] mix-blend-overlay"
        aria-hidden
        style={{ backgroundImage: GRAIN_URL }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  )
}
```

Note: the root `<div>`'s `bg-[color:var(--space-base)]` still swaps `background-color` on the container (not `fixed`, doesn't cover the viewport with a repeatedly-repainted layer the way the old `fixed inset-0` layers did) — this one instant swap is not itself animated in the target (no `transition` on it), so there's a hard cut on the base color underneath the crossfading glow/vignette layers. This is an accepted tradeoff: the glow+vignette crossfade is what's visually dominant, and the base color is mostly covered by content (`z-10`) anyway. If a future pass wants the base color to crossfade too, it would need a 5th always-present full-opacity layer per time-of-day sitting behind the glow layers with its own opacity crossfade — out of scope for this plan; call it out in the plans/README status notes if deferred.

## Repo conventions to follow

- Keep `usePrefersReducedMotion()` gating exactly as it already is — only the animated property list changes (`background-color/background-image/box-shadow` transition → `opacity` transition).
- Keep the same `hidden dark:block` light/dark gating on every fixed layer — this component is dark-mode-only by design (see the removed comment "Light mode keeps the site's existing light palette").
- Keep the grain overlay layer exactly as-is (it was never part of the crossfade — it's a static always-visible texture).

## Steps

1. Replace the entire contents of `components/SpaceAtmosphere.tsx` with the target version above.
2. Confirm the exported function signature (`export default function SpaceAtmosphere({ children, className = '' }: {...})`) is unchanged — every consumer (`app/portfolio/PortfolioClient.tsx`, `app/posts/page.tsx`, `app/posts/[id]/page.tsx`, `app/food/FoodClient.tsx`, `app/games/stats/page.tsx`, `app/typing-game/page.tsx`, `app/achievements/page.tsx`) calls it the same way and must not need changes.
3. Double check the `key === timeOfDay ? 1 : 0` opacity logic renders exactly one layer at `opacity: 1` at any time — this is what makes the crossfade correct (old layer fades to 0 as new layer fades to 1, simultaneously, both driven by the same `timeOfDay` state change).

## Boundaries

- Do NOT change any consumer file — this plan is scoped to `components/SpaceAtmosphere.tsx` only.
- Do NOT change the `PALETTES` color/gradient/vignette values themselves — only how they're rendered/transitioned.
- Do NOT add a 5th base-color-crossfade layer in this pass (see the Target note above) — flag it as a follow-up if you think it's warranted, don't implement it here.
- Do NOT add new dependencies.
- If the current file doesn't match the excerpt above (drift since commit `e40b7ad`), STOP and report instead of improvising.

## Verification

- **Mechanical**: `cd client && npx tsc --noEmit` and `npm run build` both succeed. Visually spot-check `/posts` and `/portfolio` still render the dark space background correctly in dark mode, and are unaffected in light mode (still `hidden` there).
- **Feel check**:
  - Open Chrome DevTools → Performance panel, start recording, and use the Console to fast-forward through time-of-day changes (or temporarily mock `Date.now()`/system clock) to trigger a crossfade; stop recording and confirm the transition frames show `Composite Layers` dominating, not `Paint`/`Layout`, during the 3s window.
  - Visually confirm the crossfade still looks like a smooth blend between two palettes (glow color + vignette shifting together), not an abrupt cut.
  - Toggle `prefers-reduced-motion: reduce` in DevTools Rendering panel and confirm the palette still changes but instantly (no 3s fade) — same as before this plan.
  - Confirm no visible "double exposure" flash artifact (both layers visible and misaligned) — since both layers share the exact same `inset: 0`/`fixed` positioning, there should be none.
- **Done when**: DevTools Performance panel shows compositor-only work (no repeated Paint) during a time-of-day crossfade, and the visual result is indistinguishable from before to the eye.
