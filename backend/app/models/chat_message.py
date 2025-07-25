from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    roadmap_id = Column(Integer, ForeignKey("roadmaps.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    type = Column(String, nullable=False)  # 'ai' or 'user'
    content = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=func.now())
    
    # Relationships
    roadmap = relationship("Roadmap", back_populates="chat_messages")
    user = relationship("User", back_populates="chat_messages") 