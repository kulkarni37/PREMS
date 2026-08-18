import { motion } from 'framer-motion';
import { PiX, PiUsersThree, PiFilePdf, PiChalkboardTeacher, PiKanban } from 'react-icons/pi';

export default function CoordinatorTeamDetailModal({ isOpen, onClose, team }) {
  if (!isOpen || !team) return null;

  const members = team.members || [
    { name: team.leader || 'Rahul Sharma', usn: '3GN22CS045', role: 'Leader' },
    { name: 'Priya Singh', usn: '3GN22CS048', role: 'Member' },
    { name: 'Amit Kumar', usn: '3GN22CS052', role: 'Member' },
    { name: 'Sneha Patel', usn: '3GN22CS061', role: 'Member' },
  ];

  return (
    <div className="sd-modal-backdrop" onClick={onClose}>
      <motion.div
        className="sd-modal"
        style={{ maxWidth: 720 }}
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 20 }}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="sd-modal__close" onClick={onClose}>
          <PiX />
        </button>

        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <span className="gd-team-card__id" style={{ fontSize: '14px' }}>
            {team.team_id || 'PRMES-TEAM-2026-014'}
          </span>
          <span className="sd-welcome-card__status-pill">
            Status: {team.status || 'On Track'}
          </span>
        </div>

        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 4px' }}>
          {team.title || 'AI-Based Student Performance Prediction'}
        </h2>
        <div style={{ fontSize: '14px', color: 'var(--accent-cyan)', marginBottom: '18px' }}>
          Domain: <strong>{team.domain || 'Artificial Intelligence & Machine Learning'}</strong>
        </div>

        {/* Guide Info Box */}
        <div style={{ padding: '12px 16px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-surface)', border: '1px solid var(--border-hairline)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <PiChalkboardTeacher style={{ fontSize: 24, color: 'var(--accent-cyan)' }} />
          <div>
            <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Assigned Faculty Guide</div>
            <div style={{ fontWeight: 700, fontSize: '14.5px', color: 'var(--text-primary)' }}>
              {team.guide || 'Dr. Faculty Guide'}
            </div>
          </div>
        </div>

        {/* Team Members List */}
        <div style={{ marginBottom: '22px' }}>
          <h4 style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px' }}>
            Team Roster ({members.length} Members)
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {members.map((m, idx) => (
              <div key={idx} style={{ padding: '10px 14px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-surface)', border: '1px solid var(--border-hairline)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '13.5px' }}>{m.name}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11.5px', color: 'var(--text-muted)' }}>USN: {m.usn}</div>
                </div>
                <span className={`sd-role-badge ${m.role === 'Leader' ? 'sd-role-badge--leader' : 'sd-role-badge--member'}`}>
                  {m.role}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Submitted Documents Section */}
        <div style={{ marginBottom: '22px' }}>
          <h4 style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px' }}>
            Submitted Project Documents
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ padding: '10px 14px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-surface)', border: '1px solid var(--border-hairline)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <PiFilePdf style={{ color: 'var(--accent-cyan)', fontSize: 20 }} />
                <span style={{ fontSize: '13.5px', fontWeight: 600 }}>Project Synopsis (Synopsis_v2.pdf)</span>
              </div>
              <span className="sd-doc-status-pill sd-doc-status-pill--approved">Approved ✓</span>
            </div>

            <div style={{ padding: '10px 14px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-surface)', border: '1px solid var(--border-hairline)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <PiFilePdf style={{ color: 'var(--accent-cyan)', fontSize: 20 }} />
                <span style={{ fontSize: '13.5px', fontWeight: 600 }}>Review 1 Presentation &amp; Report</span>
              </div>
              <span className="sd-status-badge sd-status-badge--pending">Pending Review</span>
            </div>
          </div>
        </div>

        <button className="gd-btn gd-btn-primary" style={{ width: '100%' }} onClick={onClose}>
          Close Project View
        </button>
      </motion.div>
    </div>
  );
}
