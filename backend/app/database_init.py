from sqlalchemy.orm import Session
from app.database import engine, SessionLocal
from app.models import Base, User, Roadmap, Milestone, ChatMessage, Achievement, UserAchievement
from app.core.security import get_password_hash
from app.services.achievement_service import achievement_service
from datetime import datetime, date
import json

def create_tables():
    """Create all database tables"""
    Base.metadata.create_all(bind=engine)

def init_database():
    """Initialize database with tables and sample data"""
    print("Creating database tables...")
    create_tables()
    print("Tables created successfully!")
    
    # Seed achievements
    print("Seeding default achievements...")
    db = SessionLocal()
    try:
        achievement_service.seed_default_achievements(db)
        print("Achievements seeded successfully!")
    finally:
        db.close()

if __name__ == "__main__":
    init_database() 