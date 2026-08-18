import { useState } from 'react';
import { motion } from 'framer-motion';
import { PiX, PiGridFour, PiCheckCircle } from 'react-icons/pi';
import { selectStudentDomain } from '../../services/api';

export default function SelectDomainModal({ isOpen, onClose, currentDomain, onDomainSelected }) {
  const [selected, setSelected] = useState(currentDomain || 'Artificial Intelligence & Machine Learning');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const DOMAINS = [
    { title: 'Artificial Intelligence & Machine Learning', desc: 'Deep learning, computer vision, NLP, and predictive intelligent models.' },
    { title: 'Web Development', desc: 'Modern full-stack web applications, microservices, and web performance.' },
    { title: 'Data Science', desc: 'Big data processing, analytics, data visualization, and statistical learning.' },
    { title: 'Cyber Security', desc: 'Network security, cryptography, vulnerability testing, and secure protocols.' },
    { title: 'Cloud Computing', desc: 'Distributed systems, serverless architectures, AWS/Azure, and DevOps.' },
    { title: 'IoT', desc: 'Smart embedded systems, sensors, robotics, and hardware automation.' },
    { title: 'Mobile Application Development', desc: 'Native & cross-platform mobile apps for Android & iOS.' },
    { title: 'Software Engineering', desc: 'Enterprise architecture, design patterns, testing frameworks, and agile.' }
  ];

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      await selectStudentDomain({ domain: selected });
    } catch (err) {
      // Backend placeholder notice - proceed with local state update
    } finally {
      setSubmitting(false);
      onDomainSelected(selected);
      onClose();
    }
  };

  return (
    <div className="sd-modal-backdrop" onClick={onClose}>
      <motion.div
        className="sd-modal"
        style={{ maxWidth: 640 }}
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 20 }}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="sd-modal__close" onClick={onClose}>
          <PiX />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <PiGridFour style={{ color: 'var(--accent-cyan)', fontSize: '26px' }} />
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 700, margin: 0 }}>
            Select Project Domain
          </h3>
        </div>
        <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
          Select the domain that best describes your project. The system will match your project with a specialized faculty guide.
        </p>

        <div className="sd-domain-grid" style={{ gridTemplateColumns: '1fr 1fr', marginBottom: '24px' }}>
          {DOMAINS.map((d) => {
            const isSelected = selected === d.title;
            return (
              <div
                key={d.title}
                className={`sd-domain-card-option ${isSelected ? 'sd-domain-card-option--selected' : ''}`}
                onClick={() => setSelected(d.title)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <span className="sd-domain-title">{d.title}</span>
                  {isSelected && <PiCheckCircle style={{ color: 'var(--accent-cyan)', fontSize: '18px' }} />}
                </div>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
                  {d.desc}
                </p>
              </div>
            );
          })}
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="sd-btn sd-btn-outline" style={{ flex: 1 }} onClick={onClose}>
            Cancel
          </button>
          <button className="sd-btn sd-btn-primary" style={{ flex: 1 }} onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Saving...' : 'Confirm Domain Selection'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
