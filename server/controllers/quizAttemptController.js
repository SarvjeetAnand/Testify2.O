const QuizAttempt = require('../models/QuizAttempt');
const Quiz = require('../models/Quiz');
const Question = require('../models/Question');

// Start a quiz attempt
const startQuizAttempt = async (req, res) => {
  try {
    const { quizId } = req.body;
    const userId = req.user.id;

    const quiz = await Quiz.findById(quizId).populate('questions');
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    // Check if user already has an in-progress attempt
    const existingAttempt = await QuizAttempt.findOne({
      user: userId,
      quiz: quizId,
      status: 'in-progress'
    });

    if (existingAttempt) {
      return res.status(200).json({
        success: true,
        data: existingAttempt,
        message: 'Resuming existing attempt'
      });
    }

    // Get attempt number
    const attemptCount = await QuizAttempt.countDocuments({
      user: userId,
      quiz: quizId
    });

    const quizAttempt = new QuizAttempt({
      user: userId,
      quiz: quizId,
      startTime: new Date(),
      attemptNumber: attemptCount + 1,
      answers: quiz.questions.map(question => ({
        question: question._id,
        selectedOption: null,
        isCorrect: false,
        marksObtained: 0,
        timeSpent: 0
      }))
    });

    await quizAttempt.save();

    res.status(201).json({
      success: true,
      data: quizAttempt
    });
  } catch (error) {
    console.error('Start quiz attempt error:', error);
    res.status(500).json({
      success: false,
      message: 'Error starting quiz attempt'
    });
  }
};

// Save answer during quiz
const saveAnswer = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const { questionId, selectedOption, timeSpent } = req.body;

    const attempt = await QuizAttempt.findById(attemptId);
    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: 'Quiz attempt not found'
      });
    }

    // Find and update the specific answer
    const answerIndex = attempt.answers.findIndex(
      answer => answer.question.toString() === questionId
    );

    if (answerIndex !== -1) {
      attempt.answers[answerIndex].selectedOption = selectedOption;
      attempt.answers[answerIndex].timeSpent = timeSpent;
      
      // Get the question to check if answer is correct
      const question = await Question.findById(questionId);
      if (question) {
        attempt.answers[answerIndex].isCorrect = selectedOption === question.correctAnswer;
        attempt.answers[answerIndex].marksObtained = 
          selectedOption === question.correctAnswer ? (question.points || 1) : 0;
      }
    }

    await attempt.save();

    res.status(200).json({
      success: true,
      data: attempt
    });
  } catch (error) {
    console.error('Save answer error:', error);
    res.status(500).json({
      success: false,
      message: 'Error saving answer'
    });
  }
};

// Submit quiz attempt
const submitQuizAttempt = async (req, res) => {
  try {
    const { attemptId } = req.params;

    const attempt = await QuizAttempt.findById(attemptId).populate('quiz');
    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: 'Quiz attempt not found'
      });
    }

    attempt.endTime = new Date();
    attempt.totalTimeSpent = Math.floor((attempt.endTime - attempt.startTime) / 1000);
    attempt.status = 'completed';

    // Calculate final score
    attempt.score = attempt.answers.reduce((total, answer) => total + answer.marksObtained, 0);
    
    // Calculate percentage
    const totalMarks = attempt.answers.length; // Assuming 1 mark per question
    attempt.percentage = (attempt.score / totalMarks) * 100;
    attempt.passed = attempt.percentage >= attempt.quiz.passingScore;

    await attempt.save();

    res.status(200).json({
      success: true,
      data: attempt
    });
  } catch (error) {
    console.error('Submit quiz attempt error:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting quiz attempt'
    });
  }
};

// Get user's quiz attempts
const getUserAttempts = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, status = 'all' } = req.query;

    let query = { user: userId };
    if (status !== 'all') {
      query.status = status;
    }

    const attempts = await QuizAttempt.find(query)
      .populate('quiz', 'title description category passingScore')
      .populate('quiz.category', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await QuizAttempt.countDocuments(query);

    res.status(200).json({
      success: true,
      data: attempts,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get user attempts error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching quiz attempts'
    });
  }
};

// Get attempt by ID
const getAttemptById = async (req, res) => {
  try {
    const { id } = req.params;

    const attempt = await QuizAttempt.findById(id)
      .populate('quiz', 'title description passingScore')
      .populate('answers.question', 'questionText options correctAnswer points');

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: 'Quiz attempt not found'
      });
    }

    // Check if user owns this attempt or is admin
    if (attempt.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.status(200).json({
      success: true,
      data: attempt
    });
  } catch (error) {
    console.error('Get attempt by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching quiz attempt'
    });
  }
};

module.exports = {
  startQuizAttempt,
  saveAnswer,
  submitQuizAttempt,
  getUserAttempts,
  getAttemptById
};