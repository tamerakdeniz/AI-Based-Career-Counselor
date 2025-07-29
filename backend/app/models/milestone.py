from sqlalchemy import Column, Integer, String, ForeignKey, Boolean, Date, Text, DateTime
from sqlalchemy.orm import relationship
from app.database import Base
import json
from datetime import datetime

class Milestone(Base):
    __tablename__ = "milestones"

    id = Column(Integer, primary_key=True, index=True)
    roadmap_id = Column(Integer, ForeignKey("roadmaps.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(String, nullable=True)
    completed = Column(Boolean, default=False)
    due_date = Column(Date, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    _resources = Column("resources", Text, nullable=True)

    roadmap = relationship("Roadmap", back_populates="milestones")

    @property
    def resources(self):
        """Get resources as a list of objects"""
        if self._resources:
            return json.loads(self._resources)
        return []

    @resources.setter
    def resources(self, value):
        """Set resources from a list of objects"""
        self._resources = json.dumps(value)