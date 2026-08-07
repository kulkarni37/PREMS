import { useRef } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import '../styles/workflow.css';

const STEPS = [
  { n: '01', title: 'Register Team', desc: 'Students form a team and submit their registration.' },
  { n: '02', title: 'Choose Domain', desc: 'The team selects a domain from the ones open this year.' },
  { n: '03', title: 'Guide Allocation', desc: 'A guide is assigned based on domain and availability.' },
  { n: '04', title: 'Project Approval', desc: 'The proposed project is reviewed and approved by the guide.' },
  { n: '05', title: 'Upload Documents', desc: 'Reports and review material are submitted through each phase.' },
  { n: '06', title: 'Evaluation', desc: 'Guides and panels assess each review against the rubric.' },
  { n: '07', title: 'Final Marks', desc: 'Consolidated marks are published to the team and coordinator.' },
];

export default function Workflow() {
  const trackRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ['start 0.75', 'end 0.35'],
  });
  const progress = useSpring(scrollYProgress, { stiffness: 90, damping: 24, mass: 0.4 });

  return (
    <section id="workflow" className="workflow section-pad">
      <div className="container">
        <div className="section-head-row">
          <div>
            <span className="eyebrow">How It Works</span>
            <h2 className="section-heading">Seven stages, one continuous signal</h2>
          </div>
          <p className="section-sub">
            Every team follows the same traceable path from registration to
            final marks &mdash; nothing moves to the next stage until the one
            before it is signed off.
          </p>
        </div>

        <div className="workflow__track" ref={trackRef}>
          <div className="workflow__rail">
            <div className="workflow__rail-base" />
            <motion.div className="workflow__rail-signal" style={{ scaleY: progress }} />
          </div>

          <div className="workflow__steps">
            {STEPS.map((s, i) => (
              <motion.div
                key={s.n}
                className="workflow__step"
                initial={{ opacity: 0, x: -18 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.55, delay: (i % 4) * 0.05, ease: [0.16, 1, 0.3, 1] }}
              >
                <span className="workflow__node">{s.n}</span>
                <div className="workflow__step-body">
                  <h3 className="workflow__step-title">{s.title}</h3>
                  <p className="workflow__step-desc">{s.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
