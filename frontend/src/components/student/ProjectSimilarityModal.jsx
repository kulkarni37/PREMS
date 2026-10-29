import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PiX, PiMagnifyingGlass, PiWarningBold, PiCheckCircleBold, PiArrowRightBold, PiPencilSimpleBold, PiFolderSimple } from 'react-icons/pi';
import { checkProjectSimilarity } from '../../services/api';
import { FIXED_PROJECT_DOMAINS } from '../../constants/domains';

export default function ProjectSimilarityModal({
  isOpen,
  onClose,
  currentTitle = '',
  currentDomain = '',
  user,
  team,
  onSimilarityPassed
}) {
  const [title, setTitle] = useState(currentTitle || '');
  const [domain, setDomain] = useState(currentDomain || FIXED_PROJECT_DOMAINS[0]);
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState(null);
  const [errorNotice, setErrorNotice] = useState('');

  useEffect(() => {
    if (currentTitle) setTitle(currentTitle);
    if (currentDomain) setDomain(currentDomain);
    setResult(null);
    setErrorNotice('');
  }, [currentTitle, currentDomain, isOpen]);

  if (!isOpen) return null;

  const handleRunCheck = async (e) => {
    if (e) e.preventDefault();
    if (!title.trim()) {
      setErrorNotice('Please enter a proposed project title to run the similarity check.');
      return;
    }

    try {
      setChecking(true);
      setErrorNotice('');
      const res = await checkProjectSimilarity(
        title.trim(),
        user?.email || team?.leader_email || user?.student_id
      );
      if (res && res.success) {
        setResult(res);
      } else {
        setErrorNotice(res?.message || 'Failed to check similarity against repository.');
      }
    } catch (err) {
      setErrorNotice(err?.message || 'An error occurred during similarity analysis.');
    } finally {
      setChecking(false);
    }
  };

  const handleChooseDifferentIdea = () => {
    setResult(null);
  };

  const handleContinueToProposal = () => {
    if (onSimilarityPassed) {
      onSimilarityPassed({ title: title.trim(), domain });
    }
    onClose();
  };

  return (
    <div className="sd-modal-backdrop" onClick={onClose}>
      <motion.div
        className="sd-modal"
        style={{ maxWidth: 680, width: '90%' }}
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 20 }}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="sd-modal__close" onClick={onClose}>
          <PiX />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <PiMagnifyingGlass style={{ color: 'var(--accent-cyan)', fontSize: '26px' }} />
          <div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
              Project Idea Similarity Check
            </h3>
            <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Check your proposed project title against the 5-Year Past Project Repository before domain submission.
            </div>
          </div>
        </div>

        {errorNotice && (
          <div style={{ padding: '10px 14px', borderRadius: 'var(--radius-sm)', background: 'rgba(255, 98, 89, 0.12)', border: '1px solid rgba(255, 98, 89, 0.3)', color: '#ff6259', fontSize: '13px', marginBottom: '16px' }}>
            ⚠️ {errorNotice}
          </div>
        )}

        {!result ? (
          <form onSubmit={handleRunCheck} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontFamily: 'var(--font-mono)', fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                Proposed Project Title *
              </label>
              <input
                type="text"
                className="register-input"
                style={{ width: '100%', padding: '11px 14px', fontSize: '14.5px' }}
                placeholder="e.g. Smart Plant Disease Detection using Deep Learning"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontFamily: 'var(--font-mono)', fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                Project Domain
              </label>
              <select
                className="register-input"
                style={{ width: '100%', padding: '10px 12px', background: 'var(--bg-surface)' }}
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
              >
                {FIXED_PROJECT_DOMAINS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div style={{ padding: '12px 16px', background: 'var(--bg-canvas)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-hairline)', fontSize: '12.5px', color: 'var(--text-muted)' }}>
              ℹ️ The system will search 160+ official past projects (2018–2025 repository) using semantic matching to ensure your project idea is distinct and original.
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
              <button type="button" className="sd-btn sd-btn-outline" style={{ flex: 1 }} onClick={onClose}>
                Cancel
              </button>
              <button
                type="submit"
                className="sd-btn sd-btn-primary"
                style={{ flex: 1.5, padding: '10px 18px', fontWeight: 700 }}
                disabled={checking}
              >
                {checking ? (
                  <>Analyzing Repository...</>
                ) : (
                  <>
                    <PiMagnifyingGlass style={{ fontSize: 18 }} /> CHECK PROJECT IDEA
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* RESULT HEADER */}
            {result.is_similar ? (
              <div style={{ padding: '16px 20px', borderRadius: 'var(--radius-sm)', background: 'rgba(255, 98, 89, 0.12)', border: '1px solid rgba(255, 98, 89, 0.3)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#ff6259', fontWeight: 800, fontSize: '16px' }}>
                  <PiWarningBold style={{ fontSize: 24 }} />
                  <span>⚠️ SIMILAR PROJECT FOUND</span>
                </div>
                <div style={{ fontSize: '13.5px', color: 'var(--text-primary)', marginTop: '8px', lineHeight: 1.5 }}>
                  Your proposed project <strong>"{result.proposed_title}"</strong> appears similar to one or more projects in the previous 5-year project repository. Please consider a different project idea or a substantially different approach.
                </div>
              </div>
            ) : (
              <div style={{ padding: '16px 20px', borderRadius: 'var(--radius-sm)', background: 'var(--accent-cyan-soft)', border: '1px solid var(--accent-cyan)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--accent-cyan)', fontWeight: 800, fontSize: '16px' }}>
                  <PiCheckCircleBold style={{ fontSize: 24 }} />
                  <span>✓ PROJECT IDEA AVAILABLE</span>
                </div>
                <div style={{ fontSize: '13.5px', color: 'var(--text-primary)', marginTop: '8px', lineHeight: 1.5 }}>
                  No sufficiently similar project was found in the available 5-year project repository for <strong>"{result.proposed_title}"</strong>.
                </div>
              </div>
            )}

            {/* MATCHING RECORDS LIST IF SIMILAR */}
            {result.is_similar && result.matches && result.matches.length > 0 && (
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11.5px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '10px', fontWeight: 700 }}>
                  SIMILAR PROJECTS IN REPOSITORY ({result.matches.length} MATCHES FOUND):
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '240px', overflowY: 'auto', paddingRight: '4px' }}>
                  {result.matches.map((m) => (
                    <div
                      key={m.id}
                      style={{
                        padding: '12px 16px',
                        borderRadius: 'var(--radius-sm)',
                        background: 'var(--bg-canvas)',
                        border: '1px solid var(--border-hairline)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '16px'
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
                          {m.project_title}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px', display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                          <span>📅 Source Period: <strong>{m.source_period}</strong></span>
                          {m.group_no && <span>👥 Group: <strong>{m.group_no}</strong></span>}
                          {m.guide_name && <span>👨‍🏫 Guide: <strong>{m.guide_name}</strong></span>}
                        </div>
                      </div>

                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <span className="sd-urgency-pill sd-urgency-pill--approaching" style={{ fontSize: '12px', padding: '4px 10px' }}>
                          {m.similarity_score}% Match
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ACTION BUTTONS */}
            <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
              {result.is_similar ? (
                <>
                  <button
                    className="sd-btn sd-btn-primary"
                    style={{ flex: 1, padding: '12px 18px', background: 'var(--accent-amber)', color: '#000', fontWeight: 700 }}
                    onClick={handleChooseDifferentIdea}
                  >
                    <PiPencilSimpleBold /> CHOOSE DIFFERENT IDEA
                  </button>
                  <button
                    className="sd-btn sd-btn-outline"
                    style={{ flex: 1 }}
                    onClick={onClose}
                  >
                    Close
                  </button>
                </>
              ) : (
                <>
                  <button
                    className="sd-btn sd-btn-outline"
                    style={{ flex: 1 }}
                    onClick={handleChooseDifferentIdea}
                  >
                    Modify Title
                  </button>
                  <button
                    className="sd-btn sd-btn-primary"
                    style={{ flex: 1.5, padding: '12px 18px', fontWeight: 700 }}
                    onClick={handleContinueToProposal}
                  >
                    <PiArrowRightBold /> CONTINUE TO PROJECT PROPOSAL
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
