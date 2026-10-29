import { PiClockCounterClockwise } from 'react-icons/pi';

export default function RecentActivityTimeline({ activities = [] }) {
  const list = Array.isArray(activities) ? activities : [];

  return (
    <div className="cd-card">
      <div className="cd-card__head">
        <h2 className="cd-card__title">
          <PiClockCounterClockwise className="cd-card__title-icon" /> Department Activity Log
        </h2>
      </div>

      {list.length === 0 ? (
        <div className="gd-empty-state">
          <div className="gd-empty-state__icon"><PiClockCounterClockwise /></div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '17px', fontWeight: 600, margin: 0 }}>
            No recent department activity recorded.
          </h3>
          <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
            Activity logs will appear as teams register, submit documents, and undergo reviews.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', position: 'relative', paddingLeft: '8px' }}>
          {list.map((act, idx) => (
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
      )}
    </div>
  );
}
