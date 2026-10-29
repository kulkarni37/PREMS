import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
  PiCircuitry,
  PiEnvelopeSimple,
  PiShieldCheck,
  PiKey,
  PiIdentificationCard,
  PiArrowLeft,
  PiLockKey,
} from 'react-icons/pi';
import logo from "../../assets/logo.png";
import { requestForgotPasswordOTP } from '../../services/api';
import '../../styles/forgot-password.css';

const INFO_CARDS = [
  {
    icon: <PiShieldCheck />,
    title: 'Secure Password Recovery',
    desc: 'Encrypted end-to-end verification protecting your academic account.',
  },
  {
    icon: <PiEnvelopeSimple />,
    title: 'College Email Verification',
    desc: 'Direct dispatch to your official @gndec.edu.in institutional email.',
  },
  {
    icon: <PiKey />,
    title: 'Instant Reset Access',
    desc: 'Quickly restore your access to project submissions and evaluations.',
  },
];

/* Floating particles configuration matching Login page */
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

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('you@gndec.edu.in');
  const [identifier, setIdentifier] = useState('PRMES-STU-2026-0001');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email || !identifier) {
      setErrorMsg('Please enter both your registered college email and Student ID.');
      return;
    }

    try {
      setLoading(true);
      const response = await requestForgotPasswordOTP(email.trim(), identifier.trim());
      if (response.success) {
        // Navigate to OTP verification page with state
        navigate('/otp-verification', {
          state: {
            email: email.trim(),
            studentId: identifier.trim(),
            message: response.message
          }
        });
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to send OTP code. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="forgot-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* ---------------- LEFT PANEL ---------------- */}
      <motion.section
        className="forgot-brand"
        initial={{ opacity: 0, x: -48 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="blueprint-grid forgot-brand__grid" />
        <div className="forgot-brand__orb" />

        <div className="forgot-brand__particles" aria-hidden="true">
          {PARTICLES.map((p, i) => (
            <span
              key={i}
              className="forgot-particle"
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

        <div className="forgot-brand__content">
          <div className="forgot-brand__logo">
            <span className="forgot-brand__logo-mark">
              <img src={logo} alt="PRMES Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </span>
            <span className="forgot-brand__logo-text">PRMES</span>
          </div>

          <h1 className="forgot-brand__heading">
            Forgot Your
            <br />
            Password?
          </h1>

          <p className="forgot-brand__desc">
            Enter your registered college email address. We&apos;ll verify your account and allow you to reset your password.
          </p>

          <div className="forgot-brand__cards">
            {INFO_CARDS.map((card, i) => (
              <motion.div
                key={card.title}
                className="forgot-info-card"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.35 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="forgot-info-card__icon">{card.icon}</div>
                <div className="forgot-info-card__content">
                  <span className="forgot-info-card__title">{card.title}</span>
                  <span className="forgot-info-card__desc">{card.desc}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ---------------- RIGHT PANEL ---------------- */}
      <section className="forgot-panel">
        <motion.div
          className="forgot-card"
          initial={{ opacity: 0, x: 48 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="forgot-card__glow" />

          <div className="forgot-card__head">
            <div className="forgot-card__icon-badge">
              <PiLockKey />
            </div>
            <h2 className="forgot-card__title">Forgot Password</h2>
            <p className="forgot-card__sub">Recover access to your PRMES account.</p>
          </div>

          {errorMsg && (
            <div className="forgot-alert forgot-alert--error" style={{
              padding: '12px 14px',
              borderRadius: '8px',
              fontSize: '13.5px',
              marginBottom: '16px',
              background: 'rgba(255, 98, 89, 0.12)',
              border: '1px solid rgba(255, 98, 89, 0.3)',
              color: '#ff6259'
            }}>
              ⚠️ {errorMsg}
            </div>
          )}

          <form className="forgot-form" onSubmit={handleSubmit} noValidate>
            <motion.div
              className="forgot-field"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              <label htmlFor="forgot-email">
                College Email Address <span>*</span>
              </label>
              <div className="forgot-input">
                <PiEnvelopeSimple className="forgot-input__icon" />
                <input
                  id="forgot-email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@gndec.edu.in"
                  autoComplete="email"
                  required
                />
              </div>
            </motion.div>

            <motion.div
              className="forgot-field"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
            >
              <label htmlFor="forgot-identifier">
                Student ID / Faculty ID <span>*</span>
              </label>
              <div className="forgot-input">
                <PiIdentificationCard className="forgot-input__icon" />
                <input
                  id="forgot-identifier"
                  name="identifier"
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="PRMES-STU-2026-0001"
                  required
                />
              </div>
            </motion.div>

            <motion.button
              type="submit"
              className="forgot-submit"
              disabled={loading}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -3 }}
              whileTap={{ y: 0, scale: 0.98 }}
            >
              {loading ? 'Sending OTP...' : 'Send OTP'}
            </motion.button>
          </form>

          <motion.div
            className="forgot-footer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            <Link to="/login" className="forgot-back-link">
              <PiArrowLeft /> Back to Login
            </Link>
          </motion.div>
        </motion.div>
      </section>
    </motion.div>
  );
}
