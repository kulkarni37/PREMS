import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  PiCircuitry,
  PiShieldCheck,
  PiKey,
  PiLockKey,
  PiEye,
  PiEyeSlash,
  PiCheckCircle,
  PiArrowLeft,
  PiX,
} from 'react-icons/pi';
import { resetPassword } from '../../services/api';
import '../../styles/reset-password.css';

const INFO_CARDS = [
  {
    icon: <PiShieldCheck />,
    title: 'Strong Password Security',
    desc: 'Use at least 8 characters with numbers and special symbols.',
  },
  {
    icon: <PiKey />,
    title: 'Encrypted Hashing',
    desc: 'Passwords are securely hashed before saving in database.',
  },
  {
    icon: <PiLockKey />,
    title: 'Instant Account Update',
    desc: 'Immediately restores your full sign-in privileges on PRMES.',
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

function getPasswordStrength(password) {
  if (!password) return { score: 0, label: 'Weak', percent: 0 };

  let score = 0;
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  if (score <= 1) return { score, label: 'Weak', percent: 25 };
  if (score <= 3) return { score, label: 'Medium', percent: 60 };
  return { score, label: 'Strong', percent: 100 };
}

export default function ResetPasswordPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const studentId = location.state?.studentId || 'PRMES-STU-2026-0001';
  const email = location.state?.email || 'you@gndec.edu.in';
  const otp = location.state?.otp || '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const strength = useMemo(() => getPasswordStrength(newPassword), [newPassword]);
  const passwordsMatch = confirmPassword.length === 0 || confirmPassword === newPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!newPassword || !confirmPassword) {
      setErrorMsg('Please fill in both password fields.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    try {
      setLoading(true);
      const response = await resetPassword(studentId, email, otp, newPassword);
      if (response.success) {
        setShowSuccessModal(true);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="reset-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* ---------------- LEFT PANEL ---------------- */}
      <motion.section
        className="reset-brand"
        initial={{ opacity: 0, x: -48 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="blueprint-grid reset-brand__grid" />
        <div className="reset-brand__orb" />

        <div className="reset-brand__particles" aria-hidden="true">
          {PARTICLES.map((p, i) => (
            <span
              key={i}
              className="reset-particle"
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

        <div className="reset-brand__content">
          <div className="reset-brand__logo">
            <span className="reset-brand__logo-mark">
              <PiCircuitry />
            </span>
            <span className="reset-brand__logo-text">PRMES</span>
          </div>

          <h1 className="reset-brand__heading">
            Reset Your
            <br />
            Password
          </h1>

          <p className="reset-brand__desc">
            Create a new strong password for your PRMES account. Ensure it is unique and memorable.
          </p>

          <div className="reset-brand__cards">
            {INFO_CARDS.map((card, i) => (
              <motion.div
                key={card.title}
                className="reset-info-card"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.35 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="reset-info-card__icon">{card.icon}</div>
                <div className="reset-info-card__content">
                  <span className="reset-info-card__title">{card.title}</span>
                  <span className="reset-info-card__desc">{card.desc}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ---------------- RIGHT PANEL ---------------- */}
      <section className="reset-panel">
        <motion.div
          className="reset-card"
          initial={{ opacity: 0, x: 48 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="reset-card__glow" />

          <div className="reset-card__head">
            <div className="reset-card__icon-badge">
              <PiLockKey />
            </div>
            <h2 className="reset-card__title">Reset Password</h2>
            <p className="reset-card__sub">Enter your new credentials below.</p>
          </div>

          {errorMsg && (
            <div className="reset-alert reset-alert--error">
              ⚠️ {errorMsg}
            </div>
          )}

          <form className="reset-form" onSubmit={handleSubmit} noValidate>
            <motion.div
              className="reset-field"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              <label htmlFor="reset-new-password">New Password</label>
              <div className="reset-input">
                <PiLockKey className="reset-input__icon" />
                <input
                  id="reset-new-password"
                  name="newPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Create new password"
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  className="reset-input__toggle"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <PiEyeSlash /> : <PiEye />}
                </button>
              </div>
            </motion.div>

            <motion.div
              className="reset-field"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
            >
              <label htmlFor="reset-confirm-password">Confirm Password</label>
              <div className={`reset-input ${!passwordsMatch ? 'reset-input--error' : ''}`}>
                <PiLockKey className="reset-input__icon" />
                <input
                  id="reset-confirm-password"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  className="reset-input__toggle"
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <PiEyeSlash /> : <PiEye />}
                </button>
              </div>
            </motion.div>

            {newPassword && (
              <div className="register-strength" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div className="register-strength__track" style={{ flex: 1, height: '5px', background: 'var(--border-hairline)', borderRadius: '999px', overflow: 'hidden' }}>
                  <motion.div
                    style={{
                      height: '100%',
                      borderRadius: '999px',
                      background: strength.label === 'Weak' ? '#ff6259' : strength.label === 'Medium' ? 'var(--accent-amber)' : 'var(--accent-cyan)'
                    }}
                    initial={{ width: 0 }}
                    animate={{ width: `${strength.percent}%` }}
                    transition={{ duration: 0.4 }}
                  />
                </div>
                <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', color: strength.label === 'Weak' ? '#ff6259' : strength.label === 'Medium' ? 'var(--accent-amber)' : 'var(--accent-cyan)' }}>
                  {strength.label}
                </span>
              </div>
            )}

            {!passwordsMatch && (
              <span style={{ fontSize: '12.5px', color: '#ff6259' }}>
                Passwords do not match
              </span>
            )}

            <motion.button
              type="submit"
              className="reset-submit"
              disabled={loading || !newPassword || !confirmPassword || !passwordsMatch}
              whileHover={{ y: -3 }}
              whileTap={{ y: 0, scale: 0.98 }}
            >
              {loading ? 'Updating Password...' : 'Update Password'}
            </motion.button>
          </form>

          <div style={{ marginTop: '24px', textAlign: 'center' }}>
            <Link to="/login" style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <PiArrowLeft /> Back to Login
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ---------------- SUCCESS MODAL ---------------- */}
      <AnimatePresence>
        {showSuccessModal && (
          <motion.div
            className="reset-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="reset-modal"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="reset-modal__icon">
                <PiCheckCircle />
              </div>

              <h3 className="reset-modal__title">Password Reset Successful!</h3>
              <p className="reset-modal__desc">
                Your PRMES account password has been updated successfully. You can now sign in using your new password.
              </p>

              <Link to="/login" className="reset-modal__btn">
                Go to Login
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
