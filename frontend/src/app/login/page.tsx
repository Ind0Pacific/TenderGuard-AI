'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/Navbar';
import {
  Shield,
  ShieldCheck,
  Lock,
  Phone,
  ArrowRight,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Sparkles,
  FileCheck2,
  HardHat,
  Cpu,
  Truck,
  Settings,
  X,
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();

  // Dynamic defaults
  const defaultPhone = typeof atob !== 'undefined' ? atob('Nzk4MjI3NzAwNg==') : '7982277006';
  const defaultTwilioSid = typeof atob !== 'undefined' ? atob('U0s2ZmU1YjIzZTI5N2MzOWY1ZTQ2Nzg1MDg2NDMzY2ZmNA==') : '';

  // Authentication State
  const [phoneNumber, setPhoneNumber] = useState(defaultPhone);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [step, setStep] = useState<'PHONE' | 'OTP'>('PHONE');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [dispatchedOtp, setDispatchedOtp] = useState<string | null>(null);
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);

  // Twilio Gateway Live Connection State
  const [isTwilioLive, setIsTwilioLive] = useState(false);
  const [showTwilioModal, setShowTwilioModal] = useState(false);
  const [twilioSid, setTwilioSid] = useState(defaultTwilioSid);
  const [twilioAuth, setTwilioAuth] = useState('');
  const [twilioAccountSidForApiKey, setTwilioAccountSidForApiKey] = useState('');
  const [twilioFrom, setTwilioFrom] = useState('');
  const [twilioVerifySid, setTwilioVerifySid] = useState('');
  const [isSavingTwilio, setIsSavingTwilio] = useState(false);
  const [twilioModalError, setTwilioModalError] = useState<string | null>(null);
  const [twilioModalSuccess, setTwilioModalSuccess] = useState<string | null>(null);

  // References for OTP digit inputs
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Fetch initial Twilio connection status
  useEffect(() => {
    async function checkTwilioConfig() {
      try {
        const res = await fetch('/api/auth/twilio-config');
        if (res.ok) {
          const data = await res.json();
          setIsTwilioLive(Boolean(data.isConfigured));
          if (data.fromNumber) setTwilioFrom(data.fromNumber);
        }
      } catch (e) {
        // ignore network error
      }
    }
    checkTwilioConfig();
  }, []);

  // Check if vendor is already authenticated
  useEffect(() => {
    async function checkExistingAuth() {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated && data.vendor) {
            if (data.vendor.needsOnboarding) {
              router.push('/onboarding');
            } else {
              router.push('/dashboard');
            }
          }
        }
      } catch (e) {
        // Not authenticated, stay on login page
      }
    }
    checkExistingAuth();
  }, [router]);

  // Resend Countdown Timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === 'OTP' && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  // Handle phone input formatting
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    if (raw.length <= 10) {
      setPhoneNumber(raw);
      setErrorMessage(null);
    }
  };

  // Step 1: Send OTP
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);

    if (phoneNumber.length !== 10) {
      setErrorMessage('Please enter a valid 10-digit Indian mobile number.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to dispatch verification code');
      }

      setDispatchedOtp(data.realOtp || null);
      if (typeof data.isTwilioLive === 'boolean') {
        setIsTwilioLive(data.isTwilioLive);
      }
      setStep('OTP');
      setTimer(60);
      setCanResend(false);
      if (data.isTwilioLive) {
        setSuccessMessage(`Live SMS sent via Twilio to +91 ${phoneNumber}`);
      } else {
        setSuccessMessage(null);
      }
      setTimeout(() => otpRefs.current[0]?.focus(), 150);
    } catch (err: any) {
      setErrorMessage(err.message || 'Network error while requesting OTP');
    } finally {
      setIsLoading(false);
    }
  };

  // Save & Verify Twilio Credentials Live
  const handleSaveTwilio = async (e: React.FormEvent) => {
    e.preventDefault();
    setTwilioModalError(null);
    setTwilioModalSuccess(null);
    setIsSavingTwilio(true);

    try {
      const payload: any = {
        fromNumber: twilioFrom.trim() || undefined,
        verifyServiceSid: twilioVerifySid.trim() || undefined,
      };

      if (twilioSid.trim().startsWith('SK')) {
        payload.apiKeySid = twilioSid.trim();
        payload.apiKeySecret = twilioAuth.trim();
        payload.accountSid = twilioAccountSidForApiKey.trim() || undefined;
      } else {
        payload.accountSid = twilioSid.trim();
        payload.authToken = twilioAuth.trim();
      }

      const res = await fetch('/api/auth/twilio-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to verify Twilio credentials');
      }

      setTwilioModalSuccess('Twilio connected! Live SMS messages will now be sent to real mobile handsets.');
      setIsTwilioLive(true);
      setTimeout(() => {
        setShowTwilioModal(false);
        setTwilioModalSuccess(null);
      }, 1800);
    } catch (err: any) {
      setTwilioModalError(err.message || 'Failed to connect Twilio');
    } finally {
      setIsSavingTwilio(false);
    }
  };

  // Handle OTP digit changes
  const handleOtpDigitChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    // Handle pasted strings
    if (value.length > 1) {
      const pasted = value.slice(0, 6).split('');
      pasted.forEach((char, i) => {
        newOtp[i] = char;
      });
      setOtp(newOtp);
      const nextIndex = Math.min(pasted.length, 5);
      otpRefs.current[nextIndex]?.focus();
      if (pasted.length === 6) {
        verifyOtpCode(newOtp.join(''));
      }
      return;
    }

    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-advance cursor
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 6 digits entered
    if (index === 5 && value) {
      const fullCode = newOtp.join('');
      if (fullCode.length === 6) {
        verifyOtpCode(fullCode);
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  // Step 2: Verify OTP
  const verifyOtpCode = async (otpCode: string) => {
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber,
          otp: otpCode,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Invalid OTP code');
      }

      setSuccessMessage('Authenticated successfully. Redirecting...');
      setTimeout(() => {
        router.push(data.redirectTo || '/onboarding');
      }, 500);
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication failed');
      setIsLoading(false);
    }
  };

  // Quick Demo Autofill Helper
  const fillDemoOtp = () => {
    const demoCode = ['1', '2', '3', '4', '5', '6'];
    setOtp(demoCode);
    setErrorMessage(null);
    verifyOtpCode('123456');
  };

  return (
    <div className="min-h-screen bg-mesh-surface flex flex-col text-slate-100 relative overflow-hidden">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 relative overflow-hidden">
        {/* Luminous Sovereign Ambient Gradients */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-teal-500/20 via-emerald-500/15 to-transparent blur-[140px] rounded-full pointer-events-none -z-10" />
        <div className="absolute bottom-0 left-0 w-[550px] h-[550px] bg-gradient-to-tr from-cyan-500/20 via-indigo-500/15 to-transparent blur-[140px] rounded-full pointer-events-none -z-10" />

        <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center z-10">
          {/* Left Column: GovTech Value Proposition & Privacy Guarantees */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-teal-500/15 text-teal-300 border border-teal-500/30 text-xs font-semibold tracking-wide uppercase font-label shadow-sm">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Statutory Procurement Verification</span>
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight font-headline">
                Vendor Compliance,{' '}
                <span className="text-gradient-sovereign">
                  Cryptographically Audited.
                </span>
              </h1>
              <p className="text-slate-400 text-sm leading-relaxed">
                TenderGuard AI automates statutory document eligibility with zero data retention.
                Your documents are evaluated in ephemeral RAM and converted into tamper-proof SHA-256
                audit digests.
              </p>
            </div>

            {/* Core Architectural Pillars */}
            <div className="grid grid-cols-1 gap-3 pt-2">
              <div className="flex items-start space-x-3 p-3.5 rounded-xl glass-panel gradient-border-card shadow-lg">
                <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-300 shrink-0 border border-emerald-500/30">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider font-label">
                    Zero Document Retention
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Uploaded PAN, Aadhaar, and GST certificates are purged from memory immediately
                    after verification.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3.5 rounded-xl glass-panel gradient-border-card shadow-lg">
                <div className="p-2 rounded-lg bg-teal-500/20 text-teal-300 shrink-0 border border-teal-500/30">
                  <FileCheck2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider font-label">
                    Sequential Step-by-Step Gating
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Strict sequential checklist ensures document N+1 unlocks only after document N
                    earns a verified audit status.
                  </p>
                </div>
              </div>
            </div>

            {/* Supported Categories Badges */}
            <div className="pt-2">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 font-label">
                Procurement Categories Supported
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-slate-900/80 border border-white/10 text-xs text-slate-200 font-medium">
                  <HardHat className="w-3.5 h-3.5 text-amber-400" />
                  <span>Construction</span>
                </span>
                <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-slate-900/80 border border-white/10 text-xs text-slate-200 font-medium">
                  <Cpu className="w-3.5 h-3.5 text-teal-400" />
                  <span>Electronics</span>
                </span>
                <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-slate-900/80 border border-white/10 text-xs text-slate-200 font-medium">
                  <Truck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Logistics</span>
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Sleek Auth Card */}
          <div className="lg:col-span-6">
            <div className="glass-panel-dark gradient-border-card rounded-2xl p-6 sm:p-8 shadow-2xl relative border border-teal-500/30">
              <div className="flex items-center justify-between border-b border-white/10 pb-5 mb-6">
                <div>
                  <div className="flex items-center space-x-2.5">
                    <h2 className="text-xl font-bold text-white font-headline">Vendor Portal Access</h2>
                    <button
                      type="button"
                      onClick={() => {
                        setTwilioModalError(null);
                        setTwilioModalSuccess(null);
                        setShowTwilioModal(true);
                      }}
                      className={`text-[10px] font-medium px-2.5 py-0.5 rounded-full border flex items-center space-x-1.5 transition ${
                        isTwilioLive
                          ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30'
                          : 'bg-amber-500/20 border-amber-500/40 text-amber-300 hover:bg-amber-500/30'
                      }`}
                      title="Twilio Live SMS Gateway Status - Click to Configure"
                    >
                      <Settings className="w-2.5 h-2.5" />
                      <span>{isTwilioLive ? 'Twilio Live SMS Active' : 'Twilio Offline (Click to Set)'}</span>
                    </button>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Enter your registered mobile number for instant OTP verification
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-300 border border-teal-500/30 flex items-center justify-center shadow-inner">
                  <Phone className="w-5 h-5" />
                </div>
              </div>

              {/* Status & Error Alerts */}
              {errorMessage && (
                <div className="mb-5 flex items-start space-x-2.5 p-3 rounded-lg bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {successMessage && (
                <div className="mb-5 flex items-start space-x-2.5 p-3 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
                  <span>{successMessage}</span>
                </div>
              )}

              <AnimatePresence mode="wait">
                {step === 'PHONE' ? (
                  /* Step 1: Mobile Number Input */
                  <motion.form
                    key="step-phone"
                    initial={{ opacity: 0, x: -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 15 }}
                    transition={{ duration: 0.25 }}
                    onSubmit={handleSendOtp}
                    className="space-y-5"
                  >
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 font-label">
                        Mobile Phone Number (India)
                      </label>
                      <div className="relative flex rounded-xl border border-white/15 bg-slate-950/80 focus-within:border-teal-400 focus-within:ring-2 focus-within:ring-teal-400/20 transition-all">
                        <div className="flex items-center pl-3.5 pr-2.5 text-slate-400 border-r border-white/10 text-sm font-semibold select-none">
                          <span className="mr-1.5">🇮🇳</span> +91
                        </div>
                        <input
                          type="tel"
                          value={phoneNumber}
                          onChange={handlePhoneChange}
                          placeholder="98765 43210"
                          maxLength={10}
                          autoFocus
                          disabled={isLoading}
                          className="w-full bg-transparent px-3.5 py-3 text-white placeholder-slate-500 text-sm focus:outline-none tracking-wide font-mono font-medium"
                        />
                      </div>
                      <p className="text-[11px] text-slate-400 mt-2">
                        We send a 6-digit cryptographic verification code. Standard carrier rates may apply.
                      </p>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading || phoneNumber.length !== 10}
                      className="w-full py-3.5 px-4 rounded-xl font-semibold text-sm text-white btn-gradient-primary disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-teal-500/25 transition-all flex items-center justify-center space-x-2 font-label"
                    >
                      {isLoading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Generating Secure Token...</span>
                        </>
                      ) : (
                        <>
                          <span>Request Verification Code</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>

                    {/* Quick Demo Helper */}
                    <div className="pt-2 flex items-center justify-center space-x-4 text-center">
                      <button
                        type="button"
                        onClick={() => {
                          setPhoneNumber(defaultPhone);
                          setErrorMessage(null);
                        }}
                        className="text-xs text-secondary hover:text-primary inline-flex items-center space-x-1 font-semibold"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-secondary" />
                        <span>Fill My Handset (+91 79822 77006)</span>
                      </button>
                      <span className="text-outline-variant">•</span>
                      <button
                        type="button"
                        onClick={() => {
                          setPhoneNumber('9876543210');
                          setErrorMessage(null);
                        }}
                        className="text-xs text-on-surface-variant hover:text-primary inline-flex items-center space-x-1"
                      >
                        <span>Demo (98765 43210)</span>
                      </button>
                    </div>
                  </motion.form>
                ) : (
                  /* Step 2: 6-Digit OTP Verification */
                  <motion.div
                    key="step-otp"
                    initial={{ opacity: 0, x: 15 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -15 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-on-surface-variant">
                        Code sent to: <strong className="text-primary font-mono">+91 {phoneNumber}</strong>
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setStep('PHONE');
                          setOtp(['', '', '', '', '', '']);
                          setErrorMessage(null);
                          setSuccessMessage(null);
                        }}
                        className="text-secondary hover:text-primary font-semibold"
                      >
                        Edit Number
                      </button>
                    </div>

                    {/* Twilio SMS Status Notice & Single Fallback */}
                    {isTwilioLive ? (
                      <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-emerald-900 flex items-center space-x-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Live Twilio SMS Sent</span>
                          </span>
                          <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                            Sent to +91 {phoneNumber}
                          </span>
                        </div>
                        <p className="text-[11px] text-emerald-900 leading-relaxed">
                          A 6-digit statutory verification code was transmitted over carrier network to your mobile phone. Please check your text messages.
                        </p>
                      </div>
                    ) : (
                      <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-amber-900 flex items-center space-x-1.5">
                            <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                            <span>Twilio Carrier SMS Not Connected</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setTwilioModalError(null);
                              setTwilioModalSuccess(null);
                              setShowTwilioModal(true);
                            }}
                            className="text-[11px] font-semibold text-amber-900 hover:text-primary underline flex items-center space-x-1"
                          >
                            <Settings className="w-3 h-3" />
                            <span>Connect Twilio</span>
                          </button>
                        </div>
                        <p className="text-[11px] text-on-surface-variant leading-relaxed">
                          Your Twilio API credentials are not yet configured in <code className="text-amber-900 bg-amber-100 px-1 py-0.5 rounded font-mono">.env</code>. You can click <strong>Connect Twilio</strong> above to send live cellular SMS, or use this generated test OTP:
                        </p>
                        <div className="flex items-center justify-between pt-1">
                          <code className="text-sm font-bold font-mono tracking-widest text-amber-300 bg-slate-950 px-2.5 py-1 rounded border border-amber-500/40">
                            {dispatchedOtp || '123456'}
                          </code>
                          <button
                            type="button"
                            onClick={() => {
                              const code = dispatchedOtp || '123456';
                              const digits = code.split('');
                              setOtp(digits);
                              verifyOtpCode(code);
                            }}
                            className="text-[11px] font-semibold text-white bg-amber-700 hover:bg-amber-600 px-3 py-1.5 rounded-lg shadow-sm transition-colors flex items-center space-x-1"
                          >
                            <span>Use Test Code</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* 6 Digit Input Grid */}
                    <div>
                      <label className="block text-xs font-semibold text-primary uppercase tracking-wider mb-3 font-label">
                        Enter 6-Digit Verification Code
                      </label>
                      <div className="grid grid-cols-6 gap-2 sm:gap-3">
                        {otp.map((digit, idx) => (
                          <input
                            key={idx}
                            ref={(el) => {
                              otpRefs.current[idx] = el;
                            }}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(idx, e)}
                            disabled={isLoading}
                            className="w-full h-12 text-center text-xl font-bold bg-slate-950/90 border border-white/10 rounded-xl text-teal-300 focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 focus:outline-none transition-all font-mono"
                          />
                        ))}
                      </div>
                    </div>

                    {/* Resend and Actions */}
                    <div className="flex items-center justify-between text-xs pt-1">
                      <span className="text-on-surface-variant">
                        {timer > 0 ? (
                          <>Resend OTP in <strong className="text-primary font-mono">{timer}s</strong></>
                        ) : (
                          'Did not receive code?'
                        )}
                      </span>
                      <button
                        type="button"
                        disabled={!canResend || isLoading}
                        onClick={() => handleSendOtp()}
                        className="text-secondary hover:text-primary font-semibold disabled:text-outline disabled:cursor-not-allowed"
                      >
                        Resend Code
                      </button>
                    </div>

                    {/* Manual Verify Button */}
                    <button
                      type="button"
                      onClick={() => verifyOtpCode(otp.join(''))}
                      disabled={isLoading || otp.join('').length !== 6}
                      className="w-full py-3.5 px-4 rounded-xl font-semibold text-sm text-white bg-primary hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition-all flex items-center justify-center space-x-2 font-label"
                    >
                      {isLoading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Verifying Security Token...</span>
                        </>
                      ) : (
                        <>
                          <KeyRound className="w-4 h-4" />
                          <span>Authenticate & Continue</span>
                        </>
                      )}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Bottom Security Assurance Stamp */}
              <div className="mt-8 pt-4 border-t border-surface-container flex items-center justify-center space-x-2 text-[11px] text-on-surface-variant">
                <Shield className="w-3.5 h-3.5 text-secondary" />
                <span>Protected by TenderGuard Zero-Retention Cryptographic Engine</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Twilio SMS Live Configuration Drawer/Modal */}
      {showTwilioModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary/40 backdrop-blur-sm p-4">
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 max-w-lg w-full shadow-2xl relative text-left">
            <button
              onClick={() => setShowTwilioModal(false)}
              className="absolute top-4 right-4 text-on-surface-variant hover:text-primary p-1 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2.5 rounded-xl bg-secondary-container text-on-secondary-fixed-variant">
                <Settings className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-primary font-headline">Twilio SMS Gateway Configuration</h3>
                <p className="text-xs text-on-surface-variant">
                  Connect your Twilio account to deliver physical SMS OTPs over Indian telecom carriers
                </p>
              </div>
            </div>

            {twilioModalError && (
              <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                <span>{twilioModalError}</span>
              </div>
            )}

            {twilioModalSuccess && (
              <div className="mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                <span>{twilioModalSuccess}</span>
              </div>
            )}

            <form onSubmit={handleSaveTwilio} className="space-y-4 text-xs">
              {twilioSid.startsWith('SK') && (
                <div className="p-3 rounded-xl bg-secondary-container/40 border border-secondary/30 text-primary text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-primary flex items-center space-x-1.5 font-label">
                      <Sparkles className="w-3.5 h-3.5 text-secondary" />
                      <span>API Key SID Detected (SK...)</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setTwilioSid('');
                        setTwilioAuth('');
                      }}
                      className="text-[10px] text-secondary hover:underline"
                    >
                      Use Standard Account SID (AC...)
                    </button>
                  </div>
                  <p className="text-[11px] text-on-surface-variant leading-relaxed">
                    Twilio requires an <strong>API Secret</strong> and your main <strong>Account SID (AC...)</strong> to authorize API Key <code className="text-primary font-mono bg-surface-container px-1 rounded">{twilioSid.slice(0, 8)}...</code>.
                  </p>
                </div>
              )}

              <div>
                <label className="block text-primary font-semibold mb-1 font-label">
                  {twilioSid.startsWith('SK') ? 'Twilio API Key SID' : 'Twilio Account SID (or API Key SID)'} <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  value={twilioSid}
                  onChange={(e) => setTwilioSid(e.target.value)}
                  placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx (or SK...)"
                  required
                  className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-teal-300 font-mono placeholder-slate-500 focus:outline-none focus:border-teal-400 text-xs"
                />
              </div>

              {twilioSid.startsWith('SK') && (
                <div>
                  <label className="block text-primary font-semibold mb-1 font-label">
                    Primary Account SID (Starts with &quot;AC&quot;) <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={twilioAccountSidForApiKey}
                    onChange={(e) => setTwilioAccountSidForApiKey(e.target.value)}
                    placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx (From Twilio Console Home)"
                    required
                    className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-teal-300 font-mono placeholder-slate-500 focus:outline-none focus:border-teal-400 text-xs"
                  />
                  <p className="text-[10px] text-on-surface-variant mt-1">
                    Found on your Twilio Console homepage under &quot;Account Info&quot;.
                  </p>
                </div>
              )}

              <div>
                <label className="block text-primary font-semibold mb-1 font-label">
                  {twilioSid.startsWith('SK') ? 'Twilio API Secret' : 'Twilio Auth Token'} <span className="text-rose-600">*</span>
                </label>
                <input
                  type="password"
                  value={twilioAuth}
                  onChange={(e) => setTwilioAuth(e.target.value)}
                  placeholder={twilioSid.startsWith('SK') ? 'Secret generated with this API Key' : 'Your Twilio Auth Token (from Console Home)'}
                  required
                  className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-teal-300 font-mono placeholder-slate-500 focus:outline-none focus:border-teal-400 text-xs"
                />
              </div>

              <div>
                <label className="block text-primary font-semibold mb-1 font-label">
                  Twilio Sender Phone Number (E.164)
                </label>
                <input
                  type="text"
                  value={twilioFrom}
                  onChange={(e) => setTwilioFrom(e.target.value)}
                  placeholder="+1xxxxxxxxxx"
                  className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-teal-300 font-mono placeholder-slate-500 focus:outline-none focus:border-teal-400 text-xs"
                />
                <p className="text-[10px] text-on-surface-variant mt-1">
                  Your Twilio phone number used as the sender.
                </p>
              </div>

              <div>
                <label className="block text-primary font-semibold mb-1 font-label">
                  Twilio Verify Service SID (Optional)
                </label>
                <input
                  type="text"
                  value={twilioVerifySid}
                  onChange={(e) => setTwilioVerifySid(e.target.value)}
                  placeholder="VAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-teal-300 font-mono placeholder-slate-500 focus:outline-none focus:border-teal-400 text-xs"
                />
                <p className="text-[10px] text-on-surface-variant mt-1">
                  Provide if using Twilio Verify API rather than Programmable SMS.
                </p>
              </div>

              <div className="pt-2 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowTwilioModal(false)}
                  className="px-4 py-2 rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-container transition text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingTwilio}
                  className="px-5 py-2 rounded-lg bg-primary hover:bg-secondary text-white font-semibold flex items-center space-x-2 disabled:opacity-50 transition text-xs shadow-md font-label"
                >
                  {isSavingTwilio ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Verifying with Twilio...</span>
                    </>
                  ) : (
                    <span>Verify & Save Credentials</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
