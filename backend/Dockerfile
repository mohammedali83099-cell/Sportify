FROM python:3.11-slim

WORKDIR /app

# Install minimal runtime dependencies, OpenCV/MediaPipe C libraries, and video codecs
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    ffmpeg \
    libgl1 \
    libglib2.0-0 \
    libgomp1 \
    libsm6 \
    libxext6 \
    && rm -rf /var/lib/apt/lists/*

# Pre-bake MediaPipe pose landmarker model directly into container image
RUN mkdir -p /app/models && \
    curl -fsSL https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_full/float16/latest/pose_landmarker_full.task \
    -o /app/models/pose_landmarker_full.task

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}"]
