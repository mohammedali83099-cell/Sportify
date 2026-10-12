/**
 * SPORT ASSESSMENT SYSTEM CONFIGURATION
 * Overarching sport metadata, visual theme tokens, and matrix integrations.
 */

import { ROLE_ASSESSMENT_MATRIX, getRoleAssessmentConfig } from './roleAssessmentMatrix';
import { PROTOCOL_GUIDE_MATRIX, getProtocolGuide } from './protocolGuideMatrix';

import { SPORT_KEYS, normalizeSport } from '../utils/sport';
export { SPORT_KEYS, normalizeSport };

export const SPORT_THEMES = {
  [SPORT_KEYS.CRICKET]: {
    sportKey: 'cricket',
    displayName: 'Cricket',
    badgeLabel: 'Cricket Biomechanics',
    accentColor: 'emerald',
    accentBorder: 'border-emerald-500/30',
    accentBg: 'bg-emerald-500/10',
    accentText: 'text-emerald-400',
    dotColor: 'bg-emerald-400',
  },
  [SPORT_KEYS.FOOTBALL]: {
    sportKey: 'football',
    displayName: 'Football',
    badgeLabel: 'Football Biomechanics',
    accentColor: 'emerald',
    accentBorder: 'border-emerald-500/30',
    accentBg: 'bg-emerald-500/10',
    accentText: 'text-emerald-400',
    dotColor: 'bg-emerald-400',
  },
  [SPORT_KEYS.BASKETBALL]: {
    sportKey: 'basketball',
    displayName: 'Basketball',
    badgeLabel: 'Basketball Biomechanics',
    accentColor: 'amber',
    accentBorder: 'border-amber-500/30',
    accentBg: 'bg-amber-500/10',
    accentText: 'text-amber-400',
    dotColor: 'bg-amber-400',
  },
  [SPORT_KEYS.ATHLETICS]: {
    sportKey: 'athletics',
    displayName: 'Athletics',
    badgeLabel: 'Athletics Biomechanics',
    accentColor: 'cyan',
    accentBorder: 'border-cyan-500/30',
    accentBg: 'bg-cyan-500/10',
    accentText: 'text-cyan-400',
    dotColor: 'bg-cyan-400',
  },
};

/**
 * Single unified resolver for complete sport + role assessment state.
 */
export const getSportAssessmentContext = ({ sport, role, subRole }) => {
  const normSport = normalizeSport(sport);
  if (!normSport) return null;

  const theme = SPORT_THEMES[normSport];
  const roleConfig = getRoleAssessmentConfig(normSport, role);

  if (!roleConfig) {
    return null;
  }

  // Primary protocol guide
  const primaryGuide = getProtocolGuide(roleConfig.recommendedProtocolId);

  // Foundational options
  const foundationalOptions = (roleConfig.foundationalChoices || []).map((protoId) => {
    const guide = getProtocolGuide(protoId);
    return {
      protocolId: protoId,
      name: guide.name,
      shortPurpose: guide.shortPurpose,
      tag: protoId === 'squat' ? 'Mobility & Knee Stability' : 'Power & Deceleration',
    };
  });

  return {
    sportKey: normSport,
    theme,
    roleConfig,
    primaryProtocolId: roleConfig.recommendedProtocolId,
    primaryGuide,
    foundationalOptions,
    notice: roleConfig.notice,
  };
};

export { ROLE_ASSESSMENT_MATRIX, PROTOCOL_GUIDE_MATRIX, getProtocolGuide, getRoleAssessmentConfig };
