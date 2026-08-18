import { PiCalendar, PiClock, PiWarningCircle, PiCheckCircle } from 'react-icons/pi';

export default function ReviewCalendarCard() {
  const TIMELINE_EVENTS = [
    { id: 1, title: 'Review 1 Synopsis Deadline', date: '12 Sept 2026', type: 'Deadline', status: 'Approaching' },
    { id: 2, title: 'Review 1 Panel Defense (Batch A)', date: '20 Sept 2026', type: 'Review Stage', status: 'Scheduled' },
    { id: 3, title: 'Review 1 Panel Defense (Batch B)', date: '22 Sept 2026', type: 'Review Stage', status: 'Scheduled' },
    { id: 4, title: 'Review 1 Marks Entry Deadline', date: '28 Sept 2026', type: 'Evaluation', status: 'Upcoming' },
    { id: 5, title: 'Review 2 Synopsis & Progress', date: '15 Oct 2026', type: 'Review Stage', status: 'Upcoming' },
  ];

  return (
    <div className="cd-card">
      <div className="cd-card__head">
        <h2 className="cd-card__title">
          <PiCalendar className="cd-card__title-icon" /> Academic Calendar &amp; Timeline
        </h2>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {TIMELINE_EVENTS.map((evt) => (
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
    </div>
  );
}
