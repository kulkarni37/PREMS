import { PiCalendar, PiClock, PiWarningCircle, PiCheckCircle } from 'react-icons/pi';

export default function ReviewCalendarCard({ events = [] }) {
  const list = Array.isArray(events) ? events : [];

  return (
    <div className="cd-card">
      <div className="cd-card__head">
        <h2 className="cd-card__title">
          <PiCalendar className="cd-card__title-icon" /> Academic Calendar &amp; Timeline
        </h2>
      </div>

      {list.length === 0 ? (
        <div className="gd-empty-state">
          <div className="gd-empty-state__icon"><PiCalendar /></div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '17px', fontWeight: 600, margin: 0 }}>
            No calendar events or deadlines scheduled.
          </h3>
          <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
            Department academic schedule and submission deadlines will appear here once announced.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {list.map((evt) => (
            <div key={evt.id} className="sd-deadline-item">
              <div>
                <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)' }}>
                  {evt.title}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <PiClock /> {evt.date} • <strong style={{ color: 'var(--accent-cyan)' }}>{evt.type}</strong>
                </div>
              </div>

              <span className={`sd-urgency-pill ${evt.status === 'Approaching' ? 'sd-urgency-pill--approaching' : 'sd-urgency-pill--normal'}`}>
                {evt.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
