import { PiBell, PiList } from 'react-icons/pi';

export default function GuideHeader({
  user,
  onLogout,
  onToggleMobileSidebar,
  unreadCount = 4,
  onOpenNotifications,
}) {
  return (
    <header className="gd-header">
      <div className="gd-header__title-area">
        <span className="gd-header__breadcrumb">Faculty Evaluation Portal</span>
        <h1 className="gd-header__title">PRMES Guide Portal</h1>
      </div>

      <div className="gd-header__actions">
        {/* Guide Metadata Pill */}
        <div className="gd-header__pill">
          <span className="gd-header__pill-item">
            ID: <strong>{user?.guide_id || 'PRMES-GDE-2026-001'}</strong>
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
        <div className="gd-avatar" style={{ cursor: 'pointer' }} title={user?.full_name || 'Dr. Faculty Name'}>
          {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'G'}
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
