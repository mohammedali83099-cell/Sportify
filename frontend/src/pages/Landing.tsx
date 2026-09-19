import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SportifyLogo from '../components/common/SportifyLogo';
import {
  TargetIcon,
  VideoIcon,
  DumbbellIcon,
  ArrowRightIcon,
  ShieldIcon,
  TrendingUpIcon,
  IconProps,
} from '../components/common/Icons';

interface PlatformStep {
  step: string;
  phase: string;
  icon: React.FC<IconProps>;
  action: string;
}

export const Landing: React.FC = () => {
  const navigate = useNavigate();

  const platformLoop: PlatformStep[] = [
    {
      step: '01',
      phase: 'ASSESS',
      icon: VideoIcon,
      action: 'Capture your movement.',
    },
    {
      step: '02',
      phase: 'IDENTIFY',
      icon: TargetIcon,
      action: 'Find your biggest gaps.',
    },
    {
      step: '03',
      phase: 'TRAIN',
      icon: DumbbellIcon,
      action: 'Target what matters.',
    },
    {
      step: '04',
      phase: 'RECOVER',
      icon: ShieldIcon,
      action: 'Adapt between sessions.',
    },
    {
      step: '05',
      phase: 'REASSESS',
      icon: TrendingUpIcon,
      action: 'Track your improvement.',
    },
  ];

  return (
    <div className="min-h-[100dvh] bg-[#07080C] text-[#F1F5F9] flex flex-col w-full selection:bg-white/20 relative select-none overflow-hidden">
      {/* Ambient background depth for glass refraction */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-white/[0.02] blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[300px] h-[300px] bg-emerald-500/[0.02] blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-5xl mx-auto min-h-[100dvh] flex flex-col justify-between p-4 sm:p-6 md:p-8 relative z-10">
        {/* ── 1. TOP HEADER ─────────────── */}
        <header className="flex items-center justify-between pt-safe">
          <Link to="/" className="focus:outline-none">
            <SportifyLogo size="xs" showTagline={false} />
          </Link>
          <Link
            to="/onboarding?mode=signin"
            className="text-xs font-sans font-medium text-slate-300 hover:text-white px-3.5 py-1.5 rounded-lg bg-white/[0.03] backdrop-blur-md border border-white/[0.09] hover:bg-white/[0.07] hover:border-white/20 transition-all shadow-sm"
          >
            Sign In
          </Link>
        </header>

        {/* ── 2. HERO STORY & REFINED HIERARCHY ─────────────────────────────── */}
        <main className="my-auto py-6 sm:py-10 flex flex-col items-center text-center">
          {/* Centered Larger Sportify Logo / Wordmark */}
          <div className="mb-4 sm:mb-5">
            <SportifyLogo size="lg" showTagline={false} className="justify-center" />
          </div>

          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-white/[0.05] via-white/[0.03] to-white/[0.01] backdrop-blur-md border border-white/[0.09] text-emerald-400 text-[11px] font-mono tracking-widest uppercase font-semibold mb-3 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>BUILT AROUND YOUR ROLE</span>
          </div>

          {/* Headline */}
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold font-heading tracking-tight text-white leading-tight max-w-3xl mx-auto uppercase">
            TRAIN FOR WHAT YOUR GAME DEMANDS.
          </h1>

          {/* Supporting Text */}
          <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto font-sans leading-relaxed mt-3 mb-6 sm:mb-8">
            Sport-specific movement analysis that finds what matters most to your performance — and turns it into a personalized training path.
          </p>

          {/* Concise Visual Process: Assess → Identify → Train → Recover → Reassess */}
          <div className="w-full max-w-4xl mx-auto space-y-2.5">
            {/* Visual Process Flow Ribbon */}
            <div className="flex items-center justify-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs font-mono text-slate-500 font-medium tracking-wider uppercase mb-1">
              <span className="text-slate-400">Assess</span>
              <span className="text-slate-600">→</span>
              <span className="text-slate-400">Identify</span>
              <span className="text-slate-600">→</span>
              <span className="text-slate-400">Train</span>
              <span className="text-slate-600">→</span>
              <span className="text-slate-400">Recover</span>
              <span className="text-slate-600">→</span>
              <span className="text-slate-400">Reassess</span>
            </div>

            {/* 5 Concise Scannable Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 sm:gap-2.5 text-left">
              {platformLoop.map(({ step, phase, icon: Icon, action }) => (
                <div
                  key={step}
                  className="p-3.5 rounded-xl bg-gradient-to-b from-white/[0.045] via-white/[0.02] to-white/[0.005] backdrop-blur-md border border-white/[0.08] hover:border-white/20 hover:bg-white/[0.05] transition-all flex flex-col justify-between group shadow-lg shadow-black/30 relative overflow-hidden"
                >
                  <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none" />
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-mono text-emerald-400 font-bold tracking-wider">
                      {step} — {phase}
                    </span>
                    <Icon className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300 transition-colors" />
                  </div>
                  <p className="text-xs font-sans text-slate-300 font-medium leading-snug">
                    {action}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </main>

        {/* ── 3. BOTTOM ACTION DOCK ─────────────────────────────────────────── */}
        <footer className="w-full max-w-xs mx-auto space-y-3 pt-3 pb-safe text-center">
          <button
            onClick={() => navigate('/onboarding?mode=signup')}
            className="w-full h-12 btn-primary text-xs font-bold tracking-wide flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(255,255,255,0.12)]"
          >
            <span>BUILD ATHLETE PROFILE</span>
            <ArrowRightIcon className="w-4 h-4 text-slate-950" />
          </button>

          <p className="text-xs text-slate-400 font-sans">
            Already registered?{' '}
            <Link
              to="/onboarding?mode=signin"
              className="text-white hover:underline font-semibold ml-1"
            >
              Sign In
            </Link>
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Landing;
