import { Roadmap, ChatMessage, User } from '../types';

export const mockUser: User = {
  id: '1',
  name: 'Tamer',
  email: 'tamer@example.com',
  avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
  joinedAt: '2024-01-15'
};

export const mockRoadmaps: Roadmap[] = [
  {
    id: '1',
    title: 'Full Stack Developer',
    description: 'Complete roadmap to becoming a proficient full stack developer',
    field: 'Software Development',
    progress: 45,
    nextMilestone: 'Learn React Advanced Patterns',
    totalMilestones: 12,
    completedMilestones: 5,
    estimatedTimeToComplete: '8 months',
    createdAt: '2024-01-20',
    milestones: [
      {
        id: '1',
        title: 'HTML & CSS Fundamentals',
        description: 'Master the basics of web markup and styling',
        completed: true,
        resources: ['MDN Web Docs', 'CSS Tricks']
      },
      {
        id: '2',
        title: 'JavaScript Essentials',
        description: 'Learn core JavaScript concepts and ES6+ features',
        completed: true,
        resources: ['JavaScript.info', 'You Don\'t Know JS']
      },
      {
        id: '3',
        title: 'React Fundamentals',
        description: 'Build interactive UIs with React',
        completed: true,
        resources: ['React Documentation', 'React Tutorial']
      },
      {
        id: '4',
        title: 'Node.js & Express',
        description: 'Create server-side applications',
        completed: true,
        resources: ['Node.js Docs', 'Express.js Guide']
      },
      {
        id: '5',
        title: 'Database Design',
        description: 'Learn SQL and NoSQL databases',
        completed: true,
        resources: ['PostgreSQL Tutorial', 'MongoDB University']
      },
      {
        id: '6',
        title: 'React Advanced Patterns',
        description: 'Master advanced React concepts and patterns',
        completed: false,
        dueDate: '2024-03-15',
        resources: ['Advanced React Patterns', 'React Hooks in Action']
      }
    ]
  },
  {
    id: '2',
    title: 'PADI Diving Instructor',
    description: 'Path to becoming a certified professional diving instructor',
    field: 'Marine Recreation',
    progress: 25,
    nextMilestone: 'Complete Advanced Open Water',
    totalMilestones: 8,
    completedMilestones: 2,
    estimatedTimeToComplete: '18 months',
    createdAt: '2024-02-01',
    milestones: [
      {
        id: '1',
        title: 'Open Water Diver',
        description: 'Basic scuba diving certification',
        completed: true,
        resources: ['PADI Open Water Manual']
      },
      {
        id: '2',
        title: 'Advanced Open Water',
        description: 'Advanced diving skills and specialties',
        completed: false,
        dueDate: '2024-04-01',
        resources: ['PADI Advanced Manual', 'Dive Planning Guide']
      }
    ]
  },
  {
    id: '3',
    title: 'Digital Marketing Specialist',
    description: 'Comprehensive digital marketing skills development',
    field: 'Marketing',
    progress: 60,
    nextMilestone: 'Google Analytics Certification',
    totalMilestones: 10,
    completedMilestones: 6,
    estimatedTimeToComplete: '4 months',
    createdAt: '2024-01-10',
    milestones: [
      {
        id: '1',
        title: 'Marketing Fundamentals',
        description: 'Core marketing principles and strategies',
        completed: true,
        resources: ['Marketing 101', 'Philip Kotler Books']
      },
      {
        id: '2',
        title: 'Social Media Marketing',
        description: 'Platform-specific marketing strategies',
        completed: true,
        resources: ['Social Media Examiner', 'HubSpot Academy']
      }
    ]
  }
];

