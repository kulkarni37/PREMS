import { PiClockCounterClockwise } from 'react-icons/pi';

export default function SystemActivity() {
  const ACTIVITIES = [
    { user: 'Admin System', action: '36 Faculty profiles imported via CSV', time: 'Today', entity: 'Faculty Roster' },
    { user: 'Student User', action: 'Account registered (PRMES-STU-2026-0001)', time: 'Today', entity: 'User Auth' },
    { user: 'Allocation Engine', action: 'Guide Dr. Faculty Guide assigned to PRMES-TEAM-2026-014', time: 'Today', entity: 'Guide Allocation' },
    { user: 'Prof. Coordinator', action: 'Review 1 defense schedule published', time: 'Yesterday', entity: 'Review Schedule' },
    { user: 'Admin System', action: 'Coordinator account activated (Prof. Coordinator)', time: 'Yesterday', entity: 'Security RBAC' },
  ];

  return (
    <div className="ad-card" id="activity">
      <div className="ad-card__head">
        <h2 className="ad-card__title">
          <PiClockCounterClockwise className="ad-card__title-icon" /> System Audit Log &amp; Activity Log
        </h2>
      </div>

      <div className="cd-table-container">
        <table className="cd-table">
          <thead>
            <tr>
              <th>Initiator</th>
              <th>System Action Performed</th>
              <th>Target Entity</th>
              <th>Timestamp</th>
              <th>Audit Status</th>
            </tr>
          </thead>
          <tbody>
            {ACTIVITIES.map((act, idx) => (
              <tr key={idx}>
                <td style={{ fontWeight: 600, color: 'var(--accent-cyan)' }}>{act.user}</td>
                <td style={{ fontWeight: 500 }}>{act.action}</td>
                <td><span className="gd-team-card__id">{act.entity}</span></td>
                <td style={{ color: 'var(--text-muted)' }}>{act.time}</td>
                <td><span className="sd-doc-status-pill sd-doc-status-pill--approved">Logged ✓</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
