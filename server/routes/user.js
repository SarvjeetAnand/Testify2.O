const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const {
  getUserDashboard,
  getUserProfile,
  updateUserProfile,
  getUserQuizHistory
} = require('../controllers/userController');

// Profile routes
router.get('/profile', auth, getUserProfile);
router.put('/profile', auth, updateUserProfile);

// Dashboard and history routes
router.get('/dashboard', auth, getUserDashboard);
router.get('/quiz-history', auth, getUserQuizHistory);

module.exports = router;