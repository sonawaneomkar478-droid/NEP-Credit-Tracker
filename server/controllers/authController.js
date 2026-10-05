const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Student = require('../models/Student');

// Generate JWT token helper
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
};

/**
 * @desc    Register a new student
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      rollNumber,
      course,
      department,
      academicYear,
      division,
      phone,
      studentId,
    } = req.body;

    if (!name || !email || !password || !rollNumber) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, password, and roll number are required fields.',
      });
    }

    // Check if email exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email address already exists.',
      });
    }

    // Determine unique studentId
    let generatedStudentId = studentId;
    if (!generatedStudentId) {
      const currentYear = new Date().getFullYear();
      const count = await Student.countDocuments();
      generatedStudentId = `STU${currentYear}${String(count + 1).padStart(4, '0')}`;
    }

    // Check if studentId already exists
    const existingStudentId = await Student.findOne({ studentId: generatedStudentId.toUpperCase() });
    if (existingStudentId) {
      return res.status(400).json({
        success: false,
        message: 'A student with this Student ID already exists.',
      });
    }

    // Check if roll number already exists
    const existingRoll = await Student.findOne({ rollNumber });
    if (existingRoll) {
      return res.status(400).json({
        success: false,
        message: 'A student with this roll number already exists.',
      });
    }

    // Create User record
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: 'student',
    });

    // Create Student record
    const student = await Student.create({
      studentId: generatedStudentId.toUpperCase(),
      userId: user._id,
      name,
      email: email.toLowerCase(),
      rollNumber,
      course: course || 'M.Sc. Computer Science',
      department: department || 'Department of Computer Science',
      academicYear: academicYear || '2024-2026',
      division: division || 'A',
      phone: phone || '',
      requiredCredits: 80,
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Student registration successful!',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      student: {
        _id: student._id,
        studentId: student.studentId,
        rollNumber: student.rollNumber,
        course: student.course,
        department: student.department,
        requiredCredits: student.requiredCredits,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Login user (Student or Admin)
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
    }

    // Check for user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const token = generateToken(user._id);

    let studentData = null;
    if (user.role === 'student') {
      studentData = await Student.findOne({ userId: user._id });
    }

    res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      student: studentData,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get currently logged-in user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    let studentData = null;

    if (user.role === 'student') {
      studentData = await Student.findOne({ userId: user._id });
    }

    res.status(200).json({
      success: true,
      user,
      student: studentData,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
};
