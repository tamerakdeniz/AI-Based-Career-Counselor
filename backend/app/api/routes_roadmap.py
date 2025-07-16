from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.roadmap import Roadmap
from app.models.milestone import Milestone
from app.schemas.roadmap import Roadmap as RoadmapSchema, RoadmapCreate, RoadmapUpdate, Milestone as MilestoneSchema, MilestoneCreate
from app.services.llm_service import llm_service

router = APIRouter(prefix="/roadmaps", tags=["roadmaps"])

# List all roadmaps for a user
@router.get("/user/{user_id}", response_model=List[RoadmapSchema])
def get_roadmaps_for_user(user_id: int, db: Session = Depends(get_db)):
    roadmaps = db.query(Roadmap).filter(Roadmap.user_id == user_id).all()
    # Ensure milestones' resources are lists, not JSON strings
    for roadmap in roadmaps:
        if hasattr(roadmap, 'milestones'):
            for milestone in roadmap.milestones:
                if hasattr(milestone, 'resources'):
                    milestone.resources = milestone.get_resources()
    return roadmaps

# Get a single roadmap (with milestones)
@router.get("/{roadmap_id}", response_model=RoadmapSchema)
def get_roadmap(roadmap_id: int, db: Session = Depends(get_db)):
    roadmap = db.query(Roadmap).filter(Roadmap.id == roadmap_id).first()
    if not roadmap:
        raise HTTPException(status_code=404, detail="Roadmap not found")
    return roadmap

from app.services.llm_service import llm_service, ConversationStage

# ... (other imports)

# Create a roadmap for a user
@router.post("/user/{user_id}", response_model=RoadmapSchema, status_code=201)
async def create_roadmap(user_id: int, roadmap: RoadmapCreate, db: Session = Depends(get_db)):
    # Create a preliminary roadmap to get an ID
    new_roadmap = Roadmap(user_id=user_id, title="New Roadmap", description="", ai_generated=True)
    db.add(new_roadmap)
    db.commit()
    db.refresh(new_roadmap)

    # Now, generate the full roadmap content with the AI
    context = await llm_service._get_conversation_context(new_roadmap.id, db)
    generated_data = await llm_service._generate_roadmap_from_context(context)

    # Update the roadmap with the generated content
    new_roadmap.title = generated_data.get("title", "AI-Generated Roadmap")
    new_roadmap.description = generated_data.get("description", "")
    new_roadmap.short_title = generated_data.get("short_title", "AI Roadmap")
    new_roadmap.short_description = generated_data.get("short_description", "")
    new_roadmap.field = generated_data.get("field", "")

    # Create milestones
    for milestone_data in generated_data.get("milestones", []) :
        new_milestone = Milestone(
            roadmap_id=new_roadmap.id,
            title=milestone_data.get("title"),
            description=milestone_data.get("description"),
        )
        new_milestone.set_resources(milestone_data.get("resources", []))
        db.add(new_milestone)

    db.commit()
    db.refresh(new_roadmap)
    return new_roadmap

# Update a roadmap
@router.put("/{roadmap_id}", response_model=RoadmapSchema)
def update_roadmap(roadmap_id: int, roadmap_update: RoadmapUpdate, db: Session = Depends(get_db)):
    roadmap = db.query(Roadmap).filter(Roadmap.id == roadmap_id).first()
    if not roadmap:
        raise HTTPException(status_code=404, detail="Roadmap not found")
    for key, value in roadmap_update.dict(exclude_unset=True).items():
        setattr(roadmap, key, value)
    db.commit()
    db.refresh(roadmap)
    return roadmap

# Delete a roadmap
@router.delete("/{roadmap_id}")
def delete_roadmap(roadmap_id: int, db: Session = Depends(get_db)):
    roadmap = db.query(Roadmap).filter(Roadmap.id == roadmap_id).first()
    if not roadmap:
        raise HTTPException(status_code=404, detail="Roadmap not found")
    db.delete(roadmap)
    db.commit()
    return {"ok": True}

# List milestones for a roadmap
@router.get("/{roadmap_id}/milestones", response_model=List[MilestoneSchema])
def get_milestones(roadmap_id: int, db: Session = Depends(get_db)):
    return db.query(Milestone).filter(Milestone.roadmap_id == roadmap_id).all()

