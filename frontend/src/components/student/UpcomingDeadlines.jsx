import { PiCalendarBlank, PiClockCountdown, PiCheckCircle } from 'react-icons/pi';

export default function UpcomingDeadlines({ currentStageIndex = 0, team, review1Status }) {
  const getDynamicUpcoming = () => {
    if (!team) {
      return [
        { title: 'Complete Team Registration', subtitle: 'Form a team of exactly 4 members', status: 'Action Required', isUrgent: true },
        { title: 'Select Project Domain', subtitle: 'Choose your technical project domain', status: 'Pending Team', isUrgent: false },
      ];
    }

    if (!team.domain) {
      return [
        { title: 'Select Project Domain', subtitle: 'Team Leader selects project technical domain', status: 'Action Required', isUrgent: true },
        { title: 'Guide Allocation', subtitle: 'System allocates guide based on domain', status: 'Pending Domain', isUrgent: false },
      ];
    }

    if (!team.guide_id) {
      return [
        { title: 'Guide Allocation', subtitle: 'System allocating faculty guide based on specialization', status: 'In Progress', isUrgent: true },
        { title: 'Submit Project Proposal', subtitle: 'Prepare initial project proposal', status: 'Upcoming Stage', isUrgent: false },
      ];
    }

    if (review1Status !== 'COMPLETED') {
      return [
        { title: 'Review 1 Project Report', subtitle: 'Submit Report in PDF/Doc format', status: 'Due Soon', isUrgent: true },
        { title: 'Review 1 Project PPT', subtitle: 'Submit Presentation in PPT/PPTX format', status: 'Due Soon', isUrgent: true },
        { title: 'Review 1 Evaluation', subtitle: 'First project defense with assigned guide', status: 'Scheduled', isUrgent: false },
      ];
    }

    return [
      { title: 'Review 2 Final Project Report', subtitle: 'Submit Final Report (PDF/Doc)', status: 'Review 2 Open', isUrgent: true },
      { title: 'Review 2 Final Project PPT', subtitle: 'Submit Final Presentation (PPT/PPTX)', status: 'Review 2 Open', isUrgent: true },
      { title: 'Final Defense & Viva Voce', subtitle: 'Institutional panel evaluation', status: 'Final Stage', isUrgent: false },
    ];
  };

  const items = getDynamicUpcoming();

  return (
    <div className="sd-card" id="upcoming">
      <div className="sd-card__head">
        <h2 className="sd-card__title">
          <PiCalendarBlank className="sd-card__title-icon" /> Dynamic Upcoming Milestones
        </h2>
        <span className="sd-welcome-card__status-pill">
          {items.length} Active Deadlines
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {items.map((item, idx) => (
          <div key={idx} className="sd-doc-item">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <PiClockCountdown style={{ fontSize: 20, color: item.isUrgent ? 'var(--accent-amber)' : 'var(--accent-cyan)' }} />
              <div>
                <div style={{ fontWeight: 600, fontSize: '13.5px', color: 'var(--text-primary)' }}>
                  {item.title}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {item.subtitle}
                </div>
              </div>
            </div>

            <span className={`sd-urgency-pill ${item.isUrgent ? 'sd-urgency-pill--approaching' : 'sd-doc-status-pill--approved'}`}>
              {item.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
