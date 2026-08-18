import { useState } from 'react';
import { PiKanban, PiMagnifyingGlass, PiEyeBold } from 'react-icons/pi';

export default function ProjectOverview({ teams: realTeams, onSelectTeam }) {
  const [searchTerm, setSearchTerm] = useState('');

  const list = Array.isArray(realTeams) ? realTeams : [];

  const totalCount = list.length;
  const activeCount = list.filter((t) => t.status === 'Active' || !t.status).length;
  const completedCount = list.filter((t) => t.current_stage === 'Completed' || t.status === 'Completed').length;
  const pendingGuideCount = list.filter((t) => !t.guide_id && t.domain).length;
  const atRiskCount = list.filter((t) => t.status === 'Needs Attention' || t.status === 'At Risk').length;

  const filtered = list.filter((t) =>
    (t.team_id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (t.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (t.leader || t.leader_name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="ad-card" id="projects">
      <div className="ad-card__head">
        <h2 className="ad-card__title">
          <PiKanban className="ad-card__title-icon" /> System-Wide Project Management Master Control
        </h2>
        <span className="sd-welcome-card__status-pill">
          {totalCount} Total Projects Across Department
        </span>
      </div>

      {/* Summary Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '10px', marginBottom: '18px' }}>
        <div style={{ padding: '10px', borderRadius: '4px', background: 'var(--bg-surface)', border: '1px solid var(--border-hairline)', textAlign: 'center' }}>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>Total</div>
          <div style={{ fontSize: '16px', fontWeight: 700 }}>{totalCount}</div>
        </div>
        <div style={{ padding: '10px', borderRadius: '4px', background: 'var(--bg-surface)', border: '1px solid var(--border-hairline)', textAlign: 'center' }}>
          <div style={{ fontSize: '10px', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>Active</div>
          <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--accent-cyan)' }}>{activeCount}</div>
        </div>
        <div style={{ padding: '10px', borderRadius: '4px', background: 'var(--bg-surface)', border: '1px solid var(--border-hairline)', textAlign: 'center' }}>
          <div style={{ fontSize: '10px', color: '#2dd478', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>Completed</div>
          <div style={{ fontSize: '16px', fontWeight: 700, color: '#2dd478' }}>{completedCount}</div>
        </div>
        <div style={{ padding: '10px', borderRadius: '4px', background: 'var(--bg-surface)', border: '1px solid var(--border-hairline)', textAlign: 'center' }}>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>Reg. Pending</div>
          <div style={{ fontSize: '16px', fontWeight: 700 }}>0</div>
        </div>
        <div style={{ padding: '10px', borderRadius: '4px', background: 'var(--bg-surface)', border: '1px solid var(--accent-amber)', textAlign: 'center' }}>
          <div style={{ fontSize: '10px', color: 'var(--accent-amber)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>Pending Guide</div>
          <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--accent-amber)' }}>{pendingGuideCount}</div>
        </div>
        <div style={{ padding: '10px', borderRadius: '4px', background: 'var(--bg-surface)', border: '1px solid #ff6259', textAlign: 'center' }}>
          <div style={{ fontSize: '10px', color: '#ff6259', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>At Risk</div>
          <div style={{ fontSize: '16px', fontWeight: 700, color: '#ff6259' }}>{atRiskCount}</div>
        </div>
      </div>

      {/* Search Input */}
      <div className="gd-search-input" style={{ marginBottom: '18px', maxWidth: 360 }}>
        <PiMagnifyingGlass style={{ color: 'var(--text-muted)' }} />
        <input
          type="text"
          placeholder="Search by Team ID, Title, Leader..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px', fontFamily: 'var(--font-mono)' }}>
          📋 No project teams registered yet.
        </div>
      ) : (
        <div className="cd-table-container">
          <table className="cd-table">
            <thead>
              <tr>
                <th>Team ID</th>
                <th>Project Title</th>
                <th>Domain</th>
                <th>Team Leader</th>
                <th>Assigned Guide</th>
                <th>Coordinator</th>
                <th>Stage</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr key={t.team_id || t.id}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                    {t.team_id || `TEAM-${t.id}`}
                  </td>
                  <td style={{ fontWeight: 600, maxWidth: 220, whiteSpace: 'normal' }}>{t.title || 'Untitled Project'}</td>
                  <td>{t.domain || 'Unassigned'}</td>
                  <td>{t.leader || t.leader_name || 'N/A'}</td>
                  <td style={{ color: !t.guide || t.guide === 'Pending Allocation' ? 'var(--accent-amber)' : 'var(--text-primary)' }}>
                    {t.guide || 'Pending Allocation'}
                  </td>
                  <td>{t.coordinator || 'Department Coordinator'}</td>
                  <td style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>{t.stage || t.current_stage || 'Registration'}</td>
                  <td>
                    <span className={`sd-urgency-pill ${t.status === 'On Track' || t.status === 'Active' ? 'sd-urgency-pill--normal' : 'sd-urgency-pill--approaching'}`}>
                      {t.status || 'Active'}
                    </span>
                  </td>
                  <td>
                    <button
                      className="gd-btn gd-btn-outline"
                      style={{ padding: '3px 8px', fontSize: '11.5px' }}
                      onClick={() => onSelectTeam(t)}
                    >
                      <PiEyeBold /> View Project
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
