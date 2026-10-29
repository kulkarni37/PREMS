import { motion } from 'framer-motion';
import { PiChalkboardTeacher, PiCheckCircle, PiHourglass, PiNotePencil } from 'react-icons/pi';

export default function GuideAllocationTable({ guides, metrics, onReviewAllocation }) {
  const list = Array.isArray(guides) ? guides : [];

  const totalGuides = metrics?.totalGuides ?? list.length;
  const availableSlots = metrics?.availableSlots ?? list.reduce((acc, g) => acc + (g.availableSlots ?? Math.max(0, (g.capacity || 3) - (g.assignedCount || 0))), 0);
  const assignedTeams = metrics?.assignedTeams ?? list.reduce((acc, g) => acc + (g.assignedCount || 0), 0);
  const pendingAllocations = metrics?.pendingAllocations ?? 0;

  return (
    <div className="cd-card" id="guides">
      <div className="cd-card__head">
        <h2 className="cd-card__title">
          <PiChalkboardTeacher className="cd-card__title-icon" /> Faculty Guide Workload &amp; Allocation
        </h2>
        <span className="sd-welcome-card__status-pill">
          {pendingAllocations} {pendingAllocations === 1 ? 'Team' : 'Teams'} Pending System Allocation
        </span>
      </div>

      {/* Allocation Summary Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '20px' }}>
        <div style={{ padding: '14px 18px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-surface)', border: '1px solid var(--border-hairline)' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>Total Guides</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 700, marginTop: '2px' }}>{totalGuides} Faculty</div>
        </div>
        <div style={{ padding: '14px 18px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-surface)', border: '1px solid var(--border-hairline)' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>Available Slots</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 700, color: 'var(--accent-cyan)', marginTop: '2px' }}>{availableSlots} Slots</div>
        </div>
        <div style={{ padding: '14px 18px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-surface)', border: '1px solid var(--border-hairline)' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>Assigned Teams</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 700, marginTop: '2px' }}>{assignedTeams} Teams</div>
        </div>
        <div style={{ padding: '14px 18px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-surface)', border: '1px solid var(--accent-amber)' }}>
          <div style={{ fontSize: '11px', color: 'var(--accent-amber)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>Pending Allocations</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 700, color: 'var(--accent-amber)', marginTop: '2px' }}>{pendingAllocations} Teams</div>
        </div>
      </div>

      {/* Guide Workload Table */}
      {list.length === 0 ? (
        <div className="gd-empty-state" style={{ padding: '36px 20px', textAlign: 'center' }}>
          <div className="gd-empty-state__icon" style={{ fontSize: '32px', marginBottom: '8px' }}>👨‍🏫</div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
            No faculty guides registered yet.
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
            Registered faculty members will appear here with their allocation capacity.
          </p>
        </div>
      ) : (
        <div className="cd-table-container">
          <table className="cd-table">
          <thead>
            <tr>
              <th>Guide Name</th>
              <th>Faculty Specialization</th>
              <th>Workload (Teams / Max)</th>
              <th>Available Slots</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {list.map((g, idx) => {
              const availableSlots = g.capacity - g.assignedCount;
              return (
                <tr key={idx}>
                  <td style={{ fontWeight: 600 }}>{g.name}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{g.specialization}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                    {g.assignedCount} / {g.capacity}
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', color: availableSlots > 0 ? 'var(--accent-cyan)' : 'var(--text-muted)' }}>
                    {availableSlots} Slots
                  </td>
                  <td>
                    <span className={`sd-urgency-pill ${g.status === 'Full' ? 'sd-urgency-pill--approaching' : 'sd-doc-status-pill--approved'}`}>
                      {g.status}
                    </span>
                  </td>
                  <td>
                    <button
                      className="gd-btn gd-btn-outline"
                      style={{ padding: '4px 10px', fontSize: '12px' }}
                      onClick={() => onReviewAllocation(g)}
                    >
                      <PiNotePencil /> Review Allocation
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      )}
    </div>
  );
}
