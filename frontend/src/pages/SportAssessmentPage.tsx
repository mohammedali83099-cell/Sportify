import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Navigate, Link } from 'react-router-dom';
import { useAthleteStore } from '../store/athleteStore';
import { assessmentAPI } from '../api/client';
import {
  normalizeSport,
  getSportAssessmentContext,
  getProtocolGuide,
} from '../config/sportAssessmentConfig';
import AssessmentHero from '../components/assessment/AssessmentHero';
import PrimaryProtocolCard from '../components/assessment/PrimaryProtocolCard';
import CameraSetupGuide from '../components/assessment/CameraSetupGuide';
import AssessmentUploader from '../components/assessment/AssessmentUploader';
import FoundationalSection from '../components/assessment/FoundationalSection';
import RoleNoticeCard from '../components/assessment/RoleNoticeCard';
import { TargetIcon, ArrowRightIcon, AlertTriangleIcon, SlidersIcon, CheckIcon } from '../components/common/Icons';

export const SportAssessmentPage: React.FC = () => {
  const { sport: rawSportParam } = useParams<{ sport: string }>();
  const navigate = useNavigate();

  const profile = useAthleteStore((state) => state.profile);
  const profileStatus = useAthleteStore((state) => state.profileStatus);
  const currentAssessment = useAthleteStore((state) => state.currentAssessment);
  const setAssessment = useAthleteStore((state) => state.setAssessment);

  const [selectedProtocolId, setSelectedProtocolId] = useState<string | null>(null);

  // Hydrate latest assessment if not already in store
  useEffect(() => {
    async function loadLatestAssessment() {
      if (!currentAssessment) {
        try {
          const res = await assessmentAPI.getLatest();
          if (res) {
            setAssessment(res);
          }
        } catch {
          // No prior assessment yet
        }
      }
    }
    loadLatestAssessment();
  }, [currentAssessment, setAssessment]);

  // Derived normalized sport values
  const athleteSportNormalized = profile?.sport ? normalizeSport(profile.sport) : null;
  const urlSportNormalized = rawSportParam ? normalizeSport(rawSportParam) : null;

  // Resolve assessment context for the athlete's actual sport and role
  const assessmentContext = athleteSportNormalized
    ? getSportAssessmentContext({
        sport: athleteSportNormalized,
        role: profile?.primary_role,
        subRole: profile?.secondary_role,
      })
    : null;

  // Smooth scroll helper
  const handleScrollToUploader = () => {
    const el = document.getElementById('recording-uploader');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  // ── 1. LOADING STATE ────────────────────────────────────────────────────────
  if (profileStatus === 'loading') {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3 select-none">
        <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-white animate-spin" />
        <p className="text-xs font-mono text-slate-400 uppercase tracking-widest">
          Loading Assessment...
        </p>
      </div>
    );
  }

  // ── 2. GUARD: NO PROFILE OR INCOMPLETE PROFILE ──────────────────────────────
  if (!profile || !profile.sport || profileStatus === 'missing') {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 space-y-4 select-none">
        <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-slate-300">
          <TargetIcon className="w-6 h-6" />
        </div>
        <div className="max-w-md">
          <h2 className="text-lg font-bold font-heading text-white uppercase tracking-wider">
            Athlete Profile Incomplete
          </h2>
          <p className="text-xs text-slate-400 font-sans mt-1 leading-relaxed">
            Configure your sport and position to access calibrated movement protocols.
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/onboarding?mode=complete-profile')}
          className="btn-primary text-xs px-6 py-3 uppercase tracking-wider flex items-center gap-2"
        >
          <span>Complete Athlete Profile</span>
          <ArrowRightIcon className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  // ── 3. GUARD: INVALID OR UNSUPPORTED SPORT PARAM ────────────────────────────
  if (!urlSportNormalized) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 space-y-4 select-none">
        <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400">
          <AlertTriangleIcon className="w-6 h-6" />
        </div>
        <div className="max-w-md">
          <h2 className="text-lg font-bold font-heading text-white uppercase tracking-wider">
            Sport Protocol Not Supported
          </h2>
          <p className="text-xs text-slate-400 font-sans mt-1 leading-relaxed">
            "{rawSportParam}" vision pipeline is currently in development.
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate(`/assessment/${athleteSportNormalized}`)}
          className="btn-primary text-xs px-6 py-3 uppercase tracking-wider flex items-center gap-2"
        >
          <span>Go to {profile.sport} Assessment</span>
          <ArrowRightIcon className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  // ── 4. GUARD: URL SPORT MISMATCH WITH ATHLETE PROFILE ───────────────────────
  if (urlSportNormalized !== athleteSportNormalized) {
    return <Navigate to={`/assessment/${athleteSportNormalized}`} replace />;
  }

  // ── 5. GUARD: CORRUPT OR UNMAPPED CONTEXT FALLBACK ──────────────────────────
  if (!assessmentContext) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center text-center p-6 space-y-3">
        <p className="text-xs text-slate-400">
          Unable to resolve calibrated assessment for role: {profile.primary_role}
        </p>
        <Link to="/dashboard" className="btn-secondary text-xs">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  // ── 6. DYNAMIC ACTIVE PROTOCOL RESOLUTION ───────────────────────────────────
  // Default to the sport's primary calibrated protocol
  const activeProtocolId = selectedProtocolId || assessmentContext.primaryProtocolId;
  const activeProtocolGuide = activeProtocolId ? getProtocolGuide(activeProtocolId) : assessmentContext.primaryGuide;

  const isPrimarySelected = activeProtocolId === assessmentContext.primaryProtocolId;

  // Active protocol display name and role reason
  const activeProtocolName = activeProtocolGuide
    ? isPrimarySelected && assessmentContext.roleConfig.overrideProtocolName
      ? assessmentContext.roleConfig.overrideProtocolName
      : activeProtocolGuide.name
    : '';

  const activeCapabilityStatus = isPrimarySelected
    ? assessmentContext.roleConfig.capabilityStatus
    : 'foundation';

  const activeRoleReason = isPrimarySelected
    ? assessmentContext.roleConfig.roleReason
    : activeProtocolId === 'squat'
    ? 'Foundational eccentric knee stability and hip mobility supporting sport-specific movement.'
    : 'Foundational rate of force development and bilateral deceleration landing control.';

  // Build the active protocol card payload if chosen
  const activeProtocolCardData = activeProtocolGuide && activeProtocolId
    ? {
        id: activeProtocolId,
        protocolId: activeProtocolId,
        name: activeProtocolName,
        shortPurpose: activeProtocolGuide.shortPurpose,
        metrics: activeProtocolGuide.metrics,
      }
    : null;

  return (
    <div className="space-y-4 select-none w-full pb-8">
      {/* 1. Compact Sport Hero */}
      <AssessmentHero
        title={assessmentContext.roleConfig.pageTitle}
        subtitle={assessmentContext.roleConfig.shortPurpose}
        sportName={assessmentContext.theme.displayName}
        badgeLabel={assessmentContext.theme.badgeLabel}
        roleName={profile.primary_role}
        subRole={profile.secondary_role}
        experienceLevel={profile.experience_level}
      />

      {/* 2. Optional Non-Blocking Role Notice */}
      {assessmentContext.notice && <RoleNoticeCard notice={assessmentContext.notice} />}

      {/* 3. All-Rounder Focus Switcher (Cricket All-Rounder only) */}
      {assessmentContext.roleConfig.allowFocusChoice && (
        <div className="rounded-2xl bg-[#0C0E14]/80 backdrop-blur-md border border-white/[0.08] p-4 sm:p-5 space-y-2 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold font-tech text-white uppercase tracking-wider">
              <SlidersIcon className="w-3.5 h-3.5 text-slate-300" />
              <span>Select All-Rounder Focus Today</span>
            </div>
            <span className="text-[11px] text-slate-400 font-sans">Tap to select or deselect</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            {assessmentContext.roleConfig.focusChoices?.map((choice: any) => (
              <button
                key={choice.protocolId}
                type="button"
                onClick={() => {
                  setSelectedProtocolId((prev) =>
                    prev === choice.protocolId ? null : choice.protocolId
                  );
                  handleScrollToUploader();
                }}
                className={`p-3 rounded-xl border text-left text-xs sm:text-sm transition-all flex items-center justify-between ${
                  activeProtocolId === choice.protocolId
                    ? 'bg-white/[0.12] border-white/40 text-white font-bold shadow-sm ring-1 ring-white/20'
                    : 'bg-white/[0.02] border-white/[0.06] text-slate-400 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <div className="font-tech">{choice.label}</div>
                {activeProtocolId === choice.protocolId && (
                  <CheckIcon className="w-4 h-4 text-emerald-400 shrink-0 ml-1.5" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 4. Dominant Capture Station (Recording & Upload) */}
      <AssessmentUploader
        sportKey={assessmentContext.sportKey}
        primaryRole={profile.primary_role}
        subRole={profile.secondary_role}
        activeProtocolId={activeProtocolId}
        activeProtocolName={activeProtocolName}
        uploadLabel={activeProtocolGuide?.uploadLabel}
        analyzeButtonLabel={activeProtocolGuide?.analyzeButtonLabel}
      />

      {/* 6. Active Protocol Details & Visual Camera Setup Guide */}
      {activeProtocolCardData && activeProtocolGuide ? (
        <div className="space-y-3.5">
          <PrimaryProtocolCard
            protocol={activeProtocolCardData}
            status={activeCapabilityStatus}
            roleReason={activeRoleReason}
            isSelected={true}
          />

          <CameraSetupGuide
            steps={activeProtocolGuide.steps}
            protocolName={activeProtocolName}
            repetitionCount={activeProtocolGuide.repetitionCount}
            warningMessage={activeProtocolGuide.warningMessage}
          />
        </div>
      ) : (
        <div className="rounded-2xl bg-[#0C0E14]/80 backdrop-blur-md border border-white/[0.08] p-5 sm:p-6 text-center space-y-2.5 shadow-lg">
          <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center mx-auto text-sky-400">
            <TargetIcon className="w-5 h-5" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-300 text-[11px] font-sans font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
            <span>Automatic Movement Detection Active</span>
          </div>
          <h3 className="text-sm font-bold font-heading text-white">
            Ready to Record or Upload
          </h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto font-sans leading-relaxed">
            You do not need to choose a protocol in advance. Record or upload your movement video directly, and our computer vision pipeline will automatically classify your movement. You can also tap any protocol above to view specific camera framing guidelines.
          </p>
        </div>
      )}

      {/* 7. Secondary Foundational Baselines Switcher */}
      <FoundationalSection
        options={assessmentContext.foundationalOptions}
        selectedProtocolId={activeProtocolId || undefined}
        onSelectProtocol={(id) => {
          setSelectedProtocolId((prev) => (prev === id ? null : id));
          handleScrollToUploader();
        }}
      />
    </div>
  );
};

export default SportAssessmentPage;
