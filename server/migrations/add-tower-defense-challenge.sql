-- Run once on Neon/PostgreSQL
-- Tower Defense daily challenge support (Feature 8)
-- Safe to run on existing data: column is nullable and added only if missing,
-- so normal-mode rows (challenge_day IS NULL) keep working unchanged.

ALTER TABLE tower_defense_scores
  ADD COLUMN IF NOT EXISTS challenge_day VARCHAR(8);

-- Index for fast per-day challenge leaderboard queries.
CREATE INDEX IF NOT EXISTS idx_tower_defense_scores_challenge_day
  ON tower_defense_scores (challenge_day, wave DESC, kills DESC, created_at ASC)
  WHERE challenge_day IS NOT NULL;

COMMENT ON COLUMN tower_defense_scores.challenge_day IS 'UTC YYYYMMDD of the daily challenge run; NULL = normal endless mode';
