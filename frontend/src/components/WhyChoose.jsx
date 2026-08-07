import { motion } from 'framer-motion';
import {
  PiLockKey,
  PiLightning,
  PiEye,
  PiLeaf,
  PiRobot,
  PiChartLineUp,
  PiBuildings,
  PiSparkle,
} from 'react-icons/pi';
import '../styles/whychoose.css';

const TRAITS = [
  { icon: <PiLockKey />, title: 'Secure', desc: 'Role-based access keeps every record visible only to the right people.' },
  { icon: <PiLightning />, title: 'Fast', desc: 'Built for quick reviews, not slow paperwork trails.' },
  { icon: <PiEye />, title: 'Transparent', desc: 'Students and faculty see the same status at the same time.' },
  { icon: <PiLeaf />, title: 'Paperless', desc: 'Documents, marks, and approvals all live digitally.' },
  { icon: <PiRobot />, title: 'Automated', desc: 'Guide allocation and marks compilation run without manual chasing.' },
  { icon: <PiChartLineUp />, title: 'Scalable', desc: 'Handles one batch or every batch the department has ever run.' },
  { icon: <PiBuildings />, title: 'Institution Ready', desc: 'Structured for departments, coordinators, and multi-year records.' },
  { icon: <PiSparkle />, title: 'Professional UI', desc: 'An interface built to be used daily, not just demoed once.' },
];

export default function WhyChoose() {
  return (
    <section id="why" className="why section-pad">
      <div className="container">
        <div className="section-head-row">
          <div>
            <span className="eyebrow">Why Choose PRMES</span>
            <h2 className="section-heading">Built for daily use, not a one-time demo</h2>
          </div>
        </div>

        <div className="why__grid">
          {TRAITS.map((t, i) => (
            <motion.div
              key={t.title}
              className="why-card"
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: (i % 4) * 0.06, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className="why-card__icon">{t.icon}</span>
              <h3 className="why-card__title">{t.title}</h3>
              <p className="why-card__desc">{t.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
