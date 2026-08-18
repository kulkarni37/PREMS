import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PiX, PiPencilSimple, PiLockKey, PiCheckCircle } from 'react-icons/pi';
import { updateTeamInfo } from '../../services/api';

export default function EditTeamModal({ isOpen, onClose, team, user, onTeamUpdated }) {
  const [title, setTitle] = useState('');
  const [domain, setDomain] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (team) {
      setTitle(team.title || '');
      setDomain(team.domain || '');
    }
  }, [team]);

  if (!isOpen || !team) return null;

  const isDomainLocked = Boolean(team.guide_id);

  const DOMAINS = [
    'Artificial Intelligence & Machine Learning',
    'Web Development',
    'Data Science',
    'Cyber Security',
    'Cloud Computing',
    'IoT',
    'Mobile Application Development',
    'Software Engineering'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!title.trim()) {
      setErrorMsg('Please enter a project title.');
      return;
    }

    const payload = {
      leaderEmail: user?.email || team.leader_email,
      title: title.trim(),
      domain: isDomainLocked ? undefined : domain
    };

    try {
      setSubmitting(true);
      const res = await updateTeamInfo(payload);
      if (res && res.success) {
        if (onTeamUpdated) onTeamUpdated(res.team);
        onClose();
      } else {
        setErrorMsg(res?.message || 'Failed to update team information.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update team details with server.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="sd-modal-backdrop" onClick={onClose}>
      <motion.div
        className="sd-modal"
        style={{ maxWidth: 520 }}
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 20 }}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="sd-modal__close" onClick={onClose}>
          <PiX />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <PiPencilSimple style={{ color: 'var(--accent-cyan)', fontSize: '26px' }} />
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 700, margin: 0 }}>
            Edit Team Project Details
          </h3>
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
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                Project Domain
              </label>
              {isDomainLocked && (
                <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#ff6259' }}>
                  🔒 LOCKED
                </span>
              )}
            </div>

            {isDomainLocked ? (
              <div style={{ padding: '10px 12px', borderRadius: 'var(--radius-sm)', background: 'rgba(255, 98, 89, 0.08)', border: '1px solid rgba(255, 98, 89, 0.25)', color: 'var(--text-secondary)', fontSize: '13px' }}>
                <div style={{ fontWeight: 600, color: 'var(--accent-cyan)' }}>{domain || 'Not set'}</div>
                <div style={{ fontSize: '11.5px', color: '#ff6259', marginTop: '4px' }}>
                  This information is locked after guide allocation. Contact the Coordinator for changes.
                </div>
              </div>
            ) : (
              <select
                className="register-input"
                style={{ width: '100%', padding: '10px 12px', background: 'var(--bg-surface)' }}
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
              >
                {DOMAINS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            )}
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
            <button type="button" className="sd-btn sd-btn-outline" style={{ flex: 1 }} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="sd-btn sd-btn-primary" style={{ flex: 1 }} disabled={submitting}>
              {submitting ? 'Saving Changes...' : 'Save Team Changes'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
