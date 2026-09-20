from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime, date


class TrainingPlanResponse(BaseModel):
    id: int
    plan_data: Dict[str, Any]
    week_start_date: date
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class ProgressLogCreate(BaseModel):
    session_date: date = Field(default_factory=date.today)
    session_type: str = "Strength"
    completed: bool = True
    duration_minutes: int = 60
    perceived_exertion: int = 6  # RPE 1-10
    notes: Optional[str] = None
    exercises_completed: Optional[List[Dict[str, Any]]] = None


class ProgressLogResponse(ProgressLogCreate):
    id: int
    athlete_id: int
    plan_id: Optional[int] = None
    workload_index: Optional[float] = None
    created_at: datetime

    class Config:
        from_attributes = True


class MetricTrendPoint(BaseModel):
    date: str
    score: float
    protocol: Optional[str] = None


class DashboardResponse(BaseModel):
    current_plan: Optional[TrainingPlanResponse] = None
    recent_logs: List[ProgressLogResponse] = Field(default_factory=list)
    score_trends: Dict[str, List[MetricTrendPoint]] = Field(default_factory=dict)
    development_profile: Optional[Dict[str, Any]] = None
    bottlenecks: Optional[List[Dict[str, Any]]] = None
    training_stats: Dict[str, Any] = Field(default_factory=dict)
    recovery_recommendation: Optional[Dict[str, Any]] = None


class ReassessmentComparisonResponse(BaseModel):
    average_delta: float
    overall_trajectory: str
    metric_deltas: Dict[str, Any]
    improved_metrics: List[Dict[str, Any]]
    stable_metrics: List[Dict[str, Any]]
    regressed_metrics: List[Dict[str, Any]]
    resolved_bottlenecks: List[Dict[str, Any]]
    persisting_bottlenecks: List[Dict[str, Any]]
    emerging_priorities: List[Dict[str, Any]]
    updated_development_profile: Dict[str, Any]


class RecoveryCheckInRequest(BaseModel):
    injury_name: str = Field(..., description="Specific injury or problem, e.g. 'Grade 1 Hamstring Strain'")
    severity: str = Field(default="Moderate", description="'Mild', 'Moderate', or 'Severe'")
    doctor_rest_days: int = Field(default=3, ge=0, le=90, description="Number of complete rest days prescribed by doctor")
    doctor_rehab_days: int = Field(default=7, ge=0, le=180, description="Number of active physical therapy/rehab days prescribed by doctor")
    doctor_exercises: Optional[str] = Field(None, description="Specific rehab exercises prescribed by doctor")
    doctor_restrictions: Optional[str] = Field(None, description="Movements, exercises, or loads strictly forbidden by doctor")
    current_day_offset: Optional[int] = Field(default=1, ge=1, description="Current day in the recovery timeline")


class RecoveryCheckInResponse(BaseModel):
    status: str
    message: str
    recovery_protocol: Dict[str, Any]

