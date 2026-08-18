import { motion } from 'framer-motion';
import { PiKanban, PiPlusBold, PiUsersThree, PiTag, PiIdentificationCard, PiChalkboardTeacher } from 'react-icons/pi';

export default function ProjectOverview({ team, onOpenRegisterTeam }) {
  if (!team) {
    return (
      <div className="sd-card" id="overview">
        <div className="sd-card__head">
          <h2 className="sd-card__title">
            <PiKanban className="sd-card__title-icon" /> Project Overview
          </h2>
        </div>

        <div className="sd-empty-state">
          <div className="sd-empty-state__icon">
            <PiUsersThree />
          </div>
          <h3 className="sd-empty-state__title">Your project team is not registered yet.</h3>
          <p className="sd-empty-state__sub">
            Register your team profile, add project members, and choose your domain to start your PRMES project review journey.
          </p>
          <motion.button
            className="sd-btn sd-btn-primary"
            onClick={onOpenRegisterTeam}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <PiPlusBold /> Register Project Team
          </motion.button>
        </div>
      </div>
    );
  }

  return (
    <div className="sd-card" id="overview">
      <div className="sd-card__head">
        <h2 className="sd-card__title">
          <PiKanban className="sd-card__title-icon" /> Project Overview
        </h2>
        <span className="sd-welcome-card__status-pill">
          Status: {team.status || 'Guide Allocation Pending'}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
        <div className="sd-stat-card" style={{ background: 'var(--bg-surface)' }}>
          <div className="sd-stat-card__info">
            <span className="sd-stat-card__label">Project Title</span>
            <span style={{ fontSize: '15.5px', fontWeight: 700, marginTop: '6px', color: 'var(--text-primary)' }}>
              {team.title || 'AI-Based Student Performance Prediction'}
            </span>
          </div>
        </div>

        <div className="sd-stat-card" style={{ background: 'var(--bg-surface)' }}>
          <div className="sd-stat-card__info">
            <span className="sd-stat-card__label">Domain</span>
            <span style={{ fontSize: '14.5px', fontWeight: 600, marginTop: '6px', color: 'var(--accent-cyan)' }}>
              {team.domain || 'Artificial Intelligence & Machine Learning'}
            </span>
          </div>
          <PiTag className="sd-stat-card__icon" />
        </div>

        <div className="sd-stat-card" style={{ background: 'var(--bg-surface)' }}>
          <div className="sd-stat-card__info">
            <span className="sd-stat-card__label">Team ID</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '16px', fontWeight: 700, marginTop: '6px', color: 'var(--text-primary)' }}>
              {team.team_id || 'PRMES-TEAM-2026-014'}
            </span>
          </div>
          <PiIdentificationCard className="sd-stat-card__icon" />
        </div>

        <div className="sd-stat-card" style={{ background: 'var(--bg-surface)' }}>
          <div className="sd-stat-card__info">
            <span className="sd-stat-card__label">Guide</span>
            <span style={{ fontSize: '14.5px', fontWeight: 600, marginTop: '6px', color: team.guide ? 'var(--text-primary)' : 'var(--accent-amber)' }}>
              {team.guide ? team.guide.name : 'Not Assigned (Pending)'}
            </span>
          </div>
          <PiChalkboardTeacher className="sd-stat-card__icon" />
        </div>
      </div>
    </div>
  );
}
