import { motion } from 'framer-motion';

export default function CoordinatorStats({ stats }) {
  const STAT_ITEMS = [
    { label: 'Total Teams', value: stats?.totalTeams ?? stats?.total_teams ?? 0, icon: '👥' },
    { label: 'Active Projects', value: stats?.activeProjects ?? stats?.active_projects ?? 0, icon: '⚡' },
    { label: 'Guides', value: stats?.guides ?? 0, icon: '👨‍🏫' },
    { label: 'Pending Allocations', value: stats?.pendingAllocations ?? stats?.pending_allocations ?? 0, icon: '⏳' },
    { label: 'Upcoming Reviews', value: stats?.upcomingReviews ?? stats?.upcoming_reviews ?? 0, icon: '📅' },
    { label: 'Pending Evaluations', value: stats?.pendingEvaluations ?? stats?.pending_evaluations ?? 0, icon: '📊' },
  ];

  return (
    <div className="cd-stats-grid">
      {STAT_ITEMS.map((item, idx) => (
        <motion.div
          key={item.label}
          className="cd-stat-card"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: idx * 0.06, ease: [0.16, 1, 0.3, 1] }}
        >
          <div>
            <div className="cd-stat-card__value">{item.value}</div>
            <div className="cd-stat-card__label">{item.label}</div>
          </div>
          <div className="cd-stat-card__icon">{item.icon}</div>
        </motion.div>
      ))}
    </div>
  );
}
