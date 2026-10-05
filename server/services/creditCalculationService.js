const Student = require('../models/Student');
const StudentSubject = require('../models/StudentSubject');

/**
 * Computes full NEP credit analytics for a student
 * @param {string|ObjectId} studentId - Student document _id or studentId string
 */
const calculateStudentCredits = async (studentDocId) => {
  const student = await Student.findById(studentDocId);
  if (!student) {
    throw new Error('Student not found');
  }

  // Find all subjects assigned to this student, populated with subject details
  const studentSubjects = await StudentSubject.find({ studentId: student._id })
    .populate('subjectId')
    .sort({ semester: 1, createdAt: 1 });

  const requiredCredits = Number(student.requiredCredits) || 80;
  let earnedCredits = 0;
  let totalAssignedCredits = 0;

  // Counts
  let completedCount = 0;
  let pendingCount = 0;
  let inProgressCount = 0;

  // Semester aggregation map
  const semesterMap = {};

  // Subject type aggregation map
  const subjectTypeMap = {
    Core: { earned: 0, total: 0 },
    Elective: { earned: 0, total: 0 },
    Practical: { earned: 0, total: 0 },
    Project: { earned: 0, total: 0 },
    Internship: { earned: 0, total: 0 },
    'Skill-based': { earned: 0, total: 0 },
  };

  studentSubjects.forEach((record) => {
    const subject = record.subjectId;
    if (!subject) return;

    const subCredits = Number(subject.credits) || 0;
    const sem = Number(record.semester || subject.semester);
    const subType = subject.subjectType || 'Core';

    totalAssignedCredits += subCredits;

    if (!semesterMap[sem]) {
      semesterMap[sem] = {
        semester: sem,
        totalCredits: 0,
        earnedCredits: 0,
        completedCount: 0,
        pendingCount: 0,
        inProgressCount: 0,
        subjects: [],
      };
    }

    semesterMap[sem].totalCredits += subCredits;
    semesterMap[sem].subjects.push({
      _id: record._id,
      subjectId: subject._id,
      subjectCode: subject.subjectCode,
      subjectName: subject.subjectName,
      subjectType: subject.subjectType,
      credits: subCredits,
      marks: record.marks,
      grade: record.grade,
      status: record.status,
      creditsEarned: record.status === 'Completed' ? subCredits : 0,
      updatedAt: record.updatedAt,
    });

    if (subjectTypeMap[subType]) {
      subjectTypeMap[subType].total += subCredits;
    }

    if (record.status === 'Completed') {
      earnedCredits += subCredits;
      completedCount++;
      semesterMap[sem].earnedCredits += subCredits;
      semesterMap[sem].completedCount++;
      if (subjectTypeMap[subType]) {
        subjectTypeMap[subType].earned += subCredits;
      }
    } else if (record.status === 'In Progress') {
      inProgressCount++;
      semesterMap[sem].inProgressCount++;
    } else {
      pendingCount++;
      semesterMap[sem].pendingCount++;
    }
  });

  const remainingCredits = Math.max(0, requiredCredits - earnedCredits);
  const rawProgress = requiredCredits > 0 ? (earnedCredits / requiredCredits) * 100 : 0;
  const progressPercentage = Math.min(100, Math.round(rawProgress * 10) / 10);
  const isRequirementCompleted = earnedCredits >= requiredCredits;
  const statusMessage = isRequirementCompleted
    ? 'Credit Requirement Completed'
    : `${remainingCredits} credits remaining to complete degree requirements`;

  // Format semester array sorted by semester number
  const semesterBreakdown = Object.values(semesterMap).sort((a, b) => a.semester - b.semester);

  return {
    student: {
      _id: student._id,
      studentId: student.studentId,
      name: student.name,
      email: student.email,
      rollNumber: student.rollNumber,
      course: student.course,
      department: student.department,
      academicYear: student.academicYear,
      division: student.division,
      requiredCredits: requiredCredits,
    },
    requiredCredits,
    earnedCredits,
    remainingCredits,
    progressPercentage,
    isRequirementCompleted,
    statusMessage,
    totalAssignedCredits,
    subjectStats: {
      totalSubjects: studentSubjects.length,
      completedCount,
      pendingCount,
      inProgressCount,
    },
    semesterBreakdown,
    subjectTypeBreakdown: subjectTypeMap,
    allRecords: studentSubjects,
  };
};

module.exports = { calculateStudentCredits };
