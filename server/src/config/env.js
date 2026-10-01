require('dotenv').config();

const env = {
  port: process.env.PORT || 4000,
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1d',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  paymentMode: process.env.PAYMENT_MODE || 'mock',
  khaltiSecretKey: process.env.KHALTI_SECRET_KEY || '',
  khaltiBaseUrl: process.env.KHALTI_BASE_URL || 'https://dev.khalti.com/api/v2',
  smsMode: process.env.SMS_MODE || 'console',
};

module.exports = env;
