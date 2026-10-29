import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PiCheckCircleFill, PiSpinnerGapBold } from 'react-icons/pi';
import logo from '../assets/logo.png';
import '../styles/startup-screen.css';

const INITIALIZATION_STEPS = [
  { id: 1, label: 'Loading interface' },
  { id: 2, label: 'Initializing modules' },
  { id: 3, label: 'Preparing workspace' },
  { id: 4, label: 'System Ready' }
];

export default function StartupScreen({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    const duration = 2200; // ~2.2s total smooth initialization sequence

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.floor((elapsed / duration) * 100));
      setProgress(pct);

      // 0–25%: Step 0 | 25–50%: Step 1 | 50–75%: Step 2 | 75–100%: Step 3
      if (pct >= 75) {
        setCurrentStepIndex(3);
      } else if (pct >= 50) {
        setCurrentStepIndex(2);
      } else if (pct >= 25) {
        setCurrentStepIndex(1);
      } else {
        setCurrentStepIndex(0);
      }

      if (pct >= 100) {
        clearInterval(interval);
        // Short pause at 100% (✓ SYSTEM READY) before fading out
        setTimeout(() => {
          if (onComplete) onComplete();
        }, 400);
      }
    }, 20);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <motion.div
      className="prmes-startup-screen"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } }}
    >
      {/* Background blueprint grid & ambient cyan glow */}
      <div className="prmes-startup__grid" />
      <div className="prmes-startup__glow" />

      {/* Central Glassmorphism Card */}
      <div className="prmes-startup__container">
        {/* 1. LOGO - Centered, Prominent, Frameless with Glow */}
        <motion.div
          className="prmes-startup__logo-wrapper"
          initial={{ opacity: 0, scale: 0.88, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <img src={logo} alt="PRMES Logo" className="prmes-startup__logo-img" />
        </motion.div>

        {/* 2. INITIALIZING BADGE */}
        <motion.div
          className="prmes-startup__badge-wrap"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.12 }}
        >
          <span className="prmes-startup__badge">
            <span className="prmes-startup__pulse-dot" />
            INITIALIZING PRMES
          </span>
        </motion.div>

        {/* 3. SUBTITLE */}
        <motion.h1
          className="prmes-startup__title"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          Project Review &amp; Management System
        </motion.h1>

        {/* 4. PROGRESS BAR */}
        <div className="prmes-startup__progress-box">
          <div className="prmes-startup__progress-track">
            <div
              className="prmes-startup__progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* 5. CURRENT INITIALIZATION MESSAGE */}
          <div className="prmes-startup__progress-info">
            <span className="prmes-startup__status-text">
              {progress === 100
                ? 'PRMES READY'
                : `${INITIALIZATION_STEPS[currentStepIndex].label}...`}
            </span>
            <span className="prmes-startup__pct">{progress}%</span>
          </div>
        </div>

        {/* 6. INITIALIZATION STATUS CARDS */}
        <div className="prmes-startup__steps">
          {INITIALIZATION_STEPS.map((step, idx) => {
            const isDone = currentStepIndex > idx || progress === 100;
            const isCurrent = currentStepIndex === idx && !isDone;

            return (
              <div
                key={step.id}
                className={`prmes-startup__step ${
                  isDone
                    ? 'prmes-startup__step--done'
                    : isCurrent
                    ? 'prmes-startup__step--active'
                    : 'prmes-startup__step--pending'
                }`}
              >
                <span className="prmes-startup__step-icon">
                  {isDone ? (
                    <PiCheckCircleFill className="prmes-startup__check" />
                  ) : isCurrent ? (
                    <PiSpinnerGapBold className="prmes-startup__spinner" />
                  ) : (
                    <span className="prmes-startup__dot" />
                  )}
                </span>
                <span className="prmes-startup__step-label">{step.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
