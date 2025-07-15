<p align="center">
     <img src="https://github.com/user-attachments/assets/90ead193-6d6d-4333-8237-4d10f5de5440" alt="logo" width="400"/>
</p>

---

# Pathyvo - AI-Powered Career Counseling Platform

**Pathyvo** is a comprehensive AI-powered career mentorship web application that helps students and career changers create personalized career roadmaps through intelligent conversations with AI mentors.

## ✨ Features

### 🤖 AI-Powered Career Guidance

- **5-Step Career Discovery Process**: Systematic approach to understanding user's interests, values, and goals
- **Dynamic Conversation Flow**: AI adapts questions based on user responses
- **Personalized Roadmaps**: Custom career paths with detailed milestones and resources
- **Ongoing Mentorship**: Continuous AI support throughout the career journey

### 🎯 Core Functionality

- **Interactive Dashboard**: Track progress across multiple career roadmaps
- **Real-time Chat Interface**: Seamless conversation with AI mentors
- **Progress Tracking**: Visual progress indicators and milestone completion
- **Resource Management**: Curated learning resources, courses, and certifications
- **Rate Limiting**: Secure AI usage with proper rate limiting

### 🔐 Security & Performance

- **JWT Authentication**: Secure user sessions
- **Rate Limiting**: Prevents API abuse with configurable limits
- **Error Handling**: Comprehensive error handling and fallback responses
- **Responsive Design**: Mobile-first responsive interface

## 🏗️ Architecture

### Frontend (React + TypeScript)

- **Framework**: React 18 with TypeScript
- **Styling**: TailwindCSS with Lucide React icons
- **State Management**: React hooks and context
- **API Integration**: Axios with interceptors
- **Routing**: React Router v6

### Backend (FastAPI + Python)

- **Framework**: FastAPI with Python 3.9+
- **Database**: SQLite with SQLAlchemy ORM
- **AI Integration**: OpenAI GPT-3.5/4 and Anthropic Claude
- **Authentication**: JWT tokens with bcrypt hashing
- **Rate Limiting**: Redis/In-memory rate limiting
- **Logging**: Structured logging with error tracking

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Python 3.9+
- Redis (optional, for production rate limiting)

### 1. Clone the Repository

```bash
git clone https://github.com/tamerakdeniz/AI-Based-Career-Counselor.git
cd AI-Based-Career-Counselor
```

### 2. Backend Setup

#### Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

#### Environment Configuration

Create a `.env` file in the backend directory:

```env
# Database
DATABASE_URL=sqlite:///./mentor.db

# JWT Settings
SECRET_KEY=your-secret-key-here-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# AI/LLM Settings
OPENAI_API_KEY=your-openai-api-key
OPENAI_MODEL=gpt-3.5-turbo
OPENAI_MAX_TOKENS=1000
OPENAI_TEMPERATURE=0.7

# Alternative AI Provider (optional)
ANTHROPIC_API_KEY=your-anthropic-api-key
ANTHROPIC_MODEL=claude-3-haiku-20240307

# Rate Limiting
AI_REQUESTS_PER_MINUTE=10
AI_REQUESTS_PER_HOUR=100
AI_REQUESTS_PER_DAY=500

# Security
MAX_CONVERSATION_LENGTH=50
MAX_MESSAGE_LENGTH=2000
AI_TIMEOUT_SECONDS=30
```

#### Initialize Database

```bash
python -m app.database_init
```

#### Start Backend Server

```bash
uvicorn app.main:app --reload --port 8000
```

### 3. Frontend Setup

#### Install Dependencies

```bash
cd frontend
npm install
```

#### Start Development Server

```bash
npm run dev
```

The application will be available at:

- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## 📚 API Documentation

### Authentication Endpoints

#### POST /auth/register

