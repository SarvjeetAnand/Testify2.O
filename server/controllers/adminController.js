const User = require('../models/User');
const Quiz = require('../models/Quiz');
const Question = require('../models/Question');
const Category = require('../models/Category');
const QuizAttempt = require('../models/QuizAttempt');
const Result = require('../models/Result');
const CodingProblem = require('../models/CodingProblem');

// @desc    Get admin dashboard data
// @route   GET /api/admin/dashboard
// @access  Private (Admin)
exports.getAdminDashboard = async (req, res) => {
  try {
    // Get counts
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalQuizzes = await Quiz.countDocuments();
    const totalQuestions = await Question.countDocuments();
    const totalCategories = await Category.countDocuments();
    const totalAttempts = await QuizAttempt.countDocuments({ status: 'completed' });

    // Recent activity
    const recentUsers = await User.find({ role: 'user' })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name email createdAt');

    const recentQuizzes = await Quiz.find()
      .populate('category', 'name')
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title category createdAt isPublished');

    // Add proper population for quiz attempts
    const recentAttempts = await QuizAttempt.find({ status: 'completed' })
      .populate({
        path: 'user',
        select: 'name email'
      })
      .populate({
        path: 'quiz',
        select: 'title'
      })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('quiz user percentage createdAt');

    // Analytics data
    const userActivity = await User.aggregate([
      {
        $match: {
          role: 'user',
          createdAt: { 
            $gte: new Date(new Date().setMonth(new Date().getMonth() - 6)) 
          }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    const quizStats = await Quiz.aggregate([
      {
        $group: {
          _id: '$difficulty',
          count: { $sum: 1 },
          avgScore: { $avg: '$averageScore' }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalUsers,
          totalQuizzes,
          totalQuestions,
          totalCategories,
          totalAttempts
        },
        recentActivity: {
          users: recentUsers,
          quizzes: recentQuizzes,
          attempts: recentAttempts
        },
        analytics: {
          quizStats,
          userActivity
        }
      }
    });

  } catch (error) {
    console.error('Get admin dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard data'
    });
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin)
exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', status = 'all' } = req.query;

    let query = { role: 'user' };
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (status !== 'all') {
      query.isActive = status === 'active';
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    // Get quiz attempt counts for each user
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const attemptCount = await QuizAttempt.countDocuments({
          user: user._id,
          status: 'completed'
        });
        return {
          ...user.toObject(),
          totalAttempts: attemptCount
        };
      })
    );

    res.status(200).json({
      success: true,
      data: usersWithStats,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users'
    });
  }
};

// @desc    Get user by ID with detailed stats
// @route   GET /api/admin/users/:id
// @access  Private (Admin)
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get user statistics
    const totalAttempts = await QuizAttempt.countDocuments({
      user: user._id,
      status: 'completed'
    });

    const passedAttempts = await QuizAttempt.countDocuments({
      user: user._id,
      status: 'completed',
      passed: true
    });

    const averageScore = await QuizAttempt.aggregate([
      {
        $match: {
          user: user._id,
          status: 'completed'
        }
      },
      {
        $group: {
          _id: null,
          avgScore: { $avg: '$percentage' }
        }
      }
    ]);

    const recentAttempts = await QuizAttempt.find({
      user: user._id,
      status: 'completed'
    })
      .populate('quiz', 'title category')
      .populate('quiz.category', 'name')
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      data: {
        user,
        stats: {
          totalAttempts,
          passedAttempts,
          averageScore: averageScore[0]?.avgScore || 0,
          successRate: totalAttempts > 0 ? (passedAttempts / totalAttempts) * 100 : 0
        },
        recentAttempts
      }
    });
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user details'
    });
  }
};

// @desc    Update user status
// @route   PUT /api/admin/users/:id/status
// @access  Private (Admin)
exports.updateUserStatus = async (req, res) => {
  try {
    const { isActive } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: user
    });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user status'
    });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin)
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.role === 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete admin user'
      });
    }

    // Delete related data
    await QuizAttempt.deleteMany({ user: req.params.id });
    await Result.deleteMany({ user: req.params.id });
    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting user'
    });
  }
};

