export interface TaxonomySubRole {
  title: string;
  description: string;
  primary_movement_patterns?: string[];
  attribute_weights?: Record<string, number>;
  benchmarks?: Record<string, Record<string, number>>;
}

export interface TaxonomyRole {
  title: string;
  description: string;
  sub_roles: Record<string, TaxonomySubRole>;
}

export interface TaxonomyDiscipline {
  id: string;
  name: string;
}

export interface TaxonomySport {
  name: string;
  emoji: string;
  disciplines: TaxonomyDiscipline[];
  roles: Record<string, TaxonomyRole>;
}

export interface DevelopmentObjective {
  id: string;
  name: string;
  title?: string;
  category: string;
  description: string;
  targeted_attributes: string[];
  weight_boost: number;
}

export const DEFAULT_SPORTS_TAXONOMY: Record<string, TaxonomySport> = {
  cricket: {
    name: 'Cricket',
    emoji: '🏏',
    disciplines: [
      { id: 't20', name: 'T20 Cricket' },
      { id: 'one_day', name: 'One Day (50-over)' },
      { id: 'multi_day', name: 'Multi-Day / Test' },
    ],
    roles: {
      batsman: {
        title: 'Batsman',
        description: 'Specialist batter responsible for building innings, executing attacking strokes, and maintaining match tempo.',
        sub_roles: {
          opening_batsman: {
            title: 'Opening Batsman',
            description: 'Faces the new ball against high pace and swing; requires razor-sharp reactive footwork, front-knee stability, and balanced head position.',
            primary_movement_patterns: ['forward_press', 'defensive_stride', 'cover_drive', 'pull_shot'],
          },
          middle_order_batsman: {
            title: 'Middle-Order Batsman',
            description: 'Constructs partnerships through middle overs; requires agile running between wickets, rotational drive, and stroke versatility.',
            primary_movement_patterns: ['drive_mechanics', 'rotational_sweep', 'quick_running_deceleration'],
          },
          finisher: {
            title: 'Power Finisher',
            description: 'Executes boundary-scoring and power hitting in death overs; relies on maximal explosive hip drive and rotational force generation.',
            primary_movement_patterns: ['rotational_power_clearing', 'explosive_stance_shift', 'launch_extension'],
          },
        },
      },
      bowler: {
        title: 'Bowler',
        description: 'Specialist bowler delivering pace, seam, or spin to dismiss opposing batters.',
        sub_roles: {
          fast_bowler: {
            title: 'Pace / Fast Bowler',
            description: 'High-impact delivery stride and explosive run-up; demands elite knee deceleration stability, braced front-leg extension, and trunk anti-rotation.',
            primary_movement_patterns: ['approach_sprint', 'bound_gather', 'delivery_stride_brace', 'follow_through_deceleration'],
          },
          spin_bowler: {
            title: 'Spin Bowler (Wrist/Finger)',
            description: 'Generates revolutions and flight through thoracic rotation, shoulder pivot, and dynamic balance at the crease.',
            primary_movement_patterns: ['rotational_pivot', 'crease_balance', 'upper_body_extension'],
          },
        },
      },
      all_rounder: {
        title: 'All-Rounder',
        description: 'Dual-threat athlete contributing with both bat and ball under varying match demands.',
        sub_roles: {
          batting_all_rounder: {
            title: 'Batting All-Rounder',
            description: 'Primary batter with reliable bowling utility; requires high all-round structural symmetry and endurance balance.',
            primary_movement_patterns: ['batting_drives', 'medium_pace_bowling', 'fielding_agility'],
          },
          bowling_all_rounder: {
            title: 'Bowling All-Rounder',
            description: 'Primary strike bowler with lower-order power batting ability.',
            primary_movement_patterns: ['fast_bowling_delivery', 'power_hitting', 'boundary_fielding'],
          },
        },
      },
      wicket_keeper: {
        title: 'Wicketkeeper',
        description: 'Stands behind stumps for 20 to 100+ overs in deep crouch stance; requires elite lateral balance, hip-ankle mobility, and reactive agility.',
        sub_roles: {
          wicketkeeper_batsman: {
            title: 'Wicketkeeper-Batsman',
            description: 'Dual specialist handling both glovework endurance and high-output batting.',
            primary_movement_patterns: ['squat_crouch_hold', 'lateral_leg_side_slide', 'standing_up_reflex', 'batting_stroke_execution'],
          },
        },
      },
    },
  },
  football: {
    name: 'Football (Soccer)',
    emoji: '⚽',
    disciplines: [
      { id: 'association_football', name: '11v11 Outdoor' },
      { id: 'futsal', name: 'Futsal / Small-Sided' },
    ],
    roles: {
      striker: {
        title: 'Striker',
        description: 'Central attacking player focused on short-burst acceleration, finishing under pressure, and aerial challenge.',
        sub_roles: {
          center_forward: {
            title: 'Center Forward',
            description: 'Combines physical hold-up play, aerial duels, and sharp box movement.',
            primary_movement_patterns: ['acceleration', 'jumping', 'change_of_direction', 'shooting_mechanics'],
          },
        },
      },
      winger: {
        title: 'Winger / Wide Forward',
        description: 'Wide attacking player relying on top-end sprint speed, multi-directional cutting, and crossing delivery.',
        sub_roles: {
          traditional_winger: {
            title: 'Wide Flank Specialist',
            description: 'Beats defenders on the outside and delivers crosses with speed.',
            primary_movement_patterns: ['sprinting', 'dribbling', 'crossing', 'change_of_direction'],
          },
        },
      },
      central_midfielder: {
        title: 'Central Midfielder',
        description: 'Engine room player covering extensive distance with repeated decelerations, directional turns, and passing distribution.',
        sub_roles: {
          box_to_box: {
            title: 'Box-to-Box Midfielder',
            description: 'Connects defense and attack with continuous transition running and duel winning.',
            primary_movement_patterns: ['turning', 'pressing', 'passing', 'positional_movement'],
          },
        },
      },
      centre_back: {
        title: 'Centre Back',
        description: 'Defensive anchor winning aerial duels, executing physical tackles, and organising backline structure.',
        sub_roles: {
          central_defender: {
            title: 'Central Defender',
            description: 'Dominates aerial space and maintains balanced defensive jockeying.',
            primary_movement_patterns: ['jumping', 'tackling', 'heading', 'defensive_positioning'],
          },
        },
      },
      goalkeeper: {
        title: 'Goalkeeper',
        description: 'Shot stopper requiring explosive lateral diving power, extreme joint reach, and set-position balance.',
        sub_roles: {
          shot_stopper: {
            title: 'Shot Stopper',
            description: 'Explosive reaction and lateral diving power in the box.',
            primary_movement_patterns: ['diving', 'jumping', 'footwork', 'distribution'],
          },
        },
      },
    },
  },
  basketball: {
    name: 'Basketball',
    emoji: '🏀',
    disciplines: [
      { id: 'standard_5v5', name: 'Full Court 5v5' },
      { id: '3x3', name: '3x3 Half Court' },
    ],
    roles: {
      point_guard: {
        title: 'Point Guard',
        description: 'Floor general directing offense with elite rapid change of direction and symmetrical lateral footwork.',
        sub_roles: {
          playmaker_pg: {
            title: 'Playmaker Point Guard',
            description: 'Orchestrates offense with rapid directional changes and vision.',
            primary_movement_patterns: ['change_of_direction', 'acceleration', 'defensive_slide', 'ball_handling'],
          },
        },
      },
      shooting_guard: {
        title: 'Shooting Guard',
        description: 'Versatile perimeter scorer attacking off the catch and drive with balanced jump-shot posture.',
        sub_roles: {
          perimeter_scorer: {
            title: 'Perimeter Scorer',
            description: 'Off-ball cutting, pull-up jumpers, and transition scoring.',
            primary_movement_patterns: ['cutting', 'off_ball_movement', 'catch_and_shoot', 'pull_up_jumper'],
          },
        },
      },
      small_forward: {
        title: 'Small Forward',
        description: 'Versatile wing athlete handling multi-positional defense and attacking transition lanes.',
        sub_roles: {
          wing_slasher: {
            title: 'Two-Way Wing',
            description: 'Defends multiple positions and drives with power.',
            primary_movement_patterns: ['driving', 'transition', 'defensive_switching'],
          },
        },
      },
      power_forward: {
        title: 'Power Forward',
        description: 'High-impact interior player battling for rebounds and screen-roll contact.',
        sub_roles: {
          post_rebounder: {
            title: 'Post & Rebound Forward',
            description: 'Absorbs contact, anchors screens, and jumps for offensive/defensive boards.',
            primary_movement_patterns: ['post_play', 'rebounding', 'screen_setting'],
          },
        },
      },
      center: {
        title: 'Center',
        description: 'Rim protector and paint anchor maintaining verticality and contact resilience.',
        sub_roles: {
          rim_anchor: {
            title: 'Rim Anchor',
            description: 'Protects the basket with verticality, post defense, and glass control.',
            primary_movement_patterns: ['rim_protection', 'post_defense', 'pick_and_roll'],
          },
        },
      },
    },
  },
  athletics: {
    name: 'Athletics / Track & Field',
    emoji: '🏃',
    disciplines: [
      { id: 'track', name: 'Track Events' },
      { id: 'field', name: 'Field Events' },
    ],
    roles: {
      sprinter: {
        title: 'Sprinter',
        description: 'Short-distance maximal acceleration and top-speed specialist.',
        sub_roles: {
          short_sprint: {
            title: '100m / 200m Specialist',
            description: 'Block start explosion, drive phase angle, and upright maximal velocity mechanics.',
            primary_movement_patterns: ['acceleration_mechanics', 'top_speed_mechanics', 'block_start'],
          },
        },
      },
      middle_distance: {
        title: 'Middle Distance Runner',
        description: '800m–1500m runner balancing stride economy, mechanical symmetry, and finishing speed.',
        sub_roles: {
          middle_track: {
            title: '800m - 1500m Runner',
            description: 'Pace rhythm, sustained knee durability, and efficient hip stride extension.',
            primary_movement_patterns: ['race_pace_mechanics', 'kick_finishing'],
          },
        },
      },
      jumper: {
        title: 'Jumper',
        description: 'High / Long / Triple jump specialist converting approach velocity into vertical/horizontal takeoff impulse.',
        sub_roles: {
          long_high_jump: {
            title: 'Takeoff & Flight Jumper',
            description: 'High-impact single-leg plant and explosive aerial trajectory.',
            primary_movement_patterns: ['approach_run', 'takeoff_mechanics', 'landing'],
          },
        },
      },
      thrower: {
        title: 'Thrower',
        description: 'Shot put, discus, or javelin athlete generating rotational power from ground up through trunk extension.',
        sub_roles: {
          rotational_throw: {
            title: 'Rotational & Power Thrower',
            description: 'Transfers rotational force through powerful trunk posture and hip drive.',
            primary_movement_patterns: ['rotational_power', 'linear_drive', 'release_mechanics'],
          },
        },
      },
    },
  },
};

