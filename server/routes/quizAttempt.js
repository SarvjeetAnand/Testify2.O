const express = require('express');
const router = express.Router();
const {
  startQuizAttempt,
  saveAnswer,
  submitQuizAttempt,
  getUserAttempts,
  getAttemptById
} = require('../controllers/quizAttemptController');
const { auth } = require('../middleware/auth');

// @route   POST /api/quiz-attempt/start
// @desc    Start a quiz attempt
// @access  Private
router.post('/start', auth, startQuizAttempt);

// @route   PUT /api/quiz-attempt/:attemptId/answer
// @desc    Save answer during quiz
// @access  Private
router.put('/:attemptId/answer', auth, saveAnswer);

// @route   PUT /api/quiz-attempt/:attemptId/submit
// @desc    Submit quiz attempt
// @access  Private
router.put('/:attemptId/submit', auth, submitQuizAttempt);

// @route   GET /api/quiz-attempt/user
// @desc    Get user's quiz attempts
// @access  Private
router.get('/user', auth, getUserAttempts);

// @route   GET /api/quiz-attempt/:id
// @desc    Get attempt by ID
// @access  Private
router.get('/:id', auth, getAttemptById);

module.exports = router;