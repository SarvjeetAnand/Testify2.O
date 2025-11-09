// src/pages/Results.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuiz } from '../contexts/QuizContext';
import { quizService } from '../services/quizService';
import { 
  TrophyIcon, 
  ClockIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  ChartBarIcon,
  ArrowLeftIcon,
  ShareIcon 
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Results = () => {
  const { id } = useParams();
  const { userResults, fetchUserResults } = useQuiz();
  const [selectedResult, setSelectedResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (id) {
      fetchResultDetails(id);
    } else {
      fetchUserResults();
    }
  }, [id]);

  const fetchResultDetails = async (resultId) => {
    setIsLoading(true);
    try {
      const response = await quizService.getResultById(resultId);
      if (response.success) {
        setSelectedResult(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch result details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getGradeColor = (percentage) => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 80) return 'text-blue-600';
    if (percentage >= 70) return 'text-yellow-600';
    if (percentage >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const getGradeLetter = (percentage) => {
    if (percentage >= 90) return 'A';
    if (percentage >= 80) return 'B';
    if (percentage >= 70) return 'C';
    if (percentage >= 60) return 'D';
    return 'F';
  };

  // Single Result View
  if (id && selectedResult) {
    const result = selectedResult;
    const gradeColor = getGradeColor(result.percentage);
    const gradeLetter = getGradeLetter(result.percentage);

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back Button */}
          <div className="mb-6">
            <Link
              to="/results"
              className="flex items-center text-blue-600 hover:text-blue-700"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back to Results
            </Link>
          </div>

          {/* Result Header */}
          <div className="bg-white rounded-lg shadow-md p-8 mb-6">
            <div className="text-center mb-6">
              <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-4 ${
                result.passed ? 'bg-green-100' : 'bg-red-100'
              }`}>
                {result.passed ? (
                  <TrophyIcon className="h-12 w-12 text-green-600" />
                ) : (
                  <XCircleIcon className="h-12 w-12 text-red-600" />
                )}
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {result.quiz?.title}
              </h1>
              
              <div className={`text-6xl font-bold ${gradeColor} mb-2`}>
                {result.percentage}%
              </div>
              
              <div className={`text-2xl font-bold ${gradeColor} mb-4`}>
                Grade: {gradeLetter}
              </div>
              
              <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
                result.passed 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {result.passed ? (
                  <>
                    <CheckCircleIcon className="h-4 w-4 mr-2" />
                    Passed
                  </>
                ) : (
                  <>
                    <XCircleIcon className="h-4 w-4 mr-2" />
                    Failed
                  </>
                )}
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{result.score}</div>
                <div className="text-sm text-gray-600">Score</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{result.totalPossibleScore}</div>
                <div className="text-sm text-gray-600">Total Points</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{formatTime(result.timeTaken)}</div>
                <div className="text-sm text-gray-600">Time Taken</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{result.quiz?.passingScore}%</div>
                <div className="text-sm text-gray-600">Passing Score</div>
              </div>
            </div>
          </div>

          {/* Question-by-Question Breakdown */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Question Breakdown
            </h2>
            
            <div className="space-y-6">
              {result.questionResults?.map((qResult, index) => (
                <div key={index} className="border-l-4 border-gray-200 pl-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-medium text-gray-900">
                      Question {index + 1}
                    </h3>
                    <div className={`flex items-center ${
                      qResult.isCorrect ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {qResult.isCorrect ? (
                        <CheckCircleIcon className="h-5 w-5 mr-1" />
                      ) : (
                        <XCircleIcon className="h-5 w-5 mr-1" />
                      )}
                      <span className="text-sm font-medium">
                        {qResult.points}/{qResult.points} pts
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-gray-800 mb-3">
                    {qResult.questionId?.questionText}
                  </p>
                  
                  <div className="space-y-2">
                    {qResult.questionId?.options?.map((option, optIndex) => (
                      <div
                        key={optIndex}
                        className={`p-2 rounded text-sm ${
                          optIndex === qResult.correctAnswer
                            ? 'bg-green-100 text-green-800 border border-green-200'
                            : optIndex === qResult.userAnswer
                            ? 'bg-red-100 text-red-800 border border-red-200'
                            : 'bg-gray-50 text-gray-700'
                        }`}
                      >
                        <span className="font-medium mr-2">
                          {String.fromCharCode(65 + optIndex)}.
                        </span>
                        {option}
                        {optIndex === qResult.correctAnswer && (
                          <span className="ml-2 text-green-600 font-medium">
                            ✓ Correct
                          </span>
                        )}
                        {optIndex === qResult.userAnswer && optIndex !== qResult.correctAnswer && (
                          <span className="ml-2 text-red-600 font-medium">
                            ✗ Your answer
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-center gap-4 mt-8">
            <Link
              to="/quizzes"
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Take Another Quiz
            </Link>
            <button
              onClick={() => window.print()}
              className="flex items-center px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              <ShareIcon className="h-4 w-4 mr-2" />
              Print Results
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Results List View
  if (isLoading) {
    return <LoadingSpinner text="Loading results..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Quiz Results</h1>
          <p className="text-gray-600 mt-2">
            Track your progress and review your quiz performance
          </p>
        </div>

        {userResults.length > 0 ? (
          <>
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="text-2xl font-bold text-gray-900">
                  {userResults.length}
                </div>
                <div className="text-sm text-gray-600">Total Quizzes</div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="text-2xl font-bold text-green-600">
                  {userResults.filter(r => r.passed).length}
                </div>
                <div className="text-sm text-gray-600">Passed</div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="text-2xl font-bold text-blue-600">
                  {Math.round(userResults.reduce((sum, r) => sum + r.percentage, 0) / userResults.length)}%
                </div>
                <div className="text-sm text-gray-600">Average Score</div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="text-2xl font-bold text-purple-600">
                  {Math.round((userResults.filter(r => r.passed).length / userResults.length) * 100)}%
                </div>
                <div className="text-sm text-gray-600">Success Rate</div>
              </div>
            </div>

            {/* Results List */}
            <div className="bg-white rounded-lg shadow-md">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Recent Results</h2>
              </div>
              
              <div className="divide-y divide-gray-200">
                {userResults.map((result) => (
                  <div key={result._id} className="p-6 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <h3 className="text-lg font-medium text-gray-900">
                            {result.quiz?.title}
                          </h3>
                          <div className={`ml-3 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            result.passed 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {result.passed ? (
                              <>
                                <CheckCircleIcon className="h-3 w-3 mr-1" />
                                Passed
                              </>
                            ) : (
                              <>
                                <XCircleIcon className="h-3 w-3 mr-1" />
                                Failed
                              </>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-6 text-sm text-gray-600">
                          <div className="flex items-center">
                            <ChartBarIcon className="h-4 w-4 mr-1" />
                            Score: {result.score}/{result.totalPossibleScore}
                          </div>
                          <div className="flex items-center">
                            <ClockIcon className="h-4 w-4 mr-1" />
                            Time: {formatTime(result.timeTaken)}
                          </div>
                          <div>
                            Date: {new Date(result.completedAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className={`text-2xl font-bold ${getGradeColor(result.percentage)}`}>
                          {result.percentage}%
                        </div>
                        <Link
                          to={`/results/${result._id}`}
                          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <ChartBarIcon className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No results yet</h3>
            <p className="text-gray-500 mb-6">
              You haven't completed any quizzes yet. Take your first quiz to see results here!
            </p>
            <Link
              to="/quizzes"
              className="inline-flex items-center px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Browse Quizzes
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Results;