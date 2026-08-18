import { motion } from 'framer-motion';

export default function AdminStats({ stats }) {
  const STAT_ITEMS = [
    { label: 'Total Students', value: stats?.students ?? 0, icon: '🎓' },
    { label: 'Active Faculty', value: stats?.faculty ?? 0, icon: '👨‍🏫' },
    { label: 'Coordinators', value: stats?.coordinators ?? 0, icon: '👔' },
    { label: 'Project Teams', value: stats?.teams ?? 0, icon: '👥' },
    { label: 'Active Projects', value: stats?.activeProjects ?? 0, icon: '⚡' },
    { label: 'Guides Assigned', value: stats?.guidesAssigned ?? 0, icon: '✅' },
    { label: 'Pending Allocations', value: stats?.pendingAllocations ?? 0, icon: '⏳' },
    { label: 'Pending Evaluations', value: stats?.pendingEvaluations ?? 0, icon: '📊' },
  ];

  return (
    <div className="ad-stats-grid">
      {STAT_ITEMS.map((item, idx) => (
        <motion.div
          key={item.label}
          className="ad-stat-card"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: idx * 0.04, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="ad-stat-card__head">
            <span className="ad-stat-card__icon">{item.icon}</span>
            <span className="ad-stat-card__value">{item.value}</span>
          </div>
          <div className="ad-stat-card__label">{item.label}</div>
        </motion.div>
      ))}
    </div>
  );
}
