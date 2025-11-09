import { useParams, useLocation, Link } from 'react-router-dom'
import { useApi } from '../../hooks/useApi'
import { quizService } from '../../services/quiz'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import {
  TrophyIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowLeftIcon,
  HomeIcon
} from '@heroicons/react/24/outline'
import { formatTime, formatDateTime } from '../../utils/helpers'

const Results = () => {
  const { id } = useParams()
  const location = useLocation()
  const resultId = location.state?.resultId

  const { data: result, loading } = useApi(() => 
    resultId ? quizService.getResultById(resultId) : null, [resultId]
  )

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!result) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Results Not Found</h2>
          <Link to="/dashboard">
            <Button>Back to Dashboard</Button>
          </Link>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <Button 
          variant="ghost" 
          icon={ArrowLeftIcon}
          onClick={() => window.history.back()}
          className="mb-4"
        >
          Back
        </Button>
        
        <div className="text-center">
          <div className={`w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center ${
            result.passed ? 'bg-green-100' : 'bg-red-100'
          }`}>
            {result.passed ? (
              <TrophyIcon className="w-10 h-10 text-green-600" />
            ) : (
              <XCircleIcon className="w-10 h-10 text-red-600" />
            )}
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {result.passed ? 'Congratulations!' : 'Quiz Completed'}
          </h1>
          
          <p className="text-gray-600">
            {result.passed ? 'You have successfully passed the quiz!' : 'Keep practicing and try again!'}
          </p>
        </div>
      </div>

      {/* Score Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="text-center p-6">
          <div className="text-3xl font-bold text-blue-600 mb-2">
            {result.percentage}%
          </div>
          <p className="text-gray-600">Final Score</p>
        </Card>
        
        <Card className="text-center p-6">
          <div className="text-3xl font-bold text-green-600 mb-2">
            {result.score}
          </div>
          <p className="text-gray-600">Points Earned</p>
        </Card>
        
        <Card className="text-center p-6">
          <div className="text-3xl font-bold text-purple-600 mb-2">
            {formatTime(result.timeTaken)}
          </div>
          <p className="text-gray-600">Time Taken</p>
        </Card>
        
        <Card className="text-center p-6">
          <div className={`text-3xl font-bold mb-2 ${result.passed ? 'text-green-600' : 'text-red-600'}`}>
            {result.passed ? 'PASS' : 'FAIL'}
          </div>
          <p className="text-gray-600">Result</p>
        </Card>
      </div>

      {/* Quiz Information */}
      <Card className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quiz Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-gray-900 mb-2">{result.quiz?.title}</h3>
            <p className="text-gray-600 mb-4">{result.quiz?.description}</p>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span>Passing Score: {result.quiz?.passingScore}%</span>
              <span>Completed: {formatDateTime(result.completedAt)}</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Questions:</span>
              <span className="font-medium">{result.questionResults?.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Correct Answers:</span>
              <span className="font-medium text-green-600">
                {result.questionResults?.filter(q => q.isCorrect).length}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Wrong Answers:</span>
              <span className="font-medium text-red-600">
                {result.questionResults?.filter(q => !q.isCorrect).length}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Points:</span>
              <span className="font-medium">{result.totalPossibleScore}</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Question Review */}
      <Card className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Question Review</h2>
        <div className="space-y-6">
          {result.questionResults?.map((questionResult, index) => (
            <div key={questionResult.questionId._id} className="border-b border-gray-200 pb-6 last:border-b-0">
              <div className="flex items-start space-x-3">
                <div className={`mt-1 p-1 rounded-full ${
                  questionResult.isCorrect ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  {questionResult.isCorrect ? (
                    <CheckCircleIcon className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircleIcon className="w-5 h-5 text-red-600" />
                  )}
                </div>
                
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 mb-3">
                    Q{index + 1}. {questionResult.questionId.questionText}
                  </h3>
                  
                  <div className="space-y-2">
                    {questionResult.questionId.options?.map((option, optionIndex) => (
                      <div
                        key={optionIndex}
                        className={`p-3 rounded-lg border ${
                          optionIndex === questionResult.correctAnswer
                            ? 'border-green-500 bg-green-50'
                            : optionIndex === questionResult.userAnswer && !questionResult.isCorrect
                            ? 'border-red-500 bg-red-50'
                            : 'border-gray-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span>{option}</span>
                          <div className="flex space-x-2">
                            {optionIndex === questionResult.correctAnswer && (
                              <Badge variant="success" size="sm">Correct</Badge>
                            )}
                            {optionIndex === questionResult.userAnswer && (
                              <Badge variant="info" size="sm">Your Answer</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-3 text-sm text-gray-600">
                    Points: {questionResult.points} / {questionResult.questionId.points || 1}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link to="/dashboard">
          <Button icon={HomeIcon} variant="outline" className="w-full sm:w-auto">
            Dashboard
          </Button>
        </Link>
        <Link to="/quizzes">
          <Button className="w-full sm:w-auto">
            Take Another Quiz
          </Button>
        </Link>
        <Link to={`/quiz/${id}`}>
          <Button variant="outline" className="w-full sm:w-auto">
            Retake Quiz
          </Button>
        </Link>
      </div>
    </div>
  )
}

export default Results