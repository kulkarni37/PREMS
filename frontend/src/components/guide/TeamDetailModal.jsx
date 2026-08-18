import { useState } from 'react';
import { motion } from 'framer-motion';
import { PiX, PiKanban, PiUsersThree, PiFolderSimple, PiStarBold, PiPaperPlaneRight, PiCheckCircle, PiFilePdf } from 'react-icons/pi';
import { sendGuideFeedback } from '../../services/api';

export default function TeamDetailModal({ isOpen, onClose, team, onOpenEvalModal }) {
  const [newFeedback, setNewFeedback] = useState('');
  const [feedbackSending, setFeedbackSending] = useState(false);
  const [statusNotice, setStatusNotice] = useState('');

  if (!isOpen || !team) return null;

  const members = team.members || [
    { name: team.leader || 'Rahul Sharma', usn: '3GN22CS045', role: 'Leader' },
    { name: 'Priya Singh', usn: '3GN22CS048', role: 'Member' },
    { name: 'Amit Kumar', usn: '3GN22CS052', role: 'Member' },
    { name: 'Sneha Patel', usn: '3GN22CS061', role: 'Member' },
  ];

  const handleSendFeedback = async (e) => {
    e.preventDefault();
    if (!newFeedback.trim()) return;

    const payload = {
      team_id: team.team_id || team.teamId,
      feedback: newFeedback.trim(),
      timestamp: new Date().toISOString()
    };

    try {
      setFeedbackSending(true);
      await sendGuideFeedback(payload);
      setStatusNotice('Feedback sent to team dashboard.');
    } catch (err) {
      // Integration point notice
      setStatusNotice(`[API Integration Point] Feedback submitted for ${team.team_id || 'Team'}. Endpoint: /api/guide/feedback.`);
    } finally {
      setFeedbackSending(false);
      setNewFeedback('');
    }
  };

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
          <div className="gd-team-card__id" style={{ fontSize: '14px' }}>
            {team.team_id || 'PRMES-TEAM-2026-014'}
          </div>
          <span className="sd-welcome-card__status-pill">
            Status: {team.status || 'On Track'}
          </span>
        </div>

        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 4px' }}>
          {team.title || 'AI-Based Student Performance Prediction'}
        </h2>
        <div style={{ fontSize: '14px', color: 'var(--accent-cyan)', marginBottom: '20px' }}>
          Domain: <strong>{team.domain || 'Artificial Intelligence & Machine Learning'}</strong>
        </div>

        {statusNotice && (
          <div style={{ padding: '10px 14px', borderRadius: 'var(--radius-sm)', background: 'var(--accent-cyan-soft)', border: '1px solid var(--accent-cyan)', color: 'var(--accent-cyan)', fontSize: '13px', marginBottom: '16px' }}>
            ℹ️ {statusNotice}
          </div>
        )}

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

        {/* Mentoring Feedback Input */}
        <div style={{ marginBottom: '20px' }}>
          <h4 style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px' }}>
            Provide Direct Guide Feedback
          </h4>
          <form onSubmit={handleSendFeedback} style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text"
              placeholder="Enter feedback or recommendations for this team..."
              style={{
                flex: 1,
                padding: '10px 14px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-hairline-strong)',
                background: 'var(--bg-canvas)',
                color: 'var(--text-primary)',
                fontSize: '13.5px',
                outline: 'none'
              }}
              value={newFeedback}
              onChange={(e) => setNewFeedback(e.target.value)}
            />
            <button
              type="submit"
              className="gd-btn gd-btn-primary"
              style={{ padding: '10px 16px', fontSize: '13px' }}
              disabled={feedbackSending || !newFeedback.trim()}
            >
              <PiPaperPlaneRight /> {feedbackSending ? 'Sending...' : 'Send Feedback'}
            </button>
          </form>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            className="gd-btn gd-btn-primary"
            style={{ flex: 1 }}
            onClick={() => {
              onClose();
              if (onOpenEvalModal) onOpenEvalModal(team);
            }}
          >
            <PiStarBold /> Open Stage Evaluation
          </button>
          <button className="gd-btn gd-btn-outline" style={{ flex: 1 }} onClick={onClose}>
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
}
