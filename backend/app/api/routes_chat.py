# Key endpoints for test coverage: /chat/roadmap/{roadmap_id} (GET, POST)
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.chat_message import ChatMessage
from app.schemas.chat import ChatMessage as ChatMessageSchema, ChatMessageCreate

router = APIRouter(prefix="/chat", tags=["chat"])

# List chat messages for a roadmap
@router.get("/roadmap/{roadmap_id}", response_model=List[ChatMessageSchema])
def get_chat_messages(roadmap_id: int, db: Session = Depends(get_db)):
    return db.query(ChatMessage).filter(ChatMessage.roadmap_id == roadmap_id).all()

# Create a chat message for a roadmap
@router.post("/roadmap/{roadmap_id}", response_model=ChatMessageSchema, status_code=201)
def create_chat_message(roadmap_id: int, chat_message: ChatMessageCreate, db: Session = Depends(get_db)):
    new_message = ChatMessage(roadmap_id=roadmap_id, user_id=chat_message.user_id, type=chat_message.type, content=chat_message.content)
    db.add(new_message)
    db.commit()
    db.refresh(new_message)
    return new_message 