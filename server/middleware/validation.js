const { check, validationResult } = require('express-validator');

const validateRegister = [
  check('name', 'Name is required').not().isEmpty(),
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
];

const validateLogin = [
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Password is required').exists()
];

const validateQuiz = [
  check('title', 'Title is required').not().isEmpty(),
  check('category', 'Category is required').not().isEmpty(),
  check('timeLimit', 'Time limit is required').isInt({ min: 1 }),
  check('passingScore', 'Passing score is required').isInt({ min: 0, max: 100 })
];

const validateQuestion = [
  check('questionText', 'Question text is required').not().isEmpty(),
  check('options', 'Options are required').isArray({ min: 2 }),
  check('correctAnswer', 'Correct answer is required').not().isEmpty(),
  check('points', 'Points must be a positive number').isInt({ min: 1 })
];

const validateCategory = [
  check('name', 'Name is required').not().isEmpty()
];

const validateResult = [
  check('quizId', 'Quiz ID is required').not().isEmpty(),
  check('answers', 'Answers are required').isArray(),
  check('timeTaken', 'Time taken is required').isInt({ min: 1 })
];

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

module.exports = {
  validateRegister,
  validateLogin,
  validateQuiz,
  validateQuestion,
  validateCategory,
  validateResult,
  validate
};