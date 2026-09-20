import os
import re
import json
from typing import Dict, List, Optional, Any

from .pose_detector import get_pose_detector
from .movement.registry import protocol_registry
from .movement.quality_gate import VideoQualityGate
from .movement.base import MovementAnalysisResult, QualityReport


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
        # Guard 1: Check activity/protocol selection
        protocol = None
        if activity_or_protocol:
            protocol = self.registry.get_protocol(activity_or_protocol)

        # If no explicit protocol given, infer from athlete context sport/role if appropriate
        if not protocol and athlete_context:
            sport = athlete_context.get("sport", "").lower()
            role = athlete_context.get("primary_role") or athlete_context.get("role", "")
            if sport == "cricket" and "bat" in role.lower():
                protocol = self.registry.get_protocol("cricket_batting")

        if not protocol:
            requested_name = activity_or_protocol or "unspecified activity"
            supported = [p["protocol_id"] for p in self.registry.list_supported_protocols()]
            return {
                "status": "unsupported_activity",
                "is_valid": False,
                "error_code": "UNSUPPORTED_PROTOCOL",
                "message": (
                    f"Activity '{requested_name}' is not supported by any registered assessment protocol. "
                    f"Supported protocols: {', '.join(supported)}."
                ),
                "movement_scores": {},
                "movement_feedback": [
                    f"Cannot evaluate '{requested_name}'. Sportify will not apply an incorrect analyzer (e.g. squat on batting)."
                ],
            }

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

        # Generate structured feedback
        feedback = self.format_movement_feedback(analysis_result)

        return {
            "status": "completed",
            "is_valid": True,
            "protocol_id": protocol.protocol_id,
            "protocol_name": protocol.name,
            "overall_movement_quality": analysis_result.overall_movement_quality,
            "movement_scores": analysis_result.metrics,
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
            score = obs.score
            icon = "✅" if score >= 80 else "📈" if score >= 65 else "⚠️"
            raw_str = (
                f" ({obs.raw_value} {obs.unit})" if obs.raw_value is not None else ""
            )
            feedback.append(
                f"{icon} {obs.name} [{score:.0f}/100]{raw_str}: {obs.interpretation}"
            )
        return feedback

    def generate_coaching_advice(
        self,
        sport: str,
        role: str,
        movement_scores: Dict[str, float],
        protocol_name: Optional[str] = None,
        metric_details: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """
        Generate grounded coaching advice strictly based on verified assessment observations.
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

        prompt = f"""You are an elite sports biomechanics coach. Provide concise, direct, practical coaching grounded strictly in the verified movement observations below:

Sport: {sport.title()} | Role: {role.replace('_', ' ').title()}
Assessment Protocol: {protocol_name or 'Movement Assessment'}

Verified Biomechanical Observations:
{obs_summary or scores_summary}

Movement Scores:
{scores_summary}

Rules:
- Strictly evaluate observable movement mechanics (balance, posture, kinetic chain sequencing, joint angles, base stability, follow-through).
- Do NOT guess, classify, or make confident claims about specific play or shot names (e.g., do not claim 'this was a cover drive', 'this was a penalty kick', etc.). Keep the analysis focused on physical execution quality.
- Do NOT use excessive wording, filler, or over-hedged disclaimers. Deliver crisp, actionable cues the athlete can immediately apply.
- Return ONLY valid JSON (no markdown):
{{
  "overall_assessment": "2-3 sentence grounded summary of physical execution and movement quality",
  "strengths": ["grounded strength 1", "grounded strength 2"],
  "technique_tips": [
    {{"title": "title", "detail": "actionable cue addressing observed metric", "priority": "high"}},
    {{"title": "title", "detail": "actionable cue", "priority": "medium"}}
  ],
  "strategy_tips": [
    {{"title": "title", "detail": "practical application for {role} in {sport}"}}
  ],
  "drills": [
    {{"name": "drill name", "description": "exact drill instructions addressing top weakness", "reps": "sets x reps"}}
  ]
}}"""

        try:
            from .gemini_service import gemini_service
            res = gemini_service.generate_json(
                prompt=prompt,
                system_instruction=(
                    "You are an elite sports biomechanics coach. Respond ONLY with valid JSON grounded strictly in observed metrics. "
                    "Do not assert unverified specific play names; focus purely on physical mechanics, kinetic chain sequencing, and execution quality."
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
