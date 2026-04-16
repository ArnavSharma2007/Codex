const logger = require('./logger');

/**
 * Global Express error handler middleware.
 * Must be registered LAST with app.use().
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  logger.error(`[${req.method}] ${req.originalUrl} → ${status}: ${message}`, {
    stack: err.stack,
    body: req.body,
    user: req.user || null,
  });

  res.status(status).json({
    error: {
      message,
      status,
      ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
    },
  });
};

module.exports = errorHandler;
