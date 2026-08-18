import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
  PiShieldCheck
} from 'react-icons/pi';

import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { registerInstitution } from '../../services/api';

import '../../styles/institution-register.css';

export default function InstitutionRegisterPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    institutionName: '',
    institutionCode: '',
    officialEmail: '',
    phone: '',
    address: '',
    state: '',
    contactPerson: '',
    adminName: '',
    adminEmail: '',
    adminPassword: '',
    confirmPassword: ''
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (formData.adminPassword !== formData.confirmPassword) {
      setErrorMsg('Admin passwords do not match.');
      return;
    }

    if (formData.adminPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    try {
      setLoading(true);
      const res = await registerInstitution(formData);
      if (res && res.success) {
        setShowSuccessModal(true);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to register institution with backend server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="inst-register-page">
      <div className="blueprint-grid" style={{ opacity: 0.6 }} />
      <Navbar />

      <div className="inst-register-container">
        <motion.div
          className="inst-register-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="inst-register-head">
            <span className="inst-register-badge">
              <PiShieldCheck style={{ fontSize: 16 }} /> Institutional Onboarding
            </span>
            <h1 className="inst-register-title">Register Engineering Institution</h1>
            <p className="inst-register-sub">
              Provision PRMES for your college or university. Create your institutional workspace, default department, and primary administrator account.
            </p>
          </div>

          {errorMsg && (
            <div style={{ padding: '12px 16px', borderRadius: 'var(--radius-sm)', background: 'rgba(255, 98, 89, 0.12)', border: '1px solid rgba(255, 98, 89, 0.3)', color: '#ff6259', fontSize: '13.5px', marginBottom: '24px' }}>
              ⚠️ {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* 1. Institution Metadata */}
            <div className="inst-form-section-title">
              <PiBuildings /> 1. Institution Details
            </div>

            <div className="register-grid-2" style={{ gap: '16px', marginBottom: '16px' }}>
              <div>
                <label className="register-label">Institution Name *</label>
                <div className="register-input-wrapper">
                  <PiBuildings className="register-input-icon" />
                  <input
                    type="text"
                    className="register-input"
                    placeholder="e.g. Guru Nanak Dev Engineering College"
                    value={formData.institutionName}
                    onChange={(e) => handleChange('institutionName', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="register-label">Institution Code (Short Name) *</label>
                <div className="register-input-wrapper">
                  <PiBarcode className="register-input-icon" />
                  <input
                    type="text"
                    className="register-input"
                    placeholder="e.g. GNDEC"
                    value={formData.institutionCode}
                    onChange={(e) => handleChange('institutionCode', e.target.value.toUpperCase())}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="register-grid-2" style={{ gap: '16px', marginBottom: '16px' }}>
              <div>
                <label className="register-label">Official Institution Email *</label>
                <div className="register-input-wrapper">
                  <PiEnvelopeSimple className="register-input-icon" />
                  <input
                    type="email"
                    className="register-input"
                    placeholder="e.g. info@gndec.edu.in"
                    value={formData.officialEmail}
                    onChange={(e) => handleChange('officialEmail', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="register-label">Official Contact Phone</label>
                <div className="register-input-wrapper">
                  <PiPhone className="register-input-icon" />
                  <input
                    type="tel"
                    className="register-input"
                    placeholder="e.g. 08482-226148"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="register-grid-2" style={{ gap: '16px', marginBottom: '24px' }}>
              <div>
                <label className="register-label">Campus Address &amp; City</label>
                <div className="register-input-wrapper">
                  <PiMapPin className="register-input-icon" />
                  <input
                    type="text"
                    className="register-input"
                    placeholder="e.g. Mailoor Road, Bidar"
                    value={formData.address}
                    onChange={(e) => handleChange('address', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="register-label">State / Region</label>
                <div className="register-input-wrapper">
                  <PiMapPin className="register-input-icon" />
                  <input
                    type="text"
                    className="register-input"
                    placeholder="e.g. Karnataka"
                    value={formData.state}
                    onChange={(e) => handleChange('state', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* 2. Administrator Account Provisioning */}
            <div className="inst-form-section-title">
              <PiUser /> 2. Institution Primary Admin Account
            </div>

            <div className="register-grid-2" style={{ gap: '16px', marginBottom: '16px' }}>
              <div>
                <label className="register-label">Admin Full Name *</label>
                <div className="register-input-wrapper">
                  <PiUser className="register-input-icon" />
                  <input
                    type="text"
                    className="register-input"
                    placeholder="e.g. System Administrator"
                    value={formData.adminName}
                    onChange={(e) => handleChange('adminName', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="register-label">Admin Login Email *</label>
                <div className="register-input-wrapper">
                  <PiEnvelopeSimple className="register-input-icon" />
                  <input
                    type="email"
                    className="register-input"
                    placeholder="e.g. admin@gndec.edu.in"
                    value={formData.adminEmail}
                    onChange={(e) => handleChange('adminEmail', e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="register-grid-2" style={{ gap: '16px', marginBottom: '28px' }}>
              <div>
                <label className="register-label">Admin Password *</label>
                <div className="register-input-wrapper">
                  <PiLockKey className="register-input-icon" />
                  <input
                    type="password"
                    className="register-input"
                    placeholder="At least 6 characters"
                    value={formData.adminPassword}
                    onChange={(e) => handleChange('adminPassword', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="register-label">Confirm Admin Password *</label>
                <div className="register-input-wrapper">
                  <PiLockKey className="register-input-icon" />
                  <input
                    type="password"
                    className="register-input"
                    placeholder="Re-enter password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleChange('confirmPassword', e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <motion.button
                type="submit"
                className="gd-btn gd-btn-primary"
                style={{ padding: '12px 28px', fontSize: '15px' }}
                disabled={loading}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                {loading ? 'Provisioning Workspace...' : 'Register Institution & Create Admin Account'}
                <PiArrowRightBold />
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>

      <Footer />

      {/* Success Confirmation Modal */}
      <AnimatePresence>
        {showSuccessModal && (
          <div className="sd-modal-backdrop" onClick={() => navigate('/login')}>
            <motion.div
              className="sd-modal"
              style={{ maxWidth: 540, textAlign: 'center' }}
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--accent-cyan-soft)', color: 'var(--accent-cyan)', display: 'grid', placeItems: 'center', fontSize: 32, margin: '0 auto 16px', boxShadow: '0 0 24px -4px var(--accent-cyan-soft)' }}>
                <PiCheckCircle />
              </div>

              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 700, margin: '0 0 8px' }}>
                Institution Onboarded Successfully!
              </h2>

              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '24px' }}>
                Your institution workspace for <strong>{formData.institutionName} ({formData.institutionCode})</strong> has been created with default department <strong>Computer Science &amp; Engineering</strong>.
              </p>

              <div style={{ padding: '14px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-surface)', border: '1px solid var(--border-hairline)', fontSize: '13px', textAlign: 'left', marginBottom: '24px' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Primary Admin Login</div>
                <div>Email: <strong>{formData.adminEmail}</strong></div>
                <div>Role: <strong>ADMIN</strong></div>
              </div>

              <button
                className="gd-btn gd-btn-primary"
                style={{ width: '100%', padding: '12px' }}
                onClick={() => navigate('/login')}
              >
                Proceed to Admin Login <PiArrowRightBold />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
