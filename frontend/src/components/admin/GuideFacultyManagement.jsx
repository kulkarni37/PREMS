import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PiChalkboardTeacher,
  PiMagnifyingGlass,
  PiPlusBold,
  PiPencilSimple,
  PiTrash,
  PiX,
  PiCheckCircle,
  PiWarningCircle,
  PiUploadSimple,
} from 'react-icons/pi';
import {
  fetchAdminGuides,
  createAdminGuide,
  updateAdminGuide,
  deleteAdminGuide,
} from '../../services/api';
import FacultyImport from './FacultyImport';

export default function GuideFacultyManagement() {
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [notice, setNotice] = useState('');
  const [errorNotice, setErrorNotice] = useState('');
  const [showImportModal, setShowImportModal] = useState(false);

  // Add / Edit Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGuide, setEditingGuide] = useState(null);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    department: 'Computer Science & Engineering',
    designation: 'Assistant Professor',
    specialization: 'Artificial Intelligence & Machine Learning',
    password: '',
    status: 'Active',
  });
  const [submitting, setSubmitting] = useState(false);

  const loadGuides = async () => {
    try {
      setLoading(true);
      setErrorNotice('');
      const res = await fetchAdminGuides();
      if (res && res.success) {
        setGuides(res.guides || []);
      }
    } catch (err) {
      setErrorNotice(err?.message || 'Failed to load faculty guides.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGuides();
  }, []);

  const filteredGuides = guides.filter((g) => {
    const term = searchTerm.toLowerCase();
    return (
      (g.full_name || '').toLowerCase().includes(term) ||
      (g.email || '').toLowerCase().includes(term) ||
      (g.specialization || '').toLowerCase().includes(term) ||
      (g.department || '').toLowerCase().includes(term)
    );
  });

  const handleOpenAdd = () => {
    setEditingGuide(null);
    setFormData({
      full_name: '',
      email: '',
      department: 'Computer Science & Engineering',
      designation: 'Assistant Professor',
      specialization: 'Artificial Intelligence & Machine Learning',
      password: '',
      status: 'Active',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (guide) => {
    setEditingGuide(guide);
    setFormData({
      full_name: guide.full_name || '',
      email: guide.email || '',
      department: guide.department || 'Computer Science & Engineering',
      designation: guide.designation || 'Assistant Professor',
      specialization: guide.specialization || '',
      password: '',
      status: guide.status || 'Active',
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (guide) => {
    if (guide.assigned_count > 0) {
      alert(`Cannot delete Guide ${guide.full_name}: They currently have ${guide.assigned_count} assigned teams. Please reassign their teams first.`);
      return;
    }
    if (!window.confirm(`Are you sure you want to delete Faculty Guide ${guide.full_name}?`)) {
      return;
    }
    try {
      setErrorNotice('');
      const res = await deleteAdminGuide(guide.id);
      if (res && res.success) {
        setNotice(`Faculty Guide ${guide.full_name} deleted successfully.`);
        loadGuides();
      } else {
        setErrorNotice(res?.message || 'Failed to delete guide.');
      }
    } catch (err) {
      setErrorNotice(err?.message || 'Failed to delete guide.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorNotice('');
    try {
      if (editingGuide) {
        const res = await updateAdminGuide(editingGuide.id, formData);
        if (res && res.success) {
          setNotice(`Faculty Guide ${formData.full_name} updated successfully.`);
          setIsModalOpen(false);
          loadGuides();
        } else {
          setErrorNotice(res?.message || 'Failed to update guide.');
        }
      } else {
        const res = await createAdminGuide(formData);
        if (res && res.success) {
          setNotice(`Faculty Guide ${formData.full_name} added successfully.`);
          setIsModalOpen(false);
          loadGuides();
        } else {
          setErrorNotice(res?.message || 'Failed to add guide.');
        }
      }
    } catch (err) {
      setErrorNotice(err?.message || 'Operation failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="ad-card" id="faculty">
      {/* Head */}
      <div className="ad-card__head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h2 className="ad-card__title" style={{ margin: 0 }}>
            <PiChalkboardTeacher className="ad-card__title-icon" /> Guide / Faculty Management
          </h2>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Strict Capacity Limit: Maximum 3 teams per guide.
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            className="gd-btn gd-btn-outline"
            style={{ padding: '6px 14px', fontSize: '12.5px', display: 'flex', alignItems: 'center', gap: '6px' }}
            onClick={() => setShowImportModal(!showImportModal)}
          >
            <PiUploadSimple /> {showImportModal ? 'Hide Import' : 'Batch Import Faculty'}
          </button>
          <button
            className="gd-btn gd-btn-primary"
            style={{ padding: '6px 14px', fontSize: '12.5px', display: 'flex', alignItems: 'center', gap: '6px' }}
            onClick={handleOpenAdd}
          >
            <PiPlusBold /> Add Guide
          </button>
        </div>
      </div>

      {notice && (
        <div style={{ padding: '10px 14px', borderRadius: 'var(--radius-sm)', background: 'var(--accent-cyan-soft)', border: '1px solid var(--accent-cyan)', color: 'var(--accent-cyan)', fontSize: '13px', marginBottom: '16px' }}>
          <PiCheckCircle style={{ verticalAlign: 'middle', marginRight: '6px' }} /> {notice}
        </div>
      )}

      {errorNotice && (
        <div style={{ padding: '10px 14px', borderRadius: 'var(--radius-sm)', background: 'rgba(255, 98, 89, 0.12)', border: '1px solid rgba(255, 98, 89, 0.3)', color: '#ff6259', fontSize: '13px', marginBottom: '16px' }}>
          <PiWarningCircle style={{ verticalAlign: 'middle', marginRight: '6px' }} /> {errorNotice}
        </div>
      )}

      {/* Batch Import Section collapsible */}
      {showImportModal && (
        <div style={{ marginBottom: '20px' }}>
          <FacultyImport onImportSuccess={loadGuides} />
        </div>
      )}

      {/* Search Bar */}
      <div className="gd-filter-bar" style={{ marginBottom: '18px' }}>
        <div className="gd-search-input" style={{ maxWidth: '360px' }}>
          <PiMagnifyingGlass style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search by Guide Name, Specialization, Email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <span className="sd-welcome-card__status-pill">
          {guides.length} Registered Faculty
        </span>
      </div>

      {/* Guides Table */}
      {loading ? (
        <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          Loading faculty guides from database...
        </div>
      ) : guides.length === 0 ? (
        <div className="gd-empty-state" style={{ padding: '36px 20px', textAlign: 'center' }}>
          <div className="gd-empty-state__icon" style={{ fontSize: '32px', marginBottom: '8px' }}>👨‍🏫</div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
            No faculty guides registered yet.
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
            Add new guides or import faculty via Excel file.
          </p>
        </div>
      ) : (
        <div className="cd-table-container">
          <table className="cd-table">
            <thead>
              <tr>
                <th>Faculty Name</th>
                <th>Email</th>
                <th>Department</th>
                <th>Specialization</th>
                <th>Assigned Teams</th>
                <th>Available Capacity</th>
                <th>Assigned Teams List</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredGuides.map((g) => {
                const assigned = g.assigned_count ?? (g.assigned_teams ? g.assigned_teams.length : 0);
                const capacity = 3;
                const available = Math.max(0, capacity - assigned);
                const isFull = available === 0;

                return (
                  <tr key={g.id}>
                    <td style={{ fontWeight: 600 }}>{g.full_name}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{g.email}</td>
                    <td>{g.department || '-'}</td>
                    <td style={{ color: 'var(--text-primary)' }}>{g.specialization || 'General'}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: assigned > 0 ? 'var(--accent-cyan)' : 'var(--text-muted)' }}>
                      Assigned: {assigned} / {capacity}
                    </td>
                    <td>
                      <span className={`sd-urgency-pill ${isFull ? 'sd-urgency-pill--approaching' : 'sd-doc-status-pill--approved'}`}>
                        {isFull ? 'FULL (0 Slots)' : `${available} Available`}
                      </span>
                    </td>
                    <td>
                      {g.assigned_teams && g.assigned_teams.length > 0 ? (
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                          {g.assigned_teams.map((t, idx) => (
                            <span
                              key={idx}
                              style={{
                                fontFamily: 'var(--font-mono)',
                                fontSize: '11px',
                                background: 'rgba(56, 189, 248, 0.12)',
                                color: 'var(--accent-cyan)',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                border: '1px solid rgba(56, 189, 248, 0.3)',
                              }}
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>None</span>
                      )}
                    </td>
                    <td>
                      <span className={`sd-doc-status-pill ${g.status === 'Active' ? 'sd-doc-status-pill--approved' : 'sd-urgency-pill--approaching'}`}>
                        {g.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          className="gd-btn gd-btn-outline"
                          style={{ padding: '3px 8px', fontSize: '11.5px' }}
                          onClick={() => handleOpenEdit(g)}
                          title="Edit Guide"
                        >
                          <PiPencilSimple /> Edit
                        </button>
                        <button
                          className="gd-btn gd-btn-outline"
                          style={{ padding: '3px 8px', fontSize: '11.5px', color: '#ff6259' }}
                          onClick={() => handleDelete(g)}
                          title="Delete Guide"
                        >
                          <PiTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="sd-modal-backdrop" onClick={() => setIsModalOpen(false)}>
            <motion.div
              className="sd-modal"
              style={{ maxWidth: 500 }}
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                  {editingGuide ? 'Edit Faculty Guide' : 'Add New Faculty Guide'}
                </h3>
                <button
                  type="button"
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: 20, cursor: 'pointer' }}
                  onClick={() => setIsModalOpen(false)}
                >
                  <PiX />
                </button>
              </div>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: 'var(--text-muted)' }}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    className="register-input"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    placeholder="Prof. / Dr. Full Name"
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: 'var(--text-muted)' }}>
                    Email Address *
                  </label>
                  <input
                    type="email"
                    className="register-input"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="faculty@gndec.edu.in"
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: 'var(--text-muted)' }}>
                      Department *
                    </label>
                    <input
                      type="text"
                      className="register-input"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: 'var(--text-muted)' }}>
                      Designation
                    </label>
                    <input
                      type="text"
                      className="register-input"
                      value={formData.designation}
                      onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                      placeholder="e.g. Associate Professor"
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: 'var(--text-muted)' }}>
                    Specialization / Research Domain
                  </label>
                  <input
                    type="text"
                    className="register-input"
                    value={formData.specialization}
                    onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                    placeholder="e.g. Artificial Intelligence, Cloud Computing"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: 'var(--text-muted)' }}>
                      Max Team Capacity
                    </label>
                    <input
                      type="number"
                      className="register-input"
                      value={3}
                      disabled
                      style={{ background: 'var(--bg-canvas)', opacity: 0.8 }}
                    />
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Strict PRMES Limit: 3 Teams</span>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: 'var(--text-muted)' }}>
                      Status
                    </label>
                    <select
                      className="register-input"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      style={{ background: 'var(--bg-surface)' }}
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                {!editingGuide && (
                  <div>
                    <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: 'var(--text-muted)' }}>
                      Password (Optional — Defaults to GuidePass123!)
                    </label>
                    <input
                      type="password"
                      className="register-input"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Leave blank for default password"
                    />
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '14px' }}>
                  <button
                    type="button"
                    className="gd-btn gd-btn-outline"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="gd-btn gd-btn-primary"
                    disabled={submitting}
                  >
                    {submitting ? 'Saving...' : editingGuide ? 'Update Guide' : 'Add Guide'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
