/**
 * JWT authentication middleware.
 * Verifies the Bearer token from the Authorization header.
 *
 * Usage: router.get('/protected', auth, handler);
 */
const jwt = require('jsonwebtoken');

function auth(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    const err = new Error('未提供认证令牌');
    err.statusCode = 401;
    err.isOperational = true;
    return next(err);
  }

  const token = header.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, nickname, ... }
    next();
  } catch (_err) {
    const error = new Error('认证令牌无效或已过期');
    error.statusCode = 401;
    error.isOperational = true;
    next(error);
  }
}

module.exports = auth;
