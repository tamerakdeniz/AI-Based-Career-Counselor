import {
  Activity,
  BarChart3,
  BookOpen,
  CheckCircle,
  Clock,
  Target,
  TrendingUp
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import Header from '../components/Header';
import MilestoneChart from '../components/MilestoneChart';
import ActivityLog from '../components/ActivityLog';
import type { Roadmap, User } from '../types';

interface AnalyticsData {
  totalRoadmaps: number;
  totalMilestones: number;
  completedMilestones: number;
  completedRoadmaps: number;
  averageProgress: number;
  joinDate: string;
  daysActive: number;
  milestonesThisWeek: number;
  milestonesThisMonth: number;
  topCategories: Array<{ field: string; count: number }>;
  progressHistory: Array<{ date: string; milestones: number }>;
  completionRate: number;
}

interface UserAchievement {
  id: number;
  achievement: {
    id: number;
    title: string;
    description: string;
    icon: string;
    color_scheme: string;
  };
  unlocked_at: string;
}

interface MilestoneData {
  date: string;
  milestones: number;
}

const Analytics: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
  const [achievements, setAchievements] = useState<UserAchievement[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [milestoneData, setMilestoneData] = useState<MilestoneData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch user data
        const userRes = await axiosInstance.get('/auth/me');
        setUser(userRes.data);

        // Fetch roadmaps
        const roadmapsRes = await axiosInstance.get(`/roadmaps/user/${userRes.data.id}`);
        setRoadmaps(roadmapsRes.data);

        // Fetch achievements
        const achievementsRes = await axiosInstance.get('/achievements/user');
        setAchievements(achievementsRes.data);

        // Fetch milestone completion data
        const milestoneRes = await axiosInstance.get('/roadmaps/analytics/milestones-by-date');
        setMilestoneData(milestoneRes.data);

        // Calculate analytics
        const roadmapsData = roadmapsRes.data;
        const totalRoadmaps = roadmapsData.length;
        const totalMilestones = roadmapsData.reduce((sum: number, roadmap: Roadmap) => 
          sum + (roadmap.total_milestones || roadmap.totalMilestones || 0), 0
        );
        const completedMilestones = roadmapsData.reduce((sum: number, roadmap: Roadmap) => 
          sum + (roadmap.completed_milestones || roadmap.completedMilestones || 0), 0
        );
        const completedRoadmaps = roadmapsData.filter((roadmap: Roadmap) => roadmap.progress === 100).length;
        const averageProgress = totalRoadmaps > 0 
          ? Math.round(roadmapsData.reduce((sum: number, roadmap: Roadmap) => sum + (roadmap.progress || 0), 0) / totalRoadmaps)
          : 0;

        // Calculate days since joining
        const joinDate = new Date(userRes.data.created_at || userRes.data.join_date || Date.now());
        const daysActive = Math.floor((Date.now() - joinDate.getTime()) / (1000 * 60 * 60 * 24));

        // Group roadmaps by field
        const fieldCounts: { [key: string]: number } = {};
        roadmapsData.forEach((roadmap: Roadmap) => {
          const field = roadmap.field || 'Other';
          fieldCounts[field] = (fieldCounts[field] || 0) + 1;
        });
        const topCategories = Object.entries(fieldCounts)
          .map(([field, count]) => ({ field, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);

        const analyticsData: AnalyticsData = {
          totalRoadmaps,
          totalMilestones,
          completedMilestones,
          completedRoadmaps,
          averageProgress,
          joinDate: joinDate.toLocaleDateString(),
          daysActive: Math.max(daysActive, 1),
          milestonesThisWeek: completedMilestones, // Simplified for now
          milestonesThisMonth: completedMilestones, // Simplified for now
          topCategories,
          progressHistory: [], // Would need backend support for historical data
          completionRate: totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0
        };

        setAnalytics(analyticsData);
      } catch (err) {
        console.error('Failed to load analytics data:', err);
        setError('Failed to load analytics data.');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!analytics) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        showBackButton
        onBack={() => navigate('/dashboard')}
        title="Learning Analytics"
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-teal-600 rounded-2xl p-6 sm:p-8 text-white">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold">Learning Analytics</h1>
                <p className="text-blue-100">Insights into your learning journey</p>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
              <div className="text-center">
                <div className="text-2xl font-bold">{analytics.daysActive}</div>
                <div className="text-sm text-blue-100">Days Active</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{analytics.completedMilestones}</div>
                <div className="text-sm text-blue-100">Milestones</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{achievements.length}</div>
                <div className="text-sm text-blue-100">Achievements</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{analytics.averageProgress}%</div>
                <div className="text-sm text-blue-100">Avg Progress</div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Target className="h-5 w-5 text-blue-600" />
              </div>
              <span className="text-sm text-gray-500">Total</span>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">{analytics.totalRoadmaps}</div>
            <div className="text-sm text-gray-600">Active Roadmaps</div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <span className="text-sm text-gray-500">Completed</span>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">{analytics.completedRoadmaps}</div>
            <div className="text-sm text-gray-600">Finished Roadmaps</div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Activity className="h-5 w-5 text-purple-600" />
              </div>
              <span className="text-sm text-gray-500">Rate</span>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">{analytics.completionRate}%</div>
            <div className="text-sm text-gray-600">Completion Rate</div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Clock className="h-5 w-5 text-orange-600" />
              </div>
              <span className="text-sm text-gray-500">Since</span>
            </div>
            <div className="text-lg font-bold text-gray-900 mb-1">{analytics.joinDate}</div>
            <div className="text-sm text-gray-600">Member Since</div>
          </div>
        </div>

        {/* Milestone Completion Chart */}
        <div className="mb-8">
          <MilestoneChart data={milestoneData} chartType="line" />
        </div>

        {/* Milestone Progress */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Milestone Progress</h3>
                <p className="text-sm text-gray-600">Your learning milestones completion</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Completed Milestones</span>
                <span className="font-medium">{analytics.completedMilestones} / {analytics.totalMilestones}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${analytics.completionRate}%` }}
                />
              </div>
              <div className="text-center text-sm text-gray-500">
                {analytics.completionRate}% Complete
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Learning Fields</h3>
                <p className="text-sm text-gray-600">Areas you're exploring</p>
              </div>
            </div>
            
            <div className="space-y-3">
              {analytics.topCategories.length > 0 ? (
                analytics.topCategories.map((category, index) => (
                  <div key={category.field} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        index === 0 ? 'bg-blue-500' :
                        index === 1 ? 'bg-green-500' :
                        index === 2 ? 'bg-purple-500' :
                        index === 3 ? 'bg-orange-500' : 'bg-gray-400'
                      }`} />
                      <span className="text-sm font-medium text-gray-900">{category.field}</span>
                    </div>
                    <span className="text-sm text-gray-600">{category.count} roadmap{category.count !== 1 ? 's' : ''}</span>
                  </div>
                ))
              ) : (
                <div className="text-center py-4">
                  <div className="text-gray-400 mb-2">📚</div>
                  <p className="text-sm text-gray-500">No learning fields yet</p>
                  <p className="text-xs text-gray-400">Create a roadmap to see your learning areas</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Activity Log */}
        <ActivityLog limit={15} />
      </main>
    </div>
  );
};

export default Analytics;
