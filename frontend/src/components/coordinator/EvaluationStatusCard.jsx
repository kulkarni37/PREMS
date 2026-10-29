import { PiStarBold, PiCheckCircle } from 'react-icons/pi';

export default function EvaluationStatusCard({ stageEvaluations, totalMarksEntered = 0, totalTeams = 0 }) {
  const STAGE_EVALS = stageEvaluations && stageEvaluations.length > 0 ? stageEvaluations : [
    { stage: 'Phase 1 — Review 1 (Synopsis)', evaluated: 0, total: totalTeams, status: 'Scheduled' },
    { stage: 'Phase 1 — Review 2 (Report & PPT)', evaluated: 0, total: totalTeams, status: 'Upcoming' },
    { stage: 'Phase 2 — Review 1 (Project PPT)', evaluated: 0, total: totalTeams, status: 'Locked' },
    { stage: 'Phase 2 — Review 2 (Final Defense)', evaluated: 0, total: totalTeams, status: 'Locked' },
  ];

  return (
    <div className="cd-card" id="evaluations">
      <div className="cd-card__head">
        <h2 className="cd-card__title">
          <PiStarBold className="cd-card__title-icon" /> Faculty Evaluation Monitoring
        </h2>
        <span className="sd-welcome-card__status-pill">
          {totalMarksEntered} Student Marks Recorded in Database
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {STAGE_EVALS.map((ev, idx) => {
          const percent = ev.total > 0 ? Math.round((ev.evaluated / ev.total) * 100) : 0;
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
