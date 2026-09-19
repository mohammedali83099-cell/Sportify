import React from 'react';

export interface SportifyLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'hero';
  variant?: 'full' | 'mark' | 'stacked' | 'hero';
  showTagline?: boolean;
  showText?: boolean;
  className?: string;
}

/**
 * Sportify Official Product Brand Component
 * Renders the authentic metallic S emblem and embossed wordmark with seamless alpha transparency.
 * Supports: 'full' (horizontal lockup), 'mark' (emblem only), 'stacked' / 'hero' (centered emblem over wordmark).
 */
export const SportifyLogo: React.FC<SportifyLogoProps> = ({
  size = 'md',
  variant = 'full',
  showTagline = false,
  showText = true,
  className = '',
}) => {
  // Height map for the authentic S emblem mark
  const markHeightMap: Record<string, string> = {
    xs: 'h-5',
    sm: 'h-6',
    md: 'h-7 sm:h-8',
    lg: 'h-9 sm:h-10',
    xl: 'h-14 sm:h-16',
    hero: 'h-16 sm:h-20 md:h-24',
  };

  // Height map for the authentic metallic SPORTIFY wordmark
  const textHeightMap: Record<string, string> = {
    xs: 'h-2.5',
    sm: 'h-3',
    md: 'h-3.5 sm:h-4',
    lg: 'h-4.5 sm:h-5',
    xl: 'h-7 sm:h-8',
    hero: 'h-4 sm:h-5 md:h-6',
  };

  const currentMarkHeight = markHeightMap[size] || markHeightMap.md;
  const currentTextHeight = textHeightMap[size] || textHeightMap.md;

  // Standalone Mark Only
  if (variant === 'mark' || !showText) {
    return (
      <div className={`inline-flex items-center select-none ${className}`}>
        <img
          src="/sportify-mark.png"
          alt="Sportify"
          className={`${currentMarkHeight} w-auto object-contain filter drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]`}
          loading="eager"
        />
      </div>
    );
  }

  // Hero / Stacked Layout (Emblem centered above wordmark & optional tagline)
  if (variant === 'stacked' || variant === 'hero') {
    return (
      <div className={`flex flex-col items-center select-none text-center ${className}`}>
        <div className="relative group mb-3 sm:mb-4">
          <img
            src="/sportify-mark.png"
            alt="Sportify Emblem"
            className={`${currentMarkHeight} w-auto object-contain filter drop-shadow-[0_8px_20px_rgba(0,0,0,0.8)]`}
            loading="eager"
          />
        </div>

        <img
          src="/sportify-text.png"
          alt="SPORTIFY"
          className={`${currentTextHeight} w-auto object-contain filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.7)]`}
          loading="eager"
        />

        {(showTagline || variant === 'hero') && (
          <span className="font-sans text-[9px] sm:text-[11px] font-semibold tracking-[0.34em] text-slate-400/90 uppercase mt-2 sm:mt-2.5">
            TRAIN. COMPETE. EVOLVE.
          </span>
        )}
      </div>
    );
  }

  // Default 'full' Horizontal Product Logo: [ S-Mark ] [ SPORTIFY ]
  return (
    <div className={`inline-flex items-center gap-2 sm:gap-2.5 select-none ${className}`}>
      <img
        src="/sportify-mark.png"
        alt="Sportify"
        className={`${currentMarkHeight} w-auto object-contain filter drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]`}
        loading="eager"
      />
      <div className="flex flex-col justify-center">
        <img
          src="/sportify-text.png"
          alt="SPORTIFY"
          className={`${currentTextHeight} w-auto object-contain filter drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)]`}
          loading="eager"
        />
        {showTagline && (
          <span className="font-sans text-[7px] sm:text-[8px] font-medium tracking-[0.26em] text-slate-400 uppercase mt-0.5">
            TRAIN. COMPETE. EVOLVE.
          </span>
        )}
      </div>
    </div>
  );
};

export default SportifyLogo;
