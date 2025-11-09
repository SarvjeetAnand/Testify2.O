import React, { useState, useEffect, useCallback } from 'react';
import { adminService } from '../../services/adminService';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  MagnifyingGlassIcon,
  XMarkIcon,
  CodeBracketIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const ManageCodingProblems = () => {
  const [problems, setProblems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingProblem, setEditingProblem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    difficulty: 'medium',
    timeLimit: 2,
    memoryLimit: 256,
    category: '',
    tags: [],
    sampleCode: {
      javascript: '',
      python: '',
      java: '',
      cpp: ''
    },
    testCases: []
  });

  const [tagInput, setTagInput] = useState('');

  const loadProblems = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (difficultyFilter) params.difficulty = difficultyFilter;
      if (categoryFilter) params.category = categoryFilter;
      
      const response = await adminService.getAllCodingProblems(params);
      if (response.success) {
        setProblems(response.data.data || response.data || []);
      } else {
        toast.error(response.message || 'Failed to load coding problems');
      }
    } catch (error) {
      console.error('Failed to load problems:', error);
      toast.error('Failed to load coding problems');
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, difficultyFilter, categoryFilter]);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadProblems();
  }, [loadProblems]);

  const loadCategories = async () => {
    try {
      const response = await adminService.getAllCategories();
      if (response && response.data) {
        setCategories(Array.isArray(response.data) ? response.data : response.data.data || []);
      }
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };


  const handleFormChange = (field, value) => {
    if (field.startsWith('sampleCode.')) {
      const lang = field.split('.')[1];
      setFormData(prev => ({
        ...prev,
        sampleCode: {
          ...prev.sampleCode,
          [lang]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const handleAddTestCase = () => {
    setFormData(prev => ({
      ...prev,
      testCases: [...prev.testCases, { input: '', expectedOutput: '', isHidden: false }]
    }));
  };

  const handleTestCaseChange = (index, field, value) => {
    const newTestCases = [...formData.testCases];
    newTestCases[index][field] = field === 'isHidden' ? value : value;
    setFormData(prev => ({
      ...prev,
      testCases: newTestCases
    }));
  };

  const handleRemoveTestCase = (index) => {
    setFormData(prev => ({
      ...prev,
      testCases: prev.testCases.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error('Title is required');
      return;
    }
    if (!formData.description.trim()) {
      toast.error('Description is required');
      return;
    }
    if (formData.testCases.length === 0) {
      toast.error('At least one test case is required');
      return;
    }

    // Validate test cases
    for (const testCase of formData.testCases) {
      if (!testCase.input.trim() || !testCase.expectedOutput.trim()) {
        toast.error('All test cases must have both input and expected output');
        return;
      }
    }

    try {
      setIsLoading(true);
      const problemData = {
        ...formData,
        category: formData.category || undefined
      };

      let response;
      if (editingProblem) {
        response = await adminService.updateCodingProblem(editingProblem._id, problemData);
      } else {
        response = await adminService.createCodingProblem(problemData);
      }

      if (response.success) {
        toast.success(`Coding problem ${editingProblem ? 'updated' : 'created'} successfully!`);
        resetForm();
        loadProblems();
      } else {
        toast.error(response.message || 'Operation failed');
      }
    } catch (error) {
      toast.error('Error saving coding problem');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = async (problemId) => {
    try {
      setIsLoading(true);
      const response = await adminService.getCodingProblemById(problemId);
      if (response.success) {
        const problem = response.data;
        setFormData({
          title: problem.title || '',
          description: problem.description || '',
          difficulty: problem.difficulty || 'medium',
          timeLimit: problem.timeLimit || 2,
          memoryLimit: problem.memoryLimit || 256,
          category: problem.category?._id || problem.category || '',
          tags: problem.tags || [],
          sampleCode: {
            javascript: problem.sampleCode?.javascript || '',
            python: problem.sampleCode?.python || '',
            java: problem.sampleCode?.java || '',
            cpp: problem.sampleCode?.cpp || ''
          },
          testCases: problem.testCases || []
        });
        setEditingProblem(problem);
        setShowForm(true);
      } else {
        toast.error(response.message || 'Failed to load problem');
      }
    } catch (error) {
      toast.error('Error loading problem');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (problemId) => {
    if (!window.confirm('Are you sure you want to delete this coding problem?')) return;

    try {
      const response = await adminService.deleteCodingProblem(problemId);
      if (response.success) {
        toast.success('Coding problem deleted successfully');
        loadProblems();
      } else {
        toast.error(response.message || 'Failed to delete problem');
      }
    } catch (error) {
      toast.error('Error deleting problem');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      difficulty: 'medium',
      timeLimit: 2,
      memoryLimit: 256,
      category: '',
      tags: [],
      sampleCode: {
        javascript: '',
        python: '',
        java: '',
        cpp: ''
      },
      testCases: []
    });
    setEditingProblem(null);
    setShowForm(false);
    setTagInput('');
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredProblems = problems.filter(problem => {
    const matchesSearch = !searchTerm || 
      problem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      problem.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <CodeBracketIcon className="h-8 w-8" />
                Coding Problems Management
              </h1>
              <p className="text-gray-600 mt-2">
                Create and manage coding problems with test cases
              </p>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              {showForm ? 'Cancel' : 'Add Problem'}
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
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

        {/* Add/Edit Form */}
        {showForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingProblem ? 'Edit Coding Problem' : 'Create New Coding Problem'}
              </h3>
              <button
                onClick={resetForm}
                className="text-gray-500 hover:text-gray-700"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleFormChange('title', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Difficulty *
                  </label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => handleFormChange('difficulty', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Time Limit (seconds) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.timeLimit}
                    onChange={(e) => handleFormChange('timeLimit', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Memory Limit (MB) *
                  </label>
                  <input
                    type="number"
                    min="64"
                    value={formData.memoryLimit}
                    onChange={(e) => handleFormChange('memoryLimit', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleFormChange('category', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleFormChange('description', e.target.value)}
                  rows={8}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                  placeholder="Enter problem description with examples..."
                  required
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Add tag and press Enter"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-2 text-blue-600 hover:text-blue-800"
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Sample Code */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sample Code Templates
                </label>
                <div className="space-y-4">
                  {['javascript', 'python', 'java', 'cpp'].map(lang => (
                    <div key={lang}>
                      <label className="block text-xs font-medium text-gray-600 mb-1 uppercase">
                        {lang}
                      </label>
                      <textarea
                        value={formData.sampleCode[lang]}
                        onChange={(e) => handleFormChange(`sampleCode.${lang}`, e.target.value)}
                        rows={5}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 font-mono text-sm bg-gray-50"
                        placeholder={`// ${lang} starter code`}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Test Cases */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Test Cases *
                  </label>
                  <button
                    type="button"
                    onClick={handleAddTestCase}
                    className="flex items-center px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                  >
                    <PlusIcon className="h-4 w-4 mr-1" />
                    Add Test Case
                  </button>
                </div>
                <div className="space-y-4">
                  {formData.testCases.map((testCase, index) => (
                    <div key={index} className="border border-gray-300 rounded-md p-4 bg-gray-50">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-gray-700">
                          Test Case {index + 1}
                        </span>
                        <div className="flex items-center gap-3">
                          <label className="flex items-center text-sm text-gray-700">
                            <input
                              type="checkbox"
                              checked={testCase.isHidden}
                              onChange={(e) => handleTestCaseChange(index, 'isHidden', e.target.checked)}
                              className="mr-2"
                            />
                            Hidden
                          </label>
                          <button
                            type="button"
                            onClick={() => handleRemoveTestCase(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Input
                          </label>
                          <textarea
                            value={testCase.input}
                            onChange={(e) => handleTestCaseChange(index, 'input', e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                            placeholder="Enter test input..."
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Expected Output
                          </label>
                          <textarea
                            value={testCase.expectedOutput}
                            onChange={(e) => handleTestCaseChange(index, 'expectedOutput', e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                            placeholder="Enter expected output..."
                            required
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  {formData.testCases.length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-4">
                      No test cases added. Click "Add Test Case" to add one.
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {isLoading ? 'Saving...' : editingProblem ? 'Update Problem' : 'Create Problem'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Problems List */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Coding Problems ({filteredProblems.length})
            </h3>
          </div>

          <div className="p-6">
            {isLoading ? (
              <LoadingSpinner text="Loading problems..." />
            ) : filteredProblems.length > 0 ? (
              <div className="space-y-4">
                {filteredProblems.map((problem) => (
                  <div key={problem._id} className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
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
                          <span>⏱️ {problem.timeLimit}s</span>
                          <span>💾 {problem.memoryLimit}MB</span>
                          <span>🧪 {problem.testCases?.length || 0} test cases</span>
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
                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={() => handleEdit(problem._id)}
                          className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded"
                          title="Edit"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(problem._id)}
                          className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded"
                          title="Delete"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <CodeBracketIcon className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No coding problems found</h3>
                <p className="text-gray-500 mb-4">
                  Get started by creating your first coding problem
                </p>
                <button
                  onClick={() => setShowForm(true)}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 mx-auto"
                >
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Create Problem
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageCodingProblems;
