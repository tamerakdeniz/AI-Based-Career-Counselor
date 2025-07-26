import {
  ArrowRight,
  CheckCircle,
  Clock,
  MapPin,
  MessageCircle
} from 'lucide-react';
import React from 'react';
import { Link } from 'react-router-dom';
import { Roadmap } from '../types';

interface RoadmapCardProps {
  roadmap: Roadmap;
}

const RoadmapCard: React.FC<RoadmapCardProps> = ({ roadmap }) => {
  const getFieldColor = (field: string) => {
    switch (field) {
      case 'Software Development':
        return 'bg-blue-100 text-blue-700';
      case 'Marine Recreation':
        return 'bg-teal-100 text-teal-700';
      case 'Marketing':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 75) return 'bg-green-500';
    if (progress >= 50) return 'bg-blue-500';
    if (progress >= 25) return 'bg-yellow-500';
    return 'bg-gray-300';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 p-6 border border-gray-100">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {roadmap.short_title || roadmap.title}
          </h3>
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getFieldColor(
              roadmap.field
            )}`}
          >
            {roadmap.field}
          </span>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-gray-900">
            {roadmap.progress}%
          </div>
          <div className="text-xs text-gray-500">Complete</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>Progress</span>
          <span>
            {roadmap.completedMilestones}/{roadmap.totalMilestones} milestones
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(
              roadmap.progress
            )}`}
            style={{ width: `${roadmap.progress}%` }}
          />
        </div>
      </div>

      {/* Description */}
      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
        {roadmap.short_description || roadmap.description}
      </p>

      {/* Next Milestone or Completion Status */}
      <div className="flex items-center space-x-2 mb-4 p-3 bg-gray-50 rounded-lg">
        {roadmap.progress === 100 ? (
          <>
            <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-xs text-green-600 uppercase tracking-wide font-medium">
                Status
              </p>
              <p className="text-sm font-medium text-green-700">
                Roadmap Completed
              </p>
            </div>
          </>
        ) : (
          <>
            <MapPin className="h-4 w-4 text-gray-500 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-xs text-gray-500 uppercase tracking-wide">
                Next Milestone
              </p>
              <p className="text-sm font-medium text-gray-900">
                {roadmap.nextMilestone}
              </p>
            </div>
          </>
        )}
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between text-sm text-gray-500 mb-6">
        <div className="flex items-center space-x-1">
          <Clock className="h-4 w-4" />
          <span>{roadmap.estimatedTimeToComplete}</span>
        </div>
        <div className="flex items-center space-x-1">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <span>{roadmap.completedMilestones} completed</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex space-x-3">
        <Link
          to={`/chat/${roadmap.id}`}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
        >
          <MessageCircle className="h-4 w-4" />
          <span>Open Chat</span>
        </Link>
        <Link
          to={`/roadmap/${roadmap.id}`}
          className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
        >
          <span>View Roadmap</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
};

export default RoadmapCard;
