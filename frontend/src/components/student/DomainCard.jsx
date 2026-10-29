import { motion } from 'framer-motion';
import { PiGridFour, PiCheckCircle, PiPlusBold, PiMagnifyingGlass } from 'react-icons/pi';

export default function DomainCard({ selectedDomain, onOpenSelectDomain, onOpenSimilarityModal, isLeader = true }) {
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
            <PiGridFour className="sd-card__title-icon" /> Project Domain &amp; Similarity Check
          </h2>
          {!isLeader && (
            <span className="sd-urgency-pill sd-urgency-pill--approaching">
              Pending Selection
            </span>
          )}
        </div>

        <div className="sd-empty-state">
          <div className="sd-empty-state__icon">
            <PiGridFour />
          </div>
          <h3 className="sd-empty-state__title">
            {isLeader ? 'Propose Project & Choose Domain' : 'Project Domain Pending Selection'}
          </h3>
          <p className="sd-empty-state__sub">
            {isLeader
              ? 'Check your project title against the 5-Year Past Project Repository, then select your domain to trigger automatic guide allocation.'
              : 'Your Team Leader has not selected a project domain yet. The selected domain will appear here once submitted by your Team Leader.'}
          </p>
          {isLeader && (
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
              {onOpenSimilarityModal && (
                <motion.button
                  className="sd-btn sd-btn-outline"
                  onClick={onOpenSimilarityModal}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  style={{ border: '1px solid var(--accent-cyan)', color: 'var(--accent-cyan)' }}
                >
                  <PiMagnifyingGlass style={{ fontSize: 18 }} /> CHECK PROJECT IDEA
                </motion.button>
              )}
              <motion.button
                className="sd-btn sd-btn-primary"
                onClick={onOpenSelectDomain}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <PiPlusBold /> Select Domain
              </motion.button>
            </div>
          )}
        </div>
      </div>
    );
  }

  const desc = DOMAIN_DESCRIPTIONS[selectedDomain] || 'Specialized project domain for final year evaluation.';

  return (
    <div className="sd-card" id="domain">
      <div className="sd-card__head">
        <h2 className="sd-card__title">
          <PiGridFour className="sd-card__title-icon" /> Project Domain &amp; Similarity Check
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
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
          {desc}
        </p>
        {isLeader && (
          <div style={{ marginTop: '14px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            {onOpenSimilarityModal && (
              <button
                className="sd-btn sd-btn-outline"
                style={{ padding: '6px 14px', fontSize: '12.5px', border: '1px solid var(--accent-cyan)', color: 'var(--accent-cyan)' }}
                onClick={onOpenSimilarityModal}
              >
                <PiMagnifyingGlass /> Check Similarity
              </button>
            )}
            <button
              className="sd-btn sd-btn-outline"
              style={{ padding: '6px 14px', fontSize: '12.5px' }}
              onClick={onOpenSelectDomain}
            >
              Change Domain
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
