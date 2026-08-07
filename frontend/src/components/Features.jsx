import { motion } from 'framer-motion';
import {
  PiUsersThree,
  PiCompass,
  PiGraph,
  PiFolders,
  PiUploadSimple,
  PiClipboardText,
  PiChartBar,
  PiBellRinging,
  PiTrendUp,
  PiChartPieSlice,
  PiShieldCheck,
  PiFingerprintSimple,
} from 'react-icons/pi';
import '../styles/features.css';

const FEATURES = [
  { icon: <PiUsersThree />, title: 'Team Registration', desc: 'Students form teams and register for a project in a guided, validated flow.' },
  { icon: <PiCompass />, title: 'Automatic Guide Allocation', desc: 'Teams are matched to available guides by domain and workload.' },
  { icon: <PiGraph />, title: 'Domain Management', desc: 'Coordinators define and manage the domains open for each academic year.' },
  { icon: <PiFolders />, title: 'Project Repository', desc: 'A searchable archive of past and current projects across every batch.' },
  { icon: <PiUploadSimple />, title: 'Document Upload', desc: 'Reports, synopses, and reviews are submitted and versioned in one place.' },
  { icon: <PiClipboardText />, title: 'Faculty Evaluation', desc: 'Guides and panels score reviews against a consistent rubric.' },
  { icon: <PiChartBar />, title: 'Marks Management', desc: 'Review-wise and final marks are compiled and reconciled automatically.' },
  { icon: <PiBellRinging />, title: 'Notifications', desc: 'Deadlines, approvals, and review schedules reach the right people on time.' },
  { icon: <PiTrendUp />, title: 'Progress Tracking', desc: 'Every team\u2019s stage in the lifecycle is visible at a glance.' },
  { icon: <PiChartPieSlice />, title: 'Analytics Dashboard', desc: 'Coordinators and admins see trends across domains, guides, and batches.' },
  { icon: <PiShieldCheck />, title: 'Role Based Access', desc: 'Students, guides, coordinators, and admins each see only what they need.' },
  { icon: <PiFingerprintSimple />, title: 'Secure Authentication', desc: 'Institution-grade sign-in keeps every record accountable.' },
];

const cardVariants = {
  hidden: { opacity: 0, y: 22 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay: (i % 4) * 0.08, ease: [0.16, 1, 0.3, 1] },
  }),
};

export default function Features() {
  return (
    <section id="features" className="features section-pad">
      <div className="container">
        <div className="section-head-row">
          <div>
            <span className="eyebrow">Features</span>
            <h2 className="section-heading">Everything a project cycle needs, built in</h2>
          </div>
          <p className="section-sub">
            Twelve modules cover the full path from a registered team to a
            finalised mark sheet.
          </p>
        </div>

        <div className="features__grid">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              className="feature-card card"
              custom={i}
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-60px' }}
            >
              <span className="feature-card__icon">{f.icon}</span>
              <h3 className="feature-card__title">{f.title}</h3>
              <p className="feature-card__desc">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
