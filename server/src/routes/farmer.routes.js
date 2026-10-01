const express = require('express');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');
const validate = require('../middleware/validate');
const createUploader = require('../middleware/upload');
const { farmerProfileSchema } = require('../validators/farmer.validators');
const { submitProfile, getDocument } = require('../controllers/farmer.controller');

const uploadDocuments = createUploader('farmers');
const router = express.Router();

router.post(
  '/profile',
  auth,
  requireRole('farmer'),
  uploadDocuments.array('documents', 5),
  validate(farmerProfileSchema),
  submitProfile,
);

router.get('/:id/documents/:filename', auth, getDocument);

module.exports = router;
