import { Subject, TimetableSlot, DayOfWeek } from '../types';

export interface SectionMetadata {
  sectionName: string;
  defaultRoom: string;
  classTeacher: string;
  classTeacherPhone: string;
  timetableCoordinator: string;
  timetableCoordinatorPhone: string;
  hodName: string;
}

export const SECTION_6_METADATA: SectionMetadata = {
  sectionName: 'SECTION-6 (N-311)',
  defaultRoom: 'N-311',
  classTeacher: 'Mrs. D. Tipura',
  classTeacherPhone: '8977267707',
  timetableCoordinator: 'Mr. Uttej Kumar Nannapaneni',
  timetableCoordinatorPhone: '9573793892',
  hodName: 'Dr. S V Phani Kumar',
};

export const PRESET_CSE_SUBJECTS: Subject[] = [
  {
    id: 'sub_ds',
    code: 'DS-25CS201',
    name: 'Data Structures',
    faculty: 'Dr. M. Umadevi (9603329592)',
    facultyContact: '9603329592',
    lectureFaculty: 'Dr. M. Umadevi (9603329592)',
    tutorialFaculty: 'Sk. Farheen Sulthana, Sk. Afrin Neha (9346877692)',
    labFaculty: 'Dr. M. Umadevi (9603329592), Sk. Farheen Sulthana, Sk. Afrin Neha (9346877692), P Mohan Reddy',
    credits: 4,
    color: '#9A3412', // Rust / Amber Brown as per timetable sheet
    totalConducted: 26,
    attended: 22,
    absent: 3,
    onDuty: 1,
    minRequiredPercent: 75,
  },
  {
    id: 'sub_dms',
    code: 'DMS-25MT202',
    name: 'Discrete Mathematical Structures',
    faculty: 'Mr. Saurabh Shrivastav',
    facultyContact: 'Faculty Desk',
    lectureFaculty: 'Mr. Saurabh Shrivastav',
    tutorialFaculty: 'Mr. Saurabh Shrivastav',
    credits: 4,
    color: '#65A30D', // Olive Green as per timetable sheet
    totalConducted: 24,
    attended: 19,
    absent: 5,
    onDuty: 0,
    minRequiredPercent: 75,
  },
  {
    id: 'sub_dbms',
    code: 'DBMS-25CS203',
    name: 'Database Management System',
    faculty: 'Mrs. D. Tipura (8977267707)',
    facultyContact: '8977267707',
    lectureFaculty: 'Mrs. D. Tipura (8977267707) [Class Teacher]',
    tutorialFaculty: 'Mohan Reddy, T. Kiran Kumari (9666172291), Ch. Vijay Rami Reddy (8179170287)',
    labFaculty: 'Mrs. D. Tipura (8977267707), Mohan Reddy, Haneesh Chowdary.P, T. Kiran Kumari (9666172291)',
    credits: 4,
    color: '#16A34A', // Forest Green as per timetable sheet
    totalConducted: 28,
    attended: 24,
    absent: 4,
    onDuty: 0,
    minRequiredPercent: 75,
  },
  {
    id: 'sub_oops',
    code: 'OOPS-25CS204',
    name: 'Object Oriented Programming Through Java',
    faculty: 'Ms. Bhukya Maneesha (7093125459)',
    facultyContact: '7093125459',
    lectureFaculty: 'Ms. Bhukya Maneesha (7093125459)',
    labFaculty: 'Ms. Bhukya Maneesha (7093125459), Latesh Babu, Hashmi, Priyanka Chinni',
    credits: 4,
    color: '#EAB308', // Yellow as per timetable sheet
    totalConducted: 25,
    attended: 17,
    absent: 8,
    onDuty: 0,
    minRequiredPercent: 75,
  },
  {
    id: 'sub_dld',
    code: 'DLD-25CS205',
    name: 'Digital Logic Design',
    faculty: 'Mrs. Magham Sumalatha (9553958115)',
    facultyContact: '9553958115',
    lectureFaculty: 'Mrs. Magham Sumalatha (9553958115)',
    tutorialFaculty: 'Mrs. Magham Sumalatha (9553958115), Mrs. Archana',
    credits: 3,
    color: '#2563EB', // Royal Blue as per timetable sheet
    totalConducted: 24,
    attended: 21,
    absent: 3,
    onDuty: 0,
    minRequiredPercent: 75,
  },
  {
    id: 'sub_ai',
    code: 'AI-24CS302',
    name: 'Artificial Intelligence',
    faculty: 'Dr. D. Yakobu (9912012626)',
    facultyContact: '9912012626',
    lectureFaculty: 'Dr. D. Yakobu (9912012626)',
    tutorialFaculty: 'Dr. D. Yakobu (9912012626), Shaik Muneera, T. Soma Venkata Sesi Kumar',
    credits: 3,
    color: '#06B6D4', // Cyan as per timetable sheet
    totalConducted: 22,
    attended: 19,
    absent: 3,
    onDuty: 0,
    minRequiredPercent: 75,
  },
  {
    id: 'sub_dw',
    code: 'DW-25CS202',
    name: 'Data Wrangling and Visualization',
    faculty: 'Mr. Madugula Anil (9493322982)',
    facultyContact: '9493322982',
    tutorialFaculty: 'Mr. Madugula Anil (9493322982)',
    labFaculty: 'Mr. Madugula Anil (9493322982), Mr. B. Anil Babu (8688070939), SK. Nusrath Jahan, J. Divya Sree',
    credits: 3,
    color: '#A855F7', // Purple/Magenta as per timetable sheet
    totalConducted: 18,
    attended: 15,
    absent: 3,
    onDuty: 0,
    minRequiredPercent: 75,
  },
  {
    id: 'sub_self',
    code: 'ADV-LEARN',
    name: 'Self Learning / Advanced Learning',
    faculty: 'Faculty Mentors / Library',
    facultyContact: 'Library Hub',
    credits: 1,
    color: '#475569',
    totalConducted: 12,
    attended: 12,
    absent: 0,
    onDuty: 0,
    minRequiredPercent: 75,
  },
  {
    id: 'sub_coun',
    code: 'COUN',
    name: 'Student Mentoring & Counselling',
    faculty: 'Mrs. D. Tipura (8977267707)',
    facultyContact: '8977267707',
    credits: 1,
    color: '#0D9488',
    totalConducted: 6,
    attended: 6,
    absent: 0,
    onDuty: 0,
    minRequiredPercent: 75,
  },
];

