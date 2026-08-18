import { motion } from 'framer-motion';
import { PiChatCircleText, PiPaperPlaneRight, PiEyeBold } from 'react-icons/pi';

export default function FeedbackPanel({ feedbackList, onSelectTeam }) {
  const DEFAULT_FEEDBACK = [
    {
      id: 'f1',
      teamId: 'PRMES-TEAM-2026-014',
      date: 'Yesterday',
      summary: 'Improve the dataset explanation and add comparison with baseline machine learning models in section 3.2.',
      status: 'Feedback Sent'
    },
    {
      id: 'f2',
      teamId: 'PRMES-TEAM-2026-021',
      date: '05 Sept 2026',
      summary: 'Clarify the smart contract gas optimization algorithm and update the security threat matrix.',
      status: 'Feedback Sent'
    },
    {
      id: 'f3',
      teamId: 'PRMES-TEAM-2026-033',
      date: '02 Sept 2026',
      summary: 'Review 1 slides require system deployment diagram update. Resubmit presentation file.',
      status: 'Changes Requested'
    }
  ];

  const list = feedbackList && feedbackList.length > 0 ? feedbackList : DEFAULT_FEEDBACK;

  return (
    <div className="gd-card" id="feedback">
      <div className="gd-card__head">
        <h2 className="gd-card__title">
          <PiChatCircleText className="gd-card__title-icon" /> Recent Feedback &amp; Mentoring
        </h2>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {list.map((item) => (
          <div key={item.id} className="gd-doc-row">
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                <span className="gd-team-card__id">{item.teamId}</span>
                <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>{item.date}</span>
              </div>
              <p style={{ fontSize: '13.5px', color: 'var(--text-primary)', margin: '4px 0 0', lineHeight: 1.5 }}>
                &ldquo;{item.summary}&rdquo;
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span className={`sd-status-badge ${item.status === 'Changes Requested' ? 'sd-status-badge--pending' : 'sd-status-badge--reviewed'}`}>
                {item.status}
              </span>
              <button
                className="gd-btn gd-btn-outline"
                style={{ padding: '6px 12px', fontSize: '12px' }}
                onClick={() => onSelectTeam({ team_id: item.teamId })}
              >
                <PiEyeBold /> View Project
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
