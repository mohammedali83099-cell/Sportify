import React, { useState } from 'react';

export interface RadarMetricInput {
  label?: string;
  name?: string;
  score?: number | null;
  benchmark?: number;
  key?: string;
  desc?: string;
}

export interface NormalizedRadarMetric {
  key: string;
  label: string;
  desc: string;
  score: number | null;
  benchmark: number;
}

export interface BiomechanicalRadarChartProps {
  metrics?: RadarMetricInput[] | null;
  scores?: Record<string, number | null> | null;
  benchmarks?: Record<string, number> | number | null;
  isCalibrated?: boolean;
  highlightedKey?: string | null;
  onHoverMetric?: ((key: string | null) => void) | null;
  onSelectMetric?: ((key: string | null) => void) | null;
  className?: string;
  showLegend?: boolean;
}

/**
 * BiomechanicalRadarChart
 *
 * Precision SVG radar/spider chart comparing athlete measured scores
 * against sport & role benchmarks. Dynamically calculates polygon vertices
 * for any number of dimensions (N >= 3).
 *
 * Supports bidirectional hover/selection, rich tooltips, and graceful
 * empty/pending calibration states.
 */
export const BiomechanicalRadarChart: React.FC<BiomechanicalRadarChartProps> = ({
  metrics = null,
  scores = null,
  benchmarks = null,
  isCalibrated = true,
  highlightedKey = null,
  onHoverMetric = null,
  onSelectMetric = null,
  className = '',
  showLegend = true,
}) => {
  const [internalHoverIndex, setInternalHoverIndex] = useState<number | null>(null);

  // ── 1. NORMALIZE INPUT METRICS ──────────────────────────────────────────────
  let normalizedMetrics: NormalizedRadarMetric[] = [];

  if (Array.isArray(metrics) && metrics.length > 0) {
    normalizedMetrics = metrics.map((m) => {
      const key = m.key || (m.label || m.name || '').toLowerCase().replace(/[^a-z0-9]/g, '_');
      const hasScore = typeof m.score === 'number' && !isNaN(m.score);
      return {
        key,
        label: m.label || m.name || key.replace(/_/g, ' '),
        desc: m.desc || '',
        score: hasScore ? (m.score as number) : null,
        benchmark: typeof m.benchmark === 'number' ? m.benchmark : 70,
      };
    });
  } else if (scores && typeof scores === 'object' && Object.keys(scores).length > 0) {
    normalizedMetrics = Object.entries(scores).map(([k, val]) => {
      let bench = 70;
      if (typeof benchmarks === 'number') {
        bench = benchmarks;
      } else if (benchmarks && typeof benchmarks === 'object' && (benchmarks as Record<string, number>)[k]) {
        bench = (benchmarks as Record<string, number>)[k];
      }
      const label = k
        .replace(/_/g, ' ')
        .split(' ')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(' ');

      const hasScore = typeof val === 'number' && !isNaN(val);
      return {
        key: k,
        label,
        desc: '',
        score: hasScore ? val : null,
        benchmark: bench,
      };
    });
  } else {
    // Default 5-axis baseline fallback
    normalizedMetrics = [
      { key: 'knee_stability', label: 'Joint Stability', desc: '', score: null, benchmark: 70 },
      { key: 'explosive_capacity', label: 'Force Production', desc: '', score: null, benchmark: 72 },
      { key: 'upper_body_posture', label: 'Torso Control', desc: '', score: null, benchmark: 70 },
      { key: 'hip_mobility', label: 'Dynamic Range', desc: '', score: null, benchmark: 68 },
      { key: 'balance', label: 'Deceleration', desc: '', score: null, benchmark: 66 },
    ];
  }

  const N = normalizedMetrics.length;
  if (N < 3) return null;

  // ── 2. GEOMETRY CONSTANTS ──────────────────────────────────────────────────
  const width = 380;
  const height = 310;
  const cx = width / 2;
  const cy = height / 2 - 8;
  const radius = 95;

  // Calculate vertex coordinates for an axis at a given ratio (0 to 1)
  const getPoint = (index: number, ratio: number) => {
    const angle = -Math.PI / 2 + (index * 2 * Math.PI) / N;
    const clampedRatio = Math.max(0, Math.min(1, ratio));
    const r = radius * clampedRatio;
    return {
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
      angle,
    };
  };

  // ── 3. POLYGON STRINGS ─────────────────────────────────────────────────────
  const ringLevels = [0.25, 0.5, 0.75, 1.0];
  const gridRings = ringLevels.map((lvl) => {
    return normalizedMetrics
      .map((_, i) => {
        const pt = getPoint(i, lvl);
        return `${pt.x.toFixed(1)},${pt.y.toFixed(1)}`;
      })
      .join(' ');
  });

  // Role Benchmark polygon points
  const benchmarkPoints = normalizedMetrics
    .map((m, i) => {
      const ratio = m.benchmark / 100;
      const pt = getPoint(i, ratio);
      return `${pt.x.toFixed(1)},${pt.y.toFixed(1)}`;
    })
    .join(' ');

  // Athlete Score polygon points (only when calibrated)
  const athletePoints = isCalibrated
    ? normalizedMetrics
        .map((m, i) => {
          const ratio = (m.score !== null ? m.score : 0) / 100;
          const pt = getPoint(i, ratio);
          return `${pt.x.toFixed(1)},${pt.y.toFixed(1)}`;
        })
        .join(' ')
    : '';

  // ── 4. ACTIVE METRIC RESOLUTION ────────────────────────────────────────────
  let activeIndex: number | null = null;
  if (highlightedKey) {
    const foundIdx = normalizedMetrics.findIndex((m) => m.key === highlightedKey);
    if (foundIdx !== -1) activeIndex = foundIdx;
  }
  if (activeIndex === null && internalHoverIndex !== null) {
    activeIndex = internalHoverIndex;
  }

  const activeMetric = activeIndex !== null ? normalizedMetrics[activeIndex] : null;

  // Compute active point coordinates for tooltip anchoring
  let tooltipX = 50;
  let tooltipY = 50;
  if (activeMetric !== null && activeIndex !== null) {
    const pointRatio =
      isCalibrated && activeMetric.score !== null
        ? activeMetric.score / 100
        : activeMetric.benchmark / 100;
    const pt = getPoint(activeIndex, pointRatio);
    tooltipX = (pt.x / width) * 100;
    tooltipY = (pt.y / height) * 100;
  }

  const handlePointerEnter = (index: number, key: string) => {
    setInternalHoverIndex(index);
    if (onHoverMetric) onHoverMetric(key);
  };

  const handlePointerLeave = () => {
    setInternalHoverIndex(null);
    if (onHoverMetric) onHoverMetric(null);
  };

  const handleClickMetric = (key: string) => {
    if (onSelectMetric) onSelectMetric(key);
  };

  return (
    <div className={`flex flex-col items-center select-none ${className}`}>
      <div className="relative w-full max-w-[360px] sm:max-w-[400px] aspect-[380/310]">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full overflow-visible"
          aria-label="Biomechanical Radar Profile"
        >
          {/* ── Background Concentric Grid Rings ── */}
          {gridRings.map((pts, idx) => (
            <polygon
              key={`ring-${idx}`}
              points={pts}
              fill={idx === 0 ? 'rgba(255, 255, 255, 0.015)' : 'transparent'}
              stroke={idx === 3 ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.05)'}
              strokeWidth={idx === 3 ? '1.2' : '0.8'}
            />
          ))}

          {/* ── Radial Spoke Lines ── */}
          {normalizedMetrics.map((m, i) => {
            const outer = getPoint(i, 1.0);
            const isActive = activeIndex === i;
            return (
              <line
                key={`spoke-${i}`}
                x1={cx}
                y1={cy}
                x2={outer.x}
                y2={outer.y}
                stroke={isActive ? 'rgba(255, 255, 255, 0.35)' : 'rgba(255, 255, 255, 0.07)'}
                strokeDasharray={isActive ? 'none' : '2 2'}
                strokeWidth={isActive ? '1.5' : '1'}
                className="transition-colors duration-150"
              />
            );
          })}

          {/* ── Role Benchmark Polygon (Dashed Emerald Outline) ── */}
          <polygon
            points={benchmarkPoints}
            fill="rgba(16, 185, 129, 0.06)"
            stroke="#10B981"
            strokeWidth="1.5"
            strokeDasharray="4 3"
            strokeLinejoin="round"
            className="transition-all duration-200"
          />

          {/* Benchmark Vertices */}
          {normalizedMetrics.map((m, i) => {
            const pt = getPoint(i, m.benchmark / 100);
            const isActive = activeIndex === i;
            return (
              <g key={`bench-vert-${i}`}>
                {isActive && (
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r="8"
                    fill="rgba(16, 185, 129, 0.2)"
                    className="animate-pulse"
                  />
                )}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isActive ? '4' : '2.5'}
                  fill="#10B981"
                  stroke="#0C0E14"
                  strokeWidth="1"
                  className="transition-all duration-150"
                />
              </g>
            );
          })}

          {/* ── Athlete Score Polygon (Sky/Cyan with Translucent Fill) ── */}
          {isCalibrated ? (
            <>
              <polygon
                points={athletePoints}
                fill="rgba(56, 189, 248, 0.22)"
                stroke="#38BDF8"
                strokeWidth="2"
                strokeLinejoin="round"
                className="transition-all duration-200"
              />
              {/* Athlete Vertices */}
              {normalizedMetrics.map((m, i) => {
                if (m.score === null) return null;
                const pt = getPoint(i, m.score / 100);
                const isActive = activeIndex === i;
                return (
                  <g key={`score-vert-${i}`}>
                    {isActive && (
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r="9.5"
                        fill="none"
                        stroke="#38BDF8"
                        strokeWidth="1.5"
                        strokeOpacity="0.6"
                        className="animate-ping"
                      />
                    )}
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={isActive ? '5.5' : '3.5'}
                      fill="#38BDF8"
                      stroke="#0C0E14"
                      strokeWidth="1.5"
                      className="transition-all duration-150"
                    />
                  </g>
                );
              })}
            </>
          ) : (
            /* Calibration Pending State Center Pill */
            <g transform={`translate(${cx}, ${cy})`}>
              <rect
                x="-64"
                y="-13"
                width="128"
                height="26"
                rx="13"
                fill="#0C0E14"
                stroke="rgba(255, 255, 255, 0.12)"
              />
              <text
                x="0"
                y="3.5"
                textAnchor="middle"
                fill="#94A3B8"
                fontSize="9.5"
                fontFamily="IBM Plex Sans, sans-serif"
                fontWeight="600"
                letterSpacing="0.02em"
              >
                Calibration Pending
              </text>
            </g>
          )}

          {/* ── Axis Labels & Values ── */}
          {normalizedMetrics.map((m, i) => {
            const angle = -Math.PI / 2 + (i * 2 * Math.PI) / N;
            const labelR = radius + 22;
            const lx = cx + labelR * Math.cos(angle);
            const ly = cy + labelR * Math.sin(angle);

            const cos = Math.cos(angle);
            const sin = Math.sin(angle);
            let anchor: 'middle' | 'inherit' | 'start' | 'end' = 'middle';
            if (cos > 0.3) anchor = 'start';
            else if (cos < -0.3) anchor = 'end';

            let yOffset = 3;
            if (sin < -0.7) yOffset = -4;
            else if (sin > 0.7) yOffset = 10;

            const isActive = activeIndex === i;
            const isDimmed = activeIndex !== null && !isActive;

            return (
              <g
                key={`label-group-${i}`}
                transform={`translate(${lx}, ${ly + yOffset})`}
                className="cursor-pointer transition-opacity duration-150"
                opacity={isDimmed ? 0.45 : 1}
                onMouseEnter={() => handlePointerEnter(i, m.key)}
                onMouseLeave={handlePointerLeave}
                onClick={() => handleClickMetric(m.key)}
              >
                {/* Metric Title */}
                <text
                  x="0"
                  y="0"
                  textAnchor={anchor}
                  fill={isActive ? '#FFFFFF' : '#CBD5E1'}
                  fontSize="10"
                  fontFamily="Open Sans, sans-serif"
                  fontWeight={isActive ? 'bold' : '600'}
                  className="transition-colors duration-150"
                >
                  {m.label}
                </text>

                {/* Score / Target readout */}
                <text
                  x="0"
                  y="12"
                  textAnchor={anchor}
                  fontSize="9.5"
                  fontFamily="IBM Plex Mono, monospace"
                >
                  {isCalibrated && m.score !== null ? (
                    <>
                      <tspan fill="#38BDF8" fontWeight="bold">
                        {Math.round(m.score)}
                      </tspan>
                      <tspan fill="#64748B"> / </tspan>
                      <tspan fill="#10B981">{Math.round(m.benchmark)}</tspan>
                    </>
                  ) : (
                    <tspan fill="#10B981" opacity="0.85">
                      Target: {Math.round(m.benchmark)}
                    </tspan>
                  )}
                </text>
              </g>
            );
          })}

          {/* ── Invisible Interactive Hover Hit Areas ── */}
          {normalizedMetrics.map((m, i) => {
            const outer = getPoint(i, 1.0);
            return (
              <g key={`hit-area-${i}`}>
                <line
                  x1={cx}
                  y1={cy}
                  x2={outer.x}
                  y2={outer.y}
                  stroke="transparent"
                  strokeWidth="20"
                  className="cursor-pointer"
                  onMouseEnter={() => handlePointerEnter(i, m.key)}
                  onMouseLeave={handlePointerLeave}
                  onClick={() => handleClickMetric(m.key)}
                />
                <circle
                  cx={outer.x}
                  cy={outer.y}
                  r="18"
                  fill="transparent"
                  className="cursor-pointer"
                  onMouseEnter={() => handlePointerEnter(i, m.key)}
                  onMouseLeave={handlePointerLeave}
                  onClick={() => handleClickMetric(m.key)}
                />
              </g>
            );
          })}
        </svg>

        {/* ── Floating Interactive Telemetry Tooltip ── */}
        {activeMetric !== null && (
          <div
            className="absolute pointer-events-none z-30 transition-all duration-150 ease-out transform -translate-x-1/2 -translate-y-full -mt-2.5"
            style={{
              left: `${Math.max(18, Math.min(82, tooltipX))}%`,
              top: `${Math.max(22, Math.min(85, tooltipY))}%`,
            }}
          >
            <div className="bg-[#0A0D14]/95 backdrop-blur-md border border-white/20 rounded-xl px-3 py-2 shadow-2xl min-w-[155px] text-left">
              <div className="text-[11px] font-bold text-white font-heading tracking-tight border-b border-white/10 pb-1 mb-1">
                {activeMetric.label}
              </div>
              <div className="space-y-0.5 text-[10px] font-sans">
                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-slate-400">Your Score:</span>
                  {isCalibrated && typeof activeMetric.score === 'number' ? (
                    <span className="font-mono font-bold text-sky-400">
                      {Math.round(activeMetric.score)} / 100
                    </span>
                  ) : (
                    <span className="font-mono text-slate-400">Pending Calibration</span>
                  )}
                </div>

                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-slate-400">Role Benchmark:</span>
                  <span className="font-mono font-bold text-emerald-400">
                    {Math.round(activeMetric.benchmark)} / 100
                  </span>
                </div>

                <div className="flex items-center justify-between pt-0.5 border-t border-white/[0.06] mt-0.5">
                  <span className="text-slate-400">Difference:</span>
                  {isCalibrated && typeof activeMetric.score === 'number' ? (
                    (() => {
                      const diff = Math.round(activeMetric.score - activeMetric.benchmark);
                      return (
                        <span
                          className={`font-mono font-bold ${
                            diff >= 0 ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {diff >= 0 ? `+${diff}` : `${diff}`} pts
                        </span>
                      );
                    })()
                  ) : (
                    <span className="font-mono text-slate-500">Awaiting Baseline</span>
                  )}
                </div>
              </div>

              {/* Tooltip downward pointer caret */}
              <div className="absolute left-1/2 -bottom-1 -translate-x-1/2 w-2 h-2 bg-[#0A0D14] border-r border-b border-white/20 rotate-45" />
            </div>
          </div>
        )}
      </div>

      {/* ── Legend Bar ── */}
      {showLegend && (
        <div className="flex items-center justify-center gap-5 pt-1 text-[11px] font-sans">
          {/* Athlete Score */}
          <div className="flex items-center gap-1.5">
            <span
              className={`w-3 h-3 rounded-sm ${
                isCalibrated
                  ? 'bg-sky-400/30 border border-sky-400'
                  : 'bg-white/[0.05] border border-white/15'
              }`}
            />
            <span className={isCalibrated ? 'text-slate-300 font-medium' : 'text-slate-500'}>
              {isCalibrated ? 'Your Score' : 'Score (Pending)'}
            </span>
          </div>

          {/* Role Benchmark */}
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-0 border-t-2 border-dashed border-emerald-400" />
            <span className="text-emerald-400 font-medium">Role Benchmark</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default BiomechanicalRadarChart;
