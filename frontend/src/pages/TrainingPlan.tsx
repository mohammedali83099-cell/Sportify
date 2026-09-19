import React, { useState, useEffect } from 'react';
import { useAthleteStore } from '../store/athleteStore';
import { planAPI, progressAPI } from '../api/client';
import { TrainingPlanData, PlanSessionItem } from '../types';
import {
  ClockIcon,
  CheckIcon,
  ZapIcon,
  CloseIcon,
} from '../components/common/Icons';

export default function TrainingPlan() {
  const currentPlan = useAthleteStore((state) => state.currentPlan);
  const setPlan = useAthleteStore((state) => state.setPlan);
  const profile = useAthleteStore((state) => state.profile);

  const [planData, setPlanData] = useState<TrainingPlanData | null>(currentPlan?.plan_data || null);
  const [loading, setLoading] = useState(!currentPlan);
  const [generating, setGenerating] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [selectedSession, setSelectedSession] = useState<PlanSessionItem | null>(null);

  // Logging Workout Modal State
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [logForm, setLogForm] = useState<{
    session_type: string;
    duration_minutes: number | string;
    perceived_exertion: number | string;
    notes: string;
  }>({
    session_type: 'Strength',
    duration_minutes: 60,
    perceived_exertion: 7,
    notes: '',
  });
  const [loggingSuccess, setLoggingSuccess] = useState(false);

  useEffect(() => {
    async function fetchPlan() {
      try {
        const res = await planAPI.getCurrent();
        if (res) {
          setPlan(res);
          setPlanData(res.plan_data || null);
        }
      } catch (err) {
        handleGeneratePlan();
      } finally {
        setLoading(false);
      }
    }
    if (!currentPlan) {
      fetchPlan();
    } else {
      setPlanData(currentPlan.plan_data || null);
      setLoading(false);
    }
  }, [currentPlan, setPlan]);

  const handleGeneratePlan = async () => {
    setGenerating(true);
    try {
      const res = await planAPI.generate();
      setPlan(res);
      setPlanData(res.plan_data || null);
    } catch (err) {
      console.error('Failed to generate plan:', err);
    } finally {
      setGenerating(false);
    }
  };

  const handleOpenLogModal = (session: PlanSessionItem) => {
    setSelectedSession(session);
    setLogForm({
      session_type: session?.type || 'Strength',
      duration_minutes: session?.duration_minutes || profile?.session_duration_minutes || 60,
      perceived_exertion: 7,
      notes: `Completed ${session?.session_name || 'scheduled workout'}.`,
    });
    setLoggingSuccess(false);
    setIsLogModalOpen(true);
  };

  const handleSubmitLog = async (e?: React.FormEvent) => {
    e?.preventDefault();
    try {
      await progressAPI.logSession({
        session_date: new Date().toISOString().split('T')[0],
        session_type: logForm.session_type,
        duration_minutes: Number(logForm.duration_minutes),
        perceived_exertion: Number(logForm.perceived_exertion),
        notes: logForm.notes,
        completed: true,
      });
      setLoggingSuccess(true);
      setTimeout(() => {
        setIsLogModalOpen(false);
        setLoggingSuccess(false);
      }, 1500);
    } catch (err) {
      console.error('Failed to log session:', err);
    }
  };

  if (loading || generating) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3 select-none">
        <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-white animate-spin" />
        <p className="text-xs font-mono text-slate-400 uppercase tracking-widest">
          {generating ? 'Synthesizing 4-Week Training Pathway...' : 'Loading Training Pathway...'}
        </p>
      </div>
    );
  }

  const weeks = planData?.weeks || [];
  const currentWeekData = weeks.find((w) => w.week_number === selectedWeek) || weeks[0];
  const sessions = currentWeekData?.sessions || [];

  const formatConciseSummary = (summary?: string) => {
    if (!summary) return 'Targeted progressive overload for your movement priorities.';
    const focusMatch = summary.match(/primary focus on ([^.]+)/i);
    if (focusMatch) {
      return `Targeted progressive overload focusing on ${focusMatch[1].trim()}.`;
    }
    const firstSentence = summary.split(/\.\s+/)[0];
    return firstSentence.endsWith('.') ? firstSentence : `${firstSentence}.`;
  };

  return (
    <div className="space-y-4 select-none pb-8">
      {/* ── 1. TOP HERO: WORKOUT CONTEXT & DISCREET REGENERATE ────────────────── */}
      <section className="rounded-2xl bg-gradient-to-b from-white/[0.04] to-white/[0.01] backdrop-blur-md border border-white/[0.08] p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[11px] font-sans font-medium text-slate-300 px-2.5 py-0.5 rounded-full bg-white/[0.05] border border-white/10">
                4-Week Training Pathway
              </span>
              <span className="text-xs font-mono text-slate-400">
                Week {selectedWeek} of {weeks.length || 4}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold font-heading text-white tracking-tight">
              {planData?.plan_title || 'Personalized Training Pathway'}
            </h1>
            <p className="text-xs text-slate-400 mt-1 font-sans max-w-xl">
              {formatConciseSummary(planData?.plan_summary)}
            </p>
          </div>

          {/* Discreet secondary regenerate action */}
          <button
            onClick={handleGeneratePlan}
            disabled={generating}
            className="btn-ghost text-xs flex items-center gap-1.5 px-3 py-1.5 shrink-0 border border-white/10"
            title="Regenerate Plan"
          >
            <ZapIcon className="w-3.5 h-3.5 text-slate-400" />
            <span>Regenerate Plan</span>
          </button>
        </div>

        {/* ── 2. LIGHTWEIGHT 4-WEEK PHASE SELECTOR TABS ──────────────────────── */}
        <div className="grid grid-cols-4 p-1 rounded-xl bg-white/[0.02] border border-white/[0.06] backdrop-blur-sm gap-1 mt-4 text-center">
          {weeks.map((wk) => {
            const active = selectedWeek === wk.week_number;
            return (
              <button
                key={wk.week_number}
                type="button"
                onClick={() => setSelectedWeek(wk.week_number)}
                className={`py-2 px-1 rounded-lg text-center transition-all ${
                  active
                    ? 'bg-white text-slate-950 font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <div className="text-xs font-sans font-medium">
                  Week {wk.week_number}
                </div>
                <div className="text-[10px] font-mono opacity-70">
                  {wk.sessions?.length || 0} sess
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* ── 3. WEEK SESSIONS WORKFLOW ────────────────────────────────────────── */}
      <section className="space-y-3">
        <div className="px-0.5">
          <h2 className="text-sm font-bold font-heading text-white">
            {currentWeekData?.week_theme || `Week ${selectedWeek} Sessions`}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 items-start">
          {sessions.map((session, idx) => (
            <div
              key={idx}
              className="rounded-2xl bg-[#0C0E14]/80 backdrop-blur-md border border-white/[0.08] p-4 sm:p-5 space-y-3.5 hover:border-white/15 transition-all shadow-lg"
            >
              {/* Session Header */}
              <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-white/[0.06]">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-white font-bold font-mono text-xs shrink-0">
                    D{session.day || idx + 1}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-white font-heading truncate">
                      {session.session_name}
                    </h3>
                    {session.type && (
                      <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block">
                        {session.type}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1 text-xs text-slate-400 font-mono px-2 py-1 rounded-md bg-white/[0.02] border border-white/[0.05] shrink-0">
                  <ClockIcon className="w-3.5 h-3.5 text-slate-400" />
                  <span>{session.duration_minutes || 60}m</span>
                </div>
              </div>

              {/* Integrated Warm-Up (Concise scannable label) */}
              {session.warmup && session.warmup.length > 0 && (
                <div className="border-l-2 border-white/20 pl-3 py-0.5 space-y-0.5">
                  <span className="text-[10px] font-sans font-semibold text-slate-400 uppercase tracking-wider block">
                    Warm-Up
                  </span>
                  <p className="text-xs text-slate-300 font-sans leading-relaxed">
                    {session.warmup.join(' • ')}
                  </p>
                </div>
              )}

              {/* Scannable Exercises */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-sans font-semibold text-slate-400 uppercase tracking-wider block">
                  Exercises ({session.main_exercises?.length || 0})
                </span>

                <div className="divide-y divide-white/[0.05] rounded-xl bg-white/[0.015] border border-white/[0.04] px-3.5 py-0.5">
                  {session.main_exercises?.map((ex, exIdx) => (
                    <div key={exIdx} className="py-2.5 space-y-1">
                      {/* Name & Sets x Reps */}
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-xs sm:text-sm text-white font-sans truncate">
                          {ex.name}
                        </span>
                        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-white/[0.05] border border-white/[0.08] text-slate-200 shrink-0">
                          {ex.sets} × {ex.reps}
                        </span>
                      </div>

                      {/* Rest & Target Bottleneck */}
                      <div className="flex items-center justify-between text-[11px] text-slate-400 font-sans">
                        <span>Rest: {ex.rest_seconds || 90}s</span>
                        {ex.targets_bottleneck && (
                          <span className="text-slate-400 text-[10px] font-medium capitalize truncate max-w-[140px]">
                            {ex.targets_bottleneck.replace(/_/g, ' ')}
                          </span>
                        )}
                      </div>

                      {/* Coaching Cue */}
                      {ex.coaching_cue && (
                        <p className="text-xs text-slate-400 italic font-sans pl-0.5 pt-0.5">
                          "{ex.coaching_cue}"
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Integrated Cool-Down (Concise scannable label) */}
              {session.cooldown && session.cooldown.length > 0 && (
                <div className="border-l-2 border-emerald-500/40 pl-3 py-0.5 space-y-0.5">
                  <span className="text-[10px] font-sans font-semibold text-emerald-400 uppercase tracking-wider block">
                    Cool-Down
                  </span>
                  <p className="text-xs text-slate-300 font-sans leading-relaxed">
                    {session.cooldown.join(' • ')}
                  </p>
                </div>
              )}

              {/* Natural Completion: Log Session Button */}
              <button
                type="button"
                onClick={() => handleOpenLogModal(session)}
                className="w-full h-11 btn-primary text-xs flex items-center justify-center gap-2 mt-1"
              >
                <CheckIcon className="w-4 h-4 text-slate-950" />
                <span>Log Session</span>
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ── 4. LOG WORKOUT MODAL (Preserved 100% Functionally) ──────────────── */}
      {isLogModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="sportify-card max-w-md w-full p-5 rounded-t-2xl sm:rounded-2xl border-white/[0.1] shadow-2xl relative max-h-[88vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/[0.06]">
              <div>
                <h3 className="text-base font-bold font-heading text-white">
                  Log Completed Session
                </h3>
                <p className="text-xs text-slate-400 font-sans">
                  {selectedSession?.session_name || 'Workout Logging'}
                </p>
              </div>
              <button
                onClick={() => setIsLogModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <CloseIcon className="w-5 h-5" />
              </button>
            </div>

            {loggingSuccess ? (
              <div className="py-8 text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckIcon className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-white font-heading">
                  Workout Successfully Logged!
                </h4>
                <p className="text-xs text-slate-400 font-sans">
                  Workload index & streak metrics updated.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitLog} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Session Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    value={logForm.duration_minutes}
                    onChange={(e) =>
                      setLogForm({ ...logForm, duration_minutes: e.target.value })
                    }
                    className="w-full sportify-input text-xs font-mono"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-1">
                    <span>Perceived Exertion (RPE)</span>
                    <span className="text-white font-mono text-sm">{logForm.perceived_exertion} / 10</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={logForm.perceived_exertion}
                    onChange={(e) =>
                      setLogForm({ ...logForm, perceived_exertion: e.target.value })
                    }
                    className="w-full accent-white cursor-pointer"
                  />
                  <div className="flex justify-between text-[11px] text-slate-500 font-mono mt-1">
                    <span>1 (Light)</span>
                    <span>5 (Moderate)</span>
                    <span>10 (Max Effort)</span>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Session Notes
                  </label>
                  <textarea
                    rows={3}
                    value={logForm.notes}
                    onChange={(e) =>
                      setLogForm({ ...logForm, notes: e.target.value })
                    }
                    placeholder="How did movement mechanics and power output feel?"
                    className="w-full sportify-input text-xs"
                  />
                </div>

                <div className="pt-2 flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsLogModalOpen(false)}
                    className="w-1/3 h-11 btn-secondary text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="w-2/3 h-11 btn-primary text-xs flex items-center justify-center gap-2"
                  >
                    <CheckIcon className="w-4 h-4 text-slate-950" />
                    <span>Confirm & Persist Log</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
