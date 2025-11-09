const express = require('express');
const router = express.Router();
const { auth, admin } = require('../middleware/auth');
const {
  createQuestion,
  getQuestionsByQuiz,
  getQuestionById,
  updateQuestion,
  deleteQuestion,
  uploadQuestionsFromPDF,
  previewQuestionsFromPDF,
  upload
} = require('../controllers/questionController');

// @route   POST /api/questions
// @desc    Create a new question
// @access  Private
router.post('/', auth, createQuestion);

// @route   GET /api/questions/quiz/:quizId
// @desc    Get all questions for a quiz
// @access  Private
router.get('/quiz/:quizId', auth, getQuestionsByQuiz);

// @route   GET /api/questions/:id
// @desc    Get question by ID
// @access  Private
router.get('/:id', auth, getQuestionById);

// @route   PUT /api/questions/:id
// @desc    Update question
// @access  Private
router.put('/:id', auth, updateQuestion);

// @route   DELETE /api/questions/:id
// @desc    Delete question
// @access  Private
router.delete('/:id', auth, deleteQuestion);

// @route   POST /api/questions/preview-pdf
// @desc    Preview questions from PDF
// @access  Private (Admin)
router.post('/preview-pdf', auth, admin, upload.single('pdf'), previewQuestionsFromPDF);

// @route   POST /api/questions/upload-pdf
// @desc    Upload questions from PDF
// @access  Private (Admin)
router.post('/upload-pdf', auth, admin, upload.single('pdf'), uploadQuestionsFromPDF);

module.exports = router;