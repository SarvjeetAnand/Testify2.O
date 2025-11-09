import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useAuth } from '../../hooks/useAuth'
import { authService } from '../../services/auth'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Badge from '../../components/ui/Badge'
import { toast } from 'sonner'
import { UserIcon, EnvelopeIcon, CalendarIcon } from '@heroicons/react/24/outline'
import { formatDateTime } from '../../utils/helpers'

const profileSchema = yup.object({
  name: yup.string().required('Name is required'),
  email: yup.string().email('Invalid email').required('Email is required')
})

const passwordSchema = yup.object({
  currentPassword: yup.string().required('Current password is required'),
  newPassword: yup.string().min(6, 'Password must be at least 6 characters').required('New password is required'),
  confirmPassword: yup.string()
    .oneOf([yup.ref('newPassword')], 'Passwords must match')
    .required('Confirm password is required')
})

const Profile = () => {
  const { user, updateUser } = useAuth()
  const [loading, setLoading] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors }
  } = useForm({
    resolver: yupResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || ''
    }
  })

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    reset: resetPasswordForm
  } = useForm({
    resolver: yupResolver(passwordSchema)
  })

  const onProfileSubmit = async (data) => {
    setLoading(true)
    try {
      // Here you would call an API to update profile
      // For now, we'll just update the local state
      updateUser(data)
      toast.success('Profile updated successfully')
    } catch (error) {
      toast.error('Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const onPasswordSubmit = async (data) => {
    setPasswordLoading(true)
    try {
      // Here you would call an API to change password
      toast.success('Password changed successfully')
      resetPasswordForm()
    } catch (error) {
      toast.error('Failed to change password')
    } finally {
      setPasswordLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
        <p className="text-gray-600 mt-2">Manage your account information</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Info */}
        <div className="lg:col-span-2 space-y-8">
          {/* Basic Information */}
          <Card>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Basic Information</h2>
            <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-6">
              <Input
                label="Full Name"
                icon={UserIcon}
                error={profileErrors.name?.message}
                {...registerProfile('name')}
              />

              <Input
                label="Email"
                type="email"
                icon={EnvelopeIcon}
                error={profileErrors.email?.message}
                {...registerProfile('email')}
              />

              <Button type="submit" loading={loading}>
                Update Profile
              </Button>
            </form>
          </Card>

          {/* Change Password */}
          <Card>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Change Password</h2>
            <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-6">
              <Input
                label="Current Password"
                type="password"
                error={passwordErrors.currentPassword?.message}
                {...registerPassword('currentPassword')}
              />

              <Input
                label="New Password"
                type="password"
                error={passwordErrors.newPassword?.message}
                {...registerPassword('newPassword')}
              />

              <Input
                label="Confirm New Password"
                type="password"
                error={passwordErrors.confirmPassword?.message}
                {...registerPassword('confirmPassword')}
              />

              <Button type="submit" loading={passwordLoading}>
                Change Password
              </Button>
            </form>
          </Card>
        </div>

        {/* Profile Summary */}
        <div className="space-y-6">
          <Card>
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-2xl">
                  {user?.name?.charAt(0)?.toUpperCase()}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">{user?.name}</h3>
              <p className="text-gray-600">{user?.email}</p>
              <div className="mt-4">
                <Badge variant={user?.role === 'admin' ? 'primary' : 'default'}>
                  {user?.role?.toUpperCase()}
                </Badge>
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="font-semibold text-gray-900 mb-4">Account Details</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center text-gray-600">
                <CalendarIcon className="w-4 h-4 mr-2" />
                <span>Joined {formatDateTime(user?.createdAt)}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <UserIcon className="w-4 h-4 mr-2" />
                <span>Role: {user?.role}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default Profile