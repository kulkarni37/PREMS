import { useState } from 'react';
import { PiFolderSimple, PiFilePdf, PiCheckCircle, PiEyeBold } from 'react-icons/pi';

export default function DocumentOverview({ documents, onSelectTeam }) {
  const DEFAULT_PENDING = [
    { id: 'd1', teamId: 'PRMES-TEAM-2026-021', title: 'Review 1 Synopsis & Architecture', docType: 'Synopsis', date: '08 Sept 2026', status: 'Pending' },
    { id: 'd2', teamId: 'PRMES-TEAM-2026-033', title: 'Cloud Microservices Proposal Revisions', docType: 'Proposal', date: '05 Sept 2026', status: 'Pending' },
    { id: 'd3', teamId: 'PRMES-TEAM-2026-041', title: 'IoT Sensor Firmware Documentation', docType: 'Review 1 Report', date: '04 Sept 2026', status: 'Under Review' },
  ];

  const list = documents && documents.length > 0 ? documents : DEFAULT_PENDING;

  if (list.length === 0) {
    return (
      <div className="cd-card" id="documents">
        <div className="cd-card__head">
          <h2 className="cd-card__title">
            <PiFolderSimple className="cd-card__title-icon" /> Document Submission Overview
          </h2>
        </div>
        <div className="gd-empty-state">
          <div className="gd-empty-state__icon"><PiCheckCircle /></div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '17px', fontWeight: 600, margin: 0 }}>
            All document submissions are currently up to date.
          </h3>
        </div>
      </div>
    );
  }

  return (
    <div className="cd-card" id="documents">
      <div className="cd-card__head">
        <h2 className="cd-card__title">
          <PiFolderSimple className="cd-card__title-icon" /> Document Submission Overview
        </h2>
        <span className="cd-header__breadcrumb" style={{ color: 'var(--text-muted)' }}>
          42 Approved • {list.length} Pending Actions
        </span>
      </div>

      {/* Document Metrics Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px', marginBottom: '20px' }}>
        <div style={{ padding: '12px 14px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-surface)', border: '1px solid var(--border-hairline)', textAlign: 'center' }}>
          <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>Submitted</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700, marginTop: '2px' }}>44 Files</div>
        </div>
        <div style={{ padding: '12px 14px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-surface)', border: '1px solid var(--border-hairline)', textAlign: 'center' }}>
          <div style={{ fontSize: '10.5px', color: 'var(--accent-amber)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>Pending</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700, color: 'var(--accent-amber)', marginTop: '2px' }}>4 Files</div>
        </div>
        <div style={{ padding: '12px 14px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-surface)', border: '1px solid var(--border-hairline)', textAlign: 'center' }}>
          <div style={{ fontSize: '10.5px', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>Under Review</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700, color: 'var(--accent-cyan)', marginTop: '2px' }}>2 Files</div>
        </div>
        <div style={{ padding: '12px 14px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-surface)', border: '1px solid var(--border-hairline)', textAlign: 'center' }}>
          <div style={{ fontSize: '10.5px', color: '#2dd478', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>Approved</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700, color: '#2dd478', marginTop: '2px' }}>38 Files</div>
        </div>
        <div style={{ padding: '12px 14px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-surface)', border: '1px solid var(--border-hairline)', textAlign: 'center' }}>
          <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>Rejected</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700, marginTop: '2px' }}>0 Files</div>
        </div>
      </div>

      {/* Pending Submissions Table */}
      <div className="gd-doc-table">
        {list.map((d) => (
          <div key={d.id} className="gd-doc-row">
            <div className="gd-doc-info">
              <PiFilePdf style={{ fontSize: 26, color: 'var(--accent-cyan)' }} />
              <div>
                <div style={{ fontWeight: 700, fontSize: '14.5px', color: 'var(--text-primary)' }}>
                  {d.title}
                </div>
                <div style={{ fontSize: '12.5px', color: 'var(--accent-cyan)', marginTop: '2px' }}>
                  Team: <strong>{d.teamId}</strong> • Type: {d.docType}
                </div>
                <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Submitted Date: {d.date}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span className="sd-status-badge sd-status-badge--pending">{d.status}</span>
              <button
                className="gd-btn gd-btn-outline"
                style={{ padding: '5px 12px', fontSize: '12px' }}
                onClick={() => onSelectTeam({ team_id: d.teamId })}
              >
                <PiEyeBold /> View Submission
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
