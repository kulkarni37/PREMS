import { useState } from 'react';
import { motion } from 'framer-motion';
import { PiX, PiGear, PiFloppyDisk, PiLock } from 'react-icons/pi';

export default function AdminSettingsModal({ isOpen, onClose }) {
  const [academicYear, setAcademicYear] = useState('2026–27');
  const [semester, setSemester] = useState('7th Semester');
  const [dept, setDept] = useState('Computer Science & Engineering');
  const [maxTeamSize, setMaxTeamSize] = useState('4');
  const [maxGuideCapacity, setMaxGuideCapacity] = useState('6');
  const [savedNotice, setSavedNotice] = useState('');

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    setSavedNotice('System configuration updated successfully.');
    setTimeout(() => {
      setSavedNotice('');
      onClose();
    }, 1200);
  };

  return (
    <div className="sd-modal-backdrop" onClick={onClose}>
      <motion.div
        className="sd-modal"
        style={{ maxWidth: 620 }}
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 20 }}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="sd-modal__close" onClick={onClose}>
          <PiX />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <PiGear style={{ color: 'var(--accent-cyan)', fontSize: '26px' }} />
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 700, margin: 0 }}>
            PRMES System Administration Settings
          </h3>
        </div>

        {savedNotice && (
          <div style={{ padding: '10px 14px', borderRadius: 'var(--radius-sm)', background: 'rgba(45, 212, 120, 0.14)', border: '1px solid #2dd478', color: '#2dd478', fontSize: '13px', marginBottom: '16px' }}>
            ✓ {savedNotice}
          </div>
        )}

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontFamily: 'var(--font-mono)', fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                Academic Year
              </label>
              <input
                type="text"
                className="register-input"
                style={{ width: '100%', padding: '10px 12px' }}
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontFamily: 'var(--font-mono)', fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                Current Semester
              </label>
              <input
                type="text"
                className="register-input"
                style={{ width: '100%', padding: '10px 12px' }}
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontFamily: 'var(--font-mono)', fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              Department Name
            </label>
            <input
              type="text"
              className="register-input"
              style={{ width: '100%', padding: '10px 12px' }}
              value={dept}
              onChange={(e) => setDept(e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontFamily: 'var(--font-mono)', fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                Maximum Team Size
              </label>
              <input
                type="number"
                min="1"
                max="6"
                className="register-input"
                style={{ width: '100%', padding: '10px 12px' }}
                value={maxTeamSize}
                onChange={(e) => setMaxTeamSize(e.target.value)}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontFamily: 'var(--font-mono)', fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                Guide Capacity Limit (Teams/Faculty)
              </label>
              <input
                type="number"
                min="1"
                max="10"
                className="register-input"
                style={{ width: '100%', padding: '10px 12px' }}
                value={maxGuideCapacity}
                onChange={(e) => setMaxGuideCapacity(e.target.value)}
              />
            </div>
          </div>

          {/* Security Note */}
          <div style={{ padding: '12px 14px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-surface)', border: '1px solid var(--border-hairline)', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12.5px', color: 'var(--text-muted)' }}>
            <PiLock style={{ fontSize: 18, color: 'var(--accent-cyan)' }} />
            <span>Sensitive backend credentials (SMTP secrets, database URIs, API keys) are secured in environment variables (`backend/.env`).</span>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
            <button type="button" className="sd-btn sd-btn-outline" style={{ flex: 1 }} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="sd-btn sd-btn-primary" style={{ flex: 1 }}>
              <PiFloppyDisk /> Save Configuration
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
