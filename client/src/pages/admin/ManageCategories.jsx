import { useState } from 'react'
import { useApi } from '../../hooks/useApi'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { toast } from 'sonner'
import { PlusIcon, PencilIcon, TrashIcon, FolderIcon } from '@heroicons/react/24/outline'

const ManageCategories = () => {
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [formData, setFormData] = useState({ name: '', description: '' })

  // Use relative URL for proxy support
  const { data: categories, loading, refetch } = useApi(() =>
    fetch('/api/category').then(res => res.json())
  )

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('You must be logged in as admin to create or update a category.');
        return;
      }
      if (editingCategory) {
        // Update category
        const res = await fetch(`/api/category/${editingCategory._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': `${token}`
          },
          body: JSON.stringify(formData)
        });
        if (!res.ok) throw new Error('Update failed');
        toast.success('Category updated successfully');
      } else {
        // Create category
        const res = await fetch('http://localhost:8080/api/category', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': `${token}`
          },
          body: JSON.stringify(formData)
        });
        if (!res.ok) throw new Error('Create failed');
        toast.success('Category created successfully');
      }
      setFormData({ name: '', description: '' });
      setShowCreateForm(false);
      setEditingCategory(null);
      refetch();
    } catch (error) {
      toast.error('Operation failed');
    }
  }

  const handleEdit = (category) => {
    setEditingCategory(category)
    setFormData({ name: category.name, description: category.description || '' })
    setShowCreateForm(true)
  }

  const handleDelete = async (categoryId, categoryName) => {
    if (window.confirm(`Delete category "${categoryName}"?`)) {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          toast.error('You must be logged in as admin to delete a category.');
          return;
        }
        const res = await fetch(`/api/category/${categoryId}`, {
          method: 'DELETE',
          headers: {
            'x-auth-token': `${token}`,
          },
        });
        if (!res.ok) throw new Error('Delete failed');
        toast.success('Category deleted successfully');
        refetch();
      } catch (error) {
        toast.error('Failed to delete category')
      }
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Category Management</h1>
          <p className="text-gray-600 mt-2">Organize your quizzes into categories</p>
        </div>
        <Button icon={PlusIcon} onClick={() => setShowCreateForm(true)}>
          Add Category
        </Button>
      </div>

      {/* Create/Edit Form */}
      {showCreateForm && (
        <Card className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {editingCategory ? 'Edit Category' : 'Create New Category'}
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Category Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <Input
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
            <div className="md:col-span-2 flex space-x-4">
              <Button type="submit">
                {editingCategory ? 'Update' : 'Create'} Category
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowCreateForm(false)
                  setEditingCategory(null)
                  setFormData({ name: '', description: '' })
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Categories List */}
      {loading ? (
        <div className="flex justify-center py-8">
          <LoadingSpinner />
        </div>
      ) : categories?.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <Card key={category._id} className="hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FolderIcon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{category.name}</h3>
                    <p className="text-sm text-gray-600">{category.description}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-2 pt-4 border-t border-gray-100">
                <Button
                  variant="outline"
                  size="sm"
                  icon={PencilIcon}
                  onClick={() => handleEdit(category)}
                >
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={TrashIcon}
                  onClick={() => handleDelete(category._id, category.name)}
                  className="text-red-600 hover:text-red-700"
                >
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="text-center py-12">
          <FolderIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No categories found</h3>
          <p className="text-gray-600 mb-4">Create your first category to organize quizzes.</p>
          <Button icon={PlusIcon} onClick={() => setShowCreateForm(true)}>
            Create Category
          </Button>
        </Card>
      )}
    </div>
  )
}

export default ManageCategories