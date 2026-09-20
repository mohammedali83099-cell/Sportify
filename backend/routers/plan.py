from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Dict, Any
from datetime import date

from database import get_db
from models.athlete import Athlete
from models.athlete_profile import AthleteProfile
from models.assessment import BottleneckReport
from models.plan import TrainingPlan, ProgressLog
from schemas.plan import TrainingPlanResponse, RecoveryCheckInRequest, RecoveryCheckInResponse
from .auth import get_current_athlete
from services.plan_generator import plan_generator

router = APIRouter(prefix="/plan", tags=["plan"])


@router.get("/current", response_model=TrainingPlanResponse)
async def get_current_plan(
    current_athlete: Athlete = Depends(get_current_athlete),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve the athlete's active training plan."""
    result = await db.execute(
        select(TrainingPlan)
        .filter(
            TrainingPlan.athlete_id == current_athlete.id,
            TrainingPlan.is_active == True,
        )
        .order_by(TrainingPlan.created_at.desc())
    )
    plan = result.scalars().first()
    if not plan:
        raise HTTPException(status_code=404, detail="No active plan found")
    return plan


@router.post("/generate", response_model=TrainingPlanResponse)
async def generate_plan(
    current_athlete: Athlete = Depends(get_current_athlete),
    db: AsyncSession = Depends(get_db),
):
    """
    Generate a 4-week role-specific baseline training pathway.
    """
    prof_res = await db.execute(
        select(AthleteProfile).filter(AthleteProfile.athlete_id == current_athlete.id)
    )
    profile = prof_res.scalars().first()
    if not profile:
        raise HTTPException(status_code=400, detail="Athlete profile required before plan generation")

    rep_res = await db.execute(
        select(BottleneckReport)
        .filter(BottleneckReport.athlete_id == current_athlete.id)
        .order_by(BottleneckReport.created_at.desc())
    )
    report = rep_res.scalars().first()

    bottlenecks = report.bottlenecks if report else []
    strengths = report.strengths if report else []
    dev_areas = report.development_areas if report else []

    plan_data = plan_generator.generate_plan(
        athlete_profile=profile.to_dict(),
        bottlenecks=bottlenecks,
        strengths=strengths,
        development_areas=dev_areas,
    )

    # If athlete already has an active doctor check-in, preserve it into the newly generated plan
    existing_doc_check_in = None
    if profile.playstyle_profile and isinstance(profile.playstyle_profile, dict):
        existing_doc_check_in = profile.playstyle_profile.get("doctor_recovery_check_in")

    if existing_doc_check_in:
        plan_data["recovery_protocol"] = plan_generator.generate_recovery_plan(
            athlete_profile=profile.to_dict(),
            doctor_check_in=existing_doc_check_in,
            bottlenecks=bottlenecks,
        )

    # Deactivate older plans
    old_plans_res = await db.execute(
        select(TrainingPlan).filter(
            TrainingPlan.athlete_id == current_athlete.id,
            TrainingPlan.is_active == True,
        )
    )
    for p in old_plans_res.scalars().all():
        p.is_active = False

    new_plan = TrainingPlan(
        athlete_id=current_athlete.id,
        bottleneck_report_id=report.id if report else None,
        plan_data=plan_data,
        week_start_date=date.today(),
        is_active=True,
    )
    db.add(new_plan)
    await db.commit()
    await db.refresh(new_plan)
    return new_plan


@router.get("/recovery")
async def get_dynamic_recovery_plan(
    current_athlete: Athlete = Depends(get_current_athlete),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """Retrieve dynamic recovery recommendations or active doctor-guided protocol."""
    prof_res = await db.execute(
        select(AthleteProfile).filter(AthleteProfile.athlete_id == current_athlete.id)
    )
    profile = prof_res.scalars().first()
    profile_dict = profile.to_dict() if profile else {"sport": "cricket", "role": "batsman"}

    # Check if a doctor check-in exists in profile
    doc_check_in = None
    if profile and profile.playstyle_profile and isinstance(profile.playstyle_profile, dict):
        doc_check_in = profile.playstyle_profile.get("doctor_recovery_check_in")

    # Fetch recent logs for load calculation
    logs_res = await db.execute(
        select(ProgressLog)
        .filter(ProgressLog.athlete_id == current_athlete.id)
        .order_by(ProgressLog.session_date.desc())
        .limit(7)
    )
    logs = logs_res.scalars().all()

    avg_rpe = sum(l.perceived_exertion for l in logs) / len(logs) if logs else 6.0
    total_mins = sum(l.duration_minutes for l in logs)

    rep_res = await db.execute(
        select(BottleneckReport)
        .filter(BottleneckReport.athlete_id == current_athlete.id)
        .order_by(BottleneckReport.created_at.desc())
    )
    report = rep_res.scalars().first()

    return plan_generator.generate_recovery_plan(
        athlete_profile=profile_dict,
        doctor_check_in=doc_check_in,
        bottlenecks=report.bottlenecks if report else [],
        recent_sessions_load={"avg_rpe": avg_rpe, "total_minutes_week": total_mins},
    )


@router.post("/recovery/check-in", response_model=RecoveryCheckInResponse)
async def submit_doctor_recovery_checkin(
    check_in: RecoveryCheckInRequest,
    current_athlete: Athlete = Depends(get_current_athlete),
    db: AsyncSession = Depends(get_db),
):
    """
    User check-in for an injury with doctor recommendations (rest days, rehab days, exercises, restrictions).
    The system synthesizes the doctor's orders and generates a 3-phase recovery progression.
    """
    prof_res = await db.execute(
        select(AthleteProfile).filter(AthleteProfile.athlete_id == current_athlete.id)
    )
    profile = prof_res.scalars().first()
    if not profile:
        raise HTTPException(status_code=400, detail="Athlete profile required before recovery check-in")

    # Store check-in data in profile.playstyle_profile
    playstyle = profile.playstyle_profile or {}
    check_in_dict = check_in.model_dump()
    playstyle["doctor_recovery_check_in"] = check_in_dict
    profile.playstyle_profile = dict(playstyle)

    # Generate the 3-phase doctor-grounded recovery protocol
    recovery_proto = plan_generator.generate_recovery_plan(
        athlete_profile=profile.to_dict(),
        doctor_check_in=check_in_dict,
    )

    # Also update the active training plan's recovery protocol if one exists
    plan_res = await db.execute(
        select(TrainingPlan)
        .filter(TrainingPlan.athlete_id == current_athlete.id, TrainingPlan.is_active == True)
        .order_by(TrainingPlan.created_at.desc())
    )
    active_plan = plan_res.scalars().first()
    if active_plan:
        plan_data = dict(active_plan.plan_data)
        plan_data["recovery_protocol"] = recovery_proto
        active_plan.plan_data = plan_data

    await db.commit()

    return RecoveryCheckInResponse(
        status="success",
        message="Doctor recommendations processed successfully. Recovery protocol initialized.",
        recovery_protocol=recovery_proto,
    )


@router.get("/history", response_model=List[TrainingPlanResponse])
async def get_plan_history(
    current_athlete: Athlete = Depends(get_current_athlete),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(TrainingPlan)
        .filter(TrainingPlan.athlete_id == current_athlete.id)
        .order_by(TrainingPlan.created_at.desc())
    )
    return result.scalars().all()

