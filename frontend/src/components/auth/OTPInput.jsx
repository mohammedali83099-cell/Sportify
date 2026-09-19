import React, { useState, useRef, useEffect } from 'react';

/**
 * OTPInput
 *
 * Lightweight, accessible, 6-digit pin entry component.
 * Features auto-advance, backspace navigation, clipboard paste,
 * dynamic countdown timer, and glassmorphic styling.
 *
 * @param {string} email - Destination email address for display
 * @param {string} purpose - 'registration' | 'login'
 * @param {boolean} loading - Loading state during submission
 * @param {string|null} error - Error message to display
 * @param {number} cooldownSeconds - Initial cooldown countdown
 * @param {Function} onVerify - Callback invoked with (code: string)
 * @param {Function} onResend - Callback to request a new code
 * @param {Function} onCancel - Callback to return to previous step
 */
export default function OTPInput({
  email,
  purpose = 'registration',
  loading = false,
  error = null,
  cooldownSeconds = 60,
  devCode = null,
  onVerify,
  onResend,
  onCancel,
}) {
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [timeLeft, setTimeLeft] = useState(cooldownSeconds);
  const [resending, setResending] = useState(false);
  const inputRefs = useRef([]);

  // Auto-focus first input on mount
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  // Cooldown countdown timer
  useEffect(() => {
    setTimeLeft(cooldownSeconds);
  }, [cooldownSeconds]);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleChange = (index, value) => {
    const char = value.replace(/\D/g, '').slice(-1);
    const newDigits = [...digits];
    newDigits[index] = char;
    setDigits(newDigits);

    // Auto-advance to next input if digit entered
    if (char && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus();
    }

    // If all digits entered, trigger verification
    const fullCode = newDigits.join('');
    if (fullCode.length === 6 && onVerify) {
      onVerify(fullCode);
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0 && inputRefs.current[index - 1]) {
        // Move back and clear previous
        const newDigits = [...digits];
        newDigits[index - 1] = '';
        setDigits(newDigits);
        inputRefs.current[index - 1].focus();
      } else {
        const newDigits = [...digits];
        newDigits[index] = '';
        setDigits(newDigits);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;

    const newDigits = [...digits];
    for (let i = 0; i < 6; i++) {
      newDigits[i] = pasted[i] || '';
    }
    setDigits(newDigits);

    // Focus on last entered box or last box
    const nextIndex = Math.min(pasted.length, 5);
    inputRefs.current[nextIndex]?.focus();

    if (pasted.length === 6 && onVerify) {
      onVerify(pasted);
    }
  };

  const handleResendClick = async () => {
    if (timeLeft > 0 || resending || !onResend) return;
    setResending(true);
    try {
      await onResend();
      setTimeLeft(60);
      setDigits(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setResending(false);
    }
  };

  const fullCode = digits.join('');
  const isComplete = fullCode.length === 6;

  return (
    <div className="w-full max-w-md mx-auto space-y-6 select-none animate-fadeIn">
      {/* Header Info */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-1">
          <svg
            className="w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-white font-heading">
          Verify Your Email
        </h2>
        <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
          We sent a 6-digit verification code to{' '}
          <span className="text-slate-200 font-semibold">{email}</span>. Enter the code below to{' '}
          {purpose === 'registration' ? 'complete your registration' : 'sign in'}.
        </p>
      </div>

      {/* Dev Mode Helper Notice */}
      {devCode && (
        <div className="p-2.5 rounded-xl bg-sky-500/10 border border-sky-500/25 flex items-center justify-between text-xs text-sky-300 font-sans shadow-sm">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
            <span>Dev Mode: Code is <strong className="font-mono text-white tracking-widest">{devCode}</strong></span>
          </div>
          <button
            type="button"
            onClick={() => {
              const chars = devCode.split('').slice(0, 6);
              setDigits(chars);
              if (onVerify) onVerify(devCode);
            }}
            className="text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 underline underline-offset-2 ml-2"
          >
            Auto-fill
          </button>
        </div>
      )}

      {/* 6 Digit Input Group */}
      <div className="space-y-4">
        <div className="flex items-center justify-center gap-2 sm:gap-3" onPaste={handlePaste}>
          {digits.map((digit, idx) => (
            <input
              key={`otp-box-${idx}`}
              ref={(el) => (inputRefs.current[idx] = el)}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={1}
              value={digit}
              disabled={loading}
              onChange={(e) => handleChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              className={`w-11 h-14 sm:w-12 sm:h-16 text-center text-xl sm:text-2xl font-bold font-mono rounded-xl bg-[#0D1017] border transition-all duration-200 outline-none ${
                digit
                  ? 'border-emerald-500/60 text-white shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                  : 'border-white/15 text-slate-300 focus:border-sky-400 focus:ring-1 focus:ring-sky-400/40'
              } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            />
          ))}
        </div>

        {/* Inline Error */}
        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs text-center flex items-center justify-center gap-2 animate-shake">
            <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Verify Button */}
      <div className="space-y-3 pt-1">
        <button
          type="button"
          disabled={!isComplete || loading}
          onClick={() => onVerify && onVerify(fullCode)}
          className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm tracking-wide transition-all duration-200 flex items-center justify-center gap-2 ${
            isComplete && !loading
              ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-black shadow-lg shadow-emerald-500/20 hover:brightness-105 active:scale-[0.99]'
              : 'bg-white/10 text-slate-500 cursor-not-allowed border border-white/5'
          }`}
        >
          {loading ? (
            <>
              <div className="w-4 h-4 rounded-full border-2 border-slate-900 border-t-white animate-spin" />
              <span>Verifying Code...</span>
            </>
          ) : (
            <span>Verify & Continue</span>
          )}
        </button>

        {/* Resend & Back Actions */}
        <div className="flex items-center justify-between text-xs text-slate-400 px-1 pt-1">
          {onCancel && (
            <button
              type="button"
              disabled={loading}
              onClick={onCancel}
              className="hover:text-white transition-colors duration-150 flex items-center gap-1"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
              <span>Back / Change Email</span>
            </button>
          )}

          <div className="ml-auto">
            {timeLeft > 0 ? (
              <span className="font-mono text-slate-500">
                Resend code in <strong className="text-slate-400">{timeLeft}s</strong>
              </span>
            ) : (
              <button
                type="button"
                disabled={resending || loading}
                onClick={handleResendClick}
                className="text-emerald-400 font-semibold hover:text-emerald-300 transition-colors duration-150 underline underline-offset-4"
              >
                {resending ? 'Sending...' : 'Resend Code'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
