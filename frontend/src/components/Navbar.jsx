import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineSun, HiOutlineMoon, HiMenu, HiX } from 'react-icons/hi';
import logo from "../assets/logo.png";
import { useTheme } from '../context/ThemeContext.jsx';
import '../styles/navbar.css';
import { Link } from "react-router-dom";
const NAV_LINKS = [
  { label: 'Home', href: '#home' },
  { label: 'Features', href: '#features' },
  { label: 'Workflow', href: '#workflow' },
  { label: 'Contact', href: '#contact' },
];

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
      <div className="navbar__inner container">
        <a href="#home" className="navbar__brand">
         <span className="navbar__mark">
    <img src={logo} alt="PRMES Logo" className="navbar__logo" />
</span>
          <span className="navbar__brand-text">
            
            <span className="navbar__brand-sub">
              Project Review Management &amp; Evaluation System
            </span>
          </span>
        </a>

        <nav className="navbar__links">
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href} className="navbar__link">
              {link.label}
            </a>
          ))}
        </nav>

        <div className="navbar__actions">
          <button
            type="button"
            aria-label="Toggle theme"
            className="navbar__theme-toggle"
            onClick={toggleTheme}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={theme}
                initial={{ rotate: -60, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 60, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="navbar__theme-icon"
              >
                {theme === 'dark' ? <HiOutlineSun /> : <HiOutlineMoon />}
              </motion.span>
            </AnimatePresence>
          </button>
<Link to="/login" className="btn btn-ghost navbar__login">
  Login
</Link>

<Link to="/register" className="btn btn-primary navbar__register">
  Register
</Link>
          <button
            type="button"
            className="navbar__burger"
            aria-label="Open menu"
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? <HiX /> : <HiMenu />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="navbar__mobile"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="navbar__mobile-inner">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="navbar__mobile-link"
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              <div className="navbar__mobile-actions">
                <a href="#" className="btn btn-outline">
                  Login
                </a>
                <a href="#" className="btn btn-primary">
                  Register Team
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