export const DEFAULT_DEVELOPMENT_OBJECTIVES: Record<string, DevelopmentObjective> = {
  strength: {
    id: 'strength',
    name: 'Build Strength',
    title: 'Build Strength',
    category: 'physical_capacity',
    description: 'Develop foundational compound force production and structural integrity.',
    targeted_attributes: ['knee_stability', 'upper_body_posture'],
    weight_boost: 0.15,
  },
  explosiveness: {
    id: 'explosiveness',
    name: 'Develop Explosiveness & Power',
    title: 'Develop Explosiveness & Power',
    category: 'physical_capacity',
    description: 'Maximize rate of force development and peak velocity in short bursts.',
    targeted_attributes: ['explosive_capacity'],
    weight_boost: 0.2,
  },
  acceleration: {
    id: 'acceleration',
    name: 'Improve Acceleration & Speed',
    title: 'Improve Acceleration & Speed',
    category: 'physical_capacity',
    description: 'Sharpen forward drive mechanics and first-step quickness.',
    targeted_attributes: ['explosive_capacity', 'movement_symmetry'],
    weight_boost: 0.15,
  },
  mobility: {
    id: 'mobility',
    name: 'Enhance Mobility & Flexibility',
    title: 'Enhance Mobility & Flexibility',
    category: 'movement_quality',
    description: 'Expand active functional range of motion in hips, spine, and ankles.',
    targeted_attributes: ['hip_mobility', 'flexibility'],
    weight_boost: 0.15,
  },
  movement_efficiency: {
    id: 'movement_efficiency',
    name: 'Movement Efficiency & Balance',
    title: 'Movement Efficiency & Balance',
    category: 'movement_quality',
    description: 'Reinforce center of mass control, dynamic balance, and smooth kinetic chain flow.',
    targeted_attributes: ['balance', 'movement_symmetry'],
    weight_boost: 0.15,
  },
  technical_consistency: {
    id: 'technical_consistency',
    name: 'Technical & Postural Consistency',
    title: 'Technical & Postural Consistency',
    category: 'movement_quality',
    description: 'Maintain stable execution mechanics under repeated loading.',
    targeted_attributes: ['upper_body_posture', 'balance'],
    weight_boost: 0.15,
  },
  injury_risk_reduction: {
    id: 'injury_risk_reduction',
    name: 'Injury-Risk Reduction',
    title: 'Injury-Risk Reduction',
    category: 'resilience',
    description: 'Strengthen joint stabilizers, address bilateral asymmetries, and reinforce landing control.',
    targeted_attributes: ['knee_stability', 'movement_symmetry'],
    weight_boost: 0.2,
  },
  endurance: {
    id: 'endurance',
    name: 'Endurance & Work Capacity',
    title: 'Endurance & Work Capacity',
    category: 'physical_capacity',
    description: 'Build high volume tolerance while maintaining clean movement mechanics.',
    targeted_attributes: ['knee_stability', 'upper_body_posture'],
    weight_boost: 0.1,
  },
};
