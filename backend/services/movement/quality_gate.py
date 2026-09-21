import cv2
from typing import Dict, List, Tuple, Optional
from .base import QualityReport, MovementProtocol


class VideoQualityGate:
    """
    Validates video quality, landmark tracking confidence, and required joint visibility
    before biomechanical assessment is permitted.
    """

    LANDMARK_NAMES = {
        0: "nose",
        11: "left_shoulder",
        12: "right_shoulder",
        13: "left_elbow",
        14: "right_elbow",
        15: "left_wrist",
        16: "right_wrist",
        23: "left_hip",
        24: "right_hip",
        25: "left_knee",
        26: "right_knee",
        27: "left_ankle",
        28: "right_ankle",
    }

    @classmethod
    def validate_and_extract_landmarks(
        cls,
        video_path: str,
        mp_pose_detector,
        protocol: Optional[MovementProtocol] = None,
    ) -> Tuple[QualityReport, List[Dict[int, List[float]]], float]:
        """
        Extracts landmarks frame-by-frame from video and validates against protocol constraints.

        Returns:
            (QualityReport, landmark_sequence, fps)
        """
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            return (
                QualityReport(
                    is_valid=False,
                    total_frames=0,
                    usable_frames=0,
                    visibility_rate=0.0,
                    error_code="VIDEO_READ_ERROR",
                    message="Unable to open or read the video file. Ensure format is valid (MP4, MOV, WebM).",
                ),
                [],
                0.0,
            )

        raw_fps = cap.get(cv2.CAP_PROP_FPS) or 30.0
        # Sample at ~15 FPS: ideal clinical kinematic fidelity while cutting inference load by 50-75%
        skip_step = max(1, round(raw_fps / 15.0))
        effective_fps = raw_fps / skip_step
        fps = effective_fps

        total_frames = 0
        detected_frames = 0
        usable_frames = 0
        raw_landmark_sequence = []
        missing_landmarks_set = set()

        required_indices = (
            protocol.required_landmarks
            if protocol
            else [11, 12, 23, 24, 25, 26, 27, 28]
        )
        min_visibility = (
            protocol.min_visibility_threshold if protocol else 0.35
        )
        min_usable_frames = protocol.min_usable_frames if protocol else 10
        min_coverage_ratio = (
            getattr(protocol, "min_landmark_coverage_ratio", 0.70) if protocol else 0.70
        )

        frame_counter = 0
        # 60 frames at 15 FPS = 4.0 seconds of athletic movement (captures full squat, jump, strike, swing)
        MAX_ANALYSIS_FRAMES = 60
        # Never scan more than 150 total video frames (~10 seconds) to prevent CPU starvation on long clips
        MAX_TOTAL_FRAMES = 150

        while cap.isOpened() and len(raw_landmark_sequence) < MAX_ANALYSIS_FRAMES and total_frames < MAX_TOTAL_FRAMES:
            ret, frame = cap.read()
            if not ret:
                break
            total_frames += 1
            frame_counter += 1

            if skip_step > 1 and (frame_counter % skip_step != 0):
                continue

            # Scale down large frames to 480px max dimension
            # MediaPipe operates internally on 256x256; 480px eliminates memory spikes and runs 3x faster
            h, w = frame.shape[:2]
            max_dim = max(h, w)
            if max_dim > 480:
                scale = 480.0 / max_dim
                frame = cv2.resize(
                    frame, (int(w * scale), int(h * scale)), interpolation=cv2.INTER_AREA
                )

            image_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            image_rgb.flags.writeable = False
            results = mp_pose_detector.process(image_rgb)

            if not results or not results.pose_landmarks:
                del frame, image_rgb
                continue

            detected_frames += 1
            landmarks = results.pose_landmarks.landmark
            frame_dict = {}
            passed_landmarks = 0

            for idx in required_indices:
                if idx < len(landmarks):
                    lm = landmarks[idx]
                    visibility = getattr(lm, "visibility", 1.0)
                    if visibility >= min_visibility:
                        passed_landmarks += 1
                    else:
                        missing_landmarks_set.add(
                            cls.LANDMARK_NAMES.get(idx, f"joint_{idx}")
                        )
                    frame_dict[idx] = [lm.x, lm.y, lm.z, visibility]
                else:
                    missing_landmarks_set.add(
                        cls.LANDMARK_NAMES.get(idx, f"joint_{idx}")
                    )

            # Frame is usable if at least 70% of required landmarks are adequately visible
            coverage = passed_landmarks / len(required_indices) if required_indices else 0.0

            # Core anchor safeguard: if required_indices contains torso landmarks, at least one must be visible
            torso_indices = [i for i in (11, 12, 23, 24) if i in required_indices]
            has_anchor = True
            if torso_indices:
                has_anchor = any(
                    frame_dict.get(i, [0, 0, 0, 0])[3] >= min_visibility
                    for i in torso_indices
                )

            frame_is_usable = (coverage >= min_coverage_ratio) and has_anchor

            # Store all landmark points if frame had landmarks
            if frame_dict:
                # Also capture all other landmarks for context
                for i, lm in enumerate(landmarks):
                    if i not in frame_dict:
                        frame_dict[i] = [
                            lm.x,
                            lm.y,
                            lm.z,
                            getattr(lm, "visibility", 1.0),
                        ]
                raw_landmark_sequence.append(frame_dict)

            if frame_is_usable:
                usable_frames += 1

            del frame, image_rgb

        cap.release()

        # Interpolate 1-2 frame brief landmark dropouts for smooth downstream kinematics
        if raw_landmark_sequence and len(raw_landmark_sequence) >= 3:
            for idx in required_indices:
                for i in range(1, len(raw_landmark_sequence) - 1):
                    curr = raw_landmark_sequence[i].get(idx)
                    curr_vis = curr[3] if curr else 0.0
                    if curr_vis < min_visibility:
                        prev = raw_landmark_sequence[i - 1].get(idx)
                        nxt = raw_landmark_sequence[i + 1].get(idx)
                        if prev and nxt and prev[3] >= min_visibility and nxt[3] >= min_visibility:
                            interp_x = (prev[0] + nxt[0]) / 2.0
                            interp_y = (prev[1] + nxt[1]) / 2.0
                            interp_z = (prev[2] + nxt[2]) / 2.0
                            interp_vis = (prev[3] + nxt[3]) / 2.0
                            raw_landmark_sequence[i][idx] = [interp_x, interp_y, interp_z, interp_vis]

        if total_frames == 0:
            return (
                QualityReport(
                    is_valid=False,
                    total_frames=0,
                    usable_frames=0,
                    visibility_rate=0.0,
                    error_code="EMPTY_VIDEO",
                    message="Video contains 0 readable frames.",
                ),
                [],
                fps,
            )

        if detected_frames == 0:
            return (
                QualityReport(
                    is_valid=False,
                    total_frames=total_frames,
                    usable_frames=0,
                    visibility_rate=0.0,
                    error_code="NO_POSE_DETECTED",
                    message="No human athlete detected in video. Ensure full body is in frame and lighting is adequate.",
                ),
                [],
                fps,
            )

        # Active movement window: calculate visibility rate over detected athlete frames
        # Prevents dead-time/setup padding from penalizing clean videos
        active_window = max(detected_frames, int(total_frames * 0.35), 1)
        visibility_rate = usable_frames / active_window

        # Quality assertions
        if usable_frames < min_usable_frames:
            return (
                QualityReport(
                    is_valid=False,
                    total_frames=total_frames,
                    usable_frames=usable_frames,
                    visibility_rate=round(visibility_rate, 3),
                    error_code="INSUFFICIENT_USABLE_FRAMES",
                    message=(
                        f"Only {usable_frames} usable frames detected (minimum required: {min_usable_frames}). "
                        f"Ensure full body is in frame and lighting is adequate."
                    ),
                    missing_landmarks=list(missing_landmarks_set),
                ),
                raw_landmark_sequence,
                fps,
            )

        if visibility_rate < 0.25:
            return (
                QualityReport(
                    is_valid=False,
                    total_frames=total_frames,
                    usable_frames=usable_frames,
                    visibility_rate=round(visibility_rate, 3),
                    error_code="LOW_VISIBILITY_RATE",
                    message=(
                        f"Athlete was occluded or out of frame in {round((1 - visibility_rate)*100)}% of movement frames. "
                        f"Missing critical joints: {', '.join(list(missing_landmarks_set)[:3])}."
                    ),
                    missing_landmarks=list(missing_landmarks_set),
                ),
                raw_landmark_sequence,
                fps,
            )

        return (
            QualityReport(
                is_valid=True,
                total_frames=total_frames,
                usable_frames=usable_frames,
                visibility_rate=round(visibility_rate, 3),
                message="Video quality and landmark visibility validated successfully.",
                missing_landmarks=[],
            ),
            raw_landmark_sequence,
            fps,
        )
