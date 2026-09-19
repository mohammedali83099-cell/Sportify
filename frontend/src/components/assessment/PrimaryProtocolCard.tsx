import React, { useState } from 'react';
import { useAthleteStore } from '../../store/athleteStore';
import { getRoleBenchmarks } from '../../config/taxonomyBenchmarks';
import BiomechanicalRadarChart, { RadarMetricInput } from '../common/BiomechanicalRadarChart';
import { CheckIcon, TargetIcon } from '../common/Icons';

export interface ProtocolMetricConfig {
  key?: string;
  label: string;
  desc?: string;
  benchmark?: number;
}

export interface ProtocolConfig {
  id: string;
  name: string;
  metrics: ProtocolMetricConfig[];
  [key: string]: any;
}

export interface PrimaryProtocolCardProps {
  protocol: ProtocolConfig;
  status?: 'available' | 'foundation' | 'coming_soon' | string;
  roleReason?: string;
  isSelected?: boolean;
}

/**
 * Match protocol metrics with role benchmarks and athlete's movement scores if available.
 */
function mapProtocolToRadarMetrics(
  metrics: ProtocolMetricConfig[],
  movementScores: Record<string, number> | null,
  roleBenchmarks: Record<string, number>
): RadarMetricInput[] {
  if (!metrics || metrics.length === 0) return [];

  const scores = movementScores || {};
  const hasScores = Object.keys(scores).length > 0;
  const benchmarks = roleBenchmarks || {};

  return metrics.map((m) => {
    const key = m.key || m.label.toLowerCase().replace(/[^a-z0-9]/g, '_');

    // 1. Look up role-specific benchmark from taxonomy
    let benchmark = 70;
    if (benchmarks[key] !== undefined) {
      benchmark = benchmarks[key];
    } else {
      const matchedBench = Object.entries(benchmarks).find(([k]) => {
        const cleanK = k.toLowerCase();
        return key.includes(cleanK) || cleanK.includes(key);
      });
      if (matchedBench) {
        benchmark = matchedBench[1];
      }
    }

    // 2. Look up athlete's measured score if available
    let score: number | null = null;
    if (hasScores) {
      if (scores[key] !== undefined && typeof scores[key] === 'number') {
        score = scores[key];
      } else {
        const slug = m.label.toLowerCase().replace(/[^a-z0-9]/g, '_');
        if (scores[slug] !== undefined && typeof scores[slug] === 'number') {
          score = scores[slug];
        } else {
          const matchedEntry = Object.entries(scores).find(([k]) => {
            const cleanK = k.toLowerCase();
            return (
              key.includes(cleanK) ||
              cleanK.includes(key) ||
              (key.includes('knee') && cleanK.includes('knee')) ||
              (key.includes('hip') && cleanK.includes('hip')) ||
              (key.includes('torso') && (cleanK.includes('posture') || cleanK.includes('upper_body'))) ||
              (key.includes('balance') && cleanK.includes('balance')) ||
              (key.includes('explosive') && cleanK.includes('explosive')) ||
              (key.includes('symmetry') && cleanK.includes('symmetry'))
            );
          });
          if (matchedEntry && typeof matchedEntry[1] === 'number') {
            score = matchedEntry[1];
          }
        }
      }
    }

    return {
      key,
      label: m.label,
      desc: m.desc || '',
      benchmark: Math.round(benchmark),
      score: typeof score === 'number' ? Math.round(score) : null,
    };
  });
}

