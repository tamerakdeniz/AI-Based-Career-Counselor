# API Reference - Pathyvo Career Counselor

[![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-green.svg)](https://fastapi.tiangolo.com/)
[![OpenAPI](https://img.shields.io/badge/OpenAPI-3.0.0-brightgreen.svg)](https://swagger.io/specification/)

Complete API documentation for the Pathyvo Career Counselor backend. This RESTful API provides endpoints for user management, AI-powered career guidance, roadmap creation and tracking, and real-time chat functionality.

## 📊 API Overview

- **Base URL**: `http://localhost:8000` (development) / `https://api.pathyvo.com` (production)
- **Authentication**: JWT Bearer tokens
- **Content Type**: `application/json`
- **API Version**: 1.0.0
- **Interactive Documentation**: `/docs` (Swagger UI) and `/redoc` (ReDoc)

## 🔐 Authentication

### Security Model

All endpoints except `/auth/login` and `/auth/register` require authentication via JWT Bearer tokens.

**Headers Required:**
```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Token Expiration:** 30 minutes (configurable)

### Rate Limiting

AI endpoints have specific rate limits:
- **Per Minute**: 10 requests
- **Per Hour**: 100 requests  
- **Per Day**: 500 requests

Rate limit headers are included in responses:
```http
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 9
X-RateLimit-Reset: 1640995200
```

## 🔗 Endpoints

### Authentication Endpoints

#### POST /auth/register

Register a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "password": "securepassword123"
}
```

**Response:** `201 Created`
```json
{
  "message": "User registered successfully",
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user_id": 1,
  "email": "john.doe@example.com",
  "name": "John Doe"
}
```

**Error Responses:**
- `400` - Email already registered
- `422` - Validation error (invalid email format, weak password, etc.)

---

#### POST /auth/login

Authenticate user and receive access token.

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "password": "securepassword123"
}
```

**Response:** `200 OK`
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user_id": 1,
  "user_email": "john.doe@example.com",
  "user_name": "John Doe"
}
```

**Error Responses:**
- `401` - Incorrect email or password

---

#### GET /auth/me

Get current user profile information.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john.doe@example.com",
  "avatar": "https://example.com/avatar.jpg",
  "joined_at": "2024-01-15T10:30:00Z"
}
```

**Error Responses:**
- `401` - Invalid or expired token

### User Management Endpoints

#### GET /users/profile

Get detailed user profile with statistics.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john.doe@example.com",
  "avatar": "https://example.com/avatar.jpg",
  "joined_at": "2024-01-15T10:30:00Z",
  "total_roadmaps": 3,
  "total_milestones": 24,
  "completed_milestones": 18,
  "completed_roadmaps": 1
}
```

---

#### PUT /users/profile

Update user profile information.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "John Smith",
  "email": "john.smith@example.com",
  "avatar": "https://example.com/new-avatar.jpg"
}
```

**Response:** `200 OK`
```json
{
  "message": "Profile updated successfully",
  "user": {
    "id": 1,
    "name": "John Smith",
    "email": "john.smith@example.com",
    "avatar": "https://example.com/new-avatar.jpg"
  }
}
```

**Error Responses:**
- `400` - Email already in use
- `422` - Validation error

---

#### PUT /users/change-password

Change user password.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "current_password": "oldpassword123",
  "new_password": "newpassword456"
}
```

**Response:** `200 OK`
```json
{
  "message": "Password changed successfully"
}
```

**Error Responses:**
- `400` - Incorrect current password
- `422` - New password validation failed

---

#### DELETE /users/account

