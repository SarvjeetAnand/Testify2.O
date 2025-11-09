import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuiz } from '../contexts/QuizContext';
import { useLayout } from '../contexts/LayoutContext';
import {
  ClockIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  FlagIcon,
  ChevronDownIcon,
  Bars3Icon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const TakeQuiz = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { fetchQuizById, submitQuizResult } = useQuiz();
  const { setShowHeader, setShowFooter } = useLayout();

  const [quiz, setQuiz] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showNavigator, setShowNavigator] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [violations, setViolations] = useState(0);
  
  const startTimeRef = useRef(null);
  const submitInProgressRef = useRef(false);
  const MAX_VIOLATIONS = 1;

  useEffect(() => {
    loadQuiz();
  }, [id]);

  // Timer effect - only runs when quiz is started
  useEffect(() => {
    if (quiz && timeLeft > 0 && quizStarted) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [quiz, timeLeft, quizStarted]);

  // Cleanup effect - restore header/footer on unmount
  useEffect(() => {
    return () => {
      setShowHeader(true);
      setShowFooter(true);
      // Exit fullscreen on unmount
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
    };
  }, [setShowHeader, setShowFooter]);

  // Monitor fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      // Don't track violations if quiz hasn't started or is being submitted
      if (!quizStarted || submitInProgressRef.current) return;

      if (!document.fullscreenElement) {
        // User exited fullscreen
        setShowHeader(true);
        setShowFooter(true);
        
        setViolations((prev) => {
          const newCount = prev + 1;
          toast.error(`⚠️ Fullscreen violation ${newCount}/${MAX_VIOLATIONS}!`, {
            duration: 4000,
          });
          
          // Try to re-enter fullscreen if not at max violations
          if (newCount < MAX_VIOLATIONS) {
            setTimeout(() => {
              if (document.documentElement.requestFullscreen) {
                document.documentElement.requestFullscreen()
                  .then(() => {
                    setShowHeader(false);
                    setShowFooter(false);
                  })
                  .catch((err) => {
                    console.warn('Failed to re-enter fullscreen:', err);
                  });
              }
            }, 1000);
          } else {
            // Max violations reached - auto submit
            toast.error('Maximum violations reached! Auto-submitting quiz...', {
              duration: 5000,
            });
            setTimeout(() => {
              submitQuiz();
            }, 1500);
          }
          
          return newCount;
        });
      } else {
        // Entered fullscreen
        setShowHeader(false);
        setShowFooter(false);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange); // Safari
    document.addEventListener('mozfullscreenchange', handleFullscreenChange); // Firefox
    document.addEventListener('MSFullscreenChange', handleFullscreenChange); // IE11

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, [quizStarted, setShowHeader, setShowFooter]);

  const loadQuiz = async () => {
    setIsLoading(true);
    try {
      const quizData = await fetchQuizById(id);
      if (quizData) {
        setQuiz(quizData);
        setTimeLeft(quizData.timeLimit * 60);
      } else {
        toast.error('Quiz not found');
        navigate('/quizzes');
      }
    } catch (error) {
      toast.error('Failed to load quiz');
      navigate('/quizzes');
    } finally {
      setIsLoading(false);
    }
  };

  // Start quiz and enter fullscreen
  const startQuiz = async () => {
    if (quizStarted) return;
    
    try {
      // Try to enter fullscreen
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      } else if (document.documentElement.webkitRequestFullscreen) {
        await document.documentElement.webkitRequestFullscreen(); // Safari
      } else if (document.documentElement.mozRequestFullScreen) {
        await document.documentElement.mozRequestFullScreen(); // Firefox
      } else if (document.documentElement.msRequestFullscreen) {
        await document.documentElement.msRequestFullscreen(); // IE11
      }
      
      // Hide header and footer
      setShowHeader(false);
      setShowFooter(false);
      
      // Start quiz
      setQuizStarted(true);
      startTimeRef.current = Date.now();
      
      toast.success('Quiz started! Stay in fullscreen mode.', {
        duration: 3000,
      });
      
    } catch (err) {
      console.warn('Fullscreen request failed:', err);
      // Still start the quiz even if fullscreen fails
      setQuizStarted(true);
      startTimeRef.current = Date.now();
      
      toast.warning('Fullscreen not available, but quiz will start.', {
        duration: 3000,
      });
    }
  };

  const handleAnswerSelect = (questionId, answerIndex) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answerIndex
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleQuestionJump = (index) => {
    setCurrentQuestionIndex(index);
    setShowNavigator(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimeColor = () => {
    if (!quiz) return 'text-gray-600';
    const percentage = (timeLeft / (quiz.timeLimit * 60)) * 100;
    if (percentage > 50) return 'text-green-600';
    if (percentage > 25) return 'text-yellow-600';
    return 'text-red-600';
  };

  const handleAutoSubmit = useCallback(() => {
    if (isSubmitting || submitInProgressRef.current) return;
    toast.error('⏰ Time\'s up! Auto-submitting quiz...', {
      duration: 5000,
    });
    submitQuiz();
  }, [isSubmitting]);

  const handleSubmit = () => {
    if (isSubmitting || submitInProgressRef.current) return;

    const unansweredQuestions = quiz.questions.filter(q => answers[q._id] === undefined).length;

    if (unansweredQuestions > 0) {
      const confirmed = window.confirm(
        `You have ${unansweredQuestions} unanswered question${unansweredQuestions > 1 ? 's' : ''}. Are you sure you want to submit?`
      );
      if (!confirmed) return;
    }

    setShowConfirmSubmit(true);
  };

  const submitQuiz = async () => {
    if (isSubmitting || submitInProgressRef.current) return;
    
    submitInProgressRef.current = true;
    setIsSubmitting(true);
    setShowConfirmSubmit(false);

    try {
      // Calculate time taken
      const timeTaken = Math.round((Date.now() - (startTimeRef.current || Date.now())) / 1000);
      
      // Format answers
      const formattedAnswers = quiz.questions.map(question => ({
        questionId: question._id,
        answer: answers[question._id] ?? null
      }));

      const resultData = {
        quizId: id,
        answers: formattedAnswers,
        timeTaken
      };

      // Submit quiz
      const result = await submitQuizResult(resultData);

      // Exit fullscreen BEFORE navigation
      if (document.fullscreenElement) {
        try {
          await document.exitFullscreen();
        } catch (err) {
          // Try alternative methods for different browsers
          if (document.webkitExitFullscreen) {
            await document.webkitExitFullscreen();
          } else if (document.mozCancelFullScreen) {
            await document.mozCancelFullScreen();
          } else if (document.msExitFullscreen) {
            await document.msExitFullscreen();
          }
        }
      }

      // Restore header and footer
      setShowHeader(true);
      setShowFooter(true);

      // Handle result
      if (result?.success && result?.data) {
        const resultId = result.data._id || result.data?.data?._id;
        
        if (!resultId) {
          console.error('Result ID is missing from response:', result);
          toast.error('Failed to get result ID');
          submitInProgressRef.current = false;
          setIsSubmitting(false);
          return;
        }

        toast.success('✅ Quiz submitted successfully!');
        
        // Small delay to ensure fullscreen exit completes
        setTimeout(() => {
          navigate(`/results/${resultId}`);
        }, 500);
      } else {
        console.error('Invalid result response:', result);
        toast.error(result?.message || 'Failed to submit quiz');
        submitInProgressRef.current = false;
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error('Quiz submission error:', error);
      toast.error('Error submitting quiz. Please try again.');
      submitInProgressRef.current = false;
      setIsSubmitting(false);
      
      // Restore header/footer on error
      setShowHeader(true);
      setShowFooter(true);
    }
  };

  if (isLoading) {
    return <LoadingSpinner text="Loading quiz..." />;
  }

  if (!quiz) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">Quiz not found</h2>
          <button
            onClick={() => navigate('/quizzes')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Back to Quizzes
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="min-h-screen bg-gray-50 pb-20 lg:pb-8">
      {/* Start Quiz Overlay */}
      {!quizStarted && quiz && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl p-6 sm:p-8 max-w-md w-full mx-4">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <FlagIcon className="h-8 w-8 text-blue-600" />
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Ready to Start?
              </h2>
              
              <p className="text-gray-600 mb-6 text-sm leading-relaxed">
                This quiz will enter fullscreen mode. Exiting fullscreen is tracked as a violation. 
                <span className="block mt-2 font-semibold text-amber-600">
                  ⚠️ Maximum {MAX_VIOLATIONS} violations allowed
                </span>
              </p>

              <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Questions:</span>
                  <span className="font-semibold">{quiz.questions.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Time Limit:</span>
                  <span className="font-semibold">{quiz.timeLimit} minutes</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Passing Score:</span>
                  <span className="font-semibold">{quiz.passingScore}%</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => navigate('/quizzes')}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={startQuiz}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-lg shadow-blue-600/30"
                >
                  Start Quiz
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Quiz Header */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col space-y-3 sm:space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <div className="flex-1 min-w-0">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
                  {quiz.title}
                </h1>
                <p className="text-sm sm:text-base text-gray-600 mt-1">
                  {quiz.category?.name}
                </p>
                {violations > 0 && (
                  <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-1 bg-amber-100 text-amber-800 rounded text-xs font-medium">
                    ⚠️ Violations: {violations}/{MAX_VIOLATIONS}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-6">
                <div className="flex items-center space-x-2">
                  <ClockIcon className={`h-5 w-5 sm:h-6 sm:w-6 ${getTimeColor()}`} />
                  <span className={`font-mono text-base sm:text-lg font-bold ${getTimeColor()}`}>
                    {formatTime(timeLeft)}
                  </span>
                </div>

                <div className="text-xs sm:text-sm text-gray-600 whitespace-nowrap">
                  {currentQuestionIndex + 1}/{quiz.questions.length}
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div>
              <div className="w-full bg-gray-200 rounded-full h-2 sm:h-2.5">
                <div
                  className="bg-blue-600 h-2 sm:h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1.5">
                <span>Progress: {Math.round(progress)}%</span>
                <span>Answered: {answeredCount}/{quiz.questions.length}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Question Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
              <div className="mb-6 sm:mb-8">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                    Question {currentQuestionIndex + 1}
                  </h2>
                  
                  {/* Mobile Navigator Toggle */}
                  <button
                    onClick={() => setShowNavigator(!showNavigator)}
                    className="lg:hidden flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    <Bars3Icon className="h-4 w-4" />
                    <span>Questions</span>
                  </button>
                </div>
                
                <p className="text-gray-800 text-base sm:text-lg leading-relaxed">
                  {currentQuestion.questionText}
                </p>
              </div>

              <div className="space-y-3">
                {currentQuestion.options.map((option, index) => (
                  <label
                    key={index}
                    className={`flex items-start p-3 sm:p-4 border-2 rounded-lg cursor-pointer transition-all active:scale-[0.98] ${
                      answers[currentQuestion._id] === index
                        ? 'border-blue-500 bg-blue-50 shadow-sm'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name={`question-${currentQuestion._id}`}
                      value={index}
                      checked={answers[currentQuestion._id] === index}
                      onChange={() => handleAnswerSelect(currentQuestion._id, index)}
                      className="sr-only"
                    />
                    <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 mr-3 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      answers[currentQuestion._id] === index
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-gray-300'
                    }`}>
                      {answers[currentQuestion._id] === index && (
                        <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-white"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-gray-900 font-semibold mr-2 text-sm sm:text-base">
                        {String.fromCharCode(65 + index)}.
                      </span>
                      <span className="text-gray-800 text-sm sm:text-base">{option}</span>
                    </div>
                  </label>
                ))}
              </div>

              {/* Desktop Navigation Buttons */}
              <div className="hidden sm:flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={handlePreviousQuestion}
                  disabled={currentQuestionIndex === 0}
                  className="flex items-center px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ArrowLeftIcon className="h-4 w-4 mr-2" />
                  Previous
                </button>

                <div className="flex gap-3">
                  {currentQuestionIndex === quiz.questions.length - 1 ? (
                    <button
                      onClick={handleSubmit}
                      className="flex items-center px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                    >
                      <CheckCircleIcon className="h-4 w-4 mr-2" />
                      Submit Quiz
                    </button>
                  ) : (
                    <button
                      onClick={handleNextQuestion}
                      className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Next
                      <ArrowRightIcon className="h-4 w-4 ml-2" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Desktop Question Navigator */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 sticky top-6">
              <h3 className="font-semibold text-gray-900 mb-4">Questions</h3>

              <div className="grid grid-cols-4 gap-2 mb-4">
                {quiz.questions.map((question, index) => (
                  <button
                    key={question._id}
                    onClick={() => handleQuestionJump(index)}
                    className={`w-full aspect-square rounded-lg text-sm font-medium transition-colors ${
                      index === currentQuestionIndex
                        ? 'bg-blue-600 text-white'
                        : answers[question._id] !== undefined
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>

              <div className="text-xs text-gray-500 space-y-1 mb-4">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-600 rounded mr-2"></div>
                  Current
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-100 rounded mr-2"></div>
                  Answered
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-gray-100 rounded mr-2"></div>
                  Not answered
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <div className="text-sm text-gray-600 space-y-2">
                  <div>Answered: {answeredCount}/{quiz.questions.length}</div>
                  <div>Time Left: <span className={getTimeColor()}>{formatTime(timeLeft)}</span></div>
                  <div>Passing Score: {quiz.passingScore}%</div>
                </div>
              </div>

              <button
                onClick={handleSubmit}
                className="w-full mt-4 flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                <FlagIcon className="h-4 w-4 mr-2" />
                Submit Quiz
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Question Navigator Dropdown */}
        {showNavigator && (
          <div className="lg:hidden fixed inset-x-0 top-0 bottom-0 z-40 bg-black bg-opacity-50" onClick={() => setShowNavigator(false)}>
            <div className="bg-white rounded-t-2xl absolute bottom-0 inset-x-0 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">All Questions</h3>
                <button
                  onClick={() => setShowNavigator(false)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <ChevronDownIcon className="h-5 w-5 text-gray-500" />
                </button>
              </div>
              
              <div className="p-4">
                <div className="grid grid-cols-5 gap-2 mb-4">
                  {quiz.questions.map((question, index) => (
                    <button
                      key={question._id}
                      onClick={() => handleQuestionJump(index)}
                      className={`aspect-square rounded-lg text-sm font-medium transition-colors ${
                        index === currentQuestionIndex
                          ? 'bg-blue-600 text-white'
                          : answers[question._id] !== undefined
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>

                <div className="text-xs text-gray-500 space-y-2 mb-4 bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-blue-600 rounded mr-2"></div>
                    Current Question
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-100 rounded mr-2"></div>
                    Answered
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-gray-100 rounded mr-2"></div>
                    Not Answered
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4 space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Answered:</span>
                    <span className="font-semibold">{answeredCount}/{quiz.questions.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Time Left:</span>
                    <span className={`font-semibold ${getTimeColor()}`}>{formatTime(timeLeft)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Passing Score:</span>
                    <span className="font-semibold">{quiz.passingScore}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Fixed Bottom Navigation */}
        <div className="sm:hidden fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 shadow-lg z-30">
          <div className="flex items-center justify-between p-3 gap-2">
            <button
              onClick={handlePreviousQuestion}
              disabled={currentQuestionIndex === 0}
              className="flex-1 flex items-center justify-center px-4 py-3 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed active:bg-gray-100 transition-colors"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-1" />
              <span className="text-sm font-medium">Previous</span>
            </button>

            {currentQuestionIndex === quiz.questions.length - 1 ? (
              <button
                onClick={handleSubmit}
                className="flex-1 flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 active:bg-green-800 transition-colors"
              >
                <CheckCircleIcon className="h-4 w-4 mr-1" />
                <span className="text-sm font-medium">Submit</span>
              </button>
            ) : (
              <button
                onClick={handleNextQuestion}
                className="flex-1 flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors"
              >
                <span className="text-sm font-medium">Next</span>
                <ArrowRightIcon className="h-4 w-4 ml-1" />
              </button>
            )}
          </div>
        </div>

        {/* Confirm Submit Modal */}
        {showConfirmSubmit && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-5 sm:p-6 max-w-md w-full mx-4 shadow-xl">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">
                Confirm Submission
              </h3>
              <p className="text-sm sm:text-base text-gray-600 mb-4">
                Are you sure you want to submit your quiz? You won't be able to change your answers after submission.
              </p>
              <div className="text-xs sm:text-sm text-gray-500 mb-5 sm:mb-6 bg-gray-50 p-3 rounded-lg space-y-1">
                <div className="flex justify-between">
                  <span>Answered:</span>
                  <span className="font-semibold">{answeredCount}/{quiz.questions.length} questions</span>
                </div>
                <div className="flex justify-between">
                  <span>Time remaining:</span>
                  <span className="font-semibold">{formatTime(timeLeft)}</span>
                </div>
                {violations > 0 && (
                  <div className="flex justify-between text-amber-600">
                    <span>Violations:</span>
                    <span className="font-semibold">{violations}/{MAX_VIOLATIONS}</span>
                  </div>
                )}
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setShowConfirmSubmit(false)}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-colors text-sm sm:text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={submitQuiz}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 active:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm sm:text-base font-medium"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TakeQuiz;