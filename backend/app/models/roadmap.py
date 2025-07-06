from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class Roadmap(Base):
    __tablename__ = "roadmaps"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(String, nullable=True)
    field = Column(String, nullable=True)
    progress = Column(Integer, default=0)
    next_milestone = Column(String, nullable=True)
    total_milestones = Column(Integer, default=0)
    completed_milestones = Column(Integer, default=0)
    estimated_time_to_complete = Column(String, nullable=True)
    created_at = Column(DateTime, default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="roadmaps")
    milestones = relationship("Milestone", back_populates="roadmap", cascade="all, delete-orphan")
    chat_messages = relationship("ChatMessage", back_populates="roadmap", cascade="all, delete-orphan")