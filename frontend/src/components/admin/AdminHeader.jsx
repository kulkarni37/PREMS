import { PiBell, PiList, PiGear } from 'react-icons/pi';

export default function AdminHeader({
  user,
  onLogout,
  onToggleMobileSidebar,
  unreadCount = 3,
  onOpenNotifications,
  onOpenSettings,
}) {
  return (
    <header className="ad-header">
      <div className="ad-header__title-area">
        <span className="ad-header__breadcrumb">System Control Center</span>
        <h1 className="ad-header__title">PRMES Administration</h1>
      </div>

      <div className="ad-header__actions">
        {/* Admin Metadata Pill (Institution-level) */}
        <div className="ad-header__pill">
          <span className="ad-header__pill-item">
            Year: <strong>{user?.academic_year || '2026–27'}</strong>
          </span>
          <span style={{ opacity: 0.3 }}>|</span>
          <span className="ad-header__pill-item">
            Institution: <strong>{user?.institution_code || 'GNDEC'}</strong>
          </span>
        </div>

        {/* System Health Badge */}
        <div className="ad-health-badge">
          <span className="ad-health-dot" />
          <span>Systems Operational</span>
        </div>

        {/* Settings Icon */}
        <button
          className="cd-icon-btn"
          onClick={onOpenSettings}
          title="System Settings"
          aria-label="Open Settings"
        >
          <PiGear />
        </button>

        {/* Notifications Icon */}
        <button
          className="cd-icon-btn"
          onClick={onOpenNotifications}
          title="Notifications"
          aria-label="View notifications"
        >
          <PiBell />
          {unreadCount > 0 && <span className="cd-icon-btn__badge" />}
        </button>

        {/* Avatar */}
        <div className="ad-avatar" style={{ cursor: 'pointer' }} title={user?.full_name || 'System Administrator'}>
          {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'A'}
        </div>

        {/* Mobile Toggle Button */}
        <button
          className="cd-icon-btn cd-mobile-toggle"
          onClick={onToggleMobileSidebar}
          aria-label="Toggle Navigation Menu"
        >
          <PiList />
        </button>
      </div>
    </header>
  );
}
