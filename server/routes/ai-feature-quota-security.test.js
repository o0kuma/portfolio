const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '../..');

describe('AI feature quota security', () => {
  const featureRoutes = [
    'client/app/api/ai/translate/route.ts',
    'client/app/api/ai/improve/route.ts',
    'client/app/api/ai/summarize/route.ts',
  ];

  test.each(featureRoutes)('%s enforces subscription quota before Gemini', (rel) => {
    const source = fs.readFileSync(path.join(repoRoot, rel), 'utf8');
    expect(source).toMatch(/enforceAiFeatureQuota/);
    expect(source).toMatch(/recordAiFeatureUsage/);
  });

  test('anonymous quota trusts Vercel proxy headers for stable identity', () => {
    const source = fs.readFileSync(
      path.join(repoRoot, 'client/lib/anonymous-quota.ts'),
      'utf8',
    );
    expect(source).toMatch(/process\.env\.VERCEL/);
  });

  test('test-email-config requires admin auth and omits secret values', () => {
    const source = fs.readFileSync(
      path.join(repoRoot, 'client/app/api/test-email-config/route.ts'),
      'utf8',
    );
    expect(source).toMatch(/checkAdminAuth/);
    expect(source).not.toMatch(/substring\(0,\s*10\)/);
    expect(source).not.toMatch(/allEnvVars/);
    expect(source).not.toMatch(/clientSecretValue/);
  });
});
