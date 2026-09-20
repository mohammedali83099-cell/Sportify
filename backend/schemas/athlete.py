from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict, Any, Literal
from datetime import datetime


class AthleteBase(BaseModel):
    email: EmailStr
    full_name: str


class AthleteCreate(AthleteBase):
    password: str


class AthleteLogin(BaseModel):
    email: EmailStr
    password: str


class AthleteResponse(AthleteBase):
    id: int
    is_verified: bool = False
    created_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str


class SendOTPRequest(BaseModel):
    email: EmailStr
    purpose: Literal["registration", "login"] = "registration"


class VerifyOTPRequest(BaseModel):
    email: EmailStr
    otp: str = Field(..., min_length=6, max_length=6)
    purpose: Literal["registration", "login"] = "registration"
    full_name: Optional[str] = None
    password: Optional[str] = None


class OTPResponse(BaseModel):
    message: str
    cooldown_seconds: int = 60
    dev_code: Optional[str] = None


class AthleteProfileBase(BaseModel):
    sport: str = "cricket"
    discipline: Optional[str] = None
    primary_role: Optional[str] = None
    sub_role: Optional[str] = None
    secondary_role: Optional[str] = None
    role: Optional[str] = None
    development_objectives: Optional[List[str]] = Field(default_factory=list)
    goals: Optional[List[str]] = Field(default_factory=list)
    training_days_per_week: int = 4
    session_duration_minutes: int = 60
    experience_level: str = "intermediate"
    age: int = 20
    weight_kg: int = 70
    height_cm: int = 175
    
    # Personalization & Identity
    primary_playstyle: Optional[str] = None
    secondary_tendencies: Optional[List[str]] = Field(default_factory=list)
    playstyle_profile: Optional[Dict[str, Any]] = Field(default_factory=dict)
    dominant_hand: Optional[str] = None
    dominant_foot: Optional[str] = None
    stance: Optional[str] = None
    surface_preference: Optional[str] = None
    training_environment: Optional[str] = None
    equipment_access: Optional[List[str]] = Field(default_factory=list)
    athlete_description: Optional[str] = None
    personal_goals_text: Optional[str] = None

    self_assessment_scores: Optional[Dict[str, float]] = None


class AthleteProfileCreate(AthleteProfileBase):
    pass


class AthleteProfileResponse(AthleteProfileBase):
    id: int
    athlete_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
