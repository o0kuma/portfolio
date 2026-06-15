const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '../..');

describe('anonymous chat quota reserve', () => {
  test('reserve uses atomic upsert with limit guard before Gemini', () => {
    const source = fs.readFileSync(
      path.join(repoRoot, 'client/lib/ai-chat-quota.ts'),
      'utf8',
    );

    expect(source).toMatch(/export async function reserveAnonymousChatQuota/);
    expect(source).toMatch(
      /ON CONFLICT \(session_id, date, usage_type\) WHERE user_id IS NULL AND session_id IS NOT NULL/,
    );
    expect(source).toMatch(/WHERE ai_usage\.message_count < \$3/);
    expect(source).toMatch(/RETURNING message_count/);
  });

  test('chat route reserves quota before generating AI response', () => {
    const source = fs.readFileSync(
      path.join(repoRoot, 'client/app/api/ai/chat/route.ts'),
      'utf8',
    );

    const reserveIndex = source.indexOf('reserveAnonymousChatQuota');
    const generateIndex = source.indexOf('generateAIResponse(');

    expect(reserveIndex).toBeGreaterThan(-1);
    expect(generateIndex).toBeGreaterThan(reserveIndex);
    expect(source).not.toMatch(/recordAnonymousUsage\([\s\S]*?\)\.then/);
  });
});
