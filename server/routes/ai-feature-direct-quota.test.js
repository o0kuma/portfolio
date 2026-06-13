const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '../..');

describe('AI feature routes use direct DB quota (no Vercel self-fetch)', () => {
  const featureRoutes = [
  'client/app/api/ai/translate/route.ts',
  'client/app/api/ai/improve/route.ts',
  'client/app/api/ai/summarize/route.ts',
];

  test.each(featureRoutes)('%s avoids internal subscription HTTP round-trips', (rel) => {
    const source = fs.readFileSync(path.join(repoRoot, rel), 'utf8');
    expect(source).toContain("from '@/lib/ai-chat-quota'");
    expect(source).toContain('checkAnonymousAiQuota');
    expect(source).toContain('recordAnonymousUsage');
    expect(source).not.toContain('checkAiQuota');
    expect(source).not.toContain('recordAiUsage');
    expect(source).not.toContain('/api/subscription/check');
    expect(source).not.toContain('/api/subscription/usage');
  });

  test('chat route also uses direct DB quota helpers', () => {
    const source = fs.readFileSync(
      path.join(repoRoot, 'client/app/api/ai/chat/route.ts'),
      'utf8',
    );
    expect(source).toContain("from '@/lib/ai-chat-quota'");
    expect(source).toContain('checkAnonymousChatQuota');
    expect(source).not.toContain('/api/subscription/check');
  });

  test('chat route awaits usage recording so Vercel does not drop the DB write', () => {
    const source = fs.readFileSync(
      path.join(repoRoot, 'client/app/api/ai/chat/route.ts'),
      'utf8',
    );
    expect(source).toContain('await recordAnonymousUsage');
    expect(source).not.toMatch(/recordAnonymousUsage\([\s\S]*?\)\.then/);
  });
});
