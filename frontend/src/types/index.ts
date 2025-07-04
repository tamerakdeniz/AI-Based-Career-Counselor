export interface Roadmap {
  id: string;
  title: string;
  description: string;
  field: string;
  progress: number;
  nextMilestone: string;
  totalMilestones: number;
  completedMilestones: number;
  estimatedTimeToComplete: string;
  createdAt: string;
  milestones: Milestone[];
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  dueDate?: string;
  resources?: string[];
}

export interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: string;
  roadmapId?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  joinedAt: string;
}