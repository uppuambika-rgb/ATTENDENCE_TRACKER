import React, { useState, useEffect } from 'react';
import { Subject, TimetableSlot, AttendanceRecord, AttendanceStatus, Student } from './types';
import {
  UserAccount,
  getActiveSession,
  setActiveSession,
  syncCurrentUserData,
  AppTheme,
  DEFAULT_USER,
} from './utils/authDatabase';
import { THEMES } from './utils/theme';
import { calculateOverallAttendance } from './utils/attendanceCalculations';
import { dispatchPushNotification, playChimeSound } from './utils/notifications';
import { Navbar } from './components/Navbar';
import { WarningBanner } from './components/WarningBanner';
import { OverallMetricsCard } from './components/OverallMetricsCard';
import { DailyLecturesCard } from './components/DailyLecturesCard';
import { SubjectCardsGrid } from './components/SubjectCardsGrid';
import { AttendanceCharts } from './components/AttendanceCharts';
import { WeeklyTimetableSection } from './components/WeeklyTimetableSection';
import { PhoneAuthModal } from './components/PhoneAuthModal';
import { TimetableEditorModal } from './components/TimetableEditorModal';
import { FacultyDirectoryModal } from './components/FacultyDirectoryModal';
import { BunkSimulatorModal } from './components/BunkSimulatorModal';
import { PushNotificationDrawer } from './components/PushNotificationDrawer';
import { JavaBackendConsole } from './components/JavaBackendConsole';
import { CuteMascotCard } from './components/CuteMascotCard';
import { ExportReportModal } from './components/ExportReportModal';
import { DatabaseExplorerModal } from './components/DatabaseExplorerModal';
import {
  RotateCcw,
  Calendar,
  Phone,
  Sparkles,
  Sliders,
  Users,
  ShieldAlert,
  ShieldCheck,
  Award,
  FileDown,
} from 'lucide-react';

