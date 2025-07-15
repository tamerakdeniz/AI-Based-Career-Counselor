import json
import logging
from datetime import datetime
from typing import Any, Dict, List, Optional

from app.api.routes_auth import verify_token
from app.core.config import settings
from app.database import get_db
from app.models.chat_message import ChatMessage
from app.models.milestone import Milestone
from app.models.roadmap import Roadmap
from app.models.user import User
from app.schemas.chat import ChatMessageCreate, ChatMessageResponse
from app.schemas.roadmap import RoadmapCreate, RoadmapResponse
from app.services.llm_service import ConversationStage, llm_service
from app.services.prompt_service import (PromptContext, PromptType,
                                         prompt_service)
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/ai", tags=["AI-powered features"])

# Pydantic models for requests
from pydantic import BaseModel, Field


class RoadmapGenerationRequest(BaseModel):
    field: str = Field(..., description="The field of interest for the roadmap")
    description: Optional[str] = Field(None, description="Optional description of goals")
    initial_message: Optional[str] = Field(None, description="Initial message from user")

class ChatRequest(BaseModel):
    message: str = Field(..., description="User message")
    roadmap_id: int = Field(..., description="ID of the roadmap for context")

class ChatResponse(BaseModel):
    message: str = Field(..., description="AI response")
    stage: str = Field(..., description="Current conversation stage")
    roadmap_ready: bool = Field(False, description="Whether roadmap is ready to be generated")

# Rate limiting storage (in production, use Redis)
user_request_counts = {}

def check_rate_limit(user_id: int) -> bool:
    """Basic rate limiting check"""
    current_time = datetime.now()
    if user_id not in user_request_counts:
        user_request_counts[user_id] = []
    
    # Clean old requests (older than 1 hour)
    user_requests = user_request_counts[user_id]
    user_requests[:] = [req_time for req_time in user_requests if (current_time - req_time).seconds < 3600]
    
    # Check if under limit
    if len(user_requests) >= settings.ai_requests_per_hour:
        return False
    
    user_requests.append(current_time)
    return True

@router.post("/create-roadmap-conversation", response_model=Dict[str, Any])
async def create_roadmap_conversation(
    request: RoadmapGenerationRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(verify_token)
):
    """Create a new roadmap and start the AI conversation flow"""
    
    # Check rate limiting
    if not check_rate_limit(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many AI requests. Please try again later."
        )
    
    try:
        # Create new roadmap
        new_roadmap = Roadmap(
            user_id=current_user.id,
            title=f"Career Path in {request.field}",
            description=request.description or f"Discovering your career path in {request.field}",
            field=request.field,
            progress=0,
            total_milestones=0,
            completed_milestones=0
        )
        
        db.add(new_roadmap)
        db.commit()
        db.refresh(new_roadmap)
        
        # Generate initial AI greeting
        context = PromptContext(user_responses={})
        prompt_data = prompt_service.get_prompt(PromptType.INTERESTS_STRENGTHS, context)
        
        # Get AI response
        ai_response = await llm_service._call_ai_service(
            f"{prompt_data['system_prompt']}\n\n{prompt_data['user_prompt']}"
        )
        
        # Create initial AI message
        ai_message = ChatMessage(
            roadmap_id=new_roadmap.id,
            user_id=current_user.id,
            type='ai',
            content=ai_response
        )
        
        db.add(ai_message)
        db.commit()
        db.refresh(ai_message)
        
        return {
            "success": True,
            "roadmap_id": new_roadmap.id,
            "initial_message": ai_response,
            "stage": ConversationStage.INTERESTS_STRENGTHS.value
        }
        
    except Exception as e:
        logger.error(f"Error creating roadmap conversation: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create roadmap conversation"
        )

