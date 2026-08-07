import { motion } from 'framer-motion';
import ArchitectureDiagram from './ArchitectureDiagram.jsx';
import '../styles/about.css';

const POINTS = [
  'One record for every project, from team formation to final marks',
  'Guides and coordinators see status the moment it changes',
  'Every submission and evaluation is logged and auditable',
];

export default function About() {
  return (
    <section id="about" className="about section-pad">
      <div className="container about__inner">
        <motion.div
          className="about__illustration"
          initial={{ opacity: 0, x: -24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <ArchitectureDiagram />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="eyebrow">About PRMES</span>
          <h2 className="section-heading">A single system of record for the whole project lifecycle</h2>
          <p className="section-sub">
            PRMES is an integrated web portal designed to manage the complete
            academic project lifecycle, from team registration to final
            evaluation, while providing transparency and efficiency for
            students, faculty, coordinators, and administrators.
          </p>

          <ul className="about__points">
            {POINTS.map((p) => (
              <li key={p} className="about__point">
                <span className="about__point-dot" />
                {p}
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </section>
  );
}
