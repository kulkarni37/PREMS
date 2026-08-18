import { useState, useEffect } from 'react';
import { PiBuildings, PiPlusBold, PiPencilSimple, PiEyeBold, PiCheckCircle, PiXCircle } from 'react-icons/pi';
import { createAdminDepartment } from '../../services/api';

export default function DepartmentManagement({ user, departments: initialDepartments, onDepartmentAdded }) {
  const [departments, setDepartments] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newDeptName, setNewDeptName] = useState('');
  const [newDeptCode, setNewDeptCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (initialDepartments) {
      setDepartments(initialDepartments);
    }
  }, [initialDepartments]);

  const handleAddDept = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!newDeptName.trim() || !newDeptCode.trim()) return;

    try {
      setLoading(true);
      const res = await createAdminDepartment({
        department_name: newDeptName.trim(),
        department_code: newDeptCode.trim().toUpperCase(),
        email: user?.email
      });

      if (res && res.success) {
        if (res.department) {
          setDepartments((prev) => [...prev, res.department]);
        }
        setNewDeptName('');
        setNewDeptCode('');
        setShowAddModal(false);
        if (onDepartmentAdded) onDepartmentAdded();
      } else {
        setErrorMsg(res?.message || 'Failed to create department.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to create department on backend server.');
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = (id) => {
    setDepartments(departments.map((d) => (
      d.id === id ? { ...d, status: d.status === 'Active' ? 'Inactive' : 'Active' } : d
    )));
  };

  return (
    <div className="ad-card" id="departments">
      <div className="ad-card__head">
        <h2 className="ad-card__title">
          <PiBuildings className="ad-card__title-icon" /> Institutional Department Management
        </h2>
        <button
          className="gd-btn gd-btn-primary"
          style={{ padding: '6px 14px', fontSize: '12.5px' }}
          onClick={() => {
            setErrorMsg('');
            setShowAddModal(true);
          }}
        >
          <PiPlusBold /> Add Department
        </button>
      </div>

      {departments.length === 0 ? (
        <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px', fontFamily: 'var(--font-mono)' }}>
          🏢 No departments have been created yet.
        </div>
      ) : (
        <div className="cd-table-container">
          <table className="cd-table">
            <thead>
              <tr>
                <th>Dept Code</th>
                <th>Department Name</th>
                <th>Department Head</th>
                <th>Enrolled Students</th>
                <th>Faculty Guides</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {departments.map((d) => (
                <tr key={d.id || d.code}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                    {d.code}
                  </td>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{d.name}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{d.head || 'Department Admin'}</td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>{d.studentsCount ?? 0} Students</td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>{d.facultyCount ?? 0} Faculty</td>
                  <td>
                    <span className={`sd-doc-status-pill ${d.status === 'Active' ? 'sd-doc-status-pill--approved' : 'sd-urgency-pill--approaching'}`}>
                      {d.status || 'Active'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        className="gd-btn gd-btn-outline"
                        style={{ padding: '3px 8px', fontSize: '11.5px' }}
                        onClick={() => alert(`Viewing department ${d.name}`)}
                      >
                        <PiEyeBold /> View
                      </button>
                      <button
                        className="gd-btn gd-btn-outline"
                        style={{ padding: '3px 8px', fontSize: '11.5px' }}
                        onClick={() => {
                          const name = prompt('Edit Department Name:', d.name);
                          if (name) {
                            setDepartments(departments.map(item => item.id === d.id ? { ...item, name } : item));
                          }
                        }}
                      >
                        <PiPencilSimple /> Edit
                      </button>
                      <button
                        className="gd-btn gd-btn-outline"
                        style={{ padding: '3px 8px', fontSize: '11.5px', color: d.status === 'Active' ? '#ff6259' : '#2dd478' }}
                        onClick={() => toggleStatus(d.id)}
                      >
                        {d.status === 'Active' ? <PiXCircle /> : <PiCheckCircle />}
                        {d.status === 'Active' ? ' Deactivate' : ' Activate'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Department Modal */}
      {showAddModal && (
        <div className="sd-modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div className="sd-modal" style={{ maxWidth: 500 }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>
              Add New Academic Department
            </h3>

            {errorMsg && (
              <div style={{ padding: '10px 14px', borderRadius: '8px', background: 'rgba(255, 98, 89, 0.12)', border: '1px solid rgba(255, 98, 89, 0.3)', color: '#ff6259', fontSize: '13px', marginBottom: '14px' }}>
                ⚠️ {errorMsg}
              </div>
            )}

            <form onSubmit={handleAddDept} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  Department Name *
                </label>
                <input
                  type="text"
                  className="register-input"
                  placeholder="e.g. Computer Science & Engineering"
                  value={newDeptName}
                  onChange={(e) => setNewDeptName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  Department Code *
                </label>
                <input
                  type="text"
                  className="register-input"
                  placeholder="e.g. CSE"
                  value={newDeptCode}
                  onChange={(e) => setNewDeptCode(e.target.value)}
                  required
                />
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button type="button" className="gd-btn gd-btn-outline" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="gd-btn gd-btn-primary" disabled={loading}>
                  {loading ? 'Creating...' : 'Create Department'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
