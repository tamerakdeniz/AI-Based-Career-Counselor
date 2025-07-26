import {
  AlertTriangle,
  Eye,
  EyeOff,
  Lock,
  RotateCcw,
  Save,
  Shield,
  Trash2,
  User
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import ConfirmationModal from '../components/ConfirmationModal';
import Header from '../components/Header';
import NotificationToast from '../components/NotificationToast';
import { logout } from '../utils/auth';

interface UserData {
  id: number;
  name: string;
  email: string;
  avatar?: string;
}

interface ApiError {
  response?: {
    data?: {
      detail?: string;
    };
  };
}

const Settings: React.FC = () => {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    avatar: ''
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  // Modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [modalLoading, setModalLoading] = useState(false);

  // Notification state
  const [notification, setNotification] = useState({
    show: false,
    type: 'success' as 'success' | 'error' | 'warning' | 'info',
    title: '',
    message: ''
  });

  // Helper function to show notifications
  const showNotification = (
    type: 'success' | 'error' | 'warning' | 'info',
    title: string,
    message?: string
  ) => {
    setNotification({
      show: true,
      type,
      title,
      message: message || ''
    });
  };

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/auth/me');
      setUser(response.data);
      setProfileForm({
        name: response.data.name || '',
        email: response.data.email || '',
        avatar: response.data.avatar || ''
      });
    } catch (error) {
      console.error('Failed to load user data:', error);
      setError('Failed to load user data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    setError('');
    setProfileSuccess('');

    try {
      const updateData: Record<string, string> = {};
      if (profileForm.name !== user?.name) updateData.name = profileForm.name;
      if (profileForm.email !== user?.email)
        updateData.email = profileForm.email;
      if (profileForm.avatar !== user?.avatar)
        updateData.avatar = profileForm.avatar;

      if (Object.keys(updateData).length === 0) {
        setProfileSuccess('No changes to update.');
        return;
      }

      const response = await axiosInstance.put('/users/profile', updateData);
      setUser(response.data.user);
      setProfileSuccess('Profile updated successfully!');
      showNotification(
        'success',
        'Profile Updated',
        'Your profile has been updated successfully!'
      );

      // Clear success message after 3 seconds
      setTimeout(() => setProfileSuccess(''), 3000);
    } catch (error: unknown) {
      const errorMessage =
        error && typeof error === 'object' && 'response' in error
          ? (error as ApiError).response?.data?.detail ||
            'Failed to update profile.'
          : 'Failed to update profile.';
      setError(errorMessage);
      setTimeout(() => setError(''), 5000);
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordLoading(true);
    setError('');
    setPasswordSuccess('');

    // Validate passwords match
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('New passwords do not match.');
      setPasswordLoading(false);
      setTimeout(() => setError(''), 5000);
      return;
    }

    // Validate password length
    if (passwordForm.newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      setPasswordLoading(false);
      setTimeout(() => setError(''), 5000);
      return;
    }

    // Validate password has letters and numbers
    if (!/[a-zA-Z]/.test(passwordForm.newPassword)) {
      setError('New password must contain at least one letter.');
      setPasswordLoading(false);
      setTimeout(() => setError(''), 5000);
      return;
    }

    if (!/\d/.test(passwordForm.newPassword)) {
      setError('New password must contain at least one number.');
      setPasswordLoading(false);
      setTimeout(() => setError(''), 5000);
      return;
    }

    try {
      await axiosInstance.put('/users/change-password', {
        current_password: passwordForm.currentPassword,
        new_password: passwordForm.newPassword
      });

      setPasswordSuccess('Password changed successfully!');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });

      showNotification(
        'success',
        'Password Changed',
        'Your password has been updated successfully!'
      );

      // Clear success message after 3 seconds
      setTimeout(() => setPasswordSuccess(''), 3000);
    } catch (error: unknown) {
      const errorMessage =
        error && typeof error === 'object' && 'response' in error
          ? (error as ApiError).response?.data?.detail ||
            'Failed to change password.'
          : 'Failed to change password.';
      setError(errorMessage);
      setTimeout(() => setError(''), 5000);
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleResetProgress = async () => {
    setModalLoading(true);
    try {
      await axiosInstance.delete('/users/reset-progress');
      setShowResetModal(false);
      showNotification(
        'success',
        'Progress Reset',
        'All your progress has been reset successfully!'
      );
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (error: unknown) {
      const errorMessage =
        error && typeof error === 'object' && 'response' in error
          ? (error as ApiError).response?.data?.detail ||
            'Failed to reset progress.'
          : 'Failed to reset progress.';
      setError(errorMessage);
      setTimeout(() => setError(''), 5000);
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setModalLoading(true);
    try {
      await axiosInstance.delete('/users/account', {
        data: { password: deletePassword }
      });

      setShowDeleteModal(false);
      showNotification(
        'success',
        'Account Deleted',
        'Your account has been deleted successfully.'
      );
      setTimeout(() => {
        logout();
        navigate('/');
      }, 2000);
    } catch (error: unknown) {
      const errorMessage =
        error && typeof error === 'object' && 'response' in error
          ? (error as ApiError).response?.data?.detail ||
            'Failed to delete account.'
          : 'Failed to delete account.';
      setError(errorMessage);
      setTimeout(() => setError(''), 5000);
    } finally {
      setModalLoading(false);
      setDeletePassword('');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header
          showBackButton
          onBack={() => navigate('/dashboard')}
          title="Settings"
        />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading settings...</span>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        showBackButton
        onBack={() => navigate('/dashboard')}
        title="Settings"
      />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error/Success Messages */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Profile Settings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <User className="h-5 w-5 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">
              Profile Information
            </h2>
          </div>

          {profileSuccess && (
            <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-green-600">{profileSuccess}</p>
            </div>
          )}

          <form onSubmit={handleProfileUpdate} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={profileForm.name}
                  onChange={e =>
                    setProfileForm({ ...profileForm, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={profileForm.email}
                  onChange={e =>
                    setProfileForm({ ...profileForm, email: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="avatar"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Avatar URL (Optional)
              </label>
              <input
                type="url"
                id="avatar"
                value={profileForm.avatar}
                onChange={e =>
                  setProfileForm({ ...profileForm, avatar: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://example.com/avatar.jpg"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={profileLoading}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                <Save className="h-4 w-4" />
                <span>{profileLoading ? 'Updating...' : 'Update Profile'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Password Settings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <Lock className="h-5 w-5 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">
              Change Password
            </h2>
          </div>

          {passwordSuccess && (
            <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-green-600">{passwordSuccess}</p>
            </div>
          )}

          <form onSubmit={handlePasswordChange} className="space-y-6">
            <div>
              <label
                htmlFor="currentPassword"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showPasswords.current ? 'text' : 'password'}
                  id="currentPassword"
                  value={passwordForm.currentPassword}
                  onChange={e =>
                    setPasswordForm({
                      ...passwordForm,
                      currentPassword: e.target.value
                    })
                  }
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <button
                  type="button"
                  onClick={() =>
                    setShowPasswords({
                      ...showPasswords,
                      current: !showPasswords.current
                    })
                  }
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPasswords.current ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="newPassword"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.new ? 'text' : 'password'}
                    id="newPassword"
                    value={passwordForm.newPassword}
                    onChange={e =>
                      setPasswordForm({
                        ...passwordForm,
                        newPassword: e.target.value
                      })
                    }
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPasswords({
                        ...showPasswords,
                        new: !showPasswords.new
                      })
                    }
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.new ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.confirm ? 'text' : 'password'}
                    id="confirmPassword"
                    value={passwordForm.confirmPassword}
                    onChange={e =>
                      setPasswordForm({
                        ...passwordForm,
                        confirmPassword: e.target.value
                      })
                    }
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPasswords({
                        ...showPasswords,
                        confirm: !showPasswords.confirm
                      })
                    }
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.confirm ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={passwordLoading}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                <Shield className="h-4 w-4" />
                <span>
                  {passwordLoading ? 'Changing...' : 'Change Password'}
                </span>
              </button>
            </div>
          </form>
        </div>

        {/* Danger Zone */}
        <div className="bg-white rounded-xl shadow-sm border border-red-200 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Danger Zone</h2>
          </div>

          <div className="space-y-4">
            {/* Reset Progress */}
            <div className="flex items-center justify-between p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <RotateCcw className="h-5 w-5 text-orange-600" />
                <div>
                  <h3 className="font-medium text-gray-900">
                    Reset All Progress
                  </h3>
                  <p className="text-sm text-gray-600">
                    Delete all roadmaps, milestones, and chat history
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowResetModal(true)}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                Reset Progress
              </button>
            </div>

            {/* Delete Account */}
            <div className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <Trash2 className="h-5 w-5 text-red-600" />
                <div>
                  <h3 className="font-medium text-gray-900">Delete Account</h3>
                  <p className="text-sm text-gray-600">
                    Permanently delete your account and all data
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>

        {/* Reset Progress Confirmation Modal */}
        <ConfirmationModal
          isOpen={showResetModal}
          onClose={() => setShowResetModal(false)}
          onConfirm={handleResetProgress}
          title="Reset All Progress"
          message="Are you sure you want to reset all your progress? This will permanently delete all your roadmaps, milestones, and chat history. This action cannot be undone."
          confirmText="Reset Progress"
          cancelText="Cancel"
          type="warning"
          loading={modalLoading}
        />

        {/* Delete Account Confirmation Modal */}
        <ConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setDeletePassword('');
          }}
          onConfirm={handleDeleteAccount}
          title="Delete Account"
          message="Are you sure you want to delete your account? This will permanently delete all your data and cannot be undone."
          confirmText="Delete Account"
          cancelText="Cancel"
          type="danger"
          loading={modalLoading}
        >
          <div className="mt-4">
            <label
              htmlFor="deletePassword"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Enter your password to confirm
            </label>
            <input
              type="password"
              id="deletePassword"
              value={deletePassword}
              onChange={e => setDeletePassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="Enter your password"
              required
            />
          </div>
        </ConfirmationModal>

        {/* Notification Toast */}
        <NotificationToast
          type={notification.type}
          title={notification.title}
          message={notification.message}
          isVisible={notification.show}
          onClose={() => setNotification({ ...notification, show: false })}
        />
      </main>
    </div>
  );
};

export default Settings;
