/**
 * SPORT PERSONALIZATION & INTAKE TAXONOMY CONFIGURATION
 * Sportify Phase 1: Extensible Foundation + Cricket Specialization
 * Sportify Phase 2: Football (Striker, Winger, Midfielder, Centre Back, Goalkeeper)
 * 
 * Provides calibrated, sport-specific and role-specific:
 * - Primary Playstyles & Archetypes
 * - Secondary Movement Tendencies
 * - Calibrated Role Goals
 * - Craft Preferences (hands, feet, stance, zones)
 * - Training Surface, Environment & Equipment Access
 * - Contextual athlete voice prompts
 */

export interface PlaystyleOption {
  id: string;
  label: string;
  shortDesc?: string;
}

export interface TendencyOption {
  id: string;
  label: string;
}

export interface GoalOption {
  id: string;
  label: string;
}

export interface CraftFieldOption {
  id: string;
  label: string;
}

export interface CraftField {
  id: string;
  label: string;
  options: CraftFieldOption[];
}

export interface RolePersonalizationConfig {
  roleTitle: string;
  isDualCraft?: boolean;
  craftType?: 'standard' | 'all_rounder' | 'wicketkeeper';
  playstyles: PlaystyleOption[];
  tendencies: TendencyOption[];
  roleGoals: GoalOption[];
  craftFields: CraftField[];
  // Special dual-craft fields
  balanceOptions?: PlaystyleOption[];
  battingStyles?: PlaystyleOption[];
  bowlingStyles?: PlaystyleOption[];
  keepingStyles?: PlaystyleOption[];
  keepingTendencies?: TendencyOption[];
  keepingGoals?: GoalOption[];
  battingGoals?: GoalOption[];
  voicePrompts?: {
    descriptionPlaceholder: string;
    goalsPlaceholder: string;
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// CRICKET TAXONOMY
// ─────────────────────────────────────────────────────────────────────────────

const CRICKET_BATSMAN_PLAYSTYLES: PlaystyleOption[] = [
  { id: 'classical_anchor', label: 'Classical Anchor', shortDesc: 'Innings builder, high technical discipline' },
  { id: 'aggressive_stroke_maker', label: 'Aggressive Stroke-Maker', shortDesc: 'Dominant strokeplay, seeks boundary options' },
  { id: 'power_hitter', label: 'Power Hitter / Finisher', shortDesc: 'High boundary percentage, maximal bat speed' },
  { id: '360_innovator', label: '360° Innovator', shortDesc: 'Ramp, reverse, lap, open-field manipulator' },
  { id: 'counter_puncher', label: 'Counter-Puncher', shortDesc: 'Absorbs pressure, punishes bad balls quickly' },
];

const CRICKET_BATSMAN_TENDENCIES: TendencyOption[] = [
  { id: 'front_foot_dominant', label: 'Front-Foot Dominant' },
  { id: 'back_foot_dominant', label: 'Back-Foot Dominant' },
  { id: 'aerial_risk_taker', label: 'Aerial Boundary Hunter' },
  { id: 'grounded_rotator', label: 'Grounded Strike Rotator' },
  { id: 'spin_specialist', label: 'Spin Manipulator' },
  { id: 'pace_specialist', label: 'Pace / Bounce Specialist' },
];

const CRICKET_BATSMAN_GOALS: GoalOption[] = [
  { id: 'bat_speed', label: 'Bat Speed & Kinetic Chain' },
  { id: 'front_foot_transfer', label: 'Weight Transfer on Front Foot' },
  { id: 'back_foot_stability', label: 'Short-Pitch Balance & Pull' },
  { id: 'head_stillness', label: 'Head Stillness at Impact' },
  { id: 'spin_footwork', label: 'Footwork & Reach Against Spin' },
  { id: 'power_clearance', label: 'Deep Boundary Clearance Power' },
];

const CRICKET_BOWLER_PACE_PLAYSTYLES: PlaystyleOption[] = [
  { id: 'express_pace', label: 'Express Pace', shortDesc: 'Raw speed, aggressive bouncer, late burst' },
  { id: 'swing_specialist', label: 'Swing Specialist', shortDesc: 'Conventional & reverse swing through the air' },
  { id: 'seam_movement', label: 'Hit-the-Deck / Seam', shortDesc: 'Steep bounce, deviation off pitch seam' },
  { id: 'skiddy_slingshot', label: 'Skiddy / Slingy Pace', shortDesc: 'Low trajectory, skids onto batsman quickly' },
];

const CRICKET_BOWLER_SPIN_PLAYSTYLES: PlaystyleOption[] = [
  { id: 'classical_turner', label: 'Classical Big Turner', shortDesc: 'Heavy revolutions, drift and sharp bite' },
  { id: 'flight_dip', label: 'Flight & Dip Deceiver', shortDesc: 'Changes arc in air, draws batsman forward' },
  { id: 'fast_darting', label: 'Flat & Fast Darting', shortDesc: 'Restricts room, tight lines, quick pace' },
  { id: 'mystery_spin', label: 'Mystery / Variation Specialist', shortDesc: 'Carrom ball, googlies, disguised deliveries' },
];

const CRICKET_BOWLER_TENDENCIES: TendencyOption[] = [
  { id: 'high_arm_action', label: 'High-Arm Release' },
  { id: 'round_arm_sling', label: 'Round-Arm / Sling Release' },
  { id: 'side_on_action', label: 'Side-On Action' },
  { id: 'front_on_action', label: 'Front-On Action' },
  { id: 'semi_open_action', label: 'Semi-Open Action' },
  { id: 'heavy_ball_bumper', label: 'Heavy Ball / Hard Length' },
  { id: 'drift_and_dip', label: 'Drift & Late Dip' },
];

const CRICKET_BOWLER_GOALS: GoalOption[] = [
  { id: 'release_velocity', label: 'Release Velocity & Arm Speed' },
  { id: 'front_knee_brace', label: 'Front-Knee Bracing (Energy Transfer)' },
  { id: 'runup_gather', label: 'Run-Up & Gather Synchronization' },
  { id: 'back_foot_landing', label: 'Back-Foot Impact & Alignment' },
  { id: 'repeatable_release', label: 'Consistent & Repeatable Release Point' },
  { id: 'revolutions_spin', label: 'Revolutions & Spin Deception' },
];

const CRICKET_WICKETKEEPER_PLAYSTYLES: PlaystyleOption[] = [
  { id: 'standing_back_specialist', label: 'Pace & Carry Specialist', shortDesc: 'Superb dive reach, clean gathering back' },
  { id: 'standing_up_craftsman', label: 'Up-to-the-Stumps Craftsman', shortDesc: 'Sharp stumping, reading spin & bounce' },
  { id: 'acrobatic_dynamic', label: 'Acrobatic / Dynamic Diver', shortDesc: 'High range, explosive lateral takeoff' },
  { id: 'composed_absorber', label: 'Clean Hands Absorber', shortDesc: 'Impeccable technique, soft cushioning' },
];

const CRICKET_WICKETKEEPER_TENDENCIES: TendencyOption[] = [
  { id: 'early_crouch', label: 'Low Crouched Setup' },
  { id: 'explosive_lateral_push', label: 'Explosive Lateral Push-off' },
  { id: 'soft_hands_give', label: 'Soft Hands / Deep Give' },
  { id: 'fast_bails_striker', label: 'Lightning Bails Strike' },
  { id: 'blindside_deflection_recovery', label: 'Edge Deflection Recovery' },
];

const CRICKET_WICKETKEEPER_GOALS: GoalOption[] = [
  { id: 'lateral_agility', label: 'Lateral Agility & Push-off' },
  { id: 'glovework_cleanliness', label: 'Clean Glovework & Soft Cushion' },
  { id: 'squat_endurance', label: 'Crouch Posture & Hip Endurance' },
  { id: 'reaction_time', label: 'Reaction Speed on Edges & Deflections' },
  { id: 'stumping_speed', label: 'Hands-to-Stumps Transition Speed' },
];

const CRICKET_ALLROUNDER_BALANCE: PlaystyleOption[] = [
  { id: 'batting_all_rounder', label: 'Batting-Led All-Rounder', shortDesc: 'Top-order run-scorer with regular bowling overs' },
  { id: 'bowling_all_rounder', label: 'Bowling-Led All-Rounder', shortDesc: 'Primary strike bowler with aggressive lower-order batting' },
  { id: 'balanced_all_rounder', label: 'Genuine / Balanced All-Rounder', shortDesc: 'Equal high contribution in both disciplines' },
  { id: 'utility_finisher', label: 'Impact Utility & Finisher', shortDesc: 'Death overs boundary hitter and tactical bowling' },
];

// ─────────────────────────────────────────────────────────────────────────────
// FOOTBALL (SOCCER) TAXONOMY
// ─────────────────────────────────────────────────────────────────────────────

const FOOTBALL_STRIKER_PLAYSTYLES: PlaystyleOption[] = [
  { id: 'target_man', label: 'Target Forward', shortDesc: 'Hold-up play, aerial reference, physical duels' },
  { id: 'poacher', label: 'Box Poacher', shortDesc: 'Clinical box finishing, sharp anticipation, near-post darts' },
  { id: 'pressing_forward', label: 'High-Pressing Runner', shortDesc: 'Channel sprints, relentless defensive pressure, transition threat' },
  { id: 'false_nine', label: 'False Nine', shortDesc: 'Drops into midfield, links play, creates central overloads' },
  { id: 'complete_forward', label: 'Complete Striker', shortDesc: 'Physicality, dribbling, finishing with both feet' },
];

const FOOTBALL_STRIKER_TENDENCIES: TendencyOption[] = [
  { id: 'channel_runs', label: 'Runs into Channels' },
  { id: 'near_post_darts', label: 'Near-Post Darts' },
  { id: 'back_to_goal', label: 'Back-to-Goal Hold-Up' },
  { id: 'first_time_finisher', label: 'First-Touch Striking' },
  { id: 'aerial_threat', label: 'Aerial Threat in Box' },
  { id: 'cut_inside_shoot', label: 'Diagonal Cuts & Shooting' },
];

const FOOTBALL_STRIKER_GOALS: GoalOption[] = [
  { id: 'finishing_composure', label: 'Box Finishing & Striking Power' },
  { id: 'first_touch_control', label: 'First-Touch Under Pressure' },
  { id: 'acceleration_burst', label: 'First 5m Acceleration & Separation' },
  { id: 'aerial_leap', label: 'Vertical Leap & Header Contact' },
  { id: 'deceleration_cutting', label: 'Deceleration & Cutting Speed' },
  { id: 'holding_off_defenders', label: 'Core Shielding & Hold-Up Strength' },
];

const FOOTBALL_WINGER_PLAYSTYLES: PlaystyleOption[] = [
  { id: 'touchline_winger', label: 'Touchline Winger', shortDesc: 'Hugs sideline, beats fullback on outside, crosses with natural foot' },
  { id: 'inverted_winger', label: 'Inverted Winger', shortDesc: 'Cuts inside onto dominant foot to shoot or combine' },
  { id: 'wide_playmaker', label: 'Wide Playmaker', shortDesc: 'Operates in half-spaces, visionary passing, dictates tempo' },
  { id: 'two_way_wing_runner', label: 'Two-Way Wing Runner', shortDesc: 'High defensive work rate, transition engine, relentless running' },
];

const FOOTBALL_WINGER_TENDENCIES: TendencyOption[] = [
  { id: 'one_on_one_takeon', label: '1v1 Isolation Take-ons' },
  { id: 'byline_crossing', label: 'Byline Crossing & Cutbacks' },
  { id: 'back_post_arriver', label: 'Far-Post Arriving Finisher' },
  { id: 'half_space_drifts', label: 'Half-Space Drifts' },
  { id: 'high_tracking_back', label: 'High Defensive Tracking' },
  { id: 'quick_give_and_go', label: 'Quick 1-2 Give-and-Go' },
];

const FOOTBALL_WINGER_GOALS: GoalOption[] = [
  { id: 'top_end_sprint', label: 'Top-End Sprint Speed & Transition' },
  { id: 'rapid_change_of_pace', label: 'Explosive Change of Pace & 1v1 Feints' },
  { id: 'crossing_delivery', label: 'Whip & Delivery into the Box' },
  { id: 'weak_foot_cutting', label: 'Weak-Foot Crossing & Cutting' },
  { id: 'deceleration_control', label: 'Deceleration & Cutback Control' },
];

const FOOTBALL_MIDFIELDER_PLAYSTYLES: PlaystyleOption[] = [
  { id: 'box_to_box', label: 'Box-to-Box Engine (B2B)', shortDesc: 'Box-to-box stamina, physical duels, late arriving runs' },
  { id: 'deep_lying_playmaker', label: 'Deep-Lying Distributor', shortDesc: 'Dictates tempo from deep, pinpoint long switches, press evasion' },
  { id: 'ball_winning_destroyer', label: 'Ball-Winning Destroyer', shortDesc: 'Screens defensive line, aggressive tackles, interceptions' },
  { id: 'advanced_playmaker', label: 'Advanced Playmaker (#10)', shortDesc: 'Final-third creativity, killer through-balls, tight-space agility' },
  { id: 'mezzala_half_space', label: 'Half-Space Runner (Mezzala)', shortDesc: 'Underlapping runs, wide channel overloads, transition carrier' },
];

const FOOTBALL_MIDFIELDER_TENDENCIES: TendencyOption[] = [
  { id: 'one_two_touch_tempo', label: '1-2 Touch Rapid Circulation' },
  { id: 'progressive_carrier', label: 'Progressive Driving Runs with Ball' },
  { id: 'shielding_under_press', label: 'Body Shielding Under Press' },
  { id: 'third_man_late_runs', label: 'Late Arriving Box Runs' },
  { id: 'ground_duel_tackles', label: 'Aggressive Ground Duels & Tackles' },
  { id: 'long_range_shooting', label: 'Long-Range Shooting Threat' },
];

const FOOTBALL_MIDFIELDER_GOALS: GoalOption[] = [
  { id: 'aerobic_endurance', label: 'Match Running Capacity & Repeat Sprints' },
  { id: 'scanning_360_vision', label: 'Pre-Reception Scanning & 360° Vision' },
  { id: 'press_resistance', label: 'Press-Resistance in Tight Spaces' },
  { id: 'line_breaking_passes', label: 'Line-Breaking Passing Accuracy' },
  { id: 'lateral_recovery', label: 'Lateral Transition & Pitch Coverage' },
];

const FOOTBALL_DEFENDER_PLAYSTYLES: PlaystyleOption[] = [
  { id: 'ball_playing_cb', label: 'Ball-Playing Centre Back', shortDesc: 'Builds from back, calm under press, line-breaking passes' },
  { id: 'no_nonsense_stopper', label: 'Dominant Stopper / Enforcer', shortDesc: 'Aerial duel dominance, heavy clearances, physical enforcer' },
  { id: 'sweeper_cover', label: 'Covering / Recovery Defender', shortDesc: 'Reads danger early, covers space behind, recovery sprint speed' },
  { id: 'wide_centre_back', label: 'Wide Centre Back (Back 3)', shortDesc: 'Steps into wide channels, overlaps, defends transitions' },
];

const FOOTBALL_DEFENDER_TENDENCIES: TendencyOption[] = [
  { id: 'aggressive_step_up', label: 'Aggressive Step-Up to Intercept' },
  { id: 'jockey_delay', label: 'Patience Jockeying & Delaying' },
  { id: 'aerial_clearance_dominance', label: 'Aerial Clearance Dominance' },
  { id: 'diagonal_distribution', label: 'Long Diagonal Distribution' },
  { id: 'last_ditch_blocks', label: 'Slide Tackles & Last-Ditch Blocks' },
];

const FOOTBALL_DEFENDER_GOALS: GoalOption[] = [
  { id: 'turning_recovery_speed', label: 'Backward-to-Forward Turning & Acceleration' },
  { id: 'aerial_header_distance', label: 'Defensive Header Distance & Contact' },
  { id: 'one_on_one_jockeying', label: '1v1 Stance & Deceleration Stability' },
  { id: 'long_range_switches', label: 'Long-Range Switch & Driven Passes' },
  { id: 'upper_body_core_strength', label: 'Upper-Body Strength in Physical Duels' },
];

const FOOTBALL_GOALKEEPER_PLAYSTYLES: PlaystyleOption[] = [
  { id: 'sweeper_keeper', label: 'Modern Sweeper-Keeper', shortDesc: 'Active outside penalty box, acts as 11th outfield player, starts attacks' },
  { id: 'traditional_shot_stopper', label: 'Reflex Shot-Stopper', shortDesc: 'Line-bound specialist, lightning reflexes, elite 1v1 reactions' },
  { id: 'commanding_box_general', label: 'Cross-Dominating Commander', shortDesc: 'Controls 18-yard box, vocal leader, claims high crosses with authority' },
  { id: 'distribution_specialist', label: 'Distribution Architect', shortDesc: 'Pinpoint side-volleys, long throws, rapid counter-attack initiator' },
];

const FOOTBALL_GOALKEEPER_TENDENCIES: TendencyOption[] = [
  { id: 'spread_smother', label: '1v1 Spread / Brave Smothering' },
  { id: 'parry_to_safe_zones', label: 'Pushing Saves into Safe Zones' },
  { id: 'high_starting_position', label: 'High Starting Position Outside Box' },
  { id: 'quick_side_volley', label: 'Quick Side-Volley Launch' },
  { id: 'vocal_box_organizer', label: 'Vocal Defensive Organization' },
];

const FOOTBALL_GOALKEEPER_GOALS: GoalOption[] = [
  { id: 'lateral_diving_explosiveness', label: 'Lateral Diving & Explosive Push-off' },
  { id: 'low_shot_reactions', label: 'Low Reaction Time on Deflections' },
  { id: 'aerial_cross_takeoff', label: 'Single-Leg Takeoff on Crosses' },
  { id: 'handling_cleanliness', label: 'Handling & Catching Cleanliness' },
  { id: 'short_long_distribution', label: 'Passing Accuracy Under Press' },
];

// ─────────────────────────────────────────────────────────────────────────────
// BASKETBALL TAXONOMY
// ─────────────────────────────────────────────────────────────────────────────

const BASKETBALL_POINT_GUARD_PLAYSTYLES: PlaystyleOption[] = [
  { id: 'floor_general', label: 'Floor General', shortDesc: 'Pace control, vision, pass-first, high basketball IQ' },
  { id: 'slashing_guard', label: 'Rim Slasher', shortDesc: 'Explosive downhill drives, paint penetration, contact finishing' },
  { id: 'shot_creator_pg', label: 'Shot Creator', shortDesc: 'Pull-up off the dribble, step-backs, 3-level scoring threat' },
  { id: 'lockdown_defender_pg', label: 'Defensive Disruptor', shortDesc: 'Full-court ball pressure, passing lane intercepts, transition ignition' },
];

const BASKETBALL_POINT_GUARD_TENDENCIES: TendencyOption[] = [
  { id: 'pick_and_roll_operator', label: 'Pick & Roll Maestro' },
  { id: 'drive_and_kick', label: 'Drive & Kick Distributor' },
  { id: 'pull_up_jumper', label: 'Pull-Up Jumper Off Dribble' },
  { id: 'paint_floater', label: 'Paint Floater / Tear-Drop' },
  { id: 'full_court_press', label: 'Full-Court On-Ball Pressure' },
  { id: 'fast_break_pusher', label: 'Fast-Break Transition Pusher' },
];

const BASKETBALL_POINT_GUARD_GOALS: GoalOption[] = [
  { id: 'first_step_burst', label: 'First-Step Acceleration & Blow-By' },
  { id: 'lateral_slide_quickness', label: 'Lateral Defensive Slide Quickness' },
  { id: 'deceleration_stop_pop', label: 'Deceleration & Stop-and-Pop Balance' },
  { id: 'handle_stability_contact', label: 'Low Handle Stability Through Contact' },
  { id: 'change_of_direction', label: 'Ankle-Breaking Change of Direction' },
];

const BASKETBALL_SHOOTING_GUARD_PLAYSTYLES: PlaystyleOption[] = [
  { id: 'catch_and_shoot_sniper', label: 'Catch-and-Shoot Sniper', shortDesc: 'Elite off-ball movement, lightning release, deep perimeter gravity' },
  { id: 'three_and_d', label: '3-and-D Specialist', shortDesc: 'Perimeter floor spacing, corner 3s, locks down opposing scoring wing' },
  { id: 'isolation_scorer', label: 'Isolation Scorer', shortDesc: 'Mid-range mastery, side-steps, creation against set defense' },
  { id: 'athletic_slasher_sg', label: 'Athletic Slasher', shortDesc: 'Backdoor cuts, transition rim finisher, elevation over defenders' },
];

const BASKETBALL_SHOOTING_GUARD_TENDENCIES: TendencyOption[] = [
  { id: 'off_screen_curls', label: 'Coming Off Screens / Pin-Downs' },
  { id: 'corner_spacer', label: 'Corner Floor Spacer' },
  { id: 'mid_range_pullup', label: 'Mid-Range Pull-Up' },
  { id: 'backdoor_cutter', label: 'Sharp Backdoor Cuts' },
  { id: 'transition_finisher', label: 'Transition Leak-Out Finisher' },
  { id: 'closeout_attacker', label: 'Attack Closeouts Off Catch' },
];

const BASKETBALL_SHOOTING_GUARD_GOALS: GoalOption[] = [
  { id: 'release_quickness', label: 'Catch-to-Release Speed & Dip' },
  { id: 'elevation_consistency', label: 'Vertical Elevation on Jump Shot' },
  { id: 'landing_shock_absorption', label: 'Balanced Two-Foot Landing & Deceleration' },
  { id: 'repeat_sprint_endurance', label: 'Off-Ball Repeat Sprint Endurance' },
  { id: 'defensive_closeout', label: 'Defensive Closeout Agility & High Hand' },
];

const BASKETBALL_SMALL_FORWARD_PLAYSTYLES: PlaystyleOption[] = [
  { id: 'two_way_wing', label: 'Two-Way Wing Anchor', shortDesc: 'Guards 1-4, primary/secondary scoring option, transition leader' },
  { id: 'point_forward', label: 'Point Forward', shortDesc: 'Facilitates offense, secondary playmaker, mismatch creator' },
  { id: 'slashing_wing', label: 'Physical Slasher', shortDesc: 'Attacks closeouts with power, finishes through contact at the rim' },
  { id: 'versatile_spacer_sf', label: 'Versatile Floor Spacer', shortDesc: 'Spot-up 3s, straight-line drives, offensive rebounding' },
];

const BASKETBALL_SMALL_FORWARD_TENDENCIES: TendencyOption[] = [
  { id: 'mismatch_postup', label: 'Mid-Post / Mismatch Post-Up' },
  { id: 'corner_relocation', label: 'Corner Relocation on Drives' },
  { id: 'crash_offensive_glass', label: 'Crash Offensive Glass from Wing' },
  { id: 'help_side_rotations', label: 'Help-Side Shot Contests & Blocks' },
  { id: 'grab_and_go', label: 'Defensive Rebound Grab-and-Go' },
];

const BASKETBALL_SMALL_FORWARD_GOALS: GoalOption[] = [
  { id: 'vertical_contact_finishing', label: 'Vertical Takeoff & Contact Finishing' },
  { id: 'multi_position_defense', label: 'Multi-Directional Lateral Agility' },
  { id: 'core_contact_stability', label: 'Core Strength Through Mid-Air Contact' },
  { id: 'jump_shot_sway', label: 'Jump Shot Alignment & Energy Transfer' },
  { id: 'transition_acceleration', label: 'End-to-End Transition Acceleration' },
];

const BASKETBALL_POWER_FORWARD_PLAYSTYLES: PlaystyleOption[] = [
  { id: 'stretch_four', label: 'Modern Stretch Four', shortDesc: 'Pick-and-pop 3s, floor spacing, attacks closeouts off the bounce' },
  { id: 'athletic_rim_runner', label: 'Rim Runner / Lob Threat', shortDesc: 'Dunker spot gravity, rolls hard off screens, transition finisher' },
  { id: 'post_playmaker', label: 'Low-Post Craftsman', shortDesc: 'Drop steps, up-and-under counters, low-post kickouts' },
  { id: 'glass_cleaner_pf', label: 'Defensive Enforcer & Rebounder', shortDesc: 'High-volume rebounding, interior shot deterrent, physical box-outs' },
];

const BASKETBALL_POWER_FORWARD_TENDENCIES: TendencyOption[] = [
  { id: 'pick_and_pop_3pt', label: 'Pick & Pop to Perimeter' },
  { id: 'hard_roll_to_rim', label: 'Hard Dive / Roll to Rim' },
  { id: 'short_roll_playmaker', label: 'Short-Roll Pocket Passer' },
  { id: 'offensive_rebound_putback', label: 'Second-Chance Putbacks' },
  { id: 'switch_defense', label: 'Perimeter Switch Defense' },
];

const BASKETBALL_POWER_FORWARD_GOALS: GoalOption[] = [
  { id: 'vertical_jump_impulse', label: 'Vertical Jump Impulse & Second Jump Speed' },
  { id: 'hip_extension_boxout', label: 'Hip Extension Power on Box-Outs' },
  { id: 'pick_and_roll_deceleration', label: 'Pick & Roll Deceleration & Pivot' },
  { id: 'landing_knee_valgus_control', label: 'Landing Deceleration & Knee Stability' },
  { id: 'perimeter_lateral_slide', label: 'Lateral Slide Mobility on Perimeter Switches' },
];

const BASKETBALL_CENTER_PLAYSTYLES: PlaystyleOption[] = [
  { id: 'rim_protector_anchor', label: 'Rim Protector / Paint Anchor', shortDesc: 'Alters interior shots, vertical wall, controls defensive glass' },
  { id: 'pick_and_roll_finisher', label: 'Vertical Spacer / Lob Threat', shortDesc: 'Elite roll gravity, catches lobs above rim, bone-crushing screens' },
  { id: 'traditional_post_scorer', label: 'Traditional Low-Post Scorer', shortDesc: 'Back-down power, jump hooks, deep paint seals' },
  { id: 'point_center', label: 'Hub / Point Center', shortDesc: 'Facilitates from top of key, dribble-handoff hub, back-door passes' },
];

const BASKETBALL_CENTER_TENDENCIES: TendencyOption[] = [
  { id: 'drop_coverage_anchor', label: 'Drop Coverage Rim Anchor' },
  { id: 'offensive_glass_tip', label: 'Tip-Ins & Offensive Glass' },
  { id: 'dribble_handoff_hub', label: 'Dribble Hand-Off (DHO) Screen Hub' },
  { id: 'verticality_wall', label: 'Rule of Verticality Contests' },
  { id: 'trailing_3pt_shooter', label: 'Trail 3PT Option' },
];

const BASKETBALL_CENTER_GOALS: GoalOption[] = [
  { id: 'max_vertical_leap', label: 'Max Vertical Leap & Rim Reach' },
  { id: 'two_foot_landing_cushion', label: 'Bilateral Landing Deceleration & Knee Tracking' },
  { id: 'deep_squat_mobility', label: 'Deep Squat Stance & Hip Mobility' },
  { id: 'second_jump_quickness', label: 'Immediate Second Jump Reaction' },
  { id: 'core_interior_strength', label: 'Lower-Back & Core Interior Shielding' },
];

// ─── ATHLETICS: SPRINTER ───
const ATHLETICS_SPRINTER_PLAYSTYLES: PlaystyleOption[] = [
  { id: 'power_starter', label: 'Power Starter / Drive Specialist', shortDesc: 'Explosive block clearance, heavy forward lean, low heel recovery' },
  { id: 'max_velocity_specialist', label: 'Max Velocity Specialist', shortDesc: 'Elite top-end upright speed, high hip height, reactive ground strike' },
  { id: 'speed_endurance_finisher', label: 'Speed-Endurance Finisher', shortDesc: 'Maintains mechanics under severe lactate, closing 50m surge' },
  { id: 'high_cadence_turnover', label: 'High-Cadence Turnover Sprinter', shortDesc: 'Rapid leg turnover and quick ground contact recovery' },
];

const ATHLETICS_SPRINTER_TENDENCIES: TendencyOption[] = [
  { id: 'low_heel_recovery', label: 'Low Heel Recovery in Drive Phase' },
  { id: 'high_knee_strike', label: 'High Knee Lift & Front-Side Mechanics' },
  { id: 'active_claw_strike', label: 'Active Claw / Paw Strike Under Hips' },
  { id: 'upright_neutral_posture', label: 'Tall Torso & Neutral Pelvis at Top Speed' },
  { id: 'violent_arm_drive', label: 'Aggressive Contralateral Arm Drive' },
];

const ATHLETICS_SPRINTER_GOALS: GoalOption[] = [
  { id: 'block_reaction_drive', label: 'Block Reaction & 45° Drive Phase Angle' },
  { id: 'max_velocity_stiffness', label: 'Max Velocity Ankle Stiffness & Elastic Recoil' },
  { id: 'minimize_contact_time', label: 'Minimizing Ground Contact Time (<0.09s)' },
  { id: 'speed_endurance_maintenance', label: 'Speed Endurance & Deceleration Resistance' },
  { id: 'hamstring_pelvic_stability', label: 'Hamstring Protection & Pelvic Alignment' },
];

// ─── ATHLETICS: MIDDLE DISTANCE ───
const ATHLETICS_MIDDLE_DISTANCE_PLAYSTYLES: PlaystyleOption[] = [
  { id: 'front_running_pacer', label: 'Front-Running Pacer', shortDesc: 'Sets honest relentless tempo, controls inside rail, breaks chasers' },
  { id: 'sit_and_kick_tactician', label: 'Sit-and-Kick Tactician', shortDesc: 'Conserves energy tucked in pack, unleashes lethal final 200m kick' },
  { id: 'surge_and_break', label: 'Surge & Break Tactician', shortDesc: 'Injects mid-race 100m surges to disrupt opponents’ rhythm and cadence' },
  { id: 'negative_split_finisher', label: 'Negative Split Finisher', shortDesc: 'Calculated progressive pacing, running second half faster than first' },
];

const ATHLETICS_MIDDLE_DISTANCE_TENDENCIES: TendencyOption[] = [
  { id: 'midfoot_strike', label: 'Midfoot Ground Strike Under Center of Mass' },
  { id: 'cadence_rhythm_control', label: 'Cadence Rhythm & Breathing Sync (2-2 / 3-3)' },
  { id: 'inside_rail_positioning', label: 'Inside Rail Economy & Tactical Draft' },
  { id: 'elastic_achilles_recoil', label: 'Achilles Tendon Elastic Energy Return' },
  { id: 'relaxed_shoulder_carriage', label: 'Dropped Shoulders & Relaxed Arm Swing' },
];

const ATHLETICS_MIDDLE_DISTANCE_GOALS: GoalOption[] = [
  { id: 'running_economy', label: 'Running Economy & Submaximal Oxygen Cost' },
  { id: 'lactate_clearance_surges', label: 'Lactate Clearance & Recovery During Mid-Race Surges' },
  { id: 'final_lap_kick', label: 'Final 300m Anaerobic Kick Acceleration' },
  { id: 'pelvic_stability_fatigue', label: 'Pelvic Stability & Hip Drop Prevention Under Fatigue' },
  { id: 'stride_symmetry_efficiency', label: 'Bilateral Stride Length & Contact Symmetry' },
];

// ─── ATHLETICS: JUMPER ───
const ATHLETICS_JUMPER_PLAYSTYLES: PlaystyleOption[] = [
  { id: 'speed_based_jumper', label: 'Speed-Based Jumper', shortDesc: 'Relies on high runway approach velocity and reactive low-angle takeoff' },
  { id: 'power_height_jumper', label: 'Power Height Jumper', shortDesc: 'Explosive penultimate drop, massive vertical impulse and high hip height' },
  { id: 'speed_flier', label: 'Speed Flier / Glide Specialist', shortDesc: 'Smooth continuous approach rhythm with minimal deceleration into plant' },
  { id: 'power_plant_lifter', label: 'Power Plant & Lever Lifter', shortDesc: 'Rigid plant leg bracing, extreme torque conversion into vertical lift' },
];

const ATHLETICS_JUMPER_TENDENCIES: TendencyOption[] = [
  { id: 'penultimate_stride_drop', label: 'Penultimate Stride Hip Drop / Lowering' },
  { id: 'free_knee_drive', label: 'Violent Free-Knee & Dual Arm Block' },
  { id: 'hitch_kick_hang', label: 'Hitch-Kick / Hang Flight Aerodynamics' },
  { id: 'curve_approach_lean', label: 'Inward Centrifugal Lean on Curve (High Jump)' },
  { id: 'stiff_plant_ankle', label: 'Isometric Ankle Pre-Activation at Plant' },
];

const ATHLETICS_JUMPER_GOALS: GoalOption[] = [
  { id: 'approach_speed_checkmarks', label: 'Runway Approach Speed & Checkmark Consistency' },
  { id: 'takeoff_vertical_force', label: 'Takeoff Impulse & Vertical Force Conversion' },
  { id: 'plant_leg_deceleration', label: 'Plant-Leg Knee Deceleration & Joint Shielding' },
  { id: 'sand_landing_extension', label: 'Active Leg Extension & Forward Roll Sand Landing' },
  { id: 'takeoff_angle_optimization', label: 'Optimal Takeoff Angle (18°-22° Long / 45° High)' },
];

// ─── ATHLETICS: THROWER ───
const ATHLETICS_THROWER_PLAYSTYLES: PlaystyleOption[] = [
  { id: 'rotational_spinner', label: 'Rotational Spinner', shortDesc: 'Continuous centrifugal acceleration across ring (Discus / Rotational Shot)' },
  { id: 'linear_glider', label: 'Linear Glider', shortDesc: 'Explosive linear hop across ring with strong reverse block (Glide Shot Put)' },
  { id: 'elastic_whipper', label: 'Elastic Javelin Whipper', shortDesc: 'High runway speed, explosive crossover, deep thoracic arch whip' },
  { id: 'stiff_block_stopper', label: 'Heavy Power Brace Thrower', shortDesc: 'Massive ground force anchoring, rigid non-dominant side wall' },
];

const ATHLETICS_THROWER_TENDENCIES: TendencyOption[] = [
  { id: 'wide_right_sweep', label: 'Wide Right-Leg Sweep Across Ring Center' },
  { id: 'power_position_brace', label: 'Deep Power Position Base & Chin-Knee-Toe Alignment' },
  { id: 'stiff_left_side_block', label: 'Stiff Non-Dominant Leg & Arm Block' },
  { id: 'hip_shoulder_separation', label: 'Extreme Hip-Shoulder Separation & Torsional Stretch' },
  { id: 'aggressive_delivery_follow', label: 'Aggressive High-Point Release & Reverse Follow-Through' },
];

const ATHLETICS_THROWER_GOALS: GoalOption[] = [
  { id: 'left_leg_blocking_force', label: 'Non-Dominant Leg Ground Force Blocking' },
  { id: 'kinetic_chain_sequence', label: 'Legs-to-Hips-to-Chest-to-Arm Kinetic Sequence' },
  { id: 'rotational_speed_ring', label: 'Ring Entry Acceleration & Center Balance' },
  { id: 'release_velocity_angle', label: 'Implement Release Velocity & Optimal Launch Angle' },
  { id: 'rotational_core_stability', label: 'Thoracic Extension & Lower-Back Deceleration Safety' },
];

// ─────────────────────────────────────────────────────────────────────────────
// OVERALL SPORT PERSONALIZATION CONFIG MAP
// ─────────────────────────────────────────────────────────────────────────────

export const SPORT_PERSONALIZATION_CONFIG: Record<string, Record<string, RolePersonalizationConfig>> = {
  cricket: {
    batsman: {
      roleTitle: 'Cricket Batsman',
      craftType: 'standard',
      playstyles: CRICKET_BATSMAN_PLAYSTYLES,
      tendencies: CRICKET_BATSMAN_TENDENCIES,
      roleGoals: CRICKET_BATSMAN_GOALS,
      craftFields: [
        {
          id: 'dominant_hand',
          label: 'Batting Hand',
          options: [
            { id: 'right', label: 'Right-Hand Bat' },
            { id: 'left', label: 'Left-Hand Bat' },
          ],
        },
        {
          id: 'stance',
          label: 'Batting Stance',
          options: [
            { id: 'neutral', label: 'Neutral / Parallel' },
            { id: 'open', label: 'Open / Side-On Hybrid' },
            { id: 'closed', label: 'Closed Stance' },
          ],
        },
      ],
      voicePrompts: {
        descriptionPlaceholder: 'e.g., I usually bat at #3 or #4. I feel comfortable driving through the covers, but against tall left-arm pacers angling into me, I tend to get caught on the crease.',
        goalsPlaceholder: 'e.g., Fixing my head falling over to the off side on the front foot drive and generating more bat speed through the line.',
      },
    },
    bowler: {
      roleTitle: 'Cricket Bowler',
      craftType: 'standard',
      playstyles: [...CRICKET_BOWLER_PACE_PLAYSTYLES, ...CRICKET_BOWLER_SPIN_PLAYSTYLES],
      tendencies: CRICKET_BOWLER_TENDENCIES,
      roleGoals: CRICKET_BOWLER_GOALS,
      craftFields: [
        {
          id: 'dominant_hand',
          label: 'Bowling Arm',
          options: [
            { id: 'right', label: 'Right-Arm' },
            { id: 'left', label: 'Left-Arm' },
          ],
        },
        {
          id: 'stance',
          label: 'Delivery Stride Alignment',
          options: [
            { id: 'side_on', label: 'Side-On Action' },
            { id: 'semi_open', label: 'Semi-Open Action' },
            { id: 'front_on', label: 'Front-On Action' },
          ],
        },
      ],
      voicePrompts: {
        descriptionPlaceholder: 'e.g., Opening bowler aiming for outswing in the first 5 overs, then switching to hard cross-seam deliveries. My run-up sometimes feels rushed.',
        goalsPlaceholder: 'e.g., Better bracing of my front knee at delivery stride to transfer momentum and improve release speed without stressing my lower back.',
      },
    },
    all_rounder: {
      roleTitle: 'Cricket All-Rounder',
      isDualCraft: true,
      craftType: 'all_rounder',
      balanceOptions: CRICKET_ALLROUNDER_BALANCE,
      battingStyles: CRICKET_BATSMAN_PLAYSTYLES,
      bowlingStyles: [...CRICKET_BOWLER_PACE_PLAYSTYLES, ...CRICKET_BOWLER_SPIN_PLAYSTYLES],
      playstyles: CRICKET_ALLROUNDER_BALANCE,
      tendencies: [
        ...CRICKET_BATSMAN_TENDENCIES.slice(0, 3),
        ...CRICKET_BOWLER_TENDENCIES.slice(0, 3),
      ],
      battingGoals: CRICKET_BATSMAN_GOALS,
      roleGoals: [
        ...CRICKET_BATSMAN_GOALS.slice(0, 3),
        ...CRICKET_BOWLER_GOALS.slice(0, 3),
      ],
      craftFields: [
        {
          id: 'dominant_hand',
          label: 'Batting Hand',
          options: [
            { id: 'right', label: 'Right-Hand Bat' },
            { id: 'left', label: 'Left-Hand Bat' },
          ],
        },
        {
          id: 'dominant_foot',
          label: 'Bowling Arm',
          options: [
            { id: 'right', label: 'Right-Arm Bowler' },
            { id: 'left', label: 'Left-Arm Bowler' },
          ],
        },
        {
          id: 'stance',
          label: 'Batting Stance',
          options: [
            { id: 'neutral', label: 'Neutral' },
            { id: 'open', label: 'Open' },
            { id: 'closed', label: 'Closed' },
          ],
        },
      ],
      voicePrompts: {
        descriptionPlaceholder: 'e.g., Middle-order batsman and first-change medium pacer. I aim to accelerate late in the innings and bowl tight wicket-to-wicket spells.',
        goalsPlaceholder: 'e.g., Managing physical workload across both skills and improving my front-foot stability when driving under fatigue.',
      },
    },
    wicketkeeper: {
      roleTitle: 'Cricket Wicketkeeper & Batsman',
      isDualCraft: true,
      craftType: 'wicketkeeper',
      keepingStyles: CRICKET_WICKETKEEPER_PLAYSTYLES,
      keepingTendencies: CRICKET_WICKETKEEPER_TENDENCIES,
      keepingGoals: CRICKET_WICKETKEEPER_GOALS,
      battingStyles: CRICKET_BATSMAN_PLAYSTYLES,
      battingGoals: CRICKET_BATSMAN_GOALS,
      playstyles: CRICKET_WICKETKEEPER_PLAYSTYLES,
      tendencies: CRICKET_WICKETKEEPER_TENDENCIES,
      roleGoals: [
        ...CRICKET_WICKETKEEPER_GOALS.slice(0, 3),
        ...CRICKET_BATSMAN_GOALS.slice(0, 3),
      ],
      craftFields: [
        {
          id: 'dominant_hand',
          label: 'Batting Hand',
          options: [
            { id: 'right', label: 'Right-Hand Bat' },
            { id: 'left', label: 'Left-Hand Bat' },
          ],
        },
        {
          id: 'stance',
          label: 'Batting Stance',
          options: [
            { id: 'neutral', label: 'Neutral' },
            { id: 'open', label: 'Open' },
            { id: 'closed', label: 'Closed' },
          ],
        },
      ],
      voicePrompts: {
        descriptionPlaceholder: 'e.g., Primary keeper standing up to spinners and opening the batting in limited-overs cricket.',
        goalsPlaceholder: 'e.g., Faster lateral push-off when diving to my non-dominant side, and maintaining soft hands while crouched for long sessions.',
      },
    },
  },
  football: {
    striker: {
      roleTitle: 'Striker / Center Forward',
      craftType: 'standard',
      playstyles: FOOTBALL_STRIKER_PLAYSTYLES,
      tendencies: FOOTBALL_STRIKER_TENDENCIES,
      roleGoals: FOOTBALL_STRIKER_GOALS,
      craftFields: [
        {
          id: 'dominant_foot',
          label: 'Dominant Striking Foot',
          options: [
            { id: 'right', label: 'Right Foot' },
            { id: 'left', label: 'Left Foot' },
            { id: 'both', label: 'Both Feet' },
          ],
        },
        {
          id: 'stance',
          label: 'Finishing Zone Preference',
          options: [
            { id: 'neutral', label: 'Inside 6-Yard Box' },
            { id: 'open', label: 'Penalty Area Edge' },
            { id: 'closed', label: 'Angled From Wide' },
          ],
        },
      ],
      voicePrompts: {
        descriptionPlaceholder: 'e.g., Lone striker who excels at holding up play and winning aerial headers, but struggles to turn quickly when receiving with my back to goal.',
        goalsPlaceholder: 'e.g., Explosive first-step acceleration to get separation from center-backs and cleaner ball striking with my weaker foot.',
      },
    },
    winger: {
      roleTitle: 'Winger / Wide Forward',
      craftType: 'standard',
      playstyles: FOOTBALL_WINGER_PLAYSTYLES,
      tendencies: FOOTBALL_WINGER_TENDENCIES,
      roleGoals: FOOTBALL_WINGER_GOALS,
      craftFields: [
        {
          id: 'dominant_foot',
          label: 'Dominant Foot',
          options: [
            { id: 'right', label: 'Right Foot' },
            { id: 'left', label: 'Left Foot' },
            { id: 'both', label: 'Both Feet' },
          ],
        },
        {
          id: 'stance',
          label: 'Preferred Flank',
          options: [
            { id: 'neutral', label: 'Right Wing' },
            { id: 'open', label: 'Left Wing' },
            { id: 'closed', label: 'Both Wings' },
          ],
        },
      ],
      voicePrompts: {
        descriptionPlaceholder: 'e.g., Right winger who loves cutting inside onto my left foot, but defenders are starting to overcommit to blocking the inside cut.',
        goalsPlaceholder: 'e.g., Improving my burst down the outside on my right foot and sharpening my delivery on low driven crosses.',
      },
    },
    central_midfielder: {
      roleTitle: 'Central Midfielder',
      craftType: 'standard',
      playstyles: FOOTBALL_MIDFIELDER_PLAYSTYLES,
      tendencies: FOOTBALL_MIDFIELDER_TENDENCIES,
      roleGoals: FOOTBALL_MIDFIELDER_GOALS,
      craftFields: [
        {
          id: 'dominant_foot',
          label: 'Dominant Foot',
          options: [
            { id: 'right', label: 'Right Foot' },
            { id: 'left', label: 'Left Foot' },
            { id: 'both', label: 'Both Feet' },
          ],
        },
        {
          id: 'stance',
          label: 'Preferred Midfield Zone',
          options: [
            { id: 'neutral', label: 'Holding (#6)' },
            { id: 'open', label: 'Box-to-Box (#8)' },
            { id: 'closed', label: 'Attacking (#10)' },
          ],
        },
      ],
      voicePrompts: {
        descriptionPlaceholder: 'e.g., Central #8 in a 4-3-3 responsible for linking defense and attack. I often get pressed from behind when receiving on the half-turn.',
        goalsPlaceholder: 'e.g., Faster turning speed on my back foot when receiving under pressure and maintaining pass accuracy in the 80th+ minute.',
      },
    },
    centre_back: {
      roleTitle: 'Centre Back / Defender',
      craftType: 'standard',
      playstyles: FOOTBALL_DEFENDER_PLAYSTYLES,
      tendencies: FOOTBALL_DEFENDER_TENDENCIES,
      roleGoals: FOOTBALL_DEFENDER_GOALS,
      craftFields: [
        {
          id: 'dominant_foot',
          label: 'Dominant Foot',
          options: [
            { id: 'right', label: 'Right Foot' },
            { id: 'left', label: 'Left Foot' },
            { id: 'both', label: 'Both Feet' },
          ],
        },
        {
          id: 'stance',
          label: 'Defensive Alignment',
          options: [
            { id: 'neutral', label: 'Right Centre Back' },
            { id: 'open', label: 'Left Centre Back' },
            { id: 'closed', label: 'Central Sweeper' },
          ],
        },
      ],
      voicePrompts: {
        descriptionPlaceholder: 'e.g., Right-sided centre back playing in a high defensive line. Strong in physical and aerial duels, but need to improve recovery speed on balls over the top.',
        goalsPlaceholder: 'e.g., Quicker hip swivel and backward acceleration when strikers make runs in behind, and improved range on driven diagonal switches.',
      },
    },
    goalkeeper: {
      roleTitle: 'Goalkeeper',
      craftType: 'standard',
      playstyles: FOOTBALL_GOALKEEPER_PLAYSTYLES,
      tendencies: FOOTBALL_GOALKEEPER_TENDENCIES,
      roleGoals: FOOTBALL_GOALKEEPER_GOALS,
      craftFields: [
        {
          id: 'dominant_foot',
          label: 'Kicking Foot',
          options: [
            { id: 'right', label: 'Right Foot' },
            { id: 'left', label: 'Left Foot' },
            { id: 'both', label: 'Both Feet' },
          ],
        },
        {
          id: 'dominant_hand',
          label: 'Throwing / Catching Arm',
          options: [
            { id: 'right', label: 'Right Hand' },
            { id: 'left', label: 'Left Hand' },
            { id: 'both', label: 'Both Hands' },
          ],
        },
      ],
      voicePrompts: {
        descriptionPlaceholder: 'e.g., Modern keeper in a team that plays out from the back. Comfortable with short passing, but need to improve explosive lateral push-off when diving low.',
        goalsPlaceholder: 'e.g., Explosive lateral power off my right leg on diving saves and eliminating rebounds on hard low shots.',
      },
    },
  },
  basketball: {
    point_guard: {
      roleTitle: 'Point Guard',
      craftType: 'standard',
      playstyles: BASKETBALL_POINT_GUARD_PLAYSTYLES,
      tendencies: BASKETBALL_POINT_GUARD_TENDENCIES,
      roleGoals: BASKETBALL_POINT_GUARD_GOALS,
      craftFields: [
        {
          id: 'dominant_hand',
          label: 'Shooting Hand',
          options: [
            { id: 'right', label: 'Right-Hand' },
            { id: 'left', label: 'Left-Hand' },
          ],
        },
        {
          id: 'stance',
          label: 'Driving Preference',
          options: [
            { id: 'neutral', label: 'Right-Hand Dominant' },
            { id: 'open', label: 'Left-Hand Dominant' },
            { id: 'closed', label: 'Ambidextrous Finisher' },
          ],
        },
      ],
      voicePrompts: {
        descriptionPlaceholder: 'e.g., Primary ball-handler operating out of pick-and-rolls. I love driving into the paint and kicking out to shooters, but I struggle with decelerating on pull-up jumpers.',
        goalsPlaceholder: 'e.g., Explosive first-step blow-by off the dribble and better landing balance when pulling up from mid-range.',
      },
    },
    shooting_guard: {
      roleTitle: 'Shooting Guard',
      craftType: 'standard',
      playstyles: BASKETBALL_SHOOTING_GUARD_PLAYSTYLES,
      tendencies: BASKETBALL_SHOOTING_GUARD_TENDENCIES,
      roleGoals: BASKETBALL_SHOOTING_GUARD_GOALS,
      craftFields: [
        {
          id: 'dominant_hand',
          label: 'Shooting Hand',
          options: [
            { id: 'right', label: 'Right-Hand' },
            { id: 'left', label: 'Left-Hand' },
          ],
        },
        {
          id: 'stance',
          label: 'Preferred Scoring Zone',
          options: [
            { id: 'neutral', label: 'Above the Break 3PT' },
            { id: 'open', label: 'Corner 3PT' },
            { id: 'closed', label: 'Mid-Range Elbow' },
          ],
        },
      ],
      voicePrompts: {
        descriptionPlaceholder: 'e.g., Perimeter scorer running off screens and pin-downs. Great catch-and-shoot accuracy, but need to improve attacking hard closeouts off the bounce.',
        goalsPlaceholder: 'e.g., Faster release on contested jumpers and two-foot landing deceleration to protect my knees.',
      },
    },
    small_forward: {
      roleTitle: 'Small Forward',
      craftType: 'standard',
      playstyles: BASKETBALL_SMALL_FORWARD_PLAYSTYLES,
      tendencies: BASKETBALL_SMALL_FORWARD_TENDENCIES,
      roleGoals: BASKETBALL_SMALL_FORWARD_GOALS,
      craftFields: [
        {
          id: 'dominant_hand',
          label: 'Shooting Hand',
          options: [
            { id: 'right', label: 'Right-Hand' },
            { id: 'left', label: 'Left-Hand' },
          ],
        },
        {
          id: 'stance',
          label: 'Defensive Assignment',
          options: [
            { id: 'neutral', label: 'Guarding Perimeter (1-2)' },
            { id: 'open', label: 'Guarding Wings (2-3)' },
            { id: 'closed', label: 'Guarding Bigs (3-4)' },
          ],
        },
      ],
      voicePrompts: {
        descriptionPlaceholder: 'e.g., Two-way wing tasked with guarding the opponent’s best perimeter scorer while pushing the pace in transition.',
        goalsPlaceholder: 'e.g., Lateral slide speed against shifty guards and finishing through contact at the rim without losing body control.',
      },
    },
    power_forward: {
      roleTitle: 'Power Forward',
      craftType: 'standard',
      playstyles: BASKETBALL_POWER_FORWARD_PLAYSTYLES,
      tendencies: BASKETBALL_POWER_FORWARD_TENDENCIES,
      roleGoals: BASKETBALL_POWER_FORWARD_GOALS,
      craftFields: [
        {
          id: 'dominant_hand',
          label: 'Shooting Hand',
          options: [
            { id: 'right', label: 'Right-Hand' },
            { id: 'left', label: 'Left-Hand' },
          ],
        },
        {
          id: 'stance',
          label: 'Primary Operating Area',
          options: [
            { id: 'neutral', label: 'Perimeter / 3PT Pop' },
            { id: 'open', label: 'Mid-Post / Elbow' },
            { id: 'closed', label: 'Dunker Spot / Paint' },
          ],
        },
      ],
      voicePrompts: {
        descriptionPlaceholder: 'e.g., Stretch four who spaces the floor with 3-point shooting and crashes the glass for second-chance putbacks.',
        goalsPlaceholder: 'e.g., Faster second jump reaction on offensive rebounds and lateral agility when switched onto guards on the perimeter.',
      },
    },
    center: {
      roleTitle: 'Center',
      craftType: 'standard',
      playstyles: BASKETBALL_CENTER_PLAYSTYLES,
      tendencies: BASKETBALL_CENTER_TENDENCIES,
      roleGoals: BASKETBALL_CENTER_GOALS,
      craftFields: [
        {
          id: 'dominant_hand',
          label: 'Dominant Hand',
          options: [
            { id: 'right', label: 'Right-Hand' },
            { id: 'left', label: 'Left-Hand' },
          ],
        },
        {
          id: 'stance',
          label: 'Post Footwork Pivot',
          options: [
            { id: 'neutral', label: 'Right-Shoulder Hook' },
            { id: 'open', label: 'Left-Shoulder Hook' },
            { id: 'closed', label: 'Face-Up Drive' },
          ],
        },
      ],
      voicePrompts: {
        descriptionPlaceholder: 'e.g., Starting 5 anchoring the defense in drop coverage and rolling hard to the rim for lobs on offense.',
        goalsPlaceholder: 'e.g., Vertical takeoff impulse on rim contests and bilateral landing shock absorption to eliminate knee strain.',
      },
    },
  },
  athletics: {
    sprinter: {
      roleTitle: 'Sprinter (60m - 400m)',
      craftType: 'standard',
      playstyles: ATHLETICS_SPRINTER_PLAYSTYLES,
      tendencies: ATHLETICS_SPRINTER_TENDENCIES,
      roleGoals: ATHLETICS_SPRINTER_GOALS,
      craftFields: [
        {
          id: 'dominant_foot',
          label: 'Front Block Foot',
          options: [
            { id: 'left', label: 'Left Foot Forward' },
            { id: 'right', label: 'Right Foot Forward' },
          ],
        },
        {
          id: 'stance',
          label: 'Foot Strike Pattern',
          options: [
            { id: 'neutral', label: 'Forefoot / Ball of Foot' },
            { id: 'open', label: 'Midfoot Flat Strike' },
            { id: 'closed', label: 'Toe Claw Strike' },
          ],
        },
      ],
      voicePrompts: {
        descriptionPlaceholder: 'e.g., 100m/200m sprinter with explosive first 20m, but struggling to maintain knee lift and posture once upright after 60m.',
        goalsPlaceholder: 'e.g., Reducing ground contact time at maximum velocity and maintaining ankle stiffness without overstriding.',
      },
    },
    middle_distance: {
      roleTitle: 'Middle Distance Runner (800m - 1500m)',
      craftType: 'standard',
      playstyles: ATHLETICS_MIDDLE_DISTANCE_PLAYSTYLES,
      tendencies: ATHLETICS_MIDDLE_DISTANCE_TENDENCIES,
      roleGoals: ATHLETICS_MIDDLE_DISTANCE_GOALS,
      craftFields: [
        {
          id: 'dominant_foot',
          label: 'Lead Break-In Foot',
          options: [
            { id: 'left', label: 'Left Lead' },
            { id: 'right', label: 'Right Lead' },
          ],
        },
        {
          id: 'stance',
          label: 'Primary Foot Strike',
          options: [
            { id: 'neutral', label: 'Midfoot Strike' },
            { id: 'open', label: 'Forefoot Strike' },
            { id: 'closed', label: 'Heel-to-Toe Transition' },
          ],
        },
      ],
      voicePrompts: {
        descriptionPlaceholder: 'e.g., 800m/1500m runner who likes to draft behind the leaders and kick with 250m to go, but ties up in the final 50m.',
        goalsPlaceholder: 'e.g., Improving running economy at sub-maximal threshold and preventing hip drop on the left side during the bell lap.',
      },
    },
    jumper: {
      roleTitle: 'Jumper (High / Long / Triple)',
      craftType: 'standard',
      playstyles: ATHLETICS_JUMPER_PLAYSTYLES,
      tendencies: ATHLETICS_JUMPER_TENDENCIES,
      roleGoals: ATHLETICS_JUMPER_GOALS,
      craftFields: [
        {
          id: 'dominant_foot',
          label: 'Takeoff Foot',
          options: [
            { id: 'left', label: 'Left Foot Takeoff' },
            { id: 'right', label: 'Right Foot Takeoff' },
          ],
        },
        {
          id: 'stance',
          label: 'Flight Technique / Model',
          options: [
            { id: 'neutral', label: 'Hitch-Kick (1.5 / 2.5 Stride)' },
            { id: 'open', label: 'Hang Technique' },
            { id: 'closed', label: 'Fosbury Flop (High Jump)' },
          ],
        },
      ],
      voicePrompts: {
        descriptionPlaceholder: 'e.g., Long jumper converting from sprint background. Fast on the runway but collapsing slightly through the hip at the board on takeoff.',
        goalsPlaceholder: 'e.g., Board accuracy without stuttering on the last 3 strides and maintaining plant-leg knee stiffness on takeoff.',
      },
    },
    thrower: {
      roleTitle: 'Thrower (Shot Put / Discus / Javelin)',
      craftType: 'standard',
      playstyles: ATHLETICS_THROWER_PLAYSTYLES,
      tendencies: ATHLETICS_THROWER_TENDENCIES,
      roleGoals: ATHLETICS_THROWER_GOALS,
      craftFields: [
        {
          id: 'dominant_hand',
          label: 'Throwing Arm',
          options: [
            { id: 'right', label: 'Right-Arm' },
            { id: 'left', label: 'Left-Arm' },
          ],
        },
        {
          id: 'stance',
          label: 'Throwing Technique',
          options: [
            { id: 'neutral', label: 'Rotational Spin (Discus / Shot)' },
            { id: 'open', label: 'Linear Glide (Shot Put)' },
            { id: 'closed', label: 'Javelin Approach & Crossover' },
          ],
        },
      ],
      voicePrompts: {
        descriptionPlaceholder: 'e.g., Rotational shot putter and discus thrower looking to improve right-foot sweep speed into the middle of the circle.',
        goalsPlaceholder: 'e.g., Preventing early opening of the left shoulder and maximizing hip-shoulder separation before final release.',
      },
    },
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// SURFACES, ENVIRONMENT & EQUIPMENT
// ─────────────────────────────────────────────────────────────────────────────

export interface SurfaceOption {
  id: string;
  label: string;
  shortDesc?: string;
}

export interface EnvironmentConfig {
  id: string;
  label: string;
  shortDesc?: string;
  surfaces: SurfaceOption[];
}

export const SPORT_ENVIRONMENTS: Record<string, EnvironmentConfig[]> = {
  cricket: [
    {
      id: 'outdoor_nets',
      label: 'Outdoor Academy Nets',
      shortDesc: 'Dedicated outdoor training nets with bowling run-ups',
      surfaces: [
        { id: 'turf', label: 'Natural Turf Pitch', shortDesc: 'Match-grade grass pitch with true bounce' },
        { id: 'matting', label: 'Coir / Jute Matting', shortDesc: 'Matting laid over compacted dirt or base' },
        { id: 'astro', label: 'AstroTurf / Synthetic Carpet', shortDesc: 'High-wear synthetic carpet over concrete' },
        { id: 'concrete', label: 'Concrete / Cement Pitch', shortDesc: 'Firm unyielding pitch with high, steep bounce' },
      ],
    },
    {
      id: 'open_ground',
      label: 'Open Field / Match Ground',
      shortDesc: 'Full-size cricket stadium or outfield ground',
      surfaces: [
        { id: 'turf', label: 'Natural Turf Match Square', shortDesc: 'Curated natural turf pitch block' },
        { id: 'hybrid_turf', label: 'Hybrid Reinforced Turf', shortDesc: 'Part-synthetic reinforced grass pitch' },
        { id: 'matting_ground', label: 'Matting on Dirt Ground', shortDesc: 'Full matting wicket on open field' },
      ],
    },
    {
      id: 'indoor_centre',
      label: 'Indoor Performance Centre',
      shortDesc: 'Climate-controlled indoor cricket facility',
      surfaces: [
        { id: 'indoor_synthetic', label: 'Indoor Synthetic Cricket Turf', shortDesc: 'Shock-absorbing indoor turf with underlay' },
        { id: 'indoor_wood', label: 'Wooden Sports Hall Floor', shortDesc: 'Fast indoor sprung wooden floor' },
        { id: 'polyurethane_floor', label: 'Point-Elastic Polyurethane', shortDesc: 'High-grip non-slip indoor sports surface' },
      ],
    },
    {
      id: 'home_backyard',
      label: 'Home / Backyard / Driveway',
      shortDesc: 'Residential practice area, driveway, or backyard',
      surfaces: [
        { id: 'concrete_driveway', label: 'Concrete / Paved Driveway', shortDesc: 'Hard driveway or paved courtyard' },
        { id: 'backyard_grass', label: 'Backyard Natural Lawn', shortDesc: 'Uneven residential grass lawn' },
        { id: 'portable_mat', label: 'Roll-out Portable Mat', shortDesc: 'Portable cricket mat on flat surface' },
      ],
    },
  ],
  football: [
    {
      id: 'club_facility',
      label: 'Club Academy Facility',
      shortDesc: 'Professional or academy-standard training ground',
      surfaces: [
        { id: 'natural_grass', label: 'Natural Grass Pitch', shortDesc: 'Well-drained, manicured natural turf' },
        { id: 'hybrid_grass', label: 'Hybrid Reinforced Pitch', shortDesc: 'Reinforced natural grass (e.g. SIS / GrassMaster)' },
        { id: 'artificial_turf_4g', label: '3G / 4G Artificial Turf', shortDesc: 'Rubber-infill modern synthetic turf' },
      ],
    },
    {
      id: 'public_pitch',
      label: 'Local Ground / Public Park',
      shortDesc: 'Community pitch, school field, or public cage',
      surfaces: [
        { id: 'natural_grass', label: 'Natural Grass Field', shortDesc: 'Standard public park grass pitch' },
        { id: 'artificial_turf', label: 'Community 3G Turf', shortDesc: 'Shared public artificial turf' },
        { id: 'cage_concrete', label: 'Concrete / Cage Street Pitch', shortDesc: 'Enclosed hardcourt tarmac cage' },
        { id: 'compacted_dirt', label: 'Compacted Dirt / Sand Pitch', shortDesc: 'Hard dry ground or gravel pitch' },
      ],
    },
    {
      id: 'indoor_turf',
      label: 'Indoor Facility / Futsal Arena',
      shortDesc: 'Enclosed turf pitch or indoor futsal arena',
      surfaces: [
        { id: 'futsal_indoor', label: 'Indoor Futsal Hardcourt', shortDesc: 'Polished hardwood or synthetic futsal floor' },
        { id: 'indoor_turf', label: 'Indoor Synthetic Turf', shortDesc: 'Covered artificial turf pitch' },
      ],
    },
    {
      id: 'home_backyard',
      label: 'Home / Garden / Street',
      shortDesc: 'Residential garden, driveway, or local street',
      surfaces: [
        { id: 'backyard_grass', label: 'Garden Lawn / Grass', shortDesc: 'Residential grass garden' },
        { id: 'concrete_asphalt', label: 'Street Asphalt / Concrete', shortDesc: 'Tarmac street or concrete pavement' },
        { id: 'mini_turf_mat', label: 'Mini Synthetic Turf Mat', shortDesc: 'Small roll-out artificial grass' },
      ],
    },
  ],
  basketball: [
    {
      id: 'indoor_gym',
      label: 'Indoor Gymnasium / Arena',
      shortDesc: 'Standard indoor basketball court',
      surfaces: [
        { id: 'hardwood', label: 'Maple Hardwood Court', shortDesc: 'High-traction sprung wooden court' },
        { id: 'indoor_synthetic', label: 'Synthetic Polyurethane Court', shortDesc: 'Point-elastic cushioned gym surface' },
      ],
    },
    {
      id: 'outdoor_court',
      label: 'Public Outdoor Court / Park',
      shortDesc: 'Community outdoor basketball park',
      surfaces: [
        { id: 'blacktop_asphalt', label: 'Outdoor Blacktop / Asphalt', shortDesc: 'High-friction outdoor asphalt' },
        { id: 'concrete', label: 'Outdoor Smooth Concrete', shortDesc: 'Hard concrete outdoor court' },
        { id: 'rubber_court', label: 'Rubberized Acrylic Court', shortDesc: 'Color-coated cushioned acrylic' },
        { id: 'synthetic_polymer', label: 'Interlocking Sport Tiles', shortDesc: 'Modular snap-in outdoor tiles' },
      ],
    },
    {
      id: 'driveway_hoop',
      label: 'Home Driveway / Half Court',
      shortDesc: 'Single hoop on residential driveway',
      surfaces: [
        { id: 'concrete_driveway', label: 'Concrete Driveway', shortDesc: 'Standard residential concrete' },
        { id: 'asphalt_driveway', label: 'Asphalt Driveway', shortDesc: 'Tarmac / asphalt driveway' },
        { id: 'synthetic_tile', label: 'Backyard Sport Tiles', shortDesc: 'Polymer court tiles on concrete' },
      ],
    },
    {
      id: 'fitness_training_centre',
      label: 'Specialized S&C Training Facility',
      shortDesc: 'Athletic performance & skills centre',
      surfaces: [
        { id: 'hardwood', label: 'Maple Hardwood Court', shortDesc: 'Skills workout wooden court' },
        { id: 'high_traction_rubber', label: 'High-Traction Rubber Floor', shortDesc: 'Plyometric & movement floor' },
      ],
    },
  ],
  athletics: [
    {
      id: 'stadium_track',
      label: 'Standard 400m Outdoor Stadium',
      shortDesc: 'Full 400m Olympic-standard track facility',
      surfaces: [
        { id: 'tartan_track', label: 'Synthetic Tartan / Mondo Track', shortDesc: 'All-weather vulcanized rubber' },
        { id: 'grass_infield', label: 'Natural Grass Infield', shortDesc: 'Infield turf for drills and throws' },
        { id: 'cinder_gravel', label: 'Cinder / Crushed Gravel Track', shortDesc: 'Traditional compacted cinder' },
        { id: 'concrete_ring', label: 'Concrete Throwing Ring / Runway', shortDesc: 'Shot/discus circle or javelin runway' },
      ],
    },
    {
      id: 'indoor_track',
      label: 'Indoor Track & Fieldhouse (200m Banked)',
      shortDesc: 'Indoor climate-controlled competition facility',
      surfaces: [
        { id: 'indoor_mondo', label: '200m Banked Mondo Track', shortDesc: 'High-rebound vulcanized track' },
        { id: 'indoor_tartan', label: 'Synthetic Tartan Sprint Straight', shortDesc: '60m indoor sprint straightaway' },
        { id: 'indoor_rubber_platform', label: 'High-Density Rubber Platform', shortDesc: 'Takeoff and landing area' },
      ],
    },
    {
      id: 'park_trails',
      label: 'Park Trails & Cross-Country Course',
      shortDesc: 'Natural terrain, parks, and hills',
      surfaces: [
        { id: 'grass_trails', label: 'Natural Grass & Dirt Trails', shortDesc: 'Soft uneven natural trails' },
        { id: 'cinder_gravel', label: 'Compacted Gravel / Packed Dirt', shortDesc: 'Firm unpaved running path' },
        { id: 'road_asphalt', label: 'Road / Asphalt Course', shortDesc: 'Hard asphalt road or park path' },
      ],
    },
    {
      id: 'gym_weightroom',
      label: 'Olympic S&C Weightroom',
      shortDesc: 'Strength, power, and acceleration gym',
      surfaces: [
        { id: 'rubber_lifting_floor', label: 'Heavy-Duty Rubber Lifting Floor', shortDesc: 'Impact-absorbing platform' },
        { id: 'indoor_sprint_turf', label: 'Indoor Sprint Prowler Turf', shortDesc: 'Sled and acceleration turf strip' },
      ],
    },
  ],
};

export const EQUIPMENT_OPTIONS: Record<string, { id: string; label: string }[]> = {
  cricket: [
    { id: 'full_kit', label: 'Full Match Gear & Pads' },
    { id: 'balls_and_cones', label: 'Leather/Tennis Balls & Cones' },
    { id: 'gym_weights', label: 'Free Weights & Resistance Bands' },
    { id: 'bowling_machine', label: 'Bowling Machine' },
    { id: 'smart_sensors', label: 'Bat Sensor / Speed Radar' },
  ],
  football: [
    { id: 'match_balls_cones', label: 'Match Footballs & Agility Cones' },
    { id: 'rebounder_wall', label: 'Rebounder Net / Passing Wall' },
    { id: 'mini_target_goals', label: 'Mini Target Goals' },
    { id: 'agility_ladder_hurdles', label: 'Agility Ladder & Speed Hurdles' },
    { id: 'gym_weights_bands', label: 'Gym Weights & Resistance Bands' },
    { id: 'gps_wearable', label: 'GPS Vest / Heart Rate Tracker' },
  ],
  basketball: [
    { id: 'regulation_hoop', label: 'Regulation 10ft Hoop' },
    { id: 'cones_heavy_ball', label: 'Cones & Weighted Basketball' },
    { id: 'shooting_gun', label: 'Automatic Rebounding Machine' },
    { id: 'gym_weights', label: 'Plyometric Boxes & Dumbbells' },
  ],
  athletics: [
    { id: 'starting_blocks', label: 'Sprint Starting Blocks' },
    { id: 'spikes', label: 'Event Spikes (Sprint / Jump / Throw Shoes)' },
    { id: 'timing_gates', label: 'Freelap / Laser Timing Gates' },
    { id: 'sled_chute', label: 'Sprint Sled & Resistance Chute' },
    { id: 'plyo_olympic_weights', label: 'Olympic Barbells & Plyometric Boxes' },
    { id: 'throwing_implements', label: 'Implements (Shot, Discus, Javelin) & Measuring Tape' },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// HELPER GETTERS
// ─────────────────────────────────────────────────────────────────────────────

export const getSportPersonalization = (
  sport: string,
  role?: string,
  subRole?: string
): RolePersonalizationConfig | null => {
  if (!sport) return null;
  const s = sport.toLowerCase().trim();
  const r = (role || '').toLowerCase().trim().replace(/ /g, '_');

  const sportConfig = SPORT_PERSONALIZATION_CONFIG[s];
  if (!sportConfig) return null;

  // Try direct match
  if (r && sportConfig[r]) {
    return sportConfig[r];
  }

  // Cricket aliases
  if (s === 'cricket') {
    if (r.includes('bat') && sportConfig['batsman']) return sportConfig['batsman'];
    if (r.includes('bowl') && sportConfig['bowler']) return sportConfig['bowler'];
    if (r.includes('keeper') && sportConfig['wicketkeeper']) return sportConfig['wicketkeeper'];
    if (r.includes('all') && sportConfig['all_rounder']) return sportConfig['all_rounder'];
  }

  // Football aliases
  if (s === 'football' || s === 'soccer') {
    if (r.includes('striker') || r.includes('forward') || r.includes('center_forward') || r.includes('attack')) {
      return sportConfig['striker'];
    }
    if (r.includes('winger') || r.includes('wide')) {
      return sportConfig['winger'];
    }
    if (r.includes('midfield') || r.includes('box_to_box') || r.includes('playmaker')) {
      return sportConfig['central_midfielder'];
    }
    if (r.includes('back') || r.includes('defend') || r.includes('centre_back') || r.includes('center_back')) {
      return sportConfig['centre_back'];
    }
    if (r.includes('keeper') || r.includes('goalie') || r.includes('shot_stopper')) {
      return sportConfig['goalkeeper'];
    }
  }

  // Basketball aliases
  if (s === 'basketball' || s === 'hoops') {
    if (r.includes('point') || r === 'pg' || r.includes('playmaker')) {
      return sportConfig['point_guard'];
    }
    if (r.includes('shooting') || r === 'sg' || r.includes('perimeter_scorer')) {
      return sportConfig['shooting_guard'];
    }
    if (r.includes('small') || r === 'sf' || r.includes('wing_slasher') || r.includes('wing')) {
      return sportConfig['small_forward'];
    }
    if (r.includes('power') || r === 'pf' || r.includes('post_rebounder')) {
      return sportConfig['power_forward'];
    }
    if (r.includes('center') || r === 'c' || r.includes('rim_anchor') || r.includes('big')) {
      return sportConfig['center'];
    }
  }

  // Athletics aliases
  if (s === 'athletics' || s === 'track' || s === 'track_and_field' || s === 'running') {
    if (r.includes('sprint') || r === 'short_sprint' || r === '100m' || r === '200m' || r === '400m') {
      return sportConfig['sprinter'];
    }
    if (r.includes('middle') || r.includes('distance') || r.includes('runner') || r === 'middle_track' || r === '800m' || r === '1500m' || r === 'mile') {
      return sportConfig['middle_distance'];
    }
    if (r.includes('jump') || r.includes('long_jump') || r.includes('high_jump') || r.includes('triple') || r.includes('vault') || r === 'long_high_jump') {
      return sportConfig['jumper'];
    }
    if (r.includes('throw') || r.includes('shot') || r.includes('discus') || r.includes('javelin') || r.includes('hammer') || r === 'rotational_throw') {
      return sportConfig['thrower'];
    }
  }

  const firstRoleKey = Object.keys(sportConfig)[0];
  return firstRoleKey ? sportConfig[firstRoleKey] : null;
};

export const getEnvironmentsForSport = (sport: string): { id: string; label: string; shortDesc?: string }[] => {
  const s = (sport || '').toLowerCase().trim();
  const envs = SPORT_ENVIRONMENTS[s] || SPORT_ENVIRONMENTS['cricket'];
  return envs.map((e) => ({ id: e.id, label: e.label, shortDesc: e.shortDesc }));
};

export const getSurfacesForSportAndEnvironment = (
  sport: string,
  environmentId?: string
): SurfaceOption[] => {
  const s = (sport || '').toLowerCase().trim();
  const envs = SPORT_ENVIRONMENTS[s] || SPORT_ENVIRONMENTS['cricket'];
  if (!environmentId) return [];
  const matched = envs.find((e) => e.id === environmentId);
  return matched ? matched.surfaces : [];
};

export const getSurfacesForSport = (sport: string): SurfaceOption[] => {
  const s = (sport || '').toLowerCase().trim();
  const envs = SPORT_ENVIRONMENTS[s] || SPORT_ENVIRONMENTS['cricket'];
  const seen = new Set<string>();
  const list: SurfaceOption[] = [];
  for (const env of envs) {
    for (const surf of env.surfaces) {
      if (!seen.has(surf.id)) {
        seen.add(surf.id);
        list.push(surf);
      }
    }
  }
  return list;
};

export const getEquipmentForSport = (sport: string) => {
  const s = (sport || '').toLowerCase().trim();
  return EQUIPMENT_OPTIONS[s] || EQUIPMENT_OPTIONS['cricket'];
};
