const Subject = require('../models/Subject');
const StudentSubject = require('../models/StudentSubject');

/**
 * @desc    Get all subjects with optional filters
 * @route   GET /api/subjects
 * @access  Private
 */
const getSubjects = async (req, res, next) => {
  try {
    const { semester, subjectType, search } = req.query;

    let query = {};
    if (semester) query.semester = Number(semester);
    if (subjectType) query.subjectType = subjectType;
    if (search) {
      query.$or = [
        { subjectCode: { $regex: search, $options: 'i' } },
        { subjectName: { $regex: search, $options: 'i' } },
      ];
    }

    const subjects = await Subject.find(query).sort({ semester: 1, subjectCode: 1 });

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
 * @desc    Get single subject
 * @route   GET /api/subjects/:id
 * @access  Private
 */
const getSubjectById = async (req, res, next) => {
  try {
    const subject = await Subject.findById(req.params.id);
    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found',
      });
    }

    res.status(200).json({
      success: true,
      data: subject,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create new subject
 * @route   POST /api/subjects
 * @access  Private/Admin
 */
const createSubject = async (req, res, next) => {
  try {
    const { subjectCode, subjectName, semester, subjectType, credits, description } = req.body;

    if (!subjectCode || !subjectName || !semester || !credits) {
      return res.status(400).json({
        success: false,
        message: 'Subject code, name, semester, and credits are required',
      });
    }

    // Check duplicate code
    const existing = await Subject.findOne({ subjectCode: subjectCode.toUpperCase().trim() });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Subject with code ${subjectCode.toUpperCase()} already exists`,
      });
    }

    const subject = await Subject.create({
      subjectCode: subjectCode.toUpperCase().trim(),
      subjectName: subjectName.trim(),
      semester: Number(semester),
      subjectType: subjectType || 'Core',
      credits: Number(credits),
      description: description || '',
    });

    res.status(201).json({
      success: true,
      message: 'Subject created successfully',
      data: subject,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update subject
 * @route   PUT /api/subjects/:id
 * @access  Private/Admin
 */
const updateSubject = async (req, res, next) => {
  try {
    const subject = await Subject.findById(req.params.id);
    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found',
      });
    }

    const { subjectCode, subjectName, semester, subjectType, credits, description } = req.body;

    if (subjectCode && subjectCode.toUpperCase() !== subject.subjectCode) {
      const existing = await Subject.findOne({ subjectCode: subjectCode.toUpperCase() });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'Another subject already uses this subject code',
        });
      }
      subject.subjectCode = subjectCode.toUpperCase().trim();
    }

    if (subjectName) subject.subjectName = subjectName.trim();
    if (semester) subject.semester = Number(semester);
    if (subjectType) subject.subjectType = subjectType;
    if (credits !== undefined) {
      const newCredits = Number(credits);
      subject.credits = newCredits;

      // Also update creditsEarned on linked Completed student subjects!
      await StudentSubject.updateMany(
        { subjectId: subject._id, status: 'Completed' },
        { creditsEarned: newCredits }
      );
    }
    if (description !== undefined) subject.description = description;

    await subject.save();

    res.status(200).json({
      success: true,
      message: 'Subject updated successfully',
      data: subject,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete subject
 * @route   DELETE /api/subjects/:id
 * @access  Private/Admin
 */
const deleteSubject = async (req, res, next) => {
  try {
    const subject = await Subject.findById(req.params.id);
    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found',
      });
    }

    // Delete student subject assignments
    await StudentSubject.deleteMany({ subjectId: subject._id });

    // Delete subject
    await Subject.findByIdAndDelete(subject._id);

    res.status(200).json({
      success: true,
      message: 'Subject and related student assignments deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSubjects,
  getSubjectById,
  createSubject,
  updateSubject,
  deleteSubject,
};
