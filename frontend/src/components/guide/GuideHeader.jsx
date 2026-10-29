import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PiBell, PiList, PiPencilSimple } from 'react-icons/pi';
import { getProfilePhotoUrl } from '../../services/api';

export default function GuideHeader({
  user,
  onLogout,
  onToggleMobileSidebar,
  unreadCount = 4,
  onOpenNotifications,
  onOpenEditProfile,
}) {
  const navigate = useNavigate();
  const userRoles = (user?.roles || [user?.role || 'GUIDE']).map(r => r.toUpperCase());
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [user?.profile_photo]);

  return (
    <header className="gd-header">
      <div className="gd-header__title-area">
        <span className="gd-header__breadcrumb">Faculty Evaluation Portal</span>
        <h1 className="gd-header__title">PRMES Guide Portal</h1>
      </div>

      <div className="gd-header__actions">
        {/* Workspace Switcher for Multi-Role Users */}
        {userRoles.length > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--accent-cyan-soft)', border: '1px solid var(--accent-cyan)', borderRadius: 'var(--radius-sm)', padding: '4px 10px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent-cyan)' }}>Workspace:</span>
            <select
              value="GUIDE"
              onChange={(e) => {
                const val = e.target.value;
                if (val === 'COORDINATOR') navigate('/coordinator/dashboard');
                else if (val === 'ADMIN') navigate('/admin/dashboard');
                else if (val === 'STUDENT' || val === 'TEAM_LEADER') navigate('/student/dashboard');
              }}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', fontWeight: 700, fontSize: '12.5px', cursor: 'pointer' }}
            >
              {userRoles.map(r => (
                <option key={r} value={r} style={{ background: '#121824', color: '#fff' }}>
                  {r === 'COORDINATOR' ? 'Coordinator' : r === 'GUIDE' ? 'Faculty Guide' : r === 'ADMIN' ? 'Admin' : 'Student'}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Guide Metadata Pill */}
        <div className="gd-header__pill">
          <span className="gd-header__pill-item">
            ID: <strong>{user?.guide_id || user?.student_id || 'PRMES-GDE-001'}</strong>
          </span>
          <span style={{ opacity: 0.3 }}>|</span>
          <span className="gd-header__pill-item">
            Desig: <strong>{user?.designation || 'Assistant Professor'}</strong>
          </span>
          <span style={{ opacity: 0.3 }}>|</span>
          <span className="gd-header__pill-item">
            Dept: <strong>{user?.department || 'CSE'}</strong>
          </span>
          <span style={{ opacity: 0.3 }}>|</span>
          <span className="gd-header__pill-item">
            Spec: <strong>{user?.specialization || 'AI / ML'}</strong>
          </span>
        </div>

        {/* Edit Profile Button */}
        <button
          className="sd-btn sd-btn-outline"
          style={{ padding: '6px 12px', fontSize: '12px', gap: '5px' }}
          onClick={onOpenEditProfile}
          title="Edit Faculty Profile"
          aria-label="Edit Faculty Profile"
        >
          <PiPencilSimple /> Edit Profile
        </button>

        {/* Notifications Icon */}
        <button
          className="gd-icon-btn"
          onClick={onOpenNotifications}
          title="Notifications"
          aria-label="View notifications"
        >
          <PiBell />
          {unreadCount > 0 && <span className="gd-icon-btn__badge" />}
        </button>

        {/* Avatar */}
        <div
          className="gd-avatar"
          style={{ cursor: 'pointer', overflow: 'hidden' }}
          title={user?.full_name || 'Faculty Guide'}
          onClick={onOpenEditProfile}
        >
          {user?.profile_photo && !imgError ? (
            <img
              src={getProfilePhotoUrl(user.profile_photo)}
              alt={user.full_name || 'Profile'}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={() => setImgError(true)}
            />
          ) : (
            user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'G'
          )}
        </div>

        {/* Mobile Toggle Button */}
        <button
          className="gd-icon-btn gd-mobile-toggle"
          onClick={onToggleMobileSidebar}
          aria-label="Toggle Navigation Menu"
        >
          <PiList />
        </button>
      </div>
    </header>
  );
}
