const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
  {
    studentId: {
      type: String,
      required: [true, 'Student ID is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Student name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
    },
    rollNumber: {
      type: String,
      required: [true, 'Roll number is required'],
      trim: true,
    },
    course: {
      type: String,
      required: [true, 'Course is required'],
      trim: true,
      default: 'M.Sc. Computer Science',
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true,
      default: 'Department of Computer Science',
    },
    academicYear: {
      type: String,
      required: [true, 'Academic year is required'],
      default: '2024-2026',
    },
    division: {
      type: String,
      default: 'A',
      trim: true,
    },
    phone: {
      type: String,
      default: '',
      trim: true,
    },
    profileImage: {
      type: String,
      default: '',
    },
    requiredCredits: {
      type: Number,
      required: [true, 'Required credits must be specified'],
      default: 80,
      min: [1, 'Required credits must be greater than 0'],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
studentSchema.index({ rollNumber: 1 });
studentSchema.index({ email: 1 });

module.exports = mongoose.model('Student', studentSchema);
