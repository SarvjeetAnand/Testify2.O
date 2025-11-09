const mongoose = require('mongoose');

const quizAttemptSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  quiz: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true
  },
  answers: [{
    question: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question',
      required: true
    },
    selectedOption: {
      type: String
    },
    textAnswer: {
      type: String
    },
    isCorrect: {
      type: Boolean,
      default: false
    },
    marksObtained: {
      type: Number,
      default: 0
    },
    timeSpent: {
      type: Number,
      default: 0
    }
  }],
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date
  },
  totalTimeSpent: {
    type: Number,
    default: 0
  },
  score: {
    type: Number,
    default: 0
  },
  percentage: {
    type: Number,
    default: 0
  },
  passed: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['in-progress', 'completed', 'abandoned'],
    default: 'in-progress'
  },
  attemptNumber: {
    type: Number,
    required: true
  }
}, {
  timestamps: true
});

// Calculate score before saving
quizAttemptSchema.pre('save', function(next) {
  if (this.status === 'completed') {
    this.score = this.answers.reduce((total, answer) => total + answer.marksObtained, 0);
    
    // Calculate percentage (populate quiz to get totalMarks)
    this.populate('quiz', 'totalMarks passingMarks')
      .then(() => {
        this.percentage = (this.score / this.quiz.totalMarks) * 100;
        this.passed = this.score >= this.quiz.passingMarks;
        next();
      })
      .catch(next);
  } else {
    next();
  }
});

module.exports = mongoose.model('QuizAttempt', quizAttemptSchema);