from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import Dict, Any

from database import get_db
from models.athlete import Athlete
from models.athlete_profile import AthleteProfile
from schemas.athlete import AthleteProfileCreate, AthleteProfileResponse
from .auth import get_current_athlete
from services.taxonomy_service import taxonomy_service

router = APIRouter(prefix="/intake", tags=["intake"])


@router.post("/profile", response_model=AthleteProfileResponse)
async def create_or_update_profile(
    profile_data: AthleteProfileCreate,
    current_athlete: Athlete = Depends(get_current_athlete),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(AthleteProfile).filter(AthleteProfile.athlete_id == current_athlete.id)
    )
    profile = result.scalars().first()

    data_dict = profile_data.model_dump(exclude_unset=True)
    # Normalize role fields
    if not data_dict.get("primary_role") and data_dict.get("role"):
        data_dict["primary_role"] = data_dict["role"]
    if not data_dict.get("role") and data_dict.get("primary_role"):
        data_dict["role"] = data_dict["primary_role"]

    # Normalize goal fields
    if not data_dict.get("development_objectives") and data_dict.get("goals"):
        data_dict["development_objectives"] = data_dict["goals"]
    if not data_dict.get("goals") and data_dict.get("development_objectives"):
        data_dict["goals"] = data_dict["development_objectives"]

    if profile:
        for key, value in data_dict.items():
            setattr(profile, key, value)
    else:
        full_dict = profile_data.model_dump()
        full_dict.update(data_dict)
        profile = AthleteProfile(**full_dict, athlete_id=current_athlete.id)
        db.add(profile)

    await db.commit()
    await db.refresh(profile)
    return profile


@router.get("/profile", response_model=AthleteProfileResponse)
async def get_profile(
    current_athlete: Athlete = Depends(get_current_athlete),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(AthleteProfile).filter(AthleteProfile.athlete_id == current_athlete.id)
    )
    profile = result.scalars().first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile


@router.get("/sports")
async def get_sports() -> Dict[str, Any]:
    """Return the complete unified taxonomy of sports, disciplines, roles, and sub-roles."""
    return taxonomy_service.sports


@router.get("/objectives")
async def get_development_objectives() -> Dict[str, Any]:
    """Return the catalog of structured development objectives."""
    return taxonomy_service.development_objectives
