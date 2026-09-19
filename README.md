# Sportify — Personalized Athlete Development Platform

> **Train for what your game demands.**

Sportify is an intelligent, full-stack athlete development platform that pairs **computer-vision movement assessment**, **role-specific biomechanical intelligence**, and **generative AI coaching** to deliver elite-level diagnostic analysis and periodized training feedback to athletes across sports and positions.

---

## What It Does

| Capability | Technical Overview |
|------------|---------------------|
| **Role-Aware Assessment** | Granular sport, position, and sub-role taxonomy. Calibrates evaluation criteria depending on whether the athlete is an *Opening Batsman*, *Fast Bowler*, *Football Striker*, *Point Guard*, or *Sprinter*. |
| **Activity-Aware Computer Vision** | Evaluates specialized athletic movement through **Google MediaPipe Tasks PoseLandmarker** (33 3D anatomical landmarks) and OpenCV kinematic vector math. |
| **Calibrated Quality Gate** | Multi-phase validation gate ensuring video clarity, framing angle, and joint tracking with a 70% landmark coverage baseline, 0.35 confidence threshold, high-FPS downsampling, and sub-second explosive movement detection. |
| **Biomechanical Radar Profiling** | Dynamic precision SVG spider chart comparing measured kinematic performance against sport and position benchmarks across stability, mobility, symmetry, posture, explosive capacity, and balance. |
| **Bottleneck Diagnostic Engine** | Algorithmic gap analysis weighting raw kinematic deviations against position demands to categorize performance into *Strengths*, *Proficient*, *Development Areas*, and *Critical Bottlenecks*. |
| **AI Periodized Training & Recovery** | Powered by **Google Gemini 3.6 Flash**, synthesizing structured 4-week training regimens, corrective exercises from a curated 100+ exercise library, and targeted recovery protocols. |
| **Longitudinal Progress Tracking** | Logs training sessions, calculates workload volume, and tracks reassessment trajectories over time to measure athletic progression. |

---

## Supported Sports & Roles

Sportify features granular role and sub-role configurations tailored to distinct kinematic demands:

| Sport | Primary Roles | Specialized Sub-Roles |
|-------|---------------|-----------------------|
| 🏏 **Cricket** | Batsman, Bowler, All-Rounder, Wicketkeeper | Opening Batsman, Top Order, Middle Order, Finisher, Fast Bowler, Swing Bowler, Spin Bowler, Wicketkeeper-Batsman |
| ⚽ **Football** | Forward, Midfielder, Defender, Goalkeeper | Striker, Winger, Central Midfielder, Attacking Midfielder, Centre-Back, Full-Back, Goalkeeper |
| 🏀 **Basketball** | Guard, Forward, Center | Point Guard, Shooting Guard, Small Forward, Power Forward, Center |
| 🏃 **Athletics** | Track, Field | Sprinter (100m / 200m), Middle Distance, Jumper (Long / High / Triple), Thrower |

---

## Specialized Movement Protocols

Sportify applies activity-specific kinematic analyzers rather than generic exercise templates:

1. 🏏 **Cricket Batting Drive Mechanics** (`cricket_batting`): Analyzes stance alignment, lead elbow elevation, head over lead knee horizontal tracking, front knee flexion angle, and rotational weight transfer.
2. ⚽ **Football Strike & Kicking Mechanics** (`football_strike`): Measures plant-foot stability, kicking knee extension velocity, striking hip whip angle, and torso lean balance through ball impact.
3. 🏀 **Basketball Jump Shot & Release** (`basketball_jump_shot`): Tracks triple extension alignment (ankle, knee, hip), elbow alignment under the ball, vertical release apex, and landing shock absorption.
4. 🏃 **Sprint Acceleration Mechanics** (`sprint_mechanics`): Measures forward torso acceleration lean, high knee drive elevation, hip extension angle, and bilateral stride symmetry.
5. ⚡ **Vertical Jump / CMJ** (`vertical_jump`): Evaluates countermovement eccentric load depth, rate of explosive extension, takeoff posture, and eccentric landing absorption.
6. 🏋️ **Squat Biomechanics** (`squat`): Analyzes deep hip flexion, femur-to-parallel depth, knee valgus/varus control, torso inclination, and bilateral knee symmetry.

---

## System Architecture

