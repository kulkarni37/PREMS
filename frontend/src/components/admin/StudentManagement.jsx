import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PiGraduationCap,
  PiMagnifyingGlass,
  PiPlusBold,
  PiPencilSimple,
  PiTrash,
  PiFileCsv,
  PiX,
  PiCheckCircle,
  PiWarningCircle,
} from 'react-icons/pi';
import {
  fetchAdminStudents,
  createAdminStudent,
  updateAdminStudent,
  deleteAdminStudent,
  getAdminExportCsvUrl,
} from '../../services/api';

export default function StudentManagement() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [notice, setNotice] = useState('');
  const [errorNotice, setErrorNotice] = useState('');

  // Add/Edit Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [formData, setFormData] = useState({
    full_name: '',
    usn: '',
    email: '',
    department: 'Computer Science & Engineering',
    semester: '7',
    section: 'A',
    password: '',
    status: 'Active',
  });
  const [submitting, setSubmitting] = useState(false);

  const loadStudents = async () => {
    try {
      setLoading(true);
      setErrorNotice('');
      const res = await fetchAdminStudents();
      if (res && res.success) {
        setStudents(res.students || []);
      }
    } catch (err) {
      setErrorNotice(err?.message || 'Failed to load students.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  const departments = ['All', ...new Set(students.map((s) => s.department).filter(Boolean))];

  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      (s.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.usn || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.team_id || '').toLowerCase().includes(searchTerm.toLowerCase());

    if (deptFilter === 'All') return matchesSearch;
    return matchesSearch && s.department === deptFilter;
  });

  const handleOpenAdd = () => {
    setEditingStudent(null);
    setFormData({
      full_name: '',
      usn: '',
      email: '',
      department: 'Computer Science & Engineering',
      semester: '7',
      section: 'A',
      password: '',
      status: 'Active',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (student) => {
    setEditingStudent(student);
    setFormData({
      full_name: student.full_name || '',
      usn: student.usn || '',
      email: student.email || '',
      department: student.department || 'Computer Science & Engineering',
      semester: student.semester || '7',
      section: student.section || 'A',
      password: '',
      status: student.status || 'Active',
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (student) => {
    if (!window.confirm(`Are you sure you want to delete student ${student.full_name} (${student.usn})? This action cannot be undone.`)) {
      return;
    }
    try {
      setErrorNotice('');
      const res = await deleteAdminStudent(student.id);
      if (res && res.success) {
        setNotice(`Student ${student.full_name} deleted successfully.`);
        loadStudents();
      } else {
        setErrorNotice(res?.message || 'Failed to delete student.');
      }
    } catch (err) {
      setErrorNotice(err?.message || 'Failed to delete student.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorNotice('');
    try {
      if (editingStudent) {
        const res = await updateAdminStudent(editingStudent.id, formData);
        if (res && res.success) {
          setNotice(`Student ${formData.full_name} updated successfully.`);
          setIsModalOpen(false);
          loadStudents();
        } else {
          setErrorNotice(res?.message || 'Failed to update student.');
        }
      } else {
        const res = await createAdminStudent(formData);
        if (res && res.success) {
          setNotice(`Student ${formData.full_name} added successfully.`);
          setIsModalOpen(false);
          loadStudents();
        } else {
          setErrorNotice(res?.message || 'Failed to add student.');
        }
      }
    } catch (err) {
      setErrorNotice(err?.message || 'Operation failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="ad-card" id="students">
      {/* Head */}
      <div className="ad-card__head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <h2 className="ad-card__title" style={{ margin: 0 }}>
          <PiGraduationCap className="ad-card__title-icon" /> Student Management
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <a
            href={getAdminExportCsvUrl('students')}
            target="_blank"
            rel="noopener noreferrer"
            className="gd-btn gd-btn-outline"
            style={{ padding: '6px 14px', fontSize: '12.5px', display: 'flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}
          >
            <PiFileCsv /> Export CSV
          </a>
          <button
            className="gd-btn gd-btn-primary"
            style={{ padding: '6px 14px', fontSize: '12.5px', display: 'flex', alignItems: 'center', gap: '6px' }}
            onClick={handleOpenAdd}
          >
            <PiPlusBold /> Add Student
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

      {/* Filter and Search Bar */}
      <div className="gd-filter-bar" style={{ marginBottom: '18px' }}>
        <div className="gd-search-input" style={{ maxWidth: '340px' }}>
          <PiMagnifyingGlass style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search by Name, USN, Email, or Team..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Dept:</label>
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            style={{ padding: '6px 12px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-canvas)', border: '1px solid var(--border-hairline)', color: 'var(--text-primary)', fontSize: '12.5px' }}
          >
            {departments.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Students Table */}
      {loading ? (
        <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          Loading students from database...
        </div>
      ) : students.length === 0 ? (
        <div className="gd-empty-state" style={{ padding: '36px 20px', textAlign: 'center' }}>
          <div className="gd-empty-state__icon" style={{ fontSize: '32px', marginBottom: '8px' }}>🎓</div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
            No registered students found.
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
            Add new students manually or through batch registration.
          </p>
        </div>
      ) : filteredStudents.length === 0 ? (
        <div style={{ padding: '32px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13.5px' }}>
          No students matching "{searchTerm}" found.
        </div>
      ) : (
        <div className="cd-table-container">
          <table className="cd-table">
            <thead>
              <tr>
                <th>Student ID</th>
                <th>Full Name</th>
                <th>USN</th>
                <th>Email</th>
                <th>Department</th>
                <th>Team ID</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((s) => (
                <tr key={s.id}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                    {s.student_id || `STU-${s.id}`}
                  </td>
                  <td style={{ fontWeight: 600 }}>{s.full_name}</td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>{s.usn || '-'}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{s.email}</td>
                  <td>{s.department || '-'}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', color: s.team_id ? 'var(--accent-cyan)' : 'var(--accent-amber)' }}>
                    {s.team_id || 'Not Assigned'}
                  </td>
                  <td>
                    <span className="sd-welcome-card__status-pill" style={{ fontSize: '11px', padding: '2px 8px' }}>
                      {s.role || 'STUDENT'}
                    </span>
                  </td>
                  <td>
                    <span className={`sd-doc-status-pill ${s.status === 'Active' ? 'sd-doc-status-pill--approved' : 'sd-urgency-pill--approaching'}`}>
                      {s.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        className="gd-btn gd-btn-outline"
                        style={{ padding: '3px 8px', fontSize: '11.5px' }}
                        onClick={() => handleOpenEdit(s)}
                        title="Edit Student"
                      >
                        <PiPencilSimple /> Edit
                      </button>
                      <button
                        className="gd-btn gd-btn-outline"
                        style={{ padding: '3px 8px', fontSize: '11.5px', color: '#ff6259' }}
                        onClick={() => handleDelete(s)}
                        title="Delete Student"
                      >
                        <PiTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
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
                  {editingStudent ? 'Edit Student Details' : 'Add New Student'}
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
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: 'var(--text-muted)' }}>
                      USN *
                    </label>
                    <input
                      type="text"
                      className="register-input"
                      value={formData.usn}
                      onChange={(e) => setFormData({ ...formData, usn: e.target.value })}
                      placeholder="e.g. 3GN23CS083"
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
                      placeholder="student@gndec.edu.in"
                      required
                    />
                  </div>
                </div>

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

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: 'var(--text-muted)' }}>
                      Semester
                    </label>
                    <input
                      type="text"
                      className="register-input"
                      value={formData.semester}
                      onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: 'var(--text-muted)' }}>
                      Section
                    </label>
                    <input
                      type="text"
                      className="register-input"
                      value={formData.section}
                      onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                    />
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

                {!editingStudent && (
                  <div>
                    <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: 'var(--text-muted)' }}>
                      Initial Password (Optional — Defaults to USN)
                    </label>
                    <input
                      type="password"
                      className="register-input"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Leave blank to use USN"
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
                    {submitting ? 'Saving...' : editingStudent ? 'Update Student' : 'Add Student'}
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
