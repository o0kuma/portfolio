const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '../..');

describe('portfolio route gate', () => {
  test('index and case-study pages share isPortfolioPublic() runtime gate', () => {
    const indexPath = path.join(repoRoot, 'client/app/portfolio/page.tsx');
    const slugPath = path.join(repoRoot, 'client/app/portfolio/[slug]/page.tsx');

    const indexSource = fs.readFileSync(indexPath, 'utf8');
    const slugSource = fs.readFileSync(slugPath, 'utf8');

    for (const source of [indexSource, slugSource]) {
      expect(source).toMatch(/isPortfolioPublic/);
      expect(source).toMatch(/notFound\(\)/);
      expect(source).toMatch(/dynamic\s*=\s*['"]force-dynamic['"]/);
    }
  });

  test('case-study pages are not statically pre-rendered (gate must run per request)', () => {
    const slugPath = path.join(repoRoot, 'client/app/portfolio/[slug]/page.tsx');
    const slugSource = fs.readFileSync(slugPath, 'utf8');

    expect(slugSource).not.toMatch(/generateStaticParams/);
  });
});
