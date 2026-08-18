import { useState } from 'react';
import { PiBell, PiCheckCircle, PiWarningCircle, PiListChecks, PiFileText } from 'react-icons/pi';

export default function GuideNotifications() {
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'doc', text: 'New document submitted by PRMES-TEAM-2026-014 (Project Synopsis).', time: '10 minutes ago', read: false },
    { id: 2, type: 'event', text: 'Review 1 scheduled for PRMES-TEAM-2026-021 by department coordinator.', time: '2 hours ago', read: false },
    { id: 3, type: 'feedback', text: 'PRMES-TEAM-2026-009 requested feedback on dataset preprocessing.', time: 'Yesterday', read: false },
    { id: 4, type: 'alert', text: 'Evaluation marks entry deadline approaching for Review 1.', time: 'Yesterday', read: true },
  ]);

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <div className="gd-card" id="notifications">
      <div className="gd-card__head">
        <h2 className="gd-card__title">
          <PiBell className="gd-card__title-icon" /> Faculty Notifications
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
            {n.type === 'doc' ? (
              <PiFileText style={{ color: 'var(--accent-cyan)', fontSize: '20px', flexShrink: 0, marginTop: 2 }} />
            ) : n.type === 'alert' ? (
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
