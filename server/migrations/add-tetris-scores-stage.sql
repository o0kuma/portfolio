-- Run once on Neon/PostgreSQL after add-tetris-scores.sql
-- Stage ranking: 20 lines per stage, max stage 10

ALTER TABLE tetris_scores ADD COLUMN IF NOT EXISTS stage SMALLINT NOT NULL DEFAULT 1;

-- lines may already exist (nullable); ensure NOT NULL + default
ALTER TABLE tetris_scores ADD COLUMN IF NOT EXISTS lines INT NOT NULL DEFAULT 0;

UPDATE tetris_scores SET lines = 0 WHERE lines IS NULL;
ALTER TABLE tetris_scores ALTER COLUMN lines SET DEFAULT 0;
ALTER TABLE tetris_scores ALTER COLUMN lines SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_tetris_scores_stage_lines_score
  ON tetris_scores (stage DESC, lines DESC, score DESC);
