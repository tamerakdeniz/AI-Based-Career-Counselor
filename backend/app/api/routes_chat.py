from typing import List

from app.api.routes_auth import verify_token
from app.core.security import validate_and_sanitize_input
from app.database import get_db
from app.models.chat_message import ChatMessage
from app.models.roadmap import Roadmap
from app.models.user import User
from app.schemas.chat import ChatMessage as ChatMessageSchema
from app.schemas.chat import ChatMessageCreate
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

router = APIRouter(prefix="/chat", tags=["chat"])

# List chat messages for a roadmap
@router.get("/roadmap/{roadmap_id}", response_model=List[ChatMessageSchema])
def get_chat_messages(
    roadmap_id: int, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(verify_token)
):
    # First, verify that the roadmap exists and belongs to the current user
    roadmap = db.query(Roadmap).filter(Roadmap.id == roadmap_id).first()
    if not roadmap:
        raise HTTPException(status_code=404, detail="Roadmap not found")
    
    # Ensure user can only access their own roadmap's chat messages
    if roadmap.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    return db.query(ChatMessage).filter(ChatMessage.roadmap_id == roadmap_id).all()

# Create a chat message for a roadmap
@router.post("/roadmap/{roadmap_id}", response_model=ChatMessageSchema, status_code=201)
def create_chat_message(
    roadmap_id: int, 
    chat_message: ChatMessageCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(verify_token)
):
    # First, verify that the roadmap exists and belongs to the current user
    roadmap = db.query(Roadmap).filter(Roadmap.id == roadmap_id).first()
    if not roadmap:
        raise HTTPException(status_code=404, detail="Roadmap not found")
    
    # Ensure user can only create messages for their own roadmaps
    if roadmap.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Ensure the user_id in the message matches the authenticated user
    if chat_message.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Cannot create messages for other users")
    
    # Validate and sanitize the message content
    sanitized_content = validate_and_sanitize_input(chat_message.content, max_length=2000)
    
    # Validate message type
    if chat_message.type not in ["user", "ai", "system"]:
        raise HTTPException(status_code=400, detail="Invalid message type")
    
    new_message = ChatMessage(
        roadmap_id=roadmap_id, 
        user_id=current_user.id,  # Use authenticated user's ID
        type=chat_message.type, 
        content=sanitized_content
    )
    db.add(new_message)
    db.commit()
    db.refresh(new_message)
    return new_message 