import { useState } from 'react';
import { PiBell, PiCheckCircle, PiWarningCircle, PiListChecks, PiClockCounterClockwise, PiEnvelopeOpen } from 'react-icons/pi';

export default function NotificationsCard({
  notifications: initialNotifications,
  onNotificationRead,
  onMarkAllRead,
}) {
  const DEFAULT_NOTIFICATIONS = [
    {
      id: 1,
      type: 'success',
      text: 'Guide assigned successfully: Dr. Faculty Guide assigned to your project team.',
      time: '2 hours ago',
      read: false
    },
    {
      id: 2,
      type: 'warning',
      text: 'Review 1 Project Report & PPT submission open (Due soon).',
      time: '1 day ago',
      read: false
    }
  ];

  const [list, setList] = useState(
    initialNotifications && initialNotifications.length > 0
      ? initialNotifications
      : DEFAULT_NOTIFICATIONS
  );

  const activities = [
    { text: 'Project domain selected (Artificial Intelligence & Machine Learning)', time: 'Today' },
    { text: 'Guide allocated (Dr. Faculty Name)', time: 'Yesterday' },
    { text: 'Team registered (4 / 4 Members)', time: '2 days ago' },
    { text: 'Student account registered (PRMES-STU-2026-0001)', time: '5 days ago' }
  ];

  const handleToggleRead = (id) => {
    const updated = list.map((n) => (n.id === id ? { ...n, read: true } : n));
    setList(updated);
    if (onNotificationRead) {
      onNotificationRead(id, updated);
    }
  };

  const handleMarkAll = () => {
    const updated = list.map((n) => ({ ...n, read: true }));
    setList(updated);
    if (onMarkAllRead) {
      onMarkAllRead(updated);
    }
  };

  const unreadCount = list.filter((n) => !n.read).length;

  return (
    <div className="sd-grid-2" id="notifications">
      {/* Notifications Panel */}
      <div className="sd-card">
        <div className="sd-card__head">
          <h2 className="sd-card__title">
            <PiBell className="sd-card__title-icon" /> Notifications
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className={`sd-doc-status-pill ${unreadCount > 0 ? 'sd-urgency-pill--approaching' : 'sd-doc-status-pill--approved'}`}>
              {unreadCount > 0 ? `${unreadCount} Unread` : 'All Read ✓'}
            </span>
            {unreadCount > 0 && (
              <button
                className="sd-btn sd-btn-outline"
                style={{ padding: '4px 10px', fontSize: '11.5px' }}
                onClick={handleMarkAll}
              >
                <PiListChecks /> Mark all as read
              </button>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {list.map((n) => (
            <div
              key={n.id}
              onClick={() => handleToggleRead(n.id)}
              style={{
                padding: '12px 14px',
                borderRadius: 'var(--radius-sm)',
                background: n.read ? 'var(--bg-surface)' : 'var(--accent-cyan-soft)',
                border: n.read ? '1px solid var(--border-hairline)' : '1px solid var(--accent-cyan)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s ease-out'
              }}
              title={n.read ? 'Notification Read' : 'Click to mark as read'}
            >
              {n.read ? (
                <PiEnvelopeOpen style={{ color: 'var(--text-muted)', fontSize: '20px', flexShrink: 0, marginTop: 2 }} />
              ) : n.type === 'success' ? (
                <PiCheckCircle style={{ color: 'var(--accent-cyan)', fontSize: '20px', flexShrink: 0, marginTop: 2 }} />
              ) : (
                <PiWarningCircle style={{ color: 'var(--accent-amber)', fontSize: '20px', flexShrink: 0, marginTop: 2 }} />
              )}
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '13.5px', color: n.read ? 'var(--text-secondary)' : 'var(--text-primary)', fontWeight: n.read ? 400 : 600 }}>
                  {n.text || n.message || n.title}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', display: 'flex', justifyContent: 'space-between' }}>
                  <span>{n.time || 'Recent'}</span>
                  {!n.read && <span style={{ color: 'var(--accent-cyan)', fontWeight: 700 }}>● Unread</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity Timeline */}
      <div className="sd-card">
        <div className="sd-card__head">
          <h2 className="sd-card__title">
            <PiClockCounterClockwise className="sd-card__title-icon" /> Recent Activity Audit
          </h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', position: 'relative', paddingLeft: '8px' }}>
          {activities.map((act, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', position: 'relative' }}>
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  background: idx === 0 ? 'var(--accent-cyan)' : 'var(--border-hairline-strong)',
                  boxShadow: idx === 0 ? '0 0 10px var(--accent-cyan)' : 'none',
                  marginTop: 5,
                  flexShrink: 0
                }}
              />
              <div>
                <div style={{ fontSize: '13.5px', color: 'var(--text-primary)', fontWeight: 500 }}>
                  {act.text}
                </div>
                <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {act.time}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
