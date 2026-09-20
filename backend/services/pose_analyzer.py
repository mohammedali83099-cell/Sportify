import os
import re
import json
from typing import Dict, List, Optional, Any

from .pose_detector import get_pose_detector
from .movement.registry import protocol_registry
from .movement.quality_gate import VideoQualityGate
from .movement.base import MovementAnalysisResult, QualityReport, MovementProtocol


class PoseAnalyzer:
    """
    Activity-Aware Movement Assessment Engine.
    Validates video quality and landmarks, enforces protocol selection,
    applies activity-specific analyzers, and generates evidence-grounded coaching.
    """

    def __init__(self):
        self.pose = get_pose_detector()
        self.mp_pose = self.pose
        self.registry = protocol_registry

    def analyze_video(
        self,
        video_path: str,
        activity_or_protocol: Optional[str] = None,
        athlete_context: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """
        Activity-aware assessment entrypoint.

        1. Validates activity/protocol support (never runs wrong analyzer).
        2. Validates MediaPipe availability (fails explicitly if unavailable).
        3. Validates video quality & landmark visibility via VideoQualityGate.
        4. Runs activity-specific analyzer.
        5. Returns structured MovementAnalysisResult dictionary.
        """
    def _auto_detect_protocol(
        self,
        landmarks_seq: List[Dict[int, List[float]]],
        athlete_context: Optional[Dict[str, Any]] = None,
    ) -> MovementProtocol:
        """
        Classifies the movement from kinematic landmarks and athlete profile context.
        """
        if not landmarks_seq or len(landmarks_seq) < 5:
            return self.registry.get_protocol("squat")

        import numpy as np
        sport = (athlete_context.get("sport") or "").lower() if athlete_context else ""
        role = (athlete_context.get("primary_role") or athlete_context.get("role") or "").lower() if athlete_context else ""

        # Extract hip and knee motions across sequence
        hip_ys = []
        knee_angles = []
        for f in landmarks_seq:
            lh, rh = f.get(23), f.get(24)
            lk, rk = f.get(25), f.get(26)
            la, ra = f.get(27), f.get(28)
            if lh and rh:
                hip_ys.append((lh[1] + rh[1]) / 2.0)
            if lh and lk and la:
                ang = MovementProtocol.calculate_angle_2d(lh, lk, la)
                knee_angles.append(ang)

        # Check for vertical jump (hips rise above baseline, peak upward elevation)
        if hip_ys:
            start_hip_y = float(np.mean(hip_ys[:min(5, len(hip_ys))]))
            min_hip_y = float(min(hip_ys))  # In MediaPipe Y, lower value = higher in frame
            rise = start_hip_y - min_hip_y
            if rise > 0.04:  # Significant upward elevation
                return self.registry.get_protocol("jump")

        # Check for deep squat (knees bend < 115 deg and hips descend)
        if knee_angles:
            min_knee = min(knee_angles)
            if min_knee < 115.0:
                return self.registry.get_protocol("squat")

        # Sport-specific mapping from athlete profile context
        if sport == "cricket":
            return self.registry.get_protocol("cricket_batting")
        elif sport == "football":
            return self.registry.get_protocol("football_strike")
        elif sport == "basketball":
            return self.registry.get_protocol("basketball_jump_shot")
        elif sport == "athletics":
            return self.registry.get_protocol("sprint_mechanics")

        # Universal foundational fallback
        return self.registry.get_protocol("squat")

    def analyze_video(
        self,
        video_path: str,
        activity_or_protocol: Optional[str] = None,
        athlete_context: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """
        Activity-aware assessment entrypoint with automatic movement detection.

        1. If protocol is specified, validates against registry.
        2. If protocol is 'auto' or omitted, auto-detects from video kinematics & athlete context.
        3. Validates video quality & landmark visibility via VideoQualityGate.
        4. Runs activity-specific analyzer.
        5. Returns structured MovementAnalysisResult dictionary.
        """
        is_auto = not activity_or_protocol or str(activity_or_protocol).lower() in ("auto", "none", "", "detect")
        protocol = None
        if not is_auto:
            protocol = self.registry.get_protocol(activity_or_protocol)

        # Guard 2: MediaPipe computer vision engine availability
        if self.pose is None:
            return {
                "status": "failed",
                "is_valid": False,
                "error_code": "CV_ENGINE_UNAVAILABLE",
                "message": "MediaPipe computer vision pipeline is unavailable in the current runtime environment.",
                "movement_scores": {},
                "movement_feedback": [
                    "Biomechanical pose tracking could not initialize. Please verify OpenCV and MediaPipe installations."
                ],
            }

        # Guard 3: Quality Gate & Landmark Extraction
        quality_report, landmarks_seq, fps = VideoQualityGate.validate_and_extract_landmarks(
            video_path, self.pose, protocol=protocol
        )

        if not quality_report.is_valid:
            return {
                "status": "failed",
                "is_valid": False,
                "error_code": quality_report.error_code,
                "message": quality_report.message,
                "quality_report": quality_report.model_dump(),
                "movement_scores": {},
                "movement_feedback": [
                    f"⚠️ Assessment failed quality check: {quality_report.message}"
                ],
            }

        # If protocol was auto, resolve it now from extracted landmarks & athlete context
        if is_auto or not protocol:
            protocol = self._auto_detect_protocol(landmarks_seq, athlete_context=athlete_context)

        # Execute Activity-Specific Analyzer
        analysis_result: MovementAnalysisResult = protocol.analyze(
            landmarks_seq, fps=fps, athlete_context=athlete_context
        )

        if not analysis_result.is_valid:
            return {
                "status": analysis_result.status,
                "is_valid": False,
                "protocol_id": protocol.protocol_id,
                "protocol_name": protocol.name,
                "error_code": analysis_result.error_details.get("error_code")
                if analysis_result.error_details
                else "ANALYSIS_FAILED",
                "message": (
                    analysis_result.observations[0]
                    if analysis_result.observations
                    else "Movement pattern could not be validated."
                ),
                "quality_report": quality_report.model_dump(),
                "movement_scores": {},
                "movement_feedback": analysis_result.observations,
            }

        # Generate structured feedback without exact decimals
        feedback = self.format_movement_feedback(analysis_result)

        return {
            "status": "completed",
            "is_valid": True,
            "protocol_id": protocol.protocol_id,
            "protocol_name": protocol.name,
            "overall_movement_quality": round(analysis_result.overall_movement_quality),
            "movement_scores": {k: round(v) for k, v in analysis_result.metrics.items()},
            "metric_details": {
                k: v.model_dump() for k, v in analysis_result.metric_details.items()
            },
            "phase_breakdown": analysis_result.phase_breakdown,
            "movement_feedback": feedback,
            "quality_report": quality_report.model_dump(),
        }

    def format_movement_feedback(
        self, analysis_result: MovementAnalysisResult
    ) -> List[str]:
        feedback = []
        for key, obs in analysis_result.metric_details.items():
            score = round(obs.score)
            icon = "✅" if score >= 80 else "📈" if score >= 65 else "⚠️"
            if obs.raw_value is not None:
                if isinstance(obs.raw_value, float):
                    raw_str = f" (~{round(obs.raw_value)} {obs.unit})"
                else:
                    raw_str = f" ({obs.raw_value} {obs.unit})"
            else:
                raw_str = ""
            feedback.append(
                f"{icon} {obs.name} [{score}/100]{raw_str}: {obs.interpretation}"
            )
        return feedback

    def generate_coaching_advice(
        self,
        sport: str,
        role: str,
        movement_scores: Dict[str, float],
        protocol_name: Optional[str] = None,
        metric_details: Optional[Dict[str, Any]] = None,
        athlete_context: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """
        Generate grounded coaching advice strictly based on verified assessment observations
        and athlete-reported personalization context.
        """
        if not movement_scores:
            return {
                "overall_assessment": "Movement analysis was not completed or no valid evidence was captured.",
                "strengths": [],
                "technique_tips": [],
                "strategy_tips": [],
                "drills": [],
            }

        scores_summary = "\n".join(
            [f"  - {k.replace('_', ' ').title()}: {v:.0f}/100" for k, v in movement_scores.items()]
        )

        obs_summary = ""
        if metric_details:
            obs_summary = "\n".join(
                [
                    f"  - {v.get('name')}: {v.get('interpretation')} (Score: {v.get('score')})"
                    for v in metric_details.values()
                ]
            )

        athlete_section = ""
        if athlete_context:
            playstyle = athlete_context.get("primary_playstyle") or athlete_context.get("playstyle")
            tendencies = athlete_context.get("secondary_tendencies") or []
            tendencies_str = ", ".join(tendencies) if isinstance(tendencies, list) else str(tendencies)
            equipment = athlete_context.get("equipment_access") or []
            equipment_str = ", ".join(equipment) if isinstance(equipment, list) else str(equipment)
            surface = athlete_context.get("surface_preference")
            dom_hand = athlete_context.get("dominant_hand")
            dom_foot = athlete_context.get("dominant_foot")
            desc = athlete_context.get("athlete_description")
            personal_goals = athlete_context.get("personal_goals_text")

            athlete_section = f"""
ATHLETE PROFILE (Structured Selections):
- Sport: {sport.title()} | Role: {role.replace('_', ' ').title()}
- Primary Playstyle: {playstyle or 'Unspecified'}
- Secondary Tendencies: {tendencies_str or 'None specified'}
- Dominant Side: Hand: {dom_hand or 'N/A'}, Foot: {dom_foot or 'N/A'}
- Surface & Equipment: Surface: {surface or 'Standard'}, Equipment: {equipment_str or 'Standard'}

ATHLETE-REPORTED CONTEXT (Unstructured Athlete Voice):
- Athlete's Description of Their Game: "{desc or 'None provided'}"
- Specific Goals / Weaknesses They Want to Fix: "{personal_goals or 'None provided'}"
"""

        prompt = f"""You are an elite sports biomechanics coach. Provide concise, direct, practical coaching by combining the athlete's reported context with the verified movement measurements below:

{athlete_section if athlete_section else f"Sport: {sport.title()} | Role: {role.replace('_', ' ').title()}"}
Assessment Protocol: {protocol_name or 'Movement Assessment'}

VERIFIED BIOMECHANICAL MEASUREMENTS (Measured Vision Data):
{obs_summary or scores_summary}

Movement Scores:
{scores_summary}

STRICT COACHING RULES:
1. ONLY reference a specific metric, angle, phase, score, or finding if that exact information is present in the VERIFIED BIOMECHANICAL MEASUREMENTS above. NEVER invent, assume, or fabricate numerical measurements or unmeasured physical faults.
2. The athlete's reported description and goals represent qualitative self-perception. If the athlete reports a concern that is NOT measured or observed in the data, acknowledge it as an athlete-reported concern without falsely confirming or disproving it.
3. Tailor your actionable technique tips, strategy, and corrective drills to the athlete's playstyle, tendencies, and reported equipment constraints.
4. Do NOT use excessive wording, filler, or over-hedged disclaimers. Deliver crisp, authoritative, practical cues the athlete can immediately apply.
5. Return ONLY valid JSON (no markdown):
{{
  "overall_assessment": "2-3 sentence grounded summary of physical execution and movement quality",
  "strengths": ["grounded strength 1", "grounded strength 2"],
  "technique_tips": [
    {{"title": "title", "detail": "actionable cue addressing observed metric and athlete context", "priority": "high"}},
    {{"title": "title", "detail": "actionable cue", "priority": "medium"}}
  ],
  "strategy_tips": [
    {{"title": "title", "detail": "practical application for {role} in {sport} matching athlete's playstyle"}}
  ],
  "drills": [
    {{"name": "drill name", "description": "exact drill instructions using athlete's available equipment", "reps": "sets x reps"}}
  ]
}}"""

        try:
            from .gemini_service import gemini_service
            res = gemini_service.generate_json(
                prompt=prompt,
                system_instruction=(
                    "You are an elite sports biomechanics coach. Respond ONLY with valid JSON grounded strictly in observed metrics. "
                    "Do not assert unverified specific play names or unmeasured angles; focus purely on physical mechanics, kinetic chain sequencing, and execution quality."
                ),
                temperature=0.2,
            )
            if res:
                res["_source"] = "gemini"
                return res
        except Exception:
            pass

        return self._generate_grounded_fallback(sport, role, movement_scores, metric_details)

    def _generate_grounded_fallback(
        self,
        sport: str,
        role: str,
        movement_scores: Dict[str, float],
        metric_details: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        strengths = []
        technique_tips = []
        drills = []

        for k, score in movement_scores.items():
            label = k.replace("_", " ").title()
            if score >= 80:
                strengths.append(f"Strong {label} ({score:.0f}/100)")
            elif score < 65:
                technique_tips.append(
                    {
                        "title": f"Reinforce {label}",
                        "detail": f"Observed deficit in {label} ({score:.0f}/100). Focus on targeted stability and execution drills.",
                        "priority": "high",
                    }
                )
                drills.append(
                    {
                        "name": f"{label} Corrective Drill",
                        "description": f"Progressive motor-control sets to stabilize {label.lower()}.",
                        "reps": "3 sets x 8 reps",
                    }
                )

        if not strengths:
            strengths.append("Foundational athletic posture established")
        if not technique_tips:
            technique_tips.append(
                {
                    "title": "Maintain Movement Quality",
                    "detail": "All assessed metrics meet baseline performance thresholds.",
                    "priority": "medium",
                }
            )

        return {
            "_source": "evidence_grounded",
            "overall_assessment": f"Biomechanical assessment complete for {sport.title()} ({role.replace('_', ' ')}). Identified {len(strengths)} key strength(s) and {len(technique_tips)} area(s) for technical focus.",
            "strengths": strengths,
            "technique_tips": technique_tips,
            "strategy_tips": [
                {
                    "title": "Role Alignment",
                    "detail": f"Translate stabilized movement mechanics into sport-specific game scenarios for {sport.title()}.",
                }
            ],
            "drills": drills[:3],
        }
