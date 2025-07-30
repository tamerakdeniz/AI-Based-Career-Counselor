from typing import List, Dict
from datetime import datetime, date
from sqlalchemy import func

from app.api.routes_auth import verify_token
from app.database import get_db
from app.models.milestone import Milestone
from app.models.roadmap import Roadmap
from app.models.user import User
from app.schemas.roadmap import Milestone as MilestoneSchema
from app.schemas.roadmap import Roadmap as RoadmapSchema
from app.schemas.roadmap import RoadmapUpdate
from app.services.achievement_service import achievement_service
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

router = APIRouter(prefix="/roadmaps", tags=["roadmaps"])

# List all roadmaps for a user
@router.get("/user/{user_id}", response_model=List[RoadmapSchema])
def get_roadmaps_for_user(user_id: int, db: Session = Depends(get_db), current_user: User = Depends(verify_token)):
    # Ensure user can only access their own roadmaps
    if current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Access denied")
    roadmaps = db.query(Roadmap).filter(Roadmap.user_id == user_id).all()
    return roadmaps

# Get a single roadmap (with milestones)
@router.get("/{roadmap_id}", response_model=RoadmapSchema)
def get_roadmap(roadmap_id: int, db: Session = Depends(get_db), current_user: User = Depends(verify_token)):
    roadmap = db.query(Roadmap).filter(Roadmap.id == roadmap_id).first()
    if not roadmap:
        raise HTTPException(status_code=404, detail="Roadmap not found")
    # Ensure user can only access their own roadmaps
    if roadmap.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    return roadmap

# Update a roadmap
@router.put("/{roadmap_id}", response_model=RoadmapSchema)
def update_roadmap(roadmap_id: int, roadmap_update: RoadmapUpdate, db: Session = Depends(get_db), current_user: User = Depends(verify_token)):
    roadmap = db.query(Roadmap).filter(Roadmap.id == roadmap_id).first()
    if not roadmap:
        raise HTTPException(status_code=404, detail="Roadmap not found")
    # Ensure user can only update their own roadmaps
    if roadmap.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    for key, value in roadmap_update.dict(exclude_unset=True).items():
        setattr(roadmap, key, value)
    db.commit()
    db.refresh(roadmap)
    return roadmap

# Delete a roadmap
@router.delete("/{roadmap_id}")
def delete_roadmap(roadmap_id: int, db: Session = Depends(get_db), current_user: User = Depends(verify_token)):
    roadmap = db.query(Roadmap).filter(Roadmap.id == roadmap_id).first()
    if not roadmap:
        raise HTTPException(status_code=404, detail="Roadmap not found")
    # Ensure user can only delete their own roadmaps
    if roadmap.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    db.delete(roadmap)
    db.commit()
    return {"ok": True}

# List milestones for a roadmap
@router.get("/{roadmap_id}/milestones", response_model=List[MilestoneSchema])
def get_milestones(roadmap_id: int, db: Session = Depends(get_db), current_user: User = Depends(verify_token)):
    # First, verify that the roadmap exists and belongs to the current user
    roadmap = db.query(Roadmap).filter(Roadmap.id == roadmap_id).first()
    if not roadmap:
        raise HTTPException(status_code=404, detail="Roadmap not found")
    
    # Ensure user can only access their own roadmap's milestones
    if roadmap.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
        
    return db.query(Milestone).filter(Milestone.roadmap_id == roadmap_id).all()

# Mark a milestone as complete
@router.put("/milestones/{milestone_id}/complete", response_model=MilestoneSchema)
async def complete_milestone(milestone_id: int, db: Session = Depends(get_db), current_user: User = Depends(verify_token)):
    milestone = db.query(Milestone).filter(Milestone.id == milestone_id).first()
    if not milestone:
        raise HTTPException(status_code=404, detail="Milestone not found")

    # Ensure the milestone belongs to a roadmap owned by the current user
    roadmap = db.query(Roadmap).filter(Roadmap.id == milestone.roadmap_id).first()
    if not roadmap or roadmap.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    milestone.completed = True
    milestone.completed_at = datetime.now()
    db.commit()

    # Update roadmap progress
    if roadmap:
        completed_milestones = db.query(Milestone).filter(Milestone.roadmap_id == roadmap.id, Milestone.completed == True).count()
        total_milestones = db.query(Milestone).filter(Milestone.roadmap_id == roadmap.id).count()
        roadmap.progress = int((completed_milestones / total_milestones) * 100) if total_milestones > 0 else 0
        roadmap.completed_milestones = completed_milestones
        roadmap.total_milestones = total_milestones
        
        # Update next milestone
        if completed_milestones >= total_milestones:
            roadmap.next_milestone = None  # All milestones completed
        else:
            # Find the first incomplete milestone
            next_milestone = db.query(Milestone).filter(
                Milestone.roadmap_id == roadmap.id, 
                Milestone.completed == False
            ).first()
            roadmap.next_milestone = next_milestone.title if next_milestone else None
        
        db.commit()
        
        # Check for new achievements after milestone completion
        achievement_service.check_and_award_achievements(current_user.id, db)

    db.refresh(milestone)
    return milestone

