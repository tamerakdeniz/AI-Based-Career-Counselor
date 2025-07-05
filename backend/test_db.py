#!/usr/bin/env python3
"""
Test script to verify database setup
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database_init import init_database
from app.database import SessionLocal
from app.models import User, Roadmap, Milestone, ChatMessage

def test_database():
    """Test database operations"""
    print("Testing database operations...")
    
    db = SessionLocal()
    try:
        # Test user creation
        user = db.query(User).first()
        if user:
            print(f"✅ Found user: {user.name} ({user.email})")
        else:
            print("❌ No users found")
            return
        
        # Test roadmaps
        roadmaps = db.query(Roadmap).filter(Roadmap.user_id == user.id).all()
        print(f"✅ Found {len(roadmaps)} roadmaps for user")
        
        for roadmap in roadmaps:
            print(f"  - {roadmap.title} ({roadmap.progress}% complete)")
            
            # Test milestones
            milestones = db.query(Milestone).filter(Milestone.roadmap_id == roadmap.id).all()
            print(f"    - {len(milestones)} milestones")
            
            for milestone in milestones:
                status = "✅" if getattr(milestone, "completed", False) is True else "⏳"
                print(f"      {status} {milestone.title}")
                resources = milestone.get_resources()
                if resources:
                    print(f"        Resources: {', '.join(resources)}")
        
        # Test chat messages
        messages = db.query(ChatMessage).filter(ChatMessage.user_id == user.id).all()
        print(f"✅ Found {len(messages)} chat messages")
        
        for message in messages[:3]:  # Show first 3 messages
            print(f"  - [{message.type.upper()}] {message.content[:50]}...")
        
        print("\n🎉 Database test completed successfully!")
        
    except Exception as e:
        print(f"❌ Error testing database: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    # Initialize database first
    print("Initializing database...")
    init_database()
    
    # Test the database
    test_database() 