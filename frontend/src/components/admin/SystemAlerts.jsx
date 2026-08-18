import { PiWarningCircle, PiCheckCircle } from 'react-icons/pi';

export default function SystemAlerts({ alerts }) {
  const DEFAULT_ALERTS = [
    { id: 1, text: '7 project teams waiting for automatic guide allocation.', priority: 'Warning' },
    { id: 2, text: '12 review evaluations are overdue across 3 guides.', priority: 'Warning' },
    { id: 3, text: '5 faculty accounts imported with pending activation.', priority: 'Normal' },
    { id: 4, text: '3 project teams missed Review 1 document submission deadline.', priority: 'Normal' },
  ];

  const list = alerts && alerts.length > 0 ? alerts : DEFAULT_ALERTS;

  if (list.length === 0) {
    return (
      <div className="ad-card">
        <div className="ad-card__head">
          <h2 className="ad-card__title">
            <PiWarningCircle className="ad-card__title-icon" style={{ color: '#2dd478' }} /> System Alerts &amp; Notifications
          </h2>
        </div>
        <div className="gd-empty-state">
          <div className="gd-empty-state__icon" style={{ color: '#2dd478', background: 'rgba(45, 212, 120, 0.12)' }}>
            <PiCheckCircle />
          </div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '17px', fontWeight: 600, margin: 0 }}>
            No critical system alerts.
          </h3>
          <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', margin: 0 }}>
            All user roles, allocations, evaluations, and security configurations are operating smoothly.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="ad-card">
      <div className="ad-card__head">
        <h2 className="ad-card__title">
          <PiWarningCircle className="ad-card__title-icon" style={{ color: 'var(--accent-amber)' }} /> System Alerts &amp; Security Escalations
        </h2>
        <span className="sd-urgency-pill sd-urgency-pill--approaching">
          {list.length} System Flags
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {list.map((a) => (
          <div key={a.id} className="gd-doc-row">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <PiWarningCircle style={{ fontSize: 20, color: a.priority === 'Critical' ? '#ff6259' : 'var(--accent-amber)' }} />
              <span style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text-primary)' }}>
                {a.text}
              </span>
            </div>

            <span className={`sd-urgency-pill ${a.priority === 'Critical' ? 'sd-urgency-pill--overdue' : 'sd-urgency-pill--approaching'}`}>
              {a.priority}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
