# 007 — Animate Kuuma's speech bubble and chat panel enter/exit

- **Status**: TODO
- **Commit**: e40b7ad
- **Severity**: MEDIUM
- **Category**: Purpose & frequency / Missed opportunities
- **Estimated scope**: 1 file (`components/KuumaCompanion.tsx`), 2 render blocks

## Problem

Two spatially-connected, frequently-triggered UI elements in `components/KuumaCompanion.tsx` mount/unmount with a hard cut — no animation at all:

```tsx
/* components/KuumaCompanion.tsx:434-459 — current, speech bubble */
{bubble && !isOpen && (
  <div
    style={{
      position: 'fixed',
      left: pos.x,
      top: pos.y - 52,
      zIndex: 9998,
      transform: 'translateX(-50%)',
      pointerEvents: 'none',
    }}
  >
    <div
      className="bg-black/90 border border-cyan-500/50 text-cyan-300 text-xs font-mono px-3 py-1.5 rounded-sm"
      style={{
        boxShadow: '0 0 10px rgb(34 211 238 / 0.2)',
        whiteSpace: 'nowrap',
        maxWidth: '260px',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      }}
    >
      {bubble}
      <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-2 h-2 bg-black border-r border-b border-cyan-500/50 rotate-45" />
    </div>
  </div>
)}
```

```tsx
/* components/KuumaCompanion.tsx:518-528 — current, chat panel header (structure only, contents below unchanged) */
{isOpen && (
  <div
    style={{
      position: 'fixed',
      bottom: '24px',
      left: '24px',
      zIndex: 10000,
      pointerEvents: 'auto',
    }}
    className="w-72 bg-black/95 border border-cyan-500/30 rounded-sm font-mono"
  >
```

The bubble fires on a recurring 45–75 second timer plus idle/dwell triggers (per `showBubble`, called from multiple places in the file) for as long as the visitor is on the page — a routine, frequently-seen element with zero animation investment. The chat panel is spatially anchored to its own trigger button (the fixed bottom-left toggle, `components/KuumaCompanion.tsx:489-516`) but appears with no motion connecting it to that trigger. AUDIT.md §8 (Missed opportunities): "Spatially-connected UI (a panel that appears from a trigger) with no motion explaining where it came from." AUDIT.md §3 (Physicality): entrances should use `scale: 0.9-0.97` + `opacity: 0`, never a hard cut.

## Target

