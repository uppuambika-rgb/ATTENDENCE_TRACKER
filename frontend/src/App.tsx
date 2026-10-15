import React, { useState, useEffect } from 'react';
import { Student, Subject, TimetableSlot, AttendanceRecord, AttendanceStatus } from './types';
import {
  getStoredCurrentStudent,
  getStoredSubjects,
  getStoredTimetable,
  getStoredAttendanceRecords,
  saveSubjects,
  saveTimetable,
  recordDailyAttendance,
  resetStudentData,
} from './utils/storage';
import { calculateOverallAttendance } from './utils/attendanceCalculations';
import { dispatchPushNotification } from './utils/notifications';
import { Navbar } from './components/Navbar';
import { WarningBanner } from './components/WarningBanner';
import { OverallMetricsCard } from './components/OverallMetricsCard';
import { DailyLecturesCard } from './components/DailyLecturesCard';
import { SubjectCardsGrid } from './components/SubjectCardsGrid';
import { AttendanceCharts } from './components/AttendanceCharts';
import { WeeklyTimetableSection } from './components/WeeklyTimetableSection';
import { StudentAuthModal } from './components/StudentAuthModal';
import { BunkSimulatorModal } from './components/BunkSimulatorModal';
import { PushNotificationDrawer } from './components/PushNotificationDrawer';
import { JavaBackendConsole } from './components/JavaBackendConsole';
import { RotateCcw, ShieldCheck, Sparkles } from 'lucide-react';

