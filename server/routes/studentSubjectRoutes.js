const express = require('express');
const router = express.Router();
const {
  getStudentSubjects,
  assignSubject,
  batchAssignSemester,
  updateStudentSubject,
  deleteStudentSubject,
} = require('../controllers/studentSubjectController');
const { verifyJWT, requireRole } = require('../middleware/authMiddleware');

router.use(verifyJWT);

router.get('/:studentId', getStudentSubjects);
router.post('/', requireRole('admin'), assignSubject);
router.post('/batch-assign', requireRole('admin'), batchAssignSemester);
router.put('/:id', requireRole('admin'), updateStudentSubject);
router.delete('/:id', requireRole('admin'), deleteStudentSubject);

module.exports = router;
