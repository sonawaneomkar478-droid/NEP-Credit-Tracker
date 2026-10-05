const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema(
  {
    subjectCode: {
      type: String,
      required: [true, 'Subject code is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    subjectName: {
      type: String,
      required: [true, 'Subject name is required'],
      trim: true,
    },
    semester: {
      type: Number,
      required: [true, 'Semester is required'],
      min: [1, 'Semester must be at least 1'],
      max: [8, 'Semester cannot exceed 8'],
    },
    subjectType: {
      type: String,
      required: [true, 'Subject type is required'],
      enum: {
        values: ['Core', 'Elective', 'Practical', 'Project', 'Internship', 'Skill-based'],
        message: '{VALUE} is not a supported subject type',
      },
      default: 'Core',
    },
    credits: {
      type: Number,
      required: [true, 'Credits are required'],
      min: [1, 'Credits must be at least 1'],
      max: [30, 'Credits cannot exceed 30'],
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);
subjectSchema.index({ semester: 1 });
subjectSchema.index({ subjectType: 1 });

module.exports = mongoose.model('Subject', subjectSchema);
