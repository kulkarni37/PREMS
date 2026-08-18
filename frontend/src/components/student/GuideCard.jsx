import { PiChalkboardTeacher, PiInfo, PiEnvelopeSimple, PiBriefcase, PiBuildings } from 'react-icons/pi';

export default function GuideCard({ guide }) {
  if (!guide) {
    return (
      <div className="sd-card" id="guide">
        <div className="sd-card__head">
          <h2 className="sd-card__title">
            <PiChalkboardTeacher className="sd-card__title-icon" /> Your Project Guide
          </h2>
          <span className="sd-urgency-pill sd-urgency-pill--approaching">
            Pending Allocation
          </span>
        </div>

        <div className="sd-empty-state">
          <div className="sd-empty-state__icon">
            <PiChalkboardTeacher />
          </div>
          <h3 className="sd-empty-state__title">Guide allocation is pending.</h3>
          <p className="sd-empty-state__sub">
            Waiting for coordinator/admin allocation. The system will automatically allocate your project guide based on your selected project domain and faculty specialization.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', background: 'var(--accent-cyan-soft)', border: '1px solid var(--border-hairline-strong)', borderRadius: 'var(--radius-sm)', color: 'var(--accent-cyan)', fontSize: '12.5px', marginTop: '6px' }}>
            <PiInfo style={{ fontSize: 18, flexShrink: 0 }} />
            <span>Students cannot manually request guides. Allocation is handled by department coordinators.</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="sd-card" id="guide">
      <div className="sd-card__head">
        <h2 className="sd-card__title">
          <PiChalkboardTeacher className="sd-card__title-icon" /> Your Project Guide
        </h2>
        <span className="sd-doc-status-pill sd-doc-status-pill--approved">
          ✓ Guide Assigned
        </span>
      </div>

      <div className="sd-guide-profile">
        <div className="sd-guide-avatar">
          {guide.name ? guide.name.charAt(0) : 'G'}
        </div>
        <div className="sd-guide-details">
          <div className="sd-guide-name">{guide.name || 'Dr. Faculty Name'}</div>
          <div className="sd-guide-desig">
            <PiBriefcase style={{ display: 'inline', marginRight: 4 }} />
            {guide.designation || 'Assistant Professor'}
          </div>
          <div className="sd-guide-spec">
            Specialization: <strong>{guide.specialization || 'Artificial Intelligence & Machine Learning'}</strong>
          </div>
          <div className="sd-guide-email">
            <PiEnvelopeSimple style={{ display: 'inline', marginRight: 4 }} />
            {guide.email || 'faculty@gndec.edu.in'}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
            <PiBuildings style={{ display: 'inline', marginRight: 4 }} />
            {guide.department || 'Department of Computer Science & Engineering'}
          </div>
        </div>
      </div>
    </div>
  );
}
