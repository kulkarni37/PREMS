export default function TeamStatus({ counts }) {
  const statusItems = [
    { key: 'ontrack', label: 'On Track', count: counts?.ontrack ?? 0, dotClass: 'gd-status-dot--ontrack' },
    { key: 'attention', label: 'Needs Attention', count: counts?.attention ?? 0, dotClass: 'gd-status-dot--attention' },
    { key: 'atrisk', label: 'At Risk', count: counts?.atrisk ?? 0, dotClass: 'gd-status-dot--atrisk' },
    { key: 'completed', label: 'Completed', count: counts?.completed ?? 0, dotClass: 'gd-status-dot--completed' },
  ];

  return (
    <div className="gd-status-overview">
      {statusItems.map((st) => (
        <div key={st.key} className="gd-status-item">
          <span className="gd-status-item__label">
            <span className={`gd-status-dot ${st.dotClass}`} />
            {st.label}
          </span>
          <span className="gd-status-item__count">{st.count}</span>
        </div>
      ))}
    </div>
  );
}
