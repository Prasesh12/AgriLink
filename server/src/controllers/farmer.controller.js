const path = require('path');
const prisma = require('../config/prisma');
const ApiError = require('../utils/ApiError');
const { logAudit } = require('../services/auditLog.service');

const UPLOADS_ROOT = path.join(__dirname, '..', '..', 'uploads');

// Creates the farmer's profile on first submission, or updates it on resubmission
// (e.g. after a rejection). Submitting always resets the status to pending so an
// officer reviews the latest documents.
async function submitProfile(req, res, next) {
  try {
    const userId = req.user.id;
    const { citizenshipNo, landRegNo, landArea, district } = req.body;
    const newDocumentUrls = (req.files || []).map((f) => `/uploads/farmers/${f.filename}`);

    const existing = await prisma.farmer.findUnique({ where: { userId } });
    if (existing && existing.verificationStatus === 'verified') {
      throw new ApiError(400, 'Profile already verified; contact an officer for changes');
    }

    const data = {
      citizenshipNo,
      landRegNo,
      landArea,
      district,
      verificationStatus: 'pending',
      verifiedById: null,
      remarks: null,
      documentUrls: existing
        ? [...existing.documentUrls, ...newDocumentUrls]
        : newDocumentUrls,
    };

    const farmer = existing
      ? await prisma.farmer.update({ where: { userId }, data })
      : await prisma.farmer.create({ data: { ...data, userId } });

    await logAudit({
      actorId: userId,
      entity: 'Farmer',
      entityId: farmer.id,
      action: existing ? 'resubmit_profile' : 'submit_profile',
      fromStatus: existing?.verificationStatus,
      toStatus: 'pending',
    });

    res
      .status(existing ? 200 : 201)
      .json({ success: true, data: farmer, message: 'Profile submitted for verification' });
  } catch (err) {
    next(err);
  }
}

// 6.8: farmer documents are only visible to the owning farmer and to officers/admin.
async function getDocument(req, res, next) {
  try {
    const farmerId = Number(req.params.id);
    const farmer = await prisma.farmer.findUnique({ where: { id: farmerId } });
    if (!farmer) {
      throw new ApiError(404, 'Farmer not found');
    }

    const isOwner = req.user.farmer?.id === farmerId;
    const isPrivileged = ['officer', 'admin'].includes(req.user.role);
    if (!isOwner && !isPrivileged) {
      throw new ApiError(403, 'Forbidden');
    }

    const safeName = path.basename(req.params.filename);
    const isKnownDocument = farmer.documentUrls.some((url) => url.endsWith(`/${safeName}`));
    if (!isKnownDocument) {
      throw new ApiError(404, 'Document not found');
    }

    res.sendFile(path.join(UPLOADS_ROOT, 'farmers', safeName));
  } catch (err) {
    next(err);
  }
}

module.exports = { submitProfile, getDocument };
