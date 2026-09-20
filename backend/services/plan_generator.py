import json
import re
from typing import Dict, List, Optional, Any

from .exercise_service import exercise_service
from .taxonomy_service import taxonomy_service


# Grounded baseline profiles per sport & role
ROLE_BASELINE_PROFILES = {
    ("football", "striker"): {
        "role_title": "Striker / Forward",
        "demands": "0–10m explosive acceleration, vertical power for aerial duels, rapid cutting/separation, and finishing under fatigue.",
        "primary_movements": ["linear_acceleration", "box_jump_power", "cutting_agility", "single_leg_deceleration"],
        "key_vulnerabilities": ["hamstring strains (sprint deceleration)", "groin/adductor tightness", "patellar tendon overload"],
        "block_focus": {
            "warmup": ["Glute bridge marches", "World's greatest stretch", "Leg swings & adductor flushes", "Pogo hops"],
            "power_speed": ["10m Acceleration Sprints with sled/band", "Box Jumps with soft landing", "Lateral Hurdle Hops to sprint"],
            "strength": ["Bulgarian Split Squats", "Trap Bar Deadlifts", "Dumbbell Step-Ups"],
            "accessory": ["Nordic Hamstring Curls", "Copenhagen Adductor Planks", "Tibialis anterior raises"],
            "finisher": ["10s Max Sprint / 50s Walk active recovery intervals (6 rounds)"]
        }
    },
    ("football", "central_midfielder"): {
        "role_title": "Central / Box-to-Box Midfielder",
        "demands": "Aerobic/anaerobic endurance (11–13km coverage), repeated sprint ability (RSA), rapid 360-degree turns, core rotational control.",
        "primary_movements": ["multi_directional_turns", "repeated_sprint_endurance", "core_bracing_contact", "deceleration"],
        "key_vulnerabilities": ["groin strains", "fatigue-induced hamstring pulls", "ankle sprains"],
        "block_focus": {
            "warmup": ["Hip 90/90 mobility", "Lateral band walks", "Inchworms with push-up", "Skipping matrix"],
            "power_speed": ["Pro-Agility 5-10-5 Shuttle", "Medicine Ball Rotational Slams", "Zig-zag deceleration cuts"],
            "strength": ["Barbell Front Squats", "Single-Leg Romanian Deadlifts", "Dumbbell Renegade Rows"],
            "accessory": ["Copenhagen Planks", "Pallof Presses", "Single-leg calf raises"],
            "finisher": ["Repeated Sprint Ability (RSA): 6x 30m sprints every 25 seconds"]
        }
    },
    ("football", "centre_back"): {
        "role_title": "Centre Back / Central Defender",
        "demands": "Physical duel strength, 5–20m recovery sprints, aerial heading dominance, and lateral jockeying balance.",
        "primary_movements": ["aerial_header_jumps", "physical_shielding", "recovery_sprints", "lateral_jockeying"],
        "key_vulnerabilities": ["lower back stiffness", "knee ligament stress during plant/pivot", "hamstring overload on recovery runs"],
        "block_focus": {
            "warmup": ["Thoracic spine extensions", "Monster walks with resistance band", "Spiderman lunges", "Drop squats"],
            "power_speed": ["Seated to Box Jump for max height", "15m Turn-and-Sprint Recovery Drills", "Broad Jumps to stick"],
            "strength": ["Heavy Trap Bar Deadlifts", "Barbell Back Squats", "Single-Arm Dumbbell Rows"],
            "accessory": ["Romanian Deadlifts (eccentric)", "Suitcase Carries", "Lateral Banded Ankle Walks"],
            "finisher": ["15m sprint + 15m backpedal shuttle intervals (5 rounds)"]
        }
    },
    ("football", "goalkeeper"): {
        "role_title": "Goalkeeper",
        "demands": "Explosive lateral diving power, split-second reactive agility, vertical reach, and shoulder collision resilience.",
        "primary_movements": ["lateral_diving_push", "vertical_catch_extension", "reactive_footwork", "shoulder_deceleration"],
        "key_vulnerabilities": ["shoulder rotator cuff impingement", "hip labrum/groin strains", "finger/wrist hyperextension"],
        "block_focus": {
            "warmup": ["Rotator cuff Y-T-W raises", "Deep squat hip opener", "Lateral shuffle mirrors", "Medicine ball wall catches"],
            "power_speed": ["Lateral Skater Jumps with stick", "Explosive Med Ball Chest Pass from Knees", "Depth Drop to Vertical Jump"],
            "strength": ["Barbell Push Presses", "Goblet Squats with tempo", "Pull-Ups or Lat Pulldowns"],
            "accessory": ["Band Face Pulls with external rotation", "Lateral Box Step-Downs", "Side Planks with leg abduction"],
            "finisher": ["Reaction ball drops & dive touches (4 rounds of 45s)"]
        }
    },
    ("cricket", "fast_bowler"): {
        "role_title": "Fast / Pace Bowler",
        "demands": "High ground-reaction force at front-foot plant, lumbar spine anti-extension, rotator cuff high-velocity durability, repeat-over bowling stamina.",
        "primary_movements": ["run_up_acceleration", "delivery_stride_bracing", "lumbar_anti_rotation", "follow_through_deceleration"],
        "key_vulnerabilities": ["lumbar stress fractures", "front-leg patellar tendinopathy", "shoulder/rotator cuff strain", "posterior chain tightness"],
        "block_focus": {
            "warmup": ["Thoracic spine foam roll & rotation", "Leg swings & hamstring floss", "Ankle dorsiflexion mobilization", "Band pull-aparts"],
            "power_speed": ["Single-Leg Bound to Stiff Plant", "Medicine Ball Rotational Scoop Throws", "Approach-gather acceleration bounds"],
            "strength": ["Trap Bar Deadlifts", "Single-Leg Romanian Deadlifts (RDLs)", "Barbell Split Squats"],
            "accessory": ["Nordic Hamstring Curls", "Deadbugs with band tension", "Prone Shoulder Y-T-W", "Side Planks"],
            "finisher": ["Tempo Bowling Stride Runs (8x 60m at 75% pace with 45s rest)"]
        }
    },
    ("cricket", "batsman"): {
        "role_title": "Batsman",
        "demands": "Hip-shoulder rotational power, stable low-center base, repeat sprint ability between wickets, forearm/wrist grip endurance.",
        "primary_movements": ["rotational_swing_power", "defensive_forward_stride", "sprint_between_wickets", "reactive_weight_transfer"],
        "key_vulnerabilities": ["lower back rotational strain", "forearm/wrist tendinopathy", "groin strains on lunging drives"],
        "block_focus": {
            "warmup": ["90/90 hip switches", "Torso rotational sweeps", "Wrist & forearm mobility", "Pogo hops"],
            "power_speed": ["Rotational Med Ball Slams against wall", "Lateral Step-and-Drive Hops", "17.68m (Pitch Length) Shuttle Sprints"],
            "strength": ["Barbell Front Squats", "Landmine Rotational Presses", "Single-Arm Dumbbell Rows"],
            "accessory": ["Pallof Anti-Rotation Holds", "Farmer's Walks (grip & posture)", "Copenhagen Planks"],
            "finisher": ["Pitch Shuttle Run: 22 yards x 2 with bat, 30s rest (8 rounds)"]
        }
    },
    ("cricket", "wicket_keeper"): {
        "role_title": "Wicketkeeper",
        "demands": "Deep crouch hip and ankle mobility, lateral explosive spring, reactive hand-eye glove speed, and lower back endurance over 50–100 overs.",
        "primary_movements": ["deep_squat_isometric_hold", "lateral_leg_side_spring", "reactive_hand_reach", "standing_up_acceleration"],
        "key_vulnerabilities": ["lower back fatigue/strain", "patellar tendon ache from deep squatting", "finger/wrist impact trauma"],
        "block_focus": {
            "warmup": ["Deep Cossack squats", "Ankle rockbacks with band", "Cat-cow spinal segmentation", "Hand-eye reaction ball drills"],
            "power_speed": ["Low-Stance Lateral Hurdle Bounds", "Reaction Ball Lateral Diving Drops", "Short Jump-Turns"],
            "strength": ["Deep Goblet Squats with 3s pause", "Barbell Hip Thrusts", "Dumbbell Step-Ups"],
            "accessory": ["Lateral Banded Monster Walks", "Back Extensions on GHD/Roman Chair", "Plate Wrist Curls"],
            "finisher": ["Squat Hold 30s + 5m lateral sprint burst (5 sets)"]
        }
    },
    ("cricket", "spin_bowler"): {
        "role_title": "Spin Bowler",
        "demands": "Trunk stability against rotational torque, shoulder mobility through full arc, single-leg balance at crease, repeated bowling stamina.",
        "primary_movements": ["crease_pivot_balance", "thoracic_rotation", "shoulder_arc_mobility", "unilateral_leg_drive"],
        "key_vulnerabilities": ["shoulder impingement", "thoracic spine stiffness", "hip flexor strain"],
        "block_focus": {
            "warmup": ["Thoracic windmills", "Band external rotations", "Single-leg balance reach", "Hamstring sweeps"],
            "power_speed": ["Rotational Cable Woodchops", "Medicine Ball Overhead Throws", "Single-Leg Balance Hops"],
            "strength": ["Single-Leg Dumbbell RDLs", "Half-Kneeling Landmine Press", "Seated Cable Rows"],
            "accessory": ["Band Face Pulls", "Bird-Dogs with hold", "Standing Cable Anti-Rotation"],
            "finisher": ["Interval core circuits: 3 rounds of Plank (45s), Side Plank (30s/side), Hollow Hold (30s)"]
        }
    },
    ("basketball", "point_guard"): {
        "role_title": "Point Guard / Shooting Guard",
        "demands": "First-step quickness, lateral defensive slide stamina, change-of-direction agility, perimeter core balance, and reactive plyometrics.",
        "primary_movements": ["first_step_drive", "defensive_slide", "pull_up_jumper_landing", "change_of_direction"],
        "key_vulnerabilities": ["ankle sprains", "patellar tendinopathy (jumper's knee)", "hip impingement"],
        "block_focus": {
            "warmup": ["Ankle banded mobilizations", "Hip flexor active stretch", "Defensive slide tempo drills", "Line hops"],
            "power_speed": ["Reactive Lateral Box Hops", "10m First-Step Acceleration Sprints", "Drop Jumps with quick rebound"],
            "strength": ["Trap Bar Jump Squats", "Bulgarian Split Squats", "Single-Arm Dumbbell Push Press"],
            "accessory": ["Poliquin Step-Ups (VMO)", "Banded Ankle Inversion/Eversion", "Suitcase Carries"],
            "finisher": ["Court 17s (sideline-to-sideline sprints in under 60 seconds)"]
        }
    },
    ("basketball", "center"): {
        "role_title": "Center / Post Player",
        "demands": "Interior physical contact strength, vertical rim protection jumps, box-out stability, and knee/ankle durability under heavy load.",
        "primary_movements": ["vertical_rim_protection", "post_up_contact_anchor", "rebounding_box_out", "short_recovery_stride"],
        "key_vulnerabilities": ["patellar tendinopathy", "lower back strain from post contact", "ankle inversion"],
        "block_focus": {
            "warmup": ["Thoracic foam roll", "Hip capsule mobilizations", "Monster band walks", "Vertical wall touches"],
            "power_speed": ["Repeat Vertical Jumps to backboard/target", "Medicine Ball Slam to Jump", "Box Depth Drops (stick landing)"],
            "strength": ["Heavy Trap Bar Deadlifts", "Barbell Back Squats", "Barbell Overhead Press"],
            "accessory": ["Romanian Deadlifts", "Tibialis anterior raises", "Farmer's Walk (heavy)", "Plank with plate"],
            "finisher": ["Lane Agility Shuttle Drills (4 sets with 60s rest)"]
        }
    },
    ("athletics", "sprinter"): {
        "role_title": "Sprinter (100m / 200m)",
        "demands": "Drive phase acceleration angles, maximal velocity upright mechanics, ankle stiffness/elasticity, and high-speed hamstring resilience.",
        "primary_movements": ["drive_phase_piston", "max_velocity_front_side_mechanics", "ankle_stiffness_rebound", "deceleration"],
        "key_vulnerabilities": ["biceps femoris hamstring tears", "Achilles tendon strain", "hip flexor overload"],
        "block_focus": {
            "warmup": ["A-skips and B-skips", "Straight-leg bounds", "Ankle pogo hops", "Hamstring dynamic sweeps"],
            "power_speed": ["Block / 3-point Start Sprints (15–30m)", "Wicket Running for stride frequency", "Broad Jump to Sprint"],
            "strength": ["Barbell Hip Thrusts", "Heavy Trap Bar Deadlifts", "Single-Leg Bulgarian Split Squats"],
            "accessory": ["Nordic Hamstring Curls (slow eccentric)", "Single-leg straight-knee calf raises", "Hanging Leg Raises"],
            "finisher": ["Fly 20m Sprints with 20m acceleration zone (4 reps, full 3 min recovery)"]
        }
    }
}

