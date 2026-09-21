import React from 'react';

export interface SportGlyphProps {
  sport?: string | null;
  className?: string;
  strokeWidth?: number;
}

/**
 * Professional-grade geometric sport glyphs designed exclusively
 * for the onboarding athletic profile calibration experience.
 * Modern athletic line-weight, precision geometry, zero emojis, zero clip-art.
 */
export const ProfessionalSportGlyph: React.FC<SportGlyphProps> = ({
  sport,
  className = 'w-6 h-6',
  strokeWidth = 1.75,
}) => {
  const s = String(sport || '').toLowerCase().trim();

  // Cricket: Iconic angled willow bat with grip and precision seam ball
  if (s.includes('cricket')) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
      >
        {/* Cricket Bat Handle & Grip */}
        <line x1="16" y1="7" x2="20" y2="3" />
        <line x1="17.5" y1="3.5" x2="19.5" y2="5.5" />
        {/* Cricket Bat Blade */}
        <path d="M13.5 6.5L6.5 13.5c-.8.8-1.2 1.8-1 2.8l.5 2.2 2.2.5c1 .2 2-.2 2.8-1l7-7-4.5-4.5z" />
        {/* Blade Center Spine */}
        <line x1="12" y1="8" x2="8" y2="12" />
        {/* Cricket Ball with Seam */}
        <circle cx="16.5" cy="16.5" r="3.5" />
        <path d="M14.5 15.2c.8.8 1.8 1 2.5.5s1.2-.5 2 .5" />
      </svg>
    );
  }

  // Football (Soccer): Geometric aerodynamic match ball polyhedron
  if (s.includes('foot') || s.includes('soccer')) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
      >
        <circle cx="12" cy="12" r="9" />
        <polygon
          points="12,8 15.5,10.5 14,14.5 10,14.5 8.5,10.5"
          fill="currentColor"
          fillOpacity="0.12"
        />
        <line x1="12" y1="8" x2="12" y2="3" />
        <line x1="15.5" y1="10.5" x2="20" y2="9" />
        <line x1="14" y1="14.5" x2="17.5" y2="19" />
        <line x1="10" y1="14.5" x2="6.5" y2="19" />
        <line x1="8.5" y1="10.5" x2="4" y2="9" />
      </svg>
    );
  }

  // Basketball: Precision sphere with dynamic cross-seams and kinetic arc
  if (s.includes('basket')) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
      >
        <circle cx="12" cy="12" r="9" />
        <line x1="3" y1="12" x2="21" y2="12" />
        <line x1="12" y1="3" x2="12" y2="21" />
        <path d="M5.5 5.5C8.8 8.8 8.8 15.2 5.5 18.5" />
        <path d="M18.5 5.5C15.2 8.8 15.2 15.2 18.5 18.5" />
      </svg>
    );
  }

  // Athletics / Track & Field: Geometric Olympic 400m stadium track oval with sprint lanes & finish line
  if (s.includes('athlet') || s.includes('track') || s.includes('sprint') || s.includes('run')) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
      >
        {/* Outer track boundary (stadium curve) */}
        <rect x="2.5" y="5.5" width="19" height="13" rx="6.5" />
        {/* Middle lane divider (dashed sprint lane) */}
        <rect
          x="4.5"
          y="7.5"
          width="15"
          height="9"
          rx="4.5"
          strokeDasharray="1.5 2"
          strokeOpacity="0.7"
        />
        {/* Inner infield */}
        <rect x="6.5" y="9.5" width="11" height="5" rx="2.5" />
        {/* Finish line across lanes */}
        <line x1="12" y1="5.5" x2="12" y2="9.5" />
      </svg>
    );
  }

  // Generic athletic fallback mark
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="9" />
      <polygon points="12,6 16,15 8,15" fill="currentColor" fillOpacity="0.15" />
    </svg>
  );
};

export default ProfessionalSportGlyph;
