'use client'

import { useTimeOfDay, type TimeOfDay } from '@/lib/useTimeOfDay'
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion'

/**
 * Cinematic "deep space" background layer — the same recipe used behind the
 * home page's blog carousel (radial glow + bottom vignette + inset shadow
 * frame + film grain), extracted so /portfolio and /posts can share the
 * same atmosphere instead of a flat bg-neutral-950. Pure CSS, no canvas —
 * cheap enough to use on every page, including long-scroll reading pages.
 *
 * The glow tint shifts with local time of day (dawn/day/dusk/night) so the
 * background feels alive without any extra network or GPU cost.
 *
 * Usage: wrap a section/page in this and give children `relative z-10`.
 */

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
    // Light mode keeps the site's existing light palette (bg-neutral-950 is
    // remapped to a warm light color by .portfolio-page's light overrides);
    // the space atmosphere is a dark-mode-only treatment.
    //
    // Glow/vignette per time-of-day are rendered as separate always-mounted
    // layers crossfaded via opacity (transform/opacity are compositor-only —
    // animating background-image/box-shadow directly repaints the whole
    // fixed viewport every frame for the 3s transition).
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
