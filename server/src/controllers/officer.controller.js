const prisma = require('../config/prisma');
const ApiError = require('../utils/ApiError');
const { logAudit } = require('../services/auditLog.service');
const { notify } = require('../services/notification.service');

// 6.6: every officer query is scoped to their own district.
async function listFarmers(req, res, next) {
  try {
    const { status } = req.query;
    const where = { district: req.user.officer.district };
    if (status) where.verificationStatus = status;

    const farmers = await prisma.farmer.findMany({
      where,
      include: { user: { select: { id: true, name: true, phone: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, data: farmers, message: 'OK' });
  } catch (err) {
    next(err);
  }
}

async function verifyFarmer(req, res, next) {
  try {
    const farmerId = Number(req.params.id);
    const { status, remarks } = req.body;

    const farmer = await prisma.farmer.findUnique({ where: { id: farmerId } });
    if (!farmer) {
      throw new ApiError(404, 'Farmer not found');
    }
    // 6.6: officers cannot act on another district's data.
    if (farmer.district !== req.user.officer.district) {
      throw new ApiError(403, 'Cannot act on farmers outside your district');
    }

    const fromStatus = farmer.verificationStatus;
    const updated = await prisma.farmer.update({
      where: { id: farmerId },
      data: {
        verificationStatus: status,
        remarks: remarks || null,
        verifiedById: req.user.officer.id,
      },
    });

    await logAudit({
      actorId: req.user.id,
      entity: 'Farmer',
      entityId: farmer.id,
      action: 'verify_decision',
      fromStatus,
      toStatus: status,
    });

    await notify({
      userId: farmer.userId,
      type: 'farmer_verification',
      message:
        status === 'verified'
          ? 'Your farmer profile has been verified. You can now list produce.'
          : `Your farmer profile was rejected.${remarks ? ` Reason: ${remarks}` : ''}`,
    });

    res.json({ success: true, data: updated, message: 'Farmer status updated' });
  } catch (err) {
    next(err);
  }
}

module.exports = { listFarmers, verifyFarmer };
