-- Deduplicate anonymous ai_usage rows (NULL user_id) before adding a partial unique index.
-- Concurrent session-based upserts could insert multiple rows because UNIQUE(user_id, date, usage_type)
-- does not treat NULL user_id values as equal in PostgreSQL.

WITH ranked AS (
  SELECT
    id,
    session_id,
    date,
    usage_type,
    SUM(message_count) OVER (PARTITION BY session_id, date, usage_type) AS total_messages,
    SUM(tokens_used) OVER (PARTITION BY session_id, date, usage_type) AS total_tokens,
    ROW_NUMBER() OVER (
      PARTITION BY session_id, date, usage_type
      ORDER BY created_at ASC NULLS LAST, id ASC
    ) AS rn
  FROM ai_usage
  WHERE user_id IS NULL
    AND session_id IS NOT NULL
)
UPDATE ai_usage AS u
SET
  message_count = ranked.total_messages,
  tokens_used = ranked.total_tokens
FROM ranked
WHERE u.id = ranked.id
  AND ranked.rn = 1;

DELETE FROM ai_usage AS u
USING (
  SELECT id
  FROM (
    SELECT
      id,
      ROW_NUMBER() OVER (
        PARTITION BY session_id, date, usage_type
        ORDER BY created_at ASC NULLS LAST, id ASC
      ) AS rn
    FROM ai_usage
    WHERE user_id IS NULL
      AND session_id IS NOT NULL
  ) ranked
  WHERE rn > 1
) dup
WHERE u.id = dup.id;

CREATE UNIQUE INDEX IF NOT EXISTS idx_ai_usage_anon_session_date_type
  ON ai_usage (session_id, date, usage_type)
  WHERE user_id IS NULL AND session_id IS NOT NULL;
