import React from 'react';
import { VideoIcon, AlertTriangleIcon, CheckIcon } from '../common/Icons';

export interface CameraSetupStep {
  step: number | string;
  title: string;
  desc: string;
}

export interface CameraSetupGuideProps {
  steps?: CameraSetupStep[];
  protocolName?: string;
  repetitionCount?: string;
  warningMessage?: string;
}

export const CameraSetupGuide: React.FC<CameraSetupGuideProps> = ({
  steps,
  protocolName,
  repetitionCount,
  warningMessage,
}) => {
  if (!steps || steps.length === 0) return null;

  return (
    <div className="rounded-2xl bg-[#0C0E14]/80 backdrop-blur-md border border-white/[0.08] p-4 sm:p-5 space-y-3 hover:border-white/15 transition-all shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 pb-2 border-b border-white/[0.06]">
        <div className="flex items-center gap-2 truncate">
          <VideoIcon className="w-4 h-4 text-slate-300 shrink-0" />
          <h3 className="text-xs sm:text-sm font-bold font-heading text-white truncate">
            Framing Guide: <span className="text-slate-400 font-normal">{protocolName || 'Movement'}</span>
          </h3>
        </div>
        {repetitionCount && (
          <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full shrink-0">
            {repetitionCount}
          </span>
        )}
      </div>

      {/* Visual Camera Angle & Framing Diagram */}
      <div className="p-3 rounded-xl bg-black/40 border border-white/[0.06] backdrop-blur-sm flex items-center justify-around gap-4 text-center">
        {/* Camera side */}
        <div className="flex flex-col items-center gap-1">
          <div className="w-9 h-9 rounded-lg bg-white/[0.05] border border-white/10 flex items-center justify-center text-slate-200">
            <VideoIcon className="w-4 h-4" />
          </div>
          <span className="text-[10px] font-mono text-slate-400">Camera • 45°</span>
        </div>

        {/* Distance dashed link */}
        <div className="flex-1 flex flex-col items-center justify-center max-w-[120px]">
          <span className="text-[10px] font-mono text-slate-400 mb-0.5">3 – 4 meters</span>
          <div className="w-full border-t border-dashed border-white/20 relative">
            <span className="absolute -top-1 left-0 w-1.5 h-1.5 rounded-full bg-white/40" />
            <span className="absolute -top-1 right-0 w-1.5 h-1.5 rounded-full bg-white/40" />
          </div>
        </div>

        {/* Athlete side */}
        <div className="flex flex-col items-center gap-1">
          <div className="w-9 h-9 rounded-lg bg-white/[0.05] border border-white/10 flex items-center justify-center text-emerald-400">
            {/* Simple vector athlete posture */}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
              <circle cx="12" cy="5" r="2" />
              <path d="M12 7v7" />
              <path d="M9 10l3 2 3-2" />
              <path d="M10 21l2-7 2 7" />
            </svg>
          </div>
          <span className="text-[10px] font-mono text-slate-400">Head to Toe</span>
        </div>
      </div>

      {/* 4 Concise Setup Steps */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {steps.map((item) => (
          <div
            key={item.step}
            className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05] backdrop-blur-sm flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="w-5 h-5 rounded-md bg-white/[0.05] border border-white/10 text-white font-mono font-semibold text-[10px] flex items-center justify-center">
                0{item.step}
              </span>
              <CheckIcon className="w-3 h-3 text-slate-500" />
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-200 font-heading leading-snug mb-0.5">
                {item.title}
              </h4>
              <p className="text-[11px] text-slate-400 font-sans leading-snug line-clamp-2">
                {item.desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Warning Notice */}
      <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05] backdrop-blur-sm flex items-start gap-2.5 text-xs text-slate-300 font-sans">
        <AlertTriangleIcon className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <span className="leading-relaxed">
          {warningMessage || 'Ensure full body is visible head-to-toe with consistent lighting. Keep camera stationary.'}
        </span>
      </div>
    </div>
  );
};

export default CameraSetupGuide;
