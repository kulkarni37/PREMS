import { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  PiCircuitry,
  PiUserCircle,
  PiIdentificationCard,
  PiEnvelopeSimple,
  PiPhone,
  PiBuildings,
  PiCode,
  PiBookOpen,
  PiChalkboard,
  PiLockKey,
  PiEye,
  PiEyeSlash,
  PiSealCheck,
  PiX,
  PiUsersThree,
  PiUser
} from 'react-icons/pi';
import { registerStudent, fetchInstitutions, fetchDepartments } from '../../services/api';
import '../../styles/register.css';

const PARTICLES = [
  { top: '10%', left: '14%', size: 4, duration: 9, delay: 0 },
  { top: '20%', left: '82%', size: 3, duration: 11, delay: 0.5 },
  { top: '32%', left: '6%', size: 5, duration: 8, delay: 1.1 },
  { top: '46%', left: '92%', size: 3, duration: 12, delay: 0.2 },
  { top: '58%', left: '4%', size: 4, duration: 10, delay: 1.5 },
  { top: '68%', left: '90%', size: 3, duration: 9.5, delay: 0.8 },
  { top: '80%', left: '16%', size: 4, duration: 13, delay: 0.3 },
  { top: '88%', left: '78%', size: 3, duration: 10.5, delay: 1.3 },
  { top: '6%', left: '48%', size: 3, duration: 8.5, delay: 1.9 },
  { top: '94%', left: '46%', size: 4, duration: 11.5, delay: 0.6 },
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

export default function RegisterPage() {
  const [selectedRole, setSelectedRole] = useState('TEAM_LEADER'); // 'TEAM_LEADER' or 'STUDENT'
  
  // Dynamic Organization & Department state
  const [organizations, setOrganizations] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedOrgId, setSelectedOrgId] = useState('');
  const [selectedDeptId, setSelectedDeptId] = useState('');

  const [form, setForm] = useState({
    fullName: '',
    usn: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    semester: '7th Semester',
    section: 'A'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registeredStudentId, setRegisteredStudentId] = useState('PRMES-STU-2026-0001');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Fetch active organizations on component mount
  useEffect(() => {
    const loadOrgs = async () => {
      try {
        const res = await fetchInstitutions();
        const list = res?.organizations || res?.institutions || [];
        setOrganizations(list);
        if (list.length > 0) {
          setSelectedOrgId(list[0].id);
        }
      } catch (err) {
        console.error('Failed to load organizations:', err);
      }
    };
    loadOrgs();
  }, []);

  // Fetch departments when selected Organization changes
  useEffect(() => {
    if (selectedOrgId) {
      const loadDepts = async () => {
        try {
          const res = await fetchDepartments(selectedOrgId);
          const list = res?.departments || [];
          setDepartments(list);
          if (list.length > 0) {
            setSelectedDeptId(list[0].id);
          } else {
            setSelectedDeptId('');
          }
        } catch (err) {
          console.error('Failed to load departments:', err);
        }
      };
      loadDepts();
    }
  }, [selectedOrgId]);

  const strength = useMemo(() => getPasswordStrength(form.password), [form.password]);
  const passwordsMatch = form.confirmPassword.length === 0 || form.confirmPassword === form.password;

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!agreed) return;

    if (!passwordsMatch) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);
      const selectedOrg = organizations.find(o => String(o.id) === String(selectedOrgId));
      const selectedDept = departments.find(d => String(d.id) === String(selectedDeptId));

      const payload = {
        ...form,
        role: selectedRole,
        institution_id: selectedOrgId,
        department_id: selectedDeptId,
        college: selectedOrg ? selectedOrg.institution_name : 'Guru Nanak Dev Engineering College',
        department: selectedDept ? selectedDept.department_name : 'Computer Science & Engineering'
      };

      const res = await registerStudent(payload);
      if (res && res.success) {
        if (res.student_id) {
          setRegisteredStudentId(res.student_id);
        }
        setShowSuccess(true);
      } else {
        setErrorMsg(res?.message || 'Registration failed.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="blueprint-grid register-page__grid" />
      <div className="register-page__orb" />

      <div className="register-page__particles" aria-hidden="true">
        {PARTICLES.map((p, i) => (
          <span
            key={i}
            className="register-particle"
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

      <motion.div
        className="register-card"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="register-card__glow" />

        <div className="register-card__head">
          <div className="register-card__logo">
            <span className="register-card__logo-mark">
              <PiCircuitry />
            </span>
            <span className="register-card__logo-text">PRMES</span>
          </div>
          <h1 className="register-card__title">Create Your PRMES Account</h1>
          <p className="register-card__sub">
            Project Review Management &amp; Evaluation System
          </p>
        </div>

        {errorMsg && (
          <div style={{ padding: '12px 16px', borderRadius: 'var(--radius-sm)', background: 'rgba(255, 98, 89, 0.12)', border: '1px solid rgba(255, 98, 89, 0.3)', color: '#ff6259', fontSize: '13.5px', marginBottom: '20px' }}>
            ⚠️ {errorMsg}
          </div>
        )}

        <form className="register-form" onSubmit={handleSubmit} noValidate>
          {/* ---------------- Choose Account Type ---------------- */}
          <motion.div
            className="register-section"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="register-section__label">Choose Account Type</span>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginTop: '8px' }}>
              {/* Option 1: Team Leader */}
              <div
                onClick={() => setSelectedRole('TEAM_LEADER')}
                style={{
                  padding: '14px 16px',
                  borderRadius: 'var(--radius-sm)',
                  background: selectedRole === 'TEAM_LEADER' ? 'var(--accent-cyan-soft)' : 'var(--bg-surface)',
                  border: selectedRole === 'TEAM_LEADER' ? '1px solid var(--accent-cyan)' : '1px solid var(--border-hairline)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease-out'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <PiUsersThree style={{ color: selectedRole === 'TEAM_LEADER' ? 'var(--accent-cyan)' : 'var(--text-muted)', fontSize: 20 }} />
                  <span style={{ fontWeight: 700, fontSize: '14.5px', color: selectedRole === 'TEAM_LEADER' ? 'var(--accent-cyan)' : 'var(--text-primary)' }}>
                    Team Leader
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Create and manage your project team.
                </div>
              </div>

              {/* Option 2: Student */}
              <div
                onClick={() => setSelectedRole('STUDENT')}
                style={{
                  padding: '14px 16px',
                  borderRadius: 'var(--radius-sm)',
                  background: selectedRole === 'STUDENT' ? 'var(--accent-cyan-soft)' : 'var(--bg-surface)',
                  border: selectedRole === 'STUDENT' ? '1px solid var(--accent-cyan)' : '1px solid var(--border-hairline)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease-out'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <PiUser style={{ color: selectedRole === 'STUDENT' ? 'var(--accent-cyan)' : 'var(--text-muted)', fontSize: 20 }} />
                  <span style={{ fontWeight: 700, fontSize: '14.5px', color: selectedRole === 'STUDENT' ? 'var(--accent-cyan)' : 'var(--text-primary)' }}>
                    Student
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Register as a student and join a project team.
                </div>
              </div>
            </div>
          </motion.div>

          {/* ---------------- Personal Details ---------------- */}
          <motion.div
            className="register-section"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="register-section__label">Personal Details</span>

            <div className="register-grid register-grid--2">
              <div className="register-field">
                <label htmlFor="reg-fullname">Full Name *</label>
                <div className="register-input">
                  <PiUserCircle className="register-input__icon" />
                  <input
                    id="reg-fullname"
                    type="text"
                    placeholder="Enter your full name"
                    value={form.fullName}
                    onChange={handleChange('fullName')}
                    autoComplete="name"
                    required
                  />
                </div>
              </div>

              <div className="register-field">
                <label htmlFor="reg-usn">USN / Student ID *</label>
                <div className="register-input">
                  <PiIdentificationCard className="register-input__icon" />
                  <input
                    id="reg-usn"
                    type="text"
                    placeholder="e.g. 3GN22CS045"
                    value={form.usn}
                    onChange={handleChange('usn')}
                    autoComplete="off"
                    required
                  />
                </div>
              </div>

              <div className="register-field">
                <label htmlFor="reg-email">College Email *</label>
                <div className="register-input">
                  <PiEnvelopeSimple className="register-input__icon" />
                  <input
                    id="reg-email"
                    type="email"
                    placeholder="you@gndec.edu.in"
                    value={form.email}
                    onChange={handleChange('email')}
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              <div className="register-field">
                <label htmlFor="reg-phone">Phone Number</label>
                <div className="register-input">
                  <PiPhone className="register-input__icon" />
                  <input
                    id="reg-phone"
                    type="tel"
                    placeholder="10-digit mobile number"
                    value={form.phone}
                    onChange={handleChange('phone')}
                    autoComplete="tel"
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* ---------------- Academic Details ---------------- */}
          <motion.div
            className="register-section"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="register-section__label">Academic Details</span>

            <div className="register-grid register-grid--2">
              {/* Dynamic Organization / College Dropdown */}
              <div className="register-field">
                <label htmlFor="reg-college">Organization / College *</label>
                <div className="register-input">
                  <PiBuildings className="register-input__icon" />
                  <select
                    id="reg-college"
                    value={selectedOrgId}
                    onChange={(e) => setSelectedOrgId(e.target.value)}
                    required
                  >
                    {organizations.length === 0 ? (
                      <option value="">Guru Nanak Dev Engineering College</option>
                    ) : (
                      organizations.map((org) => (
                        <option key={org.id} value={org.id}>
                          {org.institution_name} ({org.institution_code})
                        </option>
                      ))
                    )}
                  </select>
                </div>
              </div>

              {/* Dynamic Department Dropdown */}
              <div className="register-field">
                <label htmlFor="reg-dept">Department *</label>
                <div className="register-input">
                  <PiCode className="register-input__icon" />
                  <select
                    id="reg-dept"
                    value={selectedDeptId}
                    onChange={(e) => setSelectedDeptId(e.target.value)}
                    required
                  >
                    {departments.length === 0 ? (
                      <option value="">Computer Science &amp; Engineering</option>
                    ) : (
                      departments.map((dept) => (
                        <option key={dept.id} value={dept.id}>
                          {dept.department_name} ({dept.department_code})
                        </option>
                      ))
                    )}
                  </select>
                </div>
              </div>

              <div className="register-field">
                <label htmlFor="reg-semester">Semester</label>
                <div className="register-input">
                  <PiBookOpen className="register-input__icon" />
                  <select
                    id="reg-semester"
                    value={form.semester}
                    onChange={handleChange('semester')}
                    required
                  >
                    <option value="1st Semester">1st Semester</option>
                    <option value="2nd Semester">2nd Semester</option>
                    <option value="3rd Semester">3rd Semester</option>
                    <option value="4th Semester">4th Semester</option>
                    <option value="5th Semester">5th Semester</option>
                    <option value="6th Semester">6th Semester</option>
                    <option value="7th Semester">7th Semester</option>
                    <option value="8th Semester">8th Semester</option>
                  </select>
                </div>
              </div>

              <div className="register-field">
                <label htmlFor="reg-section">Section</label>
                <div className="register-input">
                  <PiChalkboard className="register-input__icon" />
                  <select
                    id="reg-section"
                    value={form.section}
                    onChange={handleChange('section')}
                    required
                  >
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                  </select>
                </div>
              </div>
            </div>
          </motion.div>

          {/* ---------------- Account Details ---------------- */}
          <motion.div
            className="register-section"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="register-section__label">Account Security</span>

            <div className="register-grid register-grid--2">
              <div className="register-field">
                <label htmlFor="reg-password">Password *</label>
                <div className="register-input">
                  <PiLockKey className="register-input__icon" />
                  <input
                    id="reg-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create a password"
                    value={form.password}
                    onChange={handleChange('password')}
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    className="register-input__toggle"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <PiEyeSlash /> : <PiEye />}
                  </button>
                </div>
              </div>

              <div className="register-field">
                <label htmlFor="reg-confirm-password">Confirm Password *</label>
                <div
                  className={`register-input ${
                    !passwordsMatch ? 'register-input--error' : ''
                  }`}
                >
                  <PiLockKey className="register-input__icon" />
                  <input
                    id="reg-confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Re-enter your password"
                    value={form.confirmPassword}
                    onChange={handleChange('confirmPassword')}
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    className="register-input__toggle"
                    onClick={() => setShowConfirmPassword((v) => !v)}
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <PiEyeSlash /> : <PiEye />}
                  </button>
                </div>
              </div>
            </div>

            {form.password && (
              <div className="register-strength">
                <div className="register-strength__track">
                  <motion.div
                    className={`register-strength__fill register-strength__fill--${strength.label.toLowerCase()}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${strength.percent}%` }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  />
                </div>
                <span
                  className={`register-strength__label register-strength__label--${strength.label.toLowerCase()}`}
                >
                  {strength.label}
                </span>
              </div>
            )}

            {!passwordsMatch && (
              <span className="register-error-text">Passwords do not match</span>
            )}
          </motion.div>

          {/* ---------------- Terms ---------------- */}
          <motion.label
            className="register-terms"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
          >
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
            />
            <span className="register-terms__box" />
            I hereby certify that the information provided above is true and correct to the best of my knowledge.
          </motion.label>

          <motion.button
            type="submit"
            className="register-submit"
            disabled={!agreed || loading}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
            whileHover={agreed ? { y: -3 } : {}}
            whileTap={agreed ? { y: 0, scale: 0.98 } : {}}
          >
            {loading ? 'Creating Account...' : selectedRole === 'TEAM_LEADER' ? 'Register as Team Leader' : 'Register as Student'}
          </motion.button>
        </form>

        <motion.p
          className="register-card__footer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          Already have an account?{' '}
          <Link to="/login" className="register-card__link">
            Login
          </Link>
        </motion.p>
      </motion.div>

      {/* ---------------- Success Modal ---------------- */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            className="register-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="register-modal"
              initial={{ opacity: 0, scale: 0.92, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 16 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="register-modal-title"
            >
              <button
                type="button"
                className="register-modal__close"
                onClick={() => setShowSuccess(false)}
                aria-label="Close"
              >
                <PiX />
              </button>

              <span className="register-modal__icon">
                <PiSealCheck />
              </span>

              <h2 id="register-modal-title" className="register-modal__title">
                🎉 Registration Successful!
              </h2>

              {selectedRole === 'TEAM_LEADER' ? (
                <p className="register-modal__desc">
                  Your Team Leader account has been created successfully.
                  <br />
                  <br />
                  You can now log in and create/register your project team.
                </p>
              ) : (
                <p className="register-modal__desc">
                  Thank you for registering with PRMES. Your student account has been created successfully.
                  <br />
                  <br />
                  Your project team will be assigned through a Team Leader. You will receive an email and notification when you are added to a project team.
                </p>
              )}

              <div className="register-modal__id">
                <span className="register-modal__id-label">{selectedRole === 'TEAM_LEADER' ? 'Team Leader ID' : 'Student ID'}</span>
                <span className="register-modal__id-value">{registeredStudentId}</span>
              </div>

              <Link to="/login" className="register-modal__btn">
                Go To Login
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}