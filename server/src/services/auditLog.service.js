const prisma = require('../config/prisma');

// 6.7: every status change on Farmer verification, SubsidyApplication, InsuranceClaim
// and Order writes an AuditLog row.
async function logAudit({ actorId, entity, entityId, action, fromStatus, toStatus }) {
  return prisma.auditLog.create({
    data: {
      actorId,
      entity,
      entityId,
      action,
      fromStatus: fromStatus ?? null,
      toStatus: toStatus ?? null,
    },
  });
}

module.exports = { logAudit };
