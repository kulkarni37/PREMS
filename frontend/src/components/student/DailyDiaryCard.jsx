import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PiBookBookmark, PiPlusBold, PiPencilSimple, PiTrash, PiX, PiCheckCircle, PiClock, PiWarningCircle, PiCalendarBlank } from 'react-icons/pi';
import { fetchStudentDiary, createDiaryEntry, updateDiaryEntry, deleteDiaryEntry } from '../../services/api';

export default function DailyDiaryCard({ user, onDiaryUpdated }) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [entryToDelete, setEntryToDelete] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form states
  const todayStr = new Date().toISOString().split('T')[0];
  const [entryDate, setEntryDate] = useState(todayStr);
  const [category, setCategory] = useState('Frontend Development');
  const [description, setDescription] = useState('');
  const [hours, setHours] = useState(4);
  const [challenges, setChallenges] = useState('');
  const [tomorrowPlan, setTomorrowPlan] = useState('');
  const [status, setStatus] = useState('Completed');

  const CATEGORIES = [
    'Research',
    'Frontend Development',
    'Backend Development',
    'Database',
    'AI/ML',
    'Documentation',
    'Testing',
    'UI/UX',
    'Project Management',
    'Other'
  ];

  const STATUSES = ['Completed', 'In Progress', 'Blocked'];

  const loadEntries = async () => {
    setLoading(true);
    const res = await fetchStudentDiary(user?.email, user?.id);
    if (res && res.success) {
      setEntries(res.entries || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadEntries();
  }, [user]);

  const handleOpenAdd = () => {
    setEditingEntry(null);
    setEntryDate(todayStr);
    setCategory('Frontend Development');
    setDescription('');
    setHours(4);
    setChallenges('');
    setTomorrowPlan('');
    setStatus('Completed');
    setErrorMsg('');
    setShowModal(true);
  };

  const handleOpenEdit = (entry) => {
    setEditingEntry(entry);
    setEntryDate(entry.date || todayStr);
    setCategory(entry.work_category || 'Other');
    setDescription(entry.work_description || '');
    setHours(entry.hours_worked || 1);
    setChallenges(entry.challenges || '');
    setTomorrowPlan(entry.tomorrow_plan || '');
    setStatus(entry.status || 'Completed');
    setErrorMsg('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!description.trim()) {
      setErrorMsg("Please describe today's work.");
      return;
    }

    const payload = {
      user_email: user?.email,
      date: entryDate,
      work_category: category,
      work_description: description.trim(),
      hours_worked: Number(hours),
      challenges: challenges.trim(),
      tomorrow_plan: tomorrowPlan.trim(),
      status
    };

    try {
      setSubmitting(true);
      if (editingEntry) {
        const res = await updateDiaryEntry(editingEntry.id, payload);
        if (res && res.success) {
          setSuccessMsg('Diary entry updated successfully!');
          setShowModal(false);
          loadEntries();
          if (onDiaryUpdated) onDiaryUpdated();
        } else {
          setErrorMsg(res?.message || 'Failed to update diary entry.');
        }
      } else {
        const res = await createDiaryEntry(payload);
        if (res && res.success) {
          setSuccessMsg('Today\'s diary entry saved successfully!');
          setShowModal(false);
          loadEntries();
          if (onDiaryUpdated) onDiaryUpdated();
        } else {
          setErrorMsg(res?.message || 'Failed to save diary entry.');
        }
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to save diary entry with server.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!entryToDelete) return;
    try {
      setSubmitting(true);
      const res = await deleteDiaryEntry(entryToDelete.id, user?.email);
      if (res && res.success) {
        setSuccessMsg('Diary entry deleted.');
        setEntryToDelete(null);
        loadEntries();
        if (onDiaryUpdated) onDiaryUpdated();
      } else {
        setErrorMsg(res?.message || 'Failed to delete diary entry.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to delete diary entry.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="sd-card" id="diary">
      <div className="sd-card__head">
        <h2 className="sd-card__title">
          <PiBookBookmark className="sd-card__title-icon" /> Daily Project Work Diary
        </h2>
        <motion.button
          className="sd-btn sd-btn-primary"
          onClick={handleOpenAdd}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.98 }}
        >
          <PiPlusBold /> Add Today&apos;s Entry
        </motion.button>
      </div>

      {successMsg && (
        <div style={{ padding: '10px 14px', borderRadius: 'var(--radius-sm)', background: 'var(--accent-cyan-soft)', border: '1px solid var(--accent-cyan)', color: 'var(--accent-cyan)', fontSize: '13px', marginBottom: '16px' }}>
          ✓ {successMsg}
        </div>
      )}

      {loading ? (
        <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
          Loading daily diary entries...
        </div>
      ) : entries.length === 0 ? (
        <div className="sd-empty-state">
          <div className="sd-empty-state__icon">
            <PiBookBookmark />
          </div>
          <h3 className="sd-empty-state__title">No daily diary entries recorded yet.</h3>
          <p className="sd-empty-state__sub">
            Log your individual daily contribution, progress, challenges, and hours spent on the PRMES project.
          </p>
          <button className="sd-btn sd-btn-primary" onClick={handleOpenAdd}>
            <PiPlusBold /> Add First Entry
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {entries.map((entry) => (
            <div
              key={entry.id}
              style={{
                padding: '16px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-hairline)',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="sd-doc-status-pill sd-doc-status-pill--approved" style={{ fontFamily: 'var(--font-mono)', fontSize: '11px' }}>
                      {entry.work_category}
                    </span>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {entry.date}
                    </span>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      • {entry.hours_worked} {entry.hours_worked === 1 ? 'hour' : 'hours'}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className={`sd-urgency-pill ${entry.status === 'Completed' ? 'sd-doc-status-pill--approved' : entry.status === 'Blocked' ? 'sd-urgency-pill--overdue' : 'sd-urgency-pill--approaching'}`}>
                    {entry.status}
                  </span>

                  {/* Edit/Delete available strictly for owner */}
                  {user && (entry.student_id === user.id || !entry.student_id) && (
                    <>
                      <button
                        className="sd-btn sd-btn-outline"
                        style={{ padding: '4px 8px', fontSize: '11.5px' }}
                        onClick={() => handleOpenEdit(entry)}
                        title="Edit Entry"
                      >
                        <PiPencilSimple /> Edit
                      </button>
                      <button
                        className="sd-btn sd-btn-outline"
                        style={{ padding: '4px 8px', fontSize: '11.5px', color: '#ff6259', borderColor: 'rgba(255, 98, 89, 0.4)' }}
                        onClick={() => setEntryToDelete(entry)}
                        title="Delete Entry"
                      >
                        <PiTrash /> Delete
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div style={{ fontSize: '13.5px', color: 'var(--text-primary)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                <strong>Today&apos;s Work:</strong> {entry.work_description}
              </div>

              {entry.challenges && (
                <div style={{ fontSize: '12.5px', color: '#ff9f43', background: 'rgba(255, 159, 67, 0.08)', padding: '8px 12px', borderRadius: '4px', border: '1px solid rgba(255, 159, 67, 0.2)' }}>
                  ⚠️ <strong>Challenges / Blockers:</strong> {entry.challenges}
                </div>
              )}

              {entry.tomorrow_plan && (
                <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)', background: 'var(--bg-canvas)', padding: '8px 12px', borderRadius: '4px', border: '1px solid var(--border-hairline)' }}>
                  🎯 <strong>Tomorrow&apos;s Plan:</strong> {entry.tomorrow_plan}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal for Add / Edit Diary Entry */}
      <AnimatePresence>
        {showModal && (
          <div className="sd-modal-backdrop" onClick={() => setShowModal(false)}>
            <motion.div
              className="sd-modal"
              style={{ maxWidth: 560 }}
              initial={{ opacity: 0, scale: 0.92, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 16 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button className="sd-modal__close" onClick={() => setShowModal(false)}>
                <PiX />
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <PiBookBookmark style={{ color: 'var(--accent-cyan)', fontSize: '26px' }} />
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 700, margin: 0 }}>
                  {editingEntry ? 'Edit Diary Entry' : 'Add Daily Diary Entry'}
                </h3>
              </div>

              {errorMsg && (
                <div style={{ padding: '10px 14px', borderRadius: 'var(--radius-sm)', background: 'rgba(255, 98, 89, 0.12)', border: '1px solid rgba(255, 98, 89, 0.3)', color: '#ff6259', fontSize: '13px', marginBottom: '14px' }}>
                  ⚠️ {errorMsg}
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '4px', fontFamily: 'var(--font-mono)', fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                      Date *
                    </label>
                    <input
                      type="date"
                      className="register-input"
                      style={{ width: '100%', padding: '8px 10px' }}
                      value={entryDate}
                      onChange={(e) => setEntryDate(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '4px', fontFamily: 'var(--font-mono)', fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                      Work Category *
                    </label>
                    <select
                      className="register-input"
                      style={{ width: '100%', padding: '8px 10px', background: 'var(--bg-surface)' }}
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontFamily: 'var(--font-mono)', fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                    Today&apos;s Work Completed *
                  </label>
                  <textarea
                    className="register-input"
                    rows={3}
                    style={{ width: '100%', padding: '10px', resize: 'vertical' }}
                    placeholder="Describe what tasks, code, or modules you worked on today..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '4px', fontFamily: 'var(--font-mono)', fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                      Hours Worked *
                    </label>
                    <input
                      type="number"
                      min="0.5"
                      max="16"
                      step="0.5"
                      className="register-input"
                      style={{ width: '100%', padding: '8px 10px' }}
                      value={hours}
                      onChange={(e) => setHours(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '4px', fontFamily: 'var(--font-mono)', fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                      Status *
                    </label>
                    <select
                      className="register-input"
                      style={{ width: '100%', padding: '8px 10px', background: 'var(--bg-surface)' }}
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                    >
                      {STATUSES.map((st) => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontFamily: 'var(--font-mono)', fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                    Challenges / Blockers (Optional)
                  </label>
                  <input
                    type="text"
                    className="register-input"
                    style={{ width: '100%', padding: '8px 10px' }}
                    placeholder="Any issues, bugs, or waiting dependencies..."
                    value={challenges}
                    onChange={(e) => setChallenges(e.target.value)}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontFamily: 'var(--font-mono)', fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                    Tomorrow&apos;s Plan (Optional)
                  </label>
                  <input
                    type="text"
                    className="register-input"
                    style={{ width: '100%', padding: '8px 10px' }}
                    placeholder="What do you plan to complete next?"
                    value={tomorrowPlan}
                    onChange={(e) => setTomorrowPlan(e.target.value)}
                  />
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                  <button type="button" className="sd-btn sd-btn-outline" style={{ flex: 1 }} onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="sd-btn sd-btn-primary" style={{ flex: 1 }} disabled={submitting}>
                    {submitting ? 'Saving...' : editingEntry ? 'Update Entry' : 'Save Entry'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {entryToDelete && (
          <div className="sd-modal-backdrop" onClick={() => setEntryToDelete(null)}>
            <motion.div
              className="sd-modal"
              style={{ maxWidth: 440 }}
              initial={{ opacity: 0, scale: 0.92, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 16 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button className="sd-modal__close" onClick={() => setEntryToDelete(null)}>
                <PiX />
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                <PiWarningCircle style={{ color: '#ff6259', fontSize: '26px' }} />
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 700, margin: 0 }}>
                  Delete Diary Entry?
                </h3>
              </div>

              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '20px' }}>
                Are you sure you want to delete the diary entry for <strong>{entryToDelete.date}</strong> ({entryToDelete.work_category})?
              </p>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button className="sd-btn sd-btn-outline" style={{ flex: 1 }} onClick={() => setEntryToDelete(null)}>
                  Cancel
                </button>
                <button className="sd-btn" style={{ flex: 1, background: '#ff6259', color: '#fff', border: 'none' }} onClick={handleDelete} disabled={submitting}>
                  {submitting ? 'Deleting...' : 'Delete Entry'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
