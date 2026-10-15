import React, { useState, useEffect } from 'react';
import { Student, PushNotificationItem } from '../types';
import { AppTheme } from '../utils/authDatabase';
import { THEMES } from '../utils/theme';
import { subscribeNotifications } from '../utils/notifications';
import {
  Bell,
  ShieldAlert,
  Cpu,
  User,
  Sparkles,
  Phone,
  Calendar,
  AlertTriangle,
  Palette,
  Users,
  FileDown,
  Database,
} from 'lucide-react';

interface NavbarProps {
  student: Student;
  currentTheme: AppTheme;
  onThemeChange: (theme: AppTheme) => void;
  onOpenAuthModal: () => void;
  onOpenPhoneAuth: () => void;
  onOpenTimetableEditor: () => void;
  onOpenFaculty: () => void;
  onOpenNotifications: () => void;
  onOpenJavaConsole: () => void;
  onOpenExportReport: () => void;
  onOpenDatabase?: () => void;
  shortageCount: number;
  borderlineCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  student,
  currentTheme,
  onThemeChange,
  onOpenAuthModal,
  onOpenPhoneAuth,
  onOpenTimetableEditor,
  onOpenFaculty,
  onOpenNotifications,
  onOpenJavaConsole,
  onOpenExportReport,
  onOpenDatabase,
  shortageCount,
  borderlineCount,
}) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [showThemeMenu, setShowThemeMenu] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeNotifications((items: PushNotificationItem[]) => {
      setUnreadCount(items.filter(i => !i.read).length);
    });
    return unsubscribe;
  }, []);

  const activeThemeConfig = THEMES[currentTheme] || THEMES.kawaii_pastel;

  return (
    <header className="sticky top-0 z-40 bg-[#090D16]/95 backdrop-blur-md border-b border-purple-900/30 px-3 sm:px-6 lg:px-8 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Brand Zone */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-pink-500 via-purple-500 to-indigo-500 p-[1.5px] flex items-center justify-center shadow-lg shadow-pink-500/25">
            <div className="w-full h-full bg-[#0E0B1A] rounded-[14px] flex items-center justify-center">
              <span className="text-base select-none">{activeThemeConfig.cuteIcon}</span>
            </div>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-sm sm:text-base font-extrabold text-white tracking-tight">
                AttendX B.Tech
              </span>
              <span className="text-[10px] font-mono font-bold text-pink-300 bg-pink-950/80 border border-pink-700/60 px-1.5 py-0.5 rounded-full">
                75% Cutoff Engine
              </span>
            </div>
            <div className="hidden xs:flex items-center gap-1.5 text-[11px] text-purple-300/80">
              <span>Bunk Intelligence &amp; Borderline Warnings</span>
            </div>
          </div>
        </div>

        {/* Action Controls & Navigation */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* Post Timetable & Attendance Button */}
          <button
            onClick={onOpenTimetableEditor}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-bold rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white shadow-md shadow-pink-500/25 transition-all"
            title="Post or edit timetable and update present attendance"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Post Timetable &amp; Attendance</span>
            <span className="md:hidden">Timetable</span>
          </button>

          {/* Borderline Indicator */}
          {borderlineCount > 0 && shortageCount === 0 && (
            <div
              onClick={onOpenNotifications}
              className="hidden lg:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-950/80 border border-amber-600 text-amber-200 text-xs font-semibold cursor-pointer animate-pulse"
              title="Subjects on the 75% border line"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>{borderlineCount} On Border</span>
            </div>
          )}

          {/* Shortage Debarment Indicator */}
          {shortageCount > 0 && (
            <div
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-rose-950/90 border border-rose-600 text-rose-300 text-xs font-bold cursor-pointer hover:bg-rose-900 transition-colors animate-pulse"
              onClick={onOpenNotifications}
              title="Shortage of attendance under 75%"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              <span className="font-mono">{shortageCount}</span>
              <span className="hidden sm:inline">&lt; 75%</span>
            </div>
          )}

          {/* Faculty Directory Button */}
          <button
            onClick={onOpenFaculty}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-purple-200 border border-purple-800/40 transition-colors"
            title="View Section-6 Teaching Faculty Directory &amp; Contacts"
          >
            <Users className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden xl:inline">Faculty</span>
          </button>

          {/* Export Report (PDF / CSV) Button */}
          <button
            onClick={onOpenExportReport}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-xl bg-indigo-950/70 hover:bg-indigo-900/80 text-indigo-200 hover:text-white border border-indigo-700/50 shadow-sm transition-all"
            title="Export Attendance Report to PDF or CSV for offline viewing"
          >
            <FileDown className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden md:inline">Export</span>
            <span className="font-mono text-[9px] bg-indigo-500/30 text-indigo-300 px-1 py-0.5 rounded">PDF/CSV</span>
          </button>

          {/* Aesthetic Theme Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowThemeMenu(!showThemeMenu)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-purple-950/60 hover:bg-purple-900/60 text-purple-200 border border-purple-700/50 text-xs font-semibold transition-colors"
              title="Change Aesthetic &amp; Cute Vibes"
            >
              <span>{activeThemeConfig.cuteIcon}</span>
              <span className="hidden xl:inline">{activeThemeConfig.badge}</span>
              <Palette className="w-3 h-3 text-pink-400 ml-0.5" />
            </button>

            {showThemeMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-[#161028] border border-purple-500/40 rounded-2xl shadow-2xl p-2 z-50 animate-fadeIn">
                <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-purple-400">
                  Select Aesthetic Vibe
                </div>
                {Object.values(THEMES).map(t => (
                  <button
                    key={t.id}
                    onClick={() => {
                      onThemeChange(t.id);
                      setShowThemeMenu(false);
                    }}
                    className={`w-full flex items-center justify-between p-2 rounded-xl text-xs transition-colors ${
                      currentTheme === t.id
                        ? 'bg-pink-950/80 text-white font-bold border border-pink-500/60'
                        : 'text-purple-200 hover:bg-purple-900/40'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{t.cuteIcon}</span>
                      <span>{t.badge}</span>
                    </div>
                    {currentTheme === t.id && (
                      <span className="text-[10px] text-pink-400 font-mono font-bold">ACTIVE</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Database Explorer button */}
          {onOpenDatabase && (
            <button
              onClick={onOpenDatabase}
              className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-xl bg-cyan-950/70 hover:bg-cyan-900/80 text-cyan-200 border border-cyan-700/50 transition-colors shadow-sm"
              title="Inspect Persistent Database, Phone Number Records, and 4-Digit OTP Store"
            >
              <Database className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden xl:inline">Database</span>
              <span className="font-mono text-[9px] bg-cyan-500/30 text-cyan-300 px-1 py-0.5 rounded">
                Live DB
              </span>
            </button>
          )}

          {/* Java Backend Console button */}
          <button
            onClick={onOpenJavaConsole}
            className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 hover:border-indigo-500 transition-colors"
            title="Inspect Scalable Java Spring Boot REST API Architecture"
          >
            <Cpu className="w-3.5 h-3.5 text-indigo-400" />
            <span className="font-mono text-[10px] text-indigo-300 bg-indigo-950 px-1 py-0.5 rounded">
              Java API
            </span>
          </button>

          {/* Push Notifications Bell */}
          <button
            onClick={onOpenNotifications}
            className="relative p-2 text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 rounded-xl transition-colors"
            title="Lecture reminders and attendance alerts"
            aria-label="View notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-mono font-bold flex items-center justify-center ring-2 ring-[#090D16]">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Phone Sign-In / User Profile Button */}
          <button
            onClick={onOpenPhoneAuth}
            className="flex items-center gap-2 pl-2 sm:pl-2.5 pr-2.5 sm:pr-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-950/80 to-slate-900 hover:from-purple-900 hover:to-slate-800 border border-purple-500/40 text-left transition-all"
            title="Sign In with Phone Number &amp; 4-Digit OTP, or manage password"
          >
            <div className="w-6 h-6 rounded-lg bg-pink-600/30 border border-pink-500/50 text-pink-300 flex items-center justify-center text-xs font-bold font-mono">
              <Phone className="w-3 h-3 text-pink-400" />
            </div>
            <div className="hidden sm:flex flex-col text-xs leading-tight">
              <span className="font-semibold text-white truncate max-w-[100px]">
                {student.name || 'Sign In'}
              </span>
              <span className="font-mono text-[10px] text-pink-300">
                Phone &amp; OTP
              </span>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};
