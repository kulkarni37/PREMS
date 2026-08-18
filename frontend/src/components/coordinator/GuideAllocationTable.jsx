import { motion } from 'framer-motion';
import { PiChalkboardTeacher, PiCheckCircle, PiHourglass, PiNotePencil } from 'react-icons/pi';

export default function GuideAllocationTable({ guides, onReviewAllocation }) {
  const DEFAULT_GUIDES = [
    { name: 'Dr. Faculty A', specialization: 'Artificial Intelligence & Machine Learning', assignedCount: 4, capacity: 6, status: 'Available' },
    { name: 'Dr. Faculty B', specialization: 'Web Development & Cloud Computing', assignedCount: 6, capacity: 6, status: 'Full' },
    { name: 'Dr. Faculty C', specialization: 'Cyber Security & Blockchain', assignedCount: 3, capacity: 5, status: 'Available' },
    { name: 'Dr. Faculty D', specialization: 'IoT & Embedded Systems', assignedCount: 5, capacity: 5, status: 'Full' },
    { name: 'Dr. Faculty E', specialization: 'Data Science & Big Data', assignedCount: 2, capacity: 6, status: 'Available' },
  ];

  const list = guides && guides.length > 0 ? guides : DEFAULT_GUIDES;

  return (
    <div className="cd-card" id="guides">
      <div className="cd-card__head">
        <h2 className="cd-card__title">
          <PiChalkboardTeacher className="cd-card__title-icon" /> Faculty Guide Workload &amp; Allocation
        </h2>
        <span className="sd-welcome-card__status-pill">
          4 Teams Pending System Allocation
        </span>
      </div>

      {/* Allocation Summary Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '20px' }}>
        <div style={{ padding: '14px 18px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-surface)', border: '1px solid var(--border-hairline)' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>Total Guides</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 700, marginTop: '2px' }}>18 Faculty</div>
        </div>
        <div style={{ padding: '14px 18px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-surface)', border: '1px solid var(--border-hairline)' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>Available Slots</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 700, color: 'var(--accent-cyan)', marginTop: '2px' }}>16 Slots</div>
        </div>
        <div style={{ padding: '14px 18px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-surface)', border: '1px solid var(--border-hairline)' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>Assigned Teams</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 700, marginTop: '2px' }}>44 Teams</div>
        </div>
        <div style={{ padding: '14px 18px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-surface)', border: '1px solid var(--accent-amber)' }}>
          <div style={{ fontSize: '11px', color: 'var(--accent-amber)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>Pending Allocations</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 700, color: 'var(--accent-amber)', marginTop: '2px' }}>4 Teams</div>
        </div>
      </div>

      {/* Guide Workload Table */}
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
    </div>
  );
}
