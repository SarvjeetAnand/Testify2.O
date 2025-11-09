import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { codingService } from '../../services/codingService';
import { 
  CodeBracketIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const CodingResults = () => {
  const [submissions, setSubmissions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  useEffect(() => {
    loadSubmissions();
  }, []);

  const loadSubmissions = async () => {
    setIsLoading(true);
    try {
      const response = await codingService.getAllSubmissions();
      if (response.success) {
        setSubmissions(response.data || []);
      } else {
        toast.error(response.message || 'Failed to load submissions');
      }
    } catch (error) {
      console.error('Failed to load submissions:', error);
      toast.error('Failed to load submissions');
    } finally {
      setIsLoading(false);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/coding"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Back to Problems
          </Link>
          <div className="flex items-center gap-3">
            <CodeBracketIcon className="h-10 w-10 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Coding Submissions</h1>
              <p className="text-gray-600 mt-1">
                View your coding problem attempts and results
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        {submissions.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-2xl font-bold text-gray-900">{submissions.length}</div>
              <div className="text-sm text-gray-600">Total Submissions</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-2xl font-bold text-green-600">
                {submissions.filter(s => s.passed).length}
              </div>
              <div className="text-sm text-gray-600">Accepted Solutions</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-2xl font-bold text-blue-600">
                {new Set(submissions.map(s => s.problem?._id || s.problem)).size}
              </div>
              <div className="text-sm text-gray-600">Problems Attempted</div>
            </div>
          </div>
        )}

        {/* Submissions List */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Submission History ({submissions.length})
            </h3>
          </div>

          <div className="p-6">
            {submissions.length > 0 ? (
              <div className="space-y-4">
                {submissions.map((submission) => (
                  <div
                    key={submission._id}
                    className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                      submission.passed
                        ? 'border-green-200 bg-green-50'
                        : 'border-red-200 bg-red-50'
                    }`}
                    onClick={() => setSelectedSubmission(
                      selectedSubmission?._id === submission._id ? null : submission
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          {submission.passed ? (
                            <CheckCircleIcon className="h-6 w-6 text-green-600" />
                          ) : (
                            <XCircleIcon className="h-6 w-6 text-red-600" />
                          )}
                          <div>
                            <Link
                              to={`/coding/${submission.problem?._id || submission.problem}`}
                              className="text-lg font-semibold text-gray-900 hover:text-blue-600"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {submission.problem?.title || 'Unknown Problem'}
                            </Link>
                            {submission.problem?.difficulty && (
                              <span
                                className={`ml-3 px-2 py-1 text-xs rounded-full ${getDifficultyColor(
                                  submission.problem.difficulty
                                )}`}
                              >
                                {submission.problem.difficulty}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600 ml-8">
                          <span className="flex items-center gap-1">
                            <CodeBracketIcon className="h-4 w-4" />
                            {submission.language}
                          </span>
                          <span className="flex items-center gap-1">
                            <ClockIcon className="h-4 w-4" />
                            {submission.executionTime}ms
                          </span>
                          <span>{formatDate(submission.submittedAt)}</span>
                        </div>
                        {selectedSubmission?._id === submission._id && (
                          <div className="mt-4 ml-8 border-t border-gray-200 pt-4">
                            <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm overflow-x-auto">
                              <pre className="whitespace-pre-wrap">{submission.code}</pre>
                            </div>
                            <div className="mt-4">
                              <h4 className="font-medium text-gray-900 mb-2">Test Case Results:</h4>
                              <div className="space-y-2">
                                {submission.testCaseResults?.map((result, index) => (
                                  <div
                                    key={index}
                                    className={`p-2 rounded text-sm ${
                                      result.passed ? 'bg-green-100' : 'bg-red-100'
                                    }`}
                                  >
                                    Test Case {index + 1}: {result.passed ? '✓ Passed' : '✗ Failed'} (
                                    {result.executionTime}ms)
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <div
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            submission.passed
                              ? 'bg-green-200 text-green-800'
                              : 'bg-red-200 text-red-800'
                          }`}
                        >
                          {submission.passed ? 'Accepted' : 'Failed'}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <CodeBracketIcon className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No submissions yet
                </h3>
                <p className="text-gray-500 mb-4">
                  Start solving coding problems to see your submissions here
                </p>
                <Link
                  to="/coding"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Browse Problems
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodingResults;

