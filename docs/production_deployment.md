# Production Deployment Guide

This guide walks you through deploying the Career Counselor application to production with all security measures properly configured.

## 🚀 Pre-Deployment Checklist

### ✅ Security Requirements

- [ ] Generated secure JWT secret key
- [ ] Created production .env file
- [ ] Set up PostgreSQL database
- [ ] Configured HTTPS/SSL certificates
- [ ] Set up AI service API keys
- [ ] Configured monitoring and logging

### ✅ Infrastructure Requirements

- [ ] Web server (nginx/Apache) for frontend
- [ ] Application server for backend (uvicorn/gunicorn)
- [ ] Database server (PostgreSQL)
- [ ] SSL/TLS certificates
- [ ] Domain name configured

## 🔐 Step 1: Environment Configuration

### Generate Production JWT Secret

```bash
# Generate a new secret key for production (different from development)
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

### Create Production .env File

Create `/path/to/your/backend/.env` with:

```env
# PRODUCTION ENVIRONMENT CONFIGURATION
# ====================================

# JWT Secret Key - NEVER use development key in production!
SECRET_KEY=YOUR_NEW_PRODUCTION_SECRET_HERE

# Database Configuration - PostgreSQL for production
DATABASE_URL=postgresql://username:password@localhost:5432/career_counselor

# CORS Origins - Your actual domain
CORS_ORIGINS_STR=https://yourdomain.com,https://www.yourdomain.com

# AI Service API Keys
GOOGLE_AI_API_KEY=your_actual_google_ai_key
OPENAI_API_KEY=your_actual_openai_key
ANTHROPIC_API_KEY=your_actual_anthropic_key

# Production Security Settings
MAX_REQUEST_SIZE=1048576
REQUEST_TIMEOUT_SECONDS=30
ACCESS_TOKEN_EXPIRE_MINUTES=15

# Rate Limiting (adjust based on your needs)
AI_REQUESTS_PER_MINUTE=5
AI_REQUESTS_PER_HOUR=50
AI_REQUESTS_PER_DAY=200
```

## 🗄️ Step 2: Database Setup

### Install PostgreSQL

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib

# Create database
sudo -u postgres createdb career_counselor
sudo -u postgres createuser --interactive your_username
```

### Update Database Connection

```bash
# Set database URL environment variable
export DATABASE_URL="postgresql://username:password@localhost:5432/career_counselor"
```

## 🔒 Step 3: SSL/HTTPS Configuration

### Option A: Using Let's Encrypt (Recommended)

```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Generate SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### Option B: Custom SSL Certificate

Place your SSL certificates in `/etc/ssl/` and configure nginx accordingly.

## 🖥️ Step 4: Backend Deployment

### Install Dependencies

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Linux/Mac
# or venv\Scripts\activate  # Windows
pip install -r requirements.txt
```

### Run Database Migrations

```bash
python app/database_init.py
```

### Start Backend with Gunicorn

```bash
# Install gunicorn
pip install gunicorn

# Start backend server
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

### Create systemd Service (Linux)

Create `/etc/systemd/system/career-counselor.service`:

```ini
[Unit]
Description=Career Counselor Backend
After=network.target

[Service]
User=your_username
Group=your_group
WorkingDirectory=/path/to/your/backend
Environment=PATH=/path/to/your/backend/venv/bin
EnvironmentFile=/path/to/your/backend/.env
ExecStart=/path/to/your/backend/venv/bin/gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
Restart=always

[Install]
WantedBy=multi-user.target
```

```bash
# Enable and start service
sudo systemctl enable career-counselor
sudo systemctl start career-counselor
```

## 🌐 Step 5: Frontend Deployment

### Build Frontend

```bash
cd frontend
npm install
npm run build
```

### Nginx Configuration

Create `/etc/nginx/sites-available/career-counselor`:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Frontend
    location / {
        root /path/to/your/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api/ {
        proxy_pass http://127.0.0.1:8000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Security settings
    client_max_body_size 1M;
}
```

