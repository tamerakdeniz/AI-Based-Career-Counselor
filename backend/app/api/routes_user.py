import re
from datetime import datetime
from typing import Optional

from app.api.routes_auth import verify_token
from app.core.security import get_password_hash, verify_password
from app.database import get_db
from app.models.chat_message import ChatMessage
from app.models.milestone import Milestone
from app.models.roadmap import Roadmap
from app.models.user import User
from app.services.rate_limit_service import rate_limit_service
from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import BaseModel, EmailStr, field_validator
from sqlalchemy import func
from sqlalchemy.orm import Session

router = APIRouter(prefix="/users", tags=["users"])

# Pydantic models for request/response
class UserProfileResponse(BaseModel):
    id: int
    name: str
    email: str
    avatar: Optional[str] = None
    joined_at: datetime
    total_roadmaps: int
    total_milestones: int
    completed_milestones: int
    completed_roadmaps: int

class UpdateProfileRequest(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    avatar: Optional[str] = None
    
    @field_validator('name')
    @classmethod
    def validate_name(cls, v):
        if v is not None:
            if len(v.strip()) < 2:
                raise ValueError('Name must be at least 2 characters long')
            if len(v.strip()) > 100:
                raise ValueError('Name must be less than 100 characters')
            # Allow only letters, numbers, spaces, and basic punctuation
            if not re.match(r'^[a-zA-Z0-9\s\-_\.]+$', v.strip()):
                raise ValueError('Name contains invalid characters')
        return v.strip() if v else v
    
    @field_validator('avatar')
    @classmethod
    def validate_avatar(cls, v):
        if v is not None and v.strip():
            # Basic URL validation
            if not v.strip().startswith(('http://', 'https://')):
                raise ValueError('Avatar URL must start with http:// or https://')
            if len(v.strip()) > 500:
                raise ValueError('Avatar URL too long')
        return v.strip() if v else v

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str
    
    @field_validator('new_password')
    @classmethod
    def validate_new_password(cls, v):
        if len(v) < 6:
            raise ValueError('Password must be at least 6 characters long')
        if len(v) > 128:
            raise ValueError('Password must be less than 128 characters')
        # Require at least one letter and one number for security
        if not re.search(r'[a-zA-Z]', v):
            raise ValueError('Password must contain at least one letter')
        if not re.search(r'\d', v):
            raise ValueError('Password must contain at least one number')
        return v

class DeleteAccountRequest(BaseModel):
    password: str

# Get user profile with statistics
@router.get("/profile", response_model=UserProfileResponse)
def get_user_profile(current_user: User = Depends(verify_token), db: Session = Depends(get_db)):
    """Get user profile with statistics"""
    # Get roadmap statistics
    total_roadmaps = db.query(Roadmap).filter(Roadmap.user_id == current_user.id).count()
    
    # Get milestone statistics
    total_milestones = db.query(Milestone).join(Roadmap).filter(Roadmap.user_id == current_user.id).count()
    completed_milestones = db.query(Milestone).join(Roadmap).filter(
        Roadmap.user_id == current_user.id,
        Milestone.completed == True
    ).count()
    
    # Get completed roadmaps count (roadmaps where completed_milestones equals total_milestones and total_milestones > 0)
    completed_roadmaps = db.query(Roadmap).filter(
        Roadmap.user_id == current_user.id,
        Roadmap.total_milestones > 0,
        Roadmap.completed_milestones == Roadmap.total_milestones
    ).count()
    
    return UserProfileResponse(
        id=current_user.id,
        name=current_user.name,
        email=current_user.email,
        avatar=current_user.avatar,
        joined_at=current_user.joined_at,
        total_roadmaps=total_roadmaps,
        total_milestones=total_milestones,
        completed_milestones=completed_milestones,
        completed_roadmaps=completed_roadmaps
    )

# Update user profile
@router.put("/profile")
def update_user_profile(
    profile_data: UpdateProfileRequest,
    current_user: User = Depends(verify_token),
    db: Session = Depends(get_db)
):
    """Update user profile information"""
    
    # Check if email is being changed and is already taken
    if profile_data.email and profile_data.email != current_user.email:
        existing_user = db.query(User).filter(
            User.email == profile_data.email,
            User.id != current_user.id
        ).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already in use"
            )
    
    # Update fields if provided
    if profile_data.name is not None:
        current_user.name = profile_data.name
    if profile_data.email is not None:
        current_user.email = profile_data.email
    if profile_data.avatar is not None:
        current_user.avatar = profile_data.avatar
    
    db.commit()
    db.refresh(current_user)
    
    return {
        "message": "Profile updated successfully",
        "user": {
            "id": current_user.id,
            "name": current_user.name,
            "email": current_user.email,
            "avatar": current_user.avatar
        }
    }

