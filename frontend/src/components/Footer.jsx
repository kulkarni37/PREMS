import { FaGithub, FaLinkedin } from 'react-icons/fa6';
import { HiArrowRight, HiArrowUp } from 'react-icons/hi';
import logo from "../assets/logo.png";
import {
  PiEnvelopeSimple,
  PiGraduationCap,
  PiChalkboardTeacher,
  PiClipboardText,
  PiGearSix,
} from 'react-icons/pi';
import '../styles/footer.css';

const QUICK_LINKS = [
  { label: 'Home', href: '#home' },
  { label: 'Features', href: '#features' },
  { label: 'Workflow', href: '#workflow' },
  { label: 'Contact', href: '#contact' },
];

const PORTALS = [
  { label: 'Student Portal', icon: <PiGraduationCap /> },
  { label: 'Guide Portal', icon: <PiChalkboardTeacher /> },
  { label: 'Coordinator Portal', icon: <PiClipboardText /> },
  { label: 'Admin Portal', icon: <PiGearSix /> },
];

export default function Footer() {
  const year = new Date().getFullYear();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="footer">
      <div className="container footer__grid">
        <div className="footer__col footer__col--brand">
         <a href="#home" className="footer__brand">
  <span className="footer__logo">
    <img src={logo} alt="PRMES Logo" />
  </span>

  
</a>
          <p className="footer__desc">
            A unified portal that manages the complete academic project
            lifecycle &mdash; from team registration to final evaluation.
          </p>
          <div className="footer__socials">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="footer__social"
              aria-label="PRMES on GitHub"
            >
              <FaGithub />
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="footer__social"
              aria-label="PRMES on LinkedIn"
            >
              <FaLinkedin />
            </a>
            <a
              href="mailto:prmes@gndec.edu.in"
              className="footer__social"
              aria-label="Email the PRMES team"
            >
              <PiEnvelopeSimple />
            </a>
          </div>
        </div>

        <nav className="footer__col" aria-label="Quick links">
          <h4 className="footer__heading">Quick Links</h4>
          <ul className="footer__list">
            {QUICK_LINKS.map((l) => (
              <li key={l.href}>
                <a href={l.href} className="footer__link">
                  <span className="footer__link-text">{l.label}</span>
                  <HiArrowRight className="footer__link-arrow" aria-hidden="true" />
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="footer__col">
          <h4 className="footer__heading">Portal Access</h4>
          <ul className="footer__list footer__list--portal">
            {PORTALS.map((p) => (
              <li key={p.label} className="footer__portal">
                <span className="footer__portal-icon">{p.icon}</span>
                {p.label}
              </li>
            ))}
          </ul>
        </div>

        <div className="footer__col">
          <h4 className="footer__heading">Developed For</h4>
          <p className="footer__institution">
            Guru Nanak Dev Engineering College
            <br />
            Bidar, Karnataka
          </p>
          <p className="footer__department">
            Department of Computer Science &amp; Engineering
          </p>
        </div>
      </div>

      <div className="container">
        <div className="footer__divider" />
      </div>

      <div className="container footer__bottom">
        <span className="footer__copyright">
  © {year} PRMES | Designed for Guru Nanak Dev Engineering College, Bidar
</span>

        <button
          type="button"
          className="footer__top-btn"
          onClick={scrollToTop}
          aria-label="Back to top"
        >
          <HiArrowUp />
        </button>
      </div>
    </footer>
  );
}
