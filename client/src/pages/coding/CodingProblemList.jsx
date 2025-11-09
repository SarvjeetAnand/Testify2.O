import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { codingService } from '../../services/codingService';
import { 
  MagnifyingGlassIcon, 
  CodeBracketIcon,
  ClockIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const CodingProblemList = () => {
  const [problems, setProblems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const loadProblems = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (difficultyFilter) params.difficulty = difficultyFilter;
      if (categoryFilter) params.category = categoryFilter;

      const response = await codingService.getAllProblems(params);
      if (response.success) {
        setProblems(response.data || []);
      } else {
        toast.error(response.message || 'Failed to load problems');
      }
    } catch (error) {
      console.error('Failed to load problems:', error);
      toast.error('Failed to load coding problems');
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, difficultyFilter, categoryFilter]);

  useEffect(() => {
    loadProblems();
    loadCategories();
  }, [loadProblems]);

  const loadCategories = async () => {
    try {
      const response = await fetch('/api/category');
      const data = await response.json();
      if (data && data.data) {
        setCategories(Array.isArray(data.data) ? data.data : []);
      }
    } catch (error) {
      console.error('Failed to load categories:', error);
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <CodeBracketIcon className="h-10 w-10 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Coding Problems</h1>
              <p className="text-gray-600 mt-1">
                Practice coding and improve your problem-solving skills
              </p>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search problems..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Difficulties</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Problems List */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Available Problems ({problems.length})
            </h3>
          </div>

          <div className="p-6">
            {isLoading ? (
              <LoadingSpinner text="Loading problems..." />
            ) : problems.length > 0 ? (
              <div className="space-y-4">
                {problems.map((problem) => (
                  <Link
                    key={problem._id}
                    to={`/coding/${problem._id}`}
                    className="block border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow hover:border-blue-300"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="text-lg font-semibold text-gray-900">
                            {problem.title}
                          </h4>
                          <span className={`px-2 py-1 text-xs rounded-full ${getDifficultyColor(problem.difficulty)}`}>
                            {problem.difficulty}
                          </span>
                          {problem.category && (
                            <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">
                              {problem.category.name || problem.category}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {problem.description}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <ClockIcon className="h-4 w-4" />
                            {problem.timeLimit}s
                          </span>
                          <span>💾 {problem.memoryLimit}MB</span>
                        </div>
                        {problem.tags && problem.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {problem.tags.map((tag, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <CodeBracketIcon className="h-6 w-6 text-blue-600 ml-4 flex-shrink-0" />
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <CodeBracketIcon className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No problems found</h3>
                <p className="text-gray-500">
                  Try adjusting your search or filters
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodingProblemList;




