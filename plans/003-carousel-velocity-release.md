# 003 — Velocity-aware release for the 3D post carousel drag

- **Status**: TODO
- **Commit**: e40b7ad
- **Severity**: HIGH
- **Category**: Interruptibility
- **Estimated scope**: 1 file (`components/home/BlogPostsCarousel3D.tsx`), ~20 line changes

## Problem

The carousel's drag-release snap is purely positional — it ignores how fast the user was dragging:

```tsx
/* components/home/BlogPostsCarousel3D.tsx:89-92 — current */
const snap = useCallback(() => {
  if (count <= 1 || reduced) return
  setRotation((r) => Math.round(r / step) * step)
}, [count, step, reduced])
```

```tsx
/* components/home/BlogPostsCarousel3D.tsx:123-151 — current */
const onPointerDown = (e: React.PointerEvent) => {
  const t = e.target as HTMLElement
  if (t.closest('a, button')) return
  if (reduced || count <= 1) return
  pendingDrag.current = true
  pointerId.current = e.pointerId
  startX.current = e.clientX
  startRot.current = rotation
  dragEl.current = e.currentTarget as HTMLElement
}

const onPointerMove = (e: React.PointerEvent) => {
  if (pointerId.current !== e.pointerId) return
  if (!pendingDrag.current && !dragging.current) return
  const dx = e.clientX - startX.current

  if (!dragging.current) {
    if (Math.abs(dx) < DRAG_THRESHOLD) return
    dragging.current = true
    setDraggingUi(true)
    dragEl.current?.setPointerCapture?.(e.pointerId)
  }

  setRotation(startRot.current + dx * DRAG_SENS)
}

const endDrag = (e: React.PointerEvent) => {
  if (pointerId.current !== null && e.pointerId !== pointerId.current) return
  const wasDragging = dragging.current
  pendingDrag.current = false
  dragging.current = false
  pointerId.current = null
  if (!wasDragging) return
  setDraggingUi(false)
  snap()
  try {
    ;(e.currentTarget as HTMLElement).releasePointerCapture?.(e.pointerId)
  } catch {
    /* noop */
  }
```

The rotation's CSS settle transition is a fixed `0.55s cubic-bezier(0.22, 1, 0.36, 1)` (line ~227-231, applied via `transition: draggingUi ? 'none' : 'transform 0.55s cubic-bezier(0.22, 1, 0.36, 1)'`) regardless of how the drag ended. AUDIT.md §4 (Interruptibility): "Gesture-driven motion should use springs — they carry velocity when interrupted" and "Hunt for: ... drags without velocity-based dismissal (dismiss on `Math.abs(distance)/elapsedMs > ~0.11`, not distance thresholds alone)". A fast flick and a slow drag ending at the identical rotation currently produce an identical release — no sense of momentum at all.

## Target

Track pointer-move samples with timestamps during the drag. On release:
- Compute an angular velocity (deg/ms) from the last ~50ms of movement.
- If `|velocity|` clears a threshold, bias the snap target one extra step in the flick direction (a "flick to next/prev" feel) instead of only snapping to the nearest step.
- Scale the settle transition's duration inversely with velocity — a fast flick settles quicker (snappier), a slow drag-release keeps the current 0.55s. Clamp so it's never faster than 300ms or slower than 550ms (the existing value), per AUDIT.md's UI duration budget ("under 300ms" as a floor for a deliberate release, capped at the current feel for slow releases).

```tsx
/* target — components/home/BlogPostsCarousel3D.tsx, new refs near the other drag refs */
const lastMoveTime = useRef(0)
const lastMoveX = useRef(0)
const velocityRef = useRef(0) // deg per ms, signed
const [settleMs, setSettleMs] = useState(550)

const VELOCITY_FLICK_THRESHOLD = 0.15 // deg/ms — tune via feel check, not exact from AUDIT.md (carousel-specific, not a dismiss gesture)
const MIN_SETTLE_MS = 300
const MAX_SETTLE_MS = 550
```

```tsx
/* target — onPointerMove, replace the body */
const onPointerMove = (e: React.PointerEvent) => {
  if (pointerId.current !== e.pointerId) return
  if (!pendingDrag.current && !dragging.current) return
  const dx = e.clientX - startX.current

  if (!dragging.current) {
    if (Math.abs(dx) < DRAG_THRESHOLD) return
    dragging.current = true
    setDraggingUi(true)
    dragEl.current?.setPointerCapture?.(e.pointerId)
    lastMoveTime.current = performance.now()
    lastMoveX.current = e.clientX
  }

  const now = performance.now()
  const dt = now - lastMoveTime.current
  if (dt > 0) {
    const dxSinceLast = e.clientX - lastMoveX.current
    const degPerPx = DRAG_SENS
    velocityRef.current = (dxSinceLast * degPerPx) / dt
  }
  lastMoveTime.current = now
  lastMoveX.current = e.clientX

  setRotation(startRot.current + dx * DRAG_SENS)
}
```

