import React from 'react';
import { Subject, BunkCalculation } from '../types';
import { calculateSubjectBunk } from '../utils/attendanceCalculations';
import { ShieldCheck, ShieldAlert, AlertTriangle, Calculator, Sparkles, Edit3 } from 'lucide-react';

interface SubjectCardsGridProps {
  subjects: Subject[];
  onOpenSimulator: (subjectId: string) => void;
  onUpdateSubjectStats: (subjectId: string, deltaAttended: number, deltaTotal: number) => void;
  onOpenEditor?: (subjectId?: string) => void;
}

export const SubjectCardsGrid: React.FC<SubjectCardsGridProps> = ({
  subjects,
  onOpenSimulator,
  onUpdateSubjectStats,
  onOpenEditor,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <span>Subject-Wise Attendance &amp; Bunk Intelligence</span>
            <span className="text-xs font-mono font-medium text-pink-300 bg-pink-950/80 border border-pink-700/60 px-2 py-0.5 rounded-full">
              75% Eligibility Engine ✨
            </span>
          </h2>
          <p className="text-xs text-slate-400">
            Calculates exact classes you can skip without falling below 75%, plus real-time borderline warnings.
          </p>
        </div>

        {onOpenEditor && (
          <button
            onClick={() => onOpenEditor()}
            className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-pink-500/20 to-purple-500/20 hover:from-pink-500/30 hover:to-purple-500/30 border border-pink-500/40 text-pink-200 text-xs font-semibold transition-all"
          >
            <Edit3 className="w-3.5 h-3.5 text-pink-400" />
            <span>Update Present Attendance</span>
          </button>
        )}
      </div>

      {/* Grid of Subject Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {subjects.map(subject => {
          const calc: BunkCalculation = calculateSubjectBunk(subject);
          const isEligible = calc.isEligible;
          const isBorderline = calc.isBorderline;
          const pct = calc.percentage;

          return (
            <div
              key={subject.id}
              className={`rounded-2xl border p-5 flex flex-col justify-between transition-all backdrop-blur-sm relative overflow-hidden ${
                !isEligible
                  ? 'bg-gradient-to-b from-rose-950/50 to-[#120B16] border-rose-500/60 shadow-xl shadow-rose-950/30'
                  : isBorderline
                  ? 'bg-gradient-to-b from-amber-950/40 to-[#13111E] border-amber-500/60 shadow-xl shadow-amber-950/20 ring-1 ring-amber-500/20'
                  : 'bg-[#121324]/90 border-purple-900/40 hover:border-pink-500/40 shadow-lg'
              }`}
            >
              {/* Top Accent Strip */}
              <div
                className="absolute top-0 left-0 right-0 h-1.5"
                style={{ backgroundColor: subject.color || '#ec4899' }}
              />

              {/* Card Header */}
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-slate-200 bg-slate-800/90 px-2 py-0.5 rounded-md border border-slate-700/80">
                        {subject.code}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {subject.credits} Credits
                      </span>
                      {isBorderline && (
                        <span className="text-[10px] font-bold text-amber-300 bg-amber-950 px-2 py-0.5 rounded-full border border-amber-600/60 animate-pulse">
                          ⚠️ ON THE BORDER
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm font-bold text-white mt-1.5 line-clamp-1" title={subject.name}>
                      {subject.name}
                    </h3>
                    <p className="text-xs text-purple-300/80 mt-0.5 line-clamp-1">
                      Faculty: <span className="text-slate-200">{subject.faculty}</span>
                    </p>
                  </div>

                  {/* Percentage Display */}
                  <div className="flex flex-col items-end shrink-0">
                    <span
                      className={`text-2xl font-black font-mono tabular-nums ${
                        !isEligible
                          ? 'text-rose-400'
                          : isBorderline
                          ? 'text-amber-400'
                          : 'text-emerald-400'
                      }`}
                    >
                      {pct.toFixed(1)}%
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {subject.attended + subject.onDuty} / {subject.totalConducted} attended
                    </span>
                  </div>
                </div>

                {/* Visual Progress Bar with 75% Cutoff Marker */}
                <div className="mt-4 space-y-1">
                  <div className="relative w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                    {/* 75% Target Marker */}
                    <div
                      className="absolute top-0 bottom-0 w-[2px] bg-white z-10 shadow-sm"
                      style={{ left: '75%' }}
                      title="75% Mandatory Cutoff Line"
                    />
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        !isEligible
                          ? 'bg-gradient-to-r from-red-600 to-rose-500'
                          : isBorderline
                          ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
                          : 'bg-gradient-to-r from-emerald-500 to-teal-400'
                      }`}
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono">
                    <span>0%</span>
                    <span className="text-white font-semibold">75% Target Cutoff</span>
                    <span>100%</span>
                  </div>
                </div>

                {/* Bunk vs Catch-Up Calculation Result Box */}
                <div
                  className={`mt-4 p-3 rounded-xl border text-xs leading-relaxed ${
                    !isEligible
                      ? 'bg-rose-950/60 border-rose-600/70 text-rose-200'
                      : isBorderline
                      ? 'bg-amber-950/50 border-amber-600/70 text-amber-100'
                      : 'bg-emerald-950/40 border-emerald-700/60 text-emerald-200'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold mb-1">
                    {!isEligible ? (
                      <>
                        <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                        <span className="text-rose-300">Debarment Alert (&lt; 75%)</span>
                      </>
                    ) : isBorderline ? (
                      <>
                        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                        <span className="text-amber-300">⚠️ Borderline Alert (75.0% - 79.9%)</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span className="text-emerald-300">Safe: Exam Eligible (&ge; 75%)</span>
                      </>
                    )}
                  </div>

                  {!isEligible ? (
                    <div>
                      <p>
                        Must attend{' '}
                        <strong className="text-white font-mono text-sm underline decoration-rose-400">
                          {calc.catchUpCount}
                        </strong>{' '}
                        consecutive classes to recover above 75.0%!
                      </p>
                    </div>
                  ) : isBorderline ? (
                    <div>
                      <p>
                        {calc.safeBunkCount === 0 ? (
                          <span className="text-amber-200 font-semibold">
                            ⚠️ Zero safe bunks remaining! Missing even 1 more class will immediately debar you!
                          </span>
                        ) : (
                          <span>
                            You can only skip{' '}
                            <strong className="text-white font-mono text-sm underline decoration-amber-400">
                              {calc.safeBunkCount}
                            </strong>{' '}
                            more class{calc.safeBunkCount > 1 ? 'es' : ''} before dropping into the shortage zone.
                          </span>
                        )}
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p>
                        You can safely skip{' '}
                        <strong className="text-white font-mono text-sm underline decoration-emerald-400">
                          {calc.safeBunkCount}
                        </strong>{' '}
                        more class{calc.safeBunkCount > 1 ? 'es' : ''} and still maintain above 75.0%.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Quick Attendance Sync & Simulator */}
              <div className="mt-4 pt-3 border-t border-purple-900/30 flex items-center justify-between text-xs gap-2">
                <button
                  onClick={() => onOpenSimulator(subject.id)}
                  className="flex items-center gap-1 text-pink-400 hover:text-pink-300 font-semibold transition-colors"
                >
                  <Calculator className="w-3.5 h-3.5" />
                  <span>Simulate Bunk</span>
                </button>

                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-slate-400 mr-0.5">Quick Log:</span>
                  <button
                    onClick={() => onUpdateSubjectStats(subject.id, 1, 1)}
                    className="px-2 py-1 rounded-lg bg-emerald-950/70 hover:bg-emerald-900 text-emerald-300 border border-emerald-700/60 text-[11px] font-mono font-bold transition-all shadow-sm active:scale-95"
                    title="Add +1 Attended Class"
                  >
                    +1 Att
                  </button>
                  <button
                    onClick={() => onUpdateSubjectStats(subject.id, 0, 1)}
                    className="px-2 py-1 rounded-lg bg-rose-950/70 hover:bg-rose-900 text-rose-300 border border-rose-700/60 text-[11px] font-mono font-bold transition-all shadow-sm active:scale-95"
                    title="Add +1 Missed Class"
                  >
                    +1 Miss
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