Delete user account (requires password confirmation).

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "password": "userpassword123"
}
```

**Response:** `200 OK`
```json
{
  "message": "Account deleted successfully"
}
```

**Error Responses:**
- `400` - Incorrect password
- `401` - Authentication required

### Roadmap Management Endpoints

#### GET /roadmaps/user/{user_id}

Get all roadmaps for a specific user.

**Headers:** `Authorization: Bearer <token>`

**Path Parameters:**
- `user_id` (integer): User ID (must match authenticated user)

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "title": "Full-Stack Web Development",
    "description": "Complete roadmap for becoming a full-stack developer",
    "field": "Software Engineering",
    "progress": 75,
    "next_milestone": "Deploy to Production",
    "total_milestones": 8,
    "completed_milestones": 6,
    "estimated_time_to_complete": "6 months",
    "created_at": "2024-01-15T10:30:00Z",
    "milestones": [
      {
        "id": 1,
        "title": "Learn HTML & CSS",
        "description": "Master the fundamentals of web markup and styling",
        "completed": true,
        "completed_at": "2024-01-20T14:00:00Z",
        "due_date": null,
        "resources": [
          {
            "title": "MDN Web Docs",
            "url": "https://developer.mozilla.org/en-US/docs/Web/HTML"
          }
        ]
      }
    ]
  }
]
```

**Error Responses:**
- `403` - Access denied (user can only access own roadmaps)

---

#### GET /roadmaps/{roadmap_id}

Get detailed information about a specific roadmap.

**Headers:** `Authorization: Bearer <token>`

**Path Parameters:**
- `roadmap_id` (integer): Roadmap ID

**Response:** `200 OK`
```json
{
  "id": 1,
  "title": "Full-Stack Web Development",
  "description": "Complete roadmap for becoming a full-stack developer",
  "field": "Software Engineering",
  "progress": 75,
  "next_milestone": "Deploy to Production",
  "total_milestones": 8,
  "completed_milestones": 6,
  "estimated_time_to_complete": "6 months",
  "created_at": "2024-01-15T10:30:00Z",
  "milestones": [...]
}
```

**Error Responses:**
- `404` - Roadmap not found
- `403` - Access denied

---

#### PUT /roadmaps/{roadmap_id}

Update roadmap information.

**Headers:** `Authorization: Bearer <token>`

**Path Parameters:**
- `roadmap_id` (integer): Roadmap ID

**Request Body:**
```json
{
  "title": "Updated Roadmap Title",
  "description": "Updated description",
  "estimated_time_to_complete": "8 months"
}
```

**Response:** `200 OK`
```json
{
  "id": 1,
  "title": "Updated Roadmap Title",
  "description": "Updated description",
  "field": "Software Engineering",
  "progress": 75,
  "estimated_time_to_complete": "8 months"
}
```

---

#### DELETE /roadmaps/{roadmap_id}

Delete a roadmap.

**Headers:** `Authorization: Bearer <token>`

**Path Parameters:**
- `roadmap_id` (integer): Roadmap ID

**Response:** `200 OK`
```json
{
  "ok": true
}
```

**Error Responses:**
- `404` - Roadmap not found
- `403` - Access denied

---

#### GET /roadmaps/{roadmap_id}/milestones

Get all milestones for a specific roadmap.

**Headers:** `Authorization: Bearer <token>`

**Path Parameters:**
- `roadmap_id` (integer): Roadmap ID

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "title": "Learn HTML & CSS",
    "description": "Master the fundamentals of web markup and styling",
    "completed": true,
    "completed_at": "2024-01-20T14:00:00Z",
    "due_date": null,
    "resources": [
      {
        "title": "MDN Web Docs",
        "url": "https://developer.mozilla.org/en-US/docs/Web/HTML"
      }
    ]
  }
]
```

---

#### PUT /roadmaps/milestones/{milestone_id}/complete

Mark a milestone as completed.

**Headers:** `Authorization: Bearer <token>`

**Path Parameters:**
- `milestone_id` (integer): Milestone ID

**Response:** `200 OK`
```json
{
  "id": 1,
  "title": "Learn HTML & CSS",
  "description": "Master the fundamentals of web markup and styling",
  "completed": true,
  "completed_at": "2024-01-20T14:00:00Z",
  "due_date": null,
  "resources": [...]
}
```

**Error Responses:**
- `404` - Milestone not found
- `403` - Access denied

---

#### PUT /roadmaps/{roadmap_id}/complete-all

Mark all milestones in a roadmap as completed.

**Headers:** `Authorization: Bearer <token>`

**Path Parameters:**
- `roadmap_id` (integer): Roadmap ID

**Response:** `200 OK`
```json
{
  "message": "All milestones completed successfully",
  "roadmap": {
    "id": 1,
    "progress": 100,
    "completed_milestones": 8,
    "total_milestones": 8,
    "next_milestone": null
  }
}
```

---

#### GET /roadmaps/analytics/milestones-by-date

Get milestone completion analytics by date.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
[
  {
    "date": "Week 1, 2024",
    "milestones": 3
  },
  {
    "date": "Week 2, 2024",
    "milestones": 5
  },
  {
    "date": "Week 3, 2024",
    "milestones": 2
  }
]
```

