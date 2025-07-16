import React from 'react';
import { CheckCircle, Circle, Clock, X, ChevronRight } from 'lucide-react';
import { Roadmap } from '../types';

interface RoadmapSidebarProps {
  roadmap: Roadmap;
  isOpen: boolean;
  onClose: () => void;
}

const RoadmapSidebar: React.FC<RoadmapSidebarProps> = ({ roadmap, isOpen, onClose }) => {
  const getProgressColor = (progress: number) => {
    if (progress >= 75) return 'bg-green-500';
    if (progress >= 50) return 'bg-blue-500';
    if (progress >= 25) return 'bg-yellow-500';
    return 'bg-gray-300';
  };

  return (
    <>
      {/* Overlay for mobile/tablet - only show when sidebar is open and on smaller screens */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 xl:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed right-0 top-0 h-full w-80 bg-white shadow-lg transform transition-transform duration-300 z-50
        xl:relative xl:translate-x-0 xl:shadow-none xl:border-l xl:border-gray-200 xl:z-auto
        ${isOpen ? 'translate-x-0' : 'translate-x-full xl:translate-x-0'}
      `}>
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 flex-shrink-0">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Roadmap</h2>
              <button
                onClick={onClose}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors xl:hidden"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {/* Roadmap Info */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-2">{roadmap.title}</h3>
              <p className="text-sm text-gray-600 mb-4">{roadmap.description}</p>
              
              {/* Progress */}
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Overall Progress</span>
                  <span>{roadmap.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(roadmap.progress)}`}
                    style={{ width: `${roadmap.progress}%` }}
                  />
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="font-semibold text-gray-900">{roadmap.completedMilestones}</div>
                  <div className="text-gray-500">Completed</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="font-semibold text-gray-900">{roadmap.totalMilestones > 0 ? roadmap.totalMilestones - roadmap.completedMilestones : 0}</div>
                  <div className="text-gray-500">Remaining</div>
                </div>
              </div>
            </div>

            {/* Milestones */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Milestones</h4>
              <div className="space-y-3">
                {roadmap.milestones.map((milestone, index) => (
                  <div key={milestone.id} className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      {milestone.completed ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <Circle className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className={`text-sm font-medium ${
                        milestone.completed ? 'text-gray-900' : 'text-gray-700'
                      }`}>
                        {milestone.title}
                      </h5>
                      <p className="text-xs text-gray-500 mt-1">
                        {milestone.description}
                      </p>
                      {milestone.dueDate && !milestone.completed && (
                        <div className="flex items-center space-x-1 mt-2">
                          <Clock className="h-3 w-3 text-gray-400" />
                          <span className="text-xs text-gray-500">
                            Due: {new Date(milestone.dueDate).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                      {milestone.resources && milestone.resources.length > 0 && (
                        <div className="mt-2">
                          <button className="text-xs text-blue-600 hover:text-blue-700 flex items-center space-x-1">
                            <span>View Resources</span>
                            <ChevronRight className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Next Milestone Highlight */}
            {roadmap.nextMilestone && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-900 mb-1">Up Next</h4>
                <p className="text-sm text-blue-700">{roadmap.nextMilestone}</p>
                <div className="mt-2 text-xs text-blue-600">
                  Est. time: {roadmap.estimatedTimeToComplete}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default RoadmapSidebar;