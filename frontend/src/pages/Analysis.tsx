import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAthleteStore } from '../store/athleteStore';
import { assessmentAPI, planAPI } from '../api/client';
import { normalizeSport } from '../config/sportAssessmentConfig';
import { getRoleBenchmarks } from '../config/taxonomyBenchmarks';
import BiomechanicalRadarChart from '../components/common/BiomechanicalRadarChart';
import { AssessmentAnalysisResult } from '../types';
import {
  CheckIcon,
  ChevronDownIcon,
  DumbbellIcon,
  ArrowRightIcon,
  AlertTriangleIcon,
} from '../components/common/Icons';

export default function Analysis() {
  const location = useLocation();
  const navigate = useNavigate();

  const currentAssessment = useAthleteStore((state) => state.currentAssessment);
  const profile = useAthleteStore((state) => state.profile);
  const normalizedSport = profile?.sport ? normalizeSport(profile.sport) : 'cricket';
  const assessmentPath = `/assessment/${normalizedSport}`;

  const [analysisData, setAnalysisData] = useState<AssessmentAnalysisResult | null>(
    (location.state as { result?: AssessmentAnalysisResult } | null)?.result ||
      (currentAssessment as unknown as AssessmentAnalysisResult) ||
      null
  );
  const [generatingPlan, setGeneratingPlan] = useState(false);
  const [showRawDetails, setShowRawDetails] = useState(false);
  const [activeMetricKey, setActiveMetricKey] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLatestIfNeeded() {
      if (!analysisData) {
        try {
          const res = await assessmentAPI.getLatest();
          if (res?.assessment) {
            setAnalysisData({
              ...res.assessment,
              bottlenecks:
                res.bottleneck_report?.bottlenecks || res.assessment.bottlenecks || [],
            });
          }
        } catch (err) {
          console.error('Failed to fetch assessment:', err);
        }
      }
    }
    fetchLatestIfNeeded();
  }, [analysisData]);

  const handleGeneratePlan = async () => {
    setGeneratingPlan(true);
    try {
      await planAPI.generate();
      navigate('/plan');
    } catch (err) {
      console.error('Failed to generate plan:', err);
      navigate('/plan');
    } finally {
      setGeneratingPlan(false);
    }
  };

  if (!analysisData) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3 text-center select-none">
        <p className="text-sm text-slate-400 font-sans">
          No active movement assessment report found.
        </p>
        <Link to={assessmentPath} className="btn-primary text-xs">
          Start Assessment
        </Link>
      </div>
    );
  }

  const scores = analysisData.movement_scores || {};
  const metricDetails = analysisData.metric_details || {};
  const feedback = analysisData.movement_feedback || [];
  const coaching = analysisData.coaching || {};
  const overallQuality = analysisData.overall_movement_quality ?? 75.0;
  const protocolName =
    analysisData.protocol_name || analysisData.protocol_id || 'Movement Assessment';

  // Extract completed date
  const completedDate = analysisData.created_at
    ? new Date(analysisData.created_at).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
      })
    : new Date().toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
      });

  // Retrieve athlete's exact role benchmarks from taxonomy
  const roleBenchmarks = getRoleBenchmarks(
    profile?.sport || 'cricket',
    profile?.primary_role || profile?.role || 'striker',
    profile?.sub_role || undefined,
    profile?.experience_level || 'intermediate'
  );

  const scoreEntries = Object.entries(scores) as [string, number][];

  // Derive bottlenecks: any metric where score < role benchmark, sorted by deficit
  const rawBottlenecks = scoreEntries
    .filter(([attr, score]) => {
      const bench = roleBenchmarks[attr] || 70;
      return score < bench;
    })
    .sort((a, b) => {
      const benchA = roleBenchmarks[a[0]] || 70;
      const benchB = roleBenchmarks[b[0]] || 70;
      return a[1] - benchA - (b[1] - benchB);
    });

  // Derive strengths: any metric where score >= role benchmark
  const rawStrengths = scoreEntries
    .filter(([attr, score]) => {
      const bench = roleBenchmarks[attr] || 70;
      return score >= bench;
    })
    .sort((a, b) => {
      const benchA = roleBenchmarks[a[0]] || 70;
      const benchB = roleBenchmarks[b[0]] || 70;
      return b[1] - benchB - (a[1] - benchA);
    });

  // Fallbacks if all scores are on one side
  const displayBottlenecks: [string, number][] =
    rawBottlenecks.length > 0
      ? rawBottlenecks
      : scoreEntries.length > 0
      ? [[...scoreEntries].sort((a, b) => a[1] - b[1])[0]]
      : [];

  const displayStrengths: [string, number][] =
    rawStrengths.length > 0
      ? rawStrengths
      : scoreEntries.length > 1
      ? [[...scoreEntries].sort((a, b) => b[1] - a[1])[0]]
      : [];

  // Helper to extract actionable observation note for bottleneck card
  const getBottleneckNote = (attrKey: string, score: number) => {
    if (metricDetails[attrKey]?.observation) {
      return metricDetails[attrKey].observation;
    }
    const cleanAttr = attrKey.toLowerCase().replace(/_/g, ' ');
    const tip = coaching.technique_tips?.find(
      (t) =>
        t.title.toLowerCase().includes(cleanAttr) ||
        cleanAttr.includes(t.title.toLowerCase())
    );
    if (tip) return tip.detail;

    const fb = feedback.find((f) => f.toLowerCase().includes(cleanAttr));
    if (fb) return fb;

    if (score < 50) {
      return `Significant deficit in ${cleanAttr} phase. Prioritize corrective loading.`;
    }
    return `Deviation from role benchmark. Targeted kinematic stabilization recommended.`;
  };

  return (
    <div className="space-y-4 select-none pb-8">
      {/* ── 1. REPORT HERO HEADER ────────────────────────────────────────────── */}
      <section className="rounded-2xl bg-gradient-to-b from-white/[0.04] to-white/[0.01] backdrop-blur-md border border-white/[0.08] p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="text-[11px] font-sans font-medium text-slate-300 px-2.5 py-0.5 rounded-full bg-white/[0.05] border border-white/10">
                Movement Report
              </span>
              <span className="text-xs font-mono text-slate-400 capitalize">
                {protocolName}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold font-heading text-white tracking-tight">
              Analysis Results
            </h1>
            <p className="text-xs text-slate-400 font-sans mt-0.5">
              Assessment completed on {completedDate} • Movement Quality:{' '}
              <strong className="text-white font-mono">{Math.round(overallQuality)}/100</strong>
            </p>
          </div>

          {/* Primary Action Button */}
          <button
            onClick={handleGeneratePlan}
            disabled={generatingPlan}
            className="w-full sm:w-auto h-11 btn-primary text-xs flex items-center justify-center gap-2 px-5 shrink-0"
          >
            <DumbbellIcon className="w-4 h-4 text-slate-950" />
            <span>
              {generatingPlan ? 'Synthesizing Pathway...' : 'View Action Plan'}
            </span>
            <ArrowRightIcon className="w-3.5 h-3.5 text-slate-950" />
          </button>
        </div>
      </section>

      {/* ── 2. BIOMECHANICAL PROFILE & BOTTLENECKS (REFERENCE HIERARCHY) ────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-stretch">
        {/* Left: Biomechanical Profile Radar Chart */}
        <div className="lg:col-span-7 rounded-2xl bg-[#0C0E14]/80 backdrop-blur-md border border-white/[0.08] p-4 sm:p-5 flex flex-col justify-between hover:border-white/15 transition-all shadow-lg">
          <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
            <h2 className="text-sm font-bold font-heading text-white">
              Biomechanical Profile
            </h2>
            <span className="text-[11px] font-mono text-slate-400">
              Role Calibrated Benchmarks
            </span>
          </div>

          <div className="flex-1 flex items-center justify-center py-2">
            <BiomechanicalRadarChart
              scores={scores}
              benchmarks={roleBenchmarks}
              isCalibrated={true}
              highlightedKey={activeMetricKey}
              onHoverMetric={setActiveMetricKey}
              onSelectMetric={(k) => setActiveMetricKey((prev) => (prev === k ? null : k))}
              className="w-full"
              showLegend={true}
            />
          </div>
        </div>

        {/* Right: Primary Bottlenecks & Strengths */}
        <div className="lg:col-span-5 flex flex-col gap-3.5">
          {/* Primary Bottlenecks Card */}
          <div className="rounded-2xl bg-[#0C0E14]/80 backdrop-blur-md border border-white/[0.08] p-4 sm:p-5 space-y-3 hover:border-white/15 transition-all shadow-lg flex-1">
            <div className="flex items-center justify-between pb-1 border-b border-white/[0.06]">
              <h3 className="text-xs font-bold font-heading text-rose-400 flex items-center gap-1.5">
                <AlertTriangleIcon className="w-4 h-4 text-rose-400" />
                <span>Primary Bottlenecks</span>
              </h3>
              <span className="text-[10px] font-mono text-slate-400">
                Priority Focus
              </span>
            </div>

            <div className="space-y-2.5 pt-1">
              {displayBottlenecks.length > 0 ? (
                displayBottlenecks.map(([attr, score]) => {
                  const bench = roleBenchmarks[attr] || 70;
                  const diff = Math.round(score - bench);
                  const isSevere = score < 55 || diff <= -15;
                  const note = getBottleneckNote(attr, score);
                  const isActive = activeMetricKey === attr;

                  return (
                    <div
                      key={attr}
                      onMouseEnter={() => setActiveMetricKey(attr)}
                      onMouseLeave={() => setActiveMetricKey(null)}
                      className={`p-3 rounded-xl border backdrop-blur-sm space-y-1 cursor-pointer transition-all duration-150 ${
                        isActive
                          ? 'border-sky-500/50 bg-white/[0.08] shadow-[0_0_16px_rgba(56,189,248,0.15)] ring-1 ring-sky-400/30'
                          : isSevere
                          ? 'bg-rose-500/[0.05] border-rose-500/20 hover:border-rose-500/40'
                          : 'bg-amber-500/[0.05] border-amber-500/20 hover:border-amber-500/40'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-xs font-bold font-heading capitalize ${
                            isActive
                              ? 'text-white'
                              : isSevere
                              ? 'text-rose-300'
                              : 'text-amber-300'
                          }`}
                        >
                          {attr.replace(/_/g, ' ')}
                        </span>
                        <span className="text-[11px] font-mono">
                          <strong className={isSevere ? 'text-rose-400' : 'text-amber-400'}>
                            {Math.round(score)}/100
                          </strong>
                          <span className="text-slate-500"> (Target: {bench})</span>
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-sans leading-snug">
                        {note}
                      </p>
                    </div>
                  );
                })
              ) : (
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] text-xs text-slate-400 font-sans">
                  All measured movement scores meet or exceed role targets.
                </div>
              )}
            </div>
          </div>

          {/* Strengths Card */}
          <div className="rounded-2xl bg-[#0C0E14]/80 backdrop-blur-md border border-white/[0.08] p-4 sm:p-5 space-y-2.5 hover:border-white/15 transition-all shadow-lg">
            <div className="flex items-center justify-between pb-1 border-b border-white/[0.06]">
              <h3 className="text-xs font-bold font-heading text-emerald-400 flex items-center gap-1.5">
                <CheckIcon className="w-4 h-4 text-emerald-400" />
                <span>Strengths</span>
              </h3>
              <span className="text-[10px] font-mono text-slate-400">
                Validated Mastery
              </span>
            </div>

            <div className="space-y-1.5 pt-0.5">
              {displayStrengths.map(([attr, score]) => {
                const isActive = activeMetricKey === attr;

                return (
                  <div
                    key={attr}
                    onMouseEnter={() => setActiveMetricKey(attr)}
                    onMouseLeave={() => setActiveMetricKey(null)}
                    className={`flex items-center justify-between py-1.5 px-2 rounded-lg cursor-pointer transition-all duration-150 ${
                      isActive
                        ? 'bg-white/[0.08] text-white ring-1 ring-emerald-400/30'
                        : 'hover:bg-white/[0.02] text-slate-300'
                    }`}
                  >
                    <span className="text-xs font-medium capitalize">
                      {attr.replace(/_/g, ' ')}
                    </span>
                    <span className="font-mono text-emerald-400 font-bold text-xs">
                      {Math.round(score)}/100
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. INTERPRETED OBSERVATIONS & RECOMMENDED GUIDANCE ───────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {/* Measured Observations */}
        <div className="rounded-2xl bg-[#0C0E14]/80 backdrop-blur-md border border-white/[0.08] p-4 sm:p-5 space-y-2.5 hover:border-white/15 transition-all shadow-lg">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold font-heading text-white">
              Observed Movement Patterns
            </h3>
            <span className="text-[11px] font-sans text-slate-400">
              Evidence
            </span>
          </div>

          <div className="space-y-2">
            {feedback.length > 0 ? (
              feedback.map((item, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05] backdrop-blur-sm text-xs text-slate-300 flex items-start gap-2.5 font-sans"
                >
                  <CheckIcon className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{item}</span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 font-sans py-2">
                Phase movement patterns recorded and analyzed.
              </p>
            )}
          </div>
        </div>

        {/* Recommended Coaching Cues */}
        <div className="rounded-2xl bg-[#0C0E14]/80 backdrop-blur-md border border-white/[0.08] p-4 sm:p-5 space-y-2.5 hover:border-white/15 transition-all shadow-lg">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold font-heading text-white">
              Recommended Coaching Cues
            </h3>
            <span className="text-[11px] font-sans text-slate-400">
              Action Plan
            </span>
          </div>

          <div className="space-y-2">
            {coaching.technique_tips?.map((tip, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05] backdrop-blur-sm space-y-0.5"
              >
                <div className="text-xs font-bold text-white font-sans">
                  {tip.title}
                </div>
                <div className="text-xs text-slate-400 font-sans leading-relaxed">
                  {tip.detail}
                </div>
              </div>
            )) || (
              <p className="text-xs text-slate-400 font-sans py-2">
                Proceed to the 4-week training pathway to execute targeted corrective exercises.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── 4. TECHNICAL DETAILS (PROGRESSIVE DISCLOSURE) ────────────────────── */}
      {Object.keys(metricDetails).length > 0 && (
        <div className="rounded-2xl bg-[#0C0E14]/80 backdrop-blur-md border border-white/[0.08] hover:border-white/15 transition-all shadow-lg overflow-hidden">
          <button
            type="button"
            onClick={() => setShowRawDetails(!showRawDetails)}
            className="w-full p-4 flex items-center justify-between text-left text-xs font-medium text-slate-400 hover:text-white transition-colors"
          >
            <span>Technical Measurement Details (Joint Angles & Phase Durations)</span>
            <ChevronDownIcon
              className={`w-4 h-4 transition-transform duration-200 ${
                showRawDetails ? 'rotate-180 text-white' : 'text-slate-500'
              }`}
            />
          </button>

          {showRawDetails && (
            <div className="p-4 pt-0 border-t border-white/[0.06] space-y-2">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-3">
                {Object.entries(metricDetails).map(([key, value]) => (
                  <div
                    key={key}
                    className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.04] backdrop-blur-sm"
                  >
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block truncate">
                      {key.replace(/_/g, ' ')}
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-200">
                      {typeof value === 'number'
                        ? `~${Math.round(value)}`
                        : typeof value === 'object' && value !== null
                        ? (value as any).raw_value !== undefined
                          ? typeof (value as any).raw_value === 'number'
                            ? `~${Math.round((value as any).raw_value)} ${(value as any).unit || ''}`
                            : String((value as any).raw_value)
                          : `${Math.round((value as any).score || 0)}/100`
                        : String(value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
