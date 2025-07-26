import {
  Award,
  Calendar,
  Clock,
  Edit3,
  Mail,
  TrendingUp,
  User,
  Trophy,
  Target,
  CheckCircle,
  Map,
  Zap,
  BookOpen
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import Header from '../components/Header';

interface UserProfile {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  joined_at: string;
  total_roadmaps: number;
  total_milestones: number;
  completed_milestones: number;
  completed_roadmaps: number;
}

interface Achievement {
  id: number;
  title: string;
  description: string;
  icon: string;
  category: string;
  condition_type: string;
  condition_value?: number;
  color_scheme: string;
  is_hidden: boolean;
  created_at: string;
}

interface UserAchievement {
  id: number;
  achievement_id: number;
  unlocked_at: string;
  is_notified: boolean;
  achievement: Achievement;
}

const iconMap = {
  User,
  Award,
  Trophy,
  Target,
  TrendingUp,
  CheckCircle,
  Map,
  Zap,
  BookOpen,
};

const Profile: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const [profileRes, achievementsRes] = await Promise.all([
        axiosInstance.get('/users/profile'),
        axiosInstance.get('/achievements/user')
      ]);
      setProfile(profileRes.data);
      setUserAchievements(achievementsRes.data);
    } catch (error) {
      console.error('Failed to load profile:', error);
      setError('Failed to load profile data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getProgressPercentage = () => {
    if (!profile || profile.total_milestones === 0) return 0;
    return Math.round(
      (profile.completed_milestones / profile.total_milestones) * 100
    );
  };

  const getDaysActive = () => {
    if (!profile) return 0;
    const joinDate = new Date(profile.joined_at);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - joinDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const renderAchievementIcon = (iconName: string, colorClass: string) => {
    const IconComponent = iconMap[iconName as keyof typeof iconMap] || Award;
    return <IconComponent className={`h-6 w-6 ${colorClass}`} />;
  };

  const parseColorScheme = (colorScheme: string) => {
    // Extract classes from the color scheme string
    const gradientMatch = colorScheme.match(/from-[\w-]+ to-[\w-]+/);
    const borderMatch = colorScheme.match(/border-[\w-]+/);
    const bgMatch = colorScheme.match(/bg-[\w-]+/);
    const textMatch = colorScheme.match(/text-[\w-]+/);

    return {
      gradient: gradientMatch ? `bg-gradient-to-r ${gradientMatch[0]}` : 'bg-gradient-to-r from-gray-50 to-gray-100',
      border: borderMatch ? borderMatch[0] : 'border-gray-100',
      iconBg: bgMatch ? bgMatch[0] : 'bg-gray-100',
      iconText: textMatch ? textMatch[0] : 'text-gray-600'
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header
          showBackButton
          onBack={() => navigate('/dashboard')}
          title="Profile"
        />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading profile...</span>
          </div>
        </main>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header
          showBackButton
          onBack={() => navigate('/dashboard')}
          title="Profile"
        />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-600">{error || 'Profile not found'}</p>
            <button
              onClick={fetchProfile}
              className="mt-3 text-red-600 hover:text-red-700 underline"
            >
              Try again
            </button>
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
        title="Profile"
      />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sm:p-8 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <img
                  src={
                    profile.avatar ||
                    'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
                  }
                  alt={profile.name}
                  className="w-20 h-20 rounded-full object-cover border-4 border-gray-100"
                />
                <div className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {profile.name}
                </h1>
                <div className="flex items-center space-x-2 text-gray-600 mt-1">
                  <Mail className="h-4 w-4" />
                  <span>{profile.email}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600 mt-1">
                  <Calendar className="h-4 w-4" />
                  <span>Joined {formatDate(profile.joined_at)}</span>
                </div>
              </div>
            </div>
            <div className="mt-6 sm:mt-0">
              <button
                onClick={() => navigate('/settings')}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Edit3 className="h-4 w-4" />
                <span>Edit Profile</span>
              </button>
            </div>
          </div>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Roadmaps</p>
                <p className="text-2xl font-bold text-gray-900">
                  {profile.total_roadmaps}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Milestones</p>
                <p className="text-2xl font-bold text-gray-900">
                  {profile.total_milestones}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Award className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed Roadmap</p>
                <p className="text-2xl font-bold text-gray-900">
                  {profile.completed_roadmaps}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Award className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Days Active</p>
                <p className="text-2xl font-bold text-gray-900">
                  {getDaysActive()}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Progress Overview */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Progress Overview
          </h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Overall Progress
                </span>
                <span className="text-sm text-gray-500">
                  {getProgressPercentage()}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${getProgressPercentage()}%` }}
                ></div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">
                  {profile.total_roadmaps}
                </p>
                <p className="text-sm text-gray-600">Active Roadmaps</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">
                  {profile.completed_milestones}
                </p>
                <p className="text-sm text-gray-600">Completed Milestones</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-orange-600">
                  {profile.total_milestones - profile.completed_milestones}
                </p>
                <p className="text-sm text-gray-600">Remaining Milestones</p>
              </div>
            </div>
          </div>
        </div>

        {/* Achievement Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Achievements
            </h2>
            <button
              onClick={() => navigate('/achievements')}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              View All
            </button>
          </div>
          
          {userAchievements.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {userAchievements.slice(0, 6).map((userAchievement) => {
                const achievement = userAchievement.achievement;
                const colors = parseColorScheme(achievement.color_scheme);
                
                return (
                  <div
                    key={userAchievement.id}
                    className={`
                      flex items-center space-x-3 p-4 rounded-lg border
                      ${colors.gradient} ${colors.border}
                    `}
                  >
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${colors.iconBg}`}>
                      {renderAchievementIcon(achievement.icon, colors.iconText)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{achievement.title}</p>
                      <p className="text-sm text-gray-600">{achievement.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-500 mb-4">No achievements yet</p>
              <p className="text-sm text-gray-400">
                Complete milestones and create roadmaps to earn achievements!
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Profile;
