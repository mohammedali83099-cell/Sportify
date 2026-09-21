import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAthleteStore } from '../../store/athleteStore';
import { normalizeSport } from '../../config/sportAssessmentConfig';
import SportifyLogo from '../common/SportifyLogo';
import { LogoutIcon, ZapIcon } from '../common/Icons';

export const MobileTopBar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const profile = useAthleteStore((state) => state.profile);
  const logout = useAthleteStore((state) => state.logout);

  const normalizedSport = profile?.sport ? normalizeSport(profile.sport) : 'cricket';
  const assessmentPath = `/assessment/${normalizedSport || 'cricket'}`;

  const handleSignOut = () => {
    logout();
    navigate('/onboarding?mode=signin');
  };

  const formatTitle = (str?: string | null) => {
    if (!str) return 'Athlete';
    return str
      .replace(/_/g, ' ')
      .split(' ')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ');
  };

  const roleTitle = formatTitle(profile?.secondary_role || profile?.primary_role);

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard', isActive: location.pathname === '/dashboard' },
    { to: '/plan', label: 'Training', isActive: location.pathname.startsWith('/plan') },
    { to: assessmentPath, label: 'Assessment', isActive: location.pathname.startsWith('/assessment') || location.pathname === '/video' || location.pathname.startsWith('/analysis') },
    { to: '/recovery', label: 'Recovery', isActive: location.pathname.startsWith('/recovery') },
    { to: '/progress', label: 'Progress', isActive: location.pathname.startsWith('/progress') },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-[#07080C]/90 backdrop-blur-xl border-b border-white/[0.06] pt-safe select-none">
      <div className="w-full max-w-5xl mx-auto h-14 px-4 flex items-center justify-between gap-3">
        {/* Left: Brand Identity & Athlete Role */}
        <div className="flex items-center gap-2.5 min-w-0">
          <Link to="/dashboard" className="focus:outline-none shrink-0 flex items-center">
            <SportifyLogo size="xs" showTagline={false} />
          </Link>

          {/* Sport & Role Context Badge */}
          {profile?.sport && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/10 text-slate-200 text-xs font-sans min-w-0 max-w-[220px] sm:max-w-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
              <span className="truncate font-medium">{roleTitle}</span>
            </div>
          )}
        </div>

        {/* Center: Desktop Navigation Bar (hidden on mobile, visible on md+) */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`px-3 py-1.5 rounded-lg text-xs font-sans font-medium transition-all ${
                item.isActive
                  ? 'bg-white text-slate-950 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right: Fast Assessment Action & Sign Out */}
        <div className="flex items-center gap-1.5 shrink-0">
          <Link
            to={assessmentPath}
            className="px-2.5 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-white border border-white/10 transition-all active:scale-95 flex items-center gap-1.5 text-xs font-sans font-medium shadow-sm"
            title="Start Assessment"
          >
            <ZapIcon className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Assess</span>
          </Link>

          <button
            type="button"
            onClick={handleSignOut}
            className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all active:scale-95 flex items-center justify-center"
            title="Sign Out"
          >
            <LogoutIcon className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default MobileTopBar;
