import { PushNotificationItem, TimetableSlot, Subject } from '../types';

let notificationListeners: ((items: PushNotificationItem[]) => void)[] = [];
let storedNotifications: PushNotificationItem[] = [];

// Initialize sample notifications
const INITIAL_NOTIFICATIONS: PushNotificationItem[] = [
  {
    id: 'notif_1',
    title: '⚠️ Attendance Shortage Warning: CS302',
    message: 'Operating Systems attendance is 70.0% (Under 75% threshold!). You must attend the next 6 consecutive classes to become eligible for semester exams.',
    type: 'shortage_warning',
    timestamp: '10 mins ago',
    read: false,
    subjectId: 'sub_cs302',
  },
  {
    id: 'notif_2',
    title: '⚠️ Attendance Shortage Warning: CS304',
    message: 'Theory of Computation attendance is 66.7% (Under 75% threshold!). Debarment risk active. Catch-up requirement: 8 classes.',
    type: 'shortage_warning',
    timestamp: '25 mins ago',
    read: false,
    subjectId: 'sub_cs304',
  },
  {
    id: 'notif_3',
    title: '🔔 Upcoming Lecture in 15 Minutes',
    message: 'Database Management Systems (CS301) starts at 09:00 AM in CS-Block 302. Don\'t forget to punch in!',
    type: 'upcoming_lecture',
    timestamp: '1 hour ago',
    read: true,
    subjectId: 'sub_cs301',
  },
];

export function getNotifications(): PushNotificationItem[] {
  if (storedNotifications.length === 0) {
    const saved = localStorage.getItem('btech_notifications');
    if (saved) {
      try {
        storedNotifications = JSON.parse(saved);
      } catch {
        storedNotifications = [...INITIAL_NOTIFICATIONS];
      }
    } else {
      storedNotifications = [...INITIAL_NOTIFICATIONS];
    }
  }
  return storedNotifications;
}

export function subscribeNotifications(listener: (items: PushNotificationItem[]) => void): () => void {
  notificationListeners.push(listener);
  listener(getNotifications());
  return () => {
    notificationListeners = notificationListeners.filter(l => l !== listener);
  };
}

function persistAndBroadcast(): void {
  localStorage.setItem('btech_notifications', JSON.stringify(storedNotifications));
  notificationListeners.forEach(l => l(storedNotifications));
}

// Gentle audio chime for push alerts using Web Audio API
export function playChimeSound(): void {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5

    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.35);
  } catch {
    // Audio context may be restricted before user interaction
  }
}

/**
 * Dispatches an in-app and browser push notification
 */
export async function dispatchPushNotification(
  title: string,
  message: string,
  type: PushNotificationItem['type'] = 'upcoming_lecture',
  subjectId?: string
): Promise<void> {
  const newNotif: PushNotificationItem = {
    id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    title,
    message,
    type,
    timestamp: 'Just now',
    read: false,
    subjectId,
  };

  storedNotifications = [newNotif, ...storedNotifications.slice(0, 24)];
  persistAndBroadcast();
  playChimeSound();

  // Trigger Native Browser Web Notification if permission is granted
  if (typeof window !== 'undefined' && 'Notification' in window) {
    if (Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body: message,
          icon: '/favicon.ico',
        });
      } catch (err) {
        console.warn('Native notification failed:', err);
      }
    }
  }
}

export async function requestPushPermission(): Promise<NotificationPermission> {
  if (typeof window !== 'undefined' && 'Notification' in window) {
    const permission = await Notification.requestPermission();
    return permission;
  }
  return 'denied';
}

export function markNotificationAsRead(id: string): void {
  storedNotifications = storedNotifications.map(n => (n.id === id ? { ...n, read: true } : n));
  persistAndBroadcast();
}

export function markAllNotificationsRead(): void {
  storedNotifications = storedNotifications.map(n => ({ ...n, read: true }));
  persistAndBroadcast();
}

export function clearNotifications(): void {
  storedNotifications = [];
  persistAndBroadcast();
}

/**
 * Checks for upcoming lectures for today and alerts the student
 */
export function checkUpcomingLectures(slots: TimetableSlot[], subjects: Subject[]): {
  upcomingSlot?: TimetableSlot;
  subject?: Subject;
  minutesRemaining?: number;
} {
  const days: TimetableSlot['day'][] = ['Sunday' as any, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const now = new Date();
  const currentDay = days[now.getDay()];

  const todaySlots = slots.filter(s => s.day === currentDay);
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  let upcomingSlot: TimetableSlot | undefined;
  let subject: Subject | undefined;
  let minDiff = Infinity;

  for (const slot of todaySlots) {
    const [startH, startM] = slot.startTime.split(':').map(Number);
    const slotStartMinutes = startH * 60 + startM;
    const diff = slotStartMinutes - currentMinutes;

    // Slot is within next 120 minutes or currently ongoing
    if (diff >= -10 && diff < minDiff) {
      minDiff = diff;
      upcomingSlot = slot;
      subject = subjects.find(s => s.id === slot.subjectId);
    }
  }

  return {
    upcomingSlot,
    subject,
    minutesRemaining: minDiff === Infinity ? undefined : minDiff,
  };
}
