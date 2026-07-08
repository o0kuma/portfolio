/**
 * Cinematic "deep space" background layer — the same recipe used behind the
 * home page's blog carousel (radial glow + bottom vignette + inset shadow
 * frame + film grain), extracted so /portfolio and /posts can share the
 * same atmosphere instead of a flat bg-neutral-950. Pure CSS, no canvas —
 * cheap enough to use on every page, including long-scroll reading pages.
 *
 * Usage: wrap a section/page in this and give children `relative z-10`.
 */
export default function SpaceAtmosphere({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    // Light mode keeps the site's existing light palette (bg-neutral-950 is
    // remapped to a warm light color by .portfolio-page's light overrides);
    // the space atmosphere is a dark-mode-only treatment.
    <div className={`relative bg-neutral-950 dark:bg-[#030014] ${className}`}>
      <div
        className="pointer-events-none fixed inset-0 z-0 hidden dark:block dark:bg-[radial-gradient(ellipse_80%_60%_at_50%_40%,rgba(30,27,75,0.35)_0%,transparent_55%),radial-gradient(ellipse_at_bottom,rgba(0,0,0,0.85)_0%,transparent_50%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none fixed inset-0 z-0 hidden dark:block dark:shadow-[inset_0_0_160px_60px_rgba(0,0,0,0.55)]"
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
