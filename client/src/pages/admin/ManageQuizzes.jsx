import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { quizService } from '../../services/quizService';
import QuizForm from '../../components/admin/forms/QuizForm';

const QuizManagement = ({ categories = [] }) => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editData, setEditData] = useState(null);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchQuizzes = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await quizService.getAllQuizzes();
      if (res.success) {
        setQuizzes(res.data);
      } else {
        setError(res.message || 'Failed to load quizzes');
      }
    } catch (error) {
      setError('Failed to load quizzes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const handleCreate = () => {
    setEditData(null);
    setShowForm(true);
  };

  const handleEdit = (quiz) => {
    setEditData(quiz);
    setShowForm(true);
  };

  const handleDelete = async (quizId) => {
    if (!window.confirm('Are you sure you want to delete this quiz?')) return;
    setError('');
    try {
      const res = await quizService.deleteQuiz(quizId);
      if (res.success) {
        fetchQuizzes();
      } else {
        setError(res.message || 'Failed to delete quiz');
      }
    } catch {
      setError('Failed to delete quiz');
    }
  };

  const handleFormSubmit = async (data) => {
    setError('');
    setIsSubmitting(true);
    try {
      let result;
      if (editData) {
        result = await quizService.updateQuiz(editData._id, data);
      } else {
        result = await quizService.createQuiz(data);
      }

      if (result.success) {
        toast.success(`Quiz ${editData ? 'updated' : 'created'} successfully`);
        setShowForm(false);
        setEditData(null);
        await fetchQuizzes(); // Refresh quiz list
      } else {
        setError(result.message || 'Failed to save quiz');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving quiz');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredQuizzes = quizzes.filter(
    (quiz) =>
      quiz.title.toLowerCase().includes(search.toLowerCase()) ||
      (quiz.category?.name || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quiz Management</h1>
          <p className="text-gray-600 mt-2">Create and manage quizzes</p>
        </div>
        <Button onClick={handleCreate} className="mt-4 sm:mt-0">
          Create Quiz
        </Button>
      </div>

      <Card className="mb-6">
        <Input
          placeholder="Search quizzes by title or category..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </Card>

      {error && <div className="text-red-600 mb-4">{error}</div>}

      {loading && (
        <div className="flex justify-center py-8">
          <LoadingSpinner />
        </div>
      )}

      {!loading && filteredQuizzes.length > 0 && (
        <div className="space-y-4">
          {filteredQuizzes.map((quiz) => (
            <Card key={quiz._id} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="font-semibold">{quiz.title}</div>
                <div className="text-sm text-gray-500">
                  Category: {quiz.category?.name || 'Uncategorized'}
                </div>
                <div className="text-sm text-gray-500">
                  Time Limit: {quiz.timeLimit} min
                </div>
                <div className="text-xs text-gray-400">
                  Status: {quiz.isPublished ? 'Published' : 'Draft'}
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => handleEdit(quiz)}>
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-red-600"
                  onClick={() => handleDelete(quiz._id)}
                >
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {!loading && filteredQuizzes.length === 0 && (
        <Card className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No quizzes found</h3>
          <p className="text-gray-600 mb-4">
            {search ? 'No quizzes match your search.' : 'Get started by creating your first quiz.'}
          </p>
          <Button onClick={handleCreate}>Create Quiz</Button>
        </Card>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-lg w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {editData ? 'Edit Quiz' : 'Create New Quiz'}
              </h3>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditData(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
            <QuizForm
              initialData={editData}
              categories={categories}
              onSubmit={handleFormSubmit}
              onCancel={() => {
                setShowForm(false);
                setEditData(null);
              }}
              loading={isSubmitting}
            />
          </Card>
        </div>
      )}
    </div>
  );
};

export default QuizManagement;