const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  questionText: {
    type: String,
    required: true,
    trim: true
  },
  options: [{
    type: String,
    required: true,
    trim: true
  }],
  correctAnswer: {
    type: Number, // Index of correct answer in options array
    required: true,
    min: 0
  },
  points: {
    type: Number,
    default: 1,
    min: 1
  },
  quiz: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  explanation: {
    type: String,
    trim: true
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  tags: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

// Validate correctAnswer index
QuestionSchema.pre('save', function(next) {
  if (this.correctAnswer >= this.options.length) {
    next(new Error('Correct answer index is out of range'));
  }
  next();
});

module.exports = mongoose.model('Question', QuestionSchema);