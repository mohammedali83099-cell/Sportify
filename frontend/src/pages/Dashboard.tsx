import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAthleteStore } from '../store/athleteStore';
import { progressAPI, planAPI, intakeAPI, assessmentAPI } from '../api/client';
import { normalizeSport } from '../config/sportAssessmentConfig';
import BenchmarkBar from '../components/common/BenchmarkBar';
import {
  TargetIcon,
  FlameIcon,
  ZapIcon,
  DumbbellIcon,
  ArrowRightIcon,
  ShieldIcon,
  CalendarIcon,
  CheckIcon,
  ClockIcon,
  PlusIcon,
  CloseIcon,
} from '../components/common/Icons';
import {
  DashboardResponse,
  ProfileAttributeItem,
  TrainingPlan,
} from '../types';

const ALL_GOALS = [
  'Improve acceleration',
  'Build strength',
  'Boost agility',
  'Increase stamina',
  'Better flexibility',
  'Injury prevention',
  'Improve technique',
  'Lose weight',
  'Gain muscle',
];

export default function Dashboard() {
  const navigate = useNavigate();
  const athlete = useAthleteStore((state) => state.athlete);
  const profile = useAthleteStore((state) => state.profile);
  const setProfile = useAthleteStore((state) => state.setProfile);
  const currentAssessment = useAthleteStore((state) => state.currentAssessment);
  const setAssessment = useAthleteStore((state) => state.setAssessment);

  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardResponse | null>(null);
  const [currentPlan, setCurrentPlan] = useState<TrainingPlan | null>(null);
  const [activeTier, setActiveTier] = useState<string>('all');
  const [showPicker, setShowPicker] = useState(false);
  const [goals, setGoals] = useState<string[]>([]);

  useEffect(() => {
    if (profile?.goals?.length) {
      setGoals(profile.goals);
    } else if (profile?.development_objectives?.length) {
      setGoals(profile.development_objectives);
    }
  }, [profile]);

  const addGoal = async (g: string) => {
    if (goals.includes(g)) return;
    const updated = [...goals, g];
    setGoals(updated);
    setShowPicker(false);
    try {
      const updatedProf = await intakeAPI.submitProfile({
        goals: updated,
        development_objectives: updated,
      });
      setProfile(updatedProf);
    } catch (e) {
      console.error('Failed to save goal:', e);
    }
  };

  const removeGoal = async (g: string) => {
    const updated = goals.filter((x) => x !== g);
    setGoals(updated);
    try {
      const updatedProf = await intakeAPI.submitProfile({
        goals: updated,
        development_objectives: updated,
      });
      setProfile(updatedProf);
    } catch (e) {
      console.error('Failed to remove goal:', e);
    }
  };

  const availableGoals = ALL_GOALS.filter((g) => !goals.includes(g));

  useEffect(() => {
    async function loadDashboard() {
      setLoading(true);
      try {
        const [dashRes, planRes, profRes, latestAssessRes] = await Promise.all([
          progressAPI.getDashboard().catch(() => null),
          planAPI.getCurrent().catch(() => null),
          intakeAPI.getProfile().catch(() => null),
          !currentAssessment ? assessmentAPI.getLatest().catch(() => null) : Promise.resolve(null),
        ]);

        if (dashRes) setDashboardData(dashRes);
        if (planRes) setCurrentPlan(planRes);
        if (profRes) setProfile(profRes);
        if (latestAssessRes?.assessment && !currentAssessment) {
          setAssessment(latestAssessRes.assessment);
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, [setProfile, currentAssessment, setAssessment]);

  const devProfile = dashboardData?.development_profile || {};
  const strengths = devProfile.strengths || [];
  const proficient = devProfile.proficient || [];
  const devAreas = devProfile.development_areas || [];
  const bottlenecks = devProfile.critical_bottlenecks || [];
  const trainingStats = dashboardData?.training_stats || {};
  const recovery = dashboardData?.recovery_recommendation || {};

  const normalizedSport = profile?.sport ? normalizeSport(profile.sport) : 'cricket';
  const assessmentPath = `/assessment/${normalizedSport}`;

  // Formatting helpers
  const formatTitle = (str?: string | null) => {
    if (!str) return 'Athlete';
    return str
      .replace(/_/g, ' ')
      .split(' ')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ');
  };

  const sportTitle = profile?.sport ? formatTitle(profile.sport) : 'Sportify';
  const roleTitle = formatTitle(profile?.sub_role || profile?.primary_role || 'Athlete');
  const athleteName = athlete?.full_name || (athlete as any)?.name || 'Athlete';

  const hasAssessment = Boolean(
    bottlenecks.length > 0 ||
    proficient.length > 0 ||
    strengths.length > 0 ||
    devAreas.length > 0 ||
    currentAssessment
  );
  const hasPlan = Boolean((currentPlan as any)?.plan_data?.weeks?.length);

  // Top prioritized bottleneck or development focus
  const topBottleneck = bottlenecks[0] || devAreas[0] || null;

  // Active training session helper
  const activeWeek = (currentPlan as any)?.plan_data?.weeks?.[0];
  const activeSession = activeWeek?.sessions?.[0];

  // ── ATHLETE DEVELOPMENT PATHWAY STAGES (Derived strictly from real state) ──
  const developmentStages = useMemo(() => {
    let activeIndex = 0;
    if (!hasAssessment) {
      activeIndex = 0; // Baseline calibration active
    } else if (hasAssessment && !hasPlan) {
      activeIndex = 1; // Identify bottlenecks / plan generation
    } else if (hasPlan && (trainingStats?.total_sessions || 0) < 4) {
      activeIndex = 2; // Active training cycle
    } else if (hasPlan && (trainingStats?.total_sessions || 0) >= 4) {
      activeIndex = 4; // Reassessment ready
    }

    return [
      {
        id: 'baseline',
        step: '01',
        name: 'Baseline',
        detail: hasAssessment ? 'Calibrated' : 'Pending',
        isComplete: hasAssessment,
        isActive: activeIndex === 0,
      },
      {
        id: 'identify',
        step: '02',
        name: 'Identify',
        detail: bottlenecks.length > 0 ? `${bottlenecks.length} Focus Areas` : hasAssessment ? 'Target Met' : 'Analysis',
        isComplete: hasAssessment,
        isActive: activeIndex === 1,
      },
      {
        id: 'train',
        step: '03',
        name: 'Train',
        detail: hasPlan ? `Week 0${activeWeek?.week_number || 1} Active` : 'Pathway',
        isComplete: hasPlan && (trainingStats?.total_sessions || 0) >= 4,
        isActive: activeIndex === 2,
      },
      {
        id: 'recover',
        step: '04',
        name: 'Recover',
        detail: recovery?.load_context?.strain_status || 'Optimal',
        isComplete: hasPlan && (trainingStats?.total_sessions || 0) > 0,
        isActive: hasPlan && activeIndex === 2,
      },
      {
        id: 'reassess',
        step: '05',
        name: 'Reassess',
        detail: activeIndex === 4 ? 'Ready' : 'Delta Audit',
        isComplete: false,
        isActive: activeIndex === 4,
      },
    ];
  }, [hasAssessment, hasPlan, bottlenecks, trainingStats, activeWeek, recovery]);

  // Tagged metrics for Movement Profile list
  const allTaggedItems = useMemo(() => {
    const list: ProfileAttributeItem[] = [];
    bottlenecks.forEach((i) => list.push({ ...i, tier: 'bottleneck' }));
    devAreas.forEach((i) => list.push({ ...i, tier: 'dev_area' }));
    proficient.forEach((i) => list.push({ ...i, tier: 'proficient' }));
    strengths.forEach((i) => list.push({ ...i, tier: 'strength' }));
    return list;
  }, [bottlenecks, devAreas, proficient, strengths]);

  const filteredItems = useMemo(() => {
    if (activeTier === 'bottlenecks') return bottlenecks.map((i) => ({ ...i, tier: 'bottleneck' }));
    if (activeTier === 'devAreas') return devAreas.map((i) => ({ ...i, tier: 'dev_area' }));
    if (activeTier === 'proficient') return proficient.map((i) => ({ ...i, tier: 'proficient' }));
    if (activeTier === 'strengths') return strengths.map((i) => ({ ...i, tier: 'strength' }));
    return allTaggedItems;
  }, [activeTier, allTaggedItems, bottlenecks, devAreas, proficient, strengths]);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3 select-none">
        <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-white animate-spin" />
        <p className="text-xs font-mono text-slate-400 uppercase tracking-widest">
          Loading Athlete Profile...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-5 select-none pb-8 max-w-4xl mx-auto">
      {/* ── 1. ATHLETE OVERVIEW (Who Am I?) ─────────────────────────────────── */}
      <header className="pt-1 pb-4 border-b border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500 font-semibold">
              Athlete Command
            </span>
            <span className="text-slate-700 text-xs">/</span>
            <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 shadow-[0_0_6px_rgba(52,211,153,0.6)]" />
              <span>{sportTitle}</span>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-white tracking-tight leading-tight">
            Welcome back, {athleteName}
          </h1>

          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 mt-1.5 text-xs text-slate-400 font-sans">
            <span className="font-semibold text-slate-200">
              {roleTitle}
            </span>
            <span className="text-slate-600">•</span>
            <span className="capitalize text-slate-400">
              {profile?.experience_level || 'Intermediate'}
            </span>
            <span className="text-slate-600">•</span>
            <span className="inline-flex items-center gap-1.5">
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  hasAssessment
                    ? bottlenecks.length > 0
                      ? 'bg-amber-400'
                      : 'bg-emerald-400'
                    : 'bg-slate-500'
                }`}
              />
              <span className="text-slate-400">
                {hasAssessment
                  ? bottlenecks.length > 0
                    ? `${bottlenecks.length} focus ${bottlenecks.length === 1 ? 'area' : 'areas'}`
                    : 'Baselines calibrated'
                  : 'Assessment pending'}
              </span>
            </span>
          </div>
        </div>

        {/* Quick Action */}
        <div className="flex items-center gap-2.5 shrink-0">
          <Link
            to={assessmentPath}
            className="text-xs font-sans font-semibold text-white px-4 py-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 transition-all inline-flex items-center gap-2 shadow-sm"
          >
            <ZapIcon className="w-3.5 h-3.5 text-emerald-400" />
            <span>{hasAssessment ? 'Reassess Movement' : 'Start Assessment'}</span>
          </Link>
        </div>
      </header>

      {/* ── 2. CORE ATHLETIC TELEMETRY (Performance at a Glance) ─────────────── */}
      <section aria-label="Athletic Telemetry" className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {/* Streak */}
        <div className="rounded-2xl bg-gradient-to-b from-white/[0.04] to-white/[0.015] border border-white/[0.07] p-4 shadow-sm hover:border-white/15 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-sans font-medium text-slate-300">Streak</span>
            <FlameIcon className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold font-mono text-white tracking-tight">
            {trainingStats.streak_days || 0}
            <span className="text-xs font-sans font-normal text-slate-500 ml-1">d</span>
          </p>
          <span className="text-[10px] font-mono text-slate-500 block mt-1">Active cadence</span>
        </div>

        {/* Sessions */}
        <div className="rounded-2xl bg-gradient-to-b from-white/[0.04] to-white/[0.015] border border-white/[0.07] p-4 shadow-sm hover:border-white/15 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-sans font-medium text-slate-300">Sessions</span>
            <CalendarIcon className="w-4 h-4 text-sky-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold font-mono text-white tracking-tight">
            {trainingStats.total_sessions || 0}
          </p>
          <span className="text-[10px] font-mono text-slate-500 block mt-1">Completed cycles</span>
        </div>

        {/* Avg RPE */}
        <div className="rounded-2xl bg-gradient-to-b from-white/[0.04] to-white/[0.015] border border-white/[0.07] p-4 shadow-sm hover:border-white/15 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-sans font-medium text-slate-300">Avg RPE</span>
            <TargetIcon className="w-4 h-4 text-rose-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold font-mono text-white tracking-tight">
            {trainingStats.avg_rpe ? trainingStats.avg_rpe.toFixed(1) : '0.0'}
            <span className="text-xs font-sans font-normal text-slate-500 ml-1">/10</span>
          </p>
          <span className="text-[10px] font-mono text-slate-500 block mt-1">Training intensity</span>
        </div>

        {/* Readiness */}
        <div className="rounded-2xl bg-gradient-to-b from-white/[0.04] to-white/[0.015] border border-white/[0.07] p-4 shadow-sm hover:border-white/15 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-sans font-medium text-slate-300">Readiness</span>
            <ShieldIcon className="w-4 h-4 text-emerald-400" />
          </div>
          <p
            className="text-sm sm:text-base font-bold font-sans text-emerald-400 truncate mt-1.5"
            title={recovery?.load_context?.strain_status || 'Optimal Adaptation'}
          >
            {recovery?.load_context?.strain_status || 'Optimal Adaptation'}
          </p>
          <span className="text-[10px] font-mono text-slate-500 block mt-1">Recovery state</span>
        </div>
      </section>

      {/* ── 2. ATHLETE DEVELOPMENT PATHWAY (Where Am I In My Development?) ─── */}
      <section aria-label="Athlete Development Pathway" className="rounded-xl bg-white/[0.015] backdrop-blur-sm border border-white/[0.06] p-3 sm:p-4 space-y-2.5">
        <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-slate-400 px-0.5">
          <span className="font-semibold flex items-center gap-1.5 text-slate-300">
            Development Loop
          </span>
          <span className="text-slate-500">
            {hasAssessment
              ? hasPlan
                ? 'Cycle 01 • Active Training'
                : 'Deficit Analysis Active'
              : 'Stage 01 • Calibration Pending'}
          </span>
        </div>

        {/* Connected Progression Track */}
        <div className="grid grid-cols-5 gap-1 sm:gap-2 relative pt-1">
          {developmentStages.map((stage) => (
            <div
              key={stage.id}
              className={`relative flex flex-col items-center text-center p-2 rounded-lg transition-all ${
                stage.isActive
                  ? 'bg-white/[0.04] border border-white/[0.12] shadow-sm'
                  : 'bg-transparent'
              }`}
            >
              {/* Top Node Indicator */}
              <div className="flex items-center justify-center w-6 h-6 rounded-full mb-1.5 transition-all">
                {stage.isComplete ? (
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center">
                    <CheckIcon className="w-3 h-3" />
                  </div>
                ) : stage.isActive ? (
                  <div className="w-5 h-5 rounded-full bg-white text-slate-950 font-mono font-bold text-[10px] flex items-center justify-center shadow-[0_0_10px_rgba(255,255,255,0.3)]">
                    {stage.step}
                  </div>
                ) : (
                  <div className="w-5 h-5 rounded-full bg-white/[0.04] border border-white/10 text-slate-500 font-mono text-[10px] flex items-center justify-center">
                    {stage.step}
                  </div>
                )}
              </div>

              {/* Node Title */}
              <span
                className={`text-xs font-bold font-heading truncate w-full ${
                  stage.isActive
                    ? 'text-white'
                    : stage.isComplete
                    ? 'text-slate-200'
                    : 'text-slate-500'
                }`}
              >
                {stage.name}
              </span>

              {/* Node Detail */}
              <span className="text-[10px] font-mono text-slate-400 truncate w-full mt-0.5">
                {stage.detail}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ── 3. PRIMARY FOCAL POINT: CALIBRATION / PRIORITY ACTION (What Should I Do Next?) ── */}
      <section className="relative rounded-2xl bg-gradient-to-b from-[#10131E] via-[#0B0D15] to-[#07080E] border border-white/[0.1] p-5 sm:p-7 shadow-2xl overflow-hidden">
        {hasAssessment && topBottleneck ? (
          /* ASSESSED STATE: Priority Bottleneck Focus */
          <div className="relative z-10 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
                <span className="text-[11px] font-mono font-bold tracking-widest text-slate-300 uppercase">
                  TODAY'S PRIORITY FOCUS
                </span>
              </div>
              <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">
                {roleTitle} Target
              </span>
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-bold font-heading text-white tracking-tight">
                {topBottleneck.name || topBottleneck.attribute.replace(/_/g, ' ')}
              </h2>
              {topBottleneck.role_relevance_explanation && (
                <p className="text-xs sm:text-sm text-slate-300 font-sans leading-relaxed mt-1 max-w-xl">
                  {topBottleneck.role_relevance_explanation}
                </p>
              )}
            </div>

            {/* Visual Score vs Benchmark Comparison */}
            <div className="pt-3 border-t border-white/[0.07] max-w-2xl">
              <BenchmarkBar
                name={topBottleneck.name || topBottleneck.attribute.replace(/_/g, ' ')}
                score={topBottleneck.score}
                benchmark={topBottleneck.benchmark || 75}
                gap={topBottleneck.gap ? -Math.abs(topBottleneck.gap) : undefined}
                tier="bottleneck"
              />
            </div>

            {/* Priority CTA */}
            <div className="pt-1">
              {hasPlan ? (
                <Link
                  to="/plan"
                  className="btn-primary text-xs sm:text-sm h-11 w-full sm:w-auto px-6 inline-flex items-center justify-center gap-2 shadow-lg"
                >
                  <DumbbellIcon className="w-4 h-4 text-slate-950" />
                  <span>Execute Priority Session</span>
                  <ArrowRightIcon className="w-4 h-4 text-slate-950" />
                </Link>
              ) : (
                <Link
                  to={assessmentPath}
                  className="btn-primary text-xs sm:text-sm h-11 w-full sm:w-auto px-6 inline-flex items-center justify-center gap-2 shadow-lg"
                >
                  <ZapIcon className="w-4 h-4 text-slate-950" />
                  <span>Record Assessment to Target Bottleneck</span>
                  <ArrowRightIcon className="w-4 h-4 text-slate-950" />
                </Link>
              )}
            </div>
          </div>
        ) : hasAssessment && bottlenecks.length === 0 ? (
          /* ASSESSED & ON TARGET */
          <div className="relative z-10 space-y-3.5">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-[11px] font-mono font-bold tracking-widest text-slate-300 uppercase">
                TODAY'S PRIORITY FOCUS
              </span>
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-bold font-heading text-white tracking-tight">
                All Evaluated Attributes On Target
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 font-sans leading-relaxed mt-1 max-w-xl">
                No critical biomechanical bottlenecks detected against {roleTitle} standards. Maintain progressive overload and active recovery.
              </p>
            </div>

            <div className="pt-1">
              <Link
                to="/plan"
                className="btn-primary text-xs sm:text-sm h-11 px-6 inline-flex items-center justify-center gap-2 shadow-lg"
              >
                <DumbbellIcon className="w-4 h-4 text-slate-950" />
                <span>Continue Training Pathway</span>
                <ArrowRightIcon className="w-4 h-4 text-slate-950" />
              </Link>
            </div>
          </div>
        ) : (
          /* ── UNASSESSED STATE: MAIN VISUAL FOCAL POINT (Commanding Centerpiece) ── */
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            {/* Left Column: Command & Calibration Callout */}
            <div className="space-y-4 max-w-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
                  <span className="text-[11px] font-mono font-bold tracking-widest text-emerald-400 uppercase">
                    PRIORITY ACTION
                  </span>
                </div>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                  Phase 01 // Baseline Setup
                </span>
              </div>

              <div className="space-y-1.5">
                <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-white tracking-tight leading-tight">
                  Calibrate Movement Baseline
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 font-sans leading-relaxed max-w-lg">
                  Capture your high-velocity kinematics and benchmark your joint stability, mobility, and kinetic sequencing against <strong className="text-white font-medium">{sportTitle} {roleTitle}</strong> requirements.
                </p>
              </div>

              {/* Sub-Technical Specifications Grid */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/[0.08]">
                <div className="space-y-0.5">
                  <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block">
                    Telemetry
                  </span>
                  <span className="text-[11px] font-mono font-semibold text-slate-300 block">
                    AI Kinematic Pose
                  </span>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block">
                    Benchmark
                  </span>
                  <span className="text-[11px] font-mono font-semibold text-slate-300 block truncate">
                    {roleTitle} Model
                  </span>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block">
                    Output
                  </span>
                  <span className="text-[11px] font-mono font-semibold text-slate-300 block">
                    Deficit Matrix
                  </span>
                </div>
              </div>

              {/* Primary Assessment Action CTA */}
              <div className="pt-2">
                <Link
                  to={assessmentPath}
                  className="btn-primary text-xs sm:text-sm h-11 px-7 w-full sm:w-auto inline-flex items-center justify-center gap-2.5 shadow-xl shadow-emerald-500/15 font-bold"
                >
                  <ZapIcon className="w-4 h-4 text-slate-950" />
                  <span>Start Movement Assessment</span>
                  <ArrowRightIcon className="w-4 h-4 text-slate-950" />
                </Link>
              </div>
            </div>

            {/* Right Column: Visual Telemetry Card */}
            <div
              aria-hidden="true"
              className="relative w-full md:w-56 h-36 md:h-44 shrink-0 flex flex-col justify-between overflow-hidden rounded-xl bg-gradient-to-br from-white/[0.03] to-white/[0.01] border border-white/[0.08] p-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest font-semibold">
                  Kinematic AI
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-mono text-slate-300">
                  Full-Body Tracking
                </p>
                <p className="text-[10px] text-slate-500 leading-tight">
                  Evaluates 33 anatomical landmarks, joint kinetic load, and balance sequencing.
                </p>
              </div>
              <div className="flex items-center gap-2 pt-2 border-t border-white/[0.06]">
                <span className="text-[10px] font-mono text-slate-400">Zero Hardware Needed</span>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ── 4. ACTION PROTOCOLS (Category → Recommended Action → Context → CTA) ── */}
      <section aria-label="Action Protocols" className="space-y-3">
        <div className="flex items-center justify-between px-0.5">
          <h2 className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
            ACTION PROTOCOLS
          </h2>
          <span className="text-[11px] font-mono text-slate-500">
            Prescribed Interventions
          </span>
        </div>

        {/* 4A. Training Action Protocol */}
        <div className="p-4 sm:p-5 rounded-xl bg-gradient-to-r from-white/[0.035] via-white/[0.02] to-white/[0.01] backdrop-blur-md border border-white/[0.08] shadow-sm hover:border-white/15 transition-all space-y-3">
          {/* Category & Status */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-[10px] font-mono uppercase tracking-wider font-semibold text-slate-300 flex items-center gap-1.5">
              <DumbbellIcon className="w-3.5 h-3.5 text-slate-400" />
              TRAINING ACTION
            </span>
            <span className="text-[11px] font-mono text-slate-400">
              {hasPlan && activeSession
                ? `Week 0${activeWeek?.week_number || 1} • ${activeSession.type || 'Strength'}`
                : hasPlan
                ? '4-Week Cycle'
                : 'Pending Calibration'}
            </span>
          </div>

          {/* Recommended Action & Brief Context */}
          <div>
            <h3 className="text-sm sm:text-base font-bold font-heading text-white">
              {activeSession?.session_name ||
                activeWeek?.week_theme ||
                (currentPlan as any)?.plan_data?.plan_title ||
                'Individualized Movement Development Pathway'}
            </h3>
            <p className="text-xs text-slate-400 font-sans leading-relaxed mt-1">
              {hasPlan
                ? activeSession?.rationale ||
                  (currentPlan as any)?.plan_data?.plan_summary ||
                  'Prescribed training stimulus designed to resolve identified movement bottlenecks.'
                : 'Complete your baseline movement assessment to calibrate individual joint loads and unlock customized training sessions.'}
            </p>
          </div>

          {/* Context Meta & CTA */}
          <div className="pt-2 border-t border-white/[0.05] flex items-center justify-between">
            <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
              <ClockIcon className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span>
                {hasPlan && activeSession
                  ? `${activeSession.duration_minutes || 60} min session`
                  : '4-Week Target Progression'}
              </span>
            </span>

            <Link
              to="/plan"
              className="text-xs font-semibold text-slate-200 hover:text-white flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] transition-all"
            >
              <span>{hasPlan ? 'Open Session' : 'View Pathway'}</span>
              <ArrowRightIcon className="w-3.5 h-3.5 text-slate-400" />
            </Link>
          </div>
        </div>

        {/* 4B. Recovery Action Protocol */}
        <div className="p-4 sm:p-5 rounded-xl bg-gradient-to-r from-white/[0.035] via-white/[0.02] to-white/[0.01] backdrop-blur-md border border-white/[0.08] shadow-sm hover:border-white/15 transition-all space-y-3">
          {/* Category & Status */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-[10px] font-mono uppercase tracking-wider font-semibold text-slate-300 flex items-center gap-1.5">
              <ShieldIcon className="w-3.5 h-3.5 text-slate-400" />
              RECOVERY ACTION
            </span>
            <span className="text-[11px] font-mono text-slate-400">
              {recovery?.load_context?.strain_status || 'Optimal Adaptation'}
            </span>
          </div>

          {/* Recommended Action & Brief Context */}
          <div>
            <h3 className="text-sm sm:text-base font-bold font-heading text-white">
              {recovery?.active_recovery_sessions?.[0]?.session_name ||
                'Targeted Soft Tissue Release & Mobility Protocol'}
            </h3>
            <p className="text-xs text-slate-400 font-sans leading-relaxed mt-1">
              {recovery?.daily_habits?.[0] ||
                'Perform targeted foam rolling, joint mobilization, and tissue restoration between high-intensity training sessions.'}
            </p>
          </div>

          {/* Context Meta & CTA */}
          <div className="pt-2 border-t border-white/[0.05] flex items-center justify-between">
            <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
              <ClockIcon className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span>
                {recovery?.active_recovery_sessions?.[0]?.duration_minutes
                  ? `${recovery.active_recovery_sessions[0].duration_minutes} min protocol`
                  : 'Daily Restoration'}
              </span>
            </span>

            <Link
              to="/recovery"
              className="text-xs font-semibold text-slate-200 hover:text-white flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] transition-all"
            >
              <span>View Protocols</span>
              <ArrowRightIcon className="w-3.5 h-3.5 text-slate-400" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── 5. MY DEVELOPMENT GOALS (Target Milestones) ────────────────────── */}
      <section aria-label="Development Goals" className="rounded-xl bg-white/[0.015] backdrop-blur-sm border border-white/[0.06] p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-300">
              MY DEVELOPMENT GOALS
            </span>
            <span className="text-xs text-slate-500 font-mono">({goals.length})</span>
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setShowPicker((v) => !v)}
              className="flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-semibold transition-colors px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20"
            >
              <PlusIcon className="w-3.5 h-3.5" />
              <span>Add Goal</span>
            </button>
            {showPicker && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowPicker(false)} />
                <div className="absolute right-0 top-8 z-50 rounded-xl p-2 min-w-[220px] space-y-0.5 bg-[#0C0E14]/95 backdrop-blur-2xl border border-white/15 shadow-[0_12px_40px_rgba(0,0,0,0.85)]">
                  {availableGoals.map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => addGoal(g)}
                      className="block w-full text-left text-xs px-3 py-2 rounded-lg hover:bg-white/[0.08] text-white/70 hover:text-white transition-colors"
                    >
                      {g}
                    </button>
                  ))}
                  {availableGoals.length === 0 && (
                    <p className="text-xs text-white/40 px-3 py-2">All goals selected</p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {goals.map((g) => (
            <span
              key={g}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/25"
            >
              <span>{g}</span>
              <button
                type="button"
                onClick={() => removeGoal(g)}
                className="hover:text-rose-400 text-slate-400 transition-colors ml-0.5 text-sm font-bold leading-none"
                title="Remove goal"
              >
                &times;
              </button>
            </span>
          ))}
          {goals.length === 0 && (
            <p className="text-xs text-slate-500 font-sans py-1">
              No custom goals added yet. Click &ldquo;Add Goal&rdquo; above to track specific biomechanical milestones.
            </p>
          )}
        </div>
      </section>

      {/* ── 6. MOVEMENT PROFILE (Streamlined Breakdown) ──────────────────────── */}
      <section aria-label="Movement Profile" className="space-y-2.5 pt-1">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-0.5">
          <div>
            <h2 className="text-sm font-bold font-heading text-white">
              Movement Profile
            </h2>
            <p className="text-xs text-slate-400 font-sans">
              Kinematics evaluated against {roleTitle} performance benchmarks.
            </p>
          </div>

          {/* Clean Segmented Filter Bar (Only visible when assessment data exists) */}
          {hasAssessment && (
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
              {[
                { id: 'all', label: 'All', count: allTaggedItems.length },
                { id: 'bottlenecks', label: 'Bottlenecks', count: bottlenecks.length },
                { id: 'devAreas', label: 'Areas', count: devAreas.length },
                { id: 'proficient', label: 'On Target', count: proficient.length },
                { id: 'strengths', label: 'Strengths', count: strengths.length },
              ]
                .filter((t) => t.id === 'all' || t.count > 0)
                .map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTier(tab.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-sans transition-all whitespace-nowrap ${
                      activeTier === tab.id
                        ? 'bg-white text-slate-950 font-bold shadow-sm'
                        : 'bg-white/[0.03] text-slate-400 hover:text-white border border-white/[0.06]'
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span className="ml-1 font-mono text-[10px] opacity-75">
                      ({tab.count})
                    </span>
                  </button>
                ))}
            </div>
          )}
        </div>

        {/* Movement Profile Display Surface */}
        <div className="rounded-xl bg-white/[0.015] backdrop-blur-sm border border-white/[0.05] p-3 sm:p-4">
          {!hasAssessment ? (
            /* Clean Unboxed Empty State */
            <div className="py-2.5 px-1 flex items-center gap-2.5 text-xs text-slate-400 font-sans">
              <TargetIcon className="w-4 h-4 text-slate-500 shrink-0" />
              <span>
                No movement assessment on record. Complete your baseline calibration above to evaluate kinematics against {roleTitle} benchmarks.
              </span>
            </div>
          ) : filteredItems.length > 0 ? (
            /* Streamlined List with Hairline Row Dividers */
            <div className="divide-y divide-white/[0.04]">
              {filteredItems.map((item) => (
                <div key={item.attribute} className="py-2.5 first:pt-0 last:pb-0">
                  <BenchmarkBar
                    name={item.name || item.attribute.replace(/_/g, ' ')}
                    score={item.score}
                    benchmark={item.benchmark || 75}
                    gap={item.gap}
                    tier={item.tier}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="py-4 text-center text-xs text-slate-400 font-sans">
              No attributes recorded in this category.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
