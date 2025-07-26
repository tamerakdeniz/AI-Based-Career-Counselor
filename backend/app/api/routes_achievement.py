from typing import List
from datetime import datetime

from app.api.routes_auth import verify_token
from app.database import get_db
from app.models.achievement import Achievement, UserAchievement
from app.models.user import User
from app.schemas.achievement import (
    Achievement as AchievementSchema,
    UserAchievement as UserAchievementSchema,
    UserAchievementResponse
)
from app.services.achievement_service import achievement_service
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

router = APIRouter(prefix="/achievements", tags=["achievements"])


@router.get("/", response_model=List[AchievementSchema])
def get_all_achievements(db: Session = Depends(get_db), current_user: User = Depends(verify_token)):
    """Get all available achievements"""
    achievements = db.query(Achievement).all()
    return achievements


@router.get("/user", response_model=List[UserAchievementResponse])
def get_user_achievements(db: Session = Depends(get_db), current_user: User = Depends(verify_token)):
    """Get achievements for the current user"""
    user_achievements = db.query(UserAchievement).filter(
        UserAchievement.user_id == current_user.id
    ).all()
    
    return [
        UserAchievementResponse(
            id=ua.id,
            achievement_id=ua.achievement_id,
            unlocked_at=ua.unlocked_at,
            is_notified=ua.is_notified,
            achievement=ua.achievement
        )
        for ua in user_achievements
    ]


@router.post("/check")
def check_achievements(db: Session = Depends(get_db), current_user: User = Depends(verify_token)):
    """Check and award any new achievements for the current user"""
    new_achievements = achievement_service.check_and_award_achievements(current_user.id, db)
    
    return {
        "message": f"Checked achievements for user {current_user.id}",
        "new_achievements_count": len(new_achievements),
        "new_achievements": [
            {
                "title": achievement.title,
                "description": achievement.description,
                "unlocked_at": user_achievement.unlocked_at.isoformat()
            }
            for achievement, user_achievement in new_achievements
        ]
    }


@router.put("/user/{achievement_id}/mark-notified")
def mark_achievement_notified(
    achievement_id: int,
    db: Session = Depends(get_db), 
    current_user: User = Depends(verify_token)
):
    """Mark an achievement as notified (user has seen the notification)"""
    user_achievement = db.query(UserAchievement).filter(
        UserAchievement.user_id == current_user.id,
        UserAchievement.achievement_id == achievement_id
    ).first()
    
    if not user_achievement:
        raise HTTPException(status_code=404, detail="Achievement not found for this user")
    
    user_achievement.is_notified = True
    db.commit()
    
    return {"message": "Achievement marked as notified"}
