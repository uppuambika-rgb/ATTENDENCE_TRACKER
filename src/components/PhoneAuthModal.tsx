import React, { useState, useEffect, useRef } from 'react';
import {
  UserAccount,
  generateOtp,
  verifyOtp,
  registerUser,
  loginWithPassword,
  loginWithOtpDirect,
  getAllUsers,
  sanitizePhone,
  AppTheme,
} from '../utils/authDatabase';
import { THEMES } from '../utils/theme';
import { playChimeSound } from '../utils/notifications';
import {
  Phone,
  Lock,
  KeyRound,
  ShieldCheck,
  Sparkles,
  X,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  RefreshCw,
  User,
  GraduationCap,
} from 'lucide-react';

interface PhoneAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount | null;
  onUserAuthenticated: (user: UserAccount) => void;
}

export const PhoneAuthModal: React.FC<PhoneAuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUserAuthenticated,
}) => {
  // Auth Modes: 'login_password' | 'enter_phone_otp' | 'enter_4digit_otp' | 'complete_profile'
  const [authMode, setAuthMode] = useState<
    'login_password' | 'enter_phone_otp' | 'enter_4digit_otp' | 'complete_profile'
  >('login_password');

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  // OTP State
  const [generatedOtpCode, setGeneratedOtpCode] = useState<string | null>(null);
  const [otpDigits, setOtpDigits] = useState(['', '', '', '']);
  const [otpCountdown, setOtpCountdown] = useState(0);
  const [showSimulatedSms, setShowSimulatedSms] = useState(false);

  // New Profile State
  const [fullName, setFullName] = useState('');
  const [regNo, setRegNo] = useState('');
  const [section, setSection] = useState('SECTION-6 (N-311)');
  const [year, setYear] = useState<number>(2);
  const [selectedTheme, setSelectedTheme] = useState<AppTheme>('kawaii_pastel');
  const [newPassword, setNewPassword] = useState('');

  // Status & Error messages
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const digitRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  useEffect(() => {
    let timer: any;
    if (otpCountdown > 0) {
      timer = setTimeout(() => setOtpCountdown(c => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [otpCountdown]);

  if (!isOpen) return null;

  // Handle Send 4-Digit OTP
  const handleSendOtp = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage('');
    const clean = sanitizePhone(phone);
    if (clean.length < 10) {
      setErrorMessage('Please enter a valid 10-digit mobile number.');
      return;
    }

    const { otp } = generateOtp(clean);
    setGeneratedOtpCode(otp);
    setOtpDigits(['', '', '', '']);
    setShowSimulatedSms(true);
    setOtpCountdown(45);
    playChimeSound();
    setAuthMode('enter_4digit_otp');

    // Auto-focus first digit
    setTimeout(() => {
      digitRefs[0].current?.focus();
    }, 150);
  };

  // Handle OTP digit changes
  const handleDigitChange = (index: number, val: string) => {
    const char = val.slice(-1);
    const newDigits = [...otpDigits];
    newDigits[index] = char;
    setOtpDigits(newDigits);
    setErrorMessage('');

    // Auto focus next box
    if (char && index < 3) {
      digitRefs[index + 1].current?.focus();
    }

    // Auto-verify when 4th digit entered
    if (index === 3 && char) {
      const fullCode = newDigits.join('');
      verifySubmittedOtp(fullCode);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      digitRefs[index - 1].current?.focus();
    }
  };

  const handlePasteOtp = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 4);
    if (pasted.length === 4) {
      const digits = pasted.split('');
      setOtpDigits(digits);
      verifySubmittedOtp(pasted);
    }
  };

  const autoFillOtp = () => {
    if (generatedOtpCode) {
      const digits = generatedOtpCode.split('');
      setOtpDigits(digits);
      verifySubmittedOtp(generatedOtpCode);
    }
  };

  const verifySubmittedOtp = (code: string) => {
    const clean = sanitizePhone(phone);
    const isValid = verifyOtp(clean, code);

    if (!isValid) {
      setErrorMessage('Invalid or expired OTP. Please check the 4-digit code.');
      return;
    }

    // Check if user already exists
    const users = getAllUsers();
    if (users[clean]) {
      const existingUser = loginWithOtpDirect(clean);
      if (existingUser) {
        setSuccessMessage('Welcome back! OTP verified successfully.');
        playChimeSound();
        setTimeout(() => {
          onUserAuthenticated(existingUser);
          onClose();
        }, 600);
        return;
      }
    }

    // New user: proceed to set password and profile
    playChimeSound();
    setSuccessMessage('OTP verified! Now create your password & profile.');
    setAuthMode('complete_profile');
  };

  // Handle Password Login (Returning users)
  const handlePasswordLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    const clean = sanitizePhone(phone);
    if (!clean) {
      setErrorMessage('Please enter your phone number.');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your account password.');
      return;
    }

    const result = loginWithPassword(clean, password);
    if (!result.success || !result.user) {
      setErrorMessage(result.error || 'Authentication failed. Please verify credentials.');
      return;
    }

    playChimeSound();
    setSuccessMessage(`Welcome back, ${result.user.name}!`);
    setTimeout(() => {
      onUserAuthenticated(result.user!);
      onClose();
    }, 600);
  };

  // Handle Complete Registration & Save to Database
  const handleCompleteRegistration = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!newPassword || newPassword.length < 4) {
      setErrorMessage('Password must be at least 4 characters long.');
      return;
    }
    if (!fullName.trim()) {
      setErrorMessage('Please enter your name.');
      return;
    }

    const clean = sanitizePhone(phone);
    const createdUser = registerUser(clean, newPassword, {
      name: fullName,
      regNo: regNo || '22BCE1042',
      section: section || 'SECTION-6 (N-311)',
      year: (Number(year) as any) || 2,
      semester: 4,
      branch: 'Computer Science & Engineering',
      theme: selectedTheme,
    });

    playChimeSound();
    setSuccessMessage('Account created and saved to database! Login info preserved.');
    setTimeout(() => {
      onUserAuthenticated(createdUser);
      onClose();
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md bg-[#120e24] border border-purple-500/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 px-6 border-b border-purple-500/20 bg-[#1a1433] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-pink-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight">
                  Student Sign In &amp; Account
                </h3>
                <span className="text-[10px] font-mono text-pink-300 bg-pink-950/80 px-2 py-0.5 rounded-full border border-pink-700/60">
                  Phone + OTP
                </span>
              </div>
              <p className="text-xs text-purple-300/80">
                Persistent Database · Timetable &amp; 75% Bunk Sync
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-purple-400 hover:text-white rounded-xl hover:bg-purple-900/40 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Simulated Live SMS Badge */}
        {showSimulatedSms && generatedOtpCode && (
          <div className="mx-6 mt-4 p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950/90 via-teal-950/90 to-slate-900 border border-emerald-500/50 shadow-lg shadow-emerald-950/40 animate-fadeIn">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-xs font-bold text-emerald-300">
                  Simulated SMS to +91 {phone}
                </span>
              </div>
              <button
                onClick={autoFillOtp}
                className="text-[11px] font-bold text-emerald-300 bg-emerald-900/80 hover:bg-emerald-800 px-2.5 py-0.5 rounded-full border border-emerald-600/60 transition-colors"
              >
                Auto-fill
              </button>
            </div>
            <p className="text-xs text-slate-200 mt-1.5 leading-relaxed font-sans">
              Your 4-Digit AttendX verification OTP is:{' '}
              <span className="font-mono font-black text-sm text-emerald-400 bg-black/40 px-2 py-0.5 rounded tracking-widest">
                {generatedOtpCode}
              </span>{' '}
              (valid for 5 mins).
            </p>
          </div>
        )}

        {/* Error / Success Alerts */}
        <div className="px-6 pt-3">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-950/70 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}
          {successMessage && (
            <div className="p-3 rounded-xl bg-emerald-950/70 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{successMessage}</span>
            </div>
          )}
        </div>

        {/* Modal Form Body */}
        <div className="p-6 space-y-4">
          {/* ================= MODE 1: LOGIN WITH PASSWORD (Returning users) ================= */}
          {authMode === 'login_password' && (
            <form onSubmit={handlePasswordLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-purple-200 mb-1.5">
                  Phone Number
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-purple-400 font-mono">
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    placeholder="9876543210"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full pl-12 pr-4 py-2.5 bg-[#1b1535] border border-purple-500/30 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-pink-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-purple-200">Account Password</label>
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMessage('');
                      setAuthMode('enter_phone_otp');
                    }}
                    className="text-[11px] text-pink-400 hover:text-pink-300 hover:underline"
                  >
                    Forgot or use OTP?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type="password"
                    required
                    placeholder="Enter your password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#1b1535] border border-purple-500/30 rounded-xl text-white text-sm focus:outline-none focus:border-pink-500"
                  />
                </div>
              </div>

              {/* Quick Demo Credentials helper */}
              <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-800/50 text-[11px] text-purple-300 space-y-1">
                <span className="font-semibold text-pink-300 block">💡 Quick Login Demo:</span>
                <div className="flex items-center justify-between">
                  <span>Phone: <span className="font-mono text-white">9876543210</span></span>
                  <span>Password: <span className="font-mono text-white">pass123</span></span>
                  <button
                    type="button"
                    onClick={() => {
                      setPhone('9876543210');
                      setPassword('pass123');
                    }}
                    className="px-2 py-0.5 rounded bg-pink-600/40 hover:bg-pink-600/60 text-white font-semibold transition-colors"
                  >
                    Fill
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white font-bold text-xs tracking-wide shadow-lg shadow-pink-500/25 transition-all flex items-center justify-center gap-2"
              >
                <span>Login with Password</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setErrorMessage('');
                    setAuthMode('enter_phone_otp');
                  }}
                  className="text-xs text-purple-300 hover:text-white transition-colors"
                >
                  Don&apos;t have an account?{' '}
                  <span className="font-bold text-pink-400 underline">Sign Up with 4-Digit OTP</span>
                </button>
              </div>
            </form>
          )}

          {/* ================= MODE 2: ENTER PHONE FOR OTP ================= */}
          {authMode === 'enter_phone_otp' && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-purple-200 mb-1.5">
                  Enter Your Mobile Number for 4-Digit OTP Verification:
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-purple-400 font-mono">
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    placeholder="9876543210"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full pl-12 pr-4 py-2.5 bg-[#1b1535] border border-purple-500/30 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-pink-500"
                  />
                </div>
                <p className="text-[11px] text-purple-400 mt-1">
                  We will generate a 4-digit code to securely verify your identity.
                </p>
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white font-bold text-xs tracking-wide shadow-lg shadow-pink-500/25 transition-all flex items-center justify-center gap-2"
              >
                <Smartphone className="w-4 h-4" />
                <span>Generate 4-Digit OTP</span>
              </button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setErrorMessage('');
                    setAuthMode('login_password');
                  }}
                  className="text-xs text-purple-300 hover:text-white transition-colors"
                >
                  Already registered? <span className="font-bold text-pink-400 underline">Login with Password</span>
                </button>
              </div>
            </form>
          )}

          {/* ================= MODE 3: ENTER 4-DIGIT OTP ================= */}
          {authMode === 'enter_4digit_otp' && (
            <div className="space-y-5">
              <div className="text-center">
                <span className="text-xs text-purple-300">
                  Enter 4-digit code sent to{' '}
                  <strong className="text-white font-mono">+91 {phone}</strong>
                </span>
              </div>

              {/* 4 Digit Boxes */}
              <div className="flex items-center justify-center gap-3">
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={digitRefs[idx]}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleDigitChange(idx, e.target.value)}
                    onKeyDown={e => handleKeyDown(idx, e)}
                    onPaste={handlePasteOtp}
                    className="w-14 h-14 text-center text-2xl font-black font-mono text-white bg-[#1b1535] border-2 border-purple-500/40 rounded-2xl focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500/30 transition-all shadow-inner"
                  />
                ))}
              </div>

              <div className="flex items-center justify-between text-xs text-purple-400 px-2">
                <span>
                  {otpCountdown > 0 ? (
                    <span>Resend in <strong className="font-mono text-white">{otpCountdown}s</strong></span>
                  ) : (
                    <button
                      onClick={handleSendOtp}
                      className="text-pink-400 hover:text-pink-300 font-semibold flex items-center gap-1"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Resend OTP</span>
                    </button>
                  )}
                </span>
                <button
                  onClick={() => setAuthMode('enter_phone_otp')}
                  className="text-purple-300 hover:text-white"
                >
                  Change phone number
                </button>
              </div>

              <button
                onClick={() => verifySubmittedOtp(otpDigits.join(''))}
                disabled={otpDigits.join('').length < 4}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white font-bold text-xs tracking-wide shadow-lg shadow-pink-500/25 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Verify &amp; Continue</span>
              </button>
            </div>
          )}

          {/* ================= MODE 4: COMPLETE PROFILE & SET PASSWORD ================= */}
          {authMode === 'complete_profile' && (
            <form onSubmit={handleCompleteRegistration} className="space-y-4">
              <div className="text-center pb-1">
                <span className="text-xs font-bold text-pink-300">
                  🎉 Phone Verified! Setup your permanent password &amp; aesthetic
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-purple-200 mb-1">
                  Create Permanent Password (for future logins) <span className="text-pink-400">*</span>
                </label>
                <input
                  type="password"
                  required
                  placeholder="Choose a password (min 4 chars)"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-[#1b1535] border border-purple-500/30 rounded-xl text-white text-xs focus:outline-none focus:border-pink-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-purple-200 mb-1">
                    Student Full Name <span className="text-pink-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ambika Uppu"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    className="w-full px-3 py-2 bg-[#1b1535] border border-purple-500/30 rounded-xl text-white text-xs focus:outline-none focus:border-pink-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-purple-200 mb-1">
                    Registration Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 22BCE1042"
                    value={regNo}
                    onChange={e => setRegNo(e.target.value)}
                    className="w-full px-3 py-2 bg-[#1b1535] border border-purple-500/30 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-pink-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-purple-200 mb-1">
                    Section
                  </label>
                  <input
                    type="text"
                    placeholder="SECTION-6 (N-311)"
                    value={section}
                    onChange={e => setSection(e.target.value)}
                    className="w-full px-3 py-2 bg-[#1b1535] border border-purple-500/30 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-pink-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-purple-200 mb-1">
                    B.Tech Year
                  </label>
                  <select
                    value={year}
                    onChange={e => setYear(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[#1b1535] border border-purple-500/30 rounded-xl text-white text-xs focus:outline-none focus:border-pink-500"
                  >
                    <option value={1}>1st Year</option>
                    <option value={2}>2nd Year</option>
                    <option value={3}>3rd Year</option>
                    <option value={4}>4th Year</option>
                  </select>
                </div>
              </div>

              {/* Cute & Aesthetic Theme Selector */}
              <div>
                <label className="block text-xs font-semibold text-purple-200 mb-1.5">
                  Choose Your Aesthetic Vibe:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.values(THEMES).map(t => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setSelectedTheme(t.id)}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        selectedTheme === t.id
                          ? 'bg-pink-950/60 border-pink-500 ring-1 ring-pink-500 text-white'
                          : 'bg-[#181329] border-purple-900/60 text-purple-300 hover:border-purple-700'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 text-xs font-bold">
                        <span>{t.cuteIcon}</span>
                        <span>{t.badge}</span>
                      </div>
                      <span className="text-[10px] text-purple-400 block mt-0.5 truncate">
                        {t.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white font-bold text-xs tracking-wide shadow-lg shadow-pink-500/25 transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Save to Database &amp; Launch Dashboard</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
