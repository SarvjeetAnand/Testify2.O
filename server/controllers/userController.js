const User = require('../models/User');
const QuizAttempt = require('../models/QuizAttempt');
const bcrypt = require('bcryptjs');

// Get user dashboard data
exports.getUserDashboard = async (req, res) => {
  try {
    const attempts = await QuizAttempt.find({ user: req.user._id, status: 'completed' })
      .populate('quiz', 'title')
      .sort({ createdAt: -1 });

    const stats = {
      totalAttempts: attempts.length,
      averageScore: attempts.reduce((acc, curr) => acc + curr.percentage, 0) / (attempts.length || 1),
      passedAttempts: attempts.filter(a => a.passed).length,
      totalTimeSpent: attempts.reduce((acc, curr) => acc + curr.timeTaken, 0)
    };

    res.status(200).json({
      success: true,
      data: { stats, recentAttempts: attempts.slice(0, 5) }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard data'
    });
  }
};

// Get user profile
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching profile'
    });
  }
};

// Update user profile
exports.updateUserProfile = async (req, res) => {
  try {
    const { name, email, currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);

    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: 'Email already in use'
        });
      }
    }

    // If changing password
    if (currentPassword && newPassword) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message: 'Current password is incorrect'
        });
      }

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }

    user.name = name || user.name;
    user.email = email || user.email;

    await user.save();

    res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating profile'
    });
  }
};

// Get user quiz history
exports.getUserQuizHistory = async (req, res) => {
  try {
    const attempts = await QuizAttempt.find({ user: req.user._id })
      .populate('quiz', 'title description')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: attempts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching quiz history'
    });
  }
};