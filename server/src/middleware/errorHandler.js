const ApiError = require('../utils/ApiError');

// Central error handler: every route/middleware error ends up here as one JSON shape.
function errorHandler(err, req, res, _next) {
  // Multer (file upload) errors, e.g. file too large.
  if (err.name === 'MulterError') {
    return res.status(400).json({ success: false, data: null, message: err.message });
  }

  // Prisma unique constraint violation (duplicate phone/email/citizenshipNo/etc).
  if (err.code === 'P2002') {
    const fields = err.meta?.target || [];
    const fieldList = Array.isArray(fields) ? fields.join(', ') : String(fields);
    return res
      .status(409)
      .json({ success: false, data: null, message: `Duplicate value for: ${fieldList}` });
  }

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
