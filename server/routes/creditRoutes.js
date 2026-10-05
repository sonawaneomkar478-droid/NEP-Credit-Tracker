const express = require('express');
const router = express.Router();
const { getCreditsByStudentId, getCreditHistory } = require('../controllers/creditController');
const { verifyJWT } = require('../middleware/authMiddleware');

router.use(verifyJWT);

router.get('/:studentId', getCreditsByStudentId);
router.get('/:studentId/history', getCreditHistory);

module.exports = router;
