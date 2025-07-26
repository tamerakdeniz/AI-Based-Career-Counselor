from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class Achievement(Base):
    __tablename__ = "achievements"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(String, nullable=False)
    icon = Column(String, nullable=False)  # Icon name (lucide-react icon)
    category = Column(String, nullable=False)  # e.g., "milestone", "roadmap", "general"
    condition_type = Column(String, nullable=False)  # e.g., "milestone_count", "roadmap_count", "join_date"
    condition_value = Column(Integer, nullable=True)  # Required value to unlock
    color_scheme = Column(String, nullable=False)  # CSS classes for styling
    is_hidden = Column(Boolean, default=False)  # Whether achievement is hidden until unlocked
    created_at = Column(DateTime, default=func.now())

    # Relationships
    user_achievements = relationship("UserAchievement", back_populates="achievement", cascade="all, delete-orphan")

class UserAchievement(Base):
    __tablename__ = "user_achievements"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    achievement_id = Column(Integer, ForeignKey("achievements.id"), nullable=False)
    unlocked_at = Column(DateTime, default=func.now())
    is_notified = Column(Boolean, default=False)  # Whether user has been notified

    # Relationships
    user = relationship("User", back_populates="user_achievements")
    achievement = relationship("Achievement", back_populates="user_achievements")
