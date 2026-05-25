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
});
