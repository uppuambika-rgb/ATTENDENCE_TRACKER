import React, { useState, useEffect } from 'react';
import { PushNotificationItem, TimetableSlot, Subject } from '../types';
import {
  getNotifications,
  subscribeNotifications,
  markNotificationAsRead,
  markAllNotificationsRead,
  clearNotifications,
  requestPushPermission,
  dispatchPushNotification,
  checkUpcomingLectures,
} from '../utils/notifications';
import { Bell, X, ShieldAlert, Clock, CheckCheck, Trash2, Send, Sparkles } from 'lucide-react';

interface PushNotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  slots: TimetableSlot[];
  subjects: Subject[];
  onSelectSubject?: (subjectId: string) => void;
}

export const PushNotificationDrawer: React.FC<PushNotificationDrawerProps> = ({
  isOpen,
  onClose,
  slots,
  subjects,
  onSelectSubject,
}) => {
  const [notifications, setNotifications] = useState<PushNotificationItem[]>([]);
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermission(Notification.permission);
    }
    const unsubscribe = subscribeNotifications(items => {
      setNotifications(items);
    });
    return unsubscribe;
  }, []);

  if (!isOpen) return null;

  const handleRequestPermission = async () => {
    const perm = await requestPushPermission();
    setPermission(perm);
    if (perm === 'granted') {
      dispatchPushNotification(
        '🎉 Desktop Push Notifications Enabled!',
        'You will now receive automatic real-time reminders before upcoming lectures and critical 75% debarment warnings.',
        'system'
      );
    }
  };

  const handleTestUpcomingPush = () => {
    const { upcomingSlot, subject } = checkUpcomingLectures(slots, subjects);
    if (upcomingSlot && subject) {
      dispatchPushNotification(
        `🔔 Upcoming Lecture in 15 Minutes: ${subject.code}`,
        `${subject.name} starts at ${upcomingSlot.startTime} in ${upcomingSlot.room}. Faculty: ${subject.faculty}.`,
        'upcoming_lecture',
        subject.id
      );
    } else {
      dispatchPushNotification(
        '🔔 Upcoming Lecture in 15 Minutes: CS301',
        'Database Management Systems starts at 09:00 AM in CS-Block 302. Don\'t forget to punch in!',
        'upcoming_lecture',
        'sub_cs301'
      );
    }
  };

  const handleTestShortagePush = () => {
    dispatchPushNotification(
      '⚠️ Urgent: 75% Attendance Shortage Alert',
      'Operating Systems (CS302) attendance is at 70.0% (Under 75% threshold!). Debarment risk active. You must attend the next 6 classes.',
      'shortage_warning',
      'sub_cs302'
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md bg-[#0F172A] border-l border-slate-700 h-full flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-4 px-6 border-b border-slate-800 bg-[#0B1120] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/30 border border-indigo-500/40 text-indigo-400 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight">Push Notification Hub</h2>
              <p className="text-[11px] text-slate-400">Lecture Reminders &amp; Shortage Warnings</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Permission Banner & Test Controls */}
        <div className="p-4 bg-slate-900/80 border-b border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300 font-medium">Browser Web Push Status:</span>
            <span
              className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] ${
                permission === 'granted'
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  : 'bg-amber-950 text-amber-300 border border-amber-800'
              }`}
            >
              {permission.toUpperCase()}
            </span>
          </div>

          {permission !== 'granted' && (
            <button
              onClick={handleRequestPermission}
              className="w-full py-2 px-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/30"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Enable Browser Push Notifications</span>
            </button>
          )}

          {/* Test Dispatchers */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={handleTestUpcomingPush}
              className="py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-[11px] font-semibold transition-colors flex items-center justify-center gap-1"
              title="Test lecture reminder notification"
            >
              <Clock className="w-3 h-3 text-cyan-400" />
              <span>Test Lecture Push</span>
            </button>
            <button
              onClick={handleTestShortagePush}
              className="py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-[11px] font-semibold transition-colors flex items-center justify-center gap-1"
              title="Test 75% attendance warning alert"
            >
              <ShieldAlert className="w-3 h-3 text-rose-400" />
              <span>Test 75% Warning</span>
            </button>
          </div>
        </div>

        {/* Actions bar */}
        <div className="px-6 py-2.5 bg-[#0B1120]/60 border-b border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <span>{notifications.length} notification{notifications.length !== 1 ? 's' : ''}</span>
          <div className="flex items-center gap-3">
            <button
              onClick={markAllNotificationsRead}
              className="hover:text-white flex items-center gap-1 transition-colors"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Mark all read</span>
            </button>
            <button
              onClick={clearNotifications}
              className="hover:text-rose-400 flex items-center gap-1 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          </div>
        </div>

        {/* Feed List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {notifications.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              <Bell className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-xs">No active notifications</p>
              <p className="text-[11px] mt-1 text-slate-600">
                You will be notified before classes and whenever attendance drops under 75%.
              </p>
            </div>
          ) : (
            notifications.map(item => (
              <div
                key={item.id}
                onClick={() => {
                  markNotificationAsRead(item.id);
                  if (item.subjectId && onSelectSubject) {
                    onSelectSubject(item.subjectId);
                  }
                }}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                  !item.read
                    ? item.type === 'shortage_warning'
                      ? 'bg-rose-950/40 border-rose-800/80 shadow-md shadow-rose-950/30'
                      : 'bg-indigo-950/40 border-indigo-800/80 shadow-md shadow-indigo-950/30'
                    : 'bg-slate-900/60 border-slate-800 opacity-75 hover:opacity-100'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {item.type === 'shortage_warning' ? (
                      <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                    ) : (
                      <Clock className="w-4 h-4 text-cyan-400 shrink-0" />
                    )}
                    <h3 className="text-xs font-bold text-white line-clamp-1">{item.title}</h3>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono shrink-0">
                    {item.timestamp}
                  </span>
                </div>

                <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                  {item.message}
                </p>

                <div className="mt-2 flex items-center justify-between text-[10px]">
                  <span className="font-mono text-slate-500">
                    {item.type === 'shortage_warning' ? 'Academic Shortage' : 'Timetable Alert'}
                  </span>
                  {!item.read && (
                    <span className="text-indigo-400 font-semibold font-mono">New</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
