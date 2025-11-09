import React, { useState } from 'react';
import { useApi, useApiMutation } from '../../hooks/useApi';
import { adminService } from '../../services/adminService';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Badge from '../ui/Badge';
import LoadingSpinner from '../common/LoadingSpinner';
import { toast } from 'react-hot-toast';
import {
  UserIcon,
  MagnifyingGlassIcon,
  ShieldCheckIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

const UserManagement = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  // Use useApi hook for fetching users
  const { 
    data: usersData, 
    loading, 
    refetch 
  } = useApi(() => 
    adminService.getAllUsers({
      page: currentPage,
      search,
      status: statusFilter
    }), 
    [currentPage, search, statusFilter]
  );

  // Use useApiMutation for user actions
  const { mutate: updateUserStatus, isLoading: isUpdating } = useApiMutation(
    adminService.updateUserStatus,
    {
      onSuccess: () => {
        refetch();
        toast.success('User status updated successfully');
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to update user status');
      }
    }
  );

  const { mutate: deleteUser, isLoading: isDeleting } = useApiMutation(
    adminService.deleteUser,
    {
      onSuccess: () => {
        refetch();
        toast.success('User deleted successfully');
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to delete user');
      }
    }
  );

  const users = usersData?.data || [];
  const pagination = usersData?.pagination || {};

  const handleStatusToggle = async (userId, currentStatus) => {
    if (isUpdating) return;
    await updateUserStatus(userId, !currentStatus);
  };

  const handleDelete = async (userId, userName) => {
    if (isDeleting) return;
    if (!window.confirm(`Are you sure you want to delete user "${userName}"?`)) return;
    await deleteUser(userId);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
        <p className="text-gray-600 mt-2">Manage platform users and their access</p>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
          <div className="md:col-span-2">
            <Input
              placeholder="Search users by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              icon={MagnifyingGlassIcon}
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Users</option>
            <option value="active">Active Users</option>
            <option value="inactive">Inactive Users</option>
          </select>
        </div>
      </Card>

      {/* Users List */}
      <Card>
        {loading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner />
          </div>
        ) : users.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4">User</th>
                  <th className="text-left py-3 px-4">Role</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-right py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id} className="border-b border-gray-100">
                    <td className="py-4 px-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <UserIcon className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="ml-3">
                          <p className="font-medium text-gray-900">{user.name}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <Badge variant={user.role === 'admin' ? 'primary' : 'default'}>
                        {user.role}
                      </Badge>
                    </td>
                    <td className="py-4 px-4">
                      <Badge variant={user.isActive ? 'success' : 'danger'}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex justify-end gap-2">
                        {user.role !== 'admin' && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleStatusToggle(user._id, user.isActive)}
                              disabled={isUpdating}
                              icon={ShieldCheckIcon}
                            >
                              {user.isActive ? 'Deactivate' : 'Activate'}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-red-600"
                              onClick={() => handleDelete(user._id, user.name)}
                              disabled={isDeleting}
                              icon={TrashIcon}
                            >
                              Delete
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {search ? 'Try adjusting your search' : 'Get started by adding new users'}
            </p>
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
            <div className="flex-1 flex justify-between sm:hidden">
              <Button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <Button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === pagination.pages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default UserManagement;