const express = require('express');
const router = express.Router();
const {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
} = require('../controllers/studentController');
const { verifyJWT, requireRole } = require('../middleware/authMiddleware');

router.use(verifyJWT);

router.get('/', requireRole('admin'), getStudents);
router.get('/:id', getStudentById);
router.post('/', requireRole('admin'), createStudent);
router.put('/:id', updateStudent);
router.delete('/:id', requireRole('admin'), deleteStudent);

module.exports = router;
