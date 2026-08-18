import { PiClockCounterClockwise } from 'react-icons/pi';

export default function RecentActivityTimeline() {
  const activities = [
    { text: 'Guide allocated to PRMES-TEAM-2026-014 (Dr. Faculty Guide)', time: 'Today' },
    { text: 'Review 1 schedule published for Batch A & B', time: 'Today' },
    { text: 'PRMES-TEAM-2026-021 submitted project synopsis', time: 'Yesterday' },
    { text: 'Evaluation completed for PRMES-TEAM-2026-009 (Score: 44/50)', time: 'Yesterday' },
  ];

  return (
    <div className="cd-card">
      <div className="cd-card__head">
        <h2 className="cd-card__title">
          <PiClockCounterClockwise className="cd-card__title-icon" /> Department Activity Log
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
  );
}
