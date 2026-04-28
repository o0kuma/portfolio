/** Playfield width (cells) */
export const COLS = 10
/** Total rows including 2 hidden rows at top for spawn */
export const ROWS = 22
/** First row shown in UI (0-based); rows 0-1 are buffer */
export const VISIBLE_ROW_START = 2
/** Visible row count */
export const VISIBLE_ROWS = ROWS - VISIBLE_ROW_START

export const HIGH_SCORE_KEY = 'tetris-high-score'

/** DAS: delay before auto-shift starts (ms) */
export const DAS_DELAY = 170
/** ARR: auto-repeat interval (ms) */
export const ARR = 50

/** Minimum swipe distance (px) */
export const SWIPE_MIN = 28
/** Tap max movement to count as tap (px) */
export const TAP_MAX = 14
/** Long press for hard drop (ms) */
export const LONG_PRESS_MS = 380
