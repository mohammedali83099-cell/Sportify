/**
 * Lightweight Sport Key & Normalization Utilities.
 * Free of heavy protocol matrices to keep root layout shell lightweight.
 */

export const SPORT_KEYS = {
  CRICKET: 'cricket',
  FOOTBALL: 'football',
  BASKETBALL: 'basketball',
  ATHLETICS: 'athletics',
} as const;

export type SportKey = typeof SPORT_KEYS[keyof typeof SPORT_KEYS];

/**
 * Safely normalize sport parameter.
 * Returns null if the sport is unsupported, enabling the UI to render a clear recovery screen.
 */
export const normalizeSport = (sport?: string | null): string | null => {
  if (!sport) return null;
  const s = String(sport).trim().toLowerCase();
  if (s === 'cricket' || s.startsWith('cricket')) return SPORT_KEYS.CRICKET;
  if (s === 'football' || s === 'soccer' || s.startsWith('foot')) return SPORT_KEYS.FOOTBALL;
  if (s === 'basketball' || s.startsWith('basket')) return SPORT_KEYS.BASKETBALL;
  if (s === 'athletics' || s.startsWith('athlet') || s === 'track_and_field' || s === 'sprint') return SPORT_KEYS.ATHLETICS;
  return null;
};
