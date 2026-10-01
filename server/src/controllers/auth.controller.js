const bcrypt = require('bcrypt');
const prisma = require('../config/prisma');
const { signToken } = require('../utils/jwt');
const ApiError = require('../utils/ApiError');

function sanitize(user) {
  const { passwordHash, ...rest } = user;
  return rest;
}

async function register(req, res, next) {
  try {
    const { name, phone, email, password, role, language } = req.body;
    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { name, phone, email, passwordHash, role, language },
    });

    const token = signToken({ sub: user.id, role: user.role });
    res.status(201).json({ success: true, data: { token, user: sanitize(user) }, message: 'Registered' });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { phone, password } = req.body;
    const user = await prisma.user.findUnique({ where: { phone } });
    if (!user || !user.isActive) {
      throw new ApiError(401, 'Invalid phone or password');
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatches) {
      throw new ApiError(401, 'Invalid phone or password');
    }

    const token = signToken({ sub: user.id, role: user.role });
    res.json({ success: true, data: { token, user: sanitize(user) }, message: 'Logged in' });
  } catch (err) {
    next(err);
  }
}

async function me(req, res, next) {
  try {
    res.json({ success: true, data: sanitize(req.user), message: 'OK' });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, me };
