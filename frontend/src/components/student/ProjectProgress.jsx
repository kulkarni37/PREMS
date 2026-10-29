import { motion } from 'framer-motion';
import { PiCheckBold } from 'react-icons/pi';

export default function ProjectProgress({ currentStageIndex = 0 }) {
  const STAGES = [
    { id: 1, label: 'Team Registration' },
    { id: 2, label: 'Domain Selection' },
    { id: 3, label: 'Guide Allocation' },
    { id: 4, label: 'Phase 1 - Review 1' },
    { id: 5, label: 'Phase 1 - Review 2' },
    { id: 6, label: 'Phase 2 - Review 1' },
    { id: 7, label: 'Phase 2 - Review 2' },
    { id: 8, label: 'Completed' },
  ];

  const totalStages = STAGES.length;
  const progressPercent = Math.min(
    100,
    Math.max(0, (currentStageIndex / (totalStages - 1)) * 100)
  );

  return (
    <div className="sd-card" id="progress">
      <div className="sd-card__head">
        <h2 className="sd-card__title">
          <span className="sd-card__title-icon">⚡</span> Project Workflow Lifecycle
        </h2>
        <span className="sd-welcome-card__status-pill">
          Stage {currentStageIndex + 1} of {totalStages}: {STAGES[currentStageIndex]?.label || 'Active Stage'}
        </span>
      </div>

      <div className="sd-progress-tracker">
        {/* Background connector line */}
        <div className="sd-progress-line-bg">
          <motion.div
            className="sd-progress-line-fill"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>

        {STAGES.map((stage, idx) => {
          let statusClass = 'sd-progress-stage--upcoming';
          let statusText = 'Upcoming';
          let nodeContent = idx + 1;

          if (idx < currentStageIndex) {
            statusClass = 'sd-progress-stage--completed';
            statusText = 'Completed';
            nodeContent = <PiCheckBold />;
          } else if (idx === currentStageIndex) {
            statusClass = 'sd-progress-stage--current';
            statusText = 'Active';
            nodeContent = idx + 1;
          }

          return (
            <div key={stage.id} className={`sd-progress-stage ${statusClass}`}>
              <div className="sd-progress-node">{nodeContent}</div>
              <span className="sd-progress-label">{stage.label}</span>
              <span className="sd-progress-status-badge">{statusText}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
