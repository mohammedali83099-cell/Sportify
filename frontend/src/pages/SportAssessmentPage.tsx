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
import { TargetIcon, ArrowRightIcon, AlertTriangleIcon, SlidersIcon } from '../components/common/Icons';

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

  // Initialize and sync selected protocol with recommended protocol
  useEffect(() => {
    if (assessmentContext?.primaryProtocolId) {
      setSelectedProtocolId(assessmentContext.primaryProtocolId);
    }
  }, [assessmentContext?.primaryProtocolId]);

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
  const activeProtocolId = selectedProtocolId || assessmentContext.primaryProtocolId;
  const activeProtocolGuide = getProtocolGuide(activeProtocolId);

  const isPrimarySelected = activeProtocolId === assessmentContext.primaryProtocolId;

  // Active protocol display name and role reason
  const activeProtocolName =
    isPrimarySelected && assessmentContext.roleConfig.overrideProtocolName
      ? assessmentContext.roleConfig.overrideProtocolName
      : activeProtocolGuide.name;

  const activeCapabilityStatus = isPrimarySelected
    ? assessmentContext.roleConfig.capabilityStatus
    : 'foundation';

  const activeRoleReason = isPrimarySelected
    ? assessmentContext.roleConfig.roleReason
    : activeProtocolId === 'squat'
    ? 'Foundational eccentric knee stability and hip mobility supporting sport-specific movement.'
    : 'Foundational rate of force development and bilateral deceleration landing control.';

  // Build the active protocol card payload
  const activeProtocolCardData = {
    id: activeProtocolId,
    protocolId: activeProtocolId,
    name: activeProtocolName,
    shortPurpose: activeProtocolGuide.shortPurpose,
    metrics: activeProtocolGuide.metrics,
  };

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
          <div className="flex items-center gap-2 text-xs font-bold font-tech text-white uppercase tracking-wider">
            <SlidersIcon className="w-3.5 h-3.5 text-slate-300" />
            <span>Select All-Rounder Focus Today</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            {assessmentContext.roleConfig.focusChoices?.map((choice: any) => (
              <button
                key={choice.protocolId}
                type="button"
                onClick={() => {
                  setSelectedProtocolId(choice.protocolId);
                  handleScrollToUploader();
                }}
                className={`p-2.5 rounded-lg border text-left text-xs transition-all active-press ${
                  activeProtocolId === choice.protocolId
                    ? 'bg-white/[0.12] border-white/40 text-white font-bold shadow-sm'
                    : 'bg-white/[0.02] border-white/[0.06] text-slate-400 hover:text-white'
                }`}
              >
                <div className="font-tech">{choice.label}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 4. Native Segmented Protocol Switcher */}
      <div className="space-y-1.5">
        <div className="text-xs font-medium text-slate-400 px-0.5">
          Choose Protocol
        </div>
        <div className="p-1 rounded-xl bg-white/[0.02] border border-white/[0.06] backdrop-blur-sm flex gap-1 overflow-x-auto no-scrollbar">
          {/* Primary Recommended Protocol Tab */}
          <button
            type="button"
            onClick={() => setSelectedProtocolId(assessmentContext.primaryProtocolId)}
            className={`flex-1 min-w-[120px] py-2 px-3 rounded-lg text-xs font-sans font-medium transition-all text-center truncate ${
              activeProtocolId === assessmentContext.primaryProtocolId
                ? 'bg-white text-slate-950 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            {assessmentContext.roleConfig.overrideProtocolName || assessmentContext.primaryGuide.name}
          </button>

          {/* Foundational Baselines Tabs */}
          {assessmentContext.foundationalOptions?.map((opt: any) => (
            <button
              key={opt.protocolId}
              type="button"
              onClick={() => setSelectedProtocolId(opt.protocolId)}
              className={`flex-1 min-w-[110px] py-2 px-3 rounded-lg text-xs font-sans font-medium transition-all text-center truncate ${
                activeProtocolId === opt.protocolId
                  ? 'bg-white text-slate-950 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              {opt.name.replace(' Baseline', '').replace(' Kinematics', '')}
            </button>
          ))}
        </div>
      </div>

      {/* 5. Dominant Capture Station (Recording & Upload) */}
      <AssessmentUploader
        sportKey={assessmentContext.sportKey}
        primaryRole={profile.primary_role}
        subRole={profile.secondary_role}
        activeProtocolId={activeProtocolId}
        activeProtocolName={activeProtocolName}
        uploadLabel={activeProtocolGuide.uploadLabel}
        analyzeButtonLabel={activeProtocolGuide.analyzeButtonLabel}
      />

      {/* 6. Active Protocol Details & Visual Camera Setup Guide */}
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

      {/* 7. Secondary Foundational Baselines Switcher */}
      <FoundationalSection
        options={assessmentContext.foundationalOptions}
        selectedProtocolId={activeProtocolId}
        onSelectProtocol={(id) => {
          setSelectedProtocolId(id);
          handleScrollToUploader();
        }}
      />
    </div>
  );
};

export default SportAssessmentPage;
