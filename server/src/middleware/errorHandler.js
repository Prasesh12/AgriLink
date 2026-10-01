const ApiError = require('../utils/ApiError');

// Central error handler: every route/middleware error ends up here as one JSON shape.
function errorHandler(err, req, res, _next) {
  const statusCode = err instanceof ApiError ? err.statusCode : err.statusCode || 500;
  const message = err.message || 'Internal server error';
  const extra = err instanceof ApiError ? err.extra : {};

  if (statusCode >= 500) {
    // eslint-disable-next-line no-console
    console.error(err);
  }

  res.status(statusCode).json({
    success: false,
    data: null,
    message,
    ...extra,
  });
}

function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    data: null,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
}

module.exports = { errorHandler, notFoundHandler };
