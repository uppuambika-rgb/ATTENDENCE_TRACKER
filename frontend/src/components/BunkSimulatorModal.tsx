import React, { useState } from 'react';
import { Subject } from '../types';
import { calculateSubjectBunk, simulateAttendanceChange } from '../utils/attendanceCalculations';
import { X, Calculator, ShieldCheck, ShieldAlert, ArrowRight, Sparkles, AlertTriangle } from 'lucide-react';

interface BunkSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  subjects: Subject[];
  initialSubjectId?: string;
}

export const BunkSimulatorModal: React.FC<BunkSimulatorModalProps> = ({
  isOpen,
  onClose,
  subjects,
  initialSubjectId,
}) => {
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(
    initialSubjectId || subjects[0]?.id || ''
  );
  const [skipCount, setSkipCount] = useState<number>(1);
  const [attendCount, setAttendCount] = useState<number>(3);

  if (!isOpen) return null;

  const currentSubject = subjects.find(s => s.id === selectedSubjectId) || subjects[0];
  if (!currentSubject) return null;

  const calc = calculateSubjectBunk(currentSubject);
  const effectiveAttended = currentSubject.attended + currentSubject.onDuty;
  const total = currentSubject.totalConducted;

  // Simulation 1: What if I skip 'skipCount' classes?
  const skipSimulation = simulateAttendanceChange(effectiveAttended, total, 0, skipCount);

  // Simulation 2: What if I attend 'attendCount' classes?
  const attendSimulation = simulateAttendanceChange(effectiveAttended, total, attendCount, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-2xl bg-[#0F172A] border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#0B1120]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/30 border border-indigo-500/40 text-indigo-400 flex items-center justify-center">
              <Calculator className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                75% Eligibility &amp; Bunk Simulator
              </h2>
              <p className="text-xs text-slate-400">
                Predict future attendance % and calculate safe skip limits
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Subject Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Select Subject Course to Simulate:
            </label>
            <select
              value={selectedSubjectId}
              onChange={e => setSelectedSubjectId(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs font-semibold focus:outline-none focus:border-indigo-500"
            >
              {subjects.map(s => {
                const subCalc = calculateSubjectBunk(s);
                return (
                  <option key={s.id} value={s.id}>
                    {s.code} - {s.name} ({subCalc.percentage.toFixed(1)}% |{' '}
                    {subCalc.isEligible ? 'Eligible' : 'Debarred Risk'})
                  </option>
                );
              })}
            </select>
          </div>

          {/* Current Baseline Card */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="font-mono text-xs text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800/80">
                {currentSubject.code} Baseline
              </span>
              <h3 className="text-sm font-bold text-white mt-1">{currentSubject.name}</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Conducted: <span className="font-mono text-slate-200">{total}</span> · Attended:{' '}
                <span className="font-mono text-slate-200">{effectiveAttended}</span> · Missed:{' '}
                <span className="font-mono text-slate-200">{currentSubject.absent}</span>
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <div
                  className={`text-2xl font-black font-mono tabular-nums ${
                    calc.percentage >= 80
                      ? 'text-emerald-400'
                      : calc.percentage >= 75
                      ? 'text-amber-400'
                      : 'text-rose-400'
                  }`}
                >
                  {calc.percentage.toFixed(1)}%
                </div>
                <div className="text-[10px] font-mono text-slate-400">
                  {calc.isEligible ? 'Above 75% cutoff' : 'Below 75% cutoff'}
                </div>
              </div>
            </div>
          </div>

          {/* Scenario 1: What if I SKIP classes? */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                Scenario A: What happens if I SKIP upcoming classes?
              </span>
              <span className="font-mono text-xs font-bold text-rose-400 bg-rose-950/80 px-2 py-0.5 rounded border border-rose-800/80">
                Skip {skipCount} class{skipCount > 1 ? 'es' : ''}
              </span>
            </div>

            <div className="flex items-center gap-4">
              <input
                type="range"
                min="1"
                max="10"
                value={skipCount}
                onChange={e => setSkipCount(Number(e.target.value))}
                className="w-full accent-rose-500 cursor-pointer"
              />
              <span className="font-mono font-bold text-sm text-white w-6 text-right">
                {skipCount}
              </span>
            </div>

            {/* Projection verdict */}
            <div
              className={`p-3 rounded-xl border text-xs flex items-center justify-between gap-3 ${
                skipSimulation.newPercentage >= 75
                  ? 'bg-emerald-950/30 border-emerald-800/50 text-emerald-200'
                  : 'bg-rose-950/50 border-rose-700/60 text-rose-200'
              }`}
            >
              <div>
                <div className="font-bold flex items-center gap-1">
                  {skipSimulation.newPercentage >= 75 ? (
                    <>
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>Safe to Skip ({skipSimulation.newPercentage.toFixed(1)}% &ge; 75%)</span>
                    </>
                  ) : (
                    <>
                      <ShieldAlert className="w-4 h-4 text-rose-400" />
                      <span>Debarment Risk! Drops below 75% cutoff</span>
                    </>
                  )}
                </div>
                <p className="text-[11px] mt-0.5 opacity-90">
                  New attendance will be {effectiveAttended} / {total + skipCount} lectures (
                  <span className="font-mono">{skipSimulation.changeDelta}%</span> drop).
                </p>
              </div>

              <div className="text-right shrink-0">
                <span className="text-lg font-black font-mono tabular-nums">
                  {skipSimulation.newPercentage.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          {/* Scenario 2: What if I ATTEND upcoming classes? */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                Scenario B: What happens if I ATTEND next consecutive classes?
              </span>
              <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/80">
                Attend {attendCount} class{attendCount > 1 ? 'es' : ''}
              </span>
            </div>

            <div className="flex items-center gap-4">
              <input
                type="range"
                min="1"
                max="15"
                value={attendCount}
                onChange={e => setAttendCount(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <span className="font-mono font-bold text-sm text-white w-6 text-right">
                {attendCount}
              </span>
            </div>

            {/* Projection verdict */}
            <div
              className={`p-3 rounded-xl border text-xs flex items-center justify-between gap-3 ${
                attendSimulation.newPercentage >= 75
                  ? 'bg-emerald-950/30 border-emerald-800/50 text-emerald-200'
                  : 'bg-amber-950/40 border-amber-800/50 text-amber-200'
              }`}
            >
              <div>
                <div className="font-bold flex items-center gap-1">
                  {attendSimulation.newPercentage >= 75 ? (
                    <>
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>Reaches 75% Exam Eligibility!</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                      <span>Still Short: Requires {calc.catchUpCount} consecutive classes</span>
                    </>
                  )}
                </div>
                <p className="text-[11px] mt-0.5 opacity-90">
                  New attendance will rise to {effectiveAttended + attendCount} / {total + attendCount} lectures (
                  <span className="font-mono">+{attendSimulation.changeDelta}%</span> gain).
                </p>
              </div>

              <div className="text-right shrink-0">
                <span className="text-lg font-black font-mono tabular-nums">
                  {attendSimulation.newPercentage.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 px-6 border-t border-slate-800 bg-[#0B1120] flex items-center justify-between">
          <div className="text-xs text-slate-400">
            Current Safe Bunk Buffer: <span className="font-bold font-mono text-white">{calc.safeBunkCount}</span> | Catch-up:{' '}
            <span className="font-bold font-mono text-white">{calc.catchUpCount}</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
