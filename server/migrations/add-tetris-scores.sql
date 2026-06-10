-- Run once on Neon/PostgreSQL (Master)
-- Tetris leaderboard / play history (public scores only; no moderation column)

CREATE TABLE IF NOT EXISTS tetris_scores (
  id BIGSERIAL PRIMARY KEY,
  player_name VARCHAR(32) NOT NULL,
  score INT NOT NULL CHECK (score >= 0 AND score <= 999999),
  lines INT,
  level INT,
  session_id VARCHAR(64),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tetris_scores_score_created
  ON tetris_scores (score DESC, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_tetris_scores_session_day
  ON tetris_scores (session_id, created_at DESC)
  WHERE session_id IS NOT NULL;

COMMENT ON TABLE tetris_scores IS 'Tetris leaderboard entries submitted from /tetris';
