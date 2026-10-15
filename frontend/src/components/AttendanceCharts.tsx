import React, { useState } from 'react';
import { Subject } from '../types';
import { calculateSubjectBunk, MIN_ATTENDANCE_PERCENT } from '../utils/attendanceCalculations';
import { BarChart3, TrendingUp, PieChart, Sparkles, CheckCircle2, AlertTriangle } from 'lucide-react';

interface AttendanceChartsProps {
  subjects: Subject[];
}

export const AttendanceCharts: React.FC<AttendanceChartsProps> = ({ subjects }) => {
  const [activeTab, setActiveTab] = useState<'subject_bars' | 'trend_line' | 'composition'>('subject_bars');
  const [hoveredSubject, setHoveredSubject] = useState<string | null>(null);

  // Calculate totals
  const totalConducted = subjects.reduce((acc, s) => acc + s.totalConducted, 0);
  const totalAttended = subjects.reduce((acc, s) => acc + s.attended, 0);
  const totalAbsent = subjects.reduce((acc, s) => acc + s.absent, 0);
  const totalOnDuty = subjects.reduce((acc, s) => acc + s.onDuty, 0);

  // Weekly trend simulated data based on current overall attendance
  const currentOverall = totalConducted > 0 ? ((totalAttended + totalOnDuty) / totalConducted) * 100 : 100;
  const trendPoints = [
    { week: 'W1', value: 92.0 },
    { week: 'W2', value: 89.5 },
    { week: 'W3', value: 86.0 },
    { week: 'W4', value: 81.2 },
    { week: 'W5', value: 78.4 },
    { week: 'W6', value: 76.8 },
    { week: 'W7', value: 79.2 },
    { week: 'Current', value: Math.round(currentOverall * 10) / 10 },
  ];

  return (
    <div className="w-full bg-[#0F172A]/90 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl backdrop-blur-sm space-y-5">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-violet-600/20 border border-violet-500/30 text-violet-400 flex items-center justify-center">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <span>Real-Time Progress Tracker &amp; Analytics</span>
              <span className="text-xs font-mono font-medium text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800/80">
                Visual Analytics
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Interactive percentage distribution, 75% threshold delta, and attendance trajectory.
            </p>
          </div>
        </div>

        {/* Chart View Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-xl self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('subject_bars')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'subject_bars'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Subject Bars</span>
          </button>

          <button
            onClick={() => setActiveTab('trend_line')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'trend_line'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Semester Trend</span>
          </button>

          <button
            onClick={() => setActiveTab('composition')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'composition'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <PieChart className="w-3.5 h-3.5" />
            <span>Breakdown</span>
          </button>
        </div>
      </div>

      {/* Chart Canvas Area */}
      <div className="pt-2">
        {/* Tab 1: Subject Bars with 75% Cutoff Dotted Line */}
        {activeTab === 'subject_bars' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-2">
                <span className="w-3 h-0.5 bg-rose-500 inline-block border-t border-dashed" />
                <span className="font-semibold text-rose-400">Red Line: Mandatory 75% Cutoff</span>
              </span>
              <span>Hover over bars for exact attendance figures</span>
            </div>

            <div className="relative h-64 w-full bg-slate-900/60 rounded-xl p-4 border border-slate-800/80 flex flex-col justify-end">
              {/* 75% Cutoff Reference Line */}
              <div
                className="absolute left-10 right-4 border-b-2 border-dashed border-rose-500/80 z-20 pointer-events-none"
                style={{ bottom: '75%' }}
              >
                <span className="absolute -top-5 right-0 text-[10px] font-mono font-bold bg-rose-950 text-rose-300 px-1.5 py-0.2 rounded border border-rose-800">
                  75.0% Mandatory Cutoff
                </span>
              </div>

              {/* Y-Axis Guidelines (25%, 50%, 75%, 100%) */}
              <div className="absolute left-2 top-4 bottom-8 flex flex-col justify-between text-[10px] font-mono text-slate-500 pointer-events-none">
                <span>100%</span>
                <span>75%</span>
                <span>50%</span>
                <span>25%</span>
                <span>0%</span>
              </div>

              {/* Bar Columns Container */}
              <div className="ml-8 h-full flex items-end justify-around gap-2 sm:gap-4 relative z-10 pt-6">
                {subjects.map(subject => {
                  const calc = calculateSubjectBunk(subject);
                  const pct = Math.min(calc.percentage, 100);
                  const isHovered = hoveredSubject === subject.id;

                  const barColor =
                    pct >= 80
                      ? 'from-emerald-600 to-emerald-400'
                      : pct >= 75
                      ? 'from-amber-600 to-amber-400'
                      : 'from-rose-600 to-rose-400';

                  return (
                    <div
                      key={subject.id}
                      className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer"
                      onMouseEnter={() => setHoveredSubject(subject.id)}
                      onMouseLeave={() => setHoveredSubject(null)}
                    >
                      {/* Tooltip on hover */}
                      {isHovered && (
                        <div className="absolute -top-12 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs shadow-xl text-center z-30 pointer-events-none animate-fadeIn">
                          <span className="font-bold text-white block">{subject.name}</span>
                          <span className="font-mono text-cyan-300 text-[11px]">
                            {calc.percentage.toFixed(1)}% ({calc.attended}/{subject.totalConducted})
                          </span>
                        </div>
                      )}

                      {/* Bar Pillar */}
                      <div className="w-full max-w-[48px] h-full flex items-end justify-center">
                        <div
                          className={`w-full rounded-t-lg bg-gradient-to-t ${barColor} transition-all duration-500 shadow-lg relative ${
                            isHovered ? 'brightness-125 scale-105' : ''
                          }`}
                          style={{ height: `${pct}%` }}
                        >
                          <span className="absolute -top-5 left-1/2 -translate-x-1/2 font-mono text-[10px] font-bold text-white tabular-nums opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                            {calc.percentage.toFixed(1)}%
                          </span>
                        </div>
                      </div>

                      {/* X-Axis Label */}
                      <span className="text-[11px] font-mono font-bold text-slate-300 mt-2 truncate max-w-[50px] text-center">
                        {subject.code}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Semester Weekly Progression Trend Line */}
        {activeTab === 'trend_line' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Weekly Attendance Trajectory over Semester</span>
              <span className="font-mono text-cyan-400">Current Aggregate: {currentOverall.toFixed(1)}%</span>
            </div>

            <div className="relative h-64 w-full bg-slate-900/60 rounded-xl p-4 border border-slate-800/80 flex items-center justify-center">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 500 200">
                {/* 75% target benchmark line */}
                <line
                  x1="30"
                  y1={200 - (75 / 100) * 180}
                  x2="480"
                  y2={200 - (75 / 100) * 180}
                  stroke="#F43F5E"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                />
                <text
                  x="485"
                  y={200 - (75 / 100) * 180 + 4}
                  fill="#F43F5E"
                  fontSize="9"
                  fontFamily="monospace"
                  fontWeight="bold"
                >
                  75%
                </text>

                {/* SVG Trend Polyline */}
                <polyline
                  fill="none"
                  stroke="#6366F1"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={trendPoints
                    .map((pt, i) => {
                      const x = 40 + i * (430 / (trendPoints.length - 1));
                      const y = 200 - (pt.value / 100) * 180;
                      return `${x},${y}`;
                    })
                    .join(' ')}
                />

                {/* Circles for points */}
                {trendPoints.map((pt, i) => {
                  const x = 40 + i * (430 / (trendPoints.length - 1));
                  const y = 200 - (pt.value / 100) * 180;
                  const isCurrent = i === trendPoints.length - 1;

                  return (
                    <g key={i}>
                      <circle
                        cx={x}
                        cy={y}
                        r={isCurrent ? 6 : 4}
                        fill={isCurrent ? '#06B6D4' : '#6366F1'}
                        stroke="#0F172A"
                        strokeWidth="2"
                      />
                      <text
                        x={x}
                        y={y - 10}
                        textAnchor="middle"
                        fill="#F8FAFC"
                        fontSize="9"
                        fontFamily="monospace"
                        fontWeight="bold"
                      >
                        {pt.value}%
                      </text>
                      <text
                        x={x}
                        y="195"
                        textAnchor="middle"
                        fill="#94A3B8"
                        fontSize="10"
                        fontFamily="monospace"
                      >
                        {pt.week}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>
        )}

        {/* Tab 3: Lecture Breakdown Ring */}
        {activeTab === 'composition' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="flex flex-col items-center justify-center p-4">
              <div className="relative w-44 h-44 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  {/* Background */}
                  <circle cx="50" cy="50" r="40" stroke="#1E293B" strokeWidth="14" fill="none" />

                  {/* Attended (Emerald) */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="#10B981"
                    strokeWidth="14"
                    fill="none"
                    strokeDasharray={`${(totalAttended / (totalConducted || 1)) * 251.2} 251.2`}
                    strokeLinecap="round"
                  />

                  {/* On Duty (Cyan) */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="#06B6D4"
                    strokeWidth="14"
                    fill="none"
                    strokeDasharray={`${(totalOnDuty / (totalConducted || 1)) * 251.2} 251.2`}
                    strokeDashoffset={`-${(totalAttended / (totalConducted || 1)) * 251.2}`}
                  />
                </svg>

                <div className="absolute flex flex-col items-center text-center">
                  <span className="text-xl font-black font-mono text-white tabular-nums">
                    {totalConducted}
                  </span>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Total Classes</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="text-xs font-semibold text-slate-200">Present in Lectures</span>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-white text-sm">{totalAttended}</span>
                  <span className="text-[11px] text-slate-400 font-mono ml-2">
                    ({totalConducted > 0 ? ((totalAttended / totalConducted) * 100).toFixed(1) : 0}%)
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-3 h-3 rounded-full bg-cyan-400" />
                  <span className="text-xs font-semibold text-slate-200">Approved On-Duty (OD)</span>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-white text-sm">{totalOnDuty}</span>
                  <span className="text-[11px] text-slate-400 font-mono ml-2">
                    ({totalConducted > 0 ? ((totalOnDuty / totalConducted) * 100).toFixed(1) : 0}%)
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-3 h-3 rounded-full bg-rose-500" />
                  <span className="text-xs font-semibold text-slate-200">Missed / Unexcused Leaves</span>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-white text-sm">{totalAbsent}</span>
                  <span className="text-[11px] text-slate-400 font-mono ml-2">
                    ({totalConducted > 0 ? ((totalAbsent / totalConducted) * 100).toFixed(1) : 0}%)
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
