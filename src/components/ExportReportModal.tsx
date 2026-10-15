import React, { useState } from 'react';
import { Student, Subject, TimetableSlot, AttendanceRecord } from '../types';
import { OverallAttendanceSummary, calculateSubjectBunk } from '../utils/attendanceCalculations';
import { exportAttendanceToPDF, exportAttendanceToCSV } from '../utils/exportReport';
import {
  FileText,
  FileSpreadsheet,
  Download,
  CheckCircle,
  Copy,
  Printer,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  X,
  Sparkles,
  Calendar,
  Layers,
  GraduationCap
} from 'lucide-react';

interface ExportReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student;
  subjects: Subject[];
  summary: OverallAttendanceSummary;
  timetableSlots: TimetableSlot[];
  records: AttendanceRecord[];
}

export const ExportReportModal: React.FC<ExportReportModalProps> = ({
  isOpen,
  onClose,
  student,
  subjects,
  summary,
  timetableSlots,
  records,
}) => {
  const [activeTab, setActiveTab] = useState<'pdf' | 'csv' | 'summary'>('pdf');
  const [includeTimetable, setIncludeTimetable] = useState(true);
  const [includeAdvisories, setIncludeAdvisories] = useState(true);
  const [copied, setCopied] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDownloadPDF = () => {
    try {
      exportAttendanceToPDF(student, subjects, summary, timetableSlots, {
        includeTimetable,
        institutionName: `${student.branch} · Semester ${student.semester} Academic Record`,
      });
      setDownloadSuccess('PDF Report downloaded successfully!');
      setTimeout(() => setDownloadSuccess(null), 4000);
    } catch (err) {
      console.error('Error generating PDF:', err);
    }
  };

  const handleDownloadCSV = () => {
    try {
      exportAttendanceToCSV(student, subjects, summary, records);
      setDownloadSuccess('CSV Report downloaded successfully!');
      setTimeout(() => setDownloadSuccess(null), 4000);
    } catch (err) {
      console.error('Error generating CSV:', err);
    }
  };

  const handleCopySummaryText = () => {
    const lines = [
      `🎓 *AttendX Academic Attendance Summary*`,
      `👤 Student: ${student.name} (${student.regNo})`,
      `📚 Year ${student.year} · Sem ${student.semester} · Section ${student.section}`,
      `📊 Overall Attendance: ${summary.overallPercentage.toFixed(1)}% (${summary.isOverallEligible ? '✅ Exam Eligible (>=75%)' : '❌ Shortage (<75%)'})`,
      `🏫 Classes Attended: ${summary.totalAttended} / ${summary.totalConducted} (Absent: ${summary.totalAbsent}, OD: ${summary.totalOnDuty})`,
      summary.isOverallEligible
        ? `🛡️ Aggregate Safe Bunks Left: ${summary.safeBunkCountOverall} lectures`
        : `⚠️ Classes needed to reach 75%: ${summary.catchUpCountOverall} consecutive lectures`,
      '',
      `📌 *Course-wise Breakdown:*`,
      ...subjects.map(s => {
        const c = calculateSubjectBunk(s);
        const icon = c.percentage >= 80 ? '🟢' : c.isBorderline ? '🟡' : '🔴';
        const action = c.isEligible ? `Safe skips: ${c.safeBunkCount}` : `Needs ${c.catchUpCount} classes`;
        return `${icon} ${s.code} (${s.name}): ${c.percentage.toFixed(1)}% [${s.attended}/${s.totalConducted}] - ${action}`;
      }),
      '',
      `📅 Generated: ${new Date().toLocaleDateString('en-IN')}`,
    ];

    navigator.clipboard.writeText(lines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#0f172a] border border-slate-700/80 rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>Export Attendance Report</span>
                <span className="text-xs bg-indigo-500/20 text-indigo-300 font-mono font-medium px-2 py-0.5 rounded-full border border-indigo-500/30">
                  PDF & CSV
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Official documents for offline verification, mentor review & exam clearance
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="px-6 pt-4 border-b border-slate-800/80 bg-slate-900/60 flex items-center gap-2">
          <button
            onClick={() => setActiveTab('pdf')}
            className={`pb-3 px-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'pdf'
                ? 'border-indigo-400 text-indigo-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Academic PDF Document</span>
          </button>

          <button
            onClick={() => setActiveTab('csv')}
            className={`pb-3 px-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'csv'
                ? 'border-emerald-400 text-emerald-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Excel / CSV Spreadsheet</span>
          </button>

          <button
            onClick={() => setActiveTab('summary')}
            className={`pb-3 px-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'summary'
                ? 'border-pink-400 text-pink-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Copy className="w-4 h-4" />
            <span>Quick Copy Summary</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {downloadSuccess && (
            <div className="p-3 bg-emerald-950/70 border border-emerald-500/50 rounded-xl text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-bounce">
              <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{downloadSuccess} Check your downloads folder.</span>
            </div>
          )}

          {/* Tab 1: PDF */}
          {activeTab === 'pdf' && (
            <div className="space-y-4">
              {/* Document Mockup Preview Box */}
              <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-4 relative overflow-hidden shadow-inner">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-indigo-400" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      Official Document Preview (A4 Format)
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">
                    {student.regNo} · {new Date().toLocaleDateString()}
                  </span>
                </div>

                {/* Micro preview */}
                <div className="pt-3 space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Student:</span>
                    <span className="font-semibold text-white">{student.name} ({student.branch})</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Overall Attendance:</span>
                    <span
                      className={`font-mono font-bold ${
                        summary.overallPercentage >= 80
                          ? 'text-emerald-400'
                          : summary.overallPercentage >= 75
                          ? 'text-amber-400'
                          : 'text-rose-400'
                      }`}
                    >
                      {summary.overallPercentage.toFixed(1)}% ({summary.isOverallEligible ? 'Eligible' : 'Debarment Risk'})
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Subjects Included:</span>
                    <span className="font-mono text-indigo-300">{subjects.length} courses registered</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Institutional Sections:</span>
                    <span className="text-slate-300 text-[11px]">
                      Profile · KPI Summary · Subject Table · 75% Cutoff Audit · Signatures
                    </span>
                  </div>
                </div>

                {/* Sample miniature table preview */}
                <div className="mt-3 pt-3 border-t border-slate-800/80">
                  <div className="text-[10px] font-bold text-slate-400 mb-1.5 uppercase">Courses in Report:</div>
                  <div className="max-h-28 overflow-y-auto space-y-1 pr-1">
                    {subjects.map(s => {
                      const c = calculateSubjectBunk(s);
                      return (
                        <div
                          key={s.id}
                          className="flex items-center justify-between text-[11px] bg-slate-900/60 px-2 py-1 rounded-lg border border-slate-800/60"
                        >
                          <span className="font-mono text-slate-300 font-medium truncate max-w-[180px]">
                            {s.code} - {s.name}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-slate-400">{s.attended}/{s.totalConducted}</span>
                            <span
                              className={`font-mono font-bold px-1.5 py-0.2 rounded text-[10px] ${
                                c.percentage >= 80
                                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60'
                                  : c.isBorderline
                                  ? 'bg-amber-950 text-amber-400 border border-amber-800/60'
                                  : 'bg-rose-950 text-rose-400 border border-rose-800/60'
                              }`}
                            >
                              {c.percentage.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* PDF Customization Checkboxes */}
              <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 space-y-2.5">
                <span className="text-xs font-bold text-slate-300 block mb-1">
                  Report Customization Options:
                </span>

                <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={includeTimetable}
                    onChange={e => setIncludeTimetable(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-500 bg-slate-800 border-slate-700 focus:ring-0"
                  />
                  <span>Include Weekly Timetable Matrix schedule in PDF</span>
                </label>

                <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={includeAdvisories}
                    onChange={e => setIncludeAdvisories(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-500 bg-slate-800 border-slate-700 focus:ring-0"
                  />
                  <span>Include 75% Cutoff Shortage & Borderline Academic Advisory section</span>
                </label>

                <div className="text-[11px] text-slate-400 pt-1 flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Includes official signature lines for Student, Class Advisor & HOD.</span>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={handleDownloadPDF}
                className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-indigo-600 via-indigo-500 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all transform active:scale-[0.99]"
              >
                <Download className="w-4 h-4" />
                <span>Download Official Academic PDF (.pdf)</span>
              </button>
            </div>
          )}

          {/* Tab 2: CSV */}
          {activeTab === 'csv' && (
            <div className="space-y-4">
              <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                  <div>
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                      Microsoft Excel & Google Sheets Compatible CSV
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Standardized spreadsheet format containing full course telemetry and safe bunk statistics.
                    </p>
                  </div>
                </div>

                <div className="bg-slate-900 rounded-xl p-3 font-mono text-[11px] text-slate-300 space-y-1 overflow-x-auto border border-slate-800">
                  <div className="text-emerald-400 font-bold">
                    Subject Code, Title, Faculty, Conducted, Attended, Absent, OD, %, Status, Safe Bunks Left
                  </div>
                  {subjects.slice(0, 3).map(s => {
                    const c = calculateSubjectBunk(s);
                    return (
                      <div key={s.id} className="text-slate-400 truncate">
                        "{s.code}","{s.name}","{s.faculty}",{s.totalConducted},{s.attended},{s.absent},{s.onDuty},"{c.percentage.toFixed(1)}%",{c.percentage >= 75 ? 'Safe' : 'Shortage'},{c.safeBunkCount}
                      </div>
                    );
                  })}
                  <div className="text-slate-500 italic">... and {subjects.length - 3} more rows</div>
                </div>

                <div className="text-xs text-slate-300 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>Includes student metadata (Roll No, Branch, Semester, Section).</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>Includes safe bunk calculations and catch-up count per subject.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>Includes recent attendance timestamps and punch records.</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={handleDownloadCSV}
                className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all transform active:scale-[0.99]"
              >
                <Download className="w-4 h-4" />
                <span>Download Spreadsheet (.csv)</span>
              </button>
            </div>
          )}

          {/* Tab 3: Quick Summary */}
          {activeTab === 'summary' && (
            <div className="space-y-4">
              <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300">
                    Plain-Text Summary for WhatsApp / Study Group:
                  </span>
                  <button
                    onClick={handleCopySummaryText}
                    className="text-xs font-bold px-2.5 py-1 rounded-lg bg-pink-500/20 text-pink-300 hover:bg-pink-500/30 border border-pink-500/40 flex items-center gap-1 transition-colors"
                  >
                    {copied ? <CheckCircle className="w-3.5 h-3.5 text-pink-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied!' : 'Copy to Clipboard'}</span>
                  </button>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 font-mono text-xs text-slate-300 whitespace-pre-wrap max-h-60 overflow-y-auto leading-relaxed">
                  {`🎓 AttendX Academic Attendance Summary
👤 Student: ${student.name} (${student.regNo})
📚 Year ${student.year} · Sem ${student.semester} · Section ${student.section}
📊 Overall Attendance: ${summary.overallPercentage.toFixed(1)}% (${summary.isOverallEligible ? '✅ Exam Eligible (>=75%)' : '❌ Shortage (<75%)'})
🏫 Classes: ${summary.totalAttended} / ${summary.totalConducted} (Absent: ${summary.totalAbsent}, OD: ${summary.totalOnDuty})
${summary.isOverallEligible ? `🛡️ Safe Bunks Left: ${summary.safeBunkCountOverall} lectures` : `⚠️ Need: ${summary.catchUpCountOverall} consecutive classes`}

📌 Course-wise Breakdown:
${subjects.map(s => {
  const c = calculateSubjectBunk(s);
  const icon = c.percentage >= 80 ? '🟢' : c.isBorderline ? '🟡' : '🔴';
  const action = c.isEligible ? `Safe skips: ${c.safeBunkCount}` : `Needs ${c.catchUpCount} classes`;
  return `${icon} ${s.code} (${s.name}): ${c.percentage.toFixed(1)}% [${s.attended}/${s.totalConducted}] - ${action}`;
}).join('\n')}

📅 Generated: ${new Date().toLocaleDateString('en-IN')}`}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/70 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-pink-400" />
            <span>Encrypted offline storage & verified academic calculations</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
