const express = require('express');
const router = express.Router();
const { auth, admin } = require('../middleware/auth');
const {
  createQuiz,
  getAllQuizzes,
  getQuizById,
  updateQuiz,
  deleteQuiz
} = require('../controllers/quizController');

router.post('/', auth, createQuiz);
router.get('/', auth, getAllQuizzes);
router.get('/:id', auth, getQuizById);
router.put('/:id', auth, updateQuiz);
router.delete('/:id', auth, deleteQuiz);

module.exports = router;