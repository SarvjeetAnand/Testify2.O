// Enhanced questionController.js with PDF upload functionality
const Question = require('../models/Question');
const Quiz = require('../models/Quiz');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const fs = require('fs');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = 'uploads/';
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// PDF parsing function
const parsePDFQuestions = (text) => {
  const questions = [];
  
  // Split by question patterns (Q1, Q2, etc. or 1., 2., etc.)
  const questionBlocks = text.split(/(?:\n|^)(?:Q\d+|Question\s*\d+|\d+\.)\s*/i).filter(block => block.trim());
  
  questionBlocks.forEach((block, index) => {
    if (block.trim().length === 0) return;
    
    try {
      // Extract question text and options
      const lines = block.split('\n').map(line => line.trim()).filter(line => line);
      
      if (lines.length < 3) return; // Need at least question + 2 options
      
      const questionText = lines[0];
      const options = [];
      let correctAnswer = 0;
      
      // Look for options (A), B), a., etc.
      let optionIndex = 1;
      while (optionIndex < lines.length) {
        const line = lines[optionIndex];
        
        // Check if line is an option
        if (/^[A-D][\)\.]|^[a-d][\)\.]|^[1-4][\)\.]/.test(line)) {
          const optionText = line.replace(/^[A-Da-d1-4][\)\.]\s*/, '');
          options.push(optionText);
          
          // Check if this is marked as correct (*, [CORRECT], etc.)
          if (line.includes('*') || line.includes('[CORRECT]') || line.includes('✓')) {
            correctAnswer = options.length - 1;
          }
        } else if (line.toLowerCase().includes('answer:') || line.toLowerCase().includes('correct:')) {
          // Extract correct answer from answer line
          const answerMatch = line.match(/[A-D]|[a-d]|[1-4]/);
          if (answerMatch) {
            const answerLetter = answerMatch[0].toLowerCase();
            if (answerLetter >= 'a' && answerLetter <= 'd') {
              correctAnswer = answerLetter.charCodeAt(0) - 'a'.charCodeAt(0);
            } else if (answerLetter >= '1' && answerLetter <= '4') {
              correctAnswer = parseInt(answerLetter) - 1;
            }
          }
        }
        optionIndex++;
      }
      
      if (options.length >= 2 && questionText) {
        questions.push({
          questionText: questionText,
          options: options,
          correctAnswer: correctAnswer,
          points: 1
        });
      }
    } catch (error) {
      console.error(`Error parsing question ${index + 1}:`, error);
    }
  });
  
  return questions;
};

// Bulk upload questions from PDF
const uploadQuestionsFromPDF = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No PDF file uploaded'
      });
    }

    const { quizId } = req.body;
    
    // Validate quiz exists and user has permission
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    if (quiz.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to add questions to this quiz'
      });
    }

    // Parse PDF
    const pdfBuffer = fs.readFileSync(req.file.path);
    const pdfData = await pdfParse(pdfBuffer);
    
    // Extract questions from PDF text
    const extractedQuestions = parsePDFQuestions(pdfData.text);
    
    if (extractedQuestions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid questions found in PDF. Please check the format.'
      });
    }

    // Create questions in database
    const createdQuestions = [];
    const errors = [];

    for (let i = 0; i < extractedQuestions.length; i++) {
      try {
        const questionData = {
          ...extractedQuestions[i],
          quiz: quizId,
          createdBy: req.user.id
        };

        const question = new Question(questionData);
        const savedQuestion = await question.save();
        createdQuestions.push(savedQuestion);

        // Add question to quiz
        await Quiz.updateOne(
          { _id: quizId },
          { $push: { questions: savedQuestion._id } }
        );
      } catch (error) {
        errors.push({
          questionIndex: i + 1,
          error: error.message
        });
      }
    }

    // Clean up uploaded file
    fs.unlinkSync(req.file.path);

    res.status(201).json({
      success: true,
      message: `Successfully created ${createdQuestions.length} questions`,
      data: {
        createdQuestions: createdQuestions.length,
        totalExtracted: extractedQuestions.length,
        errors: errors
      }
    });

  } catch (error) {
    console.error('PDF upload error:', error);
    
    // Clean up file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({
      success: false,
      message: 'Error processing PDF file'
    });
  }
};

