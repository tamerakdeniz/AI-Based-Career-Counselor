import logging
from typing import Any, Dict, List

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.api.routes_auth import verify_token
from app.core.config import settings
from app.database import get_db
from app.models.milestone import Milestone
from app.models.roadmap import Roadmap
from app.models.user import User
from app.services.llm_service import llm_service

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/ai", tags=["AI-powered features"])

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

# --- API Endpoints ---

@router.get("/initial-questions/{field}", response_model=InitialQuestionsResponse)
async def get_initial_questions(field: str):
    """
    Provides a list of initial questions tailored to the selected career field.
    """
    try:
        questions = llm_service.get_initial_questions(field)
        if not questions:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No questions found for the specified field."
            )
        return InitialQuestionsResponse(questions=questions)
    except Exception as e:
        logger.error(f"Error fetching initial questions for field '{field}': {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve initial questions."
        )

@router.post("/generate-roadmap", response_model=GenerateRoadmapResponse)
async def generate_roadmap(
    request: GenerateRoadmapRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(verify_token)
):
    """
    Generates a new career roadmap based on user's answers to initial questions.
    This endpoint is stateless and creates the roadmap in a single call.
    """
    try:
        # Generate roadmap data using the LLM service
        roadmap_data = await llm_service.generate_career_roadmap(
            field=request.field,
            user_responses=request.user_responses,
            db=db
        )

        if not roadmap_data or "milestones" not in roadmap_data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to generate roadmap content from AI service."
            )

        # Create a new roadmap entry in the database
        new_roadmap = Roadmap(
            user_id=current_user.id,
            title=roadmap_data.get("title", f"Roadmap for {request.field}"),
            description=roadmap_data.get("description", ""),
            field=request.field,
            progress=0,
            total_milestones=len(roadmap_data.get("milestones", [])),
            completed_milestones=0
        )
        db.add(new_roadmap)
        db.commit()
        db.refresh(new_roadmap)

        # Create milestone entries in the database
        for milestone_data in roadmap_data.get("milestones", []) :
            milestone = Milestone(
                roadmap_id=new_roadmap.id,
                title=milestone_data.get("title"),
                description=milestone_data.get("description"),
                estimated_duration=milestone_data.get("estimated_duration"),
                completed=False
            )
            # set_skills and set_resources are methods in the Milestone model
            milestone.set_skills(milestone_data.get("skills", []))
            milestone.set_resources(milestone_data.get("resources", []))
            db.add(milestone)
        
        db.commit()

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