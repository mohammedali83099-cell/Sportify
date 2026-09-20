/**
 * ROLE ASSESSMENT MATRIX
 * Unified mapping of athlete sport & role taxonomy to supported capabilities.
 * Uses exact role IDs (NO fuzzy matching or `.includes()` heuristics).
 *
 * Supported Protocols in Backend:
 * - cricket_batting
 * - football_strike
 * - basketball_jump_shot
 * - sprint_mechanics
 * - squat
 * - vertical_jump
 */

export const ROLE_ASSESSMENT_MATRIX = {
  // ─── CRICKET ─────────────────────────────────────────────────────────────
  cricket: {
    batsman: {
      roleTitle: 'Cricket Batsman',
      pageTitle: 'Batting Mechanics',
      recommendedProtocolId: 'cricket_batting',
      capabilityStatus: 'available', // 'available' | 'foundation' | 'coming_soon'
      shortPurpose: 'Stance stability, head-over-knee balance, lead elbow guidance, and swing flow.',
      roleReason: 'Stable base and head alignment anchor consistent stroke execution against pace and spin.',
      foundationalChoices: ['squat', 'vertical_jump'],
      notice: null,
    },

    bowler: {
      roleTitle: 'Cricket Bowler',
      pageTitle: 'Bowling Power & Deceleration Baseline',
      recommendedProtocolId: 'vertical_jump',
      capabilityStatus: 'foundation',
      overrideProtocolName: 'Bowling Power Baseline',
      shortPurpose: 'Lower-body force production and delivery landing deceleration.',
      roleReason: 'Absorbs 8–10x bodyweight delivery stride impact.',
      foundationalChoices: ['squat'],
      notice: {
        type: 'info',
        title: 'Bowling delivery analysis coming soon',
        description: 'Release speed and delivery stride analysis in development. Complete power baseline below.',
      },
    },

    all_rounder: {
      roleTitle: 'Cricket All-Rounder',
      pageTitle: 'All-Rounder Kinetic Assessment',
      recommendedProtocolId: 'cricket_batting',
      capabilityStatus: 'available',
      shortPurpose: 'Batting mechanics or bowling power baseline.',
      roleReason: 'Demands front-foot stability and explosive gather deceleration.',
      allowFocusChoice: true,
      focusChoices: [
        { protocolId: 'cricket_batting', label: 'Batting Mechanics Focus', status: 'available' },
        { protocolId: 'vertical_jump', label: 'Bowling Power Baseline Focus', status: 'foundation' },
      ],
      foundationalChoices: ['squat', 'vertical_jump'],
      notice: {
        type: 'info',
        title: 'Choose training focus',
        description: 'Select batting mechanics or lower-body bowling power baseline.',
      },
    },

    wicket_keeper: {
      roleTitle: 'Wicketkeeper',
      pageTitle: 'Wicketkeeper Crouch Mobility & Base',
      recommendedProtocolId: 'squat',
      capabilityStatus: 'foundation',
      overrideProtocolName: 'Crouch Mobility & Knee Baseline',
      shortPurpose: 'Deep hip-to-ankle flexion and eccentric knee stability.',
      roleReason: 'Crouch stance demands knee tracking and hip range.',
      foundationalChoices: ['vertical_jump'],
      notice: {
        type: 'info',
        title: 'Glovework analysis coming soon',
        description: 'Reaction speed and lateral diving in development. Complete crouch baseline below.',
      },
    },
  },

  // ─── FOOTBALL ────────────────────────────────────────────────────────────
  football: {
    striker: {
      roleTitle: 'Football Striker',
      pageTitle: 'Ball-Striking & Finishing Mechanics',
      recommendedProtocolId: 'football_strike',
      capabilityStatus: 'available',
      shortPurpose: 'Plant stability, hip whip rotation, and torso control over the ball.',
      roleReason: 'Plant-knee deceleration and forward torso lean keep strikes controlled and accurate.',
      foundationalChoices: ['vertical_jump', 'squat'],
      notice: null,
    },

    winger: {
      roleTitle: 'Winger / Wide Forward',
      pageTitle: 'Ball-Striking & Delivery Mechanics',
      recommendedProtocolId: 'football_strike',
      capabilityStatus: 'available',
      overrideProtocolName: 'Ball-Striking & Delivery Mechanics',
      shortPurpose: 'Plant-leg braking, rotational whip, and delivery balance.',
      roleReason: 'Delivery on the run demands plant-knee stability and rotational control.',
      foundationalChoices: ['vertical_jump', 'squat'],
      notice: null,
    },

    central_midfielder: {
      roleTitle: 'Central Midfielder',
      pageTitle: 'Ball-Striking & Distribution Mechanics',
      recommendedProtocolId: 'football_strike',
      capabilityStatus: 'available',
      overrideProtocolName: 'Ball-Striking & Distribution Mechanics',
      shortPurpose: 'Plant alignment, hip rotation, and passing follow-through.',
      roleReason: 'Accurate distribution demands plant-knee stability and repeatable follow-through.',
      foundationalChoices: ['squat', 'vertical_jump'],
      notice: null,
    },

    centre_back: {
      roleTitle: 'Centre Back / Defender',
      pageTitle: 'Ball-Striking & Clearance Mechanics',
      recommendedProtocolId: 'football_strike',
      capabilityStatus: 'available',
      overrideProtocolName: 'Ball-Striking & Clearance Mechanics',
      shortPurpose: 'Clearance ball-striking and single-leg deceleration control.',
      roleReason: 'High-pressure clearances demand grounded knee stability and safe braking.',
      foundationalChoices: ['vertical_jump', 'squat'],
      notice: null,
    },

    goalkeeper: {
      roleTitle: 'Goalkeeper',
      pageTitle: 'Goalkeeper Aerial & Lateral Power Baseline',
      recommendedProtocolId: 'vertical_jump',
      capabilityStatus: 'foundation',
      overrideProtocolName: 'Goalkeeper Elevation & Deceleration',
      shortPurpose: 'Vertical takeoff impulse and bilateral landing deceleration.',
      roleReason: 'Aerial claims require vertical drive and landing shock absorption.',
      foundationalChoices: ['squat'],
      notice: {
        type: 'info',
        title: 'Goalkeeper diving analysis coming soon',
        description: 'Lateral dive extension and reflex kinematics in development. Complete power baseline below.',
      },
    },
  },

  // ─── BASKETBALL ──────────────────────────────────────────────────────────
  basketball: {
    point_guard: {
      roleTitle: 'Point Guard',
      pageTitle: 'Shooting & Elevation Mechanics',
      recommendedProtocolId: 'basketball_jump_shot',
      capabilityStatus: 'available',
      shortPurpose: 'Elevation, shooting elbow alignment, and landing balance.',
      roleReason: 'Shooting consistency demands vertical takeoff without fade and balanced two-foot deceleration.',
      foundationalChoices: ['vertical_jump', 'squat'],
      notice: null,
    },

    shooting_guard: {
      roleTitle: 'Shooting Guard',
      pageTitle: 'Shooting & Release Mechanics',
      recommendedProtocolId: 'basketball_jump_shot',
      capabilityStatus: 'available',
      overrideProtocolName: 'Shooting & Release Mechanics',
      shortPurpose: 'Elbow alignment at release, jump peak timing, and symmetrical landing.',
      roleReason: 'Consistent shooting relies on repeatable vertical alignment and rapid release.',
      foundationalChoices: ['vertical_jump', 'squat'],
      notice: null,
    },

    small_forward: {
      roleTitle: 'Small Forward',
      pageTitle: 'Mid-Range Shooting Mechanics',
      recommendedProtocolId: 'basketball_jump_shot',
      capabilityStatus: 'available',
      shortPurpose: 'Shooting elevation, flight posture, and landing shock control.',
      roleReason: 'Shot consistency demands vertical takeoff without fade and soft deceleration.',
      foundationalChoices: ['vertical_jump', 'squat'],
      notice: null,
    },

    power_forward: {
      roleTitle: 'Power Forward',
      pageTitle: 'Interior Elevation & Landing Baseline',
      recommendedProtocolId: 'vertical_jump',
      capabilityStatus: 'foundation',
      overrideProtocolName: 'Interior Elevation & Deceleration',
      shortPurpose: 'Vertical displacement and bilateral landing knee valgus control.',
      roleReason: 'Contested rebounding requires vertical displacement and resilient landing mechanics.',
      foundationalChoices: ['squat'],
      notice: {
        type: 'info',
        title: 'Post mechanics analysis coming soon',
        description: 'Drop-step tracking and post positioning in development. Complete vertical baseline below.',
      },
    },

    center: {
      roleTitle: 'Center',
      pageTitle: 'Rim Protection & Vertical Power Baseline',
      recommendedProtocolId: 'vertical_jump',
      capabilityStatus: 'foundation',
      overrideProtocolName: 'Rim Protection Elevation Baseline',
      shortPurpose: 'Vertical reach elevation and bilateral knee shock control.',
      roleReason: 'Rim protection requires straight-up elevation and landing shock absorption.',
      foundationalChoices: ['squat'],
      notice: {
        type: 'info',
        title: 'Rim protection analysis coming soon',
        description: 'Contest verticality and low-post anchor tracking in development. Complete baseline below.',
      },
    },
  },

  // ─── ATHLETICS ───────────────────────────────────────────────────────────
  athletics: {
    sprinter: {
      roleTitle: 'Sprinter',
      pageTitle: 'Sprint Acceleration Biomechanics',
      recommendedProtocolId: 'sprint_mechanics',
      capabilityStatus: 'available',
      shortPurpose: 'Forward drive lean angle, lead knee punch, and stride rhythm.',
      roleReason: 'Velocity generation requires aggressive drive angle and high front-knee elevation.',
      foundationalChoices: ['vertical_jump', 'squat'],
      notice: null,
    },

    middle_distance: {
      roleTitle: 'Middle Distance Runner',
      pageTitle: 'Acceleration Mechanics Baseline',
      recommendedProtocolId: 'sprint_mechanics',
      capabilityStatus: 'foundation',
      overrideProtocolName: 'Acceleration Mechanics Baseline',
      shortPurpose: 'Drive phase posture and bilateral stride rhythm.',
      roleReason: 'Analyzes acceleration posture and cadence symmetry for kick transitions.',
      foundationalChoices: ['squat', 'vertical_jump'],
      notice: {
        type: 'info',
        title: 'Distance running efficiency planned',
        description: 'Sustained stride pacing kinematics in development. Complete acceleration baseline below.',
      },
    },

    jumper: {
      roleTitle: 'Jumper (High / Long / Triple)',
      pageTitle: 'Takeoff Impulse & Elastic Power Baseline',
      recommendedProtocolId: 'vertical_jump',
      capabilityStatus: 'foundation',
      overrideProtocolName: 'Takeoff Elastic Power Baseline',
      shortPurpose: 'Stretch-shortening cycle rate of force development and vertical displacement.',
      roleReason: 'Converting run-up speed into takeoff height demands lower-limb elasticity.',
      foundationalChoices: ['squat'],
      notice: {
        type: 'info',
        title: 'Takeoff analysis coming soon',
        description: 'Flight trajectory tracking in active research. Complete elastic power baseline below.',
      },
    },

    thrower: {
      roleTitle: 'Thrower (Shot / Discus / Javelin)',
      pageTitle: 'Kinetic Base & Mobility Baseline',
      recommendedProtocolId: 'squat',
      capabilityStatus: 'foundation',
      overrideProtocolName: 'Rotational Base & Hip Mobility Squat',
      shortPurpose: 'Hip-to-ankle mobility and eccentric knee stability in power positions.',
      roleReason: 'Throws power begins from a grounded, deep hip hinge and stable base.',
      foundationalChoices: ['vertical_jump'],
      notice: {
        type: 'info',
        title: 'Rotational throwing analysis coming soon',
        description: 'Thoracic rotational velocity tracking in development. Complete kinetic base below.',
      },
    },
  },
};

/**
 * Safely retrieve role assessment configuration using exact taxonomy keys.
 * Falls back safely to sport default if role is not found.
 */
export const getRoleAssessmentConfig = (sportKey, roleKey) => {
  const sport = ROLE_ASSESSMENT_MATRIX[sportKey];
  if (!sport) {
    return null;
  }

  // Exact match
  if (roleKey && sport[roleKey]) {
    return sport[roleKey];
  }

  // Fallback aliases for common variations without fuzzy matching
  const aliasMap = {
    football: {
      defender: 'centre_back',
      forward: 'striker',
      midfield: 'central_midfielder',
      midfielder: 'central_midfielder',
    },
    cricket: {
      batter: 'batsman',
      keeper: 'wicket_keeper',
      wicketkeeper: 'wicket_keeper',
    },
    basketball: {
      guard: 'point_guard',
    },
  };

  const alias = aliasMap[sportKey]?.[roleKey];
  if (alias && sport[alias]) {
    return sport[alias];
  }

  // Return the first supported role in that sport as a safe fallback
  const firstRole = Object.values(sport)[0];
  return firstRole;
};
