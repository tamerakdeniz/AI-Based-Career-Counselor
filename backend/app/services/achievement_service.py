from typing import List, Tuple
from datetime import datetime

from app.models.achievement import Achievement, UserAchievement
from app.models.milestone import Milestone
from app.models.roadmap import Roadmap
from app.models.user import User
from sqlalchemy import func
from sqlalchemy.orm import Session


class AchievementService:
    """Service for managing user achievements"""

    def check_and_award_achievements(self, user_id: int, db: Session) -> List[Tuple[Achievement, UserAchievement]]:
        """Check and award any new achievements for a user"""
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            return []

        # Get all achievements user doesn't have yet
        existing_achievement_ids = db.query(UserAchievement.achievement_id).filter(
            UserAchievement.user_id == user_id
        ).subquery()
        
        available_achievements = db.query(Achievement).filter(
            ~Achievement.id.in_(existing_achievement_ids)
        ).all()

        new_achievements = []
        
        for achievement in available_achievements:
            if self._check_achievement_condition(user_id, achievement, db):
                # Award the achievement
                user_achievement = UserAchievement(
                    user_id=user_id,
                    achievement_id=achievement.id,
                    unlocked_at=datetime.now(),
                    is_notified=False
                )
                db.add(user_achievement)
                new_achievements.append((achievement, user_achievement))
        
        if new_achievements:
            db.commit()
        
        return new_achievements

    def _check_achievement_condition(self, user_id: int, achievement: Achievement, db: Session) -> bool:
        """Check if a user meets the condition for an achievement"""
        
        if achievement.condition_type == "join_date":
            # Early adopter - just joining is enough
            return True
            
        elif achievement.condition_type == "milestone_count":
            # Count completed milestones
            completed_count = db.query(Milestone).join(Roadmap).filter(
                Roadmap.user_id == user_id,
                Milestone.completed == True
            ).count()
            return completed_count >= (achievement.condition_value or 1)
            
        elif achievement.condition_type == "roadmap_count":
            # Count created roadmaps
            roadmap_count = db.query(Roadmap).filter(Roadmap.user_id == user_id).count()
            return roadmap_count >= (achievement.condition_value or 1)
            
        elif achievement.condition_type == "roadmap_complete":
            # Check if user has completed any roadmap
            completed_roadmaps = db.query(Roadmap).filter(
                Roadmap.user_id == user_id,
                Roadmap.total_milestones > 0,
                Roadmap.completed_milestones == Roadmap.total_milestones
            ).count()
            return completed_roadmaps >= (achievement.condition_value or 1)
            
        elif achievement.condition_type == "milestone_streak":
            # Check for consecutive milestone completions (simplified)
            completed_count = db.query(Milestone).join(Roadmap).filter(
                Roadmap.user_id == user_id,
                Milestone.completed == True
            ).count()
            return completed_count >= (achievement.condition_value or 5)
            
        elif achievement.condition_type == "diverse_fields":
            # Check if user has roadmaps in multiple fields
            field_count = db.query(func.count(func.distinct(Roadmap.field))).filter(
                Roadmap.user_id == user_id,
                Roadmap.field.isnot(None)
            ).scalar()
            return field_count >= (achievement.condition_value or 3)
            
        return False

    def seed_default_achievements(self, db: Session):
        """Seed the database with default achievements"""
        default_achievements = [
            {
                "title": "Early Adopter",
                "description": "Welcome to Pathyvo! You've taken the first step on your learning journey.",
                "icon": "User",
                "category": "general",
                "condition_type": "join_date",
                "condition_value": None,
                "color_scheme": "from-blue-50 to-purple-50 border-blue-100 bg-blue-100 text-blue-600",
                "is_hidden": False
            },
            {
                "title": "First Steps",
                "description": "Completed your first milestone! Every journey begins with a single step.",
                "icon": "Award",
                "category": "milestone",
                "condition_type": "milestone_count",
                "condition_value": 1,
                "color_scheme": "from-green-50 to-emerald-50 border-green-100 bg-green-100 text-green-600",
                "is_hidden": False
            },
            {
                "title": "Milestone Master",
                "description": "Completed 5 milestones! You're building great momentum.",
                "icon": "Target",
                "category": "milestone",
                "condition_type": "milestone_count",
                "condition_value": 5,
                "color_scheme": "from-purple-50 to-pink-50 border-purple-100 bg-purple-100 text-purple-600",
                "is_hidden": False
            },
            {
                "title": "Achievement Hunter",
                "description": "Completed 10 milestones! Your dedication is inspiring.",
                "icon": "Trophy",
                "category": "milestone",
                "condition_type": "milestone_count",
                "condition_value": 10,
                "color_scheme": "from-yellow-50 to-orange-50 border-yellow-100 bg-yellow-100 text-yellow-600",
                "is_hidden": False
            },
            {
                "title": "Roadmap Creator",
                "description": "Created your first roadmap! You're taking control of your learning path.",
                "icon": "TrendingUp",
                "category": "roadmap",
                "condition_type": "roadmap_count",
                "condition_value": 1,
                "color_scheme": "from-indigo-50 to-blue-50 border-indigo-100 bg-indigo-100 text-indigo-600",
                "is_hidden": False
            },
            {
                "title": "Multi-Path Explorer",
                "description": "Created 3 different roadmaps! You're exploring diverse learning opportunities.",
                "icon": "Map",
                "category": "roadmap",
                "condition_type": "roadmap_count",
                "condition_value": 3,
                "color_scheme": "from-teal-50 to-cyan-50 border-teal-100 bg-teal-100 text-teal-600",
                "is_hidden": False
            },
            {
                "title": "Goal Achiever",
                "description": "Completed your first roadmap! You've reached a major milestone.",
                "icon": "CheckCircle",
                "category": "roadmap",
                "condition_type": "roadmap_complete",
                "condition_value": 1,
                "color_scheme": "from-emerald-50 to-green-50 border-emerald-100 bg-emerald-100 text-emerald-600",
                "is_hidden": False
            },
            {
                "title": "Persistent Learner",
                "description": "Completed 20 milestones! Your consistency is paying off.",
                "icon": "Zap",
                "category": "milestone",
                "condition_type": "milestone_count",
                "condition_value": 20,
                "color_scheme": "from-violet-50 to-purple-50 border-violet-100 bg-violet-100 text-violet-600",
                "is_hidden": False
            },
            {
                "title": "Renaissance Learner",
                "description": "Explored 3 different fields! You're becoming a well-rounded learner.",
                "icon": "BookOpen",
                "category": "general",
                "condition_type": "diverse_fields",
                "condition_value": 3,
                "color_scheme": "from-rose-50 to-pink-50 border-rose-100 bg-rose-100 text-rose-600",
                "is_hidden": False
            }
        ]

        for achievement_data in default_achievements:
            # Check if achievement already exists
            existing = db.query(Achievement).filter(
                Achievement.title == achievement_data["title"]
            ).first()
            
            if not existing:
                achievement = Achievement(**achievement_data)
                db.add(achievement)
        
        db.commit()


# Global instance
achievement_service = AchievementService()
