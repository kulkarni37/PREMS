import { useState, useEffect } from 'react';
import { PiBell, PiList, PiSignOut, PiPencilSimple } from 'react-icons/pi';
import { getProfilePhotoUrl } from '../../services/api';

export default function StudentHeader({
  user,
  onLogout,
  onToggleMobileSidebar,
  unreadCount = 3,
  onOpenNotifications,
  onOpenEditProfile,
}) {
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [user?.profile_photo]);

  return (
    <header className="sd-header">
      <div className="sd-header__title-area">
        <span className="sd-header__breadcrumb">Guru Nanak Dev Engineering College</span>
        <h1 className="sd-header__title">PRMES Student Portal</h1>
      </div>

      <div className="sd-header__actions">
        {/* Student metadata pill */}
        <div className="sd-header__pill">
          <span className="sd-header__pill-item">
            ID: <strong>{user?.student_id || 'PRMES-STU-2026-0001'}</strong>
          </span>
          <span style={{ opacity: 0.3 }}>|</span>
          <span className="sd-header__pill-item">
            Dept: <strong>{user?.department || 'CSE'}</strong>
          </span>
          <span style={{ opacity: 0.3 }}>|</span>
          <span className="sd-header__pill-item">
            Sem: <strong>{user?.semester || '7th'} ({user?.section || 'A'})</strong>
          </span>
        </div>

        {/* Edit Profile Button */}
        <button
          className="sd-btn sd-btn-outline"
          style={{ padding: '6px 12px', fontSize: '12px', gap: '5px' }}
          onClick={onOpenEditProfile}
          title="Edit Profile"
          aria-label="Edit Profile"
        >
          <PiPencilSimple /> Edit Profile
        </button>

        {/* Notification Icon */}
        <button
          className="sd-icon-btn"
          onClick={onOpenNotifications}
          title="Notifications"
          aria-label="View notifications"
        >
          <PiBell />
          {unreadCount > 0 && <span className="sd-icon-btn__badge">{unreadCount}</span>}
        </button>

        {/* User avatar */}
        <div
          className="sd-avatar"
          style={{ cursor: 'pointer', overflow: 'hidden' }}
          title={user?.full_name || 'Student'}
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
            user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'S'
          )}
        </div>

        {/* Mobile menu toggle button */}
        <button
          className="sd-icon-btn sd-mobile-toggle"
          onClick={onToggleMobileSidebar}
          aria-label="Toggle Navigation Menu"
        >
          <PiList />
        </button>
      </div>
    </header>
  );
}
