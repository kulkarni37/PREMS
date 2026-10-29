import { PiChalkboardTeacher, PiInfo, PiEnvelopeSimple, PiBriefcase, PiBuildings, PiCheckCircle } from 'react-icons/pi';

export default function GuideCard({ guide, allocation, domain, isLeader = true }) {
  const isPending = !guide && (domain || (allocation && allocation.status === 'PENDING'));

  const getMatchedPrefText = (pref) => {
    if (pref === 1) return 'Matched via 1st Preference';
    if (pref === 2) return 'Matched via 2nd Preference';
    if (pref === 3) return 'Matched via 3rd Preference';
    return 'Automatically Matched';
  };

  if (!guide) {
    return (
      <div className="sd-card" id="guide">
        <div className="sd-card__head">
          <h2 className="sd-card__title">
            <PiChalkboardTeacher className="sd-card__title-icon" /> Your Project Guide
          </h2>
          <span className={`sd-urgency-pill ${isPending ? 'sd-urgency-pill--approaching' : 'sd-urgency-pill--normal'}`}>
            {isPending ? 'Pending Allocation' : 'Not Assigned Yet'}
          </span>
        </div>

        <div className="sd-empty-state">
          <div className="sd-empty-state__icon">
            <PiChalkboardTeacher />
          </div>
          <h3 className="sd-empty-state__title">
            {isPending ? 'Guide Allocation Pending' : 'Guide Not Assigned Yet'}
          </h3>
          <p className="sd-empty-state__sub">
            {isPending
              ? 'Guide allocation is pending because all eligible guides have reached their maximum capacity of 3 teams.'
              : (isLeader
                ? 'Select a project domain to initiate automatic guide allocation based on faculty preferences and workload capacity.'
                : 'Your project guide will be automatically allocated once your Team Leader submits the project domain.')}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', background: 'var(--accent-cyan-soft)', border: '1px solid var(--border-hairline-strong)', borderRadius: 'var(--radius-sm)', color: 'var(--accent-cyan)', fontSize: '12.5px', marginTop: '6px' }}>
            <PiInfo style={{ fontSize: 18, flexShrink: 0 }} />
            <span>Automatic system allocation: Guides are matched by domain preferences and workload balancing. Manual selection is disabled.</span>
          </div>
        </div>
      </div>
    );
  }

  const guideName = guide.full_name || guide.name || 'Faculty Guide';
  const matchedPref = guide.matched_preference || allocation?.matched_preference;

  return (
    <div className="sd-card" id="guide">
      <div className="sd-card__head">
        <h2 className="sd-card__title">
          <PiChalkboardTeacher className="sd-card__title-icon" /> Your Project Guide
        </h2>
        <span className="sd-doc-status-pill sd-doc-status-pill--approved">
          ✓ {matchedPref ? getMatchedPrefText(matchedPref) : 'Guide Assigned'}
        </span>
      </div>

      <div className="sd-guide-profile">
        <div className="sd-guide-avatar">
          {guideName ? guideName.charAt(0) : 'G'}
        </div>
        <div className="sd-guide-details">
          <div className="sd-guide-name">{guideName}</div>
          <div className="sd-guide-desig">
            <PiBriefcase style={{ display: 'inline', marginRight: 4 }} />
            {guide.designation || 'Assistant Professor'}
          </div>
          <div className="sd-guide-spec">
            Specialization: <strong>{guide.specialization || guide.preference_1 || 'Computer Science & Engineering'}</strong>
          </div>
          {matchedPref && (
            <div style={{ fontSize: '12px', color: 'var(--accent-cyan)', marginTop: '3px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <PiCheckCircle style={{ fontSize: 14 }} /> {getMatchedPrefText(matchedPref)}
            </div>
          )}
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
