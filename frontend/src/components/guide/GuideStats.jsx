import { motion } from 'framer-motion';

export default function GuideStats({ stats }) {
  const STAT_ITEMS = [
    { label: 'Assigned Teams', value: stats?.assignedTeams ?? 8, icon: '👥' },
    { label: 'Pending Reviews', value: stats?.pendingReviews ?? 3, icon: '⏳' },
    { label: 'Documents to Review', value: stats?.documentsToReview ?? 5, icon: '📑' },
    { label: 'Upcoming Evaluations', value: stats?.upcomingEvaluations ?? 2, icon: '📅' },
    { label: 'Completed Evaluations', value: stats?.completedEvaluations ?? 14, icon: '✅' },
  ];

  return (
    <div className="gd-stats-grid">
      {STAT_ITEMS.map((item, idx) => (
        <motion.div
          key={item.label}
          className="gd-stat-card"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: idx * 0.08, ease: [0.16, 1, 0.3, 1] }}
        >
          <div>
            <div className="gd-stat-card__value">{item.value}</div>
            <div className="gd-stat-card__label">{item.label}</div>
          </div>
          <div className="gd-stat-card__icon">{item.icon}</div>
        </motion.div>
      ))}
    </div>
  );
}
