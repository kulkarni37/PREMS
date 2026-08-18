import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
  PiCircuitry,
  PiEnvelopeSimple,
  PiLockKey,
  PiEye,
  PiEyeSlash,
  PiCheckCircle,
  PiUsersThree,
  PiCompass,
  PiFlowArrow,
  PiUploadSimple,
  PiChartLineUp,
} from 'react-icons/pi';
import { loginStudent } from '../../services/api';
import "../../styles/login.css";

const FEATURES = [
  { icon: <PiUsersThree />, label: 'Team Registration' },
  { icon: <PiCompass />, label: 'Guide Allocation' },
  { icon: <PiFlowArrow />, label: 'Review Workflow' },
  { icon: <PiUploadSimple />, label: 'Document Submission' },
  { icon: <PiChartLineUp />, label: 'Evaluation Tracking' },
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

export default function Login() {
  const [email, setEmail] = useState('you@gndec.edu.in');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!email || !password) {
      setErrorMsg('Please enter both email/ID and password.');
      return;
    }

    try {
      setLoading(true);
      const res = await loginStudent(email, password);
      if (res && res.success) {
        setSuccessMsg('Login successful! Redirecting to workspace...');
        localStorage.setItem('prmes_user', JSON.stringify(res.user));

        const role = (res.user?.role || '').toUpperCase();
        setTimeout(() => {
          if (role === 'ADMIN') {
            navigate('/admin/dashboard');
          } else if (role === 'COORDINATOR') {
            navigate('/coordinator/dashboard');
          } else if (role === 'GUIDE') {
            navigate('/guide/dashboard');
          } else {
            navigate('/student/dashboard');
          }
        }, 500);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="login-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* ---------------- LEFT: branding ---------------- */}
      <motion.section
        className="login-brand"
        initial={{ opacity: 0, x: -48 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="blueprint-grid login-brand__grid" />
        <div className="login-brand__orb" />

        <div className="login-brand__particles" aria-hidden="true">
          {PARTICLES.map((p, i) => (
            <span
              key={i}
              className="login-particle"
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

        <div className="login-brand__content">
          <div className="login-brand__logo">
            <span className="login-brand__logo-mark">
              <PiCircuitry />
            </span>
            <span className="login-brand__logo-text">PRMES</span>
          </div>

          <h1 className="login-brand__heading">
            Project Review
            <br />
            Management &amp;
            <br />
            Evaluation System
          </h1>

          <p className="login-brand__desc">
            Manage academic projects, review workflow, document submission,
            and evaluation through one intelligent platform.
          </p>

          <ul className="login-brand__features">
            {FEATURES.map((f, i) => (
              <motion.li
                key={f.label}
                className="login-brand__feature"
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 + i * 0.08, ease: [0.16, 1, 0.3, 1] }}
              >
                <span className="login-brand__feature-icon">
                  <PiCheckCircle className="login-brand__feature-check" />
                  {f.icon}
                </span>
                {f.label}
              </motion.li>
            ))}
          </ul>
        </div>
      </motion.section>

      {/* ---------------- RIGHT: login card ---------------- */}
      <section className="login-panel">
        <motion.div
          className="login-card"
          initial={{ opacity: 0, x: 48 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="login-card__glow" />

          <div className="login-card__head">
            <span className="login-card__wave">👋</span>
            <h2 className="login-card__title">Welcome Back</h2>
            <p className="login-card__sub">Sign in to continue to PRMES Portal</p>
          </div>

          {errorMsg && (
            <div style={{
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

          {successMsg && (
            <div style={{
              padding: '12px 14px',
              borderRadius: '8px',
              fontSize: '13.5px',
              marginBottom: '16px',
              background: 'var(--accent-cyan-soft)',
              border: '1px solid var(--accent-cyan)',
              color: 'var(--accent-cyan)'
            }}>
              ✅ {successMsg}
            </div>
          )}

          <form className="login-form" onSubmit={handleSubmit} noValidate>
            <motion.div
              className="login-field"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              <label htmlFor="login-email">Email Address or Account ID</label>
              <div className="login-input">
                <PiEnvelopeSimple className="login-input__icon" />
                <input
                  id="login-email"
                  name="email"
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@gndec.edu.in or PRMES-STU-XXXX"
                  autoComplete="email"
                  required
                />
              </div>
            </motion.div>

            <motion.div
              className="login-field"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
            >
              <label htmlFor="login-password">Password</label>
              <div className="login-input">
                <PiLockKey className="login-input__icon" />
                <input
                  id="login-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="login-input__toggle"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <PiEyeSlash /> : <PiEye />}
                </button>
              </div>
            </motion.div>

            <motion.div
              className="login-row"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
            >
              <label className="login-remember">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span className="login-remember__box" />
                Remember Me
              </label>

              <Link to="/forgot-password" className="login-forgot">
                Forgot Password?
              </Link>
            </motion.div>

            <motion.button
              type="submit"
              className="login-submit"
              disabled={loading}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.65, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -3 }}
              whileTap={{ y: 0, scale: 0.98 }}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </motion.button>
          </form>

          <motion.p
            className="login-card__footer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            Don&rsquo;t have an account?{' '}
            <Link to="/register" className="login-card__link">
              Register as Student
            </Link>
          </motion.p>
        </motion.div>
      </section>
    </motion.div>
  );
}
