const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('../models/User');
const Category = require('../models/Category');
const Quiz = require('../models/Quiz');
const Question = require('../models/Question');

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Category.deleteMany({}),
      Quiz.deleteMany({}),
      Question.deleteMany({})
    ]);

    // Create admin user
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@quiz.com',
      password: 'admin123',
      role: 'admin'
    });

    // Create regular user
    const regularUser = await User.create({
      name: 'Regular User',
      email: 'user@quiz.com',
      password: 'user123',
      role: 'user'
    });

    // Create categories
    const categories = await Category.create([
      {
        name: 'JavaScript',
        description: 'JavaScript programming language fundamentals',
        icon: '💻'
      },
      {
        name: 'React',
        description: 'React.js library concepts and best practices',
        icon: '⚛️'
      },
      {
        name: 'Node.js',
        description: 'Node.js backend development',
        icon: '🟢'
      },
      {
        name: 'MongoDB',
        description: 'MongoDB database concepts',
        icon: '🍃'
      }
    ]);

    // Create quizzes
    const quizzes = await Quiz.create([
      {
        title: 'JavaScript Basics',
        description: 'Test your knowledge of JavaScript fundamentals',
        category: categories[0]._id,
        difficulty: 'easy',
        timeLimit: 30,
        totalMarks: 0,
        passingMarks: 60,
        createdBy: adminUser._id
      },
      {
        title: 'React Fundamentals',
        description: 'Comprehensive test on React concepts',
        category: categories[1]._id,
        difficulty: 'medium',
        timeLimit: 45,
        totalMarks: 0,
        passingMarks: 70,
        createdBy: adminUser._id
      },
      {
        title: 'Node.js Advanced',
        description: 'Advanced Node.js concepts and patterns',
        category: categories[2]._id,
        difficulty: 'hard',
        timeLimit: 60,
        totalMarks: 0,
        passingMarks: 75,
        createdBy: adminUser._id
      }
    ]);

    // Create questions for JavaScript quiz
    const jsQuestions = await Question.create([
      {
        quiz: quizzes[0]._id,
        question: 'What is the correct way to declare a variable in JavaScript?',
        options: [
          { text: 'var myVar = 5;', isCorrect: true },
          { text: 'variable myVar = 5;', isCorrect: false },
          { text: 'v myVar = 5;', isCorrect: false },
          { text: 'declare myVar = 5;', isCorrect: false }
        ],
        marks: 10,
        explanation: 'The "var" keyword is used to declare variables in JavaScript.'
      },
      {
        quiz: quizzes[0]._id,
        question: 'Which of the following is NOT a JavaScript data type?',
        options: [
          { text: 'string', isCorrect: false },
          { text: 'boolean', isCorrect: false },
          { text: 'integer', isCorrect: true },
          { text: 'undefined', isCorrect: false }
        ],
        marks: 10,
        explanation: 'JavaScript has number type, not separate integer and float types.'
      },
      {
        quiz: quizzes[0]._id,
        question: 'What does "=== " operator do in JavaScript?',
        options: [
          { text: 'Assigns a value', isCorrect: false },
          { text: 'Compares values only', isCorrect: false },
          { text: 'Compares both value and type', isCorrect: true },
          { text: 'Creates a variable', isCorrect: false }
        ],
        marks: 10,
        explanation: 'The "===" operator performs strict equality comparison, checking both value and type.'
      }
    ]);

    // Create questions for React quiz
    const reactQuestions = await Question.create([
      {
        quiz: quizzes[1]._id,
        question: 'What is JSX in React?',
        options: [
          { text: 'A JavaScript library', isCorrect: false },
          { text: 'A syntax extension for JavaScript', isCorrect: true },
          { text: 'A CSS framework', isCorrect: false },
          { text: 'A database', isCorrect: false }
        ],
        marks: 15,
        explanation: 'JSX is a syntax extension for JavaScript that looks similar to XML or HTML.'
      },
      {
        quiz: quizzes[1]._id,
        question: 'Which hook is used for state management in functional components?',
        options: [
          { text: 'useEffect', isCorrect: false },
          { text: 'useState', isCorrect: true },
          { text: 'useContext', isCorrect: false },
          { text: 'useReducer', isCorrect: false }
        ],
        marks: 15,
        explanation: 'useState is the hook used to add state to functional components.'
      }
    ]);

    // Update quiz total marks
    await Quiz.findByIdAndUpdate(quizzes[0]._id, { totalMarks: 30 });
    await Quiz.findByIdAndUpdate(quizzes[1]._id, { totalMarks: 30 });

    console.log('Seed data created successfully!');
    console.log('Admin User: admin@quiz.com / admin123');
    console.log('Regular User: user@quiz.com / user123');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();