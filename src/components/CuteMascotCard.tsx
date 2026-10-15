import React, { useState } from 'react';
import { Subject } from '../types';
import { calculateOverallAttendance } from '../utils/attendanceCalculations';
import { AppTheme } from '../utils/authDatabase';
import { THEMES } from '../utils/theme';
import { Sparkles, Heart, Coffee, ShieldAlert, Award, Smile, Frown, Meh, Palette } from 'lucide-react';

interface CuteMascotCardProps {
  subjects: Subject[];
  currentTheme: AppTheme;
  onThemeChange: (theme: AppTheme) => void;
  onOpenTimetable: () => void;
  onOpenSimulator: () => void;
}

export const CuteMascotCard: React.FC<CuteMascotCardProps> = ({
  subjects,
  currentTheme,
  onThemeChange,
  onOpenTimetable,
  onOpenSimulator,
}) => {
  const summary = calculateOverallAttendance(subjects);
  const theme = THEMES[currentTheme] || THEMES.kawaii_pastel;

  const pct = summary.overallPercentage;
  const isShortage = summary.shortageSubjectsCount > 0;
  const isBorderline = summary.borderlineSubjectsCount > 0 && !isShortage;

  // Find safest and riskiest subject
  const sortedBreakdown = [...summary.subjectsBreakdown].sort((a, b) => b.safeBunkCount - a.safeBunkCount);
  const safestSubject = sortedBreakdown[0];
  const riskiestSubject = [...summary.subjectsBreakdown].sort((a, b) => a.percentage - b.percentage)[0];

  // Mascot dynamic advice
  let mascotEmoji = '🐱';
  let mascotMood = 'Happy & Purring';
  let mascotTone = 'text-pink-300';
  let mascotSpeech = '';
  let badgeTitle = 'Safe & Thriving 🌸';

  if (isShortage) {
    mascotEmoji = '😿';
    mascotMood = 'Worried & Stressed';
    mascotTone = 'text-rose-300';
    badgeTitle = 'Shortage Alert 🚨';
    mascotSpeech = `Oh no, bestie! You're under 75% in ${riskiestSubject?.subjectCode || 'some subjects'}. You need to attend ${riskiestSubject?.catchUpCount || 2} more classes ASAP to avoid exam debarment! No bunks allowed!`;
  } else if (isBorderline) {
    mascotEmoji = '🙀';
    mascotMood = 'High Alert';
    mascotTone = 'text-amber-300';
    badgeTitle = 'Borderline Warning ⚠️';
    mascotSpeech = `Careful! You are right on the 75% border in ${riskiestSubject?.subjectCode} (${riskiestSubject?.percentage.toFixed(1)}%). Missing just ONE single lecture will drop you below 75%! Protect your attendance!`;
  } else {
    mascotEmoji = '😸';
    mascotMood = 'Chill & Vibing';
    mascotTone = 'text-emerald-300';
    badgeTitle = '75%+ Achieved ✨';
    mascotSpeech = `You're doing amazing! Overall attendance is ${pct.toFixed(1)}%! In ${safestSubject?.subjectCode || 'your best subject'}, you have ${safestSubject?.safeBunkCount || 2} safe bunks left. Grab a boba and chill! 🧋🌸`;
  }

  return (
    <div className="w-full rounded-3xl bg-gradient-to-r from-purple-950/60 via-pink-950/40 to-[#120e24] border border-pink-500/30 p-5 shadow-xl relative overflow-hidden backdrop-blur-md">
      {/* Decorative ambient bokeh */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-pink-500/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-5">
        {/* Left: Mascot Avatar & Speech */}
        <div className="flex items-center gap-4 text-left w-full md:w-auto">
          {/* Animated Mascot Bubble */}
          <div className="relative shrink-0">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-pink-400 via-purple-500 to-indigo-500 p-0.5 flex items-center justify-center shadow-lg shadow-pink-500/30">
              <div className="w-full h-full bg-[#18112e] rounded-[22px] flex items-center justify-center text-3xl select-none animate-pulse">
                {mascotEmoji}
              </div>
            </div>
            <span className="absolute -bottom-1 -right-1 text-xs bg-pink-600 text-white rounded-full p-0.5 px-1.5 font-bold shadow">
              {theme.cuteIcon}
            </span>
          </div>

          {/* Speech text */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-black text-pink-300 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                Mochi&apos;s Bunk Wisdom
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                isShortage
                  ? 'bg-rose-950 text-rose-300 border-rose-700'
                  : isBorderline
                  ? 'bg-amber-950 text-amber-300 border-amber-700'
                  : 'bg-emerald-950 text-emerald-300 border-emerald-700'
              }`}>
                {badgeTitle}
              </span>
              <span className="text-[10px] text-purple-300/70 font-mono">
                Mood: {mascotMood}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans max-w-2xl">
              &ldquo;{mascotSpeech}&rdquo;
            </p>
          </div>
        </div>

        {/* Right: Theme Quick Switch & Cute Actions */}
        <div className="flex flex-wrap items-center gap-2 shrink-0 self-end md:self-center">
          <div className="flex items-center gap-1 p-1 rounded-2xl bg-black/40 border border-purple-500/30">
            {Object.values(THEMES).map(t => (
              <button
                key={t.id}
                onClick={() => onThemeChange(t.id)}
                title={t.name}
                className={`p-1.5 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                  currentTheme === t.id
                    ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md shadow-pink-500/30'
                    : 'text-purple-300 hover:text-white hover:bg-purple-900/40'
                }`}
              >
                <span>{t.cuteIcon}</span>
                <span className="text-[11px] hidden sm:inline">{t.badge.split(' ')[0]}</span>
              </button>
            ))}
          </div>

          <button
            onClick={onOpenSimulator}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-pink-600/30 hover:bg-pink-600/50 border border-pink-500/50 text-pink-200 text-xs font-bold transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-pink-400" />
            <span>Simulate</span>
          </button>
        </div>
      </div>
    </div>
  );
};