# Create a milestone for a roadmap
@router.post("/{roadmap_id}/milestones", response_model=MilestoneSchema, status_code=201)
def create_milestone(roadmap_id: int, milestone: MilestoneCreate, db: Session = Depends(get_db)):
    new_milestone = Milestone(roadmap_id=roadmap_id, **milestone.dict())
    db.add(new_milestone)
    db.commit()
    db.refresh(new_milestone)
    return new_milestone

# Update a milestone
@router.put("/milestones/{milestone_id}", response_model=MilestoneSchema)
def update_milestone(milestone_id: int, milestone_update: MilestoneCreate, db: Session = Depends(get_db)):
    milestone = db.query(Milestone).filter(Milestone.id == milestone_id).first()
    if not milestone:
        raise HTTPException(status_code=404, detail="Milestone not found")
    for key, value in milestone_update.dict(exclude_unset=True).items():
        setattr(milestone, key, value)
    db.commit()
    db.refresh(milestone)
    return milestone

# Delete a milestone
@router.delete("/milestones/{milestone_id}")
def delete_milestone(milestone_id: int, db: Session = Depends(get_db)):
    milestone = db.query(Milestone).filter(Milestone.id == milestone_id).first()
    if not milestone:
        raise HTTPException(status_code=404, detail="Milestone not found")
    db.delete(milestone)
    db.commit()
    return {"ok": True}

from pydantic import BaseModel

class RenameRoadmapRequest(BaseModel):
    new_title: str

# Rename a roadmap
@router.put("/{roadmap_id}/rename", response_model=RoadmapSchema)
def rename_roadmap(roadmap_id: int, request: RenameRoadmapRequest, db: Session = Depends(get_db)):
    roadmap = db.query(Roadmap).filter(Roadmap.id == roadmap_id).first()
    if not roadmap:
        raise HTTPException(status_code=404, detail="Roadmap not found")
    
    roadmap.title = request.new_title
    db.commit()
    db.refresh(roadmap)
    
    return roadmap

import json

# Mark a milestone as complete
@router.put("/milestones/{milestone_id}/complete", response_model=MilestoneSchema)
async def complete_milestone(milestone_id: int, db: Session = Depends(get_db)):
    milestone = db.query(Milestone).filter(Milestone.id == milestone_id).first()
    if not milestone:
        raise HTTPException(status_code=404, detail="Milestone not found")

    milestone.completed = True
    db.commit()

    # Update roadmap progress
    roadmap = db.query(Roadmap).filter(Roadmap.id == milestone.roadmap_id).first()
    if roadmap:
        completed_milestones = db.query(Milestone).filter(Milestone.roadmap_id == roadmap.id, Milestone.completed == True).count()
        total_milestones = db.query(Milestone).filter(Milestone.roadmap_id == roadmap.id).count()
        roadmap.progress = int((completed_milestones / total_milestones) * 100) if total_milestones > 0 else 0
        roadmap.completed_milestones = completed_milestones
        db.commit()

    db.refresh(milestone)

    # Get the next milestone title
    next_milestone_title = f"Next step after {milestone.title}"

    # Get resources from the LLM in a token-efficient way
    resource_prompt = f"Find 3-5 helpful online resources (articles or tutorials) for learning about '{next_milestone_title}'. Return only a JSON-formatted list of strings."
    resources_str = await llm_service._call_ai_service(resource_prompt)
    
    try:
        # The model might return a markdown code block, so we clean it up
        if resources_str.strip().startswith("```json"):
            clean_str = resources_str.strip()[7:-3]
        else:
            clean_str = resources_str.strip()
        resources_list = json.loads(clean_str)
    except (json.JSONDecodeError, IndexError):
        resources_list = []

    # Create a new milestone
    new_milestone = Milestone(
        roadmap_id=milestone.roadmap_id,
        title=next_milestone_title,
        description="This is the next step in your journey.",
    )
    new_milestone.set_resources(resources_list) # Use the model's setter to handle JSON conversion

    db.add(new_milestone)
    db.commit()
    db.refresh(new_milestone)
    
    return milestone 