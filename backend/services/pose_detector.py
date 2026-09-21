import os
import urllib.request
import logging
import traceback
from typing import Optional, List, Any

logger = logging.getLogger(__name__)

MODEL_URL = "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_full/float16/latest/pose_landmarker_full.task"
DEFAULT_MODEL_PATH = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "models", "pose_landmarker_full.task")
)


def resolve_model_path() -> str:
    """
    Resolves the pose_landmarker_full.task file across possible environments
    (Docker /app, local backend/models, cwd, or tmp).
    """
    candidates = [
        os.getenv("MEDIAPIPE_MODEL_PATH"),
        DEFAULT_MODEL_PATH,
        "/app/models/pose_landmarker_full.task",
        os.path.join(os.getcwd(), "models", "pose_landmarker_full.task"),
        os.path.join(os.getcwd(), "backend", "models", "pose_landmarker_full.task"),
        os.path.join(os.path.dirname(__file__), "pose_landmarker_full.task"),
        "/tmp/pose_landmarker_full.task",
    ]

    for path in candidates:
        if path and os.path.exists(path) and os.path.getsize(path) > 1000000:
            logger.info(f"Resolved existing MediaPipe model at: {path} ({os.path.getsize(path)} bytes)")
            return path

    # If no candidate exists, determine best writable download path
    target_path = candidates[0] or DEFAULT_MODEL_PATH
    try:
        os.makedirs(os.path.dirname(target_path), exist_ok=True)
        # Test writability
        test_file = target_path + ".test"
        with open(test_file, "w") as f:
            f.write("1")
        os.remove(test_file)
    except Exception:
        target_path = "/tmp/pose_landmarker_full.task"
        os.makedirs(os.path.dirname(target_path), exist_ok=True)

    logger.info(f"Downloading pose_landmarker model from {MODEL_URL} to {target_path}...")
    temp_target = target_path + ".tmp"
    req = urllib.request.Request(
        MODEL_URL,
        headers={"User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36"},
    )
    with urllib.request.urlopen(req, timeout=60) as resp, open(temp_target, "wb") as out_file:
        chunk_size = 64 * 1024
        while True:
            chunk = resp.read(chunk_size)
            if not chunk:
                break
            out_file.write(chunk)

    if os.path.exists(temp_target) and os.path.getsize(temp_target) > 1000000:
        os.replace(temp_target, target_path)
        logger.info(f"Pose landmarker model downloaded successfully to {target_path} ({os.path.getsize(target_path)} bytes).")
        return target_path
    else:
        raise RuntimeError(f"Downloaded model file is invalid or incomplete ({target_path})")


class NormalizedLandmarkAdapter:
    __slots__ = ("x", "y", "z", "visibility", "presence")

    def __init__(
        self,
        x: float,
        y: float,
        z: float,
        visibility: float = 1.0,
        presence: float = 1.0,
    ):
        self.x = x
        self.y = y
        self.z = z
        self.visibility = visibility
        self.presence = presence


class PoseLandmarksAdapter:
    def __init__(self, landmarks: List[NormalizedLandmarkAdapter]):
        self.landmark = landmarks


class ProcessResultAdapter:
    def __init__(self, landmarks: Optional[List[NormalizedLandmarkAdapter]]):
        if landmarks is not None:
            self.pose_landmarks = PoseLandmarksAdapter(landmarks)
        else:
            self.pose_landmarks = None


class MediaPipeTasksPoseDetector:
    """
    Modern MediaPipe Tasks PoseLandmarker adapter compatible with MediaPipe 1.0+ and Python 3.13.
    Provides the .process(image_rgb) interface expected by VideoQualityGate.
    """

    def __init__(self, model_path: Optional[str] = None):
        if model_path is None or not os.path.exists(model_path):
            model_path = resolve_model_path()

        import mediapipe as mp
        from mediapipe.tasks import python
        from mediapipe.tasks.python import vision

        self._mp = mp
        base_options = python.BaseOptions(model_asset_path=model_path)
        options = vision.PoseLandmarkerOptions(
            base_options=base_options,
            running_mode=vision.RunningMode.IMAGE,
            num_poses=1,
            min_pose_detection_confidence=0.5,
            min_pose_presence_confidence=0.5,
            min_tracking_confidence=0.5,
        )
        self._detector = vision.PoseLandmarker.create_from_options(options)
        logger.info(f"MediaPipe PoseLandmarker initialized with model: {model_path}")

    def process(self, image_rgb) -> ProcessResultAdapter:
        mp_image = self._mp.Image(
            image_format=self._mp.ImageFormat.SRGB, data=image_rgb
        )
        result = self._detector.detect(mp_image)
        if result and result.pose_landmarks and len(result.pose_landmarks) > 0:
            first_pose = result.pose_landmarks[0]
            adapted_landmarks = []
            for lm in first_pose:
                vis = getattr(lm, "visibility", 1.0)
                if vis is None:
                    vis = getattr(lm, "presence", 1.0)
                if vis is None:
                    vis = 1.0

                pres = getattr(lm, "presence", 1.0)
                if pres is None:
                    pres = 1.0

                adapted_landmarks.append(
                    NormalizedLandmarkAdapter(
                        x=float(lm.x),
                        y=float(lm.y),
                        z=float(lm.z),
                        visibility=float(vis),
                        presence=float(pres),
                    )
                )
            return ProcessResultAdapter(adapted_landmarks)
        return ProcessResultAdapter(None)


_cached_detector = None


def get_pose_detector():
    """
    Returns a singleton pose detector. Prefers MediaPipe Tasks PoseLandmarker,
    falling back to legacy mp.solutions.pose if Tasks is not available.
    """
    global _cached_detector
    if _cached_detector is not None:
        return _cached_detector

    # 1. Try modern Tasks API (MediaPipe >= 0.10.x / 1.0+ / Python 3.13+)
    try:
        _cached_detector = MediaPipeTasksPoseDetector()
        logger.info("Successfully initialized MediaPipe Tasks PoseLandmarker detector.")
        return _cached_detector
    except Exception as e:
        logger.warning(f"MediaPipe Tasks initialization failed: {e}\n{traceback.format_exc()}. Checking legacy solutions...")

    # 2. Try legacy solutions API (MediaPipe < 0.10.14)
    try:
        import mediapipe as mp
        if hasattr(mp, "solutions") and hasattr(mp.solutions, "pose"):
            _cached_detector = mp.solutions.pose.Pose(
                static_image_mode=False,
                model_complexity=1,
                enable_segmentation=False,
                min_detection_confidence=0.5,
                min_tracking_confidence=0.5,
            )
            logger.info("Initialized legacy MediaPipe solutions.pose detector.")
            return _cached_detector
    except Exception as e:
        logger.error(f"Legacy MediaPipe solutions initialization failed: {e}\n{traceback.format_exc()}")

    return None
