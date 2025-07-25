from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    avatar = Column(String, nullable=True)
    joined_at = Column(DateTime, default=func.now())
    hashed_password = Column(String, nullable=False)

    # Relationships
    roadmaps = relationship("Roadmap", back_populates="user", cascade="all, delete-orphan", passive_deletes=True)
    chat_messages = relationship("ChatMessage", back_populates="user", cascade="all, delete-orphan", passive_deletes=True)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "avatar": self.avatar,
            "joined_at": self.joined_at.isoformat() if self.joined_at else None,
            # Add more fields if needed
        }
