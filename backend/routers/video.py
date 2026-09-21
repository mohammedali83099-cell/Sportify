from fastapi import APIRouter, UploadFile, File, BackgroundTasks, HTTPException, Form, Header
from typing import Optional, Dict, Any, List
import os
import shutil
import uuid
import json

from sqlalchemy.future import select
from sqlalchemy import func
from jose import jwt

from database import AsyncSessionLocal
from models.athlete import Athlete
from models.assessment import MovementAssessment, BottleneckReport
from services.pose_analyzer import PoseAnalyzer
from services.movement.registry import protocol_registry
from services.bottleneck_engine import bottleneck_engine
from config import settings

router = APIRouter(prefix="/video", tags=["video"])

# In-memory coaching & assessment job store
coaching_jobs: Dict[str, Dict[str, Any]] = {}


async def _run_coaching_job(
    job_id: str,
    video_path: str,
    sport: str,
    role: str,
    sub_role: Optional[str] = None,
    protocol_id: Optional[str] = None,
    athlete_context: Optional[Dict[str, Any]] = None,
    athlete_id: Optional[int] = None,
):
    """
    Background worker:
    1. Runs activity-aware VideoQualityGate + specific MovementProtocol.
    2. If valid, generates evidence-grounded coaching advice using athlete context.
    3. Persists MovementAssessment and BottleneckReport to PostgreSQL when athlete_id is present.
    4. If invalid/failed, records explicit failure status without fabricating fake metrics.
    """
    try:
        analyzer = PoseAnalyzer()
        ctx = dict(athlete_context) if athlete_context else {}
        ctx.setdefault("sport", sport)
        ctx.setdefault("role", role)
        ctx.setdefault("primary_role", role)
        if sub_role:
            ctx.setdefault("sub_role", sub_role)

        # Activity-aware analysis
        analysis_result = analyzer.analyze_video(
            video_path,
            activity_or_protocol=protocol_id,
            athlete_context=ctx,
        )

        if not analysis_result.get("is_valid", False):
            coaching_jobs[job_id] = {
                "status": "failed",
                "is_valid": False,
                "sport": sport,
                "role": role,
                "error_code": analysis_result.get("error_code", "ASSESSMENT_FAILED"),
                "message": analysis_result.get("message", "Movement assessment could not be validated."),
                "movement_scores": {},
                "movement_feedback": analysis_result.get("movement_feedback", []),
                "quality_report": analysis_result.get("quality_report"),
            }
            return

        movement_scores = analysis_result.get("movement_scores", {})
        metric_details = analysis_result.get("metric_details", {})
        protocol_name = analysis_result.get("protocol_name")

        coaching = analyzer.generate_coaching_advice(
            sport,
            role,
            movement_scores,
            protocol_name=protocol_name,
            metric_details=metric_details,
            athlete_context=ctx,
        )

        # 4-tier development profile & bottlenecks evaluation
        eval_result = bottleneck_engine.evaluate_development_profile(
            ctx, movement_scores
        )
        bottlenecks = eval_result.get("bottlenecks", [])

        # Persist to database if athlete_id is available
        assessment_db_id = None
        if athlete_id:
            try:
                async with AsyncSessionLocal() as db:
                    assessment = MovementAssessment(
                        athlete_id=athlete_id,
                        protocol_id=analysis_result.get("protocol_id") or protocol_id,
                        video_filename=os.path.basename(video_path),
                        video_path=video_path,
                        status="completed",
                        overall_movement_quality=analysis_result.get("overall_movement_quality"),
                        movement_scores=movement_scores,
                        metric_details=metric_details,
                        movement_feedback=analysis_result.get("movement_feedback"),
                        quality_report=analysis_result.get("quality_report"),
                    )
                    db.add(assessment)
                    await db.flush()
                    assessment_db_id = assessment.id

                    report = BottleneckReport(
                        athlete_id=athlete_id,
                        assessment_id=assessment.id,
                        bottlenecks=bottlenecks,
                        strengths=eval_result.get("strengths", []),
                        proficient=eval_result.get("proficient", []),
                        development_areas=eval_result.get("development_areas", []),
                        critical_bottlenecks=eval_result.get("critical_bottlenecks", []),
                    )
                    db.add(report)
                    await db.commit()
            except Exception as db_err:
                print(f"[WARN] Failed to persist assessment to database: {db_err}")

        coaching_jobs[job_id] = {
            "status": "completed",
            "is_valid": True,
            "id": assessment_db_id,
            "athlete_id": athlete_id,
            "sport": sport,
            "role": role,
            "sub_role": sub_role,
            "protocol_id": analysis_result.get("protocol_id"),
            "protocol_name": protocol_name,
            "overall_movement_quality": analysis_result.get("overall_movement_quality"),
            "movement_scores": movement_scores,
            "metric_details": metric_details,
            "phase_breakdown": analysis_result.get("phase_breakdown"),
            "movement_feedback": analysis_result.get("movement_feedback"),
            "quality_report": analysis_result.get("quality_report"),
            "coaching": coaching,
            "bottlenecks": bottlenecks,
            "development_profile": eval_result,
        }

    except Exception as e:
        coaching_jobs[job_id] = {
            "status": "failed",
            "is_valid": False,
            "error_code": "PIPELINE_ERROR",
            "message": f"An error occurred during video processing: {str(e)}",
            "movement_scores": {},
            "movement_feedback": ["Video processing encountered an unexpected system error."],
        }
    finally:
        try:
            if os.path.exists(video_path):
                os.remove(video_path)
        except Exception:
            pass


