# 002 — Reduced-motion fallback for the Projects scroll-jack

- **Status**: TODO
- **Commit**: e40b7ad
- **Severity**: HIGH
- **Category**: Accessibility
- **Estimated scope**: 1 file (`components/Projects.tsx`), 1 function (`StickyHorizontalTrack`)

## Problem

`StickyHorizontalTrack` in `components/Projects.tsx` pins the section (`position: sticky`) and expands its height to `calc(100vh + overflow px)` to drive a horizontal scroll-jack, with zero `prefers-reduced-motion` branching:

```tsx
/* components/Projects.tsx:672-693 — current */
return (
  <div
    ref={sectionRef}
    className="-mx-4 md:-mx-6"
    style={{ height: overflow > 0 ? `calc(100vh + ${overflow}px)` : undefined }}
  >
    <div ref={viewportRef} className="sticky top-0 flex h-screen items-center overflow-hidden">
      <motion.div
        ref={trackRef}
        style={{ x }}
        className="flex w-max gap-5 md:gap-6 px-4 md:px-6"
      >
        {projects.map((project) => (
          <div key={project.id} className="shrink-0">
            <ProjectCard project={project} layout="track" onClick={() => onCardClick(project)} />
          </div>
        ))}
      </motion.div>
    </div>
  </div>
)
```

`x` comes from `useTransform(scrollYProgress, [0, 1], [0, -overflow])` (line 657) — a large, page-length-altering motion effect with no way to opt out via OS/browser settings. AUDIT.md §6: "Hunt for: movement with no `prefers-reduced-motion` handling" — this is the single largest continuous-motion surface in the codebase (it changes the scrollable height of the whole page), so it's HIGH.

**Critical constraint** — read the comment already in the file at lines 661-671 before touching this:

```tsx
/* components/Projects.tsx:661-671 — current, DO NOT violate this invariant */
// IMPORTANT: always render the same DOM structure regardless of `overflow`.
// This used to branch into two entirely different JSX trees (a plain row
// vs. the pinned/scroll-jacked version), which meant sectionRef/trackRef
// pointed at different DOM nodes depending on state. Framer Motion's
// useScroll binds its scroll observer to whatever node the ref held when
// its effect first ran — swapping the underlying node later (via the
// branch switch) left it tracking stale layout, so the horizontal scroll
// silently stopped working once real project data measured in. Keeping
// one persistent tree and only varying height/x by data fixes that, and
// overflow-x-hidden on the sticky viewport keeps any transient
// mismeasurement from ever breaking the page-level layout.
```

This was a real, previously-fixed bug: `sectionRef`/`viewportRef`/`trackRef` must stay attached to the same three DOM nodes on every render, reduced-motion or not. The fix in this plan must NOT reintroduce a branching JSX tree.

## Target

When `usePrefersReducedMotion()` returns `true`:
- `sectionRef`'s height is never expanded (behaves as if `overflow` were `0`).
- `viewportRef` is not pinned (`sticky` → `static`) and gets `overflow-x-auto` instead of `overflow-hidden`, so the cards become a normal, manually-swipeable/scrollable horizontal row — nothing is lost, it's just no longer scroll-jacked.
- `trackRef`'s `x` transform is forced to `0` (the track never translates); the user scrolls it horizontally with their own gesture/trackpad instead.
- No JSX branching — same three nodes, same children, only classNames/styles conditionally change based on `reduced`.

```tsx
/* target — components/Projects.tsx, inside StickyHorizontalTrack */
const reduced = usePrefersReducedMotion()
const x = useTransform(scrollYProgress, [0, 1], [0, reduced ? 0 : -overflow])
const effectiveOverflow = reduced ? 0 : overflow

return (
  <div
    ref={sectionRef}
    className="-mx-4 md:-mx-6"
    style={{ height: effectiveOverflow > 0 ? `calc(100vh + ${effectiveOverflow}px)` : undefined }}
  >
    <div
      ref={viewportRef}
      className={
        reduced
          ? 'flex items-center overflow-x-auto'
          : 'sticky top-0 flex h-screen items-center overflow-hidden'
      }
    >
      <motion.div
        ref={trackRef}
        style={{ x }}
        className="flex w-max gap-5 md:gap-6 px-4 md:px-6"
      >
        {projects.map((project) => (
          <div key={project.id} className="shrink-0">
            <ProjectCard project={project} layout="track" onClick={() => onCardClick(project)} />
          </div>
        ))}
      </motion.div>
    </div>
  </div>
)
```

## Repo conventions to follow

- Import the hook exactly as `components/Hero.tsx:9` does: `import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion'`.
- `components/home/BlogPostsCarousel3D.tsx` already has a working reduced-motion fallback for its own scroll/drag surface (it renders a static stacked list instead of the 3D rotation) — same spirit here: give reduced-motion users the content in a plain, browser-native scrollable form rather than removing it.
- Keep using the existing `overflow`/`viewportRef`/`trackRef` measurement `useEffect` (lines 625-651) completely unchanged — it still needs to run so `overflow` is available for the non-reduced case, and this plan only changes what's *done* with that value at render time, not how it's measured.

## Steps

1. Add `import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion'` to `components/Projects.tsx`'s imports.
2. Inside `StickyHorizontalTrack`, add `const reduced = usePrefersReducedMotion()` right after the existing `const [overflow, setOverflow] = useState(0)` line.
3. Change the `x` transform line (`const x = useTransform(scrollYProgress, [0, 1], [0, -overflow])`) to `const x = useTransform(scrollYProgress, [0, 1], [0, reduced ? 0 : -overflow])`.
4. Add `const effectiveOverflow = reduced ? 0 : overflow` right after that.
5. In the returned JSX, change the outer `div`'s `style` to use `effectiveOverflow` instead of `overflow`.
6. Change the `viewportRef` div's `className` to the conditional shown in Target — do not change its position in the tree, its ref, or its children.
7. Leave the `motion.div` (`trackRef`) and everything inside it completely unchanged — the `x` value itself is already neutralized by step 3.

## Boundaries

- Do NOT split this into two different JSX return branches — one conditional `className` string is the only allowed conditional in the tree.
- Do NOT change the `useEffect` that measures `overflow` via `ResizeObserver`.
- Do NOT touch `ProjectCard` or any other function in this file.
- Do NOT add new dependencies.
- If the current code doesn't match the excerpts above (drift since commit `e40b7ad`), STOP and report instead of improvising.

## Verification

- **Mechanical**: `cd client && npx tsc --noEmit` and `npm run build` both succeed.
- **Feel check**:
  - With reduced-motion OFF (default), scroll through the Projects section on `/portfolio` and confirm the scroll-jack still pins and slides horizontally exactly as before.
  - In DevTools Rendering panel, emulate `prefers-reduced-motion: reduce`, reload `/portfolio`, and scroll to the Projects section: confirm the page height is normal (no huge empty scroll runway), the section does NOT pin/stick, and the project cards sit in a single row you can horizontally scroll with a trackpad/shift+wheel/touch drag.
  - Confirm no console errors and no layout shift when toggling the emulation on/off and reloading.
- **Done when**: reduced-motion users get the same project cards, reachable by ordinary horizontal scrolling, with no scroll-jacking and no page-length inflation; non-reduced behavior is unchanged.
