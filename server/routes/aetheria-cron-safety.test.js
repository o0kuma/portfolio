const fs = require('fs');
const path = require('path');

describe('aetheria cron safety', () => {
  test('requires CRON_SECRET in deployed environments', () => {
    const routePath = path.resolve(__dirname, '../../client/app/api/cron/aetheria-tick/route.ts');
    const source = fs.readFileSync(routePath, 'utf8');

    expect(source).toMatch(/CRON_SECRET is required for \/api\/cron\/aetheria-tick/);
    expect(source).toMatch(/process\.env\.NODE_ENV === 'production' \|\| process\.env\.VERCEL/);
    expect(source).toMatch(/status:\s*503/);
  });

  test('tick engine uses advisory lock and per-agent transactions', () => {
    const enginePath = path.resolve(__dirname, '../../client/lib/aetheria/engine.ts');
    const source = fs.readFileSync(enginePath, 'utf8');

    expect(source).toMatch(/pg_try_advisory_lock/);
    expect(source).toMatch(/pg_advisory_unlock/);
    expect(source).toMatch(/dbTransaction/);
    expect(source).toMatch(/checkpointIndex/);
  });
});
