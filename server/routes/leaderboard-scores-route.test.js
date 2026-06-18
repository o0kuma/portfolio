const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '../..');

function readRouteSource(relativePath) {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

describe('leaderboard score API routes (tetris, tower-defense)', () => {
  const routes = [
    'client/app/api/tetris/scores/route.ts',
    'client/app/api/tower-defense/scores/route.ts',
  ];

  test.each(routes)('%s allows optional playerName (defaults via sanitize)', (routePath) => {
    const source = readRouteSource(routePath);
    expect(source).toMatch(/playerName:\s*z\.string\(\)\.max\(50\)\.optional\(\)/);
    expect(source).not.toMatch(/playerName:\s*z\.string\(\)\.min\(1\)/);
    expect(source).toContain('sanitizePlayerName');
  });

  test.each(routes)('%s strips control chars, not punctuation/spaces', (routePath) => {
    const source = readRouteSource(routePath);
    expect(source).toMatch(/\\u0000-\\u001f\\u007f/);
    expect(source).not.toMatch(/\.replace\(\/\[ -]\//);
  });
});
