import { motion } from 'framer-motion';
import { PiBookBookmark, PiCheckCircle, PiPlusBold } from 'react-icons/pi';

export default function TodayProgressCard({ todayDiary, onOpenDiary }) {
  if (todayDiary) {
    return (
      <div className="sd-card">
        <div className="sd-card__head">
          <h2 className="sd-card__title">
            <PiCheckCircle className="sd-card__title-icon" style={{ color: 'var(--accent-cyan)' }} /> TODAY&apos;S DIARY PROGRESS
          </h2>
          <span className="sd-doc-status-pill sd-doc-status-pill--approved">
            ✓ Entry Recorded Today
          </span>
        </div>

        <div style={{ padding: '14px 16px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-surface)', border: '1px solid var(--border-hairline)', marginBottom: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)', fontWeight: 700 }}>
              {todayDiary.work_category}
            </span>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              ⏱️ {todayDiary.hours_worked} {todayDiary.hours_worked === 1 ? 'hour' : 'hours'} • {todayDiary.status}
            </span>
          </div>

          <p style={{ fontSize: '13.5px', color: 'var(--text-primary)', lineHeight: 1.5, margin: 0 }}>
            {todayDiary.work_description}
          </p>
        </div>

        <motion.button
          className="sd-btn sd-btn-outline"
          style={{ width: '100%' }}
          onClick={onOpenDiary}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.98 }}
        >
          <PiBookBookmark /> View Complete Daily Diary
        </motion.button>
      </div>
    );
  }

  return (
    <div className="sd-card">
      <div className="sd-card__head">
        <h2 className="sd-card__title">
          <PiBookBookmark className="sd-card__title-icon" /> TODAY&apos;S DIARY PROGRESS
        </h2>
        <span className="sd-urgency-pill sd-urgency-pill--approaching">
          Pending Today
        </span>
      </div>

      <div style={{ padding: '14px 16px', borderRadius: 'var(--radius-sm)', background: 'var(--accent-amber-soft)', border: '1px solid var(--accent-amber)', color: 'var(--accent-amber)', fontSize: '13px', marginBottom: '14px' }}>
        ⚠️ No diary entry recorded for today ({new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}).
      </div>

      <motion.button
        className="sd-btn sd-btn-primary"
        style={{ width: '100%' }}
        onClick={onOpenDiary}
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.98 }}
      >
        <PiPlusBold /> + Add Today&apos;s Entry
      </motion.button>
    </div>
  );
}