// Preview questions from PDF before saving
const previewQuestionsFromPDF = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No PDF file uploaded'
      });
    }

    // Parse PDF
    const pdfBuffer = fs.readFileSync(req.file.path);
    const pdfData = await pdfParse(pdfBuffer);
    
    // Extract questions from PDF text
    const extractedQuestions = parsePDFQuestions(pdfData.text);
    
    // Clean up uploaded file
    fs.unlinkSync(req.file.path);

    res.status(200).json({
      success: true,
      data: {
        totalQuestions: extractedQuestions.length,
        questions: extractedQuestions,
        rawText: pdfData.text.substring(0, 1000) // First 1000 chars for debugging
      }
    });

  } catch (error) {
    console.error('PDF preview error:', error);
    
    // Clean up file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({
      success: false,
      message: 'Error processing PDF file'
    });
  }
};

// Create a new question (existing function)
const createQuestion = async (req, res) => {
  const { questionText, options, correctAnswer, points, quiz: quizId } = req.body;

  try {
    // Validation
    if (!questionText || !options || correctAnswer === undefined || !quizId) {
      return res.status(400).json({ 
        success: false,
        message: 'Please provide questionText, options, correctAnswer, and quiz ID' 
      });
    }

    // Validate options array
    if (!Array.isArray(options) || options.length < 2) {
      return res.status(400).json({ 
        success: false,
        message: 'Options must be an array with at least 2 choices' 
      });
    }

    // Validate correctAnswer index
    if (correctAnswer < 0 || correctAnswer >= options.length) {
      return res.status(400).json({ 
        success: false,
        message: 'Correct answer index must be valid for the provided options' 
      });
    }

    // Check if quiz exists
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ 
        success: false,
        message: 'Quiz not found' 
      });
    }

    // Check if user is the quiz creator or admin
    if (quiz.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ 
        success: false,
        message: 'Not authorized to add questions to this quiz' 
      });
    }

    // Create new question
    const newQuestion = new Question({
      questionText,
      options,
      correctAnswer,
      points: points || 1,
      quiz: quizId,
      createdBy: req.user.id
    });

    const savedQuestion = await newQuestion.save();

    // Add question to quiz's questions array
    await Quiz.updateOne(
      { _id: quizId },
      { $push: { questions: savedQuestion._id } }
    );

    res.status(201).json({
      success: true,
      data: savedQuestion
    });
  } catch (error) {
    console.error('Create question error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};

// Get all questions for a quiz
const getQuestionsByQuiz = async (req, res) => {
  try {
    const questions = await Question.find({ quiz: req.params.quizId });
    res.json({
      success: true,
      data: questions
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};

// Get question by ID
const getQuestionById = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ 
        success: false,
        message: 'Question not found' 
      });
    }
    res.json({
      success: true,
      data: question
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};

// Update question
const updateQuestion = async (req, res) => {
  const { questionText, options, correctAnswer, points } = req.body;

  try {
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ 
        success: false,
        message: 'Question not found' 
      });
    }

    // Check if user is the quiz creator or admin
    const quiz = await Quiz.findById(question.quiz);
    if (quiz.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ 
        success: false,
        message: 'Not authorized' 
      });
    }

    question.questionText = questionText || question.questionText;
    question.options = options || question.options;
    question.correctAnswer = correctAnswer !== undefined ? correctAnswer : question.correctAnswer;
    question.points = points || question.points;

    await question.save();
    res.json({
      success: true,
      data: question
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};

// Delete question
const deleteQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ 
        success: false,
        message: 'Question not found' 
      });
    }

    // Check if user is the quiz creator or admin
    const quiz = await Quiz.findById(question.quiz);
    if (quiz.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ 
        success: false,
        message: 'Not authorized' 
      });
    }

    // Remove question from quiz's questions array
    await Quiz.updateOne(
      { _id: question.quiz },
      { $pull: { questions: question._id } }
    );

    await Question.findByIdAndDelete(req.params.id);
    res.json({ 
      success: true,
      message: 'Question removed' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};

module.exports = {
  createQuestion,
  getQuestionsByQuiz,
  getQuestionById,
  updateQuestion,
  deleteQuestion,
  uploadQuestionsFromPDF,
  previewQuestionsFromPDF,
  upload
};