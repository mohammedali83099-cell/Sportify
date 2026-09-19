import React from 'react';
import { InfoIcon } from '../common/Icons';

export interface RoleNotice {
  title: string;
  description: string;
}

export interface RoleNoticeCardProps {
  notice?: RoleNotice | null;
}

export const RoleNoticeCard: React.FC<RoleNoticeCardProps> = ({ notice }) => {
  if (!notice) return null;

  return (
    <div className="p-3.5 rounded-xl bg-white/[0.02] backdrop-blur-sm border border-white/[0.08] flex items-start gap-3 select-none">
      <div className="w-8 h-8 rounded-lg bg-white/[0.05] border border-white/10 flex items-center justify-center text-slate-300 shrink-0 mt-0.5">
        <InfoIcon className="w-4 h-4" />
      </div>
      <div className="space-y-0.5">
        <h4 className="text-xs font-bold font-heading text-slate-200">
          {notice.title}
        </h4>
        <p className="text-xs text-slate-400 font-sans leading-relaxed">
          {notice.description}
        </p>
      </div>
    </div>
  );
};

export default RoleNoticeCard;