Register a new user account.

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword"
}
```

**Response:**

```json
{
  "message": "User registered successfully",
  "access_token": "eyJ...",
  "token_type": "bearer",
  "user_id": 1,
  "email": "john@example.com",
  "name": "John Doe"
}
```

#### POST /auth/login

Authenticate user and get access token.

**Request Body:**

```json
{
  "email": "john@example.com",
  "password": "securepassword"
}
```

#### GET /auth/me

Get current user information (requires authentication).

### AI-Powered Roadmap Endpoints

#### POST /ai/create-roadmap-conversation

Create a new roadmap and start AI conversation.

**Request Body:**

```json
{
  "field": "Software Development",
  "description": "I want to become a full-stack developer",
  "initial_message": "I have basic programming knowledge"
}
```

**Response:**

```json
{
  "success": true,
  "roadmap_id": 1,
  "initial_message": "Hi! I'm here to help you discover your ideal career path...",
  "stage": "interests_strengths"
}
```

#### POST /ai/chat

Send message to AI mentor and get response.

**Request Body:**

```json
{
  "message": "I enjoy problem-solving and building applications",
  "roadmap_id": 1
}
```

**Response:**

```json
{
  "message": "That's great! Now, if you could work in any field, what would it be?",
  "stage": "preferred_field",
  "roadmap_ready": false
}
```

#### GET /ai/conversation-status/{roadmap_id}

Get current conversation status and progress.

**Response:**

```json
{
  "roadmap_id": 1,
  "stage": "values_motivation",
  "message_count": 6,
  "roadmap_ready": false,
  "collected_data": {
    "interests_strengths": "Problem-solving and building applications",
    "preferred_field": "Software Development"
  }
}
```

### Roadmap Management Endpoints

#### GET /roadmaps/user/{user_id}

Get all roadmaps for a user.

#### GET /roadmaps/{roadmap_id}

Get detailed roadmap with milestones.

#### PUT /roadmaps/milestones/{milestone_id}

Update milestone status (mark as complete/incomplete).

### Chat History Endpoints

#### GET /chat/roadmap/{roadmap_id}

Get chat message history for a roadmap.

#### POST /chat/roadmap/{roadmap_id}

Create a new chat message.

### Rate Limiting

#### GET /ai/rate-limit-status

Check current rate limit status for the authenticated user.

**Response:**

```json
{
  "requests_made": 5,
  "requests_remaining": 95,
  "requests_per_hour_limit": 100,
  "requests_per_day_limit": 500
}
```

## 🔄 User Flow

### 1. Registration & Login

1. User visits the landing page
2. Signs up or logs in
3. Redirected to dashboard

### 2. Roadmap Creation

1. User clicks "Create New Roadmap"
2. Modal opens with 3-step process:
   - **Step 1**: Select field of interest
   - **Step 2**: Describe goals and experience
   - **Step 3**: Confirm and create
3. AI conversation begins immediately

### 3. AI Conversation (5-Step Process)

1. **Interests & Strengths**: AI asks about user's interests and what they excel at
2. **Preferred Field**: Explores the type of work environment and impact they want
3. **Values & Motivation**: Discovers what matters most in their career
4. **Work Style**: Understands preferred working conditions and environment
5. **Long-term Vision**: Explores 5-10 year career goals and aspirations

### 4. Roadmap Generation

- AI analyzes all collected data
- Generates personalized career roadmap
- Creates 6-8 detailed milestones with:
  - Clear titles and descriptions
  - Estimated timelines
  - Required skills
  - Learning resources
  - Prerequisites

### 5. Ongoing Mentorship

- User can continue chatting with AI mentor
- Get advice on specific challenges
- Track progress through milestones
- Update roadmap as needed

## 🎨 5-Step Conversation Design

### Stage 1: Interests & Strengths

_"Hi! Can you tell me what subjects or activities you enjoy most and excel at? What makes you feel energized and engaged?"_

### Stage 2: Preferred Field

_"If you could work in any field, what would it be? Even if you're unsure, describe the type of impact you'd like to have."_

### Stage 3: Values & Motivation

_"What values matter most in a career for you? For example: creativity, security, helping people, etc."_

### Stage 4: Work Style

_"Do you prefer remote work, teamwork, solo deep work, or something else? Describe your ideal workday."_

### Stage 5: Long-term Vision

_"Where do you see yourself in 5–10 years? What achievements would make you proud?"_

## 🔧 Configuration

### Environment Variables

| Variable               | Description                         | Default               |
| ---------------------- | ----------------------------------- | --------------------- |
| `OPENAI_API_KEY`       | OpenAI API key for GPT models       | None                  |
| `ANTHROPIC_API_KEY`    | Anthropic API key for Claude models | None                  |
| `AI_REQUESTS_PER_HOUR` | Rate limit for AI requests per hour | 100                   |
| `SECRET_KEY`           | JWT secret key                      | Change in production  |
| `DATABASE_URL`         | Database connection string          | sqlite:///./mentor.db |

### Rate Limiting Configuration

```python
# In app/core/config.py
ai_requests_per_minute: int = 10
ai_requests_per_hour: int = 100
ai_requests_per_day: int = 500
max_conversation_length: int = 50
max_message_length: int = 2000
```

## 🔒 Security Best Practices

### AI Prompt Security

- Input validation and sanitization
- Content filtering for inappropriate requests
- Rate limiting to prevent abuse
- Timeout protection for AI API calls

### Data Protection

- Password hashing with bcrypt
- JWT token expiration
- CORS configuration
- SQL injection prevention with SQLAlchemy

### Rate Limiting

- Per-user request limits
- Redis-based tracking (production)
- Graceful degradation when limits exceeded

## 🚀 Deployment

### Backend Deployment

```bash
# Install production dependencies
pip install -r requirements.txt

# Set environment variables
export OPENAI_API_KEY=your-key
export SECRET_KEY=your-secret-key

# Run with production server
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### Frontend Deployment

```bash
# Build for production
npm run build

# Deploy to static hosting (Netlify, Vercel, etc.)
npm run preview
```

### Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up --build
```

## 📊 Database Schema

### Users Table

- `id` (Primary Key)
- `name` (String)
- `email` (Unique String)
- `hashed_password` (String)
- `avatar` (Optional String)
- `joined_at` (DateTime)

### Roadmaps Table

- `id` (Primary Key)
- `user_id` (Foreign Key)
- `title` (String)
- `description` (Text)
- `field` (String)
- `progress` (Integer)
- `ai_generated` (Boolean)
- `conversation_stage` (String)
- `collected_data` (JSON Text)
- `created_at` (DateTime)

### Milestones Table

- `id` (Primary Key)
- `roadmap_id` (Foreign Key)
- `title` (String)
- `description` (Text)
- `completed` (Boolean)
- `resources` (JSON Text)
- `due_date` (Optional Date)

### Chat Messages Table

- `id` (Primary Key)
- `roadmap_id` (Foreign Key)
- `user_id` (Foreign Key)
- `type` (String: 'user' or 'ai')
- `content` (Text)
- `timestamp` (DateTime)

## 🧪 Testing

### Backend Tests

```bash
cd backend
python -m pytest tests/
```

### Frontend Tests

```bash
cd frontend
npm test
```

### Integration Tests

```bash
# Test complete user flow
python backend/test_integration.py
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- OpenAI for GPT models
- Anthropic for Claude models
- FastAPI for the excellent web framework
- React team for the frontend framework
- TailwindCSS for styling utilities

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/tamerakdeniz/AI-Based-Career-Counselor/issues) page
2. Create a new issue with detailed information
3. Contact the development team

---

**Built with ❤️ by the Pathyvo Team**
