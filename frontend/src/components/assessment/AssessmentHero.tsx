import React from 'react';

export interface AssessmentHeroProps {
  title: string;
  subtitle?: string;
  sportName?: string;
  badgeLabel?: string;
  roleName?: string | null;
  subRole?: string | null;
  experienceLevel?: string | null;
}

export const AssessmentHero: React.FC<AssessmentHeroProps> = ({
  title,
  subtitle,
  sportName,
  badgeLabel,
  roleName,
  subRole,
  experienceLevel,
}) => {
  const formatTitle = (str?: string | null) => {
    if (!str) return 'Athlete';
    return str
      .replace(/_/g, ' ')
      .split(' ')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ');
  };

  const displayRole = formatTitle(subRole || roleName);
  const displaySport = formatTitle(sportName);

  return (
    <div className="rounded-2xl bg-gradient-to-b from-white/[0.04] to-white/[0.01] backdrop-blur-md border border-white/[0.08] p-5 sm:p-6 shadow-xl relative overflow-hidden space-y-2 select-none">
      {/* Sport & Role Context Chips */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/[0.05] border border-white/10 text-slate-200 text-xs font-sans font-medium backdrop-blur-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
          <span>{badgeLabel || `${displaySport} Assessment`}</span>
        </span>

        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-white/[0.02] border border-white/[0.07] text-slate-400 text-xs font-sans backdrop-blur-sm">
          {displayRole} • {experienceLevel || 'Intermediate'}
        </span>
      </div>

      {/* Main Title & Role Subtitle */}
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-white font-heading tracking-tight leading-snug">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs text-slate-400 mt-1 font-sans leading-relaxed max-w-2xl">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
};

export default AssessmentHero;
