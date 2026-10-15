import React, { useState, useEffect } from 'react';
import { Student, PushNotificationItem } from '../types';
import { subscribeNotifications } from '../utils/notifications';
import { Bell, ShieldAlert, Cpu, User, LogOut, Sparkles } from 'lucide-react';

interface NavbarProps {
  student: Student;
  onOpenAuthModal: () => void;
  onOpenNotifications: () => void;
  onOpenJavaConsole: () => void;
  shortageCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  student,
  onOpenAuthModal,
  onOpenNotifications,
  onOpenJavaConsole,
  shortageCount,
}) => {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const unsubscribe = subscribeNotifications((items: PushNotificationItem[]) => {
      setUnreadCount(items.filter(i => !i.read).length);
    });
    return unsubscribe;
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-[#090D16]/90 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-8 py-3.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand Zone */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-[1px] flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <div className="w-full h-full bg-[#090D16] rounded-[11px] flex items-center justify-center">
              <span className="font-extrabold text-sm tracking-tight bg-gradient-to-r from-indigo-400 to-cyan-300 bg-clip-text text-transparent">
                B·T
              </span>
            </div>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-white tracking-tight">
                AttendX B.Tech
              </span>
              <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-800/60 px-1.5 py-0.5 rounded">
                75% Cutoff Engine
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <span>Semester Attendance &amp; Bunk Intelligence</span>
            </div>
          </div>
        </div>

        {/* Action Controls & Navigation */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* 75% Debarment Indicator */}
          {shortageCount > 0 ? (
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs font-medium cursor-pointer hover:bg-rose-900/50 transition-colors"
              onClick={onOpenNotifications}
              title="Students with under 75% attendance are subject to exam debarment"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              <span className="font-mono tabular-nums font-bold">{shortageCount}</span>
              <span className="hidden sm:inline">Subject{shortageCount > 1 ? 's' : ''} Under 75%</span>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-xs font-medium">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>100% Eligible (All ≥ 75%)</span>
            </div>
          )}

          {/* Java Backend Architecture Console button */}
          <button
            onClick={onOpenJavaConsole}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800/90 hover:bg-slate-700/90 text-slate-200 border border-slate-700 hover:border-indigo-500/50 transition-all shadow-sm"
            title="Inspect Scalable Java Spring Boot REST API &amp; Microservice Architecture"
          >
            <Cpu className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Java Backend API</span>
            <span className="text-[10px] font-mono text-indigo-300 bg-indigo-950/80 px-1 py-0.2 rounded border border-indigo-800/60">
              Spring 3
            </span>
          </button>

          {/* Push Notifications Bell */}
          <button
            onClick={onOpenNotifications}
            className="relative p-2 text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 rounded-lg transition-colors"
            title="Lecture push reminders and attendance alerts"
            aria-label="View notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-mono font-bold flex items-center justify-center ring-2 ring-[#090D16]">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Student Profile & Switch */}
          <button
            onClick={onOpenAuthModal}
            className="flex items-center gap-2 pl-2.5 pr-3 py-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 text-left transition-colors"
            title="Click to switch student profile or edit Reg No / Section / Year"
          >
            <div className="w-6 h-6 rounded-md bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 flex items-center justify-center text-xs font-bold font-mono">
              {student.name.charAt(0)}
            </div>
            <div className="hidden lg:flex flex-col text-xs leading-tight">
              <span className="font-semibold text-slate-200 truncate max-w-[110px]">{student.name}</span>
              <span className="font-mono text-[11px] text-slate-400">
                {student.regNo} · {student.section}
              </span>
            </div>
            <User className="w-3.5 h-3.5 text-slate-400 hidden sm:block ml-0.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
