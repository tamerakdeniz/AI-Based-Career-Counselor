from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class ChatMessageBase(BaseModel):
    type: str  # 'ai' or 'user'
    content: str

class ChatMessageCreate(ChatMessageBase):
    roadmap_id: int
    user_id: int

class ChatMessage(ChatMessageBase):
    id: int
    roadmap_id: int
    user_id: int
    timestamp: datetime
    
    class Config:
        from_attributes = True

class ChatMessageResponse(BaseModel):
    id: int
    type: str  # 'ai' or 'user'
    content: str
    roadmap_id: int
    user_id: int
    timestamp: datetime
    
    class Config:
        from_attributes = True 