import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAthleteStore } from '../store/athleteStore';
import { normalizeSport } from '../config/sportAssessmentConfig';

/**
 * Backward-compatible redirect for /video
 * Routes athletes directly to their personalized /assessment/:sport studio once hydrated.
 */
export const VideoCapture: React.FC = () => {
  const profile = useAthleteStore((state) => state.profile);
  const profileStatus = useAthleteStore((state) => state.profileStatus);

  if (profileStatus === 'loading') {
    return (
      <div className="min-h-screen bg-[#07080C] text-[#F1F5F9] flex flex-col items-center justify-center select-none gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-white animate-spin" />
        <p className="text-[11px] font-mono uppercase tracking-widest text-slate-400">
          Redirecting to Calibrated Assessment Studio...
        </p>
      </div>
    );
  }

  if (profile && profile.sport) {
    const sport = normalizeSport(profile.sport);
    if (sport) {
      return <Navigate to={`/assessment/${sport}`} replace />;
    }
  }

  return <Navigate to="/onboarding?mode=complete-profile" replace />;
};

export default VideoCapture;
