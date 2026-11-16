from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime


class MovementAssessmentResponse(BaseModel):
    id: Optional[int] = None
    protocol_id: Optional[str] = None
    status: str
    is_valid: bool = True
    overall_movement_quality: Optional[float] = None
    movement_scores: Optional[Dict[str, float]] = None
    metric_details: Optional[Dict[str, Any]] = None
    movement_feedback: Optional[List[str]] = None
    quality_report: Optional[Dict[str, Any]] = None
    error_details: Optional[Dict[str, Any]] = None
    coaching: Optional[Dict[str, Any]] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class BottleneckReportResponse(BaseModel):
    id: Optional[int] = None
    bottlenecks: List[Dict[str, Any]] = Field(default_factory=list)
    strengths: Optional[List[Dict[str, Any]]] = None
    proficient: Optional[List[Dict[str, Any]]] = None
    development_areas: Optional[List[Dict[str, Any]]] = None
    critical_bottlenecks: Optional[List[Dict[str, Any]]] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ManualAssessmentCreate(BaseModel):
    scores: Dict[str, float]
    notes: Optional[str] = None


class ProtocolInfo(BaseModel):
    protocol_id: str
    name: str
    required_landmarks_count: int
    min_usable_frames: int
