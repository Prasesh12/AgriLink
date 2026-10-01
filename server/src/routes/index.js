const express = require('express');
const healthRoutes = require('./health.routes');
const authRoutes = require('./auth.routes');
const farmerRoutes = require('./farmer.routes');
const officerRoutes = require('./officer.routes');

const router = express.Router();

router.use('/', healthRoutes);
router.use('/auth', authRoutes);
router.use('/farmers', farmerRoutes);
router.use('/officer', officerRoutes);

module.exports = router;
