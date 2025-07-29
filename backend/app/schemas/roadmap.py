from datetime import datetime
from typing import List, Optional, Any
import json

from pydantic import BaseModel, field_validator


class Resource(BaseModel):
    title: str
    url: Optional[str] = ""


class MilestoneBase(BaseModel):
    title: str
    description: Optional[str] = None
    completed: bool = False
    due_date: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    resources: List[Resource] = []

class MilestoneCreate(MilestoneBase):
    pass

class Milestone(MilestoneBase):
    id: int
    roadmap_id: int

    class Config:
        from_attributes = True

class RoadmapBase(BaseModel):
    title: str
    description: Optional[str] = None
    field: Optional[str] = None
    progress: int = 0
    next_milestone: Optional[str] = None
    total_milestones: int = 0
    completed_milestones: int = 0
    estimated_time_to_complete: Optional[str] = None

class RoadmapCreate(RoadmapBase):
    pass

class RoadmapUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    field: Optional[str] = None
    progress: Optional[int] = None
    next_milestone: Optional[str] = None
    total_milestones: Optional[int] = None
    completed_milestones: Optional[int] = None
    estimated_time_to_complete: Optional[str] = None

class Roadmap(RoadmapBase):
    id: int
    user_id: int
    created_at: datetime
    milestones: List[Milestone] = []
    
    class Config:
        from_attributes = True

class RoadmapResponse(BaseModel):
    id: int
    user_id: int
    title: str
    description: Optional[str] = None
    field: Optional[str] = None
    progress: int = 0
    next_milestone: Optional[str] = None
    total_milestones: int = 0
    completed_milestones: int = 0
    estimated_time_to_complete: Optional[str] = None
    created_at: datetime
    milestones: List[Milestone] = []
    
    class Config:
        from_attributes = True 