const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '../..');

describe('Next.js posts admin security', () => {
  test('does not embed admin token in public client bundles', () => {
    const files = [
      'client/app/posts/page.tsx',
      'client/app/posts/[id]/page.tsx',
      'client/components/CreatePostForm.tsx',
    ];

    for (const rel of files) {
      const source = fs.readFileSync(path.join(repoRoot, rel), 'utf8');
      expect(source).not.toMatch(/NEXT_PUBLIC_ADMIN_TOKEN/);
    }
  });

  test('whitelists post update columns to block SQL injection via keys', () => {
    const routePath = path.join(repoRoot, 'client/app/api/posts/[id]/route.ts');
    const source = fs.readFileSync(routePath, 'utf8');

    expect(source).toMatch(/ALLOWED_POST_COLUMNS/);
    expect(source).toMatch(/ALLOWED_POST_COLUMNS\.has\(k\)/);
  });

  test('whitelists project update columns to block SQL injection via keys', () => {
    const routePath = path.join(repoRoot, 'client/app/api/projects/[id]/route.ts');
    const source = fs.readFileSync(routePath, 'utf8');

    expect(source).toMatch(/ALLOWED_PROJECT_COLUMNS/);
    expect(source).toMatch(/ALLOWED_PROJECT_COLUMNS\.has\(column\)/);
  });
});
