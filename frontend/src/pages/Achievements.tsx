import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Award, 
  Trophy, 
  Target, 
  User, 
  TrendingUp, 
  CheckCircle, 
  Map, 
  Zap, 
  BookOpen,
  Calendar,
  Lock
} from 'lucide-react';
import axiosInstance from '../api/axiosInstance';
import Header from '../components/Header';

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

const Achievements: React.FC = () => {
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([]);
  const [allAchievements, setAllAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchAchievements = async () => {
    try {
      setLoading(true);
      const [userAchievementsRes, allAchievementsRes] = await Promise.all([
        axiosInstance.get('/achievements/user'),
        axiosInstance.get('/achievements/')
      ]);
      
      setUserAchievements(userAchievementsRes.data);
      setAllAchievements(allAchievementsRes.data);
    } catch (err) {
      setError('Failed to load achievements');
      console.error('Error fetching achievements:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAchievements();
  }, []);

  const isAchievementUnlocked = (achievementId: number): UserAchievement | null => {
    return userAchievements.find(ua => ua.achievement_id === achievementId) || null;
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getCategoryDisplayName = (category: string) => {
    switch (category) {
      case 'milestone': return 'Milestone Progress';
      case 'roadmap': return 'Roadmap Creation';
      case 'general': return 'General';
      default: return category;
    }
  };

  const groupedAchievements = allAchievements.reduce((groups, achievement) => {
    const category = achievement.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(achievement);
    return groups;
  }, {} as Record<string, Achievement[]>);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header 
          showBackButton 
          onBack={() => navigate('/dashboard')} 
          title="Achievements" 
        />
        <div className="flex items-center justify-center pt-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading achievements...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header 
          showBackButton 
          onBack={() => navigate('/dashboard')} 
          title="Achievements" 
        />
        <div className="flex items-center justify-center pt-20">
          <div className="text-center">
            <div className="text-red-500 text-xl mb-4">⚠️</div>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={fetchAchievements}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        showBackButton 
        onBack={() => navigate('/dashboard')} 
        title="Achievements" 
      />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trophy className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Achievements</h1>
          <p className="text-gray-600">
            Track your progress and celebrate your learning milestones
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Award className="h-6 w-6 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {userAchievements.length}
            </div>
            <div className="text-sm text-gray-600">Achievements Unlocked</div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Target className="h-6 w-6 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {allAchievements.length}
            </div>
            <div className="text-sm text-gray-600">Total Available</div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {Math.round((userAchievements.length / allAchievements.length) * 100)}%
            </div>
            <div className="text-sm text-gray-600">Completion Rate</div>
          </div>
        </div>

        {/* Achievements by Category */}
        {Object.entries(groupedAchievements).map(([category, achievements]) => (
          <div key={category} className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
              {getCategoryDisplayName(category)}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {achievements.map((achievement) => {
                const userAchievement = isAchievementUnlocked(achievement.id);
                const isUnlocked = !!userAchievement;
                const colors = parseColorScheme(achievement.color_scheme);

                return (
                  <div
                    key={achievement.id}
                    className={`
                      relative p-6 rounded-xl border transition-all duration-200 hover:shadow-md
                      ${isUnlocked 
                        ? `${colors.gradient} ${colors.border} bg-opacity-50` 
                        : 'bg-gray-100 border-gray-200'
                      }
                    `}
                  >
                    {/* Lock overlay for locked achievements */}
                    {!isUnlocked && (
                      <div className="absolute inset-0 bg-gray-50 bg-opacity-90 flex items-center justify-center rounded-xl">
                        <div className="text-center">
                          <Lock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-xs text-gray-500">Locked</p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-start space-x-4">
                      <div className={`
                        w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0
                        ${isUnlocked ? `${colors.iconBg}` : 'bg-gray-200'}
                      `}>
                        {renderAchievementIcon(
                          achievement.icon, 
                          isUnlocked ? colors.iconText : 'text-gray-400'
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className={`
                          font-semibold mb-1
                          ${isUnlocked ? 'text-gray-900' : 'text-gray-500'}
                        `}>
                          {achievement.title}
                        </h3>
                        <p className={`
                          text-sm mb-3
                          ${isUnlocked ? 'text-gray-700' : 'text-gray-400'}
                        `}>
                          {achievement.description}
                        </p>
                        
                        {isUnlocked && userAchievement && (
                          <div className="flex items-center text-xs text-gray-500">
                            <Calendar className="h-3 w-3 mr-1" />
                            <span>Unlocked {formatDate(userAchievement.unlocked_at)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Motivational footer */}
        {userAchievements.length > 0 && (
          <div className="text-center py-8">
            <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full">
              <Trophy className="h-5 w-5 mr-2" />
              <span className="font-medium">
                Great work! Keep learning to unlock more achievements!
              </span>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Achievements;
