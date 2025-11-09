const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const {
  getAllProblems,
  getProblemById,
  runCode,
  submitSolution,
  getUserSubmissions,
  getAllUserSubmissions
} = require('../controllers/codingController');

// @route   GET /api/coding/problems
// @desc    Get all coding problems (for users)
// @access  Private
router.get('/problems', auth, getAllProblems);

// @route   GET /api/coding/problems/:id
// @desc    Get coding problem by ID
// @access  Private
router.get('/problems/:id', auth, getProblemById);

// @route   POST /api/coding/run
// @desc    Run code against test cases (without submitting)
// @access  Private
router.post('/run', auth, runCode);

// @route   POST /api/coding/submit
// @desc    Submit solution for a coding problem
// @access  Private
router.post('/submit', auth, submitSolution);

// @route   GET /api/coding/submissions/problem/:problemId
// @desc    Get user's submissions for a specific problem
// @access  Private
router.get('/submissions/problem/:problemId', auth, getUserSubmissions);

// @route   GET /api/coding/submissions
// @desc    Get all user submissions
// @access  Private
router.get('/submissions', auth, getAllUserSubmissions);

module.exports = router;




