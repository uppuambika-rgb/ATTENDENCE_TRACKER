import { Subject, TimetableSlot, AttendanceRecord, YearType } from '../types';
import { PRESET_CSE_SUBJECTS, PRESET_CSE_TIMETABLE } from './timetablePresets';

export type AppTheme = 'cyber_obsidian' | 'kawaii_pastel' | 'matcha_latte' | 'neon_sunset';

export interface UserAccount {
  phoneNumber: string; // Key, e.g. "9876543210"
  name: string;
  passwordHash: string; // In-browser hashed/stored password
  regNo: string;
  section: string;
  year: YearType;
  semester: number;
  branch: string;
  theme: AppTheme;
  subjects: Subject[];
  timetable: TimetableSlot[];
  attendanceRecords: AttendanceRecord[];
  createdAt: string;
  lastLoginAt: string;
}

interface StoredOtpSession {
  otp: string;
  expiresAt: number; // timestamp
}

const USERS_DB_KEY = 'attendx_users_db_v2';
const ACTIVE_SESSION_KEY = 'attendx_active_phone_session';
const OTP_STORE_KEY = 'attendx_otp_temp_store';

// Default initial user for Ambika Uppu (Section 6)
export const DEFAULT_USER: UserAccount = {
  phoneNumber: '9876543210',
  name: 'Ambika Uppu',
  passwordHash: 'pass123',
  regNo: '22BCE1042',
  section: 'SECTION-6 (N-311)',
  year: 2,
  semester: 4,
  branch: 'Computer Science & Engineering',
  theme: 'kawaii_pastel',
  subjects: PRESET_CSE_SUBJECTS,
  timetable: PRESET_CSE_TIMETABLE,
  attendanceRecords: [],
  createdAt: '2026-09-01T00:00:00Z',
  lastLoginAt: new Date().toISOString(),
};

/**
 * Loads entire user database from storage
 */
export function getAllUsers(): Record<string, UserAccount> {
  const data = localStorage.getItem(USERS_DB_KEY);
  if (data) {
    try {
      const parsed = JSON.parse(data);
      if (!parsed[DEFAULT_USER.phoneNumber]) {
        parsed[DEFAULT_USER.phoneNumber] = DEFAULT_USER;
        saveAllUsers(parsed);
      }
      return parsed;
    } catch {
      return { [DEFAULT_USER.phoneNumber]: DEFAULT_USER };
    }
  }
  const initial = { [DEFAULT_USER.phoneNumber]: DEFAULT_USER };
  saveAllUsers(initial);
  return initial;
}

export function saveAllUsers(users: Record<string, UserAccount>): void {
  localStorage.setItem(USERS_DB_KEY, JSON.stringify(users));
}

/**
 * Clean phone number to 10-15 digit numeric format
 */
export function sanitizePhone(phone: string): string {
  return phone.replace(/[^0-9]/g, '');
}

/**
 * Generates a realistic 4-digit OTP for phone verification
 */
export function generateOtp(phoneNumber: string): { otp: string; expiresAt: number } {
  const cleanPhone = sanitizePhone(phoneNumber);
  // Generate 4-digit code between 1000 and 9999
  const otp = Math.floor(1000 + Math.random() * 9000).toString();
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

  const currentOtps: Record<string, StoredOtpSession> = JSON.parse(
    localStorage.getItem(OTP_STORE_KEY) || '{}'
  );
  currentOtps[cleanPhone] = { otp, expiresAt };
  localStorage.setItem(OTP_STORE_KEY, JSON.stringify(currentOtps));

  return { otp, expiresAt };
}

/**
 * Validates the 4-digit OTP
 */
export function verifyOtp(phoneNumber: string, inputOtp: string): boolean {
  const cleanPhone = sanitizePhone(phoneNumber);
  const currentOtps: Record<string, StoredOtpSession> = JSON.parse(
    localStorage.getItem(OTP_STORE_KEY) || '{}'
  );

  const session = currentOtps[cleanPhone];
  if (!session) return false;

  if (Date.now() > session.expiresAt) {
    delete currentOtps[cleanPhone];
    localStorage.setItem(OTP_STORE_KEY, JSON.stringify(currentOtps));
    return false;
  }

  if (session.otp.trim() === inputOtp.trim()) {
    // OTP used, consume it
    delete currentOtps[cleanPhone];
    localStorage.setItem(OTP_STORE_KEY, JSON.stringify(currentOtps));
    return true;
  }

  return false;
}

