import numpy as np
from typing import Dict, List, Optional, Any
from .base import MovementProtocol, MovementAnalysisResult, MetricObservation


class FootballStrikeAnalyzer(MovementProtocol):
    """
    Biomechanical Analyzer for Football / Soccer Ball-Striking Mechanics.
    Evaluates plant-leg knee stability, striking hip extension/whip, torso posture,
    and single-leg deceleration balance.
    """

    protocol_id = "football_strike"
    name = "Football Ball-Striking Mechanics Assessment"
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
                observations=["Insufficient frames to complete football striking analysis."],
            )

        left_ankle_vels = []
        right_ankle_vels = []
        left_knee_angles = []
        right_knee_angles = []
        torso_angles = []

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
            left_knee_angles.append(lk_ang)
            right_knee_angles.append(rk_ang)

            # Torso lean relative to vertical (mid-shoulder to mid-hip)
            mid_s = [(ls[0] + rs[0]) / 2.0, (ls[1] + rs[1]) / 2.0]
            mid_h = [(lh[0] + rh[0]) / 2.0, (lh[1] + rh[1]) / 2.0]
            dx = mid_s[0] - mid_h[0]
            dy = mid_s[1] - mid_h[1]
            torso_lean_deg = abs(float(np.degrees(np.arctan2(dx, -dy)))) if abs(dy) > 1e-5 else 0.0
            torso_angles.append(torso_lean_deg)

            # Ankle velocities (frame-to-frame displacement)
            if i > 0:
                prev_la = landmarks_sequence[i - 1][27]
                prev_ra = landmarks_sequence[i - 1][28]
                l_disp = np.sqrt((la[0] - prev_la[0]) ** 2 + (la[1] - prev_la[1]) ** 2)
                r_disp = np.sqrt((ra[0] - prev_ra[0]) ** 2 + (ra[1] - prev_ra[1]) ** 2)
                left_ankle_vels.append(l_disp * fps)
                right_ankle_vels.append(r_disp * fps)
            else:
                left_ankle_vels.append(0.0)
                right_ankle_vels.append(0.0)

        left_max_v = max(left_ankle_vels)
        right_max_v = max(right_ankle_vels)

        # Strike foot is the one with highest peak swing velocity
        right_footed = right_max_v >= left_max_v
        strike_vels = right_ankle_vels if right_footed else left_ankle_vels
        plant_knee_angles = left_knee_angles if right_footed else right_knee_angles
        strike_knee_angles = right_knee_angles if right_footed else left_knee_angles

        impact_idx = int(np.argmax(strike_vels))
        peak_velocity = strike_vels[impact_idx]

        # Validation: Verify a dynamic strike motion took place
        if peak_velocity < 0.30:
            return MovementAnalysisResult(
                protocol_id=self.protocol_id,
                protocol_name=self.name,
                status="failed",
                is_valid=False,
                observations=[
                    "Football strike motion could not be validated: insufficient kicking leg acceleration. "
                    "Ensure athlete performs an unobstructed kicking/striking action."
                ],
                error_details={"error_code": "STRIKE_NOT_DETECTED"},
            )

        # 1. Plant Foot Knee Stability Score (Knee flexion angle at plant 130 - 155 deg)
        plant_knee_at_impact = plant_knee_angles[impact_idx]
        if 130.0 <= plant_knee_at_impact <= 155.0:
            plant_score = 92.0
            plant_interp = f"Optimal plant knee flexion ({plant_knee_at_impact:.1f}°) providing stable base and joint protection."
        elif 120.0 <= plant_knee_at_impact < 130.0:
            plant_score = 75.0
            plant_interp = f"Moderate plant knee compression (~{round(plant_knee_at_impact)}°). Strengthen quadriceps and decelerators."
        elif plant_knee_at_impact > 165.0:
            plant_score = 55.0
            plant_interp = f"Plant knee hyperextended or locked (~{round(plant_knee_at_impact)}°), risking joint shear."
        else:
            plant_score = 65.0
            plant_interp = f"Suboptimal plant knee angle (~{round(plant_knee_at_impact)}°)."

        # 2. Explosive Capacity / Strike Whip Velocity
        if peak_velocity >= 0.85:
            explosive_score = min(98.0, 85.0 + (peak_velocity - 0.85) * 20.0)
            explosive_interp = "Exceptional kinetic transfer and rapid foot speed through ball impact."
        elif peak_velocity >= 0.55:
            explosive_score = 70.0 + ((peak_velocity - 0.55) / 0.30) * 15.0
            explosive_interp = "Standard striking foot velocity; potential for greater hip rotational drive."
        else:
            explosive_score = 55.0
            explosive_interp = "Low strike acceleration. Focus on hip flexor velocity and kinetic chain timing."

        # 3. Upper Body Posture / Torso Lean Control (Ideal lean: 5 - 20 deg over the ball)
        impact_torso_lean = torso_angles[impact_idx]
        if 5.0 <= impact_torso_lean <= 20.0:
            posture_score = 90.0
            posture_interp = f"Excellent forward-over-ball trunk control (~{round(impact_torso_lean)}° lean)."
        elif impact_torso_lean < 5.0:
            posture_score = 75.0
            posture_interp = f"Upright torso (~{round(impact_torso_lean)}°). Risk of sending ball over target."
        elif impact_torso_lean <= 30.0:
            posture_score = 70.0
            posture_interp = f"Slight excessive lean (~{round(impact_torso_lean)}°). Maintain core stiffness."
        else:
            posture_score = 52.0
            posture_interp = f"Severe torso collapse (~{round(impact_torso_lean)}°). Core stability required."

        # 4. Hip Mobility / Strike Leg Extension Range
        min_strike_knee = min(strike_knee_angles[:impact_idx+1]) if impact_idx > 0 else strike_knee_angles[0]
        flexion_range = max(strike_knee_angles) - min_strike_knee
        if flexion_range >= 70.0:
            hip_mobility_score = 88.0
            hip_interp = f"Broad hip-knee dynamic excursion (~{round(flexion_range)}° range) enabling full elastic whip."
        elif flexion_range >= 50.0:
            hip_mobility_score = 74.0
            hip_interp = f"Moderate dynamic range (~{round(flexion_range)}°). Target posterior chain mobility."
        else:
            hip_mobility_score = 58.0
            hip_interp = f"Constrained striking leg swing arc (~{round(flexion_range)}°). Hip mobility deficit."

        # 5. Balance / Post-Strike Deceleration
        post_frames = landmarks_sequence[impact_idx:min(len(landmarks_sequence), impact_idx + 15)]
        if len(post_frames) >= 5:
            post_drifts = [abs(f[23][0] - landmarks_sequence[impact_idx][23][0]) for f in post_frames]
            avg_drift = float(np.mean(post_drifts))
            balance_score = max(50.0, min(95.0, 95.0 - avg_drift * 300.0))
            balance_interp = "Solid single-leg deceleration balance following follow-through." if balance_score >= 75 else "Excessive lateral instability post-strike."
        else:
            balance_score = 75.0
            balance_interp = "Standard recovery balance maintained."

        # Overall Quality Aggregate
        overall_quality = round(
            float(
                plant_score * 0.25
                + explosive_score * 0.30
                + posture_score * 0.20
                + hip_mobility_score * 0.15
                + balance_score * 0.10
            )
        )

        metrics = {
            "knee_stability": round(plant_score),
            "explosive_capacity": round(explosive_score),
            "upper_body_posture": round(posture_score),
            "hip_mobility": round(hip_mobility_score),
            "balance": round(balance_score),
        }

        metric_details = {
            "knee_stability": MetricObservation(
                name="Plant Knee Stability",
                score=round(plant_score),
                raw_value=round(plant_knee_at_impact),
                unit="deg",
                interpretation=plant_interp,
            ),
            "explosive_capacity": MetricObservation(
                name="Strike Whip Velocity",
                score=round(explosive_score),
                raw_value=round(peak_velocity, 2),
                unit="speed",
                interpretation=explosive_interp,
            ),
            "upper_body_posture": MetricObservation(
                name="Trunk Over Ball Posture",
                score=round(posture_score),
                raw_value=round(impact_torso_lean),
                unit="deg",
                interpretation=posture_interp,
            ),
            "hip_mobility": MetricObservation(
                name="Dynamic Swing Arc",
                score=round(hip_mobility_score),
                raw_value=round(flexion_range),
                unit="deg",
                interpretation=hip_interp,
            ),
            "balance": MetricObservation(
                name="Post-Strike Deceleration",
                score=round(balance_score),
                interpretation=balance_interp,
            ),
        }

        foot_side_str = "Right" if right_footed else "Left"
        observations = [
            f"{foot_side_str}-Footed Strike execution analyzed across dynamic execution phases.",
            plant_interp,
            explosive_interp,
            posture_interp,
            hip_interp,
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
                "impact_frame": impact_idx,
                "strike_foot": foot_side_str,
                "peak_velocity": round(peak_velocity, 2),
            },
            observations=observations,
        )
