import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Student, Subject, TimetableSlot, AttendanceRecord } from '../types';
import { OverallAttendanceSummary, calculateSubjectBunk } from './attendanceCalculations';

export interface PDFExportOptions {
  includeTimetable?: boolean;
  includeRecentLogs?: boolean;
  institutionName?: string;
  notes?: string;
}

/**
 * Generates and downloads a clean, RFC-4180 compliant CSV summary of the student's attendance.
 */
export function exportAttendanceToCSV(
  student: Student,
  subjects: Subject[],
  summary: OverallAttendanceSummary,
  records: AttendanceRecord[] = []
): void {
  const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
  const dateStr = new Date().toISOString().slice(0, 10);

  const escapeCSV = (val: string | number | undefined | null) => {
    if (val === undefined || val === null) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const lines: string[] = [];

  // Header meta
  lines.push('================================================================================');
  lines.push('B.TECH ACADEMIC ATTENDANCE & 75% CUTOFF EVALUATION REPORT');
  lines.push('================================================================================');
  lines.push('');
  lines.push(`Report Generated On,${escapeCSV(timestamp)}`);
  lines.push(`Student Name,${escapeCSV(student.name)}`);
  lines.push(`Registration / Roll Number,${escapeCSV(student.regNo)}`);
  lines.push(`Academic Year & Semester,${escapeCSV(`Year ${student.year} · Semester ${student.semester}`)}`);
  lines.push(`Section / Division,${escapeCSV(student.section)}`);
  lines.push(`Branch / Discipline,${escapeCSV(student.branch)}`);
  lines.push(`Contact Email / Phone,${escapeCSV(student.email)}`);
  lines.push('');

  // Overall Aggregate
  lines.push('--------------------------------------------------------------------------------');
  lines.push('OVERALL AGGREGATE SUMMARY (75% MINIMUM CRITERIA)');
  lines.push('--------------------------------------------------------------------------------');
  lines.push(`Overall Attendance Percentage,${escapeCSV(`${summary.overallPercentage.toFixed(2)}%`)}`);
  lines.push(`Overall Exam Eligibility Status,${escapeCSV(summary.isOverallEligible ? (summary.isOverallBorderline ? 'BORDERLINE COMPLIANT (75% - 79.9%)' : 'COMPLIANT (>= 80%)') : 'DEBARMENT RISK (BELOW 75%)')}`);
  lines.push(`Total Classes Conducted,${escapeCSV(summary.totalConducted)}`);
  lines.push(`Total Classes Attended,${escapeCSV(summary.totalAttended)}`);
  lines.push(`Total Classes Absent,${escapeCSV(summary.totalAbsent)}`);
  lines.push(`Total On-Duty (OD) Approved,${escapeCSV(summary.totalOnDuty)}`);
  lines.push(`Aggregate Safe Bunks Left,${escapeCSV(summary.safeBunkCountOverall)}`);
  lines.push(`Aggregate Catch-Up Classes Needed,${escapeCSV(summary.catchUpCountOverall)}`);
  lines.push(`Subjects With Attendance Shortage (<75%),${escapeCSV(summary.shortageSubjectsCount)}`);
  lines.push('');

  // Subject Table
  lines.push('--------------------------------------------------------------------------------');
  lines.push('COURSE-WISE ATTENDANCE BREAKDOWN');
  lines.push('--------------------------------------------------------------------------------');
  const headers = [
    'Subject Code',
    'Subject Title',
    'Faculty In-Charge',
    'Credits',
    'Total Conducted',
    'Attended',
    'Absent',
    'On-Duty (OD)',
    'Effective Attendance %',
    '75% Status',
    'Safe Bunks Left',
    'Catch-Up Needed (consecutive)',
    'Advisory Action',
  ];
  lines.push(headers.map(escapeCSV).join(','));

  subjects.forEach(sub => {
    const calc = calculateSubjectBunk(sub);
    const effectiveAttended = sub.attended + sub.onDuty;
    const status = calc.percentage >= 80 ? 'SAFE (>=80%)' : calc.isBorderline ? 'BORDERLINE (75-79.9%)' : 'DEBARRED (<75%)';
    const action = calc.isEligible
      ? `Can safely miss ${calc.safeBunkCount} more classes`
      : `Must attend next ${calc.catchUpCount} classes consecutively`;

    const row = [
      sub.code,
      sub.name,
      sub.faculty || 'Department Faculty',
      sub.credits,
      sub.totalConducted,
      sub.attended,
      sub.absent,
      sub.onDuty,
      `${calc.percentage.toFixed(2)}%`,
      status,
      calc.safeBunkCount,
      calc.catchUpCount,
      action,
    ];
    lines.push(row.map(escapeCSV).join(','));
  });

  // Recent attendance logs if any
  if (records && records.length > 0) {
    lines.push('');
    lines.push('--------------------------------------------------------------------------------');
    lines.push('RECENT ATTENDANCE LOG ENTRIES');
    lines.push('--------------------------------------------------------------------------------');
    lines.push(['Log Date', 'Subject Code', 'Status', 'Timestamp', 'Notes'].map(escapeCSV).join(','));

    records.slice(0, 50).forEach(r => {
      const sub = subjects.find(s => s.id === r.subjectId);
      lines.push([
        r.date,
        sub ? sub.code : r.subjectId,
        r.status.toUpperCase(),
        r.timestamp,
        r.notes || '',
      ].map(escapeCSV).join(','));
    });
  }

  // Footer notes
  lines.push('');
  lines.push('Note: As per university academic regulations 75% minimum attendance is mandatory in each registered course to be eligible for End-Semester Examinations.');

  const csvContent = lines.join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Attendance_Report_${student.regNo || 'BTech'}_${dateStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generates an official, publication-quality academic PDF report for offline storage & official submission.
 */
export function exportAttendanceToPDF(
  student: Student,
  subjects: Subject[],
  summary: OverallAttendanceSummary,
  slots: TimetableSlot[] = [],
  options: PDFExportOptions = {}
): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const dateStr = new Date().toISOString().slice(0, 10);
  const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' });

  // 1. Institutional Header Banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 75, 'F');

  // Decorative accent line
  doc.setFillColor(236, 72, 153); // pink-500
  doc.rect(0, 72, pageWidth, 3, 'F');

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('B.TECH ACADEMIC ATTENDANCE & 75% CUTOFF REPORT', 30, 32);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(203, 213, 225); // slate-300
  doc.text(
    options.institutionName || 'Department of Computer Science & Engineering · Academic Record Keeping',
    30,
    48
  );

  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text(`Official Document · Generated: ${timestamp}`, 30, 62);

  // Status Badge in Header
  const badgeColor = summary.isOverallEligible
    ? summary.isOverallBorderline
      ? [245, 158, 11] // amber
      : [16, 185, 129] // emerald
    : [244, 63, 94]; // rose

  const badgeText = summary.isOverallEligible
    ? summary.isOverallBorderline
      ? 'BORDERLINE (75-79%)'
      : 'EXAM ELIGIBLE (>=75%)'
    : 'SHORTAGE ALERT (<75%)';

  doc.setFillColor(badgeColor[0], badgeColor[1], badgeColor[2]);
  doc.roundedRect(pageWidth - 170, 22, 140, 26, 4, 4, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text(badgeText, pageWidth - 100, 38, { align: 'center' });

  // 2. Student Info Card Block
  let currentY = 90;

  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.roundedRect(30, currentY, pageWidth - 60, 60, 4, 4, 'FD');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139); // slate-500
  doc.text('STUDENT PROFILE & ACADEMIC DETAILS', 42, currentY + 16);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);

  // Column 1
  doc.text(`Name:`, 42, currentY + 32);
  doc.setFont('helvetica', 'bold');
  doc.text(student.name, 90, currentY + 32);

  doc.setFont('helvetica', 'normal');
  doc.text(`Reg No:`, 42, currentY + 48);
  doc.setFont('helvetica', 'bold');
  doc.text(student.regNo || '22BCE1042', 90, currentY + 48);

  // Column 2
  doc.setFont('helvetica', 'normal');
  doc.text(`Branch:`, 210, currentY + 32);
  doc.setFont('helvetica', 'bold');
  doc.text(student.branch, 255, currentY + 32);

  doc.setFont('helvetica', 'normal');
  doc.text(`Year / Sem:`, 210, currentY + 48);
  doc.setFont('helvetica', 'bold');
  doc.text(`Year ${student.year} · Sem ${student.semester}`, 270, currentY + 48);

  // Column 3
  doc.setFont('helvetica', 'normal');
  doc.text(`Section:`, 410, currentY + 32);
  doc.setFont('helvetica', 'bold');
  doc.text(student.section, 460, currentY + 32);

  doc.setFont('helvetica', 'normal');
  doc.text(`Min Cutoff:`, 410, currentY + 48);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(225, 29, 72); // rose-600
  doc.text(`75.00%`, 470, currentY + 48);

  // 3. Executive Metrics KPI Summary Boxes
  currentY += 72;

  const boxWidth = (pageWidth - 60 - 24) / 4;
  const metrics = [
    {
      title: 'OVERALL ATTENDANCE',
      value: `${summary.overallPercentage.toFixed(1)}%`,
      sub: summary.isOverallEligible ? 'Above 75% cutoff' : 'Below 75% minimum',
      color: badgeColor,
    },
    {
      title: 'CLASSES ATTENDED',
      value: `${summary.totalAttended} / ${summary.totalConducted}`,
      sub: `${summary.totalAbsent} absent · ${summary.totalOnDuty} OD`,
      color: [79, 70, 229], // indigo
    },
    {
      title: 'SAFE BUNKS LEFT',
      value: `${summary.safeBunkCountOverall}`,
      sub: 'Lectures skippable safely',
      color: [16, 185, 129], // emerald
    },
    {
      title: 'SHORTAGE RISK',
      value: `${summary.shortageSubjectsCount}`,
      sub: summary.shortageSubjectsCount === 0 ? 'Zero debarments' : 'Subjects debarred',
      color: summary.shortageSubjectsCount > 0 ? [244, 63, 94] : [16, 185, 129],
    },
  ];

  metrics.forEach((m, idx) => {
    const x = 30 + idx * (boxWidth + 8);
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(x, currentY, boxWidth, 54, 4, 4, 'FD');

    // Colored accent tab
    doc.setFillColor(m.color[0], m.color[1], m.color[2]);
    doc.rect(x, currentY, 3, 54, 'F');

    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 116, 139);
    doc.text(m.title, x + 8, currentY + 14);

    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(m.color[0], m.color[1], m.color[2]);
    doc.text(m.value, x + 8, currentY + 32);

    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(m.sub, x + 8, currentY + 46);
  });

  currentY += 66;

  // 4. Subject-Wise Attendance Breakdown Table
  const tableData = subjects.map(sub => {
    const calc = calculateSubjectBunk(sub);
    const statusLabel = calc.percentage >= 80 ? 'SAFE' : calc.isBorderline ? 'BORDERLINE' : 'SHORTAGE';
    const margin = calc.isEligible
      ? `Can skip ${calc.safeBunkCount}`
      : `Need ${calc.catchUpCount} classes`;

    return [
      sub.code,
      `${sub.name}\nFaculty: ${sub.faculty || 'Dept. Faculty'}`,
      String(sub.credits),
      String(sub.totalConducted),
      String(sub.attended),
      String(sub.absent),
      String(sub.onDuty),
      `${calc.percentage.toFixed(1)}%`,
      statusLabel,
      margin,
    ];
  });

  autoTable(doc, {
    startY: currentY,
    head: [[
      'Code',
      'Subject Title & Faculty',
      'Cr',
      'Cond',
      'Att',
      'Abs',
      'OD',
      'Att %',
      'Status',
      'Bunk / Catch-Up',
    ]],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: 'bold',
      halign: 'center',
    },
    columnStyles: {
      0: { cellWidth: 60, halign: 'center', fontStyle: 'bold' },
      1: { cellWidth: 155, fontSize: 8 },
      2: { cellWidth: 24, halign: 'center' },
      3: { cellWidth: 32, halign: 'center' },
      4: { cellWidth: 32, halign: 'center', fontStyle: 'bold', textColor: [16, 185, 129] },
      5: { cellWidth: 32, halign: 'center', textColor: [244, 63, 94] },
      6: { cellWidth: 26, halign: 'center', textColor: [14, 165, 233] },
      7: { cellWidth: 42, halign: 'center', fontStyle: 'bold' },
      8: { cellWidth: 68, halign: 'center', fontStyle: 'bold' },
      9: { cellWidth: 65, halign: 'center', fontSize: 7.5 },
    },
    styles: {
      fontSize: 7.5,
      cellPadding: 4,
      valign: 'middle',
    },
    didParseCell: (data) => {
      // Colorize the percentage and status cells
      if (data.section === 'body') {
        const rawRow = data.row.raw as any;
        const rawPct = rawRow && rawRow[7] ? parseFloat(String(rawRow[7]).replace('%', '')) : 0;
        if (data.column.index === 7) {
          if (rawPct >= 80) {
            data.cell.styles.textColor = [16, 185, 129];
          } else if (rawPct >= 75) {
            data.cell.styles.textColor = [217, 119, 6];
          } else {
            data.cell.styles.textColor = [225, 29, 72];
          }
        }
        if (data.column.index === 8) {
          const statusText = String(data.cell.raw);
          if (statusText === 'SAFE') {
            data.cell.styles.fillColor = [236, 253, 245];
            data.cell.styles.textColor = [5, 150, 105];
          } else if (statusText === 'BORDERLINE') {
            data.cell.styles.fillColor = [254, 243, 199];
            data.cell.styles.textColor = [180, 83, 9];
          } else {
            data.cell.styles.fillColor = [255, 241, 242];
            data.cell.styles.textColor = [190, 18, 60];
          }
        }
      }
    },
    margin: { left: 30, right: 30 },
  });

  // Get position after table
  const finalY = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 15 : currentY + 200;

  // 5. Borderline / Shortage Advisory Section
  const shortageList = subjects.filter(s => calculateSubjectBunk(s).percentage < 75);
  const borderlineList = subjects.filter(s => calculateSubjectBunk(s).isBorderline);

  let advisoryY = finalY;

  if (shortageList.length > 0 || borderlineList.length > 0) {
    if (advisoryY > pageHeight - 140) {
      doc.addPage();
      advisoryY = 40;
    }

    doc.setFillColor(254, 242, 242); // rose-50
    doc.setDrawColor(254, 205, 211); // rose-200
    doc.roundedRect(30, advisoryY, pageWidth - 60, 48, 4, 4, 'FD');

    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(190, 18, 60);
    doc.text('⚠️ ACADEMIC ADVISORY: 75% ATTENDANCE MANDATE NOTICE', 42, advisoryY + 14);

    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(159, 18, 57);

    const advisoryNotes = [
      shortageList.length > 0
        ? `• DEBARMENT WARNING: ${shortageList.map(s => s.code).join(', ')} currently below 75% minimum. End-Sem Hall Ticket is at risk.`
        : '',
      borderlineList.length > 0
        ? `• BORDERLINE WATCH: ${borderlineList.map(s => s.code).join(', ')} currently between 75.0% and 79.9%. Skipping even 1 class will trigger debarment.`
        : '',
    ].filter(Boolean);

    advisoryNotes.forEach((note, nIdx) => {
      doc.text(note, 42, advisoryY + 28 + nIdx * 12);
    });

    advisoryY += 58;
  }

  // 6. Timetable Schedule (if requested in options and slots exist)
  if (options.includeTimetable && slots && slots.length > 0) {
    if (advisoryY > pageHeight - 160) {
      doc.addPage();
      advisoryY = 40;
    }

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('WEEKLY TIMETABLE SCHEDULE REFERENCE', 30, advisoryY);

    const timetableRows = slots.map(slot => {
      const sub = subjects.find(s => s.id === slot.subjectId);
      return [
        slot.day,
        `${slot.startTime} - ${slot.endTime}`,
        sub ? sub.code : 'N/A',
        sub ? sub.name : 'Unknown Subject',
        slot.room,
        slot.type,
      ];
    });

    autoTable(doc, {
      startY: advisoryY + 6,
      head: [['Day', 'Time Slot', 'Subject Code', 'Subject Title', 'Room', 'Type']],
      body: timetableRows,
      theme: 'striped',
      headStyles: {
        fillColor: [51, 65, 85],
        textColor: [255, 255, 255],
        fontSize: 7.5,
      },
      styles: {
        fontSize: 7,
        cellPadding: 3,
      },
      margin: { left: 30, right: 30 },
    });

    advisoryY = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 20 : advisoryY + 120;
  }

  // Check if we need another page for signatures
  if (advisoryY > pageHeight - 80) {
    doc.addPage();
    advisoryY = 50;
  }

  // 7. Signatures & Institutional Verification Block
  const sigY = Math.max(advisoryY + 15, pageHeight - 75);

  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.5);

  // Line 1
  doc.line(40, sigY, 150, sigY);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Student Signature', 95, sigY + 12, { align: 'center' });

  // Line 2
  doc.line(pageWidth / 2 - 55, sigY, pageWidth / 2 + 55, sigY);
  doc.text('Faculty Mentor / Advisor', pageWidth / 2, sigY + 12, { align: 'center' });

  // Line 3
  doc.line(pageWidth - 150, sigY, pageWidth - 40, sigY);
  doc.text('Head of Department (HOD)', pageWidth - 95, sigY + 12, { align: 'center' });

  // Footer document watermark & page number
  const totalPages = (doc.internal as any).getNumberOfPages ? (doc.internal as any).getNumberOfPages() : 1;
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184);
    doc.text(
      `AttendX Academic Portal · Confidential Academic Document · Page ${i} of ${totalPages}`,
      pageWidth / 2,
      pageHeight - 15,
      { align: 'center' }
    );
  }

  // Trigger download
  doc.save(`Attendance_Report_${student.regNo || 'BTech'}_${dateStr}.pdf`);
}
