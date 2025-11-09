import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import { 
  UserIcon, 
  AcademicCapIcon, 
  QuestionMarkCircleIcon, 
  FolderIcon,
  ChartBarIcon,
  TrendingUpIcon,
  ClockIcon,
  CodeBracketIcon
} from '@heroicons/react/24/outline';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const response = await adminService.getDashboardData();
      if (response.success) {
        setDashboardData(response.data);
      } else {
        console.error('Failed to fetch dashboard data:', response.message);
      }
    } catch (error) {
      console.error('Dashboard error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner text="Loading admin dashboard..." />;
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">Failed to load dashboard</h2>
          <button 
            onClick={fetchDashboardData}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const { stats, recentActivity, analytics } = dashboardData;

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: UserIcon,
      color: 'blue',
      link: '/admin/users'
    },
    {
      title: 'Total Quizzes',
      value: stats.totalQuizzes,
      icon: AcademicCapIcon,
      color: 'green',
      link: '/admin/quizzes'
    },
    {
      title: 'Total Questions',
      value: stats.totalQuestions,
      icon: QuestionMarkCircleIcon,
      color: 'yellow',
      link: '/admin/questions'
    },
    {
      title: 'Categories',
      value: stats.totalCategories,
      icon: FolderIcon,
      color: 'purple',
      link: '/admin/categories'
    },
    {
      title: 'Quiz Attempts',
      value: stats.totalAttempts,
      icon: ChartBarIcon,
      color: 'indigo',
      link: '/admin/analytics'
    }
  ];

  // Prepare chart data
  const userActivityData = analytics.userActivity.map(item => ({
    month: `${item._id.year}-${item._id.month.toString().padStart(2, '0')}`,
    users: item.count
  }));

  const quizStatsData = analytics.quizStats.map(item => ({
    difficulty: item._id || 'Unknown',
    count: item.count,
    avgScore: Math.round(item.avgScore * 10) / 10
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Monitor and manage your quiz platform
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          {statCards.map((card, index) => (
            <Link
              key={index}
              to={card.link}
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center">
                <div className={`bg-${card.color}-100 p-3 rounded-full`}>
                  <card.icon className={`h-6 w-6 text-${card.color}-600`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{card.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* User Activity Chart */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">User Registrations (Last 6 Months)</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={userActivityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="users" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Quiz Stats Chart */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Quiz Distribution by Difficulty</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={quizStatsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="difficulty" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Users */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Recent Users</h2>
              <Link to="/admin/users" className="text-blue-600 hover:text-blue-700 text-sm">
                View All →
              </Link>
            </div>
            <div className="space-y-3">
              {recentActivity.users.map((user) => (
                <div key={user._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{user.name}</p>
                    <p className="text-sm text-gray-600">{user.email}</p>
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Quizzes */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Recent Quizzes</h2>
              <Link to="/admin/quizzes" className="text-blue-600 hover:text-blue-700 text-sm">
                View All →
              </Link>
            </div>
            <div className="space-y-3">
              {recentActivity.quizzes.map((quiz) => (
                <div key={quiz._id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-medium text-gray-900">{quiz.title}</p>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      quiz.isPublished 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {quiz.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">
                    {quiz.category?.name} • {new Date(quiz.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Quiz Attempts */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Recent Attempts</h2>
              <Link to="/admin/analytics" className="text-blue-600 hover:text-blue-700 text-sm">
                View All →
              </Link>
            </div>
            <div className="space-y-3">
              {recentActivity?.attempts?.length > 0 ? (
                recentActivity.attempts.map((attempt) => (
                  <div key={attempt._id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium text-gray-900 text-sm">
                        {attempt.user?.name || 'Unknown User'}
                      </p>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        attempt.percentage >= 70 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {attempt.percentage}%
                      </span>
                    </div>
                    <p className="text-xs text-gray-600">
                      {attempt.quiz?.title || 'Unknown Quiz'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(attempt.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-gray-500">
                  No quiz attempts yet
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-md p-6 mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              to="/admin/quizzes"
              className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <AcademicCapIcon className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <p className="font-medium text-blue-900">Create Quiz</p>
                <p className="text-xs text-blue-700">Add new quiz</p>
              </div>
            </Link>

            <Link
              to="/admin/questions"
              className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
            >
              <QuestionMarkCircleIcon className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <p className="font-medium text-green-900">Manage Questions</p>
                <p className="text-xs text-green-700">Add or edit questions</p>
              </div>
            </Link>

            <Link
              to="/admin/categories"
              className="flex items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
            >
              <FolderIcon className="h-8 w-8 text-purple-600 mr-3" />
              <div>
                <p className="font-medium text-purple-900">Categories</p>
                <p className="text-xs text-purple-700">Organize content</p>
              </div>
            </Link>

            <Link
              to="/admin/users"
              className="flex items-center p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors"
            >
              <UserIcon className="h-8 w-8 text-yellow-600 mr-3" />
              <div>
                <p className="font-medium text-yellow-900">User Management</p>
                <p className="text-xs text-yellow-700">Manage users</p>
              </div>
            </Link>

            <Link
              to="/admin/coding-problems"
              className="flex items-center p-4 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
            >
              <CodeBracketIcon className="h-8 w-8 text-indigo-600 mr-3" />
              <div>
                <p className="font-medium text-indigo-900">Coding Problems</p>
                <p className="text-xs text-indigo-700">Manage coding challenges</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;