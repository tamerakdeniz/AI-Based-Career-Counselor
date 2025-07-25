import json

from app.database import Base
from sqlalchemy import (Boolean, Column, DateTime, ForeignKey, Integer, String,
                        Text)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func


class Roadmap(Base):
    __tablename__ = "roadmaps"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(String, nullable=True)
    short_title = Column(String, nullable=True)
    short_description = Column(String, nullable=True)
    field = Column(String, nullable=True)
    progress = Column(Integer, default=0)
    next_milestone = Column(String, nullable=True)
    total_milestones = Column(Integer, default=0)
    completed_milestones = Column(Integer, default=0)
    estimated_time_to_complete = Column(String, nullable=True)
    created_at = Column(DateTime, default=func.now())
    
    # AI-specific fields
    ai_generated = Column(Boolean, default=False)  # Whether roadmap was AI-generated
    conversation_stage = Column(String, nullable=True)  # Current conversation stage
    conversation_completed = Column(Boolean, default=False)  # Whether initial conversation is complete
    collected_data = Column(Text, nullable=True)  # JSON string of collected user data
    
    # Relationships
    user = relationship("User", back_populates="roadmaps")
    milestones = relationship("Milestone", back_populates="roadmap", cascade="all, delete-orphan")
    chat_messages = relationship("ChatMessage", back_populates="roadmap", cascade="all, delete-orphan")
    
    def get_collected_data(self):
        """Get collected data as a dict"""
        value = getattr(self, "collected_data", None)
        if isinstance(value, str) and value:
            try:
                return json.loads(value)
            except json.JSONDecodeError:
                return {}
        return {}

    def set_collected_data(self, data_dict):
        """Set collected data from a dict"""
        if data_dict:
            self.collected_data = json.dumps(data_dict)
        else:
            self.collected_data = None