import { Student, Subject, TimetableSlot, AttendanceRecord, AttendanceStatus } from '../types';
import { PRESET_CSE_SUBJECTS, PRESET_CSE_TIMETABLE } from './timetablePresets';
import { dispatchPushNotification } from './notifications';

export const DEFAULT_STUDENT: Student = {
  id: 'std_22bce1042',
  regNo: '22BCE1042',
  name: 'Ambika Uppu',
  section: 'CSE-3A',
  year: 3,
  semester: 6,
  branch: 'Computer Science & Engineering',
  email: 'uppuambika@gmail.com',
};

export const DEMO_STUDENTS: Student[] = [
  DEFAULT_STUDENT,
  {
    id: 'std_23bce0812',
    regNo: '23BCE0812',
    name: 'Aarav Sharma',
    section: 'CSE-2B',
    year: 2,
    semester: 4,
    branch: 'Computer Science & Engineering',
    email: 'aarav.sharma@college.edu',
  },
  {
    id: 'std_21ece0455',
    regNo: '21ECE0455',
    name: 'Pooja Krishnan',
    section: 'ECE-4A',
    year: 4,
    semester: 8,
    branch: 'Electronics & Communication',
    email: 'pooja.krishnan@college.edu',
  },
];

export function getStoredCurrentStudent(): Student | null {
  const data = localStorage.getItem('btech_current_student');
  if (data) {
    try {
      return JSON.parse(data);
    } catch {
      return DEFAULT_STUDENT;
    }
  }
  return DEFAULT_STUDENT;
}

export function saveCurrentStudent(student: Student): void {
  localStorage.setItem('btech_current_student', JSON.stringify(student));
  
  // Also register in student directory
  const directory = getStoredStudentsList();
  const index = directory.findIndex(s => s.regNo.toLowerCase() === student.regNo.toLowerCase());
  if (index >= 0) {
    directory[index] = student;
  } else {
    directory.push(student);
  }
  localStorage.setItem('btech_students_list', JSON.stringify(directory));
}

export function getStoredStudentsList(): Student[] {
  const data = localStorage.getItem('btech_students_list');
  if (data) {
    try {
      return JSON.parse(data);
    } catch {
      return DEMO_STUDENTS;
    }
  }
  return DEMO_STUDENTS;
}

export function getStoredSubjects(studentId: string): Subject[] {
  const data = localStorage.getItem(`btech_subjects_${studentId}`);
  if (data) {
    try {
      return JSON.parse(data);
    } catch {
      return PRESET_CSE_SUBJECTS;
    }
  }
  return PRESET_CSE_SUBJECTS;
}

export function saveSubjects(studentId: string, subjects: Subject[]): void {
  localStorage.setItem(`btech_subjects_${studentId}`, JSON.stringify(subjects));
}

export function getStoredTimetable(studentId: string): TimetableSlot[] {
  const data = localStorage.getItem(`btech_timetable_${studentId}`);
  if (data) {
    try {
      return JSON.parse(data);
    } catch {
      return PRESET_CSE_TIMETABLE;
    }
  }
  return PRESET_CSE_TIMETABLE;
}

export function saveTimetable(studentId: string, slots: TimetableSlot[]): void {
  localStorage.setItem(`btech_timetable_${studentId}`, JSON.stringify(slots));
}

export function getStoredAttendanceRecords(studentId: string): AttendanceRecord[] {
  const data = localStorage.getItem(`btech_attendance_${studentId}`);
  if (data) {
    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  }
  return [];
}

export function saveAttendanceRecords(studentId: string, records: AttendanceRecord[]): void {
  localStorage.setItem(`btech_attendance_${studentId}`, JSON.stringify(records));
}

/**
 * Marks daily attendance for a slot/subject and recalibrates subject totals
 */
export function recordDailyAttendance(
  studentId: string,
  subjectId: string,
  date: string,
  newStatus: AttendanceStatus,
  slotId?: string
): { updatedSubjects: Subject[]; updatedRecords: AttendanceRecord[] } {
  const subjects = getStoredSubjects(studentId);
  const records = getStoredAttendanceRecords(studentId);

  // Check if already marked for this slot/subject on this date
  const existingRecordIndex = records.findIndex(
    r => r.date === date && (slotId ? r.slotId === slotId : r.subjectId === subjectId)
  );

  const prevStatus = existingRecordIndex >= 0 ? records[existingRecordIndex].status : null;

  if (existingRecordIndex >= 0) {
    records[existingRecordIndex] = {
      ...records[existingRecordIndex],
      status: newStatus,
      timestamp: new Date().toISOString(),
    };
  } else {
    records.push({
      id: `att_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      studentId,
      subjectId,
      slotId,
      date,
      status: newStatus,
      timestamp: new Date().toISOString(),
    });
  }

  // Update subject stats
  const updatedSubjects = subjects.map(sub => {
    if (sub.id !== subjectId) return sub;

    let { totalConducted, attended, absent, onDuty } = sub;

    // Roll back previous status if exists
    if (prevStatus === 'present') {
      attended = Math.max(0, attended - 1);
      totalConducted = Math.max(0, totalConducted - 1);
    } else if (prevStatus === 'absent') {
      absent = Math.max(0, absent - 1);
      totalConducted = Math.max(0, totalConducted - 1);
    } else if (prevStatus === 'on_duty') {
      onDuty = Math.max(0, onDuty - 1);
      totalConducted = Math.max(0, totalConducted - 1);
    }

    // Apply new status
    if (newStatus === 'present') {
      attended += 1;
      totalConducted += 1;
    } else if (newStatus === 'absent') {
      absent += 1;
      totalConducted += 1;
    } else if (newStatus === 'on_duty') {
      onDuty += 1;
      totalConducted += 1;
    } // 'cancelled' does not add to totalConducted

    const newPercentage = totalConducted > 0 ? ((attended + onDuty) / totalConducted) * 100 : 100;

    // Warn if dropped below 75%
    if (newPercentage < 75 && newStatus === 'absent') {
      dispatchPushNotification(
        `🚨 Debarment Warning: ${sub.code} Attendance Alert!`,
        `Marked Absent. Your ${sub.name} attendance dropped to ${newPercentage.toFixed(1)}% (below mandatory 75.0% threshold).`,
        'shortage_warning',
        sub.id
      );
    }

    return {
      ...sub,
      totalConducted,
      attended,
      absent,
      onDuty,
    };
  });

  saveSubjects(studentId, updatedSubjects);
  saveAttendanceRecords(studentId, records);

  return { updatedSubjects, updatedRecords: records };
}

/**
 * Resets back to factory demo state
 */
export function resetStudentData(studentId: string): { subjects: Subject[]; slots: TimetableSlot[] } {
  localStorage.removeItem(`btech_subjects_${studentId}`);
  localStorage.removeItem(`btech_timetable_${studentId}`);
  localStorage.removeItem(`btech_attendance_${studentId}`);
  return {
    subjects: PRESET_CSE_SUBJECTS,
    slots: PRESET_CSE_TIMETABLE,
  };
}
