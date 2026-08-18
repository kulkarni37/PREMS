import { useState } from 'react';
import { PiBell, PiCheckCircle, PiWarningCircle, PiListChecks, PiUsersThree } from 'react-icons/pi';

export default function CoordinatorNotifications() {
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'alert', text: '4 registered teams are waiting for system guide allocation.', time: '10 minutes ago', read: false },
    { id: 2, type: 'info', text: 'Review 1 defense schedule has been published for Batch A.', time: '2 hours ago', read: false },
    { id: 3, type: 'warning', text: '3 faculty evaluation marks submissions are overdue for Review 1.', time: 'Yesterday', read: false },
    { id: 4, type: 'doc', text: 'PRMES-TEAM-2026-021 missed Review 1 synopsis submission deadline.', time: 'Yesterday', read: true },
  ]);

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <div className="cd-card" id="notifications">
      <div className="cd-card__head">
        <h2 className="cd-card__title">
          <PiBell className="cd-card__title-icon" /> Coordinator Notifications
        </h2>
        <button
          className="gd-btn gd-btn-outline"
          style={{ padding: '4px 10px', fontSize: '11.5px' }}
          onClick={handleMarkAllRead}
        >
          <PiListChecks /> Mark all as read
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {notifications.map((n) => (
          <div
            key={n.id}
            style={{
              padding: '12px 16px',
              borderRadius: 'var(--radius-sm)',
              background: n.read ? 'var(--bg-surface)' : 'var(--accent-cyan-soft)',
              border: '1px solid var(--border-hairline)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px'
            }}
          >
            {n.type === 'alert' ? (
              <PiUsersThree style={{ color: 'var(--accent-amber)', fontSize: '20px', flexShrink: 0, marginTop: 2 }} />
            ) : n.type === 'warning' ? (
              <PiWarningCircle style={{ color: 'var(--accent-amber)', fontSize: '20px', flexShrink: 0, marginTop: 2 }} />
            ) : (
              <PiCheckCircle style={{ color: 'var(--accent-cyan)', fontSize: '20px', flexShrink: 0, marginTop: 2 }} />
            )}

            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '13.5px', color: 'var(--text-primary)', fontWeight: n.read ? 400 : 600 }}>
                {n.text}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                {n.time}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
