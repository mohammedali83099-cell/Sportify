import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAthleteStore } from '../../store/athleteStore';
import { normalizeSport } from '../../config/sportAssessmentConfig';
import {
  NavHomeIcon,
  NavTrainingIcon,
  NavAssessIcon,
  NavRecoveryIcon,
  NavProgressIcon,
  IconProps,
} from '../common/Icons';

interface NavItem {
  to: string;
  label: string;
  icon: React.FC<IconProps>;
  isActive: boolean;
  isCenter?: boolean;
}

export const MobileBottomNav: React.FC = () => {
  const location = useLocation();
  const profile = useAthleteStore((state) => state.profile);

  const normalizedSport = profile?.sport ? normalizeSport(profile.sport) : 'cricket';
  const assessmentPath = `/assessment/${normalizedSport || 'cricket'}`;

  const isAssessmentActive =
    location.pathname.startsWith('/assessment') ||
    location.pathname === '/video' ||
    location.pathname.startsWith('/analysis');

  const navItems: NavItem[] = [
    {
      to: '/dashboard',
      label: 'Home',
      icon: NavHomeIcon,
      isActive: location.pathname === '/dashboard',
    },
    {
      to: '/plan',
      label: 'Training',
      icon: NavTrainingIcon,
      isActive: location.pathname.startsWith('/plan'),
    },
    // Center item is the elevated Assess action
    {
      isCenter: true,
      to: assessmentPath,
      label: 'Assess',
      icon: NavAssessIcon,
      isActive: isAssessmentActive,
    },
    {
      to: '/recovery',
      label: 'Recovery',
      icon: NavRecoveryIcon,
      isActive: location.pathname.startsWith('/recovery'),
    },
    {
      to: '/progress',
      label: 'Progress',
      icon: NavProgressIcon,
      isActive: location.pathname.startsWith('/progress'),
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 select-none md:hidden bg-[#07080C]/95 backdrop-blur-2xl border-t border-white/[0.06] px-3 pt-1.5 pb-[max(env(safe-area-inset-bottom,0px),10px)] shadow-[0_-8px_30px_rgba(0,0,0,0.85)]">
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {navItems.map((item) => {
          if (item.isCenter) {
            const CenterIcon = item.icon;
            return (
              <Link
                key="center-assess"
                to={item.to}
                className="flex-1 flex flex-col items-center justify-center -mt-4 focus:outline-none min-h-[48px] py-1 active:scale-95 transition-transform"
                aria-label="Movement Assessment"
              >
                <div
                  className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-150 ${
                    item.isActive
                      ? 'bg-white text-slate-950 border border-white shadow-[0_2px_14px_rgba(255,255,255,0.25)]'
                      : 'bg-[#131622] text-white border border-white/20 hover:border-white/35 shadow-lg'
                  }`}
                >
                  <CenterIcon
                    className={`w-5 h-5 transition-colors ${
                      item.isActive ? 'text-slate-950' : 'text-emerald-400'
                    }`}
                    strokeWidth={2.25}
                  />
                </div>
                <span
                  className={`text-[10px] font-sans font-medium mt-1 text-center leading-none transition-colors ${
                    item.isActive ? 'text-white font-semibold' : 'text-slate-400'
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          }

          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex-1 flex flex-col items-center justify-center min-h-[48px] py-1 rounded-xl transition-all duration-150 active:scale-95 focus:outline-none ${
                item.isActive ? 'text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center justify-center w-6 h-6">
                <Icon
                  className={`w-5 h-5 transition-all duration-150 ${
                    item.isActive ? 'text-white' : 'text-slate-400'
                  }`}
                  strokeWidth={2.25}
                />
              </div>
              <span
                className={`text-[10px] font-sans mt-1 text-center leading-none tracking-tight transition-colors ${
                  item.isActive ? 'text-white font-semibold' : 'text-slate-400'
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
