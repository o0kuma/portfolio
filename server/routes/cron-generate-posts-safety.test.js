const fs = require('fs');
const path = require('path');

describe('generate-posts cron safety', () => {
  test('cron cleanup only targets posts marked source=cron', () => {
    const cleanupPath = path.resolve(__dirname, '../../client/lib/cleanup-cron-posts.ts');
    const cleanupSource = fs.readFileSync(cleanupPath, 'utf8');

    expect(cleanupSource).toMatch(/source\s*=\s*'cron'/i);
    expect(cleanupSource).not.toMatch(
      /DELETE\s+FROM\s+posts[\s\S]*featured\s*=\s*false(?![\s\S]*source\s*=\s*'cron')/i,
    );
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
