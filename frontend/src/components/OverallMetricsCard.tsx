import React from 'react';
import { OverallAttendanceSummary } from '../utils/attendanceCalculations';
import { ShieldCheck, ShieldAlert, CheckCircle2, XCircle, Award, Calculator, TrendingUp } from 'lucide-react';

interface OverallMetricsCardProps {
  summary: OverallAttendanceSummary;
  onOpenSimulator: () => void;
  onOpenTimetable: () => void;
}

export const OverallMetricsCard: React.FC<OverallMetricsCardProps> = ({
  summary,
  onOpenSimulator,
  onOpenTimetable,
}) => {
  const {
    overallPercentage,
    isOverallEligible,
    totalConducted,
    totalAttended,
    totalAbsent,
    totalOnDuty,
    safeBunkCountOverall,
    catchUpCountOverall,
    shortageSubjectsCount,
  } = summary;

  // Determine stroke dash for circular meter
  const radius = 48;
  const circumference = 2 * Math.PI * radius;
  const strokeOffset = circumference - (Math.min(overallPercentage, 100) / 100) * circumference;

  const toneColor =
    overallPercentage >= 80 ? '#10B981' : overallPercentage >= 75 ? '#F59E0B' : '#F43F5E';

  return (
    <div className="w-full bg-[#0F172A]/90 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden backdrop-blur-sm">
      {/* Decorative gradient overlay */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/5 rounded-full blur-3xl pointer-events-none" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left: Circular Attendance Gauge */}
        <div className="lg:col-span-4 flex items-center gap-5 border-b lg:border-b-0 lg:border-r border-slate-800/80 pb-5 lg:pb-0 lg:pr-6">
          <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 120 120">
              {/* Background track */}
              <circle
                cx="60"
                cy="60"
                r={radius}
                stroke="#1E293B"
                strokeWidth="10"
                fill="none"
              />
              {/* 75% benchmark tick / marker */}
              <circle
                cx="60"
                cy="60"
                r={radius}
                stroke="#334155"
                strokeWidth="10"
                strokeDasharray={`${circumference * 0.75} ${circumference * 0.25}`}
                fill="none"
                opacity="0.3"
              />
              {/* Actual percentage stroke */}
              <circle
                cx="60"
                cy="60"
                r={radius}
                stroke={toneColor}
                strokeWidth="10"
                strokeDasharray={circumference}
                strokeDashoffset={strokeOffset}
                strokeLinecap="round"
                fill="none"
                className="transition-all duration-700 ease-out"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-2xl font-black font-mono tracking-tight text-white tabular-nums">
                {overallPercentage.toFixed(1)}%
              </span>
              <span className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
                Overall
              </span>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              {isOverallEligible ? (
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Exam Eligible (≥ 75%)</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-xs font-bold text-rose-400">
                  <ShieldAlert className="w-4 h-4 text-rose-400" />
                  <span>Shortage Debarred (&lt; 75%)</span>
                </div>
              )}
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              {isOverallEligible
                ? 'Your aggregate attendance satisfies university exam board requirements.'
                : 'Warning: Below mandatory 75% threshold. Prioritize upcoming lecture attendance!'}
            </p>

            <div className="pt-1 flex items-center gap-2">
              <button
                onClick={onOpenSimulator}
                className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
              >
                <Calculator className="w-3.5 h-3.5" />
                <span>Simulate Bunk Buffer</span>
              </button>
            </div>
          </div>
        </div>

        {/* Center: Key Metric Counters */}
        <div className="lg:col-span-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 bg-slate-900/70 border border-slate-800/80 rounded-xl">
            <span className="text-[11px] font-medium text-slate-400 block">Conducted</span>
            <span className="text-xl font-bold font-mono text-white tabular-nums">
              {totalConducted}
            </span>
            <span className="text-[10px] text-slate-500 block mt-0.5">Total Lectures</span>
          </div>

          <div className="p-3 bg-slate-900/70 border border-slate-800/80 rounded-xl">
            <span className="text-[11px] font-medium text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Attended
            </span>
            <span className="text-xl font-bold font-mono text-emerald-300 tabular-nums">
              {totalAttended}
            </span>
            <span className="text-[10px] text-slate-500 block mt-0.5">Classes Present</span>
          </div>

          <div className="p-3 bg-slate-900/70 border border-slate-800/80 rounded-xl">
            <span className="text-[11px] font-medium text-rose-400 flex items-center gap-1">
              <XCircle className="w-3 h-3" /> Missed
            </span>
            <span className="text-xl font-bold font-mono text-rose-300 tabular-nums">
              {totalAbsent}
            </span>
            <span className="text-[10px] text-slate-500 block mt-0.5">Classes Absent</span>
          </div>

          <div className="p-3 bg-slate-900/70 border border-slate-800/80 rounded-xl">
            <span className="text-[11px] font-medium text-cyan-400 flex items-center gap-1">
              <Award className="w-3 h-3" /> On-Duty (OD)
            </span>
            <span className="text-xl font-bold font-mono text-cyan-300 tabular-nums">
              {totalOnDuty}
            </span>
            <span className="text-[10px] text-slate-500 block mt-0.5">Approved OD</span>
          </div>
        </div>

        {/* Right: Bunk Buffer & Action Card */}
        <div className="lg:col-span-3 bg-gradient-to-br from-indigo-950/40 to-slate-900 border border-indigo-500/30 rounded-xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-1">
              <span className="flex items-center gap-1 text-indigo-300">
                <TrendingUp className="w-3.5 h-3.5" />
                {isOverallEligible ? 'Aggregate Bunk Buffer' : 'Catch-Up Needed'}
              </span>
              <span className="font-mono text-[10px] text-slate-400">Min 75% Cutoff</span>
            </div>

            {isOverallEligible ? (
              <div className="mt-1">
                <div className="text-2xl font-black font-mono text-emerald-400 tabular-nums">
                  {safeBunkCountOverall}{' '}
                  <span className="text-xs font-sans font-medium text-slate-300">
                    classes skippable
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  You can safely miss up to {safeBunkCountOverall} more lectures across all subjects and stay at or above 75%.
                </p>
              </div>
            ) : (
              <div className="mt-1">
                <div className="text-2xl font-black font-mono text-rose-400 tabular-nums">
                  {catchUpCountOverall}{' '}
                  <span className="text-xs font-sans font-medium text-slate-300">
                    classes needed
                  </span>
                </div>
                <p className="text-[11px] text-rose-300/80 mt-1">
                  Attend the next {catchUpCountOverall} consecutive classes without missing to cross the 75% benchmark.
                </p>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-800/80 mt-2 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">
              {shortageSubjectsCount > 0 ? (
                <span className="text-rose-400 font-semibold">
                  {shortageSubjectsCount} subject(s) debarred
                </span>
              ) : (
                <span className="text-emerald-400 font-semibold">All subjects compliant</span>
              )}
            </span>
            <button
              onClick={onOpenTimetable}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold hover:underline"
            >
              View Timetable &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
