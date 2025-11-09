const mongoose = require('mongoose');

const testCaseResultSchema = new mongoose.Schema({
  passed: {
    type: Boolean,
    required: true
  },
  executionTime: {
    type: Number,
    default: 0
  },
  isHidden: {
    type: Boolean,
    default: false
  }
});

const codingSubmissionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  problem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CodingProblem',
    required: true
  },
  code: {
    type: String,
    required: true
  },
  language: {
    type: String,
    required: true,
    enum: ['javascript', 'python', 'java', 'cpp']
  },
  testCaseResults: [testCaseResultSchema],
  passed: {
    type: Boolean,
    default: false
  },
  executionTime: {
    type: Number,
    default: 0
  },
  submittedAt: {
    type: Date,
    default: Date.now
  }
});

// Index for faster queries
codingSubmissionSchema.index({ user: 1, problem: 1 });
codingSubmissionSchema.index({ submittedAt: -1 });

module.exports = mongoose.model('CodingSubmission', codingSubmissionSchema);




