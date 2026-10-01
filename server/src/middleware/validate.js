const { ZodError } = require('zod');
const ApiError = require('../utils/ApiError');

// Validates (and coerces/defaults) req[source] against a Zod schema, replacing it with
// the parsed result so controllers always see clean data.
function validate(schema, source = 'body') {
  return (req, res, next) => {
    try {
      req[source] = schema.parse(req[source]);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        return next(new ApiError(400, 'Validation failed', { errors: err.flatten() }));
      }
      next(err);
    }
  };
}

module.exports = validate;
