import { PiWarningCircle, PiCheckCircle, PiEyeBold } from 'react-icons/pi';

export default function AtRiskProjectsCard({ atRiskTeams = [], onSelectTeam }) {
  const list = Array.isArray(atRiskTeams) ? atRiskTeams : [];

  if (list.length === 0) {
    return (
      <div className="cd-card">
        <div className="cd-card__head">
          <h2 className="cd-card__title">
            <PiWarningCircle className="cd-card__title-icon" style={{ color: '#2dd478' }} /> Projects Requiring Attention
          </h2>
        </div>
        <div className="gd-empty-state">
          <div className="gd-empty-state__icon" style={{ color: '#2dd478', background: 'rgba(45, 212, 120, 0.12)' }}>
            <PiCheckCircle />
          </div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '17px', fontWeight: 600, margin: 0 }}>
            All projects are currently on track.
          </h3>
          <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', margin: 0 }}>
            No delayed submissions, pending allocations, or flagged risks detected across registered teams.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="cd-card">
      <div className="cd-card__head">
        <h2 className="cd-card__title">
          <PiWarningCircle className="cd-card__title-icon" style={{ color: 'var(--accent-amber)' }} /> Projects Requiring Attention
        </h2>
        <span className="sd-urgency-pill sd-urgency-pill--approaching">
          {list.length} Flagged Issues
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {list.map((item, idx) => (
          <div key={idx} className="gd-doc-row" style={{ borderLeft: '3px solid var(--accent-amber)' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: '14.5px', color: 'var(--text-primary)' }}>
                {item.teamId} — {item.title}
              </div>
              <div style={{ fontSize: '13px', color: 'var(--accent-amber)', marginTop: '4px', fontWeight: 500 }}>
                ⚠️ Issue: {item.issue}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span className={`sd-urgency-pill ${item.status === 'At Risk' ? 'sd-urgency-pill--overdue' : 'sd-urgency-pill--approaching'}`}>
                {item.status}
              </span>
              <button
                className="gd-btn gd-btn-outline"
                style={{ padding: '5px 12px', fontSize: '12px' }}
                onClick={() => onSelectTeam({ team_id: item.teamId, title: item.title })}
              >
                <PiEyeBold /> View Project
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
