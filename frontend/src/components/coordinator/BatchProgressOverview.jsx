import { motion } from 'framer-motion';
import { PiKanban, PiCheckCircle } from 'react-icons/pi';

export default function BatchProgressOverview() {
  const STAGES = [
    { label: 'Registration', count: 48, total: 48 },
    { label: 'Team Formation', count: 46, total: 48 },
    { label: 'Domain Selection', count: 44, total: 48 },
    { label: 'Guide Allocated', count: 42, total: 48 },
    { label: 'Development', count: 35, total: 48 },
    { label: 'Review 1', count: 22, total: 48 },
    { label: 'Review 2', count: 12, total: 48 },
    { label: 'Review 3', count: 6, total: 48 },
    { label: 'Final Evaluation', count: 4, total: 48 },
  ];

  return (
    <div className="cd-card">
      <div className="cd-card__head">
        <h2 className="cd-card__title">
          <PiKanban className="cd-card__title-icon" /> Department Batch Progress Overview
        </h2>
        <span className="sd-welcome-card__status-pill">
          48 Registered Teams • Academic Year 2026–27
        </span>
      </div>

      <div className="cd-batch-stages">
        {STAGES.map((st, idx) => {
          const percent = Math.round((st.count / st.total) * 100);
          return (
            <div key={st.label} className="cd-stage-col">
              <span className="cd-stage-count">{st.count}</span>
              <span className="cd-stage-name">{st.label}</span>

              <div className="cd-stage-bar-bg">
                <motion.div
                  className="cd-stage-bar-fill"
                  initial={{ width: 0 }}
                  animate={{ width: `${percent}%` }}
                  transition={{ duration: 0.8, delay: idx * 0.05, ease: [0.16, 1, 0.3, 1] }}
                />
              </div>

              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10.5px', color: 'var(--text-muted)' }}>
                {percent}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
