# Production Deployment Instructions

## Prerequisites
1. Ensure you have Docker and Docker Compose installed on your server
2. Create a `.env` file in the backend directory (copy from `.env.example`)
3. Set up your API keys and production configurations

## Steps to Deploy

### 1. Create Backend Environment File
```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env` and update:
- `SECRET_KEY`: Generate a secure JWT secret key (32+ characters)
- `GOOGLE_AI_API_KEY`: Your Google AI API key
- `OPENAI_API_KEY`: Your OpenAI API key (optional)
- `ANTHROPIC_API_KEY`: Your Anthropic API key (optional)
- `CORS_ORIGINS_STR`: Add your production domain

### 2. Build and Deploy
```bash
# Build and start the services
docker-compose up --build -d

# Check if services are running
docker-compose ps

# View logs
docker-compose logs -f
```

### 3. Important Security Notes
- Never use the default JWT secret key in production
- Make sure to set up proper firewall rules
- Consider using a reverse proxy (nginx) for SSL termination
- Set up proper database backups for the SQLite file

### 4. Environment Variables Required

**Backend (.env):**
- `SECRET_KEY`: JWT secret key (REQUIRED)
- `GOOGLE_AI_API_KEY`: Google AI API key (REQUIRED)
- `CORS_ORIGINS_STR`: Allowed origins for CORS
- `DATABASE_URL`: Database connection string
- `REDIS_HOST`: Redis host (optional)
- `REDIS_PORT`: Redis port (optional)

**Frontend (automatically set via Docker):**
- `VITE_API_BASE_URL`: Backend API URL

### 5. Troubleshooting
- If frontend can't connect to backend, check CORS settings
- If AI features don't work, verify API keys are set correctly
- Check Docker logs for detailed error messages
- Ensure ports 80 and 8000 are accessible

### 6. SSL Setup (Recommended)
For production, set up SSL/TLS certificates:
- Use Let's Encrypt with certbot
- Configure nginx as reverse proxy
- Update CORS origins to use https://
