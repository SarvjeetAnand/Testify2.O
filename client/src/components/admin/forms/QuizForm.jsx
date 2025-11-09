import React, { useState, useEffect } from 'react';
import Input from '../../ui/Input';
import Button from '../../ui/Button';
import Select from '../../ui/Select';
import { useApi } from '../../../hooks/useApi';
import { adminService } from '../../../services/adminService';
import LoadingSpinner from '../../common/LoadingSpinner';

const QuizForm = ({
  initialData,
  onSubmit,
  onCancel,
  loading = false,
}) => {
  const safeInitialData = initialData || {};
  const [title, setTitle] = useState(safeInitialData.title || '');
  const [description, setDescription] = useState(safeInitialData.description || '');
  const [category, setCategory] = useState(safeInitialData.category || '');
  const [timeLimit, setTimeLimit] = useState(safeInitialData.timeLimit || 10);
  const [isPublished, setIsPublished] = useState(safeInitialData.isPublished || false);
  const [error, setError] = useState('');

  // Fetch categories with error handling
  // Update the categories fetch
  const {
    data: categories,
    loading: loadingCategories,
    error: categoriesError
  } = useApi(adminService.getAllCategories, [], {
    onError: (error) => console.error('Categories fetch error:', error)
  });

  // Update the categories array handling
  const categoriesArray = Array.isArray(categories) ? categories : [];

  useEffect(() => {
    if (safeInitialData.title) setTitle(safeInitialData.title);
    if (safeInitialData.description) setDescription(safeInitialData.description);
    if (safeInitialData.category) setCategory(safeInitialData.category);
    if (safeInitialData.timeLimit) setTimeLimit(safeInitialData.timeLimit);
    if (typeof safeInitialData.isPublished === 'boolean') setIsPublished(safeInitialData.isPublished);
  }, [safeInitialData]);

  useEffect(() => {
    // Log categories data for debugging
    console.log('Categories:', categories);
  }, [categories]);

  useEffect(() => {
    if (categoriesError) {
      console.error('Categories Error:', categoriesError);
    }
    if (categories) {
      console.log('Categories Data:', categories);
    }
  }, [categories, categoriesError]);



  // In QuizForm.jsx

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!title.trim()) {
      setError('Quiz title is required.');
      return;
    }
    if (!category) {
      setError('Category is required.');
      return;
    }
    if (!timeLimit || isNaN(timeLimit) || timeLimit < 1) {
      setError('Time limit must be at least 1 minute.');
      return;
    }

    // Prepare quiz data
    const quizData = {
      title: title.trim(),
      description: description.trim(),
      category,
      timeLimit: Number(timeLimit),
      isPublished,
      passingScore: 60
    };

    try {
      await onSubmit(quizData);
    } catch (error) {
      setError('Failed to save quiz');
    }
  };


  if (loadingCategories) {
    return (
      <div className="flex justify-center py-4">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-100 text-red-700 px-4 py-2 rounded">{error}</div>
      )}
      <div>
        <label className="block font-medium mb-1">Quiz Title</label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter quiz title"
          required
        />
      </div>
      <div>
        <label className="block font-medium mb-1">Description</label>
        <Input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter description (optional)"
        />
      </div>
      <div>
        <label className="block font-medium mb-1">Category</label>
        {loadingCategories ? (
          <LoadingSpinner size="small" />
        ) : categoriesError ? (
          <div className="text-red-600">Failed to load categories</div>
        ) : (
          <Select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
            className="w-full"
          >
            <option value="">Select category</option>
            {categoriesArray.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </Select>
        )}
      </div>
      <div>
        <label className="block font-medium mb-1">Time Limit (minutes)</label>
        <Input
          type="number"
          min={1}
          value={timeLimit}
          onChange={(e) => setTimeLimit(e.target.value)}
          required
        />
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="isPublished"
          checked={isPublished}
          onChange={(e) => setIsPublished(e.target.checked)}
        />
        <label htmlFor="isPublished" className="font-medium">
          Publish Quiz
        </label>
      </div>
      <div className="flex gap-3 justify-end">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={loading || loadingCategories}>
          {loading ? 'Saving...' : 'Save Quiz'}
        </Button>
      </div>
    </form>
  );
};

export default QuizForm;