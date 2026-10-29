import { useState, useEffect } from 'react';
import { PiBell, PiCheckCircle, PiWarningCircle, PiListChecks, PiUsersThree } from 'react-icons/pi';

export default function CoordinatorNotifications({ notifications = [], onMarkAllRead }) {
  const [list, setList] = useState(notifications);

  useEffect(() => {
    setList(notifications);
  }, [notifications]);

  const handleMarkAllRead = () => {
    setList((prev) => prev.map((n) => ({ ...n, read: true })));
    if (onMarkAllRead) onMarkAllRead();
  };

  return (
    <div className="cd-card" id="notifications">
      <div className="cd-card__head">
        <h2 className="cd-card__title">
          <PiBell className="cd-card__title-icon" /> Coordinator Notifications
        </h2>
        {list.length > 0 && (
          <button
            className="gd-btn gd-btn-outline"
            style={{ padding: '4px 10px', fontSize: '11.5px' }}
            onClick={handleMarkAllRead}
          >
            <PiListChecks /> Mark all as read
          </button>
        )}
      </div>

      {list.length === 0 ? (
        <div className="gd-empty-state">
          <div className="gd-empty-state__icon"><PiCheckCircle /></div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '17px', fontWeight: 600, margin: 0 }}>
            No coordinator notifications.
          </h3>
          <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
            Alerts for pending allocations, submitted documents, and evaluation milestones will appear here.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {list.map((n) => {
            const isRead = Boolean(n.read);
            const text = n.message || n.text || n.title || 'Notification';
            const time = n.time || (n.created_at ? new Date(n.created_at).toLocaleString() : 'Recent');

            return (
              <div
                key={n.id}
                style={{
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-sm)',
                  background: isRead ? 'var(--bg-surface)' : 'var(--accent-cyan-soft)',
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
                  <div style={{ fontSize: '13.5px', color: 'var(--text-primary)', fontWeight: isRead ? 400 : 600 }}>
                    {text}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    {time}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