// @desc    Get quiz analytics
// @route   GET /api/admin/quiz/:id/analytics
// @access  Private (Admin)
exports.getQuizAnalytics = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id)
      .populate('category', 'name');

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    // Basic stats
    const totalAttempts = await QuizAttempt.countDocuments({
      quiz: req.params.id,
      status: 'completed'
    });

    const passedAttempts = await QuizAttempt.countDocuments({
      quiz: req.params.id,
      status: 'completed',
      passed: true
    });

    // Score distribution
    const scoreDistribution = await QuizAttempt.aggregate([
      {
        $match: {
          quiz: quiz._id,
          status: 'completed'
        }
      },
      {
        $bucket: {
          groupBy: '$percentage',
          boundaries: [0, 20, 40, 60, 80, 100],
          default: 'Other',
          output: {
            count: { $sum: 1 }
          }
        }
      }
    ]);

    // Top performers
    const topPerformers = await QuizAttempt.find({
      quiz: req.params.id,
      status: 'completed'
    })
      .populate('user', 'name email')
      .sort({ score: -1, totalTimeSpent: 1 })
      .limit(10);

    // Average time spent per question
    const avgTimeStats = await QuizAttempt.aggregate([
      {
        $match: {
          quiz: quiz._id,
          status: 'completed'
        }
      },
      {
        $group: {
          _id: null,
          avgTime: { $avg: '$totalTimeSpent' },
          avgScore: { $avg: '$percentage' }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        quiz,
        stats: {
          totalAttempts,
          passedAttempts,
          passRate: totalAttempts > 0 ? (passedAttempts / totalAttempts) * 100 : 0,
          averageScore: avgTimeStats[0]?.avgScore || 0,
          averageTime: avgTimeStats[0]?.avgTime || 0
        },
        scoreDistribution,
        topPerformers
      }
    });
  } catch (error) {
    console.error('Get quiz analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching quiz analytics'
    });
  }
};

// @desc    Get analytics data
// @route   GET /api/admin/analytics
// @access  Private (Admin)
exports.getAnalytics = async (req, res) => {
  try {
    const { timeRange = 'month' } = req.query;
    const now = new Date();
    let startDate;

    switch (timeRange) {
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'month':
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      case 'year':
        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      default:
        startDate = new Date(now.setMonth(now.getMonth() - 1));
    }

    // Get key metrics
    const totalUsers = await User.countDocuments({ role: 'user' });
    const activeQuizzes = await Quiz.countDocuments({ isPublished: true });
    const completionRate = await calculateCompletionRate();
    const avgTimeSpent = await calculateAverageTimeSpent();

    // Get user activity trends
    const userActivity = await QuizAttempt.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }
          },
          activeUsers: { $sum: 1 },
          newUsers: { $sum: { $cond: [{ $eq: ["$attemptNumber", 1] }, 1, 0] } }
        }
      },
      {
        $sort: { "_id.date": 1 }
      },
      {
        $project: {
          _id: 0,
          date: "$_id.date",
          activeUsers: 1,
          newUsers: 1
        }
      }
    ]);

    // Get quiz performance data
    const quizPerformance = await Quiz.aggregate([
      {
        $lookup: {
          from: "quizattempts",
          localField: "_id",
          foreignField: "quiz",
          as: "attempts"
        }
      },
      {
        $group: {
          _id: "$category",
          attempts: { $sum: { $size: "$attempts" } },
          completions: { $sum: { $size: { $filter: { input: "$attempts", as: "a", cond: { $eq: ["$$a.status", "completed"] } } } } }
        }
      },
      {
        $lookup: {
          from: "categories",
          localField: "_id",
          foreignField: "_id",
          as: "categoryInfo"
        }
      },
      {
        $project: {
          category: { $arrayElemAt: ["$categoryInfo.name", 0] },
          attempts: 1,
          completions: 1
        }
      }
    ]);

    // Get score distribution
    const scoreDistribution = await QuizAttempt.aggregate([
      {
        $match: {
          status: "completed"
        }
      },
      {
        $group: {
          _id: {
            $switch: {
              branches: [
                { case: { $lt: ["$percentage", 20] }, then: "0-20%" },
                { case: { $lt: ["$percentage", 40] }, then: "21-40%" },
                { case: { $lt: ["$percentage", 60] }, then: "41-60%" },
                { case: { $lt: ["$percentage", 80] }, then: "61-80%" },
                { case: { $lte: ["$percentage", 100] }, then: "81-100%" }
              ],
              default: "Unknown"
            }
          },
          value: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          range: "$_id",
          value: 1
        }
      }
    ]);

    // Get category distribution
    const categoryDistribution = await Quiz.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: "categories",
          localField: "_id",
          foreignField: "_id",
          as: "categoryInfo"
        }
      },
      {
        $project: {
          _id: 0,
          name: { $arrayElemAt: ["$categoryInfo.name", 0] },
          count: 1
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        metrics: {
          totalUsers,
          activeQuizzes,
          completionRate,
          avgTimeSpent
        },
        trends: {
          userActivity,
          quizPerformance
        },
        distributions: {
          scores: scoreDistribution,
          categories: categoryDistribution
        }
      }
    });

  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching analytics data'
    });
  }
};

