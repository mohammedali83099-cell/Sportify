/**
 * PROTOCOL GUIDE MATRIX
 * Single Source of Truth for the 6 supported movement analysis protocols in the backend:
 * - cricket_batting
 * - football_strike
 * - basketball_jump_shot
 * - sprint_mechanics
 * - squat
 * - vertical_jump
 * 
 * Every protocol dynamically controls:
 * - title & short purpose
 * - "what we measure" metric chips
 * - camera placement & framing guide (4 steps)
 * - movement execution instructions & repetition count
 * - warnings & uploader action labels
 */

export const PROTOCOL_GUIDE_MATRIX = {
  football_strike: {
    protocolId: 'football_strike',
    name: 'Football Ball-Striking Mechanics',
    shortPurpose: 'Plant knee stability, striking hip whip, and torso lean at impact.',
    category: 'sport_specific',
    metrics: [
      { key: 'knee_stability', label: 'Plant Knee Stability', desc: 'Shock absorption & plant brace' },
      { key: 'explosive_capacity', label: 'Strike Whip Velocity', desc: 'Peak foot velocity' },
      { key: 'upper_body_posture', label: 'Trunk Over Ball', desc: 'Torso lean angle at impact' },
      { key: 'hip_mobility', label: 'Dynamic Swing Arc', desc: 'Hip extension & swing range' },
      { key: 'balance', label: 'Landing Deceleration', desc: 'Single-leg braking balance' },
    ],
    cameraPlacement: '45° or side-on view, 3–5m away at waist height.',
    framingRequirement: 'Full-body framing covering approach, plant contact, and landing.',
    repetitionCount: '2–3 Strikes (Dominant Foot)',
    movementInstructions: 'Natural 2–3 step run-up, firm plant beside ball, strike through with balanced landing.',
    warningMessage: 'Stationary camera • High contrast • Keep plant foot and ball in frame.',
    uploadLabel: 'Record or Choose Ball-Striking Video',
    analyzeButtonLabel: 'Analyze Ball-Striking Mechanics',
    steps: [
      { step: 1, title: '45° or Side-On', desc: '3–5m away at waist height.' },
      { step: 2, title: 'Full Body Framing', desc: 'Head to toe visible throughout.' },
      { step: 3, title: '2–3 Clean Strikes', desc: 'Dominant foot, natural follow-through.' },
      { step: 4, title: 'Consistent Light', desc: 'Clear lighting without motion blur.' },
    ],
  },

  basketball_jump_shot: {
    protocolId: 'basketball_jump_shot',
    name: 'Basketball Shooting & Elevation Mechanics',
    shortPurpose: 'Vertical elevation, shooting elbow alignment, and landing symmetry.',
    category: 'sport_specific',
    metrics: [
      { key: 'explosive_capacity', label: 'Vertical Elevation', desc: 'Apex jump height' },
      { key: 'upper_body_posture', label: 'Flight Torso Alignment', desc: 'Upright vertical axis' },
      { key: 'knee_stability', label: 'Landing Deceleration', desc: 'Two-foot shock absorption' },
      { key: 'movement_symmetry', label: 'Takeoff Symmetry', desc: 'Balanced elevation' },
      { key: 'balance', label: 'Apex Release Balance', desc: 'Mid-air follow-through' },
    ],
    cameraPlacement: 'Diagonal 45° view, 4m away at chest height.',
    framingRequirement: 'Full flight trajectory with vertical headroom at jump apex.',
    repetitionCount: '2–3 Game-Speed Jump Shots',
    movementInstructions: 'Set base, elevate vertically, extend shooting arm at peak, and land balanced on both feet.',
    warningMessage: 'Leave overhead room so shooting hand does not clip the top frame.',
    uploadLabel: 'Record or Choose Basketball Shooting Video',
    analyzeButtonLabel: 'Analyze Shooting Mechanics',
    steps: [
      { step: 1, title: 'Diagonal 45° Angle', desc: '4m away at chest height.' },
      { step: 2, title: 'Overhead Headroom', desc: 'Hands visible at peak elevation.' },
      { step: 3, title: '2–3 Clean Jumpers', desc: 'Balanced two-foot landing.' },
      { step: 4, title: 'Clear Floor View', desc: 'Unobstructed landing surface.' },
    ],
  },

  cricket_batting: {
    protocolId: 'cricket_batting',
    name: 'Cricket Batting Mechanics',
    shortPurpose: 'Stance stability, head-over-knee balance, lead elbow guidance, and swing flow.',
    category: 'sport_specific',
    metrics: [
      { key: 'knee_stability', label: 'Front Knee Brace', desc: 'Firm lead-knee stability' },
      { key: 'balance', label: 'Head Alignment', desc: 'Head over base & weight forward' },
      { key: 'upper_body_posture', label: 'Lead Elbow Guidance', desc: 'High leading elbow path' },
      { key: 'explosive_capacity', label: 'Downswing Speed', desc: 'Downswing acceleration' },
      { key: 'movement_symmetry', label: 'Transfer Symmetry', desc: 'Bilateral weight shift' },
      { key: 'hip_mobility', label: 'Stride Excursion', desc: 'Front-foot reach mobility' },
    ],
    cameraPlacement: 'Perpendicular side-on view, 3–4m from crease at waist height.',
    framingRequirement: 'Full body visible from footwear to bat top in follow-through.',
    repetitionCount: '2–3 Batting Strokes',
    movementInstructions: 'Natural stance, trigger forward with head over knee, present full bat face.',
    warningMessage: 'Record in consistent lighting with clear contrast between clothing, bat, and pitch.',
    uploadLabel: 'Record or Choose Batting Video',
    analyzeButtonLabel: 'Analyze Batting Mechanics',
    steps: [
      { step: 1, title: 'Side-On Angle', desc: '3–4m perpendicular to crease.' },
      { step: 2, title: 'Full Stance in View', desc: 'Footwear to raised bat visible.' },
      { step: 3, title: '2–3 Clean Strokes', desc: 'Natural tempo and follow-through.' },
      { step: 4, title: 'High Contrast Light', desc: 'Distinct contrast against backdrop.' },
    ],
  },

  sprint_mechanics: {
    protocolId: 'sprint_mechanics',
    name: 'Sprint & Acceleration Mechanics',
    shortPurpose: 'Drive lean angle, high knee recovery punch, and stride rhythm.',
    category: 'sport_specific',
    metrics: [
      { key: 'explosive_capacity', label: 'Stride Velocity', desc: 'Rate of force & foot cadence' },
      { key: 'upper_body_posture', label: 'Drive Phase Angle', desc: 'Forward torso projection' },
      { key: 'hip_mobility', label: 'Hip Excursion', desc: 'Dynamic hip extension range' },
      { key: 'movement_symmetry', label: 'Stride Symmetry', desc: 'Left/right cadence balance' },
      { key: 'knee_stability', label: 'High Knee Drive', desc: 'Lead-knee punch elevation' },
    ],
    cameraPlacement: 'Track-side perpendicular view, 4–6m away at waist height.',
    framingRequirement: 'Wide lateral frame covering 5–7m of drive phase.',
    repetitionCount: '1–2 Acceleration Runs',
    movementInstructions: 'Start 2 steps before frame, sprint through capture zone at 90–100% effort.',
    warningMessage: 'Record at 60 FPS if supported for maximum keypoint precision.',
    uploadLabel: 'Record or Choose Sprint Video',
    analyzeButtonLabel: 'Analyze Sprint Mechanics',
    steps: [
      { step: 1, title: 'Track-Side Angle', desc: '4–6m perpendicular to lane.' },
      { step: 2, title: 'Wide Lateral Frame', desc: 'Capture 3 full consecutive strides.' },
      { step: 3, title: 'Sprint Through Frame', desc: 'Accelerate at 90–100% effort.' },
      { step: 4, title: '60 FPS Recommended', desc: 'Reduces high-speed motion blur.' },
    ],
  },

  squat: {
    protocolId: 'squat',
    name: 'Squat Kinematics Baseline',
    shortPurpose: 'Eccentric knee stability, hip-ankle mobility, and trunk uprightness.',
    category: 'foundation',
    metrics: [
      { key: 'knee_stability', label: 'Knee Valgus Stability', desc: 'Lateral knee tracking' },
      { key: 'hip_mobility', label: 'Squat Depth', desc: 'Hip crease depth' },
      { key: 'upper_body_posture', label: 'Torso Inclination', desc: 'Spine uprightness angle' },
      { key: 'movement_symmetry', label: 'Bilateral Symmetry', desc: 'Weight distribution' },
      { key: 'explosive_capacity', label: 'Ascent Velocity', desc: 'Concentric drive' },
      { key: 'balance', label: 'Deceleration Balance', desc: 'Eccentric descent control' },
    ],
    cameraPlacement: 'Side-on or 45° angle, 2.5–3m away at knee-to-waist height.',
    framingRequirement: 'Entire body visible from feet flat on floor to top of head.',
    repetitionCount: '3 Controlled Repetitions (2s Tempo)',
    movementInstructions: 'Shoulder-width stance, descend until thighs reach parallel, rise smoothly.',
    warningMessage: 'Fitted athletic clothing with knees visible • Keep camera stationary.',
    uploadLabel: 'Record or Choose Squat Baseline Video',
    analyzeButtonLabel: 'Analyze Squat Kinematics',
    steps: [
      { step: 1, title: 'Side or 45° Angle', desc: '2.5–3m away at waist height.' },
      { step: 2, title: 'Full Body Framing', desc: 'Head to feet in continuous view.' },
      { step: 3, title: '3 Smooth Reps', desc: '2s descent tempo to parallel.' },
      { step: 4, title: 'Knees Unobstructed', desc: 'Visible joint lines without baggy clothing.' },
    ],
  },

  vertical_jump: {
    protocolId: 'vertical_jump',
    name: 'Countermovement Jump Power Baseline',
    shortPurpose: 'Triple-extension explosive power, vertical displacement, and landing brake.',
    category: 'foundation',
    metrics: [
      { key: 'explosive_capacity', label: 'Rate of Force (RFD)', desc: 'Takeoff impulse acceleration' },
      { key: 'knee_stability', label: 'Landing Shock Alignment', desc: 'Valgus control on landing' },
      { key: 'hip_mobility', label: 'Triple Extension', desc: 'Hip and ankle drive range' },
      { key: 'upper_body_posture', label: 'Flight Posture', desc: 'Apex spine alignment' },
      { key: 'movement_symmetry', label: 'Takeoff Symmetry', desc: 'Bilateral impulse balance' },
      { key: 'balance', label: 'Deceleration Brake', desc: 'Landing shock absorption' },
    ],
    cameraPlacement: 'Direct side or front view, 3–4m away at waist height.',
    framingRequirement: 'Full athlete visible from floor contact to maximum overhead reach.',
    repetitionCount: '2–3 Maximal Countermovement Jumps',
    movementInstructions: 'Dip into quarter-squat, explode upward with arm swing, land softly on both feet.',
    warningMessage: 'Land softly on both feet simultaneously to absorb landing shock safely.',
    uploadLabel: 'Record or Choose Vertical Jump Video',
    analyzeButtonLabel: 'Analyze Vertical Jump Power',
    steps: [
      { step: 1, title: 'Side or Front Angle', desc: '3–4m away at waist height.' },
      { step: 2, title: '1m Overhead Space', desc: 'Vertical headroom at jump peak.' },
      { step: 3, title: '2–3 Max Jumps', desc: 'Soft two-foot landing with reset.' },
      { step: 4, title: 'Feet & Floor Visible', desc: 'Unobstructed landing surface.' },
    ],
  },
};

/**
 * Get protocol guide by protocol ID with safe fallback
 */
export const getProtocolGuide = (protocolId) => {
  return PROTOCOL_GUIDE_MATRIX[protocolId] || PROTOCOL_GUIDE_MATRIX.vertical_jump;
};
