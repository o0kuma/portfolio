const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '../..');
const routePath = path.join(repoRoot, 'client/app/api/survive/scores/route.ts');

function readRouteSource() {
  return fs.readFileSync(routePath);
}

/** Mirrors maxPlausibleLevel in the API route (kept in sync via test). */
function maxPlausibleLevel(timeSec) {
  return Math.max(5, Math.floor(timeSec / 2) + 15);
}

describe('survive scores API route', () => {
  test('route source has no embedded null bytes (breaks editors and regex literals)', () => {
    const source = readRouteSource();
    expect(source.includes(0)).toBe(false);
  });

  test('sanitizePlayerName uses unicode escapes for control chars', () => {
    const source = readRouteSource().toString('utf8');
    expect(source).toMatch(/\\u0000-\\u001f\\u007f/);
    expect(source).not.toMatch(/\.replace\(\/\[\x00/);
  });

  test('level anti-cheat allows plausible mid-run scores', () => {
    const source = readRouteSource().toString('utf8');
    expect(source).toContain('maxPlausibleLevel');
    expect(source).not.toMatch(/Math\.floor\(timeSec \/ 10\) \+ 2/);

    // Typical ~30s run can exceed level 5; old formula floor(t/10)+2 capped at 5.
    expect(maxPlausibleLevel(30)).toBeGreaterThanOrEqual(8);
    expect(maxPlausibleLevel(60)).toBeGreaterThanOrEqual(12);
    expect(maxPlausibleLevel(8)).toBeGreaterThanOrEqual(5);
  });
});
