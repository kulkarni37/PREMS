import { PiStarBold, PiCheckCircle } from 'react-icons/pi';

export default function EvaluationStatusCard({ evaluations }) {
  const STAGE_EVALS = [
    { stage: 'Review 1 Evaluation', evaluated: 42, total: 48, status: 'Active' },
    { stage: 'Review 2 Mid-Term Defense', evaluated: 28, total: 48, status: 'Active' },
    { stage: 'Review 3 Code & Demo Audit', evaluated: 12, total: 48, status: 'Upcoming' },
    { stage: 'Final Defense & Viva Voce', evaluated: 4, total: 48, status: 'Upcoming' },
  ];

  return (
    <div className="cd-card" id="evaluations">
      <div className="cd-card__head">
        <h2 className="cd-card__title">
          <PiStarBold className="cd-card__title-icon" /> Faculty Evaluation Monitoring
        </h2>
        <span className="sd-welcome-card__status-pill">
          86 / 192 Total Stage Marks Entered
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {STAGE_EVALS.map((ev, idx) => {
          const percent = Math.round((ev.evaluated / ev.total) * 100);
          return (
            <div key={idx} style={{ padding: '16px 20px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-surface)', border: '1px solid var(--border-hairline)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontWeight: 700, fontSize: '14.5px', color: 'var(--text-primary)' }}>
                  {ev.stage}
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                  {ev.evaluated} / {ev.total} Teams Evaluated ({percent}%)
                </span>
              </div>

              <div style={{ width: '100%', height: 6, background: 'var(--border-hairline)', borderRadius: 999, overflow: 'hidden' }}>
                <div style={{ width: `${percent}%`, height: '100%', background: 'linear-gradient(90deg, var(--accent-cyan), #7ce9f5)' }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
