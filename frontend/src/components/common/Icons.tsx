import React from 'react';
import {
  Activity,
  Award,
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Calendar,
  CheckCircle2,
  ChevronRight,
  ChevronDown,
  Clock,
  Dumbbell,
  Flame,
  HeartPulse,
  Home,
  Layers,
  LogOut,
  ScanLine,
  Shield,
  ShieldAlert,
  Sparkles,
  Target,
  TrendingUp,
  TrendingDown,
  Upload,
  User,
  Video,
  Zap,
  Check,
  X,
  Plus,
  RefreshCw,
  Info,
  Sliders,
} from 'lucide-react';

export interface IconProps {
  className?: string;
  strokeWidth?: number;
}

export const DashboardIcon: React.FC<IconProps> = ({ className = 'w-5 h-5' }) => <Activity className={className} />;
export const VideoIcon: React.FC<IconProps> = ({ className = 'w-5 h-5' }) => <Video className={className} />;
export const AnalysisIcon: React.FC<IconProps> = ({ className = 'w-5 h-5' }) => <BarChart3 className={className} />;
export const PlanIcon: React.FC<IconProps> = ({ className = 'w-5 h-5' }) => <Layers className={className} />;
export const RecoveryIcon: React.FC<IconProps> = ({ className = 'w-5 h-5' }) => <HeartPulse className={className} />;
export const ProgressIcon: React.FC<IconProps> = ({ className = 'w-5 h-5' }) => <TrendingUp className={className} />;
export const ProfileIcon: React.FC<IconProps> = ({ className = 'w-5 h-5' }) => <User className={className} />;
export const LogoutIcon: React.FC<IconProps> = ({ className = 'w-5 h-5' }) => <LogOut className={className} />;

// ── BOTTOM NAVIGATION ICONS ──
export const NavHomeIcon: React.FC<IconProps> = ({ className = 'w-5 h-5', strokeWidth = 2.25 }) => (
  <Home className={className} strokeWidth={strokeWidth} />
);
export const NavTrainingIcon: React.FC<IconProps> = ({ className = 'w-5 h-5', strokeWidth = 2.25 }) => (
  <Dumbbell className={className} strokeWidth={strokeWidth} />
);
export const NavAssessIcon: React.FC<IconProps> = ({ className = 'w-5 h-5', strokeWidth = 2.25 }) => (
  <ScanLine className={className} strokeWidth={strokeWidth} />
);
export const NavRecoveryIcon: React.FC<IconProps> = ({ className = 'w-5 h-5', strokeWidth = 2.25 }) => (
  <HeartPulse className={className} strokeWidth={strokeWidth} />
);
export const NavProgressIcon: React.FC<IconProps> = ({ className = 'w-5 h-5', strokeWidth = 2.25 }) => (
  <TrendingUp className={className} strokeWidth={strokeWidth} />
);

// 4-Tier Development Status Icons (ZERO EMOJIS)
export const StrengthIcon: React.FC<IconProps> = ({ className = 'w-4 h-4 text-emerald-400' }) => <Award className={className} />;
export const ProficientIcon: React.FC<IconProps> = ({ className = 'w-4 h-4 text-sky-400' }) => <CheckCircle2 className={className} />;
export const DevAreaIcon: React.FC<IconProps> = ({ className = 'w-4 h-4 text-amber-400' }) => <AlertCircle className={className} />;
export const CriticalIcon: React.FC<IconProps> = ({ className = 'w-4 h-4 text-rose-400' }) => <ShieldAlert className={className} />;

// General UI Icons
export const TargetIcon: React.FC<IconProps> = ({ className = 'w-4 h-4' }) => <Target className={className} />;
export const FlameIcon: React.FC<IconProps> = ({ className = 'w-4 h-4' }) => <Flame className={className} />;
export const SparklesIcon: React.FC<IconProps> = ({ className = 'w-4 h-4' }) => <Sparkles className={className} />;
export const ZapIcon: React.FC<IconProps> = ({ className = 'w-4 h-4' }) => <Zap className={className} />;
export const ClockIcon: React.FC<IconProps> = ({ className = 'w-4 h-4' }) => <Clock className={className} />;
export const DumbbellIcon: React.FC<IconProps> = ({ className = 'w-4 h-4' }) => <Dumbbell className={className} />;
export const ShieldIcon: React.FC<IconProps> = ({ className = 'w-4 h-4' }) => <Shield className={className} />;
export const ArrowRightIcon: React.FC<IconProps> = ({ className = 'w-4 h-4' }) => <ArrowRight className={className} />;
export const CheckIcon: React.FC<IconProps> = ({ className = 'w-4 h-4' }) => <Check className={className} />;
export const CloseIcon: React.FC<IconProps> = ({ className = 'w-4 h-4' }) => <X className={className} />;
export const PlusIcon: React.FC<IconProps> = ({ className = 'w-4 h-4' }) => <Plus className={className} />;
export const RefreshIcon: React.FC<IconProps> = ({ className = 'w-4 h-4' }) => <RefreshCw className={className} />;
export const InfoIcon: React.FC<IconProps> = ({ className = 'w-4 h-4' }) => <Info className={className} />;
export const UploadIcon: React.FC<IconProps> = ({ className = 'w-4 h-4' }) => <Upload className={className} />;
export const ChevronRightIcon: React.FC<IconProps> = ({ className = 'w-4 h-4' }) => <ChevronRight className={className} />;
export const ChevronDownIcon: React.FC<IconProps> = ({ className = 'w-4 h-4' }) => <ChevronDown className={className} />;
export const TrendingUpIcon: React.FC<IconProps> = ({ className = 'w-4 h-4' }) => <TrendingUp className={className} />;
export const TrendingDownIcon: React.FC<IconProps> = ({ className = 'w-4 h-4' }) => <TrendingDown className={className} />;
export const SlidersIcon: React.FC<IconProps> = ({ className = 'w-4 h-4' }) => <Sliders className={className} />;
export const CalendarIcon: React.FC<IconProps> = ({ className = 'w-4 h-4' }) => <Calendar className={className} />;
export const AlertTriangleIcon: React.FC<IconProps> = ({ className = 'w-4 h-4' }) => <AlertTriangle className={className} />;
export const HeartPulseIcon: React.FC<IconProps> = ({ className = 'w-4 h-4' }) => <HeartPulse className={className} />;
export const ActivityIcon: React.FC<IconProps> = ({ className = 'w-4 h-4' }) => <Activity className={className} />;

