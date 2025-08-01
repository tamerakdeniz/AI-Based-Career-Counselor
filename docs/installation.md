# Installation Guide - Pathyvo Career Counselor

This comprehensive guide will walk you through setting up the Pathyvo Career Counselor application for development and production environments.

## 📋 Table of Contents

- [System Requirements](#system-requirements)
- [Quick Start (Development)](#quick-start-development)
- [Detailed Setup](#detailed-setup)
- [Environment Configuration](#environment-configuration)
- [Database Setup](#database-setup)
- [AI Service Integration](#ai-service-integration)
- [Docker Installation](#docker-installation)
- [Production Deployment](#production-deployment)
- [Troubleshooting](#troubleshooting)
- [Verification](#verification)

## 🖥️ System Requirements

### Minimum Requirements

**For Development:**
- **OS**: Windows 10+, macOS 10.15+, or Linux (Ubuntu 18.04+)
- **Node.js**: 18.0 or higher
- **Python**: 3.8 or higher
- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 2GB free space
- **Internet**: Required for AI API access

**For Production:**
- **OS**: Linux (Ubuntu 20.04+ recommended)
- **RAM**: 8GB minimum, 16GB recommended
- **Storage**: 10GB free space
- **Database**: PostgreSQL 12+ (recommended for production)
- **Web Server**: Nginx or Apache
- **SSL Certificate**: Required for HTTPS

### Recommended Tools

- **Code Editor**: VS Code, WebStorm, or similar
- **Git**: For version control
- **Docker**: For containerized deployment (optional)
- **Redis**: For rate limiting (production)

## 🚀 Quick Start (Development)

Follow these steps to get the application running locally in under 10 minutes:

### 1. Clone the Repository

```bash
git clone https://github.com/your-organization/Career-Counselor.git
cd Career-Counselor
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your settings (see Environment Configuration section)

# Initialize database
python app/database_init.py

# Start backend server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 3. Frontend Setup

Open a new terminal window:

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### 4. Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## 🔧 Detailed Setup

### Backend Setup (Python/FastAPI)

#### 1. Python Environment

```bash
# Check Python version
python --version  # Should be 3.8+

# Create virtual environment
cd backend
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Upgrade pip
python -m pip install --upgrade pip
```

#### 2. Install Dependencies

```bash
# Install requirements
pip install -r requirements.txt

# Verify installation
pip list
```

#### 3. Environment Configuration

Create `.env` file in the backend directory:

```bash
cp .env.example .env
```

Edit the `.env` file with your configuration:

```env
# JWT Configuration - IMPORTANT: Change secret key!
SECRET_KEY=your-secure-secret-key-here-minimum-32-characters-long
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Database Configuration
DATABASE_URL=sqlite:///./mentor.db

# CORS Configuration
CORS_ORIGINS_STR=http://localhost:3000,http://localhost:5173

# AI Service Configuration
GOOGLE_AI_API_KEY=your_google_ai_api_key_here
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

#### 4. Database Initialization

```bash
# Initialize database with sample data
python app/database_init.py

# Test database connection
python -c "from app.database import engine; print('Database connection successful!')"
```

#### 5. Start Backend Server

```bash
# Development server with auto-reload
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Alternative: Using Python directly
python -m app.main
```

### Frontend Setup (React/TypeScript)

#### 1. Node.js Environment

```bash
# Check Node.js version
node --version  # Should be 18+
npm --version

# Navigate to frontend directory
cd frontend
```

#### 2. Install Dependencies

```bash
# Install packages
npm install

# Verify installation
npm list --depth=0
```

#### 3. Environment Configuration

Create `.env` file in the frontend directory (optional):

```bash
# Create environment file
echo "VITE_API_BASE_URL=http://localhost:8000" > .env
```

Full `.env` configuration:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:8000

# Application Configuration
VITE_APP_NAME=Pathyvo
VITE_APP_VERSION=1.0.0

# Feature Flags
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_ACHIEVEMENTS=true

# Development Settings
VITE_DEBUG_MODE=true
```

#### 4. Start Development Server

```bash
# Start with hot reload
npm run dev

# Alternative: Using yarn
yarn dev
```

## 🗄️ Database Setup

### SQLite (Development)

SQLite is used by default for development. No additional setup required.

```bash
# Database file location
backend/mentor.db

# Initialize with sample data
cd backend
python app/database_init.py
```

### PostgreSQL (Production)

For production deployments, PostgreSQL is recommended:

#### 1. Install PostgreSQL

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
```

**macOS:**
```bash
brew install postgresql
brew services start postgresql
```

**Windows:**
Download from https://www.postgresql.org/download/windows/

#### 2. Create Database

```bash
# Switch to postgres user
sudo -u postgres psql

# Create database and user
CREATE DATABASE career_counselor;
CREATE USER pathyvo_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE career_counselor TO pathyvo_user;
\q
```

#### 3. Update Configuration

Update your `.env` file:

```env
DATABASE_URL=postgresql://pathyvo_user:secure_password@localhost:5432/career_counselor
```

#### 4. Initialize PostgreSQL Database

```bash
cd backend
python app/database_init.py
```

## 🤖 AI Service Integration

### Google Gemini API (Primary)

1. **Get API Key**:
   - Visit [Google AI Studio](https://aistudio.google.com/)
   - Create a new project or select existing
   - Generate API key

2. **Configure Environment**:
   ```env
   GOOGLE_AI_API_KEY=your_actual_google_ai_key
   GEMINI_MODEL=gemini-2.0-flash
   ```

3. **Test Integration**:
   ```bash
   # Test AI service
   python -c "from app.services.llm_service import llm_service; print('AI service ready!')"
   ```

### OpenAI API (Fallback)

1. **Get API Key**:
   - Visit [OpenAI Platform](https://platform.openai.com/)
   - Create account and generate API key

2. **Configure Environment**:
   ```env
   OPENAI_API_KEY=your_actual_openai_key
   OPENAI_MODEL=gpt-3.5-turbo
   ```

### Anthropic Claude (Fallback)

1. **Get API Key**:
   - Visit [Anthropic Console](https://console.anthropic.com/)
   - Create account and generate API key

2. **Configure Environment**:
   ```env
   ANTHROPIC_API_KEY=your_actual_anthropic_key
   ANTHROPIC_MODEL=claude-3-haiku-20240307
   ```

## 🐳 Docker Installation

### Quick Docker Setup

1. **Install Docker**:
   - Windows/macOS: [Docker Desktop](https://www.docker.com/products/docker-desktop)
   - Linux: Follow [official guide](https://docs.docker.com/engine/install/)

2. **Clone and Build**:
   ```bash
   git clone https://github.com/your-organization/Career-Counselor.git
   cd Career-Counselor
   ```

3. **Create Environment File**:
   ```bash
   cp backend/.env.example backend/.env
   # Edit backend/.env with your configuration
   ```

4. **Build and Run**:
   ```bash
   docker-compose up --build
   ```

### Custom Docker Configuration

**docker-compose.override.yml** for development:

```yaml
version: '3.9'
services:
  backend:
    volumes:
      - ./backend:/app
    environment:
      - DEBUG=True
    command: uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
  
  frontend:
    volumes:
      - ./frontend:/app
    command: npm run dev -- --host 0.0.0.0
```

### Docker Services

- **Backend**: http://localhost:8000
- **Frontend**: http://localhost:80
- **Database**: Internal networking (no external access)

## 🚀 Production Deployment

### Server Preparation

1. **Update System**:
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

2. **Install Dependencies**:
   ```bash
   # Python and pip
   sudo apt install python3 python3-pip python3-venv

   # Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt install -y nodejs

   # Nginx
   sudo apt install nginx

   # PostgreSQL
   sudo apt install postgresql postgresql-contrib
   ```

### Backend Production Setup

1. **Create Production User**:
   ```bash
   sudo adduser pathyvo
   sudo usermod -aG www-data pathyvo
   ```

2. **Deploy Code**:
   ```bash
   cd /home/pathyvo
   git clone https://github.com/your-organization/Career-Counselor.git
   cd Career-Counselor/backend
   ```

3. **Setup Virtual Environment**:
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```

4. **Configure Production Environment**:
   ```bash
   cp .env.example .env
   # Edit with production values
   ```

5. **Setup Systemd Service**:
   ```bash
   sudo nano /etc/systemd/system/pathyvo-backend.service
   ```

   ```ini
   [Unit]
   Description=Pathyvo Backend
   After=network.target

   [Service]
   User=pathyvo
   Group=www-data
   WorkingDirectory=/home/pathyvo/Career-Counselor/backend
   Environment=PATH=/home/pathyvo/Career-Counselor/backend/venv/bin
   EnvironmentFile=/home/pathyvo/Career-Counselor/backend/.env
   ExecStart=/home/pathyvo/Career-Counselor/backend/venv/bin/gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
   Restart=always

   [Install]
   WantedBy=multi-user.target
   ```

6. **Start Service**:
   ```bash
   sudo systemctl enable pathyvo-backend
   sudo systemctl start pathyvo-backend
   ```

### Frontend Production Setup

1. **Build Frontend**:
   ```bash
   cd /home/pathyvo/Career-Counselor/frontend
   npm install
   npm run build
   ```

2. **Configure Nginx**:
   ```bash
   sudo nano /etc/nginx/sites-available/pathyvo
   ```

   ```nginx
   server {
       listen 80;
       server_name your-domain.com www.your-domain.com;
       return 301 https://$server_name$request_uri;
   }

   server {
       listen 443 ssl http2;
       server_name your-domain.com www.your-domain.com;

       ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
       ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

       location / {
           root /home/pathyvo/Career-Counselor/frontend/dist;
           try_files $uri $uri/ /index.html;
       }

       location /api/ {
           proxy_pass http://127.0.0.1:8000/;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   ```

3. **Enable Site**:
   ```bash
   sudo ln -s /etc/nginx/sites-available/pathyvo /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl reload nginx
   ```

### SSL Certificate Setup

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Generate certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Test auto-renewal
sudo certbot renew --dry-run
```

## 🔍 Troubleshooting

### Common Issues

#### Backend Issues

**1. Module Not Found Error**
```bash
# Ensure virtual environment is activated
source venv/bin/activate  # Linux/macOS
venv\Scripts\activate     # Windows

# Reinstall dependencies
pip install -r requirements.txt
```

**2. Database Connection Error**
```bash
# Check database file permissions
ls -la mentor.db

# Recreate database
rm mentor.db
python app/database_init.py
```

**3. JWT Secret Key Warning**
```bash
# Generate new secret key
python -c "import secrets; print(secrets.token_urlsafe(32))"
# Update SECRET_KEY in .env
```

#### Frontend Issues

**1. Node.js Version Error**
```bash
# Check Node.js version
node --version

# Update Node.js if needed
# Using nvm (recommended):
nvm install 18
nvm use 18
```

**2. Package Installation Fails**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**3. Build Errors**
```bash
# Check TypeScript errors
npm run lint

# Build with verbose output
npm run build -- --verbose
```

#### API Connection Issues

**1. CORS Errors**
```bash
# Check backend CORS configuration in .env
CORS_ORIGINS_STR=http://localhost:3000,http://localhost:5173

# Restart backend server
```

**2. Authentication Errors**
```bash
# Clear browser storage
# In browser developer tools:
localStorage.clear();
sessionStorage.clear();
```

### Log Analysis

**Backend Logs**
```bash
# Development
uvicorn app.main:app --log-level debug

# Production (systemd)
sudo journalctl -u pathyvo-backend -f
```

**Frontend Logs**
```bash
# Development console
# Check browser developer tools > Console

# Build logs
npm run build -- --verbose
```

### Performance Issues

**1. Slow API Responses**
```bash
# Check database queries
# Add logging to app/services/
import logging
logging.basicConfig(level=logging.DEBUG)
```

**2. High Memory Usage**
```bash
# Monitor process
top -p $(pgrep -f "uvicorn")

# Check database size
ls -lh *.db
```

## ✅ Verification

### Development Verification Checklist

- [ ] **Backend Health Check**
  ```bash
  curl http://localhost:8000/
  # Should return: {"message": "Welcome to Pathyvo API"}
  ```

- [ ] **API Documentation Access**
  ```bash
  # Visit http://localhost:8000/docs
  # Should display Swagger UI
  ```

- [ ] **Frontend Access**
  ```bash
  # Visit http://localhost:5173
  # Should display landing page
  ```

- [ ] **Database Connectivity**
  ```bash
  python -c "from app.database import engine; engine.connect(); print('Database OK')"
  ```

- [ ] **AI Service Test**
  ```bash
  # Register a user and try generating a roadmap
  # Should receive AI-generated career roadmap
  ```

### Production Verification Checklist

- [ ] **HTTPS Redirection**
  ```bash
  curl -I http://your-domain.com
  # Should return 301 redirect to HTTPS
  ```

- [ ] **SSL Certificate**
  ```bash
  curl -I https://your-domain.com
  # Should connect without SSL errors
  ```

- [ ] **Backend Service Status**
  ```bash
  sudo systemctl status pathyvo-backend
  # Should show "active (running)"
  ```

- [ ] **Database Connection**
  ```bash
  psql -h localhost -U pathyvo_user -d career_counselor -c "SELECT 1;"
  ```

- [ ] **Rate Limiting**
  ```bash
  # Test API rate limits by making multiple requests
  # Should receive 429 status after exceeding limits
  ```

### Performance Verification

**Backend Performance**
```bash
# Test API response time
curl -w "@curl-format.txt" -s -o /dev/null http://localhost:8000/auth/me
```

**Frontend Performance**
```bash
# Build size analysis
npm run build
ls -lh dist/assets/
```

**Database Performance**
```bash
# Check query performance
python -c "
from app.database import SessionLocal
from app.models.user import User
import time
start = time.time()
db = SessionLocal()
users = db.query(User).all()
print(f'Query took {time.time() - start:.3f}s')
"
```

## 📞 Support

If you encounter issues during installation:

1. **Check the logs** for specific error messages
2. **Verify prerequisites** are met (Python/Node.js versions)
3. **Review environment variables** for typos or missing values
4. **Check file permissions** for database and log files
5. **Consult the troubleshooting section** for common solutions

For additional help:
- Review the [API Documentation](./api-reference.md)
- Check [Security Guidelines](./security_guidelines.md)
- See [Production Deployment](./production_deployment.md)
- Create an issue on the project repository

## 🔄 Updates and Maintenance

### Updating the Application

**Backend Updates**
```bash
cd backend
git pull origin main
source venv/bin/activate
pip install -r requirements.txt
sudo systemctl restart pathyvo-backend
```

**Frontend Updates**
```bash
cd frontend
git pull origin main
npm install
npm run build
sudo systemctl reload nginx
```

### Regular Maintenance

- **Weekly**: Check logs for errors
- **Monthly**: Update dependencies
- **Quarterly**: Review security settings
- **Annually**: Renew SSL certificates

This completes the comprehensive installation guide for the Pathyvo Career Counselor application. Follow these steps carefully for a successful setup!