import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PiChalkboardTeacher, PiNotePencil, PiX, PiCheckCircle } from 'react-icons/pi';
import { fetchAdminGuidesWorkload, updateAdminGuideRules } from '../../services/api';

export default function GuideAllocationManagement({ adminUser }) {
  const [guidesList, setGuidesList] = useState([]);
  const [stats, setStats] = useState({
    total_faculty: 0,
    available_faculty: 0,
    full_capacity: 0,
    assigned_teams: 0,
    pending_allocation: 0
  });

  const [loading, setLoading] = useState(false);
  const [selectedGuide, setSelectedGuide] = useState(null);
  const [editCap, setEditCap] = useState(5);
  const [editSpec, setEditSpec] = useState('');
  const [editStatus, setEditStatus] = useState('Active');
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState('');

  const loadWorkloadData = async () => {
    try {
      setLoading(true);
      const email = adminUser?.email || adminUser?.student_id;
      const res = await fetchAdminGuidesWorkload(email);
      if (res && res.success) {
        setGuidesList(res.guides || []);
        if (res.stats) setStats(res.stats);
      }
    } catch (err) {
      console.error('Failed to load guide workload:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkloadData();
  }, [adminUser]);

  const handleOpenRules = (g) => {
    setSelectedGuide(g);
    setEditCap(g.maxCapacity || 5);
    setEditSpec(g.specialization === 'Not Specified' ? '' : g.specialization);
    setEditStatus(g.account_status || 'Active');
    setModalError('');
  };

  const handleSaveRules = async (e) => {
    e.preventDefault();
    if (!selectedGuide) return;
    setModalError('');

    try {
      setModalLoading(true);
      const email = adminUser?.email || adminUser?.student_id;
      const res = await updateAdminGuideRules(selectedGuide.id, {
        max_team_capacity: editCap,
        specialization: editSpec.trim() || 'Not Specified',
        status: editStatus,
        email
      });

      if (res && res.success) {
        loadWorkloadData();
        setSelectedGuide(null);
      } else {
        setModalError(res?.message || 'Failed to save allocation rules.');
      }
    } catch (err) {
      setModalError(err.message || 'Failed to update allocation rules on backend server.');
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <div className="ad-card" id="guides">
      {/* Head */}
      <div className="ad-card__head">
        <h2 className="ad-card__title">
          <PiChalkboardTeacher className="ad-card__title-icon" /> Faculty Guide Workload &amp; Allocation Rules Control
        </h2>
        <span className="sd-welcome-card__status-pill">
          {stats.pending_allocation ?? 0} Teams Pending Automatic Allocation
        </span>
      </div>

      {/* Metric Cards Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px', marginBottom: '20px' }}>
        <div style={{ padding: '12px 14px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-surface)', border: '1px solid var(--border-hairline)', textAlign: 'center' }}>
          <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>Total Faculty</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700, marginTop: '2px' }}>
            {stats.total_faculty ?? 0} Faculty
          </div>
        </div>
        <div style={{ padding: '12px 14px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-surface)', border: '1px solid var(--border-hairline)', textAlign: 'center' }}>
          <div style={{ fontSize: '10.5px', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>Available Faculty</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700, color: 'var(--accent-cyan)', marginTop: '2px' }}>
            {stats.available_faculty ?? 0} Faculty
          </div>
        </div>
        <div style={{ padding: '12px 14px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-surface)', border: '1px solid var(--border-hairline)', textAlign: 'center' }}>
          <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>Full Capacity</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700, marginTop: '2px' }}>
            {stats.full_capacity ?? 0} Faculty
          </div>
        </div>
        <div style={{ padding: '12px 14px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-surface)', border: '1px solid var(--border-hairline)', textAlign: 'center' }}>
          <div style={{ fontSize: '10.5px', color: '#2dd478', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>Assigned Teams</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700, color: '#2dd478', marginTop: '2px' }}>
            {stats.assigned_teams ?? 0} Teams
          </div>
        </div>
        <div style={{ padding: '12px 14px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-surface)', border: '1px solid var(--accent-amber)', textAlign: 'center' }}>
          <div style={{ fontSize: '10.5px', color: 'var(--accent-amber)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>Pending Allocation</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700, color: 'var(--accent-amber)', marginTop: '2px' }}>
            {stats.pending_allocation ?? 0} Teams
          </div>
        </div>
      </div>

      {/* Workload Table */}
      {loading ? (
        <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px', fontFamily: 'var(--font-mono)' }}>
          Loading faculty workload records...
        </div>
      ) : guidesList.length === 0 ? (
        <div style={{ padding: '36px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px', fontFamily: 'var(--font-mono)' }}>
          👨‍🏫 No faculty guides registered yet.
        </div>
      ) : (
        <div className="cd-table-container">
          <table className="cd-table">
            <thead>
              <tr>
                <th>Faculty Name</th>
                <th>Specialization</th>
                <th>Current Workload</th>
                <th>Max Team Capacity</th>
                <th>Available Slots</th>
                <th>Allocation Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {guidesList.map((g) => {
                const slots = g.availableSlots ?? Math.max(0, g.maxCapacity - g.currentTeams);
                return (
                  <tr key={g.id || g.guide_id}>
                    <td style={{ fontWeight: 600 }}>{g.name}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{g.specialization}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                      {g.currentTeams} Teams
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>{g.maxCapacity} Teams</td>
                    <td style={{ fontFamily: 'var(--font-mono)', color: slots > 0 ? '#2dd478' : 'var(--text-muted)' }}>
                      {slots} Slots
                    </td>
                    <td>
                      <span className={`sd-urgency-pill ${g.status === 'FULL CAPACITY' ? 'sd-urgency-pill--approaching' : g.status === 'INACTIVE' ? 'sd-urgency-pill--approaching' : 'sd-doc-status-pill--approved'}`}>
                        {g.status}
                      </span>
                    </td>
                    <td>
                      <button
                        className="gd-btn gd-btn-outline"
                        style={{ padding: '4px 10px', fontSize: '12px' }}
                        onClick={() => handleOpenRules(g)}
                      >
                        <PiNotePencil /> Rules
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Rules Modal */}
      <AnimatePresence>
        {selectedGuide && (
          <div className="sd-modal-backdrop" onClick={() => setSelectedGuide(null)}>
            <motion.div
              className="sd-modal"
              style={{ maxWidth: 480 }}
              initial={{ opacity: 0, scale: 0.94, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700, margin: 0 }}>
                  Guide Allocation Rules Configuration
                </h3>
                <button
                  type="button"
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: 20, cursor: 'pointer' }}
                  onClick={() => setSelectedGuide(null)}
                >
                  <PiX />
                </button>
              </div>

              <div style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                Configure maximum workload capacity and domain specialization rules for <strong>{selectedGuide.name}</strong>.
              </div>

              {modalError && (
                <div style={{ padding: '10px 14px', borderRadius: '8px', background: 'rgba(255, 98, 89, 0.12)', border: '1px solid rgba(255, 98, 89, 0.3)', color: '#ff6259', fontSize: '13px', marginBottom: '14px' }}>
                  ⚠️ {modalError}
                </div>
              )}

              <form onSubmit={handleSaveRules} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                    Maximum Team Capacity (Teams)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="15"
                    className="register-input"
                    value={editCap}
                    onChange={(e) => setEditCap(parseInt(e.target.value) || 1)}
                    required
                  />
                  <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Current workload: {selectedGuide.currentTeams} assigned teams.
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                    Specialization / Domain Expertise
                  </label>
                  <input
                    type="text"
                    className="register-input"
                    placeholder="e.g. Artificial Intelligence & Machine Learning"
                    value={editSpec}
                    onChange={(e) => setEditSpec(e.target.value)}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                    Allocation Availability Status
                  </label>
                  <select
                    className="register-input"
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', background: 'var(--bg-surface)', color: 'var(--text-primary)', border: '1px solid var(--border-hairline)' }}
                  >
                    <option value="Active">Active (Eligible for Allocation)</option>
                    <option value="Inactive">Inactive (Disable Automatic Allocation)</option>
                  </select>
                </div>

                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '12px' }}>
                  <button type="button" className="gd-btn gd-btn-outline" onClick={() => setSelectedGuide(null)}>
                    Cancel
                  </button>
                  <button type="submit" className="gd-btn gd-btn-primary" disabled={modalLoading}>
                    {modalLoading ? 'Saving Rules...' : 'Save Rules'}
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
