import React, { useState } from 'react';
import { Student, YearType } from '../types';
import { DEMO_STUDENTS, saveCurrentStudent, getStoredStudentsList } from '../utils/storage';
import { UserCheck, Sparkles, X, PlusCircle, ArrowRight, ShieldCheck, GraduationCap } from 'lucide-react';

interface StudentAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStudent: Student;
  onStudentChanged: (student: Student) => void;
}

export const StudentAuthModal: React.FC<StudentAuthModalProps> = ({
  isOpen,
  onClose,
  currentStudent,
  onStudentChanged,
}) => {
  const [activeTab, setActiveTab] = useState<'switch' | 'register'>('switch');
  const [studentsList, setStudentsList] = useState<Student[]>(getStoredStudentsList());

  // Registration Form State
  const [regNo, setRegNo] = useState('');
  const [name, setName] = useState('');
  const [section, setSection] = useState('');
  const [year, setYear] = useState<YearType>(3);
  const [branch, setBranch] = useState('Computer Science & Engineering');
  const [semester, setSemester] = useState<number>(6);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regNo.trim() || !name.trim() || !section.trim()) {
      setErrorMsg('Please fill in Registration Number, Full Name, and Section.');
      return;
    }

    const cleanRegNo = regNo.trim().toUpperCase();
    const newStudent: Student = {
      id: `std_${cleanRegNo.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
      regNo: cleanRegNo,
      name: name.trim(),
      section: section.trim().toUpperCase(),
      year: Number(year) as YearType,
      semester: Number(semester),
      branch,
      email: `${cleanRegNo.toLowerCase()}@college.edu`,
    };

    saveCurrentStudent(newStudent);
    setStudentsList(getStoredStudentsList());
    onStudentChanged(newStudent);
    onClose();
  };

  const handleSelectStudent = (student: Student) => {
    saveCurrentStudent(student);
    onStudentChanged(student);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg bg-[#0F172A] border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#0B1120]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/30 border border-indigo-500/40 text-indigo-400 flex items-center justify-center">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">Student Identity &amp; Portal</h2>
              <p className="text-xs text-slate-400">B.Tech Reg No, Section &amp; Year Credentials</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-800 bg-[#0B1120]/50 px-6 pt-3 gap-4">
          <button
            onClick={() => setActiveTab('switch')}
            className={`pb-3 text-xs font-semibold tracking-wide transition-colors relative ${
              activeTab === 'switch' ? 'text-indigo-400 border-b-2 border-indigo-500' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Select Active Profile
          </button>
          <button
            onClick={() => setActiveTab('register')}
            className={`pb-3 text-xs font-semibold tracking-wide transition-colors relative ${
              activeTab === 'register' ? 'text-indigo-400 border-b-2 border-indigo-500' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Register / Login New Student
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {activeTab === 'switch' ? (
            <div className="space-y-3">
              <p className="text-xs text-slate-400">
                Choose a registered engineering student to load their lecture records, weekly timetable, and 75% attendance metrics:
              </p>

              <div className="space-y-2">
                {studentsList.map(s => {
                  const isCurrent = s.regNo.toLowerCase() === currentStudent.regNo.toLowerCase();
                  return (
                    <div
                      key={s.id}
                      onClick={() => handleSelectStudent(s)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                        isCurrent
                          ? 'bg-indigo-950/40 border-indigo-500/80 ring-1 ring-indigo-500/40'
                          : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm font-mono ${
                            isCurrent
                              ? 'bg-indigo-600 text-white'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {s.name.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-white">{s.name}</span>
                            {isCurrent && (
                              <span className="text-[10px] font-mono font-medium text-indigo-400 bg-indigo-950 px-1.5 py-0.5 rounded border border-indigo-800/80">
                                Current
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                            <span className="font-mono text-cyan-300">{s.regNo}</span>
                            <span>·</span>
                            <span>Year {s.year} (Sem {s.semester})</span>
                            <span>·</span>
                            <span>Sec {s.section}</span>
                          </div>
                        </div>
                      </div>

                      <button
                        className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                          isCurrent
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        {isCurrent ? 'Active' : 'Switch'}
                      </button>
                    </div>
                  );
                })}
              </div>

              <div className="pt-3 border-t border-slate-800">
                <button
                  onClick={() => setActiveTab('register')}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-dashed border-slate-700 hover:border-indigo-500/70 text-slate-300 hover:text-indigo-400 text-xs font-semibold transition-all bg-slate-900/30"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Enroll Another Student Profile</span>
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              {errorMsg && (
                <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-300 text-xs">
                  {errorMsg}
                </div>
              )}

              {/* Reg No & Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Registration Number <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 22BCE1042"
                    value={regNo}
                    onChange={e => setRegNo(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Student Full Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ambika Uppu"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Section, Year, Semester */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Section <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CSE-3A"
                    value={section}
                    onChange={e => setSection(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    B.Tech Year <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={year}
                    onChange={e => setYear(Number(e.target.value) as YearType)}
                    className="w-full px-2.5 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs focus:outline-none focus:border-indigo-500"
                  >
                    <option value={1}>1st Year</option>
                    <option value={2}>2nd Year</option>
                    <option value={3}>3rd Year</option>
                    <option value={4}>4th Year</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Semester
                  </label>
                  <select
                    value={semester}
                    onChange={e => setSemester(Number(e.target.value))}
                    className="w-full px-2.5 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs focus:outline-none focus:border-indigo-500"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                      <option key={s} value={s}>
                        Sem {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Branch */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Engineering Branch
                </label>
                <select
                  value={branch}
                  onChange={e => setBranch(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs focus:outline-none focus:border-indigo-500"
                >
                  <option value="Computer Science & Engineering">Computer Science &amp; Engineering (CSE)</option>
                  <option value="Information Technology">Information Technology (IT)</option>
                  <option value="Electronics & Communication">Electronics &amp; Communication (ECE)</option>
                  <option value="Artificial Intelligence & Data Science">AI &amp; Data Science (AI &amp; DS)</option>
                  <option value="Electrical & Electronics">Electrical &amp; Electronics (EEE)</option>
                  <option value="Mechanical Engineering">Mechanical Engineering (MECH)</option>
                  <option value="Civil Engineering">Civil Engineering (CIVIL)</option>
                </select>
              </div>

              <div className="p-3 rounded-lg bg-indigo-950/30 border border-indigo-900/60 text-indigo-300 text-xs flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <span>
                  University 75% attendance rule will be automatically bound to this registration profile with timetable slot integration.
                </span>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTab('switch')}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors flex items-center gap-1.5 shadow-md shadow-indigo-600/30"
                >
                  <span>Register &amp; Launch Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
