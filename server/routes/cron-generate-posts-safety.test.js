const fs = require('fs');
const path = require('path');

describe('generate-posts cron safety', () => {
  test('does not delete posts from the automatic cron endpoint', () => {
    const routePath = path.resolve(__dirname, '../../client/app/api/cron/generate-posts/route.ts');
    const routeSource = fs.readFileSync(routePath, 'utf8');

    expect(routeSource).not.toMatch(/\bDELETE\s+FROM\s+posts\b/i);
  });
});
