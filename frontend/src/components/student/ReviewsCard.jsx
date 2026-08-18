import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PiChartLineUp, PiCheckCircle, PiCalendarBlank, PiHourglass, PiStarBold, PiX, PiLockKey } from 'react-icons/pi';

export default function ReviewsCard({ reviews, review1, review2 }) {
  const [selectedEvaluation, setSelectedEvaluation] = useState(null);

  const r1Status = review1?.status || 'OPEN';
  const r1Attempt = review1?.current_attempt || 1;
  const r1Marks = review1?.marks ?? null;
  const r1Feedback = review1?.guide_feedback || 'Pending evaluation by assigned guide.';

  const r2Status = review2?.status || 'LOCKED';
  const r2Attempt = review2?.current_attempt || 1;
  const r2Marks = review2?.marks ?? null;
  const r2Feedback = review2?.guide_feedback || 'Review 2 will open after Review 1 is completed.';

  const REVIEWS_DATA = [
    {
      id: 'rev1',
      title: 'Review 1: First Project Review',
      sub: 'Requires Project Report (PDF/Doc) & Project PPT (.PPT/.PPTX)',
      status: r1Status === 'COMPLETED' ? 'Completed' : r1Status === 'CHANGES_REQUESTED' ? 'Changes Requested' : r1Status === 'SUBMITTED' ? 'Under Review' : 'Open',
      attempt: `Attempt ${r1Attempt} of 2`,
      marks: r1Marks,
      maxMarks: 50,
      feedback: r1Feedback,
      isLocked: false
    },
    {
      id: 'rev2',
      title: 'Review 2: Final Project Submission',
      sub: 'Requires Final Project Report & Final Project PPT',
      status: r2Status === 'LOCKED' ? 'Locked' : r2Status === 'COMPLETED' ? 'Completed' : r2Status === 'CHANGES_REQUESTED' ? 'Changes Requested' : r2Status === 'SUBMITTED' ? 'Under Review' : 'Open',
      attempt: `Attempt ${r2Attempt} of 2`,
      marks: r2Marks,
      maxMarks: 50,
      feedback: r2Feedback,
      isLocked: r1Status !== 'COMPLETED' && r2Status === 'LOCKED'
    },
    {
      id: 'final',
      title: 'Final Defense & Viva Voce Evaluation',
      sub: 'Final comprehensive evaluation by institutional panel',
      status: r2Status === 'COMPLETED' ? 'Scheduled' : 'Pending Review 2',
      attempt: 'Final Stage',
      marks: null,
      maxMarks: 100,
      feedback: 'Final presentation & viva evaluation.',
      isLocked: r2Status !== 'COMPLETED'
    }
  ];

  return (
    <div className="sd-card" id="reviews">
      <div className="sd-card__head">
        <h2 className="sd-card__title">
          <PiChartLineUp className="sd-card__title-icon" /> Academic Reviews &amp; Attempts (Max 2 Attempts)
        </h2>
        <span className="sd-welcome-card__status-pill">
          {r1Status === 'COMPLETED' ? 'Review 1 Completed ✓' : 'Review 1 Active'}
        </span>
      </div>

      <div className="sd-reviews-list">
        {REVIEWS_DATA.map((rev) => (
          <div key={rev.id} className="sd-review-card" style={{ opacity: rev.isLocked ? 0.75 : 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: rev.isLocked ? 'rgba(255, 98, 89, 0.1)' : rev.status === 'Completed' ? 'var(--accent-cyan-soft)' : 'rgba(148, 178, 209, 0.08)',
                color: rev.isLocked ? '#ff6259' : rev.status === 'Completed' ? 'var(--accent-cyan)' : 'var(--text-muted)',
                display: 'grid',
                placeItems: 'center',
                fontSize: 20
              }}>
                {rev.isLocked ? <PiLockKey /> : rev.status === 'Completed' ? <PiCheckCircle /> : <PiCalendarBlank />}
              </div>

              <div>
                <div className="sd-review-name" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>{rev.title}</span>
                  {rev.isLocked && <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#ff6259' }}>🔒 LOCKED</span>}
                </div>
                <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {rev.sub}
                </div>
                <div style={{ fontSize: '11.5px', fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)', marginTop: '4px' }}>
                  Status: <strong>{rev.status}</strong> • {rev.attempt}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              {rev.marks !== null ? (
                <div style={{ textAlign: 'right' }}>
                  <div className="sd-review-marks">
                    {rev.marks} / {rev.maxMarks}
                  </div>
                  <button
                    className="sd-btn sd-btn-outline"
                    style={{ padding: '4px 10px', fontSize: '11.5px', marginTop: '4px' }}
                    onClick={() => setSelectedEvaluation(rev)}
                  >
                    View Evaluation
                  </button>
                </div>
              ) : (
                <span className={`sd-doc-status-pill ${rev.isLocked ? 'sd-urgency-pill--approaching' : 'sd-doc-status-pill--pending'}`}>
                  {rev.isLocked ? 'Review 1 Pending' : rev.status}
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
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  <strong>Evaluator Feedback:</strong> {selectedEvaluation.feedback}
                </div>
              </div>

              <button className="sd-btn sd-btn-primary" style={{ width: '100%' }} onClick={() => setSelectedEvaluation(null)}>
                Close Evaluation Details
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
