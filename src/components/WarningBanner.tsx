import React from 'react';
import { BunkCalculation } from '../types';
import { AlertTriangle, ShieldX, ArrowRight, BellRing, AlertCircle, Sparkles } from 'lucide-react';

interface WarningBannerProps {
  shortageSubjects: BunkCalculation[];
  borderlineSubjects: BunkCalculation[];
  onOpenSimulator: (subjectId?: string) => void;
  onOpenNotifications: () => void;
  onOpenPostTimetable?: () => void;
}

export const WarningBanner: React.FC<WarningBannerProps> = ({
  shortageSubjects,
  borderlineSubjects,
  onOpenSimulator,
  onOpenNotifications,
  onOpenPostTimetable,
}) => {
  const hasShortage = shortageSubjects.length > 0;
  const hasBorderline = borderlineSubjects.length > 0;

  if (!hasShortage && !hasBorderline) return null;

  return (
    <div className="space-y-3">
      {/* 1. Critical Debarment Shortage Banner (< 75%) */}
      {hasShortage && (
        <div className="w-full rounded-2xl bg-gradient-to-r from-rose-950/90 via-red-950/80 to-rose-900/70 border-2 border-rose-500/70 p-4 sm:p-5 shadow-xl shadow-rose-950/40 relative overflow-hidden animate-fadeIn">
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-rose-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-rose-600/30 border border-rose-500/50 text-rose-300 flex items-center justify-center shrink-0 mt-0.5 shadow-inner">
                <AlertTriangle className="w-5 h-5 text-rose-400 animate-pulse" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
                    <ShieldX className="w-4 h-4 text-rose-400" />
                    University Exam Debarment Warning (Shortage Zone &lt; 75%)
                  </span>
                  <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-rose-900/90 border border-rose-700 text-rose-200">
                    Mandatory Threshold: 75.0%
                  </span>
                </div>
                <p className="text-xs text-rose-200/95 mt-1 max-w-3xl leading-relaxed">
                  You are below 75% attendance in{' '}
                  <span className="font-semibold text-white">
                    {shortageSubjects.length} subject{shortageSubjects.length > 1 ? 's' : ''}
                  </span>
                  . Under academic regulations, you cannot sit for final semester examinations without recovery!
                </p>

                {/* Shortage Subjects list with catch-up counts */}
                <div className="flex flex-wrap gap-2 mt-2.5">
                  {shortageSubjects.map(sub => (
                    <div
                      key={sub.subjectId}
                      className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-black/50 border border-rose-500/50 text-xs"
                    >
                      <span className="font-mono font-bold text-white">{sub.subjectCode}</span>
                      <span className="text-rose-400 font-mono tabular-nums font-semibold">
                        {sub.percentage.toFixed(1)}%
                      </span>
                      <span className="text-slate-400">·</span>
                      <span className="text-rose-200 text-[11px]">
                        Must attend <strong className="font-mono text-white underline decoration-rose-400">{sub.catchUpCount}</strong> more classes
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0 self-end md:self-center">
              <button
                onClick={() => onOpenSimulator(shortageSubjects[0]?.subjectId)}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-xl transition-all shadow-md shadow-rose-600/30"
              >
                <span>Catch-up Calculator</span>
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
      )}

      {/* 2. BORDERLINE WARNING BANNER (75% to 79.9% / Safe Bunks <= 1) */}
      {hasBorderline && (
        <div className="w-full rounded-2xl bg-gradient-to-r from-amber-950/80 via-yellow-950/70 to-amber-900/60 border-2 border-amber-500/70 p-4 sm:p-5 shadow-xl shadow-amber-950/30 relative overflow-hidden animate-fadeIn">
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 flex items-center justify-center shrink-0 mt-0.5 shadow-inner">
                <AlertCircle className="w-5 h-5 text-amber-400 animate-bounce" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-bold text-amber-200 tracking-tight flex items-center gap-1.5">
                    <span>⚠️</span>
                    <span>BORDERLINE WARNING (75.0% - 79.9% / On The Border)</span>
                  </span>
                  <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-amber-900/80 border border-amber-700/80 text-amber-100">
                    High Risk: 0 to 1 Safe Bunk
                  </span>
                </div>
                <p className="text-xs text-amber-100/90 mt-1 max-w-3xl leading-relaxed">
                  You are walking right on the razor edge in{' '}
                  <span className="font-semibold text-white">
                    {borderlineSubjects.length} subject{borderlineSubjects.length > 1 ? 's' : ''}
                  </span>
                  . If you skip even <strong className="text-white underline decoration-amber-400">1 single class</strong>, you will slip below the 75% university eligibility line!
                </p>

                {/* Borderline Subjects List */}
                <div className="flex flex-wrap gap-2 mt-2.5">
                  {borderlineSubjects.map(sub => (
                    <div
                      key={sub.subjectId}
                      className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-black/45 border border-amber-500/40 text-xs"
                    >
                      <span className="font-mono font-bold text-amber-200">{sub.subjectCode}</span>
                      <span className="text-amber-400 font-mono tabular-nums font-semibold">
                        {sub.percentage.toFixed(1)}%
                      </span>
                      <span className="text-amber-400/60">·</span>
                      <span className="text-amber-100 text-[11px]">
                        Safe skips remaining: <strong className="font-mono text-white">{sub.safeBunkCount}</strong>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0 self-end md:self-center">
              <button
                onClick={() => onOpenSimulator(borderlineSubjects[0]?.subjectId)}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-amber-950 bg-amber-400 hover:bg-amber-300 rounded-xl transition-all shadow-md shadow-amber-400/30"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Simulate Safe Bunk</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
