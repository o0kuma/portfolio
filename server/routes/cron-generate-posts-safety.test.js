const fs = require('fs');
const path = require('path');

describe('generate-posts cron safety', () => {
  test('age-based cron cleanup only targets non-featured cron posts', () => {
    const cleanupPath = path.resolve(__dirname, '../../client/lib/cleanup-cron-posts.ts');
    const cleanupSource = fs.readFileSync(cleanupPath, 'utf8');
    const ageStep = cleanupSource.match(/Step 1[\s\S]*?RETURNING id`/)?.[0] ?? '';

    expect(ageStep).toMatch(/source\s*=\s*'cron'/i);
    expect(ageStep).toMatch(/featured\s*=\s*false/i);
  });

  test('count-based cron pruning also skips featured posts', () => {
    const cleanupPath = path.resolve(__dirname, '../../client/lib/cleanup-cron-posts.ts');
    const cleanupSource = fs.readFileSync(cleanupPath, 'utf8');
    const countStep = cleanupSource.match(/Step 2[\s\S]*?RETURNING id`/)?.[0] ?? '';

    expect(countStep).toMatch(/source\s*=\s*'cron'/i);
    expect(countStep).toMatch(/featured\s*=\s*false/i);
  });

  test('manual cleanup script only targets posts marked source=cron', () => {
    const scriptPath = path.resolve(__dirname, '../scripts/cleanup-old-posts.js');
    const scriptSource = fs.readFileSync(scriptPath, 'utf8');

    expect(scriptSource).toMatch(/source\s*=\s*'cron'/i);
    expect(scriptSource).not.toMatch(
      /DELETE\s+FROM\s+posts[\s\S]*featured\s*=\s*false(?![\s\S]*source\s*=\s*'cron')/i,
    );
  });
});
