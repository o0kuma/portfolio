-- Run once on Neon/PostgreSQL (Master)
ALTER TABLE posts ADD COLUMN IF NOT EXISTS source VARCHAR(20) NOT NULL DEFAULT 'manual';

COMMENT ON COLUMN posts.source IS 'manual | cron';
