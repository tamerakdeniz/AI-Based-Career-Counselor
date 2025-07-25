# from .user import User, UserCreate, UserUpdate, UserWithRoadmaps
# from .roadmap import Roadmap, RoadmapCreate, RoadmapUpdate, Milestone, MilestoneCreate
# from .chat import ChatMessage, ChatMessageCreate

# __all__ = [
#     "User", "UserCreate", "UserUpdate", "UserWithRoadmaps",
#     "Roadmap", "RoadmapCreate", "RoadmapUpdate", "Milestone", "MilestoneCreate",
#     "ChatMessage", "ChatMessageCreate"
# ]


# app/schemas/__init__.py

from .user import (
    UserBase,
    UserUpdate,
    UserProfileResponse,
    PasswordChangeRequest,
    EmailChangeRequest,
    NotificationSettingsUpdate,
    Token,
    LoginRequest,
    RegisterRequest,
)
from .roadmap import (
    Roadmap, 
    RoadmapCreate, 
    RoadmapUpdate, 
    Milestone, 
    MilestoneCreate
)
from .chat import ChatMessage, ChatMessageCreate

__all__ = [
    "UserBase",
    "UserUpdate",
    "UserProfileResponse",
    "PasswordChangeRequest",
    "EmailChangeRequest",
    "NotificationSettingsUpdate",
    "Token",
    "LoginRequest",
    "RegisterRequest",
    "Roadmap",
    "RoadmapCreate",
    "RoadmapUpdate",
    "Milestone",
    "MilestoneCreate",
    "ChatMessage",
    "ChatMessageCreate",
]