from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.roadmap import Roadmap
from app.models.milestone import Milestone
from app.schemas.roadmap import Roadmap as RoadmapSchema, RoadmapCreate, RoadmapUpdate, Milestone as MilestoneSchema, MilestoneCreate

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

# Create a roadmap for a user
@router.post("/user/{user_id}", response_model=RoadmapSchema, status_code=201)
def create_roadmap(user_id: int, roadmap: RoadmapCreate, db: Session = Depends(get_db)):
    new_roadmap = Roadmap(user_id=user_id, **roadmap.dict())
    db.add(new_roadmap)
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