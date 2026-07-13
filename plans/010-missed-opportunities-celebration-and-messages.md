# 010 — Add motion to two rare/frequent moments currently rendered flat

- **Status**: TODO
- **Commit**: e40b7ad
- **Severity**: LOW
- **Category**: Missed opportunities
- **Estimated scope**: 2 files (`components/ExplorationBadge.tsx`, `components/KuumaCompanion.tsx`), 2 independent changes — split into two commits/PRs if convenient, they don't depend on each other

## Problem

**A. The 100%-explored celebration is a plain color/text swap.**

```tsx
/* components/ExplorationBadge.tsx:132-137 — current */
{pct === 100 && (
  <p className="mt-2 text-amber-400">
    {locale === 'en' ? '🎉 You explored the whole site!' : '🎉 사이트를 전부 둘러보셨어요!'}
  </p>
)}
```

Reaching 100% already triggers the separate `AchievementToast` popup (via `markEarned('site_explorer')`, `components/ExplorationBadge.tsx` effect near `count === total`), but the badge panel's own celebration line just appears/sits there with no motion of its own. AUDIT.md §8: "Rare, high-emotion moments (first-run, success, celebration) rendered with none of the delight budget they're allowed." This is genuinely rare (happens once per visitor, ever, since it's gated by a `localStorage`-backed achievement) — it's allowed to be more than a static line.

**B. New Kuuma chat messages appear with no motion.**

```tsx
/* components/KuumaCompanion.tsx — current, inside the messages list (exact line numbers may shift slightly depending on whether plan 007 already landed, but the structure is this) */
{messages.map((m, i) => (
  <div
    key={i}
    className={`text-xs ${m.role === 'user' ? 'text-right text-neutral-300' : 'text-left text-cyan-300'}`}
  >
    <span
      className={`inline-block px-2 py-1 max-w-[220px] text-left ${
        m.role === 'user' ? 'bg-neutral-800' : 'bg-cyan-950/50 border border-cyan-500/20'
      } rounded-sm`}
      style={{ wordBreak: 'break-word' }}
    >
      {m.content}
    </span>
  </div>
))}
```

Each new message (user's own, or Kuuma's reply) is appended to `messages` and rendered directly — no entrance animation, so a reply just appears mid-scroll. AUDIT.md §8: "State changes that teleport (content swaps, layout jumps) where a brief transition would prevent a jarring change" — a chat UI is exactly the kind of spatially-connected, content-appending surface where a small appear animation reads as "arriving" rather than "materializing."

## Target

**A.**

```tsx
/* target — components/ExplorationBadge.tsx */
import { motion, AnimatePresence } from 'framer-motion'
// ...
<AnimatePresence>
  {pct === 100 && (
    <motion.p
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="mt-2 text-amber-400"
    >
      {locale === 'en' ? '🎉 You explored the whole site!' : '🎉 사이트를 전부 둘러보셨어요!'}
    </motion.p>
  )}
</AnimatePresence>
```

**B.**

```tsx
/* target — components/KuumaCompanion.tsx */
import { motion, AnimatePresence } from 'framer-motion' // merge with plan 007's import if already added — one import line, not two
// ...
<AnimatePresence initial={false}>
  {messages.map((m, i) => (
    <motion.div
      key={i}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15, ease: 'easeOut' }}
      className={`text-xs ${m.role === 'user' ? 'text-right text-neutral-300' : 'text-left text-cyan-300'}`}
    >
      <span
        className={`inline-block px-2 py-1 max-w-[220px] text-left ${
          m.role === 'user' ? 'bg-neutral-800' : 'bg-cyan-950/50 border border-cyan-500/20'
        } rounded-sm`}
        style={{ wordBreak: 'break-word' }}
      >
        {m.content}
      </span>
    </motion.div>
  ))}
</AnimatePresence>
```

`AnimatePresence initial={false}` on the message list prevents every already-existing message from re-animating in when the panel is reopened — only genuinely new messages (appended after the panel is already showing) should animate.

## Repo conventions to follow

- If plan 007 has already been applied to `components/KuumaCompanion.tsx`, it will have already added `import { AnimatePresence, motion } from 'framer-motion'` — reuse that single import line for part B, do not add a duplicate import statement.
- Keep using `key={i}` for the message list (matches the existing code) — do not change it to a different key strategy as part of this plan, even though array-index keys are generally discouraged; that's out of scope here.

## Steps

1. **Part A**: In `components/ExplorationBadge.tsx`, add `import { motion, AnimatePresence } from 'framer-motion'`. Wrap the `{pct === 100 && (...)}` block in `<AnimatePresence>...</AnimatePresence>`, and change the `<p>` to `<motion.p>` with the `initial`/`animate`/`transition` props shown in Target A.
2. **Part B**: In `components/KuumaCompanion.tsx`, ensure `motion` and `AnimatePresence` are imported from `framer-motion` (add the import if plan 007 wasn't applied first; reuse it if it was). Wrap the `messages.map(...)` call in `<AnimatePresence initial={false}>...</AnimatePresence>`, and change each mapped `<div>` to `<motion.div>` with the `initial`/`animate`/`transition` props shown in Target B, keeping every existing prop (`key`, `className`) and all children exactly as they are.

## Boundaries

- Do NOT change `AchievementToast`, `markEarned`, or any achievement-unlock logic — this plan only adds motion to the badge panel's own celebration text.
- Do NOT change the chat message content, roles, or the `messages` state logic in `sendMessage` — only how each message's wrapper element enters.
- Do NOT reorder or virtualize the message list.
- These two parts are independent — if only one applies cleanly (e.g. the other file has drifted since commit `e40b7ad`), apply the one that matches and report the other as skipped, rather than guessing.

## Verification

- **Mechanical**: `cd client && npx tsc --noEmit` and `npm run build` both succeed.
- **Feel check**:
  - Part A: reach 100% exploration (or temporarily lower the landmark count in `lib/exploration.ts` locally to test faster, then revert) and confirm the celebration line fades/scales in rather than appearing instantly.
  - Part B: open the Kuuma chat panel, send a message, and confirm both your message and Kuuma's reply fade/slide in as they're appended, while previously-sent messages already in the list do NOT re-animate when you close and reopen the panel.
  - Rapid-fire several messages in a row and confirm the list doesn't jank or double-animate any entry.
- **Done when**: the 100% celebration line and each new chat message both have a brief, visible entrance, and reopening the panel doesn't replay old messages' animations.
