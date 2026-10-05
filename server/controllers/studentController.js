const Student = require('../models/Student');
const User = require('../models/User');
const StudentSubject = require('../models/StudentSubject');
const { calculateStudentCredits } = require('../services/creditCalculationService');

/**
 * @desc    Get all students with their credit summary
 * @route   GET /api/students
 * @access  Private/Admin
 */
const getStudents = async (req, res, next) => {
  try {
    const { search, course, academicYear } = req.query;

    let query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { studentId: { $regex: search, $options: 'i' } },
        { rollNumber: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    if (course) query.course = course;
    if (academicYear) query.academicYear = academicYear;

    const students = await Student.find(query).sort({ studentId: 1 });

    // Attach basic credit summary for each student in the list
    const studentsWithCredits = await Promise.all(
      students.map(async (st) => {
        try {
          const stats = await calculateStudentCredits(st._id);
          return {
            ...st.toObject(),
            earnedCredits: stats.earnedCredits,
            remainingCredits: stats.remainingCredits,
            progressPercentage: stats.progressPercentage,
            isRequirementCompleted: stats.isRequirementCompleted,
          };
        } catch {
          return {
            ...st.toObject(),
            earnedCredits: 0,
            remainingCredits: st.requiredCredits,
            progressPercentage: 0,
            isRequirementCompleted: false,
          };
        }
      })
    );

    res.status(200).json({
      success: true,
      count: students.length,
      data: studentsWithCredits,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single student by ID
 * @route   GET /api/students/:id
 * @access  Private (Admin or Student self)
 */
const getStudentById = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    // Role-based check: student can only view their own
    if (req.user.role === 'student' && student.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: You can only view your own student record',
      });
    }

    const creditDetails = await calculateStudentCredits(student._id);

    res.status(200).json({
      success: true,
      data: {
        student,
        creditDetails,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new student by Admin
 * @route   POST /api/students
 * @access  Private/Admin
 */
const createStudent = async (req, res, next) => {
  try {
    const {
      studentId,
      name,
      email,
      password,
      rollNumber,
      course,
      department,
      academicYear,
      division,
      phone,
      requiredCredits,
    } = req.body;

    if (!name || !email || !rollNumber) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and roll number are required',
      });
    }

    // Generate studentId if not supplied
    let finalStudentId = studentId;
    if (!finalStudentId) {
      const year = new Date().getFullYear();
      const count = await Student.countDocuments();
      finalStudentId = `STU${year}${String(count + 1).padStart(4, '0')}`;
    }

    // Check unique studentId
    const existingStudentId = await Student.findOne({ studentId: finalStudentId.toUpperCase() });
    if (existingStudentId) {
      return res.status(400).json({
        success: false,
        message: 'Student ID already in use',
      });
    }

    // Check email
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email already exists',
      });
    }

    // Check roll number
    const existingRoll = await Student.findOne({ rollNumber });
    if (existingRoll) {
      return res.status(400).json({
        success: false,
        message: 'A student with this roll number already exists',
      });
    }

    // Create User account for student
    const defaultPassword = password || 'student123';
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: defaultPassword,
      role: 'student',
    });

    const student = await Student.create({
      studentId: finalStudentId.toUpperCase(),
      userId: user._id,
      name,
      email: email.toLowerCase(),
      rollNumber,
      course: course || 'M.Sc. Computer Science',
      department: department || 'Department of Computer Science',
      academicYear: academicYear || '2024-2026',
      division: division || 'A',
      phone: phone || '',
      requiredCredits: Number(requiredCredits) || 80,
    });

    res.status(201).json({
      success: true,
      message: 'Student created successfully',
      data: student,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update student details
 * @route   PUT /api/students/:id
 * @access  Private (Admin or Student self for non-academic fields)
 */
const updateStudent = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    const isAdmin = req.user.role === 'admin';
    const isOwner = student.userId.toString() === req.user._id.toString();

    if (!isAdmin && !isOwner) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this profile',
      });
    }

    // Student can only update phone, division
    if (!isAdmin) {
      if (req.body.phone !== undefined) student.phone = req.body.phone;
      if (req.body.division !== undefined) student.division = req.body.division;
      await student.save();
      return res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: student,
      });
    }

    // Admin updates
    const {
      name,
      email,
      rollNumber,
      course,
      department,
      academicYear,
      division,
      phone,
      requiredCredits,
      studentId,
    } = req.body;

    if (name) student.name = name;
    if (studentId) student.studentId = studentId.toUpperCase();
    if (rollNumber) student.rollNumber = rollNumber;
    if (course) student.course = course;
    if (department) student.department = department;
    if (academicYear) student.academicYear = academicYear;
    if (division) student.division = division;
    if (phone !== undefined) student.phone = phone;
    if (requiredCredits !== undefined) student.requiredCredits = Number(requiredCredits);

    if (email && email.toLowerCase() !== student.email) {
      student.email = email.toLowerCase();
      await User.findByIdAndUpdate(student.userId, { email: email.toLowerCase(), name: student.name });
    } else if (name) {
      await User.findByIdAndUpdate(student.userId, { name: student.name });
    }

    await student.save();

    res.status(200).json({
      success: true,
      message: 'Student updated successfully',
      data: student,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete student and linked records
 * @route   DELETE /api/students/:id
 * @access  Private/Admin
 */
const deleteStudent = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    // Delete linked User
    await User.findByIdAndDelete(student.userId);

    // Delete all linked studentSubjects
    await StudentSubject.deleteMany({ studentId: student._id });

    // Delete student
    await Student.findByIdAndDelete(student._id);

    res.status(200).json({
      success: true,
      message: 'Student and associated academic records deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
};
