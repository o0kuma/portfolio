# 008 — Reserve Kuuma's "surprised" emotion flash for real events, not routine bubbles

- **Status**: TODO
- **Commit**: e40b7ad
- **Severity**: MEDIUM
- **Category**: Purpose & frequency
- **Estimated scope**: 1 file (`components/KuumaCompanion.tsx`), 1 function + its call sites

## Problem

`showBubble` unconditionally sets `emotion` to `'surprised'` (a bright orange flash, `kuuma-flash` keyframes, `components/KuumaCompanion.tsx:423-426`) every single time any bubble is shown:

```tsx
/* components/KuumaCompanion.tsx:158-165 — current */
const showBubble = useCallback((text: string) => {
  setBubble(text)
  setEmotion('surprised')
  if (emotionTimerRef.current) clearTimeout(emotionTimerRef.current)
  emotionTimerRef.current = setTimeout(() => setEmotion('idle'), 2000)
  if (bubbleTimeoutRef.current) clearTimeout(bubbleTimeoutRef.current)
  bubbleTimeoutRef.current = setTimeout(() => setBubble(null), 5000)
}, [])
```

`showBubble` is called from the routine, recurring section-message timer (`components/KuumaCompanion.tsx:216,285,290`, firing every 45-75 seconds indefinitely for the whole session) as well as from the dwell-nudge (fires once per section-visit when the visitor lingers) and the returning-visitor greeting (fires once per session). AUDIT.md §1 (Purpose & frequency): "Every animation must answer 'why does this animate?' ... 'It looks cool' on a frequently-seen element is not a purpose," and the frequency table says occasional/rare moments "can add delight" — implying routine ones should NOT spend that same delight budget. Flashing "surprised" on every routine 45-75s tick dilutes the one emotional beat that's supposed to mean something (an actual attention-grabbing moment), and after enough repetitions it stops registering as anything at all.

## Target

Give `showBubble` an optional parameter for which emotion to flash, defaulting to a calmer one for routine messages, and reserve `'surprised'` for calls that represent a genuinely novel moment (the returning-visitor greeting, and the dwell-nudge — both fire at most once per section-visit/session, not on a tight recurring timer).

```tsx
/* target — components/KuumaCompanion.tsx */
const showBubble = useCallback((text: string, flashEmotion: Emotion = 'happy') => {
  setBubble(text)
  setEmotion(flashEmotion)
  if (emotionTimerRef.current) clearTimeout(emotionTimerRef.current)
  emotionTimerRef.current = setTimeout(() => setEmotion('idle'), 2000)
  if (bubbleTimeoutRef.current) clearTimeout(bubbleTimeoutRef.current)
  bubbleTimeoutRef.current = setTimeout(() => setBubble(null), 5000)
}, [])
```

Then at each call site, pass `'surprised'` only where it's warranted:

- The routine rotating section-message timer (the `setInterval` that calls `showBubble(msg)` on a 45-75s cadence): call with no second argument (defaults to `'happy'`).
- The initial per-section bubble (fired once when `currentSection` changes, via the `setTimeout` wrapping `showBubble(bubbleText)`): this is a first-encounter-with-this-section moment — call with `'surprised'` explicitly, e.g. `showBubble(bubbleText, 'surprised')`, since it's genuinely novel (new section) not routine repetition.
- The dwell-nudge (`showBubble(msg)` inside the idle-wander effect's dwell-check branch): keep `'surprised'`, e.g. `showBubble(msg, 'surprised')` — this fires at most once per section-visit and is meant to catch attention.

## Repo conventions to follow

- `Emotion` type is already defined in this file (`type Emotion = 'idle' | 'happy' | 'thinking' | 'surprised' | 'error'`) — reuse it verbatim for the new parameter's type, don't redefine or widen it.
- Keep the function's existing bubble-dismiss/emotion-reset timers (`emotionTimerRef`, `bubbleTimeoutRef`) completely unchanged — this plan only changes which emotion gets set initially, not the timing/cleanup logic.

## Steps

1. Change `showBubble`'s signature from `(text: string)` to `(text: string, flashEmotion: Emotion = 'happy')`, and change its `setEmotion('surprised')` line to `setEmotion(flashEmotion)`.
2. Find the routine rotating-message `setInterval` callback (the one inside the "Proactive messages on section change" effect that runs every `45000 + Math.random() * 15000` ms) and confirm its `showBubble(msg)` call has no second argument — leave it as-is (it will now default to `'happy'` automatically from step 1's default parameter).
3. Find the initial per-section bubble call (the `setTimeout(() => { ... showBubble(bubbleText) ... }, 5000)` inside the same effect, which fires once when `currentSection` first settles) and change it to `showBubble(bubbleText, 'surprised')`.
4. Find the dwell-nudge call (inside the "Idle wander behavior + behavior-based dwell nudge" effect, the `showBubble(msg)` call that fires when `idleMs > 20000` and the section hasn't been dwell-nudged yet) and change it to `showBubble(msg, 'surprised')`.

## Boundaries

- Do NOT change the `'idle'`/`'error'`/`'thinking'` emotion transitions used elsewhere in the file (e.g. inside `sendMessage`) — this plan is scoped only to `showBubble`'s default and its callers.
- Do NOT change the 2000ms/5000ms timer durations.
- Do NOT add a new `Emotion` value — only reassign which existing values are used where.
- If any call site doesn't match what's described above (drift since commit `e40b7ad`), STOP and report instead of improvising — there are exactly three `showBubble(...)` call sites in this file; if you find a different number, stop.

## Verification

- **Mechanical**: `cd client && npx tsc --noEmit` and `npm run build` both succeed.
- **Feel check**:
  - Load the home page, wait for the periodic rotating message to fire (45-75s — or temporarily lower the interval locally to test faster, then revert): confirm the mascot's glow does the calmer "happy" pulse, not the orange flash.
  - Navigate between different page sections (triggering `currentSection` changes) and confirm the very first bubble after arriving at a new section still gets the orange "surprised" flash.
  - Stay idle with the mouse still on a content-heavy section (projects/games/skills/posts) for 20+ seconds and confirm the dwell-nudge bubble also gets the "surprised" flash.
- **Done when**: the orange flash is visibly rarer over a multi-minute session (only on section-arrival and dwell-nudges), while the recurring rotation uses the calmer happy pulse.
