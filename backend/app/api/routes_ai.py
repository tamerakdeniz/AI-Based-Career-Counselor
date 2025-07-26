import logging
from typing import Any, Dict, List

from app.api.routes_auth import verify_token
from app.core.config import settings
from app.core.security import (validate_and_sanitize_input,
                               validate_roadmap_field)
from app.database import get_db
from app.models.milestone import Milestone
from app.models.roadmap import Roadmap
from app.models.user import User
from app.services.llm_service import llm_service
from app.services.rate_limit_service import RateLimitService
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/ai", tags=["AI-powered features"])

# Initialize rate limiting service
rate_limit_service = RateLimitService()

async def check_ai_rate_limit(current_user: User = Depends(verify_token)) -> User:
    """
    Dependency to check rate limits for AI endpoints.
    Returns the user if rate limit is not exceeded, raises HTTPException otherwise.
    """
    rate_limit_info = rate_limit_service.check_rate_limit(current_user.id)
    
    if rate_limit_info.is_limited:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Rate limit exceeded. Try again after {rate_limit_info.reset_time.strftime('%H:%M:%S')}",
            headers=rate_limit_service.get_rate_limit_headers(current_user.id)
        )
    
    # Increment the counter
    if not rate_limit_service.increment_request_count(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Rate limit exceeded",
            headers=rate_limit_service.get_rate_limit_headers(current_user.id)
        )
    
    return current_user

# --- Pydantic Models for Requests and Responses ---

class InitialQuestionsResponse(BaseModel):
    questions: List[Dict[str, str]]

class GenerateRoadmapRequest(BaseModel):
    field: str = Field(..., description="The career field for the roadmap.")
    user_responses: Dict[str, Any] = Field(..., description="A dictionary of user answers to the initial questions.")

class GenerateRoadmapResponse(BaseModel):
    success: bool
    roadmap_id: int
    message: str

class ConversationStatusResponse(BaseModel):
    stage: str
    roadmap_ready: bool
    message_count: int

class ChatRequest(BaseModel):
    message: str
    roadmap_id: int

class ChatResponse(BaseModel):
    message: str
    stage: str
    roadmap_ready: bool

# --- API Endpoints ---

@router.get("/initial-questions/{field}", response_model=InitialQuestionsResponse)
async def get_initial_questions(
    field: str, 
    current_user: User = Depends(check_ai_rate_limit)
):
    """
    Provides a list of initial questions tailored to the selected career field.
    Requires authentication to prevent abuse.
    """
    try:
        # Validate and sanitize the field input
        validated_field = validate_roadmap_field(field)
        questions = llm_service.get_initial_questions(validated_field)
        if not questions:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No questions found for the specified field."
            )
        return InitialQuestionsResponse(questions=questions)
    except Exception as e:
        logger.error(f"Error fetching initial questions for field '{field}' for user {current_user.id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve initial questions."
        )

@router.post("/generate-roadmap", response_model=GenerateRoadmapResponse)
async def generate_roadmap(
    request: GenerateRoadmapRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(check_ai_rate_limit)
):
    """
    Generates a new career roadmap based on user's answers to initial questions.
    This endpoint is stateless and creates the roadmap in a single call.
    """
    try:
        logger.info(f"Generating roadmap for field: {request.field}")
        logger.info(f"User responses: {request.user_responses}")
        
        # Generate roadmap data using the LLM service
        roadmap_data = await llm_service.generate_career_roadmap(
            field=request.field,
            user_responses=request.user_responses,
            db=db
        )

        logger.info(f"LLM service returned roadmap data: {roadmap_data}")

        if not roadmap_data:
            logger.error("LLM service returned None")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to generate roadmap content from AI service."
            )
            
        if "milestones" not in roadmap_data:
            logger.error(f"Roadmap data missing milestones: {roadmap_data}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Generated roadmap is missing milestones."
            )
            
        if not roadmap_data["milestones"]:
            logger.error("Roadmap data has empty milestones list")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Generated roadmap has no milestones."
            )

        # Create a new roadmap entry in the database
        milestones_data = roadmap_data.get("milestones", [])
        first_milestone_title = milestones_data[0].get("title", "First Milestone") if milestones_data else None
        
        new_roadmap = Roadmap(
            user_id=current_user.id,
            title=roadmap_data.get("title", f"Roadmap for {request.field}"),
            description=roadmap_data.get("description", ""),
            field=request.field,
            progress=0,
            total_milestones=len(milestones_data),
            completed_milestones=0,
            next_milestone=first_milestone_title
        )
        db.add(new_roadmap)
        db.commit()
        db.refresh(new_roadmap)

        # Create milestone entries in the database
        milestones_created = 0
        for milestone_data in roadmap_data.get("milestones", []):
            try:
                # Ensure milestone_data is a dictionary
                if not isinstance(milestone_data, dict):
                    logger.warning(f"Skipping non-dictionary milestone data: {milestone_data}")
                    continue
                    
                milestone = Milestone(
                    roadmap_id=new_roadmap.id,
                    title=milestone_data.get("title", "Untitled Milestone"),
                    description=milestone_data.get("description", ""),
                    completed=False
                )
                
                # Ensure resources is a list before setting
                resources = milestone_data.get("resources", [])
                if not isinstance(resources, list):
                    resources = []
                
                # Use the resources property setter to store resources as JSON
                milestone.resources = resources
                db.add(milestone)
                milestones_created += 1
                logger.info(f"Created milestone: {milestone.title} with {len(resources)} resources")
            except Exception as e:
                logger.error(f"Error creating milestone: {str(e)}")
                logger.error(f"Milestone data: {milestone_data}")
                logger.error(f"Milestone data type: {type(milestone_data)}")
        
        db.commit()
        logger.info(f"Successfully created roadmap with {milestones_created} milestones")

        return GenerateRoadmapResponse(
            success=True,
            roadmap_id=new_roadmap.id,
            message="Roadmap created successfully."
        )

    except Exception as e:
        logger.error(f"Error generating roadmap for user {current_user.id}: {e}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred while creating the roadmap."
        )

