const fs = require('fs');
const path = require('path');

describe('AI translate Next.js route', () => {
  test('translate route exists for Vercel/production AIMessenger', () => {
    const routePath = path.resolve(__dirname, '../../client/app/api/ai/translate/route.ts');
    expect(fs.existsSync(routePath)).toBe(true);
  });

  test('aiService calls same-origin translate endpoint', () => {
    const servicePath = path.resolve(__dirname, '../../client/utils/aiService.ts');
    const source = fs.readFileSync(servicePath, 'utf8');

    expect(source).toContain("fetch('/api/ai/translate'");
    expect(source).not.toMatch(/\$\{API_BASE_URL\}\/api\/ai\/translate/);
  });

  test('translate route enforces anonymous quota before Gemini', () => {
    const routePath = path.resolve(__dirname, '../../client/app/api/ai/translate/route.ts');
    const source = fs.readFileSync(routePath, 'utf8');

    expect(source).toContain('enforceAiQuota(request, \'translate\')');
    expect(source).toContain('recordAiUsage(quotaCtx, \'translate\'');
  });
});
