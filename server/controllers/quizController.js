const Quiz = require('../models/Quiz');
const Question = require('../models/Question');
const Category = require('../models/Category');
const Result = require('../models/Result');

// Create a new quiz
// In quizController.js
const createQuiz = async (req, res) => {
    const { title, description, category, timeLimit, isPublished } = req.body;

    try {
        // Validate category
        const categoryExists = await Category.findById(category);
        if (!categoryExists) {
            return res.status(400).json({ message: 'Category not found' });
        }

        // Create new quiz
        const quiz = new Quiz({
            title,
            description,
            category,
            createdBy: req.user.id,
            timeLimit,
            isPublished,
            passingScore: 60 // Default passing score
        });

        await quiz.save();
        res.status(201).json(quiz);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Get all quizzes
const getAllQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find()
      .populate('category', 'name')
      .populate('createdBy', 'name');
    res.json(quizzes);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get quiz by ID
const getQuizById = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id)
      .populate('category', 'name')
      .populate('createdBy', 'name')
      .populate('questions', 'questionText options');

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    res.json(quiz);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Update quiz
const updateQuiz = async (req, res) => {
  const { title, description, category, timeLimit, passingScore } = req.body;

  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // Check if user is the creator or admin
    if (quiz.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized' });
    }

    quiz.title = title || quiz.title;
    quiz.description = description || quiz.description;
    quiz.category = category || quiz.category;
    quiz.timeLimit = timeLimit || quiz.timeLimit;
    quiz.passingScore = passingScore || quiz.passingScore;

    await quiz.save();
    res.json(quiz);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete quiz
const deleteQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // Check if user is the creator or admin
    if (quiz.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Delete all questions and results associated with this quiz
    await Question.deleteMany({ quiz: req.params.id });
    await Result.deleteMany({ quiz: req.params.id });

    await quiz.remove();
    res.json({ message: 'Quiz removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Add question to quiz
const addQuestionToQuiz = async (req, res) => {
  const { questionText, options, correctAnswer, points } = req.body;

  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // Check if user is the creator or admin
    if (quiz.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const question = new Question({
      questionText,
      options,
      correctAnswer,
      points,
      quiz: req.params.id
    });

    await question.save();
    quiz.questions.push(question._id);
    await quiz.save();

    res.status(201).json(question);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createQuiz,
  getAllQuizzes,
  getQuizById,
  updateQuiz,
  deleteQuiz,
  addQuestionToQuiz
};