# Generic fallback profile for sports/roles not listed above
DEFAULT_ROLE_PROFILE = {
    "role_title": "Athletic Specialist",
    "demands": "Foundational multi-planar strength, explosive power, reactive agility, and durable joint mechanics.",
    "primary_movements": ["acceleration", "jumping", "rotational_drive", "deceleration"],
    "key_vulnerabilities": ["hamstring strains", "knee instability", "lower back fatigue"],
    "block_focus": {
        "warmup": ["World's greatest stretch", "Glute bridges", "Hip 90/90", "Pogo hops"],
        "power_speed": ["Box Jumps", "10m Acceleration Sprints", "Rotational Med Ball Slams"],
        "strength": ["Trap Bar Deadlifts", "Goblet Squats", "Dumbbell Overhead Press"],
        "accessory": ["Nordic Curls or RDLs", "Plank Holds", "Single-Leg Calf Raises"],
        "finisher": ["Interval shuttle sprints (5 rounds of 15s on / 45s off)"]
    }
}


def get_role_baseline_profile(sport: str, role: str) -> Dict[str, Any]:
    sport_key = (sport or "").lower().strip()
    role_key = (role or "").lower().strip().replace(" ", "_")

    # Direct match
    if (sport_key, role_key) in ROLE_BASELINE_PROFILES:
        return ROLE_BASELINE_PROFILES[(sport_key, role_key)]

    # Partial match on role
    for (s, r), profile in ROLE_BASELINE_PROFILES.items():
        if s == sport_key and (r in role_key or role_key in r):
            return profile

    # Fallback to sport default or general default
    for (s, r), profile in ROLE_BASELINE_PROFILES.items():
        if s == sport_key:
            return profile

    return DEFAULT_ROLE_PROFILE


