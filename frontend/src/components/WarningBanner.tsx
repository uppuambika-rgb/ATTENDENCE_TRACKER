import React from 'react';
import { BunkCalculation } from '../types';
import { AlertTriangle, ShieldX, ArrowRight, BellRing } from 'lucide-react';

interface WarningBannerProps {
  shortageSubjects: BunkCalculation[];
  onOpenSimulator: (subjectId?: string) => void;
  onOpenNotifications: () => void;
}

export const WarningBanner: React.FC<WarningBannerProps> = ({
  shortageSubjects,
  onOpenSimulator,
  onOpenNotifications,
}) => {
  if (shortageSubjects.length === 0) return null;

  return (
    <div className="w-full rounded-2xl bg-gradient-to-r from-rose-950/80 via-red-950/70 to-rose-900/60 border border-rose-500/50 p-4 sm:p-5 shadow-xl shadow-rose-950/40 relative overflow-hidden animate-fadeIn">
      {/* Background ambient glow */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left Side: Alert Title & Context */}
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-rose-600/30 border border-rose-500/50 text-rose-300 flex items-center justify-center shrink-0 mt-0.5 shadow-inner">
            <AlertTriangle className="w-5 h-5 text-rose-400 animate-pulse" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
                <ShieldX className="w-4 h-4 text-rose-400" />
                University Exam Debarment Warning (Shortage of Attendance)
              </span>
              <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-rose-900/80 border border-rose-700/80 text-rose-200">
                Minimum Required: 75.0%
              </span>
            </div>
            <p className="text-xs text-rose-200/90 mt-1 max-w-3xl leading-relaxed">
              You are currently <span className="font-bold underline decoration-rose-400">below 75% attendance</span> in{' '}
              <span className="font-semibold text-white">{shortageSubjects.length} academic course{shortageSubjects.length > 1 ? 's' : ''}</span>. 
              As per university guidelines, students with &lt; 75% are ineligible to sit for semester-end examinations.
            </p>

            {/* List of Critical Shortage Subjects with required catch-up counts */}
            <div className="flex flex-wrap gap-2 mt-2.5">
              {shortageSubjects.map(sub => (
                <div
                  key={sub.subjectId}
                  className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-black/40 border border-rose-500/40 text-xs"
                >
                  <span className="font-mono font-bold text-white">{sub.subjectCode}</span>
                  <span className="text-rose-400 font-mono tabular-nums font-semibold">
                    {sub.percentage.toFixed(1)}%
                  </span>
                  <span className="text-slate-400">·</span>
                  <span className="text-rose-200 text-[11px]">
                    Must attend <span className="font-bold text-white font-mono">{sub.catchUpCount}</span> more classes
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 shrink-0 self-end md:self-center">
          <button
            onClick={() => onOpenSimulator(shortageSubjects[0]?.subjectId)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-xl transition-all shadow-md shadow-rose-600/30"
          >
            <span>Open Catch-up Calculator</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onOpenNotifications}
            className="p-2 text-rose-300 hover:text-white bg-rose-950/60 hover:bg-rose-900/60 border border-rose-800 rounded-xl transition-colors"
            title="View alert details"
          >
            <BellRing className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
