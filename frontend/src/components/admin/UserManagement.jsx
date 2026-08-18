import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PiUsers, PiMagnifyingGlass, PiCheckCircle, PiXCircle, PiEyeBold, PiX } from 'react-icons/pi';
import { fetchAdminUsers, updateAdminUserStatus } from '../../services/api';

export default function UserManagement({ adminUser }) {
  const [activeRoleTab, setActiveRoleTab] = useState('Students');
  const [searchTerm, setSearchTerm] = useState('');
  const [usersList, setUsersList] = useState([]);
  const [totalSystemUsers, setTotalSystemUsers] = useState(0);
  const [counts, setCounts] = useState({
    Students: 0,
    Faculty: 0,
    Coordinators: 0,
    Administrators: 0
  });

  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [statusUpdatingId, setStatusUpdatingId] = useState(null);

  const TABS = ['Students', 'Faculty', 'Coordinators', 'Administrators'];

  const loadUsers = async () => {
    try {
      setLoading(true);
      const email = adminUser?.email || adminUser?.student_id;
      const res = await fetchAdminUsers(email, activeRoleTab, searchTerm);
      if (res && res.success) {
        setUsersList(res.users || []);
        if (typeof res.total_users === 'number') setTotalSystemUsers(res.total_users);
        if (res.counts) setCounts(res.counts);
      }
    } catch (err) {
      console.error('Failed to load admin users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [activeRoleTab, searchTerm, adminUser]);

  const handleToggleStatus = async (user) => {
    const newStatus = user.status === 'Active' ? 'Inactive' : 'Active';
    try {
      setStatusUpdatingId(user.user_db_id);
      const email = adminUser?.email || adminUser?.student_id;
      const res = await updateAdminUserStatus(user.user_db_id, newStatus, email);
      if (res && res.success) {
        setUsersList((prev) =>
          prev.map((u) => (u.user_db_id === user.user_db_id ? { ...u, status: newStatus } : u))
        );
      } else {
        alert(res?.message || 'Failed to update user status.');
      }
    } catch (err) {
      alert(err.message || 'Failed to update user status.');
    } finally {
      setStatusUpdatingId(null);
    }
  };

  return (
    <div className="ad-card" id="users">
      {/* Header */}
      <div className="ad-card__head">
        <h2 className="ad-card__title">
          <PiUsers className="ad-card__title-icon" /> User Account Management
        </h2>
        <span className="sd-welcome-card__status-pill">
          {totalSystemUsers} Total System Users
        </span>
      </div>

      {/* Role Tabs */}
      <div className="gd-filter-pills" style={{ marginBottom: '18px' }}>
        {TABS.map((tab) => (
          <button
            key={tab}
            className={`gd-filter-pill ${activeRoleTab === tab ? 'gd-filter-pill--active' : ''}`}
            onClick={() => setActiveRoleTab(tab)}
          >
            {tab} ({counts[tab] ?? 0})
          </button>
        ))}
      </div>

      {/* Search Input */}
      <div className="gd-search-input" style={{ marginBottom: '18px', maxWidth: 360 }}>
        <PiMagnifyingGlass style={{ color: 'var(--text-muted)' }} />
        <input
          type="text"
          placeholder={`Search ${activeRoleTab}...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Table Display */}
      {loading ? (
        <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px', fontFamily: 'var(--font-mono)' }}>
          Loading user records...
        </div>
      ) : usersList.length === 0 ? (
        <div style={{ padding: '36px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px', fontFamily: 'var(--font-mono)' }}>
          👥 No users registered yet.
        </div>
      ) : (
        <div className="cd-table-container">
          <table className="cd-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                {activeRoleTab === 'Faculty' && <th>Designation</th>}
                {activeRoleTab === 'Faculty' && <th>Specialization</th>}
                {activeRoleTab === 'Students' && <th>Team ID</th>}
                <th>Department</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {usersList.map((u) => (
                <tr key={u.user_db_id || u.id}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                    {u.id}
                  </td>
                  <td style={{ fontWeight: 600 }}>{u.name}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{u.email}</td>
                  {activeRoleTab === 'Faculty' && <td>{u.desig}</td>}
                  {activeRoleTab === 'Faculty' && <td>{u.spec}</td>}
                  {activeRoleTab === 'Students' && (
                    <td style={{ fontFamily: 'var(--font-mono)', color: u.team === 'Not Assigned' ? 'var(--accent-amber)' : 'var(--text-primary)' }}>
                      {u.team}
                    </td>
                  )}
                  <td>{u.dept}</td>
                  <td>
                    <span className={`sd-doc-status-pill ${u.status === 'Active' ? 'sd-doc-status-pill--approved' : 'sd-urgency-pill--approaching'}`}>
                      {u.status} {u.status === 'Active' ? '✓' : ''}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        className="gd-btn gd-btn-outline"
                        style={{ padding: '3px 8px', fontSize: '11.5px' }}
                        onClick={() => setSelectedUser(u)}
                      >
                        <PiEyeBold /> View
                      </button>
                      <button
                        className="gd-btn gd-btn-outline"
                        style={{
                          padding: '3px 8px',
                          fontSize: '11.5px',
                          color: u.status === 'Active' ? '#ff6259' : '#2dd478'
                        }}
                        disabled={statusUpdatingId === u.user_db_id}
                        onClick={() => handleToggleStatus(u)}
                      >
                        {u.status === 'Active' ? <PiXCircle /> : <PiCheckCircle />}
                        {statusUpdatingId === u.user_db_id ? ' Updating...' : u.status === 'Active' ? ' Deactivate' : ' Activate'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* User Details Modal */}
      <AnimatePresence>
        {selectedUser && (
          <div className="sd-modal-backdrop" onClick={() => setSelectedUser(null)}>
            <motion.div
              className="sd-modal"
              style={{ maxWidth: 540 }}
              initial={{ opacity: 0, scale: 0.94, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '19px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                  User Account Details
                </h3>
                <button
                  type="button"
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: 20, cursor: 'pointer' }}
                  onClick={() => setSelectedUser(null)}
                >
                  <PiX />
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 18px', fontSize: '13.5px', background: 'var(--bg-surface)', padding: '18px', borderRadius: '10px', border: '1px solid var(--border-hairline)' }}>
                <div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10.5px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Full Name</div>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{selectedUser.name}</div>
                </div>

                <div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10.5px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>User ID / Student ID</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--accent-cyan)' }}>{selectedUser.id}</div>
                </div>

                <div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10.5px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>USN</div>
                  <div style={{ fontFamily: 'var(--font-mono)' }}>{selectedUser.usn}</div>
                </div>

                <div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10.5px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Email Address</div>
                  <div>{selectedUser.email}</div>
                </div>

                <div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10.5px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Phone Number</div>
                  <div>{selectedUser.phone}</div>
                </div>

                <div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10.5px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Role</div>
                  <div style={{ fontWeight: 600, color: 'var(--accent-cyan)' }}>{selectedUser.role}</div>
                </div>

                <div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10.5px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Organization</div>
                  <div>{selectedUser.college}</div>
                </div>

                <div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10.5px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Department</div>
                  <div>{selectedUser.dept}</div>
                </div>

                <div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10.5px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Semester / Section</div>
                  <div>{selectedUser.semester} ({selectedUser.section})</div>
                </div>

                <div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10.5px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Assigned Project Team</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: selectedUser.team === 'Not Assigned' ? 'var(--accent-amber)' : 'var(--accent-cyan)' }}>
                    {selectedUser.team}
                  </div>
                </div>

                <div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10.5px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Account Status</div>
                  <div style={{ color: selectedUser.status === 'Active' ? '#2dd478' : '#ff6259', fontWeight: 600 }}>
                    {selectedUser.status}
                  </div>
                </div>

                <div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10.5px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Created Date</div>
                  <div>{selectedUser.date}</div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '18px' }}>
                <button
                  type="button"
                  className="gd-btn gd-btn-outline"
                  onClick={() => setSelectedUser(null)}
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
