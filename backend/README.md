# Pathyvo Backend - AI Career Counselor API

[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/python-3.8+-blue.svg?style=for-the-badge&logo=python)](https://www.python.org/)
[![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-2.0+-red.svg?style=for-the-badge)](https://sqlalchemy.org/)

This is the backend API for **Pathyvo**, an AI-powered career counseling platform that provides personalized career roadmaps and mentorship through intelligent chat interactions. Built with FastAPI, SQLAlchemy, and modern Python best practices.

## 🚀 Features

### 🔐 Authentication & Security

- JWT-based authentication with secure token management
- Password hashing with bcrypt
- Rate limiting for AI endpoints (10 req/min, 100 req/hour, 500 req/day)
- Input validation and XSS protection
- CORS configuration and security headers
- Request size limits and timeout protection

### 🤖 AI Integration

- **Google Gemini API** as primary LLM provider
- Fallback support for OpenAI GPT and Anthropic Claude
- Context-aware career roadmap generation
- Intelligent chat mentoring with conversation memory
- Field-specific question generation

### 📊 Core Functionality

- User registration and profile management
- Dynamic career roadmap creation and tracking
- Milestone management with completion analytics
- Real-time chat with AI career mentor
- Achievement system and progress tracking
- Analytics and reporting endpoints

### 🗄️ Database Management

- SQLAlchemy ORM with automatic migrations
- Relational data structure with foreign key constraints
- Support for SQLite (development) and PostgreSQL (production)
- Database initialization with sample data

## 📁 Project Structure

```
backend/
├── app/
│   ├── api/                    # API route modules
│   │   ├── routes_auth.py      # Authentication (login, register, tokens)
│   │   ├── routes_user.py      # User profile management
│   │   ├── routes_roadmap.py   # Roadmap CRUD and analytics
│   │   ├── routes_chat.py      # Chat message handling
│   │   ├── routes_ai.py        # AI-powered features
│   │   └── routes_achievement.py # Achievement system
│   ├── core/                   # Core configuration and security
│   │   ├── config.py           # Settings and environment management
│   │   └── security.py         # Security middleware and utilities
│   ├── models/                 # SQLAlchemy ORM models
│   │   ├── user.py            # User model
│   │   ├── roadmap.py         # Roadmap model
│   │   ├── milestone.py       # Milestone model
│   │   ├── chat_message.py    # Chat message model
│   │   └── achievement.py     # Achievement model
│   ├── schemas/               # Pydantic request/response schemas
│   │   ├── user.py           # User schemas
│   │   ├── roadmap.py        # Roadmap schemas
│   │   ├── chat.py           # Chat schemas
│   │   ├── achievement.py    # Achievement schemas
│   │   └── prompt.py         # Prompt schemas
│   ├── services/             # Business logic layer
│   │   ├── llm_service.py    # LLM integration and management
│   │   ├── rate_limit_service.py # Rate limiting logic
│   │   ├── achievement_service.py # Achievement processing
│   │   ├── prompt_service.py # Prompt engineering and templates
│   │   └── recommendation.py # Recommendation algorithms
│   ├── utils/                # Utility functions
│   ├── database.py           # Database connection and session management
│   ├── database_init.py      # Database initialization and sample data
│   └── main.py              # FastAPI application entry point
├── requirements.txt          # Python dependencies
├── Dockerfile               # Docker container configuration
├── .env.example            # Environment variables template
└── README.md               # This file
```

## 🗄️ Database Schema

### Core Models

**User**

- `id`: Primary key
- `name`: User's full name
- `email`: Unique email address
- `hashed_password`: Securely hashed password
- `avatar_url`: Profile picture URL (optional)
- `joined_at`: Registration timestamp

**Roadmap**

- `id`: Primary key
- `user_id`: Foreign key to User
- `title`: Roadmap title
- `description`: Detailed description
- `field`: Career field (e.g., "Software Engineering")
- `progress`: Completion percentage (0-100)
- `total_milestones`: Total number of milestones
- `completed_milestones`: Number of completed milestones
- `next_milestone`: Next milestone to focus on
- `estimated_time_to_complete`: Time estimate
- `created_at`: Creation timestamp

**Milestone**

- `id`: Primary key
- `roadmap_id`: Foreign key to Roadmap
- `title`: Milestone title
- `description`: Detailed description
- `completed`: Boolean completion status
- `completed_at`: Completion timestamp (nullable)
- `due_date`: Target completion date (optional)
- `resources`: JSON array of learning resources

**ChatMessage**

- `id`: Primary key
- `roadmap_id`: Foreign key to Roadmap
- `user_id`: Foreign key to User
- `type`: Message type ("user" or "ai")
- `content`: Message content
- `timestamp`: Message timestamp

**Achievement**

- `id`: Primary key
- `user_id`: Foreign key to User
- `title`: Achievement title
- `description`: Achievement description
- `type`: Achievement category
- `earned_at`: Timestamp when earned

## 🛠️ Installation & Setup

### Prerequisites

- Python 3.8 or higher
- pip (Python package manager)
- Git

### Quick Start

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd Career-Counselor/backend
   ```

2. **Create and activate virtual environment**

   ```bash
   python -m venv venv

   # On Windows
   venv\Scripts\activate

   # On macOS/Linux
   source venv/bin/activate
   ```

3. **Install dependencies**

   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**

   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

5. **Initialize the database**

   ```bash
   python app/database_init.py
   ```

6. **Start the development server**
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

The API will be available at `http://localhost:8000` with interactive documentation at `http://localhost:8000/docs`.

### Environment Configuration

Create a `.env` file in the backend directory:

```env
# JWT Configuration
SECRET_KEY=your-secure-secret-key-here-minimum-32-characters
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Database Configuration
DATABASE_URL=sqlite:///./mentor.db

# CORS Configuration
CORS_ORIGINS_STR=http://localhost:3000,http://localhost:5173

# AI Service Configuration
GOOGLE_AI_API_KEY=your_google_ai_api_key
GEMINI_MODEL=gemini-2.0-flash
OPENAI_API_KEY=your_openai_api_key_optional
ANTHROPIC_API_KEY=your_anthropic_api_key_optional

# Rate Limiting
AI_REQUESTS_PER_MINUTE=10
AI_REQUESTS_PER_HOUR=100
AI_REQUESTS_PER_DAY=500

# Security Settings
MAX_REQUEST_SIZE=1048576
REQUEST_TIMEOUT_SECONDS=30
MAX_MESSAGE_LENGTH=2000
```

## 🔌 API Endpoints

### Authentication

- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `GET /auth/me` - Get current user profile

### User Management

- `GET /users/profile` - Get user profile with statistics
- `PUT /users/profile` - Update user profile
- `DELETE /users/account` - Delete user account

### Roadmaps

- `GET /roadmaps/user/{user_id}` - Get user's roadmaps
- `GET /roadmaps/{roadmap_id}` - Get specific roadmap
- `PUT /roadmaps/{roadmap_id}` - Update roadmap
- `DELETE /roadmaps/{roadmap_id}` - Delete roadmap
- `GET /roadmaps/analytics/milestones-by-date` - Milestone completion analytics
- `GET /roadmaps/analytics/recent-milestones` - Recent milestone completions

### AI Features

- `GET /ai/initial-questions/{field}` - Get field-specific questions
- `POST /ai/generate-roadmap` - Generate personalized roadmap
- `POST /ai/chat` - Chat with AI mentor
- `GET /ai/conversation-status/{roadmap_id}` - Get conversation context

### Chat

- `GET /chat/roadmap/{roadmap_id}` - Get chat history
- `POST /chat/roadmap/{roadmap_id}` - Send chat message

### Achievements

- `GET /achievements/` - Get all available achievements
- `GET /achievements/user` - Get user's earned achievements

### Health Check

- `GET /` - API health check

## 🔒 Security Features

### Authentication & Authorization

- JWT tokens with configurable expiration
- Password hashing with bcrypt
- User session management
- Protected endpoints with user ownership validation

### Rate Limiting

- Per-user rate limiting for AI endpoints
- Configurable limits (per minute/hour/day)
- Redis and in-memory storage options
- Proper HTTP status codes and headers

### Input Validation

- Pydantic schemas for all requests/responses
- SQL injection prevention via SQLAlchemy ORM
- XSS protection through HTML escaping
- Input length limits and content validation

### Security Headers

- CORS configuration
- Security headers middleware
- Request size limits
- Trusted host validation

## 🧪 Testing

### Database Testing

```bash
python test_db.py
```

### Manual API Testing

Visit `http://localhost:8000/docs` for interactive API documentation and testing.

### Example API Calls

**Register a new user:**

```bash
curl -X POST "http://localhost:8000/auth/register" \
     -H "Content-Type: application/json" \
     -d '{"name": "John Doe", "email": "john@example.com", "password": "securepassword123"}'
```

**Generate a roadmap:**

```bash
curl -X POST "http://localhost:8000/ai/generate-roadmap" \
     -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"field": "Software Engineering", "user_responses": {"experience": "Beginner", "goals": "Full-stack development"}}'
```

## 🐳 Docker Support

### Development with Docker

```bash
# Build and run with docker-compose
docker-compose up --build

# Or run backend only
cd backend
docker build -t pathyvo-backend .
docker run -p 8000:8000 pathyvo-backend
```

### Production Deployment

See the [Production Deployment Guide](../docs/production_deployment.md) for detailed instructions.

## 📊 Monitoring & Logging

The application includes structured logging and monitoring capabilities:

- Request/response logging
- Error tracking and alerting
- Performance metrics
- Rate limiting metrics
- Database query monitoring

## 🔧 Development

### Code Structure Guidelines

- **Models**: SQLAlchemy models in `app/models/`
- **Schemas**: Pydantic schemas in `app/schemas/`
- **Routes**: API endpoints in `app/api/`
- **Services**: Business logic in `app/services/`
- **Configuration**: Settings in `app/core/config.py`

### Adding New Features

1. Create/update models in `app/models/`
2. Define schemas in `app/schemas/`
3. Implement business logic in `app/services/`
4. Create API routes in `app/api/`
5. Update documentation

### Database Migrations

When changing models, regenerate the database:

```bash
python app/database_init.py
```

For production, consider using Alembic for proper migrations.

## 🌟 AI Integration Details

### Supported Providers

1. **Google Gemini** (Primary) - Advanced reasoning and context understanding
2. **OpenAI GPT** (Fallback) - Reliable and well-tested
3. **Anthropic Claude** (Fallback) - Strong safety and reasoning

### Prompt Engineering

- Field-specific question templates
- Context-aware roadmap generation
- Conversation memory management
- Safety filters and content validation

### LLM Service Features

- Automatic provider fallback
- Response caching and optimization
- Token usage tracking
- Error handling and retry logic

## 🚀 Performance Optimization

- SQLAlchemy query optimization
- Database connection pooling
- Response caching for static data
- Async request handling
- Rate limiting to prevent abuse

## 📝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For issues and questions:

- Check the [API Documentation](../docs/api-reference.md)
- Review [Security Guidelines](../docs/security_guidelines.md)
- See [Production Deployment](../docs/production_deployment.md)

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
