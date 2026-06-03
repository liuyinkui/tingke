/**
 * Global error handling middleware.
 * Catches all unhandled errors and returns a consistent response.
 */
function errorHandler(err, req, res, _next) {
  console.error('[Error]', err.stack || err.message || err);

  const statusCode = err.statusCode || 500;
  const message = err.isOperational ? err.message : '服务器内部错误';

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    },
  });
}

module.exports = errorHandler;