// ── PRECISION VECTOR SPORT ICONS (ZERO EMOJIS, UNIFIED PROPORTIONS) ────────
export const CricketIcon: React.FC<IconProps> = ({ className = 'w-5 h-5' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M19 2.5l-4.5 4.5" />
    <path d="M17.5 2l2 2" />
    <path d="M14 7.5l-7.5 7.5c-.6.6-1 1.4-.9 2.2l.4 2.3 2.3.4c.8.1 1.6-.3 2.2-.9l7.5-7.5-4-4z" />
    <line x1="12.5" y1="9" x2="8.5" y2="13" />
    <circle cx="16.5" cy="16.5" r="3.5" />
    <path d="M14.5 15.5c.8.8 1.8 1 2.5.5s1.2-.5 2 .5" />
  </svg>
);

export const FootballIcon: React.FC<IconProps> = ({ className = 'w-5 h-5' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="12" r="9" />
    <polygon
      points="12 8.5 15.2 10.8 14 14.6 10 14.6 8.8 10.8"
      fill="currentColor"
      fillOpacity="0.15"
    />
    <line x1="12" y1="8.5" x2="12" y2="3" />
    <line x1="15.2" y1="10.8" x2="19.8" y2="9.3" />
    <line x1="14" y1="14.6" x2="17.3" y2="19.3" />
    <line x1="10" y1="14.6" x2="6.7" y2="19.3" />
    <line x1="8.8" y1="10.8" x2="4.2" y2="9.3" />
  </svg>
);

export const BasketballIcon: React.FC<IconProps> = ({ className = 'w-5 h-5' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="12" r="9" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="12" y1="3" x2="12" y2="21" />
    <path d="M5.6 5.6C8.8 8.8 8.8 15.2 5.6 18.4" />
    <path d="M18.4 5.6C15.2 8.8 15.2 15.2 18.4 18.4" />
  </svg>
);

export const AthleticsIcon: React.FC<IconProps> = ({ className = 'w-5 h-5' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="16" cy="4.5" r="2" />
    <path d="M7.5 13.5l3.5-3 3 1.5 4-2" />
    <path d="M12.5 10.5l2.5 4-1.5 4.5" />
    <path d="M11 11.5l-3.5 3.5-4 1" />
    <path d="M3 21h18" />
  </svg>
);

export interface SportIconProps extends IconProps {
  sport?: string | null;
}

/**
 * Dynamic sport vector icon resolver (Centralized for all sports)
 */
export const SportIcon: React.FC<SportIconProps> = ({ sport, className = 'w-5 h-5' }) => {
  const s = String(sport || '').toLowerCase().trim();
  if (s.includes('cricket')) return <CricketIcon className={className} />;
  if (s.includes('foot') || s.includes('soccer')) return <FootballIcon className={className} />;
  if (s.includes('basket')) return <BasketballIcon className={className} />;
  if (s.includes('athlet') || s.includes('track') || s.includes('sprint') || s.includes('run')) {
    return <AthleticsIcon className={className} />;
  }
  return <TargetIcon className={className} />;
};

export default {
  DashboardIcon,
  VideoIcon,
  AnalysisIcon,
  PlanIcon,
  RecoveryIcon,
  ProgressIcon,
  ProfileIcon,
  LogoutIcon,
  StrengthIcon,
  ProficientIcon,
  DevAreaIcon,
  CriticalIcon,
  TargetIcon,
  FlameIcon,
  SparklesIcon,
  ZapIcon,
  ClockIcon,
  DumbbellIcon,
  ShieldIcon,
  ArrowRightIcon,
  CheckIcon,
  CloseIcon,
  PlusIcon,
  RefreshIcon,
  InfoIcon,
  UploadIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  SlidersIcon,
  CalendarIcon,
  AlertTriangleIcon,
  HeartPulseIcon,
  ActivityIcon,
};
