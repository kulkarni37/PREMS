import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PiBuildings,
  PiBarcode,
  PiEnvelopeSimple,
  PiPhone,
  PiMapPin,
  PiUser,
  PiLockKey,
  PiCheckCircle,
  PiArrowRightBold,
  PiShieldCheck,
  PiGlobe,
  PiCompass,
  PiEye,
  PiEyeSlash
} from 'react-icons/pi';

import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { registerOrganization } from '../../services/api';

import '../../styles/institution-register.css';

export default function OrganizationRegisterPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    organizationName: '',
    organizationCode: '',
    officialEmail: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    country: 'India',
    adminName: '',
    adminEmail: '',
    adminPassword: '',
    confirmPassword: ''
  });

  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validatePhone = (phone) => {
    return /^[0-9+\-\s()]{7,20}$/.test(phone);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    // Frontend Validations
    if (!formData.organizationName.trim()) {
      setErrorMsg('Organization Name is required.');
      return;
    }
    if (!formData.organizationCode.trim()) {
      setErrorMsg('Organization Code is required.');
      return;
    }
    if (!formData.officialEmail.trim() || !validateEmail(formData.officialEmail)) {
      setErrorMsg('Valid Official Organization Email is required.');
      return;
    }
    if (!formData.phone.trim() || !validatePhone(formData.phone)) {
      setErrorMsg('Valid Phone Number is required.');
      return;
    }
    if (!formData.address.trim()) {
      setErrorMsg('Address is required.');
      return;
    }
    if (!formData.city.trim()) {
      setErrorMsg('City is required.');
      return;
    }
    if (!formData.state.trim()) {
      setErrorMsg('State is required.');
      return;
    }
    if (!formData.country.trim()) {
      setErrorMsg('Country is required.');
      return;
    }

    if (!formData.adminName.trim()) {
      setErrorMsg('Admin Name is required.');
      return;
    }
    if (!formData.adminEmail.trim() || !validateEmail(formData.adminEmail)) {
      setErrorMsg('Valid Admin Email is required.');
      return;
    }
    if (!formData.adminPassword) {
      setErrorMsg('Admin Password is required.');
      return;
    }
    if (formData.adminPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }
    if (formData.adminPassword !== formData.confirmPassword) {
      setErrorMsg('Admin Password and Confirm Password do not match.');
      return;
    }

    try {
      setLoading(true);
      const res = await registerOrganization(formData);
      if (res && res.success) {
        setShowSuccessModal(true);
      } else {
        setErrorMsg(res?.message || 'Organization registration failed.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to register organization with backend server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="org-reg-page">
      <div className="blueprint-grid" style={{ opacity: 0.6 }} />
      <Navbar />

      <div className="org-reg-container">
        <motion.div
          className="org-reg-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Header */}
          <div className="org-reg-head">
            <span className="org-reg-badge">
              <PiShieldCheck style={{ fontSize: 15 }} /> Phase 1 — Hierarchy Setup
            </span>
            <h1 className="org-reg-title">Organization Registration</h1>
            <p className="org-reg-sub">
              Register your institution or organization on PRMES and provision your primary organization administrator account.
            </p>
          </div>

          {errorMsg && (
            <div style={{ padding: '12px 16px', borderRadius: '10px', background: 'rgba(255, 98, 89, 0.12)', border: '1px solid rgba(255, 98, 89, 0.3)', color: '#ff6259', fontSize: '13.5px', marginBottom: '24px' }}>
              ⚠️ {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {/* 1. ORGANIZATION INFORMATION */}
            <div className="org-form-section-title">
              <PiBuildings style={{ fontSize: 16 }} /> 1. ORGANIZATION INFORMATION
            </div>

            <div className="org-form-grid">
              {/* Organization Name */}
              <div className="org-form-group">
                <label className="org-form-label">Organization Name *</label>
                <div className="org-form-input-box">
                  <PiBuildings className="org-form-input-icon" />
                  <input
                    type="text"
                    placeholder="Enter organization name"
                    value={formData.organizationName}
                    onChange={(e) => handleChange('organizationName', e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Organization Code */}
              <div className="org-form-group">
                <label className="org-form-label">Organization Code *</label>
                <div className="org-form-input-box">
                  <PiBarcode className="org-form-input-icon" />
                  <input
                    type="text"
                    placeholder="Enter organization code"
                    value={formData.organizationCode}
                    onChange={(e) => handleChange('organizationCode', e.target.value.toUpperCase())}
                    required
                  />
                </div>
              </div>

              {/* Official Email */}
              <div className="org-form-group">
                <label className="org-form-label">Official Email *</label>
                <div className="org-form-input-box">
                  <PiEnvelopeSimple className="org-form-input-icon" />
                  <input
                    type="email"
                    placeholder="Enter official email"
                    value={formData.officialEmail}
                    onChange={(e) => handleChange('officialEmail', e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div className="org-form-group">
                <label className="org-form-label">Phone Number *</label>
                <div className="org-form-input-box">
                  <PiPhone className="org-form-input-icon" />
                  <input
                    type="tel"
                    placeholder="Enter phone number"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Address (Full-width 1 / -1) */}
              <div className="org-form-group org-form-full">
                <label className="org-form-label">Address *</label>
                <textarea
                  className="org-form-textarea"
                  rows={2}
                  placeholder="Enter organization address"
                  value={formData.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  required
                />
              </div>

              {/* City */}
              <div className="org-form-group">
                <label className="org-form-label">City *</label>
                <div className="org-form-input-box">
                  <PiCompass className="org-form-input-icon" />
                  <input
                    type="text"
                    placeholder="Enter city"
                    value={formData.city}
                    onChange={(e) => handleChange('city', e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* State */}
              <div className="org-form-group">
                <label className="org-form-label">State *</label>
                <div className="org-form-input-box">
                  <PiMapPin className="org-form-input-icon" />
                  <input
                    type="text"
                    placeholder="Enter state"
                    value={formData.state}
                    onChange={(e) => handleChange('state', e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Country (Full-width 1 / -1) */}
              <div className="org-form-group org-form-full">
                <label className="org-form-label">Country *</label>
                <div className="org-form-input-box">
                  <PiGlobe className="org-form-input-icon" />
                  <input
                    type="text"
                    placeholder="Enter country"
                    value={formData.country}
                    onChange={(e) => handleChange('country', e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            {/* 2. ADMINISTRATOR INFORMATION */}
            <div className="org-form-section-title">
              <PiUser style={{ fontSize: 16 }} /> 2. ADMINISTRATOR INFORMATION
            </div>

            <div className="org-form-grid">
              {/* Admin Name */}
              <div className="org-form-group">
                <label className="org-form-label">Admin Name *</label>
                <div className="org-form-input-box">
                  <PiUser className="org-form-input-icon" />
                  <input
                    type="text"
                    placeholder="Enter admin full name"
                    value={formData.adminName}
                    onChange={(e) => handleChange('adminName', e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Admin Email */}
              <div className="org-form-group">
                <label className="org-form-label">Admin Email *</label>
                <div className="org-form-input-box">
                  <PiEnvelopeSimple className="org-form-input-icon" />
                  <input
                    type="email"
                    placeholder="Enter admin email"
                    value={formData.adminEmail}
                    onChange={(e) => handleChange('adminEmail', e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Admin Password */}
              <div className="org-form-group">
                <label className="org-form-label">Admin Password *</label>
                <div className="org-form-input-box">
                  <PiLockKey className="org-form-input-icon" />
                  <input
                    type={showAdminPassword ? 'text' : 'password'}
                    placeholder="Enter admin password"
                    value={formData.adminPassword}
                    onChange={(e) => handleChange('adminPassword', e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="org-password-toggle"
                    onClick={() => setShowAdminPassword((v) => !v)}
                    title={showAdminPassword ? 'Hide Password' : 'Show Password'}
                  >
                    {showAdminPassword ? <PiEyeSlash /> : <PiEye />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="org-form-group">
                <label className="org-form-label">Confirm Password *</label>
                <div className="org-form-input-box">
                  <PiLockKey className="org-form-input-icon" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Re-enter admin password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleChange('confirmPassword', e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="org-password-toggle"
                    onClick={() => setShowConfirmPassword((v) => !v)}
                    title={showConfirmPassword ? 'Hide Password' : 'Show Password'}
                  >
                    {showConfirmPassword ? <PiEyeSlash /> : <PiEye />}
                  </button>
                </div>
              </div>
            </div>

            {/* Form Action Button (Aligned right) */}
            <div className="org-form-action">
              <motion.button
                type="submit"
                className="org-submit-btn"
                disabled={loading}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                {loading ? 'Creating...' : 'Register Organization'}
                <PiArrowRightBold />
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>

      <Footer />

      {/* Success View Modal */}
      <AnimatePresence>
        {showSuccessModal && (
          <div className="sd-modal-backdrop" onClick={() => navigate('/login')}>
            <motion.div
              className="sd-modal"
              style={{ maxWidth: 500, textAlign: 'center', padding: '36px 32px' }}
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'var(--accent-cyan-soft)', color: 'var(--accent-cyan)', display: 'grid', placeItems: 'center', fontSize: 30, margin: '0 auto 16px', boxShadow: '0 0 24px -4px var(--accent-cyan-soft)' }}>
                <PiCheckCircle />
              </div>

              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '23px', fontWeight: 700, margin: '0 0 8px', color: 'var(--text-primary)' }}>
                Organization Registered Successfully
              </h2>

              <p style={{ fontSize: '14.5px', color: 'var(--text-secondary)', lineHeight: 1.5, margin: '0 0 4px' }}>
                Your organization has been created successfully.
              </p>

              <p style={{ fontSize: '14px', color: 'var(--accent-cyan)', fontWeight: 600, margin: '0 0 20px' }}>
                Administrator account created successfully.
              </p>

              <div style={{ padding: '12px 16px', borderRadius: '10px', background: 'var(--bg-surface)', border: '1px solid var(--border-hairline)', fontSize: '13px', textAlign: 'left', marginBottom: '22px' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10.5px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Administrator Account</div>
                <div>Name: <strong>{formData.adminName}</strong></div>
                <div>Email: <strong>{formData.adminEmail}</strong></div>
                <div>Role: <strong>ADMIN</strong></div>
              </div>

              <button
                className="org-submit-btn"
                style={{ width: '100%', height: '48px', fontSize: '15px' }}
                onClick={() => navigate('/login')}
              >
                Go to Admin Login <PiArrowRightBold />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