export const PRESET_CSE_TIMETABLE: TimetableSlot[] = [
  // ================= MONDAY =================
  { id: 'mon_1', day: 'Monday', startTime: '08:15', endTime: '09:05', subjectId: 'sub_dld', room: 'N-311', type: 'Lecture' },
  { id: 'mon_2', day: 'Monday', startTime: '09:05', endTime: '09:55', subjectId: 'sub_ai', room: 'N-311', type: 'Lecture' },
  { id: 'mon_3', day: 'Monday', startTime: '09:55', endTime: '10:45', subjectId: 'sub_ds', room: 'N-311', type: 'Lecture' },
  { id: 'mon_4', day: 'Monday', startTime: '11:00', endTime: '11:50', subjectId: 'sub_self', room: 'N-311', type: 'Tutorial' },
  { id: 'mon_5', day: 'Monday', startTime: '12:30', endTime: '13:20', subjectId: 'sub_dms', room: 'N-311', type: 'Lecture' },
  { id: 'mon_6', day: 'Monday', startTime: '13:20', endTime: '14:10', subjectId: 'sub_oops', room: 'N-311', type: 'Lecture' },
  { id: 'mon_7', day: 'Monday', startTime: '14:20', endTime: '15:10', subjectId: 'sub_dw', room: 'N-311', type: 'Tutorial' },
  { id: 'mon_8', day: 'Monday', startTime: '15:10', endTime: '16:00', subjectId: 'sub_dw', room: 'N-311', type: 'Tutorial' },

  // ================= TUESDAY =================
  { id: 'tue_1', day: 'Tuesday', startTime: '08:15', endTime: '09:05', subjectId: 'sub_dbms', room: 'DBMS Lab', type: 'Lab' },
  { id: 'tue_2', day: 'Tuesday', startTime: '09:05', endTime: '09:55', subjectId: 'sub_dbms', room: 'DBMS Lab', type: 'Lab' },
  { id: 'tue_3', day: 'Tuesday', startTime: '09:55', endTime: '10:45', subjectId: 'sub_dbms', room: 'DBMS Lab', type: 'Lab' },
  { id: 'tue_4', day: 'Tuesday', startTime: '11:00', endTime: '11:50', subjectId: 'sub_self', room: 'N-311', type: 'Tutorial' },
  { id: 'tue_5', day: 'Tuesday', startTime: '12:30', endTime: '13:20', subjectId: 'sub_dld', room: 'N-311', type: 'Tutorial' },
  { id: 'tue_6', day: 'Tuesday', startTime: '13:20', endTime: '14:10', subjectId: 'sub_dld', room: 'N-311', type: 'Tutorial' },
  { id: 'tue_7', day: 'Tuesday', startTime: '14:20', endTime: '15:10', subjectId: 'sub_ds', room: 'N-311', type: 'Tutorial' },
  { id: 'tue_8', day: 'Tuesday', startTime: '15:10', endTime: '16:00', subjectId: 'sub_ds', room: 'N-311', type: 'Tutorial' },

  // ================= WEDNESDAY =================
  { id: 'wed_1', day: 'Wednesday', startTime: '08:15', endTime: '09:05', subjectId: 'sub_dms', room: 'N-311', type: 'Lecture' },
  { id: 'wed_2', day: 'Wednesday', startTime: '09:05', endTime: '09:55', subjectId: 'sub_dbms', room: 'N-311', type: 'Tutorial' },
  { id: 'wed_3', day: 'Wednesday', startTime: '09:55', endTime: '10:45', subjectId: 'sub_dbms', room: 'N-311', type: 'Tutorial' },
  { id: 'wed_4', day: 'Wednesday', startTime: '11:00', endTime: '11:50', subjectId: 'sub_self', room: 'N-311', type: 'Tutorial' },
  { id: 'wed_5', day: 'Wednesday', startTime: '12:30', endTime: '13:20', subjectId: 'sub_oops', room: 'N-311', type: 'Lecture' },
  { id: 'wed_6', day: 'Wednesday', startTime: '13:20', endTime: '14:10', subjectId: 'sub_coun', room: 'N-311', type: 'Tutorial' },
  { id: 'wed_7', day: 'Wednesday', startTime: '14:20', endTime: '15:10', subjectId: 'sub_dld', room: 'N-311', type: 'Lecture' },
  { id: 'wed_8', day: 'Wednesday', startTime: '15:10', endTime: '16:00', subjectId: 'sub_ds', room: 'N-311', type: 'Lecture' },

  // ================= THURSDAY =================
  { id: 'thu_1', day: 'Thursday', startTime: '08:15', endTime: '09:05', subjectId: 'sub_oops', room: 'Java Lab', type: 'Lab' },
  { id: 'thu_2', day: 'Thursday', startTime: '09:05', endTime: '09:55', subjectId: 'sub_oops', room: 'Java Lab', type: 'Lab' },
  { id: 'thu_3', day: 'Thursday', startTime: '09:55', endTime: '10:45', subjectId: 'sub_oops', room: 'Java Lab', type: 'Lab' },
  { id: 'thu_4', day: 'Thursday', startTime: '11:00', endTime: '11:50', subjectId: 'sub_self', room: 'N-311', type: 'Tutorial' },
  { id: 'thu_5', day: 'Thursday', startTime: '12:30', endTime: '13:20', subjectId: 'sub_ai', room: 'N-311', type: 'Tutorial' },
  { id: 'thu_6', day: 'Thursday', startTime: '13:20', endTime: '14:10', subjectId: 'sub_ai', room: 'N-311', type: 'Tutorial' },
  { id: 'thu_7', day: 'Thursday', startTime: '14:20', endTime: '15:10', subjectId: 'sub_dms', room: 'N-311', type: 'Lecture' },
  { id: 'thu_8', day: 'Thursday', startTime: '15:10', endTime: '16:00', subjectId: 'sub_dbms', room: 'N-311', type: 'Lecture' },

  // ================= FRIDAY =================
  { id: 'fri_1', day: 'Friday', startTime: '08:15', endTime: '09:05', subjectId: 'sub_dms', room: 'N-419', type: 'Tutorial' },
  { id: 'fri_2', day: 'Friday', startTime: '09:05', endTime: '09:55', subjectId: 'sub_dms', room: 'N-419', type: 'Tutorial' },
  { id: 'fri_3', day: 'Friday', startTime: '09:55', endTime: '10:45', subjectId: 'sub_ds', room: 'N-419', type: 'Lecture' },
  { id: 'fri_4', day: 'Friday', startTime: '11:00', endTime: '11:50', subjectId: 'sub_self', room: 'N-311', type: 'Tutorial' },
  { id: 'fri_5', day: 'Friday', startTime: '12:30', endTime: '13:20', subjectId: 'sub_dld', room: 'N-311', type: 'Lecture' },
  { id: 'fri_6', day: 'Friday', startTime: '13:20', endTime: '14:10', subjectId: 'sub_dbms', room: 'N-311', type: 'Lecture' },
  { id: 'fri_7', day: 'Friday', startTime: '14:20', endTime: '15:10', subjectId: 'sub_ai', room: 'N-311', type: 'Lecture' },
  { id: 'fri_8', day: 'Friday', startTime: '15:10', endTime: '16:00', subjectId: 'sub_oops', room: 'N-311', type: 'Lecture' },

  // ================= SATURDAY =================
  { id: 'sat_1', day: 'Saturday', startTime: '08:15', endTime: '09:05', subjectId: 'sub_ds', room: 'Computing Lab', type: 'Lab' },
  { id: 'sat_2', day: 'Saturday', startTime: '09:05', endTime: '09:55', subjectId: 'sub_ds', room: 'Computing Lab', type: 'Lab' },
  { id: 'sat_3', day: 'Saturday', startTime: '09:55', endTime: '10:45', subjectId: 'sub_ds', room: 'Computing Lab', type: 'Lab' },
  { id: 'sat_4', day: 'Saturday', startTime: '11:00', endTime: '11:50', subjectId: 'sub_self', room: 'N-311', type: 'Tutorial' },
  { id: 'sat_5', day: 'Saturday', startTime: '12:30', endTime: '13:20', subjectId: 'sub_ai', room: 'N-311', type: 'Lecture' },
  { id: 'sat_6', day: 'Saturday', startTime: '13:20', endTime: '14:10', subjectId: 'sub_dbms', room: 'N-311', type: 'Lecture' },
  { id: 'sat_7', day: 'Saturday', startTime: '14:20', endTime: '15:10', subjectId: 'sub_dw', room: 'N-311', type: 'Lab' },
  { id: 'sat_8', day: 'Saturday', startTime: '15:10', endTime: '16:00', subjectId: 'sub_dw', room: 'N-311', type: 'Lab' },
];

