# Sportify — Personalized Athlete Development Platform

> **Train for what your game demands.**

Sportify is an intelligent, full-stack athlete development platform that bridges the gap between elite biomechanical analysis and everyday athletic training. By combining **computer-vision movement assessment**, **sport- and position-specific biomechanical intelligence**, and **generative AI coaching**, Sportify provides athletes across sports and positions with elite diagnostic analysis, actionable bottleneck discovery, and personalized periodized training.

---

## 🚀 Live Application

- **Web Application**: [https://sportify-3dzr.vercel.app](https://sportify-3dzr.vercel.app)

---

## 💡 The Problem We Solve

Traditional athletic training and modern fitness applications leave a massive gap for developing athletes:

1. **The Generic Fitness Fallacy**: Most fitness apps treat all athletes as generic gym-goers, prescribing generic 3×10 routines. They ignore that a *cricket fast bowler* managing high lumbar-spine loads requires completely different mechanics, kinetic sequencing, and recovery protocols than a *football winger* or a *basketball point guard*.
2. **The Elite Coaching Barrier**: Accurate biomechanical diagnostics and movement assessments are historically confined to elite motion-capture laboratories, high-performance institutes, and pro sports franchises equipped with multi-thousand-dollar sensor suites. Grassroots, amateur, and developing athletes have zero access to objective feedback.
3. **The Feedback Vacuum & Injury Risk**: Athletes often train flawed movement patterns—such as knee valgus upon landing, poor rotational weight transfer, or compromised deceleration angles—without knowing it. Repeated over time, these undetected kinematic flaws limit performance ceilings and significantly heighten non-contact injury risks.
4. **Disjointed Progression**: Even when athletes identify technical flaws, they rarely receive a structured, progressive program designed to correct them. Assessment, workout prescription, and recovery are fragmented across separate tools or forgotten entirely.

---

## ⚡ How Sportify Solves It

Sportify turns any smartphone or web camera into an objective, activity-aware biomechanical assessment lab:

- **Role-Aware Biomechanical Intelligence**: Calibrates every metric to the athlete’s specific sport, primary role, and specialized sub-role.
- **Objective Kinematic Measurement**: Analyzes genuine angles, movement symmetry, joint stability, and phase transitions rather than estimating with arbitrary scores.
- **Precision Gap Diagnostics**: Algorithmic gap analysis identifies exactly where an athlete excels and where critical bottlenecks hold them back.
- **Adaptive 4-Week Periodized Coaching**: Directly translates movement assessment findings into an AI-synthesized, multi-week training cycle and doctor-grounded recovery plan.

---

## 🎯 Overall Basic Functionality

### 1. Granular Athlete Onboarding & Role Profiling
Athletes define their complete athletic identity:
- **Sport & Position Taxonomy**: Select sport, discipline, primary playing role, and specialized sub-role across Cricket, Football, Basketball, and Track & Field Athletics.
- **Physical Demands & Profile**: Capture height, weight, training frequency, access to equipment, and self-reported performance goals or injury history.
- **Targeted Development Objectives**: Align the system toward specific outcomes (e.g., explosive power, rotational torque, deceleration stability, sprint mechanics).

### 2. Intelligent Movement Studio & Video Assessment
Athletes record or upload movement videos directly within the web app:
- **Camera Setup & Framing Guide**: Built-in instructions on camera distance, height, lighting, and plane of motion (sagittal vs. frontal).
- **Activity-Specific Kinematic Protocols**: Rather than applying one generic algorithm to every video, Sportify matches the video to a dedicated assessment protocol:
  - 🏏 **Cricket Batting Drive Mechanics**: Analyzes stance alignment, lead elbow elevation, head over lead knee tracking, front knee flexion angle, and rotational weight transfer.
  - ⚽ **Football Strike & Kicking Mechanics**: Measures plant-foot stability, kicking knee extension velocity, striking hip whip angle, and torso lean balance through ball impact.
  - 🏀 **Basketball Jump Shot & Release**: Tracks triple extension alignment (ankle, knee, hip), elbow alignment under the ball, vertical release apex, and landing shock absorption.
  - 🏃 **Sprint Acceleration Mechanics**: Measures forward torso acceleration lean, high knee drive elevation, hip extension angle, and bilateral stride symmetry.
  - ⚡ **Vertical Jump / CMJ**: Evaluates countermovement eccentric load depth, rate of explosive extension, takeoff posture, and eccentric landing absorption.
  - 🏋️ **Squat Biomechanics**: Analyzes deep hip flexion, femur-to-parallel depth, knee valgus/varus control, torso inclination, and bilateral knee symmetry.
- **Automated Quality Gate**: Validates joint visibility, frame rate, and tracking confidence to prevent false assessments or misleading feedback.

### 3. Biomechanical Radar Profiling
Kinematic performance is visualized through an interactive, multi-axis SVG radar profile comparing the athlete against sport- and position-specific benchmarks across 6 key pillars:
- **Stability**: Joint control and base maintenance under dynamic load.
- **Mobility**: Functional range of motion across active joints.
- **Symmetry**: Bilateral kinematic balance between left and right kinetic chains.
- **Posture**: Spinal alignment, head positioning, and torso integrity.
- **Explosive Capacity**: Rate of force development, extension speed, and acceleration.
- **Balance**: Center-of-mass control through movement execution and landing.

### 4. Bottleneck Diagnostic Engine
An algorithmic diagnostic engine evaluates kinematic findings and categorizes them into clear performance tiers:
- 🟢 **Strengths**: Solid mechanics that meet or exceed position benchmarks.
- 🔵 **Proficient**: Consistent baseline mechanics with minor optimization opportunities.
- 🟡 **Development Areas**: Noticeable deviations that limit efficiency or power output.
- 🔴 **Critical Bottlenecks**: Severe kinematic faults or compensations that heighten injury risk and demand immediate intervention.

### 5. Periodized AI Training & Corrective Prescriptions
Movement assessment findings feed directly into an intelligent training synthesizer:
- **4-Week Structured Plan**: Progressive periodization spanning *Foundation*, *Progression*, *Peak*, and *Deload* phases.
- **Role-Specific Corrective Drills**: Curated exercise prescriptions directly targeting identified bottlenecks (e.g., hip mobility for batting drives, eccentric hamstring strength for sprint deceleration).
- **Detailed Sets, Reps & Cues**: Precise prescription with RPE guidelines, rest intervals, and biomechanical form cues.

### 6. Doctor-Grounded Recovery Pathway
Comprehensive recovery recommendations addressing athlete fatigue and movement strain:
- **Targeted Mobility & Tissue Care**: Active recovery protocols focused on loaded joints.
- **Readiness & Regeneration**: Sleep guidelines, hydration targets, and nervous system recovery techniques.

### 7. Longitudinal Progress Tracking
- **Workout Logging**: Track completed sessions, recorded RPE, and accumulated training volume.
- **Reassessment Delta**: Compare repeat movement assessments over time to quantify kinematic improvements and measure athletic development.

---

## 🏅 Supported Sports & Roles

| Sport | Primary Roles | Specialized Sub-Roles |
|-------|---------------|-----------------------|
| 🏏 **Cricket** | Batsman, Bowler, All-Rounder, Wicketkeeper | Opening Batsman, Top Order, Middle Order, Finisher, Fast Bowler, Swing Bowler, Spin Bowler, Wicketkeeper-Batsman |
| ⚽ **Football** | Forward, Midfielder, Defender, Goalkeeper | Striker, Winger, Central Midfielder, Attacking Midfielder, Centre-Back, Full-Back, Goalkeeper |
| 🏀 **Basketball** | Guard, Forward, Center | Point Guard, Shooting Guard, Small Forward, Power Forward, Center |
| 🏃 **Athletics** | Track, Field | Sprinter (100m / 200m), Middle Distance, Jumper (Long / High / Triple), Thrower |
