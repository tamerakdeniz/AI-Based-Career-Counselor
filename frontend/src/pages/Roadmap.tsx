import {
  BookOpen,
  CheckCircle,
  Circle,
  Clock,
  ExternalLink,
  Star
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../components/Header';
import axiosInstance from '../api/axiosInstance';
import type { RoadmapNode, Roadmap, Milestone } from '../types';

const Roadmap: React.FC = () => {
  const { roadmapId } = useParams<{ roadmapId: string }>();
  const navigate = useNavigate();
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [selectedNode, setSelectedNode] = useState<RoadmapNode | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRoadmap = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axiosInstance.get(`/roadmaps/${roadmapId}`);
        // Map backend milestones to roadmapNodes for UI compatibility
        const backendRoadmap = res.data;
        // If backend does not provide roadmapNodes, create them from milestones
        let roadmapNodes: RoadmapNode[] = [];
        if (backendRoadmap.milestones) {
          roadmapNodes = backendRoadmap.milestones.map((milestone: Milestone, idx: number) => ({
            id: milestone.id,
            title: milestone.title,
            description: milestone.description,
            category: '', // No category in backend, leave blank or infer
            completed: milestone.completed,
            current: !milestone.completed &&
              (idx === 0 || (backendRoadmap.milestones[idx - 1]?.completed)),
            available: !milestone.completed &&
              (idx === 0 || (backendRoadmap.milestones[idx - 1]?.completed)),
            skills: [], // No skills in backend, leave empty
            estimatedDuration: '', // No duration in backend, leave blank
            prerequisites: [], // No prerequisites in backend, leave empty
            resources: (milestone.resources || []).map((r: string) => ({ title: r, type: 'article' })),
          }));
        }
        setRoadmap({ ...backendRoadmap, roadmapNodes });
      } catch (err: any) {
        setError('Failed to load roadmap.');
      } finally {
        setLoading(false);
      }
    };
    if (roadmapId) fetchRoadmap();
  }, [roadmapId]);

  const handleBack = () => {
    navigate('/dashboard');
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  if (error || !roadmap) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Roadmap Not Found
          </h1>
          <p className="text-gray-600 mb-4">
            {error || "The roadmap you're looking for doesn't exist."}
          </p>
          <button
            onClick={handleBack}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const getNodeStatusColor = (node: RoadmapNode) => {
    if (node.completed) return 'bg-green-500 border-green-600 text-white';
    if (node.current) return 'bg-blue-500 border-blue-600 text-white';
    if (node.available)
      return 'bg-white border-gray-300 text-gray-700 hover:border-blue-400';
    return 'bg-gray-100 border-gray-200 text-gray-400';
  };

  const getNodeIcon = (node: RoadmapNode) => {
    if (node.completed) return <CheckCircle className="h-5 w-5" />;
    if (node.current) return <Star className="h-5 w-5" />;
    if (node.available) return <Circle className="h-5 w-5" />;
    return <Clock className="h-5 w-5" />;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        showBackButton
        onBack={handleBack}
        title={`${roadmap.title} Roadmap`}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Roadmap Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-4 lg:mb-0">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {roadmap.title}
              </h1>
              <p className="text-gray-600 mb-4">{roadmap.description}</p>
              <div className="flex items-center space-x-6 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-gray-600">
                    Completed ({roadmap.completedMilestones})
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-600">Current</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                  <span className="text-gray-600">Available</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-gray-100 rounded-full"></div>
                  <span className="text-gray-600">Locked</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {roadmap.progress}%
              </div>
              <div className="text-sm text-gray-500">Overall Progress</div>
              <div className="w-32 bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${roadmap.progress}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col xl:flex-row gap-8">
          {/* Roadmap Visualization */}
          <div className="flex-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Learning Path
              </h2>

              {/* Roadmap Nodes */}
              <div className="relative">
                {/* Vertical connecting line */}
                <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-gray-200"></div>

                <div className="space-y-8">
                  {roadmap.roadmapNodes?.map((node, index) => (
                    <div key={node.id} className="relative flex items-start">
                      {/* Node Circle */}
                      <button
                        onClick={() => setSelectedNode(node)}
                        className={`relative z-10 w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${getNodeStatusColor(
                          node
                        )} ${
                          node.available || node.completed || node.current
                            ? 'cursor-pointer hover:scale-110'
                            : 'cursor-not-allowed'
                        }`}
                      >
                        {getNodeIcon(node)}
                      </button>

                      {/* Node Content */}
                      <div className="ml-6 flex-1">
                        <div
                          className={`p-4 rounded-lg border transition-all duration-200 ${
                            selectedNode?.id === node.id
                              ? 'border-blue-300 bg-blue-50'
                              : 'border-gray-200 bg-white hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3
                                className={`font-semibold mb-1 ${
                                  node.available ||
                                  node.completed ||
                                  node.current
                                    ? 'text-gray-900'
                                    : 'text-gray-400'
                                }`}
                              >
                                {node.title}
                              </h3>
                              <p
                                className={`text-sm mb-2 ${
                                  node.available ||
                                  node.completed ||
                                  node.current
                                    ? 'text-gray-600'
                                    : 'text-gray-400'
                                }`}
                              >
                                {node.description}
                              </p>

                              {/* Skills */}
                              {node.skills && node.skills.length > 0 && (
                                <div className="flex flex-wrap gap-1 mb-2">
                                  {node.skills.map((skill, skillIndex) => (
                                    <span
                                      key={skillIndex}
                                      className={`px-2 py-1 text-xs rounded-full ${
                                        node.completed
                                          ? 'bg-green-100 text-green-700'
                                          : node.current
                                          ? 'bg-blue-100 text-blue-700'
                                          : node.available
                                          ? 'bg-gray-100 text-gray-600'
                                          : 'bg-gray-50 text-gray-400'
                                      }`}
                                    >
                                      {skill}
                                    </span>
                                  ))}
                                </div>
                              )}

                              {/* Duration */}
                              {node.estimatedDuration && (
                                <div className="flex items-center space-x-1 text-xs text-gray-500">
                                  <Clock className="h-3 w-3" />
                                  <span>{node.estimatedDuration}</span>
                                </div>
                              )}
                            </div>

                            {/* Status Badge */}
                            <div className="ml-4">
                              {node.completed && (
                                <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                                  Completed
                                </span>
                              )}
                              {node.current && (
                                <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                                  Current
                                </span>
                              )}
                              {!node.available &&
                                !node.completed &&
                                !node.current && (
                                  <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-gray-100 text-gray-500 rounded-full">
                                    Locked
                                  </span>
                                )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Node Details Sidebar */}
          <div className="xl:w-80">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-8">
              {selectedNode ? (
                <div>
                  <div className="flex items-center space-x-3 mb-4">
                    <div
                      className={`w-10 h-10 rounded-full border-2 flex items-center justify-center ${getNodeStatusColor(
                        selectedNode
                      )}`}
                    >
                      {getNodeIcon(selectedNode)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {selectedNode.title}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {selectedNode.category}
                      </p>
                    </div>
                  </div>

                  <p className="text-gray-600 mb-4">
                    {selectedNode.description}
                  </p>

                  {/* Skills */}
                  {selectedNode.skills && selectedNode.skills.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-900 mb-2">
                        Skills You'll Learn
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedNode.skills.map((skill, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 text-sm bg-blue-50 text-blue-700 rounded-full"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Resources */}
                  {selectedNode.resources &&
                    selectedNode.resources.length > 0 && (
                      <div className="mb-4">
                        <h4 className="font-medium text-gray-900 mb-2">
                          Learning Resources
                        </h4>
                        <div className="space-y-2">
                          {selectedNode.resources.map((resource, index) => (
                            <div
                              key={index}
                              className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg"
                            >
                              <BookOpen className="h-4 w-4 text-gray-500" />
                              <span className="text-sm text-gray-700 flex-1">
                                {resource.title}
                              </span>
                              <button className="text-blue-600 hover:text-blue-700">
                                <ExternalLink className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  {/* Duration and Prerequisites */}
                  <div className="space-y-3 text-sm">
                    {selectedNode.estimatedDuration && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Duration:</span>
                        <span className="font-medium text-gray-900">
                          {selectedNode.estimatedDuration}
                        </span>
                      </div>
                    )}
                    {selectedNode.prerequisites &&
                      selectedNode.prerequisites.length > 0 && (
                        <div>
                          <span className="text-gray-600 block mb-1">
                            Prerequisites:
                          </span>
                          <div className="space-y-1">
                            {selectedNode.prerequisites.map((prereq, index) => (
                              <span
                                key={index}
                                className="block text-xs bg-yellow-50 text-yellow-700 px-2 py-1 rounded"
                              >
                                {prereq}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                  </div>

                  {/* Action Button */}
                  <div className="mt-6">
                    {selectedNode.completed ? (
                      <button className="w-full bg-green-100 text-green-700 py-2 px-4 rounded-lg font-medium">
                        ✓ Completed
                      </button>
                    ) : selectedNode.current ? (
                      <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors">
                        Continue Learning
                      </button>
                    ) : selectedNode.available ? (
                      <button className="w-full bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg font-medium transition-colors">
                        Start Learning
                      </button>
                    ) : (
                      <button className="w-full bg-gray-100 text-gray-400 py-2 px-4 rounded-lg font-medium cursor-not-allowed">
                        Locked
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="font-medium text-gray-900 mb-2">
                    Select a Node
                  </h3>
                  <p className="text-sm text-gray-500">
                    Click on any node in the roadmap to see detailed
                    information, resources, and learning materials.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Roadmap;
