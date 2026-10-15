import React, { useState, useRef } from 'react';
import { Subject, TimetableSlot, DayOfWeek } from '../types';
import { DAYS_OF_WEEK, parseTimetableJson, parseTimetableCsv, getSampleTimetableCsv } from '../utils/timetablePresets';
import { Calendar, Upload, Download, Plus, Clock, MapPin, Trash2, CheckCircle2, FileText } from 'lucide-react';

interface WeeklyTimetableSectionProps {
  slots: TimetableSlot[];
  subjects: Subject[];
  onUpdateTimetable: (slots: TimetableSlot[], newSubjects?: Subject[]) => void;
}

export const WeeklyTimetableSection: React.FC<WeeklyTimetableSectionProps> = ({
  slots,
  subjects,
  onUpdateTimetable,
}) => {
  const [filterDay, setFilterDay] = useState<DayOfWeek | 'All'>('All');
  const [showAddSlotModal, setShowAddSlotModal] = useState(false);
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState('');
  const [uploadErrorMsg, setUploadErrorMsg] = useState('');

  // Add slot form state
  const [slotDay, setSlotDay] = useState<DayOfWeek>('Monday');
  const [slotStartTime, setSlotStartTime] = useState('09:00');
  const [slotEndTime, setSlotEndTime] = useState('10:00');
  const [slotSubjectId, setSlotSubjectId] = useState(subjects[0]?.id || '');
  const [slotRoom, setSlotRoom] = useState('LH-101');
  const [slotType, setSlotType] = useState<'Lecture' | 'Lab' | 'Tutorial'>('Lecture');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredSlots =
    filterDay === 'All'
      ? slots
      : slots.filter(s => s.day === filterDay);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadSuccessMsg('');
    setUploadErrorMsg('');

    const reader = new FileReader();
    reader.onload = event => {
      try {
        const content = event.target?.result as string;
        if (file.name.endsWith('.json')) {
          const { slots: parsedSlots, newSubjects } = parseTimetableJson(content);
          onUpdateTimetable(parsedSlots, newSubjects);
          setUploadSuccessMsg(`Successfully loaded ${parsedSlots.length} lecture slots from JSON!`);
        } else if (file.name.endsWith('.csv') || file.type.includes('csv')) {
          const { slots: parsedSlots, newSubjects } = parseTimetableCsv(content);
          onUpdateTimetable(parsedSlots, newSubjects);
          setUploadSuccessMsg(`Successfully loaded ${parsedSlots.length} lecture slots from CSV!`);
        } else {
          // Attempt JSON parse, then CSV
          try {
            const { slots: parsedSlots, newSubjects } = parseTimetableJson(content);
            onUpdateTimetable(parsedSlots, newSubjects);
            setUploadSuccessMsg(`Successfully imported ${parsedSlots.length} lecture slots!`);
          } catch {
            const { slots: parsedSlots, newSubjects } = parseTimetableCsv(content);
            onUpdateTimetable(parsedSlots, newSubjects);
            setUploadSuccessMsg(`Successfully imported ${parsedSlots.length} lecture slots!`);
          }
        }
      } catch (err: any) {
        setUploadErrorMsg(`Failed to parse timetable file: ${err.message || 'Invalid format'}`);
      }
    };
    reader.readAsText(file);
    // Reset input
    e.target.value = '';
  };

  const handleDownloadSampleCsv = () => {
    const csvContent = getSampleTimetableCsv();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'btech_weekly_timetable_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAddSlotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newSlot: TimetableSlot = {
      id: `slot_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      day: slotDay,
      startTime: slotStartTime,
      endTime: slotEndTime,
      subjectId: slotSubjectId || subjects[0]?.id || 'sub_default',
      room: slotRoom.trim() || 'LH-101',
      type: slotType,
    };

    onUpdateTimetable([...slots, newSlot]);
    setShowAddSlotModal(false);
  };

  const handleDeleteSlot = (id: string) => {
    onUpdateTimetable(slots.filter(s => s.id !== id));
  };

  return (
    <div className="w-full bg-[#0F172A]/90 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl backdrop-blur-sm space-y-5">
      {/* Top Header & Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <span>Weekly Academic Timetable</span>
              <span className="text-xs font-mono font-medium text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                Monday – Saturday
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Upload custom semester schedule (CSV/JSON), edit slots, or view full weekly matrix.
            </p>
          </div>
        </div>

        {/* Upload, Template & Add Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".json,.csv,text/csv,application/json"
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all"
            title="Upload CSV or JSON weekly timetable file"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Timetable</span>
          </button>

          <button
            onClick={handleDownloadSampleCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold transition-all"
            title="Download standard CSV format template to fill out and upload"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV Template</span>
          </button>

          <button
            onClick={() => setShowAddSlotModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Slot</span>
          </button>
        </div>
      </div>

      {/* Success / Error Messages */}
      {uploadSuccessMsg && (
        <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{uploadSuccessMsg}</span>
        </div>
      )}
      {uploadErrorMsg && (
        <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs">
          {uploadErrorMsg}
        </div>
      )}

      {/* Day Filters */}
      <div className="flex items-center gap-1.5 overflow-x-auto py-1 no-scrollbar">
        <button
          onClick={() => setFilterDay('All')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
            filterDay === 'All'
              ? 'bg-indigo-600 text-white font-semibold'
              : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          All Days ({slots.length} Slots)
        </button>
        {DAYS_OF_WEEK.map(day => {
          const count = slots.filter(s => s.day === day).length;
          return (
            <button
              key={day}
              onClick={() => setFilterDay(day)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                filterDay === day
                  ? 'bg-indigo-600 text-white font-semibold'
                  : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <span>{day}</span>
              <span className="font-mono text-[10px] text-slate-400">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Slots Display Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredSlots.length === 0 ? (
          <div className="col-span-full p-8 text-center rounded-xl bg-slate-900/40 border border-dashed border-slate-800 text-slate-400">
            <FileText className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-300">No lecture slots found for {filterDay}</p>
            <p className="text-xs text-slate-500 mt-1">
              Click &quot;Upload Timetable&quot; or &quot;Add Slot&quot; to populate your class schedule.
            </p>
          </div>
        ) : (
          filteredSlots.map(slot => {
            const subject = subjects.find(s => s.id === slot.subjectId);

            return (
              <div
                key={slot.id}
                className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700/80 transition-all flex items-start justify-between gap-3 group"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] font-bold text-cyan-300 bg-cyan-950/70 border border-cyan-800/60 px-1.5 py-0.2 rounded">
                      {slot.day}
                    </span>
                    <span className="font-mono text-[11px] text-slate-300 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      <span>{slot.startTime} – {slot.endTime}</span>
                    </span>
                  </div>

                  <h3 className="text-xs font-bold text-white line-clamp-1">
                    {subject ? `${subject.code}: ${subject.name}` : 'Lecture Slot'}
                  </h3>

                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-500" />
                      <span>{slot.room}</span>
                    </span>
                    <span>·</span>
                    <span className={`px-1.5 py-0.2 rounded text-[10px] font-semibold ${
                      slot.type === 'Lab'
                        ? 'bg-amber-950 text-amber-300 border border-amber-800'
                        : slot.type === 'Tutorial'
                        ? 'bg-purple-950 text-purple-300 border border-purple-800'
                        : 'bg-indigo-950 text-indigo-300 border border-indigo-800'
                    }`}>
                      {slot.type}
                    </span>
                  </div>
                </div>

                {/* Delete Slot Button */}
                <button
                  onClick={() => handleDeleteSlot(slot.id)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition-all"
                  title="Remove this slot"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Add Slot Modal */}
      {showAddSlotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-[#0F172A] border border-slate-700 rounded-2xl shadow-2xl overflow-hidden p-6 space-y-4">
            <h3 className="text-sm font-bold text-white">Add New Timetable Slot</h3>

            <form onSubmit={handleAddSlotSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Day of Week</label>
                <select
                  value={slotDay}
                  onChange={e => setSlotDay(e.target.value as DayOfWeek)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs"
                >
                  {DAYS_OF_WEEK.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Start Time</label>
                  <input
                    type="time"
                    value={slotStartTime}
                    onChange={e => setSlotStartTime(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">End Time</label>
                  <input
                    type="time"
                    value={slotEndTime}
                    onChange={e => setSlotEndTime(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Subject</label>
                <select
                  value={slotSubjectId}
                  onChange={e => setSlotSubjectId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs"
                >
                  {subjects.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.code} - {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Room / Hall</label>
                  <input
                    type="text"
                    value={slotRoom}
                    onChange={e => setSlotRoom(e.target.value)}
                    placeholder="e.g. CS-302"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Type</label>
                  <select
                    value={slotType}
                    onChange={e => setSlotType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs"
                  >
                    <option value="Lecture">Lecture</option>
                    <option value="Lab">Lab</option>
                    <option value="Tutorial">Tutorial</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddSlotModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg"
                >
                  Save Slot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
