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
  PiUser,
  PiChalkboardTeacher,
  PiBriefcase
} from 'react-icons/pi';
import logo from "../../assets/logo.png";
import { registerUser, registerStudent, fetchInstitutions, fetchDepartments, fetchDomains } from '../../services/api';
import { FIXED_PROJECT_DOMAINS } from '../../constants/domains';
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

  const [domainOptions, setDomainOptions] = useState(FIXED_PROJECT_DOMAINS);

  const [form, setForm] = useState({
    fullName: '',
    usn: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    semester: '7th Semester',
    section: 'A',
    designation: 'Assistant Professor',
    guideSecretCode: '',
    coordinatorSecretCode: '',
    pref1: FIXED_PROJECT_DOMAINS[0],
    pref2: FIXED_PROJECT_DOMAINS[1],
    pref3: FIXED_PROJECT_DOMAINS[2]
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showGuideSecretCode, setShowGuideSecretCode] = useState(false);
  const [showCoordinatorSecretCode, setShowCoordinatorSecretCode] = useState(false);
  const [registeredStudentId, setRegisteredStudentId] = useState('PRMES-STU-2026-0001');
  const [registeredRole, setRegisteredRole] = useState('STUDENT');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const getRoleModalContent = (role) => {
    const r = (role || 'STUDENT').toUpperCase();
    switch (r) {
      case 'TEAM_LEADER':
        return {
          message: 'Thank you for registering with PRMES. Your Team Leader account has been created successfully.',
          idLabel: 'TEAM LEADER ID',
          additional: 'You can now log in to access your Team Leader dashboard and manage your project team.'
        };
      case 'GUIDE':
        return {
          message: 'Thank you for registering with PRMES. Your Guide account has been created successfully.',
          idLabel: 'GUIDE ID',
          additional: 'You can now log in to access your Guide Dashboard and manage your assigned projects and guide responsibilities.'
        };
      case 'COORDINATOR':
        return {
          message: 'Thank you for registering with PRMES. Your Coordinator account has been created successfully.',
          idLabel: 'COORDINATOR ID',
          additional: 'You can now log in to access your Coordinator Dashboard and manage project coordination activities.'
        };
      case 'STUDENT':
      default:
        return {
          message: 'Thank you for registering with PRMES. Your student account has been created successfully.',
          idLabel: 'STUDENT ID',
          additional: 'Your project team will be assigned through a Team Leader. You will receive an email and notification when you are added to a project team.'
        };
    }
  };

  useEffect(() => {
    const loadDomains = async () => {
      try {
        const res = await fetchDomains();
        if (res && res.domains && res.domains.length > 0) {
          setDomainOptions(res.domains);
          setForm((prev) => ({
            ...prev,
            pref1: res.domains[0] || prev.pref1,
            pref2: res.domains[1] || prev.pref2,
            pref3: res.domains[4] || prev.pref3
          }));
        }
      } catch (err) {
        console.error('Failed to load domains:', err);
      }
    };
    loadDomains();
  }, []);

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

  const hasDuplicatePreferences = useMemo(() => {
    if (selectedRole !== 'GUIDE') return false;
    return form.pref1 === form.pref2 || form.pref2 === form.pref3 || form.pref1 === form.pref3;
  }, [selectedRole, form.pref1, form.pref2, form.pref3]);

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

    if (selectedRole === 'COORDINATOR') {
      if (!form.coordinatorSecretCode.trim()) {
        setErrorMsg('Coordinator Secret Code is required for Coordinator registration.');
        return;
      }
    }

    if (selectedRole === 'GUIDE') {
      if (!form.guideSecretCode.trim()) {
        setErrorMsg('Guide Secret Code is required for Faculty Guide registration.');
        return;
      }
      if (hasDuplicatePreferences) {
        setErrorMsg('Please select three different specialization preferences.');
        return;
      }
    }

    try {
      setLoading(true);
      const selectedOrg = organizations.find(o => String(o.id) === String(selectedOrgId));
      const selectedDept = departments.find(d => String(d.id) === String(selectedDeptId));

      const payload = {
        ...form,
        role: selectedRole,
        guide_secret_code: selectedRole === 'GUIDE' ? form.guideSecretCode.trim() : undefined,
        coordinator_secret_code: selectedRole === 'COORDINATOR' ? form.coordinatorSecretCode.trim() : undefined,
        preference_1: selectedRole === 'GUIDE' ? form.pref1 : undefined,
        preference_2: selectedRole === 'GUIDE' ? form.pref2 : undefined,
        preference_3: selectedRole === 'GUIDE' ? form.pref3 : undefined,
        institution_id: selectedOrgId,
        department_id: selectedDeptId,
        college: selectedOrg ? selectedOrg.institution_name : 'Guru Nanak Dev Engineering College',
        department: selectedDept ? selectedDept.department_name : 'Computer Science & Engineering'
      };

      const res = await registerUser(payload);
      if (res && res.success) {
        setRegisteredStudentId(res.student_id || 'PRMES-USER-2026-0001');
        setRegisteredRole(res.role || selectedRole);
        setShowSuccess(true);
      } else {
        setErrorMsg(res?.message || 'Registration failed. Please check your credentials.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Server error occurred during registration.');
    } finally {
      setLoading(false);
    }
  };

  const isFacultyRole = selectedRole === 'GUIDE' || selectedRole === 'COORDINATOR';

  return (
    <div className="register-page">
      <div className="register-page__grid bg-grid-pattern" />
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

      <main className="register-card">
        <div className="register-card__glow" />

        <div className="register-card__head">
          <div className="register-card__logo">
            <span className="register-card__logo-mark">
              <img src={logo} alt="PRMES Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
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
          {/* ---------------- Choose Account Role ---------------- */}
          <motion.div
            className="register-section"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="register-section__label">Select Account Role</span>

            <div className="register-field">
              <label htmlFor="reg-role-select">Account Role *</label>
              <div className="register-input">
                <PiUser className="register-input__icon" />
                <select
                  id="reg-role-select"
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  required
                >
                  <option value="TEAM_LEADER">Team Leader (Student Project Leader)</option>
                  <option value="STUDENT">Student (Project Team Member)</option>
                  <option value="GUIDE">Faculty Guide (Project Evaluator/Guide)</option>
                  <option value="COORDINATOR">Project Coordinator (Department Coordinator)</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginTop: '6px' }}>
              <div
                onClick={() => setSelectedRole('TEAM_LEADER')}
                style={{
                  padding: '10px 8px',
                  borderRadius: 'var(--radius-sm)',
                  background: selectedRole === 'TEAM_LEADER' ? 'var(--accent-cyan-soft)' : 'var(--bg-surface)',
                  border: selectedRole === 'TEAM_LEADER' ? '1px solid var(--accent-cyan)' : '1px solid var(--border-hairline)',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.2s ease-out'
                }}
              >
                <PiUsersThree style={{ color: selectedRole === 'TEAM_LEADER' ? 'var(--accent-cyan)' : 'var(--text-muted)', fontSize: 18, marginBottom: 2 }} />
                <div style={{ fontWeight: 700, fontSize: '12px', color: selectedRole === 'TEAM_LEADER' ? 'var(--accent-cyan)' : 'var(--text-primary)' }}>Team Leader</div>
              </div>

              <div
                onClick={() => setSelectedRole('STUDENT')}
                style={{
                  padding: '10px 8px',
                  borderRadius: 'var(--radius-sm)',
                  background: selectedRole === 'STUDENT' ? 'var(--accent-cyan-soft)' : 'var(--bg-surface)',
                  border: selectedRole === 'STUDENT' ? '1px solid var(--accent-cyan)' : '1px solid var(--border-hairline)',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.2s ease-out'
                }}
              >
                <PiUser style={{ color: selectedRole === 'STUDENT' ? 'var(--accent-cyan)' : 'var(--text-muted)', fontSize: 18, marginBottom: 2 }} />
                <div style={{ fontWeight: 700, fontSize: '12px', color: selectedRole === 'STUDENT' ? 'var(--accent-cyan)' : 'var(--text-primary)' }}>Student</div>
              </div>

              <div
                onClick={() => setSelectedRole('GUIDE')}
                style={{
                  padding: '10px 8px',
                  borderRadius: 'var(--radius-sm)',
                  background: selectedRole === 'GUIDE' ? 'var(--accent-cyan-soft)' : 'var(--bg-surface)',
                  border: selectedRole === 'GUIDE' ? '1px solid var(--accent-cyan)' : '1px solid var(--border-hairline)',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.2s ease-out'
                }}
              >
                <PiChalkboardTeacher style={{ color: selectedRole === 'GUIDE' ? 'var(--accent-cyan)' : 'var(--text-muted)', fontSize: 18, marginBottom: 2 }} />
                <div style={{ fontWeight: 700, fontSize: '12px', color: selectedRole === 'GUIDE' ? 'var(--accent-cyan)' : 'var(--text-primary)' }}>Faculty Guide</div>
              </div>

              <div
                onClick={() => setSelectedRole('COORDINATOR')}
                style={{
                  padding: '10px 8px',
                  borderRadius: 'var(--radius-sm)',
                  background: selectedRole === 'COORDINATOR' ? 'var(--accent-cyan-soft)' : 'var(--bg-surface)',
                  border: selectedRole === 'COORDINATOR' ? '1px solid var(--accent-cyan)' : '1px solid var(--border-hairline)',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.2s ease-out'
                }}
              >
                <PiBriefcase style={{ color: selectedRole === 'COORDINATOR' ? 'var(--accent-cyan)' : 'var(--text-muted)', fontSize: 18, marginBottom: 2 }} />
                <div style={{ fontWeight: 700, fontSize: '12px', color: selectedRole === 'COORDINATOR' ? 'var(--accent-cyan)' : 'var(--text-primary)' }}>Coordinator</div>
              </div>
            </div>
          </motion.div>

          {/* ---------------- Personal / Professional Details ---------------- */}
          <motion.div
            className="register-section"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="register-section__label">
              {isFacultyRole ? 'Faculty Professional Details' : 'Student Personal Details'}
            </span>

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
                <label htmlFor="reg-usn">
                  {isFacultyRole ? 'Faculty / Employee ID *' : 'USN / Student ID *'}
                </label>
                <div className="register-input">
                  <PiIdentificationCard className="register-input__icon" />
                  <input
                    id="reg-usn"
                    type="text"
                    placeholder={
                      selectedRole === 'GUIDE' ? 'e.g. FAC-CSE-012' :
                      selectedRole === 'COORDINATOR' ? 'e.g. CRD-CSE-001' :
                      'e.g. 3GN22CS045'
                    }
                    value={form.usn}
                    onChange={handleChange('usn')}
                    autoComplete="off"
                    required
                  />
                </div>
              </div>

              <div className="register-field">
                <label htmlFor="reg-email">
                  {isFacultyRole ? 'Official Email *' : 'College Email *'}
                </label>
                <div className="register-input">
                  <PiEnvelopeSimple className="register-input__icon" />
                  <input
                    id="reg-email"
                    type="email"
                    placeholder={isFacultyRole ? 'faculty@gndec.edu.in' : 'student@gndec.edu.in'}
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

              {/* Faculty Specific Extra Fields */}
              {isFacultyRole && (
                <>
                  <div className="register-field">
                    <label htmlFor="reg-desig">Faculty Designation</label>
                    <div className="register-input">
                      <PiBriefcase className="register-input__icon" />
                      <select
                        id="reg-desig"
                        value={form.designation}
                        onChange={handleChange('designation')}
                      >
                        <option value="Assistant Professor">Assistant Professor</option>
                        <option value="Associate Professor">Associate Professor</option>
                        <option value="Professor">Professor</option>
                        <option value="Project Coordinator">Project Coordinator</option>
                      </select>
                    </div>
                  </div>

                  {selectedRole === 'COORDINATOR' && (
                    <div className="register-field">
                      <label htmlFor="reg-coordinator-secret">Coordinator Secret Code *</label>
                      <div className="register-input">
                        <PiLockKey className="register-input__icon" />
                        <input
                          id="reg-coordinator-secret"
                          type={showCoordinatorSecretCode ? 'text' : 'password'}
                          placeholder="Enter Coordinator Secret Code"
                          value={form.coordinatorSecretCode}
                          onChange={handleChange('coordinatorSecretCode')}
                          autoComplete="off"
                          required
                        />
                        <button
                          type="button"
                          className="register-input__toggle"
                          onClick={() => setShowCoordinatorSecretCode(!showCoordinatorSecretCode)}
                          aria-label="Toggle secret code visibility"
                        >
                          {showCoordinatorSecretCode ? <PiEyeSlash /> : <PiEye />}
                        </button>
                      </div>
                    </div>
                  )}

                  {selectedRole === 'GUIDE' && (
                    <>
                      <div className="register-field">
                        <label htmlFor="reg-guide-secret">Guide Secret Code *</label>
                        <div className="register-input">
                          <PiLockKey className="register-input__icon" />
                          <input
                            id="reg-guide-secret"
                            type={showGuideSecretCode ? 'text' : 'password'}
                            placeholder="Enter Guide Secret Code"
                            value={form.guideSecretCode}
                            onChange={handleChange('guideSecretCode')}
                            autoComplete="off"
                            required
                          />
                          <button
                            type="button"
                            className="register-input__toggle"
                            onClick={() => setShowGuideSecretCode(!showGuideSecretCode)}
                            aria-label="Toggle secret code visibility"
                          >
                            {showGuideSecretCode ? <PiEyeSlash /> : <PiEye />}
                          </button>
                        </div>
                      </div>

                      {/* 3-Level Domain Specialization Preferences */}
                      <div style={{ gridColumn: 'span 2', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--border-hairline)' }}>
                        <span className="register-section__label" style={{ display: 'block', marginBottom: '8px' }}>
                          Domain Specialization Preferences *
                        </span>

                        {hasDuplicatePreferences && (
                          <div style={{ padding: '8px 12px', borderRadius: 'var(--radius-sm)', background: 'rgba(255, 98, 89, 0.12)', border: '1px solid rgba(255, 98, 89, 0.3)', color: '#ff6259', fontSize: '12.5px', marginBottom: '12px' }}>
                            ⚠️ Please select three different specialization preferences.
                          </div>
                        )}

                        <div className="register-grid register-grid--2" style={{ gap: '14px' }}>
                          <div className="register-field">
                            <label htmlFor="reg-pref1">🥇 1st Preference (Highest Priority) *</label>
                            <div className="register-input">
                              <PiCode className="register-input__icon" />
                              <select
                                id="reg-pref1"
                                value={form.pref1}
                                onChange={handleChange('pref1')}
                                required
                              >
                                {domainOptions.map((d) => (
                                  <option key={`p1-${d}`} value={d}>{d}</option>
                                ))}
                              </select>
                            </div>
                          </div>

                          <div className="register-field">
                            <label htmlFor="reg-pref2">🥈 2nd Preference (Medium Priority) *</label>
                            <div className="register-input">
                              <PiCode className="register-input__icon" />
                              <select
                                id="reg-pref2"
                                value={form.pref2}
                                onChange={handleChange('pref2')}
                                required
                              >
                                {domainOptions.map((d) => (
                                  <option key={`p2-${d}`} value={d}>{d}</option>
                                ))}
                              </select>
                            </div>
                          </div>

                          <div className="register-field" style={{ gridColumn: 'span 2' }}>
                            <label htmlFor="reg-pref3">🥉 3rd Preference (Third Priority) *</label>
                            <div className="register-input">
                              <PiCode className="register-input__icon" />
                              <select
                                id="reg-pref3"
                                value={form.pref3}
                                onChange={handleChange('pref3')}
                                required
                              >
                                {domainOptions.map((d) => (
                                  <option key={`p3-${d}`} value={d}>{d}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          </motion.div>

          {/* ---------------- Academic Details ---------------- */}
          <motion.div
            className="register-section"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="register-section__label">Academic Institution &amp; Department</span>

            <div className="register-grid" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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

              {/* Semester & Section Grid (Student & Team Leader Only) */}
              {!isFacultyRole && (
                <div className="register-grid register-grid--2">
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
              )}
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
            {loading ? 'Creating Account...' : `Register as ${selectedRole === 'GUIDE' ? 'Faculty Guide' : selectedRole === 'COORDINATOR' ? 'Coordinator' : selectedRole === 'TEAM_LEADER' ? 'Team Leader' : 'Student'}`}
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
      </main>

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

              {(() => {
                const modalContent = getRoleModalContent(registeredRole);
                return (
                  <>
                    <p className="register-modal__desc">
                      {modalContent.message}
                      <br />
                      <br />
                      {modalContent.additional}
                    </p>

                    <div className="register-modal__id">
                      <span className="register-modal__id-label">{modalContent.idLabel}</span>
                      <span className="register-modal__id-value">{registeredStudentId}</span>
                    </div>
                  </>
                );
              })()}

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