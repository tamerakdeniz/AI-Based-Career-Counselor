from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class ChatMessageBase(BaseModel):
    type: str  # 'ai' or 'user'
    content: str

class ChatMessageCreate(ChatMessageBase):
    roadmap_id: int

class ChatMessage(ChatMessageBase):
    id: int
    roadmap_id: int
    user_id: int
    timestamp: datetime
    
    class Config:
        from_attributes = True 