Enable the configuration:

```bash
sudo ln -s /etc/nginx/sites-available/career-counselor /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 📊 Step 6: Monitoring and Logging

### Set up Log Rotation

Create `/etc/logrotate.d/career-counselor`:

```
/var/log/career-counselor/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 your_username your_group
}
```

### Monitor System Health

```bash
# Check backend service
sudo systemctl status career-counselor

# Check logs
sudo journalctl -u career-counselor -f

# Check nginx
sudo systemctl status nginx
```

## 🔧 Step 7: Environment Variables Management

### Production Environment Variables

Set these on your production server:

```bash
# Add to ~/.bashrc or /etc/environment
export SECRET_KEY="your_production_secret"
export DATABASE_URL="postgresql://..."
export GOOGLE_AI_API_KEY="your_key"
export OPENAI_API_KEY="your_key"
export ANTHROPIC_API_KEY="your_key"
```

### Docker Deployment (Alternative)

Create `docker-compose.prod.yml`:

```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - '8000:8000'
    environment:
      - SECRET_KEY=${SECRET_KEY}
      - DATABASE_URL=${DATABASE_URL}
      - GOOGLE_AI_API_KEY=${GOOGLE_AI_API_KEY}
    depends_on:
      - db
    restart: unless-stopped

  db:
    image: postgres:13
    environment:
      - POSTGRES_DB=career_counselor
      - POSTGRES_USER=${DB_USER}
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  frontend:
    build: ./frontend
    ports:
      - '80:80'
      - '443:443'
    volumes:
      - ./ssl:/etc/ssl
    restart: unless-stopped

volumes:
  postgres_data:
```

## 🧪 Step 8: Testing Production Deployment

### Run Security Tests

```bash
cd backend
python test_security.py
```

### Manual Testing Checklist

- [ ] HTTPS redirects working
- [ ] Authentication flow works
- [ ] Rate limiting active
- [ ] Security headers present
- [ ] Database connections stable
- [ ] AI endpoints protected
- [ ] File upload limits enforced

## 🚨 Security Monitoring

### Set up Alerts

Monitor these metrics:

- Failed authentication attempts
- Rate limit violations
- Large request attempts
- Unusual API usage patterns
- Database connection errors

### Log Analysis

```bash
# Monitor authentication failures
grep "401\|403" /var/log/nginx/access.log

# Monitor rate limiting
grep "429" /var/log/nginx/access.log

# Check application errors
sudo journalctl -u career-counselor --since "1 hour ago"
```

## 🔄 Maintenance

### Regular Tasks

- **Weekly**: Review security logs
- **Monthly**: Update dependencies
- **Quarterly**: Rotate API keys
- **Annually**: Renew SSL certificates

### Backup Strategy

```bash
# Database backup
pg_dump career_counselor > backup_$(date +%Y%m%d).sql

# Environment backup (excluding secrets)
cp .env .env.backup
```

## 🆘 Troubleshooting

### Common Issues

1. **JWT Token Issues**

   ```bash
   # Check if environment variables are loaded
   python -c "from app.core.config import settings; print(settings.secret_key[:10])"
   ```

2. **Database Connection Issues**

   ```bash
   # Test database connection
   python -c "from app.database import engine; engine.connect()"
   ```

3. **SSL Certificate Issues**

   ```bash
   # Check certificate expiry
   openssl x509 -in /etc/letsencrypt/live/yourdomain.com/cert.pem -text -noout
   ```

4. **Rate Limiting Not Working**
   ```bash
   # Check Redis connection (if using Redis)
   redis-cli ping
   ```

## 📞 Support

If you encounter issues during deployment:

1. Check the logs first
2. Verify environment variables
3. Test database connectivity
4. Confirm SSL certificate validity
5. Review nginx configuration

Remember: Never expose your `.env` file or commit secrets to version control!
