import React, { useState } from 'react';
import { Subject, TimetableSlot, AttendanceRecord, AttendanceStatus, DayOfWeek } from '../types';
import { DAYS_OF_WEEK } from '../utils/timetablePresets';
import { Clock, MapPin, User, Check, X, Award, Ban, CheckCheck, Calendar } from 'lucide-react';

interface DailyLecturesCardProps {
  slots: TimetableSlot[];
  subjects: Subject[];
  records: AttendanceRecord[];
  onMarkAttendance: (subjectId: string, status: AttendanceStatus, slotId?: string) => void;
  onMarkAllPresent: (daySlots: TimetableSlot[]) => void;
}

export const DailyLecturesCard: React.FC<DailyLecturesCardProps> = ({
  slots,
  subjects,
  records,
  onMarkAttendance,
  onMarkAllPresent,
}) => {
  // Determine today's day of week
  const todayIndex = new Date().getDay(); // 0 is Sunday
  const defaultDay: DayOfWeek =
    todayIndex === 0
      ? 'Monday'
      : (DAYS_OF_WEEK[Math.min(todayIndex - 1, DAYS_OF_WEEK.length - 1)] as DayOfWeek);

  const [selectedDay, setSelectedDay] = useState<DayOfWeek>(defaultDay);

  const todayDateStr = new Date().toISOString().split('T')[0];

  // Filter slots for selected day, sorted by start time
  const daySlots = slots
    .filter(s => s.day === selectedDay)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  // Get status for a slot
  const getSlotStatus = (slot: TimetableSlot): AttendanceStatus | undefined => {
    const record = records.find(
      r => r.slotId === slot.id || (r.date === todayDateStr && r.subjectId === slot.subjectId)
    );
    return record?.status;
  };

  return (
    <div className="w-full bg-[#0F172A]/90 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl backdrop-blur-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-cyan-600/20 border border-cyan-500/30 text-cyan-400 flex items-center justify-center">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <span>Daily Lecture Attendance Punch-In</span>
            </h2>
            <p className="text-xs text-slate-400 flex items-center gap-2">
              <span>Log lecture presence or claim approved On-Duty (OD)</span>
              <span>·</span>
              <span className="font-mono text-cyan-300">{todayDateStr}</span>
            </p>
          </div>
        </div>

        {/* Action button: Mark all present today */}
        {daySlots.length > 0 && (
          <button
            onClick={() => onMarkAllPresent(daySlots)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-950/70 hover:bg-emerald-900/80 border border-emerald-700/80 text-emerald-300 text-xs font-semibold transition-all self-start sm:self-auto"
            title="Mark all lectures for this day as Present"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>Mark All Present Today</span>
          </button>
        )}
      </div>

      {/* Day Selector Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto py-3 no-scrollbar">
        {DAYS_OF_WEEK.map(day => {
          const isSelected = selectedDay === day;
          const isRealToday = day === defaultDay;
          const daySlotsCount = slots.filter(s => s.day === day).length;

          return (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-semibold'
                  : 'bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <span>{day}</span>
              {isRealToday && (
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" title="Today" />
              )}
              <span className={`text-[10px] font-mono px-1 py-0.2 rounded ${
                isSelected ? 'bg-indigo-700/70 text-indigo-100' : 'bg-slate-800 text-slate-400'
              }`}>
                {daySlotsCount}
              </span>
            </button>
          );
        })}
      </div>

      {/* Day Slots List */}
      <div className="space-y-3 mt-2">
        {daySlots.length === 0 ? (
          <div className="p-8 text-center rounded-xl bg-slate-900/40 border border-dashed border-slate-800 text-slate-400">
            <Calendar className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-300">No lectures scheduled for {selectedDay}</p>
            <p className="text-xs text-slate-500 mt-1">Enjoy your study break or upload a custom timetable below.</p>
          </div>
        ) : (
          daySlots.map(slot => {
            const subject = subjects.find(s => s.id === slot.subjectId);
            const status = getSlotStatus(slot);

            return (
              <div
                key={slot.id}
                className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700/80 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Slot Details */}
                <div className="flex items-start gap-3.5">
                  <div className="flex flex-col items-center justify-center min-w-[70px] px-2 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-slate-200">
                    <span className="text-xs font-bold font-mono text-cyan-300">
                      {slot.startTime}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {slot.endTime}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-white bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                        {subject?.code || 'SUB'}
                      </span>
                      <h3 className="text-sm font-bold text-slate-100">
                        {subject?.name || 'Class Lecture'}
                      </h3>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                        slot.type === 'Lab'
                          ? 'bg-amber-950/70 text-amber-300 border border-amber-800/60'
                          : slot.type === 'Tutorial'
                          ? 'bg-purple-950/70 text-purple-300 border border-purple-800/60'
                          : 'bg-indigo-950/70 text-indigo-300 border border-indigo-800/60'
                      }`}>
                        {slot.type}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-500" />
                        <span>{slot.room}</span>
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3 text-slate-500" />
                        <span>{subject?.faculty || 'Faculty In-Charge'}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status Punch Buttons */}
                <div className="flex items-center gap-1.5 self-end md:self-center">
                  {/* Present */}
                  <button
                    onClick={() => onMarkAttendance(slot.subjectId, 'present', slot.id)}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      status === 'present'
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/40'
                        : 'bg-slate-800 hover:bg-emerald-950/60 text-slate-300 hover:text-emerald-300 border border-slate-700 hover:border-emerald-600/60'
                    }`}
                    title="Mark Present"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Present</span>
                  </button>

                  {/* Absent */}
                  <button
                    onClick={() => onMarkAttendance(slot.subjectId, 'absent', slot.id)}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      status === 'absent'
                        ? 'bg-rose-600 text-white shadow-md shadow-rose-600/40'
                        : 'bg-slate-800 hover:bg-rose-950/60 text-slate-300 hover:text-rose-300 border border-slate-700 hover:border-rose-600/60'
                    }`}
                    title="Mark Absent"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Absent</span>
                  </button>

                  {/* On-Duty (OD) */}
                  <button
                    onClick={() => onMarkAttendance(slot.subjectId, 'on_duty', slot.id)}
                    className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      status === 'on_duty'
                        ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/40'
                        : 'bg-slate-800 hover:bg-cyan-950/60 text-slate-300 hover:text-cyan-300 border border-slate-700 hover:border-cyan-600/60'
                    }`}
                    title="Mark Approved On-Duty (College representation/Symposium)"
                  >
                    <Award className="w-3.5 h-3.5" />
                    <span>OD</span>
                  </button>

                  {/* Cancelled */}
                  <button
                    onClick={() => onMarkAttendance(slot.subjectId, 'cancelled', slot.id)}
                    className={`p-1.5 rounded-lg text-xs transition-all ${
                      status === 'cancelled'
                        ? 'bg-slate-700 text-slate-200'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700'
                    }`}
                    title="Class Cancelled / Teacher On Leave"
                  >
                    <Ban className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
