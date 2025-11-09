import React, { useState, useEffect } from 'react';
import Input from '../../ui/Input';
import Button from '../../ui/Button';

const CategoryForm = ({
  initialData = {},
  onSubmit,
  onCancel,
  loading = false,
}) => {
  const [name, setName] = useState(initialData.name || '');
  const [description, setDescription] = useState(initialData.description || '');
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData.name) setName(initialData.name);
    if (initialData.description) setDescription(initialData.description);
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Category name is required.');
      return;
    }

    onSubmit({
      name,
      description,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-100 text-red-700 px-4 py-2 rounded">{error}</div>
      )}
      <div>
        <label className="block font-medium mb-1">Category Name</label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter category name"
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
      <div className="flex gap-3 justify-end">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : 'Save Category'}
        </Button>
      </div>
    </form>
  );
};

export default CategoryForm;