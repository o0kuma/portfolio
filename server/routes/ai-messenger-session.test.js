const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '../..');

describe('AIMessenger session persistence', () => {
  test('persists session id across messenger reopen', () => {
    const source = fs.readFileSync(
      path.join(repoRoot, 'client/components/AIMessenger.tsx'),
      'utf8',
    );
    expect(source).toContain("SESSION_STORAGE_KEY = 'ai_chat_session_id'");
    expect(source).toContain('localStorage.getItem(SESSION_STORAGE_KEY)');
    expect(source).toContain('localStorage.setItem(SESSION_STORAGE_KEY');
    expect(source).toMatch(/fetch\(`\/api\/ai\/conversation\/\$\{sessionId\}`\)/);
    const apiFetchIndex = source.indexOf('fetch(`/api/ai/conversation/${sessionId}`)');
    const localStorageIndex = source.indexOf("localStorage.getItem(STORAGE_KEY)");
    expect(apiFetchIndex).toBeGreaterThan(-1);
    expect(localStorageIndex).toBeGreaterThan(apiFetchIndex);
  });
});
