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
  roadmapNodes?: RoadmapNode[];
  // Backend snake_case versions (for compatibility)
  total_milestones?: number;
  completed_milestones?: number;
  next_milestone?: string;
  estimated_time_to_complete?: string;
  created_at?: string;
}

export interface Resource {
  title: string;
  url?: string;
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  dueDate?: string;
  resources?: Resource[];
}

export interface RoadmapNode {
  id: string;
  title: string;
  description: string;
  category: string;
  completed: boolean;
  current: boolean;
  available: boolean;
  skills?: string[];
  estimatedDuration?: string;
  prerequisites?: string[];
  resources?: {
    title: string;
    type: 'article' | 'video' | 'course' | 'book' | 'practice';
    url?: string;
  }[];
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
