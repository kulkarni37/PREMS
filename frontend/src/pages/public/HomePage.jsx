import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PiCircuitry, PiBuildings, PiUserCheck, PiArrowRightBold, PiShieldCheck } from 'react-icons/pi';

import Navbar from "../../components/Navbar.jsx";
import Hero from "../../components/Hero.jsx";
import About from "../../components/About.jsx";
import Features from "../../components/Features.jsx";
import Workflow from "../../components/Workflow.jsx";
import WhyChoose from "../../components/WhyChoose.jsx";
import Contact from "../../components/Contact.jsx";
import Footer from "../../components/Footer.jsx";

import { fetchOrganizationStatus } from '../../services/api.js';

export default function HomePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [orgExists, setOrgExists] = useState(true);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await fetchOrganizationStatus();
        if (res && typeof res.organization_exists === 'boolean') {
          setOrgExists(res.organization_exists);
        }
      } catch (err) {
        console.error('Organization status check failed:', err);
      } finally {
        setLoading(false);
      }
    };
    checkStatus();
  }, []);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-canvas)', display: 'grid', placeItems: 'center', color: 'var(--accent-cyan)' }}>
        <div style={{ textAlign: 'center' }}>
          <PiCircuitry className="sd-spin" style={{ fontSize: 40, marginBottom: 12 }} />
          <div style={{ fontSize: 14, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>Initializing PRMES System...</div>
        </div>
      </div>
    );
  }

  // ---------------- IF NO ORGANIZATION EXISTS ----------------
  if (!orgExists) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-canvas)', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div className="blueprint-grid" style={{ opacity: 0.6 }} />

        {/* Minimal Header */}
        <header style={{ padding: '20px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-hairline)', position: 'relative', zIndex: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: 36, height: 36, borderRadius: '8px', background: 'var(--accent-cyan-soft)', color: 'var(--accent-cyan)', display: 'grid', placeItems: 'center', fontSize: 20 }}>
              <PiCircuitry />
            </div>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '20px', letterSpacing: '0.5px', color: 'var(--text-primary)' }}>PRMES</span>
          </div>

          <button
            className="gd-btn gd-btn-outline"
            style={{ padding: '8px 16px', fontSize: '13px' }}
            onClick={() => navigate('/login')}
          >
            <PiUserCheck /> Admin Login
          </button>
        </header>

        {/* Main Onboarding Hero */}
        <main style={{ flex: 1, display: 'grid', placeItems: 'center', padding: '60px 20px', position: 'relative', zIndex: 10 }}>
          <motion.div
            style={{ maxWidth: 640, textAlign: 'center', width: '100%' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 14px', borderRadius: '100px', background: 'var(--accent-amber-soft)', border: '1px solid var(--accent-amber)', color: 'var(--accent-amber)', fontSize: '12.5px', fontWeight: 600, marginBottom: '20px' }}>
              <PiShieldCheck style={{ fontSize: 16 }} /> First-Time Setup Required
            </span>

            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: ' clamp(28px, 5vw, 42px)', fontWeight: 800, lineHeight: 1.2, margin: '0 0 16px', color: 'var(--text-primary)' }}>
              Set up your institution to get started.
            </h1>

            <p style={{ fontSize: '16px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: '0 auto 32px', maxWidth: 540 }}>
              Register your organization to configure departments, administrators, students, guides, coordinators and project workflows.
            </p>

            <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <motion.button
                className="gd-btn gd-btn-primary"
                style={{ padding: '14px 32px', fontSize: '15.5px' }}
                onClick={() => navigate('/organization/register')}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <PiBuildings /> Register Organization <PiArrowRightBold />
              </motion.button>

              <motion.button
                className="gd-btn gd-btn-outline"
                style={{ padding: '14px 24px', fontSize: '15px' }}
                onClick={() => navigate('/login')}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <PiUserCheck /> Admin Login
              </motion.button>
            </div>
          </motion.div>
        </main>

        <Footer />
      </div>
    );
  }

  // ---------------- IF ORGANIZATION EXISTS ----------------
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <About />
        <Features />
        <Workflow />
        <WhyChoose />
        <Contact />
      </main>
      <Footer />
    </>
  );
}