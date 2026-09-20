import numpy as np
from typing import Dict, List, Optional, Any
from .base import MovementProtocol, MovementAnalysisResult, MetricObservation


class BasketballJumpShotAnalyzer(MovementProtocol):
    """
    Biomechanical Analyzer for Basketball Shooting and Elevation Mechanics.
    Evaluates vertical jump elevation, shooting elbow set & release extension,
    torso verticality, and landing knee valgus stability.
    """

    protocol_id = "basketball_jump_shot"
    name = "Basketball Shooting & Elevation Mechanics Assessment"
    # Shoulders (11, 12), Elbows (13, 14), Wrists (15, 16), Hips (23, 24), Knees (25, 26), Ankles (27, 28)
    required_landmarks = [11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 27, 28]
    min_usable_frames = 12
    min_visibility_threshold = 0.35
    min_landmark_coverage_ratio = 0.70

    def analyze(
        self,
        landmarks_sequence: List[Dict[int, List[float]]],
        fps: float = 30.0,
        athlete_context: Optional[Dict[str, Any]] = None,
    ) -> MovementAnalysisResult:
        if len(landmarks_sequence) < self.min_usable_frames:
            return MovementAnalysisResult(
                protocol_id=self.protocol_id,
                protocol_name=self.name,
                status="failed",
                is_valid=False,
                observations=["Insufficient frames to complete basketball jump shot analysis."],
            )

        hip_heights = []
        wrist_heights = []
        elbow_angles_r = []
        elbow_angles_l = []
        knee_angles_r = []
        knee_angles_l = []
        torso_leans = []

        for frame in landmarks_sequence:
            rs = frame.get(12, [0.55, 0.2, 0.0, 1.0])
            re = frame.get(14, rs)
            rw = frame.get(16, re)
            ls = frame.get(11, [0.45, 0.2, 0.0, 1.0])
            le = frame.get(13, ls)
            lw = frame.get(15, le)

            rh = frame.get(24, [0.54, 0.45, 0.0, 1.0])
            rk = frame.get(26, [0.55, 0.65, 0.0, 1.0])
            ra = frame.get(28, [0.56, 0.85, 0.0, 1.0])
            lh = frame.get(23, [0.46, 0.45, 0.0, 1.0])
            lk = frame.get(25, [0.45, 0.65, 0.0, 1.0])
            la = frame.get(27, [0.44, 0.85, 0.0, 1.0])

            mid_hip_y = (lh[1] + rh[1]) / 2.0
            mid_wrist_y = min(rw[1], lw[1])
            hip_heights.append(mid_hip_y)
            wrist_heights.append(mid_wrist_y)

            # Elbow angles
            elbow_angles_r.append(self.calculate_angle_2d(rs, re, rw))
            elbow_angles_l.append(self.calculate_angle_2d(ls, le, lw))

            # Knee angles
            knee_angles_r.append(self.calculate_angle_2d(rh, rk, ra))
            knee_angles_l.append(self.calculate_angle_2d(lh, lk, la))

            # Torso lean
            mid_s = [(ls[0] + rs[0]) / 2.0, (ls[1] + rs[1]) / 2.0]
            mid_h = [(lh[0] + rh[0]) / 2.0, (lh[1] + rh[1]) / 2.0]
            dx = mid_s[0] - mid_h[0]
            dy = mid_s[1] - mid_h[1]
            torso_leans.append(abs(float(np.degrees(np.arctan2(dx, -dy)))) if abs(dy) > 1e-5 else 0.0)

        hip_heights = np.array(hip_heights)
        baseline_hip_y = float(np.median(hip_heights[:5]))

        # Jump Apex (min Y is highest elevation)
        apex_idx = int(np.argmin(hip_heights))
        apex_elevation = float(baseline_hip_y - hip_heights[apex_idx])

        # Release Point (min wrist Y near jump apex)
        release_idx = int(np.argmin(wrist_heights))

        # Detect primary shooting arm (arm that reaches highest wrist elevation)
        rw_min = min(f[16][1] for f in landmarks_sequence)
        lw_min = min(f[15][1] for f in landmarks_sequence)
        right_handed = rw_min <= lw_min
        shooting_elbow_angles = elbow_angles_r if right_handed else elbow_angles_l

        # Validate that a shooting motion took place
        wrist_elevation_diff = float(np.median([f[16][1] if right_handed else f[15][1] for f in landmarks_sequence[:5]]) - min(wrist_heights))
        if wrist_elevation_diff < 0.10:
            return MovementAnalysisResult(
                protocol_id=self.protocol_id,
                protocol_name=self.name,
                status="failed",
                is_valid=False,
                observations=[
                    "Basketball jump shot could not be validated: no clear arm set and vertical release detected. "
                    "Ensure athlete performs an upward shooting release."
                ],
                error_details={"error_code": "SHOT_NOT_DETECTED"},
            )

        # 1. Release Mechanics & Elbow Extension Score
        release_elbow_ang = shooting_elbow_angles[release_idx]
        if release_elbow_ang >= 155.0:
            release_score = 94.0
            release_interp = f"Complete high-release elbow extension (~{round(release_elbow_ang)}°) providing consistent arc."
        elif release_elbow_ang >= 135.0:
            release_score = 78.0
            release_interp = f"Moderate release extension (~{round(release_elbow_ang)}°). Focus on full follow-through snap."
        else:
            release_score = 60.0
            release_interp = f"Shortened elbow extension (~{round(release_elbow_ang)}°). Incomplete follow-through."

        # 2. Explosive Vertical Drive Score
        if apex_elevation >= 0.04:
            explosive_score = min(98.0, 80.0 + (apex_elevation - 0.04) * 300.0)
            explosive_interp = "Strong vertical jump elevation creating shot separation."
        else:
            explosive_score = 65.0
            explosive_interp = "Set shot / minimal vertical lift. Target explosive countermovement drive."

        # 3. Torso Posture & Vertical Alignment Score
        release_torso_lean = torso_leans[release_idx]
        if release_torso_lean <= 8.0:
            posture_score = 92.0
            posture_interp = f"Exceptional vertical torso alignment (~{round(release_torso_lean)}° lean) minimizing shot drift."
        elif release_torso_lean <= 16.0:
            posture_score = 76.0
            posture_interp = f"Moderate torso sway (~{round(release_torso_lean)}°). Stabilize core during upward flight."
        else:
            posture_score = 58.0
            posture_interp = f"Significant backward or lateral drift (~{round(release_torso_lean)}° lean)."

        # 4. Landing Knee Stability & Deceleration Absorption
        landing_frames = landmarks_sequence[apex_idx:]
        if len(landing_frames) > 5:
            landing_lk = min(knee_angles_l[apex_idx:])
            landing_rk = min(knee_angles_r[apex_idx:])
            avg_landing_knee = (landing_lk + landing_rk) / 2.0
            if 120.0 <= avg_landing_knee <= 150.0:
                knee_score = 90.0
                knee_interp = f"Clean bilateral landing absorption (~{round(avg_landing_knee)}° knee flexion)."
            elif avg_landing_knee > 155.0:
                knee_score = 65.0
                knee_interp = f"Stiff-legged landing (~{round(avg_landing_knee)}°). Risk of knee joint impact."
            else:
                knee_score = 75.0
                knee_interp = f"Deep knee collapse on landing (~{round(avg_landing_knee)}°)."
        else:
            knee_score = 75.0
            knee_interp = "Standard landing stability."

        # 5. Movement Symmetry & Takeoff Balance
        left_knee_dip = min(knee_angles_l[:apex_idx+1]) if apex_idx > 0 else knee_angles_l[0]
        right_knee_dip = min(knee_angles_r[:apex_idx+1]) if apex_idx > 0 else knee_angles_r[0]
        asymmetry_deg = abs(left_knee_dip - right_knee_dip)
        if asymmetry_deg <= 6.0:
            symmetry_score = 92.0
            symmetry_interp = f"Balanced bilateral takeoff symmetry (~{round(asymmetry_deg)}° differential)."
        elif asymmetry_deg <= 14.0:
            symmetry_score = 76.0
            symmetry_interp = f"Moderate takeoff load asymmetry (~{round(asymmetry_deg)}° differential)."
        else:
            symmetry_score = 60.0
            symmetry_interp = f"Uneven leg loading on jump load phase (~{round(asymmetry_deg)}° differential)."

        overall_quality = round(
            float(
                release_score * 0.30
                + explosive_score * 0.25
                + posture_score * 0.20
                + knee_score * 0.15
                + symmetry_score * 0.10
            )
        )

        metrics = {
            "explosive_capacity": round(explosive_score),
            "upper_body_posture": round(posture_score),
            "knee_stability": round(knee_score),
            "movement_symmetry": round(symmetry_score),
            "balance": round(release_score),
        }

        metric_details = {
            "explosive_capacity": MetricObservation(
                name="Vertical Elevation",
                score=round(explosive_score),
                raw_value=round(apex_elevation, 2),
                unit="elevation",
                interpretation=explosive_interp,
            ),
            "upper_body_posture": MetricObservation(
                name="Flight Torso Alignment",
                score=round(posture_score),
                raw_value=round(release_torso_lean),
                unit="deg",
                interpretation=posture_interp,
            ),
            "knee_stability": MetricObservation(
                name="Landing Deceleration",
                score=round(knee_score),
                interpretation=knee_interp,
            ),
            "movement_symmetry": MetricObservation(
                name="Bilateral Takeoff Symmetry",
                score=round(symmetry_score),
                raw_value=round(asymmetry_deg),
                unit="deg",
                interpretation=symmetry_interp,
            ),
            "balance": MetricObservation(
                name="Release Snap & Follow-Through",
                score=round(release_score),
                raw_value=round(release_elbow_ang),
                unit="deg",
                interpretation=release_interp,
            ),
        }

        arm_str = "Right" if right_handed else "Left"
        observations = [
            f"{arm_str}-Handed Basketball Jump Shot analyzed across load, apex, and release phases.",
            release_interp,
            explosive_interp,
            posture_interp,
            knee_interp,
        ]

        return MovementAnalysisResult(
            protocol_id=self.protocol_id,
            protocol_name=self.name,
            status="completed",
            is_valid=True,
            overall_movement_quality=overall_quality,
            metrics=metrics,
            metric_details=metric_details,
            phase_breakdown={
                "release_frame": release_idx,
                "apex_frame": apex_idx,
                "shooting_hand": arm_str,
                "release_elbow_angle": round(release_elbow_ang),
            },
            observations=observations,
        )
