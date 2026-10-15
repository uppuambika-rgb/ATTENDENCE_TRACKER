import React from 'react';
import { Subject, BunkCalculation } from '../types';
import { calculateSubjectBunk } from '../utils/attendanceCalculations';
import { ShieldCheck, ShieldAlert, AlertCircle, Plus, Minus, Calculator, UserCheck } from 'lucide-react';

interface SubjectCardsGridProps {
  subjects: Subject[];
  onOpenSimulator: (subjectId: string) => void;
  onUpdateSubjectStats: (subjectId: string, deltaAttended: number, deltaTotal: number) => void;
}

export const SubjectCardsGrid: React.FC<SubjectCardsGridProps> = ({
  subjects,
  onOpenSimulator,
  onUpdateSubjectStats,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <span>Subject-Wise Attendance &amp; Bunk Buffers</span>
            <span className="text-xs font-mono font-medium text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
              75% Benchmark
            </span>
          </h2>
          <p className="text-xs text-slate-400">
            Real-time safe bunk limit calculations and mandatory consecutive catch-up lectures.
          </p>
        </div>
      </div>

      {/* Grid of Subject Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {subjects.map(subject => {
          const calc: BunkCalculation = calculateSubjectBunk(subject);
          const isEligible = calc.isEligible;
          const pct = calc.percentage;

          return (
            <div
              key={subject.id}
              className={`rounded-2xl border p-5 flex flex-col justify-between transition-all backdrop-blur-sm relative overflow-hidden ${
                isEligible
                  ? 'bg-[#0F172A]/90 border-slate-800 hover:border-slate-700/90 shadow-lg'
                  : 'bg-gradient-to-b from-rose-950/40 to-[#0F172A]/90 border-rose-500/50 shadow-xl shadow-rose-950/20'
              }`}
            >
              {/* Top Accent Strip */}
              <div
                className="absolute top-0 left-0 right-0 h-1"
                style={{ backgroundColor: subject.color }}
              />

              {/* Card Header */}
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-200 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700/80">
                        {subject.code}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {subject.credits} Credits
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-white mt-1.5 line-clamp-1" title={subject.name}>
                      {subject.name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                      {subject.faculty}
                    </p>
                  </div>

                  {/* Percentage Display */}
                  <div className="flex flex-col items-end shrink-0">
                    <span
                      className={`text-xl font-black font-mono tabular-nums ${
                        pct >= 80
                          ? 'text-emerald-400'
                          : pct >= 75
                          ? 'text-amber-400'
                          : 'text-rose-400'
                      }`}
                    >
                      {pct.toFixed(1)}%
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {subject.attended + subject.onDuty} / {subject.totalConducted} classes
                    </span>
                  </div>
                </div>

                {/* Visual Progress Bar with 75% Cutoff Marker */}
                <div className="mt-4 space-y-1">
                  <div className="relative w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                    {/* 75% reference line mark */}
                    <div
                      className="absolute top-0 bottom-0 w-[2px] bg-white/70 z-10"
                      style={{ left: '75%' }}
                      title="75% Mandatory Cutoff"
                    />
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        pct >= 80
                          ? 'bg-emerald-500'
                          : pct >= 75
                          ? 'bg-amber-500'
                          : 'bg-rose-500'
                      }`}
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono">
                    <span>0%</span>
                    <span className="text-slate-300 font-semibold">75% Target</span>
                    <span>100%</span>
                  </div>
                </div>

                {/* Bunk vs Catch-Up Calculation Result Box */}
                <div
                  className={`mt-4 p-3 rounded-xl border text-xs ${
                    isEligible
                      ? 'bg-emerald-950/30 border-emerald-800/50 text-emerald-200'
                      : 'bg-rose-950/50 border-rose-700/60 text-rose-200'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold mb-1">
                    {isEligible ? (
                      <>
                        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span className="text-emerald-300">Safe: Exam Eligible</span>
                      </>
                    ) : (
                      <>
                        <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                        <span className="text-rose-300">Shortage: Debarment Risk</span>
                      </>
                    )}
                  </div>

                  {isEligible ? (
                    <div>
                      {calc.safeBunkCount > 0 ? (
                        <p className="leading-relaxed">
                          You can safely skip{' '}
                          <span className="font-bold text-white font-mono text-sm underline decoration-emerald-400">
                            {calc.safeBunkCount}
                          </span>{' '}
                          more class{calc.safeBunkCount > 1 ? 'es' : ''} and remain &ge; 75.0%.
                        </p>
                      ) : (
                        <p className="leading-relaxed text-amber-300">
                          Borderline safety! Missing even 1 more class will drop you below 75%.
                        </p>
                      )}
                    </div>
                  ) : (
                    <div>
                      <p className="leading-relaxed">
                        Must attend{' '}
                        <span className="font-bold text-white font-mono text-sm underline decoration-rose-400">
                          {calc.catchUpCount}
                        </span>{' '}
                        consecutive classes to recover to 75.0%.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Quick Actions & Calibration */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                {/* Simulator Link */}
                <button
                  onClick={() => onOpenSimulator(subject.id)}
                  className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-semibold transition-colors"
                >
                  <Calculator className="w-3.5 h-3.5" />
                  <span>Simulate 'What-If'</span>
                </button>

                {/* Quick Calibration Buttons (+Attended, +Absent) */}
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-slate-500 mr-1">Sync:</span>
                  <button
                    onClick={() => onUpdateSubjectStats(subject.id, 1, 1)}
                    className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-emerald-900/50 text-emerald-400 border border-slate-700 text-[11px] font-mono transition-colors"
                    title="Add +1 Attended Class"
                  >
                    +1 Att
                  </button>
                  <button
                    onClick={() => onUpdateSubjectStats(subject.id, 0, 1)}
                    className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-rose-900/50 text-rose-400 border border-slate-700 text-[11px] font-mono transition-colors"
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
