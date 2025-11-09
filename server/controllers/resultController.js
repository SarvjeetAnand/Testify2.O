const Result = require('../models/Result');
const Quiz = require('../models/Quiz');
const User = require('../models/User');

// Submit quiz results
const submitResult = async (req, res) => {
  const { quizId, answers, timeTaken } = req.body;

  try {
    // Validate input
    if (!quizId || !Array.isArray(answers)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid request data' 
      });
    }

    // Ensure user is authenticated
    if (!req.user?._id) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    // Find quiz with questions
    const quiz = await Quiz.findById(quizId).populate('questions');
    if (!quiz) {
      return res.status(404).json({ 
        success: false,
        message: 'Quiz not found' 
      });
    }

    // Calculate score and create question results
    let score = 0;
    const questionResults = [];

    for (const question of quiz.questions) {
      const userAnswer = answers.find(a => a.questionId === question._id.toString());
      const isCorrect = userAnswer?.answer === question.correctAnswer;
      const points = question.points || 1;

      if (isCorrect) {
        score += points;
      }

      questionResults.push({
        questionId: question._id,
        userAnswer: userAnswer?.answer ?? null,
        correctAnswer: question.correctAnswer,
        isCorrect,
        points: isCorrect ? points : 0
      });
    }

    // Calculate percentage
    const totalPossibleScore = quiz.questions.reduce((sum, q) => sum + (q.points || 1), 0);
    const percentage = totalPossibleScore > 0 ? (score / totalPossibleScore) * 100 : 0;
    const passed = percentage >= quiz.passingScore;

    // Create and save result
    const result = new Result({
      user: req.user._id, // Ensure this is set
      quiz: quizId,
      score,
      totalPossibleScore,
      percentage: Math.round(percentage * 100) / 100,
      passed,
      timeTaken: Math.max(0, parseInt(timeTaken) || 0),
      questionResults,
      completedAt: new Date()
    });

    await result.save();

    // Update quiz statistics
    await Quiz.findByIdAndUpdate(quizId, {
      $inc: {
        totalAttempts: 1,
        totalScore: score
      },
      $set: {
        averageScore: (quiz.averageScore * quiz.totalAttempts + percentage) / (quiz.totalAttempts + 1)
      }
    });

    res.status(201).json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Submit result error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to submit quiz result',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get user's results
const getUserResults = async (req, res) => {
  try {
    const results = await Result.find({ user: req.user.id })
      .populate('quiz', 'title description passingScore')
      .sort({ completedAt: -1 });
    res.json(results);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all results (admin only)
const getAllResults = async (req, res) => {
  try {
    const results = await Result.find()
      .populate('user', 'name email')
      .populate('quiz', 'title')
      .sort({ completedAt: -1 });
    res.json(results);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get result by ID
const getResultById = async (req, res) => {
  try {
    const result = await Result.findById(req.params.id)
      .populate('quiz', 'title description category timeLimit passingScore')
      .populate('questionResults.questionId', 'questionText options correctAnswer points')
      .populate('user', 'name email');

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Result not found'
      });
    }

    // Check if user owns this result or is admin
    if (result.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this result'
      });
    }

    res.status(200).json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Get result by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching quiz result'
    });
  }
};

module.exports = {
  submitResult,
  getUserResults,
  getAllResults,
  getResultById
};