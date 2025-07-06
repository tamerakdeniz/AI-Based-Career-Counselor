from sqlalchemy.orm import Session
from app.database import engine, SessionLocal
from app.models import Base, User, Roadmap, Milestone, ChatMessage
from app.core.security import get_password_hash
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

if __name__ == "__main__":
    init_database() 