```tsx
/* target — snap, replace the body */
const snap = useCallback(() => {
  if (count <= 1 || reduced) return
  const v = velocityRef.current
  const flickBias = Math.abs(v) > VELOCITY_FLICK_THRESHOLD ? Math.sign(-v) : 0
  setRotation((r) => Math.round(r / step + flickBias) * step)
  const speed = Math.min(Math.abs(v) / VELOCITY_FLICK_THRESHOLD, 1)
  setSettleMs(Math.round(MAX_SETTLE_MS - speed * (MAX_SETTLE_MS - MIN_SETTLE_MS)))
  velocityRef.current = 0
}, [count, step, reduced])
```

```tsx
/* target — the transform transition string, replace the fixed 0.55s */
transition: draggingUi ? 'none' : `transform ${settleMs}ms cubic-bezier(0.22, 1, 0.36, 1)`,
```

## Repo conventions to follow

- Keep the existing `cubic-bezier(0.22, 1, 0.36, 1)` curve (the repo's shared easing, from `lib/portfolioMotion.ts`) — only the duration becomes dynamic, per this plan; don't change the curve itself (that's covered by plan 006 if this file is later migrated to import the token instead of hand-typing it — out of scope here).
- Follow the existing pattern of plain refs for drag bookkeeping (`startX`, `startRot`, `pendingDrag`) rather than introducing a state library or Framer Motion's spring API — this file uses plain CSS transitions throughout by design, and this plan should not add a new animation dependency.
- `DRAG_SENS` (line 41, `= 0.45`) is already the existing px-to-degree conversion constant — reuse it in the velocity calculation rather than inventing a second constant.

## Steps

1. Add the new refs and state (`lastMoveTime`, `lastMoveX`, `velocityRef`, `settleMs` state, and the three threshold constants) near the existing drag refs (after `const dragEl = useRef<HTMLElement | null>(null)`).
2. Replace `onPointerMove`'s body with the target version — it now also updates `lastMoveTime`/`lastMoveX`/`velocityRef` on every move once dragging has started, and initializes them at the drag-threshold-crossing moment (inside the `if (!dragging.current) { ... }` branch).
3. Replace `snap`'s body with the target version — it reads `velocityRef.current`, decides `flickBias`, applies it to the rounded step, computes and sets `settleMs`, then resets `velocityRef.current` to `0` so a later programmatic call to `snap()` (if any) doesn't reuse stale velocity.
4. Find the inline `style` object that sets `transition: draggingUi ? 'none' : 'transform 0.55s cubic-bezier(0.22, 1, 0.36, 1)'` (around line 227-231) and replace the literal `0.55s` with the `settleMs`-based template string shown in Target.
5. Leave `goPrev`/`goNext`/wheel/keyboard handlers untouched — velocity only applies to pointer-drag release; those other input methods should keep using the current fixed duration (they can fall back to `MAX_SETTLE_MS` — if `settleMs` state is reused for all transitions, make sure `goPrev`/`goNext` don't leave a stale short `settleMs` from a previous fast flick. Simplest correct fix: reset `setSettleMs(MAX_SETTLE_MS)` inside `goPrev` and `goNext` before calling `setRotation`.

## Boundaries

- Do NOT change `DRAG_SENS`, `DRAG_THRESHOLD`, or the wheel/keyboard rotation amounts.
- Do NOT add a physics/spring library dependency — this stays CSS-transition-based with a JS-computed duration.
- Do NOT change the reduced-motion branch (`if (count <= 1 || reduced) return` in `snap`) — velocity logic only applies when not reduced, which is already guaranteed since `onPointerDown` bails when `reduced` is true.
- If the current code doesn't match the excerpts above (drift since commit `e40b7ad`), STOP and report instead of improvising.

## Verification

- **Mechanical**: `cd client && npx tsc --noEmit` and `npm run build` both succeed.
- **Feel check**:
  - On the home page's post carousel, do a fast flick drag: confirm the carousel advances to (at least) the next card and the settle animation is visibly snappier/shorter than a slow drag-release.
  - Do a slow, deliberate drag that ends between two cards: confirm it still settles to the nearest card with roughly the original ~550ms feel.
  - In DevTools Elements panel, watch the `transition` inline style value update between drags of different speeds — confirm the duration number actually changes (not stuck at one value).
  - Repeat with `goPrev`/`goNext` (arrow keys) immediately after a fast flick: confirm they use the full ~550ms duration, not a leftover short one from the prior flick.
  - Toggle `prefers-reduced-motion: reduce` and confirm dragging is still fully disabled (unchanged from before this plan).
- **Done when**: fast flicks feel snappier and can jump an extra card in the flick direction; slow drags keep the original settle feel; no stale short duration leaks into keyboard/wheel navigation.
