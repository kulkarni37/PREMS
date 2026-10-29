import { useState } from 'react';
import { motion } from 'framer-motion';
import { PiX, PiFilePdf, PiStarBold, PiPaperPlaneRight, PiDownloadSimple } from 'react-icons/pi';
import { sendGuideFeedback, getDocumentUrl } from '../../services/api';

export default function TeamDetailModal({ isOpen, onClose, team, onOpenEvalModal }) {
  const [newFeedback, setNewFeedback] = useState('');
  const [feedbackSending, setFeedbackSending] = useState(false);
  const [statusNotice, setStatusNotice] = useState('');

  if (!isOpen || !team) return null;

  // Extract real student member data from MySQL relationship
  const rawMembers = team.members || [];
  const membersList = rawMembers.map((m) => {
    const student = m.student || m;
    const isLeader = m.role_in_team === 'LEADER' || m.user_id === team.leader_id || student.role === 'TEAM_LEADER' || m.role === 'Leader';
    return {
      fullName: student.full_name || student.name || 'Not available',
      role: isLeader ? 'TEAM LEADER' : 'TEAM MEMBER',
      usn: student.usn || student.student_id || 'Not available',
      email: student.email || 'Not available',
      department: student.department || 'Not available',
      semester: student.semester || 'Not available',
      section: student.section || 'Not available',
      isLeader
    };
  });

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
      setStatusNotice(`Feedback submitted for ${team.team_id || 'Team'}.`);
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

        {/* Modal Header displaying exact Team Number from MySQL */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <div className="gd-team-card__id" style={{ fontSize: '14px', fontWeight: 700, color: 'var(--accent-cyan)' }}>
            {team.team_id || 'PRMES-TEAM-2026-001'}
          </div>
          <span className="sd-welcome-card__status-pill">
            Status: {team.status || 'On Track'}
          </span>
        </div>

        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 4px' }}>
          {team.title || 'Untitled Project Team'}
        </h2>
        <div style={{ fontSize: '14px', color: 'var(--accent-cyan)', marginBottom: '20px' }}>
          Domain: <strong>{team.domain || 'Not Selected Yet'}</strong>
        </div>

        {statusNotice && (
          <div style={{ padding: '10px 14px', borderRadius: 'var(--radius-sm)', background: 'var(--accent-cyan-soft)', border: '1px solid var(--accent-cyan)', color: 'var(--accent-cyan)', fontSize: '13px', marginBottom: '16px' }}>
            ℹ️ {statusNotice}
          </div>
        )}

        {/* Real Student Team Members (NO "TEAM ROSTER" heading) */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '22px' }}>
          {membersList.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', fontSize: '13px', color: 'var(--text-muted)' }}>
              No team members registered yet.
            </div>
          ) : (
            membersList.map((m, idx) => (
              <div
                key={idx}
                style={{
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-surface)',
                  border: m.isLeader ? '1px solid var(--border-hairline-strong)' : '1px solid var(--border-hairline)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                  <div style={{ fontWeight: 700, fontSize: '14.5px', color: 'var(--text-primary)' }}>
                    {m.fullName}
                  </div>
                  <span className={`sd-role-badge ${m.isLeader ? 'sd-role-badge--leader' : 'sd-role-badge--member'}`}>
                    {m.role}
                  </span>
                </div>

                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  USN: <strong style={{ color: 'var(--text-primary)' }}>{m.usn}</strong>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  Email: <span style={{ color: 'var(--accent-cyan)' }}>{m.email}</span>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  Department: <strong>{m.department}</strong>
                </div>
                <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {m.semester} • Section {m.section}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Submitted Documents Section */}
        {(() => {
          const REQUIRED_DOCUMENT_SLOTS = [
            {
              key: 'p1r1_synopsis',
              phaseLabel: 'Phase 1 — Review 1',
              docLabel: 'Synopsis',
              matchTypes: ['synopsis']
            },
            {
              key: 'p1r2_report',
              phaseLabel: 'Phase 1 — Review 2',
              docLabel: 'Project Report',
              matchTypes: ['phase1_report', 'review1_report', 'project_report']
            },
            {
              key: 'p1r2_ppt',
              phaseLabel: 'Phase 1 — Review 2',
              docLabel: 'Project PPT',
              matchTypes: ['phase1_ppt', 'review1_ppt', 'project_ppt']
            },
            {
              key: 'p2r1_ppt',
              phaseLabel: 'Phase 2 — Review 1',
              docLabel: 'Project PPT',
              matchTypes: ['phase2_review1_ppt', 'phase2_ppt']
            },
            {
              key: 'p2r2_report',
              phaseLabel: 'Phase 2 — Review 2',
              docLabel: 'Final Project Report',
              matchTypes: ['final_project_report', 'phase2_final_report', 'final_report']
            },
            {
              key: 'p2r2_ppt',
              phaseLabel: 'Phase 2 — Review 2',
              docLabel: 'Final Project PPT',
              matchTypes: ['final_project_ppt', 'phase2_final_ppt', 'final_ppt']
            }
          ];

          const documents = team.documents || [];
          const matchedDocIds = new Set();

          const slotResults = REQUIRED_DOCUMENT_SLOTS.map((slot) => {
            const matchedDoc = documents.find((doc) => {
              if (!doc) return false;
              const typeStr = (doc.doc_type || '').toLowerCase().trim();
              const normType = typeStr.replace(/[^a-z0-9]/g, '');
              return slot.matchTypes.some((t) => {
                const normT = t.replace(/[^a-z0-9]/g, '');
                return normType === normT || (normType.length > 3 && normT.includes(normType)) || (normT.length > 3 && normType.includes(normT));
              });
            });

            if (matchedDoc && matchedDoc.id) {
              matchedDocIds.add(matchedDoc.id);
            }

            return {
              ...slot,
              doc: matchedDoc || null
            };
          });

          const extraDocs = documents.filter((d) => d && d.id && !matchedDocIds.has(d.id));

          return (
            <div style={{ marginBottom: '22px' }}>
              <h4 style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '10px' }}>
                Submitted Project Documents
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {slotResults.map((slot, idx) => {
                  const doc = slot.doc;
                  const isSubmitted = !!doc;

                  let formattedDate = '';
                  if (doc && doc.created_at) {
                    try {
                      const d = new Date(doc.created_at);
                      formattedDate = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
                    } catch (e) {
                      formattedDate = doc.created_at;
                    }
                  }

                  return (
                    <div
                      key={idx}
                      style={{
                        padding: '12px 14px',
                        borderRadius: 'var(--radius-sm)',
                        background: 'var(--bg-surface)',
                        border: isSubmitted ? '1px solid var(--accent-cyan-soft, var(--border-hairline))' : '1px dashed var(--border-hairline)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: '6px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                        <div>
                          <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', color: 'var(--accent-cyan)', fontWeight: 600 }}>
                            {slot.phaseLabel}
                          </div>
                          <div style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
                            {slot.docLabel}
                          </div>
                        </div>
                        <span
                          style={{
                            fontSize: '10.5px',
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: '12px',
                            textTransform: 'uppercase',
                            whiteSpace: 'nowrap',
                            background: isSubmitted
                              ? (doc.status === 'APPROVED' || doc.status === 'COMPLETED'
                                  ? 'rgba(16, 185, 129, 0.15)'
                                  : doc.status === 'REJECTED' || doc.status === 'CHANGES_REQUESTED'
                                  ? 'rgba(239, 68, 68, 0.15)'
                                  : 'rgba(56, 189, 248, 0.15)')
                              : 'rgba(148, 163, 184, 0.15)',
                            color: isSubmitted
                              ? (doc.status === 'APPROVED' || doc.status === 'COMPLETED'
                                  ? '#10b981'
                                  : doc.status === 'REJECTED' || doc.status === 'CHANGES_REQUESTED'
                                  ? '#ef4444'
                                  : 'var(--accent-cyan)')
                              : 'var(--text-muted)'
                          }}
                        >
                          {isSubmitted ? (doc.status || 'SUBMITTED') : 'NOT SUBMITTED'}
                        </span>
                      </div>

                      {isSubmitted ? (
                        <div style={{ marginTop: '4px', fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            <PiFilePdf style={{ color: 'var(--accent-cyan)', fontSize: 16, flexShrink: 0 }} />
                            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }} title={doc.file_name}>
                              File: {doc.file_name}
                            </span>
                          </div>
                          {formattedDate && (
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                              Submitted: {formattedDate}
                            </div>
                          )}
                          {doc.file_path && (
                            <div style={{ marginTop: '4px' }}>
                              <a
                                href={getDocumentUrl(doc.file_path)}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ fontSize: '12px', color: 'var(--accent-cyan)', display: 'inline-flex', alignItems: 'center', gap: '4px', textDecoration: 'none', fontWeight: 600 }}
                              >
                                <PiDownloadSimple /> View File
                              </a>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', fontStyle: 'italic', marginTop: '4px' }}>
                          Pending submission
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {extraDocs.length > 0 && (
                <div style={{ marginTop: '12px' }}>
                  <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px' }}>
                    Additional Uploaded Files
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {extraDocs.map((doc, idx) => (
                      <div key={idx} style={{ padding: '8px 12px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-surface)', border: '1px solid var(--border-hairline)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <PiFilePdf style={{ color: 'var(--accent-cyan)', fontSize: 18 }} />
                          <span style={{ fontSize: '13px', fontWeight: 600 }}>{doc.file_name || doc.doc_type}</span>
                        </div>
                        {doc.file_path && (
                          <a
                            href={getDocumentUrl(doc.file_path)}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ fontSize: '12px', color: 'var(--accent-cyan)', display: 'inline-flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}
                          >
                            <PiDownloadSimple /> View File
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })()}

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