```
+------------------------------------------------------------------------+
|                      React 18 + Vite Frontend                          |
|   Glassmorphic Dark UI • Zustand State • Interactive SVG Radar Chart   |
|   Landing -> Onboarding (OTP) -> Studio -> Analysis -> Dashboard -> Plan|
+------------------------------------------------------------------------+
                                     |  REST API (Axios + JWT Auth)
                                     v
+------------------------------------------------------------------------+
|                        FastAPI Backend (Python 3.11+)                  |
|    Auth (/auth/*) • Intake (/intake/*) • Video Engine (/video/*)       |
|    Assessment (/assessment/*) • Plan (/plan/*) • Progress (/progress/*)|
+------------------------------------------------------------------------+
         |                                |                            |
         v                                v                            v
+------------------------+  +---------------------------+  +----------------------------+
|     Database Layer     |  |   Messaging & Ephemeral   |  |     AI & Vision Engine     |
| * SQLite (aiosqlite)   |  | * Resend HTTPS REST API   |  | * Google MediaPipe Tasks   |
| * PostgreSQL (asyncpg) |  |   (Branded HTML emails)   |  | * Kinematic Vector Math    |
| * SQLAlchemy 2.0 Async |  | * Redis / In-Memory Store |  | * Bottleneck Scoring Engine|
| * Alembic migrations   |  |   (OTP TTL & rate limit)  |  | * Google Gemini 3.6 Flash  |
+------------------------+  +---------------------------+  +----------------------------+
```

---

## Athlete Journey

```
[ 1. Landing ]  -->  [ 2. Onboarding & Auth ]  -->  [ 3. Athlete Dashboard ]
   Hero & Value       Sport, Role, Biometrics,       Baseline metrics,
   Proposition        Credentials & Email OTP        development pathway
                                                              |
                                                              v
[ 6. Progress ] <--  [ 5. Training Plan ]     <--  [ 4. Movement Studio ]
   Reassessment        4-Week periodized              Upload / record video,
   trend tracking      Gemini AI routine              MediaPipe CV & radar chart
```

---

## Project Structure

```
Sportify/
+-- backend/
|   +-- main.py                    # FastAPI entrypoint, middleware, and routers
|   +-- config.py                  # Pydantic environment configuration (Resend, Redis, Gemini)
|   +-- database.py                # Dual-mode async DB engine (SQLite & PostgreSQL)
|   +-- models/                    # Declarative ORM models (Athlete with is_verified, etc.)
|   +-- schemas/                   # Pydantic v2 validation schemas (Auth, OTP, Assessment)
|   +-- routers/                   # API routes (auth, intake, video, plan, progress)
|   +-- services/
|   |   +-- email_service.py       # Asynchronous Resend email dispatcher with dark-mode HTML
|   |   +-- otp_service.py         # Redis / in-memory OTP engine with cooldown & brute-force limits
|   |   +-- pose_analyzer.py       # Activity-aware video assessment coordinator
|   |   +-- pose_detector.py       # MediaPipe Tasks PoseLandmarker adapter
|   |   +-- gemini_service.py      # Google Gemini 3.6 Flash integration with fallbacks
|   |   +-- bottleneck_engine.py   # 4-tier gap analysis diagnostic engine
|   |   +-- plan_generator.py      # Periodized training and recovery synthesizer
|   |   +-- exercise_service.py    # Curated exercise catalog and prescription service
|   |   +-- taxonomy_service.py    # Unified sport and role taxonomy service
|   |   +-- movement/              # Modular biomechanics protocol suite
|   |       +-- base.py            # Abstract MovementProtocol & QualityReport
|   |       +-- quality_gate.py    # VideoQualityGate validation & FPS sampler
|   |       +-- registry.py        # Dynamic protocol registry
|   |       +-- cricket_batting_analyzer.py
|   |       +-- football_strike_analyzer.py
|   |       +-- basketball_shot_analyzer.py
|   |       +-- sprint_mechanics_analyzer.py
|   |       +-- jump_analyzer.py
|   |       +-- squat_analyzer.py
|   +-- data/                      # Sport taxonomy and 100+ exercise library
|   +-- tests/                     # 27 automated unit tests (OTP security, CV, Gemini fallbacks)
|   +-- requirements.txt
|   +-- .env.example
|
+-- frontend/
|   +-- src/
|   |   +-- pages/                 # Landing, Onboarding (4-step wizard), SportAssessmentPage,
|   |   |                          # Analysis, Dashboard, TrainingPlan, RecoveryPlan, Progress
|   |   +-- components/
|   |   |   +-- auth/              # Glassmorphic OTPInput with countdown & clipboard paste
|   |   |   +-- assessment/        # CameraCapture, RadarChart, MetricGauges
|   |   |   +-- common/            # Header, Sidebar, MetricCards
|   |   +-- store/                 # Zustand store (persisted auth, profile, state)
|   |   +-- config/                # Sport taxonomy, assessment matrix, guides, benchmarks
|   |   +-- api/                   # Centralized Axios client with JWT interceptor & OTP methods
|   +-- package.json
|   +-- tailwind.config.js
|   +-- vite.config.js
|
+-- README.md
```

