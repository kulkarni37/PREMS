import { useState } from 'react';
import { motion } from 'framer-motion';
import { PiCalendarBlank, PiPlusBold, PiClock, PiUsersThree, PiEyeBold, PiPencilSimple } from 'react-icons/pi';

export default function ReviewScheduleCard({ reviews, onScheduleReview }) {
  const DEFAULT_SCHEDULES = [
    {
      id: 'sch1',
      stage: 'Review 1 Evaluation',
      date: '20 Sept 2026',
      time: '10:00 AM',
      teamsCount: 12,
      panel: 'Panel A (Dr. Faculty A, Dr. Faculty B)',
      status: 'Scheduled'
    },
    {
      id: 'sch2',
      stage: 'Review 1 Evaluation',
      date: '22 Sept 2026',
      time: '02:00 PM',
      teamsCount: 10,
      panel: 'Panel B (Dr. Faculty C, Dr. Faculty D)',
      status: 'Scheduled'
    },
    {
      id: 'sch3',
      stage: 'Review 2 Mid-Term Defense',
      date: '15 Oct 2026',
      time: '09:30 AM',
      teamsCount: 15,
      panel: 'Panel C (Dr. Faculty E, Prof. Coordinator)',
      status: 'Upcoming'
    }
  ];

  const list = reviews && reviews.length > 0 ? reviews : DEFAULT_SCHEDULES;

  return (
    <div className="cd-card" id="schedule">
      <div className="cd-card__head">
        <h2 className="cd-card__title">
          <PiCalendarBlank className="cd-card__title-icon" /> Department Review Schedule
        </h2>
        <button
          className="gd-btn gd-btn-primary"
          style={{ padding: '6px 14px', fontSize: '12.5px' }}
          onClick={onScheduleReview}
        >
          <PiPlusBold /> Schedule New Review Stage
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {list.map((sch) => (
          <div key={sch.id} className="gd-doc-row">
            <div>
              <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text-primary)' }}>
                {sch.stage} — <span style={{ color: 'var(--accent-cyan)' }}>{sch.panel}</span>
              </div>
              <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span><PiCalendarBlank style={{ display: 'inline', marginRight: 4 }} /> {sch.date}</span>
                <span><PiClock style={{ display: 'inline', marginRight: 4 }} /> {sch.time}</span>
                <span><PiUsersThree style={{ display: 'inline', marginRight: 4 }} /> {sch.teamsCount} Teams Assigned</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span className="sd-status-badge sd-status-badge--reviewed">
                {sch.status}
              </span>
              <button
                className="gd-btn gd-btn-outline"
                style={{ padding: '5px 10px', fontSize: '12px' }}
                onClick={() => alert(`Editing schedule for ${sch.stage}`)}
              >
                <PiPencilSimple /> Edit
              </button>
              <button
                className="gd-btn gd-btn-outline"
                style={{ padding: '5px 10px', fontSize: '12px' }}
                onClick={() => alert(`Viewing details for ${sch.panel}`)}
              >
                <PiEyeBold /> Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