class PlanGenerator:
    """
    Evidence-Grounded Training and Recovery Pathway Generator.
    Uses ExerciseService as the ground-truth catalog for exercise prescription,
    and grounds Gemini LLM in role-specific baseline training structures and athlete profile constraints.
    """

    def __init__(self):
        self.exercises = exercise_service
        self.taxonomy = taxonomy_service

    def generate_plan(
        self,
        athlete_profile: Dict[str, Any],
        bottlenecks: List[Dict[str, Any]],
        strengths: Optional[List[Dict[str, Any]]] = None,
        development_areas: Optional[List[Dict[str, Any]]] = None,
    ) -> Dict[str, Any]:
        """
        Generate a structured 4-week role-specific baseline training pathway.
        """
        sport = athlete_profile.get("sport", "cricket")
        role = athlete_profile.get("primary_role") or athlete_profile.get("role", "batsman")
        sub_role = athlete_profile.get("sub_role")
        exp = athlete_profile.get("experience_level", "intermediate")
        days_per_week = min(max(int(athlete_profile.get("training_days_per_week", 4)), 2), 6)
        session_mins = int(athlete_profile.get("session_duration_minutes", 60))
        goals = athlete_profile.get("development_objectives") or athlete_profile.get("goals") or []

        role_profile = get_role_baseline_profile(sport, role)

        # 1. Determine Primary Development Focuses
        primary_bottlenecks = [b for b in bottlenecks if b.get("attribute")]
        if not primary_bottlenecks and development_areas:
            primary_bottlenecks = development_areas
        if not primary_bottlenecks:
            role_weights = self.taxonomy.get_attribute_weights(sport, role, sub_role=sub_role, goals=goals)
            top_attr = max(role_weights, key=role_weights.get) if role_weights else "explosive_capacity"
            primary_bottlenecks = [{"attribute": top_attr, "name": top_attr.replace("_", " ").title(), "gap": 0}]

        # 2. Build Base 4-Week Catalog Prescription (Role-Specific Deterministic Ground Truth)
        base_weeks = self._build_deterministic_pathway(
            athlete_profile=athlete_profile,
            role_profile=role_profile,
            primary_bottlenecks=primary_bottlenecks,
            days_per_week=days_per_week,
            session_mins=session_mins,
            exp=exp,
        )

        # 3. Attempt LLM Grounded Synthesis (Adds role-specific coaching rationales & cues without hardcoding)
        llm_enhanced_plan = self._attempt_llm_synthesis(
            athlete_profile=athlete_profile,
            role_profile=role_profile,
            bottlenecks=primary_bottlenecks,
            strengths=strengths or [],
            base_weeks=base_weeks,
        )

        if llm_enhanced_plan:
            return llm_enhanced_plan

        # 4. Fallback to Grounded Catalog Plan
        top_focus = primary_bottlenecks[0].get("name") or primary_bottlenecks[0].get("attribute", "").replace("_", " ").title()
        role_title = role_profile.get("role_title", role.replace("_", " ").title())
        return {
            "_source": "catalog_grounded",
            "plan_title": f"4-Week {sport.title()} {role_title} Baseline Training Plan",
            "plan_summary": f"Role-specific baseline training program for {role_title}. Progresses movement mechanics, strength-power, and position-specific capacity over 4 weeks.",
            "role_focus": role_title,
            "primary_focus_attributes": [b.get("attribute") for b in primary_bottlenecks[:3]],
            "weeks": base_weeks,
            "recovery_protocol": self.generate_recovery_plan(athlete_profile, bottlenecks=primary_bottlenecks),
        }

    def _build_deterministic_pathway(
        self,
        athlete_profile: Dict[str, Any],
        role_profile: Dict[str, Any],
        primary_bottlenecks: List[Dict[str, Any]],
        days_per_week: int,
        session_mins: int,
        exp: str,
    ) -> List[Dict[str, Any]]:
        """
        Assembles 4 progressive weeks using real exercise records tailored to the role's 5-block baseline architecture.
        """
        blocks = role_profile.get("block_focus", DEFAULT_ROLE_PROFILE["block_focus"])
        role_title = role_profile.get("role_title", "Athlete")

        # 4-Week Baseline Progression Framework
        week_frameworks = [
            {
                "week_number": 1,
                "theme": "Week 1: Baseline Movement Quality & Volume Intro",
                "focus_desc": "Establish baseline movement competency, position-specific joint prep, and technical consistency.",
                "rpe": "6–7",
                "sets": 3,
                "reps": "10-12",
                "rest": 90,
            },
            {
                "week_number": 2,
                "theme": "Week 2: Load & Volume Progression",
                "focus_desc": "Progressive overload on role-specific strength drivers and rate of force development.",
                "rpe": "7–8",
                "sets": 4,
                "reps": "8-10",
                "rest": 90,
            },
            {
                "week_number": 3,
                "theme": "Week 3: Peak Role Output & Intensity",
                "focus_desc": "High-velocity execution, maximal intent, and game-like speed and power.",
                "rpe": "8–9",
                "sets": 4,
                "reps": "4-6",
                "rest": 120,
            },
            {
                "week_number": 4,
                "theme": "Week 4: Role Technical Deload & Recovery",
                "focus_desc": "40% volume reduction to dissipate neural fatigue while reinforcing crisp movement sharpness.",
                "rpe": "6",
                "sets": 2,
                "reps": "8-10",
                "rest": 90,
            },
        ]

        weeks = []
        for wf in week_frameworks:
            w_num = wf["week_number"]
            sessions = []

            for day_idx in range(days_per_week):
                # Distribute session focus across the week
                if day_idx % 3 == 0:
                    s_type = "Strength"
                    s_name = f"{role_title} Primary Strength & Prehab"
                elif day_idx % 3 == 1:
                    s_type = "Speed"
                    s_name = f"{role_title} Power & Acceleration"
                else:
                    s_type = "Agility"
                    s_name = f"{role_title} Deceleration & Conditioning"

                # Pick main exercises from role profile
                p_ex = blocks["power_speed"][(day_idx + w_num) % len(blocks["power_speed"])]
                s_ex = blocks["strength"][(day_idx + w_num) % len(blocks["strength"])]
                a_ex = blocks["accessory"][(day_idx + w_num) % len(blocks["accessory"])]

                main_exercises = [
                    {
                        "name": p_ex,
                        "sets": wf["sets"],
                        "reps": "3-5" if "Sprint" in p_ex or "Jump" in p_ex else "6-8",
                        "intensity_level": "High" if w_num == 3 else "Moderate",
                        "rest_seconds": wf["rest"],
                        "coaching_cue": f"Explosive intent. Maximize ground force for {role_title}.",
                        "targets_bottleneck": "explosive_capacity",
                    },
                    {
                        "name": s_ex,
                        "sets": wf["sets"],
                        "reps": wf["reps"],
                        "intensity_level": "High" if w_num == 3 else "Moderate",
                        "rest_seconds": wf["rest"],
                        "coaching_cue": "Brace core, maintain neutral spine and controlled eccentric tempo.",
                        "targets_bottleneck": "strength",
                    },
                    {
                        "name": a_ex,
                        "sets": 3,
                        "reps": "10-12",
                        "intensity_level": "Moderate",
                        "rest_seconds": 60,
                        "coaching_cue": f"Target key vulnerability area for {role_title}.",
                        "targets_bottleneck": "knee_stability",
                    },
                ]

                sessions.append(
                    {
                        "day": day_idx + 1,
                        "session_name": f"{s_name} — Week {w_num}",
                        "type": s_type,
                        "duration_minutes": session_mins,
                        "target_rpe": wf["rpe"],
                        "rationale": f"{wf['theme']}: {wf['focus_desc']} Tailored to {role_title}.",
                        "warmup": blocks["warmup"],
                        "main_exercises": main_exercises,
                        "finisher": blocks["finisher"],
                        "cooldown": [
                            "Targeted foam rolling for lower limbs (3 min)",
                            "Diaphragmatic deep breathing (2 min)",
                        ],
                        "recovery_notes": f"Target RPE {wf['rpe']}. Hydrate and record post-session RPE.",
                    }
                )

            weeks.append(
                {
                    "week_number": w_num,
                    "week_theme": wf["theme"],
                    "target_rpe": wf["rpe"],
                    "focus_summary": wf["focus_desc"],
                    "sessions": sessions,
                }
            )

        return weeks

    def _attempt_llm_synthesis(
        self,
        athlete_profile: Dict[str, Any],
        role_profile: Dict[str, Any],
        bottlenecks: List[Dict[str, Any]],
        strengths: List[Dict[str, Any]],
        base_weeks: List[Dict[str, Any]],
    ) -> Optional[Dict[str, Any]]:
        """
        Calls Gemini with the role-specific baseline structure to generate a dynamic 4-week training plan.
        """
        sport = athlete_profile.get("sport", "cricket")
        role = athlete_profile.get("primary_role") or athlete_profile.get("role", "batsman")
        exp = athlete_profile.get("experience_level", "intermediate")
        days_per_week = len(base_weeks[0]["sessions"])
        session_mins = athlete_profile.get("session_duration_minutes", 60)
        role_title = role_profile.get("role_title", role.replace("_", " ").title())
        demands = role_profile.get("demands", "")
        vulnerabilities = ", ".join(role_profile.get("key_vulnerabilities", []))

        prompt = f"""You are an elite sports strength & conditioning coach. Generate a dynamic, 4-week role-specific baseline training plan.

Context:
- Sport: {sport.title()}
- Role/Position: {role_title}
- Experience Level: {exp.title()}
- Primary Physical Demands: {demands}
- Key Vulnerabilities / Injury Risks: {vulnerabilities}
- Schedule: 4 distinct weeks, {days_per_week} sessions per week, {session_mins} minutes per session.

Requirements:
1. Role-Specific Baseline:
   - Tailor all exercises and cues directly to the physical demands of {role_title} in {sport.title()}.
   - Every session must follow the 5-block structure:
     Block A: Dynamic Warmup & Role Prep
     Block B: Role Power / Speed / Agility
     Block C: Primary Compound Strength
     Block D: Role Accessory & Prehab
     Block E: Role Conditioning Finisher
2. Dynamic 4-Week Progression:
   - Week 1: Baseline Movement Quality & Volume Intro (Target RPE 6–7)
   - Week 2: Load & Volume Progression (Target RPE 7–8)
   - Week 3: Peak Role Output & Intensity (Target RPE 8–9, maximum intent and velocity)
   - Week 4: Role Technical Deload & Recovery (Target RPE 6, reduced volume, movement crispness)
   - DO NOT make all 4 weeks identical. Progress exercises, sets, reps, and cues across the 4 weeks!
3. Format:
   - Return ONLY valid JSON matching this schema:
{{
  "plan_title": "4-Week {sport.title()} {role_title} Baseline Training Plan",
  "plan_summary": "3-sentence summary of the 4-week role-specific baseline progression",
  "role_focus": "{role_title}",
  "weeks": [
    {{
      "week_number": 1,
      "week_theme": "Week 1: Baseline Movement Quality & Volume Intro",
      "target_rpe": "6–7",
      "focus_summary": "string",
      "sessions": [
        {{
          "day": 1,
          "session_name": "string",
          "type": "Strength|Speed|Agility|Plyometric",
          "duration_minutes": {session_mins},
          "target_rpe": "6–7",
          "rationale": "string connection to {role_title}",
          "warmup": ["dynamic drill 1", "dynamic drill 2", "dynamic drill 3"],
          "main_exercises": [
            {{
              "name": "Exercise Name",
              "sets": 3,
              "reps": "8-10",
              "intensity_level": "Moderate",
              "rest_seconds": 90,
              "coaching_cue": "Specific biomechanical cue for {role_title}",
              "targets_bottleneck": "explosive_capacity|strength|knee_stability|balance"
            }}
          ],
          "finisher": ["Conditioning finisher drill"],
          "cooldown": ["cooldown stretch 1", "cooldown stretch 2"],
          "recovery_notes": "string"
        }}
      ]
    }}
  ]
}}"""

        try:
            from .gemini_service import gemini_service
            plan = gemini_service.generate_json(
                prompt=prompt,
                system_instruction=(
                    "You are an elite sports scientist. Output ONLY valid JSON adhering to the provided schema. "
                    "Ensure 4 distinct progressive weeks tailored to the athlete's role."
                ),
                temperature=0.3,
            )
            if plan and "weeks" in plan and len(plan["weeks"]) >= 4:
                plan["_source"] = "gemini"
                plan["role_focus"] = role_title
                plan["recovery_protocol"] = self.generate_recovery_plan(athlete_profile, bottlenecks=bottlenecks)
                return plan
        except Exception:
            pass

        return None

    def generate_recovery_plan(
        self,
        athlete_profile: Dict[str, Any],
        doctor_check_in: Optional[Dict[str, Any]] = None,
        bottlenecks: Optional[List[Dict[str, Any]]] = None,
        recent_sessions_load: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """
        Generates doctor-grounded recovery pathways when doctor recommendations are submitted,
        or dynamic load-based recovery when no acute injury is checked in.
        """
        sport = athlete_profile.get("sport", "cricket")
        role = athlete_profile.get("primary_role") or athlete_profile.get("role", "athlete")
        top_focus = (
            bottlenecks[0].get("attribute", "").replace("_", " ")
            if bottlenecks
            else "general conditioning"
        )

        avg_rpe = recent_sessions_load.get("avg_rpe", 6.0) if recent_sessions_load else 6.0
        total_minutes = recent_sessions_load.get("total_minutes_week", 240) if recent_sessions_load else 240
        is_high_load = avg_rpe >= 7.5 or total_minutes >= 300

        habits = [
            "Sleep 8–9 hours per night with consistent sleep/wake times for CNS restoration.",
            f"Hydrate: 35 ml/kg bodyweight daily + 500 ml per training session for {sport.title()}.",
            "Post-workout window: 25–35g high-quality protein + complex carbohydrates within 45 min.",
        ]

        if is_high_load:
            habits.insert(
                0,
                "⚠️ High training strain detected (Average RPE ≥ 7.5) — prioritize active recovery and +30 min extra sleep.",
            )

        # IF DOCTOR RECOMMENDATION CHECK-IN PROVIDED
        if doctor_check_in and doctor_check_in.get("injury_name"):
            injury_name = doctor_check_in.get("injury_name", "Reported Injury")
            severity = doctor_check_in.get("severity", "Moderate")
            rest_days = max(int(doctor_check_in.get("doctor_rest_days", 3)), 0)
            rehab_days = max(int(doctor_check_in.get("doctor_rehab_days", 7)), 1)
            raw_exercises = doctor_check_in.get("doctor_exercises") or ""
            raw_restrictions = doctor_check_in.get("doctor_restrictions") or ""
            current_day = max(int(doctor_check_in.get("current_day_offset", 1)), 1)

            # Parse exercises into clean list
            if isinstance(raw_exercises, list):
                doc_exercises = raw_exercises
            elif raw_exercises:
                doc_exercises = [e.strip() for e in re.split(r"[\n,;]+", raw_exercises) if e.strip()]
            else:
                doc_exercises = ["Gentle isometric activation", "Pain-free passive range of motion"]

            # Parse restrictions into clean list
            if isinstance(raw_restrictions, list):
                doc_restrictions = raw_restrictions
            elif raw_restrictions:
                doc_restrictions = [r.strip() for r in re.split(r"[\n,;]+", raw_restrictions) if r.strip()]
            else:
                doc_restrictions = ["No heavy loading", "No explosive sprinting or high-impact jumping"]

            # Calculate Active Phase
            if current_day <= rest_days:
                active_phase_id = 1
                active_phase_name = "Phase 1: Doctor's Rest & Protection Protocol"
                days_left = (rest_days - current_day) + 1
            elif current_day <= (rest_days + rehab_days):
                active_phase_id = 2
                active_phase_name = "Phase 2: Doctor's Prescribed Rehab Protocol"
                days_left = ((rest_days + rehab_days) - current_day) + 1
            else:
                active_phase_id = 3
                active_phase_name = "Phase 3: Sportify Return-to-Play Progression"
                days_left = 0

            phases = [
                {
                    "phase_number": 1,
                    "phase_name": "Doctor's Rest & Protection Protocol",
                    "day_range": f"Days 1 – {rest_days}" if rest_days > 0 else "N/A (0 Rest Days Prescribed)",
                    "status": "active" if active_phase_id == 1 else ("completed" if active_phase_id > 1 else "upcoming"),
                    "focus": "Total tissue and joint protection, inflammation control, and restorative sleep.",
                    "protocol_items": [
                        "Complete joint offloading — avoid all shear forces and high-impact ground contacts.",
                        "Ice/cold application: 15–20 minutes every 3–4 hours for acute discomfort.",
                        "Target 9+ hours of sleep per night to maximize cellular tissue repair.",
                        "Zero aggressive stretching or forced range of motion.",
                    ],
                    "allowed_activities": [
                        "Diaphragmatic breathing (10 min daily)",
                        "Seated pain-free isometric contractions if pain < 2/10",
                    ],
                },
                {
                    "phase_number": 2,
                    "phase_name": "Doctor's Prescribed Rehab Protocol",
                    "day_range": f"Days {rest_days + 1} – {rest_days + rehab_days}",
                    "status": "active" if active_phase_id == 2 else ("completed" if active_phase_id > 2 else "upcoming"),
                    "focus": "Execute the doctor's exact rehabilitation exercises to restore pain-free functional range.",
                    "protocol_items": [
                        f"Perform doctor's prescribed rehab exercises daily: {', '.join(doc_exercises)}.",
                        "Maintain pain score strictly below 2/10 during and after exercise.",
                        "Gentle active blood-flow flushes (light resistance bands, low-resistance cycling).",
                        "Strictly adhere to doctor's restrictions: " + ", ".join(doc_restrictions),
                    ],
                    "doctor_exercises": doc_exercises,
                },
                {
                    "phase_number": 3,
                    "phase_name": "Sportify Return-to-Play Progression",
                    "day_range": f"Day {rest_days + rehab_days + 1} Onward",
                    "status": "active" if active_phase_id == 3 else "upcoming",
                    "focus": "Platform picks up recovery: progressive eccentric loading, sport-specific movement patterns, and match readiness.",
                    "protocol_items": [
                        "Progressive eccentric loading to rebuild muscle tensile tolerance.",
                        f"Graduated sport-specific movement drills tailored for {role.replace('_', ' ').title()}.",
                        "Velocity progression: 50% -> 75% -> 90% -> 100% linear sprint speed before match clearance.",
                        "Prehab integration: 10 minutes prior to all training sessions.",
                    ],
                    "return_to_play_milestones": [
                        "Full pain-free active range of motion equal to uninjured limb (bilateral symmetry > 90%).",
                        "Passing role-specific deceleration and change-of-direction test with zero guarding.",
                        "Completion of 3 consecutive full-intensity training sessions without post-session swelling.",
                    ],
                },
            ]

            return {
                "has_doctor_guidance": True,
                "injury_details": {
                    "injury_name": injury_name,
                    "severity": severity,
                    "current_day": current_day,
                    "doctor_rest_days": rest_days,
                    "doctor_rehab_days": rehab_days,
                    "total_medical_days": rest_days + rehab_days,
                    "active_phase_id": active_phase_id,
                    "active_phase_name": active_phase_name,
                    "days_remaining_in_phase": days_left,
                },
                "doctor_prescribed_exercises": doc_exercises,
                "doctor_red_lines": doc_restrictions,
                "phases": phases,
                "daily_habits": habits,
                "load_context": {
                    "avg_recent_rpe": avg_rpe,
                    "total_weekly_minutes": total_minutes,
                    "strain_status": "Rehabilitation Protocol Active",
                },
            }

        # DEFAULT: NO ACUTE INJURY CHECKED IN YET
        active_recovery = [
            {
                "name": "Targeted Soft Tissue Release",
                "duration_minutes": 15,
                "exercises": [
                    "Thoracic spine roller extension (2 min)",
                    "Hamstring and glute foam rolling (2 min each side)",
                    "IT band and quad release (2 min each side)",
                    "Calf and Achilles soft rolling (2 min each side)",
                ],
                "when": "Post-session or evening before bed",
            },
            {
                "name": f"Dynamic Mobility Flow ({top_focus.title()} Focus)",
                "duration_minutes": 20,
                "exercises": [
                    "90/90 hip stretch with forward hinge (90s each side)",
                    "World's greatest stretch with thoracic reach (5 reps each side)",
                    "Deep goblet squat hold with breath expansion (60s hold)",
                    "Cat-cow with spinal segmentation (10 cycles)",
                ],
                "when": "On scheduled recovery / rest days",
            },
        ]

        return {
            "has_doctor_guidance": False,
            "load_context": {
                "avg_recent_rpe": avg_rpe,
                "total_weekly_minutes": total_minutes,
                "strain_status": "High Strain" if is_high_load else "Optimal Adaptation",
            },
            "daily_habits": habits,
            "active_recovery_sessions": active_recovery,
            "weekly_recovery_schedule": {
                "day_1": "Post-workout 10-min soft tissue flush + hydration",
                "day_2": "Active recovery: 20-min low-intensity bike or swim (Zone 1)",
                "day_3": f"Mobility flow targeting {top_focus} restrictions",
                "day_4": "Full nervous system rest + contrast therapy or gentle yoga",
            },
            "injury_prevention_focus": (
                f"Given your priority in {top_focus}, complete 5 minutes of targeted activation "
                f"and prehab before every high-intensity {role.replace('_', ' ')} session."
            ),
        }


plan_generator = PlanGenerator()
