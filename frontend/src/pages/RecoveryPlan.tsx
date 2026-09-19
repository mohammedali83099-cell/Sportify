import React, { useState, useEffect } from 'react';
import { useAthleteStore } from '../store/athleteStore';
import { planAPI } from '../api/client';
import { RecoveryPlanData } from '../types';
import {
  CheckIcon,
  ClockIcon,
  TargetIcon,
} from '../components/common/Icons';

export default function RecoveryPlan() {
  const profile = useAthleteStore((state) => state.profile);
  const [recoveryData, setRecoveryData] = useState<RecoveryPlanData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRecovery() {
      try {
        const res = await planAPI.getRecovery();
        if (res) setRecoveryData(res);
      } catch (err) {
        console.error('Failed to load recovery protocol:', err);
      } finally {
        setLoading(false);
      }
    }
    loadRecovery();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3 select-none">
        <div className="w-8 h-8 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin" />
        <p className="text-xs font-mono text-slate-400 uppercase tracking-widest">
          Loading Recovery State...
        </p>
      </div>
    );
  }

  const loadContext = recoveryData?.load_context || {};
  const isHighStrain = loadContext.strain_status === 'High Strain';
  const habits = recoveryData?.daily_habits || [];
  const activeSessions = recoveryData?.active_recovery_sessions || [];
  const schedule = recoveryData?.weekly_recovery_schedule || {};
  const injuryPrehab = recoveryData?.injury_prevention_focus;

  return (
    <div className="space-y-4 select-none pb-8">
      {/* ── 1. CURRENT RECOVERY STATE WITH SUPPORTING DATA ───────────────────── */}
      <section className="rounded-2xl bg-gradient-to-b from-white/[0.04] to-white/[0.01] backdrop-blur-md border border-white/[0.08] p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-sans font-medium text-slate-300 px-2.5 py-0.5 rounded-full bg-white/[0.05] border border-white/10">
              Recovery Status
            </span>
            <span
              className={`text-xs font-semibold font-sans px-2.5 py-0.5 rounded-full border ${
                isHighStrain
                  ? 'text-rose-400 bg-rose-500/10 border-rose-500/30'
                  : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
              }`}
            >
              {loadContext.strain_status || 'Optimal'}
            </span>
          </div>

          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold font-heading text-white tracking-tight">
              Readiness & Recovery
            </h1>
            <p className="text-xs text-slate-400 font-sans mt-0.5">
              Restoration protocols based on recent session volume and RPE.
            </p>
          </div>

          {/* Supporting Evidence Strip */}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/[0.06]">
            <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05] backdrop-blur-sm">
              <span className="text-[10px] text-slate-400 font-sans block mb-0.5">
                Status
              </span>
              <p
                className={`text-sm font-bold font-sans ${
                  isHighStrain ? 'text-rose-400' : 'text-emerald-400'
                }`}
              >
                {loadContext.strain_status || 'Optimal'}
              </p>
            </div>

            <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05] backdrop-blur-sm">
              <span className="text-[10px] text-slate-400 font-sans block mb-0.5">
                Avg RPE
              </span>
              <p className="text-sm font-bold font-mono text-white">
                {loadContext.avg_recent_rpe ? loadContext.avg_recent_rpe.toFixed(1) : '6.0'}
                <span className="text-[10px] font-normal text-slate-400 ml-0.5">/10</span>
              </p>
            </div>

            <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05] backdrop-blur-sm">
              <span className="text-[10px] text-slate-400 font-sans block mb-0.5">
                Weekly Volume
              </span>
              <p className="text-sm font-bold font-mono text-white">
                {loadContext.total_weekly_minutes || 240}
                <span className="text-[10px] font-normal text-slate-400 ml-0.5">mins</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. DAILY HABITS & INJURY PREHAB ─────────────────────────────────── */}
      <div className="space-y-3.5">
        {/* Daily Habits */}
        <section className="rounded-2xl bg-[#0C0E14]/80 backdrop-blur-md border border-white/[0.08] p-4 sm:p-5 space-y-3 hover:border-white/15 transition-all shadow-lg">
          <div className="flex items-center justify-between pb-1 border-b border-white/[0.06]">
            <h2 className="text-sm font-bold font-heading text-white">
              Daily Habits
            </h2>
            <span className="text-[11px] font-mono text-slate-400">
              {habits.length} daily
            </span>
          </div>

          <div className="space-y-2">
            {habits.map((habit, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05] backdrop-blur-sm flex items-start gap-2.5 text-xs text-slate-200"
              >
                <CheckIcon className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span className="font-sans leading-relaxed">{habit}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Injury Prehab Focus */}
        <section className="rounded-2xl bg-[#0C0E14]/80 backdrop-blur-md border border-white/[0.08] p-4 sm:p-5 space-y-2.5 hover:border-white/15 transition-all shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-sans font-medium text-slate-400">
              Prehab Focus
            </span>
            <TargetIcon className="w-4 h-4 text-slate-400" />
          </div>
          <h2 className="text-sm font-bold font-heading text-white">
            Joint Activation & Prehab
          </h2>
          <div className="border-l-2 border-white/20 pl-3 py-1">
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              {injuryPrehab ||
                '5 minutes of targeted stabilization and mobility before high-intensity sessions.'}
            </p>
          </div>
        </section>
      </div>

      {/* ── 3. ACTIVE RECOVERY SESSIONS ─────────────────────────────────────── */}
      <section className="space-y-2.5">
        <div className="px-0.5">
          <h2 className="text-sm font-bold font-heading text-white">
            Active Recovery Sessions
          </h2>
          <p className="text-[11px] text-slate-400 font-sans">
            Tissue recovery and mobility protocols.
          </p>
        </div>

        <div className="space-y-3.5">
          {activeSessions.map((session, idx) => (
            <div
              key={idx}
              className="rounded-2xl bg-[#0C0E14]/80 backdrop-blur-md border border-white/[0.08] p-4 sm:p-5 space-y-3 hover:border-white/15 transition-all shadow-lg"
            >
              <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
                <h3 className="text-sm font-bold text-white font-heading">
                  {session.name}
                </h3>
                <span className="text-xs font-mono text-slate-300 px-2 py-0.5 rounded-md bg-white/[0.05] border border-white/10">
                  {session.duration_minutes} mins
                </span>
              </div>

              <div className="divide-y divide-white/[0.05] rounded-xl bg-white/[0.015] border border-white/[0.04] px-3.5 py-0.5">
                {session.exercises?.map((ex, exIdx) => (
                  <div
                    key={exIdx}
                    className="py-2 text-xs text-slate-300 font-sans"
                  >
                    • {ex}
                  </div>
                ))}
              </div>

              {session.when && (
                <div className="text-[11px] text-slate-400 font-sans pt-0.5 flex items-center gap-1.5">
                  <ClockIcon className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span>Schedule: {session.when}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── 4. WEEKLY RECOVERY TIMELINE ─────────────────────────────────────── */}
      <section className="rounded-2xl bg-[#0C0E14]/80 backdrop-blur-md border border-white/[0.08] p-4 sm:p-5 space-y-3 hover:border-white/15 transition-all shadow-lg">
        <div className="flex items-center justify-between pb-1 border-b border-white/[0.06]">
          <h2 className="text-sm font-bold font-heading text-white">
            Weekly Recovery Schedule
          </h2>
          <span className="text-[11px] font-sans text-slate-400">
            Weekly Overview
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-1">
          {Object.keys(schedule).map((dayKey) => (
            <div
              key={dayKey}
              className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] backdrop-blur-sm space-y-1"
            >
              <span className="text-[10px] font-sans font-semibold text-slate-400 uppercase tracking-wider block">
                {dayKey.replace(/_/g, ' ')}
              </span>
              <p className="text-xs text-slate-200 font-sans leading-snug">
                {schedule[dayKey]}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
