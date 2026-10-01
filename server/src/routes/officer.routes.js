const express = require('express');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');
const validate = require('../middleware/validate');
const { verifyFarmerSchema } = require('../validators/officer.validators');
const { listFarmers, verifyFarmer } = require('../controllers/officer.controller');

const router = express.Router();

router.use(auth, requireRole('officer'));
router.get('/farmers', listFarmers);
router.patch('/farmers/:id', validate(verifyFarmerSchema), verifyFarmer);

module.exports = router;
