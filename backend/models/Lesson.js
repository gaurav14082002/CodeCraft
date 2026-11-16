const mongoose = require('mongoose');

const testCaseSchema = new mongoose.Schema({
  description: { type: String, required: true },
  input: { type: String, default: '' },
  expectedOutput: { type: String, required: true },
  isHidden: { type: Boolean, default: false }
});

const quizQuestionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswerIndex: { type: Number, required: true },
  explanation: { type: String, default: '' }
});

const lessonSchema = new mongoose.Schema({
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
  },
  moduleTitle: {
    type: String,
    required: true,
    default: 'Module 1: Getting Started',
  },
  title: {
    type: String,
    required: [true, 'Please provide lesson title'],
    trim: true,
  },
  slug: {
    type: String,
    required: true,
  },
  order: {
    type: Number,
    default: 1,
  },
  type: {
    type: String,
    enum: ['video', 'article', 'exercise', 'quiz'],
    default: 'article',
  },
  duration: {
    type: String,
    default: '10 min',
  },
  content: {
    type: String,
    default: '',
  },
  videoUrl: {
    type: String,
    default: '',
  },
  exercise: {
    language: {
      type: String,
      enum: ['javascript', 'python'],
      default: 'javascript',
    },
    instructions: { type: String, default: '' },
    starterCode: { type: String, default: '' },
    solutionCode: { type: String, default: '' },
    hints: [{ type: String }],
    testCases: [testCaseSchema],
  },
  quiz: [quizQuestionSchema],
  resources: [{
    title: String,
    url: String,
  }],
}, {
  timestamps: true,
});

lessonSchema.index({ course: 1, order: 1 });

module.exports = mongoose.model('Lesson', lessonSchema);