---

## Tech Stack

| Domain | Technologies |
|--------|--------------|
| **Frontend Core** | React 18.3, Vite 5.3, React Router DOM v6, Axios |
| **Frontend Styling** | Vanilla CSS tokens + Tailwind CSS v3.4 (Custom glassmorphic dark theme) |
| **State Management** | Zustand 4.5 (with persist middleware for JWT auth and profile hydration) |
| **Visualizations** | Custom Dynamic SVG Biomechanical Radar Chart (trigonometric polygon calculations) |
| **UI & Auth Components** | Lucide React, Glassmorphic 6-digit OTP Input (auto-focus, paste, countdown) |
| **Backend API** | FastAPI, Uvicorn, Pydantic v2, Python 3.11+ |
| **Database & ORM** | SQLAlchemy 2.0 (AsyncIO), aiosqlite (async SQLite) / asyncpg (PostgreSQL), Alembic |
| **Transactional Email** | Resend REST API (asynchronous httpx client with dark-mode HTML templates & dev console fallback) |
| **Ephemeral Cache & Security** | Redis (`redis.asyncio`) with automated in-memory TTL dictionary fallback |
| **Computer Vision** | Google MediaPipe Tasks (`pose_landmarker_full`), OpenCV, NumPy |
| **Generative AI** | Google Gemini 3.6 Flash (Native Google GenAI SDK with structured JSON outputs and deterministic fallbacks) |
| **Authentication & Security** | OAuth2 Password Bearer flow, JWT tokens (python-jose), bcrypt password hashing, 6-digit OTP verification (60s cooldown, 10m TTL, 5-attempt lockout) |
| **Testing Suite** | Python `unittest` suite (27 unit tests covering OTP lifecycle, brute-force defense, kinematics, and Gemini fallbacks) |

---

## API Endpoints Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/auth/send-otp` | Dispatch 6-digit verification code with rate limiting & cooldown |
| `POST` | `/auth/verify-otp` | Verify OTP and issue JWT access token for registration or login |
| `POST` | `/auth/register` | Direct registration with email, password, and full name |
| `POST` | `/auth/login` | Authenticate athlete and return JWT bearer token |
| `GET` | `/auth/me` | Fetch authenticated athlete profile |
| `GET` | `/intake/sports` | List sports taxonomy, roles, and disciplines |
| `POST` | `/intake/profile` | Submit athlete role and baseline physical parameters |
| `GET` | `/intake/profile` | Retrieve active athlete profile |
| `POST` | `/video/coach` | Submit activity video for asynchronous CV analysis |
| `GET` | `/video/coach/{id}` | Poll CV processing, kinematic scores, and AI feedback |
| `GET` | `/video/protocols` | List registered movement protocols |
| `GET` | `/assessment/latest` | Retrieve latest verified movement assessment |
| `POST` | `/assessment/manual` | Submit manual kinematic assessment values |
| `GET` | `/plan/current` | Retrieve active periodized training plan |
| `POST` | `/plan/generate` | Trigger Gemini 3.6 Flash training plan synthesis |
| `GET` | `/plan/recovery` | Retrieve active recovery recommendations |
| `GET` | `/plan/history` | Retrieve historical training plans |
| `POST` | `/progress/log` | Log completed training workout session |
| `GET` | `/progress/dashboard` | Aggregated development metrics, stats, and recovery |
| `GET` | `/progress/logs` | Retrieve chronological training session logs |
| `GET` | `/progress/reassessment`| Calculate trajectory and reassessment delta |
| `GET` | `/health` | Server health check endpoint |
