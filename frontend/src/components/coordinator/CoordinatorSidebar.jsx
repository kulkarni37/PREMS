import {
  PiCircuitry,
  PiLayout,
  PiUsersThree,
  PiChalkboardTeacher,
  PiGridFour,
  PiCalendarBlank,
  PiFolderSimple,
  PiStarBold,
  PiFileText,
  PiBell,
  PiUserCircle,
  PiSignOut,
  PiX,
} from 'react-icons/pi';

import logo from '../../assets/logo.png';

export default function CoordinatorSidebar({
  activeTab,
  setActiveTab,
  user,
  onLogout,
  isOpen,
  onClose,
  unreadCount = 5,
}) {
  const navItems = [
    { id: 'overview', label: 'Dashboard', icon: <PiLayout /> },
    { id: 'teams', label: 'Project Teams', icon: <PiUsersThree /> },
    { id: 'guides', label: 'Guide Allocation', icon: <PiChalkboardTeacher /> },
    { id: 'domains', label: 'Domains', icon: <PiGridFour /> },
    { id: 'schedule', label: 'Review Schedule', icon: <PiCalendarBlank /> },
    { id: 'documents', label: 'Documents', icon: <PiFolderSimple /> },
    { id: 'evaluations', label: 'Evaluations', icon: <PiStarBold /> },
    { id: 'reports', label: 'Reports', icon: <PiFileText /> },
    { id: 'notifications', label: 'Notifications', icon: <PiBell />, badge: unreadCount },
  ];

  const handleNavClick = (id) => {
    setActiveTab(id);
    if (onClose) onClose();
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <aside className={`cd-sidebar ${isOpen ? 'cd-sidebar--open' : ''}`}>
      <div className="cd-sidebar__head">
        <div className="cd-sidebar__logo-mark">
          <img src={logo} alt="PRMES Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </div>
        <div className="cd-sidebar__brand-text">
          <span className="cd-sidebar__brand-title">PRMES</span>
          <span className="cd-sidebar__brand-sub">Coordinator Portal</span>
        </div>
        {isOpen && (
          <button className="sd-modal__close" style={{ top: 18, right: 12 }} onClick={onClose}>
            <PiX />
          </button>
        )}
      </div>

      <nav className="cd-sidebar__nav">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              className={`cd-nav-item ${isActive ? 'cd-nav-item--active' : ''}`}
              onClick={() => handleNavClick(item.id)}
            >
              <span className="cd-nav-item__icon">{item.icon}</span>
              <span>{item.label}</span>
              {item.badge > 0 && (
                <span className="cd-nav-item__badge">{item.badge}</span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="cd-sidebar__footer">
        <div className="cd-user-mini">
          <div className="cd-avatar">
            {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'C'}
          </div>
          <div className="cd-user-mini__info">
            <span className="cd-user-mini__name">{user?.full_name || 'Prof. Coordinator Name'}</span>
            <span className="cd-user-mini__dept">{user?.department || 'CSE Dept'}</span>
          </div>
        </div>

        <button
          className="gd-logout-btn"
          onClick={onLogout}
          title="Logout of PRMES"
          aria-label="Logout"
        >
          <PiSignOut />
        </button>
      </div>
    </aside>
  );
}
