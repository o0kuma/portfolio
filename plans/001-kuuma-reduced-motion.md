# 001 — Gate KuumaCompanion's motion behind prefers-reduced-motion

- **Status**: TODO
- **Commit**: e40b7ad
- **Severity**: HIGH
- **Category**: Accessibility
- **Estimated scope**: 1 file (`components/KuumaCompanion.tsx`), ~15 line changes

## Problem

`components/KuumaCompanion.tsx` has zero `usePrefersReducedMotion()` usage anywhere in the file (confirmed absent — no import of the hook, no `reduced` variable). Every other animation-heavy component in this repo that has an obvious continuous-motion surface (`components/Hero.tsx`, `components/SpaceAtmosphere.tsx`, `components/home/BlogPostsCarousel3D.tsx`) already imports and branches on it. This component is the exception, and it's the most motion-dense component in the codebase:

```tsx
// components/KuumaCompanion.tsx:175-194 — current
useEffect(() => {
  const onMove = (e: MouseEvent) => {
    targetPos.current = { x: e.clientX + 20, y: e.clientY - 20 }
    lastMoveRef.current = Date.now()
  }
  window.addEventListener('mousemove', onMove)

  const animate = () => {
    const lerp = 0.08
    currentPos.current.x += (targetPos.current.x - currentPos.current.x) * lerp
    currentPos.current.y += (targetPos.current.y - currentPos.current.y) * lerp
    setPos({ x: currentPos.current.x, y: currentPos.current.y })
    rafRef.current = requestAnimationFrame(animate)
  }
  rafRef.current = requestAnimationFrame(animate)

  return () => {
    window.removeEventListener('mousemove', onMove)
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
  }
}, [])
```

```css
/* components/KuumaCompanion.tsx:400-402 — current */
.kuuma-spin { animation: kuuma-spin 10s linear infinite; }
.kuuma-pulse-core { animation: kuuma-pulse 2s ease-in-out infinite; }
.kuuma-breathe { animation: kuuma-breathe 3s ease-in-out infinite; }
```

Plus the idle-wander target-position jump inside the "Idle wander behavior + behavior-based dwell nudge" effect (around line 200-220 in the current file — the `setInterval` that picks a random `x`/`y` and assigns it to `targetPos.current` when idle).

AUDIT.md §6 (Accessibility): "Reduced motion means fewer and gentler animations, not zero — keep transitions that aid comprehension, remove position changes." A mascot that continuously chases the cursor and pulses/spins/glows forever, with zero gating, is exactly the pattern this rule exists for.

## Target

- When `prefers-reduced-motion: reduce` is set:
  - The mascot still renders (it's not decoration-only — it's the affordance for opening chat), but it stops following the cursor. It renders at a **fixed position** instead (e.g. pinned at `{ x: 24, y: 24 }` from the bottom-left, matching where its own chat toggle button already sits — see `components/KuumaCompanion.tsx:489-495`).
  - The rAF lerp loop and the `mousemove` listener are never started.
  - The idle-wander random-target jump is disabled (no-op).
  - `.kuuma-spin`, `.kuuma-pulse-core`, `.kuuma-breathe`, and all four emotion classes (`.kuuma-emotion-happy`, `.kuuma-emotion-thinking`, `.kuuma-emotion-surprised`, `.kuuma-emotion-error`) stop animating (`animation: none`), but the character rings keep their static color/border (no animation ≠ invisible).
  - The speech bubble and chat panel keep their (currently instant, see plan 007) show/hide — AUDIT.md's "keep transitions that aid comprehension" means state-communicating elements should still appear, just without decorative continuous motion.

```tsx
/* target — components/KuumaCompanion.tsx, inside the component body */
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion'
// ...
const reduced = usePrefersReducedMotion()

// Smooth mouse follow with lerp — skipped entirely when reduced
useEffect(() => {
  if (reduced) {
    // Pin at a fixed spot instead of chasing the cursor.
    currentPos.current = { x: 24, y: 24 }
    targetPos.current = { x: 24, y: 24 }
    setPos({ x: 24, y: 24 })
    return
  }
  const onMove = (e: MouseEvent) => {
    targetPos.current = { x: e.clientX + 20, y: e.clientY - 20 }
    lastMoveRef.current = Date.now()
  }
  window.addEventListener('mousemove', onMove)

  const animate = () => {
    const lerp = 0.08
    currentPos.current.x += (targetPos.current.x - currentPos.current.x) * lerp
    currentPos.current.y += (targetPos.current.y - currentPos.current.y) * lerp
    setPos({ x: currentPos.current.x, y: currentPos.current.y })
    rafRef.current = requestAnimationFrame(animate)
  }
  rafRef.current = requestAnimationFrame(animate)

  return () => {
    window.removeEventListener('mousemove', onMove)
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
  }
}, [reduced])
```

