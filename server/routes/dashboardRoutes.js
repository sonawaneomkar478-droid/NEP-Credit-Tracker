const express = require('express');
const router = express.Router();
const { getAdminDashboardStats } = require('../controllers/dashboardController');
const { verifyJWT, requireRole } = require('../middleware/authMiddleware');

router.use(verifyJWT);
router.get('/admin', requireRole('admin'), getAdminDashboardStats);

module.exports = router;
