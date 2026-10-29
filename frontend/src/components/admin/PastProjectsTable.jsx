import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PiFolderSimple, PiMagnifyingGlass, PiTrash, PiPlusBold, PiFileXBold, PiCheckCircle } from 'react-icons/pi';
import { fetchPastProjects, addPastProject, deletePastProject } from '../../services/api';

export default function PastProjectsTable() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('');
  
  // Modal for manual addition
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newPeriod, setNewPeriod] = useState('2022-25');
  const [newGroupNo, setNewGroupNo] = useState('');
  const [newGuide, setNewGuide] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [notice, setNotice] = useState('');
  const [errorNotice, setErrorNotice] = useState('');

  const loadPastProjects = async () => {
    setLoading(true);
    const res = await fetchPastProjects(search, selectedPeriod);
    if (res && res.success) {
      setProjects(res.projects || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    const timer = setTimeout(loadPastProjects, 300);
    return () => clearTimeout(timer);
  }, [search, selectedPeriod]);

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete past project '${title}'?`)) return;
    try {
      const res = await deletePastProject(id);
      if (res && res.success) {
        setNotice(`Deleted past project '${title}' successfully.`);
        loadPastProjects();
      }
    } catch (err) {
      setErrorNotice(err.message || 'Failed to delete past project record.');
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      setSubmitting(true);
      const res = await addPastProject({
        project_title: newTitle.trim(),
        source_period: newPeriod,
        group_no: newGroupNo.trim() || undefined,
        guide_name: newGuide.trim() || undefined
      });
      if (res && res.success) {
        setNotice('Added past project to repository successfully!');
        setShowAddModal(false);
        setNewTitle('');
        setNewGroupNo('');
        setNewGuide('');
        loadPastProjects();
      }
    } catch (err) {
      setErrorNotice(err.message || 'Failed to add project to repository.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="ad-card" id="past-repository" style={{ marginTop: 24 }}>
      <div className="ad-card__head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 className="ad-card__title">
          <PiFolderSimple className="ad-card__title-icon" /> 5-Year Past Project Repository ({projects.length} Records)
        </h2>
        <button
          className="sd-btn sd-btn-primary"
          style={{ padding: '6px 14px', fontSize: '12.5px' }}
          onClick={() => setShowAddModal(true)}
        >
          <PiPlusBold /> Add Past Project
        </button>
      </div>

      <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
        Official 5-year PRMES project repository parsed directly from <code>projectlist 5 year.xlsx</code>. Used for semantic similarity checking during project title proposals.
      </div>

      {notice && (
        <div style={{ padding: '10px 14px', borderRadius: 'var(--radius-sm)', background: 'var(--accent-cyan-soft)', border: '1px solid var(--accent-cyan)', color: 'var(--accent-cyan)', fontSize: '13px', marginBottom: '16px' }}>
          ℹ️ {notice}
        </div>
      )}

      {errorNotice && (
        <div style={{ padding: '10px 14px', borderRadius: 'var(--radius-sm)', background: 'rgba(255, 98, 89, 0.12)', border: '1px solid rgba(255, 98, 89, 0.3)', color: '#ff6259', fontSize: '13px', marginBottom: '16px' }}>
          ⚠️ {errorNotice}
        </div>
      )}

      {/* FILTER BAR */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
          <PiMagnifyingGlass style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="register-input"
            style={{ width: '100%', paddingLeft: '36px', paddingRight: '12px', height: '38px', fontSize: '13px' }}
            placeholder="Search past projects by title, group, or guide..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="register-input"
          style={{ width: '180px', height: '38px', fontSize: '13px', background: 'var(--bg-surface)' }}
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value)}
        >
          <option value="">All Source Periods</option>
          <option value="2018-22">2018-22</option>
          <option value="2019-23">2019-23</option>
          <option value="2020-24">2020-24</option>
          <option value="2021-25">2021-25</option>
          <option value="2022-25">2022-25</option>
        </select>
      </div>

      {/* REPOSITORY TABLE */}
      <div style={{ overflowX: 'auto', maxHeight: '420px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-hairline)' }}>
        <table className="ad-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
          <thead>
            <tr style={{ background: 'var(--bg-canvas)', borderBottom: '1px solid var(--border-hairline)' }}>
              <th style={{ padding: '10px 14px' }}>Project Title</th>
              <th style={{ padding: '10px 14px' }}>Source Period</th>
              <th style={{ padding: '10px 14px' }}>Group No.</th>
              <th style={{ padding: '10px 14px' }}>Faculty Guide</th>
              <th style={{ padding: '10px 14px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  Loading past projects repository...
                </td>
              </tr>
            ) : projects.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No repository records matching search.
                </td>
              </tr>
            ) : (
              projects.map((p) => (
                <tr key={p.id} style={{ borderBottom: '1px solid var(--border-hairline)' }}>
                  <td style={{ padding: '10px 14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {p.project_title}
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    <span className="sd-welcome-card__status-pill" style={{ fontSize: '11px', padding: '2px 8px' }}>
                      {p.source_period}
                    </span>
                  </td>
                  <td style={{ padding: '10px 14px', color: 'var(--text-secondary)' }}>
                    {p.group_no || '-'}
                  </td>
                  <td style={{ padding: '10px 14px', color: 'var(--text-secondary)' }}>
                    {p.guide_name || '-'}
                  </td>
                  <td style={{ padding: '10px 14px', textAlign: 'right' }}>
                    <button
                      className="sd-btn sd-btn-outline"
                      style={{ padding: '4px 8px', fontSize: '11px', color: '#ff6259', border: '1px solid rgba(255, 98, 89, 0.3)' }}
                      onClick={() => handleDelete(p.id, p.project_title)}
                    >
                      <PiTrash /> Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ADD MODAL */}
      {showAddModal && (
        <div className="sd-modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div className="sd-modal" style={{ maxWidth: 480 }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>
              Add Record to Past Project Repository
            </h3>

            <form onSubmit={handleAddSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px' }}>Project Title *</label>
                <input
                  type="text"
                  className="register-input"
                  style={{ width: '100%', padding: '8px 12px' }}
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px' }}>Source Period *</label>
                <input
                  type="text"
                  className="register-input"
                  style={{ width: '100%', padding: '8px 12px' }}
                  placeholder="e.g. 2022-25"
                  value={newPeriod}
                  onChange={(e) => setNewPeriod(e.target.value)}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px' }}>Group No. (Optional)</label>
                <input
                  type="text"
                  className="register-input"
                  style={{ width: '100%', padding: '8px 12px' }}
                  placeholder="e.g. G1"
                  value={newGroupNo}
                  onChange={(e) => setNewGroupNo(e.target.value)}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px' }}>Faculty Guide (Optional)</label>
                <input
                  type="text"
                  className="register-input"
                  style={{ width: '100%', padding: '8px 12px' }}
                  placeholder="e.g. Prof. Suresh C"
                  value={newGuide}
                  onChange={(e) => setNewGuide(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="button" className="sd-btn sd-btn-outline" style={{ flex: 1 }} onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="sd-btn sd-btn-primary" style={{ flex: 1 }} disabled={submitting}>
                  {submitting ? 'Saving...' : 'Add Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