export const mockChatMessages: { [roadmapId: string]: ChatMessage[] } = {
  '1': [
    {
      id: '1',
      type: 'ai',
      content: 'Hello! I\'m your AI career mentor for Full Stack Development. I see you\'ve completed 5 out of 12 milestones - great progress! What would you like to work on today?',
      timestamp: '2024-01-25T10:00:00Z',
      roadmapId: '1'
    },
    {
      id: '2',
      type: 'user',
      content: 'I want to learn more about React advanced patterns. Can you help me understand the best practices?',
      timestamp: '2024-01-25T10:01:00Z',
      roadmapId: '1'
    },
    {
      id: '3',
      type: 'ai',
      content: 'Absolutely! React advanced patterns are crucial for building scalable applications. Let\'s start with compound components, render props, and higher-order components. Which pattern interests you most?',
      timestamp: '2024-01-25T10:02:00Z',
      roadmapId: '1'
    },
    {
      id: '4',
      type: 'user',
      content: 'I\'d like to understand compound components better. How do they work?',
      timestamp: '2024-01-25T10:03:00Z',
      roadmapId: '1'
    },
    {
      id: '5',
      type: 'ai',
      content: 'Great choice! Compound components allow you to create flexible, reusable components by combining multiple related components. Think of it like HTML\'s select and option elements - they work together as a cohesive unit.\n\nHere\'s a simple example:\n\n```jsx\nconst Toggle = ({ children }) => {\n  const [on, setOn] = useState(false);\n  return (\n    <div>\n      {React.Children.map(children, child =>\n        React.cloneElement(child, { on, toggle: () => setOn(!on) })\n      )}\n    </div>\n  );\n};\n\nToggle.Button = ({ on, toggle }) => (\n  <button onClick={toggle}>{on ? \'ON\' : \'OFF\'}</button>\n);\n\nToggle.Display = ({ on }) => (\n  <div>{on ? \'The toggle is on\' : \'The toggle is off\'}</div>\n);\n```\n\nThis pattern provides flexibility while maintaining a clean API. Would you like me to show you a more complex example?',
      timestamp: '2024-01-25T10:05:00Z',
      roadmapId: '1'
    }
  ],
  '2': [
    {
      id: '1',
      type: 'ai',
      content: 'Welcome to your diving instructor journey! I\'m here to guide you through the PADI certification process. You\'ve completed your Open Water - congratulations! Ready to dive deeper?',
      timestamp: '2024-02-01T14:00:00Z',
      roadmapId: '2'
    },
    {
      id: '2',
      type: 'user',
      content: 'Yes! I\'m excited about the Advanced Open Water course. What should I expect?',
      timestamp: '2024-02-01T14:01:00Z',
      roadmapId: '2'
    },
    {
      id: '3',
      type: 'ai',
      content: 'Excellent! The Advanced Open Water course will expand your diving skills significantly. You\'ll complete 5 adventure dives including deep diving and underwater navigation as core requirements, plus 3 elective specialty dives.\n\nSome popular electives include:\n• Peak Performance Buoyancy\n• Night Diving\n• Wreck Diving\n• Underwater Photography\n\nWhich specialties interest you most? This will help shape your learning path toward becoming an instructor.',
      timestamp: '2024-02-01T14:03:00Z',
      roadmapId: '2'
    }
  ],
  '3': [
    {
      id: '1',
      type: 'ai',
      content: 'Hello! I\'m your digital marketing mentor. You\'re making fantastic progress - 60% complete! Your next milestone is Google Analytics certification. How are you feeling about data analysis?',
      timestamp: '2024-01-25T16:00:00Z',
      roadmapId: '3'
    },
    {
      id: '2',
      type: 'user',
      content: 'I\'m a bit nervous about Google Analytics. The interface seems overwhelming.',
      timestamp: '2024-01-25T16:01:00Z',
      roadmapId: '3'
    },
    {
      id: '3',
      type: 'ai',
      content: 'That\'s completely normal! Google Analytics can seem complex at first, but I\'ll help you break it down into manageable pieces. Let\'s start with the basics:\n\n1. **Audience** - Who visits your site?\n2. **Acquisition** - How do they find you?\n3. **Behavior** - What do they do on your site?\n4. **Conversions** - Are they taking desired actions?\n\nWe\'ll focus on one section at a time. Which aspect of your website\'s performance are you most curious about?',
      timestamp: '2024-01-25T16:03:00Z',
      roadmapId: '3'
    }
  ]
};