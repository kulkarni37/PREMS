import { PiClock, PiCalendar } from 'react-icons/pi';

export default function UpcomingDeadlines({ deadlines = [] }) {
  const deadlineList = Array.isArray(deadlines) ? deadlines : [];

  return (
    <div className="gd-card">
      <div className="gd-card__head">
        <h2 className="gd-card__title">
          <PiClock className="gd-card__title-icon" /> Upcoming Deadlines
        </h2>
      </div>

      {deadlineList.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)', fontSize: '13.5px' }}>
          No upcoming deadlines scheduled.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {deadlineList.map((item) => (
            <div key={item.id} className="sd-deadline-item">
              <div>
                <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)' }}>
                  {item.title} — <span style={{ color: 'var(--accent-cyan)' }}>{item.teamId}</span>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <PiCalendar /> {item.date}
                </div>
              </div>

              <span className={`sd-urgency-pill ${item.urgency === 'Approaching' ? 'sd-urgency-pill--approaching' : 'sd-urgency-pill--normal'}`}>
                {item.urgency || 'Scheduled'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
