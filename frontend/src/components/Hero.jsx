import { useEffect, useRef, useState } from 'react';
import { motion, useInView, animate } from 'framer-motion';
import { HiArrowRight, HiOutlinePlay } from 'react-icons/hi';
import { PiUsersThree, PiChalkboardTeacher, PiPuzzlePiece, PiFolders } from 'react-icons/pi';
import '../styles/hero.css';
import HeroVisual from "./HeroVisual.jsx";

const STATS = [
  { icon: <PiUsersThree />, value: 1200, suffix: '+', label: 'Students' },
  { icon: <PiChalkboardTeacher />, value: 80, suffix: '+', label: 'Faculty' },
  { icon: <PiPuzzlePiece />, value: 13, suffix: '', label: 'Domains' },
  { icon: <PiFolders />, value: 300, suffix: '+', label: 'Projects' },
];

function StatCounter({ value, suffix, label, icon, delay }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, value, {
      duration: 1.4,
      delay,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, value, delay]);

  return (
    <motion.div
      ref={ref}
      className="stat-card"
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      <span className="stat-card__icon">{icon}</span>
      <div className="stat-card__value">
        {display}
        <span className="stat-card__suffix">{suffix}</span>
      </div>
      <div className="stat-card__label">{label}</div>
    </motion.div>
  );
}

export default function Hero() {
  return (
    <section id="home" className="hero section-pad">
      <div className="blueprint-grid hero__grid" />
      <div className="container hero__inner">
        <div className="hero__content">
          <motion.span
            className="eyebrow"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Academic Project Lifecycle Platform
          </motion.span>

          <motion.h1
            className="hero__heading"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            Project Review Management &amp;
            <br />
            Evaluation System
          </motion.h1>

          <motion.p
            className="hero__sub"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            A complete academic project lifecycle management platform that
            simplifies team registration, guide allocation, document
            submission, project evaluation, and academic project tracking.
          </motion.p>

          <motion.div
            className="hero__actions"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            <a href="#features" className="btn btn-primary">
              Get Started <HiArrowRight />
            </a>
            <a href="#about" className="btn btn-outline">
              <HiOutlinePlay /> Learn More
            </a>
          </motion.div>
        </div>

        <motion.div
          className="hero__illustration"
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
        >
         <HeroVisual />
        </motion.div>
      </div>

      <div className="container">
        <div className="stat-grid">
          {STATS.map((s, i) => (
            <StatCounter key={s.label} {...s} delay={0.15 * i} />
          ))}
        </div>
      </div>
    </section>
  );
}