# Rate limiting dependency for sensitive operations
def check_user_rate_limit(request: Request, current_user: User = Depends(verify_token)):
    """Check rate limit for user operations (more restrictive for sensitive ops)"""
    # Use a separate, more restrictive rate limit for sensitive operations
    user_requests = getattr(rate_limit_service, 'user_sensitive_requests', {})
    if current_user.id not in user_requests:
        user_requests[current_user.id] = []
    
    # Allow max 10 sensitive operations per hour
    import time
    current_time = time.time()
    one_hour_ago = current_time - 3600
    
    # Clean old requests
    user_requests[current_user.id] = [
        req_time for req_time in user_requests[current_user.id] 
        if req_time > one_hour_ago
    ]
    
    if len(user_requests[current_user.id]) >= 10:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many sensitive operations. Please try again later."
        )
    
    # Add current request
    user_requests[current_user.id].append(current_time)
    rate_limit_service.user_sensitive_requests = user_requests
    
    return current_user

# Change password
@router.put("/change-password")
def change_password(
    password_data: ChangePasswordRequest,
    current_user: User = Depends(check_user_rate_limit),
    db: Session = Depends(get_db)
):
    """Change user password"""
    
    # Verify current password
    if not verify_password(password_data.current_password, str(current_user.hashed_password)):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect"
        )
    
    # Validate new password (basic validation)
    if len(password_data.new_password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password must be at least 6 characters long"
        )
    
    # Hash and update password
    current_user.hashed_password = get_password_hash(password_data.new_password)
    db.commit()
    
    return {"message": "Password changed successfully"}

# Reset all progress
@router.delete("/reset-progress")
def reset_user_progress(
    current_user: User = Depends(check_user_rate_limit),
    db: Session = Depends(get_db)
):
    """Reset all user progress (delete all roadmaps, milestones, and chat messages)"""
    
    try:
        # Delete all chat messages
        db.query(ChatMessage).filter(ChatMessage.user_id == current_user.id).delete()
        
        # Delete all milestones (will be deleted via cascade, but being explicit)
        milestone_ids = db.query(Milestone.id).join(Roadmap).filter(Roadmap.user_id == current_user.id).subquery()
        db.query(Milestone).filter(Milestone.id.in_(milestone_ids)).delete(synchronize_session=False)
        
        # Delete all roadmaps
        db.query(Roadmap).filter(Roadmap.user_id == current_user.id).delete()
        
        db.commit()
        
        return {"message": "All progress has been reset successfully"}
    
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to reset progress"
        )

# Delete account
@router.delete("/account")
def delete_user_account(
    delete_data: DeleteAccountRequest,
    current_user: User = Depends(check_user_rate_limit),
    db: Session = Depends(get_db)
):
    """Delete user account permanently"""
    
    # Verify password for security
    if not verify_password(delete_data.password, str(current_user.hashed_password)):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password is incorrect"
        )
    
    try:
        # Delete all related data (handled by cascade relationships)
        db.delete(current_user)
        db.commit()
        
        return {"message": "Account deleted successfully"}
    
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete account"
        )
