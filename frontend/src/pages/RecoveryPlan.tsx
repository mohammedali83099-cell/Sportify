import React, { useState, useEffect } from 'react';
import { useAthleteStore } from '../store/athleteStore';
import { planAPI } from '../api/client';
import {
  CheckIcon,
  ClockIcon,
  TargetIcon,
} from '../components/common/Icons';

export default function RecoveryPlan() {
  const profile = useAthleteStore((state) => state.profile);
  const [recoveryData, setRecoveryData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showCheckInModal, setShowCheckInModal] = useState(false);

  // Form State for Doctor Recommendation Check-In
  const [injuryName, setInjuryName] = useState('');
  const [severity, setSeverity] = useState('Moderate');
  const [restDays, setRestDays] = useState(3);
  const [rehabDays, setRehabDays] = useState(7);
  const [doctorExercises, setDoctorExercises] = useState('');
  const [doctorRestrictions, setDoctorRestrictions] = useState('');
  const [currentDay, setCurrentDay] = useState(1);

  const quickInjuries = [
    'Hamstring Strain',
    'Patellar Tendinopathy',
    'Ankle Sprain',
    'Lower Back Spasm',
    'Groin / Adductor Strain',
    'Shoulder Impingement',
  ];

  const loadRecovery = async () => {
    try {
      setLoading(true);
      const res = await planAPI.getRecovery();
      if (res) {
        setRecoveryData(res);
        if (res.has_doctor_guidance && res.injury_details) {
          setInjuryName(res.injury_details.injury_name || '');
          setSeverity(res.injury_details.severity || 'Moderate');
          setRestDays(res.injury_details.doctor_rest_days || 3);
          setRehabDays(res.injury_details.doctor_rehab_days || 7);
          setCurrentDay(res.injury_details.current_day || 1);
          if (res.doctor_prescribed_exercises) {
            setDoctorExercises(res.doctor_prescribed_exercises.join('\n'));
          }
          if (res.doctor_red_lines) {
            setDoctorRestrictions(res.doctor_red_lines.join('\n'));
          }
        }
      }
    } catch (err) {
      console.error('Failed to load recovery protocol:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecovery();
  }, []);

  const handleCheckInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!injuryName.trim()) return;

    try {
      setSubmitting(true);
      const payload = {
        injury_name: injuryName.trim(),
        severity,
        doctor_rest_days: Number(restDays),
        doctor_rehab_days: Number(rehabDays),
        doctor_exercises: doctorExercises.trim() || undefined,
        doctor_restrictions: doctorRestrictions.trim() || undefined,
        current_day_offset: Number(currentDay),
      };

      const res = await planAPI.submitRecoveryCheckIn(payload);
      if (res && res.recovery_protocol) {
        setRecoveryData(res.recovery_protocol);
      } else {
        await loadRecovery();
      }
      setShowCheckInModal(false);
    } catch (err) {
      console.error('Failed to submit doctor recommendation:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3 select-none">
        <div className="w-8 h-8 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin" />
        <p className="text-xs font-mono text-slate-400 uppercase tracking-widest">
          Loading Recovery Protocol...
        </p>
      </div>
    );
  }

  const hasDoctorGuidance = !!recoveryData?.has_doctor_guidance;
  const injuryDetails = recoveryData?.injury_details;
  const phases = recoveryData?.phases || [];
  const doctorExercisesList = recoveryData?.doctor_prescribed_exercises || [];
  const doctorRedLines = recoveryData?.doctor_red_lines || [];
  const loadContext = recoveryData?.load_context || {};
  const habits = recoveryData?.daily_habits || [];
  const activeSessions = recoveryData?.active_recovery_sessions || [];

  return (
    <div className="space-y-5 select-none pb-12 max-w-5xl mx-auto">
      {/* ── 1. HEADER & INJURY STATUS BANNER ─────────────────────────────────── */}
      <section className="rounded-2xl bg-gradient-to-b from-white/[0.04] to-white/[0.01] backdrop-blur-md border border-white/[0.08] p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-sans font-medium text-slate-300 px-2.5 py-0.5 rounded-full bg-white/[0.05] border border-white/10">
                {profile?.sport ? profile.sport.toUpperCase() : 'ATHLETE'} RECOVERY
              </span>
              {hasDoctorGuidance ? (
                <span className="text-[11px] font-semibold font-sans px-2.5 py-0.5 rounded-full border text-emerald-400 bg-emerald-500/10 border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Doctor-Grounded Protocol
                </span>
              ) : (
                <span className="text-[11px] font-semibold font-sans px-2.5 py-0.5 rounded-full border text-sky-400 bg-sky-500/10 border-sky-500/30">
                  Standard Conditioning Protocol
                </span>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold font-heading text-white tracking-tight">
              {hasDoctorGuidance
                ? `${injuryDetails?.injury_name} Rehabilitation`
                : 'Readiness & Recovery Pathway'}
            </h1>
            <p className="text-xs text-slate-400 font-sans">
              {hasDoctorGuidance
                ? `Day ${injuryDetails?.current_day} of ${injuryDetails?.total_medical_days} medical timeline • ${injuryDetails?.active_phase_name}`
                : 'Restoration protocols based on weekly load, tissue health, and sleep.'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowCheckInModal(true)}
              className="px-4 py-2 rounded-xl text-xs font-semibold font-sans text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              {hasDoctorGuidance ? 'Update Doctor Recommendation' : 'Check-In Doctor Orders'}
            </button>
          </div>
        </div>

        {/* Doctor Summary Strip if Active */}
        {hasDoctorGuidance && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-4 mt-4 border-t border-white/[0.06]">
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
              <span className="text-[10px] text-slate-400 block mb-0.5 font-sans uppercase">Severity</span>
              <p className="text-sm font-bold font-sans text-amber-400">{injuryDetails?.severity}</p>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
              <span className="text-[10px] text-slate-400 block mb-0.5 font-sans uppercase">Doctor Rest</span>
              <p className="text-sm font-bold font-mono text-white">
                {injuryDetails?.doctor_rest_days} <span className="text-xs font-normal text-slate-400">days</span>
              </p>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
              <span className="text-[10px] text-slate-400 block mb-0.5 font-sans uppercase">Doctor Rehab</span>
              <p className="text-sm font-bold font-mono text-white">
                {injuryDetails?.doctor_rehab_days} <span className="text-xs font-normal text-slate-400">days</span>
              </p>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
              <span className="text-[10px] text-slate-400 block mb-0.5 font-sans uppercase">Current Status</span>
              <p className="text-sm font-bold font-sans text-emerald-400">
                {injuryDetails?.active_phase_id === 1 && 'Rest Phase'}
                {injuryDetails?.active_phase_id === 2 && 'Doctor Rehab'}
                {injuryDetails?.active_phase_id === 3 && 'Return-to-Play'}
              </p>
            </div>
          </div>
        )}
      </section>

      {/* ── 2. THREE-PHASE PROGRESSION TIMELINE (DOCTOR TO SYSTEM HAND-OFF) ─── */}
      {hasDoctorGuidance && (
        <section className="rounded-2xl bg-[#0C0E14]/80 backdrop-blur-md border border-white/[0.08] p-5 sm:p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
            <div>
              <h2 className="text-base font-bold font-heading text-white">
                Recovery & Return-to-Play Pathway
              </h2>
              <p className="text-xs text-slate-400 font-sans mt-0.5">
                Doctor's orders dictate Phase 1 & 2. The Sportify engine safely progresses Phase 3.
              </p>
            </div>
            <span className="text-xs font-mono text-emerald-400 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20">
              Hand-Off Architecture
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {phases.map((ph: any) => {
              const isActive = ph.status === 'active';
              const isCompleted = ph.status === 'completed';

              return (
                <div
                  key={ph.phase_number}
                  className={`p-4 rounded-xl border transition-all flex flex-col justify-between relative overflow-hidden ${
                    isActive
                      ? 'bg-gradient-to-b from-emerald-500/[0.08] to-emerald-500/[0.02] border-emerald-500/40 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500/30'
                      : isCompleted
                      ? 'bg-white/[0.02] border-white/10 opacity-80'
                      : 'bg-white/[0.01] border-white/[0.05] opacity-60'
                  }`}
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                          isActive
                            ? 'text-emerald-300 bg-emerald-500/20 border-emerald-500/40'
                            : isCompleted
                            ? 'text-slate-400 bg-white/5 border-white/10'
                            : 'text-slate-500 bg-white/[0.02] border-white/[0.05]'
                        }`}
                      >
                        {ph.day_range}
                      </span>
                      {isActive && (
                        <span className="text-[10px] font-semibold text-emerald-400 flex items-center gap-1 font-sans">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                          ACTIVE NOW
                        </span>
                      )}
                      {isCompleted && (
                        <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-1 font-sans">
                          <CheckIcon className="w-3.5 h-3.5 text-emerald-400" />
                          COMPLETED
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm font-bold font-heading text-white">{ph.phase_name}</h3>
                    <p className="text-xs text-slate-300 font-sans leading-relaxed">{ph.focus}</p>

                    <div className="space-y-1.5 pt-2 border-t border-white/[0.06]">
                      {ph.protocol_items?.map((item: string, idx: number) => (
                        <div key={idx} className="flex items-start gap-2 text-[11px] text-slate-300 font-sans">
                          <span className="text-emerald-400 font-bold mt-0.5">•</span>
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>

                    {ph.return_to_play_milestones && (
                      <div className="pt-2 border-t border-white/[0.06] space-y-1">
                        <span className="text-[10px] font-semibold uppercase text-sky-400 block font-sans">
                          Clearance Milestones:
                        </span>
                        {ph.return_to_play_milestones.map((m: string, mIdx: number) => (
                          <div key={mIdx} className="text-[11px] text-slate-300 font-sans flex items-start gap-1.5">
                            <span className="text-sky-400">✓</span>
                            <span>{m}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ── 3. DOCTOR'S PRESCRIBED EXERCISES & RED LINES (CONTRAINDICATIONS) ── */}
      {hasDoctorGuidance && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Doctor Prescribed Exercises */}
          <section className="rounded-2xl bg-[#0C0E14]/80 backdrop-blur-md border border-emerald-500/20 p-5 space-y-3 shadow-lg">
            <div className="flex items-center justify-between pb-2 border-b border-emerald-500/10">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <h2 className="text-sm font-bold font-heading text-white">Doctor's Prescribed Rehab</h2>
              </div>
              <span className="text-[11px] font-mono text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                Medical Orders
              </span>
            </div>

            <p className="text-xs text-slate-300 font-sans">
              Perform these exact movements daily as prescribed by your doctor / physiotherapist:
            </p>

            <div className="space-y-2 pt-1">
              {doctorExercisesList.length > 0 ? (
                doctorExercisesList.map((ex: string, idx: number) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-emerald-500/[0.04] border border-emerald-500/20 flex items-center gap-3 text-xs text-slate-100 font-sans"
                  >
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-mono font-bold text-xs shrink-0">
                      {idx + 1}
                    </span>
                    <span className="font-medium">{ex}</span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 italic">No specific exercises recorded.</p>
              )}
            </div>
          </section>

          {/* Doctor's Red Lines (Contraindications) */}
          <section className="rounded-2xl bg-[#0C0E14]/80 backdrop-blur-md border border-rose-500/30 p-5 space-y-3 shadow-lg">
            <div className="flex items-center justify-between pb-2 border-b border-rose-500/10">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
                <h2 className="text-sm font-bold font-heading text-rose-300">Doctor's Red Lines (Contraindications)</h2>
              </div>
              <span className="text-[11px] font-mono text-rose-400 px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/20">
                Strict Prohibition
              </span>
            </div>

            <p className="text-xs text-rose-200/80 font-sans">
              DO NOT perform these movements or load ranges under any circumstances until medically cleared:
            </p>

            <div className="space-y-2 pt-1">
              {doctorRedLines.length > 0 ? (
                doctorRedLines.map((restr: string, idx: number) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-rose-500/[0.06] border border-rose-500/20 flex items-center gap-3 text-xs text-rose-200 font-sans"
                  >
                    <span className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center font-mono font-bold text-xs shrink-0">
                      ✕
                    </span>
                    <span className="font-medium">{restr}</span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 italic">No strict contraindications specified.</p>
              )}
            </div>
          </section>
        </div>
      )}

      {/* ── 4. DAILY HABITS & INJURY PREHAB ─────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Daily Habits */}
        <section className="rounded-2xl bg-[#0C0E14]/80 backdrop-blur-md border border-white/[0.08] p-5 space-y-3 hover:border-white/15 transition-all shadow-lg">
          <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
            <h2 className="text-sm font-bold font-heading text-white">Daily Restoration Habits</h2>
            <span className="text-[11px] font-mono text-slate-400">{habits.length} protocols</span>
          </div>

          <div className="space-y-2">
            {habits.map((habit: string, idx: number) => (
              <div
                key={idx}
                className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05] flex items-start gap-2.5 text-xs text-slate-200"
              >
                <CheckIcon className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span className="font-sans leading-relaxed">{habit}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Active Recovery Sessions */}
        <section className="rounded-2xl bg-[#0C0E14]/80 backdrop-blur-md border border-white/[0.08] p-5 space-y-3 hover:border-white/15 transition-all shadow-lg">
          <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
            <h2 className="text-sm font-bold font-heading text-white">Tissue & Mobility Flushes</h2>
            <span className="text-[11px] font-mono text-slate-400">Daily Routines</span>
          </div>

          <div className="space-y-3">
            {activeSessions.map((session: any, idx: number) => (
              <div key={idx} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] space-y-1.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-white font-heading">{session.name}</h3>
                  <span className="text-[10px] font-mono text-slate-400 px-1.5 py-0.5 rounded bg-white/[0.05]">
                    {session.duration_minutes} mins
                  </span>
                </div>
                <div className="text-[11px] text-slate-300 space-y-0.5 font-sans">
                  {session.exercises?.slice(0, 3).map((ex: string, eIdx: number) => (
                    <div key={eIdx}>• {ex}</div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* ── MODAL: DOCTOR INJURY & RECOMMENDATION CHECK-IN ─────────────────── */}
      {showCheckInModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="rounded-2xl bg-[#12151F] border border-white/10 w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h2 className="text-lg font-bold font-heading text-white">
                  Doctor & Injury Recommendation Check-In
                </h2>
                <p className="text-xs text-slate-400 font-sans mt-0.5">
                  Input your medical diagnosis and doctor's prescribed protocol.
                </p>
              </div>
              <button
                onClick={() => setShowCheckInModal(false)}
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCheckInSubmit} className="space-y-4 text-xs">
              {/* Injury Name */}
              <div className="space-y-1.5">
                <label className="text-slate-300 font-medium block">
                  Injury / Issue Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={injuryName}
                  onChange={(e) => setInjuryName(e.target.value)}
                  placeholder="e.g. Grade 1 Hamstring Strain, Patellar Tendinitis"
                  className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 text-xs"
                  required
                />
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {quickInjuries.map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => setInjuryName(q)}
                      className="px-2 py-1 rounded-md text-[10px] bg-white/[0.03] hover:bg-white/[0.08] text-slate-400 hover:text-white border border-white/5 transition-all"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>

              {/* Severity & Day Offset */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-slate-300 font-medium block">Severity</label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#1A1D27] border border-white/10 text-white focus:outline-none focus:border-emerald-400 text-xs"
                  >
                    <option value="Mild">Mild (Low pain, minor tightness)</option>
                    <option value="Moderate">Moderate (Restricted movement, sharp on load)</option>
                    <option value="Severe">Severe (Structural tear, zero load tolerance)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-300 font-medium block">Current Day in Recovery</label>
                  <input
                    type="number"
                    min={1}
                    max={60}
                    value={currentDay}
                    onChange={(e) => setCurrentDay(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white focus:outline-none focus:border-emerald-400 text-xs font-mono"
                  />
                </div>
              </div>

              {/* Rest Days & Rehab Days */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-slate-300 font-medium block">
                    Doctor Prescribed Rest Days <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={60}
                    value={restDays}
                    onChange={(e) => setRestDays(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white focus:outline-none focus:border-emerald-400 text-xs font-mono"
                    required
                  />
                  <span className="text-[10px] text-slate-500">Days of complete offloading & RICE.</span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-300 font-medium block">
                    Doctor Prescribed Rehab Days <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={120}
                    value={rehabDays}
                    onChange={(e) => setRehabDays(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white focus:outline-none focus:border-emerald-400 text-xs font-mono"
                    required
                  />
                  <span className="text-[10px] text-slate-500">Active physical therapy & guided mobility.</span>
                </div>
              </div>

              {/* Doctor's Prescribed Exercises */}
              <div className="space-y-1.5">
                <label className="text-slate-300 font-medium block">
                  Doctor's Prescribed Rehab Exercises (One per line)
                </label>
                <textarea
                  rows={3}
                  value={doctorExercises}
                  onChange={(e) => setDoctorExercises(e.target.value)}
                  placeholder="e.g. Isometric Hamstring Bridge (3x20s)&#10;Prone Banded Leg Curl (3x15)&#10;Gentle foam rolling on glutes"
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 text-xs font-mono"
                />
              </div>

              {/* Doctor's Restrictions / Red Lines */}
              <div className="space-y-1.5">
                <label className="text-rose-300 font-medium block">
                  Doctor's Restrictions / Prohibited Movements (One per line)
                </label>
                <textarea
                  rows={2}
                  value={doctorRestrictions}
                  onChange={(e) => setDoctorRestrictions(e.target.value)}
                  placeholder="e.g. No maximal sprinting&#10;No heavy deadlifts or squats past 90 degrees&#10;No aggressive static stretching"
                  className="w-full px-3 py-2 rounded-xl bg-rose-500/[0.05] border border-rose-500/20 text-rose-200 placeholder-rose-300/40 focus:outline-none focus:border-rose-400 text-xs font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowCheckInModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2"
                >
                  {submitting && <div className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />}
                  Submit & Initialize Protocol
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