---

#### GET /roadmaps/analytics/recent-milestones

Get recently completed milestones.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
[
  {
    "id": 15,
    "title": "Deploy to Production",
    "description": "Deploy application to production environment",
    "completed_at": "2024-01-20T14:00:00Z",
    "roadmap_title": "Full-Stack Web Development"
  }
]
```

### AI-Powered Features

#### GET /ai/initial-questions/{field}

Get field-specific initial questions for roadmap generation.

**Headers:** `Authorization: Bearer <token>`

**Path Parameters:**
- `field` (string): Career field (e.g., "Software Engineering", "Data Science")

**Response:** `200 OK`
```json
{
  "questions": [
    {
      "key": "experience",
      "text": "What is your current experience level in Software Engineering?"
    },
    {
      "key": "interests",
      "text": "What specific areas of software engineering interest you most?"
    },
    {
      "key": "goals",
      "text": "What are your short-term and long-term career goals?"
    },
    {
      "key": "learning_style",
      "text": "How do you prefer to learn new skills?"
    }
  ]
}
```

**Error Responses:**
- `404` - No questions found for the specified field
- `429` - Rate limit exceeded

---

#### POST /ai/generate-roadmap

Generate a personalized career roadmap using AI.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "field": "Software Engineering",
  "user_responses": {
    "experience": "Beginner",
    "interests": "Full-stack web development",
    "goals": "Get a junior developer job within 6 months",
    "learning_style": "Hands-on projects with video tutorials",
    "time_commitment": "20 hours per week"
  }
}
```

**Response:** `201 Created`
```json
{
  "roadmap_id": 5,
  "title": "Full-Stack Web Development Journey",
  "description": "A comprehensive roadmap tailored to your experience level and goals",
  "field": "Software Engineering",
  "milestones": [
    {
      "title": "Foundation: HTML, CSS & JavaScript",
      "description": "Build solid fundamentals in web technologies",
      "estimated_duration": "4-6 weeks",
      "skills": ["HTML5", "CSS3", "JavaScript ES6"],
      "resources": [
        {
          "title": "freeCodeCamp Web Development",
          "url": "https://www.freecodecamp.org/learn"
        }
      ]
    }
  ],
  "estimated_time_to_complete": "6 months"
}
```

**Error Responses:**
- `429` - Rate limit exceeded
- `500` - AI service unavailable or failed to generate roadmap

---

#### POST /ai/chat

