import { PiClock, PiCalendar } from 'react-icons/pi';

export default function UpcomingDeadlines() {
  const DEADLINES = [
    {
      id: 1,
      teamId: 'PRMES-TEAM-2026-014',
      title: 'Synopsis Review Deadline',
      date: '12 Sept 2026',
      urgency: 'Approaching'
    },
    {
      id: 2,
      teamId: 'PRMES-TEAM-2026-021',
      title: 'Review 1 Evaluation',
      date: '18 Sept 2026',
      urgency: 'Normal'
    },
    {
      id: 3,
      teamId: 'PRMES-TEAM-2026-009',
      title: 'Progress Review 2',
      date: '20 Sept 2026',
      urgency: 'Normal'
    }
  ];

  return (
    <div className="gd-card">
      <div className="gd-card__head">
        <h2 className="gd-card__title">
          <PiClock className="gd-card__title-icon" /> Upcoming Deadlines
        </h2>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {DEADLINES.map((item) => (
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
              {item.urgency}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
