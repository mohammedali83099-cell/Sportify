from typing import Dict, List, Optional, Any
from .base import MovementProtocol, MovementAnalysisResult
from .squat_analyzer import SquatAnalyzer
from .jump_analyzer import VerticalJumpAnalyzer
from .cricket_batting_analyzer import CricketBattingAnalyzer
from .football_strike_analyzer import FootballStrikeAnalyzer
from .basketball_shot_analyzer import BasketballJumpShotAnalyzer
from .sprint_mechanics_analyzer import SprintMechanicsAnalyzer


class ProtocolRegistry:
    """
    Registry of validated activity-specific movement protocols.
    Ensures that appropriate analysis models are applied to the correct movements
    and rejects unsupported or mismatched activities.
    """

    def __init__(self):
        self._protocols: Dict[str, MovementProtocol] = {}
        self._aliases: Dict[str, str] = {}
        self._metadata: Dict[str, Dict[str, Any]] = {}
        self._register_default_protocols()

    def register(
        self,
        protocol: MovementProtocol,
        aliases: Optional[List[str]] = None,
        category: str = "foundational",
        sport: str = "all",
        description: str = "",
        role_relevance: Optional[Dict[str, str]] = None,
    ):
        pid = protocol.protocol_id.lower()
        self._protocols[pid] = protocol
        self._aliases[pid] = pid
        self._metadata[pid] = {
            "category": category,
            "sport": sport,
            "description": description,
            "role_relevance": role_relevance or {},
        }
        if aliases:
            for alias in aliases:
                self._aliases[alias.lower()] = pid

    def _register_default_protocols(self):
        self.register(
            SquatAnalyzer(),
            aliases=["squat", "bodyweight_squat", "goblet_squat", "overhead_squat"],
            category="foundational",
            sport="all",
            description="Foundational bilateral lower-body assessment evaluating hip mobility, knee valgus/varus stability, and torso inclination.",
            role_relevance={
                "default": "Evaluates fundamental bilateral kinetic chain integrity, hip-to-ankle mobility, and eccentric knee stability required for all field sports.",
                "football": "Assesses eccentric quad force absorption and bilateral hip mobility needed for change of direction and deceleration.",
                "basketball": "Evaluates foundational hip sink and knee alignment for defensive sliding and jumping mechanics.",
                "cricket": "Assesses lower-body power base and hip mobility for bowling brace mechanics and batting stance depth.",
                "athletics": "Tests foundational hip and knee range of motion for force production out of the blocks.",
            },
        )
        self.register(
            VerticalJumpAnalyzer(),
            aliases=["jump", "vertical_jump", "countermovement_jump", "cmj"],
            category="foundational",
            sport="all",
            description="Countermovement jump test evaluating triple-extension explosiveness, peak takeoff velocity, and landing force absorption.",
            role_relevance={
                "default": "Measures explosive rate of force development (RFD) and eccentric deceleration landing mechanics.",
                "basketball": "Assesses maximum vertical leap elevation, quick-spring explosiveness for rebounding, and landing knee stability.",
                "football": "Measures aerial duel power and reactive deceleration balance when contesting headers.",
                "cricket": "Evaluates fast bowler gather-to-delivery stride explosiveness and shock attenuation.",
                "athletics": "Measures lower-limb stiffness and reactive stretch-shortening cycle (SSC) power.",
            },
        )
        self.register(
            CricketBattingAnalyzer(),
            aliases=[
                "cricket_batting",
                "cricket_batting_drive",
                "cover_drive",
                "straight_drive",
                "batting_drive",
            ],
            category="sport_specific",
            sport="cricket",
            description="Biomechanical analysis of cricket batting mechanics: stance stability, head position over contact point, lead elbow path, front knee brace, and rotational weight transfer.",
            role_relevance={
                "batsman": "Directly evaluates technical weight transfer, head position over contact zone, lead elbow guidance, and base stability.",
                "default": "Evaluates sport-specific striking posture, balance maintenance, and kinetic chain sequencing during batting execution.",
            },
        )
        self.register(
            FootballStrikeAnalyzer(),
            aliases=[
                "football_strike",
                "soccer_kick",
                "shooting_mechanics",
                "football_shooting",
                "instep_drive",
                "football_kick",
                "penalty_kick",
            ],
            category="sport_specific",
            sport="football",
            description="Kinematic assessment of soccer ball-striking mechanics: plant-leg stability, striking hip extension whip, torso angle, and deceleration balance.",
            role_relevance={
                "striker": "Evaluates ball-striking power transfer, plant-foot knee stability under load, and torso control over the ball.",
                "winger": "Assesses ball-striking and delivery whip mechanics, plant-leg deceleration, and rotational balance.",
                "midfielder": "Evaluates passing and ball-striking consistency with optimal plant knee flex angle.",
                "defender": "Assesses clearance ball-striking stability and single-leg deceleration control.",
                "default": "Evaluates plant-leg knee stability, hip whip velocity, and torso posture during ball striking.",
            },
        )
        self.register(
            BasketballJumpShotAnalyzer(),
            aliases=[
                "basketball_jump_shot",
                "basketball_shot",
                "jump_shot",
                "shooting_form",
                "basketball_shooting",
                "free_throw",
            ],
            category="sport_specific",
            sport="basketball",
            description="Assessment of basketball shooting and elevation mechanics: vertical jump elevation, shooting elbow set and release extension, torso verticality, and landing knee alignment.",
            role_relevance={
                "point_guard": "Assesses shooting verticality, high release extension point, and balanced landing for perimeter scoring.",
                "shooting_guard": "Evaluates shooting release mechanics, vertical elevation, and elbow alignment.",
                "small_forward": "Evaluates mid-range shooting stability and consistent release arc mechanics.",
                "default": "Evaluates vertical jump elevation, elbow alignment at release, and symmetrical landing stability.",
            },
        )
        self.register(
            SprintMechanicsAnalyzer(),
            aliases=[
                "sprint_mechanics",
                "sprint_acceleration",
                "sprint",
                "running_mechanics",
                "athletics_sprint",
                "100m_sprint",
                "acceleration_run",
            ],
            category="sport_specific",
            sport="athletics",
            description="Athletics sprinting and acceleration mechanics: acceleration torso lean angle, high knee drive elevation, hip extension, and stride symmetry.",
            role_relevance={
                "sprinter": "Measures forward acceleration angle, knee punch drive, and hip extension power.",
                "hurdler": "Evaluates knee clearance mechanics and bilateral hip extension drive symmetry.",
                "default": "Evaluates linear acceleration posture, forward propulsion angles, and stride biomechanics.",
            },
        )

    def get_protocol(self, protocol_name_or_alias: Optional[str]) -> Optional[MovementProtocol]:
        if not protocol_name_or_alias:
            return None
        norm_key = (
            protocol_name_or_alias.lower()
            .replace(" ", "_")
            .replace("-", "_")
            .strip()
        )
        canonical_id = self._aliases.get(norm_key)
        if canonical_id:
            return self._protocols.get(canonical_id)
        return None

    def get_protocol_metadata(self, protocol_id: str) -> Dict[str, Any]:
        canonical_id = self._aliases.get(protocol_id.lower(), protocol_id.lower())
        return self._metadata.get(canonical_id, {})

    def list_supported_protocols(self) -> List[Dict[str, Any]]:
        return [
            {
                "protocol_id": p.protocol_id,
                "name": p.name,
                "required_landmarks_count": len(p.required_landmarks),
                "min_usable_frames": p.min_usable_frames,
                "category": self._metadata.get(p.protocol_id.lower(), {}).get("category", "foundational"),
                "sport": self._metadata.get(p.protocol_id.lower(), {}).get("sport", "all"),
                "description": self._metadata.get(p.protocol_id.lower(), {}).get("description", ""),
                "role_relevance": self._metadata.get(p.protocol_id.lower(), {}).get("role_relevance", {}),
            }
            for p in self._protocols.values()
        ]

    def is_supported(self, protocol_name_or_alias: str) -> bool:
        return self.get_protocol(protocol_name_or_alias) is not None


protocol_registry = ProtocolRegistry()

