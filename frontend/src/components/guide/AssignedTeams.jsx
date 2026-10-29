import { useState } from 'react';
import { motion } from 'framer-motion';
import { PiUsersThree, PiMagnifyingGlass, PiEyeBold, PiTag, PiCalendarBlank } from 'react-icons/pi';

export default function AssignedTeams({ teams = [], onSelectTeam }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  const teamList = Array.isArray(teams) ? teams : [];

  // Filter and Search logic
  const filteredTeams = teamList.filter((team) => {
    const matchesSearch =
      (team.team_id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (team.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (team.leader || '').toLowerCase().includes(searchTerm.toLowerCase());

    if (activeFilter === 'All') return matchesSearch;
    return matchesSearch && team.status === activeFilter;
  });

  const FILTERS = ['All', 'On Track', 'Needs Attention', 'At Risk', 'Completed'];

  if (teamList.length === 0) {
    return (
      <div className="gd-card" id="teams">
        <div className="gd-card__head">
          <h2 className="gd-card__title">
            <PiUsersThree className="gd-card__title-icon" /> My Assigned Teams
          </h2>
        </div>
        <div className="gd-empty-state">
          <div className="gd-empty-state__icon">👥</div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '17px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
            No project teams are currently assigned to you.
          </h3>
          <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', margin: 0 }}>
            Guide allocations are managed by department coordinators based on student domain selections and faculty specializations.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="gd-card" id="teams">
      <div className="gd-card__head">
        <h2 className="gd-card__title">
          <PiUsersThree className="gd-card__title-icon" /> My Assigned Teams
        </h2>
        <span className="gd-header__breadcrumb" style={{ color: 'var(--text-muted)' }}>
          Showing {filteredTeams.length} of {teamList.length} Teams
        </span>
      </div>

      {/* Search & Filter Controls */}
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

      {/* Teams Grid */}
      {filteredTeams.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)', fontSize: '14px' }}>
          No teams match your current search/filter criteria.
        </div>
      ) : (
        <div className="gd-teams-grid">
          {filteredTeams.map((team) => (
            <div key={team.team_id} className="gd-team-card">
              <div>
                <div className="gd-team-card__head">
                  <span className="gd-team-card__id">{team.team_id}</span>
                  <span
                    className={`sd-urgency-pill ${
                      team.status === 'On Track'
                        ? 'sd-urgency-pill--normal'
                        : team.status === 'Needs Attention'
                        ? 'sd-urgency-pill--approaching'
                        : 'sd-urgency-pill--overdue'
                    }`}
                  >
                    {team.status}
                  </span>
                </div>

                <h3 className="gd-team-card__title">{team.title}</h3>
                <div className="gd-team-card__domain">
                  <PiTag style={{ display: 'inline', marginRight: 4 }} />
                  {team.domain}
                </div>
              </div>

              <div className="gd-team-card__meta">
                <div>
                  <div className="gd-meta-label">Leader</div>
                  <div className="gd-meta-val">{team.leader}</div>
                </div>
                <div>
                  <div className="gd-meta-label">Members</div>
                  <div className="gd-meta-val">{team.membersCount || 0} Students</div>
                </div>
                <div>
                  <div className="gd-meta-label">Current Stage</div>
                  <div className="gd-meta-val" style={{ color: 'var(--accent-cyan)' }}>{team.stage}</div>
                </div>
                <div>
                  <div className="gd-meta-label">Progress</div>
                  <div className="gd-meta-val">{team.progress || 0}%</div>
                </div>
              </div>

              {/* Progress bar line */}
              <div style={{ width: '100%', height: 4, background: 'var(--border-hairline)', borderRadius: 999, overflow: 'hidden' }}>
                <div style={{ width: `${team.progress || 0}%`, height: '100%', background: 'linear-gradient(90deg, var(--accent-cyan), #7ce9f5)' }} />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <PiCalendarBlank /> Next: {team.deadline || 'Upcoming Stage'}
                </span>

                <motion.button
                  className="gd-btn gd-btn-outline"
                  style={{ padding: '6px 14px', fontSize: '12.5px' }}
                  onClick={() => onSelectTeam(team)}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <PiEyeBold /> View Project
                </motion.button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
