import { PiBell, PiCheckCircle, PiWarningCircle, PiListChecks, PiFileText, PiCheck } from 'react-icons/pi';

export default function GuideNotifications({ notifications = [], onMarkRead, onMarkAllRead }) {
  const notifList = Array.isArray(notifications) ? notifications : [];

  return (
    <div className="gd-card" id="notifications">
      <div className="gd-card__head">
        <h2 className="gd-card__title">
          <PiBell className="gd-card__title-icon" /> Faculty Notifications
        </h2>
        {notifList.some(n => !n.read) && (
          <button
            className="gd-btn gd-btn-outline"
            style={{ padding: '4px 10px', fontSize: '11.5px' }}
            onClick={onMarkAllRead}
          >
            <PiListChecks /> Mark all as read
          </button>
        )}
      </div>

      {notifList.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)', fontSize: '13.5px' }}>
          No notifications available.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {notifList.map((n) => {
            const isUnread = !n.read;
            const text = n.message || n.text || n.title || 'Notification alert';
            const dateStr = n.created_at ? new Date(n.created_at).toLocaleString() : (n.time || 'Recently');
            const typeStr = (n.title || '').toLowerCase();

            return (
              <div
                key={n.id}
                style={{
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-sm)',
                  background: isUnread ? 'var(--accent-cyan-soft)' : 'var(--bg-surface)',
                  border: isUnread ? '1px solid var(--accent-cyan)' : '1px solid var(--border-hairline)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px'
                }}
              >
                {typeStr.includes('document') ? (
                  <PiFileText style={{ color: 'var(--accent-cyan)', fontSize: '20px', flexShrink: 0, marginTop: 2 }} />
                ) : typeStr.includes('alert') || typeStr.includes('warning') ? (
                  <PiWarningCircle style={{ color: 'var(--accent-amber)', fontSize: '20px', flexShrink: 0, marginTop: 2 }} />
                ) : (
                  <PiCheckCircle style={{ color: 'var(--accent-cyan)', fontSize: '20px', flexShrink: 0, marginTop: 2 }} />
                )}

                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13.5px', color: 'var(--text-primary)', fontWeight: isUnread ? 600 : 400 }}>
                    {n.title && <strong style={{ display: 'block', marginBottom: 2 }}>{n.title}</strong>}
                    {text}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    {dateStr}
                  </div>
                </div>

                {isUnread && onMarkRead && (
                  <button
                    className="gd-btn gd-btn-outline"
                    style={{ padding: '3px 8px', fontSize: '11px' }}
                    onClick={() => onMarkRead(n.id)}
                    title="Mark as read"
                  >
                    <PiCheck /> Mark read
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