export const DAYS_OF_WEEK: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/**
 * Parses user-uploaded JSON timetable
 */
export function parseTimetableJson(jsonContent: string): { slots: TimetableSlot[]; newSubjects: Subject[] } {
  const parsed = JSON.parse(jsonContent);
  const slots: TimetableSlot[] = [];
  const subjectsMap: Map<string, Subject> = new Map();

  const rawSlots = Array.isArray(parsed) ? parsed : parsed.slots || [];
  const rawSubjects = parsed.subjects || [];

  rawSubjects.forEach((s: any, idx: number) => {
    subjectsMap.set(s.id || s.code, {
      id: s.id || `sub_${s.code.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
      code: s.code || `SUB${idx + 1}`,
      name: s.name || s.subjectName || 'Course',
      faculty: s.faculty || 'Faculty In-Charge',
      credits: s.credits || 3,
      color: s.color || '#3B82F6',
      totalConducted: s.totalConducted || 0,
      attended: s.attended || 0,
      absent: s.absent || 0,
      onDuty: s.onDuty || 0,
      minRequiredPercent: 75,
    });
  });

  rawSlots.forEach((slot: any, index: number) => {
    let subjectId = slot.subjectId;
    if (!subjectId && slot.subjectCode) {
      const existing = subjectsMap.get(slot.subjectCode);
      if (existing) {
        subjectId = existing.id;
      } else {
        const newSubId = `sub_${slot.subjectCode.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
        subjectsMap.set(slot.subjectCode, {
          id: newSubId,
          code: slot.subjectCode,
          name: slot.subjectName || slot.subjectCode,
          faculty: slot.faculty || 'Faculty',
          credits: 3,
          color: ['#9A3412', '#65A30D', '#16A34A', '#EAB308', '#2563EB', '#06B6D4', '#A855F7'][index % 7],
          totalConducted: 0,
          attended: 0,
          absent: 0,
          onDuty: 0,
          minRequiredPercent: 75,
        });
        subjectId = newSubId;
      }
    }

    slots.push({
      id: slot.id || `slot_${Date.now()}_${index}`,
      day: slot.day || 'Monday',
      startTime: slot.startTime || '08:15',
      endTime: slot.endTime || '09:05',
      subjectId: subjectId || 'sub_ds',
      room: slot.room || 'N-311',
      type: slot.type || 'Lecture',
    });
  });

  return { slots, newSubjects: Array.from(subjectsMap.values()) };
}

/**
 * Parses user-uploaded CSV timetable
 */
export function parseTimetableCsv(csvText: string): { slots: TimetableSlot[]; newSubjects: Subject[] } {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) throw new Error('CSV must have header and at least one data row');

  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  const dayIdx = headers.findIndex(h => h.includes('day'));
  const startIdx = headers.findIndex(h => h.includes('start'));
  const endIdx = headers.findIndex(h => h.includes('end'));
  const codeIdx = headers.findIndex(h => h.includes('code') || h.includes('subject'));
  const nameIdx = headers.findIndex(h => h.includes('name'));
  const roomIdx = headers.findIndex(h => h.includes('room'));
  const typeIdx = headers.findIndex(h => h.includes('type'));

  const slots: TimetableSlot[] = [];
  const subjectsMap: Map<string, Subject> = new Map();

  for (let i = 1; i < lines.length; i++) {
    const row = lines[i].split(',').map(c => c.trim().replace(/^["']|["']$/g, ''));
    if (row.length < 3 || !row[0]) continue;

    const day = (row[dayIdx !== -1 ? dayIdx : 0] || 'Monday') as DayOfWeek;
    const startTime = row[startIdx !== -1 ? startIdx : 1] || '08:15';
    const endTime = row[endIdx !== -1 ? endIdx : 2] || '09:05';
    const code = row[codeIdx !== -1 ? codeIdx : 3] || `CS${300 + i}`;
    const name = nameIdx !== -1 && row[nameIdx] ? row[nameIdx] : code;
    const room = roomIdx !== -1 && row[roomIdx] ? row[roomIdx] : 'N-311';
    const type = (typeIdx !== -1 && row[typeIdx] ? row[typeIdx] : 'Lecture') as 'Lecture' | 'Lab' | 'Tutorial';

    const subId = `sub_${code.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
    if (!subjectsMap.has(code)) {
      subjectsMap.set(code, {
        id: subId,
        code,
        name,
        faculty: 'Prof. ' + code,
        credits: 3,
        color: ['#9A3412', '#65A30D', '#16A34A', '#EAB308', '#2563EB', '#06B6D4', '#A855F7'][i % 7],
        totalConducted: 0,
        attended: 0,
        absent: 0,
        onDuty: 0,
        minRequiredPercent: 75,
      });
    }

    slots.push({
      id: `slot_csv_${i}_${Date.now()}`,
      day,
      startTime,
      endTime,
      subjectId: subId,
      room,
      type,
    });
  }

  return { slots, newSubjects: Array.from(subjectsMap.values()) };
}

/**
 * Returns sample CSV template text matching Section-6
 */
export function getSampleTimetableCsv(): string {
  return `Day,StartTime,EndTime,SubjectCode,SubjectName,Room,Type
Monday,08:15,09:05,DLD-25CS205,Digital Logic Design,N-311,Lecture
Monday,09:05,09:55,AI-24CS302,Artificial Intelligence,N-311,Lecture
Monday,09:55,10:45,DS-25CS201,Data Structures,N-311,Lecture
Monday,12:30,13:20,DMS-25MT202,Discrete Mathematical Structures,N-311,Lecture
Monday,13:20,14:10,OOPS-25CS204,Java OOP,N-311,Lecture
Monday,14:20,16:00,DW-25CS202,Data Wrangling and Visualization,N-311,Tutorial
Tuesday,08:15,10:45,DBMS-25CS203,Database Management System,DBMS Lab,Lab
Tuesday,12:30,14:10,DLD-25CS205,Digital Logic Design,N-311,Tutorial
Tuesday,14:20,16:00,DS-25CS201,Data Structures,N-311,Tutorial
Wednesday,08:15,09:05,DMS-25MT202,Discrete Mathematical Structures,N-311,Lecture
Wednesday,09:05,10:45,DBMS-25CS203,Database Management System,N-311,Tutorial
Wednesday,12:30,13:20,OOPS-25CS204,Java OOP,N-311,Lecture
Wednesday,14:20,15:10,DLD-25CS205,Digital Logic Design,N-311,Lecture
Wednesday,15:10,16:00,DS-25CS201,Data Structures,N-311,Lecture
Thursday,08:15,10:45,OOPS-25CS204,Java OOP Lab,Java Lab,Lab
Thursday,12:30,14:10,AI-24CS302,Artificial Intelligence,N-311,Tutorial
Thursday,14:20,15:10,DMS-25MT202,Discrete Mathematical Structures,N-311,Lecture
Thursday,15:10,16:00,DBMS-25CS203,Database Management System,N-311,Lecture
Friday,08:15,09:55,DMS-25MT202,Discrete Mathematical Structures,N-419,Tutorial
Friday,09:55,10:45,DS-25CS201,Data Structures,N-419,Lecture
Friday,12:30,13:20,DLD-25CS205,Digital Logic Design,N-311,Lecture
Friday,13:20,14:10,DBMS-25CS203,Database Management System,N-311,Lecture
Friday,14:20,15:10,AI-24CS302,Artificial Intelligence,N-311,Lecture
Friday,15:10,16:00,OOPS-25CS204,Java OOP,N-311,Lecture
Saturday,08:15,10:45,DS-25CS201,Data Structures Lab,Computing Lab,Lab
Saturday,12:30,13:20,AI-24CS302,Artificial Intelligence,N-311,Lecture
Saturday,13:20,14:10,DBMS-25CS203,Database Management System,N-311,Lecture
Saturday,14:20,16:00,DW-25CS202,Data Wrangling and Visualization,N-311,Lab`;
}
