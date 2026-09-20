import numpy as np
from typing import Dict, List, Optional, Any
from .base import MovementProtocol, MovementAnalysisResult, MetricObservation


class SquatAnalyzer(MovementProtocol):
    """
    Phase-Aware Biomechanical Analyzer for Squat Assessments.
    Detects descent, bottom inflection (depth), and ascent phases.
    Calculates defensible metrics for depth, knee valgus control,
    torso inclination balance, hip mobility, and bilateral symmetry.
    """

    protocol_id = "squat"
    name = "Squat Biomechanics Assessment"
    # Required: Left/Right Shoulders (11,12), Hips (23,24), Knees (25,26), Ankles (27,28)
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
                observations=["Insufficient frames to complete squat phase analysis."],
            )

        left_knee_angles = []
        right_knee_angles = []
        left_hip_angles = []
        right_hip_angles = []
        knee_widths = []
        ankle_widths = []
        torso_angles = []

        for frame in landmarks_sequence:
            ls = frame.get(11, [0.45, 0.2, 0.0, 1.0])
            rs = frame.get(12, [0.55, 0.2, 0.0, 1.0])
            lh = frame.get(23, [0.46, 0.45, 0.0, 1.0])
            rh = frame.get(24, [0.54, 0.45, 0.0, 1.0])
            lk = frame.get(25, [0.45, 0.65, 0.0, 1.0])
            rk = frame.get(26, [0.55, 0.65, 0.0, 1.0])
            la = frame.get(27, [0.44, 0.85, 0.0, 1.0])
            ra = frame.get(28, [0.56, 0.85, 0.0, 1.0])

            # Knee angles (Hip - Knee - Ankle)
            lk_ang = self.calculate_angle_2d(lh, lk, la)
            rk_ang = self.calculate_angle_2d(rh, rk, ra)
            left_knee_angles.append(lk_ang)
            right_knee_angles.append(rk_ang)

            # Hip angles (Shoulder - Hip - Knee)
            lh_ang = self.calculate_angle_2d(ls, lh, lk)
            rh_ang = self.calculate_angle_2d(rs, rh, rk)
            left_hip_angles.append(lh_ang)
            right_hip_angles.append(rh_ang)

            # Frontal plane widths (X distance)
            knee_w = abs(lk[0] - rk[0])
            ankle_w = abs(la[0] - ra[0])
            knee_widths.append(knee_w)
            ankle_widths.append(ankle_w)

            # Torso angle to vertical: mid-shoulder to mid-hip relative to vertical Y
            mid_shoulder = [(ls[0] + rs[0]) / 2, (ls[1] + rs[1]) / 2]
            mid_hip = [(lh[0] + rh[0]) / 2, (lh[1] + rh[1]) / 2]
            torso_vec = [mid_shoulder[0] - mid_hip[0], mid_shoulder[1] - mid_hip[1]]
            # Angle relative to vertical down
            vert_angle = float(
                np.degrees(
                    np.arctan2(abs(torso_vec[0]), abs(torso_vec[1]) + 1e-6)
                )
            )
            torso_angles.append(vert_angle)

        avg_knee_angles = (
            np.array(left_knee_angles) + np.array(right_knee_angles)
        ) / 2.0

        # Phase detection: find the deepest point (minimum knee angle)
        min_knee_idx = int(np.argmin(avg_knee_angles))
        min_knee_angle = float(avg_knee_angles[min_knee_idx])
        standing_knee_angle = float(
            np.percentile(avg_knee_angles, 90)
        )  # Near start/end

        # Verify a real squat cycle occurred (at least 30 degrees of knee flexion change)
        knee_rom = standing_knee_angle - min_knee_angle
        if knee_rom < 30.0:
            return MovementAnalysisResult(
                protocol_id=self.protocol_id,
                protocol_name=self.name,
                status="failed",
                is_valid=False,
                observations=[
                    f"Squat movement could not be validated: insufficient knee flexion observed (~{round(knee_rom)}° ROM). "
                    "Ensure athlete performs full descent and ascent in frame."
                ],
                error_details={"error_code": "INSUFFICIENT_RANGE_OF_MOTION"},
            )

        # ── 1. Squat Depth Score ───────────────────────────────────────────────
        if min_knee_angle <= 80:
            depth_score = 95.0
        elif min_knee_angle <= 90:
            depth_score = 85.0 + (90 - min_knee_angle) * 1.0
        elif min_knee_angle <= 110:
            depth_score = 65.0 + (110 - min_knee_angle) * 1.0
        else:
            depth_score = max(30.0, 65.0 - (min_knee_angle - 110) * 1.5)

        depth_interp = (
            "Full deep squat achieved below parallel."
            if depth_score >= 85
            else "Moderate depth near parallel achieved."
            if depth_score >= 70
            else "Shallow depth observed; restricted knee/hip descent."
        )

        # ── 2. Knee Stability & Valgus Control ──────────────────────────────────
        baseline_ankle_w = np.median(ankle_widths) + 1e-6
        inflection_knee_w = knee_widths[min_knee_idx]
        valgus_ratio = inflection_knee_w / baseline_ankle_w

        if valgus_ratio >= 0.95:
            valgus_score = min(95.0, 80.0 + valgus_ratio * 15.0)
            valgus_interp = "Excellent knee tracking; knees stayed stacked over ankles without inward collapse."
        elif valgus_ratio >= 0.80:
            valgus_score = 70.0 + (valgus_ratio - 0.80) * 66.0
            valgus_interp = "Mild knee caving detected during transition at bottom of squat."
        else:
            valgus_score = max(35.0, 40.0 + valgus_ratio * 35.0)
            valgus_interp = "Significant knee valgus (medial collapse) detected during maximum depth phase."

        # ── 3. Torso Posture & Hinge Balance ────────────────────────────────────
        inflection_torso = torso_angles[min_knee_idx]
        if inflection_torso <= 35.0:
            posture_score = 90.0 - abs(inflection_torso - 25.0) * 0.8
            posture_interp = "Solid upright trunk maintenance with natural hip hinge angle."
        elif inflection_torso <= 50.0:
            posture_score = 75.0 - (inflection_torso - 35.0) * 1.5
            posture_interp = "Moderate forward trunk lean observed at peak squat depth."
        else:
            posture_score = max(35.0, 55.0 - (inflection_torso - 50.0) * 1.5)
            posture_interp = "Excessive forward spinal flexion / chest collapse under bottom loading."

        # ── 4. Bilateral Symmetry (At Bottom Inflection) ────────────────────────
        left_min_k = left_knee_angles[min_knee_idx]
        right_min_k = right_knee_angles[min_knee_idx]
        side_diff = abs(left_min_k - right_min_k)

        if side_diff <= 5.0:
            sym_score = 95.0
            sym_interp = "Highly symmetrical bilateral load distribution at depth."
        elif side_diff <= 12.0:
            sym_score = 80.0 - (side_diff - 5.0) * 2.0
            sym_interp = f"Minor bilateral asymmetry (~{round(side_diff)}° difference between knees)."
        else:
            sym_score = max(40.0, 65.0 - (side_diff - 12.0) * 2.0)
            sym_interp = f"Notable side-to-side shift (~{round(side_diff)}° asymmetry) favoring one leg."

        # ── 5. Hip Mobility ────────────────────────────────────────────────────
        min_hip_angle = min(
            left_hip_angles[min_knee_idx], right_hip_angles[min_knee_idx]
        )
        if min_hip_angle <= 75.0:
            hip_score = 92.0
            hip_interp = "Excellent hip flexion range unlocked in the deep hole."
        elif min_hip_angle <= 90.0:
            hip_score = 78.0
            hip_interp = "Good functional hip range achieved."
        else:
            hip_score = max(40.0, 65.0 - (min_hip_angle - 90.0) * 1.5)
            hip_interp = "Restricted hip flexion limiting squat depth progression."

        # ── Overall Quality Composite ──────────────────────────────────────────
        overall_score = round(
            float(
                depth_score * 0.30
                + valgus_score * 0.25
                + posture_score * 0.20
                + sym_score * 0.15
                + hip_score * 0.10
            )
        )

        metrics = {
            "knee_stability": round(float(valgus_score)),
            "hip_mobility": round(float(hip_score)),
            "upper_body_posture": round(float(posture_score)),
            "movement_symmetry": round(float(sym_score)),
            "explosive_capacity": round(float(min(100.0, depth_score * 0.9))),
            "balance": round(float((sym_score + posture_score) / 2)),
        }

        metric_details = {
            "squat_depth": MetricObservation(
                name="Squat Depth",
                score=round(float(depth_score)),
                raw_value=round(min_knee_angle),
                unit="degrees (knee flexion)",
                interpretation=depth_interp,
            ),
            "knee_stability": MetricObservation(
                name="Knee Valgus & Tracking Stability",
                score=round(float(valgus_score)),
                raw_value=round(valgus_ratio, 2),
                unit="knee-to-ankle ratio",
                interpretation=valgus_interp,
            ),
            "upper_body_posture": MetricObservation(
                name="Torso Inclination Balance",
                score=round(float(posture_score)),
                raw_value=round(inflection_torso),
                unit="degrees from vertical",
                interpretation=posture_interp,
            ),
            "movement_symmetry": MetricObservation(
                name="Bilateral Knee Symmetry",
                score=round(float(sym_score)),
                raw_value=round(side_diff),
                unit="degrees difference",
                interpretation=sym_interp,
            ),
            "hip_mobility": MetricObservation(
                name="Deep Hip Flexion Range",
                score=round(float(hip_score)),
                raw_value=round(min_hip_angle),
                unit="degrees (hip flexion)",
                interpretation=hip_interp,
            ),
        }

        observations = [
            f"Squat minimum knee angle reached ~{round(min_knee_angle)}° at frame {min_knee_idx}.",
            depth_interp,
            valgus_interp,
            posture_interp,
            sym_interp,
        ]

        phase_breakdown = {
            "descent_frames": int(min_knee_idx),
            "inflection_frame": int(min_knee_idx),
            "ascent_frames": int(len(landmarks_sequence) - min_knee_idx),
            "min_knee_angle": round(min_knee_angle),
            "standing_knee_angle": round(standing_knee_angle),
        }

        return MovementAnalysisResult(
            protocol_id=self.protocol_id,
            protocol_name=self.name,
            status="completed",
            is_valid=True,
            overall_movement_quality=overall_score,
            metrics=metrics,
            metric_details=metric_details,
            phase_breakdown=phase_breakdown,
            observations=observations,
        )
