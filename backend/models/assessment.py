from sqlalchemy import Column, Integer, Float, String, DateTime, ForeignKey, JSON, func
from database import Base


class MovementAssessment(Base):
    __tablename__ = "movement_assessments"

    id = Column(Integer, primary_key=True, index=True)
    athlete_id = Column(Integer, ForeignKey("athletes.id"), nullable=True)
    protocol_id = Column(String, nullable=True)
    video_filename = Column(String, nullable=False)
    video_path = Column(String, nullable=False)
    status = Column(String, nullable=False, default="pending")
    overall_movement_quality = Column(Float, nullable=True)
    pose_data = Column(JSON, nullable=True)
    movement_scores = Column(JSON, nullable=True)
    metric_details = Column(JSON, nullable=True)
    movement_feedback = Column(JSON, nullable=True)
    quality_report = Column(JSON, nullable=True)
    error_details = Column(JSON, nullable=True)
    coaching = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class BottleneckReport(Base):
    __tablename__ = "bottleneck_reports"

    id = Column(Integer, primary_key=True, index=True)
    athlete_id = Column(Integer, ForeignKey("athletes.id"), nullable=True)
    assessment_id = Column(Integer, ForeignKey("movement_assessments.id"), nullable=True)
    bottlenecks = Column(JSON, nullable=False)
    strengths = Column(JSON, nullable=True)
    proficient = Column(JSON, nullable=True)
    development_areas = Column(JSON, nullable=True)
    critical_bottlenecks = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
