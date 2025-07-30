from datetime import date, datetime, timedelta
from typing import Dict, List

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
from sqlalchemy import func
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
    """Get milestone completion counts grouped by week for the current user, including empty weeks"""
    
    # Query completed milestones that belong to the current user's roadmaps
    completed_milestones = db.query(Milestone).join(Roadmap).filter(
        Roadmap.user_id == current_user.id,
        Milestone.completed == True,
        Milestone.completed_at.isnot(None)
    ).all()
    
    # Group milestones by ISO week using Python's isocalendar()
    stats_dict = {}
    for milestone in completed_milestones:
        if milestone.completed_at:
            # Use ISO week calculation which correctly handles week boundaries
            iso_year, iso_week, _ = milestone.completed_at.isocalendar()
            week_key = f"{iso_year}-W{iso_week:02d}"
            stats_dict[week_key] = stats_dict.get(week_key, 0) + 1
    
    # If no completed milestones, show last 4 weeks with zeros
    if not stats_dict:
        result = []
        today = datetime.now().date()
        for i in range(4):
            week_start = today - timedelta(days=today.weekday() + (i * 7))
            year, week_num, _ = week_start.isocalendar()
            week_display = f"Week {week_num}, {year}"
            result.insert(0, {
                "date": week_display,
                "milestones": 0
            })
        return result
    
    # Find the range of weeks to display
    weeks = list(stats_dict.keys())
    earliest_week = min(weeks)
    latest_week = max(weeks)
    
    # Parse week strings and extend range to current week
    def parse_week(week_str):
        year, week_part = week_str.split('-W')
        return int(year), int(week_part)
    
    def week_to_string(year, week):
        return f"{year}-W{week:02d}"
    
    # Get current week using ISO calendar
    today = datetime.now().date()
    current_year, current_week_num, _ = today.isocalendar()
    current_week_str = week_to_string(current_year, current_week_num)
    
    # Extend range to current week if needed
    if current_week_str > latest_week:
        latest_week = current_week_str
    
    earliest_year, earliest_week_num = parse_week(earliest_week)
    latest_year, latest_week_num = parse_week(latest_week)
    
    # Generate all weeks in the range
    result = []
    year, week = earliest_year, earliest_week_num
    
    while (year < latest_year) or (year == latest_year and week <= latest_week_num):
        week_string = week_to_string(year, week)
        milestone_count = stats_dict.get(week_string, 0)
        
        # Convert week format to more readable format
        week_display = f"Week {week}, {year}"
        
        result.append({
            "date": week_display,
            "milestones": milestone_count
        })
        
        # Move to next week
        week += 1
        # Handle year rollover using ISO week dates (can go up to week 53)
        if week > 53:
            # Check if week 53 exists in this year by trying to create a date
            try:
                # ISO week 53 exists if Jan 1 is Thursday or if it's a leap year and Jan 1 is Wednesday
                jan1 = datetime(year, 1, 1).date()
                jan1_weekday = jan1.weekday()  # Monday = 0, Sunday = 6
                if jan1_weekday == 3 or (jan1_weekday == 2 and year % 4 == 0 and (year % 100 != 0 or year % 400 == 0)):
                    # Week 53 exists, continue
                    pass
                else:
                    week = 1
                    year += 1
            except:
                week = 1
                year += 1
        elif week == 53:
            # Check if week 53 exists in this year
            try:
                jan1 = datetime(year, 1, 1).date()
                jan1_weekday = jan1.weekday()
                if not (jan1_weekday == 3 or (jan1_weekday == 2 and year % 4 == 0 and (year % 100 != 0 or year % 400 == 0))):
                    week = 1
                    year += 1
            except:
                week = 1
                year += 1
    
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