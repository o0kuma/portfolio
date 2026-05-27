jest.mock('pg', () => ({
  Pool: jest.fn()
}));

const { Pool } = require('pg');
const { main } = require('./cleanup-old-posts');

describe('cleanup-old-posts script', () => {
  const originalArgv = process.argv;
  const originalEnv = process.env;
  const query = jest.fn();
  const end = jest.fn();
  let logSpy;
  let warnSpy;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = {
      ...originalEnv,
      DATABASE_URL: 'postgres://user:pass@example.com/db'
    };
    process.argv = ['node', 'cleanup-old-posts.js'];
    Pool.mockImplementation(() => ({ query, end }));
    end.mockResolvedValue(undefined);
    logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    process.argv = originalArgv;
    process.env = originalEnv;
    logSpy.mockRestore();
    warnSpy.mockRestore();
  });

  test('defaults to dry-run and does not delete previewed posts', async () => {
    query.mockResolvedValueOnce({
      rows: [
        {
          id: 'post-1',
          title: 'Cron post',
          category: 'general',
          created_at: new Date(Date.now() - 31 * 86400000).toISOString()
        }
      ]
    });

    await main();

    expect(query).toHaveBeenCalledTimes(1);
    expect(query.mock.calls[0][0]).toContain('SELECT id, title, category, created_at');
    expect(query.mock.calls[0][0]).toMatch(/source\s*=\s*'cron'/i);
    expect(query.mock.calls[0][0]).not.toContain('DELETE FROM posts');
    expect(end).toHaveBeenCalledTimes(1);
  });

  test('deletes old cron posts only when --confirm is provided', async () => {
    process.argv = ['node', 'cleanup-old-posts.js', '--confirm'];
    query
      .mockResolvedValueOnce({
        rows: [
          {
            id: 'post-1',
            title: 'Cron post',
            category: 'general',
            created_at: new Date(Date.now() - 31 * 86400000).toISOString()
          }
        ]
      })
      .mockResolvedValueOnce({
        rows: [{ id: 'post-1', title: 'Cron post' }]
      });

    await main();

    expect(query).toHaveBeenCalledTimes(2);
    expect(query.mock.calls[1][0]).toContain('DELETE FROM posts');
    expect(query.mock.calls[1][0]).toMatch(/source\s*=\s*'cron'/i);
    expect(end).toHaveBeenCalledTimes(1);
  });

  test('skips cleanup when posts.source column is missing', async () => {
    query.mockRejectedValueOnce(new Error('column "source" does not exist'));

    await main();

    expect(query).toHaveBeenCalledTimes(1);
    expect(query.mock.calls[0][0]).not.toContain('DELETE FROM posts');
    expect(warnSpy).toHaveBeenCalled();
    expect(end).toHaveBeenCalledTimes(1);
  });
});
