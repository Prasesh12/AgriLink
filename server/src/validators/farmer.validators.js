const { z } = require('zod');

const farmerProfileSchema = z.object({
  citizenshipNo: z.string().min(3).max(50),
  landRegNo: z.string().min(1).max(50),
  landArea: z.coerce.number().positive('Land area must be greater than 0'),
  district: z.string().min(2).max(50),
});

module.exports = { farmerProfileSchema };
