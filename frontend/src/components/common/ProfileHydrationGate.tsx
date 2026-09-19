import React, { useEffect, useState, ReactNode } from 'react';
import { useAthleteStore } from '../../store/athleteStore';

export interface ProfileHydrationGateProps {
  children: ReactNode;
}

/**
 * ProfileHydrationGate
 * Bootstraps authentication identity and athlete profile on app load.
 * Prevents premature rendering or blank page flashes before athlete identity is known.
 */
export const ProfileHydrationGate: React.FC<ProfileHydrationGateProps> = ({ children }) => {
  const token = useAthleteStore((state) => state.token);
  const profileStatus = useAthleteStore((state) => state.profileStatus);
  const hydrateAuthAndProfile = useAthleteStore((state) => state.hydrateAuthAndProfile);

  const [hasHydrated, setHasHydrated] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;

    async function runHydration() {
      if (token) {
        await hydrateAuthAndProfile();
      }
      if (isMounted) {
        setHasHydrated(true);
      }
    }

    runHydration();

    return () => {
      isMounted = false;
    };
  }, [token, hydrateAuthAndProfile]);

  // If token exists and we are currently fetching me/profile, show a sleek loader
  if (token && (profileStatus === 'loading' || !hasHydrated)) {
    return (
      <div className="min-h-screen bg-[#07080C] text-[#F1F5F9] flex flex-col items-center justify-center select-none gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-white animate-spin" />
        <p className="text-[11px] font-mono uppercase tracking-widest text-slate-400">
          Calibrating Athlete Context...
        </p>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProfileHydrationGate;
