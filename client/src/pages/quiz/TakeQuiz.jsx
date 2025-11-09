import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useApi, useApiMutation } from '../../hooks/useApi'
import { quizService } from '../../services/quiz'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import QuizTimer from '../../components/quiz/QuizTimer'
import QuestionCard from '../../components/quiz/QuestionCard'
import { toast } from 'sonner'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CheckIcon,
  PlayIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

const TakeQuiz = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState({})
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [quizStarted, setQuizStarted] = useState(false)
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false)
  const startTimeRef = useRef(null)

  const { data: quiz, loading } = useApi(() => quizService.getQuizById(id), [id])
  const { mutate: submitQuiz, loading: submitting } = useApiMutation(quizService.submitQuizResult)

  useEffect(() => {
    if (quiz && !quizStarted) {
      setTimeRemaining(quiz.timeLimit * 60) // Convert minutes to seconds
    }
  }, [quiz, quizStarted])

  const startQuiz = () => {
    setQuizStarted(true)
    startTimeRef.current = Date.now()
  }

  const handleAnswerChange = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }))
  }

  const handleTimeUp = () => {
    toast.warning('Time is up! Submitting your quiz...')
    handleSubmitQuiz()
  }

  const handleSubmitQuiz = async () => {
    const timeTaken = Math.floor((Date.now() - startTimeRef.current) / 1000)
    
    const formattedAnswers = Object.entries(answers).map(([questionId, answer]) => ({
      questionId,
      answer
    }))

    const result = await submitQuiz({
      quizId: id,
      answers: formattedAnswers,
      timeTaken
    })

    if (result.success) {
      navigate(`/quiz/${id}/results`, { 
        state: { resultId: result.data._id }
      })
    }
  }

  const goToQuestion = (index) => {
    setCurrentQuestion(index)
  }

  const nextQuestion = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    }
  }

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const isLastQuestion = currentQuestion === (quiz?.questions?.length || 0) - 1
  const currentQuestionData = quiz?.questions?.[currentQuestion]
  const answeredQuestions = Object.keys(answers).length
  const totalQuestions = quiz?.questions?.length || 0

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!quiz) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Quiz Not Found</h2>
          <Link to="/quizzes">
            <Button>Browse Quizzes</Button>
          </Link>
        </Card>
      </div>
    )
  }

  if (!quizStarted) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{quiz.title}</h1>
          <p className="text-gray-600 mb-8">{quiz.description}</p>
          
          <div className="grid grid-cols-2 gap-4 mb-8 text-sm">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="font-semibold text-blue-900">Questions</p>
              <p className="text-blue-700">{quiz.questions?.length || 0}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="font-semibold text-green-900">Time Limit</p>
              <p className="text-green-700">{quiz.timeLimit} minutes</p>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
            <div className="flex items-center mb-2">
              <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 mr-2" />
              <p className="font-medium text-yellow-800">Important Instructions</p>
            </div>
            <ul className="text-left text-sm text-yellow-700 space-y-1">
              <li>• Once started, the timer cannot be paused</li>
              <li>• Make sure you have a stable internet connection</li>
              <li>• You need {quiz.passingScore}% to pass this quiz</li>
              <li>• Answer all questions before time runs out</li>
            </ul>
          </div>

          <Button size="lg" icon={PlayIcon} onClick={startQuiz}>
            Start Quiz
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">{quiz.title}</h1>
          <QuizTimer
            initialTime={timeRemaining}
            onTimeUp={handleTimeUp}
            isActive={quizStarted}
          />
        </div>
        
        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>Question {currentQuestion + 1} of {totalQuestions}</span>
            <span>{answeredQuestions} of {totalQuestions} answered</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestion + 1) / totalQuestions) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Question Area */}
        <div className="lg:col-span-3">
          {currentQuestionData && (
            <QuestionCard
              question={currentQuestionData}
              selectedAnswer={answers[currentQuestionData._id]}
              onAnswerChange={(answer) => handleAnswerChange(currentQuestionData._id, answer)}
              questionNumber={currentQuestion + 1}
            />
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-6">
            <Button
              variant="outline"
              icon={ChevronLeftIcon}
              onClick={prevQuestion}
              disabled={currentQuestion === 0}
            >
              Previous
            </Button>

            <div className="flex space-x-2">
              {isLastQuestion ? (
                <Button
                  variant="success"
                  icon={CheckIcon}
                  onClick={() => setShowSubmitConfirm(true)}
                  disabled={answeredQuestions < totalQuestions}
                >
                  Submit Quiz
                </Button>
              ) : (
                <Button
                  icon={ChevronRightIcon}
                  iconPosition="right"
                  onClick={nextQuestion}
                >
                  Next
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Question Navigator */}
        <div className="lg:col-span-1">
          <Card>
            <h3 className="font-semibold text-gray-900 mb-4">Questions</h3>
            <div className="grid grid-cols-5 lg:grid-cols-3 gap-2">
              {quiz.questions?.map((question, index) => (
                <button
                  key={question._id}
                  onClick={() => goToQuestion(index)}
                  className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                    index === currentQuestion
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
            
            <div className="mt-4 text-xs text-gray-500">
              <div className="flex items-center space-x-2 mb-1">
                <div className="w-3 h-3 bg-blue-600 rounded"></div>
                <span>Current</span>
              </div>
              <div className="flex items-center space-x-2 mb-1">
                <div className="w-3 h-3 bg-green-100 rounded"></div>
                <span>Answered</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-gray-100 rounded"></div>
                <span>Not answered</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Submit Confirmation Modal */}
      {showSubmitConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Submit Quiz?</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to submit your quiz? You have answered {answeredQuestions} out of {totalQuestions} questions.
              {answeredQuestions < totalQuestions && (
                <span className="block mt-2 text-amber-600 font-medium">
                  Warning: You haven't answered all questions!
                </span>
              )}
            </p>
            <div className="flex space-x-4">
              <Button
                variant="outline"
                onClick={() => setShowSubmitConfirm(false)}
                className="flex-1"
              >
                Continue Quiz
              </Button>
              <Button
                variant="success"
                onClick={handleSubmitQuiz}
                loading={submitting}
                className="flex-1"
              >
                Submit
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}

export default TakeQuiz