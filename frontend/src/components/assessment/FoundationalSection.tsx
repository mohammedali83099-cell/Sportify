import React from 'react';
import { DumbbellIcon, CheckIcon } from '../common/Icons';

export interface FoundationalProtocolOption {
  protocolId: string;
  tag: string;
  name: string;
  description: string;
}

export interface FoundationalSectionProps {
  options?: FoundationalProtocolOption[];
  selectedProtocolId?: string;
  onSelectProtocol: (protocolId: string) => void;
}

export const FoundationalSection: React.FC<FoundationalSectionProps> = ({
  options,
  selectedProtocolId,
  onSelectProtocol,
}) => {
  if (!options || options.length === 0) return null;

  return (
    <div className="space-y-3 pt-2 select-none">
      <div>
        <h3 className="text-xs font-bold font-heading text-slate-300 flex items-center gap-2">
          <DumbbellIcon className="w-3.5 h-3.5 text-slate-400" />
          <span>Foundational Athletic Baselines</span>
        </h3>
        <p className="text-[11px] text-slate-400 font-sans mt-0.5">
          Evaluate foundational lower-body power and eccentric stabilization.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {options.map((opt) => {
          const isSelected = selectedProtocolId === opt.protocolId;
          return (
            <button
              key={opt.protocolId}
              type="button"
              onClick={() => onSelectProtocol(opt.protocolId)}
              className={`p-4 sm:p-5 rounded-2xl border text-left backdrop-blur-sm transition-all group ${
                isSelected
                  ? 'bg-white/[0.09] border-emerald-500/50 text-white shadow-[0_4px_20px_rgba(16,185,129,0.1)] ring-1 ring-emerald-500/30'
                  : 'bg-white/[0.02] border-white/[0.07] text-slate-400 hover:text-slate-200 hover:border-white/20 hover:bg-white/[0.04]'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                  {opt.tag}
                </span>
                {isSelected ? (
                  <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                    <CheckIcon className="w-3.5 h-3.5" /> Active (tap to reset)
                  </span>
                ) : (
                  <span className="text-xs text-slate-400 group-hover:text-slate-300">Switch focus</span>
                )}
              </div>

              <h4 className="text-sm font-bold text-slate-100 font-heading mb-1">
                {opt.name}
              </h4>
              <p className="text-xs text-slate-400 font-sans leading-relaxed">
                {opt.description}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default FoundationalSection;
