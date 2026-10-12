# Sportify — Personalized Athlete Development Platform

> **Train for what your game demands.**

[![Frontend](https://img.shields.io/badge/Frontend-React%2018%20%7C%20TypeScript%20%7C%20Vite-blue)](https://sportify-3dzr.vercel.app)
[![Backend](https://img.shields.io/badge/Backend-FastAPI%20%7C%20Python%203.11-green)](https://sportify-3dzr.vercel.app)
[![Vision](https://img.shields.io/badge/Vision-Google%20MediaPipe%20Tasks-orange)](https://sportify-3dzr.vercel.app)
[![AI Coaching](https://img.shields.io/badge/AI%20Coaching-Google%20Gemini%203.6-purple)](https://sportify-3dzr.vercel.app)
[![License: Proprietary](https://img.shields.io/badge/License-Proprietary%20%7C%20All%20Rights%20Reserved-red.svg)](LICENSE)

Sportify is an intelligent athlete development platform that turns any smartphone or web camera into a high-performance biomechanics coaching lab. By pairing **computer-vision movement tracking**, **role-specific athletic intelligence**, and **generative AI coaching**, Sportify gives athletes objective diagnostic feedback, identifies mechanical bottlenecks, and delivers tailored periodized training regimens.

---

## 🚀 Live Demo

- **Web Application**: [https://sportify-3dzr.vercel.app](https://sportify-3dzr.vercel.app)

---

## ❓ What Problem Does Sportify Solve?

Most athletes today train with a fundamental handicap: **generic advice**.

Standard gym trackers and fitness apps treat every user like a general gym-goer aiming to burn calories or do generic bench presses. Meanwhile, elite movement labs equipped with 3D motion-capture sensors, force plates, and dedicated biomechanists are locked away inside professional franchises and high-budget academies.

This leaves grassroots, collegiate, and aspiring competitive athletes in a **feedback vacuum**:
1. **Hidden Mechanical Flaws**: Flawed mechanics—like a collapsing front knee, premature trunk rotation, or asymmetrical landing forces—go unnoticed until performance drops or an injury occurs.
2. **Cookie-Cutter Workouts**: Athletes are handed one-size-fits-all fitness routines that don't address their unique sporting demands or current physical bottlenecks.
3. **Zero Objective Diagnostics**: Without access to a biomechanics lab, athletes have no way to visually measure their joint stability, mobility, posture, balance, and explosive power.

---

## 🏏 Why Role-Specific Training Matters: The Cricket Example

Even within the **exact same sport**, two athletes have completely different kinematic demands and injury profiles. Consider three positions in **Cricket**:

| Athletic Role | Movement Demands & Biomechanics | What Happens With a Generic Workout | What Sportify Analyzes & Prescribes |
|---|---|---|---|
| 🏏 **Opening Batsman** | **Rotational torque, lead-knee stability, weight transfer.** Needs precise head alignment over the front knee, dynamic hip rotation for drive mechanics, and strong forearm/wrist control. | Standard heavy squats without rotational or single-leg focus can stiffen hips, causing the batter to fall over to the off-side during cover drives. | Analyzes front knee flexion, head-over-knee alignment, and lead elbow angle. Prescribes thoracic mobility and unilateral transfer drills. |
| ⚡ **Fast Bowler** | **Violent delivery stride bracing, eccentric hamstring capacity, spinal integrity.** Absorbs ground reaction forces of **6–8× body weight** during the front-foot plant while counter-rotating the trunk. | Generic leg presses fail to prepare the hamstring for high-speed eccentric braking, heightening lumbar stress fracture and hamstring tear risks. | Analyzes front-leg brace rigidity, torso inclination, and eccentric landing absorption. Prescribes eccentric hamstring strength and anti-rotational core stability. |
| 🧤 **Wicketkeeper** | **Deep sustained hip flexion, reactive ankle elasticity, multi-directional lateral agility.** Spends hours in deep squats with sudden explosive lateral launches off both feet. | Generic calf raises and bench presses do not build the sustained hip capsule mobility or reactive tendon stiffness needed to stay low for 50 overs. | Evaluates deep hip/ankle mobility, symmetry in bilateral loading, and explosive reactive extension. Prescribes hip mobility flow and reactive plyometrics. |

> **The Takeaway**: A one-size-fits-all workout app gives all three of these cricketers the exact same routine. Sportify understands that what makes a fast bowler durable is completely different from what makes an opening batsman technically sound.

---

## ⚡ How Sportify Works (Core Functionality)

Sportify guides athletes through a continuous, objective development cycle:

```
[ 1. Onboarding ]  -->  [ 2. Movement Studio ]  -->  [ 3. Diagnostic Engine ]  -->  [ 4. AI Training & Recovery ]  -->  [ 5. Progress Tracking ]
  Sport, Role &           Record or upload video         Kinematic radar chart          4-Week tailored periodized         Workout logging, volume
  Athletic Identity       with real-time CV gate         & bottleneck detection         regimen + doctor recovery          accumulation & re-test
```

### 1. Granular Athlete Onboarding
- Athletes define their sport (Cricket, Football, Basketball, Athletics), primary role, and specialized sub-role.
- Captures biometrics, training availability, available equipment, and athlete-reported focus areas to establish a baseline profile.

### 2. Intelligent Movement Studio & Quality Gate
- Guided video capture with framing instructions (camera distance, height, angle).
- **Activity-Aware Protocols**: Applies dedicated movement analyzers specifically tuned for:
  - 🏏 **Cricket Batting Drive Mechanics** (`cricket_batting`): Stance alignment, lead elbow elevation, head-over-knee tracking, front knee flexion, and rotational weight transfer.
  - ⚽ **Football Strike & Kick** (`football_strike`): Plant-foot stability, kicking knee extension velocity, hip whip angle, and torso lean balance.
  - 🏀 **Basketball Jump Shot & Release** (`basketball_jump_shot`): Triple extension alignment (ankle-knee-hip), vertical apex timing, and landing absorption.
  - 🏃 **Sprint Acceleration** (`sprint_mechanics`): Forward acceleration lean, high knee drive elevation, hip extension, and stride symmetry.
  - ⚡ **Vertical Jump / CMJ** (`vertical_jump`): Countermovement depth, explosive extension rate, and eccentric landing shock dissipation.
  - 🏋️ **Squat Biomechanics** (`squat`): Femur-to-parallel depth, knee valgus/varus deviation, torso inclination, and bilateral knee symmetry.
- **Smart Quality Gate**: Checks landmark visibility (minimum 70% threshold) and tracking confidence before running analysis, preventing false or misleading scores.

### 3. Biomechanical Radar Profiling & Gap Analysis
- Kinematic metrics are plotted on an interactive, dynamic SVG radar chart across 6 core athletic pillars:
  - **Stability**: Dynamic joint control and base maintenance under load.
  - **Mobility**: Functional active range of motion.
  - **Symmetry**: Bilateral balance between left and right kinetic chains.
  - **Posture**: Spinal alignment, head position, and core integrity.
  - **Explosive Capacity**: Rate of force development and acceleration speed.
  - **Balance**: Center-of-mass control during movement execution and landing.

### 4. Algorithmic Bottleneck Diagnostic Engine
- Compares measured kinematics against sport- and position-specific benchmarks.
- Automatically categorizes mechanics into four clear performance tiers:
  - 🟢 **Strengths**: Mechanics that meet or exceed role standards.
  - 🔵 **Proficient**: Consistent baseline movement patterns.
  - 🟡 **Development Areas**: Inefficiencies limiting power or fluidity.
  - 🔴 **Critical Bottlenecks**: Severe faults or compensations that restrict performance and increase injury vulnerability.

### 5. AI Periodized 4-Week Training & Recovery Prescriptions
- Translates detected bottlenecks into an intelligent, structured 4-week training routine (*Foundation → Progression → Peak → Deload*).
- Prescribes role-specific corrective exercises from a curated catalog, complete with sets, reps, intensity (RPE), and biomechanical cues.
- Generates a doctor-grounded recovery pathway tailored to loaded joints, soft-tissue regeneration, and nervous system recovery.

### 6. Longitudinal Progress Tracking
- Athletes log completed training sessions, record perceived exertion, and accumulate workload volume.
- Historical re-assessments calculate a trajectory delta, visually showing whether mechanical bottlenecks are improving over time.

---

## 🏆 Supported Sports & Roles

| Sport | Primary Roles | Supported Sub-Roles |
|---|---|---|
| 🏏 **Cricket** | Batsman, Bowler, All-Rounder, Wicketkeeper | Opening Batsman, Top Order, Middle Order, Finisher, Fast Bowler, Swing Bowler, Spin Bowler, Wicketkeeper-Batsman |
| ⚽ **Football** | Forward, Midfielder, Defender, Goalkeeper | Striker, Winger, Central Midfielder, Attacking Midfielder, Centre-Back, Full-Back, Goalkeeper |
| 🏀 **Basketball** | Guard, Forward, Center | Point Guard, Shooting Guard, Small Forward, Power Forward, Center |
| 🏃 **Athletics** | Track, Field | Sprinter (100m / 200m), Middle Distance, Jumper (Long / High / Triple), Thrower |

---

## 🏗️ System & Codebase Architecture

Sportify is organized into a modular, decoupled full-stack architecture:

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
└── backend/                           # API & Intelligence Engine (FastAPI + Python 3.11)
    ├── main.py                        # Application entrypoint & CORS middleware
    ├── config.py                      # Application environment configuration
    ├── database.py                    # Async SQLite / PostgreSQL engine & automated schema migrations
    ├── models/                        # SQLAlchemy 2.0 ORM models (Athlete, Assessment, WorkoutLog, TrainingPlan)
    ├── schemas/                       # Pydantic v2 validation schemas
    ├── routers/                       # REST API controllers
    │   ├── auth.py                    # Authentication, registration, and OTP verification
    │   ├── intake.py                  # Athlete onboarding & sport taxonomy retrieval
    │   ├── video.py                   # Video upload, processing coordination, and status polling
    │   ├── plan.py                    # Gemini AI training plan and recovery synthesis
    │   └── progress.py                # Workout logging and longitudinal reassessment tracking
    ├── services/
    │   ├── movement/                  # Biomechanics analysis protocol suite
    │   │   ├── base.py                # Abstract MovementProtocol & QualityReport contracts
    │   │   ├── quality_gate.py        # Joint visibility, framerate sampling, and validation gate
    │   │   ├── registry.py            # Dynamic protocol registry
    │   │   └── *_analyzer.py          # Activity-specific kinematic analyzers (cricket, football, etc.)
    │   ├── pose_detector.py           # Google MediaPipe Tasks PoseLandmarker adapter
    │   ├── bottleneck_engine.py       # 4-tier gap analysis diagnostic engine
    │   ├── gemini_service.py          # Google Gemini 3.6 Flash integration with deterministic fallbacks
    │   └── exercise_service.py        # Curated athletic exercise catalog
    └── tests/                         # Automated unit test suite (validation, protocols, fallbacks)
```

### End-to-End Data Flow

```
[ User Video ]
      │
      ▼
[ VideoQualityGate ]  ──(Fails criteria)──► [ Structured Rejection & Framing Guidance ]
      │ (Passes: >=70% landmarks, >=15 FPS)
      ▼
[ ProtocolRegistry ]  ──(Selects activity-specific analyzer: e.g. cricket_batting)
      │
      ▼
[ PoseLandmarker + Analyzer ] ──► [ Joint Vectors, Angles & Phase Symmetry ]
      │
      ▼
[ Bottleneck Engine ] ──► [ Gap Analysis vs. Position Benchmarks (Radar Scores) ]
      │
      ▼
[ Gemini AI Coaching ] ──► [ 4-Week Progressive Training Plan & Recovery Pathway ]
      │
      ▼
[ Dynamic UI Dashboard ] ──► [ Interactive Visual Feedback & Workout Tracker ]
```

---

## 📄 License & Proprietary Rights

**Copyright © 2026 Mohammed Ali and the Sportify Team. All Rights Reserved.**

> **CONFIDENTIAL & PROPRIETARY**  
> This software, its source code, algorithms, visual design, and associated documentation are the exclusive intellectual and proprietary property of **Mohammed Ali and the Sportify Team**.

Unauthorized copying, reproduction, distribution, modification, reverse engineering, sublicensing, commercial exploitation, or any other unauthorized use of this software or any portion thereof, via any medium, is **strictly prohibited** without prior explicit written permission from the copyright holders.

This repository is presented solely for demonstration and evaluation purposes. It is **not** open-source software and is **not** licensed for public, educational, or commercial re-use. See the [LICENSE](LICENSE) file for details.
