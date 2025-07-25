from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.orm import Session
from typing import List
import json

from app.database import get_db
from app.models.user import User
from app.api.routes_auth import verify_token # Re-using verify_token for authentication
from app.schemas.user import UserProfileResponse, UserUpdate, NotificationSettingsUpdate
from app.core.security import get_password_hash, verify_password

router = APIRouter(prefix="/users", tags=["users"])

@router.get("/{user_id}", response_model=UserProfileResponse)
def get_user_profile(user_id: int, db: Session = Depends(get_db), current_user: User = Depends(verify_token)):
    """
    Get a user's profile by ID.
    Requires authentication.
    """
    if user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to view this profile."
        )
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return user

@router.put("/{user_id}", response_model=UserProfileResponse)
def update_user_profile(user_id: int, user_update: UserUpdate, db: Session = Depends(get_db), current_user: User = Depends(verify_token)):
    """
    Update a user's profile.
    Requires authentication.
    """
    if user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to update this profile."
        )

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    update_data = user_update.dict(exclude_unset=True)
    
    # Handle JSON fields separately if needed, though SQLAlchemy's JSON type
    # should handle list assignments directly.
    if 'skills' in update_data and update_data['skills'] is not None:
        user.skills = update_data['skills']
    if 'interests' in update_data and update_data['interests'] is not None:
        user.interests = update_data['interests']
    if 'goals' in update_data and update_data['goals'] is not None:
        user.goals = update_data['goals']

    # Update other fields
    for field, value in update_data.items():
        if field not in ['skills', 'interests', 'goals']: # Already handled
            setattr(user, field, value)

    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user_account(user_id: int, db: Session = Depends(get_db), current_user: User = Depends(verify_token)):
    print(f"[DELETE USER] Endpoint called for user_id={user_id}, current_user.id={current_user.id}")
    """
    Delete a user's account.
    Requires authentication.
    """
    if user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to delete this account."
        )

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    db.delete(user)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)

@router.get("/me/data", response_model=dict)
def download_my_data(db: Session = Depends(get_db), current_user: User = Depends(verify_token)):
    """
    Download all personal data for the current user.
    Returns user profile data and placeholders for related data (roadmaps, chat messages).
    """
    user_data = current_user.to_dict() # Use the to_dict method from the User model

    # Add placeholders for related data, you would fetch these from other tables
    # For example:
    # roadmaps_data = [roadmap.to_dict() for roadmap in current_user.roadmaps]
    # chat_messages_data = [msg.to_dict() for msg in current_user.chat_messages]

    return {
        "user_profile": user_data,
        "roadmaps": [], # Placeholder, implement actual fetching if needed
        "chat_messages": [], # Placeholder, implement actual fetching if needed
        "mentorship_sessions": [] # Placeholder for other relevant data
    }

