from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import os

from database import create_all_tables
from routers import auth_router, intake_router, video_router, assessment_router, plan_router, progress_router
from config import settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        await create_all_tables()
        print("[INFO] Database tables verified/created successfully.")
    except Exception as e:
        print(f"[WARN] Could not initialize database tables at startup: {e}")
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    yield

app = FastAPI(lifespan=lifespan, title="Athlete Development Platform")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

app.include_router(auth_router)
app.include_router(intake_router)
app.include_router(video_router)
app.include_router(assessment_router)
app.include_router(plan_router)
app.include_router(progress_router)

@app.get("/health")
def health_check():
    return {"status": "ok"}
