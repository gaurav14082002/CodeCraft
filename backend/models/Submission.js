const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  lesson: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson',
    required: true,
  },
  code: {
    type: String,
    required: true,
  },
  language: {
    type: String,
    enum: ['javascript', 'python'],
    default: 'javascript',
  },
  status: {
    type: String,
    enum: ['passed', 'failed', 'error', 'timeout'],
    default: 'failed',
  },
  testResults: [{
    description: String,
    passed: Boolean,
    input: String,
    expectedOutput: String,
    actualOutput: String,
    error: String,
    isHidden: Boolean,
  }],
  totalTests: { type: Number, default: 0 },
  passedTests: { type: Number, default: 0 },
  executionTimeMs: { type: Number, default: 0 },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Submission', submissionSchema);
