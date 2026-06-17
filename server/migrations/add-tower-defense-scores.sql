-- Run once on Neon/PostgreSQL
-- Tower Defense game leaderboard

CREATE TABLE IF NOT EXISTS tower_defense_scores (
  id BIGSERIAL PRIMARY KEY,
  player_name VARCHAR(32) NOT NULL,
  wave INT NOT NULL CHECK (wave >= 1 AND wave <= 9999),
  kills INT NOT NULL CHECK (kills >= 0),
  session_id VARCHAR(64),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tower_defense_scores_wave_created
  ON tower_defense_scores (wave DESC, kills DESC, created_at ASC);

CREATE INDEX IF NOT EXISTS idx_tower_defense_scores_session_day
  ON tower_defense_scores (session_id, created_at DESC)
  WHERE session_id IS NOT NULL;

COMMENT ON TABLE tower_defense_scores IS 'Tower Defense game leaderboard entries submitted from /tower-defense';