export default function App() {
  // Current Authenticated User Account (Stored in Database)
  const [currentUser, setCurrentUser] = useState<UserAccount>(() => {
    return getActiveSession() || DEFAULT_USER;
  });

  // Active theme (kawaii_pastel, cyber_obsidian, matcha_latte, neon_sunset)
  const [currentTheme, setCurrentTheme] = useState<AppTheme>(() => {
    return currentUser.theme || 'kawaii_pastel';
  });

  // Student details derived from currentUser
  const student: Student = {
    id: currentUser.phoneNumber,
    regNo: currentUser.regNo,
    name: currentUser.name,
    section: currentUser.section,
    year: currentUser.year,
    semester: currentUser.semester,
    branch: currentUser.branch,
    email: `${currentUser.phoneNumber}@student.btech.edu`,
  };

  // Subjects, Timetable & Attendance records for current user
  const [subjects, setSubjects] = useState<Subject[]>(() => currentUser.subjects || []);
  const [timetableSlots, setTimetableSlots] = useState<TimetableSlot[]>(() => currentUser.timetable || []);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(
    () => currentUser.attendanceRecords || []
  );

  // Modals
  const [isPhoneAuthOpen, setIsPhoneAuthOpen] = useState(false);
  const [isTimetableEditorOpen, setIsTimetableEditorOpen] = useState(false);
  const [isFacultyDirectoryOpen, setIsFacultyDirectoryOpen] = useState(false);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [simulatorSubjectId, setSimulatorSubjectId] = useState<string | undefined>(undefined);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isJavaConsoleOpen, setIsJavaConsoleOpen] = useState(false);
  const [isExportReportOpen, setIsExportReportOpen] = useState(false);
  const [isDatabaseExplorerOpen, setIsDatabaseExplorerOpen] = useState(false);

  // When active user changes, update local state
  useEffect(() => {
    setSubjects(currentUser.subjects || []);
    setTimetableSlots(currentUser.timetable || []);
    setAttendanceRecords(currentUser.attendanceRecords || []);
    if (currentUser.theme) {
      setCurrentTheme(currentUser.theme);
    }
  }, [currentUser.phoneNumber]);

  // Handle theme changes and persist to user profile
  const handleThemeChange = (newTheme: AppTheme) => {
    setCurrentTheme(newTheme);
    const updated = syncCurrentUserData(currentUser.phoneNumber, { theme: newTheme });
    setCurrentUser(updated);
    playChimeSound();
  };

  // Attendance & Bunk Calculations
  const summary = calculateOverallAttendance(subjects);
  const shortageSubjects = summary.subjectsBreakdown.filter(b => !b.isEligible);
  const borderlineSubjects = summary.subjectsBreakdown.filter(b => b.isBorderline && b.isEligible);

  // Handle marking daily lecture attendance (punch in)
  const handleMarkAttendance = (subjectId: string, status: AttendanceStatus, slotId?: string) => {
    const today = new Date().toISOString().split('T')[0];

    // Update records
    const newRecord: AttendanceRecord = {
      id: `rec_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      studentId: currentUser.phoneNumber,
      subjectId,
      date: today,
      status,
      slotId,
      timestamp: new Date().toISOString(),
    };

    // Update subjects
    const updatedSubjects = subjects.map(s => {
      if (s.id !== subjectId) return s;
      const isPresent = status === 'present';
      const isAbsent = status === 'absent';
      const isOnDuty = status === 'on_duty';

      return {
        ...s,
        totalConducted: s.totalConducted + 1,
        attended: s.attended + (isPresent ? 1 : 0),
        absent: s.absent + (isAbsent ? 1 : 0),
        onDuty: s.onDuty + (isOnDuty ? 1 : 0),
      };
    });

    const updatedRecords = [newRecord, ...attendanceRecords];

    setSubjects(updatedSubjects);
    setAttendanceRecords(updatedRecords);

    // Save to user database
    const updated = syncCurrentUserData(currentUser.phoneNumber, {
      subjects: updatedSubjects,
      attendanceRecords: updatedRecords,
    });
    setCurrentUser(updated);
    playChimeSound();
  };

  // Mark all classes today as present
  const handleMarkAllPresent = (daySlots: TimetableSlot[]) => {
    const today = new Date().toISOString().split('T')[0];
    let curSubjects = [...subjects];
    let curRecords = [...attendanceRecords];

    daySlots.forEach(slot => {
      const newRec: AttendanceRecord = {
        id: `rec_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        studentId: currentUser.phoneNumber,
        subjectId: slot.subjectId,
        date: today,
        status: 'present',
        slotId: slot.id,
        timestamp: new Date().toISOString(),
      };
      curRecords.unshift(newRec);

      curSubjects = curSubjects.map(s => {
        if (s.id !== slot.subjectId) return s;
        return {
          ...s,
          totalConducted: s.totalConducted + 1,
          attended: s.attended + 1,
        };
      });
    });

    setSubjects(curSubjects);
    setAttendanceRecords(curRecords);

    const updated = syncCurrentUserData(currentUser.phoneNumber, {
      subjects: curSubjects,
      attendanceRecords: curRecords,
    });
    setCurrentUser(updated);
    playChimeSound();

    dispatchPushNotification(
      '✅ All Classes Marked Present Today!',
      `Logged presence for ${daySlots.length} lectures on ${today}. Attendance percentages updated in database.`,
      'daily_reminder'
    );
  };

  // Quick stat update (+1 Attended or +1 Missed)
  const handleUpdateSubjectStats = (subjectId: string, deltaAttended: number, deltaTotal: number) => {
    const updated = subjects.map(s => {
      if (s.id !== subjectId) return s;
      const newTotal = Math.max(0, s.totalConducted + deltaTotal);
      const newAttended = Math.max(0, s.attended + deltaAttended);
      const newAbsent = Math.max(0, newTotal - newAttended - s.onDuty);
      return {
        ...s,
        totalConducted: newTotal,
        attended: newAttended,
        absent: newAbsent,
      };
    });

    setSubjects(updated);
    const updatedUser = syncCurrentUserData(currentUser.phoneNumber, { subjects: updated });
    setCurrentUser(updatedUser);
  };

  // Save changes from Timetable & Present Attendance Editor
  const handleSaveEditorData = (updatedSubjects: Subject[], updatedSlots: TimetableSlot[]) => {
    setSubjects(updatedSubjects);
    setTimetableSlots(updatedSlots);

    const updatedUser = syncCurrentUserData(currentUser.phoneNumber, {
      subjects: updatedSubjects,
      timetable: updatedSlots,
    });
    setCurrentUser(updatedUser);

    dispatchPushNotification(
      '✨ Timetable & Attendance Saved',
      'Your weekly schedule and present attendance counts have been securely saved to your database account!',
      'daily_reminder'
    );
  };

  // Save changes from WeeklyTimetable uploader
  const handleUpdateTimetable = (newSlots: TimetableSlot[], newSubjects?: Subject[]) => {
    setTimetableSlots(newSlots);
    let finalSubjects = subjects;

    if (newSubjects && newSubjects.length > 0) {
      const merged = [...subjects];
      newSubjects.forEach(ns => {
        if (!merged.find(s => s.id === ns.id || s.code === ns.code)) {
          merged.push(ns);
        }
      });
      finalSubjects = merged;
      setSubjects(merged);
    }

    const updatedUser = syncCurrentUserData(currentUser.phoneNumber, {
      timetable: newSlots,
      subjects: finalSubjects,
    });
    setCurrentUser(updatedUser);
  };

  // Reset to default Section-6 demo curriculum
  const handleResetData = () => {
    if (window.confirm('Reset this student profile back to Section-6 official curriculum & default attendance?')) {
      const updatedUser = syncCurrentUserData(currentUser.phoneNumber, {
        subjects: DEFAULT_USER.subjects,
        timetable: DEFAULT_USER.timetable,
        attendanceRecords: [],
      });
      setSubjects(DEFAULT_USER.subjects);
      setTimetableSlots(DEFAULT_USER.timetable);
      setAttendanceRecords([]);
      setCurrentUser(updatedUser);
      playChimeSound();
    }
  };

  const handleOpenSimulator = (subId?: string) => {
    setSimulatorSubjectId(subId || subjects[0]?.id);
    setIsSimulatorOpen(true);
  };

  const activeThemeConfig = THEMES[currentTheme] || THEMES.kawaii_pastel;

  return (
    <div className={`min-h-screen ${activeThemeConfig.bgClass} flex flex-col font-sans transition-colors duration-300 selection:bg-pink-500 selection:text-white`}>
      {/* Top Navigation */}
      <Navbar
        student={student}
        currentTheme={currentTheme}
        onThemeChange={handleThemeChange}
        onOpenAuthModal={() => setIsPhoneAuthOpen(true)}
        onOpenPhoneAuth={() => setIsPhoneAuthOpen(true)}
        onOpenTimetableEditor={() => setIsTimetableEditorOpen(true)}
        onOpenFaculty={() => setIsFacultyDirectoryOpen(true)}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenJavaConsole={() => setIsJavaConsoleOpen(true)}
        onOpenExportReport={() => setIsExportReportOpen(true)}
        onOpenDatabase={() => setIsDatabaseExplorerOpen(true)}
        shortageCount={shortageSubjects.length}
        borderlineCount={borderlineSubjects.length}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6 space-y-6">
        {/* Student Welcome & Status Strip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#130f24]/90 border border-purple-500/25 rounded-3xl p-4 sm:px-6 shadow-xl backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-pink-500 via-purple-500 to-indigo-500 p-[1.5px] flex items-center justify-center shrink-0 shadow-md shadow-pink-500/30">
              <div className="w-full h-full bg-[#16102b] rounded-[14px] flex items-center justify-center text-sm font-bold font-mono text-pink-300">
                {student.regNo.slice(-3) || '042'}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-1.5">
                  <span>Welcome back, {student.name}</span>
                  <span className="text-base select-none">{activeThemeConfig.cuteIcon}</span>
                </h1>
                <span className="text-[11px] font-mono font-semibold text-pink-300 bg-pink-950/80 border border-pink-700/60 px-2.5 py-0.5 rounded-full">
                  Year {student.year} · Sem {student.semester}
                </span>
                <span className="text-[11px] font-mono text-purple-200 bg-purple-950/60 border border-purple-800/60 px-2 py-0.5 rounded-md">
                  {student.section}
                </span>
              </div>
              <p className="text-xs text-purple-300/80 mt-0.5">
                {student.branch} · Phone:{' '}
                <span className="font-mono text-pink-300">+91 {currentUser.phoneNumber}</span> (Database Synced)
              </p>
            </div>
          </div>

          {/* Quick Action Controls */}
          <div className="flex items-center gap-2 self-end sm:self-center flex-wrap">
            <button
              onClick={() => setIsTimetableEditorOpen(true)}
              className="text-xs font-bold px-3 py-1.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white shadow-md shadow-pink-500/25 flex items-center gap-1.5 transition-all"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Post / Edit Attendance</span>
            </button>
            <button
              onClick={() => setIsExportReportOpen(true)}
              className="text-xs font-bold px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-500 hover:to-purple-600 text-white shadow-md shadow-indigo-600/25 flex items-center gap-1.5 transition-all"
              title="Download academic PDF or CSV attendance report"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>Export Report</span>
            </button>
            <button
              onClick={() => setIsPhoneAuthOpen(true)}
              className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-purple-950/60 hover:bg-purple-900/60 text-purple-200 hover:text-white border border-purple-700/50 transition-colors flex items-center gap-1"
            >
              <Phone className="w-3 h-3 text-pink-400" />
              <span>Switch Account</span>
            </button>
            <button
              onClick={handleResetData}
              className="text-xs font-semibold p-2 rounded-xl bg-purple-950/40 hover:bg-purple-900/40 text-purple-300 hover:text-white border border-purple-800/40 transition-colors"
              title="Reset to default Section-6 demo curriculum"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Cute Mascot Study Companion Card (Mochi's Attendance Wisdom & Aesthetic Theme Selector) */}
        <CuteMascotCard
          subjects={subjects}
          currentTheme={currentTheme}
          onThemeChange={handleThemeChange}
          onOpenTimetable={() => {
            const el = document.getElementById('weekly-timetable-anchor');
            el?.scrollIntoView({ behavior: 'smooth' });
          }}
          onOpenSimulator={() => handleOpenSimulator()}
        />

        {/* 75% Debarment & Borderline Warning Banner */}
        {(shortageSubjects.length > 0 || borderlineSubjects.length > 0) && (
          <WarningBanner
            shortageSubjects={shortageSubjects}
            borderlineSubjects={borderlineSubjects}
            onOpenSimulator={handleOpenSimulator}
            onOpenNotifications={() => setIsNotificationsOpen(true)}
            onOpenPostTimetable={() => setIsTimetableEditorOpen(true)}
          />
        )}

        {/* Overall Attendance Metrics & Circular Radial Meter */}
        <OverallMetricsCard
          summary={summary}
          onOpenSimulator={() => handleOpenSimulator()}
          onOpenTimetable={() => {
            const el = document.getElementById('weekly-timetable-anchor');
            el?.scrollIntoView({ behavior: 'smooth' });
          }}
          onOpenExportReport={() => setIsExportReportOpen(true)}
        />

        {/* Daily Lecture Attendance Punch-In Card */}
        <DailyLecturesCard
          slots={timetableSlots}
          subjects={subjects}
          records={attendanceRecords}
          onMarkAttendance={handleMarkAttendance}
          onMarkAllPresent={handleMarkAllPresent}
        />

        {/* Subject-Wise Cards Grid with 75% Cutoff, Safe Bunk Buffer & Borderline Alerts */}
        <SubjectCardsGrid
          subjects={subjects}
          onOpenSimulator={handleOpenSimulator}
          onUpdateSubjectStats={handleUpdateSubjectStats}
          onOpenEditor={() => setIsTimetableEditorOpen(true)}
        />

        {/* Real-Time Progress Tracker Graphs & Analytics */}
        <AttendanceCharts subjects={subjects} />

        {/* Weekly Academic Timetable Matrix & CSV/JSON Uploader */}
        <div id="weekly-timetable-anchor">
          <WeeklyTimetableSection
            slots={timetableSlots}
            subjects={subjects}
            onUpdateTimetable={handleUpdateTimetable}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-purple-900/30 bg-[#090714] py-6 px-4 text-center text-xs text-purple-300/70">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white">AttendX B.Tech</span>
            <span>·</span>
            <span>75% University Attendance &amp; Safe Bunk Calculator</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-purple-300/70">
            <button
              onClick={() => setIsJavaConsoleOpen(true)}
              className="hover:text-pink-400 transition-colors underline decoration-purple-800"
            >
              Java Spring Boot Backend Architecture &amp; REST Spec
            </button>
            <span>·</span>
            <button
              onClick={() => setIsFacultyDirectoryOpen(true)}
              className="hover:text-pink-400 transition-colors underline decoration-purple-800"
            >
              Section-6 Faculty Directory
            </button>
          </div>
        </div>
      </footer>

      {/* Modals & Drawers */}

      {/* 1. Phone Sign-In & 4-Digit OTP Authentication Modal (with Database Persistence) */}
      <PhoneAuthModal
        isOpen={isPhoneAuthOpen}
        onClose={() => setIsPhoneAuthOpen(false)}
        currentUser={currentUser}
        onUserAuthenticated={newUser => {
          setCurrentUser(newUser);
          setActiveSession(newUser);
          setSubjects(newUser.subjects);
          setTimetableSlots(newUser.timetable);
          setAttendanceRecords(newUser.attendanceRecords);
          if (newUser.theme) setCurrentTheme(newUser.theme);
        }}
      />

      {/* 2. Post Timetable & Present Attendance Editor Modal */}
      <TimetableEditorModal
        isOpen={isTimetableEditorOpen}
        onClose={() => setIsTimetableEditorOpen(false)}
        subjects={subjects}
        slots={timetableSlots}
        onSaveData={handleSaveEditorData}
      />

      {/* 3. Section-6 Faculty Directory Modal */}
      <FacultyDirectoryModal
        isOpen={isFacultyDirectoryOpen}
        onClose={() => setIsFacultyDirectoryOpen(false)}
        subjects={subjects}
      />

      {/* 4. 75% Bunk & Catch-up Simulator Modal */}
      <BunkSimulatorModal
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
        subjects={subjects}
        initialSubjectId={simulatorSubjectId}
      />

      {/* 5. Push Notifications Drawer */}
      <PushNotificationDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        slots={timetableSlots}
        subjects={subjects}
        onSelectSubject={subId => handleOpenSimulator(subId)}
      />

      {/* 6. Java Spring Boot Scalable Backend Console */}
      <JavaBackendConsole
        isOpen={isJavaConsoleOpen}
        onClose={() => setIsJavaConsoleOpen(false)}
        studentId={currentUser.phoneNumber}
      />

      {/* 7. Export Attendance Summary Report Modal (PDF & CSV) */}
      <ExportReportModal
        isOpen={isExportReportOpen}
        onClose={() => setIsExportReportOpen(false)}
        student={student}
        subjects={subjects}
        summary={summary}
        timetableSlots={timetableSlots}
        records={attendanceRecords}
      />

      {/* 8. Live Database Explorer Modal */}
      <DatabaseExplorerModal
        isOpen={isDatabaseExplorerOpen}
        onClose={() => setIsDatabaseExplorerOpen(false)}
        currentUserId={currentUser.phoneNumber}
        onUserSelected={(selectedUser) => {
          setCurrentUser(selectedUser);
          setActiveSession(selectedUser);
        }}
      />
    </div>
  );
}
