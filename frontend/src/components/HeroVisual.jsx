import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PiGraduationCap,
  PiChalkboardTeacher,
  PiClipboardText,
  PiGearSix,
  PiChartBar,
  PiUsersThree,
  PiFolder,
} from 'react-icons/pi';
import '../styles/heroVisual.css';

const NAV_ITEMS = [
  { icon: <PiGraduationCap />, label: 'Student' },
  { icon: <PiChalkboardTeacher />, label: 'Guide' },
  { icon: <PiClipboardText />, label: 'Coordinator' },
  { icon: <PiGearSix />, label: 'Admin' },
];

const VIEWS = [
  {
    role: 'Student',
    stats: [
      { label: 'Active Project', value: '1' },
      { label: 'Reviews Done', value: '2/4' },
      { label: 'Overall Score', value: '87%' },
    ],
    bars: [38, 62, 50, 74, 44, 66],
    ring: 72,
    rows: [
      ['Review 2', 'Submitted', 'Guide'],
      ['Synopsis', 'Approved', 'Coordinator'],
      ['Review 3', 'Pending', 'You'],
    ],
  },
  {
    role: 'Guide',
    stats: [
      { label: 'Teams Assigned', value: '6' },
      { label: 'Pending Reviews', value: '3' },
      { label: 'Avg. Score', value: '8.4' },
    ],
    bars: [55, 40, 68, 58, 80, 46],
    ring: 58,
    rows: [
      ['Team Aegis', 'Review 2', 'Due Fri'],
      ['Team Nova', 'Review 1', 'Scored'],
      ['Team Vertex', 'Synopsis', 'Pending'],
    ],
  },
  {
    role: 'Coordinator',
    stats: [
      { label: 'Domains Open', value: '13' },
      { label: 'Teams Registered', value: '214' },
      { label: 'Guides Active', value: '80' },
    ],
    bars: [70, 55, 62, 48, 76, 60],
    ring: 84,
    rows: [
      ['AI / ML', '38 Teams', 'On Track'],
      ['IoT', '24 Teams', 'On Track'],
      ['Cyber Security', '19 Teams', 'Review Due'],
    ],
  },
  {
    role: 'Admin',
    stats: [
      { label: 'Total Users', value: '1360' },
      { label: 'System Uptime', value: '99.9%' },
      { label: 'Storage Used', value: '62%' },
    ],
    bars: [48, 66, 58, 70, 40, 54],
    ring: 62,
    rows: [
      ['New Batch Added', '2026 Cohort', 'Today'],
      ['Backup Completed', 'System', '2h ago'],
      ['Role Updated', 'Coordinator', 'Yesterday'],
    ],
  },
];

const ORBIT_CARDS = [
  { emoji: '🎓', label: 'Student', duration: 22, radius: 168, reverse: false },
  { emoji: '👨\u200d🏫', label: 'Guide', duration: 27, radius: 190, reverse: true },
  { emoji: '📋', label: 'Coordinator', duration: 25, radius: 172, reverse: false },
  { emoji: '⚙️', label: 'Admin', duration: 30, radius: 196, reverse: true },
];

export default function HeroVisual() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setActiveIndex((i) => (i + 1) % VIEWS.length);
    }, 3800);
    return () => clearInterval(id);
  }, []);

  const view = VIEWS[activeIndex];

  return (
    <div className="hero-visual">
      <div className="hero-visual__glow" />

      {ORBIT_CARDS.map((c, i) => {
        const delay = -((c.duration * i) / ORBIT_CARDS.length);
        return (
          <div
            key={c.label}
            className={`orbit-ring ${c.reverse ? 'orbit-ring--rev' : ''}`}
            style={{ '--dur': `${c.duration}s`, '--delay': `${delay}s` }}
          >
            <div className="orbit-arm" style={{ '--radius': `${c.radius}px` }}>
              <div className={`orbit-counter ${c.reverse ? 'orbit-counter--rev' : ''}`}>
                <div className="orbit-float">
                  <div className="orbit-card">
                    <span className="orbit-card__emoji">{c.emoji}</span>
                    <span className="orbit-card__label">{c.label}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      <div className="dash-window">
        <div className="dash-window__bar">
          <span className="dash-window__dot dash-window__dot--r" />
          <span className="dash-window__dot dash-window__dot--y" />
          <span className="dash-window__dot dash-window__dot--g" />
          <span className="dash-window__url">prmes.gndec.edu.in/dashboard</span>
        </div>

        <div className="dash-window__body">
          <aside className="dash-sidebar">
            {NAV_ITEMS.map((item, i) => (
              <div
                key={item.label}
                className={`dash-sidebar__item ${i === activeIndex ? 'dash-sidebar__item--active' : ''}`}
              >
                <span className="dash-sidebar__icon">{item.icon}</span>
                <span className="dash-sidebar__label">{item.label}</span>
              </div>
            ))}
          </aside>

          <div className="dash-main">
            <AnimatePresence mode="wait">
              <motion.div
                key={view.role}
                className="dash-main__content"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="dash-header">
                  <span className="dash-header__title">{view.role} Overview</span>
                  <span className="dash-header__badge">Live Preview</span>
                </div>

                <div className="dash-stats">
                  {view.stats.map((s) => (
                    <div key={s.label} className="dash-stat">
                      <span className="dash-stat__value">{s.value}</span>
                      <span className="dash-stat__label">{s.label}</span>
                    </div>
                  ))}
                </div>

                <div className="dash-charts">
                  <div className="dash-chart">
                    <span className="dash-panel-label">
                      <PiChartBar /> Activity
                    </span>
                    <div className="dash-bars">
                      {view.bars.map((h, i) => (
                        <span key={i} className="dash-bar" style={{ '--h': `${h}%` }} />
                      ))}
                    </div>
                  </div>

                  <div className="dash-ring-panel">
                    <span className="dash-panel-label">
                      <PiUsersThree /> Progress
                    </span>
                    <div
                      className="dash-ring"
                      style={{ '--val': view.ring }}
                    >
                      <span className="dash-ring__value">{view.ring}%</span>
                    </div>
                  </div>
                </div>

                <div className="dash-table">
                  <div className="dash-panel-label">
                    <PiFolder /> Recent
                  </div>
                  <div className="dash-table__rows">
                    {view.rows.map((row, i) => (
                      <div className="dash-table__row" key={i}>
                        {row.map((cell, j) => (
                          <span key={j} className="dash-table__cell">
                            {cell}
                          </span>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
