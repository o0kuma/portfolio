const crypto = require('crypto');

function safeEqual(a, b) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}

function requireAdminToken(req, res, next) {
  const expectedToken = process.env.ADMIN_API_TOKEN;
  const authHeader = req.headers.authorization || '';
  const providedToken = authHeader.startsWith('Bearer ')
    ? authHeader.slice('Bearer '.length).trim()
    : '';

  if (!expectedToken) {
    return res.status(503).json({ error: '관리자 인증이 구성되지 않았습니다.' });
  }

  if (!providedToken || !safeEqual(providedToken, expectedToken)) {
    return res.status(401).json({ error: '관리자 인증이 필요합니다.' });
  }

  return next();
}

module.exports = {
  requireAdminToken
};
