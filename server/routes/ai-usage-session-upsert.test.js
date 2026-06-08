const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '../..');

describe('anonymous ai_usage session upsert', () => {
  test('usage route uses atomic upsert for anonymous session rows', () => {
    const source = fs.readFileSync(
      path.join(repoRoot, 'client/app/api/subscription/usage/route.ts'),
      'utf8',
    );

    expect(source).toMatch(/ON CONFLICT \(session_id, date, usage_type\) WHERE user_id IS NULL/);
    expect(source).toMatch(/user_id IS NULL/);
  });

  test('migration adds partial unique index for anonymous ai_usage rows', () => {
    const source = fs.readFileSync(
      path.join(repoRoot, 'server/migrations/add-ai-usage-session-unique.sql'),
      'utf8',
    );

    expect(source).toMatch(/idx_ai_usage_anon_session_date_type/);
    expect(source).toMatch(/WHERE user_id IS NULL/);
  });
});
