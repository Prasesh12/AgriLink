// Thrown anywhere in the app to produce a consistent JSON error response.
class ApiError extends Error {
  constructor(statusCode, message, extra = {}) {
    super(message);
    this.statusCode = statusCode;
    this.extra = extra;
  }
}

module.exports = ApiError;
