const StudentSubject = require('../models/StudentSubject');
const Student = require('../models/Student');
const Subject = require('../models/Subject');
const { calculateGrade } = require('../utils/gradeCalculator');

/**
 * @desc    Get all assigned subjects for a student
 * @route   GET /api/student-subjects/:studentId
 * @access  Private (Admin or Student self)
 */
const getStudentSubjects = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    const { semester, status } = req.query;

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    // Role check
    if (req.user.role === 'student' && student.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access to student academic records',
      });
    }

    let filter = { studentId: student._id };
    if (semester) filter.semester = Number(semester);
    if (status) filter.status = status;

    const subjects = await StudentSubject.find(filter)
      .populate('subjectId')
      .sort({ semester: 1, createdAt: 1 });

    res.status(200).json({
      success: true,
      count: subjects.length,
      data: subjects,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Assign a subject to a student
 * @route   POST /api/student-subjects
 * @access  Private/Admin
 */
const assignSubject = async (req, res, next) => {
  try {
    const { studentId, subjectId, semester, status, marks, grade } = req.body;

    if (!studentId || !subjectId) {
      return res.status(400).json({
        success: false,
        message: 'Student ID and Subject ID are required',
      });
    }

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const subject = await Subject.findById(subjectId);
    if (!subject) {
      return res.status(404).json({ success: false, message: 'Subject not found' });
    }

    // Check if already assigned
    const existing = await StudentSubject.findOne({
      studentId: student._id,
      subjectId: subject._id,
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Subject ${subject.subjectCode} is already assigned to this student`,
      });
    }

    const currentStatus = status || 'Pending';
    let assignedMarks = marks !== undefined && marks !== null && marks !== '' ? Number(marks) : null;
    let finalGrade = grade;

    if (assignedMarks !== null && (!finalGrade || finalGrade === 'Pending')) {
      finalGrade = calculateGrade(assignedMarks).grade;
    }

    const creditsEarned = currentStatus === 'Completed' ? subject.credits : 0;

    const studentSubject = await StudentSubject.create({
      studentId: student._id,
      subjectId: subject._id,
      semester: semester ? Number(semester) : subject.semester,
      status: currentStatus,
      marks: assignedMarks,
      grade: finalGrade || 'Pending',
      creditsEarned,
    });

    const populated = await StudentSubject.findById(studentSubject._id).populate('subjectId');

    res.status(201).json({
      success: true,
      message: 'Subject assigned successfully',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Batch assign all subjects of a semester to a student
 * @route   POST /api/student-subjects/batch-assign
 * @access  Private/Admin
 */
const batchAssignSemester = async (req, res, next) => {
  try {
    const { studentId, semester } = req.body;

    if (!studentId || !semester) {
      return res.status(400).json({
        success: false,
        message: 'Student ID and semester are required',
      });
    }

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const subjectsInSem = await Subject.find({ semester: Number(semester) });
    if (!subjectsInSem.length) {
      return res.status(404).json({
        success: false,
        message: `No subjects found in curriculum for Semester ${semester}`,
      });
    }

    let assignedCount = 0;
    for (const sub of subjectsInSem) {
      const exists = await StudentSubject.findOne({
        studentId: student._id,
        subjectId: sub._id,
      });

      if (!exists) {
        await StudentSubject.create({
          studentId: student._id,
          subjectId: sub._id,
          semester: Number(semester),
          status: 'Pending',
          marks: null,
          grade: 'Pending',
          creditsEarned: 0,
        });
        assignedCount++;
      }
    }

    res.status(200).json({
      success: true,
      message: `Assigned ${assignedCount} semester ${semester} subjects to student ${student.name}`,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update marks, grade, status of a student subject
 * @route   PUT /api/student-subjects/:id
 * @access  Private/Admin
 */
const updateStudentSubject = async (req, res, next) => {
  try {
    const record = await StudentSubject.findById(req.params.id).populate('subjectId');
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Student subject record not found',
      });
    }

    const { marks, grade, status, semester } = req.body;

    if (semester !== undefined) {
      record.semester = Number(semester);
    }

    if (marks !== undefined) {
      const numMarks = marks === null || marks === '' ? null : Number(marks);
      record.marks = numMarks;

      // Auto-assign grade if grade not explicitly provided
      if (!grade && numMarks !== null) {
        record.grade = calculateGrade(numMarks).grade;
      }
    }

    if (grade !== undefined) {
      record.grade = grade;
    }

    if (status !== undefined) {
      record.status = status;
      if (status === 'Completed') {
        record.creditsEarned = record.subjectId ? record.subjectId.credits : 0;
      } else {
        record.creditsEarned = 0;
      }
    }

    await record.save();

    res.status(200).json({
      success: true,
      message: 'Student subject record updated successfully',
      data: record,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete/Unassign subject from a student
 * @route   DELETE /api/student-subjects/:id
 * @access  Private/Admin
 */
const deleteStudentSubject = async (req, res, next) => {
  try {
    const record = await StudentSubject.findById(req.params.id);
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Record not found',
      });
    }

    await StudentSubject.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Subject removed from student curriculum successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStudentSubjects,
  assignSubject,
  batchAssignSemester,
  updateStudentSubject,
  deleteStudentSubject,
};
