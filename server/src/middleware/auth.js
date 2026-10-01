const prisma = require('../config/prisma');
const { verifyToken } = require('../utils/jwt');
const ApiError = require('../utils/ApiError');

// Verifies the JWT, loads the current user (with farmer/officer sub-profile if any)
// and attaches it to req.user for downstream middleware/controllers.
async function auth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const [scheme, token] = header.split(' ');
    if (scheme !== 'Bearer' || !token) {
      throw new ApiError(401, 'Authentication required');
    }

    let payload;
    try {
      payload = verifyToken(token);
    } catch {
      throw new ApiError(401, 'Invalid or expired token');
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      include: { farmer: true, officer: true },
    });
    if (!user || !user.isActive) {
      throw new ApiError(401, 'Account not found or inactive');
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = auth;
