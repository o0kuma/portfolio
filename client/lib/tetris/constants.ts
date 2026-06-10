/** Playfield width (cells) */
export const COLS = 10
/** Total rows (spawn uses top rows as buffer; all rows are drawn so 스폰 조각이 보임) */
export const ROWS = 22
/** First row index rendered (0 = 스폰 버퍼 포함 전 행 표시) */
export const VISIBLE_ROW_START = 0
/** Rows drawn in the UI — matches engine ROWS */
export const VISIBLE_ROWS = ROWS

export const HIGH_SCORE_KEY = 'tetris-high-score'
export const TETRIS_PLAYER_NAME_KEY = 'tetris_player_name'
export const TETRIS_SESSION_ID_KEY = 'tetris_session_id'

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
