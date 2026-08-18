import { motion } from 'framer-motion';
import { PiGridFour, PiCheckCircle, PiPlusBold } from 'react-icons/pi';

export default function DomainCard({ selectedDomain, onOpenSelectDomain }) {
  const DOMAIN_DESCRIPTIONS = {
    'Artificial Intelligence & Machine Learning': 'Deep learning, computer vision, NLP, and intelligent predictive algorithms.',
    'Web Development': 'Modern full-stack web applications, microservices, and web security.',
    'Data Science': 'Big data analytics, data visualization, statistical modeling, and mining.',
    'Cyber Security': 'Ethical hacking, network security, cryptography, and vulnerability assessment.',
    'Cloud Computing': 'Distributed systems, serverless architecture, AWS/GCP, and DevOps pipelines.',
    'IoT': 'Embedded systems, smart sensor networks, robotics, and hardware automation.',
    'Mobile Application Development': 'Cross-platform Android & iOS apps with real-time sync.',
    'Software Engineering': 'Enterprise software architecture, design patterns, testing, and agile practices.'
  };

  if (!selectedDomain) {
    return (
      <div className="sd-card" id="domain">
        <div className="sd-card__head">
          <h2 className="sd-card__title">
            <PiGridFour className="sd-card__title-icon" /> Project Domain
          </h2>
        </div>

        <div className="sd-empty-state">
          <div className="sd-empty-state__icon">
            <PiGridFour />
          </div>
          <h3 className="sd-empty-state__title">Choose your project domain</h3>
          <p className="sd-empty-state__sub">
            Selecting a domain helps the department system assign an expert faculty guide tailored to your project topic.
          </p>
          <motion.button
            className="sd-btn sd-btn-primary"
            onClick={onOpenSelectDomain}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <PiPlusBold /> Select Domain
          </motion.button>
        </div>
      </div>
    );
  }

  const desc = DOMAIN_DESCRIPTIONS[selectedDomain] || 'Specialized project domain for final year evaluation.';

  return (
    <div className="sd-card" id="domain">
      <div className="sd-card__head">
        <h2 className="sd-card__title">
          <PiGridFour className="sd-card__title-icon" /> Project Domain
        </h2>
        <span className="sd-doc-status-pill sd-doc-status-pill--submitted">
          Domain Selected ✓
        </span>
      </div>

      <div style={{ padding: '20px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-surface)', border: '1px solid var(--accent-cyan)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <PiCheckCircle style={{ color: 'var(--accent-cyan)', fontSize: '22px' }} />
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
            {selectedDomain}
          </h3>
        </div>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          {desc}
        </p>
        <div style={{ marginTop: '14px', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            className="sd-btn sd-btn-outline"
            style={{ padding: '6px 14px', fontSize: '12.5px' }}
            onClick={onOpenSelectDomain}
          >
            Change Domain
          </button>
        </div>
      </div>
    </div>
  );
}