Chat with AI mentor about career guidance.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "roadmap_id": 1,
  "message": "I'm struggling with JavaScript concepts. Can you help me understand closures?"
}
```

**Response:** `200 OK`
```json
{
  "message": "Closures in JavaScript are functions that have access to variables from their outer scope even after the outer function has returned. Here's a simple example...",
  "stage": "active_learning",
  "roadmap_ready": true
}
```

**Error Responses:**
- `404` - Roadmap not found
- `429` - Rate limit exceeded
- `403` - Access denied

---

#### GET /ai/conversation-status/{roadmap_id}

Get conversation context and status for a roadmap.

**Headers:** `Authorization: Bearer <token>`

**Path Parameters:**
- `roadmap_id` (integer): Roadmap ID

**Response:** `200 OK`
```json
{
  "stage": "active_learning",
  "message_count": 15,
  "roadmap_ready": true,
  "last_activity": "2024-01-20T14:00:00Z"
}
```

### Chat Management Endpoints

#### GET /chat/roadmap/{roadmap_id}

Get chat message history for a roadmap.

**Headers:** `Authorization: Bearer <token>`

**Path Parameters:**
- `roadmap_id` (integer): Roadmap ID

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "type": "user",
    "content": "How do I start learning React?",
    "timestamp": "2024-01-20T10:00:00Z",
    "roadmap_id": 1,
    "user_id": 1
  },
  {
    "id": 2,
    "type": "ai",
    "content": "Great question! React is a powerful JavaScript library. I recommend starting with the official tutorial...",
    "timestamp": "2024-01-20T10:01:00Z",
    "roadmap_id": 1,
    "user_id": 1
  }
]
```

**Error Responses:**
- `404` - Roadmap not found
- `403` - Access denied

---

#### POST /chat/roadmap/{roadmap_id}

Send a new chat message.

**Headers:** `Authorization: Bearer <token>`

**Path Parameters:**
- `roadmap_id` (integer): Roadmap ID

**Request Body:**
```json
{
  "content": "What's the best way to practice JavaScript?",
  "type": "user"
}
```

**Response:** `201 Created`
```json
{
  "id": 3,
  "type": "user",
  "content": "What's the best way to practice JavaScript?",
  "timestamp": "2024-01-20T10:05:00Z",
  "roadmap_id": 1,
  "user_id": 1
}
```

### Achievement System Endpoints

#### GET /achievements/

Get all available achievements in the system.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "title": "First Steps",
    "description": "Complete your first milestone",
    "type": "milestone",
    "icon": "🎯",
    "requirements": {
      "milestones_completed": 1
    }
  },
  {
    "id": 2,
    "title": "Roadmap Master",
    "description": "Complete your first roadmap",
    "type": "roadmap",
    "icon": "🏆",
    "requirements": {
      "roadmaps_completed": 1
    }
  }
]
```

---

#### GET /achievements/user

Get achievements earned by the current user.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "user_id": 1,
    "achievement_id": 1,
    "title": "First Steps",
    "description": "Complete your first milestone",
    "type": "milestone",
    "earned_at": "2024-01-20T14:00:00Z"
  }
]
```

---

#### POST /achievements/check

Manually trigger achievement check for current user.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "message": "Achievements checked",
  "new_achievements": [
    {
      "id": 2,
      "title": "Dedicated Learner",
      "description": "Complete 5 milestones",
      "earned_at": "2024-01-20T14:30:00Z"
    }
  ]
}
```

### Health Check Endpoint

#### GET /

API health check.

**Response:** `200 OK`
```json
{
  "message": "Welcome to Pathyvo API",
  "status": "healthy",
  "version": "1.0.0",
  "timestamp": "2024-01-20T10:00:00Z"
}
```

## 📊 Response Formats

### Standard Success Response

Most endpoints return data in this format:

```json
{
  "data": {}, // Response data
  "message": "Success message",
  "timestamp": "2024-01-20T10:00:00Z"
}
```

### Standard Error Response

Error responses follow this format:

```json
{
  "detail": "Error description",
  "type": "error_type",
  "code": "ERROR_CODE",
  "timestamp": "2024-01-20T10:00:00Z"
}
```

### Validation Error Response

Field validation errors:

```json
{
  "detail": [
    {
      "loc": ["body", "email"],
      "msg": "field required",
      "type": "value_error.missing"
    },
    {
      "loc": ["body", "password"],
      "msg": "ensure this value has at least 6 characters",
      "type": "value_error.any_str.min_length",
      "ctx": {"limit_value": 6}
    }
  ]
}
```

## 🔒 Security Considerations

### Authentication Security
- JWT tokens expire after 30 minutes
- Tokens include user ID and expiration claims
- Invalid tokens return 401 with proper WWW-Authenticate headers
- User existence is verified on each authenticated request

### Input Validation
- All request bodies are validated using Pydantic models
- SQL injection prevention through SQLAlchemy ORM
- XSS protection via HTML escaping
- Field length limits and pattern validation

### Rate Limiting
- AI endpoints have strict rate limits per user
- Rate limit headers included in responses
- 429 status code returned when limits exceeded
- Sliding window algorithm for accurate limiting

### Authorization
- Users can only access their own resources
- Roadmap and milestone access checked via ownership
- Chat messages filtered by user ownership
- Administrative endpoints require elevated permissions

## 🐛 Error Codes

| HTTP Status | Error Type | Description |
|-------------|------------|-------------|
| 400 | Bad Request | Invalid request data or business logic error |
| 401 | Unauthorized | Authentication required or invalid token |
| 403 | Forbidden | Insufficient permissions for resource |
| 404 | Not Found | Requested resource doesn't exist |
| 422 | Validation Error | Request data failed validation rules |
| 429 | Rate Limited | Request rate limit exceeded |
| 500 | Internal Error | Server error or AI service unavailable |

## 🔧 Development Tools

### Interactive Documentation

- **Swagger UI**: `/docs` - Interactive API explorer
- **ReDoc**: `/redoc` - Alternative documentation interface

### Testing with cURL

**Authentication:**
```bash
# Register
curl -X POST "http://localhost:8000/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"test123"}'

