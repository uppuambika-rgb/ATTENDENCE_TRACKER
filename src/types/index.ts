export type YearType = 1 | 2 | 3 | 4;

export interface Student {
  id: string;
  regNo: string; // e.g. 22BCE1042
  name: string;
  section: string; // e.g. CSE-3A
  year: YearType; // 1st, 2nd, 3rd, 4th
  semester: number; // 1 to 8
  branch: string; // e.g. Computer Science & Engineering
  email: string;
  avatarUrl?: string;
}

export type AttendanceStatus = 'present' | 'absent' | 'on_duty' | 'cancelled';

export interface Subject {
  id: string;
  code: string; // e.g. DS-25CS201
  name: string; // e.g. Data Structures
  faculty: string;
  facultyContact?: string;
  lectureFaculty?: string;
  tutorialFaculty?: string;
  labFaculty?: string;
  credits: number;
  color: string; // Hex or CSS gradient
  totalConducted: number;
  attended: number;
  absent: number;
  onDuty: number; // Approved On-Duty / College Representation
  minRequiredPercent: number; // Fixed at 75%
}

export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';

export interface TimetableSlot {
  id: string;
  day: DayOfWeek;
  startTime: string; // "09:00"
  endTime: string; // "10:00"
  subjectId: string;
  room: string;
  type: 'Lecture' | 'Lab' | 'Tutorial';
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  subjectId: string;
  slotId?: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  timestamp: string;
  notes?: string;
}

export interface BunkCalculation {
  subjectId: string;
  subjectCode: string;
  subjectName: string;
  totalConducted: number;
  attended: number;
  percentage: number;
  isEligible: boolean; // >= 75%
  safeBunkCount: number; // How many classes can be skipped while staying >= 75%
  catchUpCount: number; // How many consecutive classes must be attended to reach 75%
  statusTone: 'safe' | 'warning' | 'danger'; // safe >= 80%, warning 75-79.9%, danger < 75%
  isBorderline: boolean; // 75.0% - 79.9%
  borderlineWarningMessage?: string;
}

export interface PushNotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'upcoming_lecture' | 'shortage_warning' | 'daily_reminder' | 'system';
  timestamp: string;
  read: boolean;
  subjectId?: string;
  actionUrl?: string;
}

export interface WeeklyTimetable {
  branch: string;
  year: YearType;
  section: string;
  slots: TimetableSlot[];
}