// Helper functions
async function calculateCompletionRate() {
  const totalAttempts = await QuizAttempt.countDocuments();
  const completedAttempts = await QuizAttempt.countDocuments({ status: 'completed' });
  return totalAttempts ? Math.round((completedAttempts / totalAttempts) * 100) : 0;
}

async function calculateAverageTimeSpent() {
  const result = await QuizAttempt.aggregate([
    {
      $group: {
        _id: null,
        avgTime: { $avg: '$timeTaken' }
      }
    }
  ]);
  return result.length ? Math.round(result[0].avgTime / 60) : 0;
}

// @desc    Get all coding problems
// @route   GET /api/admin/coding-problems
// @access  Private (Admin)
exports.getAllCodingProblems = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', difficulty = '', category = '' } = req.query;

    let query = {};
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (difficulty) {
      query.difficulty = difficulty;
    }

    if (category) {
      query.category = category;
    }

    const problems = await CodingProblem.find(query)
      .populate('category', 'name')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await CodingProblem.countDocuments(query);

    res.status(200).json({
      success: true,
      data: problems,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get all coding problems error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching coding problems'
    });
  }
};

// @desc    Get coding problem by ID
// @route   GET /api/admin/coding-problems/:id
// @access  Private (Admin)
exports.getCodingProblemById = async (req, res) => {
  try {
    const problem = await CodingProblem.findById(req.params.id)
      .populate('category', 'name')
      .populate('createdBy', 'name email');

    if (!problem) {
      return res.status(404).json({
        success: false,
        message: 'Coding problem not found'
      });
    }

    res.status(200).json({
      success: true,
      data: problem
    });
  } catch (error) {
    console.error('Get coding problem by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching coding problem'
    });
  }
};

// @desc    Create coding problem
// @route   POST /api/admin/coding-problems
// @access  Private (Admin)
exports.createCodingProblem = async (req, res) => {
  try {
    const problem = new CodingProblem({
      ...req.body,
      createdBy: req.user._id
    });
    
    await problem.save();
    await problem.populate('category', 'name');
    await problem.populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'Coding problem created successfully',
      data: problem
    });
  } catch (error) {
    console.error('Create coding problem error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating coding problem'
    });
  }
};

// @desc    Update coding problem
// @route   PUT /api/admin/coding-problems/:id
// @access  Private (Admin)
exports.updateCodingProblem = async (req, res) => {
  try {
    const problem = await CodingProblem.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate('category', 'name')
      .populate('createdBy', 'name email');

    if (!problem) {
      return res.status(404).json({
        success: false,
        message: 'Coding problem not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Coding problem updated successfully',
      data: problem
    });
  } catch (error) {
    console.error('Update coding problem error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating coding problem'
    });
  }
};

// @desc    Delete coding problem
// @route   DELETE /api/admin/coding-problems/:id
// @access  Private (Admin)
exports.deleteCodingProblem = async (req, res) => {
  try {
    const problem = await CodingProblem.findById(req.params.id);
    
    if (!problem) {
      return res.status(404).json({
        success: false,
        message: 'Coding problem not found'
      });
    }

    await CodingProblem.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Coding problem deleted successfully'
    });
  } catch (error) {
    console.error('Delete coding problem error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting coding problem'
    });
  }
};