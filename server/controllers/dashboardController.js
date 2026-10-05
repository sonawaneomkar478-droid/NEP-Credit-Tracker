const Student = require('../models/Student');
const Subject = require('../models/Subject');
const StudentSubject = require('../models/StudentSubject');
const { calculateStudentCredits } = require('../services/creditCalculationService');

/**
 * @desc    Get aggregate metrics and analytics for Admin Dashboard
 * @route   GET /api/dashboard/admin
 * @access  Private/Admin
 */
const getAdminDashboardStats = async (req, res, next) => {
  try {
    const totalStudents = await Student.countDocuments();
    const totalSubjects = await Subject.countDocuments();

    const completedSubjects = await StudentSubject.countDocuments({ status: 'Completed' });
    const pendingSubjects = await StudentSubject.countDocuments({ status: 'Pending' });
    const inProgressSubjects = await StudentSubject.countDocuments({ status: 'In Progress' });

    // Calculate average credit progress across all students
    const allStudents = await Student.find().select('_id name studentId course requiredCredits');

    let totalProgressSum = 0;
    let completedRequirementsCount = 0;
    const studentProgressList = [];

    for (const student of allStudents) {
      try {
        const stats = await calculateStudentCredits(student._id);
        totalProgressSum += stats.progressPercentage;
        if (stats.isRequirementCompleted) {
          completedRequirementsCount++;
        }
        studentProgressList.push({
          _id: student._id,
          studentId: student.studentId,
          name: student.name,
          course: student.course,
          requiredCredits: stats.requiredCredits,
          earnedCredits: stats.earnedCredits,
          remainingCredits: stats.remainingCredits,
          progressPercentage: stats.progressPercentage,
          isRequirementCompleted: stats.isRequirementCompleted,
        });
      } catch (e) {
        // Skip failed calculation
      }
    }

    const averageProgress =
      allStudents.length > 0 ? Math.round((totalProgressSum / allStudents.length) * 10) / 10 : 0;

    // Subject type breakdown across curriculum
    const subjectTypeAggregation = await Subject.aggregate([
      {
        $group: {
          _id: '$subjectType',
          count: { $sum: 1 },
          totalCredits: { $sum: '$credits' },
        },
      },
    ]);

    // Semester subjects distribution
    const semesterDistribution = await Subject.aggregate([
      {
        $group: {
          _id: '$semester',
          count: { $sum: 1 },
          totalCredits: { $sum: '$credits' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalStudents,
        totalSubjects,
        completedSubjects,
        pendingSubjects,
        inProgressSubjects,
        averageProgress,
        completedRequirementsCount,
      },
      subjectTypeAggregation,
      semesterDistribution,
      topStudents: studentProgressList.sort((a, b) => b.progressPercentage - a.progressPercentage).slice(0, 10),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAdminDashboardStats };
