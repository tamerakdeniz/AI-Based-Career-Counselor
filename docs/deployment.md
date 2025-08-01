# Deployment Guide - Pathyvo Career Counselor

[![Docker](https://img.shields.io/badge/Docker-Supported-blue.svg)](https://www.docker.com/)
[![Production Ready](https://img.shields.io/badge/Production-Ready-green.svg)](https://github.com/tamerakdeniz/AI-Based-Career-Counselor)

This guide covers different deployment strategies for the Pathyvo Career Counselor application, from development environments to production-ready setups.

## 📋 Table of Contents

- [Deployment Options](#deployment-options)
- [Local Development](#local-development)
- [Docker Deployment](#docker-deployment)
- [Cloud Deployment](#cloud-deployment)
- [Production Considerations](#production-considerations)
- [Monitoring & Maintenance](#monitoring--maintenance)
- [Troubleshooting](#troubleshooting)

## 🚀 Deployment Options

### Option 1: Local Development
- **Best for**: Development and testing
- **Setup time**: ~10 minutes
- **Resources**: Minimal (local machine)
- **Scalability**: Single user

### Option 2: Docker Compose
- **Best for**: Small to medium deployments
- **Setup time**: ~15 minutes
- **Resources**: Single server
- **Scalability**: Moderate

### Option 3: Cloud Deployment
- **Best for**: Production environments
- **Setup time**: ~30-60 minutes
- **Resources**: Cloud infrastructure
- **Scalability**: High

### Option 4: Kubernetes
- **Best for**: Enterprise deployments
- **Setup time**: ~2-4 hours
- **Resources**: Kubernetes cluster
- **Scalability**: Very high

## 💻 Local Development

### Prerequisites
- Node.js 18+
- Python 3.8+
- Git

### Quick Setup

```bash
# Clone the repository
git clone https://github.com/tamerakdeniz/AI-Based-Career-Counselor.git
cd Career-Counselor

# Backend setup
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your configuration
python app/database_init.py
uvicorn app.main:app --reload &

# Frontend setup (new terminal)
cd ../frontend
npm install
npm run dev &

# Access the application
echo "Frontend: http://localhost:5173"
echo "Backend API: http://localhost:8000"
echo "API Docs: http://localhost:8000/docs"
```

## 🐳 Docker Deployment

### Single Command Deployment

```bash
# Clone and deploy with Docker Compose
git clone https://github.com/tamerakdeniz/AI-Based-Career-Counselor.git
cd Career-Counselor

# Create environment file
cp backend/.env.example backend/.env
# Edit backend/.env with your settings

# Deploy with Docker Compose
docker-compose up --build -d

# Check status
docker-compose ps
```

### Custom Docker Configuration

Create a `docker-compose.override.yml` for custom settings:

```yaml
version: '3.9'
services:
  backend:
    environment:
      - SECRET_KEY=your-production-secret-key
      - GOOGLE_AI_API_KEY=your-google-ai-key
      - DATABASE_URL=postgresql://user:pass@db:5432/pathyvo
    volumes:
      - ./backend/uploads:/app/uploads
  
  frontend:
    environment:
      - VITE_API_BASE_URL=https://api.yourdomain.com
    
  database:
    environment:
      - POSTGRES_DB=pathyvo
      - POSTGRES_USER=pathyvo_user
      - POSTGRES_PASSWORD=secure_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backups:/backups

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/ssl/certs
    depends_on:
      - frontend
      - backend

volumes:
  postgres_data:
```

### Production Docker Setup

**1. Create production environment file:**

```bash
# backend/.env.production
SECRET_KEY=your-very-secure-production-secret-key-here
DATABASE_URL=postgresql://pathyvo_user:secure_password@db:5432/pathyvo
CORS_ORIGINS_STR=https://yourdomain.com,https://www.yourdomain.com
GOOGLE_AI_API_KEY=your_google_ai_api_key
AI_REQUESTS_PER_MINUTE=5
AI_REQUESTS_PER_HOUR=50
AI_REQUESTS_PER_DAY=200
```

**2. Create production Docker Compose:**

```yaml
# docker-compose.prod.yml
version: '3.9'
services:
  backend:
    build: 
      context: ./backend
      dockerfile: Dockerfile.prod
    environment:
      - ENV=production
    env_file:
      - ./backend/.env.production
    depends_on:
      - db
      - redis
    restart: unless-stopped
    
  frontend:
    build: 
      context: ./frontend
      dockerfile: Dockerfile.prod
    restart: unless-stopped
    
  db:
    image: postgres:13-alpine
    env_file:
      - ./backend/.env.production
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped
    
  redis:
    image: redis:7-alpine
    restart: unless-stopped
    
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/ssl/certs
    depends_on:
      - frontend
      - backend
    restart: unless-stopped

volumes:
  postgres_data:
```

**3. Deploy to production:**

```bash
docker-compose -f docker-compose.prod.yml up -d
```

## ☁️ Cloud Deployment

### AWS Deployment

#### Using AWS ECS (Recommended)

**1. Create ECS Cluster:**

```bash
# Install AWS CLI and configure
aws configure

# Create ECS cluster
aws ecs create-cluster --cluster-name pathyvo-cluster

# Create task definition
aws ecs register-task-definition --cli-input-json file://task-definition.json
```

**2. Task Definition (task-definition.json):**

```json
{
  "family": "pathyvo",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "executionRoleArn": "arn:aws:iam::account:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "backend",
      "image": "your-registry/pathyvo-backend:latest",
      "portMappings": [{"containerPort": 8000}],
      "environment": [
        {"name": "DATABASE_URL", "value": "postgresql://..."},
        {"name": "SECRET_KEY", "value": "your-secret-key"}
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/pathyvo",
          "awslogs-region": "us-west-2"
        }
      }
    },
    {
      "name": "frontend",
      "image": "your-registry/pathyvo-frontend:latest",
      "portMappings": [{"containerPort": 80}]
    }
  ]
}
```

**3. Create Application Load Balancer:**

```bash
# Create ALB
aws elbv2 create-load-balancer \
  --name pathyvo-alb \
  --subnets subnet-12345 subnet-67890 \
  --security-groups sg-12345

# Create target groups
aws elbv2 create-target-group \
  --name pathyvo-backend-tg \
  --protocol HTTP \
  --port 8000 \
  --vpc-id vpc-12345 \
  --target-type ip
```

#### Using AWS App Runner (Simpler Option)

```bash
# Create apprunner.yaml
cat > apprunner.yaml << EOF
version: 1.0
runtime: docker
build:
  commands:
    build:
      - echo "Building backend..."
      - docker build -t pathyvo-backend ./backend
run:
  runtime-version: latest
  command: uvicorn app.main:app --host 0.0.0.0 --port 8000
  network:
    port: 8000
    env:
      - SECRET_KEY
      - DATABASE_URL
      - GOOGLE_AI_API_KEY
EOF

# Deploy with App Runner
aws apprunner create-service \
  --service-name pathyvo-backend \
  --source-configuration '{
    "ImageRepository": {
      "ImageIdentifier": "your-registry/pathyvo-backend:latest",
      "ImageConfiguration": {
        "Port": "8000"
      }
    }
  }'
```

### Google Cloud Platform

#### Using Cloud Run

**1. Build and push containers:**

```bash
# Configure gcloud
gcloud auth configure-docker

# Build and push backend
cd backend
docker build -t gcr.io/your-project/pathyvo-backend .
docker push gcr.io/your-project/pathyvo-backend

# Build and push frontend
cd ../frontend
docker build -t gcr.io/your-project/pathyvo-frontend .
docker push gcr.io/your-project/pathyvo-frontend
```

**2. Deploy services:**

```bash
# Deploy backend
gcloud run deploy pathyvo-backend \
  --image gcr.io/your-project/pathyvo-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars SECRET_KEY=your-secret-key \
  --set-env-vars DATABASE_URL=your-db-url

# Deploy frontend
gcloud run deploy pathyvo-frontend \
  --image gcr.io/your-project/pathyvo-frontend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

**3. Set up Cloud SQL:**

```bash
# Create PostgreSQL instance
gcloud sql instances create pathyvo-db \
  --database-version POSTGRES_13 \
  --tier db-f1-micro \
  --region us-central1

# Create database
gcloud sql databases create pathyvo --instance pathyvo-db

# Create user
gcloud sql users create pathyvo-user \
  --instance pathyvo-db \
  --password secure-password
```

### Azure Deployment

#### Using Azure Container Instances

```bash
# Create resource group
az group create --name pathyvo-rg --location eastus

# Create container registry
az acr create --resource-group pathyvo-rg \
  --name pathyvoacr --sku Basic

# Build and push images
az acr build --registry pathyvoacr \
  --image pathyvo-backend:latest ./backend
az acr build --registry pathyvoacr \
  --image pathyvo-frontend:latest ./frontend

# Create container group
az container create \
  --resource-group pathyvo-rg \
  --name pathyvo-containers \
  --image pathyvoacr.azurecr.io/pathyvo-backend:latest \
  --dns-name-label pathyvo-api \
  --ports 8000
```

## 🚀 Production Considerations

### Security Checklist

- [ ] **HTTPS Enforcement**: SSL/TLS certificates configured
- [ ] **Environment Variables**: Secrets not hardcoded
- [ ] **Database Security**: Strong passwords, network restrictions
- [ ] **Rate Limiting**: API rate limits configured
- [ ] **CORS**: Proper CORS origins configured
- [ ] **Security Headers**: CSP, HSTS, X-Frame-Options set
- [ ] **Input Validation**: All inputs validated and sanitized
- [ ] **Error Handling**: No sensitive info in error messages

### Performance Optimization

**Backend Optimizations:**
```python
# gunicorn.conf.py
bind = "0.0.0.0:8000"
workers = 4
worker_class = "uvicorn.workers.UvicornWorker"
worker_connections = 1000
max_requests = 1000
max_requests_jitter = 100
preload_app = True
timeout = 30
keepalive = 5
```

**Frontend Optimizations:**
```javascript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          charts: ['chart.js', 'react-chartjs-2']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  }
})
```

### Database Optimization

**Connection Pooling:**
```python
# backend/app/database.py
from sqlalchemy.pool import QueuePool

engine = create_engine(
    settings.database_url,
    poolclass=QueuePool,
    pool_size=20,
    max_overflow=0,
    pool_pre_ping=True
)
```

**Indexing Strategy:**
```sql
-- Add indexes for frequently queried fields
CREATE INDEX idx_roadmaps_user_id ON roadmaps(user_id);
CREATE INDEX idx_milestones_roadmap_id ON milestones(roadmap_id);
CREATE INDEX idx_chat_messages_roadmap_id ON chat_messages(roadmap_id);
CREATE INDEX idx_achievements_user_id ON achievements(user_id);
```

### Backup Strategy

**Database Backups:**
```bash
#!/bin/bash
# backup.sh
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"
DB_NAME="pathyvo"

# Create backup
pg_dump $DATABASE_URL > "$BACKUP_DIR/pathyvo_$DATE.sql"

# Compress backup
gzip "$BACKUP_DIR/pathyvo_$DATE.sql"

# Keep only last 30 days
find $BACKUP_DIR -name "pathyvo_*.sql.gz" -mtime +30 -delete

# Upload to cloud storage (optional)
aws s3 cp "$BACKUP_DIR/pathyvo_$DATE.sql.gz" s3://pathyvo-backups/
```

**Application Backups:**
```bash
#!/bin/bash
# app-backup.sh
tar -czf "pathyvo-app-$(date +%Y%m%d).tar.gz" \
  --exclude=node_modules \
  --exclude=venv \
  --exclude=.git \
  --exclude=*.log \
  ./Career-Counselor
```

## 📊 Monitoring & Maintenance

### Health Checks

**Backend Health Check:**
```python
# backend/app/api/health.py
@router.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow(),
        "version": "1.0.0",
        "database": await check_database_health(),
        "ai_service": await check_ai_service_health()
    }
```

**Docker Health Checks:**
```dockerfile
# Backend Dockerfile
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8000/health || exit 1
```

### Logging Configuration

**Structured Logging:**
```python
# backend/app/core/logging.py
import structlog

structlog.configure(
    processors=[
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.add_log_level,
        structlog.processors.JSONRenderer()
    ],
    wrapper_class=structlog.make_filtering_bound_logger(20),
    logger_factory=structlog.PrintLoggerFactory(),
    cache_logger_on_first_use=True,
)
```

**Log Aggregation (ELK Stack):**
```yaml
# docker-compose.logging.yml
version: '3.9'
services:
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:7.15.0
    environment:
      - discovery.type=single-node
    ports:
      - "9200:9200"
      
  logstash:
    image: docker.elastic.co/logstash/logstash:7.15.0
    volumes:
      - ./logstash.conf:/usr/share/logstash/pipeline/logstash.conf
      
  kibana:
    image: docker.elastic.co/kibana/kibana:7.15.0
    ports:
      - "5601:5601"
    depends_on:
      - elasticsearch
```

### Metrics Collection

**Prometheus Configuration:**
```yaml
# prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'pathyvo-backend'
    static_configs:
      - targets: ['backend:8000']
    metrics_path: '/metrics'
```

**Application Metrics:**
```python
# backend/app/core/metrics.py
from prometheus_client import Counter, Histogram, generate_latest

REQUEST_COUNT = Counter('requests_total', 'Total requests', ['method', 'endpoint'])
REQUEST_DURATION = Histogram('request_duration_seconds', 'Request duration')

@app.middleware("http")
async def metrics_middleware(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    REQUEST_COUNT.labels(request.method, request.url.path).inc()
    REQUEST_DURATION.observe(time.time() - start_time)
    return response
```

### Alerting

**Alert Rules:**
```yaml
# alert-rules.yml
groups:
  - name: pathyvo-alerts
    rules:
      - alert: HighErrorRate
        expr: rate(requests_total{status=~"5.."}[5m]) > 0.1
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: High error rate detected
          
      - alert: DatabaseDown
        expr: up{job="pathyvo-database"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: Database is down
```

## 🔧 Troubleshooting

### Common Issues

**1. Database Connection Issues**
```bash
# Check database connectivity
docker exec -it pathyvo-backend python -c "
from app.database import engine
try:
    conn = engine.connect()
    print('Database connection successful')
    conn.close()
except Exception as e:
    print(f'Database connection failed: {e}')
"
```

**2. Frontend Build Issues**
```bash
# Clear cache and rebuild
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run build
```

**3. AI Service Issues**
```bash
# Test AI service connectivity
curl -X POST "http://localhost:8000/ai/generate-roadmap" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"field":"test","user_responses":{}}'
```

**4. Memory Issues**
```bash
# Monitor memory usage
docker stats

# Increase memory limits
docker-compose -f docker-compose.yml \
  -f docker-compose.override.yml \
  up -d
```

### Performance Debugging

**Backend Performance:**
```python
# Add performance profiling
import cProfile
import pstats

@app.middleware("http")
async def profile_middleware(request: Request, call_next):
    if request.url.path.startswith("/api/"):
        profiler = cProfile.Profile()
        profiler.enable()
        response = await call_next(request)
        profiler.disable()
        
        # Log slow requests
        stats = pstats.Stats(profiler)
        if stats.total_tt > 1.0:  # Log requests slower than 1 second
            logger.warning(f"Slow request: {request.url.path} took {stats.total_tt:.2f}s")
        
        return response
    return await call_next(request)
```

**Database Query Analysis:**
```sql
-- Enable query logging in PostgreSQL
ALTER SYSTEM SET log_statement = 'all';
ALTER SYSTEM SET log_min_duration_statement = 1000;  -- Log queries > 1s
SELECT pg_reload_conf();

-- Analyze slow queries
SELECT query, calls, total_time, mean_time
FROM pg_stat_statements
ORDER BY total_time DESC
LIMIT 10;
```

### Log Analysis

**Common Log Patterns:**
```bash
# Backend errors
docker logs pathyvo-backend 2>&1 | grep ERROR

# Database connections
docker logs pathyvo-backend 2>&1 | grep "database"

# AI service calls
docker logs pathyvo-backend 2>&1 | grep "ai_service"

# Rate limiting
docker logs pathyvo-backend 2>&1 | grep "rate_limit"
```

## 📞 Support and Updates

### Updating the Application

**Rolling Updates:**
```bash
# Pull latest changes
git pull origin main

# Update backend
docker-compose build backend
docker-compose up -d --no-deps backend

# Update frontend
docker-compose build frontend
docker-compose up -d --no-deps frontend

# Run migrations if needed
docker exec pathyvo-backend python app/database_init.py
```

**Zero-Downtime Updates:**
```bash
# Blue-green deployment script
./scripts/blue-green-deploy.sh
```

### Scaling Guidelines

**Horizontal Scaling:**
- Add more backend instances behind load balancer
- Use read replicas for database
- Implement Redis for session storage
- Consider microservices architecture

**Vertical Scaling:**
- Increase container memory and CPU limits
- Optimize database configuration
- Enable database connection pooling
- Use faster storage (SSD)

This deployment guide provides multiple options for deploying Pathyvo Career Counselor, from simple development setups to enterprise-grade production environments. Choose the deployment strategy that best fits your requirements and scale as needed.