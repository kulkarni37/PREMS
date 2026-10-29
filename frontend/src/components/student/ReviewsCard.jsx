import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PiChartLineUp, PiCheckCircle, PiCalendarBlank, PiStarBold, PiX, PiLockKey, PiDownloadSimple } from 'react-icons/pi';
import { getOwnMarksPdfUrl } from '../../services/api';

export default function ReviewsCard({ reviews, user }) {
  const [selectedEvaluation, setSelectedEvaluation] = useState(null);

  const currentUser = user || (typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('prmes_user') || '{}') : {});
  const userEmail = currentUser?.email || '';

  const p1r1 = reviews?.p1r1 || {};
  const p1r2 = reviews?.p1r2 || {};
  const p2r1 = reviews?.p2r1 || {};
  const p2r2 = reviews?.p2r2 || {};

  const REVIEWS_DATA = [
    {
      id: 'p1r1',
      phase: 1,
      review: 1,
      title: 'Phase 1 — Review 1',
      sub: 'Requires Synopsis Document (.PDF / .DOCX)',
      status: p1r1.status === 'COMPLETED' || p1r1.status === 'APPROVED' ? 'Approved' : p1r1.status === 'CHANGES_REQUESTED' ? 'Changes Requested' : p1r1.status === 'SUBMITTED' ? 'Submitted / Under Review' : 'Open',
      attempt: `Attempt ${p1r1.current_attempt || 1} of 2`,
      marks: p1r1.marks ?? null,
      maxMarks: 50,
      feedback: p1r1.guide_feedback || 'Synopsis evaluation by assigned faculty guide.',
      isLocked: false,
      criteria1: p1r1.criteria1,
      criteria2: p1r1.criteria2,
      criteria3: p1r1.criteria3,
      criteria4: p1r1.criteria4,
    },
    {
      id: 'p1r2',
      phase: 1,
      review: 2,
      title: 'Phase 1 — Review 2',
      sub: 'Requires Project Report & Project PPT',
      status: p1r2.status === 'LOCKED' ? 'Locked' : (p1r2.status === 'COMPLETED' || p1r2.status === 'APPROVED' ? 'Approved' : p1r2.status === 'CHANGES_REQUESTED' ? 'Changes Requested' : p1r2.status === 'SUBMITTED' ? 'Submitted / Under Review' : 'Open'),
      attempt: `Attempt ${p1r2.current_attempt || 1} of 2`,
      marks: p1r2.marks ?? null,
      maxMarks: 50,
      feedback: p1r2.guide_feedback || 'Review 2 opens after Phase 1 Review 1 is approved.',
      isLocked: p1r2.status === 'LOCKED',
      criteria1: p1r2.criteria1,
      criteria2: p1r2.criteria2,
      criteria3: p1r2.criteria3,
      criteria4: p1r2.criteria4,
    },
    {
      id: 'p2r1',
      phase: 2,
      review: 1,
      title: 'Phase 2 — Review 1',
      sub: 'Requires Project PPT (.PPT / .PPTX)',
      status: p2r1.status === 'LOCKED' ? 'Locked' : (p2r1.status === 'COMPLETED' || p2r1.status === 'APPROVED' ? 'Approved' : p2r1.status === 'CHANGES_REQUESTED' ? 'Changes Requested' : p2r1.status === 'SUBMITTED' ? 'Submitted / Under Review' : 'Open'),
      attempt: `Attempt ${p2r1.current_attempt || 1} of 2`,
      marks: p2r1.marks ?? null,
      maxMarks: 50,
      feedback: p2r1.guide_feedback || 'Phase 2 opens after Phase 1 Review 2 is completed.',
      isLocked: p2r1.status === 'LOCKED',
      criteria1: p2r1.criteria1,
      criteria2: p2r1.criteria2,
      criteria3: p2r1.criteria3,
      criteria4: p2r1.criteria4,
    },
    {
      id: 'p2r2',
      phase: 2,
      review: 2,
      title: 'Phase 2 — Review 2 (Final Defense)',
      sub: 'Requires Final Project Report & Final Project PPT',
      status: p2r2.status === 'LOCKED' ? 'Locked' : (p2r2.status === 'COMPLETED' || p2r2.status === 'APPROVED' ? 'Approved' : p2r2.status === 'CHANGES_REQUESTED' ? 'Changes Requested' : p2r2.status === 'SUBMITTED' ? 'Submitted / Under Review' : 'Open'),
      attempt: `Attempt ${p2r2.current_attempt || 1} of 2`,
      marks: p2r2.marks ?? null,
      maxMarks: 50,
      feedback: p2r2.guide_feedback || 'Final comprehensive project evaluation and viva defense.',
      isLocked: p2r2.status === 'LOCKED',
      criteria1: p2r2.criteria1,
      criteria2: p2r2.criteria2,
      criteria3: p2r2.criteria3,
      criteria4: p2r2.criteria4,
    }
  ];

  return (
    <div className="sd-card" id="reviews">
      <div className="sd-card__head">
        <h2 className="sd-card__title">
          <PiChartLineUp className="sd-card__title-icon" /> Academic Reviews &amp; Evaluations
        </h2>
        <span className="sd-welcome-card__status-pill">
          {p2r2.status === 'COMPLETED' || p2r2.status === 'APPROVED' ? 'Project Completed ✓' : 'In Progress'}
        </span>
      </div>

      <div className="sd-reviews-list">
        {REVIEWS_DATA.map((rev) => (
          <div key={rev.id} className="sd-review-card" style={{ opacity: rev.isLocked ? 0.7 : 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: rev.isLocked ? 'rgba(255, 98, 89, 0.1)' : rev.status === 'Approved' ? 'var(--accent-cyan-soft)' : 'rgba(148, 178, 209, 0.08)',
                color: rev.isLocked ? '#ff6259' : rev.status === 'Approved' ? 'var(--accent-cyan)' : 'var(--text-muted)',
                display: 'grid',
                placeItems: 'center',
                fontSize: 20
              }}>
                {rev.isLocked ? <PiLockKey /> : rev.status === 'Approved' ? <PiCheckCircle /> : <PiCalendarBlank />}
              </div>

              <div>
                <div className="sd-review-name" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>{rev.title}</span>
                  {rev.isLocked && <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#ff6259' }}>🔒 LOCKED</span>}
                </div>
                <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {rev.sub}
                </div>
                <div style={{ fontSize: '11.5px', fontFamily: 'var(--font-mono)', color: rev.isLocked ? '#ff6259' : 'var(--accent-cyan)', marginTop: '4px' }}>
                  Status: <strong>{rev.status}</strong> • {rev.attempt}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {rev.marks !== null ? (
                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                  <div className="sd-review-marks">
                    {rev.marks} / {rev.maxMarks}
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      className="sd-btn sd-btn-outline"
                      style={{ padding: '4px 8px', fontSize: '11px' }}
                      onClick={() => setSelectedEvaluation(rev)}
                    >
                      Feedback
                    </button>
                    <a
                      href={getOwnMarksPdfUrl(userEmail, rev.phase, rev.review)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="sd-btn sd-btn-outline"
                      style={{ padding: '4px 8px', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px', textDecoration: 'none', color: 'var(--accent-cyan)' }}
                      title="Download Official CIE Marks Card PDF"
                    >
                      <PiDownloadSimple /> Marks Card
                    </a>
                  </div>
                </div>
              ) : (
                <span className={`sd-doc-status-pill ${rev.isLocked ? 'sd-urgency-pill--approaching' : 'sd-doc-status-pill--pending'}`}>
                  {rev.isLocked ? '🔒 LOCKED' : rev.status}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Evaluation Modal */}
      <AnimatePresence>
        {selectedEvaluation && (
          <div className="sd-modal-backdrop" onClick={() => setSelectedEvaluation(null)}>
            <motion.div
              className="sd-modal"
              initial={{ opacity: 0, scale: 0.92, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 16 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button className="sd-modal__close" onClick={() => setSelectedEvaluation(null)}>
                <PiX />
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                <PiStarBold style={{ color: 'var(--accent-amber)', fontSize: '24px' }} />
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 700, margin: 0 }}>
                  {selectedEvaluation.title} Evaluation
                </h3>
              </div>

              <div style={{ padding: '16px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-surface)', border: '1px solid var(--border-hairline)', marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Attempt Recorded</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 600, color: 'var(--accent-cyan)' }}>
                    {selectedEvaluation.attempt}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Total Score</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '15px', fontWeight: 700, color: '#34d399' }}>
                    {selectedEvaluation.marks} / {selectedEvaluation.maxMarks} Marks
                  </span>
                </div>

                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, paddingTop: '10px', borderTop: '1px solid var(--border-hairline)' }}>
                  <strong>Faculty Feedback:</strong> {selectedEvaluation.feedback}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <a
                  href={getOwnMarksPdfUrl(userEmail, selectedEvaluation.phase, selectedEvaluation.review)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="sd-btn sd-btn-primary"
                  style={{ flex: 1, textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                >
                  <PiDownloadSimple /> Download Official Marks Card (PDF)
                </a>
                <button
                  className="sd-btn sd-btn-outline"
                  onClick={() => setSelectedEvaluation(null)}
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
