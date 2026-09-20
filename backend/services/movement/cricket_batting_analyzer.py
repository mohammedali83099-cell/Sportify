import numpy as np
from typing import Dict, List, Optional, Any
from .base import MovementProtocol, MovementAnalysisResult, MetricObservation


class CricketBattingAnalyzer(MovementProtocol):
    """
    Biomechanical Analyzer for Cricket Batting Mechanics.
    Evaluates front knee stride flexion, head over ball alignment, lead elbow elevation,
    and rotational weight transfer.
    """

    protocol_id = "cricket_batting"
    name = "Cricket Batting Mechanics Assessment"
    # Shoulders (11,12), Elbows (13,14), Wrists (15,16), Hips (23,24), Knees (25,26), Ankles (27,28)
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
                observations=["Insufficient frames to complete cricket batting analysis."],
            )

        lead_elbow_angles = []
        lead_knee_angles = []
        head_knee_horizontal_diffs = []
        wrist_velocities = []

        # Determine batting stance side (right-handed vs left-handed based on initial facing direction)
        initial_frame = landmarks_sequence[0]
        # In a right-handed batter facing the bowler, left shoulder (11) and left knee (25) lead
        left_lead = initial_frame.get(11, [0, 0, 0, 0])[0] < initial_frame.get(12, [1, 0, 0, 0])[0]
        lead_s_idx, rear_s_idx = (11, 12) if left_lead else (12, 11)
        lead_e_idx, rear_e_idx = (13, 14) if left_lead else (14, 13)
        lead_w_idx, rear_w_idx = (15, 16) if left_lead else (16, 15)
        lead_k_idx, rear_k_idx = (25, 26) if left_lead else (26, 25)
        lead_a_idx, rear_a_idx = (27, 28) if left_lead else (28, 27)
        lead_h_idx, rear_h_idx = (23, 24) if left_lead else (24, 23)

        for i, frame in enumerate(landmarks_sequence):
            ls = frame.get(lead_s_idx, [0.5, 0.2, 0.0, 1.0])
            le = frame.get(lead_e_idx, ls)
            lw = frame.get(lead_w_idx, le)
            lh = frame.get(lead_h_idx, [0.5, 0.5, 0.0, 1.0])
            lk = frame.get(lead_k_idx, lh)
            la = frame.get(lead_a_idx, lk)
            nose = frame.get(0, ls)

            # Lead elbow angle (Shoulder - Elbow - Wrist)
            e_ang = self.calculate_angle_2d(ls, le, lw)
            lead_elbow_angles.append(e_ang)

            # Lead knee angle (Hip - Knee - Ankle)
            k_ang = self.calculate_angle_2d(lh, lk, la)
            lead_knee_angles.append(k_ang)

            # Head over lead knee horizontal alignment
            h_diff = abs(nose[0] - lk[0])
            head_knee_horizontal_diffs.append(h_diff)

            # Wrist swing speed (frame-to-frame displacement)
            if i > 0:
                prev_w = landmarks_sequence[i - 1][lead_w_idx]
                disp = np.sqrt(
                    (lw[0] - prev_w[0]) ** 2 + (lw[1] - prev_w[1]) ** 2
                )
                wrist_velocities.append(disp * fps)
            else:
                wrist_velocities.append(0.0)

        # Contact / Execution Point: Frame of peak wrist velocity
        contact_idx = int(np.argmax(wrist_velocities))
        contact_lead_knee = lead_knee_angles[contact_idx]
        contact_elbow = lead_elbow_angles[contact_idx]
        contact_head_diff = head_knee_horizontal_diffs[contact_idx]

        # Verify a dynamic batting swing occurred
        max_wrist_vel = wrist_velocities[contact_idx]
        if max_wrist_vel < 0.25:
            return MovementAnalysisResult(
                protocol_id=self.protocol_id,
                protocol_name=self.name,
                status="failed",
                is_valid=False,
                observations=[
                    "Cricket batting movement could not be validated: insufficient bat/wrist acceleration detected. "
                    "Ensure athlete executes a clear forward stroke in frame."
                ],
                error_details={"error_code": "BATTING_STROKE_NOT_DETECTED"},
            )

        # ── 1. Front Knee Brace & Flexion ───────────────────────────────────────
        # Ideal front-foot drive knee flexion is 115° - 150° (stable base, flexed not locked or collapsing)
        if 110.0 <= contact_lead_knee <= 150.0:
            knee_score = 92.0
            knee_interp = f"Excellent front-knee brace ({round(contact_lead_knee, 1)}°) establishing a solid hitting base."
        elif contact_lead_knee < 110.0:
            knee_score = 72.0
            knee_interp = f"Over-flexed front knee ({round(contact_lead_knee, 1)}°); weight drifting too far forward."
        else:
            knee_score = 65.0
            knee_interp = f"Stiff/locked front knee ({round(contact_lead_knee, 1)}°); reducing power transfer through contact."

        # ── 2. Head Over Ball / Knee Alignment (Balance) ────────────────────────
        if contact_head_diff <= 0.08:
            balance_score = 94.0
            balance_interp = "Head aligned directly over lead knee; optimal eye-line over contact point."
        elif contact_head_diff <= 0.16:
            balance_score = 78.0
            balance_interp = "Slight head displacement off vertical axis at moment of stroke execution."
        else:
            balance_score = 58.0
            balance_interp = "Head falling away from line of drive; affects timing and shot control."

        # ── 3. Lead Elbow Elevation (Posture & Form) ───────────────────────────
        # High lead elbow (70° to 140°) guides straight drive
        if 70.0 <= contact_elbow <= 140.0:
            elbow_score = 90.0
            elbow_interp = "High lead elbow guiding bat face straight through the target zone."
        else:
            elbow_score = 70.0
            elbow_interp = "Lower lead elbow position; may cause bat face to slice or cross the line."

        # ── 4. Explosive Swing Flow ────────────────────────────────────────────
        swing_flow_score = min(95.0, max(50.0, 50.0 + max_wrist_vel * 30.0))

        overall_score = round(
            float(
                knee_score * 0.30
                + balance_score * 0.35
                + elbow_score * 0.20
                + swing_flow_score * 0.15
            )
        )

        metrics = {
            "balance": round(float(balance_score)),
            "upper_body_posture": round(float(elbow_score)),
            "knee_stability": round(float(knee_score)),
            "explosive_capacity": round(float(swing_flow_score)),
            "movement_symmetry": round(float(min(90.0, (knee_score + balance_score) / 2))),
            "hip_mobility": round(float(min(92.0, knee_score * 0.95))),
        }

        metric_details = {
            "front_knee_brace": MetricObservation(
                name="Front Knee Stride Angle",
                score=round(float(knee_score)),
                raw_value=round(contact_lead_knee),
                unit="degrees",
                interpretation=knee_interp,
            ),
            "head_over_ball": MetricObservation(
                name="Head-Over-Knee Alignment",
                score=round(float(balance_score)),
                raw_value=round(contact_head_diff, 2),
                unit="offset index",
                interpretation=balance_interp,
            ),
            "lead_elbow_elevation": MetricObservation(
                name="Lead Elbow Guidance",
                score=round(float(elbow_score)),
                raw_value=round(contact_elbow),
                unit="degrees",
                interpretation=elbow_interp,
            ),
            "swing_flow": MetricObservation(
                name="Downswing Speed & Flow",
                score=round(float(swing_flow_score)),
                raw_value=round(max_wrist_vel, 2),
                unit="velocity index",
                interpretation="Fluid downward acceleration through impact zone.",
            ),
        }

        observations = [
            f"Stroke impact detected with controlled wrist velocity through the hitting zone.",
            knee_interp,
            balance_interp,
            elbow_interp,
        ]

        return MovementAnalysisResult(
            protocol_id=self.protocol_id,
            protocol_name=self.name,
            status="completed",
            is_valid=True,
            overall_movement_quality=overall_score,
            metrics=metrics,
            metric_details=metric_details,
            phase_breakdown={
                "contact_frame": contact_idx,
                "lead_knee_angle": round(contact_lead_knee),
                "elbow_angle": round(contact_elbow),
            },
            observations=observations,
        )
