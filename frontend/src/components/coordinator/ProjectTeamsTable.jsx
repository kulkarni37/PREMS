import { useState } from 'react';
import { motion } from 'framer-motion';
import { PiUsersThree, PiMagnifyingGlass, PiEyeBold } from 'react-icons/pi';

export default function ProjectTeamsTable({ teams, onSelectTeam }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  const DEFAULT_TEAMS = [
    {
      id: '014',
      team_id: 'PRMES-TEAM-2026-014',
      title: 'AI-Based Student Performance Prediction',
      domain: 'AI / ML',
      leader: 'Rahul Sharma',
      guide: 'Dr. Faculty Guide',
      stage: 'Review 1',
      progress: 42,
      status: 'On Track'
    },
    {
      id: '021',
      team_id: 'PRMES-TEAM-2026-021',
      title: 'Blockchain-Based Electronic Health Record System',
      domain: 'Cyber Security',
      leader: 'Ananya Verma',
      guide: 'Pending Allocation',
      stage: 'Domain Selection',
      progress: 25,
      status: 'Needs Attention'
    },
    {
      id: '009',
      team_id: 'PRMES-TEAM-2026-009',
      title: 'Smart Agriculture System using IoT Sensors',
      domain: 'IoT',
      leader: 'Vikram Das',
      guide: 'Dr. Faculty B',
      stage: 'Development',
      progress: 55,
      status: 'On Track'
    },
    {
      id: '033',
      team_id: 'PRMES-TEAM-2026-033',
      title: 'Cloud-Native Microservices E-Commerce Portal',
      domain: 'Cloud Computing',
      leader: 'Manish Pandey',
      guide: 'Dr. Faculty C',
      stage: 'Review 1 Document',
      progress: 18,
      status: 'At Risk'
    },
    {
      id: '045',
      team_id: 'PRMES-TEAM-2026-045',
      title: 'Automated Code Reviewer using LLM Fine-Tuning',
      domain: 'Software Engineering',
      leader: 'Siddharth Roy',
      guide: 'Dr. Faculty A',
      stage: 'Final Evaluation',
      progress: 92,
      status: 'Completed'
    }
  ];

  const teamList = teams && teams.length > 0 ? teams : DEFAULT_TEAMS;

  const filteredTeams = teamList.filter((t) => {
    const matchesSearch =
      t.team_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.leader.toLowerCase().includes(searchTerm.toLowerCase());

    if (activeFilter === 'All') return matchesSearch;
    return matchesSearch && t.status === activeFilter;
  });

  const FILTERS = ['All', 'On Track', 'Needs Attention', 'At Risk', 'Completed'];

  return (
    <div className="cd-card" id="teams">
      <div className="cd-card__head">
        <h2 className="cd-card__title">
          <PiUsersThree className="cd-card__title-icon" /> All Department Project Teams
        </h2>
        <span className="cd-header__breadcrumb" style={{ color: 'var(--text-muted)' }}>
          Showing {filteredTeams.length} of {teamList.length} Teams
        </span>
      </div>

      {/* Filter and Search Bar */}
      <div className="gd-filter-bar">
        <div className="gd-search-input">
          <PiMagnifyingGlass style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search by Team ID, Title, or Leader..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="gd-filter-pills">
          {FILTERS.map((f) => (
            <button
              key={f}
              className={`gd-filter-pill ${activeFilter === f ? 'gd-filter-pill--active' : ''}`}
              onClick={() => setActiveFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Table Container */}
      <div className="cd-table-container">
        <table className="cd-table">
          <thead>
            <tr>
              <th>Team ID</th>
              <th>Project Title</th>
              <th>Domain</th>
              <th>Team Leader</th>
              <th>Guide</th>
              <th>Current Stage</th>
              <th>Progress</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredTeams.map((t) => (
              <tr key={t.team_id}>
                <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                  {t.team_id}
                </td>
                <td style={{ fontWeight: 600, maxWidth: 260, whiteSpace: 'normal' }}>
                  {t.title}
                </td>
                <td>{t.domain}</td>
                <td>{t.leader}</td>
                <td style={{ color: t.guide === 'Pending Allocation' ? 'var(--accent-amber)' : 'var(--text-primary)' }}>
                  {t.guide}
                </td>
                <td style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>{t.stage}</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>{t.progress}%</span>
                    <div style={{ width: 60, height: 4, background: 'var(--border-hairline)', borderRadius: 999, overflow: 'hidden' }}>
                      <div style={{ width: `${t.progress}%`, height: '100%', background: 'var(--accent-cyan)' }} />
                    </div>
                  </div>
                </td>
                <td>
                  <span
                    className={`sd-urgency-pill ${
                      t.status === 'On Track'
                        ? 'sd-urgency-pill--normal'
                        : t.status === 'Needs Attention'
                        ? 'sd-urgency-pill--approaching'
                        : t.status === 'Completed'
                        ? 'sd-doc-status-pill--approved'
                        : 'sd-urgency-pill--overdue'
                    }`}
                  >
                    {t.status}
                  </span>
                </td>
                <td>
                  <button
                    className="gd-btn gd-btn-outline"
                    style={{ padding: '4px 10px', fontSize: '12px' }}
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
    </div>
  );
}
