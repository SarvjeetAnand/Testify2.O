import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useApi } from '../../hooks/useApi'
import { useDebounce } from '../../hooks/useDebounce'
import { quizService } from '../../services/quiz'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Badge from '../../components/ui/Badge'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import {
  MagnifyingGlassIcon,
  ClockIcon,
  QuestionMarkCircleIcon,
  PlayIcon,
  FunnelIcon
} from '@heroicons/react/24/outline'

const QuizCard = ({ quiz }) => {
  const difficultyColors = {
    easy: 'success',
    medium: 'warning',
    hard: 'danger'
  }

  return (
    <Card className="hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
      <div className="flex flex-col h-full">
        <div className="flex-1">
          <div className="flex items-start justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
              {quiz.title}
            </h3>
            <Badge variant={difficultyColors[quiz.difficulty] || 'default'}>
              {quiz.difficulty}
            </Badge>
          </div>
          
          <p className="text-gray-600 mb-4 line-clamp-2">
            {quiz.description}
          </p>
          
          <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
            <span className="flex items-center">
              <QuestionMarkCircleIcon className="w-4 h-4 mr-1" />
              {quiz.questions?.length || 0} questions
            </span>
            <span className="flex items-center">
              <ClockIcon className="w-4 h-4 mr-1" />
              {quiz.timeLimit} min
            </span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">
              Pass: {quiz.passingScore}%
            </span>
            <span className="text-blue-600 font-medium">
              {quiz.category?.name}
            </span>
          </div>
        </div>
        
        <div className="mt-6 pt-4 border-t border-gray-100">
          <Link to={`/quiz/${quiz._id}`}>
            <Button className="w-full" icon={PlayIcon}>
              Start Quiz
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  )
}

const QuizList = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedDifficulty, setSelectedDifficulty] = useState('')
  
  const debouncedSearch = useDebounce(searchTerm, 300)
  
  const { data: quizzes, loading, refetch } = useApi(() => 
    quizService.getAllQuizzes({
      search: debouncedSearch,
      category: selectedCategory,
      difficulty: selectedDifficulty
    }), [debouncedSearch, selectedCategory, selectedDifficulty]
  )

  const { data: categories } = useApi(() => 
    fetch('/api/categories').then(res => res.json())
  )

  const filteredQuizzes = quizzes?.filter(quiz => quiz.isPublished) || []

  const clearFilters = () => {
    setSearchTerm('')
    setSelectedCategory('')
    setSelectedDifficulty('')
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Available Quizzes
        </h1>
        <p className="text-gray-600">
          Challenge yourself with our collection of quizzes
        </p>
      </div>

      {/* Filters */}
      <Card className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="md:col-span-2">
            <Input
              label="Search Quizzes"
              placeholder="Search by title or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={MagnifyingGlassIcon}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">All Categories</option>
              {categories?.map(category => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Difficulty
            </label>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">All Levels</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
        </div>
        
        {(searchTerm || selectedCategory || selectedDifficulty) && (
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              {filteredQuizzes.length} quiz(es) found
            </p>
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Clear Filters
            </Button>
          </div>
        )}
      </Card>

      {/* Quiz Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : filteredQuizzes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredQuizzes.map((quiz) => (
            <QuizCard key={quiz._id} quiz={quiz} />
          ))}
        </div>
      ) : (
        <Card className="text-center py-12">
          <FunnelIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No quizzes found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || selectedCategory || selectedDifficulty
              ? 'Try adjusting your filters to find more quizzes.'
              : 'No quizzes are currently available.'}
          </p>
          {(searchTerm || selectedCategory || selectedDifficulty) && (
            <Button variant="outline" onClick={clearFilters}>
              Clear Filters
            </Button>
          )}
        </Card>
      )}
    </div>
  )
}

export default QuizList