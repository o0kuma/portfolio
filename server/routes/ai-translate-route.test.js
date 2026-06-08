const fs = require('fs');
const path = require('path');

const clientRoot = path.resolve(__dirname, '../../client');

function readRoute(relativePath) {
  return fs.readFileSync(path.join(clientRoot, relativePath), 'utf8');
}

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

});

describe('AI feature routes enforce subscription quota', () => {
  const quotaRoutes = [
    { file: 'app/api/ai/translate/route.ts', usageType: 'translate' },
    { file: 'app/api/ai/improve/route.ts', usageType: 'improve' },
    { file: 'app/api/ai/summarize/route.ts', usageType: 'summarize' },
  ];

  test.each(quotaRoutes)('$file checks quota before Gemini', ({ file, usageType }) => {
    const source = readRoute(file);
    expect(source).toContain("from '@/lib/ai-quota'");
    expect(source).toContain(`checkAiQuota(request, '${usageType}')`);
    expect(source).toContain(`recordAiUsage(request, '${usageType}'`);
  });

  test('shared ai-quota helper exists', () => {
    const helperPath = path.join(clientRoot, 'lib/ai-quota.ts');
    expect(fs.existsSync(helperPath)).toBe(true);
    const source = readRoute('lib/ai-quota.ts');
    expect(source).toContain('checkAiQuota');
    expect(source).toContain('recordAiUsage');
    expect(source).toContain('dailyTranslations');
  });
});