/**
 * Register a new user after OTP verification and set their password
 */
export function registerUser(
  phoneNumber: string,
  password: string,
  details: {
    name: string;
    regNo: string;
    section: string;
    year: YearType;
    semester: number;
    branch: string;
    theme?: AppTheme;
  }
): UserAccount {
  const cleanPhone = sanitizePhone(phoneNumber);
  const users = getAllUsers();

  const newUser: UserAccount = {
    phoneNumber: cleanPhone,
    name: details.name.trim() || 'Student',
    passwordHash: password,
    regNo: details.regNo.trim().toUpperCase() || '22BCE1000',
    section: details.section.trim().toUpperCase() || 'SECTION-6 (N-311)',
    year: details.year || 2,
    semester: details.semester || 4,
    branch: details.branch || 'Computer Science & Engineering',
    theme: details.theme || 'kawaii_pastel',
    subjects: PRESET_CSE_SUBJECTS,
    timetable: PRESET_CSE_TIMETABLE,
    attendanceRecords: [],
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
  };

  users[cleanPhone] = newUser;
  saveAllUsers(users);
  setActiveSession(newUser);
  return newUser;
}

/**
 * Login with Phone Number and Password
 */
export function loginWithPassword(
  phoneNumber: string,
  password: string
): { success: boolean; user?: UserAccount; error?: string } {
  const cleanPhone = sanitizePhone(phoneNumber);
  const users = getAllUsers();
  const user = users[cleanPhone];

  if (!user) {
    return {
      success: false,
      error: 'No account found with this phone number. Please sign up with OTP first.',
    };
  }

  if (user.passwordHash !== password) {
    return {
      success: false,
      error: 'Incorrect password. Try again or log in via 4-Digit OTP.',
    };
  }

  user.lastLoginAt = new Date().toISOString();
  users[cleanPhone] = user;
  saveAllUsers(users);
  setActiveSession(user);

  return { success: true, user };
}

/**
 * Login directly via verified OTP (if user already exists)
 */
export function loginWithOtpDirect(phoneNumber: string): UserAccount | null {
  const cleanPhone = sanitizePhone(phoneNumber);
  const users = getAllUsers();
  const user = users[cleanPhone];
  if (user) {
    user.lastLoginAt = new Date().toISOString();
    users[cleanPhone] = user;
    saveAllUsers(users);
    setActiveSession(user);
    return user;
  }
  return null;
}

/**
 * Active Session Management
 */
export function getActiveSession(): UserAccount | null {
  const phone = localStorage.getItem(ACTIVE_SESSION_KEY);
  if (!phone) {
    // If no session, default to demo student
    const users = getAllUsers();
    return users[DEFAULT_USER.phoneNumber] || DEFAULT_USER;
  }
  const users = getAllUsers();
  return users[phone] || DEFAULT_USER;
}

export function setActiveSession(user: UserAccount | null): void {
  if (user) {
    localStorage.setItem(ACTIVE_SESSION_KEY, user.phoneNumber);
  } else {
    localStorage.removeItem(ACTIVE_SESSION_KEY);
  }
}

/**
 * Saves updated timetable, subjects, or attendance for the current user
 */
export function syncCurrentUserData(
  phoneNumber: string,
  updates: Partial<UserAccount>
): UserAccount {
  const cleanPhone = sanitizePhone(phoneNumber);
  const users = getAllUsers();
  const current = users[cleanPhone] || DEFAULT_USER;

  const updated: UserAccount = {
    ...current,
    ...updates,
  };

  users[cleanPhone] = updated;
  saveAllUsers(users);

  // Sync to local fallback keys for fast access
  if (updates.subjects) {
    localStorage.setItem(`btech_subjects_${cleanPhone}`, JSON.stringify(updates.subjects));
  }
  if (updates.timetable) {
    localStorage.setItem(`btech_timetable_${cleanPhone}`, JSON.stringify(updates.timetable));
  }
  if (updates.attendanceRecords) {
    localStorage.setItem(`btech_attendance_${cleanPhone}`, JSON.stringify(updates.attendanceRecords));
  }
  if (updates.theme) {
    localStorage.setItem(`attendx_theme_${cleanPhone}`, updates.theme);
  }

  return updated;
}