@router.post("/coach")
@router.post("/upload")
async def coach_video(
    background_tasks: BackgroundTasks,
    video: UploadFile = File(...),
    sport: str = Form(default="cricket"),
    role: str = Form(default="batsman"),
    sub_role: Optional[str] = Form(default=None),
    protocol: Optional[str] = Form(default=None),
    activity: Optional[str] = Form(default=None),
    athlete_context: Optional[str] = Form(default=None),
    authorization: Optional[str] = Header(default=None),
):
    """
    Upload an activity video for biomechanical analysis and evidence-grounded coaching.
    Accepts activity / protocol parameter to enforce appropriate analysis model.
    Accepts athlete_context JSON string to ground coaching advice in athlete profile & goals.
    """
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    job_id = str(uuid.uuid4())[:8]

    ext = (video.filename or "video.mp4").rsplit(".", 1)[-1].lower()
    if ext not in ["mp4", "mov", "avi", "mkv", "webm"]:
        raise HTTPException(
            400, "Unsupported format. Use mp4, mov, avi, mkv or webm."
        )

    selected_protocol = protocol or activity

    context_dict = None
    if athlete_context:
        try:
            context_dict = json.loads(athlete_context)
        except Exception:
            context_dict = None

    # Resolve athlete_id from context or Bearer authorization header
    athlete_id = None
    if context_dict and context_dict.get("athlete_id"):
        try:
            athlete_id = int(context_dict["athlete_id"])
        except (ValueError, TypeError):
            pass

    if not athlete_id and authorization and authorization.startswith("Bearer "):
        try:
            token = authorization.split(" ", 1)[1]
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
            email = payload.get("sub")
            if email:
                async with AsyncSessionLocal() as db:
                    res = await db.execute(
                        select(Athlete).filter(func.lower(Athlete.email) == email.strip().lower())
                    )
                    ath = res.scalars().first()
                    if ath:
                        athlete_id = ath.id
        except Exception:
            pass

    video_path = os.path.join(settings.UPLOAD_DIR, f"{job_id}.{ext}")
    with open(video_path, "wb") as f:
        shutil.copyfileobj(video.file, f)

    coaching_jobs[job_id] = {"status": "processing", "job_id": job_id}

    background_tasks.add_task(
        _run_coaching_job,
        job_id,
        video_path,
        sport.lower(),
        role.lower().replace(" ", "_"),
        sub_role.lower().replace(" ", "_") if sub_role else None,
        selected_protocol,
        context_dict,
        athlete_id,
    )

    return {
        "job_id": job_id,
        "status": "processing",
        "protocol": selected_protocol,
    }


@router.get("/coach/{job_id}")
@router.get("/{job_id}/status")
async def get_coaching_status(job_id: str):
    """Poll to retrieve the status and results of a video analysis job."""
    if job_id not in coaching_jobs:
        raise HTTPException(404, "Job not found")
    return coaching_jobs[job_id]


@router.get("/protocols")
async def get_supported_protocols() -> List[Dict[str, Any]]:
    """List all registered and validated movement assessment protocols."""
    return protocol_registry.list_supported_protocols()
