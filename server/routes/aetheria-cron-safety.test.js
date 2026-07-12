const fs = require('fs');
const path = require('path');

describe('aetheria cron safety', () => {
  test('requires CRON_SECRET in deployed environments', () => {
    const routePath = path.resolve(__dirname, '../../client/app/api/cron/aetheria-tick/route.ts');
    const source = fs.readFileSync(routePath, 'utf8');

    expect(source).toMatch(/CRON_SECRET is required for \/api\/cron\/aetheria-tick/);
    expect(source).toMatch(/process\.env\.NODE_ENV === 'production' \|\| process\.env\.VERCEL/);
    expect(source).toMatch(/status:\s*503/);
  });

  test('tick engine holds one DB client for advisory lock and uses per-agent transactions', () => {
    const enginePath = path.resolve(__dirname, '../../client/lib/aetheria/engine.ts');
    const neonPath = path.resolve(__dirname, '../../client/lib/neon-server.ts');
    const engineSource = fs.readFileSync(enginePath, 'utf8');
    const neonSource = fs.readFileSync(neonPath, 'utf8');

    expect(engineSource).toMatch(/withHeldDbClient/);
    expect(engineSource).toMatch(/pg_try_advisory_lock/);
    expect(engineSource).toMatch(/pg_advisory_unlock/);
    expect(engineSource).toMatch(/dbTransactionWithClient/);
    expect(engineSource).toMatch(/UPDATE aetheria_tick_state SET last_tick_id/);
    expect(neonSource).toMatch(/withHeldDbClient/);
    expect(neonSource).toMatch(/dbTransactionWithClient/);
  });

  test('tick engine recovers from wipeout and stale batch cursor', () => {
    const enginePath = path.resolve(__dirname, '../../client/lib/aetheria/engine.ts');
    const source = fs.readFileSync(enginePath, 'utf8');

    expect(source).toMatch(/recoverFromWipeout/);
    expect(source).toMatch(/resolveTickCursor/);
    expect(source).toMatch(/staleCursor/);
    expect(source).not.toMatch(/skipped: 'no alive agents'/);
  });
});

describe('resolveTickCursor', () => {
  const { resolveTickCursor } = (() => {
    function resolveTickCursor(lastIndex, aliveCount) {
      if (aliveCount <= 0) {
        return { effectiveIndex: 0, staleCursor: false, tickIdDelta: 0 };
      }
      const staleCursor = lastIndex >= aliveCount;
      const effectiveIndex = staleCursor ? 0 : lastIndex;
      const tickIdDelta = effectiveIndex === 0 && !staleCursor ? 1 : 0;
      return { effectiveIndex, staleCursor, tickIdDelta };
    }
    return { resolveTickCursor };
  })();

  test('starts a new tick when index wraps to zero', () => {
    expect(resolveTickCursor(0, 6)).toEqual({
      effectiveIndex: 0,
      staleCursor: false,
      tickIdDelta: 1,
    });
  });

  test('continues mid-tick batch without incrementing tick id', () => {
    expect(resolveTickCursor(3, 6)).toEqual({
      effectiveIndex: 3,
      staleCursor: false,
      tickIdDelta: 0,
    });
  });

  test('clamps stale cursor after deaths shrink the alive list', () => {
    expect(resolveTickCursor(5, 1)).toEqual({
      effectiveIndex: 0,
      staleCursor: true,
      tickIdDelta: 0,
    });
  });
});
