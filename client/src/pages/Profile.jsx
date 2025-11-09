import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { userService } from '../services/userService';
import { toast } from 'react-hot-toast';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { UserIcon, EnvelopeIcon, KeyIcon } from '@heroicons/react/24/outline';

const Profile = () => {
  const { users, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [changePassword, setChangePassword] = useState(false);

  const [form, setForm] = useState({
    name: users?.name || '',
    email: users?.email || '',
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

useEffect(() => {
  fetchProfile();
}, []); // Add user as dependency

const fetchProfile = async () => {
  setLoading(true);
  try {
    const res = await userService.getProfile();
    // console.log('Profile response:', res);

    if (res.success && res.data) {
      // Update both form and user context
      const userData = {
        ...res.data,
        name: res.data.name || '',
        email: res.data.email || ''
      };

      setForm(userData);
      updateUser(userData);
    } else {
      console.error('Failed to load profile:', res.message);
      toast.error(res.message || 'Failed to load profile');
    }
  } catch (err) {
    console.error('Profile fetch error:', err);
    toast.error(err?.response?.data?.message || 'Error loading profile');
  } finally {
    setLoading(false);
  }
};

// Update handleProfileUpdate function
const handleProfileUpdate = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    const updateData = {
      name: form.name.trim(),
      email: form.email
    };

    const res = await userService.updateProfile(updateData);

    if (res.success && res.data) {
      // Update both local state and context
      const updatedData = {
        ...users,
        ...res.data
      };

      setForm({
        name: updatedData.name,
        email: updatedData.email
      });
      
      updateUser(updatedData);
      toast.success('Profile updated successfully');
      setEditMode(false);
    } else {
      toast.error(res.message || 'Failed to update profile');
    }
  } catch (err) {
    console.error('Profile update error:', err);
    toast.error(err.response?.data?.message || 'Error updating profile');
  } finally {
    setLoading(false);
  }
};

  // Add this useEffect dependency
  useEffect(() => {
    fetchProfile();
  }, [updateUser]); // Add updateUser as dependency

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validatePasswordForm = () => {
    if (passwordForm.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return false;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Passwords do not match');
      return false;
    }
    return true;
  };

  // const handleProfileUpdate = async (e) => {
  //   e.preventDefault();
  //   setLoading(true);

  //   try {
  //     const updateData = {
  //       name: form.name.trim(),
  //       email: form.email
  //     };

  //     const res = await userService.updateProfile(updateData);

  //     if (res.success && res.data) {
  //       // Update user context
  //       if (typeof updateUser === 'function') {
  //         updateUser(res.data);
  //       }

  //       // Update form state
  //       setForm({
  //         name: res.data.name,
  //         email: res.data.email
  //       });

  //       toast.success('Profile updated successfully');
  //       setEditMode(false);
  //     } else {
  //       toast.error(res.message || 'Failed to update profile');
  //     }
  //   } catch (err) {
  //     console.error('Profile update error:', err);
  //     toast.error(err.response?.data?.message || 'Error updating profile');
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (!validatePasswordForm()) return;

    setLoading(true);
    try {
      const res = await userService.updatePassword(passwordForm);
      if (res.success) {
        toast.success('Password updated successfully');
        setChangePassword(false);
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        toast.error(res.message || 'Failed to update password');
      }
    } catch (err) {
      toast.error('Error updating password');
    } finally {
      setLoading(false);
    }
  };

  if (!users) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
        <p className="text-gray-600 mt-2">Manage your account information</p>
      </div>

      <div className="space-y-6">
        {/* Profile Information */}
        <Card>
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Profile Information</h2>
            {editMode ? (
              <form onSubmit={handleProfileUpdate} className="space-y-6">
                <div>
                  <label className="block font-medium mb-1">Name</label>
                  <Input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    icon={UserIcon}
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">Email</label>
                  <Input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    disabled
                    icon={EnvelopeIcon}
                  />
                </div>
                <div className="flex gap-3 justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setEditMode(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" loading={loading}>
                    Save Changes
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <div className="flex items-center px-3 py-2 bg-gray-50 rounded-md">
                    <UserIcon className="h-5 w-5 text-gray-400 mr-2" />
                    <span>{users.name}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <div className="flex items-center px-3 py-2 bg-gray-50 rounded-md">
                    <EnvelopeIcon className="h-5 w-5 text-gray-400 mr-2" />
                    <span>{users.email}</span>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button onClick={() => setEditMode(true)}>Edit Profile</Button>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Password Change */}
        <Card>
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Password</h2>
            {changePassword ? (
              <form onSubmit={handlePasswordUpdate} className="space-y-6">
                <div>
                  <label className="block font-medium mb-1">Current Password</label>
                  <Input
                    name="currentPassword"
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={handlePasswordChange}
                    required
                    icon={KeyIcon}
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">New Password</label>
                  <Input
                    name="newPassword"
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={handlePasswordChange}
                    required
                    icon={KeyIcon}
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">Confirm New Password</label>
                  <Input
                    name="confirmPassword"
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={handlePasswordChange}
                    required
                    icon={KeyIcon}
                  />
                </div>
                <div className="flex gap-3 justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setChangePassword(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" loading={loading}>
                    Update Password
                  </Button>
                </div>
              </form>
            ) : (
              <div className="flex justify-end">
                <Button onClick={() => setChangePassword(true)}>Change Password</Button>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Profile;