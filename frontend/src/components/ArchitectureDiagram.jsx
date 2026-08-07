import {
  PiCircuitry,
  PiGraduationCap,
  PiChalkboardTeacher,
  PiClipboardText,
  PiGearSix,
} from 'react-icons/pi';
import '../styles/architecture.css';

const ROLES = [
  {
    key: 'student',
    icon: <PiGraduationCap />,
    emoji: '🎓',
    title: 'Student',
    points: ['Register team & choose domain', 'Submit reviews & documents', 'Track marks & progress'],
  },
  {
    key: 'guide',
    icon: <PiChalkboardTeacher />,
    emoji: '👨\u200d🏫',
    title: 'Guide',
    points: ['Review submitted documents', 'Evaluate & score each stage', 'Mentor assigned teams'],
  },
  {
    key: 'coordinator',
    icon: <PiClipboardText />,
    emoji: '📋',
    title: 'Coordinator',
    points: ['Manage domains & allocation', 'Monitor batch-wide progress', 'Resolve review escalations'],
  },
  {
    key: 'admin',
    icon: <PiGearSix />,
    emoji: '⚙️',
    title: 'Administrator',
    points: ['Manage roles & access', 'Oversee system health', 'Configure academic settings'],
  },
];

const LINE_ENDS = {
  student: { x2: 50, y2: 11 },
  guide: { x2: 89, y2: 50 },
  coordinator: { x2: 50, y2: 89 },
  admin: { x2: 11, y2: 50 },
};

export default function ArchitectureDiagram() {
  return (
    <div className="arch">
      <svg className="arch__lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <filter id="archGlow" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="1.4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {ROLES.map((r, i) => (
          <line
            key={r.key}
            className="arch__line"
            x1="50"
            y1="50"
            x2={LINE_ENDS[r.key].x2}
            y2={LINE_ENDS[r.key].y2}
            style={{ animationDelay: `${i * 0.4}s` }}
          />
        ))}
      </svg>

      <div className="arch__center">
        <span className="arch__center-glow" />
        <div className="arch__center-card">
          <span className="arch__center-icon">
            <PiCircuitry />
          </span>
          <span className="arch__center-title">PRMES Portal</span>
          <span className="arch__center-sub">Central System</span>
        </div>
      </div>

      {ROLES.map((r, i) => (
        <div
          key={r.key}
          className={`arch__role arch__role--${r.key}`}
          style={{ animationDelay: `${i * 0.6}s` }}
        >
          <div className="arch__role-card">
            <div className="arch__role-head">
              <span className="arch__role-icon">{r.icon}</span>
              <span className="arch__role-title">
                <span className="arch__role-emoji">{r.emoji}</span> {r.title}
              </span>
            </div>
            <ul className="arch__role-list">
              {r.points.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </div>
        </div>
      ))}
    </div>
  );
}
