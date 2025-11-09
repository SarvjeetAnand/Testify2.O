import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useQuiz } from '../contexts/QuizContext';
import { 
  AcademicCapIcon, 
  ChartBarIcon, 
  TrophyIcon, 
  ClockIcon,
  PlayIcon,
  CheckCircleIcon,
  XCircleIcon 
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../components/common/LoadingSpinner';

const UserDashboard = () => {
  const { user } = useAuth();
  const { quizzes, userResults, fetchQuizzes, fetchUserResults, isLoading } = useQuiz();
  const [stats, setStats] = useState({
    totalQuizzesTaken: 0,
    averageScore: 0,
    totalTimeSpent: 0,
    quizzesPassed: 0
  });

  useEffect(() => {
    fetchQuizzes();
    fetchUserResults();
  }, []);

  useEffect(() => {
    if (userResults.length > 0) {
      const totalQuizzes = userResults.length;
      const totalScore = userResults.reduce((sum, result) => sum + result.percentage, 0);
      const averageScore = totalScore / totalQuizzes;
      const totalTime = userResults.reduce((sum, result) => sum + result.timeTaken, 0);
      const passed = userResults.filter(result => result.passed).length;

      setStats({
        totalQuizzesTaken: totalQuizzes,
        averageScore: Math.round(averageScore * 10) / 10,
        totalTimeSpent: Math.round(totalTime / 60), // Convert to minutes
        quizzesPassed: passed
      });
    }
  }, [userResults]);

  const recentQuizzes = quizzes.slice(0, 6);
  const recentResults = userResults.slice(0, 5);

  if (isLoading) {
    return <LoadingSpinner text="Loading your dashboard..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-gray-600 mt-2">
            Ready to continue your learning journey? Here's your overview.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-full">
                <AcademicCapIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Quizzes Taken</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalQuizzesTaken}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-full">
                <ChartBarIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Average Score</p>
                <p className="text-2xl font-bold text-gray-900">{stats.averageScore}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <div className="bg-yellow-100 p-3 rounded-full">
                <TrophyIcon className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Quizzes Passed</p>
                <p className="text-2xl font-bold text-gray-900">{stats.quizzesPassed}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <div className="bg-purple-100 p-3 rounded-full">
                <ClockIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Time Spent</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalTimeSpent}m</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Available Quizzes */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Available Quizzes</h2>
                <Link
                  to="/quizzes"
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  View All →
                </Link>
              </div>
              
              {recentQuizzes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {recentQuizzes.map((quiz) => (
                    <div key={quiz._id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                      <h3 className="font-semibold text-gray-900 mb-2">{quiz.title}</h3>
                      <p className="text-sm text-gray-600 mb-3">{quiz.description}</p>
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                        <span>Category: {quiz.category?.name}</span>
                        <span>Time: {quiz.timeLimit}min</span>
                      </div>
                      <Link
                        to={`/quiz/${quiz._id}`}
                        className="inline-flex items-center px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                      >
                        <PlayIcon className="h-4 w-4 mr-1" />
                        Start Quiz
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <AcademicCapIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No quizzes available at the moment.</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Results */}
          <div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Recent Results</h2>
                <Link
                  to="/results"
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  View All →
                </Link>
              </div>
              
              {recentResults.length > 0 ? (
                <div className="space-y-4">
                  {recentResults.map((result) => (
                    <div key={result._id} className="border-l-4 border-gray-200 pl-4">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-medium text-gray-900 text-sm">
                          {result.quiz?.title}
                        </h3>
                        {result.passed ? (
                          <CheckCircleIcon className="h-5 w-5 text-green-500" />
                        ) : (
                          <XCircleIcon className="h-5 w-5 text-red-500" />
                        )}
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Score: {result.percentage}%</span>
                        <span>{new Date(result.completedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <ChartBarIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 text-sm">No quiz results yet.</p>
                  <p className="text-gray-400 text-xs">Take your first quiz to see results here!</p>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-md p-6 mt-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <Link
                  to="/quizzes"
                  className="flex items-center justify-between p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <div className="flex items-center">
                    <AcademicCapIcon className="h-5 w-5 text-blue-600 mr-3" />
                    <span className="font-medium text-blue-900">Browse Quizzes</span>
                  </div>
                  <span className="text-blue-600">→</span>
                </Link>
                
                <Link
                  to="/results"
                  className="flex items-center justify-between p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                >
                  <div className="flex items-center">
                    <ChartBarIcon className="h-5 w-5 text-green-600 mr-3" />
                    <span className="font-medium text-green-900">View Results</span>
                  </div>
                  <span className="text-green-600">→</span>
                </Link>
                
                <Link
                  to="/profile"
                  className="flex items-center justify-between p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
                >
                  <div className="flex items-center">
                    <svg className="h-5 w-5 text-purple-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium text-purple-900">Edit Profile</span>
                  </div>
                  <span className="text-purple-600">→</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Chart Section */}
        {userResults.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mt-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Performance Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Success Rate */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Success Rate</h3>
                <div className="flex items-center">
                  <div className="flex-1 bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-green-500 h-3 rounded-full" 
                      style={{ width: `${(stats.quizzesPassed / stats.totalQuizzesTaken) * 100}%` }}
                    ></div>
                  </div>
                  <span className="ml-3 text-sm font-medium text-gray-900">
                    {Math.round((stats.quizzesPassed / stats.totalQuizzesTaken) * 100)}%
                  </span>
                </div>
              </div>

              {/* Average Score */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Average Score</h3>
                <div className="flex items-center">
                  <div className="flex-1 bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-blue-500 h-3 rounded-full" 
                      style={{ width: `${stats.averageScore}%` }}
                    ></div>
                  </div>
                  <span className="ml-3 text-sm font-medium text-gray-900">
                    {stats.averageScore}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;