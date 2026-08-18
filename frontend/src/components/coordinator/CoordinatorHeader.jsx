import { PiBell, PiList } from 'react-icons/pi';

export default function CoordinatorHeader({
  user,
  onLogout,
  onToggleMobileSidebar,
  unreadCount = 5,
  onOpenNotifications,
}) {
  return (
    <header className="cd-header">
      <div className="cd-header__title-area">
        <span className="cd-header__breadcrumb">Department Academic Control Center</span>
        <h1 className="cd-header__title">PRMES Coordinator Portal</h1>
      </div>

      <div className="cd-header__actions">
        {/* Coordinator Metadata Pill */}
        <div className="cd-header__pill">
          <span className="cd-header__pill-item">
            ID: <strong>{user?.coordinator_id || 'PRMES-CRD-2026-001'}</strong>
          </span>
          <span style={{ opacity: 0.3 }}>|</span>
          <span className="cd-header__pill-item">
            Year: <strong>{user?.academic_year || '2026–27'}</strong>
          </span>
          <span style={{ opacity: 0.3 }}>|</span>
          <span className="cd-header__pill-item">
            Sem: <strong>{user?.semester || '7th Semester'}</strong>
          </span>
          <span style={{ opacity: 0.3 }}>|</span>
          <span className="cd-header__pill-item">
            Dept: <strong>{user?.department || 'CSE'}</strong>
          </span>
        </div>

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
        <div className="cd-avatar" style={{ cursor: 'pointer' }} title={user?.full_name || 'Prof. Coordinator Name'}>
          {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'C'}
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
