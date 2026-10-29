import { motion } from 'framer-motion';
import { PiStarBold, PiCalendarBlank, PiCheckCircle, PiNotePencil } from 'react-icons/pi';

export default function UpcomingEvaluations({ evaluations = [], onOpenEvalModal }) {
  const evalList = Array.isArray(evaluations) ? evaluations : [];

  if (evalList.length === 0) {
    return (
      <div className="gd-card" id="evaluations">
        <div className="gd-card__head">
          <h2 className="gd-card__title">
            <PiStarBold className="gd-card__title-icon" /> Upcoming Evaluations
          </h2>
        </div>
        <div className="gd-empty-state">
          <div className="gd-empty-state__icon">
            <PiCheckCircle />
          </div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '17px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
            No upcoming evaluations.
          </h3>
          <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', margin: 0 }}>
            Scheduled evaluation stages assigned by the department panel will appear here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="gd-card" id="evaluations">
      <div className="gd-card__head">
        <h2 className="gd-card__title">
          <PiStarBold className="gd-card__title-icon" /> Upcoming &amp; Completed Evaluations
        </h2>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {evalList.map((item) => (
          <div key={item.id} className="gd-doc-row">
            <div className="gd-doc-info">
              <div style={{
                width: 38,
                height: 38,
                borderRadius: '50%',
                background: item.status === 'Completed' ? 'rgba(45, 212, 120, 0.14)' : 'var(--accent-cyan-soft)',
                color: item.status === 'Completed' ? '#2dd478' : 'var(--accent-cyan)',
                display: 'grid',
                placeItems: 'center',
                fontSize: 20
              }}>
                <PiStarBold />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '14.5px', color: 'var(--text-primary)' }}>
                  {item.title} — <span style={{ color: 'var(--accent-cyan)' }}>{item.teamId}</span>
                </div>
                <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  {item.teamTitle}
                </div>
                <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  <PiCalendarBlank style={{ display: 'inline', marginRight: 4 }} /> Scheduled: {item.date}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              {item.status === 'Completed' || item.status === 'APPROVED' ? (
                <div style={{ textAlign: 'right' }}>
                  <span className="sd-doc-status-pill sd-doc-status-pill--approved">
                    Approved ✓
                  </span>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Stage Completed
                  </div>
                </div>
              ) : (
                <>
                  <span className="sd-status-badge sd-status-badge--pending">
                    Upcoming
                  </span>
                  <motion.button
                    className="gd-btn gd-btn-primary"
                    style={{ padding: '7px 16px', fontSize: '12.5px' }}
                    onClick={() => onOpenEvalModal(item)}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <PiNotePencil /> Open Evaluation
                  </motion.button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
