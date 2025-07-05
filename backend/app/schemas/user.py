from pydantic import BaseModel, EmailStr, ConfigDict
from datetime import datetime
from typing import Optional, List
from .roadmap import Roadmap

class UserBase(BaseModel):
    name: str
    email: EmailStr
    avatar: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    avatar: Optional[str] = None

class User(UserBase):
    id: int
    joined_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

class UserWithRoadmaps(User):
    roadmaps: List['Roadmap'] = []
    
    model_config = ConfigDict(from_attributes=True)
