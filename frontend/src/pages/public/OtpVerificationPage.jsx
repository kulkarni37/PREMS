import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  PiCircuitry,
  PiShieldCheck,
  PiEnvelopeSimple,
  PiKey,
  PiArrowLeft,
  PiLockKey,
  PiTimer,
  PiArrowsClockwise,
} from 'react-icons/pi';
import { verifyOTP, requestForgotPasswordOTP } from '../../services/api';
import '../../styles/otp-verification.css';

const INFO_CARDS = [
  {
    icon: <PiShieldCheck />,
    title: 'Secure OTP Verification',
    desc: 'One-Time Password valid for 5 minutes only.',
  },
  {
    icon: <PiEnvelopeSimple />,
    title: 'Check Your Inbox',
    desc: 'Verification code sent to your registered college email.',
  },
  {
    icon: <PiKey />,
    title: 'Encrypted Access',
    desc: 'Each code can be used strictly once for security.',
  },
];

const PARTICLES = [
  { top: '12%', left: '18%', size: 5, duration: 9, delay: 0 },
  { top: '24%', left: '68%', size: 3, duration: 11, delay: 0.6 },
  { top: '38%', left: '8%', size: 4, duration: 8, delay: 1.2 },
  { top: '46%', left: '82%', size: 6, duration: 12, delay: 0.3 },
  { top: '58%', left: '30%', size: 3, duration: 10, delay: 1.6 },
  { top: '66%', left: '55%', size: 4, duration: 9.5, delay: 0.9 },
  { top: '74%', left: '14%', size: 3, duration: 13, delay: 0.2 },
  { top: '82%', left: '72%', size: 5, duration: 10.5, delay: 1.4 },
  { top: '18%', left: '44%', size: 3, duration: 8.5, delay: 2 },
  { top: '90%', left: '40%', size: 4, duration: 11.5, delay: 1 },
];

export default function OtpVerificationPage() {
  const location = useLocation();
  const navigate = useNavigate();

  // Retrieve state passed from Forgot Password page
  const email = location.state?.email || 'you@gndec.edu.in';
  const studentId = location.state?.studentId || 'PRMES-STU-2026-0001';

  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(60);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState(location.state?.message || '');

  const inputRefs = [
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
  ];

  // 60-second countdown timer
  useEffect(() => {
    let interval = null;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timer]);

  // Focus first input on mount
  useEffect(() => {
    inputRefs[0].current?.focus();
  }, []);

  const handleInputChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otpDigits];
    newOtp[index] = value.slice(-1); // Take single digit
    setOtpDigits(newOtp);
    setErrorMsg('');

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace navigation
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split('');
      setOtpDigits(digits);
      inputRefs[5].current?.focus();
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const fullOtp = otpDigits.join('');
    if (fullOtp.length !== 6) {
      setErrorMsg('Please enter all 6 digits of the OTP code.');
      return;
    }

    try {
      setLoading(true);
      const response = await verifyOTP(studentId, email, fullOtp);
      if (response.success) {
        // Navigate to Reset Password page
        navigate('/reset-password', {
          state: {
            studentId,
            email,
            otp: fullOtp,
            message: response.message
          }
        });
      }
    } catch (err) {
      setErrorMsg(err.message || 'OTP verification failed. Please check the code and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (timer > 0 || resending) return;

    try {
      setResending(true);
      setErrorMsg('');
      setSuccessMsg('');

      const response = await requestForgotPasswordOTP(email, studentId);
      if (response.success) {
        setSuccessMsg('A new 6-digit OTP code has been sent to your email.');
        setTimer(60); // Reset timer to 60s
        setOtpDigits(['', '', '', '', '', '']);
        inputRefs[0].current?.focus();
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to resend OTP code.');
    } finally {
      setResending(false);
    }
  };

  return (
    <motion.div
      className="otp-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* ---------------- LEFT PANEL ---------------- */}
      <motion.section
        className="otp-brand"
        initial={{ opacity: 0, x: -48 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="blueprint-grid otp-brand__grid" />
        <div className="otp-brand__orb" />

        <div className="otp-brand__particles" aria-hidden="true">
          {PARTICLES.map((p, i) => (
            <span
              key={i}
              className="otp-particle"
              style={{
                top: p.top,
                left: p.left,
                width: p.size,
                height: p.size,
                animationDuration: `${p.duration}s`,
                animationDelay: `${p.delay}s`,
              }}
            />
          ))}
        </div>

        <div className="otp-brand__content">
          <div className="otp-brand__logo">
            <span className="otp-brand__logo-mark">
              <PiCircuitry />
            </span>
            <span className="otp-brand__logo-text">PRMES</span>
          </div>

          <h1 className="otp-brand__heading">
            Enter Verification
            <br />
            Code
          </h1>

          <p className="otp-brand__desc">
            We have dispatched a 6-digit One-Time Password to your registered institutional college email address.
          </p>

          <div className="otp-brand__cards">
            {INFO_CARDS.map((card, i) => (
              <motion.div
                key={card.title}
                className="otp-info-card"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.35 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="otp-info-card__icon">{card.icon}</div>
                <div className="otp-info-card__content">
                  <span className="otp-info-card__title">{card.title}</span>
                  <span className="otp-info-card__desc">{card.desc}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ---------------- RIGHT PANEL ---------------- */}
      <section className="otp-panel">
        <motion.div
          className="otp-card"
          initial={{ opacity: 0, x: 48 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="otp-card__glow" />

          <div className="otp-card__head">
            <div className="otp-card__icon-badge">
              <PiLockKey />
            </div>
            <h2 className="otp-card__title">OTP Verification</h2>
            <p className="otp-card__sub">
              Enter the 6-digit code sent to:
            </p>
            <span className="otp-card__email-badge">{email}</span>
          </div>

          {errorMsg && (
            <div className="otp-alert otp-alert--error">
              ⚠️ {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="otp-alert otp-alert--success">
              ✅ {successMsg}
            </div>
          )}

          <form onSubmit={handleVerify} noValidate>
            {/* 6-Digit Box Layout */}
            <div className="otp-boxes" onPaste={handlePaste}>
              {otpDigits.map((digit, idx) => (
                <input
                  key={idx}
                  ref={inputRefs[idx]}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleInputChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  className="otp-input-box"
                  autoComplete="off"
                />
              ))}
            </div>

            {/* Timer and Resend Row */}
            <div className="otp-timer-row">
              <span className="otp-timer">
                <PiTimer /> Expiry in: <span className="otp-timer__val">{timer > 0 ? `${timer}s` : 'Expired'}</span>
              </span>

              <button
                type="button"
                className="otp-resend-btn"
                onClick={handleResend}
                disabled={timer > 0 || resending}
              >
                <PiArrowsClockwise style={{ marginRight: '4px' }} />
                {resending ? 'Sending...' : 'Resend OTP'}
              </button>
            </div>

            <motion.button
              type="submit"
              className="otp-submit"
              disabled={loading || otpDigits.join('').length !== 6}
              whileHover={{ y: -3 }}
              whileTap={{ y: 0, scale: 0.98 }}
            >
              {loading ? 'Verifying OTP...' : 'Verify OTP'}
            </motion.button>
          </form>

          <div className="otp-footer">
            <Link to="/forgot-password" className="otp-back-link">
              <PiArrowLeft /> Back to Forgot Password
            </Link>
          </div>
        </motion.div>
      </section>
    </motion.div>
  );
}