@router.post("/chat", response_model=ChatResponse)
async def chat_with_ai(
    request: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(verify_token)
):
    """Send a message to the AI mentor and get a response"""
    
    # Check rate limiting
    if not check_rate_limit(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many AI requests. Please try again later."
        )
    
    try:
        # Validate roadmap exists and belongs to user
        roadmap = db.query(Roadmap).filter(
            Roadmap.id == request.roadmap_id,
            Roadmap.user_id == current_user.id
        ).first()
        
        if not roadmap:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Roadmap not found"
            )
        
        # Save user message
        user_message = ChatMessage(
            roadmap_id=request.roadmap_id,
            user_id=current_user.id,
            type='user',
            content=request.message
        )
        
        db.add(user_message)
        db.commit()
        
        # Get conversation context
        context = await llm_service._get_conversation_context(request.roadmap_id, db)
        
        # Check if we should generate roadmap
        if context.stage == ConversationStage.ROADMAP_GENERATION:
            # Generate roadmap
            roadmap_data = await llm_service.generate_career_roadmap(request.roadmap_id, db)
            
            # Update roadmap with AI-generated data
            roadmap.title = roadmap_data.get('title', roadmap.title)
            roadmap.description = roadmap_data.get('description', roadmap.description)
            roadmap.field = roadmap_data.get('field', roadmap.field)
            
            # Create milestones
            milestones_data = roadmap_data.get('milestones', [])
            for milestone_data in milestones_data:
                milestone = Milestone(
                    roadmap_id=roadmap.id,
                    title=milestone_data.get('title', ''),
                    description=milestone_data.get('description', ''),
                    completed=False
                )
                # Set resources as JSON string
                resources = milestone_data.get('resources', [])
                if resources:
                    milestone.set_resources(resources)
                
                db.add(milestone)
            
            roadmap.total_milestones = len(milestones_data)
            db.commit()
            
            ai_response = "Perfect! I've created your personalized career roadmap. You can now view it in detail and start working through the milestones. How does it look?"
            
            # Create AI message
            ai_message = ChatMessage(
                roadmap_id=request.roadmap_id,
                user_id=current_user.id,
                type='ai',
                content=ai_response
            )
            
            db.add(ai_message)
            db.commit()
            
            return ChatResponse(
                message=ai_response,
                stage=ConversationStage.MENTORING.value,
                roadmap_ready=True
            )
        
        # Generate follow-up question or mentoring response
        if context.stage == ConversationStage.MENTORING:
            # Get mentoring response
            ai_response = await llm_service.get_mentoring_response(
                request.roadmap_id, request.message, db
            )
            current_stage = ConversationStage.MENTORING.value
        else:
            # Get follow-up question
            ai_response, current_stage = await llm_service.generate_follow_up_question(
                request.roadmap_id, request.message, db
            )
        
        # Create AI message
        ai_message = ChatMessage(
            roadmap_id=request.roadmap_id,
            user_id=current_user.id,
            type='ai',
            content=ai_response
        )
        
        db.add(ai_message)
        db.commit()
        
        return ChatResponse(
            message=ai_response,
            stage=current_stage.value if hasattr(current_stage, 'value') else current_stage,
            roadmap_ready=current_stage == ConversationStage.MENTORING
        )
        
    except Exception as e:
        logger.error(f"Error in AI chat: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to process chat message"
        )

@router.post("/regenerate-roadmap/{roadmap_id}")
async def regenerate_roadmap(
    roadmap_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(verify_token)
):
    """Regenerate a roadmap using AI based on the conversation history"""
    
    # Check rate limiting
    if not check_rate_limit(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many AI requests. Please try again later."
        )
    
    try:
        # Validate roadmap exists and belongs to user
        roadmap = db.query(Roadmap).filter(
            Roadmap.id == roadmap_id,
            Roadmap.user_id == current_user.id
        ).first()
        
        if not roadmap:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Roadmap not found"
            )
        
        # Generate new roadmap data
        roadmap_data = await llm_service.generate_career_roadmap(roadmap_id, db)
        
        # Delete existing milestones
        db.query(Milestone).filter(Milestone.roadmap_id == roadmap_id).delete()
        
        # Update roadmap
        roadmap.title = roadmap_data.get('title', roadmap.title)
        roadmap.description = roadmap_data.get('description', roadmap.description)
        roadmap.field = roadmap_data.get('field', roadmap.field)
        
        # Create new milestones
        milestones_data = roadmap_data.get('milestones', [])
        for milestone_data in milestones_data:
            milestone = Milestone(
                roadmap_id=roadmap.id,
                title=milestone_data.get('title', ''),
                description=milestone_data.get('description', ''),
                completed=False
            )
            # Set resources as JSON string
            resources = milestone_data.get('resources', [])
            if resources:
                milestone.set_resources(resources)
            
            db.add(milestone)
        
        roadmap.total_milestones = len(milestones_data)
        roadmap.completed_milestones = 0
        roadmap.progress = 0
        
        db.commit()
        
        return {
            "success": True,
            "message": "Roadmap regenerated successfully",
            "roadmap_id": roadmap_id
        }
        
    except Exception as e:
        logger.error(f"Error regenerating roadmap: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to regenerate roadmap"
        )

@router.get("/conversation-status/{roadmap_id}")
async def get_conversation_status(
    roadmap_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(verify_token)
):
    """Get the current status of the career guidance conversation"""
    
    try:
        # Validate roadmap exists and belongs to user
        roadmap = db.query(Roadmap).filter(
            Roadmap.id == roadmap_id,
            Roadmap.user_id == current_user.id
        ).first()
        
        if not roadmap:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Roadmap not found"
            )
        
        # Get conversation context
        context = await llm_service._get_conversation_context(roadmap_id, db)
        
        # Get messages
        messages = db.query(ChatMessage).filter(
            ChatMessage.roadmap_id == roadmap_id
        ).order_by(ChatMessage.timestamp.asc()).all()
        
        return {
            "roadmap_id": roadmap_id,
            "stage": context.stage.value,
            "message_count": len(messages),
            "roadmap_ready": context.stage == ConversationStage.MENTORING,
            "collected_data": context.collected_data
        }
        
    except Exception as e:
        logger.error(f"Error getting conversation status: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get conversation status"
        )

@router.get("/rate-limit-status")
async def get_rate_limit_status(
    current_user: User = Depends(verify_token)
):
    """Get the current rate limit status for the user"""
    
    current_time = datetime.now()
    user_requests = user_request_counts.get(current_user.id, [])
    
    # Clean old requests
    user_requests[:] = [req_time for req_time in user_requests if (current_time - req_time).seconds < 3600]
    
    remaining_requests = settings.ai_requests_per_hour - len(user_requests)
    
    return {
        "requests_made": len(user_requests),
        "requests_remaining": max(0, remaining_requests),
        "requests_per_hour_limit": settings.ai_requests_per_hour,
        "requests_per_day_limit": settings.ai_requests_per_day
    } 