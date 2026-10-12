# Sportify — Personalized Athlete Development Platform

> **Train for what your game demands.**

[![Frontend](https://img.shields.io/badge/Frontend-React%2018%20%7C%20TypeScript%20%7C%20Vite-blue)](https://sportify-3dzr.vercel.app)
[![Backend](https://img.shields.io/badge/Backend-FastAPI%20%7C%20Python%203.11-green)](https://sportify-3dzr.vercel.app)
[![Vision Engine](https://img.shields.io/badge/Vision%20Engine-MediaPipe%20Pose-orange)](https://sportify-3dzr.vercel.app)
[![License](https://img.shields.io/badge/License-All%20Rights%20Reserved-red.svg)](LICENSE)

Sportify is an athlete development platform designed to bring movement analysis and role-specific training to every athlete. Using video-based pose tracking and sport-specific assessment logic, Sportify evaluates movement mechanics, identifies key areas for improvement, and generates customized 4-week training and recovery routines tailored to an athlete's playing role.

---

## 🚀 Live Demo

- **Web Application**: [https://sportify-3dzr.vercel.app](https://sportify-3dzr.vercel.app)

---

## ❓ The Problem: Training for Specific Sporting Demands

Every sport and playing role places distinct physical and mechanical demands on an athlete. However, training without objective feedback presents real challenges:

1. **Role-Specific Needs**: An athlete's training needs to match their actual position on the field. A technical opening batsman requires different physical preparation than a lower-order power hitter.
2. **Access to Movement Analysis**: Detailed biomechanical screening has traditionally required expensive lab setups or specialized motion-capture cameras, making it difficult for everyday and aspiring athletes to assess their technique.
3. **Hidden Movement Flaws**: Subtle issues with balance, joint alignment, or weight transfer can limit an athlete's performance and increase injury risk without being obvious to the naked eye.
4. **Connecting Analysis to Practice**: Even when athletes know what to work on, turning an assessment into a structured, week-by-week training regimen takes dedicated sports science planning.

---

## 🏏 Role-Specific Training example of Cricket: Batting Sub-Roles

To see why training must be tailored to an athlete's specific role, consider how three different batting positions in cricket approach the game:

### 1. Opening Technical Batsman
- **How they play**: Faces the new ball with pace and swing. Relies on solid defense, disciplined shot selection, leaving the ball, and playing late with a straight bat. Precise front-foot drives and stable head positioning are essential.
- **How they need to train**: Needs excellent balance, front-foot stability, lead-knee control, and rotational mobility through the hips and torso without falling over toward the off-side.
- **How Sportify helps**: Evaluates lead-knee flexion, head-over-knee alignment, and balance during drives, then prescribes targeted single-leg stability, core control, and mobility drills.

### 2. Middle-Order Anchor
- **How they play**: Builds partnerships, handles both spin and pace, and rotates the strike with quick singles and sharp running between wickets. Plays all around the ground with cuts, sweeps, and dynamic footwork.
- **How they need to train**: Needs multi-directional agility, rotational core endurance, quick footwork transitions, and good stamina to sustain high-intensity running throughout long innings.
- **How Sportify helps**: Evaluates dynamic weight transfer and rotational movement, recommending agility routines, rotational core stability, and role-calibrated conditioning.

### 3. Finisher / Power Hitter
- **How they play**: Enters the game in high-pressure death overs with a mandate to score quickly. Relies on maximum bat speed, explosive power hitting, clearing the boundary, and strong bottom-hand leverage.
- **How they need to train**: Needs explosive hip drive, a wide and stable base of support, high rate of force development, and rotational power from the ground up.
- **How Sportify helps**: Evaluates base stability and explosive movement mechanics through contact, prescribing explosive power drills, medicine ball throws, and hip-hinge strength exercises.

---

## 🏗️ System & Codebase Architecture

Sportify is built on a modular full-stack architecture:

```
Sportify/
├── frontend/                          # Client Application (React 18 + TypeScript + Vite)
│   ├── src/
│   │   ├── pages/                     # Route-level code-split views (Landing, Onboarding, Studio, Analysis, Dashboard, Plan)
│   │   ├── components/
│   │   │   ├── assessment/            # Camera setup guide, video uploader, protocol selection cards
│   │   │   ├── common/                # Dynamic SVG Biomechanical Radar Chart, benchmark bars, icons
│   │   │   └── layout/                # Mobile navigation bar, top headers
│   │   ├── config/                    # Unified sport taxonomy, role benchmarks, assessment guides
│   │   ├── store/                     # Zustand store (persisted athlete profile, auth tokens, active analysis)
│   │   ├── types/                     # Shared TypeScript contracts (Athlete, Assessment, TrainingPlan, API)
│   │   ├── utils/                     # Sport formatting, styling helpers, and badge helpers
│   │   └── api/                       # Centralized Axios client with JWT interceptor
│   └── package.json                   # Client build tooling & scripts
│
└── backend/                           # API & Movement Engine (FastAPI + Python 3.11)
    ├── main.py                        # Application entrypoint & CORS middleware
    ├── config.py                      # Application environment configuration
    ├── database.py                    # Async SQLite / PostgreSQL engine & automated schema migrations
    ├── models/                        # SQLAlchemy 2.0 ORM models (Athlete, Assessment, WorkoutLog, TrainingPlan)
    ├── schemas/                       # Pydantic v2 validation schemas
    ├── routers/                       # REST API controllers (auth, intake, video, plan, progress)
    ├── services/
    │   ├── movement/                  # Movement protocol suite & activity-specific analyzers
    │   ├── pose_detector.py           # Google MediaPipe Tasks PoseLandmarker adapter
    │   ├── bottleneck_engine.py       # Gap analysis diagnostic engine
    │   ├── gemini_service.py          # Periodized training and recovery synthesizer
    │   └── exercise_service.py        # Curated athletic exercise catalog
    └── tests/                         # Automated unit test suite
```

### End-to-End Data Flow

```
[ Video Upload ] ──► [ Quality Gate ] ──► [ Activity Protocol ] ──► [ PoseLandmarker ] ──► [ Radar & Bottleneck Engine ] ──► [ 4-Week Training & Recovery Plan ]
```

---

## 📄 License

**Copyright © 2026 Mohammed Ali and the Sportify Team. All Rights Reserved.**
