const { z } = require('zod');

// Nepali mobile numbers: 10 digits starting with 9.
const phoneRegex = /^9\d{9}$/;

const registerSchema = z.object({
  name: z.string().min(2).max(100),
  phone: z.string().regex(phoneRegex, 'Phone must be a 10-digit Nepali mobile number'),
  email: z.string().email().optional(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['farmer', 'buyer']),
  language: z.enum(['en', 'ne']).optional(),
});

const loginSchema = z.object({
  phone: z.string().regex(phoneRegex, 'Phone must be a 10-digit Nepali mobile number'),
  password: z.string().min(1, 'Password is required'),
});

module.exports = { registerSchema, loginSchema };