# Login
curl -X POST "http://localhost:8000/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

**Authenticated Requests:**
```bash
# Get profile
curl -H "Authorization: Bearer <token>" \
  "http://localhost:8000/users/profile"

# Generate roadmap
curl -X POST "http://localhost:8000/ai/generate-roadmap" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"field":"Software Engineering","user_responses":{"experience":"Beginner"}}'
```

### Testing with Python

```python
import requests

# Login
response = requests.post('http://localhost:8000/auth/login', json={
    'email': 'test@example.com',
    'password': 'test123'
})
token = response.json()['access_token']

# Use token for authenticated requests
headers = {'Authorization': f'Bearer {token}'}
profile = requests.get('http://localhost:8000/users/profile', headers=headers)
print(profile.json())
```

## 📈 API Usage Examples

### Complete User Flow

1. **User Registration**
2. **Get Initial Questions**
3. **Generate Roadmap**
4. **Track Progress**
5. **Chat with AI Mentor**

```python
import requests

base_url = "http://localhost:8000"

# 1. Register
response = requests.post(f"{base_url}/auth/register", json={
    "name": "Jane Developer",
    "email": "jane@example.com", 
    "password": "secure123"
})
token = response.json()['access_token']
headers = {'Authorization': f'Bearer {token}'}

# 2. Get questions for software engineering
questions = requests.get(
    f"{base_url}/ai/initial-questions/Software Engineering",
    headers=headers
)

# 3. Generate personalized roadmap
roadmap = requests.post(f"{base_url}/ai/generate-roadmap", 
    headers=headers,
    json={
        "field": "Software Engineering",
        "user_responses": {
            "experience": "Beginner",
            "interests": "Web development",
            "goals": "Get first job",
            "learning_style": "Hands-on projects"
        }
    }
)
roadmap_id = roadmap.json()['roadmap_id']

# 4. Complete first milestone
milestone_id = roadmap.json()['milestones'][0]['id']
requests.put(
    f"{base_url}/roadmaps/milestones/{milestone_id}/complete",
    headers=headers
)

# 5. Chat with AI mentor
chat_response = requests.post(f"{base_url}/ai/chat",
    headers=headers,
    json={
        "roadmap_id": roadmap_id,
        "message": "I completed my first milestone! What should I focus on next?"
    }
)
```

This comprehensive API reference provides all the information needed to integrate with the Pathyvo Career Counselor backend. For additional support, consult the interactive documentation at `/docs` when running the API server.
