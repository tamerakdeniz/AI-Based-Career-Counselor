#!/usr/bin/env python3
"""
Environment Setup Script for Career Counselor Backend
This script helps you create a secure .env file with proper configurations.
"""

import os
import secrets


def generate_jwt_secret():
    """Generate a cryptographically secure JWT secret key."""
    return secrets.token_urlsafe(32)

def create_env_file():
    """Create a .env file with secure defaults."""
    
    print("🔐 Career Counselor - Environment Setup")
    print("=" * 50)
    
    # Check if .env already exists
    if os.path.exists('.env'):
        response = input("⚠️  .env file already exists. Overwrite? (y/N): ")
        if response.lower() != 'y':
            print("Setup cancelled.")
            return
    
    # Generate JWT secret
    jwt_secret = generate_jwt_secret()
    print(f"✅ Generated secure JWT secret key: {jwt_secret}")
    
    # Get user inputs
    print("\n📝 Please provide the following information (press Enter for defaults):")
    
    # Database URL
    db_url = input("Database URL [sqlite:///./mentor.db]: ").strip()
    if not db_url:
        db_url = "sqlite:///./mentor.db"
    
    # CORS Origins
    cors_origins = input("CORS Origins [http://localhost:3000,http://localhost:5173]: ").strip()
    if not cors_origins:
        cors_origins = "http://localhost:3000,http://localhost:5173"
    
    # AI API Keys
    print("\n🤖 AI Service API Keys (optional for testing):")
    google_key = input("Google AI API Key [leave empty]: ").strip()
    openai_key = input("OpenAI API Key [leave empty]: ").strip()
    anthropic_key = input("Anthropic API Key [leave empty]: ").strip()
    
    # Create .env content
    env_content = f"""# Environment Configuration for Career Counselor Backend
# Generated on: {os.popen('date').read().strip()}

# CRITICAL SECURITY SETTINGS
# =========================

# JWT Secret Key - Keep this secure!
SECRET_KEY={jwt_secret}

# Database Configuration
DATABASE_URL={db_url}

# CORS Origins (comma-separated list)
CORS_ORIGINS_STR={cors_origins}

# AI Service API Keys
# ===================

# Google AI (Primary)
GOOGLE_AI_API_KEY={google_key or 'your-google-ai-api-key-here'}

# OpenAI (Fallback)
OPENAI_API_KEY={openai_key or 'your-openai-api-key-here'}

# Anthropic (Fallback)
ANTHROPIC_API_KEY={anthropic_key or 'your-anthropic-api-key-here'}

# AI Model Configuration
GEMINI_MODEL=gemini-2.0-flash
GEMINI_MAX_TOKENS=10000
GEMINI_TEMPERATURE=0.7
OPENAI_MODEL=gpt-3.5-turbo
OPENAI_MAX_TOKENS=500
OPENAI_TEMPERATURE=0.7
ANTHROPIC_MODEL=claude-3-haiku-20240307

# AI Provider Priority
AI_PROVIDER_PRIORITY_STR=gemini,openai,anthropic

# Rate Limiting Configuration
# ===========================
AI_REQUESTS_PER_MINUTE=10
AI_REQUESTS_PER_HOUR=100
AI_REQUESTS_PER_DAY=500

# Security Settings
# =================
MAX_CONVERSATION_LENGTH=50
MAX_MESSAGE_LENGTH=2000
AI_TIMEOUT_SECONDS=30
MAX_REQUEST_SIZE=1048576
REQUEST_TIMEOUT_SECONDS=30
MAX_JSON_PAYLOAD_SIZE=102400

# JWT Configuration
# =================
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# AI Safety Settings
# ==================
ENABLE_CONVERSATION_MEMORY=true
CONVERSATION_CONTEXT_LIMIT=5
"""

    # Write .env file
    try:
        with open('.env', 'w') as f:
            f.write(env_content)
        print(f"\n✅ Successfully created .env file!")
        print(f"🔑 Your JWT secret key: {jwt_secret}")
        print("\n⚠️  IMPORTANT SECURITY NOTES:")
        print("1. Never commit the .env file to version control")
        print("2. Keep your JWT secret key secure")
        print("3. Add your actual AI API keys when ready")
        print("4. For production, use PostgreSQL database")
        
    except Exception as e:
        print(f"\n❌ Error creating .env file: {e}")
        return
    
    # Show next steps
    print("\n🚀 Next Steps:")
    print("1. cd backend")
    print("2. python -m pip install -r requirements.txt")
    print("3. python app/database_init.py  # Initialize database")
    print("4. uvicorn app.main:app --reload  # Start server")
    print("5. Visit http://localhost:8000/docs to test API")

def main():
    """Main function."""
    create_env_file()

if __name__ == "__main__":
    main() 