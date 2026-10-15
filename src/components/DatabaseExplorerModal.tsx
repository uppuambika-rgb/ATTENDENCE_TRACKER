import React, { useState, useEffect } from 'react';
import {
  getAllUsers,
  saveAllUsers,
  UserAccount,
  DEFAULT_USER,
  sanitizePhone,
  generateOtp,
} from '../utils/authDatabase';
import {
  Database,
  Table,
  KeyRound,
  Phone,
  Calendar,
  Layers,
  Sparkles,
  X,
  RefreshCw,
  Download,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Code,
  HardDrive,
  UserPlus,
} from 'lucide-react';

interface DatabaseExplorerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserId?: string;
  onUserSelected?: (user: UserAccount) => void;
}

export const DatabaseExplorerModal: React.FC<DatabaseExplorerModalProps> = ({
  isOpen,
  onClose,
  currentUserId,
  onUserSelected,
}) => {
  const [activeTab, setActiveTab] = useState<'records' | 'schema' | 'otp_store' | 'sql'>('records');
  const [users, setUsers] = useState<Record<string, UserAccount>>({});
  const [selectedUserPhone, setSelectedUserPhone] = useState<string>('');
  const [otpStore, setOtpStore] = useState<Record<string, { otp: string; expiresAt: number }>>({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [quickPhone, setQuickPhone] = useState('9123456789');
  const [quickOtpNotice, setQuickOtpNotice] = useState<string | null>(null);

  // Refresh DB state from localStorage
  const refreshDbState = () => {
    const all = getAllUsers();
    setUsers(all);
    const phones = Object.keys(all);
    if (!selectedUserPhone && phones.length > 0) {
      setSelectedUserPhone(phones[0]);
    }

    try {
      const otps = JSON.parse(localStorage.getItem('attendx_otp_temp_store') || '{}');
      setOtpStore(otps);
    } catch {
      setOtpStore({});
    }
  };

  useEffect(() => {
    if (isOpen) {
      refreshDbState();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const userList = Object.values(users);
  const selectedUser = users[selectedUserPhone] || userList[0];

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(users, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `attendx_database_dump_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleGenerateTestOtp = () => {
    const clean = sanitizePhone(quickPhone);
    if (clean.length < 10) return;
    const res = generateOtp(clean);
    setQuickOtpNotice(`Generated 4-digit OTP: [ ${res.otp} ] for ${clean}`);
    refreshDbState();
    setTimeout(() => setQuickOtpNotice(null), 8000);
  };

  const handleResetToDefaultSeed = () => {
    if (window.confirm('Reset database to initial seed record (Ambika Uppu)? This will clear custom test users.')) {
      const initial = { [DEFAULT_USER.phoneNumber]: DEFAULT_USER };
      saveAllUsers(initial);
      localStorage.setItem('attendx_active_phone_session', DEFAULT_USER.phoneNumber);
      refreshDbState();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-cyan-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-inner">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  Application Database Explorer
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  STATUS: ONLINE &amp; PERSISTENT
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Phone Number Primary Key Database &bull; 4-Digit OTP Table &bull; Timetable &amp; Attendance Entities
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={refreshDbState}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              title="Refresh DB Snapshot"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/70 px-4 gap-2 pt-2">
          <button
            onClick={() => setActiveTab('records')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-t-xl transition-all ${
              activeTab === 'records'
                ? 'bg-slate-900 text-cyan-300 border-t border-x border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Table className="w-3.5 h-3.5" />
            User Records ({userList.length})
          </button>

          <button
            onClick={() => setActiveTab('otp_store')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-t-xl transition-all ${
              activeTab === 'otp_store'
                ? 'bg-slate-900 text-pink-300 border-t border-x border-pink-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            4-Digit OTP Session Store ({Object.keys(otpStore).length})
          </button>

          <button
            onClick={() => setActiveTab('schema')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-t-xl transition-all ${
              activeTab === 'schema'
                ? 'bg-slate-900 text-purple-300 border-t border-x border-purple-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Database Schema &amp; Storage Keys
          </button>

          <button
            onClick={() => setActiveTab('sql')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-t-xl transition-all ${
              activeTab === 'sql'
                ? 'bg-slate-900 text-indigo-300 border-t border-x border-indigo-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            PostgreSQL / JPA DDL
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 text-slate-300 text-xs leading-relaxed space-y-4">
          {activeTab === 'records' && (
            <div className="space-y-4">
              {/* Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl">
                  <div className="text-[10px] uppercase font-mono text-slate-400">Total Registered Users</div>
                  <div className="text-xl font-bold text-white mt-1">{userList.length} Accounts</div>
                  <div className="text-[10px] text-cyan-400 mt-0.5">Primary Key: Phone #</div>
                </div>

                <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl">
                  <div className="text-[10px] uppercase font-mono text-slate-400">Storage Engine</div>
                  <div className="text-xl font-bold text-emerald-400 mt-1">Browser LocalDB</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">attendx_users_db_v2</div>
                </div>

                <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl">
                  <div className="text-[10px] uppercase font-mono text-slate-400">Active User Session</div>
                  <div className="text-base font-bold text-pink-300 mt-1 truncate">
                    {selectedUser ? selectedUser.name : 'None'}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                    {selectedUser ? selectedUser.phoneNumber : ''}
                  </div>
                </div>

                <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl flex flex-col justify-between">
                  <div className="text-[10px] uppercase font-mono text-slate-400">Database Tools</div>
                  <div className="flex items-center gap-1.5 mt-2">
                    <button
                      onClick={handleExportJson}
                      className="flex-1 flex items-center justify-center gap-1 px-2 py-1 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-500/40 rounded-lg text-[10px] font-semibold transition-all"
                    >
                      <Download className="w-3 h-3" />
                      JSON Dump
                    </button>
                    <button
                      onClick={handleResetToDefaultSeed}
                      className="px-2 py-1 bg-rose-950/50 hover:bg-rose-900/60 text-rose-300 border border-rose-800/40 rounded-lg text-[10px] font-semibold transition-all"
                      title="Reset DB"
                    >
                      Reset
                    </button>
                  </div>
                </div>
              </div>

              {/* Master-Detail View */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* User List Column */}
                <div className="border border-slate-800 rounded-xl bg-slate-950/60 p-3 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-200 pb-1 border-b border-slate-800">
                    <span>Registered Phone Numbers</span>
                    <span className="font-mono text-[10px] text-slate-400">Table: users</span>
                  </div>

                  <div className="space-y-1.5 max-h-[320px] overflow-y-auto pr-1">
                    {userList.map((usr) => (
                      <div
                        key={usr.phoneNumber}
                        onClick={() => setSelectedUserPhone(usr.phoneNumber)}
                        className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                          selectedUserPhone === usr.phoneNumber
                            ? 'bg-cyan-950/50 border-cyan-500/60 text-white shadow-md'
                            : 'bg-slate-900/60 border-slate-800/60 hover:bg-slate-800/60 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs truncate">{usr.name}</span>
                          <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                            {usr.regNo}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-1 font-mono text-[11px] text-cyan-400">
                          <Phone className="w-3 h-3 text-cyan-500" />
                          <span>{usr.phoneNumber}</span>
                        </div>
                        <div className="flex items-center justify-between mt-1 text-[10px] text-slate-400">
                          <span>{usr.section}</span>
                          <span>{usr.attendanceRecords?.length || 0} logs</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Selected Record Detail Column */}
                {selectedUser && (
                  <div className="md:col-span-2 border border-slate-800 rounded-xl bg-slate-950/60 p-4 space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                      <div>
                        <h3 className="text-sm font-bold text-white flex items-center gap-2">
                          <span>{selectedUser.name}</span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                            PRIMARY KEY: {selectedUser.phoneNumber}
                          </span>
                        </h3>
                        <p className="text-[11px] text-slate-400">
                          Registered: {new Date(selectedUser.createdAt).toLocaleDateString()} &bull; Last Login:{' '}
                          {new Date(selectedUser.lastLoginAt).toLocaleTimeString()}
                        </p>
                      </div>

                      {onUserSelected && (
                        <button
                          onClick={() => {
                            onUserSelected(selectedUser);
                            onClose();
                          }}
                          className="px-2.5 py-1 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-all"
                        >
                          Switch to this User
                        </button>
                      )}
                    </div>

                    {/* Database Fields */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                        <div className="text-[9px] uppercase font-mono text-slate-400">Password Hash</div>
                        <div className="font-mono text-xs text-amber-300 truncate font-semibold mt-0.5">
                          {selectedUser.passwordHash || '(None)'}
                        </div>
                      </div>

                      <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                        <div className="text-[9px] uppercase font-mono text-slate-400">Registration #</div>
                        <div className="font-mono text-xs text-white font-semibold mt-0.5">
                          {selectedUser.regNo}
                        </div>
                      </div>

                      <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                        <div className="text-[9px] uppercase font-mono text-slate-400">Section &amp; Room</div>
                        <div className="text-xs text-white truncate font-semibold mt-0.5">
                          {selectedUser.section}
                        </div>
                      </div>

                      <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                        <div className="text-[9px] uppercase font-mono text-slate-400">Enrolled Subjects</div>
                        <div className="font-mono text-xs text-cyan-300 font-semibold mt-0.5">
                          {selectedUser.subjects?.length || 0} courses
                        </div>
                      </div>

                      <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                        <div className="text-[9px] uppercase font-mono text-slate-400">Timetable Slots</div>
                        <div className="font-mono text-xs text-indigo-300 font-semibold mt-0.5">
                          {selectedUser.timetable?.length || 0} weekly slots
                        </div>
                      </div>

                      <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                        <div className="text-[9px] uppercase font-mono text-slate-400">Aesthetic Theme</div>
                        <div className="text-xs text-pink-300 capitalize font-semibold mt-0.5">
                          {selectedUser.theme.replace('_', ' ')}
                        </div>
                      </div>
                    </div>

                    {/* Raw JSON Record Preview */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span className="font-mono">JSON Document Representation:</span>
                        <button
                          onClick={() =>
                            handleCopy(JSON.stringify(selectedUser, null, 2), `json_${selectedUser.phoneNumber}`)
                          }
                          className="text-[10px] text-cyan-400 hover:text-cyan-300 font-mono"
                        >
                          {copiedKey === `json_${selectedUser.phoneNumber}` ? 'Copied!' : 'Copy JSON'}
                        </button>
                      </div>
                      <pre className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 text-[10px] font-mono text-emerald-300/90 overflow-x-auto max-h-[140px]">
                        {JSON.stringify(
                          {
                            phoneNumber: selectedUser.phoneNumber,
                            name: selectedUser.name,
                            passwordHash: selectedUser.passwordHash,
                            regNo: selectedUser.regNo,
                            section: selectedUser.section,
                            year: selectedUser.year,
                            semester: selectedUser.semester,
                            branch: selectedUser.branch,
                            subjects_count: selectedUser.subjects?.length,
                            timetable_slots_count: selectedUser.timetable?.length,
                            attendance_records_count: selectedUser.attendanceRecords?.length,
                            theme: selectedUser.theme,
                          },
                          null,
                          2
                        )}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'otp_store' && (
            <div className="space-y-4">
              <div className="p-3 bg-pink-950/30 border border-pink-500/30 rounded-xl text-pink-200">
                <div className="flex items-center gap-2 font-bold text-xs text-white">
                  <KeyRound className="w-4 h-4 text-pink-400" />
                  4-Digit OTP Table (Temporary Ephemeral Store)
                </div>
                <p className="text-[11px] text-pink-300/80 mt-1">
                  When a user enters their phone number to sign up or sign in, a cryptographically secure 4-digit code is
                  generated, stored in the <code>attendx_otp_temp_store</code> database table with a 5-minute TTL expiry,
                  and verified upon entry.
                </p>
              </div>

              {/* Quick OTP Generator Tool */}
              <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl flex flex-col sm:flex-row items-center gap-2.5">
                <span className="text-xs font-semibold text-slate-300">Generate Test OTP:</span>
                <input
                  type="text"
                  value={quickPhone}
                  onChange={(e) => setQuickPhone(e.target.value)}
                  placeholder="Enter 10-digit phone"
                  className="bg-slate-900 border border-slate-700 px-2.5 py-1.5 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-pink-500"
                />
                <button
                  onClick={handleGenerateTestOtp}
                  className="px-3 py-1.5 bg-pink-600 hover:bg-pink-500 text-white rounded-lg text-xs font-semibold transition-all"
                >
                  Generate 4-Digit OTP
                </button>
                {quickOtpNotice && (
                  <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/50 px-2.5 py-1 rounded-lg border border-emerald-800">
                    {quickOtpNotice}
                  </span>
                )}
              </div>

              {/* OTP Table */}
              <div className="border border-slate-800 rounded-xl bg-slate-950/60 overflow-hidden">
                <div className="p-3 border-b border-slate-800 text-xs font-bold text-white flex items-center justify-between">
                  <span>Active OTP Sessions in Database</span>
                  <span className="font-mono text-[10px] text-slate-400">
                    Total: {Object.keys(otpStore).length}
                  </span>
                </div>

                {Object.keys(otpStore).length === 0 ? (
                  <div className="p-6 text-center text-slate-500">
                    <p>No active OTP sessions in database right now.</p>
                    <p className="text-[10px] text-slate-600 mt-1">
                      OTPs are automatically consumed and cleared after successful sign-in or after 5 minutes.
                    </p>
                  </div>
                ) : (
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900/80 text-slate-400 font-mono text-[10px] border-b border-slate-800">
                      <tr>
                        <th className="py-2 px-3">Phone Number (Key)</th>
                        <th className="py-2 px-3">4-Digit OTP Code</th>
                        <th className="py-2 px-3">Expires At</th>
                        <th className="py-2 px-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                      {Object.entries(otpStore).map(([phoneNum, sess]) => {
                        const isExpired = Date.now() > sess.expiresAt;
                        const remainingSec = Math.max(0, Math.round((sess.expiresAt - Date.now()) / 1000));
                        return (
                          <tr key={phoneNum} className="hover:bg-slate-900/40">
                            <td className="py-2.5 px-3 font-semibold text-cyan-300">{phoneNum}</td>
                            <td className="py-2.5 px-3">
                              <span className="px-2 py-0.5 rounded bg-pink-950 text-pink-300 font-bold border border-pink-800">
                                {sess.otp}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-slate-400">
                              {new Date(sess.expiresAt).toLocaleTimeString()} ({remainingSec}s left)
                            </td>
                            <td className="py-2.5 px-3">
                              {isExpired ? (
                                <span className="text-rose-400 text-[10px]">EXPIRED</span>
                              ) : (
                                <span className="text-emerald-400 text-[10px]">ACTIVE &bull; READY</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {activeTab === 'schema' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* User Schema */}
                <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 font-bold text-xs text-cyan-300">
                    <Table className="w-4 h-4 text-cyan-400" />
                    Table: <code>users</code>
                  </div>
                  <div className="space-y-1 font-mono text-[11px]">
                    <div className="flex justify-between border-b border-slate-800/60 py-1">
                      <span className="text-white font-bold">phoneNumber</span>
                      <span className="text-cyan-400">VARCHAR(15) [PRIMARY KEY]</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-800/60 py-1">
                      <span className="text-slate-300">name</span>
                      <span className="text-slate-400">VARCHAR(100)</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-800/60 py-1">
                      <span className="text-slate-300">passwordHash</span>
                      <span className="text-slate-400">VARCHAR(255)</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-800/60 py-1">
                      <span className="text-slate-300">regNo</span>
                      <span className="text-slate-400">VARCHAR(30) UNIQUE</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-800/60 py-1">
                      <span className="text-slate-300">section</span>
                      <span className="text-slate-400">VARCHAR(50)</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-800/60 py-1">
                      <span className="text-slate-300">year / semester</span>
                      <span className="text-slate-400">INT</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-800/60 py-1">
                      <span className="text-slate-300">theme</span>
                      <span className="text-slate-400">VARCHAR(40) (Aesthetic)</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-800/60 py-1">
                      <span className="text-slate-300">timetable</span>
                      <span className="text-purple-400">JSONB / Array (Slots)</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-300">attendanceRecords</span>
                      <span className="text-indigo-400">JSONB / Array (History)</span>
                    </div>
                  </div>
                </div>

                {/* OTP & Session Schema */}
                <div className="space-y-3">
                  <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2">
                    <div className="flex items-center gap-2 font-bold text-xs text-pink-300">
                      <KeyRound className="w-4 h-4 text-pink-400" />
                      Table: <code>otp_sessions</code>
                    </div>
                    <div className="space-y-1 font-mono text-[11px]">
                      <div className="flex justify-between border-b border-slate-800/60 py-1">
                        <span className="text-white font-bold">phoneNumber</span>
                        <span className="text-pink-400">VARCHAR(15) [KEY]</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-800/60 py-1">
                        <span className="text-slate-300">otp</span>
                        <span className="text-pink-300 font-bold">VARCHAR(4)</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-slate-300">expiresAt</span>
                        <span className="text-slate-400">BIGINT (Epoch Millis)</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2">
                    <div className="flex items-center gap-2 font-bold text-xs text-emerald-300">
                      <HardDrive className="w-4 h-4 text-emerald-400" />
                      Browser LocalStorage Database Keys
                    </div>
                    <div className="space-y-1 font-mono text-[10px]">
                      <div className="text-slate-300 font-bold">1. attendx_users_db_v2</div>
                      <p className="text-slate-400 pl-3">Stores all user accounts keyed by phone number</p>
                      <div className="text-slate-300 font-bold">2. attendx_active_phone_session</div>
                      <p className="text-slate-400 pl-3">Stores current logged-in phone session ID</p>
                      <div className="text-slate-300 font-bold">3. attendx_otp_temp_store</div>
                      <p className="text-slate-400 pl-3">Stores pending 4-digit OTPs with expiration TTL</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'sql' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                <span>Relational PostgreSQL DDL &amp; Java JPA Entity Mapping:</span>
                <button
                  onClick={() =>
                    handleCopy(
                      `-- B.Tech Attendance Tracker Relational Database DDL
CREATE TABLE students (
    phone_number VARCHAR(15) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    reg_no VARCHAR(30) UNIQUE NOT NULL,
    section VARCHAR(50) NOT NULL,
    year INT NOT NULL,
    semester INT NOT NULL,
    branch VARCHAR(100) NOT NULL,
    theme VARCHAR(50) DEFAULT 'kawaii_pastel',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE otp_sessions (
    phone_number VARCHAR(15) PRIMARY KEY,
    otp_code VARCHAR(4) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE timetable_slots (
    id SERIAL PRIMARY KEY,
    student_phone VARCHAR(15) REFERENCES students(phone_number) ON DELETE CASCADE,
    day_of_week VARCHAR(10) NOT NULL,
    start_time VARCHAR(10) NOT NULL,
    end_time VARCHAR(10) NOT NULL,
    subject_code VARCHAR(20) NOT NULL,
    room_number VARCHAR(30),
    faculty_name VARCHAR(100)
);

CREATE TABLE attendance_records (
    id SERIAL PRIMARY KEY,
    student_phone VARCHAR(15) REFERENCES students(phone_number) ON DELETE CASCADE,
    subject_code VARCHAR(20) NOT NULL,
    date DATE NOT NULL,
    status VARCHAR(10) CHECK (status IN ('PRESENT', 'ABSENT', 'CANCELLED')),
    marked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);`,
                      'ddl_sql'
                    )
                  }
                  className="text-[11px] text-indigo-400 hover:text-indigo-300 font-mono"
                >
                  {copiedKey === 'ddl_sql' ? 'Copied!' : 'Copy SQL Script'}
                </button>
              </div>

              <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-cyan-300 overflow-x-auto max-h-[340px]">
{`-- 1. Students / User Accounts Table (Indexed by Phone Number)
CREATE TABLE students (
    phone_number VARCHAR(15) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    reg_no VARCHAR(30) UNIQUE NOT NULL,
    section VARCHAR(50) NOT NULL,
    year INT NOT NULL,
    semester INT NOT NULL,
    branch VARCHAR(100) NOT NULL,
    theme VARCHAR(50) DEFAULT 'kawaii_pastel',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP WITH TIME ZONE
);

-- 2. 4-Digit OTP Table (with 5-minute expiry)
CREATE TABLE otp_sessions (
    phone_number VARCHAR(15) PRIMARY KEY,
    otp_code VARCHAR(4) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- 3. Personalized Timetable Slots Table
CREATE TABLE timetable_slots (
    id SERIAL PRIMARY KEY,
    student_phone VARCHAR(15) REFERENCES students(phone_number) ON DELETE CASCADE,
    day_of_week VARCHAR(10) NOT NULL,
    start_time VARCHAR(10) NOT NULL,
    end_time VARCHAR(10) NOT NULL,
    subject_code VARCHAR(20) NOT NULL,
    room_number VARCHAR(30),
    faculty_name VARCHAR(100)
);

-- 4. Attendance Records Table
CREATE TABLE attendance_records (
    id SERIAL PRIMARY KEY,
    student_phone VARCHAR(15) REFERENCES students(phone_number) ON DELETE CASCADE,
    subject_code VARCHAR(20) NOT NULL,
    date DATE NOT NULL,
    status VARCHAR(10) CHECK (status IN ('PRESENT', 'ABSENT', 'CANCELLED')),
    marked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);`}
              </pre>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-800 bg-slate-950">
          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Database data automatically syncs upon every attendance update and timetable edit.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-semibold transition-all"
          >
            Close Explorer
          </button>
        </div>
      </div>
    </div>
  );
};
