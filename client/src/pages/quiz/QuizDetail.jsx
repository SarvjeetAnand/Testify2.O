import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useApi } from '../../hooks/useApi'
import { quizService } from '../../services/quiz'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import {
  ClockIcon,
  QuestionMarkCircleIcon,
  TrophyIcon,
  PlayIcon,
  ArrowLeftIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline'

const QuizDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [showInstructions, setShowInstructions] = useState(false)
  
  const { data: quiz, loading } = useApi(() => quizService.getQuizById(id), [id])

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
          <p className="text-gray-600 mb-6">The quiz you're looking for doesn't exist.</p>
          <Link to="/quizzes">
            <Button>Browse Quizzes</Button>
          </Link>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <div className="mb-6">
        <Button 
          variant="ghost" 
          icon={ArrowLeftIcon}
          onClick={() => navigate(-1)}
        >
          Back
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <Card>
            <div className="mb-6">
              <div className="flex items-start justify-between mb-4">
                <h1 className="text-3xl font-bold text-gray-900">{quiz.title}</h1>
                <Badge variant="primary">{quiz.category?.name}</Badge>
              </div>
              
              <p className="text-gray-600 text-lg leading-relaxed">
                {quiz.description}
              </p>
            </div>

            {/* Quiz Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <QuestionMarkCircleIcon className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="font-semibold text-gray-900">{quiz.questions?.length || 0}</p>
                <p className="text-sm text-gray-600">Questions</p>
              </div>
              
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <ClockIcon className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="font-semibold text-gray-900">{quiz.timeLimit}</p>
                <p className="text-sm text-gray-600">Minutes</p>
              </div>
              
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <TrophyIcon className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                <p className="font-semibold text-gray-900">{quiz.passingScore}%</p>
                <p className="text-sm text-gray-600">Pass Score</p>
              </div>
              
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <InformationCircleIcon className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <p className="font-semibold text-gray-900">{quiz.difficulty}</p>
                <p className="text-sm text-gray-600">Difficulty</p>
              </div>
            </div>

            {/* Instructions */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Instructions</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowInstructions(!showInstructions)}
                >
                  {showInstructions ? 'Hide' : 'Show'} Instructions
                </Button>
              </div>
              
              {showInstructions && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>• You have {quiz.timeLimit} minutes to complete this quiz</li>
                    <li>• Each question must be answered before proceeding</li>
                    <li>• You need {quiz.passingScore}% to pass</li>
                    <li>• Once started, the timer cannot be paused</li>
                    <li>• Make sure you have a stable internet connection</li>
                    <li>• You can review your answers before submitting</li>
                  </ul>
                </div>
              )}
            </div>

            {/* Start Quiz Button */}
            <div className="text-center">
              <Link to={`/quiz/${quiz._id}/take`}>
                <Button size="lg" icon={PlayIcon} className="px-8">
                  Start Quiz
                </Button>
              </Link>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <h3 className="font-semibold text-gray-900 mb-4">Quiz Information</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Created by:</span>
                <span className="font-medium">{quiz.createdBy?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Category:</span>
                <span className="font-medium">{quiz.category?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Difficulty:</span>
                <Badge variant="default" size="sm">{quiz.difficulty}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Questions:</span>
                <span className="font-medium">{quiz.questions?.length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Time Limit:</span>
                <span className="font-medium">{quiz.timeLimit} minutes</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Passing Score:</span>
                <span className="font-medium">{quiz.passingScore}%</span>
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="font-semibold text-gray-900 mb-4">Tips for Success</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Read each question carefully</li>
              <li>• Manage your time wisely</li>
              <li>• Don't spend too long on one question</li>
              <li>• Review your answers if time permits</li>
              <li>• Stay calm and focused</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default QuizDetail