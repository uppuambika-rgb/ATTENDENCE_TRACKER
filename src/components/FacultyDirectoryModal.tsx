import React from 'react';
import { Subject } from '../types';
import { SECTION_6_METADATA } from '../utils/timetablePresets';
import { Users, Phone, X, BookOpen, GraduationCap, Building2, Copy, Check } from 'lucide-react';

interface FacultyDirectoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  subjects: Subject[];
}

export const FacultyDirectoryModal: React.FC<FacultyDirectoryModalProps> = ({
  isOpen,
  onClose,
  subjects,
}) => {
  const [copiedPhone, setCopiedPhone] = React.useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (phone: string) => {
    navigator.clipboard?.writeText(phone);
    setCopiedPhone(phone);
    setTimeout(() => setCopiedPhone(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-2xl bg-[#0F172A] border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#0B1120]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/30 border border-indigo-500/40 text-indigo-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  Section-6 Faculty Directory &amp; Contacts
                </h2>
                <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                  {SECTION_6_METADATA.defaultRoom}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Official Department Faculty for {SECTION_6_METADATA.sectionName}
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

        {/* Section Leadership Highlights */}
        <div className="p-6 overflow-y-auto space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-indigo-500/30 space-y-1">
              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">
                Class Teacher
              </span>
              <h4 className="text-xs font-bold text-white">{SECTION_6_METADATA.classTeacher}</h4>
              <button
                onClick={() => handleCopy(SECTION_6_METADATA.classTeacherPhone)}
                className="flex items-center gap-1.5 text-xs font-mono text-cyan-300 hover:text-cyan-200 transition-colors pt-1"
              >
                <Phone className="w-3 h-3 text-cyan-400" />
                <span>{SECTION_6_METADATA.classTeacherPhone}</span>
                {copiedPhone === SECTION_6_METADATA.classTeacherPhone ? (
                  <Check className="w-3 h-3 text-emerald-400" />
                ) : (
                  <Copy className="w-3 h-3 text-slate-500 opacity-60" />
                )}
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Timetable Coordinator
              </span>
              <h4 className="text-xs font-bold text-white">{SECTION_6_METADATA.timetableCoordinator}</h4>
              <button
                onClick={() => handleCopy(SECTION_6_METADATA.timetableCoordinatorPhone)}
                className="flex items-center gap-1.5 text-xs font-mono text-cyan-300 hover:text-cyan-200 transition-colors pt-1"
              >
                <Phone className="w-3 h-3 text-cyan-400" />
                <span>{SECTION_6_METADATA.timetableCoordinatorPhone}</span>
                {copiedPhone === SECTION_6_METADATA.timetableCoordinatorPhone ? (
                  <Check className="w-3 h-3 text-emerald-400" />
                ) : (
                  <Copy className="w-3 h-3 text-slate-500 opacity-60" />
                )}
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Head of Department (HOD)
              </span>
              <h4 className="text-xs font-bold text-white">{SECTION_6_METADATA.hodName}</h4>
              <span className="text-[11px] text-slate-400 font-mono block pt-1">Dept of CSE</span>
            </div>
          </div>

          {/* Subject Faculty List */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
              <span>Teaching Faculty by Course:</span>
            </h3>

            <div className="space-y-2">
              {subjects
                .filter(s => s.code !== 'ADV-LEARN' && s.code !== 'COUN')
                .map(sub => (
                  <div
                    key={sub.id}
                    className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-slate-700/80 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[11px] font-bold text-white bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                          {sub.code}
                        </span>
                        <h4 className="text-xs font-bold text-white">{sub.name}</h4>
                      </div>

                      <div className="text-[11px] text-slate-300 pt-1 space-y-0.5">
                        {sub.lectureFaculty && (
                          <p>
                            <span className="text-slate-400">Lecture [L]:</span> {sub.lectureFaculty}
                          </p>
                        )}
                        {sub.tutorialFaculty && (
                          <p>
                            <span className="text-slate-400">Tutorial [T]:</span> {sub.tutorialFaculty}
                          </p>
                        )}
                        {sub.labFaculty && (
                          <p>
                            <span className="text-slate-400">Practical/Lab [P]:</span> {sub.labFaculty}
                          </p>
                        )}
                      </div>
                    </div>

                    {sub.facultyContact && sub.facultyContact !== 'Faculty Desk' && (
                      <button
                        onClick={() => handleCopy(sub.facultyContact || '')}
                        className="self-start sm:self-center flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-mono transition-colors border border-slate-700 shrink-0"
                        title="Click to copy phone number"
                      >
                        <Phone className="w-3.5 h-3.5 text-cyan-400" />
                        <span>{sub.facultyContact}</span>
                        {copiedPhone === sub.facultyContact ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3 text-slate-500" />
                        )}
                      </button>
                    )}
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 px-6 border-t border-slate-800 bg-[#0B1120] flex items-center justify-between text-xs text-slate-400">
          <span>Classroom: Room N-311 (Friday Tutorial: N-419)</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
