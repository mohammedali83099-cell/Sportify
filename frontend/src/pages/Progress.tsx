import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAthleteStore } from '../store/athleteStore';
import { progressAPI, assessmentAPI } from '../api/client';
import { normalizeSport } from '../config/sportAssessmentConfig';
import { getRoleBenchmarks } from '../config/taxonomyBenchmarks';
import {
  TrendingUpIcon,
  CheckIcon,
  TargetIcon,
  CalendarIcon,
  FlameIcon,
  ZapIcon,
  ArrowRightIcon,
  ActivityIcon,
  InfoIcon,
} from '../components/common/Icons';
import {
  DashboardResponse,
  TrainingLogItem,
  ReassessmentData,
} from '../types';

export default function Progress() {
  const profile = useAthleteStore((state) => state.profile);
  const currentAssessment = useAthleteStore((state) => state.currentAssessment);
  const setAssessment = useAthleteStore((state) => state.setAssessment);
  const setBottlenecks = useAthleteStore((state) => state.setBottlenecks);
  const bottlenecksStore = useAthleteStore((state) => state.bottlenecks);

  const normalizedSport = profile?.sport ? normalizeSport(profile.sport) : 'cricket';
  const assessmentPath = `/assessment/${normalizedSport}`;

  const [dashboardData, setDashboardData] = useState<DashboardResponse | null>(null);
  const [logs, setLogs] = useState<TrainingLogItem[]>([]);
  const [reassessment, setReassessment] = useState<ReassessmentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'reassessment' | 'history'>('reassessment');

  useEffect(() => {
    async function loadProgress() {
      try {
        const [dashRes, logsRes, reassessRes, latestAssessRes] = await Promise.all([
          progressAPI.getDashboard().catch(() => null),
          progressAPI.getLogs(30).catch(() => []),
          progressAPI.getReassessment().catch(() => null),
          !currentAssessment ? assessmentAPI.getLatest().catch(() => null) : Promise.resolve(null),
        ]);

        if (dashRes) setDashboardData(dashRes);
        if (logsRes) setLogs(logsRes);
        if (reassessRes) setReassessment(reassessRes);
        if (latestAssessRes?.assessment && !currentAssessment) {
          setAssessment(latestAssessRes.assessment);
        }
        if (
          latestAssessRes?.bottleneck_report?.bottlenecks &&
          (!bottlenecksStore || bottlenecksStore.length === 0)
        ) {
          setBottlenecks(latestAssessRes.bottleneck_report.bottlenecks);
        }
      } catch (err) {
        console.error('Failed to load progress data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadProgress();
  }, [currentAssessment, setAssessment, setBottlenecks, bottlenecksStore]);

  const stats = dashboardData?.training_stats || {};
  const hasMultipleAssessments = Boolean(
    reassessment && Object.keys(reassessment.metric_deltas || {}).length > 0
  );
  const movementScores = (currentAssessment as any)?.movement_scores || null;
  const devProfile = dashboardData?.development_profile || null;
  const hasBaseline = Boolean(currentAssessment || devProfile || movementScores);

  // Extract calibrated baseline dimensions dynamically from real assessment data
  const baselineMetrics = useMemo(() => {
    if (movementScores && Object.keys(movementScores).length > 0) {
      const benchmarks = getRoleBenchmarks(
        profile?.sport || 'cricket',
        profile?.primary_role || profile?.role || 'striker',
        profile?.sub_role || undefined,
        profile?.experience_level || 'intermediate'
      );
      return Object.entries(movementScores).map(([key, score]) => {
        const benchmark = benchmarks[key] || 75;
        const numScore = Math.round(score as number);
        const gap = numScore - benchmark;
        const name = key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
        return {
          key,
          name,
          score: numScore,
          benchmark,
          gap,
        };
      });
    }
    if (devProfile) {
      const all = [
        ...(devProfile.critical_bottlenecks || []).map((m) => ({ ...m, tier: 'critical' })),
        ...(devProfile.development_areas || []).map((m) => ({ ...m, tier: 'dev_area' })),
        ...(devProfile.proficient || []).map((m) => ({ ...m, tier: 'proficient' })),
        ...(devProfile.strengths || []).map((m) => ({ ...m, tier: 'strength' })),
      ];
      if (all.length > 0) {
        return all.map((item) => ({
          key: item.attribute || item.name || '',
          name:
            item.name ||
            (item.attribute
              ? item.attribute.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
              : 'Metric'),
          score: Math.round(item.score || 0),
          benchmark: Math.round(item.benchmark || 75),
          gap:
            item.gap !== undefined
              ? Math.round(item.gap)
              : Math.round((item.score || 0) - (item.benchmark || 75)),
          tier: item.tier,
        }));
      }
    }
    return [];
  }, [movementScores, devProfile, profile]);

  const activeBottlenecks = useMemo(() => {
    if (
      (devProfile?.critical_bottlenecks && devProfile.critical_bottlenecks.length > 0) ||
      (devProfile?.development_areas && devProfile.development_areas.length > 0)
    ) {
      return [
        ...(devProfile.critical_bottlenecks || []),
        ...(devProfile.development_areas || []),
      ];
    }
    if ((dashboardData as any)?.bottlenecks?.length > 0) {
      return (dashboardData as any).bottlenecks;
    }
    if (bottlenecksStore && bottlenecksStore.length > 0) {
      return bottlenecksStore;
    }
    return [];
  }, [devProfile, dashboardData, bottlenecksStore]);

  const activeStrengths = useMemo(() => {
    if (
      (devProfile?.strengths && devProfile.strengths.length > 0) ||
      (devProfile?.proficient && devProfile.proficient.length > 0)
    ) {
      return [...(devProfile.strengths || []), ...(devProfile.proficient || [])];
    }
    return [];
  }, [devProfile]);

  const baselineDateFormatted = useMemo(() => {
    if (currentAssessment?.created_at) {
      try {
        return new Date(currentAssessment.created_at).toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });
      } catch {
        return 'Calibrated';
      }
    }
    return 'Calibrated';
  }, [currentAssessment]);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3 select-none">
        <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-white animate-spin" />
        <p className="text-xs font-mono text-slate-400 uppercase tracking-widest">
          Calculating Performance Deltas...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 select-none pb-8">
      {/* ── 1. PROGRESS & DEVELOPMENT HERO ─────────────────────────────────── */}
      <section className="rounded-2xl bg-gradient-to-b from-white/[0.04] to-white/[0.01] backdrop-blur-md border border-white/[0.08] p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="text-[11px] font-sans font-medium text-slate-300 px-2.5 py-0.5 rounded-full bg-white/[0.05] border border-white/10">
                Development Timeline
              </span>
              {hasMultipleAssessments ? (
                <span className="text-xs font-sans text-emerald-400 capitalize font-medium">
                  {reassessment?.overall_trajectory || 'Advancing'} (+{reassessment?.average_delta} pts)
                </span>
              ) : hasBaseline ? (
                <span className="text-xs font-sans text-emerald-400 font-medium">
                  Baseline Established
                </span>
              ) : (
                <span className="text-xs font-sans text-amber-400 font-medium">
                  Calibration Required
                </span>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold font-heading text-white tracking-tight">
              Progress & Improvement
            </h1>
            <p className="text-xs text-slate-400 font-sans mt-0.5">
              Longitudinal movement adaptation, kinematic profile shifts, and training load accumulation.
            </p>
          </div>

          <Link
            to={assessmentPath}
            className="w-full sm:w-auto h-10 sm:h-11 btn-primary text-xs flex items-center justify-center gap-2 px-4 sm:px-5 shrink-0"
          >
            <ZapIcon className="w-4 h-4 text-slate-950" />
            <span>Record Reassessment</span>
          </Link>
        </div>

        {/* ── 4-Metric State Strip ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4 pt-3.5 border-t border-white/[0.06]">
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] backdrop-blur-sm">
            <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
              <FlameIcon className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-sans font-medium">Streak</span>
            </div>
            <p className="text-lg sm:text-xl font-bold font-mono text-white">
              {stats.streak_days || 0}
              <span className="text-xs font-normal text-slate-400 ml-1">days</span>
            </p>
          </div>

          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] backdrop-blur-sm">
            <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
              <CalendarIcon className="w-3.5 h-3.5 text-slate-300" />
              <span className="font-sans font-medium">Workouts</span>
            </div>
            <p className="text-lg sm:text-xl font-bold font-mono text-white">
              {stats.total_sessions || logs.length || 0}
              <span className="text-xs font-normal text-slate-400 ml-1">logged</span>
            </p>
          </div>

          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] backdrop-blur-sm">
            <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
              <TargetIcon className="w-3.5 h-3.5 text-rose-400" />
              <span className="font-sans font-medium">Workload</span>
            </div>
            <p className="text-lg sm:text-xl font-bold font-mono text-white">
              {(stats as any).total_workload ? (stats as any).total_workload.toFixed(0) : '0'}
              <span className="text-xs font-normal text-slate-400 ml-1">AU</span>
            </p>
          </div>

          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] backdrop-blur-sm">
            <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
              <TrendingUpIcon className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-sans font-medium">Average Delta</span>
            </div>
            <p className="text-lg sm:text-xl font-bold font-mono text-emerald-400">
              {reassessment?.average_delta !== undefined && reassessment?.average_delta !== null
                ? `${reassessment.average_delta >= 0 ? '+' : ''}${reassessment.average_delta.toFixed(1)} pts`
                : hasBaseline
                ? 'Baseline'
                : '0.0 pts'}
            </p>
            <span className="text-[10px] text-slate-500 font-sans block mt-0.5">
              {hasMultipleAssessments
                ? 'vs previous baseline'
                : hasBaseline
                ? 'Awaiting Reassessment'
                : 'Pending baseline'}
            </span>
          </div>
        </div>
      </section>

      {/* ── 2. DEVELOPMENT PROGRESSION PATHWAY ─────────────────────────────────── */}
      <section className="rounded-2xl bg-[#0C0E14]/80 backdrop-blur-md border border-white/[0.08] p-4 sm:p-5 shadow-xl relative overflow-hidden space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-white/[0.06]">
          <div>
            <h2 className="text-sm sm:text-base font-bold font-heading text-white">
              Development Progression Pathway
            </h2>
            <p className="text-xs text-slate-400 font-sans mt-0.5">
              Longitudinal adaptation cycle from kinematic baseline to delta verification.
            </p>
          </div>
          <span className="text-[11px] font-mono text-slate-400 self-start sm:self-auto px-2.5 py-0.5 rounded-full bg-white/[0.04] border border-white/10">
            {hasMultipleAssessments
              ? 'Cycle Active • Deltas Verified'
              : hasBaseline
              ? 'Stage 2 of 3 • Training Accumulation'
              : 'Stage 1 of 3 • Baseline Pending'}
          </span>
        </div>

        {/* Pathway Steps with Connecting Spine */}
        <div className="relative">
          {/* Connecting Track Line (Desktop / Tablet) */}
          <div className="hidden md:block absolute top-7 left-12 right-12 h-0.5 bg-white/[0.08] z-0">
            <div
              className="h-full bg-emerald-500/60 transition-all duration-700"
              style={{
                width: hasMultipleAssessments ? '100%' : hasBaseline ? '50%' : '0%',
              }}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 relative z-10">
            {/* Step 1: Baseline Assessment */}
            <div
              className={`p-3.5 sm:p-4 rounded-xl border backdrop-blur-sm space-y-2 transition-all ${
                hasBaseline || hasMultipleAssessments
                  ? 'bg-white/[0.03] border-white/[0.1] shadow-sm'
                  : 'bg-white/[0.01] border-white/[0.05]'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono font-bold ${
                      hasBaseline || hasMultipleAssessments
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.25)]'
                        : 'bg-white/10 text-white border border-white/20'
                    }`}
                  >
                    {hasBaseline || hasMultipleAssessments ? (
                      <CheckIcon className="w-4 h-4" />
                    ) : (
                      '1'
                    )}
                  </div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                    Step 01
                  </span>
                </div>
                <span
                  className={`text-[10px] font-sans font-semibold px-2 py-0.5 rounded-full border ${
                    hasBaseline || hasMultipleAssessments
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                  }`}
                >
                  {hasBaseline || hasMultipleAssessments ? 'Completed' : 'Pending'}
                </span>
              </div>

              <div>
                <h3 className="text-xs sm:text-sm font-bold font-heading text-white">
                  Baseline Assessment
                </h3>
                <p className="text-[11px] text-slate-400 font-sans leading-relaxed mt-0.5">
                  {hasBaseline || hasMultipleAssessments
                    ? `Kinematic baseline captured (${baselineDateFormatted}) and mapped against role benchmark.`
                    : 'Initial kinematic video assessment to establish baseline biomechanical scores.'}
                </p>
              </div>
            </div>

            {/* Step 2: Targeted Training */}
            <div
              className={`p-3.5 sm:p-4 rounded-xl border backdrop-blur-sm space-y-2 transition-all ${
                !hasMultipleAssessments && hasBaseline
                  ? 'bg-white/[0.05] border-white/20 shadow-md ring-1 ring-white/10'
                  : hasMultipleAssessments
                  ? 'bg-white/[0.03] border-white/[0.1]'
                  : 'bg-white/[0.01] border-white/[0.05] opacity-75'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono font-bold ${
                      hasMultipleAssessments
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : hasBaseline
                        ? 'bg-white text-slate-950 shadow-[0_0_12px_rgba(255,255,255,0.3)]'
                        : 'bg-white/5 text-slate-500 border border-white/10'
                    }`}
                  >
                    {hasMultipleAssessments ? <CheckIcon className="w-4 h-4" /> : '2'}
                  </div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                    Step 02
                  </span>
                </div>
                <span
                  className={`text-[10px] font-sans font-semibold px-2 py-0.5 rounded-full border ${
                    hasMultipleAssessments
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : hasBaseline
                      ? 'bg-white/15 text-white border-white/30'
                      : 'bg-white/[0.03] text-slate-500 border-white/10'
                  }`}
                >
                  {hasMultipleAssessments
                    ? 'Completed Block'
                    : hasBaseline
                    ? 'In Progress'
                    : 'Upcoming'}
                </span>
              </div>

              <div>
                <h3 className="text-xs sm:text-sm font-bold font-heading text-white">
                  Targeted Training
                </h3>
                <p className="text-[11px] text-slate-300 font-sans leading-relaxed mt-0.5">
                  {hasBaseline
                    ? `${stats.total_sessions || logs.length} sessions logged • ${
                        (stats as any).total_workload ? (stats as any).total_workload.toFixed(0) : '0'
                      } AU workload targeting identified movement bottlenecks.`
                    : 'Prescribed training pathway designed to correct specific kinematic bottlenecks.'}
                </p>
              </div>
            </div>

            {/* Step 3: Delta Analysis */}
            <div
              className={`p-3.5 sm:p-4 rounded-xl border backdrop-blur-sm space-y-2 transition-all ${
                hasMultipleAssessments
                  ? 'bg-white/[0.05] border-white/20 shadow-md ring-1 ring-white/10'
                  : hasBaseline
                  ? 'bg-white/[0.03] border-white/[0.1]'
                  : 'bg-white/[0.01] border-white/[0.05] opacity-75'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono font-bold ${
                      hasMultipleAssessments
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : hasBaseline
                        ? 'bg-white/10 text-white border border-white/20'
                        : 'bg-white/5 text-slate-500 border border-white/10'
                    }`}
                  >
                    {hasMultipleAssessments ? <TrendingUpIcon className="w-4 h-4" /> : '3'}
                  </div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                    Step 03
                  </span>
                </div>
                <span
                  className={`text-[10px] font-sans font-semibold px-2 py-0.5 rounded-full border ${
                    hasMultipleAssessments
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : hasBaseline
                      ? 'bg-sky-500/10 text-sky-400 border-sky-500/30'
                      : 'bg-white/[0.03] text-slate-500 border-white/10'
                  }`}
                >
                  {hasMultipleAssessments
                    ? 'Deltas Active'
                    : hasBaseline
                    ? 'Next Milestone'
                    : 'Upcoming'}
                </span>
              </div>

              <div>
                <h3 className="text-xs sm:text-sm font-bold font-heading text-white">
                  Delta Analysis
                </h3>
                <p className="text-[11px] text-slate-400 font-sans leading-relaxed mt-0.5">
                  {hasMultipleAssessments
                    ? `Trajectory: ${reassessment?.overall_trajectory || 'Advancing'} (+${
                        reassessment?.average_delta
                      } pts avg delta across shared metrics).`
                    : 'Reassess movement mechanics to quantify bottleneck resolution and measure adaptation.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. TAB SELECTOR: DELTAS VS LOGS ─────────────────────────────────── */}
      <div className="p-1 rounded-xl bg-white/[0.02] border border-white/[0.06] backdrop-blur-sm grid grid-cols-2 gap-1 text-center">
        <button
          type="button"
          onClick={() => setActiveTab('reassessment')}
          className={`py-2 px-2 rounded-lg text-xs font-sans font-medium transition-all ${
            activeTab === 'reassessment'
              ? 'bg-white text-slate-950 font-semibold shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          {hasMultipleAssessments
            ? 'Longitudinal Deltas'
            : 'Movement Profile & Calibration'}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('history')}
          className={`py-2 px-2 rounded-lg text-xs font-sans font-medium transition-all ${
            activeTab === 'history'
              ? 'bg-white text-slate-950 font-semibold shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Session Logs ({logs.length})
        </button>
      </div>

      {/* ── 4. REASSESSMENT / BIOMECHANICAL DEVELOPMENT VISUALIZATION ───────── */}
      {activeTab === 'reassessment' && (
        <div className="space-y-4">
          {hasMultipleAssessments && reassessment ? (
            /* Populated Reassessment Data View (2+ assessments) */
            <div className="space-y-4">
              {/* Longitudinal Delta Header Callout */}
              <section className="rounded-2xl bg-[#0C0E14]/80 backdrop-blur-md border border-white/[0.08] p-5 sm:p-6 space-y-4 shadow-xl">
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/25 backdrop-blur-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-sans font-semibold text-emerald-400 uppercase tracking-wider block">
                      Longitudinal Delta Analysis
                    </span>
                    <h3 className="text-sm sm:text-base font-bold font-heading text-white mt-0.5">
                      Trajectory: {reassessment.overall_trajectory || 'Advancing'}
                    </h3>
                    <p className="text-xs text-slate-300 font-sans mt-0.5">
                      Consecutive assessment comparison across all shared biomechanical dimensions.
                    </p>
                  </div>
                  <div className="self-start sm:self-auto px-3.5 py-1.5 rounded-lg bg-emerald-400/20 border border-emerald-400/40 text-emerald-300 font-mono font-bold text-sm">
                    +{reassessment.average_delta} pts avg
                  </div>
                </div>

                {/* Metric Delta Breakdown List */}
                <div className="space-y-3 pt-1">
                  <div className="flex items-center justify-between text-[11px] font-sans font-medium text-slate-400 px-1">
                    <span>Biomechanical Dimension</span>
                    <span>Previous → Current Delta</span>
                  </div>

                  <div className="space-y-2.5">
                    {Object.keys(reassessment.metric_deltas || {}).map((key) => {
                      const m = reassessment.metric_deltas![key];
                      const isUp = m.delta > 0;
                      const isDown = m.delta < 0;
                      return (
                        <div
                          key={key}
                          className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.05] backdrop-blur-sm space-y-2.5"
                        >
                          <div className="flex items-center justify-between text-xs">
                            <div className="min-w-0">
                              <span className="font-bold text-slate-200 font-heading text-[13px]">
                                {m.name || key.replace(/_/g, ' ')}
                              </span>
                            </div>

                            <div className="flex items-center gap-2.5 shrink-0 font-mono">
                              <span className="text-xs text-slate-400">
                                {m.previous_score} →{' '}
                                <strong className="text-white font-bold">{m.current_score}</strong>
                              </span>
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                   isUp
                                    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                                    : isDown
                                    ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                                    : 'bg-white/[0.04] text-slate-400 border-white/10'
                                }`}
                              >
                                {isUp ? `+${m.delta}` : m.delta} pts
                              </span>
                            </div>
                          </div>

                          {/* Dual-Point Delta Progress Visualizer Track */}
                          <div className="relative h-2 w-full rounded-full bg-white/[0.06] overflow-visible">
                            {/* Span Bar between Previous and Current */}
                            <div
                              className={`absolute h-full rounded-full ${
                                isUp ? 'bg-emerald-500' : isDown ? 'bg-rose-500' : 'bg-slate-400'
                              }`}
                              style={{
                                left: `${Math.min(m.previous_score, m.current_score)}%`,
                                width: `${Math.max(2, Math.abs(m.current_score - m.previous_score))}%`,
                              }}
                            />
                            {/* Previous Score Marker */}
                            <div
                              className="absolute top-[-3px] w-2 h-3.5 bg-slate-500 rounded-sm z-10 opacity-70"
                              style={{ left: `${Math.min(98, m.previous_score)}%` }}
                              title={`Baseline: ${m.previous_score}`}
                            />
                            {/* Current Score Marker */}
                            <div
                              className={`absolute top-[-3px] w-2 h-3.5 rounded-sm z-20 shadow-md ${
                                isUp ? 'bg-emerald-400' : 'bg-white'
                              }`}
                              style={{ left: `${Math.min(98, m.current_score)}%` }}
                              title={`Current: ${m.current_score}`}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </section>

              {/* Resolved Bottlenecks & Emerging Priorities */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {/* Resolved */}
                <div className="rounded-2xl bg-[#0C0E14]/80 backdrop-blur-md border border-white/[0.08] p-4 sm:p-5 space-y-2.5 hover:border-white/15 transition-all shadow-lg">
                  <div className="flex items-center justify-between pb-1 border-b border-white/[0.06]">
                    <h3 className="text-sm font-bold font-heading text-white">
                      Resolved Bottlenecks
                    </h3>
                    <span className="text-[11px] font-mono text-emerald-400">
                      {reassessment.resolved_bottlenecks?.length || 0} resolved
                    </span>
                  </div>
                  <div className="space-y-1.5 pt-1">
                    {reassessment.resolved_bottlenecks && reassessment.resolved_bottlenecks.length > 0 ? (
                      reassessment.resolved_bottlenecks.map((item) => (
                        <div
                          key={item.attribute}
                          className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-between text-xs font-bold text-emerald-200"
                        >
                          <span className="capitalize">{item.name || item.attribute.replace(/_/g, ' ')}</span>
                          <span className="font-mono text-emerald-400">
                            Target Met ({item.new_score}/100)
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-400 font-sans py-2">
                        Complete further training blocks to resolve identified deficits.
                      </p>
                    )}
                  </div>
                </div>

                {/* Emerging Priorities */}
                <div className="rounded-2xl bg-[#0C0E14]/80 backdrop-blur-md border border-white/[0.08] p-4 sm:p-5 space-y-2.5 hover:border-white/15 transition-all shadow-lg">
                  <div className="flex items-center justify-between pb-1 border-b border-white/[0.06]">
                    <h3 className="text-sm font-bold font-heading text-white">
                      Emerging Priorities
                    </h3>
                    <span className="text-[11px] font-mono text-slate-400">
                      {reassessment.emerging_priorities?.length || 0} active
                    </span>
                  </div>
                  <div className="space-y-1.5 pt-1">
                    {reassessment.emerging_priorities && reassessment.emerging_priorities.length > 0 ? (
                      reassessment.emerging_priorities.map((item) => (
                        <div
                          key={item.attribute}
                          className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/25 flex items-center justify-between text-xs font-bold text-rose-200"
                        >
                          <span className="capitalize">{item.name || item.attribute.replace(/_/g, ' ')}</span>
                          <span className="font-mono text-rose-400">
                            Gap: -{item.gap} pts
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-400 font-sans py-2">
                        All monitored attributes meet target benchmarks.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : hasBaseline ? (
            /* Intentional Baseline State View (1 assessment) */
            <div className="space-y-4">
              <section className="rounded-2xl bg-[#0C0E14]/80 backdrop-blur-md border border-white/[0.08] p-5 sm:p-6 space-y-4 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.06]">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-sans font-semibold text-emerald-400 uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/25">
                        Baseline Calibrated
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">
                        Assessment 1 of 2
                      </span>
                    </div>
                    <h2 className="text-base sm:text-lg font-bold font-heading text-white">
                      Biomechanical Movement Profile
                    </h2>
                    <p className="text-xs text-slate-400 font-sans mt-0.5">
                      Movement dimensions calibrated against role benchmarks. Reassessment unlocks longitudinal delta curves.
                    </p>
                  </div>

                  <Link
                    to={assessmentPath}
                    className="self-start sm:self-auto h-9 btn-secondary text-xs flex items-center gap-1.5 px-3.5 shrink-0"
                  >
                    <ZapIcon className="w-3.5 h-3.5 text-slate-300" />
                    <span>Record Reassessment</span>
                  </Link>
                </div>

                {/* Baseline Dimension Grid */}
                <div className="space-y-3 pt-1">
                  <div className="flex items-center justify-between text-[11px] font-sans font-medium text-slate-400 px-1">
                    <span>Dimension & Role Benchmark</span>
                    <span>Measured Baseline</span>
                  </div>

                  <div className="space-y-2.5">
                    {baselineMetrics.map((m) => {
                      const isTargetMet = m.score >= m.benchmark;
                      return (
                        <div
                          key={m.key}
                          className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.05] backdrop-blur-sm space-y-2"
                        >
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="font-bold text-slate-200 font-heading text-[13px] truncate">
                                {m.name}
                              </span>
                              <span className="text-[10px] font-mono text-slate-500 shrink-0">
                                Target: {m.benchmark}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 shrink-0 font-mono">
                              <span className="text-xs font-bold text-white">
                                {m.score}
                                <span className="text-slate-500 text-[10px] font-normal"> / 100</span>
                              </span>
                              <span
                                className={`text-[10px] px-2 py-0.5 rounded-full border ${
                                  isTargetMet
                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                    : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                                }`}
                              >
                                {isTargetMet ? 'On Target' : `${m.gap} pts`}
                              </span>
                            </div>
                          </div>

                          {/* Visual Baseline Track */}
                          <div className="relative h-2 w-full rounded-full bg-white/[0.06] overflow-visible">
                            {/* Baseline Score Fill */}
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                isTargetMet ? 'bg-slate-200' : 'bg-amber-400'
                              }`}
                              style={{ width: `${Math.min(100, Math.max(5, m.score))}%` }}
                            />

                            {/* Target Benchmark Tick Indicator */}
                            <div
                              className="absolute top-[-3px] w-1 h-3.5 bg-white/70 rounded-full z-10 shadow-sm"
                              style={{ left: `${Math.min(99, Math.max(1, m.benchmark))}%` }}
                              title={`Role Target: ${m.benchmark}`}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Intentional Reassessment Guidance Banner */}
                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 text-slate-300 font-sans">
                    <InfoIcon className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>
                      Your baseline is established. Complete your training cycle, then record a second assessment to calculate multi-point delta trends.
                    </span>
                  </div>
                  <Link
                    to={assessmentPath}
                    className="shrink-0 text-white hover:text-emerald-300 font-medium flex items-center gap-1 font-sans"
                  >
                    <span>Reassess Movement</span>
                    <ArrowRightIcon className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </section>

              {/* ── 5. COMPACT DEVELOPMENT OVERVIEW (Active Cycle vs Calibrated Strengths) ── */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {/* Active Bottlenecks in Training Cycle */}
                <div className="rounded-2xl bg-[#0C0E14]/80 backdrop-blur-md border border-white/[0.08] p-4 sm:p-5 space-y-2.5 hover:border-white/15 transition-all shadow-lg">
                  <div className="flex items-center justify-between pb-1 border-b border-white/[0.06]">
                    <h3 className="text-sm font-bold font-heading text-white">
                      Active Training Priorities
                    </h3>
                    <span className="text-[11px] font-mono text-rose-400">
                      {activeBottlenecks.length} targeted
                    </span>
                  </div>
                  <div className="space-y-1.5 pt-1">
                    {activeBottlenecks.length > 0 ? (
                      activeBottlenecks.map((item: any, idx: number) => (
                        <div
                          key={item.attribute || idx}
                          className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/25 flex items-center justify-between text-xs text-rose-200"
                        >
                          <span className="font-bold capitalize">
                            {item.name || (item.attribute ? item.attribute.replace(/_/g, ' ') : 'Deficit')}
                          </span>
                          <span className="font-mono text-[11px] text-rose-300">
                            {item.gap !== undefined ? `Gap: ${item.gap} pts` : 'Targeted in Pathway'}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-400 font-sans py-2">
                        No critical bottlenecks identified in baseline assessment.
                      </p>
                    )}
                  </div>
                </div>

                {/* Calibrated Strengths & Foundations */}
                <div className="rounded-2xl bg-[#0C0E14]/80 backdrop-blur-md border border-white/[0.08] p-4 sm:p-5 space-y-2.5 hover:border-white/15 transition-all shadow-lg">
                  <div className="flex items-center justify-between pb-1 border-b border-white/[0.06]">
                    <h3 className="text-sm font-bold font-heading text-white">
                      Calibrated Strengths
                    </h3>
                    <span className="text-[11px] font-mono text-emerald-400">
                      {activeStrengths.length} on target
                    </span>
                  </div>
                  <div className="space-y-1.5 pt-1">
                    {activeStrengths.length > 0 ? (
                      activeStrengths.map((item: any, idx: number) => (
                        <div
                          key={item.attribute || idx}
                          className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-between text-xs text-emerald-200"
                        >
                          <span className="font-bold capitalize">
                            {item.name || (item.attribute ? item.attribute.replace(/_/g, ' ') : 'Strength')}
                          </span>
                          <span className="font-mono text-[11px] text-emerald-400">
                            Score: {item.score || 0} (Target Met)
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-400 font-sans py-2">
                        Movement strengths will register as scores meet role thresholds.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* No Baseline State View (0 assessments) */
            <div className="rounded-2xl bg-[#0C0E14]/80 backdrop-blur-md border border-white/[0.08] p-6 sm:p-8 space-y-4 text-center shadow-lg">
              <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center mx-auto text-slate-300">
                <ActivityIcon className="w-6 h-6" />
              </div>
              <div className="max-w-md mx-auto space-y-1">
                <h3 className="text-base sm:text-lg font-bold font-heading text-white">
                  Establish Your Kinematic Baseline
                </h3>
                <p className="text-xs text-slate-400 font-sans leading-relaxed">
                  Perform your first sport-specific movement assessment to record baseline kinematics, identify primary bottlenecks, and unlock longitudinal delta tracking.
                </p>
              </div>
              <Link
                to={assessmentPath}
                className="inline-flex h-11 btn-primary text-xs items-center justify-center gap-2 px-6"
              >
                <span>Start Baseline Assessment</span>
                <ArrowRightIcon className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      )}

      {/* ── 5. PERSISTED SESSION HISTORY VIEW ───────────────────────────────── */}
      {activeTab === 'history' && (
        <section className="rounded-2xl bg-[#0C0E14]/80 backdrop-blur-md border border-white/[0.08] p-4 sm:p-5 space-y-3 hover:border-white/15 transition-all shadow-lg">
          <div className="flex items-center justify-between pb-1 border-b border-white/[0.06]">
            <h3 className="text-sm font-bold font-heading text-white">
              Persisted Training Logs
            </h3>
            <span className="text-[11px] font-mono text-slate-400">
              {logs.length} logged
            </span>
          </div>

          <div className="space-y-2 pt-1">
            {logs.length > 0 ? (
              logs.map((log, idx) => (
                <div
                  key={log.id || idx}
                  className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] backdrop-blur-sm flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-white/[0.05] border border-white/10 flex items-center justify-center text-white font-bold text-xs font-mono shrink-0">
                      {log.session_type?.charAt(0) || 'W'}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-white font-sans truncate">
                        {log.session_type} Session
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5 font-sans truncate">
                        {log.session_date} • {log.notes || 'Workout completed'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-mono shrink-0">
                    <span className="text-slate-400">{log.duration_minutes}m</span>
                    <span className="px-2 py-0.5 rounded-md bg-white/[0.04] text-slate-300">
                      RPE {log.perceived_exertion}
                    </span>
                    <span className="text-slate-200 font-bold">
                      {log.workload_index?.toFixed(0) || log.duration_minutes * log.perceived_exertion} AU
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 text-center py-6 font-sans">
                No workouts logged yet. Complete workouts in your Training Pathway to build your longitudinal log.
              </p>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
