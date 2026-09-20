from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, JSON, func
from database import Base
from sqlalchemy.orm import relationship


class AthleteProfile(Base):
    __tablename__ = "athlete_profiles"

    id = Column(Integer, primary_key=True, index=True)
    athlete_id = Column(Integer, ForeignKey("athletes.id"), unique=True)
    
    # Sport and Domain Hierarchy
    sport = Column(String, nullable=False)
    discipline = Column(String, nullable=True)
    primary_role = Column(String, nullable=True)
    sub_role = Column(String, nullable=True)
    secondary_role = Column(String, nullable=True)
    
    # Legacy role field for backward compatibility
    role = Column(String, nullable=True)
    
    # Goals and Objectives
    development_objectives = Column(JSON, nullable=True)
    goals = Column(JSON, nullable=True)
    
    # Training Constraints & Biometrics
    training_days_per_week = Column(Integer, default=4, nullable=False)
    session_duration_minutes = Column(Integer, default=60, nullable=False)
    experience_level = Column(String, default="intermediate", nullable=False)
    age = Column(Integer, default=20, nullable=False)
    weight_kg = Column(Integer, default=70, nullable=False)
    height_cm = Column(Integer, default=175, nullable=False)
    
    # Athlete Personalization & Identity
    primary_playstyle = Column(String, nullable=True)
    secondary_tendencies = Column(JSON, nullable=True)
    playstyle_profile = Column(JSON, nullable=True)
    dominant_hand = Column(String, nullable=True)
    dominant_foot = Column(String, nullable=True)
    stance = Column(String, nullable=True)
    surface_preference = Column(String, nullable=True)
    training_environment = Column(String, nullable=True)
    equipment_access = Column(JSON, nullable=True)
    athlete_description = Column(String, nullable=True)
    personal_goals_text = Column(String, nullable=True)

    self_assessment_scores = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    athlete = relationship("Athlete", back_populates="profile")

    def to_dict(self):
        return {
            "id": self.id,
            "athlete_id": self.athlete_id,
            "sport": self.sport,
            "discipline": self.discipline,
            "primary_role": self.primary_role or self.role,
            "sub_role": self.sub_role,
            "secondary_role": self.secondary_role,
            "role": self.role or self.primary_role,
            "development_objectives": self.development_objectives or self.goals or [],
            "goals": self.goals or self.development_objectives or [],
            "experience_level": self.experience_level,
            "training_days_per_week": self.training_days_per_week,
            "session_duration_minutes": self.session_duration_minutes,
            "age": self.age,
            "weight_kg": self.weight_kg,
            "height_cm": self.height_cm,
            "primary_playstyle": self.primary_playstyle,
            "secondary_tendencies": self.secondary_tendencies or [],
            "playstyle_profile": self.playstyle_profile or {},
            "dominant_hand": self.dominant_hand,
            "dominant_foot": self.dominant_foot,
            "stance": self.stance,
            "surface_preference": self.surface_preference,
            "training_environment": self.training_environment,
            "equipment_access": self.equipment_access or [],
            "athlete_description": self.athlete_description,
            "personal_goals_text": self.personal_goals_text,
            "self_assessment_scores": self.self_assessment_scores,
        }
