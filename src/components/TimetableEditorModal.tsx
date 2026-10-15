import React, { useState } from 'react';
import { Subject, TimetableSlot, DayOfWeek } from '../types';
import { DAYS_OF_WEEK, PRESET_CSE_SUBJECTS, PRESET_CSE_TIMETABLE } from '../utils/timetablePresets';
import { calculateSubjectBunk } from '../utils/attendanceCalculations';
import { playChimeSound } from '../utils/notifications';
import {
  Calendar,
  Sliders,
  Plus,
  Trash2,
  CheckCircle2,
  Sparkles,
  X,
  Clock,
  MapPin,
  Save,
  RotateCcw,
  Palette,
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react';

interface TimetableEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  subjects: Subject[];
  slots: TimetableSlot[];
  onSaveData: (updatedSubjects: Subject[], updatedSlots: TimetableSlot[]) => void;
}

export const TimetableEditorModal: React.FC<TimetableEditorModalProps> = ({
  isOpen,
  onClose,
  subjects,
  slots,
  onSaveData,
}) => {
  const [activeTab, setActiveTab] = useState<'attendance' | 'timetable'>('attendance');

  // Editable subjects state (for updating present attendance)
  const [editingSubjects, setEditingSubjects] = useState<Subject[]>(() => [...subjects]);

  // Editable timetable slots state (for posting/customizing timetable)
  const [editingSlots, setEditingSlots] = useState<TimetableSlot[]>(() => [...slots]);

  // Selected Day for slot editor
  const [activeDay, setActiveDay] = useState<DayOfWeek>('Monday');

  // New slot form
  const [newSlotSubjectId, setNewSlotSubjectId] = useState(subjects[0]?.id || '');
  const [newSlotStart, setNewSlotStart] = useState('08:15');
  const [newSlotEnd, setNewSlotEnd] = useState('09:05');
  const [newSlotRoom, setNewSlotRoom] = useState('N-311');
  const [newSlotType, setNewSlotType] = useState<'Lecture' | 'Lab' | 'Tutorial'>('Lecture');

  // New subject form
  const [newSubCode, setNewSubCode] = useState('');
  const [newSubName, setNewSubName] = useState('');
  const [newSubFaculty, setNewSubFaculty] = useState('');
  const [newSubColor, setNewSubColor] = useState('#ec4899');

  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  // Handle Attendance changes
  const handleUpdateConducted = (subjectId: string, val: number) => {
    setEditingSubjects(prev =>
      prev.map(s => {
        if (s.id !== subjectId) return s;
        const total = Math.max(0, val);
        const attended = Math.min(s.attended, total);
        return { ...s, totalConducted: total, attended };
      })
    );
  };

  const handleUpdateAttended = (subjectId: string, val: number) => {
    setEditingSubjects(prev =>
      prev.map(s => {
        if (s.id !== subjectId) return s;
        const total = Math.max(s.totalConducted, val);
        const attended = Math.max(0, val);
        return { ...s, totalConducted: total, attended, absent: Math.max(0, total - attended - s.onDuty) };
      })
    );
  };

  const handleUpdateOnDuty = (subjectId: string, val: number) => {
    setEditingSubjects(prev =>
      prev.map(s => {
        if (s.id !== subjectId) return s;
        const onDuty = Math.max(0, val);
        return { ...s, onDuty };
      })
    );
  };

  // Add Slot
  const handleAddSlot = (e: React.FormEvent) => {
    e.preventDefault();
    const newSlot: TimetableSlot = {
      id: `slot_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      day: activeDay,
      startTime: newSlotStart,
      endTime: newSlotEnd,
      subjectId: newSlotSubjectId || editingSubjects[0]?.id || 'sub_default',
      room: newSlotRoom.trim() || 'N-311',
      type: newSlotType,
    };

    setEditingSlots(prev => [...prev, newSlot]);
    playChimeSound();
  };

  // Delete Slot
  const handleDeleteSlot = (slotId: string) => {
    setEditingSlots(prev => prev.filter(s => s.id !== slotId));
  };

  // Add new subject
  const handleAddNewSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubCode.trim() || !newSubName.trim()) return;

    const newSub: Subject = {
      id: `sub_${newSubCode.toLowerCase().replace(/[^a-z0-9]/g, '')}_${Date.now()}`,
      code: newSubCode.trim().toUpperCase(),
      name: newSubName.trim(),
      faculty: newSubFaculty.trim() || 'Faculty In-Charge',
      credits: 4,
      color: newSubColor,
      totalConducted: 20,
      attended: 16,
      absent: 4,
      onDuty: 0,
      minRequiredPercent: 75,
    };

    setEditingSubjects(prev => [...prev, newSub]);
    setNewSlotSubjectId(newSub.id);
    setNewSubCode('');
    setNewSubName('');
    setNewSubFaculty('');
    playChimeSound();
  };

  // Reset to Section-6 Default Timetable
  const handleResetToSection6 = () => {
    if (window.confirm('Reset timetable and subjects to Section-6 (N-311) official curriculum?')) {
      setEditingSubjects([...PRESET_CSE_SUBJECTS]);
      setEditingSlots([...PRESET_CSE_TIMETABLE]);
      playChimeSound();
    }
  };

  // Save All
  const handleSaveAll = () => {
    onSaveData(editingSubjects, editingSlots);
    setSavedSuccess(true);
    playChimeSound();
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-3xl bg-[#130f26] border border-purple-500/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 px-6 border-b border-purple-500/20 bg-[#1c1636] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-pink-500/30">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight">
                  Update Present Attendance &amp; Post Timetable
                </h3>
                <span className="text-[10px] font-mono text-pink-300 bg-pink-950/80 px-2 py-0.5 rounded-full border border-pink-700/60">
                  75% Calculator
                </span>
              </div>
              <p className="text-xs text-purple-300/80">
                Update attended classes or post and customize your weekly schedule
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-purple-400 hover:text-white rounded-xl hover:bg-purple-900/40 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-purple-500/20 bg-[#16112e] px-6 pt-3 gap-6">
          <button
            onClick={() => setActiveTab('attendance')}
            className={`pb-3 text-xs font-semibold tracking-wide transition-colors flex items-center gap-2 ${
              activeTab === 'attendance'
                ? 'text-pink-400 border-b-2 border-pink-500 font-bold'
                : 'text-purple-300/70 hover:text-white'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Update Present Attendance</span>
          </button>

          <button
            onClick={() => setActiveTab('timetable')}
            className={`pb-3 text-xs font-semibold tracking-wide transition-colors flex items-center gap-2 ${
              activeTab === 'timetable'
                ? 'text-pink-400 border-b-2 border-pink-500 font-bold'
                : 'text-purple-300/70 hover:text-white'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Post &amp; Edit Timetable Slots ({editingSlots.length})</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* ================= TAB 1: UPDATE PRESENT ATTENDANCE ================= */}
          {activeTab === 'attendance' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-purple-950/40 border border-purple-800/40 flex items-center justify-between text-xs text-purple-200">
                <span>
                  Update your current conducted &amp; attended lectures. Bunk buffers and borderline warnings update in real time!
                </span>
                <span className="font-mono text-pink-300 font-bold">Cutoff: 75.0%</span>
              </div>

              <div className="space-y-3">
                {editingSubjects.map(sub => {
                  const calc = calculateSubjectBunk(sub);
                  const isEligible = calc.isEligible;
                  const isBorderline = calc.isBorderline;

                  return (
                    <div
                      key={sub.id}
                      className={`p-4 rounded-2xl border transition-all ${
                        !isEligible
                          ? 'bg-rose-950/40 border-rose-600/50'
                          : isBorderline
                          ? 'bg-amber-950/40 border-amber-600/50'
                          : 'bg-[#1b1535]/80 border-purple-500/20'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-purple-500/20">
                        <div className="flex items-center gap-2.5">
                          <span
                            className="w-3 h-3 rounded-full shrink-0"
                            style={{ backgroundColor: sub.color }}
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-bold text-white bg-black/40 px-2 py-0.5 rounded border border-white/10">
                                {sub.code}
                              </span>
                              <h4 className="text-xs font-bold text-white">{sub.name}</h4>
                            </div>
                            <span className="text-[11px] text-purple-300">{sub.faculty}</span>
                          </div>
                        </div>

                        {/* Calculated Percentage & Verdict */}
                        <div className="flex items-center gap-3 self-end sm:self-center">
                          <div className="text-right">
                            <span
                              className={`text-xl font-black font-mono tabular-nums ${
                                calc.percentage >= 80
                                  ? 'text-emerald-400'
                                  : calc.percentage >= 75
                                  ? 'text-amber-400'
                                  : 'text-rose-400'
                              }`}
                            >
                              {calc.percentage.toFixed(1)}%
                            </span>
                            <span className="text-[10px] text-purple-400 block font-mono">
                              {sub.attended + sub.onDuty} / {sub.totalConducted} classes
                            </span>
                          </div>

                          <div className="shrink-0">
                            {!isEligible ? (
                              <span className="flex items-center gap-1 text-[11px] font-bold text-rose-300 bg-rose-950 px-2 py-1 rounded-lg border border-rose-700">
                                <ShieldAlert className="w-3 h-3 text-rose-400" />
                                <span>Shortage!</span>
                              </span>
                            ) : isBorderline ? (
                              <span className="flex items-center gap-1 text-[11px] font-bold text-amber-300 bg-amber-950 px-2 py-1 rounded-lg border border-amber-700">
                                <AlertTriangle className="w-3 h-3 text-amber-400" />
                                <span>Borderline!</span>
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-300 bg-emerald-950 px-2 py-1 rounded-lg border border-emerald-700">
                                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                                <span>Safe</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Interactive Controls (Conducted, Attended, On-Duty) */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3">
                        {/* Total Conducted */}
                        <div className="p-2.5 rounded-xl bg-black/20 border border-purple-500/10">
                          <span className="text-[10px] font-semibold text-purple-300 block mb-1">
                            Total Conducted Classes
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleUpdateConducted(sub.id, sub.totalConducted - 1)}
                              className="w-7 h-7 rounded-lg bg-purple-900/40 hover:bg-purple-800 text-white font-bold text-sm"
                            >
                              -
                            </button>
                            <input
                              type="number"
                              min="0"
                              value={sub.totalConducted}
                              onChange={e => handleUpdateConducted(sub.id, Number(e.target.value))}
                              className="w-full text-center py-1 bg-[#120e24] border border-purple-500/30 rounded-lg text-white font-mono text-xs font-bold"
                            />
                            <button
                              type="button"
                              onClick={() => handleUpdateConducted(sub.id, sub.totalConducted + 1)}
                              className="w-7 h-7 rounded-lg bg-purple-900/40 hover:bg-purple-800 text-white font-bold text-sm"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        {/* Attended */}
                        <div className="p-2.5 rounded-xl bg-black/20 border border-purple-500/10">
                          <span className="text-[10px] font-semibold text-emerald-300 block mb-1">
                            Classes Attended
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleUpdateAttended(sub.id, sub.attended - 1)}
                              className="w-7 h-7 rounded-lg bg-emerald-950/60 hover:bg-emerald-900 text-emerald-300 font-bold text-sm"
                            >
                              -
                            </button>
                            <input
                              type="number"
                              min="0"
                              value={sub.attended}
                              onChange={e => handleUpdateAttended(sub.id, Number(e.target.value))}
                              className="w-full text-center py-1 bg-[#120e24] border border-emerald-500/30 rounded-lg text-emerald-300 font-mono text-xs font-bold"
                            />
                            <button
                              type="button"
                              onClick={() => handleUpdateAttended(sub.id, sub.attended + 1)}
                              className="w-7 h-7 rounded-lg bg-emerald-950/60 hover:bg-emerald-900 text-emerald-300 font-bold text-sm"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        {/* Approved On-Duty */}
                        <div className="p-2.5 rounded-xl bg-black/20 border border-purple-500/10">
                          <span className="text-[10px] font-semibold text-cyan-300 block mb-1">
                            Approved On-Duty (OD)
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleUpdateOnDuty(sub.id, sub.onDuty - 1)}
                              className="w-7 h-7 rounded-lg bg-cyan-950/60 hover:bg-cyan-900 text-cyan-300 font-bold text-sm"
                            >
                              -
                            </button>
                            <input
                              type="number"
                              min="0"
                              value={sub.onDuty}
                              onChange={e => handleUpdateOnDuty(sub.id, Number(e.target.value))}
                              className="w-full text-center py-1 bg-[#120e24] border border-cyan-500/30 rounded-lg text-cyan-300 font-mono text-xs font-bold"
                            />
                            <button
                              type="button"
                              onClick={() => handleUpdateOnDuty(sub.id, sub.onDuty + 1)}
                              className="w-7 h-7 rounded-lg bg-cyan-950/60 hover:bg-cyan-900 text-cyan-300 font-bold text-sm"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Bunk Calculation & Warning Text */}
                      <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between text-xs">
                        {isEligible ? (
                          <span className="text-purple-300">
                            Safe Bunk Buffer:{' '}
                            <strong className="text-white font-mono">{calc.safeBunkCount}</strong>{' '}
                            class{calc.safeBunkCount !== 1 ? 'es' : ''} can be skipped safely.
                          </span>
                        ) : (
                          <span className="text-rose-300">
                            Mandatory Catch-up:{' '}
                            <strong className="text-white font-mono">{calc.catchUpCount}</strong>{' '}
                            consecutive classes needed to reach 75%.
                          </span>
                        )}

                        {isBorderline && (
                          <span className="text-[11px] font-bold text-amber-400">
                            {calc.borderlineWarningMessage}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ================= TAB 2: POST & EDIT TIMETABLE ================= */}
          {activeTab === 'timetable' && (
            <div className="space-y-5">
              {/* Day Selector */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                {DAYS_OF_WEEK.map(day => {
                  const count = editingSlots.filter(s => s.day === day).length;
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => setActiveDay(day)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                        activeDay === day
                          ? 'bg-pink-600 text-white shadow-md shadow-pink-600/30'
                          : 'bg-[#1b1535] text-purple-300 hover:text-white border border-purple-500/20'
                      }`}
                    >
                      <span>{day}</span>
                      <span className="text-[10px] font-mono opacity-80">({count})</span>
                    </button>
                  );
                })}
              </div>

              {/* Add Slot Form */}
              <form onSubmit={handleAddSlot} className="p-4 rounded-2xl bg-[#1b1535]/80 border border-purple-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Plus className="w-4 h-4 text-pink-400" />
                    <span>Post New Slot for {activeDay}</span>
                  </span>
                  <span className="text-[10px] font-mono text-purple-400">Section-6 Schedule</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-medium text-purple-300 mb-1">Subject</label>
                    <select
                      value={newSlotSubjectId}
                      onChange={e => setNewSlotSubjectId(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-[#120e24] border border-purple-500/30 rounded-lg text-white text-xs"
                    >
                      {editingSubjects.map(s => (
                        <option key={s.id} value={s.id}>
                          {s.code} - {s.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-purple-300 mb-1">Timing</label>
                    <div className="flex items-center gap-1">
                      <input
                        type="time"
                        value={newSlotStart}
                        onChange={e => setNewSlotStart(e.target.value)}
                        className="w-full px-1.5 py-1 bg-[#120e24] border border-purple-500/30 rounded-lg text-white text-[11px] font-mono"
                      />
                      <span className="text-purple-400">-</span>
                      <input
                        type="time"
                        value={newSlotEnd}
                        onChange={e => setNewSlotEnd(e.target.value)}
                        className="w-full px-1.5 py-1 bg-[#120e24] border border-purple-500/30 rounded-lg text-white text-[11px] font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-purple-300 mb-1">Room &amp; Type</label>
                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        placeholder="N-311"
                        value={newSlotRoom}
                        onChange={e => setNewSlotRoom(e.target.value)}
                        className="w-1/2 px-2 py-1 bg-[#120e24] border border-purple-500/30 rounded-lg text-white text-[11px]"
                      />
                      <select
                        value={newSlotType}
                        onChange={e => setNewSlotType(e.target.value as any)}
                        className="w-1/2 px-1 py-1 bg-[#120e24] border border-purple-500/30 rounded-lg text-white text-[11px]"
                      >
                        <option value="Lecture">Lecture</option>
                        <option value="Lab">Lab</option>
                        <option value="Tutorial">Tutorial</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 rounded-lg bg-pink-600 hover:bg-pink-500 text-white text-xs font-bold transition-colors flex items-center gap-1 shadow-md shadow-pink-600/30"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add to {activeDay}</span>
                  </button>
                </div>
              </form>

              {/* Slots List for Active Day */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-white flex items-center justify-between">
                  <span>Scheduled Slots on {activeDay}:</span>
                  <span className="font-mono text-purple-400">
                    {editingSlots.filter(s => s.day === activeDay).length} classes
                  </span>
                </h4>

                <div className="space-y-1.5">
                  {editingSlots
                    .filter(s => s.day === activeDay)
                    .map(slot => {
                      const sub = editingSubjects.find(s => s.id === slot.subjectId);
                      return (
                        <div
                          key={slot.id}
                          className="p-3 rounded-xl bg-[#1b1535] border border-purple-500/20 flex items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-xs font-bold text-cyan-300 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                              {slot.startTime} – {slot.endTime}
                            </span>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-xs font-bold text-white">
                                  {sub?.code || 'SUB'}
                                </span>
                                <span className="text-xs text-purple-200">{sub?.name}</span>
                              </div>
                              <span className="text-[11px] text-purple-400">
                                Room: {slot.room} · {slot.type} · Faculty: {sub?.faculty}
                              </span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleDeleteSlot(slot.id)}
                            className="p-1.5 text-purple-400 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition-colors"
                            title="Delete this slot"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Add New Subject / Course Creator */}
              <form onSubmit={handleAddNewSubject} className="p-4 rounded-2xl bg-[#181329] border border-dashed border-purple-500/30 space-y-3">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Palette className="w-4 h-4 text-purple-400" />
                  <span>Add New Course / Subject to Timetable</span>
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                  <div>
                    <input
                      type="text"
                      placeholder="Code (e.g. CS-25CS206)"
                      value={newSubCode}
                      onChange={e => setNewSubCode(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-[#120e24] border border-purple-500/30 rounded-lg text-white text-xs font-mono"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <input
                      type="text"
                      placeholder="Course Name (e.g. Cloud Computing)"
                      value={newSubName}
                      onChange={e => setNewSubName(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-[#120e24] border border-purple-500/30 rounded-lg text-white text-xs"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={newSubColor}
                      onChange={e => setNewSubColor(e.target.value)}
                      className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                      title="Select course accent color"
                    />
                    <button
                      type="submit"
                      className="flex-1 py-1.5 px-3 rounded-lg bg-purple-700 hover:bg-purple-600 text-white font-bold text-xs"
                    >
                      + Add Course
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 px-6 border-t border-purple-500/20 bg-[#1c1636] flex items-center justify-between">
          <button
            type="button"
            onClick={handleResetToSection6}
            className="flex items-center gap-1.5 text-xs text-purple-400 hover:text-white transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Section-6 Official Timetable</span>
          </button>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-purple-300 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveAll}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-pink-500/25 flex items-center gap-1.5 transition-all"
            >
              {savedSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  <span>Saved!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Changes to Database</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
