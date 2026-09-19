import React from 'react';

export interface BenchmarkBarProps {
  name: string;
  score?: number;
  benchmark?: number;
  gap?: number;
  tier?: 'bottleneck' | 'critical' | 'dev_area' | 'development_areas' | 'proficient' | 'strength' | 'strengths' | string;
  subtitle?: string;
  className?: string;
}

/**
 * BenchmarkBar
 * 
 * Reusable visual comparison between an athlete's measured score and their role target.
 * Uses existing Sportify values only (score, benchmark, gap, tier category).
 * Does NOT invent new classification logic or scores.
 */
export const BenchmarkBar: React.FC<BenchmarkBarProps> = ({
  name,
  score = 0,
  benchmark = 75,
  gap,
  tier,
  subtitle,
  className = '',
}) => {
  const numericScore = Math.max(0, Math.min(100, Math.round(score)));
  const numericBench = Math.max(0, Math.min(100, Math.round(benchmark)));
  const calculatedGap = gap !== undefined ? gap : Math.round(numericScore - numericBench);

  // Authoritative Sportify color coding
  const getStatusTheme = () => {
    if (tier === 'bottleneck' || tier === 'critical') {
      return {
        bar: 'bg-rose-500',
        badge: 'text-rose-400 bg-rose-500/10 border-rose-500/25',
        label: calculatedGap < 0 ? `${calculatedGap} pts` : `-${Math.abs(calculatedGap)} pts`,
      };
    }
    if (tier === 'dev_area' || tier === 'development_areas') {
      return {
        bar: 'bg-amber-400',
        badge: 'text-amber-400 bg-amber-500/10 border-amber-500/25',
        label: calculatedGap < 0 ? `${calculatedGap} pts` : `-${Math.abs(calculatedGap)} pts`,
      };
    }
    if (tier === 'strength' || tier === 'strengths') {
      return {
        bar: 'bg-emerald-400',
        badge: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/25',
        label: `+${Math.abs(calculatedGap)} pts`,
      };
    }
    // Default / Proficient / On Target
    const isTargetMet = numericScore >= numericBench;
    return {
      bar: isTargetMet ? 'bg-slate-200' : 'bg-amber-400',
      badge: isTargetMet
        ? 'text-slate-300 bg-white/[0.05] border-white/10'
        : 'text-amber-400 bg-amber-500/10 border-amber-500/25',
      label: isTargetMet ? 'Target met' : `${calculatedGap} pts`,
    };
  };

  const theme = getStatusTheme();

  return (
    <div className={`space-y-1.5 ${className}`}>
      {/* Header Row: Attribute Name & Gap Badge */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-baseline gap-2 min-w-0">
          <span className="font-heading font-bold text-slate-200 truncate capitalize text-[13px]">
            {name}
          </span>
          {subtitle && (
            <span className="text-[11px] text-slate-400 font-sans truncate hidden sm:inline">
              {subtitle}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="font-mono font-bold text-slate-200 text-xs">
            {numericScore}
            <span className="text-slate-500 font-normal text-[10px]"> / 100</span>
          </span>
          <span
            className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full border ${theme.badge}`}
          >
            {theme.label}
          </span>
        </div>
      </div>

      {/* Visual Benchmark Track */}
      <div className="relative h-2 w-full rounded-full bg-white/[0.06] overflow-visible">
        {/* Measured Score Bar */}
        <div
          className={`h-full rounded-full transition-all duration-500 ${theme.bar}`}
          style={{ width: `${numericScore}%` }}
        />

        {/* Role Target Marker Line */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-0.5 h-3.5 bg-white/70 rounded-full z-10 pointer-events-none"
          style={{ left: `${numericBench}%` }}
          title={`Role Target: ${numericBench}`}
        />
      </div>

      {/* Target Marker Sublabel */}
      <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 pt-0.5">
        <span>0</span>
        <span style={{ marginLeft: `${Math.max(5, Math.min(85, numericBench - 10))}%` }}>
          Target: {numericBench}
        </span>
        <span>100</span>
      </div>
    </div>
  );
};

export default BenchmarkBar;
