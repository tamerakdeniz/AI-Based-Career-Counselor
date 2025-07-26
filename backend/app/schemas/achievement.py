from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional


class AchievementBase(BaseModel):
    title: str
    description: str
    icon: str
    category: str
    condition_type: str
    condition_value: Optional[int] = None
    color_scheme: str
    is_hidden: bool = False


class AchievementCreate(AchievementBase):
    pass


class Achievement(AchievementBase):
    id: int
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class UserAchievementBase(BaseModel):
    user_id: int
    achievement_id: int
    is_notified: bool = False


class UserAchievementCreate(UserAchievementBase):
    pass


class UserAchievement(UserAchievementBase):
    id: int
    unlocked_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class UserAchievementResponse(BaseModel):
    id: int
    achievement_id: int
    unlocked_at: datetime
    is_notified: bool
    achievement: Achievement
    
    model_config = ConfigDict(from_attributes=True)