@router.get("/conversation-status/{roadmap_id}", response_model=ConversationStatusResponse)
async def get_conversation_status(
    roadmap_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(verify_token)
):
    """
    Get the current conversation status for a roadmap.
    """
    try:
        # Check if roadmap exists and belongs to user
        roadmap = db.query(Roadmap).filter(
            Roadmap.id == roadmap_id,
            Roadmap.user_id == current_user.id
        ).first()
        
        if not roadmap:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Roadmap not found."
            )
        
        # For now, return a simple status since roadmap is already created
        return ConversationStatusResponse(
            stage="mentoring",
            roadmap_ready=True,
            message_count=0
        )
    except Exception as e:
        logger.error(f"Error fetching conversation status for roadmap {roadmap_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve conversation status."
        )

@router.post("/chat", response_model=ChatResponse)
async def chat_with_ai(
    request: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(check_ai_rate_limit)
):
    """
    Chat with AI mentor about the roadmap.
    """
    try:
        # Validate and sanitize the message content
        sanitized_message = validate_and_sanitize_input(request.message, max_length=settings.max_message_length)
        
        # Check if roadmap exists and belongs to user
        roadmap = db.query(Roadmap).filter(
            Roadmap.id == request.roadmap_id,
            Roadmap.user_id == current_user.id
        ).first()
        
        if not roadmap:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Roadmap not found."
            )
        
        # Save user message to database
        from app.models.chat_message import ChatMessage
        user_message = ChatMessage(
            roadmap_id=request.roadmap_id,
            user_id=current_user.id,
            type="user",
            content=sanitized_message
        )
        db.add(user_message)
        db.commit()
        
        # Generate AI response based on the roadmap context
        roadmap_context = f"User is working on a {roadmap.field} roadmap titled '{roadmap.title}'. "
        roadmap_context += f"Description: {roadmap.description}. "
        
        # Get milestones for context
        milestones = db.query(Milestone).filter(Milestone.roadmap_id == request.roadmap_id).all()
        if milestones:
            roadmap_context += f"The roadmap has {len(milestones)} milestones: "
            roadmap_context += ", ".join([m.title for m in milestones[:3]])  # First 3 milestones
            if len(milestones) > 3:
                roadmap_context += f" and {len(milestones) - 3} more."
        
        # Create AI prompt for mentoring
        ai_prompt = f"""You are a career mentor helping a user with their career roadmap.

Context: {roadmap_context}

User's question/message: {request.message}

Please provide helpful, encouraging, and specific advice related to their career path and roadmap. Keep your response concise (2-3 sentences) and actionable."""

        # Get AI response (no JSON formatting for chat)
        ai_response_text = await llm_service._call_ai_service(ai_prompt, json_output=False)
        
        if not ai_response_text:
            ai_response_text = "I apologize, but I'm having trouble generating a response right now. Please try asking your question again, and I'll do my best to help you with your career roadmap."
        
        # Clean AI response (remove JSON formatting if present)
        ai_response_text = ai_response_text.strip()
        if ai_response_text.startswith('"') and ai_response_text.endswith('"'):
            ai_response_text = ai_response_text[1:-1]
        
        # Save AI response to database
        ai_message = ChatMessage(
            roadmap_id=request.roadmap_id,
            user_id=current_user.id,
            type="ai",
            content=ai_response_text
        )
        db.add(ai_message)
        db.commit()
        
        return ChatResponse(
            message=ai_response_text,
            stage="mentoring",
            roadmap_ready=True
        )
    except Exception as e:
        logger.error(f"Error in chat for roadmap {request.roadmap_id}: {e}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to process chat message."
        )