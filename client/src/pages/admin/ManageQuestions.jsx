// src/pages/admin/ManageQuestions.jsx
import React, { useState, useEffect } from 'react';
import { useQuiz } from '../../contexts/QuizContext';
import { adminService } from '../../services/adminService';
import { quizService } from '../../services/quizService';
import BulkQuestionUpload from '../../components/admin/BulkQuestionUpload';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  CloudArrowUpIcon,
  MagnifyingGlassIcon,
  // FunnelIcon 
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const ManageQuestions = () => {
  const [questions, setQuestions] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [questionForm, setQuestionForm] = useState({
    questionText: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    points: 1
  });

  const { fetchQuizzes } = useQuiz();

  useEffect(() => {
    loadQuizzes();
  }, []);

  useEffect(() => {
    if (selectedQuiz) {
      loadQuestions();
    }
  }, [selectedQuiz]);

  const loadQuizzes = async () => {
    setIsLoading(true);
    try {
      const response = await quizService.getAllQuizzes();
      if (response.success) {
        setQuizzes(response.data);
      } else {
        toast.error(response.message || 'Failed to load quizzes');
      }
    } catch (error) {
      console.error('Failed to load quizzes:', error);
      toast.error('Failed to load quizzes');
    } finally {
      setIsLoading(false);
    }
  };

  const loadQuestions = async () => {
    setIsLoading(true);
    try {
      const response = await adminService.getQuestionsByQuiz(selectedQuiz);
      if (response.success) {
        setQuestions(response.data.data || response.data || []);
      }
    } catch (error) {
      console.error('Failed to load questions:', error);
      toast.error('Failed to load questions');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormChange = (field, value) => {
    setQuestionForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...questionForm.options];
    newOptions[index] = value;
    setQuestionForm(prev => ({
      ...prev,
      options: newOptions
    }));
  };

  const validateForm = () => {
    if (!questionForm.questionText.trim()) {
      toast.error('Question text is required');
      return false;
    }
    
    const filledOptions = questionForm.options.filter(opt => opt.trim());
    if (filledOptions.length < 2) {
      toast.error('At least 2 options are required');
      return false;
    }
    
    if (!questionForm.options[questionForm.correctAnswer]?.trim()) {
      toast.error('Correct answer option cannot be empty');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    if (!selectedQuiz) {
      toast.error('Please select a quiz first');
      return;
    }

    const questionData = {
      ...questionForm,
      quiz: selectedQuiz,
      options: questionForm.options.filter(opt => opt.trim())
    };

    try {
      setIsLoading(true);
      let response;
      
      if (editingQuestion) {
        response = await adminService.updateQuestion(editingQuestion._id, questionData);
      } else {
        response = await adminService.createQuestion(questionData);
      }

      if (response.success) {
        toast.success(`Question ${editingQuestion ? 'updated' : 'created'} successfully!`);
        resetForm();
        loadQuestions();
      } else {
        toast.error(response.message || 'Operation failed');
      }
    } catch (error) {
      toast.error('Error saving question');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (question) => {
    setEditingQuestion(question);
    setQuestionForm({
      questionText: question.questionText,
      options: [...question.options],
      correctAnswer: question.correctAnswer,
      points: question.points
    });
    setShowAddForm(true);
  };

  const handleDelete = async (questionId) => {
    if (!window.confirm('Are you sure you want to delete this question?')) return;

    try {
      const response = await adminService.deleteQuestion(questionId);
      if (response.success) {
        toast.success('Question deleted successfully');
        loadQuestions();
      } else {
        toast.error(response.message || 'Failed to delete question');
      }
    } catch (error) {
      toast.error('Error deleting question');
    }
  };

  const resetForm = () => {
    setQuestionForm({
      questionText: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      points: 1
    });
    setEditingQuestion(null);
    setShowAddForm(false);
  };

  const filteredQuestions = questions.filter(question =>
    question.questionText.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Quiz selection component
  const QuizSelect = () => (
    <div className="flex-1">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Select Quiz
      </label>
      <select
        value={selectedQuiz}
        onChange={(e) => setSelectedQuiz(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        disabled={isLoading}
      >
        <option value="">Choose a quiz...</option>
        {quizzes.map((quiz) => (
          <option key={quiz._id} value={quiz._id}>
            {quiz.title} {quiz.category?.name ? `(${quiz.category.name})` : ''}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Question Management</h1>
          <p className="text-gray-600 mt-2">
            Create, edit, and manage quiz questions
          </p>
        </div>

        {/* Quiz Selection */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <LoadingSpinner size="small" />
                <span className="text-gray-600">Loading quizzes...</span>
              </div>
            ) : (
              <QuizSelect />
            )}
            
            {selectedQuiz && (
              <div className="flex gap-2">
                <button
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  disabled={isLoading}
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add Question
                </button>
                <button
                  onClick={() => setShowBulkUpload(!showBulkUpload)}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  disabled={isLoading}
                >
                  <CloudArrowUpIcon className="h-4 w-4 mr-2" />
                  Bulk Upload
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Bulk Upload Section */}
        {showBulkUpload && selectedQuiz && (
          <div className="mb-6">
            <BulkQuestionUpload 
              quizId={selectedQuiz} 
              onSuccess={() => {
                loadQuestions();
                setShowBulkUpload(false);
              }}
            />
          </div>
        )}

        {/* Add/Edit Question Form */}
        {showAddForm && selectedQuiz && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingQuestion ? 'Edit Question' : 'Add New Question'}
              </h3>
              <button
                onClick={resetForm}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Question Text
                </label>
                <textarea
                  value={questionForm.questionText}
                  onChange={(e) => handleFormChange('questionText', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your question..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Options
                </label>
                <div className="space-y-2">
                  {questionForm.options.map((option, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="correctAnswer"
                        checked={questionForm.correctAnswer === index}
                        onChange={() => handleFormChange('correctAnswer', index)}
                        className="text-blue-600"
                      />
                      <span className="text-sm font-medium text-gray-700 w-8">
                        {String.fromCharCode(65 + index)}.
                      </span>
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => handleOptionChange(index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder={`Option ${String.fromCharCode(65 + index)}`}
                      />
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Select the radio button next to the correct answer
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Points
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={questionForm.points}
                    onChange={(e) => handleFormChange('points', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {isLoading ? 'Saving...' : editingQuestion ? 'Update Question' : 'Add Question'}
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

        {/* Questions List */}
        {selectedQuiz && (
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-6 border-b border-gray-200">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Questions ({filteredQuestions.length})
                </h3>
                
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search questions..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6">
              {isLoading ? (
                <LoadingSpinner text="Loading questions..." />
              ) : filteredQuestions.length > 0 ? (
                <div className="space-y-4">
                  {filteredQuestions.map((question, index) => (
                    <div key={question._id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="font-medium text-gray-900 flex-1">
                          Q{index + 1}: {question.questionText}
                        </h4>
                        <div className="flex items-center space-x-2 ml-4">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            {question.points} pt{question.points !== 1 ? 's' : ''}
                          </span>
                          <button
                            onClick={() => handleEdit(question)}
                            className="p-1 text-blue-600 hover:text-blue-700"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(question._id)}
                            className="p-1 text-red-600 hover:text-red-700"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {question.options.map((option, optIndex) => (
                          <div
                            key={optIndex}
                            className={`p-2 rounded text-sm ${
                              optIndex === question.correctAnswer
                                ? 'bg-green-100 text-green-800 font-medium'
                                : 'bg-gray-50 text-gray-700'
                            }`}
                          >
                            {String.fromCharCode(65 + optIndex)}. {option}
                            {optIndex === question.correctAnswer && (
                              <span className="ml-2 text-green-600">✓</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <svg className="h-16 w-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No questions found</h3>
                  <p className="text-gray-500 mb-4">
                    {selectedQuiz 
                      ? 'This quiz doesn\'t have any questions yet.' 
                      : 'Select a quiz to view its questions.'}
                  </p>
                  {selectedQuiz && (
                    <div className="flex justify-center gap-3">
                      <button
                        onClick={() => setShowAddForm(true)}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        <PlusIcon className="h-4 w-4 mr-2" />
                        Add First Question
                      </button>
                      <button
                        onClick={() => setShowBulkUpload(true)}
                        className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                      >
                        <CloudArrowUpIcon className="h-4 w-4 mr-2" />
                        Upload from PDF
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageQuestions;