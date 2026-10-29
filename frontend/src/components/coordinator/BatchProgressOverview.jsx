import { motion } from 'framer-motion';
import { PiKanban, PiCheckCircle } from 'react-icons/pi';

export default function BatchProgressOverview({ stages, totalTeams = 0, academicYear = '2026–27' }) {
  const STAGES = stages && stages.length > 0 ? stages : [
    { label: 'Registration', count: 0, total: totalTeams },
    { label: 'Team Formation', count: 0, total: totalTeams },
    { label: 'Domain Selection', count: 0, total: totalTeams },
    { label: 'Guide Allocated', count: 0, total: totalTeams },
    { label: 'Development', count: 0, total: totalTeams },
    { label: 'Review 1', count: 0, total: totalTeams },
    { label: 'Review 2', count: 0, total: totalTeams },
    { label: 'Review 3', count: 0, total: totalTeams },
    { label: 'Final Evaluation', count: 0, total: totalTeams },
  ];

  return (
    <div className="cd-card">
      <div className="cd-card__head">
        <h2 className="cd-card__title">
          <PiKanban className="cd-card__title-icon" /> Department Batch Progress Overview
        </h2>
        <span className="sd-welcome-card__status-pill">
          {totalTeams} Registered Teams • Academic Year {academicYear}
        </span>
      </div>

      <div className="cd-batch-stages">
        {STAGES.map((st, idx) => {
          const percent = st.total > 0 ? Math.round((st.count / st.total) * 100) : 0;
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
