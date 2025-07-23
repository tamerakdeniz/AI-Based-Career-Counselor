from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.roadmap import Roadmap
from app.models.milestone import Milestone
from app.schemas.roadmap import Roadmap as RoadmapSchema, RoadmapUpdate, Milestone as MilestoneSchema

router = APIRouter(prefix="/roadmaps", tags=["roadmaps"])

# List all roadmaps for a user
@router.get("/user/{user_id}", response_model=List[RoadmapSchema])
def get_roadmaps_for_user(user_id: int, db: Session = Depends(get_db)):
    roadmaps = db.query(Roadmap).filter(Roadmap.user_id == user_id).all()
    return roadmaps

# Get a single roadmap (with milestones)
@router.get("/{roadmap_id}", response_model=RoadmapSchema)
def get_roadmap(roadmap_id: int, db: Session = Depends(get_db)):
    roadmap = db.query(Roadmap).filter(Roadmap.id == roadmap_id).first()
    if not roadmap:
        raise HTTPException(status_code=404, detail="Roadmap not found")
    return roadmap

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
    return milestone