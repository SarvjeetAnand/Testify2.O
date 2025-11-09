const express = require('express');
const router = express.Router();
const { auth, admin } = require('../middleware/auth');
const {
  getAdminDashboard,
  getAllUsers,
  getUserById,
  updateUserStatus,
  deleteUser,
  getQuizAnalytics,
  getAnalytics,
  getAllCodingProblems,
  getCodingProblemById,
  createCodingProblem,
  updateCodingProblem,
  deleteCodingProblem
} = require('../controllers/adminController');

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard data
// @access  Private (Admin)
router.get('/dashboard', auth, admin, getAdminDashboard);

// @route   GET /api/admin/users
// @desc    Get all users
// @access  Private (Admin)
router.get('/users', auth, admin, getAllUsers);

// @route   GET /api/admin/users/:id
// @desc    Get user by ID
// @access  Private (Admin)
router.get('/users/:id', auth, admin, getUserById);

// @route   PUT /api/admin/users/:id/status
// @desc    Update user status
// @access  Private (Admin)
router.put('/users/:id/status', auth, admin, updateUserStatus);

// @route   DELETE /api/admin/users/:id
// @desc    Delete user
// @access  Private (Admin)
router.delete('/users/:id', auth, admin, deleteUser);

// @route   GET /api/admin/quiz/:id/analytics
// @desc    Get quiz analytics
// @access  Private (Admin)
router.get('/quiz/:id/analytics', auth, admin, getQuizAnalytics);

router.get('/analytics', auth, admin, getAnalytics);

// Coding Problems Routes
// @route   GET /api/admin/coding-problems
// @desc    Get all coding problems
// @access  Private (Admin)
router.get('/coding-problems', auth, admin, getAllCodingProblems);

// @route   GET /api/admin/coding-problems/:id
// @desc    Get coding problem by ID
// @access  Private (Admin)
router.get('/coding-problems/:id', auth, admin, getCodingProblemById);

// @route   POST /api/admin/coding-problems
// @desc    Create coding problem
// @access  Private (Admin)
router.post('/coding-problems', auth, admin, createCodingProblem);

// @route   PUT /api/admin/coding-problems/:id
// @desc    Update coding problem
// @access  Private (Admin)
router.put('/coding-problems/:id', auth, admin, updateCodingProblem);

// @route   DELETE /api/admin/coding-problems/:id
// @desc    Delete coding problem
// @access  Private (Admin)
router.delete('/coding-problems/:id', auth, admin, deleteCodingProblem);

module.exports = router;