export const PrimaryProtocolCard: React.FC<PrimaryProtocolCardProps> = ({
  protocol,
  status = 'available',
  roleReason,
  isSelected,
}) => {
  const profile = useAthleteStore((state) => state.profile);
  const currentAssessment = useAthleteStore((state) => state.currentAssessment);

  const [hoveredKey, setHoveredKey] = useState<string | null>(null);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const activeKey = hoveredKey || selectedKey;

  if (!protocol) return null;

  const getStatusBadge = () => {
    switch (status) {
      case 'available':
        return {
          label: 'Recommended Protocol',
          classes: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400',
        };
      case 'foundation':
        return {
          label: 'Foundational Baseline',
          classes: 'bg-sky-500/15 border-sky-500/30 text-sky-400',
        };
      case 'coming_soon':
        return {
          label: 'In Development',
          classes: 'bg-amber-500/15 border-amber-500/30 text-amber-400',
        };
      default:
        return {
          label: 'Active Assessment',
          classes: 'bg-white/10 border-white/20 text-white',
        };
    }
  };

  const badge = getStatusBadge();
  const movementScores = (currentAssessment as any)?.movement_scores || null;

  // Retrieve athlete's role-specific benchmarks from taxonomy
  const roleBenchmarks = getRoleBenchmarks(
    profile?.sport || 'cricket',
    profile?.primary_role || 'athlete',
    profile?.secondary_role || undefined,
    profile?.experience_level || 'intermediate'
  );

  const radarMetrics = mapProtocolToRadarMetrics(
    protocol.metrics,
    movementScores,
    roleBenchmarks
  );

  const isCalibrated = Boolean(
    movementScores &&
      Object.keys(movementScores).length > 0 &&
      radarMetrics.some((m) => m.score !== null)
  );

  return (
    <div className="rounded-2xl bg-[#0C0E14]/80 backdrop-blur-md border border-white/[0.08] p-4 sm:p-5 space-y-4 hover:border-white/15 transition-all shadow-lg select-none">
      {/* ── Top Header Row: Status Badge & Active Focus ── */}
      <div className="flex items-center justify-between gap-2">
        <span
          className={`px-2.5 py-0.5 rounded-full border text-[11px] font-sans font-medium ${badge.classes}`}
        >
          {badge.label}
        </span>
        {isSelected && (
          <span className="flex items-center gap-1.5 text-xs text-slate-300 font-sans font-medium">
            <CheckIcon className="w-3.5 h-3.5 text-emerald-400" />
            <span>Active Focus</span>
          </span>
        )}
      </div>

      {/* ── Protocol Title & Role Context (Concise) ── */}
      <div>
        <h2 className="text-base sm:text-lg font-bold text-white font-heading tracking-tight">
          {protocol.name}
        </h2>
        {roleReason && (
          <p className="text-xs text-slate-400 font-sans mt-0.5 leading-snug">
            {roleReason}
          </p>
        )}
      </div>

      {/* ── Dynamic Biomechanical Radar Visualization ── */}
      {radarMetrics.length >= 3 && (
        <div className="pt-2 pb-1 border-t border-white/[0.06] flex flex-col items-center">
          <div className="w-full flex items-center justify-between px-1 mb-1">
            <span className="text-xs font-semibold text-slate-200 font-heading tracking-tight flex items-center gap-1.5">
              <TargetIcon className="w-3.5 h-3.5 text-slate-300" />
              <span>Biomechanical Profile</span>
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              {isCalibrated ? 'Calibrated Baseline' : 'Target Baseline'}
            </span>
          </div>

          <BiomechanicalRadarChart
            metrics={radarMetrics}
            isCalibrated={isCalibrated}
            highlightedKey={activeKey}
            onHoverMetric={setHoveredKey}
            onSelectMetric={(k) => setSelectedKey((prev) => (prev === k ? null : k))}
            className="w-full"
            showLegend={true}
          />
        </div>
      )}

      {/* ── Connected Metric Telemetry Cards Grid ── */}
      {radarMetrics.length > 0 && (
        <div className="pt-2 border-t border-white/[0.06] space-y-2">
          <div
            className={`grid gap-2 ${
              radarMetrics.length === 5
                ? 'grid-cols-2 sm:grid-cols-5'
                : radarMetrics.length === 6
                ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6'
                : 'grid-cols-2 sm:grid-cols-4'
            }`}
          >
            {radarMetrics.map((m) => {
              const isActive = activeKey === m.key;
              const hasScore = isCalibrated && m.score !== null;
              const diff = hasScore && typeof m.score === 'number' ? Math.round(m.score - (m.benchmark || 0)) : null;

              return (
                <div
                  key={m.key}
                  onMouseEnter={() => setHoveredKey(m.key || null)}
                  onMouseLeave={() => setHoveredKey(null)}
                  onClick={() => setSelectedKey((prev) => (prev === m.key ? null : (m.key || null)))}
                  className={`p-2.5 rounded-xl border backdrop-blur-sm flex flex-col justify-between cursor-pointer transition-all duration-150 ${
                    isActive
                      ? 'border-sky-500/40 bg-white/[0.08] shadow-[0_0_16px_rgba(56,189,248,0.12)] ring-1 ring-sky-400/25'
                      : 'border-white/[0.05] bg-white/[0.02] hover:border-white/15 hover:bg-white/[0.04]'
                  }`}
                >
                  {/* Title & Desc */}
                  <div>
                    <div
                      className={`text-xs font-semibold font-sans truncate transition-colors ${
                        isActive ? 'text-white' : 'text-slate-200'
                      }`}
                    >
                      {m.label}
                    </div>
                    {m.desc && (
                      <div className="text-[10px] text-slate-400 font-sans truncate mt-0.5">
                        {m.desc}
                      </div>
                    )}
                  </div>

                  {/* Telemetry Readout */}
                  <div className="mt-2.5 pt-1.5 border-t border-white/[0.04]">
                    {hasScore ? (
                      <div className="flex items-center justify-between text-[11px] font-mono">
                        <span>
                          <strong className="text-sky-400 font-bold">{m.score}</strong>
                          <span className="text-slate-600"> / </span>
                          <span className="text-emerald-400">{m.benchmark}</span>
                        </span>
                        {diff !== null && (
                          <span
                            className={`text-[9.5px] px-1.5 py-0.2 rounded font-bold ${
                              diff >= 0
                                ? 'bg-emerald-500/15 text-emerald-400'
                                : 'bg-rose-500/15 text-rose-400'
                            }`}
                          >
                            {diff >= 0 ? `+${diff}` : diff}
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center justify-between text-[10.5px] font-mono text-slate-400">
                        <span>
                          Target: <strong className="text-emerald-400">{m.benchmark}</strong>
                        </span>
                        <span className="text-[9.5px] text-slate-500">Pending</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default PrimaryProtocolCard;
