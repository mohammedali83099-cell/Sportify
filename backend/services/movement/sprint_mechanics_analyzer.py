import numpy as np
from typing import Dict, List, Optional, Any
from .base import MovementProtocol, MovementAnalysisResult, MetricObservation


class SprintMechanicsAnalyzer(MovementProtocol):
    """
    Biomechanical Analyzer for Athletics Sprinting & Acceleration Mechanics.
    Evaluates acceleration torso lean angle, high knee drive elevation,
    hip extension drive, and bilateral stride symmetry.
    """

    protocol_id = "sprint_mechanics"
    name = "Sprint & Acceleration Mechanics Assessment"
    # Shoulders (11, 12), Hips (23, 24), Knees (25, 26), Ankles (27, 28)
    required_landmarks = [11, 12, 23, 24, 25, 26, 27, 28]
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
                observations=["Insufficient frames to complete sprint mechanics analysis."],
            )

        hip_knee_angles_l = []
        hip_knee_angles_r = []
        torso_leans = []
        knee_heights_l = []
        knee_heights_r = []
        ankle_speeds = []

        for i, frame in enumerate(landmarks_sequence):
            ls = frame.get(11, [0.45, 0.2, 0.0, 1.0])
            rs = frame.get(12, [0.55, 0.2, 0.0, 1.0])
            lh = frame.get(23, [0.46, 0.45, 0.0, 1.0])
            rh = frame.get(24, [0.54, 0.45, 0.0, 1.0])
            lk = frame.get(25, [0.45, 0.65, 0.0, 1.0])
            rk = frame.get(26, [0.55, 0.65, 0.0, 1.0])
            la = frame.get(27, [0.44, 0.85, 0.0, 1.0])
            ra = frame.get(28, [0.56, 0.85, 0.0, 1.0])

            # Knee angles
            lk_ang = self.calculate_angle_2d(lh, lk, la)
            rk_ang = self.calculate_angle_2d(rh, rk, ra)
            hip_knee_angles_l.append(lk_ang)
            hip_knee_angles_r.append(rk_ang)

            # Knee elevations relative to hip (smaller Y difference = higher knee lift)
            knee_heights_l.append(lh[1] - lk[1])
            knee_heights_r.append(rh[1] - rk[1])

            # Torso lean angle from vertical
            mid_s = [(ls[0] + rs[0]) / 2.0, (ls[1] + rs[1]) / 2.0]
            mid_h = [(lh[0] + rh[0]) / 2.0, (lh[1] + rh[1]) / 2.0]
            dx = mid_s[0] - mid_h[0]
            dy = mid_s[1] - mid_h[1]
            torso_lean = abs(float(np.degrees(np.arctan2(dx, -dy)))) if abs(dy) > 1e-5 else 0.0
            torso_leans.append(torso_lean)

            # Ankle speed
            if i > 0:
                prev_la = landmarks_sequence[i - 1][27]
                prev_ra = landmarks_sequence[i - 1][28]
                disp = max(
                    np.sqrt((la[0] - prev_la[0]) ** 2 + (la[1] - prev_la[1]) ** 2),
                    np.sqrt((ra[0] - prev_ra[0]) ** 2 + (ra[1] - prev_ra[1]) ** 2),
                )
                ankle_speeds.append(disp * fps)
            else:
                ankle_speeds.append(0.0)

        max_ankle_speed = max(ankle_speeds)
        if max_ankle_speed < 0.25:
            return MovementAnalysisResult(
                protocol_id=self.protocol_id,
                protocol_name=self.name,
                status="failed",
                is_valid=False,
                observations=[
                    "Sprint motion could not be validated: insufficient forward/dynamic stride displacement. "
                    "Ensure athlete performs an active sprint acceleration or high-speed run."
                ],
                error_details={"error_code": "SPRINT_NOT_DETECTED"},
            )

        # 1. High Knee Drive & Hip Flexion Elevation (Knee height relative to hip)
        max_l_lift = max(knee_heights_l)
        max_r_lift = max(knee_heights_r)
        avg_knee_lift = (max_l_lift + max_r_lift) / 2.0

        if avg_knee_lift >= 0.25:
            knee_drive_score = 92.0
            knee_drive_interp = "High aggressive knee drive providing optimal front-side mechanics."
        elif avg_knee_lift >= 0.15:
            knee_drive_score = 78.0
            knee_drive_interp = "Moderate knee drive elevation. Target psoas and hip flexor power."
        else:
            knee_drive_score = 60.0
            knee_drive_interp = "Low knee recovery arc; potential backside casting."

        # 2. Acceleration Torso Lean & Posture Control (10 - 25 deg in drive phase)
        avg_torso_lean = float(np.mean(torso_leans))
        if 10.0 <= avg_torso_lean <= 28.0:
            posture_score = 90.0
            posture_interp = f"Optimal acceleration forward lean angle (~{round(avg_torso_lean)}°) through the hips."
        elif avg_torso_lean < 10.0:
            posture_score = 72.0
            posture_interp = f"Upright torso posture (~{round(avg_torso_lean)}°). Premature transition out of drive phase."
        else:
            posture_score = 65.0
            posture_interp = f"Excessive forward torso break (~{round(avg_torso_lean)}°). Check core and glute drive."

        # 3. Explosive Frequency & Leg Speed
        if max_ankle_speed >= 0.90:
            explosive_score = min(98.0, 85.0 + (max_ankle_speed - 0.90) * 15.0)
            explosive_interp = "Elite limb turnover rate and rapid ground strike velocity."
        elif max_ankle_speed >= 0.55:
            explosive_score = 72.0 + ((max_ankle_speed - 0.55) / 0.35) * 13.0
            explosive_interp = "Consistent stride turnover. Potential for greater ground reactive force."
        else:
            explosive_score = 58.0
            explosive_interp = "Low limb turnover speed. Incorporate contrast sprint drills."

        # 4. Movement Symmetry & Bilateral Stride Balance
        lift_diff = abs(max_l_lift - max_r_lift)
        if lift_diff <= 0.04:
            symmetry_score = 92.0
            symmetry_interp = "Balanced bilateral stride height and symmetric cycle timing."
        elif lift_diff <= 0.09:
            symmetry_score = 75.0
            symmetry_interp = "Moderate asymmetry in knee drive elevation between left and right legs."
        else:
            symmetry_score = 60.0
            symmetry_interp = "Significant limb asymmetry in sprint cycle. Posterior chain imbalance."

        # 5. Hip Mobility & Posterior Drive Range
        hip_mobility_score = round(knee_drive_score * 0.6 + symmetry_score * 0.4)
        hip_interp = "Free dynamic hip extension and flexion throughout acceleration cycle." if hip_mobility_score >= 80 else "Constrained hip dynamic excursion."

        overall_quality = round(
            float(
                knee_drive_score * 0.30
                + explosive_score * 0.25
                + posture_score * 0.20
                + symmetry_score * 0.15
                + hip_mobility_score * 0.10
            )
        )

        metrics = {
            "explosive_capacity": round(explosive_score),
            "upper_body_posture": round(posture_score),
            "hip_mobility": round(hip_mobility_score),
            "movement_symmetry": round(symmetry_score),
            "knee_stability": round(knee_drive_score),
        }

        metric_details = {
            "explosive_capacity": MetricObservation(
                name="Stride Turnover Velocity",
                score=round(explosive_score),
                raw_value=round(max_ankle_speed, 2),
                unit="speed",
                interpretation=explosive_interp,
            ),
            "upper_body_posture": MetricObservation(
                name="Acceleration Drive Angle",
                score=round(posture_score),
                raw_value=round(avg_torso_lean),
                unit="deg",
                interpretation=posture_interp,
            ),
            "hip_mobility": MetricObservation(
                name="Dynamic Hip Excursion",
                score=round(hip_mobility_score),
                interpretation=hip_interp,
            ),
            "movement_symmetry": MetricObservation(
                name="Bilateral Stride Symmetry",
                score=round(symmetry_score),
                interpretation=symmetry_interp,
            ),
            "knee_stability": MetricObservation(
                name="High Knee Drive Elevation",
                score=round(knee_drive_score),
                interpretation=knee_drive_interp,
            ),
        }

        observations = [
            f"Sprint Acceleration mechanics analyzed across stride cycles.",
            knee_drive_interp,
            explosive_interp,
            posture_interp,
            symmetry_interp,
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
                "peak_turnover_velocity": round(max_ankle_speed, 2),
                "avg_acceleration_lean": round(avg_torso_lean),
            },
            observations=observations,
        )
