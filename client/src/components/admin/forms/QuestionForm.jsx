import React, { useState, useEffect } from 'react';
import Input from '../../ui/Input';
import Button from '../../ui/Button';

const QuestionForm = ({ 
  initialData = null,
  onSubmit,
  onCancel,
  loading = false 
}) => {
  const [formData, setFormData] = useState({
    questionText: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    points: 1
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData({
        questionText: initialData.questionText || '',
        options: initialData.options || ['', '', '', ''],
        correctAnswer: initialData.correctAnswer || 0,
        points: initialData.points || 1
      });
    }
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.questionText.trim()) {
      setError('Question text is required');
      return;
    }

    const validOptions = formData.options.filter(opt => opt.trim());
    if (validOptions.length < 2) {
      setError('At least 2 options are required');
      return;
    }

    if (!formData.options[formData.correctAnswer]?.trim()) {
      setError('Correct answer cannot be empty');
      return;
    }

    onSubmit(formData);
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData(prev => ({ ...prev, options: newOptions }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-md">
          {error}
        </div>
      )}

      <div>
        <label className="block font-medium mb-2">Question Text</label>
        <textarea
          value={formData.questionText}
          onChange={(e) => setFormData(prev => ({ 
            ...prev, 
            questionText: e.target.value 
          }))}
          rows={3}
          className="w-full p-2 border rounded-md"
          placeholder="Enter your question"
        />
      </div>

      <div>
        <label className="block font-medium mb-2">Options</label>
        <div className="space-y-3">
          {formData.options.map((option, index) => (
            <div key={index} className="flex items-center gap-3">
              <input
                type="radio"
                name="correctAnswer"
                checked={formData.correctAnswer === index}
                onChange={() => setFormData(prev => ({
                  ...prev,
                  correctAnswer: index
                }))}
                className="w-4 h-4"
              />
              <Input
                value={option}
                onChange={(e) => handleOptionChange(index, e.target.value)}
                placeholder={`Option ${String.fromCharCode(65 + index)}`}
                className="flex-1"
              />
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className="block font-medium mb-2">Points</label>
        <Input
          type="number"
          min="1"
          value={formData.points}
          onChange={(e) => setFormData(prev => ({
            ...prev,
            points: parseInt(e.target.value)
          }))}
          className="w-32"
        />
      </div>

      <div className="flex justify-end gap-3">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : initialData ? 'Update' : 'Create'}
        </Button>
      </div>
    </form>
  );
};

export default QuestionForm;