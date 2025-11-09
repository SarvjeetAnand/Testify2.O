import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { codingService } from '../../services/codingService';
import { 
  ArrowLeftIcon,
  PlayIcon,
  PaperAirplaneIcon,
  CheckCircleIcon,
  XCircleIcon,
  CodeBracketIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const TakeCodingProblem = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [problem, setProblem] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testResults, setTestResults] = useState(null);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [showSubmissions, setShowSubmissions] = useState(false);

  useEffect(() => {
    loadProblem();
    loadSubmissions();
  }, [id]);

  const loadProblem = async () => {
    setIsLoading(true);
    try {
      const response = await codingService.getProblemById(id);
      if (response.success) {
        setProblem(response.data);
        // Set default code based on language
        if (response.data.sampleCode && response.data.sampleCode[language]) {
          setCode(response.data.sampleCode[language]);
        }
      } else {
        toast.error(response.message || 'Failed to load problem');
        navigate('/coding');
      }
    } catch (error) {
      console.error('Failed to load problem:', error);
      toast.error('Failed to load coding problem');
      navigate('/coding');
    } finally {
      setIsLoading(false);
    }
  };

  const loadSubmissions = async () => {
    try {
      const response = await codingService.getUserSubmissions(id);
      if (response.success) {
        setSubmissions(response.data || []);
      }
    } catch (error) {
      console.error('Failed to load submissions:', error);
    }
  };

  useEffect(() => {
    if (problem && problem.sampleCode && problem.sampleCode[language]) {
      setCode(problem.sampleCode[language] || '');
    }
  }, [language, problem]);

  const handleRunCode = async () => {
    if (!code.trim()) {
      toast.error('Please write some code first');
      return;
    }

    setIsRunning(true);
    setTestResults(null);
    try {
      const response = await codingService.runCode(code, language, id);
      if (response.success) {
        setTestResults(response.data);
      } else {
        toast.error(response.message || 'Failed to run code');
      }
    } catch (error) {
      console.error('Failed to run code:', error);
      toast.error('Failed to run code');
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = async () => {
    if (!code.trim()) {
      toast.error('Please write some code first');
      return;
    }

    if (!window.confirm('Are you sure you want to submit your solution?')) {
      return;
    }

    setIsSubmitting(true);
    setSubmissionResult(null);
    try {
      const response = await codingService.submitSolution(code, language, id);
      if (response.success) {
        setSubmissionResult(response.data);
        loadSubmissions();
        if (response.data.passed) {
          toast.success('🎉 Congratulations! All test cases passed!');
        } else {
          toast.error('Some test cases failed. Try again!');
        }
      } else {
        toast.error(response.message || 'Failed to submit solution');
      }
    } catch (error) {
      console.error('Failed to submit:', error);
      toast.error('Failed to submit solution');
    } finally {
      setIsSubmitting(false);
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Problem Not Found</h2>
          <Link to="/coding" className="text-blue-600 hover:text-blue-700">
            ← Back to Problems
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            to="/coding"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Back to Problems
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{problem.title}</h1>
                <span className={`px-3 py-1 text-sm rounded-full ${getDifficultyColor(problem.difficulty)}`}>
                  {problem.difficulty}
                </span>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <ClockIcon className="h-4 w-4" />
                  Time Limit: {problem.timeLimit}s
                </span>
                <span>Memory Limit: {problem.memoryLimit}MB</span>
                {problem.category && (
                  <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">
                    {problem.category.name || problem.category}
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={() => setShowSubmissions(!showSubmissions)}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 text-sm"
            >
              {showSubmissions ? 'Hide' : 'View'} Submissions ({submissions.length})
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Panel - Problem Description */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Problem Description</h2>
              <div className="prose max-w-none">
                <pre className="whitespace-pre-wrap font-sans text-gray-700 bg-gray-50 p-4 rounded">
                  {problem.description}
                </pre>
              </div>
            </div>

            {/* Sample Test Cases */}
            {problem.testCases && problem.testCases.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Sample Test Cases</h2>
                <div className="space-y-4">
                  {problem.testCases.map((testCase, index) => (
                    <div key={index} className="border border-gray-200 rounded p-4">
                      <h3 className="font-medium text-gray-900 mb-2">Test Case {index + 1}</h3>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">Input:</span>
                          <pre className="mt-1 bg-gray-50 p-2 rounded font-mono text-xs">
                            {testCase.input}
                          </pre>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Expected Output:</span>
                          <pre className="mt-1 bg-gray-50 p-2 rounded font-mono text-xs">
                            {testCase.expectedOutput}
                          </pre>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Test Results */}
            {testResults && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Test Results</h2>
                <div className="space-y-3">
                  {testResults.map((result, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded border ${
                        result.passed
                          ? 'bg-green-50 border-green-200'
                          : 'bg-red-50 border-red-200'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        {result.passed ? (
                          <CheckCircleIcon className="h-5 w-5 text-green-600" />
                        ) : (
                          <XCircleIcon className="h-5 w-5 text-red-600" />
                        )}
                        <span className="font-medium">
                          Test Case {index + 1}: {result.passed ? 'Passed' : 'Failed'}
                        </span>
                      </div>
                      {result.actualOutput !== undefined && (
                        <div className="text-sm space-y-1">
                          <div>
                            <span className="font-medium">Your Output:</span>
                            <pre className="mt-1 bg-white p-2 rounded font-mono text-xs">
                              {result.actualOutput || '(empty)'}
                            </pre>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Submission Result */}
            {submissionResult && (
              <div
                className={`bg-white rounded-lg shadow-md p-6 border-2 ${
                  submissionResult.passed
                    ? 'border-green-500'
                    : 'border-red-500'
                }`}
              >
                <div className="flex items-center gap-3 mb-4">
                  {submissionResult.passed ? (
                    <>
                      <CheckCircleIcon className="h-8 w-8 text-green-600" />
                      <h2 className="text-xl font-semibold text-green-700">
                        All Test Cases Passed! 🎉
                      </h2>
                    </>
                  ) : (
                    <>
                      <XCircleIcon className="h-8 w-8 text-red-600" />
                      <h2 className="text-xl font-semibold text-red-700">
                        Some Test Cases Failed
                      </h2>
                    </>
                  )}
                </div>
                {submissionResult.results && (
                  <div className="space-y-2">
                    {submissionResult.results.map((result, index) => (
                      <div
                        key={index}
                        className={`p-3 rounded ${
                          result.passed ? 'bg-green-50' : 'bg-red-50'
                        }`}
                      >
                        Test Case {index + 1}: {result.passed ? '✓ Passed' : '✗ Failed'}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Previous Submissions */}
            {showSubmissions && submissions.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Submissions</h2>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {submissions.map((submission) => (
                    <div
                      key={submission._id}
                      className={`p-4 rounded border ${
                        submission.passed
                          ? 'bg-green-50 border-green-200'
                          : 'bg-red-50 border-red-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-medium">
                            {submission.passed ? '✓ Accepted' : '✗ Failed'}
                          </span>
                          <span className="text-sm text-gray-600 ml-2">
                            {submission.language} • {new Date(submission.submittedAt).toLocaleString()}
                          </span>
                        </div>
                        <span className="text-sm text-gray-600">
                          {submission.executionTime}ms
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Panel - Code Editor */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md">
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <h2 className="text-xl font-semibold text-gray-900">Code Editor</h2>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="javascript">JavaScript</option>
                    <option value="python">Python</option>
                    <option value="java">Java</option>
                    <option value="cpp">C++</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleRunCode}
                    disabled={isRunning || isSubmitting}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    <PlayIcon className="h-4 w-4 mr-2" />
                    Run
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={isRunning || isSubmitting}
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    <PaperAirplaneIcon className="h-4 w-4 mr-2" />
                    {isSubmitting ? 'Submitting...' : 'Submit'}
                  </button>
                </div>
              </div>
              <div className="p-4">
                <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full h-96 p-4 border border-gray-300 rounded-md font-mono text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 resize-none"
                  placeholder="Write your code here..."
                  spellCheck={false}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TakeCodingProblem;

