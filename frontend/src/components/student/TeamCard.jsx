import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PiUsersThree, PiPlusBold, PiCrownBold, PiTrash, PiX, PiUserPlus, PiLockKey, PiWarningCircle, PiPencilSimple, PiMagnifyingGlass, PiCheckCircle } from 'react-icons/pi';
import { removeTeamMember, addTeamMember, fetchEligibleMembers } from '../../services/api';
import EditTeamModal from './EditTeamModal';

export default function TeamCard({ team, user, onOpenRegisterTeam, onTeamUpdated }) {
  const [memberToRemove, setMemberToRemove] = useState(null);
  const [isRemoving, setIsRemoving] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  
  // Search & add eligible members state
  const [searchQuery, setSearchQuery] = useState('');
  const [eligibleStudents, setEligibleStudents] = useState([]);
  const [searching, setSearching] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  
  const [noticeMsg, setNoticeMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Bug Fix #9: Deduplicate members by user_id
  const rawMembers = team?.members || [];
  const uniqueMembers = [];
  const seenUserIds = new Set();

  for (const m of rawMembers) {
    const uid = m.user_id || m.student?.id || m.id;
    if (uid && !seenUserIds.has(uid)) {
      seenUserIds.add(uid);
      uniqueMembers.push(m);
    }
  }

  const leaderId = team?.leader_id;

  // Check if authenticated user is the Team Leader
  const isTeamLeader = user && (user.id === leaderId || user.email === team?.leader_email || uniqueMembers.some(m => (m.user_id === user.id || m.student?.email === user.email) && m.role_in_team === 'LEADER'));

  // Stage restriction: lock changes after guide allocation
  const isLockedAfterGuide = Boolean(team?.guide_id);

  // Search eligible students when search modal opens or query changes
  useEffect(() => {
    if (showAddModal) {
      const search = async () => {
        setSearching(true);
        const leaderIdentifier = user?.email || user?.student_id || user?.usn;
        const res = await fetchEligibleMembers(leaderIdentifier, searchQuery);
        if (res && res.success) {
          // Exclude students already in team
          const filtered = (res.students || []).filter(s => !seenUserIds.has(s.id));
          setEligibleStudents(filtered);
        }
        setSearching(false);
      };
      const timer = setTimeout(search, 300);
      return () => clearTimeout(timer);
    }
  }, [showAddModal, searchQuery, user]);

  if (!team) {
    return (
      <div className="sd-card" id="team">
        <div className="sd-card__head">
          <h2 className="sd-card__title">
            <PiUsersThree className="sd-card__title-icon" /> My Project Team
          </h2>
          <span className="sd-doc-status-pill sd-doc-status-pill--pending">
            Not Registered (0 / 4)
          </span>
        </div>

        <div className="sd-empty-state">
          <div className="sd-empty-state__icon">
            <PiUsersThree />
          </div>
          <h3 className="sd-empty-state__title">Your project team has not been registered.</h3>
          <p className="sd-empty-state__sub">
            Every team must have EXACTLY 4 registered students (1 Team Leader + 3 Team Members).
          </p>
          <motion.button
            className="sd-btn sd-btn-primary"
            onClick={onOpenRegisterTeam}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <PiPlusBold /> Register Team (4 Members)
          </motion.button>
        </div>
      </div>
    );
  }

  const handleConfirmRemove = async () => {
    if (!memberToRemove) return;
    setNoticeMsg('');
    setErrorMsg('');

    const targetUserId = memberToRemove.user_id || memberToRemove.student?.id || memberToRemove.id;
    const leaderIdentifier = user?.email || user?.student_id || user?.usn;

    try {
      setIsRemoving(true);
      const res = await removeTeamMember(leaderIdentifier, targetUserId);
      if (res && res.success) {
        setNoticeMsg(res.message || 'Team member removed successfully.');
        if (onTeamUpdated) onTeamUpdated(res.team);
      } else {
        setErrorMsg(res?.message || 'Failed to remove team member.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to remove team member.');
    } finally {
      setIsRemoving(false);
      setMemberToRemove(null);
    }
  };

  const handleAddSelectedMember = async (student) => {
    setNoticeMsg('');
    setErrorMsg('');

    if (uniqueMembers.length >= 4) {
      setErrorMsg('Team is already full. Maximum 4 members allowed.');
      return;
    }

    try {
      setIsAdding(true);
      const leaderIdentifier = user?.email || user?.student_id || user?.usn;
      const res = await addTeamMember(leaderIdentifier, student.email || student.usn || student.student_id);
      if (res && res.success) {
        setNoticeMsg(res.message || `Student ${student.full_name} added to team!`);
        setShowAddModal(false);
        if (onTeamUpdated) onTeamUpdated(res.team);
      } else {
        setErrorMsg(res?.message || 'Failed to add student to team.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to add member.');
    } finally {
      setIsAdding(false);
    }
  };

  const currentCount = uniqueMembers.length;
  const isFull = currentCount === 4;

  return (
    <div className="sd-card" id="team">
      {/* Header with Members: X / 4 & Action Buttons (Item 1) */}
      <div className="sd-card__head">
        <h2 className="sd-card__title">
          <PiUsersThree className="sd-card__title-icon" /> My Project Team
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <span className={`sd-doc-status-pill ${isFull ? 'sd-doc-status-pill--approved' : 'sd-urgency-pill--approaching'}`}>
            Members: {currentCount} / 4
          </span>

          {/* + Add Member Button visible whenever count < 4 and not locked (Item 1) */}
          {!isFull && !isLockedAfterGuide && (
            <button
              className="sd-btn sd-btn-primary"
              style={{ padding: '6px 14px', fontSize: '12px' }}
              onClick={() => setShowAddModal(true)}
            >
              <PiPlusBold /> + Add Member
            </button>
          )}
        </div>
      </div>

      {noticeMsg && (
        <div style={{ padding: '10px 14px', borderRadius: 'var(--radius-sm)', background: 'var(--accent-cyan-soft)', border: '1px solid var(--accent-cyan)', color: 'var(--accent-cyan)', fontSize: '13px', marginBottom: '14px' }}>
          ℹ️ {noticeMsg}
        </div>
      )}

      {errorMsg && (
        <div style={{ padding: '10px 14px', borderRadius: 'var(--radius-sm)', background: 'rgba(255, 98, 89, 0.12)', border: '1px solid rgba(255, 98, 89, 0.3)', color: '#ff6259', fontSize: '13px', marginBottom: '14px' }}>
          ⚠️ {errorMsg}
        </div>
      )}

      {isLockedAfterGuide && (
        <div style={{ padding: '10px 14px', borderRadius: 'var(--radius-sm)', background: 'rgba(255, 98, 89, 0.1)', border: '1px solid rgba(255, 98, 89, 0.3)', color: '#ff6259', fontSize: '12.5px', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <PiLockKey style={{ fontSize: 16, flexShrink: 0 }} />
          <span>Team changes are locked after guide allocation. Contact the Coordinator for any required changes.</span>
        </div>
      )}

      {!isFull && (
        <div style={{ padding: '10px 14px', borderRadius: 'var(--radius-sm)', background: 'var(--accent-amber-soft)', border: '1px solid var(--accent-amber)', color: 'var(--accent-amber)', fontSize: '12.5px', marginBottom: '14px' }}>
          ⚠️ Your team currently has {currentCount} / 4 members. Your team needs {4 - currentCount} more member(s).
        </div>
      )}

      {/* Team Details Summary */}
      <div style={{ marginBottom: '18px', padding: '12px 16px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-hairline)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
          <div>
            <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Team ID</span>
            <div style={{ fontWeight: 700, fontSize: '14.5px', color: 'var(--accent-cyan)', marginTop: '2px' }}>{team.team_id}</div>
          </div>
          <div>
            <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Project Title</span>
            <div style={{ fontWeight: 600, fontSize: '13.5px', color: 'var(--text-primary)', marginTop: '2px' }}>{team.title}</div>
          </div>
          <div>
            <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Project Domain</span>
            <div style={{ fontWeight: 600, fontSize: '13.5px', color: 'var(--accent-cyan)', marginTop: '2px' }}>{team.domain || 'Not Selected Yet'}</div>
          </div>
        </div>
      </div>

      {/* Member Cards List (Items 2, 3, 6, 11) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {uniqueMembers.map((m, idx) => {
          const student = m.student || m;
          const isLeader = m.role_in_team === 'LEADER' || m.user_id === leaderId || m.isLeader;
          const showRemoveBtn = isTeamLeader && !isLeader && !isLockedAfterGuide;

          return (
            <div
              key={idx}
              style={{
                padding: '14px 16px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-surface)',
                border: isLeader ? '1px solid var(--border-hairline-strong)' : '1px solid var(--border-hairline)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: '240px' }}>
                <div className="sd-avatar" style={{ width: 42, height: 42, fontSize: 16 }}>
                  {student.full_name ? student.full_name.charAt(0) : 'S'}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: 700, fontSize: '14.5px', color: 'var(--text-primary)' }}>
                      {student.full_name || student.name || 'Team Student'}
                    </span>
                    <span className={`sd-role-badge ${isLeader ? 'sd-role-badge--leader' : 'sd-role-badge--member'}`}>
                      {isLeader ? 'TEAM LEADER' : 'TEAM MEMBER'}
                    </span>
                  </div>

                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '3px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <span>USN: <strong>{student.usn || '3GN22CS045'}</strong></span>
                    <span>• {student.email || 'student@gndec.edu.in'}</span>
                  </div>

                  <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)', marginTop: '3px' }}>
                    Dept: <strong>{student.department || 'CSE'}</strong> • Sem: <strong>{student.semester || '7th'}</strong> • Sec: <strong>{student.section || 'A'}</strong>
                  </div>
                </div>
              </div>

              {/* Member Card Action Buttons (Items 2, 3, 6) */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {/* Edit Button for Leader or Member */}
                <button
                  className="sd-btn sd-btn-outline"
                  style={{ padding: '4px 10px', fontSize: '11.5px' }}
                  onClick={() => setShowEditModal(true)}
                  title="Edit Team Details"
                >
                  <PiPencilSimple /> Edit
                </button>

                {/* Remove Button strictly for normal Team Members (Item 2 & 3) */}
                {showRemoveBtn && (
                  <button
                    className="sd-btn sd-btn-outline"
                    style={{ padding: '4px 10px', fontSize: '11.5px', color: '#ff6259', borderColor: 'rgba(255, 98, 89, 0.4)' }}
                    onClick={() => setMemberToRemove(m)}
                    title="Remove Member from Team"
                  >
                    <PiTrash /> Remove
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Confirmation Modal for Member Removal (Item 5) */}
      <AnimatePresence>
        {memberToRemove && (
          <div className="sd-modal-backdrop" onClick={() => setMemberToRemove(null)}>
            <motion.div
              className="sd-modal"
              style={{ maxWidth: 480 }}
              initial={{ opacity: 0, scale: 0.92, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 16 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button className="sd-modal__close" onClick={() => setMemberToRemove(null)}>
                <PiX />
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                <PiWarningCircle style={{ color: '#ff6259', fontSize: '26px' }} />
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 700, margin: 0 }}>
                  Remove Team Member?
                </h3>
              </div>

              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '20px' }}>
                Are you sure you want to remove <strong>{(memberToRemove.student || memberToRemove).full_name || (memberToRemove.student || memberToRemove).name}</strong> from this project team?
              </p>

              <div style={{ padding: '12px 14px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-surface)', border: '1px solid var(--border-hairline)', fontSize: '12.5px', color: 'var(--text-muted)', marginBottom: '22px' }}>
                ℹ️ The student&apos;s PRMES account will NOT be deleted. They will become available to join another project team.
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  className="sd-btn sd-btn-outline"
                  style={{ flex: 1 }}
                  onClick={() => setMemberToRemove(null)}
                  disabled={isRemoving}
                >
                  Cancel
                </button>
                <button
                  className="sd-btn"
                  style={{ flex: 1, background: '#ff6259', color: '#fff', border: 'none' }}
                  onClick={handleConfirmRemove}
                  disabled={isRemoving}
                >
                  {isRemoving ? 'Removing...' : 'Remove Member'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Team Member Modal with Eligible Student Search (Item 4 & 8) */}
      <AnimatePresence>
        {showAddModal && (
          <div className="sd-modal-backdrop" onClick={() => setShowAddModal(false)}>
            <motion.div
              className="sd-modal"
              style={{ maxWidth: 540 }}
              initial={{ opacity: 0, scale: 0.92, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 16 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button className="sd-modal__close" onClick={() => setShowAddModal(false)}>
                <PiX />
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                <PiUserPlus style={{ color: 'var(--accent-cyan)', fontSize: '24px' }} />
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 700, margin: 0 }}>
                  Add Team Member
                </h3>
              </div>

              {currentCount >= 4 ? (
                <div style={{ padding: '12px 14px', borderRadius: 'var(--radius-sm)', background: 'rgba(255, 98, 89, 0.12)', color: '#ff6259', fontSize: '13px' }}>
                  ⚠️ Team is already full. Maximum 4 members allowed.
                </div>
              ) : (
                <>
                  <div style={{ position: 'relative', marginBottom: '14px' }}>
                    <PiMagnifyingGlass style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-muted)', fontSize: 18 }} />
                    <input
                      type="text"
                      className="register-input"
                      style={{ width: '100%', padding: '10px 12px 10px 38px' }}
                      placeholder="Search eligible student by Name, USN, or Email..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>

                  <div style={{ maxHeight: '280px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                    {searching ? (
                      <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)' }}>Searching students...</div>
                    ) : eligibleStudents.length === 0 ? (
                      <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                        No eligible unassigned students found.
                      </div>
                    ) : (
                      eligibleStudents.map((st) => (
                        <div
                          key={st.id}
                          style={{
                            padding: '10px 12px',
                            borderRadius: 'var(--radius-sm)',
                            background: 'var(--bg-surface)',
                            border: '1px solid var(--border-hairline)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}
                        >
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '13.5px', color: 'var(--text-primary)' }}>
                              {st.full_name}
                            </div>
                            <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '2px' }}>
                              USN: {st.usn || '3GN22CS...'} • Dept: {st.department || 'CSE'} (Sem {st.semester || '7'}, Sec {st.section || 'A'})
                            </div>
                          </div>

                          <button
                            className="sd-btn sd-btn-primary"
                            style={{ padding: '4px 10px', fontSize: '11.5px' }}
                            onClick={() => handleAddSelectedMember(st)}
                            disabled={isAdding}
                          >
                            + Add
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </>
              )}

              <button className="sd-btn sd-btn-outline" style={{ width: '100%' }} onClick={() => setShowAddModal(false)}>
                Close Modal
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Team Details Modal (Item 6) */}
      <EditTeamModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        team={team}
        user={user}
        onTeamUpdated={onTeamUpdated}
      />
    </div>
  );
}
