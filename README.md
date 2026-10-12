# Sportify — Personalized Athlete Development Platform

> **Train for what your game demands.**

[![Frontend](https://img.shields.io/badge/Frontend-React%2018%20%7C%20TypeScript%20%7C%20Vite-blue)](https://sportify-3dzr.vercel.app)
[![Backend](https://img.shields.io/badge/Backend-FastAPI%20%7C%20Python%203.11-green)](https://sportify-3dzr.vercel.app)
[![Kinematic Engine](https://img.shields.io/badge/Kinematics-MediaPipe%20Pose%20Tracking-orange)](https://sportify-3dzr.vercel.app)
[![Programming](https://img.shields.io/badge/Programming-Periodized%20Athletic%20Engine-purple)](https://sportify-3dzr.vercel.app)
[![License: Proprietary](https://img.shields.io/badge/License-Proprietary%20%7C%20All%20Rights%20Reserved-red.svg)](LICENSE)

Sportify is an athletic performance and biomechanical diagnostics platform engineered to bridge the gap between high-performance movement labs and everyday athletic development. By integrating **computer-vision kinematic tracking**, **position-specific biomechanical screening**, and **periodized training synthesis**, Sportify delivers objective movement telemetry, identifies mechanical bottlenecks, and prescribes role-calibrated strength, mobility, and recovery pathways directly from standard video.

---

## 🚀 Live Demo

- **Web Application**: [https://sportify-3dzr.vercel.app](https://sportify-3dzr.vercel.app)

---

## ❓ The Problem: Why One-Size-Fits-All Training Fails Athletes

Competitive sport is governed by kinetic sequencing, multi-planar force transmission, and joint integrity. Yet the vast majority of developing, collegiate, and competitive athletes train in a **biomechanical blind spot**:

1. **The Commercial Fitness Disconnect**: Mainstream fitness apps treat human movement as isolated calorie burning or generic gym splits. They prescribe static, bilateral exercises (like generic bench presses and leg presses) that ignore dynamic movement planes, rotational torque, and the explosive energy demands of competitive sport.
2. **The High-Performance Paywall**: Gold-standard biomechanical screening—such as optical motion capture, 3D kinematic telemetry, and dual force-plate diagnostics—is financially and logistically restricted to elite national sports institutes, Olympic facilities, and top-tier franchises.
3. **Unidentified Energy Leakages & Injury Precursors**: Kinetic chain breakdowns rarely show symptoms until performance plateaus or an acute injury occurs. Flawed deceleration mechanics, dynamic knee valgus collapse, asymmetrical force absorption, and premature torso uncoiling remain undetectable to the naked eye.
4. **The Prescriptive Void**: Even when a movement flaw is identified, athletes lack an integrated system that connects diagnostic kinematic telemetry directly into an actionable, multi-week periodized training cycle with targeted corrective drills.

---

## 🏏 Why Role-Specific Screening Matters: The Cricket Batting Spectrum

The limitations of generic training become immediately clear when evaluating athletes within the **exact same sport and discipline**. 

Consider three specialized batting roles in **Cricket**—each demanding fundamentally distinct kinetic sequencing, force vectors, and physiological profiles:

| Sub-Role | Biomechanical & Kinematic Demands | The Generic Training Failure | What Sportify Analyzes & Prescribes |
|---|---|---|---|
| 🏏 **Opening Technical Batsman** | **Precision kinetic alignment, front-foot braking stability, late impact.** Facing new-ball pace and swing requires a strictly vertical bat trajectory, head-over-lead-knee alignment at impact, and delayed wrist uncocking with zero off-axis torso tilt. | Generic bilateral leg presses and heavy squats stiffen hip capsule mobility, causing the batter to fall over toward the off-side during cover drives and miss the swinging line. | **Analyzes:** Lead-knee flexion angle, head-to-knee alignment, front-foot braking stability, and lead-elbow elevation.<br>**Prescribes:** Unilateral front-foot deceleration drills, thoracic rotation mobility, and lead-side kinetic chain transfer. |
| 🔄 **Middle-Order Anchor** | **Multi-directional weight transfer, rotational agility, dynamic tempo control.** Requires rapid strike-rotation mechanics, deep wrist-hinge articulation for gap manipulation against spin, low-center-of-mass sweep/cut transitions, and repeat-sprint durability. | Generic bodybuilding splits ignore multi-planar rotational mobility and aerobic-glycolytic endurance, leading to core fatigue in the middle overs and mechanical breakdown during quick singles. | **Analyzes:** Dynamic pelvic-to-torso rotational sequencing, weight distribution across multi-angle stances, and posture maintenance under repetition.<br>**Prescribes:** Tri-planar core stability, rotational recovery velocity, and high-density change-of-direction conditioning. |
| 💥 **Power Finisher / Slogger** | **Maximum rate of force development (RFD), rapid hip-shoulder separation, wide base stability.** Generating maximum bat speed requires explosive ground-reaction force transfer from the rear hip through the thoracic spine into a violent follow-through with high launch angles. | Standard slow-tempo gym workouts fail to build explosive RFD or triple-extension velocity, resulting in arm-dominant swings with zero hip torque and heightened lumbar hyperextension risks. | **Analyzes:** Pelvic rotation velocity, back-hip explosive extension, base width stability through contact, and rotational follow-through balance.<br>**Prescribes:** Rotational plyometrics, explosive hip-hinge power drills, anti-rotational core bracing, and ground-force transfer work. |

> **The Takeaway**: A generic fitness tracker prescribes the exact same workout to all three cricketers. Sportify recognizes that an opening batter needing late technical alignment requires an entirely different physical blueprint than a finisher maximizing rotational power output.

---

## ⚡ How Sportify Works (Core Architecture)

Sportify structures athletic progression into a closed-loop diagnostic and developmental workflow:

```
[ 1. Onboarding ]  ──►  [ 2. Movement Studio ]  ──►  [ 3. Diagnostic Engine ]  ──►  [ 4. Periodized Training ]  ──►  [ 5. Progress Tracking ]
  Sport, Position &       Activity-Aware Video           Kinematic Radar Profiling      4-Week Phased Regimen &          Workload Volume &
  Athletic Demands        Kinematics Screening           & Bottleneck Isolation         Targeted Recovery Plan           Longitudinal Deltas
```

### 1. Granular Athlete Profiling & Taxonomy
- Athletes define their exact athletic profile: sport (Cricket, Football, Basketball, Athletics), primary discipline, playing role, and specialized sub-role.
- Captures biometrics, training availability, equipment access, and self-reported performance priorities to calibrate baseline benchmarks.

### 2. Activity-Aware Movement Studio & Quality Gate
- Guided video capture with framing parameters (distance, height, lighting, plane of motion).
- **Specialized Kinematic Analyzers**: Applies movement protocols engineered for specific sporting actions:
  - 🏏 **Cricket Batting Drive Mechanics** (`cricket_batting`): Stance alignment, lead elbow elevation, head-over-knee tracking, front knee flexion, and rotational weight transfer.
  - ⚽ **Football Strike & Kicking Mechanics** (`football_strike`): Plant-foot stability, kicking knee extension velocity, hip whip angle, and torso lean balance.
  - 🏀 **Basketball Jump Shot & Release** (`basketball_jump_shot`): Triple extension alignment (ankle-knee-hip), vertical apex timing, and landing shock dissipation.
  - 🏃 **Sprint Acceleration Mechanics** (`sprint_mechanics`): Forward acceleration lean, high knee drive elevation, hip extension, and bilateral stride symmetry.
  - ⚡ **Vertical Jump / CMJ** (`vertical_jump`): Countermovement depth, explosive extension rate, and eccentric landing absorption.
  - 🏋️ **Squat Biomechanics** (`squat`): Femur-to-parallel depth, knee valgus/varus control, torso inclination, and bilateral symmetry.
- **Biomechanical Quality Gate**: Screens frames for joint visibility (minimum 70% landmark coverage) and tracking stability before processing, preventing inaccurate readings.

### 3. Multi-Axis Radar Profiling & Kinematic Telemetry
- Kinematic metrics are synthesized into an interactive dynamic SVG radar profile mapped across 6 athletic pillars:
  - **Stability**: Dynamic joint control and base maintenance under kinetic load.
  - **Mobility**: Functional active range of motion across primary moving joints.
  - **Symmetry**: Bilateral balance between left and right kinetic chains.
  - **Posture**: Spinal alignment, head position, and core integrity throughout movement phases.
  - **Explosive Capacity**: Rate of force development, extension speed, and acceleration.
  - **Balance**: Center-of-mass control during dynamic transitions and landing.

### 4. Bottleneck Diagnostic Engine
- Evaluates measured kinematic data against role-specific performance standards.
- Automatically isolates and categorizes findings into four actionable performance tiers:
  - 🟢 **Strengths**: Solid mechanics that meet or exceed position benchmarks.
  - 🔵 **Proficient**: Consistent baseline patterns with minor optimization room.
  - 🟡 **Development Areas**: Noticeable mechanical deviations limiting power or efficiency.
  - 🔴 **Critical Bottlenecks**: Significant kinematic faults or compensations that heighten injury vulnerability.

### 5. Periodized 4-Week Athletic Programming & Recovery
- Directly translates diagnostic findings into a 4-week structured training cycle (*Foundation → Progression → Peak → Deload*).
- Prescribes role-specific corrective drills from an extensive athletic exercise catalog, complete with sets, reps, intensity (RPE), and coaching cues.
- Provides doctor-grounded recovery pathways targeting loaded joint complexes, soft-tissue regeneration, and autonomic readiness.

### 6. Longitudinal Progress Tracking
- Athletes log completed training sessions, track perceived exertion, and monitor cumulative training volume.
- Historical re-assessments calculate a trajectory delta, visually showing whether mechanical bottlenecks are resolving over time.

---

## 🏆 Supported Sports & Taxonomy

| Sport | Primary Roles | Specialized Sub-Roles |
|---|---|---|
| 🏏 **Cricket** | Batsman, Bowler, All-Rounder, Wicketkeeper | Opening Batsman, Top Order, Middle Order, Finisher, Fast Bowler, Swing Bowler, Spin Bowler, Wicketkeeper-Batsman |
| ⚽ **Football** | Forward, Midfielder, Defender, Goalkeeper | Striker, Winger, Central Midfielder, Attacking Midfielder, Centre-Back, Full-Back, Goalkeeper |
| 🏀 **Basketball** | Guard, Forward, Center | Point Guard, Shooting Guard, Small Forward, Power Forward, Center |
| 🏃 **Athletics** | Track, Field | Sprinter (100m / 200m), Middle Distance, Jumper (Long / High / Triple), Thrower |

---

## 🏗️ System & Codebase Architecture

Sportify is built on a modular, decoupled full-stack architecture:

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
└── backend/                           # API & Biomechanics Engine (FastAPI + Python 3.11)
    ├── main.py                        # Application entrypoint & CORS middleware
    ├── config.py                      # Application environment configuration
    ├── database.py                    # Async SQLite / PostgreSQL engine & automated schema migrations
    ├── models/                        # SQLAlchemy 2.0 ORM models (Athlete, Assessment, WorkoutLog, TrainingPlan)
    ├── schemas/                       # Pydantic v2 validation schemas
    ├── routers/                       # REST API controllers
    │   ├── auth.py                    # Authentication, registration, and OTP verification
    │   ├── intake.py                  # Athlete onboarding & sport taxonomy retrieval
    │   ├── video.py                   # Video upload, processing coordination, and status polling
    │   ├── plan.py                    # Periodized training plan and recovery synthesis
    │   └── progress.py                # Workout logging and longitudinal reassessment tracking
    ├── services/
    │   ├── movement/                  # Biomechanics analysis protocol suite
    │   │   ├── base.py                # Abstract MovementProtocol & QualityReport contracts
    │   │   ├── quality_gate.py        # Joint visibility, framerate sampling, and validation gate
    │   │   ├── registry.py            # Dynamic protocol registry
    │   │   └── *_analyzer.py          # Activity-specific kinematic analyzers (cricket, football, etc.)
    │   ├── pose_detector.py           # Google MediaPipe Tasks PoseLandmarker adapter
    │   ├── bottleneck_engine.py       # 4-tier gap analysis diagnostic engine
    │   ├── gemini_service.py          # Adaptive periodized training & recovery synthesizer
    │   └── exercise_service.py        # Curated athletic exercise catalog
    └── tests/                         # Automated unit test suite (validation, protocols, fallbacks)
```

### End-to-End Data Flow

```
[ Athlete Video Upload ]
           │
           ▼
[ VideoQualityGate ]  ──(Fails criteria)──► [ Rejection with Setup & Framing Guidance ]
           │ (Passes: >=70% joint landmarks, >=15 FPS)
           ▼
[ ProtocolRegistry ]  ──(Selects activity-specific analyzer: e.g. cricket_batting)
           │
           ▼
[ PoseLandmarker + Analyzer ] ──► [ Joint Vectors, Kinematic Angles & Phase Symmetry ]
           │
           ▼
[ Bottleneck Engine ] ──► [ Gap Analysis vs. Position Benchmarks (Radar Scores) ]
           │
           ▼
[ Periodized Engine ] ──► [ 4-Week Structured Training Plan & Recovery Pathway ]
           │
           ▼
[ Dynamic UI Dashboard ] ──► [ Visual Telemetry, Radar Feedback & Workout Logging ]
```

---

## 📄 License & Proprietary Rights

**Copyright © 2026 Mohammed Ali and the Sportify Team. All Rights Reserved.**

> **CONFIDENTIAL & PROPRIETARY**  
> This software, its source code, algorithms, visual design, and associated documentation are the exclusive intellectual and proprietary property of **Mohammed Ali and the Sportify Team**.

Unauthorized copying, reproduction, distribution, modification, reverse engineering, sublicensing, commercial exploitation, or any other unauthorized use of this software or any portion thereof, via any medium, is **strictly prohibited** without prior explicit written permission from the copyright holders.

This repository is presented solely for demonstration and evaluation purposes. It is **not** open-source software and is **not** licensed for public, educational, or commercial re-use. See the [LICENSE](LICENSE) file for details.
