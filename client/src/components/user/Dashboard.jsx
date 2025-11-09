import { useAuth } from '../../hooks/useAuth'
import { useApi } from '../../hooks/useApi'
import { quizService } from '../../services/quiz'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { Link } from 'react-router-dom'
import {
  ClipboardDocumentListIcon,
  TrophyIcon,
  ClockIcon,
  ChartBarIcon,
  PlayIcon
} from '@heroicons/react/24/outline'
import { formatDateTime, calculatePercentage, getScoreBadgeColor } from '../../utils/helpers'

const StatsCard = ({ title, value, icon: Icon, color = 'blue' }) => {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    purple: 'bg-purple-500'
  }

  return (
    <Card className="p-6">
      <div className="flex items-center">
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </Card>
  )
}

const Dashboard = () => {
  const { user } = useAuth()
  const { data: results, loading: resultsLoading } = useApi(() => quizService.getUserResults())
  const { data: quizzes, loading: quizzesLoading } = useApi(() => quizService.getAllQuizzes())

  const recentResults = results?.slice(0, 5) || []
  const availableQuizzes = quizzes?.filter(quiz => quiz.isPublished)?.slice(0, 6) || []

  const stats = {
    totalAttempts: results?.length || 0,
    passedQuizzes: results?.filter(result => result.passed)?.length || 0,
    averageScore: results?.length > 0 
      ? Math.round(results.reduce((sum, result) => sum + result.percentage, 0) / results.length)
      : 0,
    totalTimeSpent: results?.reduce((sum, result) => sum + result.timeTaken, 0) || 0
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-gray-600 mt-2">
          Ready to challenge yourself with some quizzes?
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Quizzes Taken"
          value={stats.totalAttempts}
          icon={ClipboardDocumentListIcon}
          color="blue"
        />
        <StatsCard
          title="Quizzes Passed"
          value={stats.passedQuizzes}
          icon={TrophyIcon}
          color="green"
        />
        <StatsCard
          title="Average Score"
          value={`${stats.averageScore}%`}
          icon={ChartBarIcon}
          color="purple"
        />
        <StatsCard
          title="Time Spent"
          value={`${Math.round(stats.totalTimeSpent / 60)}m`}
          icon={ClockIcon}
          color="yellow"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Results */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Recent Results</h2>
            <Link to="/results">
              <Button variant="ghost" size="sm">View All</Button>
            </Link>
          </div>

          {resultsLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : recentResults.length > 0 ? (
            <div className="space-y-4">
              {recentResults.map((result) => (
                <div key={result._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{result.quiz?.title}</h3>
                    <p className="text-sm text-gray-600">{formatDateTime(result.completedAt)}</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge
                      variant={result.passed ? 'success' : 'danger'}
                      className={getScoreBadgeColor(result.percentage)}
                    >
                      {result.percentage}%
                    </Badge>
                    <Link to={`/quiz/${result.quiz._id}/results`}>
                      <Button variant="outline" size="sm">View</Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <ClipboardDocumentListIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No quiz results yet</p>
              <Link to="/quizzes">
                <Button className="mt-4">Take Your First Quiz</Button>
              </Link>
            </div>
          )}
        </Card>

        {/* Available Quizzes */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Available Quizzes</h2>
            <Link to="/quizzes">
              <Button variant="ghost" size="sm">View All</Button>
            </Link>
          </div>

          {quizzesLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : availableQuizzes.length > 0 ? (
            <div className="space-y-4">
              {availableQuizzes.map((quiz) => (
                <div key={quiz._id} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{quiz.title}</h3>
                      <p className="text-sm text-gray-600">{quiz.category?.name}</p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                        <span>{quiz.questions?.length || 0} questions</span>
                        <span>{quiz.timeLimit} minutes</span>
                        <span>Pass: {quiz.passingScore}%</span>
                      </div>
                    </div>
                    <Link to={`/quiz/${quiz._id}`}>
                      <Button icon={PlayIcon} size="sm">
                        Start
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <ClipboardDocumentListIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No quizzes available</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}

export default Dashboard