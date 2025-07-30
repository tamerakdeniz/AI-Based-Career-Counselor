import React, { useEffect, useState } from 'react';
import { CheckCircle, Trophy, Clock } from 'lucide-react';
import axiosInstance from '../api/axiosInstance';

interface LogEntry {
  id: string;
  type: 'milestone' | 'achievement';
  title: string;
  description?: string;
  timestamp: string;
  roadmapTitle?: string;
  achievementIcon?: string;
  achievementColor?: string;
}

interface ActivityLogProps {
  limit?: number;
}

const ActivityLog: React.FC<ActivityLogProps> = ({ limit = 10 }) => {
  const [logEntries, setLogEntries] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchActivityLog = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch recent milestones and achievements
        const [milestonesRes, achievementsRes] = await Promise.all([
          axiosInstance.get('/roadmaps/analytics/recent-milestones'),
          axiosInstance.get('/achievements/user')
        ]);

        const milestones = milestonesRes.data || [];
        const achievements = achievementsRes.data || [];

        // Convert milestones to log entries
        const milestoneEntries: LogEntry[] = milestones
          .filter((m: any) => m.completed_at)
          .map((milestone: any) => ({
            id: `milestone-${milestone.id}`,
            type: 'milestone' as const,
            title: milestone.title,
            description: milestone.description,
            timestamp: milestone.completed_at,
            roadmapTitle: milestone.roadmap?.title
          }));

        // Convert achievements to log entries
        const achievementEntries: LogEntry[] = achievements.map((userAchievement: any) => ({
          id: `achievement-${userAchievement.id}`,
          type: 'achievement' as const,
          title: userAchievement.achievement.title,
          description: userAchievement.achievement.description,
          timestamp: userAchievement.unlocked_at,
          achievementIcon: userAchievement.achievement.icon,
          achievementColor: userAchievement.achievement.color_scheme
        }));

        // Combine and sort by timestamp (most recent first)
        const allEntries = [...milestoneEntries, ...achievementEntries]
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
          .slice(0, limit);

        setLogEntries(allEntries);
      } catch (err) {
        console.error('Failed to load activity log:', err);
        setError('Failed to load recent activity.');
      } finally {
        setLoading(false);
      }
    };

    fetchActivityLog();
  }, [limit]);

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  const formatFullTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4 w-1/3"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="text-center py-4">
          <div className="text-red-500 text-xl mb-2">⚠️</div>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
          <Clock className="h-5 w-5 text-indigo-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
          <p className="text-sm text-gray-600">Your latest milestones and achievements</p>
        </div>
      </div>

      {logEntries.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-400 text-4xl mb-4">📝</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No recent activity</h3>
          <p className="text-gray-500">Complete some milestones or earn achievements to see them here!</p>
        </div>
      ) : (
        <div className="space-y-4 max-h-80 overflow-y-auto">
          {logEntries.map((entry) => (
            <div
              key={entry.id}
              className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {/* Icon */}
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                entry.type === 'milestone' 
                  ? 'bg-green-100' 
                  : 'bg-yellow-100'
              }`}>
                {entry.type === 'milestone' ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <Trophy className="h-4 w-4 text-yellow-600" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {entry.title}
                    </p>
                    {entry.roadmapTitle && (
                      <p className="text-xs text-gray-500 mt-1">
                        in {entry.roadmapTitle}
                      </p>
                    )}
                    {entry.description && (
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                        {entry.description}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end ml-3">
                    <span className="text-xs text-gray-500" title={formatFullTimestamp(entry.timestamp)}>
                      {formatTimestamp(entry.timestamp)}
                    </span>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                      entry.type === 'milestone'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {entry.type === 'milestone' ? 'Milestone' : 'Achievement'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ActivityLog;
