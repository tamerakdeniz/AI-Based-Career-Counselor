from sqlalchemy import Column, Integer, String, ForeignKey, Boolean, Date, Text
from sqlalchemy.orm import relationship
from app.database import Base
import json

class Milestone(Base):
    __tablename__ = "milestones"

    id = Column(Integer, primary_key=True, index=True)
    roadmap_id = Column(Integer, ForeignKey("roadmaps.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(String, nullable=True)
    completed = Column(Boolean, default=False)
    due_date = Column(Date, nullable=True)
    resources = Column(Text, nullable=True)  # JSON string for resources list

    roadmap = relationship("Roadmap", back_populates="milestones")

    def get_resources(self):
        """Get resources as a list"""
        value = getattr(self, "resources", None)
        if isinstance(value, str) and value:
            return json.loads(value)
        return []

    def set_resources(self, resources_list):
        """Set resources from a list"""
        if resources_list:
            self.resources = json.dumps(resources_list)
        else:
            self.resources = None