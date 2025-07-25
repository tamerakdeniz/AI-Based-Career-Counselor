import React, { useState, useEffect } from 'react';
import { User, Mail, Calendar, MapPin, Briefcase, GraduationCap, Edit3, Save, X, Camera, Award, Target, TrendingUp, Clock, Settings, Shield, Bell, Globe, ChevronDown, ChevronUp, Eye, EyeOff, Lock, AlertCircle, CheckCircle } from 'lucide-react';
import Header from '../components/Header';
import { getCurrentUser, logout } from '../utils/auth';
import axiosInstance from '../api/axiosInstance';
import { useNavigate } from 'react-router-dom';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  location?: string;
  jobTitle?: string;
  company?: string;
  education?: string;
  joinedAt: string;
  skills?: string[];
  interests?: string[];
  goals?: string[];
}

interface ProfileStats {
  totalRoadmaps: number;
  completedMilestones: number;
  averageProgress: number;
  totalSkills: number;
  joinedDaysAgo: number;
}

const Profile: React.FC = () => {
  const navigate = useNavigate();
  // Delete account handler
  const handleDeleteAccount = async () => {
    if (!profile) return;
    const confirmDelete = window.confirm('Are you sure you want to permanently delete your account? This action cannot be undone.');
    if (!confirmDelete) return;
    try {
      await axiosInstance.delete(`/users/${profile.id}`);
      logout();
      navigate('/');
    } catch (error) {
      alert('Failed to delete account. Please try again.');
    }
  };
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<ProfileStats | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<UserProfile>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Expandable sections state
  const [expandedSections, setExpandedSections] = useState<{[key: string]: boolean}>({});
  
  // Password change state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  
  // Email change state
  const [emailForm, setEmailForm] = useState({
    newEmail: '',
    password: ''
  });
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailMessage, setEmailMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const currentUser = getCurrentUser();
        if (currentUser) {
          // Fetch user profile data
          const profileRes = await axiosInstance.get(`/users/${currentUser.id}`);
          const profileData = profileRes.data;
          
          // Fetch user roadmaps for stats
          const roadmapsRes = await axiosInstance.get(`/roadmaps/user/${currentUser.id}`);
          const roadmaps = roadmapsRes.data;
          
          // Calculate stats
          const completedMilestones = roadmaps.reduce((sum: number, roadmap: any) => sum + (roadmap.completedMilestones || 0), 0);
          const averageProgress = roadmaps.length > 0 
            ? Math.round(roadmaps.reduce((sum: number, roadmap: any) => sum + (roadmap.progress || 0), 0) / roadmaps.length)
            : 0;
          
          const joinedDate = new Date(profileData.created_at || profileData.joinedAt || Date.now());
          const joinedDaysAgo = Math.floor((Date.now() - joinedDate.getTime()) / (1000 * 60 * 60 * 24));
          
          setProfile({
            id: profileData.id,
            name: profileData.name,
            email: profileData.email,
            avatar: profileData.avatar,
            bio: profileData.bio || '',
            location: profileData.location || '',
            jobTitle: profileData.job_title || '',
            company: profileData.company || '',
            education: profileData.education || '',
            joinedAt: profileData.created_at || profileData.joinedAt || new Date().toISOString(),
            skills: profileData.skills || [],
            interests: profileData.interests || [],
            goals: profileData.goals || []
          });
          
          setStats({
            totalRoadmaps: roadmaps.length,
            completedMilestones,
            averageProgress,
            totalSkills: (profileData.skills || []).length,
            joinedDaysAgo
          });
          
          // Set initial email form
          setEmailForm(prev => ({ ...prev, newEmail: profileData.email }));
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const handleEdit = () => {
    setEditForm(profile || {});
    setIsEditing(true);
  };

  const handleCancel = () => {
    setEditForm({});
    setIsEditing(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updateData = {
        name: editForm.name,
        bio: editForm.bio,
        location: editForm.location,
        job_title: editForm.jobTitle,
        company: editForm.company,
        education: editForm.education,
        skills: editForm.skills,
        interests: editForm.interests,
        goals: editForm.goals
      };
      // API isteği: güncel profil verisini döndürür
      const response = await axiosInstance.put(`/users/${profile?.id}`, updateData);
      if (response && response.data) {
        setProfile(response.data);
      } else {
        setProfile(prev => prev ? { ...prev, ...editForm } : null);
      }
      setIsEditing(false);
      setEditForm({});
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof UserProfile, value: string | string[]) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayInputChange = (field: 'skills' | 'interests' | 'goals', value: string) => {
    const items = value.split(',').map(item => item.trim()).filter(item => item);
    handleInputChange(field, items);
  };

  // Password change handler
  const handlePasswordChange = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }
    
    if (passwordForm.newPassword.length < 6) {
      setPasswordMessage({ type: 'error', text: 'Password must be at least 6 characters long' });
      return;
    }

    setPasswordLoading(true);
    setPasswordMessage(null);
    
    try {
      await axiosInstance.put('/auth/change-password', {
        current_password: passwordForm.currentPassword,
        new_password: passwordForm.newPassword
      });
      
      setPasswordMessage({ type: 'success', text: 'Password changed successfully' });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      
      // Auto-collapse after success
      setTimeout(() => {
        toggleSection('password');
        setPasswordMessage(null);
      }, 2000);
    } catch (error: any) {
      setPasswordMessage({ 
        type: 'error', 
        text: error.response?.data?.detail || 'Failed to change password' 
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  // Email change handler
  const handleEmailChange = async () => {
    if (!emailForm.newEmail || !emailForm.password) {
      setEmailMessage({ type: 'error', text: 'Please fill in all fields' });
      return;
    }

    setEmailLoading(true);
    setEmailMessage(null);
    
    try {
      await axiosInstance.put('/auth/change-email', {
        new_email: emailForm.newEmail,
        current_password: emailForm.password
      });
      
      setEmailMessage({ type: 'success', text: 'Email changed successfully' });
      setProfile(prev => prev ? { ...prev, email: emailForm.newEmail } : null);
      setEmailForm({ newEmail: emailForm.newEmail, password: '' });
      
      // Auto-collapse after success
      setTimeout(() => {
        toggleSection('email');
        setEmailMessage(null);
      }, 2000);
    } catch (error: any) {
      if (error.response?.status === 401) {
        setEmailMessage({
          type: 'error',
          text: error.response?.data?.detail || 'Mevcut şifre yanlış!'
        });
      } else if (error.response?.status === 400) {
        setEmailMessage({
          type: 'error',
          text: error.response?.data?.detail || 'Yeni email mevcut email ile aynı olamaz.'
        });
      } else {
        setEmailMessage({
          type: 'error',
          text: error.response?.data?.detail || 'Failed to change email'
        });
      }
    } finally {
      setEmailLoading(false);
    }
  };


//   const handleEmailChange = async () => {
//   try {
//     setEmailLoading(true);

//     // Örnek: API çağrısı
//     const response = await changeEmail(emailForm.newEmail, emailForm.password);

//     if (response.success) {
//       setEmailMessage({ text: 'Email changed successfully', type: 'success' });
//     } else {
//       setEmailMessage({ text: response.message || 'Failed to change email', type: 'error' });
//     }

//   } catch (error) {
//     // Hata durumunda mesaj göster, sayfa yenilenmez veya kullanıcı atılmaz
//     setEmailMessage({ text: 'Incorrect password or error occurred', type: 'error' });
//   } finally {
//     setEmailLoading(false);
//   }
// };



  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Profile Not Found</h1>
          <p className="text-gray-600">Unable to load your profile information.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
          {/* Cover Image */}
          <div className="h-32 bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 relative">
            <div className="absolute inset-0 bg-black bg-opacity-20"></div>
          </div>
          
          {/* Profile Info */}
          <div className="px-6 pb-6">
            <div className="flex flex-col sm:flex-row sm:items-end sm:space-x-6 -mt-16 relative z-10">
              {/* Avatar */}
              <div className="relative">
                <img
                  src={profile.avatar || `https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop`}
                  alt={profile.name}
                  className="w-32 h-32 rounded-full border-4 border-white object-cover shadow-lg"
                />
                {isEditing && (
                  <button className="absolute bottom-2 right-2 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition-colors">
                    <Camera className="h-4 w-4" />
                  </button>
                )}
              </div>
              
              {/* Basic Info */}
              <div className="flex-1 mt-4 sm:mt-0">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.name || ''}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="text-2xl font-bold text-gray-900 bg-transparent border-b-2 border-blue-500 focus:outline-none"
                      />
                    ) : (
                      <h1 className="text-2xl font-bold text-gray-900">{profile.name}</h1>
                    )}
                    
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.jobTitle || ''}
                        onChange={(e) => handleInputChange('jobTitle', e.target.value)}
                        placeholder="Job Title"
                        className="text-gray-600 bg-transparent border-b border-gray-300 focus:outline-none focus:border-blue-500 mt-1"
                      />
                    ) : (
                      profile.jobTitle && (
                        <p className="text-gray-600 flex items-center mt-1">
                          <Briefcase className="h-4 w-4 mr-2" />
                          {profile.jobTitle} {profile.company && `at ${profile.company}`}
                        </p>
                      )
                    )}
                    
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-1" />
                        {profile.email}
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        Joined {new Date(profile.joinedAt).toLocaleDateString()}
                      </div>
                      {profile.location && (
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {isEditing ? (
                            <input
                              type="text"
                              value={editForm.location || ''}
                              onChange={(e) => handleInputChange('location', e.target.value)}
                              className="bg-transparent border-b border-gray-300 focus:outline-none focus:border-blue-500"
                            />
                          ) : (
                            profile.location
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex space-x-3 mt-4 sm:mt-0">
                    {isEditing ? (
                      <>
                        <button
                          onClick={handleCancel}
                          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors flex items-center space-x-2"
                        >
                          <X className="h-4 w-4" />
                          <span>Cancel</span>
                        </button>
                        <button
                          onClick={handleSave}
                          disabled={saving}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
                        >
                          <Save className="h-4 w-4" />
                          <span>{saving ? 'Saving...' : 'Save'}</span>
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={handleEdit}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                      >
                        <Edit3 className="h-4 w-4" />
                        <span>Edit Profile</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Roadmaps</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalRoadmaps}</p>
                </div>
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Target className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Completed Milestones</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.completedMilestones}</p>
                </div>
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Award className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Average Progress</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.averageProgress}%</p>
                </div>
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Days Active</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.joinedDaysAgo}</p>
                </div>
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Clock className="h-5 w-5 text-orange-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', label: 'Overview', icon: User },
                { id: 'skills', label: 'Skills & Interests', icon: Award },
                { id: 'settings', label: 'Settings', icon: Settings }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Bio Section */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">About</h3>
                  {isEditing ? (
                    <textarea
                      value={editForm.bio || ''}
                      onChange={(e) => handleInputChange('bio', e.target.value)}
                      placeholder="Tell us about yourself, your career goals, and what drives you..."
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                    />
                  ) : (
                    <p className="text-gray-600 leading-relaxed">
                      {profile.bio || 'No bio added yet. Click edit to add information about yourself.'}
                    </p>
                  )}
                </div>

                {/* Professional Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Company</h4>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.company || ''}
                        onChange={(e) => handleInputChange('company', e.target.value)}
                        placeholder="Your current company"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                    ) : (
                      <p className="text-gray-600">{profile.company || 'Not specified'}</p>
                    )}
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Education</h4>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.education || ''}
                        onChange={(e) => handleInputChange('education', e.target.value)}
                        placeholder="Your education background"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                    ) : (
                      <p className="text-gray-600">{profile.education || 'Not specified'}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Skills Tab */}
            {activeTab === 'skills' && (
              <div className="space-y-6">
                {/* Skills */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Skills</h3>
                  {isEditing ? (
                    <div>
                      <input
                        type="text"
                        value={editForm.skills?.join(', ') || ''}
                        onChange={(e) => handleArrayInputChange('skills', e.target.value)}
                        placeholder="Enter skills separated by commas (e.g., JavaScript, React, Node.js)"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                      <p className="text-xs text-gray-500 mt-1">Separate skills with commas</p>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {profile.skills && profile.skills.length > 0 ? (
                        profile.skills.map((skill, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                          >
                            {skill}
                          </span>
                        ))
                      ) : (
                        <p className="text-gray-500">No skills added yet</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Interests */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Interests</h3>
                  {isEditing ? (
                    <div>
                      <input
                        type="text"
                        value={editForm.interests?.join(', ') || ''}
                        onChange={(e) => handleArrayInputChange('interests', e.target.value)}
                        placeholder="Enter interests separated by commas (e.g., AI, Web Development, Design)"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                      <p className="text-xs text-gray-500 mt-1">Separate interests with commas</p>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {profile.interests && profile.interests.length > 0 ? (
                        profile.interests.map((interest, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm"
                          >
                            {interest}
                          </span>
                        ))
                      ) : (
                        <p className="text-gray-500">No interests added yet</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Goals */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Career Goals</h3>
                  {isEditing ? (
                    <div>
                      <input
                        type="text"
                        value={editForm.goals?.join(', ') || ''}
                        onChange={(e) => handleArrayInputChange('goals', e.target.value)}
                        placeholder="Enter goals separated by commas (e.g., Become a Senior Developer, Learn Machine Learning)"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                      <p className="text-xs text-gray-500 mt-1">Separate goals with commas</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {profile.goals && profile.goals.length > 0 ? (
                        profile.goals.map((goal, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <Target className="h-4 w-4 text-purple-600" />
                            <span className="text-gray-700">{goal}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500">No goals added yet</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Account Settings</h3>
                  
                  {/* Password Change Section */}
                  <div className="border border-gray-200 rounded-lg">
                    <button
                      onClick={() => toggleSection('password')}
                      className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <Shield className="h-5 w-5 text-gray-600" />
                        <div className="text-left">
                          <p className="font-medium text-gray-900">Change Password</p>
                          <p className="text-sm text-gray-500">Update your account password</p>
                        </div>
                      </div>
                      {expandedSections.password ? (
                        <ChevronUp className="h-5 w-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                    
                    {expandedSections.password && (
                      <div className="border-t border-gray-200 p-4 bg-gray-50">
                        <div className="space-y-4 max-w-md">
                          {passwordMessage && (
                            <div className={`flex items-center space-x-2 p-3 rounded-lg ${
                              passwordMessage.type === 'success' 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-red-100 text-red-700'
                            }`}>
                              {passwordMessage.type === 'success' ? (
                                <CheckCircle className="h-4 w-4" />
                              ) : (
                                <AlertCircle className="h-4 w-4" />
                              )}
                              <span className="text-sm">{passwordMessage.text}</span>
                            </div>
                          )}
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Current Password
                            </label>
                            <div className="relative">
                              <input
                                type={showPasswords.current ? 'text' : 'password'}
                                value={passwordForm.currentPassword}
                                onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                placeholder="Enter current password"
                              />
                              <button
                                type="button"
                                onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                              >
                                {showPasswords.current ? (
                                  <EyeOff className="h-4 w-4 text-gray-400" />
                                ) : (
                                  <Eye className="h-4 w-4 text-gray-400" />
                                )}
                              </button>
                            </div>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              New Password
                            </label>
                            <div className="relative">
                              <input
                                type={showPasswords.new ? 'text' : 'password'}
                                value={passwordForm.newPassword}
                                onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                placeholder="Enter new password"
                              />
                              <button
                                type="button"
                                onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                              >
                                {showPasswords.new ? (
                                  <EyeOff className="h-4 w-4 text-gray-400" />
                                ) : (
                                  <Eye className="h-4 w-4 text-gray-400" />
                                )}
                              </button>
                            </div>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Confirm New Password
                            </label>
                            <div className="relative">
                              <input
                                type={showPasswords.confirm ? 'text' : 'password'}
                                value={passwordForm.confirmPassword}
                                onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                placeholder="Confirm new password"
                              />
                              <button
                                type="button"
                                onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                              >
                                {showPasswords.confirm ? (
                                  <EyeOff className="h-4 w-4 text-gray-400" />
                                ) : (
                                  <Eye className="h-4 w-4 text-gray-400" />
                                )}
                              </button>
                            </div>
                          </div>
                          
                          <button
                            onClick={handlePasswordChange}
                            disabled={passwordLoading || !passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword}
                            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                          >
                            <Lock className="h-4 w-4" />
                            <span>{passwordLoading ? 'Changing...' : 'Change Password'}</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Email Change Section */}
                  <div className="border border-gray-200 rounded-lg">
                    <button
                      onClick={() => toggleSection('email')}
                      className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <Mail className="h-5 w-5 text-gray-600" />
                        <div className="text-left">
                          <p className="font-medium text-gray-900">Change Email</p>
                          <p className="text-sm text-gray-500">Update your email address</p>
                        </div>
                      </div>
                      {expandedSections.email ? (
                        <ChevronUp className="h-5 w-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                    
                    {expandedSections.email && (
                      <div className="border-t border-gray-200 p-4 bg-gray-50">
                        <div className="space-y-4 max-w-md">
                          {emailMessage && (
                            <div className={`flex items-center space-x-2 p-3 rounded-lg ${
                              emailMessage.type === 'success' 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-red-100 text-red-700'
                            }`}>
                              {emailMessage.type === 'success' ? (
                                <CheckCircle className="h-4 w-4" />
                              ) : (
                                <AlertCircle className="h-4 w-4" />
                              )}
                              <span className="text-sm">{emailMessage.text}</span>
                            </div>
                          )}
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Current Email
                            </label>
                            <input
                              type="email"
                              value={profile.email}
                              disabled
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              New Email
                            </label>
                            <input
                              type="email"
                              value={emailForm.newEmail}
                              onChange={(e) => setEmailForm(prev => ({ ...prev, newEmail: e.target.value }))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                              placeholder="Enter new email address"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Confirm with Password
                            </label>
                            <input
                              type="password"
                              value={emailForm.password}
                              onChange={(e) => setEmailForm(prev => ({ ...prev, password: e.target.value }))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                              placeholder="Enter your password"
                            />
                          </div>
                          
                          <button
                          type='button'
                            onClick={handleEmailChange}
                            disabled={emailLoading || !emailForm.newEmail || !emailForm.password}
                            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                          >
                            <Mail className="h-4 w-4" />
                            <span>{emailLoading ? 'Changing...' : 'Change Email'}</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>


                </div>

                {/* Danger Zone */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-semibold text-red-600 mb-4">Danger Zone</h3>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-red-900">Delete Account</p>
                        <p className="text-sm text-red-700">Permanently delete your account and all data</p>
                      </div>
                      <button
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                        onClick={handleDeleteAccount}
                      >
                        Delete Account
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
