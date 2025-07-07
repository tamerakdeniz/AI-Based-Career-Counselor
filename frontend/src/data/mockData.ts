import { ChatMessage, Roadmap, User } from '../types';

export const mockUser: User = {
  id: '1',
  name: 'Tamer',
  email: 'tamer@example.com',
  avatar:
    'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
  joinedAt: '2024-01-15'
};

export const mockRoadmaps: Roadmap[] = [
  {
    id: '1',
    title: 'Full Stack Developer',
    description:
      'Complete roadmap to becoming a proficient full stack developer',
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
        resources: ['JavaScript.info', "You Don't Know JS"]
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
    ],
    roadmapNodes: [
      {
        id: 'node-1',
        title: 'Web Fundamentals',
        description: 'Learn the building blocks of web development',
        category: 'Frontend Basics',
        completed: true,
        current: false,
        available: true,
        skills: ['HTML5', 'CSS3', 'Responsive Design', 'Web Accessibility'],
        estimatedDuration: '2-3 weeks',
        resources: [
          { title: 'MDN Web Docs - HTML', type: 'article' },
          { title: 'CSS Grid Complete Guide', type: 'article' },
          { title: 'Responsive Web Design Course', type: 'course' }
        ]
      },
      {
        id: 'node-2',
        title: 'JavaScript Fundamentals',
        description: 'Master core JavaScript concepts and modern ES6+ features',
        category: 'Programming',
        completed: true,
        current: false,
        available: true,
        skills: ['ES6+', 'DOM Manipulation', 'Async/Await', 'Modules'],
        estimatedDuration: '4-5 weeks',
        prerequisites: ['Web Fundamentals'],
        resources: [
          { title: 'JavaScript.info', type: 'course' },
          { title: "You Don't Know JS", type: 'book' },
          { title: 'JavaScript30 Challenge', type: 'practice' }
        ]
      },
      {
        id: 'node-3',
        title: 'Version Control',
        description: 'Learn Git and GitHub for code management',
        category: 'Tools',
        completed: true,
        current: false,
        available: true,
        skills: ['Git', 'GitHub', 'Branching', 'Collaboration'],
        estimatedDuration: '1-2 weeks',
        resources: [
          { title: 'Pro Git Book', type: 'book' },
          { title: 'Git Branching Interactive', type: 'practice' },
          { title: 'GitHub Flow Guide', type: 'article' }
        ]
      },
      {
        id: 'node-4',
        title: 'React Fundamentals',
        description: 'Build interactive user interfaces with React',
        category: 'Frontend Framework',
        completed: true,
        current: false,
        available: true,
        skills: ['Components', 'JSX', 'Props', 'State', 'Event Handling'],
        estimatedDuration: '3-4 weeks',
        prerequisites: ['JavaScript Fundamentals'],
        resources: [
          { title: 'React Official Tutorial', type: 'course' },
          { title: 'React Hooks Handbook', type: 'article' },
          { title: 'Build 10 React Projects', type: 'practice' }
        ]
      },
      {
        id: 'node-5',
        title: 'State Management',
        description: 'Learn advanced state management patterns',
        category: 'Frontend Advanced',
        completed: true,
        current: false,
        available: true,
        skills: ['Context API', 'Redux', 'Zustand', 'State Patterns'],
        estimatedDuration: '2-3 weeks',
        prerequisites: ['React Fundamentals'],
        resources: [
          { title: 'Redux Toolkit Guide', type: 'course' },
          { title: 'Context vs Redux', type: 'article' },
          { title: 'State Management Patterns', type: 'video' }
        ]
      },
      {
        id: 'node-6',
        title: 'React Advanced Patterns',
        description: 'Master advanced React concepts and optimization',
        category: 'Frontend Advanced',
        completed: false,
        current: true,
        available: true,
        skills: [
          'Higher-Order Components',
          'Render Props',
          'Compound Components',
          'Performance'
        ],
        estimatedDuration: '3-4 weeks',
        prerequisites: ['React Fundamentals', 'State Management'],
        resources: [
          { title: 'Advanced React Patterns', type: 'course' },
          { title: 'React Performance Guide', type: 'article' },
          { title: 'Component Design Patterns', type: 'video' }
        ]
      },
      {
        id: 'node-7',
        title: 'Node.js & Express',
        description: 'Build server-side applications with Node.js',
        category: 'Backend',
        completed: false,
        current: false,
        available: true,
        skills: ['Node.js', 'Express.js', 'Middleware', 'REST APIs'],
        estimatedDuration: '4-5 weeks',
        prerequisites: ['JavaScript Fundamentals'],
        resources: [
          { title: 'Node.js Complete Guide', type: 'course' },
          { title: 'Express.js Documentation', type: 'article' },
          { title: 'Build REST API Project', type: 'practice' }
        ]
      },
      {
        id: 'node-8',
        title: 'Database Design',
        description: 'Learn database concepts and implementation',
        category: 'Backend',
        completed: false,
        current: false,
        available: true,
        skills: ['SQL', 'PostgreSQL', 'MongoDB', 'Database Design'],
        estimatedDuration: '3-4 weeks',
        prerequisites: ['Node.js & Express'],
        resources: [
          { title: 'PostgreSQL Tutorial', type: 'course' },
          { title: 'Database Design Principles', type: 'article' },
          { title: 'MongoDB University', type: 'course' }
        ]
      },
      {
        id: 'node-9',
        title: 'Authentication & Security',
        description: 'Implement secure authentication systems',
        category: 'Backend',
        completed: false,
        current: false,
        available: false,
        skills: ['JWT', 'OAuth', 'Password Hashing', 'Security Best Practices'],
        estimatedDuration: '2-3 weeks',
        prerequisites: ['Database Design'],
        resources: [
          { title: 'Web Security Fundamentals', type: 'course' },
          { title: 'JWT Authentication Guide', type: 'article' },
          { title: 'OAuth 2.0 Explained', type: 'video' }
        ]
      },
      {
        id: 'node-10',
        title: 'Testing',
        description: 'Write comprehensive tests for your applications',
        category: 'Quality Assurance',
        completed: false,
        current: false,
        available: false,
        skills: [
          'Jest',
          'React Testing Library',
          'Integration Testing',
          'E2E Testing'
        ],
        estimatedDuration: '3-4 weeks',
        prerequisites: ['React Advanced Patterns', 'Node.js & Express'],
        resources: [
          { title: 'Testing JavaScript Applications', type: 'course' },
          { title: 'React Testing Best Practices', type: 'article' },
          { title: 'Cypress E2E Testing', type: 'practice' }
        ]
      },
      {
        id: 'node-11',
        title: 'DevOps & Deployment',
        description: 'Deploy and maintain applications in production',
        category: 'DevOps',
        completed: false,
        current: false,
        available: false,
        skills: ['Docker', 'CI/CD', 'AWS/Vercel', 'Monitoring'],
        estimatedDuration: '3-4 weeks',
        prerequisites: ['Testing'],
        resources: [
          { title: 'Docker for Developers', type: 'course' },
          { title: 'CI/CD with GitHub Actions', type: 'article' },
          { title: 'AWS Deployment Guide', type: 'video' }
        ]
      },
      {
        id: 'node-12',
        title: 'Full Stack Project',
        description: 'Build a complete full stack application',
        category: 'Capstone',
        completed: false,
        current: false,
        available: false,
        skills: [
          'Project Planning',
          'Full Stack Integration',
          'Code Review',
          'Documentation'
        ],
        estimatedDuration: '4-6 weeks',
        prerequisites: ['DevOps & Deployment'],
        resources: [
          { title: 'Full Stack Project Ideas', type: 'article' },
          { title: 'Code Review Best Practices', type: 'video' },
          { title: 'Technical Documentation Guide', type: 'article' }
        ]
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
    ],
    roadmapNodes: [
      {
        id: 'dive-1',
        title: 'Open Water Diver',
        description: 'Your first step into the underwater world',
        category: 'Basic Certification',
        completed: true,
        current: false,
        available: true,
        skills: [
          'Basic Diving Skills',
          'Safety Procedures',
          'Equipment Use',
          'Underwater Communication'
        ],
        estimatedDuration: '3-4 days',
        resources: [
          { title: 'PADI Open Water Manual', type: 'book' },
          { title: 'Diving Safety Video', type: 'video' },
          { title: 'Equipment Familiarization', type: 'practice' }
        ]
      },
      {
        id: 'dive-2',
        title: 'Advanced Open Water',
        description: 'Expand your diving skills and experience',
        category: 'Advanced Certification',
        completed: false,
        current: true,
        available: true,
        skills: [
          'Deep Diving',
          'Navigation',
          'Night Diving',
          'Peak Performance Buoyancy'
        ],
        estimatedDuration: '2-3 days',
        prerequisites: ['Open Water Diver'],
        resources: [
          { title: 'PADI Advanced Manual', type: 'book' },
          { title: 'Underwater Navigation Course', type: 'course' },
          { title: 'Deep Diving Safety', type: 'article' }
        ]
      },
      {
        id: 'dive-3',
        title: 'Rescue Diver',
        description: 'Learn to prevent and manage diving emergencies',
        category: 'Safety Certification',
        completed: false,
        current: false,
        available: true,
        skills: [
          'Emergency Response',
          'Rescue Techniques',
          'Stress Management',
          'Accident Prevention'
        ],
        estimatedDuration: '3-4 days',
        prerequisites: ['Advanced Open Water'],
        resources: [
          { title: 'PADI Rescue Diver Manual', type: 'book' },
          { title: 'Emergency First Aid Course', type: 'course' },
          { title: 'Rescue Scenarios Practice', type: 'practice' }
        ]
      },
      {
        id: 'dive-4',
        title: 'Divemaster',
        description: 'Begin your professional diving career',
        category: 'Professional Level',
        completed: false,
        current: false,
        available: false,
        skills: [
          'Leadership',
          'Dive Planning',
          'Student Assistance',
          'Professional Standards'
        ],
        estimatedDuration: '4-6 weeks',
        prerequisites: ['Rescue Diver'],
        resources: [
          { title: 'PADI Divemaster Manual', type: 'book' },
          { title: 'Leadership Skills Workshop', type: 'course' },
          { title: 'Professional Development', type: 'article' }
        ]
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
    ],
    roadmapNodes: [
      {
        id: 'marketing-1',
        title: 'Marketing Fundamentals',
        description: 'Learn core marketing principles and consumer behavior',
        category: 'Foundation',
        completed: true,
        current: false,
        available: true,
        skills: [
          'Market Research',
          'Consumer Psychology',
          'Brand Strategy',
          'Marketing Mix'
        ],
        estimatedDuration: '2-3 weeks',
        resources: [
          { title: 'Marketing Principles by Kotler', type: 'book' },
          { title: 'Consumer Behavior Course', type: 'course' },
          { title: 'Brand Strategy Workshop', type: 'practice' }
        ]
      },
      {
        id: 'marketing-2',
        title: 'Digital Marketing Strategy',
        description: 'Develop comprehensive digital marketing strategies',
        category: 'Strategy',
        completed: true,
        current: false,
        available: true,
        skills: [
          'Digital Strategy',
          'Customer Journey',
          'Channel Selection',
          'Budget Planning'
        ],
        estimatedDuration: '2-3 weeks',
        prerequisites: ['Marketing Fundamentals'],
        resources: [
          { title: 'Digital Marketing Strategy Guide', type: 'course' },
          { title: 'Customer Journey Mapping', type: 'article' },
          { title: 'Marketing Budget Planning', type: 'practice' }
        ]
      },
      {
        id: 'marketing-3',
        title: 'Content Marketing',
        description: 'Create engaging content that drives results',
        category: 'Content',
        completed: true,
        current: false,
        available: true,
        skills: [
          'Content Strategy',
          'Copywriting',
          'Visual Design',
          'Content Calendar'
        ],
        estimatedDuration: '3-4 weeks',
        prerequisites: ['Digital Marketing Strategy'],
        resources: [
          { title: 'Content Marketing Masterclass', type: 'course' },
          { title: 'Copywriting Fundamentals', type: 'article' },
          { title: 'Content Creation Tools', type: 'practice' }
        ]
      },
      {
        id: 'marketing-4',
        title: 'Social Media Marketing',
        description: 'Master social media platforms and engagement',
        category: 'Social Media',
        completed: true,
        current: false,
        available: true,
        skills: [
          'Platform Strategy',
          'Community Management',
          'Social Advertising',
          'Influencer Marketing'
        ],
        estimatedDuration: '3-4 weeks',
        prerequisites: ['Content Marketing'],
        resources: [
          { title: 'Social Media Marketing Course', type: 'course' },
          { title: 'Platform Best Practices', type: 'article' },
          { title: 'Social Media Campaign Project', type: 'practice' }
        ]
      },
      {
        id: 'marketing-5',
        title: 'Search Engine Optimization',
        description: 'Optimize websites for search engines',
        category: 'SEO',
        completed: true,
        current: false,
        available: true,
        skills: [
          'Keyword Research',
          'On-Page SEO',
          'Technical SEO',
          'Link Building'
        ],
        estimatedDuration: '4-5 weeks',
        prerequisites: ['Content Marketing'],
        resources: [
          { title: 'SEO Complete Guide', type: 'course' },
          { title: 'Google SEO Starter Guide', type: 'article' },
          { title: 'SEO Audit Practice', type: 'practice' }
        ]
      },
      {
        id: 'marketing-6',
        title: 'Pay-Per-Click Advertising',
        description: 'Create and manage effective PPC campaigns',
        category: 'Paid Advertising',
        completed: true,
        current: false,
        available: true,
        skills: [
          'Google Ads',
          'Facebook Ads',
          'Campaign Optimization',
          'Bid Management'
        ],
        estimatedDuration: '3-4 weeks',
        prerequisites: ['Digital Marketing Strategy'],
        resources: [
          { title: 'Google Ads Certification', type: 'course' },
          { title: 'Facebook Ads Manager Guide', type: 'article' },
          { title: 'PPC Campaign Project', type: 'practice' }
        ]
      },
      {
        id: 'marketing-7',
        title: 'Analytics & Data Analysis',
        description: 'Measure and analyze marketing performance',
        category: 'Analytics',
        completed: false,
        current: true,
        available: true,
        skills: [
          'Google Analytics',
          'Data Visualization',
          'KPI Tracking',
          'Report Creation'
        ],
        estimatedDuration: '3-4 weeks',
        prerequisites: ['SEO', 'PPC Advertising'],
        resources: [
          { title: 'Google Analytics Certification', type: 'course' },
          { title: 'Data Analysis for Marketers', type: 'article' },
          { title: 'Dashboard Creation Practice', type: 'practice' }
        ]
      },
      {
        id: 'marketing-8',
        title: 'Email Marketing',
        description: 'Build and nurture email subscriber relationships',
        category: 'Email',
        completed: false,
        current: false,
        available: true,
        skills: ['Email Strategy', 'Automation', 'Segmentation', 'A/B Testing'],
        estimatedDuration: '2-3 weeks',
        prerequisites: ['Analytics & Data Analysis'],
        resources: [
          { title: 'Email Marketing Mastery', type: 'course' },
          { title: 'Automation Best Practices', type: 'article' },
          { title: 'Email Campaign Project', type: 'practice' }
        ]
      },
      {
        id: 'marketing-9',
        title: 'Marketing Automation',
        description: 'Implement automated marketing workflows',
        category: 'Automation',
        completed: false,
        current: false,
        available: false,
        skills: [
          'Workflow Design',
          'Lead Scoring',
          'CRM Integration',
          'Personalization'
        ],
        estimatedDuration: '3-4 weeks',
        prerequisites: ['Email Marketing'],
        resources: [
          { title: 'Marketing Automation Guide', type: 'course' },
          { title: 'CRM Integration Tutorial', type: 'article' },
          { title: 'Automation Workflow Project', type: 'practice' }
        ]
      },
      {
        id: 'marketing-10',
        title: 'Digital Marketing Campaign',
        description: 'Plan and execute a comprehensive marketing campaign',
        category: 'Capstone',
        completed: false,
        current: false,
        available: false,
        skills: [
          'Campaign Planning',
          'Multi-Channel Integration',
          'Performance Optimization',
          'ROI Analysis'
        ],
        estimatedDuration: '4-6 weeks',
        prerequisites: ['Marketing Automation'],
        resources: [
          { title: 'Campaign Planning Template', type: 'article' },
          { title: 'Multi-Channel Strategy', type: 'video' },
          { title: 'Full Campaign Project', type: 'practice' }
        ]
      }
    ]
  }
];

export const mockChatMessages: { [roadmapId: string]: ChatMessage[] } = {
  '1': [
    {
      id: '1',
      type: 'ai',
      content:
        "Hello! I'm your AI career mentor for Full Stack Development. I see you've completed 5 out of 12 milestones - great progress! What would you like to work on today?",
      timestamp: '2024-01-25T10:00:00Z',
      roadmapId: '1'
    },
    {
      id: '2',
      type: 'user',
      content:
        'I want to learn more about React advanced patterns. Can you help me understand the best practices?',
      timestamp: '2024-01-25T10:01:00Z',
      roadmapId: '1'
    },
    {
      id: '3',
      type: 'ai',
      content:
        "Absolutely! React advanced patterns are crucial for building scalable applications. Let's start with compound components, render props, and higher-order components. Which pattern interests you most?",
      timestamp: '2024-01-25T10:02:00Z',
      roadmapId: '1'
    },
    {
      id: '4',
      type: 'user',
      content:
        "I'd like to understand compound components better. How do they work?",
      timestamp: '2024-01-25T10:03:00Z',
      roadmapId: '1'
    },
    {
      id: '5',
      type: 'ai',
      content:
        "Great choice! Compound components allow you to create flexible, reusable components by combining multiple related components. Think of it like HTML's select and option elements - they work together as a cohesive unit.\n\nHere's a simple example:\n\n```jsx\nconst Toggle = ({ children }) => {\n  const [on, setOn] = useState(false);\n  return (\n    <div>\n      {React.Children.map(children, child =>\n        React.cloneElement(child, { on, toggle: () => setOn(!on) })\n      )}\n    </div>\n  );\n};\n\nToggle.Button = ({ on, toggle }) => (\n  <button onClick={toggle}>{on ? 'ON' : 'OFF'}</button>\n);\n\nToggle.Display = ({ on }) => (\n  <div>{on ? 'The toggle is on' : 'The toggle is off'}</div>\n);\n```\n\nThis pattern provides flexibility while maintaining a clean API. Would you like me to show you a more complex example?",
      timestamp: '2024-01-25T10:05:00Z',
      roadmapId: '1'
    }
  ],
  '2': [
    {
      id: '1',
      type: 'ai',
      content:
        "Welcome to your diving instructor journey! I'm here to guide you through the PADI certification process. You've completed your Open Water - congratulations! Ready to dive deeper?",
      timestamp: '2024-02-01T14:00:00Z',
      roadmapId: '2'
    },
    {
      id: '2',
      type: 'user',
      content:
        "Yes! I'm excited about the Advanced Open Water course. What should I expect?",
      timestamp: '2024-02-01T14:01:00Z',
      roadmapId: '2'
    },
    {
      id: '3',
      type: 'ai',
      content:
        "Excellent! The Advanced Open Water course will expand your diving skills significantly. You'll complete 5 adventure dives including deep diving and underwater navigation as core requirements, plus 3 elective specialty dives.\n\nSome popular electives include:\n• Peak Performance Buoyancy\n• Night Diving\n• Wreck Diving\n• Underwater Photography\n\nWhich specialties interest you most? This will help shape your learning path toward becoming an instructor.",
      timestamp: '2024-02-01T14:03:00Z',
      roadmapId: '2'
    }
  ],
  '3': [
    {
      id: '1',
      type: 'ai',
      content:
        "Hello! I'm your digital marketing mentor. You're making fantastic progress - 60% complete! Your next milestone is Google Analytics certification. How are you feeling about data analysis?",
      timestamp: '2024-01-25T16:00:00Z',
      roadmapId: '3'
    },
    {
      id: '2',
      type: 'user',
      content:
        "I'm a bit nervous about Google Analytics. The interface seems overwhelming.",
      timestamp: '2024-01-25T16:01:00Z',
      roadmapId: '3'
    },
    {
      id: '3',
      type: 'ai',
      content:
        "That's completely normal! Google Analytics can seem complex at first, but I'll help you break it down into manageable pieces. Let's start with the basics:\n\n1. **Audience** - Who visits your site?\n2. **Acquisition** - How do they find you?\n3. **Behavior** - What do they do on your site?\n4. **Conversions** - Are they taking desired actions?\n\nWe'll focus on one section at a time. Which aspect of your website's performance are you most curious about?",
      timestamp: '2024-01-25T16:03:00Z',
      roadmapId: '3'
    }
  ]
};
