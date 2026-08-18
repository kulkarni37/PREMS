import { useState } from 'react';
import { motion } from 'framer-motion';
import { PiX, PiUsersThree, PiTrash, PiCheckCircle } from 'react-icons/pi';
import { registerStudentTeam } from '../../services/api';

export default function RegisterTeamModal({ isOpen, onClose, onTeamRegistered, user }) {
  const [title, setTitle] = useState('');
  const [member1, setMember1] = useState(''); // Leader (User)
  const [member2, setMember2] = useState(''); // Member 2 email or USN
  const [member3, setMember3] = useState(''); // Member 3 email or USN
  const [member4, setMember4] = useState(''); // Member 4 email or USN
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const countFilled = 1 + (member2.trim() ? 1 : 0) + (member3.trim() ? 1 : 0) + (member4.trim() ? 1 : 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!title.trim()) {
      setErrorMsg('Please enter project title.');
      return;
    }

    if (!member2.trim() || !member3.trim() || !member4.trim()) {
      setErrorMsg('A team must have EXACTLY 4 members (1 Team Leader + 3 Team Members). Please provide all 3 member emails/USNs.');
      return;
    }

    const payload = {
      title: title.trim(),
      leaderEmail: user?.email || 'you@gndec.edu.in',
      memberEmails: [member2.trim(), member3.trim(), member4.trim()]
    };

    try {
      setSubmitting(true);
      const res = await registerStudentTeam(payload);
      if (res && res.success) {
        onTeamRegistered(res.team);
        onClose();
      } else {
        setErrorMsg(res?.message || 'Failed to register team.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to register team with backend server.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="sd-modal-backdrop" onClick={onClose}>
      <motion.div
        className="sd-modal"
        style={{ maxWidth: 580 }}
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 20 }}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="sd-modal__close" onClick={onClose}>
          <PiX />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <PiUsersThree style={{ color: 'var(--accent-cyan)', fontSize: '26px' }} />
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 700, margin: 0 }}>
              Register Project Team (Exactly 4 Members)
            </h3>
          </div>
          <span className={`sd-urgency-pill ${countFilled === 4 ? 'sd-doc-status-pill--approved' : 'sd-urgency-pill--approaching'}`}>
            {countFilled} / 4 Members
          </span>
        </div>

        {errorMsg && (
          <div style={{ padding: '10px 14px', borderRadius: 'var(--radius-sm)', background: 'rgba(255, 98, 89, 0.12)', border: '1px solid rgba(255, 98, 89, 0.3)', color: '#ff6259', fontSize: '13px', marginBottom: '16px' }}>
            ⚠️ {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontFamily: 'var(--font-mono)', fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              Project Title *
            </label>
            <input
              type="text"
              className="register-input"
              style={{ width: '100%', padding: '10px 12px' }}
              placeholder="e.g. AI-Based Student Performance Prediction & Evaluation System"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          {/* Member 1 (Leader) */}
          <div style={{ padding: '10px 12px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-surface)', border: '1px solid var(--border-hairline-strong)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 600, color: 'var(--accent-cyan)', marginBottom: '4px' }}>
              <span>Member 1 / 4 (Team Leader)</span>
              <span>Primary Creator ✓</span>
            </div>
            <div style={{ fontSize: '13.5px', color: 'var(--text-primary)', fontWeight: 600 }}>
              {user?.full_name || 'Team Leader'} ({user?.usn || '3GN22CS045'})
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              {user?.email || 'you@gndec.edu.in'}
            </div>
          </div>

          {/* Member 2 */}
          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontFamily: 'var(--font-mono)', fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              Member 2 / 4 (College Email or USN) *
            </label>
            <input
              type="text"
              className="register-input"
              style={{ width: '100%', padding: '10px 12px' }}
              placeholder="e.g. rahul.s@gndec.edu.in or 3GN22CS046"
              value={member2}
              onChange={(e) => setMember2(e.target.value)}
              required
            />
          </div>

          {/* Member 3 */}
          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontFamily: 'var(--font-mono)', fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              Member 3 / 4 (College Email or USN) *
            </label>
            <input
              type="text"
              className="register-input"
              style={{ width: '100%', padding: '10px 12px' }}
              placeholder="e.g. ananya.v@gndec.edu.in or 3GN22CS047"
              value={member3}
              onChange={(e) => setMember3(e.target.value)}
              required
            />
          </div>

          {/* Member 4 */}
          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontFamily: 'var(--font-mono)', fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              Member 4 / 4 (College Email or USN) *
            </label>
            <input
              type="text"
              className="register-input"
              style={{ width: '100%', padding: '10px 12px' }}
              placeholder="e.g. vikram.d@gndec.edu.in or 3GN22CS048"
              value={member4}
              onChange={(e) => setMember4(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
            <button type="button" className="sd-btn sd-btn-outline" style={{ flex: 1 }} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="sd-btn sd-btn-primary" style={{ flex: 1 }} disabled={submitting}>
              {submitting ? 'Registering Team...' : 'Register Team (4 Members)'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
