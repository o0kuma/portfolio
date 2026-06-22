const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '../..');

describe('admin login security', () => {
  test('login route fails closed in production when ADMIN_PASSWORD is unset', () => {
    const source = fs.readFileSync(
      path.join(repoRoot, 'client/app/api/admin/login/route.ts'),
      'utf8',
    );
    expect(source).toMatch(/process\.env\.ADMIN_PASSWORD/);
    expect(source).toMatch(/NODE_ENV === 'production'/);
    expect(source).toMatch(/process\.env\.VERCEL/);
    expect(source).not.toMatch(/\?\? 'admin'/);
    expect(source).toMatch(/503/);
  });
});
