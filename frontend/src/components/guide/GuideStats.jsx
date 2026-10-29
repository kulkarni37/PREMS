import { motion } from 'framer-motion';

export default function GuideStats({ stats }) {
  const STAT_ITEMS = [
    { label: 'Assigned Teams', value: stats?.assignedTeams ?? stats?.assigned_teams ?? 0, icon: '👥' },
    { label: 'Pending Reviews', value: stats?.pendingReviews ?? stats?.pending_reviews ?? 0, icon: '⏳' },
    { label: 'Documents to Review', value: stats?.documentsToReview ?? stats?.documents_to_review ?? 0, icon: '📑' },
    { label: 'Upcoming Evaluations', value: stats?.upcomingEvaluations ?? stats?.upcoming_evaluations ?? 0, icon: '📅' },
    { label: 'Completed Evaluations', value: stats?.completedEvaluations ?? stats?.completed_evaluations ?? 0, icon: '✅' },
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
