-- Run once on Neon/PostgreSQL
-- Survive game leaderboard

CREATE TABLE IF NOT EXISTS survive_scores (
  id BIGSERIAL PRIMARY KEY,
  player_name VARCHAR(32) NOT NULL,
  time_sec INT NOT NULL CHECK (time_sec >= 0 AND time_sec <= 99999),
  level INT NOT NULL CHECK (level >= 1 AND level <= 999),
  kills INT NOT NULL CHECK (kills >= 0),
  session_id VARCHAR(64),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_survive_scores_time_created
  ON survive_scores (time_sec DESC, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_survive_scores_session_day
  ON survive_scores (session_id, created_at DESC)
  WHERE session_id IS NOT NULL;

COMMENT ON TABLE survive_scores IS 'Survive game leaderboard entries submitted from /survive';
