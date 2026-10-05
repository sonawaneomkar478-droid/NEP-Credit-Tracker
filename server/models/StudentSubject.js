const mongoose = require('mongoose');

const studentSubjectSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student reference is required'],
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: [true, 'Subject reference is required'],
    },
    marks: {
      type: Number,
      min: [0, 'Marks cannot be less than 0'],
      max: [100, 'Marks cannot exceed 100'],
      default: null,
    },
    grade: {
      type: String,
      enum: {
        values: ['O', 'A+', 'A', 'B+', 'B', 'C', 'P', 'F', 'Pending', ''],
        message: '{VALUE} is not a valid grade',
      },
      default: 'Pending',
    },
    status: {
      type: String,
      required: [true, 'Status is required'],
      enum: {
        values: ['Completed', 'Pending', 'In Progress'],
        message: '{VALUE} is not a valid subject status',
      },
      default: 'Pending',
    },
    creditsEarned: {
      type: Number,
      default: 0,
      min: [0, 'Credits earned cannot be negative'],
    },
    semester: {
      type: Number,
      required: [true, 'Semester is required'],
      min: 1,
      max: 8,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate assignment of the same subject to the same student
studentSubjectSchema.index({ studentId: 1, subjectId: 1 }, { unique: true });
studentSubjectSchema.index({ studentId: 1, semester: 1 });
studentSubjectSchema.index({ status: 1 });

module.exports = mongoose.model('StudentSubject', studentSubjectSchema);