```css
/* target — components/KuumaCompanion.tsx <style> block, appended after the existing rules */
@media (prefers-reduced-motion: reduce) {
  .kuuma-spin,
  .kuuma-pulse-core,
  .kuuma-breathe,
  .kuuma-emotion-happy,
  .kuuma-emotion-thinking,
  .kuuma-emotion-surprised,
  .kuuma-emotion-error {
    animation: none;
  }
}
```

## Repo conventions to follow

- `lib/usePrefersReducedMotion.ts` is the shared hook — import it exactly as `components/Hero.tsx:9` does: `import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion'`, then `const reduced = usePrefersReducedMotion()`.
- `components/SpaceAtmosphere.tsx:50,52` shows the pattern of branching a `transition`/behavior string on `reduced` inline rather than duplicating whole JSX trees — prefer the same lightweight branch style here (an `if (reduced) { ...; return }` early-return inside the effect, not a parallel component).
- Do not use `@media (prefers-reduced-motion: reduce)` to hide the character or chat toggle — only neutralize the `animation` declarations, per the CSS above.

## Steps

1. In `components/KuumaCompanion.tsx`, add `import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion'` near the top (alongside the existing `useLanguage` import).
2. Inside `export default function KuumaCompanion()`, add `const reduced = usePrefersReducedMotion()` near the other top-level hooks (next to `const localeRef = useRef(locale)`).
3. Replace the "Smooth mouse follow with lerp" `useEffect` (the one starting `// Smooth mouse follow with lerp`) with the target version above — add `reduced` to its dependency array, and short-circuit to a fixed position when `reduced` is true.
4. Find the "Idle wander behavior + behavior-based dwell nudge" `useEffect` (the `setInterval` that reassigns `targetPos.current` to a random point). Wrap the random-target-jump branch (the `if (idleMs > 10000) { ... targetPos.current = { x, y } }` part) in `if (!reduced && idleMs > 10000) { ... }` so idle-wander never fires when reduced. Leave the dwell-nudge speech-bubble logic in that same effect untouched — dwell nudges are informational, not movement.
5. Append the `@media (prefers-reduced-motion: reduce)` block from the Target section to the end of the existing `<style>{\`...\`}</style>` template literal (right before the closing `` ` ``).
6. Do not touch the speech bubble or chat panel mount/unmount logic in this plan — that's covered by plan 007.

## Boundaries

- Do NOT touch the speech bubble/chat panel enter-exit animation (plan 007) or the emotion-flash frequency (plan 008) in this pass — only add the reduced-motion gating.
- Do NOT change the mascot's default (non-reduced) motion behavior at all.
- Do NOT add new dependencies.
- If the effects you find don't match the excerpts above (drift since commit `e40b7ad`), STOP and report instead of improvising.

## Verification

- **Mechanical**: `cd client && npx tsc --noEmit` (expect no new errors) and `npm run build` (expect success).
- **Feel check**:
  - In Chrome DevTools → Rendering panel, set "Emulate CSS media feature prefers-reduced-motion" to `reduce`, reload the home page.
  - Move the mouse around: confirm the mascot does NOT follow the cursor and stays pinned near the bottom-left corner.
  - Wait 15+ seconds without moving the mouse: confirm no idle-wander jump occurs.
  - In the Elements panel, inspect the character ring's outer div (`className` includes `kuuma-spin`) and confirm its computed `animation` is `none`.
  - Toggle the media feature back to "No emulation" and confirm the mascot immediately resumes following the cursor (no gating leak once reduced-motion is off).
- **Done when**: with reduced-motion emulated, the mascot is stationary and non-pulsing/non-spinning, and with it off, existing behavior is bit-for-bit unchanged.
