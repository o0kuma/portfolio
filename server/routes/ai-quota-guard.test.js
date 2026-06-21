const fs = require('fs');
const path = require('path');

const clientRoot = path.resolve(__dirname, '../../client');

function readClientFile(relativePath) {
  return fs.readFileSync(path.join(clientRoot, relativePath), 'utf8');
}

describe('AI quota guard on Gemini proxy routes', () => {
  const protectedRoutes = [
  'app/api/ai/translate/route.ts',
  'app/api/ai/improve/route.ts',
  'app/api/ai/summarize/route.ts',
];

  test.each(protectedRoutes)('%s enforces subscription quota before Gemini', (routePath) => {
    const source = readClientFile(routePath);
    expect(source).toContain("from '@/lib/ai-chat-quota'");
    expect(source).toContain('reserveAnonymousAiQuota');
    expect(source).toContain('addAnonymousAiTokens');
  });

  test('ai-quota-guard blocks when subscription check is unavailable', () => {
    const source = readClientFile('lib/ai-quota-guard.ts');
    expect(source).toContain('SUBSCRIPTION_CHECK_UNAVAILABLE');
    expect(source).toContain('DAILY_LIMIT_EXCEEDED');
    expect(source).toContain('getAnonymousQuotaIdentity');
  });

  test('chat route enforces subscription quota via direct DB reserve', () => {
    const source = readClientFile('app/api/ai/chat/route.ts');
    expect(source).toContain("from '@/lib/ai-chat-quota'");
    expect(source).toContain('reserveAnonymousChatQuota');
    expect(source).toContain('DAILY_LIMIT_EXCEEDED');
  });

  test('test-email-config is disabled on production/Vercel', () => {
    const source = readClientFile('app/api/test-email-config/route.ts');
    expect(source).toMatch(/NODE_ENV === 'production'/);
    expect(source).toMatch(/process\.env\.VERCEL/);
    expect(source).toContain('404');
  });
});
