# from pydantic import BaseModel, EmailStr, ConfigDict
# from datetime import datetime
# from typing import Optional, List
# from .roadmap import Roadmap

# class UserBase(BaseModel):
#     name: str
#     email: EmailStr
#     avatar: Optional[str] = None

# class UserCreate(UserBase):
#     password: str

# class UserUpdate(BaseModel):
#     name: Optional[str] = None
#     email: Optional[EmailStr] = None
#     avatar: Optional[str] = None

# class User(UserBase):
#     id: int
#     joined_at: datetime
    
#     model_config = ConfigDict(from_attributes=True)

# class UserWithRoadmaps(User):
#     roadmaps: List['Roadmap'] = []
    
#     model_config = ConfigDict(from_attributes=True)

# app/schemas/user.py'nin TAMAMI bu kod olmalı
from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

# User Profile Schemas
class UserBase(BaseModel):
    name: str
    email: EmailStr

class UserProfileResponse(UserBase):
    id: int
    avatar: Optional[str] = None
    bio: Optional[str] = None
    location: Optional[str] = None
    job_title: Optional[str] = None
    company: Optional[str] = None
    education: Optional[str] = None
    skills: Optional[List[str]] = []
    interests: Optional[List[str]] = []
    goals: Optional[List[str]] = []
    joined_at: datetime

    class Config:
        orm_mode = True

class UserUpdate(BaseModel):
    name: Optional[str] = None
    avatar: Optional[str] = None
    bio: Optional[str] = None
    location: Optional[str] = None
    job_title: Optional[str] = None
    company: Optional[str] = None
    education: Optional[str] = None
    skills: Optional[List[str]] = None
    interests: Optional[List[str]] = None
    goals: Optional[List[str]] = None

class PasswordChangeRequest(BaseModel):
    current_password: str
    new_password: str

class EmailChangeRequest(BaseModel):
    new_email: EmailStr
    current_password: str

class NotificationSettingsUpdate(BaseModel):
    email_notifications: Optional[bool] = None
    weekly_report: Optional[bool] = None
    ai_recommendations: Optional[bool] = None
    milestone_reminders: Optional[bool] = None
    marketing_emails: Optional[bool] = None

# Original schemas for authentication, ensure these are also present if needed elsewhere
class Token(BaseModel):
    access_token: str
    token_type: str
    user_id: int
    user_email: str
    user_name: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str