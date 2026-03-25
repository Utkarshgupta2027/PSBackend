import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser, loginWithOtp, sendOtp } from '../api/api';
import { useAuth } from '../context/AuthContext';

const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);
const EyeOffIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-5 0-9-4-9-7a9.77 9.77 0 012.197-5.328M6.1 6.1C7.42 5.4 9.16 5 12 5c5 0 9 4 9 7a9.77 9.77 0 01-3.13 4.87M15 12a3 3 0 01-3 3m0 0a3 3 0 01-3-3m3 3v.01M3 3l18 18" />
  </svg>
);

const COUNTDOWN = 60;

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  // tab: 'email' | 'phone'
  const [tab, setTab] = useState('phone');

  // Email login
  const [emailForm, setEmailForm]   = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);

  // Phone OTP login
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp]                 = useState('');
  const [otpSent, setOtpSent]         = useState(false);
  const [countdown, setCountdown]     = useState(0);
  const timerRef = useRef(null);
  const [otpLoading, setOtpLoading]   = useState(false);

  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    return () => clearInterval(timerRef.current);
  }, []);

  const startCountdown = () => {
    setCountdown(COUNTDOWN);
    timerRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) { clearInterval(timerRef.current); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSendOtp = async () => {
    const phone = phoneNumber.trim();
    if (!phone || phone.length < 10) {
      setError('Please enter a valid phone number with country code (e.g. +91XXXXXXXXXX).');
      return;
    }
    setError('');
    setOtpLoading(true);
    try {
      await sendOtp(phone);
      setOtpSent(true);
      startCountdown();
    } catch (err) {
      const d = err.response?.data;
      setError(typeof d === 'string' ? d : d?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res = await loginUser(emailForm);
      const { token, user } = res.data;
      login(token, user);
      navigate('/dashboard');
    } catch (err) {
      const d = err.response?.data;
      setError(typeof d === 'string' ? d : d?.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneSubmit = async (e) => {
    e.preventDefault();
    if (!otpSent) { setError('Please send an OTP to your phone first.'); return; }
    if (!otp || otp.length !== 6) { setError('Please enter the 6-digit OTP.'); return; }
    setError(''); setLoading(true);
    try {
      const res = await loginWithOtp({ phoneNumber: phoneNumber.trim(), otp });
      const { token, user } = res.data;
      login(token, user);
      navigate('/dashboard');
    } catch (err) {
      const d = err.response?.data;
      setError(typeof d === 'string' ? d : d?.message || 'Invalid or expired OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950 relative overflow-hidden">
      <div className="absolute top-[-200px] left-[-200px] w-[500px] h-[500px] rounded-full bg-primary-600/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-200px] right-[-200px] w-[500px] h-[500px] rounded-full bg-primary-500/10 blur-3xl pointer-events-none" />

      <div className="w-full max-w-md animate-slide-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 shadow-xl shadow-primary-500/30 mb-4">
            <span className="text-3xl font-bold text-white">₹</span>
          </div>
          <h1 className="text-3xl font-bold text-white">Welcome back</h1>
          <p className="text-slate-400 mt-1">Sign in to your PayFlow account</p>
        </div>

        <div className="glass-card p-8">
          {/* Tabs */}
          <div className="flex gap-1 p-1 bg-slate-800/60 border border-slate-700 rounded-xl mb-6">
            <button
              type="button"
              onClick={() => { setTab('phone'); setError(''); }}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                tab === 'phone' ? 'bg-primary-600 text-white shadow-lg shadow-primary-900/40' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              📱 Mobile OTP
            </button>
            <button
              type="button"
              onClick={() => { setTab('email'); setError(''); }}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                tab === 'email' ? 'bg-primary-600 text-white shadow-lg shadow-primary-900/40' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              ✉️ Email
            </button>
          </div>

          {/* ── PHONE OTP TAB ── */}
          {tab === 'phone' && (
            <form onSubmit={handlePhoneSubmit} className="space-y-5">
              <div>
                <label className="label">Mobile Number</label>
                <div className="flex gap-2">
                  <input
                    id="login-phone"
                    type="tel"
                    className="input-field flex-1"
                    placeholder="+91XXXXXXXXXX"
                    value={phoneNumber}
                    onChange={e => setPhoneNumber(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={otpLoading || countdown > 0}
                    className="px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-500 text-white text-sm font-semibold transition-all disabled:opacity-50 whitespace-nowrap flex-shrink-0"
                  >
                    {otpLoading ? (
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                      </svg>
                    ) : countdown > 0 ? `${countdown}s` : otpSent ? 'Resend' : 'Send OTP'}
                  </button>
                </div>
                {otpSent && (
                  <p className="text-xs text-emerald-400 mt-1.5 flex items-center gap-1">
                    <span>✓</span> OTP sent to {phoneNumber}
                  </p>
                )}
              </div>

              {otpSent && (
                <div>
                  <label className="label">Enter OTP</label>
                  <input
                    id="login-otp"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    className="input-field tracking-[0.5em] text-center text-xl font-bold"
                    placeholder="······"
                    value={otp}
                    onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    required
                  />
                </div>
              )}

              {error && <div className="error-box">{error}</div>}

              <button id="login-submit-phone" type="submit" className="btn-primary" disabled={loading}>
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                    Signing in…
                  </span>
                ) : 'Sign In'}
              </button>
            </form>
          )}

          {/* ── EMAIL TAB ── */}
          {tab === 'email' && (
            <form onSubmit={handleEmailSubmit} className="space-y-5">
              <div>
                <label className="label">Email address</label>
                <input id="login-email" type="email" className="input-field" placeholder="you@example.com"
                  value={emailForm.email}
                  onChange={e => setEmailForm({ ...emailForm, email: e.target.value })}
                  required />
              </div>
              <div>
                <label className="label">Password</label>
                <div className="relative">
                  <input id="login-password" type={showPassword ? 'text' : 'password'} className="input-field pr-12"
                    placeholder="••••••••"
                    value={emailForm.password}
                    onChange={e => setEmailForm({ ...emailForm, password: e.target.value })}
                    required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors focus:outline-none" tabIndex={-1}>
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
              </div>

              {error && <div className="error-box">{error}</div>}

              <button id="login-submit" type="submit" className="btn-primary" disabled={loading}>
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                    Signing in…
                  </span>
                ) : 'Sign In'}
              </button>
            </form>
          )}

          <p className="text-center text-slate-500 text-sm mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-400 hover:text-primary-300 font-medium transition-colors">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
