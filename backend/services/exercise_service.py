import json
import os
from typing import Dict, List, Optional, Any


class ExerciseService:
    """
    Ground-truth catalog and prescription service for exercises.
    Selects structured exercises based on development priorities,
    athlete experience level, available equipment, and sport demands.
    """

    _instance = None
    _exercises: List[Dict[str, Any]] = []
    _by_id: Dict[str, Dict[str, Any]] = {}
    _by_attribute: Dict[str, List[Dict[str, Any]]] = {}
    _by_category: Dict[str, List[Dict[str, Any]]] = {}

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(ExerciseService, cls).__new__(cls)
            cls._instance._load_library()
        return cls._instance

    def _load_library(self):
        base_dir = os.path.dirname(os.path.dirname(__file__))
        path = os.path.join(base_dir, "data", "exercise_library.json")
        try:
            with open(path, "r", encoding="utf-8") as f:
                self._exercises = json.load(f)
        except Exception:
            self._exercises = []

        self._by_id = {ex["id"]: ex for ex in self._exercises}
        self._by_attribute = {}
        self._by_category = {}

        for ex in self._exercises:
            cat = ex.get("category", "general")
            self._by_category.setdefault(cat, []).append(ex)

            for attr in ex.get("targets_attributes", []):
                self._by_attribute.setdefault(attr, []).append(ex)

    @property
    def all_exercises(self) -> List[Dict[str, Any]]:
        return self._exercises

    def get_by_id(self, exercise_id: str) -> Optional[Dict[str, Any]]:
        return self._by_id.get(exercise_id)

    def get_exercises_for_attribute(
        self,
        attribute: str,
        difficulty: Optional[str] = None,
        category: Optional[str] = None,
        equipment: Optional[List[str]] = None,
        limit: int = 5,
    ) -> List[Dict[str, Any]]:
        """
        Filter exercises from the catalog matching a target biomechanical attribute,
        difficulty level, and equipment constraint.
        """
        pool = self._by_attribute.get(attribute, [])
        if not pool:
            # Fallback to category if attribute not explicitly matched
            pool = self._by_category.get(category, self._exercises) if category else self._exercises

        filtered = []
        for ex in pool:
            if category and ex.get("category") != category and category != "all":
                continue
            if difficulty and difficulty != "all":
                ex_diff = ex.get("difficulty", "intermediate")
                # Beginner can do beginner; Intermediate can do beginner/intermediate; Advanced can do all
                if difficulty == "beginner" and ex_diff == "advanced":
                    continue
                if difficulty == "intermediate" and ex_diff == "advanced":
                    continue
            if equipment and equipment != ["all"]:
                ex_equip = ex.get("equipment", ["bodyweight"])
                # If exercise requires equipment not in available set
                if not any(eq in equipment or eq == "bodyweight" for eq in ex_equip):
                    continue
            filtered.append(ex)

        return filtered[:limit] if limit else filtered

    def build_session_exercises(
        self,
        session_type: str,
        primary_bottlenecks: List[Dict[str, Any]],
        experience_level: str = "intermediate",
        session_duration_minutes: int = 60,
        athlete_context: Optional[Dict[str, Any]] = None,
        week_number: int = 1,
    ) -> Dict[str, Any]:
        """
        Constructs a structured session (warmup, main exercises, cooldown)
        drawn strictly from the exercise library catalog, dynamically periodized
        across 4 progressive weeks.
        """
        target_attrs = [b.get("attribute") for b in primary_bottlenecks if b.get("attribute")]
        if not target_attrs:
            target_attrs = ["explosive_capacity", "knee_stability"]

        # Number of main exercises based on session duration
        num_main = 4 if session_duration_minutes >= 60 else 3 if session_duration_minutes >= 45 else 2

        # Periodization parameters based on week_number (1 to 4)
        if week_number == 1:
            # Phase 1: Foundation & Mechanics
            def_sets = 3
            def_reps = "10-12"
            def_intensity = "Medium (RPE 6-7)"
            def_rest = 90
            week_cue_prefix = "Focus on controlled tempo & mechanics: "
        elif week_number == 2:
            # Phase 2: Load Accumulation & Capacity
            def_sets = 4 if experience_level == "advanced" else 3
            def_reps = "8-10"
            def_intensity = "Medium-High (RPE 7-8)"
            def_rest = 90
            week_cue_prefix = "Sustain tension through full ROM: "
        elif week_number == 3:
            # Phase 3: Peak Intensity & Power
            def_sets = 4
            def_reps = "5-6"
            def_intensity = "High / Peak (RPE 8-9)"
            def_rest = 120
            week_cue_prefix = "Maximal explosive intent on each rep: "
        else:
            # Phase 4: Deload, Consolidation & Re-Testing
            def_sets = 2
            def_reps = "6-8"
            def_intensity = "Deload & Precision (RPE 5-6)"
            def_rest = 60
            week_cue_prefix = "Crisp technical execution & recovery: "

        main_exercises = []
        used_ids = set()

        # 1. Fill 60%+ of main exercises from primary development bottlenecks
        # Use week-based rotation offset so each week gets distinct exercises
        for attr in target_attrs:
            matches = self.get_exercises_for_attribute(
                attribute=attr,
                difficulty=experience_level,
                limit=8,
            )
            if matches:
                offset = (week_number - 1) % len(matches)
                rotated_matches = matches[offset:] + matches[:offset]
            else:
                rotated_matches = matches

            for ex in rotated_matches:
                if ex["id"] not in used_ids and len(main_exercises) < num_main:
                    used_ids.add(ex["id"])
                    raw_cue = ex.get("coaching_cues", ["Maintain proper form"])[0]
                    cue = f"{week_cue_prefix}{raw_cue}"
                    main_exercises.append(
                        {
                            "id": ex["id"],
                            "name": ex["name"],
                            "sets": def_sets,
                            "reps": def_reps,
                            "intensity_level": def_intensity,
                            "rest_seconds": def_rest,
                            "coaching_cue": cue,
                            "targets_bottleneck": attr,
                            "primary_muscles": ex.get("primary_muscles", []),
                            "equipment": ex.get("equipment", ["bodyweight"]),
                        }
                    )

        # 2. If main exercises still has slots, fill from session type category with rotation
        cat_map = {
            "Strength": "strength",
            "Speed": "speed",
            "Agility": "agility",
            "Plyometric": "plyometrics",
            "Mobility": "mobility",
            "Recovery": "recovery",
        }
        fallback_cat = cat_map.get(session_type, "strength")
        pool = self._by_category.get(fallback_cat, self._exercises)
        if pool:
            cat_offset = ((week_number - 1) * 2) % len(pool)
            rotated_pool = pool[cat_offset:] + pool[:cat_offset]
        else:
            rotated_pool = []

        for ex in rotated_pool:
            if ex["id"] not in used_ids and len(main_exercises) < num_main:
                used_ids.add(ex["id"])
                raw_cue = ex.get("coaching_cues", ["Focus on control"])[0]
                cue = f"{week_cue_prefix}{raw_cue}"
                target_attr = ex.get("targets_attributes", ["general"])[0]
                main_exercises.append(
                    {
                        "id": ex["id"],
                        "name": ex["name"],
                        "sets": def_sets,
                        "reps": def_reps,
                        "intensity_level": def_intensity,
                        "rest_seconds": def_rest,
                        "coaching_cue": cue,
                        "targets_bottleneck": target_attr,
                        "primary_muscles": ex.get("primary_muscles", []),
                        "equipment": ex.get("equipment", ["bodyweight"]),
                    }
                )

        # 3. Dynamic warmups and cooldowns rotating across weeks
        mobility_pool = self._by_category.get("mobility", [])
        if mobility_pool:
            mob_len = len(mobility_pool)
            w_start = ((week_number - 1) * 2) % mob_len
            warmup_items = [
                mobility_pool[(w_start + i) % mob_len]["name"] + " (10-12 reps)"
                for i in range(min(3, mob_len))
            ]
            c_start = (w_start + 3) % mob_len
            cooldown_items = [
                mobility_pool[(c_start + i) % mob_len]["name"] + " (60s hold)"
                for i in range(min(2, mob_len))
            ]
        else:
            warmup_items = [
                "5 min light dynamic jog",
                "Leg swings (15 each side)",
                "Hip circles (10 each side)",
            ]
            cooldown_items = [
                "Full body static stretching (5 min)",
                "Deep diaphragmatic breathing (3 min)",
            ]

        return {
            "warmup": warmup_items,
            "main_exercises": main_exercises,
            "cooldown": cooldown_items,
        }


exercise_service = ExerciseService()
