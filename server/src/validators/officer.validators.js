const { z } = require('zod');

const verifyFarmerSchema = z.object({
  status: z.enum(['verified', 'rejected']),
  remarks: z.string().max(500).optional(),
});

module.exports = { verifyFarmerSchema };
