const fs = require('fs');
const path = require('path');

describe('newsletter cron safety', () => {
  test('requires CRON_SECRET in deployed environments', () => {
    const routePath = path.resolve(__dirname, '../../client/app/api/cron/newsletter/route.ts');
    const source = fs.readFileSync(routePath, 'utf8');

    expect(source).toMatch(/CRON_SECRET is required for \/api\/cron\/newsletter/);
    expect(source).toMatch(/process\.env\.NODE_ENV === 'production' \|\| process\.env\.VERCEL/);
    expect(source).toMatch(/status:\s*503/);
  });

  test('only marks posts as newsletter_sent after all subscriber sends succeed', () => {
    const libPath = path.resolve(__dirname, '../../client/lib/newsletter-send.ts');
    const source = fs.readFileSync(libPath, 'utf8');

    expect(source).toMatch(/if \(total > 0 && sent === total\)[\s\S]*newsletter_sent = TRUE/);
  });

  test('admin manual trigger uses authenticated route instead of public cron', () => {
    const adminPagePath = path.resolve(__dirname, '../../client/app/admin/page.tsx');
    const source = fs.readFileSync(adminPagePath, 'utf8');

    expect(source).toMatch(/\/api\/admin\/newsletter\/run/);
    expect(source).not.toMatch(/\/api\/cron\/newsletter/);
  });
});
