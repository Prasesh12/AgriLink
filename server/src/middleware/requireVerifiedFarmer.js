const ApiError = require('../utils/ApiError');

function requireVerifiedFarmer(req, res, next) {
  if (req.user?.role !== 'farmer' || req.user.farmer?.verificationStatus !== 'verified') {
    return next(new ApiError(403, 'Forbidden: a verified farmer profile is required'));
  }
  next();
}

module.exports = requireVerifiedFarmer;