# Complete all milestones in a roadmap
@router.put("/{roadmap_id}/complete-all")
async def complete_all_milestones(roadmap_id: int, db: Session = Depends(get_db), current_user: User = Depends(verify_token)):
    roadmap = db.query(Roadmap).filter(Roadmap.id == roadmap_id).first()
    if not roadmap:
        raise HTTPException(status_code=404, detail="Roadmap not found")
    # Ensure user can only complete their own roadmaps
    if roadmap.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    # Mark all milestones as complete
    milestones = db.query(Milestone).filter(Milestone.roadmap_id == roadmap_id).all()
    for milestone in milestones:
        milestone.completed = True
        if not milestone.completed_at:  # Only set if not already set
            milestone.completed_at = datetime.now()
    
    # Update roadmap progress to 100%
    total_milestones = len(milestones)
    roadmap.progress = 100
    roadmap.completed_milestones = total_milestones
    roadmap.total_milestones = total_milestones
    roadmap.next_milestone = None  # All milestones completed
    
    db.commit()
    
    # Check for new achievements after completing all milestones
    achievement_service.check_and_award_achievements(current_user.id, db)
    
    return {"message": "All milestones completed successfully", "completed_count": total_milestones}

# Get milestone completion statistics by week for analytics
@router.get("/analytics/milestones-by-date", response_model=List[Dict])
def get_milestones_by_date(db: Session = Depends(get_db), current_user: User = Depends(verify_token)):
    """Get milestone completion counts grouped by week for the current user"""
    
    # Query milestones that belong to the current user's roadmaps and are completed
    # Group by week using strftime to get year-week format
    milestone_stats = db.query(
        func.strftime('%Y-W%W', Milestone.completed_at).label('week'),
        func.count(Milestone.id).label('milestone_count')
    ).join(Roadmap).filter(
        Roadmap.user_id == current_user.id,
        Milestone.completed == True,
        Milestone.completed_at.isnot(None)
    ).group_by(
        func.strftime('%Y-W%W', Milestone.completed_at)
    ).order_by(
        func.strftime('%Y-W%W', Milestone.completed_at)
    ).all()
    
    # Convert to list of dictionaries
    result = []
    for stat in milestone_stats:
        # Convert week format to more readable format
        if stat.week:
            # stat.week is in format "2025-W30", convert to "Week 30, 2025"
            year, week_part = stat.week.split('-W')
            week_display = f"Week {week_part}, {year}"
        else:
            week_display = None
            
        result.append({
            "date": week_display,
            "milestones": stat.milestone_count
        })
    
    return result

# Get recent completed milestones for activity log
@router.get("/analytics/recent-milestones")
def get_recent_milestones(limit: int = 20, db: Session = Depends(get_db), current_user: User = Depends(verify_token)):
    """Get recent completed milestones for the current user"""
    
    # Query recent completed milestones with roadmap info
    recent_milestones = db.query(Milestone).join(Roadmap).filter(
        Roadmap.user_id == current_user.id,
        Milestone.completed == True,
        Milestone.completed_at.isnot(None)
    ).order_by(
        Milestone.completed_at.desc()
    ).limit(limit).all()
    
    # Convert to response format
    result = []
    for milestone in recent_milestones:
        result.append({
            "id": milestone.id,
            "title": milestone.title,
            "description": milestone.description,
            "completed_at": milestone.completed_at.isoformat() if milestone.completed_at else None,
            "roadmap": {
                "id": milestone.roadmap.id,
                "title": milestone.roadmap.title
            } if milestone.roadmap else None
        })
    
    return result