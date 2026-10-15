import { Subject, BunkCalculation } from '../types';

export const MIN_ATTENDANCE_PERCENT = 75;

/**
 * Calculates attendance percentage, safe bunk count, catch-up count, and borderline alerts.
 */
export function calculateSubjectBunk(subject: Subject): BunkCalculation {
  const total = subject.totalConducted;
  const effectiveAttended = subject.attended + subject.onDuty;

  if (total === 0) {
    return {
      subjectId: subject.id,
      subjectCode: subject.code,
      subjectName: subject.name,
      totalConducted: 0,
      attended: 0,
      percentage: 100,
      isEligible: true,
      safeBunkCount: 0,
      catchUpCount: 0,
      statusTone: 'safe',
      isBorderline: false,
    };
  }

  const rawPercent = (effectiveAttended / total) * 100;
  const percentage = Math.round(rawPercent * 10) / 10;
  const isEligible = percentage >= MIN_ATTENDANCE_PERCENT;
  const isBorderline = isEligible && percentage < 80.0;

  let safeBunkCount = 0;
  let catchUpCount = 0;

  if (isEligible) {
    // Formula: B = floor((A - 0.75 * T) / 0.75)
    const numerator = effectiveAttended - 0.75 * total;
    safeBunkCount = Math.max(0, Math.floor(numerator / 0.75));
  } else {
    // Formula: C = ceil((0.75 * T - A) / 0.25)
    const numerator = 0.75 * total - effectiveAttended;
    catchUpCount = Math.max(1, Math.ceil(numerator / 0.25));
  }

  let statusTone: 'safe' | 'warning' | 'danger' = 'safe';
  let borderlineWarningMessage: string | undefined;

  if (percentage < MIN_ATTENDANCE_PERCENT) {
    statusTone = 'danger';
  } else if (isBorderline) {
    statusTone = 'warning';
    if (safeBunkCount === 0) {
      borderlineWarningMessage = '⚠️ Borderline Warning! Missing even 1 more class will drop you below 75%!';
    } else {
      borderlineWarningMessage = `⚠️ Borderline Warning! You can only skip ${safeBunkCount} more class${safeBunkCount > 1 ? 'es' : ''} before falling into the shortage zone.`;
    }
  }

  return {
    subjectId: subject.id,
    subjectCode: subject.code,
    subjectName: subject.name,
    totalConducted: total,
    attended: effectiveAttended,
    percentage,
    isEligible,
    safeBunkCount,
    catchUpCount,
    statusTone,
    isBorderline,
    borderlineWarningMessage,
  };
}

export interface OverallAttendanceSummary {
  totalConducted: number;
  totalAttended: number;
  totalAbsent: number;
  totalOnDuty: number;
  overallPercentage: number;
  isOverallEligible: boolean;
  isOverallBorderline: boolean;
  shortageSubjectsCount: number;
  borderlineSubjectsCount: number;
  safeBunkCountOverall: number;
  catchUpCountOverall: number;
  subjectsBreakdown: BunkCalculation[];
}

export function calculateOverallAttendance(subjects: Subject[]): OverallAttendanceSummary {
  let totalConducted = 0;
  let totalAttended = 0;
  let totalAbsent = 0;
  let totalOnDuty = 0;

  const breakdowns = subjects.map(s => {
    totalConducted += s.totalConducted;
    totalAttended += s.attended;
    totalAbsent += s.absent;
    totalOnDuty += s.onDuty;
    return calculateSubjectBunk(s);
  });

  const effectiveTotalAttended = totalAttended + totalOnDuty;
  const rawOverall = totalConducted > 0 ? (effectiveTotalAttended / totalConducted) * 100 : 100;
  const overallPercentage = Math.round(rawOverall * 10) / 10;
  const isOverallEligible = overallPercentage >= MIN_ATTENDANCE_PERCENT;
  const isOverallBorderline = isOverallEligible && overallPercentage < 80.0;

  const shortageSubjectsCount = breakdowns.filter(b => !b.isEligible).length;
  const borderlineSubjectsCount = breakdowns.filter(b => b.isBorderline).length;

  let safeBunkCountOverall = 0;
  let catchUpCountOverall = 0;

  if (totalConducted > 0) {
    if (isOverallEligible) {
      safeBunkCountOverall = Math.max(0, Math.floor((effectiveTotalAttended - 0.75 * totalConducted) / 0.75));
    } else {
      catchUpCountOverall = Math.max(1, Math.ceil((0.75 * totalConducted - effectiveTotalAttended) / 0.25));
    }
  }

  return {
    totalConducted,
    totalAttended,
    totalAbsent,
    totalOnDuty,
    overallPercentage,
    isOverallEligible,
    isOverallBorderline,
    shortageSubjectsCount,
    borderlineSubjectsCount,
    safeBunkCountOverall,
    catchUpCountOverall,
    subjectsBreakdown: breakdowns,
  };
}

/**
 * Predicts new percentage if student attends or misses upcoming classes.
 */
export function simulateAttendanceChange(
  currentAttended: number,
  currentTotal: number,
  attendMore: number,
  missMore: number
): { newPercentage: number; changeDelta: number; isEligible: number } {
  const newAttended = currentAttended + attendMore;
  const newTotal = currentTotal + attendMore + missMore;
  if (newTotal === 0) return { newPercentage: 100, changeDelta: 0, isEligible: 1 };

  const currentPercent = currentTotal > 0 ? (currentAttended / currentTotal) * 100 : 100;
  const newPercent = Math.round(((newAttended / newTotal) * 100) * 10) / 10;
  const changeDelta = Math.round((newPercent - currentPercent) * 10) / 10;

  return {
    newPercentage: newPercent,
    changeDelta,
    isEligible: newPercent >= MIN_ATTENDANCE_PERCENT ? 1 : 0,
  };
}
