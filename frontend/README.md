# Pathyvo Frontend - AI Career Counselor Web Application

[![React](https://img.shields.io/badge/React-18.3-blue.svg?style=for-the-badge&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5+-blue.svg?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4+-646CFF.svg?style=for-the-badge&logo=vite)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC.svg?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)

A modern, responsive web application for **Pathyvo**, an AI-powered career counseling platform. Built with React, TypeScript, and TailwindCSS, providing an intuitive interface for personalized career guidance and roadmap management.

## 🚀 Features

### 🎯 Core User Experience
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Modern UI/UX**: Clean, intuitive interface with smooth animations
- **Real-time Updates**: Live chat with AI mentor and instant roadmap updates
- **Progressive Web App**: Fast loading with offline capabilities

### 🔐 Authentication & User Management
- Secure JWT-based authentication
- User registration and login flows
- Profile management and settings
- Password reset functionality

### 🗺️ Career Roadmap Features
- **Interactive Roadmap Visualization**: Visual representation of career paths
- **Milestone Tracking**: Progress monitoring with completion analytics
- **Dynamic Content**: AI-generated personalized learning paths
- **Resource Management**: Integrated learning resources and links

### 💬 AI Chat Interface
- **Real-time Mentoring**: Chat with AI career counselor
- **Context-Aware Responses**: Conversations tied to specific roadmaps
- **Message History**: Persistent chat history per roadmap
- **Rich Formatting**: Support for markdown and structured responses

### 📊 Analytics & Progress Tracking
- **Progress Dashboard**: Visual analytics of learning progress
- **Milestone Charts**: Weekly and monthly completion trends
- **Achievement System**: Badges and rewards for milestones
- **Activity Timeline**: Recent activities and accomplishments

### 🎨 Modern UI Components
- **Responsive Navigation**: Adaptive header and sidebar navigation
- **Modal System**: Reusable modal components for forms and confirmations
- **Chart Integration**: Interactive charts with Chart.js
- **Icon Library**: Lucide React icons throughout the interface

## 📁 Project Structure

```
frontend/
├── public/                     # Static assets
│   └── README.md              # Public folder documentation
├── src/
│   ├── api/                   # API integration layer
│   │   └── axiosInstance.ts   # Configured Axios client
│   ├── components/            # Reusable UI components
│   │   ├── Auth/              # Authentication components
│   │   │   ├── LoginForm.jsx  # Login form component
│   │   │   └── RegisterForm.jsx # Registration form component
│   │   ├── Dashboard/         # Dashboard-specific components
│   │   │   ├── ProgressTracked.jsx # Progress tracking widget
│   │   │   ├── RoadmapView.jsx     # Roadmap grid view
│   │   │   └── WelcomeBanner.jsx   # Welcome message banner
│   │   ├── Shared/            # Shared layout components
│   │   │   ├── Footer.jsx     # Application footer
│   │   │   └── Navbar.jsx     # Navigation bar
│   │   ├── ActivityLog.tsx    # Recent activity timeline
│   │   ├── ChatMessage.tsx    # Individual chat message
│   │   ├── ConfirmationModal.tsx # Confirmation dialog
│   │   ├── FeaturesSection.tsx   # Landing page features
│   │   ├── Footer.tsx            # Main footer component
│   │   ├── Header.tsx            # Main header component
│   │   ├── HeroSection.tsx       # Landing page hero
│   │   ├── HowItWorksSection.tsx # How it works section
│   │   ├── LandingHeader.tsx     # Landing page header
│   │   ├── MilestoneChart.tsx    # Milestone analytics chart
│   │   ├── NotificationToast.tsx # Toast notifications
│   │   ├── PricingSection.tsx    # Pricing information
│   │   ├── ProtectedRoute.tsx    # Route protection wrapper
│   │   ├── RenameModal.tsx       # Rename confirmation modal
│   │   ├── RoadmapCard.tsx       # Roadmap preview card
│   │   ├── RoadmapCreationModal.tsx # New roadmap modal
│   │   ├── RoadmapSidebar.tsx    # Chat page roadmap sidebar
│   │   └── TestimonialsSection.tsx # Customer testimonials
│   ├── data/                  # Mock data and constants
│   │   └── mockData.ts        # Development mock data
│   ├── pages/                 # Page components
│   │   ├── Achievements.tsx   # Achievements and badges page
│   │   ├── Analytics.tsx      # Analytics dashboard
│   │   ├── Chat.tsx          # AI chat interface
│   │   ├── Dashboard.tsx     # Main dashboard
│   │   ├── DashboardPage.jsx # Alternative dashboard layout
│   │   ├── InputPage.jsx     # Data input page
│   │   ├── Landing.tsx       # Landing page
│   │   ├── LoginPage.jsx     # Login page
│   │   ├── Profile.tsx       # User profile page
│   │   ├── RegisterPage.jsx  # Registration page
│   │   ├── Roadmap.tsx       # Individual roadmap view
│   │   ├── Settings.tsx      # User settings
│   │   ├── SignIn.tsx        # Sign in page
│   │   └── SignUp.tsx        # Sign up page
│   ├── types/                # TypeScript type definitions
│   │   └── index.ts          # Main type definitions
│   ├── utils/                # Utility functions
│   │   └── auth.ts          # Authentication utilities
│   ├── App.js               # Legacy App component
│   ├── App.tsx              # Main App component
│   ├── index.css            # Global styles
│   ├── index.js             # Legacy entry point
│   ├── main.tsx             # Main entry point
│   └── vite-env.d.ts        # Vite environment types
├── eslint.config.js         # ESLint configuration
├── index.html               # HTML template
├── package.json             # Dependencies and scripts
├── postcss.config.js        # PostCSS configuration
├── tailwind.config.js       # Tailwind CSS configuration
├── tsconfig.json            # TypeScript configuration
├── tsconfig.app.json        # App-specific TypeScript config
├── tsconfig.node.json       # Node-specific TypeScript config
├── vite.config.ts           # Vite build configuration
└── README.md                # This file
```

## 🛠️ Installation & Setup

### Prerequisites

- Node.js 18+ and npm/yarn
- Git
- Backend API running (see [backend README](../backend/README.md))

### Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Career-Counselor/frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Configure environment variables**
   ```bash
   # Create .env file (optional, defaults work for local development)
   echo "VITE_API_BASE_URL=http://localhost:8000" > .env
   ```

4. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open in browser**
   ```
   http://localhost:5173
   ```

### Environment Variables

Create a `.env` file in the frontend directory:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:8000

# Application Configuration
VITE_APP_NAME=Pathyvo
VITE_APP_VERSION=1.0.0

# Feature Flags (optional)
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_ACHIEVEMENTS=true
```

## 🎨 UI/UX Design System

### Color Palette

```css
/* Primary Colors */
--primary-blue: #3B82F6
--primary-indigo: #6366F1
--primary-purple: #8B5CF6

/* Neutral Colors */
--gray-50: #F9FAFB
--gray-100: #F3F4F6
--gray-200: #E5E7EB
--gray-500: #6B7280
--gray-900: #111827

/* Status Colors */
--success: #10B981
--warning: #F59E0B
--error: #EF4444
--info: #3B82F6
```

### Typography

- **Headings**: Inter font family, various weights
- **Body**: System font stack with fallbacks
- **Code**: Monospace font for technical content

### Component Patterns

- **Cards**: Rounded corners, subtle shadows, hover effects
- **Buttons**: Primary, secondary, and ghost variants
- **Forms**: Consistent input styling with validation states
- **Modals**: Centered overlays with backdrop blur

## 📱 Responsive Design

### Breakpoints

- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

### Responsive Features

- Adaptive navigation (hamburger menu on mobile)
- Flexible grid layouts
- Scalable typography
- Touch-friendly interactive elements
- Optimized image loading

## 🧩 Key Components

### Core Components

**Header Component** (`components/Header.tsx`)
- Navigation menu with user authentication state
- Responsive design with mobile hamburger menu
- Dynamic title based on current page

**Dashboard Component** (`pages/Dashboard.tsx`)
- Main landing page after authentication
- Roadmap grid view with creation capabilities
- Statistics overview and quick actions

**Roadmap Component** (`pages/Roadmap.tsx`)
- Individual roadmap visualization
- Interactive milestone management
- Progress tracking and completion

**Chat Component** (`pages/Chat.tsx`)
- Real-time AI chat interface
- Roadmap sidebar integration
- Message history and context awareness

### Utility Components

**ProtectedRoute** (`components/ProtectedRoute.tsx`)
- Authentication requirement wrapper
- Automatic redirection for unauthorized users

**NotificationToast** (`components/NotificationToast.tsx`)
- Success, error, and info message system
- Auto-dismiss with manual close option

**ConfirmationModal** (`components/ConfirmationModal.tsx`)
- Reusable confirmation dialog
- Customizable actions and messaging

## 🔄 State Management

### Authentication State
- JWT token storage in localStorage
- User profile data management
- Login/logout flow handling

### Application State
- Local component state with React hooks
- API data caching with useEffect
- Error state management

### Data Flow
1. **Authentication**: Login → Token Storage → API Headers
2. **Data Fetching**: Component Mount → API Call → State Update
3. **User Actions**: Event → API Call → State Update → UI Update

## 🌐 API Integration

### Axios Configuration (`api/axiosInstance.ts`)

```typescript
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: process.env.VITE_API_BASE_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for auth tokens
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

### API Endpoints Usage

**Authentication**
```typescript
// Login
const response = await axiosInstance.post('/auth/login', {
  email: 'user@example.com',
  password: 'password'
});

// Get current user
const user = await axiosInstance.get('/auth/me');
```

**Roadmaps**
```typescript
// Get user roadmaps
const roadmaps = await axiosInstance.get(`/roadmaps/user/${userId}`);

// Generate new roadmap
const newRoadmap = await axiosInstance.post('/ai/generate-roadmap', {
  field: 'Software Engineering',
  user_responses: userAnswers
});
```

**Chat**
```typescript
// Send chat message
const response = await axiosInstance.post('/ai/chat', {
  roadmap_id: roadmapId,
  message: 'How do I improve my coding skills?'
});

// Get chat history
const messages = await axiosInstance.get(`/chat/roadmap/${roadmapId}`);
```

## 📊 Charts & Analytics

### Chart.js Integration

The application uses Chart.js for data visualization:

```typescript
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);
```

**Milestone Progress Chart** (`components/MilestoneChart.tsx`)
- Weekly milestone completion trends
- Interactive tooltips and hover effects
- Responsive design for mobile devices

## 🎯 TypeScript Integration

### Type Definitions (`types/index.ts`)

```typescript
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  joinedAt: string;
}

export interface Roadmap {
  id: string;
  title: string;
  description: string;
  field: string;
  progress: number;
  milestones: Milestone[];
  // ... additional properties
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  resources?: Resource[];
}

export interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: string;
  roadmapId?: string;
}
```

### Type Safety Benefits
- Compile-time error detection
- IntelliSense support in IDEs
- Consistent data structure across components
- Easier refactoring and maintenance

## 🔧 Build & Deployment

### Development Build

```bash
npm run dev          # Start development server
npm run lint         # Run ESLint checks
npm run build        # Create production build
npm run preview      # Preview production build
```

### Production Build

```bash
npm run build
```

Generates optimized static files in the `dist/` directory.

### Docker Support

**Dockerfile** (located in frontend directory):

```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=0 /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**Build and run with Docker:**

```bash
docker build -t pathyvo-frontend .
docker run -p 3000:80 pathyvo-frontend
```

### Environment-Specific Builds

**Development**
```bash
VITE_API_BASE_URL=http://localhost:8000 npm run build
```

**Production**
```bash
VITE_API_BASE_URL=https://api.pathyvo.com npm run build
```

## 🧪 Testing

### Manual Testing Checklist

- [ ] **Authentication Flow**
  - User registration works correctly
  - Login/logout functionality
  - Protected routes redirect properly
  - Token refresh handling

- [ ] **Roadmap Features**
  - Roadmap creation through AI generation
  - Milestone completion and progress tracking
  - Roadmap editing and deletion
  - Visual progress indicators

- [ ] **Chat Interface**
  - Real-time message sending/receiving
  - Message history persistence
  - Roadmap context integration
  - Error handling for failed messages

- [ ] **Responsive Design**
  - Mobile navigation menu
  - Tablet and desktop layouts
  - Touch interactions on mobile
  - Cross-browser compatibility

### Browser Compatibility

- **Modern Browsers**: Chrome 88+, Firefox 85+, Safari 14+, Edge 88+
- **Mobile Browsers**: iOS Safari 14+, Chrome Mobile 88+
- **Legacy Support**: IE 11+ (with polyfills)

## 🚀 Performance Optimization

### Implemented Optimizations

- **Code Splitting**: Lazy-loaded routes and components
- **Image Optimization**: Responsive images with loading="lazy"
- **Bundle Optimization**: Tree shaking and dead code elimination
- **Caching**: Service worker for static asset caching

### Performance Metrics

- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 3s
- **Lighthouse Score**: 90+ (Performance, Accessibility, Best Practices)

### Optimization Techniques

```typescript
// Lazy loading pages
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Roadmap = lazy(() => import('./pages/Roadmap'));

// Component memoization
const MemoizedRoadmapCard = React.memo(RoadmapCard);

// Image optimization
<img 
  src="/images/hero.webp" 
  alt="Career counseling" 
  loading="lazy"
  sizes="(max-width: 768px) 100vw, 50vw"
/>
```

## 🔍 SEO & Accessibility

### SEO Features
- Semantic HTML structure
- Meta tags and Open Graph support
- Structured data markup
- Sitemap generation

### Accessibility (a11y)
- ARIA labels and roles
- Keyboard navigation support
- Color contrast compliance (WCAG 2.1 AA)
- Screen reader compatibility
- Focus management in modals

## 📱 Progressive Web App (PWA)

### PWA Features
- **Offline Support**: Service worker for basic offline functionality
- **App-like Experience**: Add to home screen capability
- **Push Notifications**: Future implementation planned
- **Background Sync**: Offline data synchronization

### Manifest Configuration

```json
{
  "name": "Pathyvo - AI Career Counselor",
  "short_name": "Pathyvo",
  "description": "AI-powered career guidance platform",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#3B82F6",
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    }
  ]
}
```

## 🔧 Development Guidelines

### Code Style
- **ESLint**: Enforced code quality rules
- **Prettier**: Consistent code formatting
- **TypeScript**: Strict type checking enabled
- **Component Structure**: Functional components with hooks

### Git Workflow
1. Create feature branch from `main`
2. Implement changes with clear commit messages
3. Run linting and type checking
4. Submit pull request with description
5. Code review and merge

### Naming Conventions
- **Components**: PascalCase (e.g., `RoadmapCard.tsx`)
- **Files**: camelCase or kebab-case
- **Variables**: camelCase
- **Constants**: UPPER_SNAKE_CASE

## 🛡️ Security Considerations

### Client-Side Security
- **XSS Prevention**: Input sanitization and CSP headers
- **CSRF Protection**: SameSite cookies and token validation
- **Secure Storage**: Sensitive data handling best practices
- **Content Security Policy**: Strict CSP implementation

### Authentication Security
- JWT tokens with proper expiration
- Automatic token refresh logic
- Secure session management
- Protection against token theft

## 📈 Future Enhancements

### Planned Features
- **Offline Mode**: Enhanced offline functionality
- **Real-time Notifications**: Push notification system
- **Theme Customization**: User-selectable themes
- **Advanced Analytics**: More detailed progress tracking
- **Social Features**: Community and sharing capabilities

### Technical Improvements
- **State Management**: Redux Toolkit or Zustand integration
- **Testing**: Unit and integration test suite
- **Internationalization**: Multi-language support
- **Micro-frontends**: Modular architecture evolution

## 📞 Support & Contributing

### Getting Help
- Check the [Installation Guide](../docs/installation.md)
- Review [API Documentation](../docs/api-reference.md)
- See [Architecture Overview](../docs/architecture.md)

### Contributing
1. Fork the repository
2. Create a feature branch
3. Follow the development guidelines
4. Submit a pull request
5. Participate in code review

### Issue Reporting
- Use GitHub Issues for bug reports
- Provide reproduction steps
- Include browser and device information
- Attach screenshots when relevant

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.

### License Summary

The MIT License is a permissive open source license that allows you to:

- ✅ **Use** the software for any purpose, including commercial applications
- ✅ **Modify** the source code to suit your needs
- ✅ **Distribute** copies of the original or modified software
- ✅ **Sublicense** and sell copies of the software
- ✅ **Include** in proprietary software

**Requirements:**
- Include the original copyright notice and license text in all copies
- Provide attribution to the original author (Tamer Akdeniz)

**Disclaimer:** The software is provided "as is" without warranty of any kind. The author is not liable for any damages arising from the use of this software.

For the complete license terms, see the [LICENSE](../LICENSE) file in the project root.

---

## 🎉 Acknowledgments

- **React Team**: For the amazing framework
- **Tailwind CSS**: For the utility-first CSS framework
- **Lucide React**: For the beautiful icon set
- **Chart.js**: For powerful charting capabilities
- **Vite**: For lightning-fast development experience