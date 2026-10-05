const Student = require('../models/Student');
const { calculateStudentCredits } = require('../services/creditCalculationService');

/**
 * @desc    Get complete calculated NEP credits for a student
 * @route   GET /api/credits/:studentId
 * @access  Private (Admin or Student self)
 */
const getCreditsByStudentId = async (req, res, next) => {
  try {
    const { studentId } = req.params;

    // Look up either by Mongo _id or studentId code
    let student = await Student.findById(studentId).catch(() => null);
    if (!student) {
      student = await Student.findOne({ studentId: studentId.toUpperCase() });
    }

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student record not found',
      });
    }

    // Role check: students can only view their own credits
    if (req.user.role === 'student' && student.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access to student credit analytics',
      });
    }

    const calculations = await calculateStudentCredits(student._id);

    res.status(200).json({
      success: true,
      data: calculations,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get credit history (chronological audit of completed credits)
 * @route   GET /api/credits/:studentId/history
 * @access  Private (Admin or Student self)
 */
const getCreditHistory = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    let student = await Student.findById(studentId).catch(() => null);
    if (!student) {
      student = await Student.findOne({ studentId: studentId.toUpperCase() });
    }

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student record not found',
      });
    }

    if (req.user.role === 'student' && student.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access',
      });
    }

    const calculations = await calculateStudentCredits(student._id);

    // Filter completed subjects and sort by semester and update time
    const completedHistory = calculations.allRecords
      .filter((rec) => rec.status === 'Completed')
      .map((rec) => ({
        _id: rec._id,
        subjectCode: rec.subjectId?.subjectCode,
        subjectName: rec.subjectId?.subjectName,
        subjectType: rec.subjectId?.subjectType,
        credits: rec.subjectId?.credits,
        marks: rec.marks,
        grade: rec.grade,
        semester: rec.semester,
        completedAt: rec.updatedAt,
      }))
      .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));

    res.status(200).json({
      success: true,
      student: calculations.student,
      totalCreditsEarned: calculations.earnedCredits,
      requiredCredits: calculations.requiredCredits,
      remainingCredits: calculations.remainingCredits,
      history: completedHistory,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCreditsByStudentId,
  getCreditHistory,
};