export default function App() {
  // Current Student State
  const [student, setStudent] = useState<Student>(() => {
    return getStoredCurrentStudent() || {
      id: 'std_22bce1042',
      regNo: '22BCE1042',
      name: 'Ambika Uppu',
      section: 'CSE-3A',
      year: 3,
      semester: 6,
      branch: 'Computer Science & Engineering',
      email: 'uppuambika@gmail.com',
    };
  });

  // Subjects & Timetable
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [timetableSlots, setTimetableSlots] = useState<TimetableSlot[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);

  // Modals
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [simulatorSubjectId, setSimulatorSubjectId] = useState<string | undefined>(undefined);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isJavaConsoleOpen, setIsJavaConsoleOpen] = useState(false);

  // Load student-specific data
  useEffect(() => {
    if (student) {
      setSubjects(getStoredSubjects(student.id));
      setTimetableSlots(getStoredTimetable(student.id));
      setAttendanceRecords(getStoredAttendanceRecords(student.id));
    }
  }, [student]);

  // Calculations
  const summary = calculateOverallAttendance(subjects);
  const shortageSubjects = summary.subjectsBreakdown.filter(b => !b.isEligible);

  // Handlers
  const handleMarkAttendance = (subjectId: string, status: AttendanceStatus, slotId?: string) => {
    const today = new Date().toISOString().split('T')[0];
    const { updatedSubjects, updatedRecords } = recordDailyAttendance(
      student.id,
      subjectId,
      today,
      status,
      slotId
    );
    setSubjects(updatedSubjects);
    setAttendanceRecords(updatedRecords);
  };

  const handleMarkAllPresent = (daySlots: TimetableSlot[]) => {
    const today = new Date().toISOString().split('T')[0];
    let curSubjects = [...subjects];
    let curRecords = [...attendanceRecords];

    daySlots.forEach(slot => {
      const { updatedSubjects, updatedRecords } = recordDailyAttendance(
        student.id,
        slot.subjectId,
        today,
        'present',
        slot.id
      );
      curSubjects = updatedSubjects;
      curRecords = updatedRecords;
    });

    setSubjects(curSubjects);
    setAttendanceRecords(curRecords);

    dispatchPushNotification(
      '✅ All Classes Marked Present Today!',
      `Logged presence for ${daySlots.length} lectures on ${today}. Attendance percentages updated.`,
      'daily_reminder'
    );
  };

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
    saveSubjects(student.id, updated);
  };

  const handleUpdateTimetable = (newSlots: TimetableSlot[], newSubjects?: Subject[]) => {
    setTimetableSlots(newSlots);
    saveTimetable(student.id, newSlots);
    if (newSubjects && newSubjects.length > 0) {
      // Merge unique subjects
      const merged = [...subjects];
      newSubjects.forEach(ns => {
        if (!merged.find(s => s.id === ns.id || s.code === ns.code)) {
          merged.push(ns);
        }
      });
      setSubjects(merged);
      saveSubjects(student.id, merged);
    }
  };

  const handleResetData = () => {
    if (window.confirm('Reset this student profile back to default semester curriculum data?')) {
      const { subjects: resSubjects, slots: resSlots } = resetStudentData(student.id);
      setSubjects(resSubjects);
      setTimetableSlots(resSlots);
      setAttendanceRecords([]);
    }
  };

  const handleOpenSimulator = (subId?: string) => {
    setSimulatorSubjectId(subId || subjects[0]?.id);
    setIsSimulatorOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#080C15] text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        student={student}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenJavaConsole={() => setIsJavaConsoleOpen(true)}
        shortageCount={shortageSubjects.length}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6 space-y-6">
        {/* Student Welcome & Status Strip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0D1424] border border-slate-800/80 rounded-2xl p-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-400 p-[1px] flex items-center justify-center shrink-0">
              <div className="w-full h-full bg-[#0D1424] rounded-[11px] flex items-center justify-center text-sm font-bold font-mono text-cyan-300">
                {student.regNo.slice(-3)}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-sm sm:text-base font-bold text-white tracking-tight">
                  Welcome back, {student.name}
                </h1>
                <span className="text-[11px] font-mono font-semibold text-indigo-400 bg-indigo-950/80 border border-indigo-800/80 px-2 py-0.5 rounded">
                  Year {student.year} · Sem {student.semester}
                </span>
                <span className="text-[11px] font-mono text-slate-400 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">
                  Sec {student.section}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {student.branch} · Reg No: <span className="font-mono text-cyan-300">{student.regNo}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
            >
              Switch Student
            </button>
            <button
              onClick={handleResetData}
              className="text-xs font-semibold p-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-700/60 text-slate-400 hover:text-slate-200 border border-slate-800 transition-colors"
              title="Reset to default semester demo data"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 75% Debarment Warning Banner (Rendered if any subject is < 75%) */}
        {shortageSubjects.length > 0 && (
          <WarningBanner
            shortageSubjects={shortageSubjects}
            onOpenSimulator={handleOpenSimulator}
            onOpenNotifications={() => setIsNotificationsOpen(true)}
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
        />

        {/* Daily Lecture Attendance Punch-In Card */}
        <DailyLecturesCard
          slots={timetableSlots}
          subjects={subjects}
          records={attendanceRecords}
          onMarkAttendance={handleMarkAttendance}
          onMarkAllPresent={handleMarkAllPresent}
        />

        {/* Subject-Wise Cards Grid with 75% Cutoff, Safe Bunk Buffer & Catch-Up */}
        <SubjectCardsGrid
          subjects={subjects}
          onOpenSimulator={handleOpenSimulator}
          onUpdateSubjectStats={handleUpdateSubjectStats}
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
      <footer className="border-t border-slate-800/80 bg-[#070A12] py-6 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-400">AttendX B.Tech</span>
            <span>·</span>
            <span>75% University Attendance Engine</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <button
              onClick={() => setIsJavaConsoleOpen(true)}
              className="hover:text-indigo-400 transition-colors underline decoration-slate-700"
            >
              Java Spring Boot Backend Architecture &amp; REST Spec
            </button>
            <span>·</span>
            <span>Built for B.Tech Academic Compliance</span>
          </div>
        </div>
      </footer>

      {/* Modals & Drawers */}
      <StudentAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentStudent={student}
        onStudentChanged={newStudent => setStudent(newStudent)}
      />

      <BunkSimulatorModal
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
        subjects={subjects}
        initialSubjectId={simulatorSubjectId}
      />

      <PushNotificationDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        slots={timetableSlots}
        subjects={subjects}
        onSelectSubject={subId => handleOpenSimulator(subId)}
      />

      <JavaBackendConsole
        isOpen={isJavaConsoleOpen}
        onClose={() => setIsJavaConsoleOpen(false)}
        studentId={student.id}
      />
    </div>
  );
}