Wrap both conditional blocks in Framer Motion's `AnimatePresence` + `motion.div`, using an entrance that scales up slightly from near the trigger/character position (not from `scale(0)`) and fades in, with an UI-appropriate duration per AUDIT.md's budget table ("Tooltips, small popovers: 125-200ms" for the bubble; "Modals, drawers: 200-500ms" for the panel, since it's a bigger, occasional-toggle surface).

```tsx
/* target — components/KuumaCompanion.tsx, imports */
import { AnimatePresence, motion } from 'framer-motion'
```

```tsx
/* target — speech bubble, replace the conditional block */
<AnimatePresence>
  {bubble && !isOpen && (
    <motion.div
      key="kuuma-bubble"
      initial={{ opacity: 0, scale: 0.92, y: 4 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.92, y: 4 }}
      transition={{ duration: 0.16, ease: 'easeOut' }}
      style={{
        position: 'fixed',
        left: pos.x,
        top: pos.y - 52,
        zIndex: 9998,
        pointerEvents: 'none',
      }}
    >
      <div
        style={{ transform: 'translateX(-50%)' }}
        className="bg-black/90 border border-cyan-500/50 text-cyan-300 text-xs font-mono px-3 py-1.5 rounded-sm"
      >
        <div
          style={{
            boxShadow: '0 0 10px rgb(34 211 238 / 0.2)',
            whiteSpace: 'nowrap',
            maxWidth: '260px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {bubble}
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-2 h-2 bg-black border-r border-b border-cyan-500/50 rotate-45" />
        </div>
      </div>
    </motion.div>
  )}
</AnimatePresence>
```

Note the restructure: the outer fixed-position `div` no longer carries the `transform: translateX(-50%)` centering AND the motion `initial/animate/exit` transform simultaneously — Framer Motion needs to own `transform` on the animated element itself, so the `translateX(-50%)` centering moved to the inner static `div` instead, while the outer `motion.div` handles positioning (`left`/`top`) and the scale/opacity/y motion.

```tsx
/* target — chat panel, replace the conditional block's opening tag (contents inside unchanged) */
<AnimatePresence>
  {isOpen && (
    <motion.div
      key="kuuma-panel"
      initial={{ opacity: 0, scale: 0.95, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 8 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      style={{
        position: 'fixed',
        bottom: '24px',
        left: '24px',
        zIndex: 10000,
        pointerEvents: 'auto',
        transformOrigin: 'bottom left',
      }}
      className="w-72 bg-black/95 border border-cyan-500/30 rounded-sm font-mono"
    >
      {/* ...everything currently inside this div stays exactly as-is... */}
    </motion.div>
  )}
</AnimatePresence>
```

`transformOrigin: 'bottom left'` makes the panel visually grow from the corner where its trigger button sits (bottom-left), satisfying AUDIT.md §3's "popovers scale from their trigger" rule.

## Repo conventions to follow

- `components/portfolio/ProjectModal.tsx` already uses the `initial`/`animate`/`exit` + `AnimatePresence` pattern for a modal-like surface — mirror its structure (though use this plan's own duration/curve values, not ProjectModal's, since these are smaller/more frequent UI, not a modal).
- Keep using inline `style` objects for `position`/`zIndex`/`pointerEvents` (matching this file's existing convention) — only add Framer Motion's `initial`/`animate`/`exit`/`transition` props, don't convert to Tailwind classes.

## Steps

1. Add `AnimatePresence` and `motion` to `components/KuumaCompanion.tsx`'s imports (it currently has no `framer-motion` import at all — add a new line: `import { AnimatePresence, motion } from 'framer-motion'`).
2. Replace the speech-bubble conditional block (the `{bubble && !isOpen && (...)}` JSX) with the target version above — note the restructuring of where `translateX(-50%)` lives (moved from the outer fixed div to the inner static div, since the outer div becomes the `motion.div` and Framer Motion needs sole ownership of its `transform`).
3. Change the outer element from a plain `<div>` to `<motion.div>` with the `initial`/`animate`/`exit`/`transition` props shown, and wrap the whole conditional in `<AnimatePresence>...</AnimatePresence>`.
4. Replace the chat panel's opening `<div style={{...}} className="w-72 ...">` tag with `<motion.div key="kuuma-panel" initial={...} animate={...} exit={...} transition={...} style={{...}} className="w-72 ...">` as shown, and its closing `</div>` with `</motion.div>`. Wrap the whole `{isOpen && (...)}` conditional in `<AnimatePresence>...</AnimatePresence>`. Do not touch anything between the opening and closing tags (header, messages list, input) — only the outermost element type and its props change.

## Boundaries

- Do NOT change the bubble's or panel's inner contents (text, buttons, message list, input) — only the outer wrapping element and its entrance/exit motion.
- Do NOT change `showBubble`'s timing logic (`setTimeout` durations for how long the bubble stays up) — that's plan 008's territory, not this one.
- Do NOT add reduced-motion branching here — that's plan 001's territory; if plan 001 lands first, `AnimatePresence`/`motion.div` respect Framer Motion's own `useReducedMotion` only if explicitly wired, which this plan does not do. If both plans are applied, note in your PR/commit that a follow-up may want `transition={reduced ? { duration: 0 } : { duration: 0.16, ease: 'easeOut' }}` — but do not implement that here unless explicitly asked; keep this plan's diff scoped to adding the motion, not reduced-motion wiring.
- If the current code doesn't match the excerpts above (drift since commit `e40b7ad`), STOP and report instead of improvising.

## Verification

- **Mechanical**: `cd client && npx tsc --noEmit` and `npm run build` both succeed.
- **Feel check**:
  - Trigger a Kuuma speech bubble (wait for the periodic timer, or open the browser console and manually navigate between sections to trigger a section-change bubble) and confirm it now fades/scales in near the character instead of popping instantly.
  - Wait for the bubble to auto-dismiss (5s per the existing `bubbleTimeoutRef` timer) and confirm it fades/scales out rather than vanishing.
  - Click the chat toggle button: confirm the panel now grows from the bottom-left corner (where the button sits) rather than appearing instantly.
  - Close the panel: confirm it shrinks back toward that same corner.
  - In DevTools Animations panel, set playback to 10% and scrub through both the bubble and panel open animations — confirm no visual jump/flash mid-animation.
  - Rapidly toggle the chat panel open/close several times in a row (stress the interruptibility): confirm `AnimatePresence` handles the rapid remounts without the panel getting stuck half-visible or duplicating.
- **Done when**: both elements have a visible, subtle enter/exit animation anchored near their spatial origin, and rapid toggling doesn't produce stuck or duplicated panels/bubbles.
